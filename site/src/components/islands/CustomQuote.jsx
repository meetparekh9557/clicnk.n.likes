// Custom Quote builder. A consultative, email-gated companion to the
// Instant Quote calculator: the visitor picks their industry, the
// services they want, a growth ambition level and a timeline, then gets
// back a personalised quote stamped with a Unique Quote reference,
// emailed via the shared engine and logged as a lead (same deployed
// Apps Script, no redeploy needed).
//
// Deliberate honesty call: industry NEVER changes the price - that would
// betray the transparent-pricing promise the whole page is built on. It
// tags the lead and sets sensible default services. Price scales only
// with scope/ambition: more work, more money, never with who is asking.
import { useState, useEffect } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes, buildReportEmailHtml, fact, hashStr } from '../../lib/engine';
import { getCurrency, loadRates, onCurrency, formatMoney } from '../../lib/currency.js';

const BASE_FEE = 16000;
const MIN_PROJECT = 16000;

const INDUSTRIES = [
  { key: 'saas', label: 'SaaS / Software', defaults: ['seo', 'content', 'aiseo'] },
  { key: 'manufacturing', label: 'Manufacturing / Industrial', defaults: ['seo', 'localseo', 'content'] },
  { key: 'legal', label: 'Legal / Professional services', defaults: ['seo', 'localseo', 'content'] },
  { key: 'd2c', label: 'D2C / eCommerce', defaults: ['social', 'paid', 'seo'] },
  { key: 'local', label: 'Local business', defaults: ['localseo', 'social', 'seo'] },
  { key: 'film', label: 'Film / Media', defaults: ['social', 'content', 'paid'] },
  { key: 'other', label: 'Something else', defaults: ['seo'] },
];

const SERVICES = {
  seo: { label: 'SEO', kind: 'monthly' },
  localseo: { label: 'Local SEO', kind: 'monthly' },
  aiseo: { label: 'AI SEO', kind: 'monthly' },
  social: { label: 'Social Media Growth', kind: 'monthly' },
  content: { label: 'Content Marketing', kind: 'monthly' },
  webdev: { label: 'Website Development', kind: 'onetime' },
  paid: { label: 'Paid Campaigns', kind: 'monthly' },
};
const SKEYS = Object.keys(SERVICES);

// Ambition scales the DEPTH of work (more keywords, more content, more
// campaigns), so a serious buyer lands higher by buying more, not by
// being charged more for their industry. mult applies above the base fee.
const AMBITION = {
  establish: { label: 'Establish', note: 'Get the fundamentals right', mult: 1.0 },
  grow: { label: 'Grow', note: 'Push steadily across channels', mult: 1.6 },
  dominate: { label: 'Dominate', note: 'Aggressive, category-leading push', mult: 2.4 },
};
const AKEYS = Object.keys(AMBITION);

const TIMELINES = ['Just exploring', 'Planning for the next 1-3 months', 'Ready to start now'];

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

