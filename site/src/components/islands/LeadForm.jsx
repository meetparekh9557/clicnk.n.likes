// Homepage "growth snapshot" lead form. Behavior ported from v1's
// handleSimpleForm('home'): one owner notification (which also logs the
// lead row to the Sheet), one visitor confirmation, then the success
// panel with the same copy and next-step expectations.
import { useState } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes } from '../../lib/engine';

const STRUGGLES = [
  'Not showing up on Google search or Maps',
  'Website gets visits but no bookings',
  'Social media growth has stalled',
  'Ads are expensive with no organic backup',
  "Don't know where to start",
];

const SERVICE_OPTIONS = [
  'Not sure yet, recommend for me',
  'SEO (Organic & On-Page)',
  'Local SEO & Google Business',
  'AI SEO & AI Overviews',
  'Social Media Growth',
  'Content Marketing',
  'Website Development',
  'Paid Campaigns',
  'The full growth stack',
];

const BUDGETS = ['Prefer not to say yet', 'Under ₹16,000', '₹16,000 - ₹40,000', '₹40,000 - ₹1,00,000', '₹1,00,000+'];

const fieldCls =
  'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3.5 text-sm text-navy transition-colors outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';

export default function LeadForm({ contactHref, toolsHref }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const data = new FormData(form);
    const obj = {};
    data.forEach((v, k) => (obj[k] = v));

    const summary = Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: obj.email || undefined,
      subject: `New home lead: ${obj.name || obj.email || 'website visitor'}`,
      bodyText: `New submission from the home form:\n\n${summary}`,
    });
    if (obj.email) {
      sendFromClicknlikes({
        toEmail: obj.email,
        toName: obj.name,
        subject: 'We got your message: Click.n.likes',
        bodyText: `Hi ${obj.name || ''},\n\nThanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.\n\nHere's a copy of what you sent us:\n${summary}\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`,
      });
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      form.reset();
      setSent({ name: obj.name, email: obj.email });
    }, 650);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-7 shadow-[0_18px_44px_rgba(26,43,74,0.10)]">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 font-bold text-teal-dark">✓</div>
          <div>
            <h4 className="font-display text-lg font-semibold text-navy">
              {sent.name ? `Thanks, ${sent.name.split(' ')[0]}. ` : ''}Your growth snapshot request is in.
            </h4>
            <p className="mt-0.5 text-sm text-navy/60">We build it by hand, not from a template.</p>
          </div>
        </div>
        <ol className="mt-5 space-y-3 text-sm text-navy/80">
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy font-display text-xs text-white">1</span>
            <span>
              {autoEmailReady
                ? <>A confirmation email has been sent to <b>{sent.email || 'your inbox'}</b> from business@clicknlikes.com. Not there in a minute? Check spam.</>
                : 'Your details are logged with us.'}
            </span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy font-display text-xs text-white">2</span>
            <span>A strategist reviews your details and replies within <b>1 business day</b>, usually much faster.</span>
          </li>
          <li className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy font-display text-xs text-white">3</span>
            <span>
              In the meantime, our <a href={toolsHref} className="text-teal-dark underline">free tools</a> can show you
              where you stand, or grab an <a href={contactHref} className="text-teal-dark underline">instant quote</a>.
            </span>
          </li>
        </ol>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="mt-6 rounded-full border-[1.5px] border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal-dark"
        >
          ↩ Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_10px_30px_rgba(26,43,74,0.06)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="lead-name">Full name</label>
          <input id="lead-name" required type="text" name="name" placeholder="Your name" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-business">Business name</label>
          <input id="lead-business" required type="text" name="business" placeholder="e.g. Smile Studio Dental" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-email">Email</label>
          <input id="lead-email" required type="email" name="email" placeholder="you@business.com" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-phone">WhatsApp number</label>
          <input id="lead-phone" required type="tel" name="phone" placeholder="+91 98765 43210" className={fieldCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="lead-struggle">What are you struggling with?</label>
          <select id="lead-struggle" name="struggle" className={fieldCls}>
            {STRUGGLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-service">Service you're most interested in</label>
          <select id="lead-service" name="service_interested" className={fieldCls}>
            {SERVICE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-budget">
            Monthly budget range <span className="font-normal text-navy/45">(optional)</span>
          </label>
          <select id="lead-budget" name="budget" className={fieldCls}>
            {BUDGETS.map((b, i) => <option key={b} value={i === 0 ? '' : b}>{b}</option>)}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
      >
        {sending ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            Send my snapshot request
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </>
        )}
      </button>
      <p className="mt-3 text-xs text-navy/55">
        Prefer an instant number?{' '}
        <a href={contactHref} className="text-teal-dark underline">Use the live quote calculator →</a>
      </p>
    </form>
  );
}
