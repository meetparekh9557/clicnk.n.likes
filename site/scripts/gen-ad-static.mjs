// 1080x1350 (4:5) static Meta ad for the /growth/ landing page.
//
// Built as HTML rendered through Playwright rather than generated as an image:
// the brand font, the exact palette and the real wordmark come out right every
// time, the copy stays editable, and a re-render is byte-identical. An image
// model cannot be trusted to set type or reproduce a logo.
//
// COMPOSITION. Five channel cards arranged AROUND a centre rather than in a
// row, with every connector between them broken and marked. Putting the void
// in the middle of the ring is what makes the point land without a caption:
// the eye falls into the gap on its own, and the warning is already sitting
// there when it arrives.
//
// COLOUR DISCIPLINE - the rule that makes the creative work. Teal says "this
// is us", coral says "this is broken", and nothing else on the canvas is warm.
// The headline accent therefore stays TEAL: putting it in coral would make the
// alarm colour also the brand-statement colour, and the broken-link marks
// would stop reading as failures because they'd just be more red on a red
// canvas. It also matters for positioning - red-alarm creative is the house
// style of every "10X YOUR LEADS" ad in the feed, and this brand sells the
// opposite of a growth hack.
//
// None of the five is flagged as the broken one, deliberately. Naming it would
// answer the question the ad exists to make the reader ask.
//
//   node scripts/gen-ad-static.mjs --out=/path/ad.png
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
// Meta wants three shapes and they are three different designs, not three
// crops. 4:5 and 9:16 share a vertical stack at different scales; 1.91:1 is
// landscape and gets its own two-column layout, because a headline, a ring of
// five cards and a CTA cannot stack inside 628px of height.
const RATIOS = {
  '4x5':    { w: 1080, h: 1350, pad: '72px 64px 56px', logo: 36, h1: 82, quiet: 45, loud: 71,
              stageScale: 1, stageShift: 0, cta: 28, land: false, reason: 27, ctaPad: '23px 42px 23px 26px' },
  '9x16':   { w: 1080, h: 1920, pad: '300px 64px 300px', logo: 42, h1: 92, quiet: 50, loud: 80,
              stageScale: 0.98, stageShift: 40, cta: 32, land: false, reason: 30, ctaPad: '26px 48px 26px 30px' },
  '1.91x1': { w: 1200, h: 628,  pad: '44px 52px', logo: 27, h1: 46, quiet: 24, loud: 40,
              stageScale: 0.50, stageShift: 0, cta: 21, land: true, reason: 20, ctaPad: '17px 32px 17px 20px' },
};
const RATIO = args.ratio || '4x5';
const R = RATIOS[RATIO];
if (!R) { console.error('--ratio must be one of:', Object.keys(RATIOS).join(', ')); process.exit(1); }
const OUT = args.out || resolve(ROOT, `../ad-growth-${R.w}x${R.h}.png`);

// --- every word on the canvas, in one place --------------------------------
const copy = {
  headline: ['YOUR BUSINESS', 'DOESN’T NEED', 'MORE MARKETING.'],
  turnQuiet: 'IT NEEDS TO KNOW',
  turnLoud: 'WHAT’S NOT WORKING.',
  gapLabel: ['GROWTH', 'GAP'],
  reason: 'Find out what’s holding your business back.',
  cta: 'SEND YOUR INQUIRY',
};

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk700 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dm500 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
const dm700 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2');
const logo = b64('public/logo-wordmark.png');

// Lucide paths, lifted from the same icon set the site itself uses, so the
// cards read as part of the brand rather than as clip-art.
const ICONS = {
  seo: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>',
  ads: '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/>',
  content: '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  social: '<path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/><path d="M7 10v12"/>',
  website: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M2 8h20"/><circle cx="5.5" cy="5.5" r="0.6"/><circle cx="8" cy="5.5" r="0.6"/>',
};
const icon = (k) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;

// Small in-card graphic. Each channel looks like it is running - which is the
// whole point: they are all live, and still nothing joins up.
const spark = `<svg class="gfx" viewBox="0 0 120 34" fill="none" stroke="#4ECDC4" stroke-width="2.4"
  stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
  <polyline points="4,26 26,18 48,23 70,10 92,15 116,5"/>
  <circle cx="26" cy="18" r="2.6" fill="#4ECDC4" stroke="none"/>
  <circle cx="70" cy="10" r="2.6" fill="#4ECDC4" stroke="none"/>
  <circle cx="116" cy="5" r="2.6" fill="#4ECDC4" stroke="none"/></svg>`;
const bars = `<div class="bars"><span style="height:14px"></span><span style="height:24px"></span>
  <span style="height:19px"></span><span style="height:31px"></span></div>`;
