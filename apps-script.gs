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
 */

var SHEET_ID = '1fdqShmBkDnVPPdhtmEo4wdmkc5u9bJe2kKteJpmUsWo';
var BRAND_ALIAS = 'business@clicknlikes.com';

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

function doGet(e){
  var p = (e && e.parameter) || {};
  var out = (p.action === 'analyze' && p.url) ? analyzePage(p.url) : {ok:false, reason:'bad_request'};
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  var data = {};
  try{ data = JSON.parse(e.postData.contents); }catch(err){}
  if(data.action === 'send' && data.to){
    var inner = data.html
      ? String(data.html)
      : String(data.body || '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
          .replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    var opts = {
      name: 'Click.n.likes',
      replyTo: data.replyTo || BRAND_ALIAS,
      bcc: data.bcc || '',
      htmlBody: '<div style="font-family:Segoe UI,system-ui,sans-serif;'
        + 'font-size:14px;color:#1A2B4A;line-height:1.65;max-width:640px;">'
        + '<div style="border-top:4px solid #4ECDC4;padding:16px 0 6px;">'
        + '<strong style="font-size:17px;">Click.n.likes</strong></div>'
        + '<div style="padding:8px 0;">' + inner + '</div>'
        + '<div style="margin-top:16px;padding-top:10px;border-top:1px dashed #ccc;'
        + 'font-size:12px;color:#777;">Click.n.likes · Organic growth, engineered'
        + ' · clicknlikes.com</div></div>'
    };
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
 * Fetches one page and extracts verifiable on-page facts. Never throws:
 * returns {ok:false, reason} on any failure so the website's tools can
 * fall back to self-reported scoring cleanly.
 */
function analyzePage(url){
  url = String(url).trim();
  if(!/^https?:\/\//i.test(url)) url = 'https://' + url;
  var resp;
  try{
    resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });
  }catch(err){
    // Surface the real cause: a permissions error here means the
    // "Connect to an external service" scope was never authorized:
    // run testAnalyze() once from the editor to trigger the prompt.
    return {ok:false, reason:'fetch_error', detail:String(err).slice(0,300)};
  }
  var code = resp.getResponseCode();
  if(code >= 400) return {ok:false, reason:'http_' + code};
  var html = resp.getContentText() || '';
  if(!html) return {ok:false, reason:'empty_response'};
  if(html.length > 900000) html = html.slice(0, 900000);

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

  return {ok:true, facts:{
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
  }};
}
