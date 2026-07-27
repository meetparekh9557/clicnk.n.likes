// High-energy 9:16 launch reel: real UI, lifted out of the page.
//
// The sibling script (gen-reel.mjs) is the calm, typographic cut. This one is
// the scroll-stopper. Two deliberate design rules:
//
// 1. NO LONG SCROLLS. A page scrolling past is something a viewer waits
//    through. Each beat instead slams in one real card — the tier row, the
//    plan total, the tools grid, the health score — and holds it about two
//    seconds, so the eye lands on a thing rather than tracking a moving wall.
//
// 2. TWO FIXED ZONES, so type can never collide with artwork: all copy lives
//    in a 470px band under the logo, all artwork in a separate band starting
//    50px below it. Both containers are fixed-height and clipped, so artwork
//    that grows simply crops at the band edge — overlap is structurally
//    impossible rather than something to re-check by eye every render.
//
// Artwork comes from real captures of the built site, so the reel cannot show
// a version of the site that does not exist. Capture into one folder:
// home.png (full-page, 430px wide) plus the element crops c-score, c-tiers,
// c-plan, c-tools and c-article.
//
//   node scripts/gen-reel-hype.mjs --shots=/path/to/shots --out=/path/reel.mp4
//   node scripts/gen-reel-hype.mjs --shots=… --still=7.2 --out=/tmp/f.png
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
const DURATION = Number(args.duration || 18);
const SHOTS = args.shots;
const OUT = args.out || resolve(ROOT, '../reel-hype.mp4');
const STILL = args.still ? Number(args.still) : null;
const FFMPEG =
  args.ffmpeg ||
  '/tmp/claude-0/-home-user-clicnk-n-likes/180512ee-5346-5a14-9703-a26cea5b6962/scratchpad/node_modules/ffmpeg-static/ffmpeg';

if (!SHOTS || !existsSync(SHOTS)) {
  console.error('--shots=<dir with home.png + c-score/c-tiers/c-plan/c-tools/c-article.png> is required');
  process.exit(1);
}

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dmsans = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');
// The real mark, not a font impression of it. Transparent PNG, so it sits on
// the navy without a plate behind it.
const logo = b64('public/logo-wordmark.png');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Space Grotesk'; font-weight:700; src:url(data:font/woff2;base64,${grotesk}) format('woff2'); }
@font-face { font-family:'DM Sans'; font-weight:500; src:url(data:font/woff2;base64,${dmsans}) format('woff2'); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0b1730; }
#stage { position:relative; width:1080px; height:1920px; overflow:hidden; color:#fff;
  font-family:'DM Sans', sans-serif;
  background:
    radial-gradient(65% 40% at 80% 10%, rgba(78,205,196,0.30), transparent 62%),
    radial-gradient(55% 38% at 10% 90%, rgba(255,71,87,0.18), transparent 62%),
    linear-gradient(165deg, #14243e 0%, #1A2B4A 50%, #0d1a30 100%); }
.grid { position:absolute; inset:-140px; opacity:0.5;
  background-image:linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size:88px 88px; }
#halo { position:absolute; left:50%; top:1200px; width:1500px; height:1500px; margin:-750px 0 0 -750px;
  border-radius:50%; opacity:0.45;
  background:conic-gradient(from 0deg, rgba(78,205,196,0.32), rgba(255,71,87,0.16), rgba(78,205,196,0.32));
  filter:blur(130px); }
.dot { position:absolute; border-radius:50%; background:#4ECDC4; }

/* ---- Zone 1: the mark. ---- */
.wm { position:absolute; top:78px; left:74px; width:276px; display:block;
  filter:drop-shadow(0 8px 26px rgba(5,12,25,0.85)); }

/* ---- Zone 2: copy. Fixed height and clipped, so it cannot reach the art. ---- */
#type { position:absolute; top:186px; left:74px; right:74px; height:470px; overflow:hidden; }
/* Copy sits at the BOTTOM of its band and art at the TOP of its own, so the
   gap between them is a constant 50px whatever the beat contains. */
.beat { position:absolute; inset:0; display:flex; flex-direction:column; justify-content:flex-end; }
.kick { font-family:'DM Sans'; font-weight:500; font-size:30px; letter-spacing:6px;
  text-transform:uppercase; color:rgba(255,255,255,0.66); }
.mid { font-family:'Space Grotesk'; font-weight:700; font-size:82px; line-height:1.0;
  letter-spacing:-2.4px; margin-top:16px; text-shadow:0 14px 50px rgba(5,12,25,0.85); }
.sub { font-family:'DM Sans'; font-weight:500; font-size:31px; line-height:1.35;
  color:rgba(255,255,255,0.72); margin-top:20px; }
.teal { color:#4ECDC4; }
.tchip { display:inline-block; margin-top:26px; padding:14px 30px; border-radius:999px;
  background:rgba(78,205,196,0.16); border:2.5px solid #4ECDC4; color:#4ECDC4;
  font-family:'Space Grotesk'; font-weight:700; font-size:44px; letter-spacing:-0.5px; }

/* ---- Zone 3: artwork. Also fixed and clipped. ---- */
#art { position:absolute; top:706px; left:0; right:0; height:1090px; overflow:hidden; }
.card { position:absolute; left:50%; top:50%; display:block;
  border-radius:28px; box-shadow:0 50px 120px rgba(0,0,0,0.55), 0 0 0 2px rgba(78,205,196,0.30);
  will-change:transform, opacity; }
#phoneWrap { position:absolute; left:50%; top:50%; width:520px; height:1030px;
  margin:-515px 0 0 -260px; will-change:transform, opacity; }
#phone { position:absolute; inset:0; border-radius:62px; border:11px solid #08111f;
  overflow:hidden; background:#fff;
  box-shadow:0 50px 120px rgba(0,0,0,0.6), 0 0 0 3px rgba(78,205,196,0.35), 0 0 110px rgba(78,205,196,0.22); }
