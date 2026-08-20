// 9:16 explainer reel for the /growth/ landing page: what we provide, how we
// help, where to go next.
//
// Format note. This follows the "letterboxed product-demo" pattern that does
// well on Meta right now: a fixed brand-and-hook header that never moves, a
// light stage in the middle where real UI cards fly in behind kinetic
// typography, and no voiceover at all - the type carries the message and the
// music carries the energy. That last part is deliberate. `docs/reels/
// reel-scripts.md` rules out synthetic voice for this brand, and a silent
// kinetic cut sidesteps the question entirely while staying honest.
//
// One important deviation from the reference format. Reels built this way are
// usually selling software, so every beat can show the product doing the work.
// Click.n.likes is a service business with no product UI, and inventing one
// would be exactly the kind of quiet dishonesty the brand positioning cannot
// afford. So every card on the stage is a real capture of something that
// genuinely exists and is publicly checkable: the published pricing table, the
// free tools grid, the six service cards, the five-step process, and a real
// client's numbers. Nothing here is a mockup.
//
// Three fixed zones, so type can never collide with artwork:
//   0    - 660   navy header: logo lockup + the two-line hook
//   660  - 1420  light stage: kinetic copy band on top, artwork band beneath
//   1420 - 1920  navy footer, deliberately empty (Reels UI covers it anyway)
//
//   node scripts/gen-reel-growth.mjs --shots=/path/to/shots --out=/path/reel.mp4
//   node scripts/gen-reel-growth.mjs --shots=... --still=14.5 --out=/tmp/f.png
//
// Needs an ffmpeg with libx264 (Playwright's bundled build is VP8 only).
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);
const FPS = Number(args.fps || 30);
const DURATION = Number(args.duration || 60);
const SHOTS = args.shots;
const OUT = args.out || resolve(ROOT, '../reel-growth.mp4');
const STILL = args.still ? Number(args.still) : null;
const FFMPEG = args.ffmpeg || 'ffmpeg';

if (!SHOTS || !existsSync(SHOTS)) {
  console.error('--shots=<dir of captures from scripts/capture-growth-shots.mjs> is required');
  process.exit(1);
}

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const shot = (n) => {
  const p = join(SHOTS, n + '.png');
  if (!existsSync(p)) { console.error('missing capture:', p); process.exit(1); }
  return readFileSync(p).toString('base64');
};

const gro700 = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dm500 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
const dm700 = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-700-normal.woff2');
const logo = b64('public/logo-wordmark.png');

// Every capture used on the stage. Keys match the `art` field on a beat.
// Each capture carries its own stage width. A wide stat strip and a tall form
// card cannot share one number without one of them looking wrong.
const ART_W = {
  services: 940, 'how-it-works': 980, 'kopa-stats': 1000, 'pricing-tiers': 980,
  'tools-grid': 900, 'growth-form': 520, 'growth-hero': 950, 'sound-familiar': 800,
  'plan-builder': 880, 'before-after': 940, 'tools-channel': 900, 'kopa-hero': 900,
};
const ART = Object.keys(ART_W);

