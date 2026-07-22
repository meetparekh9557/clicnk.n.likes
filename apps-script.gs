/**
 * Click.n.likes — lead log, mailer, and single-page analyzer.
 *
 * This is the ONE Google Apps Script behind the website. Deploy it as a
 * Web app (Execute as: Me / Who has access: Anyone) from the Google
 * account clicknlikes@gmail.com. To update an existing deployment WITHOUT
 * changing its /exec URL: Deploy → Manage deployments → pencil icon →
 * Version: New version → Deploy.
 *
 * It serves three jobs:
 *   1. doPost {action:'send'}  → sends a branded email via Gmail
 *      (from business@clicknlikes.com once that alias is verified).
 *   2. doPost {subject, details} → appends one lead row to the Sheet.
 *   3. doGet ?action=analyze&url=… → fetches that page server-side and
 *      returns real on-page facts as JSON (title, meta description,
 *      headings, word count, alt coverage, schema, canonical, robots,
 *      viewport, link counts). Single page only — no crawling, no
 *      rankings, no backlinks. The website's free tools blend these
 *      verified facts into their scoring when a visitor provides a URL.
 *
 * JavaScript-rendered sites: a plain server fetch only sees the HTML as
 * delivered, so a React/Vue/Wix-style site that paints its content with
 * JavaScript looks empty and would score wrongly. When the raw fetch
 * comes back as an empty shell (or fails outright), analyzePage asks
 * Cloudflare Browser Rendering to load the page like a real browser and
 * re-reads the rendered HTML, so those sites score truthfully instead of
 * failing. This needs two private Script Properties (Project Settings →
 * Script Properties), never committed to the public repo:
 *   CF_ACCOUNT_ID    — your Cloudflare account id (the hex string only)
 *   CF_BROWSER_TOKEN — an API token scoped to Browser Rendering (Edit)
 * A hard daily cap (RENDER_DAILY_CAP) keeps it inside the free tier: once
 * hit, the scan degrades honestly (flags the site as JS-rendered) instead
 * of rendering more, so it can never roll into a charge.
 */

var SHEET_ID = '1fdqShmBkDnVPPdhtmEo4wdmkc5u9bJe2kKteJpmUsWo';
var BRAND_ALIAS = 'business@clicknlikes.com';
var RENDER_DAILY_CAP = 200; // max Cloudflare renders per day (free-tier guard)
// Logo for the email header, inlined via CID so recipients always see it
// (no hotlink for Gmail to hide). Fetched server-side at send time.
var LOGO_URL = 'https://raw.githubusercontent.com/meetparekh9557/clicnk.n.likes/main/site/public/logo.png';

/**
 * ONE-TIME SETUP HELPER — run this manually from the editor (select
 * "testAnalyze" in the function dropdown, press Run) after pasting a
 * new version of this script. Its only job is to make Google show the
 * permission prompts this script needs (visit external websites, send
 * Gmail, edit the Sheet). Approve them once and the deployed web app
 * works from then on. The execution log will print a live analysis of
 * the clicknlikes.com homepage as proof everything is authorized.
 */
function testAnalyze(){
  var result = analyzePage('https://clicknlikes.com');
  Logger.log(JSON.stringify(result, null, 2));
  Logger.log('Aliases Gmail can send as: ' + JSON.stringify(GmailApp.getAliases()));
  var ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log('Sheet reachable: ' + ss.getName());
}

/**
 * TEST HELPER for the render path — analyzes a deliberately JS-rendered
 * page (its quotes are injected by JavaScript, so a raw fetch sees almost
 * nothing). A healthy result shows facts.rendered === true and a real
 * wordCount. Run it once after pasting; it proves Cloudflare rendering is
 * wired up before you redeploy the live web app.
 */