#phone img { position:absolute; left:0; top:0; width:100%; }

/* ---- Full-screen beats (open and close), outside both zones. ---- */
.full { position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; padding:0 80px; text-align:center; }
.logoBig { width:840px; display:block; filter:drop-shadow(0 22px 70px rgba(5,12,25,0.9)); }
.chip { display:inline-block; margin-top:46px; padding:18px 44px; border-radius:999px; background:#FF4757;
  font-family:'Space Grotesk'; font-weight:700; font-size:46px; letter-spacing:2px; }
.url { font-family:'Space Grotesk'; font-weight:700; font-size:92px; letter-spacing:-2.6px; margin-top:38px; }
#flash { position:absolute; inset:0; background:#eafffd; opacity:0; pointer-events:none; }
</style></head><body>
<div id="stage">
  <div class="grid" id="grid"></div>
  <div id="halo"></div>
  <div id="dots"></div>

  <img class="wm" id="wm" src="data:image/png;base64,${logo}">

  <div id="type">
    <div class="beat" id="b2"><div class="kick" data-d="0">The new site</div><div class="mid" data-d="0.08">Judge us <span class="teal">before</span><br>you talk to us.</div></div>
    <div class="beat" id="b3"><div class="kick" data-d="0">Pricing</div><div class="mid" data-d="0.08">Every price,<br><span class="teal">published.</span></div></div>
    <div class="beat" id="b4"><div class="kick" data-d="0">The maths</div><div class="mid" data-d="0.08">Out in the open.</div><div data-d="0.2"><span class="tchip" id="counter">₹0 / mo</span></div></div>
    <div class="beat" id="b5"><div class="kick" data-d="0">Free</div><div class="mid" data-d="0.08"><span class="teal">12 checks</span><br>on your real site.</div></div>
    <div class="beat" id="b6"><div class="kick" data-d="0">Live scan</div><div class="mid" data-d="0.08">11 signals,<br><span class="teal">checked live.</span></div></div>
    <div class="beat" id="b7"><div class="kick" data-d="0">Insights</div><div class="mid" data-d="0.08">Every number<br><span class="teal">sourced.</span></div></div>
  </div>

  <div id="art">
    <div id="phoneWrap"><div id="phone"><img src="home.png"></div></div>
    <img class="card" id="a3" src="c-tiers.png"   style="width:1010px">
    <img class="card" id="a4" src="c-plan.png"    style="width:930px">
    <img class="card" id="a5" src="c-tools.png"   style="width:980px">
    <img class="card" id="a6" src="c-score.png"   style="width:1010px">
    <img class="card" id="a7" src="c-article.png" style="width:640px">
  </div>

  <div class="full" id="b1">
    <img class="logoBig" data-d="0" src="data:image/png;base64,${logo}">
    <div data-d="0.18"><span class="chip">IS LIVE</span></div>
  </div>

  <div class="full" id="b8">
    <img class="logoBig" data-d="0" style="width:700px" src="data:image/png;base64,${logo}">
    <div class="url" data-d="0.16">clicknlikes<span class="teal">.com</span></div>
    <p class="sub" data-d="0.3" style="font-size:34px">Full-stack organic growth.<br>Ahmedabad &rarr; worldwide.</p>
  </div>

  <div id="flash"></div>
</div>

<script>
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const easeOut=p=>1-Math.pow(1-p,3);
const easeQuint=p=>1-Math.pow(1-p,5);
// Slight overshoot: the card arrives, passes its mark, snaps back. That bounce
// is most of what makes a cut read as energetic rather than merely fast.
const back=p=>{const c=1.9;const q=p-1;return 1+(c+1)*q*q*q+c*q*q;};
const ramp=(t,s,d)=>easeQuint(clamp((t-s)/d,0,1));

