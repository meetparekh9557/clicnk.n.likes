// Multi-currency display for the pricing page. Pricing is authored in
// INR (the base the whole business is quoted in); this module shows those
// same numbers in a visitor's local currency, converted at that day's
// live exchange rate. It NEVER changes the underlying price - only how it
// is displayed - and it falls back to INR whenever a live rate cannot be
// fetched, so a rate outage can never invent a wrong number.
//
// Framework-agnostic on purpose: the pricing page's inline controller
// script and the React calculator islands all import the same helpers and
// stay in sync through localStorage + a 'cnl:currency' window event.

export const CURRENCIES = {
  INR: { code: 'INR', locale: 'en-IN', label: 'India (₹ INR)', short: '₹ INR' },
  USD: { code: 'USD', locale: 'en-US', label: 'United States ($ USD)', short: '$ USD' },
  EUR: { code: 'EUR', locale: 'en-IE', label: 'Europe (€ EUR)', short: '€ EUR' },
  GBP: { code: 'GBP', locale: 'en-GB', label: 'United Kingdom (£ GBP)', short: '£ GBP' },
  AED: { code: 'AED', locale: 'en-AE', label: 'UAE (Dh AED)', short: 'Dh AED' },
  CAD: { code: 'CAD', locale: 'en-CA', label: 'Canada (CA$ CAD)', short: 'CA$ CAD' },
  AUD: { code: 'AUD', locale: 'en-AU', label: 'Australia (A$ AUD)', short: 'A$ AUD' },
  SGD: { code: 'SGD', locale: 'en-SG', label: 'Singapore (S$ SGD)', short: 'S$ SGD' },
};

// Curated, hand-set price points per market, keyed by the INR base amount of
// each tier. These are deliberate clean numbers (£399, not £394.12) so the
// pricing reads as intentional in every currency, not machine-converted. Any
// currency NOT listed here falls back to a live-rate conversion (approx). The
// contract is always billed in the INR base; local display is a convenience.
// Keys MUST track the live tier ladder in pricing.astro and the per-service
// tiers in the quote builder (16k / 33k / 50k / 75k / 1.24L). When they drift,
// a tier with no curated row falls through to a machine conversion sitting
// next to a curated one, which is what makes a price list look careless.
export const CURATED = {
  16000:  { INR: '₹16,000',   USD: '$190',   EUR: '€179',   GBP: '£149',   AED: 'Dh 699',   CAD: 'CA$259',   AUD: 'A$289',   SGD: 'S$259' },
  33000:  { INR: '₹33,000',   USD: '$390',   EUR: '€369',   GBP: '£309',   AED: 'Dh 1,449', CAD: 'CA$549',   AUD: 'A$599',   SGD: 'S$539' },
  50000:  { INR: '₹50,000',   USD: '$590',   EUR: '€559',   GBP: '£469',   AED: 'Dh 2,199', CAD: 'CA$819',   AUD: 'A$909',   SGD: 'S$809' },
  75000:  { INR: '₹75,000',   USD: '$890',   EUR: '€839',   GBP: '£699',   AED: 'Dh 3,299', CAD: 'CA$1,229', AUD: 'A$1,359', SGD: 'S$1,209' },
  124000: { INR: '₹1,24,000', USD: '$1,470', EUR: '€1,379', GBP: '£1,159', AED: 'Dh 5,449', CAD: 'CA$2,029', AUD: 'A$2,249', SGD: 'S$1,999' },
};

// The curated clean price string for a tier amount in a currency, or null if
// this amount/currency isn't curated (caller then converts at the live rate).
export function curatedPrice(inr, cur) {
  const row = CURATED[inr];
  return row && row[cur] ? row[cur] : null;
}