const lines = `<div class="lines"><span style="width:76%"></span><span style="width:52%"></span></div>`;

// Where each card sits on the 952x470 stage, and how far off-true it is.
// Fixed values, not random, so a re-render is identical.
const CARDS = [
  { key: 'seo',     label: 'SEO',     x: 0,   y: 6,   w: 258, rot: -2.6, gfx: spark },
  { key: 'ads',     label: 'ADS',     x: 356, y: 0,   w: 240, rot: 1.9,  gfx: bars },
  { key: 'content', label: 'CONTENT', x: 700, y: 16,  w: 252, rot: -1.7, gfx: lines },
  { key: 'social',  label: 'SOCIAL',  x: 26,  y: 296, w: 256, rot: 2.3,  gfx: lines },
  { key: 'website', label: 'WEBSITE', x: 676, y: 308, w: 262, rot: -2.1, gfx: lines },
];

const cardsHtml = CARDS.map(
  (c) => `<div class="card" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;transform:rotate(${c.rot}deg)">
    <div class="cardTop"><span class="ico">${icon(c.key)}</span><span class="lbl">${c.label}</span></div>
    ${c.gfx}
  </div>`
).join('\n');

// Every link between the cards, and the mark where it fails. Five links, five
// breaks - no channel is singled out.
const BREAKS = [
  [302, 56], [648, 62], [126, 206], [822, 216], [478, 396],
];
const breaksHtml = BREAKS.map(
  ([x, y]) => `<div class="brk" style="left:${x}px;top:${y}px">
    <svg viewBox="0 0 24 24" fill="none" stroke="#FF4757" stroke-width="3.4" stroke-linecap="round">
      <path d="M5 5 19 19"/><path d="M19 5 5 19"/></svg></div>`
).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';font-weight:700;src:url(data:font/woff2;base64,${grotesk700}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:500;src:url(data:font/woff2;base64,${dm500}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:700;src:url(data:font/woff2;base64,${dm700}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${R.w}px;height:${R.h}px;overflow:hidden}
#ad{position:relative;width:${R.w}px;height:${R.h}px;overflow:hidden;
  font-family:'DM Sans',sans-serif;
  background:linear-gradient(168deg,#22375C 0%,#1A2B4A 42%,#0E1A2E 100%);
  display:flex;flex-direction:column;padding:${R.pad}}
.layer{position:absolute;inset:0;pointer-events:none}
#grid{background-image:linear-gradient(rgba(255,255,255,0.042) 1px,transparent 1px),
                     linear-gradient(90deg,rgba(255,255,255,0.042) 1px,transparent 1px);
  background-size:90px 90px}
#glow{background:radial-gradient(700px 560px at 78% 14%,rgba(78,205,196,0.24),transparent 70%);filter:blur(26px)}
#vig{background:radial-gradient(124% 78% at 50% 46%,transparent 44%,rgba(6,13,25,0.55) 100%)}
.stack{position:relative;z-index:2;display:grid;height:100%;
  grid-template-areas:'block' 'stage' 'cta';
  grid-template-rows:auto 1fr auto;align-content:space-between}
.block{grid-area:block}.stage{grid-area:stage}.ctaRow{grid-area:cta}
/* 1.91:1 — the argument sits left, the ring right. A headline, five cards and
   a CTA will not stack inside 628px, so they run side by side instead. */
.stack.land{grid-template-areas:'block stage' 'cta stage';
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  grid-template-rows:1fr auto;align-items:center;align-content:center;column-gap:18px}
.stack.land .stage{align-self:center;justify-self:center}
.stack.land .ctaRow{align-self:end}

.brand{display:flex;align-items:center;margin-bottom:40px}
.brand img{height:${R.logo}px;opacity:0.95}

