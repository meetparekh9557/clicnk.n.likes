// Generic per-channel gated tool. Renders a form from a config
// (data/toolConfigs.js), optionally fetches live page facts when a URL is
// given, scores with the matching verbatim scorer (lib/toolScorers.js),
// shows the partial overview on screen and emails the full report - the
// same "screen = overview, email = full deliverable" split as v1, with
// email required before results and honest verified/self-reported labels.
import { useState } from 'react';
import {
  TOOL_SCAN_MIN_MS, OWNER_EMAIL, autoEmailReady,
  fetchPageFacts, buildReportEmailHtml, sendFromClicknlikes,
} from '../../lib/engine';
import { toolScorers } from '../../lib/toolScorers';

const fieldCls = 'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';

export default function GatedTool({ config, serviceLabel }) {
  const defaults = {};
  config.fields.forEach((f) => {
    if (f.type === 'checkbox') defaults[f.id] = false;
    else if (f.default !== undefined) defaults[f.id] = f.default;
    else defaults[f.id] = '';
  });
  const [vals, setVals] = useState(defaults);
  const [phase, setPhase] = useState('idle'); // idle | scanning | done
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [emailedTo, setEmailedTo] = useState('');

  const set = (id, v) => setVals((p) => ({ ...p, [id]: v }));
  const emailField = config.fields.find((f) => f.type === 'email');

  async function submit(evt) {
    evt.preventDefault();
    const email = vals[emailField.id];
    if (!email) { setError('Enter your email: your full report is sent there.'); return; }
    if (config.requireOneOf && !config.requireOneOf.some((k) => String(vals[k] || '').trim())) {
      setError('Give us something to scan: paste your copy, or enter your page URL.');
      return;
    }
    setError('');
    setPhase('scanning');

    const inputs = { ...vals };
    const urlVal = config.urlField ? String(vals[config.urlField] || '').trim() : '';
    const minDelay = new Promise((r) => setTimeout(r, TOOL_SCAN_MIN_MS));
    const pagePromise = urlVal ? fetchPageFacts(urlVal) : Promise.resolve(null);
    const [, page] = await Promise.all([minDelay, pagePromise]);
    if (page && page.available) inputs._page = page;

    const r = toolScorers[config.scorer](inputs);

    // Full report by email (the deliverable); overview stays on screen.
    const stepsText = (r.nextSteps || []).map((s, i) => `${i + 1}. ${s}`).join('\n');
    const bodyText = `Hi,\n\nYour full ${serviceLabel} report from Click.n.likes:\n\n${r.indexLabel}: ${r.score}/100\n${r.interpretation || ''}\n\nData source: ${r.liveNote || 'self-reported answers only'}\n\nWhat we checked:\n${(r.factors || []).map((f) => `• ${f.name}: ${f.found} [${f.source === 'verified' ? 'VERIFIED LIVE' : 'self-reported'}] (${f.impact})`).join('\n')}\n\nYour next steps:\n${stepsText}\n\nReply to this email or grab an instant quote at clicknlikes.com and we'll build the fix plan with you.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: serviceLabel,
      forLine: `Prepared for your business · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: `${r.score}/100`, indexLabel: r.indexLabel, interpretation: r.interpretation,
      liveNote: r.liveNote, factors: r.factors || [], nextSteps: r.nextSteps || [],
    });
    sendFromClicknlikes({ toEmail: email, subject: `Your ${serviceLabel} report: ${r.indexLabel} ${r.score}/100`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New ${serviceLabel} tool lead: ${email}`,
      bodyText: `New "${serviceLabel}" free-tool lead:\n\nEmail: ${email}\nScore: ${r.score}/100 (${r.indexLabel})\nData source: ${r.liveNote ? 'includes LIVE verified data' : 'self-reported only'}\nGaps:\n${(r.gaps || []).map((g) => '  - ' + g).join('\n') || '  (none)'}\n\nInputs:\n${Object.entries(inputs).filter(([k]) => k !== '_page').map(([k, v]) => `  ${k}: ${String(v).slice(0, 200)}`).join('\n')}`,
    });

    setResult(r);
    setEmailedTo(email);
    setPhase('done');
  }

  function renderField(f) {
    if (f.type === 'email') return null; // rendered in the gate row
    if (f.type === 'heading') return <p key={f.id} className="pt-1 text-[12.5px] font-semibold text-navy">{f.label}</p>;
    if (f.type === 'checkbox') {
      return (
        <label key={f.id} className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-snug text-navy/80">
          <input type="checkbox" checked={vals[f.id]} onChange={(e) => set(f.id, e.target.checked)} className="mt-0.5 accent-teal" />
          {f.label}
        </label>
      );
    }
    if (f.type === 'select') {
      return (
        <div key={f.id}>
          <label className={labelCls}>{f.label}</label>
          <select value={vals[f.id]} onChange={(e) => set(f.id, e.target.value)} className={fieldCls}>
            {f.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
      );
    }
    if (f.type === 'range') {
      return (
        <div key={f.id}>
          <div className="flex items-center justify-between"><label className={labelCls + ' mb-0'}>{f.label}</label><span className="font-display text-sm font-bold text-teal-dark tabular-nums">{vals[f.id]}</span></div>
          <input type="range" min={f.min} max={f.max} step={f.step} value={vals[f.id]} onChange={(e) => set(f.id, parseInt(e.target.value, 10))} className="cnl-range mt-2 w-full" aria-label={f.label} />
        </div>
      );
    }
    if (f.type === 'textarea') {
      return (
        <div key={f.id}>
          <label className={labelCls}>{f.label} {f.optional && <span className="font-normal text-navy/45">(optional)</span>}</label>
          <textarea value={vals[f.id]} onChange={(e) => set(f.id, e.target.value)} rows={4} placeholder={f.placeholder} className={fieldCls} />
        </div>
      );
    }
    return (
      <div key={f.id}>
        <label className={labelCls}>{f.label} {f.optional && <span className="font-normal text-navy/45">(optional)</span>}</label>
        <input type={f.type === 'number' ? 'number' : f.type === 'url' ? 'text' : f.type} value={vals[f.id]} onChange={(e) => set(f.id, e.target.value)} placeholder={f.placeholder} className={fieldCls} />
      </div>
    );
  }

  if (phase === 'done' && result) {
    const verified = !!result.liveNote;
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">{result.indexLabel}</span>
          {verified ? <span className="text-xs font-semibold text-teal-dark">Includes live-verified data</span> : <span className="text-xs text-navy/50">Self-reported inputs</span>}
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold text-navy">{result.score}</span>
          <span className="text-sm text-navy/55">/100</span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-navy/75">{result.interpretation}</p>
        <ul className="mt-4 space-y-2">
          {result.bullets.map((b, i) => <li key={i} className="flex items-start gap-2 text-sm text-navy/80"><span className="text-teal-dark">▸</span><span>{b}</span></li>)}
        </ul>
        <p className={`mt-4 text-xs ${verified ? 'text-teal-dark' : 'text-navy/50'}`}>
          {verified ? `✓ Data source: ${result.liveNote}. Self-reported answers are labelled separately in your emailed report.` : 'Data source: self-reported answers only, no live check ran on this result.'}
        </p>
        {result.howToRead && <div className="mt-4 rounded-xl border border-navy/10 bg-off p-4 text-[13px] leading-relaxed text-navy/70"><b className="text-navy">How to read this:</b> {result.howToRead}</div>}
        <p className="mt-4 text-xs text-teal-dark">✓ Your full report (every factor + next steps) was emailed to {emailedTo}.</p>
        <div className="mt-5 rounded-xl border border-teal/30 bg-teal/[0.06] p-5">
          <p className="font-display text-base font-semibold text-navy">{result.pivotTitle}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-navy/70">{result.pivotText}</p>
          <a href="/pricing/#quote" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-dark hover:text-navy">Build my instant quote <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
        </div>
        <button type="button" onClick={() => { setPhase('idle'); setResult(null); }} className="mt-5 rounded-full border-[1.5px] border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal-dark">↩ Run again</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {config.fields.filter((f) => f.type !== 'email').map(renderField)}
      </div>
      <div className="mt-5 border-t border-navy/10 pt-5">
        <label className={labelCls}>{emailField.label}</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input type="email" required value={vals[emailField.id]} onChange={(e) => set(emailField.id, e.target.value)} placeholder="you@business.com" className={fieldCls + ' sm:flex-1'} />
          <button type="submit" disabled={phase === 'scanning'} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60">
            {phase === 'scanning' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />Scanning…</> : 'Get my score'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm font-medium text-coral">{error}</p>}
        <p className="mt-2 text-[11px] text-navy/45">Directional overview on screen; the full factor-by-factor report is emailed. Where you give a URL, we fetch the page live and label those rows verified.</p>
      </div>
    </form>
  );
}
