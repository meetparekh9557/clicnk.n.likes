// "The First-Page Cliff" - an interactive, original Click.n.likes lens on
// Google's click curve. The underlying click-through rates are cited
// (Backlinko, 4M results); the interactive gain model and framing are
// ours. Pick a position and it shows what you capture there and how many
// times more clicks reaching #1 would win - a playful, honest way to make
// the data land. Columns self-draw on mount; the multiplier counts up.
import { useEffect, useRef, useState } from 'react';

const DATA = [
  { pos: 1, ctr: 27.6 },
  { pos: 2, ctr: 15.8 },
  { pos: 3, ctr: 11.0 },
  { pos: 4, ctr: 8.4 },
  { pos: 5, ctr: 6.3 },
  { pos: 6, ctr: 4.6 },
  { pos: 7, ctr: 3.6 },
  { pos: 8, ctr: 2.8 },
  { pos: 9, ctr: 2.4 },
  { pos: 10, ctr: 2.1 },
];
const MAX = DATA[0].ctr;
const TOP = DATA[0].ctr;

function useCountUp(target, active, ms = 650) {
  const [v, setV] = useState(target);
  const raf = useRef(0);
  useEffect(() => {
    if (!active) { setV(target); return; }
    const from = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(from + (target - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active, ms]);
  return v;
}

export default function FirstPageCliff() {
  const [selected, setSelected] = useState(6); // position 6 by default: a big, motivating gain
  const [drawn, setDrawn] = useState(false);
  const rootRef = useRef(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (reduce || !('IntersectionObserver' in window)) { setDrawn(true); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const sel = DATA.find((d) => d.pos === selected);
  const multiplier = TOP / sel.ctr;
  const animatedMult = useCountUp(multiplier, drawn && !reduce);

  return (
    <figure
      ref={rootRef}
      className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8"
    >
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-display text-lg font-semibold text-navy">The First-Page Cliff</span>
        <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-teal-dark uppercase">
          Click.n.likes lens
        </span>
      </figcaption>
      <p className="mt-1.5 text-sm text-navy/60">
        Tap a position to see what it wins you. The first result takes more clicks than the next three combined.
      </p>

      {/* Columns */}
      <div className="mt-6 flex items-end justify-between gap-1.5" style={{ height: '180px' }} role="group" aria-label="Google click-through rate by position - tap a position to select it">
        {DATA.map((d) => {
          const isSel = d.pos === selected;
          const h = drawn ? (d.ctr / MAX) * 100 : 0;
          return (
            <button
              key={d.pos}
              type="button"
              onClick={() => setSelected(d.pos)}
              aria-pressed={isSel}
              aria-label={`Position ${d.pos}, ${d.ctr}% of clicks`}
              className="group relative flex h-full flex-1 cursor-pointer flex-col justify-end focus-visible:outline-none"
            >
              {isSel && (
                <span className="mx-auto mb-1 rounded bg-navy px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                  {d.ctr}%
                </span>
              )}
              <span
                className={`w-full rounded-t-md transition-[height,background-color] duration-700 ease-out-expo ${
                  isSel
                    ? 'bg-gradient-to-t from-teal-dark to-teal'
                    : 'bg-navy/15 group-hover:bg-navy/25'
                }`}
                style={{ height: `${h}%`, transitionDelay: `${d.pos * 45}ms` }}
              />
              <span className={`mt-1.5 text-center text-[11px] font-semibold tabular-nums ${isSel ? 'text-teal-dark' : 'text-navy/40'}`}>
                {d.pos}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-center text-[11px] tracking-wide text-navy/40 uppercase">Google result position</p>

      {/* Playful takeaway */}
      <div className="mt-6 rounded-xl bg-off p-5 text-center">
        <p className="text-sm text-navy/70">
          At position <b className="text-navy">#{sel.pos}</b> you capture <b className="text-navy">{sel.ctr}%</b> of clicks.
        </p>
        <p className="mt-1 font-display text-navy">
          Reaching <b className="text-teal-dark">#1</b> would win you
          <span className="mx-1.5 inline-block font-display text-3xl font-bold text-teal-dark tabular-nums align-middle">
            {animatedMult.toFixed(1)}x
          </span>
          the clicks.
        </p>
      </div>

      <p className="mt-5 text-xs text-navy/45">
        Click rates: Backlinko analysis of 4 million Google results. Gain model and framing: Click.n.likes.
      </p>
    </figure>
  );
}
