// Live Google rank check. Keyword + domain + city in, the real current
// position out (server-side via a SERP provider). No "are you stuck on page
// 2?" self-report: we look at the actual results and tell you where you
// land. Email-gated; degrades to an honest "coming soon" until the SERP key
// is configured.
import { useState } from 'react';
import { OWNER_EMAIL, fetchSerpRank, sendFromClicknlikes } from '../../lib/engine';

export default function RankCheck({ toolsHref }) {
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | checking | done | failed | soon
  const [res, setRes] = useState(null);

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'checking') return;
    setPhase('checking');
    const r = await fetchSerpRank(keyword, domain, city);
    if (!r.available) {
      if (r.reason === 'not_configured' || r.reason === 'bad_request') { setPhase('soon'); return; }
      setPhase('failed');
      return;
    }
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `🔔 New Rank-check lead: ${email}`,
      bodyText: `New rank-check lead:\n\nEmail: ${email}\nKeyword: ${keyword}\nDomain: ${domain}\nCity: ${city}\nResult: ${r.rank ? 'rank #' + r.rank : 'not in top ' + r.checked} (${r.foundUrl || 'n/a'})`,
    });
    setRes(r);
    setPhase('done');
  }

  if (phase === 'done' && res) {
    const ranked = res.rank != null;
    const page1 = ranked && res.rank <= 10;
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Checked live on Google just now</span>
        <p className="mt-4 text-sm text-navy/70">For <b className="text-navy">"{keyword}"</b>{city ? <> in <b className="text-navy">{city}</b></> : null}, {domain} currently ranks:</p>
        {ranked ? (
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold tabular-nums" style={{ color: page1 ? '#1F7A74' : '#A9750A' }}>#{res.rank}</span>
            <span className="text-sm text-navy/55">{page1 ? 'on page one' : 'below page one'}</span>
          </div>
        ) : (
          <div className="mt-2">
            <span className="font-display text-3xl font-bold text-coral">Not in the top {res.checked}</span>
          </div>
        )}
        <p className="mt-5 text-sm text-navy/75">
          {page1
            ? 'You are on page one, where the clicks are. The job now is defending and climbing: position #1 takes more clicks than the next three combined, so every place you rise compounds.'
            : ranked
              ? 'You are on the board but below the fold of page one, where the vast majority of searchers never look. Closing this gap is usually authority and on-page depth, not brand-new content.'
              : 'You are not surfacing for this search yet, which means a competitor is capturing every one of these buyers. This is exactly the kind of gap a focused organic push is built to close.'}
        </p>
        <p className="mt-4 text-xs text-navy/60">
          Checked live against Google's real results, not self-reported.{' '}
          <a href={toolsHref} className="text-teal-dark underline">Check your on-page health too →</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={run} aria-label="Live Google rank check">
      <div className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text" required value={keyword} onChange={(e) => setKeyword(e.target.value)}
            placeholder="Keyword, e.g. CNC machining Ahmedabad" aria-label="Keyword to check"
            className="w-full rounded-full border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
          <input
            type="text" required value={domain} onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com" aria-label="Your domain"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:w-52"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text" value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)" aria-label="City"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:w-40"
          />
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com" aria-label="Your email"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
        </div>
        <button
          type="submit" disabled={phase === 'checking'}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
        >
          {phase === 'checking' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Checking Google…
            </>
          ) : 'Check my real rank'}
        </button>
      </div>
      {phase === 'soon' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Our live rank check is being switched on. In the meantime, the{' '}
          <a href={toolsHref} className="text-teal-dark underline">Website Health scan</a> checks your page live right now.
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          We couldn't complete that rank check just now. Please try again in a moment.
        </p>
      )}
      {phase !== 'checking' && phase !== 'failed' && phase !== 'soon' && (
        <p className="mt-3 text-xs text-navy/60">
          We check Google's real results live and tell you exactly where you rank, no guessing, no "page 2 or 3".
        </p>
      )}
    </form>
  );
}