// Every beat holds one idea for about two seconds. art:null = full-screen beat.
const B=[
  { id:'b1', art:null,    in:0.0,  out:2.4, full:true },
  { id:'b2', art:'phone', in:2.4,  out:4.6 },
  { id:'b3', art:'a3',    in:4.6,  out:6.8 },
  { id:'b4', art:'a4',    in:6.8,  out:9.0 },
  { id:'b5', art:'a5',    in:9.0,  out:11.2 },
  { id:'b6', art:'a6',    in:11.2, out:13.2 },
  { id:'b7', art:'a7',    in:13.2, out:15.2 },
  { id:'b8', art:null,    in:15.2, out:18.0, full:true },
];
const ARTS=['phone','a3','a4','a5','a6','a7'];

const DOTS=Array.from({length:24},(_,i)=>{
  const r=n=>((Math.sin(i*12.9898+n*78.233)*43758.5453)%1+1)%1;
  return {x:r(1)*1080,y:r(2)*1920,s:4+r(3)*10,sp:16+r(4)*40,o:0.12+r(5)*0.45};
});
const dotEls=DOTS.map(d=>{const e=document.createElement('div');e.className='dot';
  e.style.width=e.style.height=d.s+'px';e.style.opacity=d.o;
  document.getElementById('dots').appendChild(e);return e;});

const el=id=>document.getElementById(id);

window.setT=(t)=>{
  el('grid').style.transform='translate('+(-t*10).toFixed(2)+'px,'+(-t*15).toFixed(2)+'px)';
  el('halo').style.transform='rotate('+(t*26).toFixed(2)+'deg)';
  dotEls.forEach((e,i)=>{const d=DOTS[i];
    const y=((d.y-t*d.sp)%2020+2020)%2020-50;
    e.style.transform='translate('+d.x.toFixed(1)+'px,'+y.toFixed(1)+'px)';});

  const cur=B.find(s=>t>=s.in&&t<s.out)||B[B.length-1];
  const local=t-cur.in, len=cur.out-cur.in, p=clamp(local/len,0,1);
  const inP=clamp(local/0.52,0,1);
  const outP=clamp((t-(cur.out-0.26))/0.26,0,1);

  // Copy: only the live beat, punching up. Full-screen beats clear the band.
  B.forEach(s=>{
    const e=el(s.id); if(!e) return;
    const live=(s===cur);
    e.style.display=live?'flex':'none';
    if(!live) return;
    e.style.opacity=String(1-outP);
    e.querySelectorAll('[data-d]').forEach(c=>{
      const q=ramp(local, Number(c.dataset.d), 0.46);
      c.style.opacity=q.toFixed(3);
      c.style.transform='translateY('+((1-q)*44).toFixed(1)+'px) scale('+(1+(1-q)*0.10).toFixed(4)+')';
    });
  });

  // Artwork: one card on screen, slamming in with a small overshoot, then a
  // slow drift so the hold never feels frozen.
  ARTS.forEach(k=>{
    const e=k==='phone'?el('phoneWrap'):el(k);
    const live=(cur.art===k);
    e.style.display=live?'block':'none';
    if(!live) return;
    const s=0.86+0.14*back(inP);
    const rot=(1-inP)*-7;
    const drift=-p*24;
    const base=k==='phone'?'':'translate(-50%,-50%) ';
    e.style.transform=base+'translateY('+(drift+(1-inP)*150).toFixed(1)+'px) rotate('+rot.toFixed(2)+'deg) scale('+(s*(1+p*0.03)).toFixed(4)+')';
    e.style.opacity=(inP*(1-outP)).toFixed(3);
  });

  // Corner mark hides while a full-screen logo is up — two of the same mark at
  // once reads as a mistake.
  el('wm').style.opacity=(cur.full?0:0.92*ramp(t,2.45,0.45)).toFixed(3);

  // Flash on every cut.
  const f=B.reduce((acc,s)=>Math.max(acc, s.in===0?0:(1-clamp(Math.abs(t-s.in)/0.14,0,1))),0);
  el('flash').style.opacity=(f*0.42).toFixed(3);

  // Counter runs to the real published entry tier.
  const cp=easeOut(clamp((t-7.05)/0.8,0,1));
  el('counter').textContent='₹'+(Math.round(cp*16000/100)*100).toLocaleString('en-IN')+' / mo';
};
window.setT(0);
</script>
</body></html>`;

const pageFile = join(SHOTS, '_reel-hype.html');
writeFileSync(pageFile, html);

const pw = await import('/opt/node22/lib/node_modules/playwright/index.js').then((m) => m.default || m);
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(pageFile).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

if (STILL !== null) {
  await page.evaluate((t) => window.setT(t), STILL);
  await page.waitForTimeout(80);
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('wrote still', OUT, 'at t =', STILL);
  process.exit(0);
}

const FRAMES = join(dirname(OUT), '.reel-frames-hype');
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
