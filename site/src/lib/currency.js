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
export const CURATED = {
  16000:  { INR: '₹16,000',   USD: '$190',   EUR: '€179',   GBP: '£149',   AED: 'Dh 699',   CAD: 'CA$259',   AUD: 'A$289',   SGD: 'S$259' },
  42000:  { INR: '₹42,000',   USD: '$500',   EUR: '€469',   GBP: '£399',   AED: 'Dh 1,899', CAD: 'CA$699',   AUD: 'A$769',   SGD: 'S$679' },
  150000: { INR: '₹1,50,000', USD: '$1,790', EUR: '€1,649', GBP: '£1,399', AED: 'Dh 6,599', CAD: 'CA$2,449', AUD: 'A$2,699', SGD: 'S$2,399' },
};

// The curated clean price string for a tier amount in a currency, or null if
// this amount/currency isn't curated (caller then converts at the live rate).
export function curatedPrice(inr, cur) {
  const row = CURATED[inr];
  return row && row[cur] ? row[cur] : null;
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
