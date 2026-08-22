// Insights newsletter form. Behavior ported from v1's
// handleSimpleForm('blog-newsletter'): owner notification (logs the
// lead row) + visitor confirmation, then the newsletter success copy.
import { useState } from 'react';
import { OWNER_EMAIL, sendFromClicknlikes } from '../../lib/engine';

export default function NewsletterForm({ thankYouHref }) {
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function submit(evt) {
    evt.preventDefault();
    const form = evt.target;
    const email = new FormData(form).get('email');
    const page = typeof window !== 'undefined' ? window.location.pathname : '';
    setSending(true);
    setFailed(false);
    // Awaited so a subscriber who never reached us is never told they did.
    const result = await sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: email || undefined,
      subject: `New blog-newsletter lead: ${email || 'website visitor'}`,
      bodyText: `New submission from the blog-newsletter form:\n\nCame from page: ${page}\n\nemail: ${email}`,
      fields: { form: 'blog-newsletter', page: page, email: email },
    });
    if (!result.ok) {
      setSending(false);
      setFailed(true);
      return;
    }
    sendFromClicknlikes({
      toEmail: email,
      subject: 'We got your message: Click.n.likes',
      bodyText: `Hi ,\n\nThanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.\n\nHere's a copy of what you sent us:\nemail: ${email}\n\nBest,\nClick.n.likes\nbusiness@clicknlikes.com`,
    });
    window.location.href = thankYouHref;
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
      {failed && (
        <p role="alert" className="mt-3 text-left text-[12.5px] leading-relaxed text-navy/70">
          That didn't reach us, and we'd rather say so than pretend it did. Try once more, or email{' '}
          <a href="mailto:business@clicknlikes.com" className="font-semibold text-teal-dark underline">
            business@clicknlikes.com
          </a>{' '}
          and we'll add you by hand.
        </p>
      )}
    </form>
  );
}
