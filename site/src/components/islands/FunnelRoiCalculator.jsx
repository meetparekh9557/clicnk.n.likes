// Funnel Leak & ROI Calculator. The slider math is ported verbatim from
// v1 (updateROI): current vs. a healthy 3% conversion benchmark, shown as
// both a revenue gap and the profit that gap is actually worth. The live
// preview is visible as you drag (self-reported inputs, no external
// fetch); an email unlocks the full report + CRO checklist, emailed via
// the shared engine exactly like v1's runROIGate.
import { useState } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes, buildReportEmailHtml, fact } from '../../lib/engine';
import { useCountUp } from '../../lib/useCountUp.js';

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

function compute(traffic, convRate, aov, marginPct) {
  const profitPerOrder = Math.round(aov * (marginPct / 100));
  const currentRevenue = traffic * (convRate / 100) * aov;
  const benchmarkRevenue = traffic * 0.03 * aov;
  const gap = Math.round(benchmarkRevenue - currentRevenue); // + = leaking, - = surplus
  const currentProfit = Math.round(currentRevenue * (marginPct / 100));
  const amount = Math.abs(gap);
  const profitAmount = Math.round(amount * (marginPct / 100));
  const isSurplus = gap <= 0;
  return { profitPerOrder, currentRevenue, benchmarkRevenue, gap, currentProfit, amount, profitAmount, isSurplus };
}

const Slider = ({ label, min, max, step, value, onChange, display }) => (
  <div>
    <div className="flex items-center justify-between">
      <label className="text-[12.5px] font-semibold text-navy">{label}</label>
      <span className="font-display text-sm font-bold text-teal-dark tabular-nums">{display}</span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="cnl-range mt-2 w-full"
      aria-label={label}
    />
  </div>
);

