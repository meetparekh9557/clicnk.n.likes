// Capture the real UI crops that gen-reel-growth.mjs animates.
//
// Every card in that reel is a genuine screenshot of a page that exists, which
// is the whole point - the brand's positioning does not survive a mocked-up
// dashboard. So this script screenshots the built site rather than letting the
// reel draw its own version of it.
//
// Serve the built site first (from the repo root, which holds the published
// output), then point this at it:
//
//   npx http-server -p 8899 -s .
//   node scripts/capture-growth-shots.mjs --out=/tmp/shots [--base=http://127.0.0.1:8899]
//
// Note on the live site: clicknlikes.com is not reachable from the sandboxed
// agent environment, and capturing the local build is better anyway - it
// guarantees the reel matches the commit it was rendered from.
import { mkdirSync } from 'node:fs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const OUT = args.out;
const BASE = args.base || 'http://127.0.0.1:8899';
if (!OUT) { console.error('--out=<dir> is required'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

// Scroll-reveal animations are keyed to the viewport, so a capture taken
// before the section animates in lands half-faded. Kill both.
const FORCE = `*,*::before,*::after{animation:none!important;transition:none!important}
.reveal,.reveal-mask,.mask-line,.mask-line>span{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}`;

// [name, path, viewport width, picker run in the page]
const JOBS = [
  ['growth-hero',    '/growth/', 1180, () => document.querySelector('#hero')],
  ['growth-form',    '/growth/', 1180, () => document.querySelector('#hero-form')],
  ['sound-familiar', '/growth/', 1000, () => [...document.querySelectorAll('section')].find((e) => /Sound Familiar/.test(e.innerText))],
  ['how-it-works',   '/growth/', 1280, () => document.querySelector('#how-it-works')],
  ['services',       '/growth/', 1280, () => [...document.querySelectorAll('section')].find((e) => /One Growth Strategy/.test(e.innerText))],
  ['before-after',   '/growth/', 1180, () => [...document.querySelectorAll('section')].find((e) => /From Scattered Marketing/.test(e.innerText))],
  ['pricing-tiers',  '/pricing/', 1280, () => [...document.querySelectorAll('section')].find((e) => /Starter/.test(e.innerText) && /Growth/.test(e.innerText) && /Custom/.test(e.innerText))],
  ['pricing-hero',   '/pricing/', 1180, () => document.querySelector('h1').closest('section')],
  ['plan-builder',   '/pricing/', 1280, () => document.querySelector('#quote')],
  ['tools-grid',     '/tools/', 1280, () => [...document.querySelectorAll('section')].find((e) => /MORE FREE TOOLS/.test(e.innerText))],
  ['tools-channel',  '/tools/', 1280, () => [...document.querySelectorAll('section')].find((e) => /CHANNEL CHECKS/.test(e.innerText))],
  ['tools-hero',     '/tools/', 1000, () => document.querySelector('h1').closest('section')],
  ['kopa-stats',     '/work/kopa-seamless/', 1100, () => [...document.querySelectorAll('section')].find((e) => /of new leads from organic/.test(e.innerText))],
  ['kopa-hero',      '/work/kopa-seamless/', 1100, () => document.querySelector('h1').closest('section')],
];

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

let missing = 0;
for (const [name, path, width, pick] of JOBS) {
  const page = await browser.newPage({ viewport: { width, height: 1400 }, deviceScaleFactor: 2 });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: FORCE });
  // A full scroll first, so anything lazy has already loaded by capture time.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const handle = await page.evaluateHandle(`(${pick.toString()})()`);
  const el = handle.asElement();
  if (!el) { console.log('MISS', name); missing++; await page.close(); continue; }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await el.screenshot({ path: `${OUT}/${name}.png` });
  console.log('ok  ', name);
  await page.close();
}
await browser.close();
if (missing) { console.error(`${missing} capture(s) missing - the reel will refuse to render`); process.exit(1); }
console.log('captures written to', OUT);
