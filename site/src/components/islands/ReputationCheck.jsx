// Live Google Business Profile reputation. Business name + city in, the
// real Google rating and review count out (Places API, server-side). No
// self-report: if Google has the listing, we show its actual numbers;
// otherwise we say so. Email-gated; degrades to an honest "coming soon"
// until the Places key is configured.
import { useState } from 'react';
import { OWNER_EMAIL, fetchPlaces, sendFromClicknlikes } from '../../lib/engine';

export default function ReputationCheck({ toolsHref }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | looking | done | failed | soon
  const [place, setPlace] = useState(null);

  async function run(evt) {
    evt.preventDefault();
    if (phase === 'looking') return;
    setPhase('looking');
    const q = `${name} ${city}`.trim();
    const r = await fetchPlaces(q);
    if (!r.available) {
      if (r.reason === 'not_configured' || r.reason === 'bad_request') { setPhase('soon'); return; }
      setPhase('failed');
      return;
    }
    sendFromClicknlikes({
      toEmail: OWNER_EMAIL, replyTo: email,
      subject: `🔔 New Reputation-check lead: ${email}`,
      bodyText: `New Google reputation lead:\n\nEmail: ${email}\nSearched: ${q}\nFound: ${r.place.name} — ${r.place.rating || 'no'} rating, ${r.place.reviews || 0} reviews\nAddress: ${r.place.address}`,
    });
    setPlace(r.place);
    setPhase('done');
  }

  if (phase === 'done' && place) {
    const rating = typeof place.rating === 'number' ? place.rating : null;
    const reviews = typeof place.reviews === 'number' ? place.reviews : 0;
    const weak = rating == null || rating < 4.3 || reviews < 25;
    return (
      <div className="rounded-2xl border border-teal/40 bg-white p-6 shadow-[0_18px_44px_rgba(26,43,74,0.10)] sm:p-8">
        <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal-dark">✅ Live from Google just now</span>
        <p className="mt-4 font-display text-lg font-bold text-navy">{place.name}</p>
        {place.address && <p className="text-xs text-navy/55">{place.address}</p>}
        <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <div className="font-display text-4xl font-bold tabular-nums text-navy">{rating != null ? rating.toFixed(1) : '—'}<span className="text-lg text-navy/40"> ★</span></div>
            <div className="text-xs text-navy/55">Google rating</div>
          </div>
          <div>
            <div className="font-display text-4xl font-bold tabular-nums text-navy">{reviews.toLocaleString('en-IN')}</div>
            <div className="text-xs text-navy/55">total reviews</div>
          </div>
        </div>
        <p className="mt-5 text-sm text-navy/75">
          {weak
            ? 'This is where the local pack is won or lost. Rating and review volume are among the strongest local-ranking signals, and the number a buyer judges you on at 11pm. There is clear room to pull ahead here.'
            : 'A genuinely strong local reputation. The lever now is keeping the review flow steady and making sure that trust is visible everywhere buyers find you, not just on Google.'}
        </p>
        <p className="mt-4 text-xs text-navy/60">
          Pulled live from Google, not self-reported.{' '}
          <a href={toolsHref} className="text-teal-dark underline">Check your on-page health too →</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={run} aria-label="Live Google reputation check">
      <div className="grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your business name" aria-label="Your business name"
            className="w-full rounded-full border-[1.5px] border-teal/40 bg-teal/5 px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
          <input
            type="text" required value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="City" aria-label="Your city"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:w-40"
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com" aria-label="Your email"
            className="w-full rounded-full border-[1.5px] border-navy/15 bg-white px-5 py-3.5 text-sm text-navy outline-none transition-colors focus:border-teal sm:flex-1"
          />
          <button
            type="submit" disabled={phase === 'looking'}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-white transition-all duration-300 hover:bg-coral disabled:opacity-60"
          >
            {phase === 'looking' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                Looking up…
              </>
            ) : 'Check my Google reputation'}
          </button>
        </div>
      </div>
      {phase === 'soon' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          Our live Google reputation lookup is being switched on. In the meantime, the{' '}
          <a href={toolsHref} className="text-teal-dark underline">Website Health scan</a> checks your page live right now.
        </p>
      )}
      {phase === 'failed' && (
        <p className="mt-3 text-sm text-navy/70" role="status">
          We couldn't find that business on Google just now. Try adding your city, or the exact name on your Google listing.
        </p>
      )}
      {phase !== 'looking' && phase !== 'failed' && phase !== 'soon' && (
        <p className="mt-3 text-xs text-navy/60">
          We pull your real Google rating and review count live, the exact numbers a buyer sees before they choose you.
        </p>
      )}
    </form>
  );
}