// Whether `cur` is a currency we know how to display at all. Deliberately
// does NOT depend on live FX rates loading: every currently published price
// (the five tier amounts) is curated, so it never needs a rate, and gating
// the whole page on a third-party FX fetch meant localisation silently
// vanished for any visitor whose network was slow, blocked the FX API, or
// simply hadn't resolved it yet in the ~200ms before this ran - the majority
// case, not an edge case. curatedPrice() needs no rate; formatMoney() already
// falls back to INR per-value when a specific uncurated amount has no rate
// available, which is the correct place for that fallback to live: a single
// unmatched figure degrading to INR while everything else localises, not the
// whole page degrading because one third-party fetch was slow. If a future
// uncurated amount is ever added to a .cnl-price span directly (as opposed to
// QuoteCalculator/CustomQuote, which run every figure through formatMoney
// uniformly), it could show INR beside a curated $ figure — watch for that
// specific case, but it does not exist in the current pricing model.
export function usableCurrency(cur) {
  if (!cur || !CURRENCIES[cur]) return 'INR';
  return cur;
}

const LS_CUR = 'cnl_currency';
const LS_FX = 'cnl_fxrates';
// Free, no-key, CORS-enabled daily rates (base INR). Falls back to INR
// display if it is ever unreachable.
const FX_URL = 'https://open.er-api.com/v6/latest/INR';

const TZ_CUR = {
  'Asia/Dubai': 'AED', 'Asia/Muscat': 'AED',
  'Europe/London': 'GBP',
  'America/Toronto': 'CAD', 'America/Vancouver': 'CAD', 'America/Edmonton': 'CAD', 'America/Winnipeg': 'CAD', 'America/Halifax': 'CAD',
  'Asia/Singapore': 'SGD',
};
const REGION_CUR = { IN: 'INR', US: 'USD', GB: 'GBP', AE: 'AED', CA: 'CAD', AU: 'AUD', SG: 'SGD' };

const today = () => new Date().toISOString().slice(0, 10);

// Best guess at the visitor's currency: an explicit saved choice wins,
// then time zone, then locale region, then INR.
export function detectCurrency() {
  try { const s = localStorage.getItem(LS_CUR); if (s && CURRENCIES[s]) return s; } catch (e) { /* private mode */ }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (/Kolkata|Calcutta/.test(tz)) return 'INR';
    if (TZ_CUR[tz]) return TZ_CUR[tz];
    if (tz.startsWith('Europe/')) return 'EUR';
    if (tz.startsWith('Australia/')) return 'AUD';
    if (tz.startsWith('America/')) return 'USD';
  } catch (e) { /* ignore */ }
  try {
    const region = new Intl.Locale(navigator.language).maximize().region;
    if (REGION_CUR[region]) return REGION_CUR[region];
  } catch (e) { /* ignore */ }
  return 'INR';
}

export function getCurrency() {
  if (typeof window !== 'undefined' && window.__cnlCur && CURRENCIES[window.__cnlCur]) return window.__cnlCur;
  const c = detectCurrency();
  if (typeof window !== 'undefined') window.__cnlCur = c;
  return c;
}

export function setCurrency(cur) {
  if (!CURRENCIES[cur]) return;
  try { localStorage.setItem(LS_CUR, cur); } catch (e) { /* ignore */ }
  if (typeof window !== 'undefined') {
    window.__cnlCur = cur;
    window.dispatchEvent(new CustomEvent('cnl:currency', { detail: { currency: cur } }));
  }
}

export function onCurrency(cb) {
  if (typeof window === 'undefined') return () => {};
  const h = (e) => cb(e.detail && e.detail.currency);
  window.addEventListener('cnl:currency', h);
  return () => window.removeEventListener('cnl:currency', h);
}