export default function CustomQuote() {
  const [industry, setIndustry] = useState('saas');
  const [selected, setSelected] = useState(() => new Set(INDUSTRIES[0].defaults));
  const [ambition, setAmbition] = useState('grow');
  const [timeline, setTimeline] = useState(TIMELINES[1]);
  const [goal, setGoal] = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [cur, setCur] = useState('INR');
  const [rates, setRates] = useState(null);
  useEffect(() => {
    setCur(getCurrency());
    loadRates().then((r) => setRates(r.rates));
    return onCurrency((c) => setCur(c || getCurrency()));
  }, []);
  // Display in the visitor's currency; the emailed quote keeps INR, the
  // currency the work is actually billed in.
  const money = (n) => formatMoney(n, cur, rates);

  function pickIndustry(k) {
    setIndustry(k);
    setSelected(new Set(INDUSTRIES.find((i) => i.key === k).defaults));
    setResult(null);
  }
  function toggle(k) {
    setSelected((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
    setResult(null);
  }

  const sel = SKEYS.filter((k) => selected.has(k));

  function compute() {
    const mult = AMBITION[ambition].mult;
    let monthly = 0, onetime = 0;
    const lines = [];
    sel.forEach((k) => {
      const scope = Math.round(BASE_FEE * (mult - 1) * 0.75); // extra deliverables above base
      const amt = BASE_FEE + scope;
      if (SERVICES[k].kind === 'onetime') onetime += amt; else monthly += amt;
      lines.push({ label: SERVICES[k].label, amt, unit: SERVICES[k].kind === 'onetime' ? 'one-time' : '/month' });
    });
    const monthlyCount = sel.filter((k) => SERVICES[k].kind === 'monthly').length;
    const discountPct = monthlyCount >= 4 ? 0.15 : monthlyCount >= 2 ? 0.08 : 0;
    monthly = Math.round(monthly * (1 - discountPct));
    if (monthly > 0 && monthly < MIN_PROJECT) monthly = MIN_PROJECT;
    if (onetime > 0 && onetime < MIN_PROJECT) onetime = MIN_PROJECT;
    return { monthly, onetime, discountPct, lines };
  }

  function makeRef() {
    const seed = hashStr(email + industry + sel.join('') + ambition + Date.now());
    return 'CNL-' + seed.toString(36).toUpperCase().slice(-6).padStart(6, '0');
  }

  function submit(evt) {
    evt.preventDefault();
    if (!sel.length) return;
    const { monthly, onetime, discountPct, lines } = compute();
    const ref = makeRef();
    const indLabel = INDUSTRIES.find((i) => i.key === industry).label;
    const svcLabels = sel.map((k) => SERVICES[k].label).join(', ');
    const totalLine = [monthly > 0 ? money(monthly) + '/month' : null, onetime > 0 ? money(onetime) + ' one-time' : null].filter(Boolean).join(' + ');
    const totalLineInr = [monthly > 0 ? inr(monthly) + '/month' : null, onetime > 0 ? inr(onetime) + ' one-time' : null].filter(Boolean).join(' + ');

    const factors = [
      fact('Industry', indLabel, 'self', 'noted'),
      fact('Services', svcLabels, 'self', 'selected'),
      fact('Growth ambition', `${AMBITION[ambition].label} - ${AMBITION[ambition].note}`, 'self', 'selected'),
      fact('Timeline', timeline, 'self', 'noted'),
      ...lines.map((l) => fact(l.label, money(l.amt) + ' ' + l.unit, 'self', 'quote line')),
    ];
    if (discountPct > 0) factors.push(fact('Bundle discount', `${Math.round(discountPct * 100)}% off monthly`, 'self', 'applied'));
    if (goal.trim()) factors.push(fact('What success looks like', goal.trim(), 'self', 'noted'));

    const curNote = cur !== 'INR' && rates && rates[cur] ? ` These figures are shown in ${cur} at today's exchange rate; your written proposal confirms the final amount in ${cur}.` : '';
    const interpretation = `This is your personalised quote (reference ${ref}) for a ${AMBITION[ambition].label.toLowerCase()} push across ${svcLabels}. Every service includes a flat ${money(16000)} base and scales with the depth of work, never with your industry.${curNote} Reply with your reference and we build the written proposal around exactly this.`;

    const notes = [];
    if (selected.has('paid')) notes.push('Ad spend is billed directly from your card on the ad platform, separate from this fee.');
    if (selected.has('social')) notes.push('Shoot production, if needed, is arranged through our partner and billed separately.');
    if (discountPct > 0) notes.push(`A ${Math.round(discountPct * 100)}% multi-service bundle discount is included above.`);
    notes.push(`Quote your reference ${ref} when you reply, and the written proposal is built around exactly this scope.`);

    const bodyText = `Hi,\n\nHere is your custom quote from Click.n.likes for ${business || 'your business'}.\n\nUnique quote reference: ${ref}\nIndustry: ${indLabel}\nServices: ${svcLabels}\nGrowth ambition: ${AMBITION[ambition].label}\nTimeline: ${timeline}\n\nIndicative investment: ${totalLine}\n\nLine items:\n${lines.map((l) => `• ${l.label}: ${money(l.amt)} ${l.unit}`).join('\n')}\n\n${goal.trim() ? `What success looks like for you:\n${goal.trim()}\n\n` : ''}Notes:\n${notes.map((n) => `• ${n}`).join('\n')}\n\nReply to this email to turn it into a written proposal.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;

    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'Custom Quote',
      forLine: `Reference ${ref} · Prepared for ${business || 'your business'} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: totalLine || '—',
      indexLabel: 'Your indicative custom investment',
      interpretation, liveNote: null, factors, nextSteps: notes,
    });

    sendFromClicknlikes({ toEmail: email, toName: business, subject: `Your custom quote from Click.n.likes (${ref})`, bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New custom-quote lead: ${business || email} (${ref})`,
      bodyText: `New custom quote ${ref}:\n\nBusiness: ${business}\nEmail: ${email}\nProspect currency: ${cur}\nIndustry: ${indLabel}\nServices: ${svcLabels}\nAmbition: ${AMBITION[ambition].label}\nTimeline: ${timeline}\nInvestment: ${totalLine}${cur !== 'INR' ? ` (INR base: ${totalLineInr})` : ''}\nGoal: ${goal.trim() || '-'}`,
    });

    setSending(true);
    setTimeout(() => { setSending(false); setResult({ ref, monthly, onetime, lines, discountPct }); }, 700);
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8 lg:grid-cols-[1.25fr_0.75fr]">
      <div>
        <label className="block text-[13px] font-semibold text-navy">1. Your industry</label>
        <select
          value={industry}
          onChange={(e) => pickIndustry(e.target.value)}
          className="mt-2 w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal"
        >
          {INDUSTRIES.map((i) => <option key={i.key} value={i.key}>{i.label}</option>)}
        </select>
        <p className="mt-1.5 text-[11px] text-navy/45">This tailors the recommendation and your proposal. It never changes your price.</p>

        <p className="mt-6 text-[13px] font-semibold text-navy">2. What you want built</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SKEYS.map((k) => (
            <button key={k} type="button" onClick={() => toggle(k)}
              className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${selected.has(k) ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>
              {SERVICES[k].label}
            </button>
          ))}
        </div>

        <p className="mt-6 text-[13px] font-semibold text-navy">3. How hard you want to push</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {AKEYS.map((a) => (
            <button key={a} type="button" onClick={() => { setAmbition(a); setResult(null); }}
              className={`rounded-xl border-[1.5px] px-3 py-3 text-left transition-colors ${ambition === a ? 'border-teal bg-teal/[0.06]' : 'border-navy/10 hover:border-teal/40'}`}>
              <span className="block text-[13px] font-bold text-navy">{AMBITION[a].label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-navy/55">{AMBITION[a].note}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[13px] font-semibold text-navy">4. Timeline</label>
            <select value={timeline} onChange={(e) => setTimeline(e.target.value)}
              className="mt-2 w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal">
              {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-navy">5. What would success look like?</label>
            <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. 40 qualified leads a month"
              className="mt-2 w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none focus:border-teal" />
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        {result ? (
          <div className="rounded-xl border border-teal/40 bg-teal/[0.06] p-5">
            <p className="text-[11px] font-bold tracking-[0.08em] text-teal-dark uppercase">Your unique quote</p>
            {result.monthly > 0 && <p className="mt-1 font-display text-[clamp(1.6rem,4vw,2.3rem)] leading-none font-bold text-navy tabular-nums">{money(result.monthly)}<span className="text-base font-semibold text-navy/55">/month</span></p>}
            {result.onetime > 0 && <p className="mt-1 font-display text-xl font-bold text-navy tabular-nums">{money(result.onetime)}<span className="text-sm font-semibold text-navy/55"> one-time</span></p>}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-navy px-3 py-1.5">
              <span className="text-[10px] font-semibold tracking-[0.08em] text-white/50 uppercase">Ref</span>
              <span className="font-display text-[13px] font-bold tracking-[0.05em] text-white tabular-nums">{result.ref}</span>
            </div>
            <ul className="mt-4 space-y-1.5 border-t border-navy/10 pt-3 text-[12.5px] text-navy/65">
              {result.lines.map((l) => <li key={l.label} className="flex justify-between gap-2"><span>{l.label}</span><span className="tabular-nums whitespace-nowrap">{money(l.amt)} {l.unit}</span></li>)}
            </ul>
            {cur !== 'INR' && <p className="mt-3 text-[11px] leading-relaxed text-navy/50">Shown in {cur} at today's exchange rate. Your quote is confirmed in {cur} in the written proposal.</p>}
            <p className="mt-4 text-[12.5px] leading-relaxed text-navy/70">
              {autoEmailReady ? <>Sent to <b>{email}</b> with reference <b>{result.ref}</b>. Reply with that reference and we build the written proposal around exactly this scope.</> : <>Your details and reference <b>{result.ref}</b> are logged, and a strategist will follow up with the written proposal.</>}
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col rounded-xl border border-navy/10 bg-off/60 p-5">
            <p className="text-[11px] font-bold tracking-[0.08em] text-navy/45 uppercase">Your custom quote</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-navy/65">
              Enter your email and we build your number now, stamp it with a unique reference, and send the full breakdown you can reply to.
            </p>
            <form onSubmit={submit} className="mt-auto grid gap-3 pt-5">
              <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name (optional)"
                className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" aria-label="Your email"
                className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <button type="submit" disabled={sending || sel.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-50">
                {sending ? 'Building your quote…' : 'Get my unique quote'}
              </button>
              {sel.length === 0 && <p className="text-[12px] text-coral">Pick at least one service above.</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
