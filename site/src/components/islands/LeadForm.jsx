// Homepage "growth snapshot" lead form. Behavior ported from v1's
// handleSimpleForm('home'): one owner notification (which also logs the
// lead row to the Sheet), one visitor confirmation, then the success
// panel with the same copy and next-step expectations.
import { useState } from 'react';
import { OWNER_EMAIL, sendFromClicknlikes, mailtoFallback } from '../../lib/engine';
import { contact } from '../../data/site';
import CountrySelect from './CountrySelect.jsx';
import PhoneInput from './PhoneInput.jsx';

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

export default function LeadForm({ contactHref, thankYouHref }) {
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(null);

  async function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const data = new FormData(form);
    const obj = {};
    data.forEach((v, k) => (obj[k] = v));

    const summary = Object.entries(obj)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    const homePage = typeof window !== 'undefined' ? window.location.pathname : '';
    setSending(true);
    setFailed(null);
    const ownerSubject = `New home lead: ${obj.name || obj.email || 'website visitor'}`;
    // Awaited so a lead that never arrived can never show a thank-you page.
    const result = await sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: obj.email || undefined,
      subject: ownerSubject,
      bodyText: `New submission from the home form:\n\nCame from page: ${homePage}\n\n${summary}`,
      fields: { form: 'home', page: homePage, ...obj },
    });
    if (!result.ok) {
      setSending(false);
      setFailed({
        subject: ownerSubject,
        body: `${summary}\n\n(Sent from ${homePage} - the website form could not reach our server.)`,
      });
      return;
    }
    if (obj.email) {
      sendFromClicknlikes({
        toEmail: obj.email,
        toName: obj.name,
        subject: 'We got your message: Click.n.likes',
        bodyText: `Hi ${obj.name || ''},\n\nThanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.\n\nHere's a copy of what you sent us:\n${summary}\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`,
      });
    }
    window.location.href = thankYouHref;
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
          <PhoneInput id="lead-phone" name="phone" required placeholder="98765 43210" />
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-city">City</label>
          <input id="lead-city" required type="text" name="city" placeholder="Your city" className={fieldCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-country">Country</label>
          <CountrySelect id="lead-country" name="country" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls} htmlFor="lead-struggle">What are you struggling with?</label>
          <select id="lead-struggle" name="problem" className={fieldCls}>
            {STRUGGLES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="lead-service">Service you're most interested in</label>
          <select id="lead-service" name="service" className={fieldCls}>
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
      {failed && (
        <div role="alert" className="mt-5 rounded-xl border-[1.5px] border-coral/30 bg-coral/5 p-5 text-left">
          <p className="text-sm font-semibold text-navy">This didn't reach us.</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-navy/70">
            Something between your browser and our server failed, so we'd rather tell you than
            pretend it went through. Your details are still filled in above: press the button again,
            or send them straight to us in one tap.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href={mailtoFallback(failed.subject, failed.body)}
              className="inline-flex items-center rounded-full bg-navy px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-coral"
            >
              Email it to us
            </a>
            <a
              href={`${contact.whatsappHref}?text=${encodeURIComponent(failed.body)}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center rounded-full border-[1.5px] border-navy/15 px-5 py-2.5 text-[13px] font-semibold text-navy transition-colors hover:border-teal"
            >
              Send on WhatsApp
            </a>
          </div>
        </div>
      )}
      <p className="mt-3 text-xs text-navy/55">
        Prefer an instant number?{' '}
        <a href={contactHref} className="text-teal-dark underline">Use the live quote calculator →</a>
      </p>
    </form>
  );
}
