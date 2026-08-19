// Plan builder. Each service is set at a tier (Starter / Growth / Pro +
// Custom) — the tier sets both the base package price AND the baseline volume
// each deliverable includes (benchmarked against real agency pricing). Sliders
// let a client add above their tier's baseline at the honest per-unit rate.
// Two or more services take a flat 15% discount; project duration decides free
// months (1/3 = full, 6 = pay 5, 12 = pay 10). Website is a one-time build
// (from a 5-page base) outside the duration; Paid is a monthly management fee
// with ad spend billed to the client directly. Prices are authored in INR and
// shown in the visitor's currency; the emailed quote is documented in INR.
import { useState, useEffect } from 'react';
import { OWNER_EMAIL, sendFromClicknlikes, buildReportEmailHtml, fact } from '../../lib/engine';
import { getCurrency, loadRates, onCurrency, formatMoney, usableCurrency } from '../../lib/currency.js';
import { useCountUp } from '../../lib/useCountUp.js';

// 3 tiers + Custom (benchmarked to the market — see docs). Each sets the base
// monthly package price (one-time for a website); Custom is quoted separately.
const TIERS = [
  { id: 'starter', name: 'Starter', price: 16000 },
  { id: 'growth', name: 'Growth', price: 50000 },
  { id: 'pro', name: 'Pro', price: 124000 },
  { id: 'custom', name: 'Custom', price: null },
];
const tierById = (id) => TIERS.find((t) => t.id === id) || TIERS[0];

// Duration -> months actually charged (the rest are free).
const DURATIONS = [
  { m: 1, charged: 1 },
  { m: 3, charged: 3 },
  { m: 6, charged: 5 },
  { m: 12, charged: 10 },
];

const SERVICES = {
  seo: { label: 'SEO (Organic & On-Page)', kind: 'monthly' },
  localseo: { label: 'Local SEO & Google Business', kind: 'monthly' },
  aiseo: { label: 'AI SEO & AI Overviews', kind: 'monthly' },
  social: { label: 'Social Media Growth', kind: 'monthly' },
  content: { label: 'Content Marketing', kind: 'monthly' },
  webdev: { label: 'Website Development', kind: 'onetime' },
  paid: { label: 'Paid Campaigns', kind: 'monthly' },
};

// Add-on sliders. `included` is per tier — the baseline each tier's price
// already covers, benchmarked to real agency inclusions. extra = max(0, qty -
// included at the active tier), charged at the per-unit rate.
const UNITS = {
  seo: [
    { key: 'keywords', label: 'Keywords tracked & optimised', type: 'flat', price: 500, included: { starter: 15, growth: 30, pro: 50 }, max: 200, step: 5 },
    { key: 'blogs', label: 'SEO-supporting blog posts', type: 'wordblog', price: 1500, includedWords: 2000, overWordRate: 0.7, included: { starter: 4, growth: 8, pro: 12 }, max: 30, step: 1 },
    { key: 'guestposts', label: 'Guest posts / backlinks', type: 'flat', price: 3500, included: { starter: 1, growth: 3, pro: 6 }, max: 20, step: 1 },
  ],
  localseo: [
    { key: 'gbpposts', label: 'Google Business Profile posts', type: 'flat', price: 800, included: { starter: 8, growth: 16, pro: 30 }, max: 60, step: 1 },
    { key: 'citations', label: 'Local citations / backlinks', type: 'flat', price: 1000, included: { starter: 4, growth: 10, pro: 20 }, max: 40, step: 1 },
  ],
  aiseo: [
    { key: 'aipages', label: 'Pages made answer-first for AI', type: 'flat', price: 2000, included: { starter: 3, growth: 8, pro: 15 }, max: 30, step: 1 },
    { key: 'schema', label: 'Schema / structured-data pages', type: 'flat', price: 1500, included: { starter: 2, growth: 6, pro: 12 }, max: 30, step: 1 },
  ],
  social: [
    { key: 'posts', label: 'Social posts / month (feed + reels)', type: 'flat', price: 1000, included: { starter: 12, growth: 20, pro: 30 }, max: 60, step: 1 },
  ],
  content: [
    { key: 'pieces', label: 'Blogs / landing pages', type: 'wordblog', price: 1500, includedWords: 2000, overWordRate: 0.7, included: { starter: 4, growth: 8, pro: 12 }, max: 30, step: 1 },
  ],
  webdev: [
    { key: 'pages', label: 'Website pages', type: 'flat', price: 4500, included: { starter: 5, growth: 12, pro: 20 }, max: 45, step: 1 },
  ],
  paid: [
    { key: 'campaigns', label: 'Campaigns managed', type: 'flat', price: 5000, included: { starter: 2, growth: 4, pro: 6 }, max: 15, step: 1 },
    { key: 'creatives', label: 'Ad creatives designed', type: 'flat', price: 1200, included: { starter: 6, growth: 14, pro: 24 }, max: 50, step: 1 },
  ],
};

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const unitRate = (u, words) => (u.type === 'wordblog' ? u.price + Math.max(0, (words || u.includedWords) - u.includedWords) * u.overWordRate : u.price);
// The baseline this unit includes at the given tier (falls back to Starter).
const incOf = (u, tierId) => (u.included && typeof u.included === 'object' ? (u.included[tierId] ?? u.included.starter) : u.included);
const KEYS = Object.keys(SERVICES);