// ---------------------------------------------------------------------------
// The timeline.
//
// `copy` lines reveal one at a time (data-d is the delay in seconds from the
// beat's start). `hi` marks the teal-highlighted phrase. `art` names the hero
// capture for the beat; `scatter` names the small cards that drift in behind
// it, so the stage never looks empty the way a single centred card does.
// ---------------------------------------------------------------------------
const BEATS = [
  { in: 0.0,  out: 4.2,  copy: [['Most agencies', 0], ['sell you a service.', 0.55]],
    scatter: ['pricing-tiers', 'tools-grid', 'services'] },

  { in: 4.2,  out: 8.6,  copy: [['We start with', 0], ['the problem.', 0.5, true]],
    art: 'sound-familiar' },

  { in: 8.6,  out: 13.0, brand: true,
    copy: [['Full-stack organic growth.', 0.75]],
    scatter: ['kopa-stats', 'how-it-works', 'growth-form'] },

  { in: 13.0, out: 18.4, copy: [['Everything your', 0], ['marketing needs.', 0.45, true]],
    art: 'services' },

  { in: 18.4, out: 23.0, copy: [['SEO.', 0], ['AI Search.', 0.32], ['Content.', 0.64]],
    art: 'tools-channel' },

  { in: 23.0, out: 27.4, copy: [['Social.', 0], ['Websites.', 0.32], ['Paid.', 0.64]],
    art: 'plan-builder' },

  { in: 27.4, out: 32.6, copy: [['We find the leak', 0], ['before we fix it.', 0.45, true]],
    art: 'how-it-works' },

  { in: 32.6, out: 37.0, copy: [['Diagnose. Prioritise.', 0], ['Execute. Measure.', 0.4]],
    art: 'before-after' },

  { in: 37.0, out: 42.4, copy: [['A Mumbai manufacturer', 0], ['nobody could find.', 0.45]],
    art: 'kopa-hero' },

  { in: 42.4, out: 47.6, copy: [['71% of their leads', 0, true], ['now come from search.', 0.45]],
    art: 'kopa-stats' },

  { in: 47.6, out: 52.4, copy: [['Every price,', 0], ['published.', 0.42, true]],
    art: 'pricing-tiers' },

  { in: 52.4, out: 56.6, copy: [['14 free checks.', 0], ['On your real site.', 0.42]],
    art: 'tools-grid' },

  { in: 56.6, out: 60.0, cta: true,
    copy: [['Tell us what’s not working.', 0], ['clicknlikes.com/growth', 0.5, true]],
    art: 'growth-form' },
];

// Scatter card geometry, reused by every beat that asks for one. Fixed rather
// than random so a re-render is byte-identical to the last one.
const SCATTER = [
  { x: -300, y: -170, w: 430, rot: -7,  d: 0.10 },
  { x: 305,  y: -120, w: 400, rot: 6,   d: 0.24 },
  { x: -170, y: 205,  w: 460, rot: 4,   d: 0.38 },
];

const artNodes = ART.map(
  (k) => `<img id="art-${k}" class="art" src="data:image/png;base64,${shot(k)}">`
).join('\n');
const scatterNodes = [0, 1, 2].map((i) => `<img id="sc${i}" class="scat">`).join('\n');

const beatNodes = BEATS.map((b, i) => {
  const lines = b.copy
    .map(([t, d, hi]) => `<div class="ln${hi ? ' hi' : ''}" data-d="${d}">${t}</div>`)
    .join('');
  const brand = b.brand
    ? `<img class="bigmark" src="data:image/png;base64,${logo}" data-d="0.1">`
    : '';
  return `<div class="beat" id="b${i}">${brand}${lines}</div>`;
}).join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Space Grotesk';font-weight:700;src:url(data:font/woff2;base64,${gro700}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:500;src:url(data:font/woff2;base64,${dm500}) format('woff2')}
@font-face{font-family:'DM Sans';font-weight:700;src:url(data:font/woff2;base64,${dm700}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#12203a}
#stage{position:relative;width:1080px;height:1920px;overflow:hidden;
  font-family:'DM Sans',sans-serif;
  background:linear-gradient(168deg,#16274300%,#1A2B4A 45%,#101d33 100%)}

/* ---- header: brand lockup + the hook that never moves ---- */
#lockup{position:absolute;left:64px;top:252px;display:flex;align-items:center;gap:20px}
#lockup img{height:60px;display:block}
#lockup .hd{font-size:28px;color:rgba(255,255,255,0.50);letter-spacing:0.3px;
  padding-left:20px;border-left:2px solid rgba(255,255,255,0.18)}
#hook{position:absolute;left:64px;right:64px;top:404px;
  font-family:'Space Grotesk';font-weight:700;font-size:64px;line-height:1.16;
  color:#fff;letter-spacing:-1.4px}
#hook b{color:#4ECDC4;font-weight:700}

/* ---- stage ---- */
#panel{position:absolute;left:0;top:660px;width:1080px;height:850px;
  background:#F7F7F7;overflow:hidden}
#panelGlow{position:absolute;inset:0;
  background:radial-gradient(58% 46% at 50% 42%,rgba(78,205,196,0.16),transparent 70%)}

/* copy band sits above the artwork band; both are clipped, so they can never
   overlap however large a capture is */
#copyBand{position:absolute;left:0;top:660px;width:1080px;height:278px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;z-index:4;
  padding:0 70px}
