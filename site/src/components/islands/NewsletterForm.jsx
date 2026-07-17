// Insights newsletter form. Behavior ported from v1's
// handleSimpleForm('blog-newsletter'): owner notification (logs the
// lead row) + visitor confirmation, then the newsletter success copy.
import { useState } from 'react';
import { OWNER_EMAIL, autoEmailReady, sendFromClicknlikes } from '../../lib/engine';

export default function NewsletterForm() {
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState(null);

  function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const email = new FormData(form).get('email');
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: email || undefined,
      subject: `New blog-newsletter lead: ${email || 'website visitor'}`,
      bodyText: `New submission from the blog-newsletter form:\n\nemail: ${email}`,
    });
    sendFromClicknlikes({
      toEmail: email,
      subject: 'We got your message: Click.n.likes',
      bodyText: `Hi ,\n\nThanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.\n\nHere's a copy of what you sent us:\nemail: ${email}\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`,
    });
    setSending(true);
    setTimeout(() => {
      setSending(false);
      form.reset();
      setSentTo(email);
    }, 650);
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 text-left shadow-[0_10px_30px_rgba(26,43,74,0.06)]">
        <h4 className="font-display text-lg font-semibold text-navy">You're subscribed.</h4>
        <p className="mt-1 text-sm text-navy/60">One practical growth idea a week. Unsubscribe anytime.</p>
        <p className="mt-3 text-sm text-navy/80">
          {autoEmailReady ? (
            <>A welcome email is on its way to <b>{sentTo}</b>: if it's not there in a minute, check spam and drag it to your inbox.</>
          ) : (
            'Your subscription is logged with us.'
          )}{' '}
          First issue lands this week. Reply to any issue: a real person reads the replies.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-4 rounded-full border-[1.5px] border-navy/15 px-5 py-2 text-sm font-semibold text-navy transition-colors hover:border-teal hover:text-teal-dark"
        >
          ↩ Subscribe another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)]">
      <label className="mb-1.5 block text-left text-[12.5px] font-semibold text-navy" htmlFor="nl-email">Email</label>
      <div className="flex gap-2.5">
        <input
          id="nl-email"
          required
          type="email"
          name="email"
          placeholder="you@business.com"
          className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy transition-colors outline-none focus:border-teal"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-teal px-5 py-3 text-sm font-semibold whitespace-nowrap text-navy transition-all duration-300 hover:bg-teal-dark hover:text-white disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}