// Resolves the day's rates, cached per-day in localStorage and on
// window.__cnlRates. Returns { rates, date, live }. `live:false` means we
// are showing yesterday's cache or nothing (in which case callers show INR).
export async function loadRates() {
  const day = today();
  if (typeof window !== 'undefined' && window.__cnlRates && window.__cnlRates.date === day && window.__cnlRates.rates) return window.__cnlRates;
  try {
    const c = JSON.parse(localStorage.getItem(LS_FX) || 'null');
    if (c && c.date === day && c.rates) { const r = { date: day, rates: c.rates, live: true }; if (typeof window !== 'undefined') window.__cnlRates = r; return r; }
  } catch (e) { /* ignore */ }
  try {
    const res = await fetch(FX_URL);
    const data = await res.json();
    if (data && data.result === 'success' && data.rates) {
      try { localStorage.setItem(LS_FX, JSON.stringify({ date: day, rates: data.rates })); } catch (e) { /* ignore */ }
      const r = { date: day, rates: data.rates, live: true };
      if (typeof window !== 'undefined') window.__cnlRates = r;
      return r;
    }
  } catch (e) { /* network/offline */ }
  try {
    const c = JSON.parse(localStorage.getItem(LS_FX) || 'null');
    if (c && c.rates) { const r = { date: c.date, rates: c.rates, live: false }; if (typeof window !== 'undefined') window.__cnlRates = r; return r; }
  } catch (e) { /* ignore */ }
  return { date: day, rates: null, live: false };
}

// The exact amount in `cur`, or null if it cannot be converted (no rate).
export function convert(inr, cur, rates) {
  if (cur === 'INR') return inr;
  if (!rates || !rates[cur]) return null;
  return inr * rates[cur];
}

// Formats an INR figure in the chosen currency. Always safe: if there is
// no rate for `cur`, it renders the honest INR figure instead of guessing.
export function formatMoney(inr, cur, rates) {
  const amt = convert(inr, cur, rates);
  if (cur === 'INR' || amt === null) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(inr));
  }
  const c = CURRENCIES[cur] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Math.round(amt));
  } catch (e) {
    return cur + ' ' + Math.round(amt).toLocaleString('en-US');
  }
}

// Relabels a number in the visitor's currency WITHOUT converting it — for
// self-reported tool inputs (a visitor's own traffic, order value, revenue
// gap) where the figure is theirs, not ours. Converting it would silently
// invent an exchange rate for a number nobody asked us to convert; a US
// visitor who types 3000 means $3,000, not ₹3,000 at today's rate. Contrast
// with formatMoney(), which DOES convert, because that one is always our own
// INR-denominated price being shown in a different currency.
export function formatLocal(n, cur) {
  const c = CURRENCIES[cur] || CURRENCIES.INR;
  try {
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, maximumFractionDigits: 0 }).format(Math.round(n));
  } catch (e) {
    return c.code + ' ' + Math.round(n).toLocaleString('en-US');
  }
}

// Applies curated/converted pricing to every `.cnl-price[data-inr]` element on
// the page and keeps it live as rates load and as the visitor's currency
// changes elsewhere on the site. For pages that just need their prices to
// localise themselves with no dropdown UI of their own (pricing.astro's own
// script still owns its dropdown + note text and calls this same pattern
// inline, so it is not duplicated here).
export async function applyPriceSpans(selector = '.cnl-price') {
  if (typeof document === 'undefined') return;
  const els = () => Array.from(document.querySelectorAll(selector));
  if (!els().length) return;
  let fx = { rates: null, live: false };
  const render = () => {
    const cur = usableCurrency(getCurrency());
    els().forEach((el) => {
      const inr = parseInt(el.getAttribute('data-inr'), 10);
      if (Number.isNaN(inr)) return;
      el.textContent = curatedPrice(inr, cur) || formatMoney(inr, cur, fx.rates);
    });
  };
  render();
  fx = await loadRates();
  render();
  // Astro view transitions re-run page scripts without a full reload, so a
  // page a visitor revisits would otherwise stack another 'cnl:currency'
  // listener each time. One live listener per page is enough.
  if (!document.__cnlPriceSpansBound) {
    document.__cnlPriceSpansBound = true;
    onCurrency(render);
  }
}
