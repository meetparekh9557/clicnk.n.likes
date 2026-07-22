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

    const rows = [
      { key: 'Largest Contentful Paint', v: psi.lcpText, b: band(psi.lcpMs, 2500, 4000), why: 'how fast your main content appears' },
      { key: 'Cumulative Layout Shift', v: psi.clsText, b: band(psi.cls, 0.1, 0.25), why: 'how much the page jumps while loading' },
      { key: 'Total Blocking Time', v: psi.tbtText, b: band(psi.tbtMs, 200, 600), why: 'how long the page is frozen to taps' },
      { key: 'First Contentful Paint', v: psi.fcpText, b: band(psi.fcpMs, 1800, 3000), why: 'when the first pixel of content paints' },
    ].filter((r) => r.v);

    const factors = rows.map((r) => fact(r.key, `${r.v} (${BAND[r.b].label})`, 'verified', r.why));
    if (psi.hasField) {
      factors.push(fact('Real-user field data (CrUX)', `Google rates real visitors to this URL: ${psi.fieldOverall || 'n/a'}`, 'verified', 'measured from actual Chrome users, not a lab'));
    }
    const worst = rows.filter((r) => r.b === 'poor' || r.b === 'needs').sort((a, b) => (a.b === 'poor' ? -1 : 1))[0];
    const interpretation = `${psi.score}/100 mobile performance, measured live by Google PageSpeed Insights. ${
      psi.score >= 90
        ? 'Your Core Web Vitals are genuinely strong: speed is not what is holding this page back.'
        : psi.score >= 50
          ? `Workable but leaking speed. Your weakest vital is ${worst ? worst.key + ' (' + worst.v + ')' : 'flagged below'}, and Google now uses these exact numbers as a ranking input.`
          : `This page is slow enough to suppress its own rankings and conversions. ${worst ? 'Start with ' + worst.key + ' (' + worst.v + ').' : ''}`
    }`;

    const nextSteps = [];
    rows.forEach((r) => {
      if (r.b === 'good') return;
      if (r.key.startsWith('Largest')) nextSteps.push('Speed up your Largest Contentful Paint: compress and correctly size the hero image, preload it, and serve modern formats (WebP/AVIF).');
      if (r.key.startsWith('Cumulative')) nextSteps.push('Kill the layout shift: set explicit width/height on images and embeds, and reserve space for anything that loads late (ads, banners, fonts).');
      if (r.key.startsWith('Total')) nextSteps.push('Cut blocking time: defer non-critical JavaScript and remove unused scripts so the page responds to taps sooner.');
      if (r.key.startsWith('First')) nextSteps.push('Improve first paint: reduce render-blocking CSS/JS and lean on server or edge caching.');
    });
    if (!nextSteps.length) nextSteps.push('Your vitals are healthy: protect them by keeping third-party scripts and large images in check as the site grows.');

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
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Measured live just now</span>
          <span className="text-xs font-semibold text-teal-dark">Google PageSpeed Insights · mobile</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tabular-nums" style={{ color: scoreColor(score) }}>{score}</span>
          <span className="text-sm text-navy/55">/100 mobile performance</span>
        </div>
        <ul className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <li key={r.key} className="flex items-center gap-3 border-b border-navy/5 pb-2.5 text-sm">
              <span className="font-medium text-navy">{r.key}</span>
              <span className="ml-auto tabular-nums text-navy/70">{r.v}</span>
              <span className="w-24 text-right text-xs font-semibold" style={{ color: BAND[r.b].fg }}>{BAND[r.b].label}</span>
            </li>
          ))}
        </ul>
        {psi.hasField && (
          <p className="mt-3 rounded-lg bg-teal/[0.06] px-3 py-2 text-xs text-navy/70">
            Real Chrome users on this URL are rated <b className="text-teal-dark">{psi.fieldOverall}</b> by Google (CrUX field data), not just a lab test.
          </p>
        )}
        <p className="mt-4 text-xs text-teal-dark">✓ Your full report was emailed to {email}.</p>
        <p className="mt-1 text-xs text-navy/60">
          Every number above was measured live by Google, nothing self-reported.{' '}
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
