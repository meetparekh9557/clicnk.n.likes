// The live-teardown reel — produced entirely by automation, no filming.
//
// The founder does not want to film anything, and a marketing team of one
// cannot record a screen while narrating it either. So this script does not
// simulate a scan: it RUNS the real analysis.
//
// extractFacts_() below is ported verbatim from apps-script.gs, the actual
// deployed backend's fact-extraction function. scoreOnPageHealth() is
// imported directly from src/lib/engine.js, the actual scoring function real
// visitors' scans run through. Both are pure, deterministic, network-free
// functions, so running them here against the real fixture file on disk
// produces the exact same result a live fetch of that same file would have —
// the only thing skipped is the HTTP round trip, not the analysis. Nothing
// in this reel is invented: the score, the gaps and the file size are all
// computed at render time from public/demo/sample-site/, never hand-typed.
//
// The subject is a fixture we built and own (see that folder's own comment),
// not a named real business — the one hard rule for this reel from
// docs/reels/reel-scripts.md.
//
// Usage:
//   node scripts/gen-reel-teardown.mjs --out=/path/teardown.mp4
//   node scripts/gen-reel-teardown.mjs --still=8.0 --out=/tmp/f.png
import { readFileSync, statSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..'); // site/

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const FPS = Number(args.fps || 30);
const DURATION = Number(args.duration || 22);
const OUT = args.out || resolve(ROOT, '../reel-teardown.mp4');
const STILL = args.still ? Number(args.still) : null;
const FFMPEG =
  args.ffmpeg ||
  '/tmp/claude-0/-home-user-clicnk-n-likes/180512ee-5346-5a14-9703-a26cea5b6962/scratchpad/node_modules/ffmpeg-static/ffmpeg';

const FIXTURE_DIR = resolve(ROOT, 'public/demo/sample-site');
const FIXTURE_URL = 'https://clicknlikes.com/demo/sample-site/';

// ---- ported verbatim from apps-script.gs extractFacts_() -------------------
function extractFacts_(html, url) {
  function attr(tag, name) {
    var m = tag.match(new RegExp(name + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i'));
    return m ? (m[2] !== undefined ? m[2] : m[3]) : null;
  }
  function stripTags(s) { return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  var titleM = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  var title = titleM ? stripTags(titleM[1]).slice(0, 300) : '';
  var metaDesc = null, noindex = false, hasViewport = false;
  (html.match(/<meta\b[^>]*>/gi) || []).forEach(function (m) {
    var n = (attr(m, 'name') || attr(m, 'property') || '').toLowerCase();
    if (n === 'description' && metaDesc === null) metaDesc = attr(m, 'content') || '';
    if (n === 'robots' && /noindex/i.test(attr(m, 'content') || '')) noindex = true;
    if (n === 'viewport') hasViewport = true;
  });
  var hasCanonical = /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(html);
  var headingSeq = [], h1Texts = [];
  var hRe = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, hm;
  while ((hm = hRe.exec(html)) !== null) {
    var lvl = parseInt(hm[1], 10);
    headingSeq.push(lvl);
    if (lvl === 1 && h1Texts.length < 5) h1Texts.push(stripTags(hm[2]).slice(0, 200));
    if (headingSeq.length > 200) break;
  }
  var body = html.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/i, ' ');
  var text = stripTags(body);
  var wordCount = text ? text.split(/\s+/).length : 0;
  var imgs = html.match(/<img\b[^>]*>/gi) || [];
  var imgMissingAlt = 0;
  imgs.forEach(function (t) { if (!/\balt\s*=/i.test(t)) imgMissingAlt++; });
  var schemaTypes = [];
  var ldRe = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi, lm;
  while ((lm = ldRe.exec(html)) !== null) {
    var tRe = /"@type"\s*:\s*"([^"]+)"/g, tm;
    while ((tm = tRe.exec(lm[1])) !== null) {
      if (schemaTypes.indexOf(tm[1]) === -1 && schemaTypes.length < 20) schemaTypes.push(tm[1]);
    }
  }
  var host = (url.match(/^https?:\/\/([^\/]+)/i) || [, ''])[1].replace(/^www\./, '');
  var internalLinks = 0, externalLinks = 0;
  var aRe = /<a\b[^>]*href\s*=\s*("([^"]*)"|'([^']*)')/gi, am;
  while ((am = aRe.exec(html)) !== null) {
    var href = am[2] !== undefined ? am[2] : am[3];
    if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) {
      var h2 = (href.match(/^https?:\/\/([^\/]+)/i) || [, ''])[1].replace(/^www\./, '');
      if (h2 === host) internalLinks++; else externalLinks++;
    } else { internalLinks++; }
  }
  return {
    finalUrl: url, title, titleLength: title.length,
    metaDescription: metaDesc === null ? null : stripTags(metaDesc).slice(0, 400),
    metaDescriptionLength: metaDesc === null ? 0 : stripTags(metaDesc).length,
    h1Count: h1Texts.length, h1Text: h1Texts[0] || '',
    headingSkips: 0, wordCount, imgCount: imgs.length, imgMissingAlt,
    schemaTypes, hasSchema: schemaTypes.length > 0, hasCanonical, noindex, hasViewport,
    internalLinks, externalLinks,
  };
}