.beat{display:none;flex-direction:column;align-items:center;gap:6px;text-align:center}
.ln{font-family:'Space Grotesk';font-weight:700;font-size:62px;line-height:1.12;
  color:#1A2B4A;letter-spacing:-1.2px;white-space:nowrap}
.ln.hi{color:#33A79F}
.bigmark{height:62px;margin-bottom:14px}

#artBand{position:absolute;left:0;top:930px;width:1080px;height:512px;overflow:hidden;z-index:3}
.art{position:absolute;left:50%;top:50%;display:none;
  border-radius:20px;
  box-shadow:0 30px 78px rgba(26,43,74,0.26),0 0 0 1px rgba(26,43,74,0.08)}
.scat{position:absolute;left:50%;top:50%;display:none;border-radius:16px;
  box-shadow:0 18px 46px rgba(26,43,74,0.18),0 0 0 1px rgba(26,43,74,0.06);
  opacity:0.9}

/* CTA pill, only on the last beat */
#cta{position:absolute;left:50%;top:1576px;transform:translateX(-50%);white-space:nowrap;
  display:flex;align-items:center;gap:16px;opacity:0;
  background:#4ECDC4;color:#0f2038;border-radius:999px;padding:26px 54px;
  font-family:'Space Grotesk';font-weight:700;font-size:38px;letter-spacing:-0.5px;
  box-shadow:0 20px 50px rgba(78,205,196,0.30)}

#flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:9;pointer-events:none}
#wm{position:absolute;left:0;right:0;bottom:132px;text-align:center;
  font-size:30px;color:rgba(255,255,255,0.40);letter-spacing:2px;z-index:5}
</style></head><body>
<div id="stage">
  <div id="lockup">
    <img src="data:image/png;base64,${logo}">
    <div class="hd">clicknlikes.com</div>
  </div>
  <div id="hook">Your Marketing Isn’t Broken.<br><b>One Part Of It Is.</b></div>

  <div id="panel"><div id="panelGlow"></div></div>
  <div id="artBand">
    ${artNodes}
    ${scatterNodes}
  </div>
  <div id="copyBand">
    ${beatNodes}
  </div>
  <div id="cta">Run the free Growth Scan</div>
  <div id="wm">AHMEDABAD &middot; MUMBAI &middot; WORLDWIDE</div>
  <div id="flash"></div>
