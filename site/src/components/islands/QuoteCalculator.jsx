// Instant Quote calculator. Ported from v1's pricing engine: every
// service's base fee is a flat ₹16,000 (digit sum 7); the base already
// bundles a fixed "included" baseline of each deliverable, so a client at
// baseline pays exactly ₹16,000 for that service. Above the baseline you
// pay base + Σ(extra × rate) - the honest sum of line items, never rounded
// to a nicer number. Bundle discount and the ₹16,000 project floor match
// v1. An email sends the itemised quote via the shared engine.
import { useState, useEffect } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes, buildReportEmailHtml, fact } from '../../lib/engine';
import { getCurrency, loadRates, onCurrency, formatMoney } from '../../lib/currency.js';
import { useCountUp } from '../../lib/useCountUp.js';

const BASE_FEE = 16000;
const MIN_PROJECT = 16000;

const SERVICES = {
  seo: { label: 'SEO (Organic & On-Page)', kind: 'monthly' },
  localseo: { label: 'Local SEO & Google Business', kind: 'monthly' },
  aiseo: { label: 'AI SEO & AI Overviews', kind: 'monthly' },
  social: { label: 'Social Media Growth', kind: 'monthly' },
  content: { label: 'Content Marketing', kind: 'monthly' },
  webdev: { label: 'Website Development', kind: 'onetime' },
  paid: { label: 'Paid Campaigns', kind: 'monthly' },
};

// Quantity is the TOTAL of each deliverable; `included` is what the base
// fee already covers, so extra = max(0, qty - included).
const UNITS = {
  seo: [
    { key: 'keywords', label: 'Keywords tracked & optimised', type: 'flat', price: 500, included: 10, max: 160, step: 5 },
    { key: 'blogs', label: 'SEO-supporting blog posts', type: 'wordblog', price: 1500, includedWords: 2000, overWordRate: 0.7, included: 4, max: 20, step: 1 },
  ],
  localseo: [
    { key: 'gbpposts', label: 'Google Business Profile posts', type: 'flat', price: 800, included: 8, max: 38, step: 1 },
    { key: 'citations', label: 'Local citations / backlinks', type: 'flat', price: 1000, included: 3, max: 23, step: 1 },
  ],
  aiseo: [
    { key: 'aipages', label: 'Pages rewritten answer-first for AI', type: 'flat', price: 2000, included: 3, max: 23, step: 1 },
    { key: 'schema', label: 'Schema / structured-data pages', type: 'flat', price: 1500, included: 2, max: 22, step: 1 },
  ],
  social: [
    { key: 'posts', label: 'Feed posts', type: 'flat', price: 700, included: 6, max: 66, step: 1 },
    { key: 'reels', label: 'Reels', type: 'flat', price: 1500, included: 6, max: 36, step: 1 },
  ],
  content: [
    { key: 'pieces', label: 'Blogs / landing pages', type: 'wordblog', price: 1500, includedWords: 2000, overWordRate: 0.7, included: 7, max: 27, step: 1 },
  ],
  webdev: [
    { key: 'pages', label: 'Website pages', type: 'flat', price: 4500, included: 1, max: 41, step: 1 },
  ],
  paid: [
    { key: 'campaigns', label: 'Campaigns managed', type: 'flat', price: 5000, included: 1, max: 11, step: 1 },
    { key: 'creatives', label: 'Ad creatives designed', type: 'flat', price: 1200, included: 6, max: 46, step: 1 },
  ],
};

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const unitRate = (u, words) => (u.type === 'wordblog' ? u.price + Math.max(0, (words || u.includedWords) - u.includedWords) * u.overWordRate : u.price);

const KEYS = Object.keys(SERVICES);

