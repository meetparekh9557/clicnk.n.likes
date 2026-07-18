// Animated "live audit" hero visual: a faux browser card that runs a scan
// on a loop - a beam sweeps the card, six on-page signals check off in
// sequence, and a score ring counts up. It demonstrates the product (we
// fetch and score sites live) instead of being decoration. Each cycle
// remounts the CSS animations via a key; a rAF count-up drives the number.
// Under prefers-reduced-motion it holds the finished state, no motion.
import { useEffect, useRef, useState } from 'react';

const SIGNALS = [
  { label: 'Title tag', note: '58 chars' },
  { label: 'Meta description', note: 'present' },
  { label: 'H1 structure', note: 'one, clean' },
  { label: 'Schema markup', note: 'Organization' },
  { label: 'Core Web Vitals', note: 'good' },
  { label: 'Mobile ready', note: 'yes' },
];
const TARGET = 92;
const CYCLE_MS = 5200;
const COUNT_MS = 2800;

function ScoreRing({ pct, reduce }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0" aria-hidden="true">
      <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(26,43,74,0.10)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={R} fill="none" stroke="#33A79F" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct / 100)}
        transform="rotate(-90 44 44)"
        style={{ transition: reduce ? 'none' : 'stroke-dashoffset 90ms linear' }}
      />
    </svg>
  );
}

export default function AuditDemo() {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [cycle, setCycle] = useState(0);
  const [score, setScore] = useState(reduce ? TARGET : 0);
  const raf = useRef(0);

  // Loop: bump the cycle key so the CSS scan/checks replay.
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  // Count the score up each cycle.
  useEffect(() => {
    if (reduce) { setScore(TARGET); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setScore(Math.round(TARGET * eased));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    setScore(0);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [cycle, reduce]);

  return (
    <div className="audit-card relative overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-[0_24px_60px_rgba(26,43,74,0.16)]">
      {/* Browser bar */}
      <div className="flex items-center gap-2 border-b border-navy/10 bg-off/70 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-coral/50"></span>
        <span className="h-2.5 w-2.5 rounded-full bg-[#FDBA1F]/60"></span>
        <span className="h-2.5 w-2.5 rounded-full bg-teal/60"></span>
        <span className="ml-2 flex flex-1 items-center gap-1.5 truncate rounded-md bg-white px-2.5 py-1 text-[11px] text-navy/50 ring-1 ring-navy/10">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          yoursite.com
        </span>
        <span className="text-[10px] font-semibold tracking-wide text-teal-dark uppercase">{reduce ? 'Scanned' : 'Scanning'}</span>
      </div>

      {/* Body with sweeping beam */}
      <div className="relative px-5 py-5">
        {!reduce && <span key={`beam-${cycle}`} className="audit-beam" aria-hidden="true"></span>}

        <div className="flex items-center gap-4">
          <ScoreRing pct={reduce ? TARGET : score} reduce={reduce} />
          <div>
            <div className="font-display text-3xl font-bold text-navy tabular-nums">{score}<span className="text-lg text-navy/40">/100</span></div>
            <div className="text-xs text-navy/55">Website Health Score</div>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {SIGNALS.map((s, i) => (
            <li
              key={`${s.label}-${cycle}`}
              className="audit-row flex items-center gap-2.5 text-sm"
              style={reduce ? {} : { animationDelay: `${0.35 + i * 0.36}s` }}
            >
              <span className="audit-check grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal/15 text-teal-dark">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              <span className="font-medium text-navy">{s.label}</span>
              <span className="ml-auto text-xs text-navy/45">{s.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