</div>
<script>
const B=${JSON.stringify(
  BEATS.map((b, i) => ({ i, in: b.in, out: b.out, art: b.art || null, scatter: b.scatter || null, cta: !!b.cta }))
)};
const SC=${JSON.stringify(SCATTER)};
const ARTK=${JSON.stringify(ART)};
const ARTW=${JSON.stringify(ART_W)};
const el=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const easeOut=t=>1-Math.pow(1-t,3);
const back=t=>{const c=1.70158,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
const ramp=(t,d,len)=>easeOut(clamp((t-d)/len,0,1));

// Cache the natural size of every capture so a scatter card keeps its aspect.
const NAT={};
ARTK.forEach(k=>{const e=el('art-'+k);NAT[k]=[e.naturalWidth||1200,e.naturalHeight||800];});

window.setT=(t)=>{
  const cur=B.find(s=>t>=s.in&&t<s.out)||B[B.length-1];
  const local=t-cur.in, len=cur.out-cur.in, p=clamp(local/len,0,1);
  const inP=clamp(local/0.50,0,1);
  const outP=clamp((t-(cur.out-0.26))/0.26,0,1);

  // Copy: only the live beat, each line punching up on its own delay.
  B.forEach(s=>{
    const e=el('b'+s.i); if(!e) return;
    const live=(s===cur);
    e.style.display=live?'flex':'none';
    if(!live) return;
    e.style.opacity=String(1-outP);
    e.querySelectorAll('[data-d]').forEach(c=>{
      const q=ramp(local,Number(c.dataset.d),0.44);
      c.style.opacity=q.toFixed(3);
      c.style.transform='translateY('+((1-q)*40).toFixed(1)+'px)';
    });
  });

  // Hero artwork: slams in with a small overshoot, then drifts so the hold
  // never looks frozen.
  ARTK.forEach(k=>{
    const e=el('art-'+k);
    const live=(cur.art===k);
    e.style.display=live?'block':'none';
    if(!live) return;
    const w=ARTW[k]; e.style.width=w+'px';
    e.style.marginLeft=(-w/2)+'px';
    e.style.marginTop=(-(w*NAT[k][1]/NAT[k][0])/2)+'px';
    const s=0.88+0.12*back(inP);
    const rot=(1-inP)*-5;
    const drift=-p*18;
    e.style.transform='translateY('+(drift+(1-inP)*120).toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg) scale('+(s*(1+p*0.025)).toFixed(4)+')';
    e.style.opacity=(inP*(1-outP)).toFixed(3);
  });

  // Scatter cards drift in behind, staggered.
  SC.forEach((g,i)=>{
    const e=el('sc'+i);
    const key=cur.scatter?cur.scatter[i]:null;
    if(!key){e.style.display='none';return;}
    const src=el('art-'+key).src;
    if(e.src!==src) e.src=src;
    e.style.display='block';
    const nat=NAT[key], h=g.w*nat[1]/nat[0];
    e.style.width=g.w+'px';
    const q=ramp(local,g.d,0.62);
    const y=g.y-g.w*0+(1-q)*90-p*14;
    e.style.marginLeft=(-g.w/2)+'px';
    e.style.marginTop=(-h/2)+'px';
    e.style.transform='translate('+g.x+'px,'+y.toFixed(1)+'px) rotate('+g.rot+'deg) scale('+(0.92+0.08*q).toFixed(3)+')';
    e.style.opacity=(q*0.92*(1-outP)).toFixed(3);
  });

  // CTA pill rides in under the panel on the closing beat only.
  const cq=cur.cta?ramp(local,0.85,0.5):0;
  el('cta').style.opacity=cq.toFixed(3);
  el('cta').style.transform='translateX(-50%) translateY('+((1-cq)*40).toFixed(1)+'px)';

  el('wm').style.opacity=(0.42*ramp(t,1.2,0.8)).toFixed(3);

  // A short white flash on every cut, so the beats read as edits.
  const f=B.reduce((acc,s)=>Math.max(acc,s.in===0?0:(1-clamp(Math.abs(t-s.in)/0.13,0,1))),0);
  el('flash').style.opacity=(f*0.30).toFixed(3);
};
window.setT(0);
</script>
</body></html>`;

const pageFile = join(SHOTS, '_reel-growth.html');
writeFileSync(pageFile, html);

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

if (STILL !== null) {
  await page.evaluate((t) => window.setT(t), STILL);
  await page.waitForTimeout(90);
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('wrote still', OUT, 'at t =', STILL);
  process.exit(0);
}

const FRAMES = join(dirname(OUT), '.reel-frames-growth');
rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });
const total = Math.round(DURATION * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((tt) => window.setT(tt), i / FPS);
  await page.screenshot({ path: join(FRAMES, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
  if (i % 150 === 0) console.log(`  frame ${i}/${total}`);
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
