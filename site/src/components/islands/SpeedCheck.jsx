// Live Speed & Core Web Vitals check. URL in, real Google PageSpeed Insights
// runs out for BOTH mobile and desktop (fetched in parallel - the backend
// already supported the desktop strategy, it just was never called). Every
// number here is measured live this session, so it is labelled verified.
// Both scores show free, no email required; email unlocks the full
// metric-by-metric breakdown for both, same pattern as every other tool -
// HubSpot's Website Grader is the canonical version of this: score first,
// email unlocks the detail.
import { useState } from 'react';
import {
  OWNER_EMAIL,
  fetchPageSpeed,
  buildReportEmailHtml,
  sendFromClicknlikes,
  fact, TOOL_LEADS_TAB,
} from '../../lib/engine';

const STEPS = [
  'Asking Google to load your page on mobile and desktop…',
  'Measuring Largest Contentful Paint and layout shift…',
  'Scoring blocking time and real-user field data…',
  'Building your Core Web Vitals report…',
];

// Google's official Core Web Vitals thresholds.
function band(v, good, poor) {
  if (v == null) return 'na';
  return v <= good ? 'good' : v <= poor ? 'needs' : 'poor';
}
const BAND = {
  good: { fg: '#1F7A74', label: 'Good' },
  needs: { fg: '#A9750A', label: 'Needs work' },
  poor: { fg: '#E23744', label: 'Poor' },
  na: { fg: '#6b7280', label: '—' },
};
const scoreColor = (s) => (s >= 90 ? '#1F7A74' : s >= 50 ? '#A9750A' : '#E23744');
const verdictWord = (s, label) => (s >= 90 ? 'Fast' : s >= 50 ? `A little slow on ${label}` : `Slow on ${label}`);
const plainField = (c) => ({ FAST: 'fast', AVERAGE: 'average', SLOW: 'slow' }[c] || 'mixed');
const STRATEGIES = [
  { key: 'mobile', label: 'mobile' },
  { key: 'desktop', label: 'desktop' },
];

// Builds the plain-language rows + interpretation from one PSI measurement.
// Shared between mobile and desktop so the two can never quietly score
// differently.
function buildStrategyResult(psi, label) {
  const rows = [
    { label: 'Your main content appears', tech: 'lcp', v: psi.lcpText, b: band(psi.lcpMs, 2500, 4000), sub: 'How long before a visitor sees your headline and main image. Past about 2.5 seconds, people start leaving.' },
    { label: 'The page holds still as it loads', tech: 'cls', v: psi.clsText, b: band(psi.cls, 0.1, 0.25), sub: 'Whether your buttons and text jump around while loading. A page that shifts feels broken and loses taps.' },
    { label: 'It reacts the moment you tap', tech: 'tbt', v: psi.tbtText, b: band(psi.tbtMs, 200, 600), sub: 'How long the page ignores taps while it finishes loading. Long freezes make visitors think it is stuck.' },
    { label: 'The first thing shows up', tech: 'fcp', v: psi.fcpText, b: band(psi.fcpMs, 1800, 3000), sub: 'When the very first piece of your page paints, the end of the blank-screen wait.' },
  ].filter((r) => r.v);

  const worst = rows.filter((r) => r.b === 'poor' || r.b === 'needs').sort((a, b) => (a.b === 'poor' ? -1 : 1))[0];
  const interpretation = `${
    psi.score >= 90
      ? `Your site loads fast on ${label} — speed is not what is costing you visitors here.`
      : psi.score >= 50
        ? `A few fixable things are making ${label} visitors wait${worst ? `, starting with “${worst.label.toLowerCase()}” (${worst.v})` : ''}. Google now uses these exact speed signals to decide your rankings.`
        : `Your page is slow enough on ${label} to lose visitors and rankings before anyone even sees it${worst ? `. Start with “${worst.label.toLowerCase()}” (${worst.v})` : ''}.`
  }`;
  return { available: true, psi, rows, score: psi.score, interpretation };
}

function nextStepsFor(rows) {
  const nextSteps = [];
  rows.forEach((r) => {
    if (r.b === 'good') return;
    if (r.tech === 'lcp') nextSteps.push('Make your main content appear sooner: compress and correctly size your hero image, load it first, and use modern formats (WebP/AVIF).');
    if (r.tech === 'cls') nextSteps.push('Stop the page jumping: give every image and embed a fixed width and height, and reserve space for anything that loads late (banners, fonts).');
    if (r.tech === 'tbt') nextSteps.push('Make it respond faster to taps: defer or remove the heavy scripts that freeze the page while it loads.');
    if (r.tech === 'fcp') nextSteps.push('Show the first content sooner: trim render-blocking code and turn on caching so the blank screen clears faster.');
  });
  if (!nextSteps.length) nextSteps.push('Speed is healthy here: keep it that way by watching image sizes and third-party scripts as the site grows.');
  return nextSteps;
}