export default function QuoteCalculator({ preselect, thankYouHref }) {
  const [selected, setSelected] = useState(() => new Set(preselect ? [preselect] : ['seo']));
  const [tierOf, setTierOf] = useState({}); // svc -> tier id
  const [qty, setQty] = useState({}); // `${svc}.${unit}` -> total qty
  const [words, setWords] = useState({}); // `${svc}.${unit}` -> avg words
  const [duration, setDuration] = useState(3);
  const [name, setName] = useState('');
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [cur, setCur] = useState('INR');
  const [rates, setRates] = useState(null);
  useEffect(() => {
    setCur(getCurrency());
    loadRates().then((r) => setRates(r.rates));
    return onCurrency((c) => setCur(c || getCurrency()));
  }, []);
  // One currency per view: without live rates this resolves to INR so a
  // converted figure never sits beside a rupee one.
  const shown = usableCurrency(cur);
  const money = (n) => formatMoney(n, shown, rates);

  const getTier = (s) => tierOf[s] ?? 'starter';
  // qty defaults to (and never drops below) the active tier's included baseline.
  const getQty = (s, u) => {
    const inc = incOf(u, getTier(s));
    const stored = qty[`${s}.${u.key}`];
    return stored != null ? Math.max(stored, inc) : inc;
  };
  const getWords = (s, u) => words[`${s}.${u.key}`] ?? u.includedWords;

  function toggle(k) {
    setSelected((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  }

  // ---- pricing ----
  const sel = KEYS.filter((k) => selected.has(k));
  const dur = DURATIONS.find((d) => d.m === duration) || DURATIONS[1];
  const lines = [];
  let monthlySub = 0, onetimeSub = 0, hasCustom = false;
  sel.forEach((k) => {
    const tier = tierById(getTier(k));
    if (tier.price == null) { hasCustom = true; lines.push({ label: SERVICES[k].label, custom: true, tier: tier.name }); return; }
    let amt = tier.price;
    UNITS[k].forEach((u) => {
      const extra = Math.max(0, getQty(k, u) - incOf(u, getTier(k)));
      amt += extra * unitRate(u, getWords(k, u));
    });
    if (SERVICES[k].kind === 'onetime') onetimeSub += amt; else monthlySub += amt;
    lines.push({ label: SERVICES[k].label, amt, tier: tier.name, unit: SERVICES[k].kind === 'onetime' ? 'one-time' : '/month' });
  });
  const multi = sel.length >= 2 ? 0.15 : 0;
  const monthlyNet = Math.round(monthlySub * (1 - multi));
  const onetimeNet = Math.round(onetimeSub * (1 - multi));
  const monthlyForDuration = monthlyNet * dur.charged;
  const grand = monthlyForDuration + onetimeNet;
  const freeMonths = dur.m - dur.charged;
  // What the client keeps: the free months, plus the 15% off across the paid
  // months of the monthly services and the one-time build.
  const savings = Math.round(monthlyNet * freeMonths + monthlySub * multi * dur.charged + onetimeSub * multi);

  // The term is paid once, up front, so the headline is the whole amount due
  // — with the monthly equivalent shown underneath so the value still reads.
  const heroAmount = grand;
  const heroView = useCountUp(heroAmount);

  const notes = [];
  if (monthlyNet > 0) notes.push(`The ${dur.m}-month term is invoiced once, up front. If we part ways early, every month you have paid for but not received is refunded in full within 14 working days.`);
  if (multi) notes.push('A 15% multi-service discount is applied because you selected more than one service.');
  if (freeMonths) notes.push(`You pay for ${dur.charged} months and receive ${dur.m} — ${freeMonths} month${freeMonths > 1 ? 's' : ''} free for committing to the full term.`);
  if (selected.has('webdev')) notes.push('The website fee covers the build and basic content. Your domain, hosting and any CMS licence are purchased in your own name and billed to you directly, never routed through us.');
  if (selected.has('paid')) notes.push('Ad spend is billed directly from your card on the ad platform (Meta / Google) and is not included in the total above.');
  if (selected.has('social')) notes.push('Photo / video shoot production is arranged through our shoot partner agency and billed separately.');
  if (hasCustom) notes.push('Services set to Custom are scoped and quoted with you separately, and are not in the figure above.');

  function submit(evt) {
    evt.preventDefault();
    const factors = lines.map((l) => fact(l.label + (l.tier ? ` · ${l.tier}` : ''), l.custom ? 'Custom — quoted separately' : money(l.amt) + ' ' + l.unit, 'self', 'plan line'));
    if (multi) factors.push(fact('Multi-service discount', '15% off', 'self', 'applied'));
    factors.push(fact('Project duration', `${dur.m} month${dur.m > 1 ? 's' : ''}${freeMonths ? ` · pay ${dur.charged}, ${freeMonths} free` : ''}`, 'self', 'selected'));
    const totalLine = [monthlyForDuration > 0 ? money(monthlyForDuration) + ` for ${dur.m} month${dur.m > 1 ? 's' : ''}` : null, onetimeNet > 0 ? money(onetimeNet) + ' one-time' : null].filter(Boolean).join(' + ');
    const curNote = shown !== 'INR' ? ` These figures are shown in ${shown} at today's exchange rate; your written proposal confirms the final amount in ${shown}.` : '';
    const termLine = monthlyNet > 0 ? ` The term is invoiced once, up front, and works out to ${money(monthlyNet)} a month${freeMonths ? `, with ${freeMonths} month${freeMonths > 1 ? 's' : ''} free for committing to the full term` : ''}. If we part ways early, any month paid for but not delivered is refunded in full.` : '';
    const interpretation = `Based on the services, tiers and duration you selected, your indicative investment is ${totalLine || '—'}.${termLine} Each service starts at its tier base (strategy, management and reporting) plus the add-ons you dialled in.${curNote}`;
    const bodyText = `Hi ${name || 'there'},\n\nHere is your plan from Click.n.likes for ${business || 'your business'}:\n\n${interpretation}\n\nLine items:\n${lines.map((l) => `• ${l.label}${l.tier ? ` (${l.tier})` : ''}: ${l.custom ? 'Custom — quoted separately' : money(l.amt) + ' ' + l.unit}`).join('\n')}\n\nNotes:\n${notes.map((n) => `• ${n}`).join('\n')}\n\nReply to this email to turn this into a written proposal, or reach us at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'Your plan',
      forLine: `Prepared for ${business || 'your business'} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: totalLine || '—',
      indexLabel: 'Your indicative investment',
      interpretation, liveNote: null, factors, nextSteps: notes,
    });
    sendFromClicknlikes({ toEmail: email, toName: name, subject: 'Your plan from Click.n.likes', bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New plan-builder lead: ${name || business || email}`,
      bodyText: `New plan:\n\nName: ${name}\nBusiness: ${business}\nEmail: ${email}\nPhone: ${phone || '-'}\nProspect currency: ${cur}\nDuration: ${dur.m} months (pay ${dur.charged})\nDiscount: ${Math.round(multi * 100)}% (INR base)\n\nLines (INR):\n${lines.map((l) => `  ${l.label}${l.tier ? ` (${l.tier})` : ''}: ${l.custom ? 'Custom' : inr(l.amt) + ' ' + l.unit}`).join('\n')}\n\nMonthly net: ${inr(monthlyNet)} | Over ${dur.m}mo: ${inr(monthlyForDuration)} | One-time: ${inr(onetimeNet)} | Grand: ${inr(grand)}`,
    });
    setSending(true);
    setTimeout(() => { window.location.href = thankYouHref; }, 600);
  }

  return (
    <div className="grid gap-6 rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div>
        <p className="text-[13px] font-semibold text-navy">Pick your services</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {KEYS.map((k) => (
            <button key={k} type="button" onClick={() => toggle(k)}
              className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${selected.has(k) ? 'border-teal bg-teal/10 text-navy' : 'border-navy/10 text-navy/60 hover:border-teal/40'}`}>
              {SERVICES[k].label}
            </button>
          ))}
        </div>

        {/* Duration — sits directly under the service chips, as pills that
            match them, so the commitment is set before the detail below. */}
        {sel.length > 0 && (
          <div className="mt-5">
            <p className="text-[13px] font-semibold text-navy">Project duration</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DURATIONS.map((d) => {
                const free = d.m - d.charged;
                return (
                  <button key={d.m} type="button" onClick={() => setDuration(d.m)}
                    className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-semibold transition-colors ${duration === d.m ? 'border-teal-dark bg-teal-dark text-white' : 'border-navy/10 bg-teal/[0.06] text-navy/70 hover:border-teal'}`}>
                    {d.m} month{d.m > 1 ? 's' : ''}
                    {free > 0 && <span className={duration === d.m ? 'text-white/85' : 'text-teal-dark'}> · {free} free</span>}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-navy/45">Applies to the monthly services. A website build is one-time.</p>
          </div>
        )}

        <div className="mt-6 space-y-6">
          {sel.map((k) => {
            const activeTier = getTier(k);
            const isCustom = tierById(activeTier).price == null;
            return (
              <div key={k} className="rounded-xl border border-navy/10 p-4">
                <p className="text-[13px] font-bold text-navy">{SERVICES[k].label} <span className="font-normal text-navy/45">· {SERVICES[k].kind === 'onetime' ? 'one-time build' : 'monthly'}</span></p>
                {/* Tier picker */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {TIERS.map((t) => (
                    <button key={t.id} type="button"
                      onClick={() => {
                        setTierOf((p) => ({ ...p, [k]: t.id }));
                        if (t.price == null && typeof document !== 'undefined') {
                          document.getElementById('custom')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold tabular-nums transition-colors ${activeTier === t.id ? 'border-teal-dark bg-teal-dark text-white' : 'border-navy/10 bg-teal/[0.06] text-navy/70 hover:border-teal'}`}>
                      {t.price == null ? 'Custom →' : `${t.name} ${money(t.price)}`}
                    </button>
                  ))}
                </div>
                {/* Add-on sliders (hidden for Custom) */}
                {isCustom ? (
                  <p className="mt-3 text-[12px] text-navy/55">We'll scope and quote this one with you — it stays out of the running total.</p>
                ) : (
                  UNITS[k].map((u) => {
                    const inc = incOf(u, activeTier);
                    const q = getQty(k, u); const extra = Math.max(0, q - inc);
                    const w = getWords(k, u);
                    return (
                      <div key={u.key} className="mt-3">
                        <div className="flex items-center justify-between text-[12.5px]">
                          <span className="font-medium text-navy/80">{u.label}</span>
                          <span className="font-display font-bold text-teal-dark tabular-nums">{q}{extra > 0 ? ` (+${money(extra * unitRate(u, w))})` : ''}</span>
                        </div>
                        <input type="range" min={inc} max={u.max} step={u.step} value={q}
                          onChange={(e) => setQty((p) => ({ ...p, [`${k}.${u.key}`]: parseInt(e.target.value, 10) }))}
                          className="cnl-range mt-1.5 w-full" aria-label={u.label} />
                        <p className="text-[11px] text-navy/45">{inc} included · {money(u.price)} each extra{u.type === 'wordblog' ? ` up to ${u.includedWords} words` : ''}</p>
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
                  })
                )}
              </div>
            );
          })}
          {sel.length === 0 && <p className="text-sm text-navy/50">Select at least one service to build your plan.</p>}
        </div>

      </div>

      <div className="flex flex-col">
        <div className="rounded-xl border border-teal/40 bg-teal/[0.06] p-5">
          <p className="text-[11px] font-bold tracking-[0.08em] text-teal-dark uppercase">Your plan</p>
          <p className="mt-1 font-display text-[clamp(1.7rem,4vw,2.4rem)] leading-none font-bold text-navy tabular-nums">
            {!sel.length ? '—' : heroAmount > 0 ? (
              <>
                {money(heroView)}
                {hasCustom && <span className="text-base font-semibold text-navy/55"> +</span>}
              </>
            ) : 'Custom'}
          </p>
          <p className="text-[12px] text-navy/55">
            {!sel.length ? 'select a service'
              : heroAmount > 0 ? (
                monthlyNet > 0
                  ? <>for {dur.m} month{dur.m > 1 ? 's' : ''}, paid once up front · works out to {money(monthlyNet)}/month{hasCustom ? ' + custom items' : ''}</>
                  : <>one-time build{hasCustom ? ' + custom items' : ''}</>
              )
              : <a href="#custom" className="font-semibold text-teal-dark underline decoration-teal/40 underline-offset-2">scoped with you below →</a>}
          </p>
          <ul className="mt-4 space-y-1.5 border-t border-navy/10 pt-3 text-[12.5px] text-navy/65">
            {lines.map((l) => <li key={l.label} className="flex justify-between gap-2"><span>{l.label.split(' (')[0]}{l.tier ? ` · ${l.tier}` : ''}</span><span className="tabular-nums whitespace-nowrap">{l.custom ? 'Custom' : `${money(l.amt)} ${l.unit}`}</span></li>)}
            {sel.length > 0 && monthlySub > 0 && (
              <>
                <li className="flex justify-between gap-2 pt-1"><span>Monthly subtotal</span><span className="tabular-nums whitespace-nowrap">{money(monthlySub)}/mo</span></li>
                {multi > 0 && <li className="flex justify-between gap-2 font-semibold text-teal-dark"><span>Multi-service −15%</span><span className="tabular-nums whitespace-nowrap">−{money(monthlySub * multi)}/mo</span></li>}
                <li className="flex justify-between gap-2"><span>Your monthly</span><span className="tabular-nums whitespace-nowrap">{money(monthlyNet)}/mo</span></li>
                <li className="flex justify-between gap-2 font-semibold text-navy"><span>Due up front · {dur.m} month{dur.m > 1 ? 's' : ''}{freeMonths ? ` (pay ${dur.charged})` : ''}</span><span className="tabular-nums whitespace-nowrap">{money(monthlyForDuration)}</span></li>
              </>
            )}
            {onetimeNet > 0 && <li className="flex justify-between gap-2"><span>Website (one-time)</span><span className="tabular-nums whitespace-nowrap">{money(onetimeNet)}</span></li>}
          </ul>
          {sel.length > 0 && savings > 0 && (
            <div className="mt-3 rounded-lg border border-teal/40 bg-teal/10 px-3 py-2 text-[12px] font-semibold text-teal-dark">You save {money(savings)}{freeMonths ? ` · ${freeMonths} month${freeMonths > 1 ? 's' : ''} free` : ''}{multi ? ' + 15% off' : ''}</div>
          )}
          <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-navy/50">
            {notes.map((n, i) => <li key={i}>· {n}</li>)}
          </ul>
          {shown !== 'INR' && <p className="mt-2 text-[11px] leading-relaxed text-navy/45">Shown in {shown} at today's exchange rate. Your quote is confirmed in {shown} in the written proposal.</p>}
        </div>

        <form onSubmit={submit} className="mt-5">
          <p className="mb-2 text-[13px] font-semibold text-navy">Email me this plan</p>
          <div className="grid gap-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
            <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name (optional)" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" aria-label="Your email" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp number (optional, for a faster reply)" aria-label="Your WhatsApp number" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
            <button type="submit" disabled={sending || sel.length === 0} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-50">
              {sending ? 'Sending…' : 'Email me this plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