export default function QuoteCalculator({ preselect }) {
  const [selected, setSelected] = useState(() => new Set(preselect ? [preselect] : ['seo']));
  const [qty, setQty] = useState({}); // `${svc}.${unit}` -> total qty
  const [words, setWords] = useState({}); // `${svc}.${unit}` -> avg words
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [cur, setCur] = useState('INR');
  const [rates, setRates] = useState(null);
  useEffect(() => {
    setCur(getCurrency());
    loadRates().then((r) => setRates(r.rates));
    return onCurrency((c) => setCur(c || getCurrency()));
  }, []);
  // Display in the visitor's currency; `inr()` stays for the emailed
  // quote, which is documented in the INR the work is billed in.
  const money = (n) => formatMoney(n, cur, rates);

  const getQty = (s, u) => qty[`${s}.${u.key}`] ?? u.included;
  const getWords = (s, u) => words[`${s}.${u.key}`] ?? u.includedWords;

  function toggle(k) {
    setSelected((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  // ---- pricing (ported from v1 qcCompute) ----
  const sel = KEYS.filter((k) => selected.has(k));
  const lines = [];
  let monthly = 0, onetime = 0;
  sel.forEach((k) => {
    let amt = BASE_FEE;
    UNITS[k].forEach((u) => {
      const extra = Math.max(0, getQty(k, u) - u.included);
      amt += extra * unitRate(u, getWords(k, u));
    });
    if (SERVICES[k].kind === 'onetime') onetime += amt; else monthly += amt;
    lines.push({ label: SERVICES[k].label, amt, unit: SERVICES[k].kind === 'onetime' ? 'one-time' : '/month' });
  });
  let discountPct = sel.length >= 4 ? 0.15 : sel.length >= 2 ? 0.08 : 0;
  monthly = Math.round(monthly * (1 - discountPct));
  if (sel.length && monthly > 0 && monthly < MIN_PROJECT) monthly = MIN_PROJECT;
  if (sel.length === 1 && SERVICES[sel[0]].kind === 'onetime' && onetime < MIN_PROJECT) onetime = MIN_PROJECT;

  // Count-up the two headline totals so a slider drag reads as a live tally.
  const monthlyView = useCountUp(monthly);
  const onetimeView = useCountUp(onetime);

  const notes = [];
  if (selected.has('paid')) notes.push('Ad spend is billed directly from your card on the ad platform (Meta / Google) and is not included in the total above.');
  if (selected.has('social')) notes.push('Photo / video shoot production is arranged through our shoot partner agency and billed separately.');
  if (discountPct > 0) notes.push(`A ${Math.round(discountPct * 100)}% multi-service bundle discount has been applied to the monthly services above.`);

  function submit(evt) {
    evt.preventDefault();
    const factors = lines.map((l) => fact(l.label, money(l.amt) + ' ' + l.unit, 'self', 'quote line'));
    if (discountPct > 0) factors.push(fact('Bundle discount', `${Math.round(discountPct * 100)}% off monthly`, 'self', 'applied'));
    const totalLine = [monthly > 0 ? money(monthly) + '/month' : null, onetime > 0 ? money(onetime) + ' one-time' : null].filter(Boolean).join(' + ');
    const curNote = cur !== 'INR' && rates && rates[cur] ? ` These figures are shown in ${cur} at today's exchange rate; your written proposal confirms the final amount in ${cur}.` : '';
    const interpretation = `Based on the services and quantities you selected, your indicative investment is ${totalLine}. Every service includes a flat ${money(16000)} base (strategy, account management and reporting) plus the exact line items you chose above it.${curNote}`;
    const bodyText = `Hi,\n\nHere is your instant quote from Click.n.likes for ${business || 'your business'}:\n\n${interpretation}\n\nLine items:\n${lines.map((l) => `• ${l.label}: ${money(l.amt)} ${l.unit}`).join('\n')}\n\nNotes:\n${notes.map((n) => `• ${n}`).join('\n')}\n\nReply to this email to turn this into a written proposal, or reach us at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'Instant Quote',
      forLine: `Prepared for ${business || 'your business'} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: totalLine || '—',
      indexLabel: 'Your indicative investment',
      interpretation, liveNote: null, factors, nextSteps: notes,
    });
    sendFromClicknlikes({ toEmail: email, toName: business, subject: 'Your instant quote from Click.n.likes', bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New instant-quote lead: ${business || email}`,
      bodyText: `New instant quote:\n\nBusiness: ${business}\nEmail: ${email}\nProspect currency: ${cur}\nServices: ${sel.map((k) => SERVICES[k].label).join(', ')}\nMonthly: ${inr(monthly)} | One-time: ${inr(onetime)} | Discount: ${Math.round(discountPct * 100)}% (INR base)\n\nLines (INR):\n${lines.map((l) => `  ${l.label}: ${inr(l.amt)} ${l.unit}`).join('\n')}`,
    });
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 600);
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="text-[13px] font-semibold text-navy">1. Pick your services</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {KEYS.map((k) => (
            <button key={k} type="button" onClick={() => toggle(k)}
              className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${selected.has(k) ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>
              {SERVICES[k].label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-6">
          {sel.map((k) => (
            <div key={k} className="rounded-xl border border-navy/10 p-4">
              <p className="text-[13px] font-bold text-navy">{SERVICES[k].label} <span className="font-normal text-navy/45">· ₹16,000 base {SERVICES[k].kind === 'onetime' ? 'one-time' : '/month'}</span></p>
              {UNITS[k].map((u) => {
                const q = getQty(k, u); const extra = Math.max(0, q - u.included);
                const w = getWords(k, u);
                return (
                  <div key={u.key} className="mt-3">
                    <div className="flex items-center justify-between text-[12.5px]">
                      <span className="font-medium text-navy/80">{u.label}</span>
                      <span className="font-display font-bold text-teal-dark tabular-nums">{q}{extra > 0 ? ` (+${money(extra * unitRate(u, w))})` : ''}</span>
                    </div>
                    <input type="range" min={u.included} max={u.max} step={u.step} value={q}
                      onChange={(e) => setQty((p) => ({ ...p, [`${k}.${u.key}`]: parseInt(e.target.value, 10) }))}
                      className="cnl-range mt-1.5 w-full" aria-label={u.label} />
                    <p className="text-[11px] text-navy/45">{u.included} included · {money(u.price)} each extra{u.type === 'wordblog' ? ` up to ${u.includedWords} words` : ''}</p>
                    {u.type === 'wordblog' && extra > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[12px]"><span className="text-navy/60">Avg words per piece</span><span className="font-display font-bold text-navy tabular-nums">{w}</span></div>
                        <input type="range" min={u.includedWords} max={4000} step={100} value={w}
                          onChange={(e) => setWords((p) => ({ ...p, [`${k}.${u.key}`]: parseInt(e.target.value, 10) }))}
                          className="cnl-range mt-1 w-full" aria-label={`${u.label} words`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {sel.length === 0 && <p className="text-sm text-navy/50">Select at least one service to see your quote.</p>}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="rounded-xl border border-teal/40 bg-teal/[0.06] p-5">
          <p className="text-[11px] font-bold tracking-[0.08em] text-teal-dark uppercase">Your indicative quote</p>
          {monthly > 0 && <p className="mt-1 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none font-bold text-navy tabular-nums">{money(monthlyView)}<span className="text-base font-semibold text-navy/55">/month</span></p>}
          {onetime > 0 && <p className="mt-2 font-display text-2xl font-bold text-navy tabular-nums">{money(onetimeView)}<span className="text-sm font-semibold text-navy/55"> one-time</span></p>}
          {sel.length === 0 && <p className="mt-1 font-display text-xl font-bold text-navy/40">—</p>}
          <ul className="mt-4 space-y-1.5 border-t border-navy/10 pt-3 text-[12.5px] text-navy/65">
            {lines.map((l) => <li key={l.label} className="flex justify-between gap-2"><span>{l.label}</span><span className="tabular-nums whitespace-nowrap">{money(l.amt)} {l.unit}</span></li>)}
          </ul>
          <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-navy/50">
            {notes.map((n, i) => <li key={i}>· {n}</li>)}
          </ul>
          {cur !== 'INR' && <p className="mt-2 text-[11px] leading-relaxed text-navy/45">Shown in {cur} at today's exchange rate. Your quote is confirmed in {cur} in the written proposal.</p>}
        </div>

        {sent ? (
          <div className="mt-5 rounded-xl border border-teal/40 bg-white p-5 text-sm">
            <p className="font-display font-semibold text-navy">✓ Your quote is on its way{business ? `, ${business}` : ''}.</p>
            <p className="mt-1 text-navy/65">{autoEmailReady ? <>The itemised quote was emailed to <b>{email}</b>. Not there in a minute? Check spam.</> : 'Your details are logged and a strategist will follow up with the written proposal.'}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5">
            <p className="mb-2 text-[13px] font-semibold text-navy">Email me this quote</p>
            <div className="grid gap-3">
              <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name (optional)" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" aria-label="Your email" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <button type="submit" disabled={sending || sel.length === 0} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-50">
                {sending ? 'Sending…' : 'Email me this quote'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
