// High-energy 9:16 launch reel: the real website, scrolling inside a phone.
//
// The sibling script (gen-reel.mjs) is the calm, typographic cut. This one is
// the scroll-stopper: hard cuts on a beat, kinetic type that punches in, and
// actual screens from the built site rather than a description of them. For a
// website launch that difference is the whole point — people believe a site
// they can see moving.
//
// It renders from real full-page captures, so it can never show a version of
// the site that does not exist. Capture them first (any 430px-wide full-page
// screenshots named home/pricing/tools/insights.png in one folder), then:
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
  console.error('--shots=<dir with home.png, pricing.png, tools.png, insights.png> is required');
  process.exit(1);
}

const b64 = (p) => readFileSync(resolve(ROOT, p)).toString('base64');
const grotesk = b64('node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2');
const dmsans = b64('node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family:'Space Grotesk'; font-weight:700; src:url(data:font/woff2;base64,${grotesk}) format('woff2'); }
@font-face { font-family:'DM Sans'; font-weight:500; src:url(data:font/woff2;base64,${dmsans}) format('woff2'); }
* { margin:0; padding:0; box-sizing:border-box; }
html, body { width:1080px; height:1920px; overflow:hidden; background:#0b1730; }
#stage { position:relative; width:1080px; height:1920px; overflow:hidden; color:#fff;
  font-family:'DM Sans', sans-serif;
  background:
    radial-gradient(70% 45% at 78% 12%, rgba(78,205,196,0.26), transparent 62%),
    radial-gradient(60% 40% at 12% 88%, rgba(255,71,87,0.16), transparent 62%),
    linear-gradient(165deg, #14243e 0%, #1A2B4A 50%, #0d1a30 100%); }
.grid { position:absolute; inset:-120px; opacity:0.5;
  background-image:linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size:88px 88px; }
.dot { position:absolute; border-radius:50%; background:#4ECDC4; }

/* Phone */
/* Sits below the type block: overlapping headline and screen reads as a
   mistake, not a layer. */
#phoneWrap { position:absolute; left:50%; top:640px; width:600px; height:1180px;
  margin:0 0 0 -300px; will-change:transform, opacity; }
#phone { position:absolute; inset:0; border-radius:74px; border:12px solid #08111f;
  overflow:hidden; background:#fff;
  box-shadow:0 60px 140px rgba(0,0,0,0.55), 0 0 0 3px rgba(78,205,196,0.35), 0 0 120px rgba(78,205,196,0.20); }
#phone img { position:absolute; left:0; top:0; width:100%; display:none; }
#phone img.on { display:block; }
#glare { position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(115deg, rgba(255,255,255,0.07) 0%, transparent 30%, transparent 72%, rgba(78,205,196,0.09) 100%); }
#notch { position:absolute; top:26px; left:50%; transform:translateX(-50%); width:190px; height:34px;
  border-radius:999px; background:#08111f; }

/* Type layers */
.lay { position:absolute; left:70px; right:70px; will-change:transform, opacity; }
.kick { font-family:'DM Sans'; font-weight:500; font-size:32px; letter-spacing:6px;
  text-transform:uppercase; color:rgba(255,255,255,0.72); }
.hero { font-family:'Space Grotesk'; font-weight:700; font-size:118px; line-height:0.94;
  letter-spacing:-3.4px; text-shadow:0 14px 60px rgba(5,12,25,0.75); }
.mid { font-family:'Space Grotesk'; font-weight:700; font-size:74px; line-height:1.02;
  letter-spacing:-2px; text-shadow:0 12px 46px rgba(5,12,25,0.8); }
.sub { font-family:'DM Sans'; font-weight:500; font-size:31px; line-height:1.4;
  color:rgba(255,255,255,0.78); text-shadow:0 6px 26px rgba(5,12,25,0.85); margin-top:16px; }
.teal { color:#4ECDC4; } .coral { color:#FF4757; }
.chip { display:inline-block; padding:14px 30px; border-radius:999px; background:#FF4757;
  font-family:'Space Grotesk'; font-weight:700; font-size:38px; letter-spacing:1px; }
.tchip { display:inline-block; padding:16px 34px; border-radius:999px;
  background:rgba(78,205,196,0.16); border:2.5px solid #4ECDC4; color:#4ECDC4;
  font-family:'Space Grotesk'; font-weight:700; font-size:46px; letter-spacing:-0.5px; }
.scrim { position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(180deg, rgba(9,18,34,0.92) 0%, rgba(9,18,34,0.72) 26%, rgba(9,18,34,0) 36%, rgba(9,18,34,0) 82%, rgba(9,18,34,0.88) 100%); }
#flash { position:absolute; inset:0; background:#eafffd; opacity:0; pointer-events:none; }
.wm { position:absolute; top:74px; left:70px; font-family:'Space Grotesk'; font-weight:700;
  font-size:38px; letter-spacing:-0.6px; text-shadow:0 6px 24px rgba(5,12,25,0.8); }
.wm .t { color:#4ECDC4; }
</style></head><body>
<div id="stage">
  <div class="grid" id="grid"></div>
  <div id="dots"></div>

  <div id="phoneWrap">
    <div id="phone">
      <img id="im-home" class="on" src="home.png">
      <img id="im-pricing" src="pricing.png">
      <img id="im-tools" src="tools.png">
      <img id="im-insights" src="insights.png">
      <div id="glare"></div>
    </div>
  </div>

  <div class="scrim"></div>
  <div class="wm" id="wm">Click<span class="t">.n.</span>likes</div>

  <!-- top type -->
  <div class="lay" id="t1" style="top:150px">
    <div class="kick" data-d="0">The new</div>
    <div class="hero" data-d="0.08">clicknlikes<span class="teal">.com</span></div>
    <div style="margin-top:26px" data-d="0.2"><span class="chip">IS LIVE</span></div>
  </div>

  <div class="lay" id="t2" style="top:190px">
    <div class="mid" data-d="0">Judge us <span class="teal">before</span><br>you talk to us.</div>
  </div>

  <div class="lay" id="t3" style="top:190px">
    <div class="mid" data-d="0">Every price,<br><span class="teal">published.</span></div>
    <div style="margin-top:28px" data-d="0.18"><span class="tchip" id="counter">₹0 / mo</span></div>
  </div>

  <div class="lay" id="t4" style="top:190px">
    <div class="mid" data-d="0"><span class="teal">12 free checks.</span><br>On your real site.</div>
    <p class="sub" data-d="0.2">No demo data. No sales call first.</p>
  </div>

  <div class="lay" id="t5" style="top:190px">
    <div class="mid" data-d="0">Every number<br><span class="teal">sourced.</span></div>
    <p class="sub" data-d="0.2">Named, dated, and checkable.</p>
  </div>

  <!-- bottom CTA -->
  <div class="lay" id="t6" style="bottom:300px">
    <div class="hero" data-d="0" style="font-size:104px">clicknlikes<span class="teal">.com</span></div>
    <p class="sub" data-d="0.22" style="font-size:36px">Full-stack organic growth.<br>Ahmedabad &rarr; worldwide.</p>
  </div>

  <div id="flash"></div>
</div>

<script>
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const easeOut=p=>1-Math.pow(1-p,3);
const easeQuint=p=>1-Math.pow(1-p,5);
const ramp=(t,s,d)=>easeQuint(clamp((t-s)/d,0,1));

// Scenes: which screen is on the phone, where it scrolls, and which type layer
// is up. Cuts are hard and land on a beat — that is what makes it feel fast.
const SC=[
  { id:'t1', img:'home',     in:0.0,  out:3.3,  from:0,    to:520  },
  { id:'t2', img:'home',     in:3.3,  out:6.6,  from:1500, to:3400 },
  { id:'t3', img:'pricing',  in:6.6,  out:9.9,  from:900,  to:2500 },
  { id:'t4', img:'tools',    in:9.9,  out:13.0, from:250,  to:1750 },
  { id:'t5', img:'insights', in:13.0, out:15.4, from:350,  to:1500 },
  { id:'t6', img:'home',     in:15.4, out:18.0, from:0,    to:400  },
];
const SCALE_IMG = 600/430; // captured at 430 css px wide, shown at 600.

const DOTS=Array.from({length:22},(_,i)=>{
  const r=n=>((Math.sin(i*12.9898+n*78.233)*43758.5453)%1+1)%1;
  return {x:r(1)*1080,y:r(2)*1920,s:4+r(3)*10,sp:14+r(4)*34,o:0.12+r(5)*0.45};
});
const dotEls=DOTS.map(d=>{const e=document.createElement('div');e.className='dot';
  e.style.width=e.style.height=d.s+'px';e.style.opacity=d.o;
  document.getElementById('dots').appendChild(e);return e;});

window.setT=(t)=>{
  document.getElementById('grid').style.transform=
    'translate('+(-t*9).toFixed(2)+'px,'+(-t*13).toFixed(2)+'px)';
  dotEls.forEach((el,i)=>{const d=DOTS[i];
    const y=((d.y-t*d.sp)%2020+2020)%2020-50;
    el.style.transform='translate('+d.x.toFixed(1)+'px,'+y.toFixed(1)+'px)';});

  const cur=SC.find(s=>t>=s.in&&t<s.out)||SC[SC.length-1];
  const local=t-cur.in, len=cur.out-cur.in;

  // Screen swap + scroll.
  ['home','pricing','tools','insights'].forEach(k=>{
    document.getElementById('im-'+k).classList.toggle('on', k===cur.img);
  });
  const p=clamp(local/len,0,1);
  const y=(cur.from+(cur.to-cur.from)*easeOut(p))*SCALE_IMG;
  document.getElementById('im-'+cur.img).style.transform='translateY('+(-y).toFixed(1)+'px)';

  // Phone: punches in on the cut, then settles and drifts.
  const cut=clamp(local/0.42,0,1);
  const pop=1+0.075*(1-easeQuint(cut));
  const tilt=(-2.4+4.8*p).toFixed(2);
  const rise=(1-easeQuint(clamp(t/0.9,0,1)))*300;
  document.getElementById('phoneWrap').style.transform=
    'perspective(2400px) translateY('+(rise-p*26).toFixed(1)+'px) rotateY('+tilt+'deg) scale('+pop.toFixed(4)+')';
  document.getElementById('phoneWrap').style.opacity=clamp(t/0.5,0,1).toFixed(3);

  // Flash on every cut.
  const f=SC.reduce((acc,s)=>Math.max(acc, s.in===0?0:(1-clamp(Math.abs(t-s.in)/0.16,0,1))),0);
  document.getElementById('flash').style.opacity=(f*0.5).toFixed(3);

  document.getElementById('wm').style.opacity=(0.35+0.45*ramp(t,0.3,0.8)).toFixed(3);

  // Type layers: only the live one, punching in with a scale pop.
  SC.forEach(s=>{
    const el=document.getElementById(s.id);
    const live=t>=s.in&&t<s.out;
    el.style.display=live?'block':'none';
    if(!live) return;
    const outP=clamp((t-(s.out-0.34))/0.34,0,1);
    el.style.opacity=String(1-outP);
    el.querySelectorAll('[data-d]').forEach(c=>{
      const q=ramp(t-s.in, Number(c.dataset.d), 0.5);
      c.style.opacity=q.toFixed(3);
      c.style.transform='translateY('+((1-q)*54).toFixed(1)+'px) scale('+(1+(1-q)*0.13).toFixed(4)+')';
    });
  });

  // Price counter runs up to the real published entry tier.
  const cp=easeOut(clamp((t-6.85)/0.85,0,1));
  const v=Math.round(cp*16000/100)*100;
  document.getElementById('counter').textContent='₹'+v.toLocaleString('en-IN')+' / mo';
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
  if (i % 60 === 0) console.log(`  frame ${i}/${total}`);
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
