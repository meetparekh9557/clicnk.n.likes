// Animated "live audit" hero visual: a faux browser card that runs a scan
// on a loop. It now cycles through three example reports - a failing site,
// a borderline one and a healthy one - so it shows the tool is a real
// diagnostic, not a guaranteed 92. Each report has its own score, ring
// colour and mixed pass / warn / fail rows in the brand palette (coral =
// danger, amber = on the edge, teal = safe). A rAF count-up drives the
// number; under prefers-reduced-motion it holds the healthy state.
import { useEffect, useRef, useState } from 'react';

// coral = danger, amber = on the edge, teal = safe.
const STATUS = {
  pass: { bg: 'bg-teal/15', fg: '#1F7A74', d: 'M20 6 9 17l-5-5', sw: 3 },
  warn: { bg: 'bg-[#FDBA1F]/25', fg: '#A9750A', d: 'M12 8v5M12 16h.01', sw: 2.6 },
  fail: { bg: 'bg-coral/15', fg: '#E23744', d: 'M18 6 6 18M6 6l12 12', sw: 3 },
};

const REPORTS = [
  {
    target: 38, ring: '#FF4757', num: '#E23744', label: 'Needs urgent work',
    signals: [
      { label: 'Title tag', note: 'missing', status: 'fail' },
      { label: 'Meta description', note: 'missing', status: 'fail' },
      { label: 'H1 structure', note: '3 H1s', status: 'warn' },
      { label: 'Schema markup', note: 'none', status: 'fail' },
      { label: 'Core Web Vitals', note: 'poor', status: 'fail' },
      { label: 'Mobile ready', note: 'no', status: 'fail' },
    ],
  },
  {
    target: 66, ring: '#E7A008', num: '#A9750A', label: 'On the edge',
    signals: [
      { label: 'Title tag', note: '72 chars', status: 'warn' },
      { label: 'Meta description', note: 'present', status: 'pass' },
      { label: 'H1 structure', note: 'one, clean', status: 'pass' },
      { label: 'Schema markup', note: 'none', status: 'fail' },
      { label: 'Core Web Vitals', note: 'needs work', status: 'warn' },
      { label: 'Mobile ready', note: 'yes', status: 'pass' },
    ],
  },
  {
    target: 92, ring: '#33A79F', num: '#1F7A74', label: 'Healthy',
    signals: [
      { label: 'Title tag', note: '58 chars', status: 'pass' },
      { label: 'Meta description', note: 'present', status: 'pass' },
      { label: 'H1 structure', note: 'one, clean', status: 'pass' },
      { label: 'Schema markup', note: 'Organization', status: 'pass' },
      { label: 'Core Web Vitals', note: 'good', status: 'pass' },
      { label: 'Mobile ready', note: 'yes', status: 'pass' },
    ],
  },
];
const CYCLE_MS = 5200;
const COUNT_MS = 2600;

function ScoreRing({ pct, color, reduce }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="shrink-0" aria-hidden="true">
      <circle cx="44" cy="44" r={R} fill="none" stroke="rgba(26,43,74,0.10)" strokeWidth="7" />
      <circle
        cx="44" cy="44" r={R} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct / 100)}
        transform="rotate(-90 44 44)"
        style={{ transition: reduce ? 'none' : 'stroke-dashoffset 90ms linear, stroke 300ms ease' }}
      />
    </svg>
  );
}

export default function AuditDemo() {
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [cycle, setCycle] = useState(reduce ? 2 : 0);
  const report = REPORTS[cycle % REPORTS.length];
  const [score, setScore] = useState(reduce ? report.target : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  useEffect(() => {
    if (reduce) { setScore(report.target); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setScore(Math.round(report.target * eased));
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
          <ScoreRing pct={score} color={report.ring} reduce={reduce} />
          <div>
            <div className="font-display text-3xl font-bold tabular-nums" style={{ color: report.num }}>
              {score}<span className="text-lg text-navy/40">/100</span>
            </div>
            <div className="text-xs text-navy/55">Website Health Score</div>
            <div className="mt-0.5 text-[11px] font-semibold" style={{ color: report.num }}>{report.label}</div>
          </div>
        </div>

        <ul className="mt-5 space-y-2.5">
          {report.signals.map((s, i) => {
            const st = STATUS[s.status];
            return (
              <li
                key={`${s.label}-${cycle}`}
                className="audit-row flex items-center gap-2.5 text-sm"
                style={reduce ? {} : { animationDelay: `${0.3 + i * 0.32}s` }}
              >
                <span className={`audit-check grid h-5 w-5 shrink-0 place-items-center rounded-full ${st.bg}`} style={{ color: st.fg }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={st.sw} strokeLinecap="round" aria-hidden="true"><path d={st.d}/></svg>
                </span>
                <span className="font-medium text-navy">{s.label}</span>
                <span className="ml-auto text-xs font-medium" style={{ color: st.fg }}>{s.note}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
