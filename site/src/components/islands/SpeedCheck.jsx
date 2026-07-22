// Live Speed & Core Web Vitals check. URL + email in, a real Google
// PageSpeed Insights run out: Lighthouse lab metrics (LCP, CLS, Total
// Blocking Time, FCP) plus CrUX real-user field data when Google has
// enough traffic for the URL. Every number here is measured live this
// session, so it is labelled verified; if PSI can't be reached (or the
// check isn't switched on yet in the backend) the fallback is honest and
// points to the on-page Website Health scan. Same email gate and report
// flow as every other tool.
import { useState } from 'react';
import {
  OWNER_EMAIL,
  fetchPageSpeed,
  buildReportEmailHtml,
  sendFromClicknlikes,
  fact,
} from '../../lib/engine';

const STEPS = [
  'Asking Google to load your page on a mid-range mobile…',
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
const verdictWord = (s) => (s >= 90 ? 'Fast' : s >= 50 ? 'A little slow on mobile' : 'Slow on mobile');
const plainField = (c) => ({ FAST: 'fast', AVERAGE: 'average', SLOW: 'slow' }[c] || 'mixed');

export default function SpeedCheck({ toolsHref }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | scanning | done | failed | soon
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'scanning') return;
    setPhase('scanning');
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 3500);
    const psi = await fetchPageSpeed(url, 'mobile');
    clearInterval(timer);

    if (!psi.available) {
      // 'not_configured' = key not set yet; 'bad_request' = the backend
      // hasn't been redeployed with the pagespeed action yet. Both mean the
      // live check isn't switched on, so show the honest "coming" state.
      if (psi.reason === 'not_configured' || psi.reason === 'bad_request') { setPhase('soon'); return; }
      sendFromClicknlikes({
        toEmail: OWNER_EMAIL,
        replyTo: email,
        subject: `🔔 New Speed check lead: ${email}`,
        bodyText: `New Live Speed & Core Web Vitals lead:\n\nEmail: ${email}\nURL: ${url}\nResult: live PSI measurement FAILED (${psi.reason}); pointed to the on-page Website Health scan.`,
      });
      setPhase('failed');
      return;
    }

    // Our own plain-language read of Google's raw measurements. The number
    // is Google's; the words are ours, written for a business owner, not an
    // engineer. `tech` is kept only for the emailed record and next-step logic.
    const rows = [
      { label: 'Your main content appears', tech: 'lcp', v: psi.lcpText, b: band(psi.lcpMs, 2500, 4000), sub: 'How long before a visitor sees your headline and main image. Past about 2.5 seconds, people start leaving.' },
      { label: 'The page holds still as it loads', tech: 'cls', v: psi.clsText, b: band(psi.cls, 0.1, 0.25), sub: 'Whether your buttons and text jump around while loading. A page that shifts feels broken and loses taps.' },
      { label: 'It reacts the moment you tap', tech: 'tbt', v: psi.tbtText, b: band(psi.tbtMs, 200, 600), sub: 'How long the page ignores taps while it finishes loading. Long freezes make visitors think it is stuck.' },
      { label: 'The first thing shows up', tech: 'fcp', v: psi.fcpText, b: band(psi.fcpMs, 1800, 3000), sub: 'When the very first piece of your page paints, the end of the blank-screen wait.' },
    ].filter((r) => r.v);

    const factors = rows.map((r) => fact(r.label, `${r.v} — ${BAND[r.b].label}`, 'verified', r.sub));
    if (psi.hasField) {
      factors.push(fact('Real visitors’ experience', `Actual people loading this page are rated ${plainField(psi.fieldOverall)} by Google`, 'verified', 'measured from real Chrome visitors, not just a lab test'));
    }
    const worst = rows.filter((r) => r.b === 'poor' || r.b === 'needs').sort((a, b) => (a.b === 'poor' ? -1 : 1))[0];
    const interpretation = `${psi.score}/100. ${
      psi.score >= 90
        ? 'Your site loads fast on mobile — speed is not what is costing you visitors.'
        : psi.score >= 50
          ? `A few fixable things are making mobile visitors wait${worst ? `, starting with “${worst.label.toLowerCase()}” (${worst.v})` : ''}. Google now uses these exact speed signals to decide your rankings.`
          : `Your page is slow enough to lose visitors and rankings before anyone even sees it${worst ? `. Start with “${worst.label.toLowerCase()}” (${worst.v})` : ''}.`
    }`;

    const nextSteps = [];
    rows.forEach((r) => {
      if (r.b === 'good') return;
      if (r.tech === 'lcp') nextSteps.push('Make your main content appear sooner: compress and correctly size your hero image, load it first, and use modern formats (WebP/AVIF).');
      if (r.tech === 'cls') nextSteps.push('Stop the page jumping: give every image and embed a fixed width and height, and reserve space for anything that loads late (banners, fonts).');
      if (r.tech === 'tbt') nextSteps.push('Make it respond faster to taps: defer or remove the heavy scripts that freeze the page while it loads.');
      if (r.tech === 'fcp') nextSteps.push('Show the first content sooner: trim render-blocking code and turn on caching so the blank screen clears faster.');
    });
    if (!nextSteps.length) nextSteps.push('Your speed is healthy: keep it that way by watching image sizes and third-party scripts as the site grows.');

    const bodyText = `Hi,\n\nYour Live Core Web Vitals report for ${psi.finalUrl} (mobile), measured just now by Google PageSpeed Insights:\n\nPerformance score: ${psi.score}/100\n${interpretation}\n\nWhat we measured:\n${factors.map((f) => `• ${f.name}: ${f.found} [VERIFIED LIVE]`).join('\n')}\n\nYour next steps:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nReply to this email or grab a quote at clicknlikes.com for a full performance rebuild plan.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'Live Speed & Core Web Vitals',
      forLine: `Measured live for ${psi.finalUrl} (mobile) · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: `${psi.score}/100`,
      indexLabel: 'Mobile performance score',
      interpretation,
      liveNote: `Measured live from ${psi.finalUrl} via Google PageSpeed Insights just now`,
      factors,
      nextSteps,
    });
    sendFromClicknlikes({ toEmail: email, subject: `Your Core Web Vitals report: ${psi.score}/100`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: email,
      subject: `🔔 New Speed check lead: ${email} (${psi.score}/100)`,
      bodyText: `New Live Speed & Core Web Vitals lead:\n\nEmail: ${email}\nURL: ${psi.finalUrl}\nScore: ${psi.score}/100 (mobile)\nData source: LIVE PageSpeed Insights\nLCP ${psi.lcpText} | CLS ${psi.clsText} | TBT ${psi.tbtText} | FCP ${psi.fcpText} | field ${psi.hasField ? psi.fieldOverall : 'none'}`,
    });
    setResult({ psi, rows, score: psi.score });
    setPhase('done');
  }

  if (phase === 'done' && result) {
    const { psi, rows, score } = result;
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Measured live just now · mobile</span>
        <div className="mt-4 flex items-end gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
              <span className="text-sm text-navy/55">/100 speed score</span>
            </div>
            <p className="mt-1 text-sm font-semibold" style={{ color: scoreColor(score) }}>{verdictWord(score)}</p>
          </div>
        </div>
        <ul className="mt-5 space-y-3.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start gap-3 border-b border-navy/5 pb-3.5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{r.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-navy/55">{r.sub}</p>
              </div>
              <div className="ml-auto shrink-0 pl-2 text-right">
                <div className="font-display text-sm font-bold tabular-nums text-navy">{r.v}</div>
                <div className="text-xs font-semibold" style={{ color: BAND[r.b].fg }}>{BAND[r.b].label}</div>
              </div>
            </li>
          ))}
        </ul>
        {psi.hasField && (
          <p className="mt-4 rounded-lg bg-teal/[0.06] px-3 py-2 text-xs text-navy/70">
            And this isn’t just a lab test: real people loading your page right now experience it as <b className="text-teal-dark">{plainField(psi.fieldOverall)}</b>.
          </p>
        )}
        <p className="mt-4 text-xs text-teal-dark">✓ Your full report was emailed to {email}.</p>
        <p className="mt-1 text-xs text-navy/55">
          Measured live on your real page, nothing self-reported.{' '}
          <a href={toolsHref} className="text-teal-dark underline">Run the on-page health scan too →</a>
        </p>
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
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com" aria-label="Your email (your full report is sent here)"
          className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
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
          A real Google PageSpeed Insights measurement of your live page: LCP, layout shift, blocking time and real-user data, emailed in full. No call required.
        </p>
      )}
    </form>
  );
}