export default function SpeedCheck({ toolsHref }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | scanning | scored | sending | done | failed | soon
  const [step, setStep] = useState(0);
  const [results, setResults] = useState(null); // { mobile, desktop }, each { available, ... }

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'scanning') return;
    setPhase('scanning');
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);
    const [mobilePsi, desktopPsi] = await Promise.all([
      fetchPageSpeed(url, 'mobile'),
      fetchPageSpeed(url, 'desktop'),
    ]);
    clearInterval(timer);

    if (!mobilePsi.available && !desktopPsi.available) {
      const reason = mobilePsi.reason || desktopPsi.reason;
      // 'not_configured' = key not set yet; 'bad_request' = the backend
      // hasn't been redeployed with the pagespeed action yet. Both mean the
      // live check isn't switched on, so show the honest "coming" state.
      if (reason === 'not_configured' || reason === 'bad_request') { setPhase('soon'); return; }
      setPhase('failed');
      return;
    }

    setResults({
      mobile: mobilePsi.available ? buildStrategyResult(mobilePsi, 'mobile') : { available: false, reason: mobilePsi.reason },
      desktop: desktopPsi.available ? buildStrategyResult(desktopPsi, 'desktop') : { available: false, reason: desktopPsi.reason },
    });
    setPhase('scored');
  }

  function sendReport(evt) {
    evt.preventDefault();
    if (!email.trim()) return;
    setPhase('sending');

    const sections = STRATEGIES
      .filter((s) => results[s.key].available)
      .map((s) => {
        const r = results[s.key];
        const factors = r.rows.map((row) => fact(`${row.label} (${s.label})`, row.v, 'verified', BAND[row.b].label));
        if (r.psi.hasField) factors.push(fact(`Real visitors’ experience (${s.label})`, `Rated ${plainField(r.psi.fieldOverall)}`, 'verified', 'field data'));
        return { ...s, r, factors, nextSteps: nextStepsFor(r.rows) };
      });

    const bodyText = `Hi,\n\nYour Live Core Web Vitals report for ${sections[0].r.psi.finalUrl}, measured just now by Google PageSpeed Insights:\n\n${sections.map((s) => `--- ${s.label.toUpperCase()}: ${s.r.score}/100 ---\n${s.r.interpretation}\n\nWhat we measured:\n${s.factors.map((f) => `• ${f.name}: ${f.found} [VERIFIED LIVE]`).join('\n')}\n\nNext steps:\n${s.nextSteps.map((st, i) => `${i + 1}. ${st}`).join('\n')}`).join('\n\n')}\n\nReply to this email or grab a quote at clicknlikes.com for a full performance rebuild plan.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = sections.map((s) => buildReportEmailHtml({
      toolLabel: `Live Core Web Vitals — ${s.label}`,
      forLine: `Measured live for ${s.r.psi.finalUrl} (${s.label}) · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: `${s.r.score}/100`,
      indexLabel: `${s.label[0].toUpperCase()}${s.label.slice(1)} performance score`,
      interpretation: s.r.interpretation,
      liveNote: `Measured live from ${s.r.psi.finalUrl} via Google PageSpeed Insights just now`,
      factors: s.factors,
      nextSteps: s.nextSteps,
    })).join('<hr style="margin:28px 0;border:none;border-top:1px solid #e5e5e5;">');

    sendFromClicknlikes({ toEmail: email, subject: `Your Core Web Vitals report: ${sections.map((s) => `${s.label} ${s.r.score}/100`).join(', ')}`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: email,
      subject: `🔔 New Speed check lead: ${email} (${sections.map((s) => `${s.label} ${s.r.score}`).join(', ')})`,
      leadTab: TOOL_LEADS_TAB,
      fields: {
        tool: 'Speed & Core Web Vitals',
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        email,
        url: sections[0].r.psi.finalUrl,
        score: sections.map((s) => `${s.label} ${s.r.score}`).join(' | '),
        'data source': 'LIVE PageSpeed Insights',
        ...Object.fromEntries(sections.map((s) => [
          'speed_' + String(s.label).toLowerCase(),
          `${s.r.score}/100 LCP ${s.r.psi.lcpText} CLS ${s.r.psi.clsText} TBT ${s.r.psi.tbtText} FCP ${s.r.psi.fcpText}`,
        ])),
      },
      bodyText: `New Live Speed & Core Web Vitals lead:\n\nEmail: ${email}\nURL: ${sections[0].r.psi.finalUrl}\nData source: LIVE PageSpeed Insights\n\n${sections.map((s) => `${s.label}: ${s.r.score}/100 — LCP ${s.r.psi.lcpText} | CLS ${s.r.psi.clsText} | TBT ${s.r.psi.tbtText} | FCP ${s.r.psi.fcpText} | field ${s.r.psi.hasField ? s.r.psi.fieldOverall : 'none'}`).join('\n')}`,
    });
    setPhase('done');
  }

  if ((phase === 'scored' || phase === 'sending' || phase === 'done') && results) {
    const done = phase === 'done';
    const available = STRATEGIES.filter((s) => results[s.key].available);
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Measured live just now</span>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {STRATEGIES.map((s) => {
            const r = results[s.key];
            if (!r.available) {
              return (
                <div key={s.key} className="rounded-xl border border-dashed border-navy/15 bg-off p-4">
                  <p className="text-xs font-semibold tracking-[0.1em] text-navy/45 uppercase">{s.label}</p>
                  <p className="mt-2 text-[13px] text-navy/55">Couldn't be measured this time (some sites block automated visits). {s.key === 'mobile' ? 'Desktop' : 'Mobile'} succeeded below.</p>
                </div>
              );
            }
            return (
              <div key={s.key}>
                <p className="text-xs font-semibold tracking-[0.1em] text-navy/45 uppercase">{s.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold tabular-nums" style={{ color: scoreColor(r.score) }}>{r.score}</span>
                  <span className="text-sm text-navy/55">/100</span>
                </div>
                <p className="mt-1 text-sm font-semibold" style={{ color: scoreColor(r.score) }}>{verdictWord(r.score, s.label)}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-navy/75">{r.interpretation}</p>
              </div>
            );
          })}
        </div>

        {!done && (
          <form onSubmit={sendReport} className="mt-5 border-t border-navy/10 pt-5">
            <label className="mb-1.5 block text-[12.5px] font-semibold text-navy">Email (for the full mobile + desktop breakdown + next steps)</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
              />
              <button
                type="submit" disabled={phase === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
              >
                {phase === 'sending' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Sending…</> : 'Get my full report'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-navy/45">Every metric behind both scores, why it matters, and your next steps, emailed and shown here.</p>
          </form>
        )}

        {done && (
          <div className="mt-5 space-y-6 border-t border-navy/10 pt-5">
            {available.map((s) => {
              const r = results[s.key];
              return (
                <div key={s.key}>
                  <p className="text-xs font-semibold tracking-[0.1em] text-navy/45 uppercase">{s.label} breakdown</p>
                  <ul className="mt-3 space-y-3.5">
                    {r.rows.map((row) => (
                      <li key={row.label} className="flex items-start gap-3 border-b border-navy/5 pb-3.5">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy">{row.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-navy/55">{row.sub}</p>
                        </div>
                        <div className="ml-auto shrink-0 pl-2 text-right">
                          <div className="font-display text-sm font-bold tabular-nums text-navy">{row.v}</div>
                          <div className="text-xs font-semibold" style={{ color: BAND[row.b].fg }}>{BAND[row.b].label}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {r.psi.hasField && (
                    <p className="mt-3 rounded-lg bg-teal/[0.06] px-3 py-2 text-xs text-navy/70">
                      And this isn’t just a lab test: real {s.label} visitors loading your page right now experience it as <b className="text-teal-dark">{plainField(r.psi.fieldOverall)}</b>.
                    </p>
                  )}
                </div>
              );
            })}
            <div>
              <p className="text-xs text-teal-dark">✓ Your full report was emailed to {email}.</p>
              <p className="mt-1 text-xs text-navy/55">
                Measured live on your real page, nothing self-reported.{' '}
                <a href={toolsHref} className="text-teal-dark underline">Run the on-page health scan too →</a>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={run} aria-label="Live Core Web Vitals check">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text" required value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="yourwebsite.com" aria-label="Your website URL"
          className="w-full rounded-full border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
        />
        <button
          type="submit" disabled={phase === 'scanning'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
        >
          {phase === 'scanning' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Measuring…
            </>
          ) : 'Check my speed'}
        </button>
      </div>
      {phase === 'scanning' && (
        <p className="mt-3 text-sm text-teal-dark" role="status" aria-live="polite">{STEPS[step]} <span className="text-navy/50">(a real Google measurement takes ~15-25s)</span></p>
      )}
      {phase === 'soon' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Our live speed measurement is being switched on. In the meantime, the{' '}
          <a href={toolsHref} className="text-teal-dark underline">on-page Website Health scan</a> runs a real live check of your page right now.
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Google couldn't measure that URL just now (some sites block automated visits, or the address needs the full https://). We never invent a score.
          Check the address and try again, or run the{' '}
          <a href={toolsHref} className="text-teal-dark underline">on-page Website Health scan</a> instead.
        </p>
      )}
      {phase !== 'scanning' && phase !== 'failed' && phase !== 'soon' && (
        <p className="mt-3 text-xs text-navy/60">
          A real Google PageSpeed Insights measurement of your live page, mobile and desktop both shown immediately, no email required. Full LCP/CLS/blocking-time breakdown unlocked by email.
        </p>
      )}
    </form>
  );
}
