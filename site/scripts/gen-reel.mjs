// Branded 9:16 motion-graphics reel generator (1080x1920 MP4).
//
// Renders a deterministic animation frame by frame in Chromium, then encodes
// with ffmpeg. Deterministic is the point: every frame is produced by calling
// setT(t) with an exact timestamp, so nothing depends on how fast the machine
// happened to be running, and a re-render is byte-comparable.
//
// There is no audio track. Reels get their audio chosen in the app, and a
// silent 1080x1920 H.264 file is exactly what Instagram wants to receive.
//
// Usage:
//   node scripts/gen-reel.mjs --out=/path/launch-reel.mp4 [--fps=30] [--scale=1]
//   node scripts/gen-reel.mjs --still=8.2 --out=/path/frame.png   (single frame,
//                                                                  for checking)
//
// Every claim on screen is checked against the site: the price range is the
// published Starter and Pro tiers, "5 free tools" is the length of
// src/data/tools.ts, and "11-signal" is the Website Health Scan's own
// description. Change the copy here only alongside the source of the claim.
import { readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
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
const DURATION = Number(args.duration || 20);
const SCALE = Number(args.scale || 1);
const OUT = args.out || resolve(ROOT, '../reel.mp4');
const STILL = args.still ? Number(args.still) : null;

const FFMPEG =
  args.ffmpeg ||
  '/tmp/claude-0/-home-user-clicnk-n-likes/180512ee-5346-5a14-9703-a26cea5b6962/scratchpad/node_modules/ffmpeg-static/ffmpeg';

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dmsans = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
const dmsansBold = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Space Grotesk'; font-weight:700; src:url(data:font/woff2;base64,${grotesk}) format('woff2'); }
@font-face { font-family:'DM Sans'; font-weight:500; src:url(data:font/woff2;base64,${dmsans}) format('woff2'); }
@font-face { font-family:'DM Sans'; font-weight:700; src:url(data:font/woff2;base64,${dmsansBold}) format('woff2'); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0f1c33; }
#stage {
  position:relative; width:1080px; height:1920px; overflow:hidden; color:#fff;
  font-family:'DM Sans', sans-serif;
  background:
    radial-gradient(90% 60% at 80% 8%, rgba(78,205,196,0.20), transparent 60%),
    radial-gradient(80% 50% at 10% 92%, rgba(255,71,87,0.10), transparent 60%),
    linear-gradient(160deg, #16253f 0%, #1A2B4A 52%, #101d34 100%);
}
.grid { position:absolute; inset:-100px; opacity:0.55;
  background-image:linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size:90px 90px; }
.dot { position:absolute; border-radius:50%; background:#4ECDC4; }
.scene { position:absolute; inset:0; display:flex; flex-direction:column;
  justify-content:center; padding:0 96px; will-change:opacity, transform; }
.wm { position:absolute; top:88px; left:96px; font-family:'Space Grotesk'; font-weight:700;
  font-size:40px; letter-spacing:-0.6px; }
.wm .t { color:#4ECDC4; }
h1 { font-family:'Space Grotesk'; font-weight:700; font-size:104px; line-height:1.04; letter-spacing:-2.4px; }
h2 { font-family:'Space Grotesk'; font-weight:700; font-size:82px; line-height:1.06; letter-spacing:-1.8px; }
.teal { color:#4ECDC4; }
.muted { color:rgba(255,255,255,0.62); font-size:36px; line-height:1.45; font-weight:500; }
.pill { display:inline-flex; align-items:center; gap:18px; align-self:flex-start;
  border:2px solid rgba(78,205,196,0.55); background:rgba(78,205,196,0.12);
  border-radius:999px; padding:22px 40px; font-family:'Space Grotesk'; font-weight:700;
  font-size:52px; letter-spacing:-1px; color:#4ECDC4; }
.row { display:flex; align-items:flex-start; gap:28px; margin-top:44px; }
.tick { flex:none; width:56px; height:56px; border-radius:50%; background:rgba(78,205,196,0.16);
  border:2px solid rgba(78,205,196,0.6); display:grid; place-items:center; margin-top:6px; }
.tick svg { width:28px; height:28px; }
.row .txt { display:block; font-family:'Space Grotesk'; font-weight:700; font-size:52px; line-height:1.18; letter-spacing:-1px; }
.row .sub { display:block; font-family:'DM Sans'; font-weight:500; font-size:30px; color:rgba(255,255,255,0.55); margin-top:8px; letter-spacing:0; }
.bars { margin-top:64px; display:flex; flex-direction:column; gap:22px; }
.bar { height:26px; border-radius:999px; background:rgba(255,255,255,0.09); overflow:hidden; }
.bar i { display:block; height:100%; border-radius:999px; background:linear-gradient(90deg,#4ECDC4,#33A79F); }
.big { font-family:'Space Grotesk'; font-weight:700; font-size:96px; letter-spacing:-2.4px; }
.rule { height:8px; border-radius:999px; background:#4ECDC4; margin-top:36px; }
.foot { position:absolute; left:96px; right:96px; bottom:120px; font-size:32px;
  color:rgba(255,255,255,0.5); font-weight:500; }
.strike { position:relative; display:inline-block; }
.strike i { position:absolute; left:-6px; top:56%; height:9px; background:#FF4757; border-radius:8px; }
</style></head><body>
<div id="stage">
  <div class="grid" id="grid"></div>
  <div id="dots"></div>
  <div class="wm" id="wm">Click<span class="t">.n.</span>likes</div>

  <!-- S1 hook -->
  <div class="scene" id="s1">
    <h1 data-d="0">Most agencies</h1>
    <h1 data-d="0.12">won't show you</h1>
    <h1 data-d="0.24"><span class="strike">their prices<i id="strike"></i></span></h1>
  </div>

  <!-- S2 the turn -->
  <div class="scene" id="s2">
    <h2 data-d="0">Ours are on<br>the <span class="teal">website.</span></h2>
    <div style="height:56px"></div>
    <div class="pill" data-d="0.25">₹16,000 &ndash; ₹1,24,000 / mo</div>
    <p class="muted" data-d="0.4" style="margin-top:40px">Every tier published. No call booked<br>just to be told a number.</p>
  </div>

  <!-- S3 launch -->
  <div class="scene" id="s3" style="justify-content:center">
    <p class="muted" data-d="0" style="font-size:34px; letter-spacing:5px; text-transform:uppercase">Now live</p>
    <div class="big" data-d="0.12" style="margin-top:26px; font-size:112px">clicknlikes<span class="teal">.com</span></div>
    <div class="rule" data-d="0.3" id="rule" style="width:0"></div>
    <p class="muted" data-d="0.45" style="margin-top:44px">Rebuilt from the ground up:<br>faster, clearer, and honest about the numbers.</p>
  </div>

  <!-- S4 three proofs -->
  <div class="scene" id="s4">
    <p class="muted" data-d="0" style="font-size:34px; letter-spacing:5px; text-transform:uppercase">What is different</p>
    <div class="row" data-d="0.15">
      <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
      <span><span class="txt">Published pricing</span><span class="sub">for every service, before you enquire</span></span>
    </div>
    <div class="row" data-d="0.35">
      <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
      <span><span class="txt">12 free checks</span><span class="sub">that run on your real site, not a demo</span></span>
    </div>
    <div class="row" data-d="0.55">
      <span class="tick"><svg viewBox="0 0 24 24" fill="none" stroke="#4ECDC4" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>
      <span><span class="txt">Every statistic sourced</span><span class="sub">named, dated, and checkable</span></span>
    </div>
  </div>

  <!-- S5 tools -->
  <div class="scene" id="s5">
    <h2 data-d="0">Run a free check<br>on <span class="teal">your own site.</span></h2>
    <div class="bars" id="bars">
      <div class="bar"><i></i></div>
      <div class="bar"><i></i></div>
      <div class="bar"><i></i></div>
    </div>
    <p class="muted" data-d="0.5" style="margin-top:48px">An 11-signal on-page audit, your real<br>mobile speed, and where the funnel leaks.</p>
  </div>

  <!-- S6 CTA -->
  <div class="scene" id="s6" style="justify-content:center">
    <div class="big" data-d="0" style="font-size:104px">clicknlikes<span class="teal">.com</span></div>
    <div class="rule" data-d="0.2" id="rule2" style="width:0"></div>
    <p class="muted" data-d="0.35" style="margin-top:44px; font-size:38px">Full-stack organic growth.<br>Ahmedabad &rarr; worldwide.</p>
  </div>
</div>

<script>
// ---- deterministic timeline -------------------------------------------------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeOutQuint = (p) => 1 - Math.pow(1 - p, 5);
// 0 before start, eases to 1 over dur.
const ramp = (t, start, dur) => easeOut(clamp((t - start) / dur, 0, 1));

const SCENES = [
  { id: 's1', in: 0.0,  out: 3.4 },
  { id: 's2', in: 3.4,  out: 7.0 },
  { id: 's3', in: 7.0,  out: 10.6 },
  { id: 's4', in: 10.6, out: 15.4 },
  { id: 's5', in: 15.4, out: 18.0 },
  { id: 's6', in: 18.0, out: 20.0 },
];

// Drifting dot field, positions derived from t so it never desyncs.
const DOTS = Array.from({ length: 26 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 1080, y: r(2) * 1920, s: 4 + r(3) * 9, sp: 8 + r(4) * 26, o: 0.14 + r(5) * 0.5 };
});
const dotEls = DOTS.map((d) => {
  const el = document.createElement('div');
  el.className = 'dot';
  el.style.width = el.style.height = d.s + 'px';
  el.style.opacity = d.o;
  document.getElementById('dots').appendChild(el);
  return el;
});

window.setT = (t) => {
  // Background drift.
  document.getElementById('grid').style.transform =
    'translate(' + (-t * 6).toFixed(2) + 'px,' + (-t * 9).toFixed(2) + 'px)';
  dotEls.forEach((el, i) => {
    const d = DOTS[i];
    const y = ((d.y - t * d.sp) % 2020 + 2020) % 2020 - 50;
    el.style.transform = 'translate(' + d.x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  });

  // Wordmark: fades up once, stays.
  document.getElementById('wm').style.opacity = (0.28 + 0.5 * ramp(t, 0.2, 0.8)).toFixed(3);

  SCENES.forEach((s) => {
    const el = document.getElementById(s.id);
    const local = t - s.in;
    const live = t >= s.in - 0.6 && t < s.out;
    el.style.display = live ? 'flex' : 'none';
    if (!live) return;

    // Scene-level fade out over the last 0.42s.
    const outP = clamp((t - (s.out - 0.42)) / 0.42, 0, 1);
    el.style.opacity = String(1 - outP);
    el.style.transform = 'translateY(' + (-outP * 42).toFixed(2) + 'px)';

    // Per-element entrance, staggered by data-d.
    el.querySelectorAll('[data-d]').forEach((c) => {
      const p = ramp(local, Number(c.dataset.d), 0.62);
      c.style.opacity = p.toFixed(3);
      c.style.transform = 'translateY(' + ((1 - p) * 46).toFixed(2) + 'px)';
    });
  });

  // Strike-through sweeps across "their prices".
  const sp = easeOutQuint(clamp((t - 1.55) / 0.55, 0, 1));
  document.getElementById('strike').style.width = (sp * 100) + '%';

  // Underline rules sweep in.
  document.getElementById('rule').style.width = (easeOut(clamp((t - 7.55) / 0.7, 0, 1)) * 62) + '%';
  document.getElementById('rule2').style.width = (easeOut(clamp((t - 18.35) / 0.7, 0, 1)) * 62) + '%';

  // Audit bars fill at their own pace, like a scan running.
  const fills = [[15.75, 0.86], [15.95, 0.64], [16.15, 0.93]];
  document.querySelectorAll('#bars i').forEach((el, i) => {
    const [st, target] = fills[i];
    el.style.width = (easeOut(clamp((t - st) / 1.15, 0, 1)) * target * 100).toFixed(1) + '%';
  });
};
window.setT(0);
</script>
</body></html>`;

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: SCALE,
});
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

if (STILL !== null) {
  await page.evaluate((t) => window.setT(t), STILL);
  await page.waitForTimeout(60);
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('wrote still', OUT, 'at t =', STILL);
  process.exit(0);
}

const FRAMES = join(dirname(OUT), '.reel-frames');
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

const total = Math.round(DURATION * FPS);
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await page.evaluate((tt) => window.setT(tt), t);
  await page.screenshot({
    path: join(FRAMES, `f${String(i).padStart(5, '0')}.jpg`),
    type: 'jpeg',
    quality: 94,
  });
  if (i % 60 === 0) console.log(`  frame ${i}/${total}  (t=${t.toFixed(1)}s)`);
}
await browser.close();

if (!existsSync(FFMPEG)) {
  console.error('ffmpeg not found at', FFMPEG, '- pass --ffmpeg=/path/to/ffmpeg');
  process.exit(1);
}
execFileSync(
  FFMPEG,
  ['-y', '-framerate', String(FPS), '-i', join(FRAMES, 'f%05d.jpg'),
   '-c:v', 'libx264', '-preset', 'slow', '-crf', '20',
   '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT],
  { stdio: ['ignore', 'ignore', 'inherit'] }
);
rmSync(FRAMES, { recursive: true, force: true });
console.log('wrote', OUT);
