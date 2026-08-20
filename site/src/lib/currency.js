// Per-market pricing for the pricing page. Prices are AUTHORED in INR
// (the base the business is quoted in) but each market's figures are set
// to that market's own going rate for agency work - they are not the INR
// price run through an exchange rate. A US retainer is priced against US
// agency rates, a UAE one against UAE rates, and so on.
//
// This is a deliberate commercial decision, and the pricing UI says so
// on screen ("Pricing is set per market, not converted at an exchange
// rate") rather than leaving a visitor to infer a conversion that isn't
// happening.
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

// Hand-set price points per market, keyed by the INR base amount of each
// tier. Deliberate clean numbers (£400, not £394.12) so the ladder reads as
// intentional in every currency. Keys MUST track the live tier ladder in
// pricing.astro and the per-service tiers in the quote builder
// (16k / 33k / 50k / 75k / 1.24L); when they drift, a tier with no row here
// falls through to a MARKET_RATE calculation sitting beside a clean one,
// which is what makes a price list look careless.
//
// Set to each market's own going rate for agency retainers, NOT converted
// from INR at an exchange rate. Researched Aug 2026 against published
// agency pricing surveys per market:
//   US      SMB $1,500-5,000/mo, avg retainer $2,917, local/narrow $500-1,500
//   UK      small business £750-2,000, local service £300-800
//   DACH    €1,500-5,000, floor €800
//   UAE     AED 3,000-8,000 small-mid, 8,000-30,000 full service
//   Canada  CAD 1,500-5,000 SMB, 1,000-2,500 small local
//   AU      AUD 1,500-5,000 SMB, average 2,500-3,500
//   SG      SGD 1,500-3,000 SME - and notably stratified by agency age:
//           under 2 years averages 1,540, over 5 years averages 3,648
//
// That last figure sets the whole posture. Markets price agency maturity,
// not just scope, so this ladder deliberately sits in the new-to-mid band
// rather than at the mature-agency average: high enough to be taken
// seriously, not so high it invites a comparison we would lose on
// track record.
// NUMBERS, not display strings, and that matters: the quote builder has to
// add these up. When this table held formatted strings the builder could
// not use them, so it computed totals from the INR base times MARKET_RATE
// instead - which put four line items reading $500 above a subtotal of
// $1,651 on the same screen. One numeric source of truth, formatted for
// display by money(), keeps the line items and the total in agreement.
export const CURATED = {
  16000:  { INR: 16000,  USD: 500,  EUR: 800,  GBP: 400,  AED: 3000,  CAD: 1000, AUD: 1100, SGD: 800 },
  33000:  { INR: 33000,  USD: 900,  EUR: 1300, GBP: 700,  AED: 5000,  CAD: 1600, AUD: 1800, SGD: 1400 },
  50000:  { INR: 50000,  USD: 1500, EUR: 2000, GBP: 1200, AED: 8000,  CAD: 2500, AUD: 2800, SGD: 2200 },
  75000:  { INR: 75000,  USD: 2200, EUR: 3000, GBP: 1800, AED: 12000, CAD: 3500, AUD: 3800, SGD: 3000 },
  124000: { INR: 124000, USD: 3200, EUR: 4200, GBP: 2500, AED: 18000, CAD: 4800, AUD: 5000, SGD: 4000 },
};

// Symbols kept explicit rather than left to Intl: Intl renders AED as
// "AED 3,000.00" where the price list wants "Dh 3,000".
const SYMBOL = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'Dh ', CAD: 'CA$', AUD: 'A$', SGD: 'S$' };

// Multiplier from the INR base to each market's price, for every amount
// that ISN'T one of the curated tiers above - add-on sliders, per-unit
// extras and computed totals. Fitted to the top of the ladder, because
// add-ons scale with the size of the engagement.
//
// This replaces the old live-exchange-rate conversion, and that is the
// point: converting add-ons at FX while tiers were priced to market gave
// a $500 Starter sitting beside $6 add-ons. One multiplier per market
// keeps every figure on a pricing page internally consistent - and it
// removes a third-party FX fetch from the critical path, so pricing can
// no longer degrade because someone else's API was slow.
export const MARKET_RATE = {
  INR: 1,
  USD: 0.0258,
  EUR: 0.0339,
  GBP: 0.0202,
  AED: 0.1452,
  CAD: 0.0387,
  AUD: 0.0403,
  SGD: 0.0323,
};

// The price of an INR tier amount in `cur`, AS A NUMBER: the curated figure
// when this is one of the published tiers, otherwise the INR base at that
// market's rate. This is the single function every price on the site should
// go through, so a tier costs the same wherever it is rendered or summed.
export function priceIn(inr, cur) {
  const row = CURATED[inr];
  if (row && row[cur] != null) return row[cur];
  const rate = MARKET_RATE[cur];
  return rate ? inr * rate : inr;
}

// Formats an amount ALREADY IN `cur` - no conversion. Use for anything the
// quote builder has computed in the display currency.
export function money(amount, cur) {
  const c = CURRENCIES[cur] ? cur : 'INR';
  const grouped = Math.round(amount).toLocaleString(c === 'INR' ? 'en-IN' : 'en-US');
  return (SYMBOL[c] || c + ' ') + grouped;
}

// The clean price string for a tier amount in a currency, or null if this
// amount/currency has no row. Kept for the .cnl-price spans on pricing.astro.
export function curatedPrice(inr, cur) {
  const row = CURATED[inr];
  return row && row[cur] != null ? money(row[cur], cur) : null;
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
// Kept async and same-shaped so every existing caller works untouched, but
// it no longer fetches anything: prices are set per market (MARKET_RATE),
// not converted at a daily exchange rate, so there is nothing to fetch and
// nothing that can fail. Resolves immediately.
export async function loadRates() {
  const r = { date: today(), rates: MARKET_RATE, live: true };
  if (typeof window !== 'undefined') window.__cnlRates = r;
  return r;
}

// The exact amount in `cur`, or null if it cannot be converted (no rate).
export function convert(inr, cur, rates) {
  if (cur === 'INR') return inr;
  if (!rates || !rates[cur]) return null;
  return inr * rates[cur];
}

// Formats an INR figure in the chosen currency. Always safe: if there is
// no rate for `cur`, it renders the honest INR figure instead of guessing.
export function formatMoney(inr, cur) {
  const c = CURRENCIES[cur] ? cur : 'INR';
  return money(priceIn(inr, c), c);
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
