// The audit-weapon hero: URL + email in, live scan moment, verified
// Website Health Score out. Reuses the shared engine's verbatim v1
// scoring and email flow (email required BEFORE results, same as every
// v1 tool; results labelled verified only when the live fetch ran).
// If the analyzer can't reach the page, the fallback is honest and
// points to the full tool, which offers the self-reported path.
import { useState } from 'react';
import {
  TOOL_SCAN_MIN_MS,
  OWNER_EMAIL,
  fetchPageFacts,
  scoreOnPageHealth,
  buildReportEmailHtml,
  sendFromClicknlikes,
} from '../../lib/engine';

const SCAN_STEPS = [
  'Fetching your page live…',
  'Reading title, meta and headings…',
  'Counting images, schema and links…',
  'Scoring 11 verified signals…',
];

export default function HeroScan({ toolsHref }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | scanning | done | failed
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);

  async function runScan(evt) {
    evt.preventDefault();
    if (phase === 'scanning') return;
    setPhase('scanning');
    setScanStep(0);
    const stepTimer = setInterval(() => setScanStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1)), 450);

    const minDelay = new Promise((r) => setTimeout(r, TOOL_SCAN_MIN_MS * 2));
    const [page] = await Promise.all([fetchPageFacts(url), minDelay]);
    clearInterval(stepTimer);

    if (page.available) {
      const r = scoreOnPageHealth(page);
      const { score, gaps, factors, nextSteps } = r;
      const liveNote = `Fetched and analyzed ${page.finalUrl} live: 11 on-page signals verified directly`;
      const worst = gaps.length ? gaps[0] : null;
      const bullets = [
        `Website Health Score for ${page.finalUrl}: ${score}/100, from a live fetch of your actual page just now.`,
        worst
          ? `Biggest verified issue: ${worst}.`
          : '✅ No significant on-page issues found: your fundamentals are genuinely solid.',
      ];
      if (gaps.length > 1)
        bullets.push(`${gaps.length - 1} more verified issue${gaps.length > 2 ? 's' : ''} found: the full factor-by-factor breakdown is in your emailed report.`);
      bullets.push(
        `Quick facts: ${page.wordCount.toLocaleString('en-IN')} words, ${page.h1Count} H1(s), ${page.imgCount - page.imgMissingAlt}/${page.imgCount} images with alt text, schema ${page.hasSchema ? 'present' : 'absent'}.`
      );

      const interpretation = `${score}/100 from a live check. ${
        score >= 80
          ? 'Your on-page fundamentals are genuinely solid: growth levers are likely elsewhere (content, authority, conversion).'
          : score >= 55
            ? 'Workable but leaking: each flagged factor below is a named, fixable issue costing you specific visibility.'
            : 'This page has structural problems actively suppressing its Google visibility: the factor table shows exactly where every point went.'
      }`;
      const bodyText = `Hi,\n\nYour Website Health report for ${url || 'your site'}:\n\nScore: ${score}/100 (live scan)\n${interpretation}\n\nWhat we checked:\n${factors.map((f) => `• ${f.name}: ${f.found} [${f.source === 'verified' ? 'VERIFIED LIVE' : 'self-reported'}] (${f.impact})`).join('\n')}\n\nYour next steps:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nReply to this email or grab a quote at clicknlikes.com for the line-by-line fix list.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
      const bodyHtml = buildReportEmailHtml({
        toolLabel: 'Live Website Health Scan',
        forLine: `Scanned: ${url || 'your site'} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
        scoreDisplay: `${score}/100`,
        indexLabel: 'Website Health Score',
        interpretation,
        liveNote,
        factors,
        nextSteps,
      });
      sendFromClicknlikes({ toEmail: email, subject: `Your Website Health report: ${score}/100`, bodyText, bodyHtml });
      sendFromClicknlikes({
        toEmail: OWNER_EMAIL,
        replyTo: email,
        subject: `🔔 New Website Health Scan lead: ${email}`,
        bodyText: `New Live Website Health Scan lead (homepage hero):\n\nEmail: ${email}\nURL: ${url}\nScore: ${score}/100\nData source: LIVE page fetch\nGaps:\n${gaps.length ? gaps.map((g) => '  - ' + g).join('\n') : '  (none)'}\nPage facts: title ${page.titleLength}ch | meta ${page.metaDescription === null ? 'MISSING' : page.metaDescriptionLength + 'ch'} | H1s ${page.h1Count} | ${page.wordCount}w | alt ${page.imgMissingAlt}/${page.imgCount} missing | schema ${page.hasSchema ? 'yes' : 'no'} | noindex ${page.noindex ? 'YES!' : 'no'}`,
      });
      setResult({ score, bullets, finalUrl: page.finalUrl });
      setPhase('done');
    } else {
      sendFromClicknlikes({
        toEmail: OWNER_EMAIL,
        replyTo: email,
        subject: `🔔 New Website Health Scan lead: ${email}`,
        bodyText: `New Live Website Health Scan lead (homepage hero):\n\nEmail: ${email}\nURL: ${url}\nResult: live fetch FAILED (${page.reason}); visitor pointed to the full tool for the self-reported path.`,
      });
      setPhase('failed');
    }
  }

  if (phase === 'done' && result) {
    return (
      <div className="mt-8 rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Scanned live just now</span>
          <span className="text-xs font-semibold text-teal-dark">11 verified on-page signals</span>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold text-navy">{result.score}</span>
          <span className="text-sm text-navy/55">/100 Website Health Score</span>
        </div>
        <ul className="mt-4 space-y-2">
          {result.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-navy/80">
              <span className="text-teal-dark">▸</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-teal-dark">
          ✓ Your full report (every factor, its exact point impact, and your next steps) was sent to {email}.
        </p>
        <p className="mt-1 text-xs text-navy/55">
          Every signal above was verified from a live fetch of your page, nothing self-reported.{' '}
          <a href={toolsHref} className="text-teal-dark underline">Run the full toolkit →</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={runScan} className="mt-8" aria-label="Free live website scan">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="yourwebsite.com"
          aria-label="Your website URL"
          className="w-full rounded-full border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy transition-colors outline-none focus:border-teal sm:flex-1"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          aria-label="Your email (your full report is sent here)"
          className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy transition-colors outline-none focus:border-teal sm:flex-1"
        />
        <button
          type="submit"
          disabled={phase === 'scanning'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
        >
          {phase === 'scanning' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Scanning…
            </>
          ) : (
            'Scan my site'
          )}
        </button>
      </div>
      {phase === 'scanning' && (
        <p className="mt-3 text-sm text-teal-dark" role="status" aria-live="polite">
          {SCAN_STEPS[scanStep]}
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          We couldn't reach that URL for a live scan (some sites block automated visits), and we never invent a score.
          Check the address and try again, or use the{' '}
          <a href={toolsHref} className="text-teal-dark underline">full Website Health tool</a>, which also offers a
          clearly-labelled self-reported check.
        </p>
      )}
      {phase !== 'scanning' && phase !== 'failed' && (
        <p className="mt-3 text-xs text-navy/55">
          Live fetch of your actual page, 11 verified signals, full report emailed. No call required.
        </p>
      )}
    </form>
  );
}