function testJsRender(){
  var result = analyzePage('https://quotes.toscrape.com/js/');
  if(result.ok){
    Logger.log('rendered: ' + result.facts.rendered
      + ' | renderReason: ' + (result.facts.renderReason || '(none)')
      + ' | wordCount: ' + result.facts.wordCount
      + ' | h1: ' + result.facts.h1Count);
  } else {
    Logger.log('FAILED: ' + JSON.stringify(result));
  }
}

function doGet(e){
  var p = (e && e.parameter) || {};
  var out;
  if(p.action === 'analyze' && p.url)        out = analyzePage(p.url);
  else if(p.action === 'pagespeed' && p.url) out = pageSpeed_(p.url, p.strategy);
  else if(p.action === 'screenshot' && p.url)out = screenshot_(p.url);
  else if(p.action === 'searchconsole')      out = searchConsole_(p.token, p.days);
  else                                        out = {ok:false, reason:'bad_request'};
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Live Core Web Vitals via Google PageSpeed Insights (Lighthouse lab data
 * plus CrUX real-user field data when Google has enough traffic for the
 * URL). Works without a key at low volume; an optional PSI_KEY in Script
 * Properties raises the quota for production. Returns verifiable, live-
 * measured performance facts, or {ok:false} so the tool falls back honestly
 * to a self-reported check instead of ever inventing a number.
 */
function pageSpeed_(url, strategy){
  url = String(url).trim();
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  strategy = (strategy === 'desktop') ? 'desktop' : 'mobile';
  var key = PropertiesService.getScriptProperties().getProperty('PSI_KEY');
  try{
    var endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
      + '?url=' + encodeURIComponent(url)
      + '&strategy=' + strategy
      + '&category=performance'
      + (key ? '&key=' + encodeURIComponent(key) : '');
    var resp = UrlFetchApp.fetch(endpoint, {muteHttpExceptions:true});
    if(resp.getResponseCode() !== 200) return {ok:false, reason:'psi_http_' + resp.getResponseCode()};
    var data = JSON.parse(resp.getContentText() || '{}');
    var lh = data.lighthouseResult;
    if(!lh || !lh.categories || !lh.categories.performance) return {ok:false, reason:'psi_no_data'};
    var a = lh.audits || {};
    function num(id){ return (a[id] && typeof a[id].numericValue === 'number') ? a[id].numericValue : null; }
    function disp(id){ return (a[id] && a[id].displayValue) ? a[id].displayValue : null; }
    var psi = {
      strategy: strategy,
      finalUrl: data.id || url,
      score: Math.round((lh.categories.performance.score || 0) * 100),
      lcpMs: num('largest-contentful-paint'), lcpText: disp('largest-contentful-paint'),
      cls: num('cumulative-layout-shift'),     clsText: disp('cumulative-layout-shift'),
      tbtMs: num('total-blocking-time'),        tbtText: disp('total-blocking-time'),
      fcpMs: num('first-contentful-paint'),     fcpText: disp('first-contentful-paint'),
      siText: disp('speed-index'),
      hasField: false
    };
    var le = data.loadingExperience;
    if(le && le.metrics){
      psi.hasField = true;
      psi.fieldOverall = le.overall_category || null; // FAST / AVERAGE / SLOW
      var m = le.metrics;
      if(m.LARGEST_CONTENTFUL_PAINT_MS){ psi.fieldLcpMs = m.LARGEST_CONTENTFUL_PAINT_MS.percentile; psi.fieldLcpCat = m.LARGEST_CONTENTFUL_PAINT_MS.category; }
      if(m.CUMULATIVE_LAYOUT_SHIFT_SCORE){ psi.fieldCls = m.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile/100; psi.fieldClsCat = m.CUMULATIVE_LAYOUT_SHIFT_SCORE.category; }
      if(m.INTERACTION_TO_NEXT_PAINT){ psi.fieldInpMs = m.INTERACTION_TO_NEXT_PAINT.percentile; psi.fieldInpCat = m.INTERACTION_TO_NEXT_PAINT.category; }
    }
    return {ok:true, psi:psi};
  }catch(err){
    return {ok:false, reason:'psi_error', detail:String(err).slice(0,200)};
  }
}

/**
 * Above-the-fold screenshot via Cloudflare Browser Rendering (reuses the
 * CF_ACCOUNT_ID / CF_BROWSER_TOKEN already used for page rendering, under
 * the same daily cap). Returns a data: PNG the tool can show the visitor,
 * or {ok:false, reason:'not_configured'} when the CF keys are absent.
 */
function screenshot_(url){
  url = String(url).trim();
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  var props = PropertiesService.getScriptProperties();
  var acct = props.getProperty('CF_ACCOUNT_ID'), token = props.getProperty('CF_BROWSER_TOKEN');
  if(!acct || !token) return {ok:false, reason:'not_configured'};
  if(!underDailyRenderCap_(props)) return {ok:false, reason:'render_cap'};
  try{
    var endpoint = 'https://api.cloudflare.com/client/v4/accounts/' + acct + '/browser-rendering/screenshot';
    var resp = UrlFetchApp.fetch(endpoint, {
      method:'post', contentType:'application/json',
      headers:{ Authorization:'Bearer ' + token },
      payload: JSON.stringify({ url:url, viewport:{width:1200,height:750,deviceScaleFactor:1}, screenshotOptions:{fullPage:false}, gotoOptions:{waitUntil:'networkidle0', timeout:20000} }),
      muteHttpExceptions:true
    });
    if(resp.getResponseCode() !== 200) return {ok:false, reason:'cf_http_' + resp.getResponseCode()};
    var ct = String(resp.getHeaders()['Content-Type'] || resp.getHeaders()['content-type'] || '');
    if(ct.indexOf('image') === -1) return {ok:false, reason:'cf_no_image'};
    bumpDailyRenderCount_(props);
    return {ok:true, image:'data:image/png;base64,' + Utilities.base64Encode(resp.getBlob().getBytes()), w:1200, h:750};
  }catch(err){ return {ok:false, reason:'cf_error', detail:String(err).slice(0,160)}; }
}

/**
 * Search Console "ranking opportunities" — the data feed behind the
 * automated, data-driven blog. Because this script runs AS the Google
 * account that owns the Search Console property, it can read the property's
 * search-analytics directly with the script's own OAuth token — no service
 * account, no key file, nothing secret in the public repo.
 *
 * It returns the queries where the site already ranks on the cusp of page
 * one (average position ~4.5–20) with real impressions: the "so close"
 * terms where one well-structured post can push a ranking up into the
 * clicks. The weekly auto-blog reads this and writes to the biggest
 * opportunity first, so content is aimed at what Google already sees the
 * site for, not guesswork.
 *
 * Setup (one time, all on the Google side — see docs/RANKING-AUTOMATION.md):
 *   1. Verify clicknlikes.com in Search Console under this same Google
 *      account (a domain property, sc-domain:clicknlikes.com, is best).
 *   2. Add the read-only Search Console scope to the manifest
 *      (appsscript.json → "oauthScopes"):
 *        "https://www.googleapis.com/auth/webmasters.readonly"
 *      then run testSearchConsole once to approve the new permission.
 *   3. Set two Script Properties:
 *        SC_SITE   — the property URL (default sc-domain:clicknlikes.com)
 *        SC_TOKEN  — any long random string; the caller must send the same
 *                    value as &token=… so only our automation can read it.
 * Until it's set up (or before Google has data), it returns {ok:false} and
 * the blog falls back to the hand-written topic backlog — nothing breaks.
 */
function searchConsole_(token, days){
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('SC_TOKEN');
  if(!secret)              return {ok:false, reason:'not_configured'};
  if(token !== secret)     return {ok:false, reason:'unauthorized'};
  var site = props.getProperty('SC_SITE') || 'sc-domain:clicknlikes.com';
  var win = Math.min(Math.max(parseInt(days,10) || 28, 7), 90);
  var end = new Date(Date.now() - 2*864e5);            // Search Console lags ~2 days
  var start = new Date(end.getTime() - win*864e5);
  var fmt = function(d){ return Utilities.formatDate(d, 'UTC', 'yyyy-MM-dd'); };
  try{
    var endpoint = 'https://www.googleapis.com/webmasters/v3/sites/'
      + encodeURIComponent(site) + '/searchAnalytics/query';
    var resp = UrlFetchApp.fetch(endpoint, {
      method:'post', contentType:'application/json',
      headers:{ Authorization:'Bearer ' + ScriptApp.getOAuthToken() },
      payload: JSON.stringify({
        startDate: fmt(start), endDate: fmt(end),
        dimensions:['query','page'], rowLimit:2000, dataState:'all'
      }),
      muteHttpExceptions:true
    });
    if(resp.getResponseCode() !== 200)
      return {ok:false, reason:'sc_http_' + resp.getResponseCode(), detail:String(resp.getContentText()).slice(0,180)};
    var rows = (JSON.parse(resp.getContentText() || '{}').rows) || [];
    // Keep the cusp-of-page-one queries with genuine demand, rank the
    // biggest wins first (impressions weighted by how close to the top).
    var opps = rows.filter(function(r){
      var pos = r.position;
      return pos >= 4.5 && pos <= 20.5 && (r.impressions || 0) >= 20;
    }).map(function(r){
      return {
        query: r.keys[0], page: r.keys[1],
        position: Math.round(r.position*10)/10,
        impressions: r.impressions, clicks: r.clicks,
        score: Math.round((r.impressions || 0) * (21 - r.position))
      };
    }).sort(function(a,b){ return b.score - a.score; }).slice(0, 25);
    return {ok:true, site:site, window:{start:fmt(start), end:fmt(end)}, count:opps.length, opportunities:opps};
  }catch(err){
    return {ok:false, reason:'sc_error', detail:String(err).slice(0,180)};
  }
}

/**
 * ONE-TIME SETUP HELPER for the Search Console feed — run manually from the
 * editor after adding the webmasters.readonly scope, to approve the new
 * permission. Prints the top ranking opportunities as proof it can read the
 * property. Temporarily set SC_TOKEN first (any value) so the guard passes.
 */
function testSearchConsole(){
  var tok = PropertiesService.getScriptProperties().getProperty('SC_TOKEN') || '';
  Logger.log(JSON.stringify(searchConsole_(tok, 28), null, 2));
}

function doPost(e){
  var data = {};
  try{ data = JSON.parse(e.postData.contents); }catch(err){}
  if(data.action === 'send' && data.to){
    var inner = data.html
      ? String(data.html)
      : String(data.body || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
          .replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    // Pull the logo as an inline (CID) image. If the fetch ever fails we
    // fall back to a clean wordmark so the email still looks intentional.
    var logoBlob = null;
    try{ logoBlob = UrlFetchApp.fetch(LOGO_URL, {muteHttpExceptions:true}).getBlob().setName('cnllogo'); }catch(err){}
    var header = logoBlob
      ? '<img src="cid:cnllogo" width="150" alt="Click.n.likes" style="display:block;width:150px;max-width:58%;height:auto;border:0;outline:none;text-decoration:none;" />'
      : '<span style="font-size:19px;font-weight:700;letter-spacing:-0.2px;color:#1A2B4A;">Click.n.likes</span>';

    var htmlBody =
        '<div style="margin:0;padding:24px 12px;background:#eef1f5;">'
      +   '<div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6ebf1;'
      +       'border-radius:16px;overflow:hidden;font-family:Segoe UI,system-ui,-apple-system,sans-serif;color:#1A2B4A;">'
      +     '<div style="height:5px;line-height:5px;font-size:0;background:#4ECDC4;">&nbsp;</div>'
      +     '<div style="padding:28px 32px 8px;">' + header + '</div>'
      +     '<div style="padding:6px 32px 26px;font-size:14px;line-height:1.65;">' + inner + '</div>'
      +     '<div style="padding:18px 32px;border-top:1px solid #eef1f4;font-size:12px;color:#8a93a2;">'
      +       'Organic growth, engineered &middot; '
      +       '<a href="https://clicknlikes.com" style="color:#1A2B4A;text-decoration:none;font-weight:600;">clicknlikes.com</a>'
      +     '</div>'
      +   '</div>'
      + '</div>';

    var opts = {
      name: 'Click.n.likes',
      replyTo: data.replyTo || BRAND_ALIAS,
      bcc: data.bcc || '',
      htmlBody: htmlBody
    };
    if(logoBlob) opts.inlineImages = { cnllogo: logoBlob };
    if(GmailApp.getAliases().indexOf(BRAND_ALIAS) !== -1){
      opts.from = BRAND_ALIAS;
    }
    GmailApp.sendEmail(data.to, data.subject || '', data.body || '', opts);
  } else {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName('Leads') || ss.insertSheet('Leads');
    if(sh.getLastRow() === 0){
      sh.appendRow(['Timestamp','Form / Subject','Details']);
    }
    sh.appendRow([new Date(), data.subject || '', data.details || '']);
  }
  return ContentService.createTextOutput('ok');
}

/**
 * Analyzes one page. Fetches the raw HTML server-side first (free, fast).
 * If that HTML is an empty JavaScript shell — or the fetch is blocked —
 * it asks Cloudflare Browser Rendering to load the page like a real
 * browser and re-reads the rendered HTML, so JS-built sites score
 * truthfully. Never throws: returns {ok:false, reason} on genuine
 * failure so the website's tools can fall back cleanly.
 */
function analyzePage(url){
  url = String(url).trim();
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;

  var raw = fetchRaw_(url);

  // Raw fetch failed (timeout, blocked, DNS). Cloudflare's real browser
  // can often reach what UrlFetchApp cannot, so try a render before we
  // ever report a failure.
  if(!raw.ok){
    var rescueHtml = renderWithCloudflare_(url);
    if(rescueHtml){
      var rf = extractFacts_(rescueHtml, url);
      rf.rendered = true;
      rf.renderReason = 'fetch_failed';
      return {ok:true, facts:rf};
    }
    return {ok:false, reason:raw.reason, detail:raw.detail};
  }

  var facts = extractFacts_(raw.html, url);

  // If the delivered HTML looks like a JS shell, render and re-read.
  if(looksLikeShell_(facts, raw.html)){
    var renderedHtml = renderWithCloudflare_(url);
    if(renderedHtml){
      var rf2 = extractFacts_(renderedHtml, url);
      // Only prefer the rendered read if it actually recovered content.
      if(rf2.wordCount > facts.wordCount || rf2.h1Count > facts.h1Count){
        rf2.rendered = true;
        rf2.renderReason = 'js_shell';
        return {ok:true, facts:rf2};
      }
    }
    // Render unavailable (cap hit / failed): be honest, don't fake it.
    facts.rendered = false;
    facts.jsShellSuspected = true;
    return {ok:true, facts:facts};
  }

  facts.rendered = false;
  return {ok:true, facts:facts};
}

/**
 * Raw server-side fetch. Returns {ok:true, html} or {ok:false, reason}.
 * Retries once over http:// if an https:// fetch fails, so a plain
 * protocol mismatch never surfaces as a failure to the visitor.
 */
function fetchRaw_(url){
  var attempts = [url];
  if(/^https:\/\//i.test(url)) attempts.push(url.replace(/^https:/i, 'http:'));
  var lastReason = 'fetch_error', lastDetail = '';
  for(var i = 0; i < attempts.length; i++){
    try{
      var resp = UrlFetchApp.fetch(attempts[i], {muteHttpExceptions:true, followRedirects:true});
      var code = resp.getResponseCode();
      if(code >= 400){ lastReason = 'http_' + code; continue; }
      var html = resp.getContentText() || '';
      if(!html){ lastReason = 'empty_response'; continue; }
      if(html.length > 900000) html = html.slice(0, 900000);
      return {ok:true, html:html};
    }catch(err){
      lastReason = 'fetch_error';
      lastDetail = String(err).slice(0,300);
    }
  }
  return {ok:false, reason:lastReason, detail:lastDetail};
}

/**
 * Heuristic: does this HTML look like a JavaScript shell whose real
 * content only appears after scripts run? Conservative on purpose, so we
 * spend a render only when the raw read genuinely has little to score.
 */
function looksLikeShell_(facts, html){
  var spaMarker = /<div[^>]+id\s*=\s*["'](root|app|__next|__nuxt|q-app)["']/i.test(html)
    || /__NEXT_DATA__|data-reactroot|data-react-root|ng-version|data-server-rendered|window\.__NUXT__|__NUXT__/i.test(html);
  if(facts.wordCount < 60) return true;               // almost nothing to read
  if(spaMarker && facts.wordCount < 200) return true;  // known SPA + thin body
  return false;
}

/**
 * Renders a URL through Cloudflare Browser Rendering (REST) and returns
 * the rendered HTML string, or null if unavailable (missing keys, daily
 * cap reached, or any error). Never throws.
 */
function renderWithCloudflare_(url){
  var props = PropertiesService.getScriptProperties();
  var acct = props.getProperty('CF_ACCOUNT_ID');
  var token = props.getProperty('CF_BROWSER_TOKEN');
  if(!acct || !token) return null;
  if(!underDailyRenderCap_(props)) return null;
  try{
    var endpoint = 'https://api.cloudflare.com/client/v4/accounts/' + acct + '/browser-rendering/content';
    var resp = UrlFetchApp.fetch(endpoint, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token },
      payload: JSON.stringify({ url: url }),
      muteHttpExceptions: true
    });
    if(resp.getResponseCode() !== 200) return null;
    var data = JSON.parse(resp.getContentText() || '{}');
    if(data && data.success && data.result){
      bumpDailyRenderCount_(props);
      var html = String(data.result);
      if(html.length > 900000) html = html.slice(0, 900000);
      return html;
    }
  }catch(err){ /* fall through to null: honest degradation, never a fake */ }
  return null;
}

function renderCountKey_(){
  return 'CF_RENDERS_' + Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd');
}
function underDailyRenderCap_(props){
  var n = parseInt(props.getProperty(renderCountKey_()) || '0', 10);
  return n < RENDER_DAILY_CAP;
}
function bumpDailyRenderCount_(props){
  var key = renderCountKey_();
  var n = parseInt(props.getProperty(key) || '0', 10);
  props.setProperty(key, String(n + 1));
}

/**
 * Extracts verifiable on-page facts from an HTML string. Pure parsing —
 * works identically on a raw fetch or a Cloudflare-rendered page.
 */
function extractFacts_(html, url){
  function attr(tag, name){
    var m = tag.match(new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i'));
    return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
  }
  function stripTags(s){ return s.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim(); }

  var titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  var title = titleM ? stripTags(titleM[1]).slice(0,300) : '';

  var metaDesc = null, noindex = false, hasViewport = false;
  (html.match(/<meta\b[^>]*>/gi) || []).forEach(function(m){
    var n = (attr(m,'name') || attr(m,'property') || '').toLowerCase();
    if(n === 'description' && metaDesc === null) metaDesc = attr(m,'content') || '';
    if(n === 'robots' && /noindex/i.test(attr(m,'content') || '')) noindex = true;
    if(n === 'viewport') hasViewport = true;
  });

  var hasCanonical = /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(html);

  var headingSeq = [], h1Texts = [];
  var hRe = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, hm;
  while((hm = hRe.exec(html)) !== null){
    var lvl = parseInt(hm[1], 10);
    headingSeq.push(lvl);
    if(lvl === 1 && h1Texts.length < 5) h1Texts.push(stripTags(hm[2]).slice(0,200));
    if(headingSeq.length > 200) break;
  }
  var headingSkips = 0;
  for(var i = 1; i < headingSeq.length; i++){
    if(headingSeq[i] > headingSeq[i-1] + 1) headingSkips++;
  }

  var body = html.replace(/<script[\s\S]*?<\/script>/gi,' ')
                 .replace(/<style[\s\S]*?<\/style>/gi,' ')
                 .replace(/<noscript[\s\S]*?<\/noscript>/gi,' ')
                 .replace(/<head[\s\S]*?<\/head>/i,' ');
  var text = stripTags(body);
  var wordCount = text ? text.split(/\s+/).length : 0;

  var imgs = html.match(/<img\b[^>]*>/gi) || [];
  var imgMissingAlt = 0;
  imgs.forEach(function(t){ if(!/\balt\s*=/i.test(t)) imgMissingAlt++; });

  var listItems = (html.match(/<li\b/gi) || []).length;

  var schemaTypes = [];
  var ldRe = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, lm;
  while((lm = ldRe.exec(html)) !== null){
    var tRe = /"@type"\s*:\s*"([^"]+)"/g, tm;
    while((tm = tRe.exec(lm[1])) !== null){
      if(schemaTypes.indexOf(tm[1]) === -1 && schemaTypes.length < 20) schemaTypes.push(tm[1]);
    }
  }

  var host = (url.match(/^https?:\/\/([^\/]+)/i) || [,''])[1].replace(/^www\./,'');
  var internalLinks = 0, externalLinks = 0;
  var aRe = /<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)')/gi, am;
  while((am = aRe.exec(html)) !== null){
    var href = am[2] !== undefined ? am[2] : am[3];
    if(!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    if(/^https?:\/\//i.test(href)){
      var h2 = (href.match(/^https?:\/\/([^\/]+)/i) || [,''])[1].replace(/^www\./,'');
      if(h2 === host) internalLinks++; else externalLinks++;
    } else {
      internalLinks++;
    }
  }

  var normTitle = title.toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  var normH1 = (h1Texts[0] || '').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
  var h1DuplicatesTitle = !!normH1 && normH1 === normTitle;
  var titleWords = normTitle.split(' ').filter(function(w){ return w.length > 3; });
  var shared = titleWords.filter(function(w){ return normH1.indexOf(w) !== -1; }).length;
  var h1UnrelatedToTitle = !!normH1 && !!normTitle && titleWords.length > 0 && shared === 0;

  return {
    finalUrl: url,
    title: title,
    titleLength: title.length,
    metaDescription: metaDesc === null ? null : stripTags(metaDesc).slice(0,400),
    metaDescriptionLength: metaDesc === null ? 0 : stripTags(metaDesc).length,
    h1Count: h1Texts.length,
    h1Text: h1Texts[0] || '',
    headingSequence: headingSeq.slice(0,60),
    headingSkips: headingSkips,
    wordCount: wordCount,
    imgCount: imgs.length,
    imgMissingAlt: imgMissingAlt,
    listItems: listItems,
    schemaTypes: schemaTypes,
    hasSchema: schemaTypes.length > 0,
    hasCanonical: hasCanonical,
    noindex: noindex,
    hasViewport: hasViewport,
    internalLinks: internalLinks,
    externalLinks: externalLinks,
    h1DuplicatesTitle: h1DuplicatesTitle,
    h1UnrelatedToTitle: h1UnrelatedToTitle,
    textSample: text.slice(0, 4000)
  };
}