export default function FunnelRoiCalculator() {
  const [traffic, setTraffic] = useState(8000);
  const [convRate, setConvRate] = useState(1.2);
  const [aov, setAov] = useState(3000);
  const [margin, setMargin] = useState(65);
  const [business, setBusiness] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const r = compute(traffic, convRate, aov, margin);
  // Count the revenue and profit figures up/down as the sliders move.
  const amountView = useCountUp(r.amount);
  const profitView = useCountUp(r.profitAmount);
  const tag = r.amount === 0 ? 'At benchmark' : r.isSurplus ? 'Revenue surplus' : 'Revenue leaked';
  const profitTag = r.amount === 0 ? 'At benchmark' : r.isSurplus ? 'Profit surplus' : 'Profit leaked';
  const good = r.isSurplus || r.amount === 0;

  function submit(evt) {
    evt.preventDefault();
    const currentRevenue = Math.round(r.currentRevenue);
    const benchmarkRevenue = Math.round(r.benchmarkRevenue);
    const gapAmount = r.amount;
    const gapProfit = r.profitAmount;
    const isSurplus = r.isSurplus;
    const interpretation = isSurplus
      ? (gapAmount > 0
          ? `You're converting ABOVE the 3% benchmark: this surplus is worth Rs.${gapAmount.toLocaleString('en-IN')}/month in revenue (Rs.${gapProfit.toLocaleString('en-IN')}/month in profit at your margin). Most businesses at this stage still have room to push further.`
          : `You're converting right at the 3% benchmark: no gap to close right now, and the checklist below is how you push past it.`)
      : `At your traffic and order value, converting at ${convRate.toFixed(1)}% instead of the healthy 3% benchmark leaks Rs.${gapAmount.toLocaleString('en-IN')}/month in revenue: Rs.${gapProfit.toLocaleString('en-IN')}/month in actual profit. That profit number is the one that matters.`;

    const factors = [
      fact('Monthly traffic', traffic.toLocaleString('en-IN') + ' visitors', 'self', 'input'),
      fact('Current conversion rate', convRate.toFixed(1) + '%', 'self', convRate < 3 ? 'below 3% benchmark' : 'at/above benchmark'),
      fact('Average order value', 'Rs.' + aov.toLocaleString('en-IN'), 'self', 'input'),
      fact('Profit margin per order', margin + '% (Rs.' + r.profitPerOrder.toLocaleString('en-IN') + '/order)', 'self', 'input'),
      fact('Current monthly revenue', 'Rs.' + currentRevenue.toLocaleString('en-IN') + ' (Rs.' + r.currentProfit.toLocaleString('en-IN') + ' profit)', 'self', 'computed'),
      fact('Benchmark revenue at 3%', 'Rs.' + benchmarkRevenue.toLocaleString('en-IN'), 'self', 'computed'),
      fact(isSurplus ? 'Monthly surplus' : 'Monthly leak', 'Rs.' + gapAmount.toLocaleString('en-IN') + ' revenue / Rs.' + gapProfit.toLocaleString('en-IN') + ' profit', 'self', 'computed'),
    ];
    const nextSteps = [
      "Fix your highest-traffic landing page's above-the-fold clarity: one headline stating the outcome, one visible CTA, no slider carousels.",
      'Add trust signals (reviews, guarantees, real photos) directly beside the point of decision, not on a separate testimonials page nobody visits.',
      'Cut your form/booking flow to the fewest possible fields: every removed field measurably lifts completion rate.',
      convRate < 1.5
        ? 'At your current rate, prioritise an exit-intent offer or WhatsApp click-to-chat: capturing even 10% of abandoning visitors moves the number fast.'
        : 'Set up a simple A/B test on your main CTA copy: at your conversion level, small copy changes produce measurable wins.',
    ];
    const bodyText = `Hi,\n\nHere is your Funnel Leak & ROI report for ${business || 'your business'}:\n\n${interpretation}\n\nYour numbers:\n${factors.map((f) => `• ${f.name}: ${f.found}`).join('\n')}\n\nYour CRO checklist:\n${nextSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nWant a plan built specifically for your funnel? Reply to this email or grab a quote at clicknlikes.com.\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`;
    const bodyHtml = buildReportEmailHtml({
      toolLabel: 'Funnel Leak & ROI Calculator',
      forLine: `Prepared for ${business || 'your business'} · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      scoreDisplay: (isSurplus ? '+' : '−') + 'Rs.' + gapAmount.toLocaleString('en-IN') + '/mo',
      indexLabel: isSurplus ? 'Revenue surplus vs. 3% benchmark' : 'Revenue leak vs. 3% benchmark',
      interpretation, liveNote: null, factors, nextSteps,
    });
    sendFromClicknlikes({ toEmail: email, toName: business, subject: isSurplus ? 'Your Funnel Surplus & ROI report + CRO checklist' : 'Your Funnel Leak & ROI report + CRO checklist', bodyText, bodyHtml });
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `New ROI Calculator lead: ${business || email}`,
      bodyText: `New Funnel Leak & ROI Calculator lead:\n\nBusiness: ${business}\nEmail: ${email}\nTraffic: ${traffic.toLocaleString('en-IN')}/mo\nConversion rate: ${convRate.toFixed(1)}%\nAOV: Rs.${aov.toLocaleString('en-IN')}\nMargin: ${margin}%\nStatus: ${isSurplus ? 'ABOVE benchmark (surplus)' : 'BELOW benchmark (leaking)'}\nGap: Rs.${gapAmount.toLocaleString('en-IN')}/mo revenue, Rs.${gapProfit.toLocaleString('en-IN')}/mo profit`,
    });
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 600);
  }

  return (
    <div className="grid gap-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)] sm:p-8 lg:grid-cols-2 lg:gap-8">
      <div className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">Benchmark: 3% conversion</span>
        <Slider label="Monthly website traffic" min={500} max={100000} step={500} value={traffic} onChange={setTraffic} display={traffic.toLocaleString('en-IN')} />
        <Slider label="Current conversion rate (%)" min={0.2} max={10} step={0.1} value={convRate} onChange={setConvRate} display={convRate.toFixed(1) + '%'} />
        <Slider label="Average order / deal value" min={500} max={100000} step={500} value={aov} onChange={setAov} display={inr(aov)} />
        <Slider label="Profit margin (%)" min={5} max={95} step={5} value={margin} onChange={setMargin} display={margin + '%'} />
        <p className="text-[12px] leading-relaxed text-navy/45">
          Leaked revenue = (traffic × 3% × order value) − (traffic × your rate × order value). Leaked profit = that gap × your margin. The 3% figure is a general benchmark and the margin is self-reported; neither is a guarantee for your business.
        </p>
      </div>

      <div className="flex flex-col">
        <div className={`rounded-xl border p-5 ${good ? 'border-teal/40 bg-teal/[0.06]' : 'border-coral/40 bg-coral/[0.05]'}`}>
          <p className={`text-[11px] font-bold tracking-[0.08em] uppercase ${good ? 'text-teal-dark' : 'text-coral'}`}>{tag}</p>
          <p className={`mt-1 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-none font-bold tabular-nums ${good ? 'text-teal-dark' : 'text-coral'}`}>
            {r.amount === 0 ? 'At benchmark' : inr(amountView) + '/mo'}
          </p>
          <div className="mt-4 border-t border-navy/10 pt-4">
            <p className={`text-[11px] font-bold tracking-[0.08em] uppercase ${good ? 'text-teal-dark' : 'text-coral'}`}>{profitTag}</p>
            <p className={`mt-1 font-display text-[clamp(1.4rem,3vw,2rem)] leading-none font-bold tabular-nums ${good ? 'text-teal-dark' : 'text-coral'}`}>
              {r.amount === 0 ? '₹0/mo' : inr(profitView) + '/mo'}
            </p>
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-navy/60">
            Revenue shows the size of the gap versus a healthy 3% conversion; profit shows what that gap is actually worth after your margin. Move the margin slider alone and only the profit figure changes, which is correct.
          </p>
        </div>

        {sent ? (
          <div className="mt-5 rounded-xl border border-teal/40 bg-white p-5 text-sm">
            <p className="font-display font-semibold text-navy">✓ Your full report is on its way{business ? `, ${business}` : ''}.</p>
            <p className="mt-1 text-navy/65">{autoEmailReady ? <>The report and CRO checklist were emailed to <b>{email}</b>. Not there in a minute? Check spam.</> : 'Your details are logged with us and a strategist will follow up.'}</p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5">
            <p className="mb-2 text-[13px] font-semibold text-navy">Get the full report + CRO checklist emailed to you</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name (optional)" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" aria-label="Your email" className="rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-teal" />
            </div>
            <button type="submit" disabled={sending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-60">
              {sending ? 'Sending…' : 'Email me the full report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