h1{font-family:'Space Grotesk';font-weight:700;font-size:${R.h1}px;line-height:1.03;
  letter-spacing:-0.038em;color:#fff}
.turnQuiet{margin-top:${R.land?14:30}px;font-family:'Space Grotesk';font-weight:700;font-size:${R.quiet}px;
  letter-spacing:-0.02em;color:rgba(255,255,255,0.58)}
.turnLoud{margin-top:6px;font-family:'Space Grotesk';font-weight:700;font-size:${R.loud}px;
  line-height:1.04;letter-spacing:-0.035em;color:#4ECDC4;
  text-shadow:0 18px 58px rgba(78,205,196,0.28)}

/* the ring */
.stage{position:relative;width:952px;height:470px;flex:none;
  transform:scale(${R.stageScale}) translateY(${R.stageShift}px);
  transform-origin:${R.land ? 'center center' : 'top center'};
  ${R.land ? 'margin:-118px -238px;' : ''}}
.wires{position:absolute;inset:0}
.card{position:absolute;padding:20px 22px 18px;border-radius:20px;
  background:linear-gradient(150deg,rgba(255,255,255,0.10),rgba(255,255,255,0.045));
  border:1.5px solid rgba(255,255,255,0.17);
  box-shadow:0 26px 54px rgba(4,10,22,0.46)}
.cardTop{display:flex;align-items:center;gap:14px}
.ico{width:31px;height:31px;display:block;flex:none}
.ico svg{width:31px;height:31px;display:block}
.lbl{font-family:'Space Grotesk';font-weight:700;font-size:27px;letter-spacing:0.005em;
  color:#fff}
.gfx{display:block;width:100%;height:32px;margin-top:15px}
.bars{display:flex;align-items:flex-end;gap:8px;height:32px;margin-top:15px}
.bars span{width:17px;border-radius:4px;background:rgba(78,205,196,0.55)}
.lines{margin-top:17px;display:flex;flex-direction:column;gap:9px}
.lines span{height:8px;border-radius:4px;background:rgba(255,255,255,0.20)}
.brk{position:absolute;width:34px;height:34px;margin:-17px 0 0 -17px}
.brk svg{width:34px;height:34px;display:block;
  filter:drop-shadow(0 0 12px rgba(255,71,87,0.55))}

/* the void the ring encloses */
.core{position:absolute;left:476px;top:238px;width:300px;margin:-90px 0 0 -150px;
  display:flex;flex-direction:column;align-items:center}
.core svg{width:74px;height:74px;display:block;
  filter:drop-shadow(0 0 22px rgba(255,71,87,0.55))}
.gapLabel{margin-top:12px;text-align:center;font-family:'Space Grotesk';font-weight:700;
  font-size:33px;line-height:1.06;letter-spacing:0.10em;color:#FF4757;
  text-shadow:0 10px 32px rgba(255,71,87,0.40)}

.reason{position:relative;padding-left:${R.land?16:22}px;font-size:${R.reason}px;line-height:1.36;
  color:rgba(255,255,255,0.74);margin-bottom:24px;max-width:660px}
.reason::before{content:'';position:absolute;left:0;top:4px;bottom:4px;width:3px;
  border-radius:2px;background:#4ECDC4}
.cta{display:inline-flex;align-items:center;gap:20px;background:#4ECDC4;color:#12233E;
  border-radius:14px;padding:${R.ctaPad};font-family:'Space Grotesk';
  font-weight:700;font-size:${R.cta}px;letter-spacing:-0.01em;white-space:nowrap;
  box-shadow:0 18px 44px rgba(78,205,196,0.30)}
.cta .arrow{width:44px;height:44px;border-radius:50%;background:#12233E;flex:none;
  display:flex;align-items:center;justify-content:center}
.cta .arrow svg{width:22px;height:22px;display:block}
</style></head><body>
<div id="ad">
  <div class="layer" id="grid"></div>
  <div class="layer" id="glow"></div>
  <div class="layer" id="vig"></div>

  <div class="stack${R.land ? ' land' : ''}">
    <div class="block">
      <div class="brand"><img src="data:image/png;base64,${logo}"></div>
      <h1>${copy.headline.join('<br>')}</h1>
      <div class="turnQuiet">${copy.turnQuiet}</div>
      <div class="turnLoud">${copy.turnLoud}</div>
    </div>

    <div class="stage">
      <svg class="wires" viewBox="0 0 952 470" fill="none">
        <g stroke="rgba(255,255,255,0.30)" stroke-width="2.4" stroke-dasharray="10 12"
           stroke-linecap="round">
          <path d="M258 62 L356 50"/>
          <path d="M596 54 L700 72"/>
          <path d="M112 126 L140 292"/>
          <path d="M836 132 L816 304"/>
          <path d="M286 372 Q478 432 676 374"/>
        </g>
      </svg>
      ${cardsHtml}
      ${breaksHtml}
      <div class="core">
        <svg viewBox="0 0 24 24" fill="none" stroke="#FF4757" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <div class="gapLabel">${copy.gapLabel.join('<br>')}</div>
      </div>
    </div>

    <div class="ctaRow">
      <div class="reason">${copy.reason}</div>
      <div class="cta">
        <span class="arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="2.6"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </span>
        ${copy.cta}
      </div>
    </div>
  </div>
</div>
</body></html>`;

const pageFile = join(tmpdir(), '_ad-static.html');
writeFileSync(pageFile, html);

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: R.w, height: R.h }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT });
await browser.close();
console.log('wrote', OUT);
