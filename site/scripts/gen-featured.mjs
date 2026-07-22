// Branded 1200x630 featured/OG image generator for Insights articles.
// Reproduces the house style (navy grid, wordmark, teal tag pill, two-line
// title white->teal, footer) so every article — including the ones written
// by the weekly auto-blog task — gets an on-brand share image with the real
// brand font (Space Grotesk), no manual design step.
//
// Usage:
//   node scripts/gen-featured.mjs --slug=my-post --tag="AI SEO" \
//        --title="Get cited by AI,|not lost on page two."
//   ("|" marks the line break; the second line renders in teal. If omitted,
//    the title is auto-split near the middle.)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..'); // site/

// Playwright is pre-installed globally in this environment.
const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const { chromium } = pw;

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const slug = args.slug;
const tag = (args.tag || 'Insights').toString();
let title = (args.title || '').toString().trim();
if (!slug || !title) {
  console.error('Required: --slug and --title');
  process.exit(1);
}

// Split into two lines (explicit "|" wins; else split near the middle word).
let [line1, line2] = title.includes('|') ? title.split('|') : [null, null];
if (line1 === null) {
  const words = title.split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  line1 = words.slice(0, mid).join(' ');
  line2 = words.slice(mid).join(' ');
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dmsans = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @font-face { font-family:'Space Grotesk'; font-weight:700; src:url(data:font/woff2;base64,${grotesk}) format('woff2'); }
  @font-face { font-family:'DM Sans'; font-weight:500; src:url(data:font/woff2;base64,${dmsans}) format('woff2'); }
  * { margin:0; box-sizing:border-box; }
  body { width:1200px; height:630px; overflow:hidden; }
  .card {
    width:1200px; height:630px; position:relative; padding:64px 72px;
    display:flex; flex-direction:column; justify-content:space-between;
    background:
      radial-gradient(120% 120% at 85% 0%, rgba(78,205,196,0.16), transparent 55%),
      linear-gradient(135deg, #16253f 0%, #1A2B4A 55%, #12203a 100%);
    color:#fff; font-family:'DM Sans', sans-serif;
  }
  .grid { position:absolute; inset:0; opacity:0.5;
    background-image:linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size:60px 60px; }
  .top { position:relative; display:flex; align-items:center; justify-content:space-between; }
  .wm { font-family:'Space Grotesk'; font-weight:700; font-size:30px; letter-spacing:-0.5px; }
  .wm .t { color:#4ECDC4; }
  .kicker { font-family:'DM Sans'; font-weight:500; font-size:20px; color:rgba(255,255,255,0.45); }
  .mid { position:relative; }
  .tag { display:inline-block; font-family:'DM Sans'; font-weight:700; font-size:18px; letter-spacing:1.5px;
    text-transform:uppercase; color:#4ECDC4; background:rgba(78,205,196,0.14);
    border:1.5px solid rgba(78,205,196,0.5); padding:8px 18px; border-radius:100px; }
  h1 { font-family:'Space Grotesk'; font-weight:700; font-size:68px; line-height:1.05; letter-spacing:-1px; margin-top:28px; }
  h1 .l2 { color:#4ECDC4; display:block; }
  .foot { position:relative; font-family:'DM Sans'; font-weight:500; font-size:22px; color:rgba(255,255,255,0.5); }
</style></head><body>
  <div class="card">
    <div class="grid"></div>
    <div class="top">
      <div class="wm">Click<span class="t">.n.</span>likes</div>
      <div class="kicker">Insights</div>
    </div>
    <div class="mid">
      <span class="tag">${esc(tag)}</span>
      <h1>${esc(line1)}<span class="l2">${esc(line2)}</span></h1>
    </div>
    <div class="foot">clicknlikes.com &middot; Full-stack organic growth</div>
  </div>
</body></html>`;

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.waitForTimeout(150);
const out = resolve(ROOT, 'public/insights', `${slug}.png`);
await page.locator('.card').screenshot({ path: out });
await browser.close();
console.log('wrote', out);
