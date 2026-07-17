// Generic lead form island: v1's handleSimpleForm + FORM_SUCCESS_COPY,
// driven by a field config so Work/About/FAQ/Contact all reuse one
// implementation. One owner notification (logs the sheet row) + one
// visitor confirmation per submission, exactly like v1.
import { useState } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes } from '../../lib/engine';

const SUCCESS_COPY = {
  home: { headline: 'Your growth snapshot request is in.', sub: 'We build it by hand, not from a template.' },
  work: { headline: "We'll pull your category benchmarks.", sub: 'Real numbers from campaigns in categories like yours.' },
  about: { headline: 'Your message is on its way.', sub: 'It lands directly with a strategist, not a bot.' },
  faq: { headline: 'Question received.', sub: 'A real person answers every one of these.' },
  'contact-message': { headline: 'Message received.', sub: "It's already in our inbox and logged in our lead tracker." },
};

const fieldCls =
  'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3.5 text-sm text-navy transition-colors outline-none focus:border-teal';
const labelCls = 'mb-1.5 block text-[12.5px] font-semibold text-navy';

export default function SimpleForm({ tag, fields, submitLabel, contactHref, toolsHref }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);

  function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const obj = {};
    new FormData(form).forEach((v, k) => (obj[k] = v));

    const summary = Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join('\n');
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: obj.email || undefined,
      subject: `New ${tag} lead: ${obj.name || obj.email || 'website visitor'}`,
      bodyText: `New submission from the ${tag} form:\n\n${summary}`,
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
    const copy = SUCCESS_COPY[tag] || { headline: 'Got it, thanks!', sub: '' };
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-7 text-left shadow-[0_18px_44px_rgba(26,43,74,0.10)]">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal/15 font-bold text-teal-dark">✓</div>
          <div>
            <h4 className="font-display text-lg font-semibold text-navy">
              {sent.name ? `Thanks, ${sent.name.split(' ')[0]}. ` : ''}{copy.headline}
            </h4>
            {copy.sub && <p className="mt-0.5 text-sm text-navy/60">{copy.sub}</p>}
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
    <form onSubmit={submit} className="rounded-2xl border border-navy/10 bg-white p-7 text-left shadow-[0_10px_30px_rgba(26,43,74,0.06)]">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const id = `${tag}-${f.name}`;
          const label = (
            <label className={labelCls} htmlFor={id}>
              {f.label} {f.optional && <span className="font-normal text-navy/45">({f.optional})</span>}
            </label>
          );
          if (f.type === 'select') {
            return (
              <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
                {label}
                <select id={id} name={f.name} className={fieldCls}>
                  {f.options.map((o, i) => (
                    <option key={o} value={f.emptyFirst && i === 0 ? '' : o}>{o}</option>
                  ))}
                </select>
              </div>
            );
          }
          if (f.type === 'textarea') {
            return (
              <div key={f.name} className="sm:col-span-2">
                {label}
                <textarea id={id} name={f.name} required={f.required !== false} rows={f.rows || 4} placeholder={f.placeholder} className={fieldCls} />
              </div>
            );
          }
          return (
            <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
              {label}
              <input id={id} type={f.type || 'text'} name={f.name} required={f.required !== false} placeholder={f.placeholder} className={fieldCls} />
            </div>
          );
        })}
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
            {submitLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </>
        )}
      </button>
    </form>
  );
}
