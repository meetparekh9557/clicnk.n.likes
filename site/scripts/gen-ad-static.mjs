// 1080x1350 (4:5) static Meta ad for the /growth/ landing page.
//
// Built as HTML rendered through Playwright rather than generated as an image,
// for the same reason every other creative in this repo is: the brand font,
// the exact palette and the real wordmark come out right every time, the copy
// stays editable, and a re-render is byte-identical. An image model cannot be
// trusted to set type or reproduce a logo.
//
// The whole creative argues ONE thing: activity is not the same as growth, and
// you cannot fix what you have not identified. Everything on the canvas serves
// that - which is why the five channel cards all read as *live* and none is
// marked broken. Flagging one would answer the question the ad exists to make
// the reader ask.
//
//   node scripts/gen-ad-static.mjs --out=/path/ad.png
//   node scripts/gen-ad-static.mjs --out=/path/ad.png --headline="..."
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const OUT = args.out || resolve(ROOT, '../ad-growth-1080x1350.png');

// --- copy, in one place -----------------------------------------------------
const copy = {
  headline: ['YOUR BUSINESS', "DOESN'T NEED", 'MORE MARKETING.'],
  turnQuiet: 'IT NEEDS TO KNOW',
  turnLoud: "WHAT'S NOT WORKING.",
  channels: ['SEO', 'ADS', 'CONTENT', 'SOCIAL', 'WEBSITE'],
  support: "More SEO, ads or content won't fix a problem you haven't identified yet.",
  cta: "FIND OUT WHAT'S HOLDING YOU BACK",
  url: 'clicknlikes.com/growth',
};

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk700 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dm500 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
const dm700 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2');
const logo = b64('public/logo-wordmark.png');

// Each card is nudged and tilted differently. Fixed values, not random, so the
// creative is reproducible - and tuned so the row still scans left to right
// while clearly refusing to line up.
const CARDS = [
  { dy: 0,   rot: -3.2, bars: [0.45, 0.72, 0.38] },
  { dy: 26,  rot: 2.4,  bars: [0.62, 0.34, 0.55] },
  { dy: -14, rot: -1.6, bars: [0.38, 0.58, 0.70] },
  { dy: 32,  rot: 3.1,  bars: [0.70, 0.44, 0.30] },
  { dy: 6,   rot: -2.2, bars: [0.33, 0.66, 0.48] },
];

const cardsHtml = copy.channels
  .map((label, i) => {
    const c = CARDS[i];
    const bars = c.bars
      .map((h) => `<span class="bar" style="height:${Math.round(h * 34)}px"></span>`)
      .join('');
    return `<div class="card" style="transform:translateY(${c.dy}px) rotate(${c.rot}deg)">
      <div class="cardTop"><span class="dot"></span><span class="lbl">${label}</span></div>
      <div class="bars">${bars}</div>
    </div>`;
  })
  .join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';font-weight:700;src:url(data:font/woff2;base64,${grotesk700}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:500;src:url(data:font/woff2;base64,${dm500}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:700;src:url(data:font/woff2;base64,${dm700}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden}
#ad{position:relative;width:1080px;height:1350px;overflow:hidden;
  font-family:'DM Sans',sans-serif;
  background:linear-gradient(168deg,#22375C 0%,#1A2B4A 44%,#101D33 100%);
  display:flex;flex-direction:column;padding:76px 64px 56px}
.layer{position:absolute;inset:0;pointer-events:none}
#grid{background-image:linear-gradient(rgba(255,255,255,0.045) 1px,transparent 1px),
                     linear-gradient(90deg,rgba(255,255,255,0.045) 1px,transparent 1px);
  background-size:90px 90px}
#glow{background:radial-gradient(680px 560px at 76% 16%,rgba(78,205,196,0.26),transparent 70%);filter:blur(26px)}
#glow2{background:radial-gradient(560px 470px at 12% 88%,rgba(255,71,87,0.12),transparent 72%);filter:blur(30px)}
#vig{background:radial-gradient(122% 76% at 50% 46%,transparent 44%,rgba(8,16,30,0.5) 100%)}
.stack{position:relative;z-index:2;display:flex;flex-direction:column;height:100%}