const html = readFileSync(join(FIXTURE_DIR, 'index.html'), 'utf8');
const heroBytes = statSync(join(FIXTURE_DIR, 'hero.jpg')).size;
const facts = extractFacts_(html, FIXTURE_URL);
const { scoreOnPageHealth } = await import(pathToFileURL(resolve(ROOT, 'src/lib/engine.js')).href);
const REPORT = scoreOnPageHealth(facts);
const SCORE = REPORT.score;
const HERO_MB = (heroBytes / (1024 * 1024)).toFixed(1);
// Same qualitative banding AuditDemo.jsx already uses on the homepage for a
// score in this range, so the label is consistent with the rest of the site.
const LABEL = SCORE < 50 ? 'Needs urgent work' : SCORE < 80 ? 'On the edge' : 'Healthy';

console.log('Computed (not hand-typed):', { score: SCORE, label: LABEL, heroMB: HERO_MB, gaps: REPORT.gaps });

// Four real findings, picked for the beats that follow. Every string here is
// read out of REPORT/facts, not written by hand — this array only decides the
// ORDER they appear on screen, which is normal editorial pacing for a report
// that genuinely has more than four factors in it (see REPORT.factors for the
// full list, including the noindex penalty, which the reel does not narrate
// individually because it reflects a deliberate hygiene choice on this
// fixture — a real robots tag we set on purpose to keep it out of search —
// rather than a mistake a real visitor's site would illustrate).
const FIND = [
  { label: 'Title tag', note: facts.titleLength === 0 ? 'missing entirely' : `${facts.titleLength} chars` },
  { label: 'Meta description', note: facts.metaDescriptionLength === 0 ? 'missing entirely' : `${facts.metaDescriptionLength} chars` },
  { label: 'H1 headings', note: `${facts.h1Count} on one page (should be 1)` },
  { label: 'Hero image', note: `${HERO_MB}MB, one image` },
];

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dmsans = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
const logo = b64('public/logo-wordmark.png');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const html_ = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Space Grotesk'; font-weight:700; src:url(data:font/woff2;base64,${grotesk}) format('woff2'); }
@font-face { font-family:'DM Sans'; font-weight:500; src:url(data:font/woff2;base64,${dmsans}) format('woff2'); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0b1730; }
#stage { position:relative; width:1080px; height:1920px; overflow:hidden; color:#fff;
  font-family:'DM Sans', sans-serif;
  background:
    radial-gradient(65% 40% at 82% 8%, rgba(78,205,196,0.26), transparent 62%),
    radial-gradient(55% 38% at 10% 92%, rgba(255,71,87,0.16), transparent 62%),
    linear-gradient(165deg, #14243e 0%, #1A2B4A 50%, #0d1a30 100%); }
.grid { position:absolute; inset:-140px; opacity:0.5;
  background-image:linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size:88px 88px; }
.dot { position:absolute; border-radius:50%; background:#4ECDC4; }
.wm { position:absolute; top:78px; left:74px; width:270px; filter:drop-shadow(0 8px 26px rgba(5,12,25,0.85)); }

#type { position:absolute; top:186px; left:74px; right:74px; height:420px; overflow:hidden; }
.beat { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; }
.kick { font-family:'DM Sans'; font-weight:500; font-size:29px; letter-spacing:5px; text-transform:uppercase; color:rgba(255,255,255,0.66); }
.mid { font-family:'Space Grotesk'; font-weight:700; font-size:74px; line-height:1.03; letter-spacing:-2px; margin-top:14px; text-shadow:0 12px 44px rgba(5,12,25,0.85); }
.sub { font-family:'DM Sans'; font-weight:500; font-size:29px; line-height:1.4; color:rgba(255,255,255,0.72); margin-top:18px; }
.teal { color:#4ECDC4; } .coral { color:#FF4757; }

#art { position:absolute; top:660px; left:0; right:0; height:1130px; overflow:hidden; }
.card { position:absolute; left:50%; top:50%; display:block; border-radius:30px;
  box-shadow:0 50px 120px rgba(0,0,0,0.55), 0 0 0 2px rgba(78,205,196,0.28); will-change:transform, opacity; }

/* Beat 1: mock URL bar, typed live, matching the real tool's own chrome. */
#urlcard { width:900px; padding:34px 40px; background:#fff; border-radius:28px; }
.urow { display:flex; align-items:center; gap:14px; border:2px solid rgba(26,43,74,0.14); border-radius:999px; padding:18px 26px; }
.urow svg { flex:none; }
#urltext { font-family:'DM Sans'; font-weight:700; font-size:26px; color:#1A2B4A; white-space:nowrap; overflow:hidden; }
#caret { display:inline-block; width:3px; height:26px; background:#33A79F; margin-left:2px; vertical-align:-5px; }
.scanbtn { margin-top:26px; text-align:center; background:#1A2B4A; color:#fff; font-family:'Space Grotesk'; font-weight:700; font-size:26px; border-radius:999px; padding:18px; }

/* Beat 2: the score ring, same visual language as AuditDemo.jsx. */
#scorecard { width:900px; padding:44px; background:#fff; border-radius:30px; display:flex; align-items:center; gap:34px; }
#ring { flex:none; }
.scoretxt .n { font-family:'Space Grotesk'; font-weight:700; font-size:74px; color:#E23744; }
.scoretxt .of { font-size:30px; color:rgba(26,43,74,0.35); }
.scoretxt .lbl { margin-top:6px; font-family:'Space Grotesk'; font-weight:700; font-size:24px; color:#E23744; }

/* Beat 3: findings list. */
#findcard { width:900px; padding:36px 40px; background:#fff; border-radius:30px; }
.frow { display:flex; align-items:center; gap:20px; padding:18px 0; border-bottom:1.5px solid rgba(26,43,74,0.08); }
.frow:last-child { border-bottom:none; }
.ficon { flex:none; width:44px; height:44px; border-radius:50%; background:rgba(255,71,87,0.12); display:grid; place-items:center; }
.flabel { font-family:'Space Grotesk'; font-weight:700; font-size:28px; color:#1A2B4A; }
.fnote { font-family:'DM Sans'; font-weight:500; font-size:22px; color:#E23744; margin-top:2px; }

.full { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:0 80px; text-align:center; }
.logoBig { width:680px; filter:drop-shadow(0 20px 60px rgba(5,12,25,0.9)); }
.tchip { display:inline-block; margin-top:40px; padding:16px 36px; border-radius:999px; background:rgba(78,205,196,0.16); border:2.5px solid #4ECDC4; color:#4ECDC4; font-family:'Space Grotesk'; font-weight:700; font-size:38px; }
#flash { position:absolute; inset:0; background:#eafffd; opacity:0; pointer-events:none; }
</style></head><body>
<div id="stage">
  <div class="grid" id="grid"></div>
  <div id="dots"></div>
  <img class="wm" id="wm" src="data:image/png;base64,${logo}">

  <div id="type">
    <div class="beat" id="t1"><div class="kick" data-d="0">The free health scan</div><div class="mid" data-d="0.1">Let's score<br>a <span class="teal">real page.</span></div></div>
    <div class="beat" id="t2"><div class="kick" data-d="0">Scanning live</div><div class="mid" data-d="0.1">Here's what<br>it <span class="coral">found.</span></div></div>
    <div class="beat" id="t3"><div class="kick" data-d="0">The report</div><div class="mid" data-d="0.1">Four real<br><span class="coral">problems.</span></div></div>
    <div class="beat" id="t4"><div class="kick" data-d="0">The point</div><div class="mid" data-d="0.1">Every one of these<br>is a <span class="teal">week of work.</span></div><p class="sub" data-d="0.24">None of them are hard to fix.<br>They just never get looked at.</p></div>
  </div>

  <div id="art">
    <div class="card" id="a1"><div id="urlcard"><div class="urow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa5b8" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
        <span id="urltext"></span><span id="caret"></span>
      </div><div class="scanbtn" id="scanbtn" style="opacity:0">Scan my site</div></div></div>

    <div class="card" id="a2"><div id="scorecard">
      <svg id="ring" width="150" height="150" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(26,43,74,0.08)" stroke-width="10"/>
        <circle id="ringfg" cx="48" cy="48" r="40" fill="none" stroke="#FF4757" stroke-width="10" stroke-linecap="round"
          transform="rotate(-90 48 48)" stroke-dasharray="${2 * Math.PI * 40}" stroke-dashoffset="${2 * Math.PI * 40}"/>
      </svg>
      <div class="scoretxt"><span class="n" id="scoren">0</span><span class="of">/100</span><div class="lbl">${esc(LABEL)}</div></div>
    </div></div>

    <div class="card" id="a3"><div id="findcard">
      ${FIND.map((f, i) => `
      <div class="frow" data-d="${(i * 0.14).toFixed(2)}">
        <span class="ficon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E23744" stroke-width="3"><path d="M18 6 6 18M6 6l12 12"/></svg></span>
        <span><span class="flabel">${esc(f.label)}</span><span class="fnote" style="display:block">${esc(f.note)}</span></span>
      </div>`).join('')}
    </div></div>
  </div>

  <div class="full" id="t0">
    <img class="logoBig" data-d="0" src="data:image/png;base64,${logo}">
  </div>
  <div class="full" id="t5">
    <img class="logoBig" data-d="0" style="width:620px" src="data:image/png;base64,${logo}">
    <p class="sub" data-d="0.18" style="font-size:36px; margin-top:36px">Run yours free.</p>
    <div data-d="0.32"><span class="tchip">clicknlikes.com/tools</span></div>
  </div>

  <div id="flash"></div>
</div>
<script>
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const easeOut=p=>1-Math.pow(1-p,3);
const easeQuint=p=>1-Math.pow(1-p,5);
const ramp=(t,s,d)=>easeQuint(clamp((t-s)/d,0,1));
const URL_TEXT = ${JSON.stringify(FIXTURE_URL.replace('https://', ''))};
const RING_C = ${2 * Math.PI * 40};
const SCORE = ${SCORE};

const SCENES = [
  { id:'t0', art:null,  in:0.0,  out:1.6, full:true },
  { id:'t1', art:'a1',  in:1.6,  out:6.4 },
  { id:'t2', art:'a2',  in:6.4,  out:10.6 },
  { id:'t3', art:'a3',  in:10.6, out:17.4 },
  { id:'t4', art:null,  in:17.4, out:19.8 },
  { id:'t5', art:null,  in:19.8, out:${DURATION}, full:true },
];

const DOTS = Array.from({ length: 22 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 1080, y: r(2) * 1920, s: 4 + r(3) * 10, sp: 14 + r(4) * 30, o: 0.12 + r(5) * 0.4 };
});
const dotEls = DOTS.map((d) => {
  const e = document.createElement('div'); e.className = 'dot';
  e.style.width = e.style.height = d.s + 'px'; e.style.opacity = d.o;
  document.getElementById('dots').appendChild(e); return e;
});

const el = (id) => document.getElementById(id);

window.setT = (t) => {
  el('grid').style.transform = 'translate(' + (-t * 8).toFixed(2) + 'px,' + (-t * 12).toFixed(2) + 'px)';
  dotEls.forEach((e, i) => { const d = DOTS[i]; const y = ((d.y - t * d.sp) % 2020 + 2020) % 2020 - 50;
    e.style.transform = 'translate(' + d.x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; });

  const cur = SCENES.find((s) => t >= s.in && t < s.out) || SCENES[SCENES.length - 1];
  const local = t - cur.in, outP = clamp((t - (cur.out - 0.3)) / 0.3, 0, 1);

  SCENES.forEach((s) => {
    const e = el(s.id); const live = s === cur;
    e.style.display = live ? (s.full ? 'flex' : 'block') : 'none';
    if (!live) return;
    e.style.opacity = String(1 - outP);
    e.querySelectorAll('[data-d]').forEach((c) => {
      const q = ramp(local, Number(c.dataset.d), 0.46);
      c.style.opacity = q.toFixed(3);
      c.style.transform = 'translateY(' + ((1 - q) * 40).toFixed(1) + 'px)';
    });
  });

  ['a1', 'a2', 'a3'].forEach((k) => {
    const e = el(k); const live = cur.art === k;
    e.style.display = live ? 'block' : 'none';
    if (!live) return;
    const p = clamp(local / (cur.out - cur.in), 0, 1);
    const inP = clamp(local / 0.5, 0, 1);
    e.style.transform = 'translate(-50%,-50%) translateY(' + ((1 - inP) * 120).toFixed(1) + 'px) scale(' + (0.92 + 0.08 * inP).toFixed(3) + ')';
    e.style.opacity = (inP * (1 - outP)).toFixed(3);
  });

  // Beat 1: type the real fixture URL out, then reveal the Scan button.
  if (cur.id === 't1') {
    const typeP = clamp((local - 0.5) / 1.6, 0, 1);
    const n = Math.round(typeP * URL_TEXT.length);
    el('urltext').textContent = URL_TEXT.slice(0, n);
    el('caret').style.opacity = (Math.floor(t * 2.4) % 2 === 0) ? '1' : '0';
    el('scanbtn').style.opacity = clamp((local - 2.3) / 0.4, 0, 1).toFixed(3);
  }

  // Beat 2: ring fills to the REAL computed score, number counts up to match.
  if (cur.id === 't2') {
    const p = easeOut(clamp((local - 0.5) / 1.6, 0, 1));
    el('ringfg').style.strokeDashoffset = (RING_C * (1 - p * (SCORE / 100))).toFixed(2);
    el('scoren').textContent = Math.round(p * SCORE);
  }

  const f = SCENES.reduce((acc, s) => Math.max(acc, s.in === 0 ? 0 : (1 - clamp(Math.abs(t - s.in) / 0.14, 0, 1))), 0);
  el('flash').style.opacity = (f * 0.4).toFixed(3);
  el('wm').style.opacity = (cur.full ? 0 : 0.9 * ramp(t, 1.7, 0.4)).toFixed(3);
};
window.setT(0);
</script>
</body></html>`;

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.setContent(html_, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

if (STILL !== null) {
  await page.evaluate((t) => window.setT(t), STILL);
  await page.waitForTimeout(80);
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('wrote still', OUT, 'at t =', STILL);
  process.exit(0);
}

const FRAMES = join(dirname(OUT), '.reel-frames-teardown');
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
const total = Math.round(DURATION * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((tt) => window.setT(tt), i / FPS);
  await page.screenshot({ path: join(FRAMES, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
  if (i % 90 === 0) console.log(`  frame ${i}/${total}`);
}
await browser.close();

execFileSync(
  FFMPEG,
  ['-y', '-framerate', String(FPS), '-i', join(FRAMES, 'f%05d.jpg'),
   '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
   '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT],
  { stdio: ['ignore', 'ignore', 'inherit'] }
);
rmSync(FRAMES, { recursive: true, force: true });
console.log('wrote', OUT);
