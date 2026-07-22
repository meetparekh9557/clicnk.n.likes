// First-impression snapshot. Renders the visitor's live homepage above the
// fold (Cloudflare Browser Rendering, server-side) and shows them exactly
// what a first-time visitor sees before scrolling - the 3-second test made
// literal. Email-gated to capture the lead; no fabricated score, just the
// real screenshot and an honest prompt to judge it. Degrades to an honest
// "coming soon" if the render backend isn't configured.
import { useState } from 'react';
import { OWNER_EMAIL, fetchScreenshot, sendFromClicknlikes } from '../../lib/engine';

export default function SnapshotCheck({ toolsHref }) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | rendering | done | failed | soon
  const [img, setImg] = useState('');

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'rendering') return;
    setPhase('rendering');
    const r = await fetchScreenshot(url);
    if (!r.available) {
      if (r.reason === 'not_configured' || r.reason === 'bad_request' || r.reason === 'render_cap') { setPhase('soon'); return; }
      setPhase('failed');
      return;
    }
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL,
      replyTo: email,
      subject: `🔔 New First-impression snapshot lead: ${email}`,
      bodyText: `New First-impression snapshot lead:\n\nEmail: ${email}\nURL: ${url}\nRendered above-the-fold successfully.`,
    });
    setImg(r.image);
    setPhase('done');
  }

  if (phase === 'done' && img) {
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Rendered live just now</span>
          <span className="text-xs font-semibold text-teal-dark">Above the fold · desktop</span>
        </div>
        <p className="mt-4 text-sm text-navy/75">
          This is exactly what a first-time visitor sees before they scroll. Give yourself the 3-second test: is it instantly clear <b>what you do</b>, <b>who it's for</b>, and <b>what to do next</b>?
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-navy/10">
          <img src={img} alt="Your homepage above the fold" className="block w-full" />
        </div>
        <p className="mt-4 text-xs text-navy/60">
          If you hesitated on any of those three, so does every visitor, and hesitation is lost enquiries.{' '}
          <a href={toolsHref} className="text-teal-dark underline">Run the on-page health scan too →</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={run} aria-label="First-impression snapshot">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text" required value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="yourwebsite.com" aria-label="Your website URL"
          className="w-full rounded-full border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
        />
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com" aria-label="Your email"
          className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
        />
        <button
          type="submit" disabled={phase === 'rendering'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
        >
          {phase === 'rendering' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Rendering…
            </>
          ) : 'Show my first impression'}
        </button>
      </div>
      {phase === 'soon' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Our live snapshot render is being switched on. In the meantime, the{' '}
          <a href={toolsHref} className="text-teal-dark underline">Website Health scan</a> checks your page live right now.
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          We couldn't render that URL just now (some sites block automated visits, or it needs the full https://). Check the address and try again.
        </p>
      )}
      {phase !== 'rendering' && phase !== 'failed' && phase !== 'soon' && (
        <p className="mt-3 text-xs text-navy/60">
          We render your live homepage above the fold and show you exactly what a first-time visitor sees. The 3-second test, made real.
        </p>
      )}
    </form>
  );
}