/* 1. headline - the first thing seen, and the biggest thing on the canvas */
h1{font-family:'Space Grotesk';font-weight:700;font-size:92px;line-height:1.03;
  letter-spacing:-0.038em;color:#fff}

/* 2. the turn. The quiet line sets up the loud one; the accent line is the
      single strongest contrast in the creative. */
.turnQuiet{margin-top:34px;font-family:'Space Grotesk';font-weight:700;font-size:52px;
  letter-spacing:-0.02em;color:rgba(255,255,255,0.60)}
.turnLoud{margin-top:6px;font-family:'Space Grotesk';font-weight:700;font-size:80px;
  line-height:1.04;letter-spacing:-0.035em;color:#4ECDC4;
  text-shadow:0 18px 60px rgba(78,205,196,0.30)}

/* 3. five live channels that refuse to line up */
.cardsWrap{position:relative;margin-top:50px;height:172px}
.cards{display:flex;gap:20px;align-items:flex-start}
.card{width:166px;padding:20px 17px 18px;border-radius:18px;
  background:rgba(255,255,255,0.065);border:1.5px solid rgba(255,255,255,0.16);
  box-shadow:0 22px 48px rgba(4,10,22,0.34);backdrop-filter:blur(2px)}
.cardTop{display:flex;align-items:center;gap:11px}
.dot{width:11px;height:11px;border-radius:50%;background:#4ECDC4;
  box-shadow:0 0 14px rgba(78,205,196,0.85)}
.lbl{font-family:'Space Grotesk';font-weight:700;font-size:23px;letter-spacing:0.01em;
  color:rgba(255,255,255,0.94)}
.bars{display:flex;align-items:flex-end;gap:6px;height:36px;margin-top:14px}
.bar{width:13px;border-radius:4px;background:rgba(78,205,196,0.42)}
/* the links between them: dashed, and every one stops short */
.link{position:absolute;height:2px;top:52px;
  background:repeating-linear-gradient(90deg,rgba(255,255,255,0.42) 0 9px,transparent 9px 19px)}

/* 4. one short line of support copy */
.support{margin-top:58px;font-size:32px;line-height:1.44;color:rgba(255,255,255,0.72);
  max-width:930px}

/* 5. CTA - unmistakable, deliberately smaller than the headline */
.ctaRow{margin-top:auto;display:flex;flex-direction:column;align-items:flex-start}
.cta{display:inline-block;background:#4ECDC4;color:#12233E;border-radius:999px;
  padding:28px 50px;font-family:'Space Grotesk';font-weight:700;font-size:37px;
  letter-spacing:-0.012em;white-space:nowrap;box-shadow:0 24px 56px rgba(78,205,196,0.32)}
.url{margin-top:22px;font-family:'DM Sans';font-weight:700;font-size:31px;
  color:rgba(255,255,255,0.88);letter-spacing:0.005em}
.foot{margin-top:32px;display:flex;align-items:center;
  border-top:1.5px solid rgba(255,255,255,0.12);padding-top:26px;width:100%}
.foot img{height:40px;opacity:0.92}
</style></head><body>
<div id="ad">
  <div class="layer" id="grid"></div>
  <div class="layer" id="glow"></div>
  <div class="layer" id="glow2"></div>
  <div class="layer" id="vig"></div>

  <div class="stack">
    <h1>${copy.headline.join('<br>')}</h1>
    <div class="turnQuiet">${copy.turnQuiet}</div>
    <div class="turnLoud">${copy.turnLoud}</div>

    <div class="cardsWrap">
      <!-- Broken links, drawn behind the cards. Each span deliberately falls
           short of the next card, so the row reads as five things running on
           their own rather than one system. -->
      <div class="link" style="left:152px;width:48px"></div>
      <div class="link" style="left:348px;width:34px;top:80px"></div>
      <div class="link" style="left:534px;width:54px;top:38px"></div>
      <div class="link" style="left:729px;width:32px;top:86px"></div>
      <div class="cards">${cardsHtml}</div>
    </div>

    <div class="support">${copy.support}</div>

    <div class="ctaRow">
      <div class="cta">${copy.cta}</div>
      <div class="url">${copy.url}</div>
      <div class="foot">
        <img src="data:image/png;base64,${logo}">
      </div>
    </div>
  </div>
</div>
</body></html>`;

const pageFile = join(tmpdir(), '_ad-static.html');
writeFileSync(pageFile, html);

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT });
await browser.close();
console.log('wrote', OUT);
