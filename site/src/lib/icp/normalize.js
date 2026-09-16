/**
 * ICP Intelligence: turns raw questionnaire answers into the derived,
 * comparable values the scoring engine reasons over.
 *
 * Everything here is either arithmetic on what the user typed or a mapping
 * onto a published ordinal scale. Nothing is looked up, estimated from
 * outside data, or filled in from a benchmark. When a value cannot be
 * derived, the function returns null and the caller is expected to either
 * record an assumption or drop that dimension from the weighting. A null
 * that quietly becomes a zero is how a scoring engine starts lying, so
 * nulls are preserved all the way through.
 */

/* Approximate conversion to INR, used only to place a figure into one of the
   five deal-size bands below. These are rounded, deliberately stale, and
   never shown to the user as a converted amount or presented as a live rate.
   Banding is coarse enough that a rate moving twenty percent does not change
   which band a business lands in. */
const TO_INR = { INR: 1, USD: 85, AED: 23, GBP: 108, EUR: 92 };

/* Deal-size bands, in INR of first-year customer value. These are this
   engine's own definitions, published in the UI, not market benchmarks. */
export const VALUE_BANDS = [
  { band: 1, max: 5000, label: 'Micro (under ₹5,000 a year per customer)' },
  { band: 2, max: 50000, label: 'Small (₹5,000 to ₹50,000)' },
  { band: 3, max: 500000, label: 'Mid (₹50,000 to ₹5 lakh)' },
  { band: 4, max: 5000000, label: 'Large (₹5 lakh to ₹50 lakh)' },
  { band: 5, max: Infinity, label: 'Very large (over ₹50 lakh)' },
];

export const num = (v) => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

export const pct = (v) => {
  const n = num(v);
  if (n === null) return null;
  return Math.max(0, Math.min(100, n));
};

/** Purchases per year implied by the stated repeat frequency. */
export const PURCHASES_PER_YEAR = {
  never: 1, yearly: 1, quarterly: 4, monthly: 12, weekly: 52,
};

/**
 * First-year revenue from one customer, in INR.
 * Recurring models annualise the monthly figure; transactional models
 * multiply order value by stated purchase frequency. Returns null when the
 * user gave neither figure, which is common and must not be papered over.
 */
export function firstYearValue(a) {
  const rate = TO_INR[a.currency] || 1;
  const monthly = num(a.monthlyValue);
  if (monthly !== null) return monthly * 12 * rate;
  const aov = num(a.avgOrderValue);
  if (aov !== null) {
    const perYear = PURCHASES_PER_YEAR[a.repeatFrequency] ?? 1;
    return aov * perYear * rate;
  }
  return null;
}

export function valueBand(inrValue) {
  if (inrValue === null) return null;
  return VALUE_BANDS.find((b) => inrValue <= b.max).band;
}

export const CYCLE_ORDINAL = { instant: 0, days: 1, weeks: 2, '1-3m': 3, '3-6m': 4, '6m+': 5 };
export const SALES_CAPACITY = { '0': 0, '1': 1, '2-5': 2, '6-20': 3, '20+': 4 };
export const MARKETING_CAPACITY = { '0': 0, '1': 1, '2-5': 2, '6+': 3 };
export const BUDGET_ORDINAL = { none: 0, under25k: 1, '25k-1l': 2, '1l-5l': 3, '5l+': 4 };
export const MATURITY_ORDINAL = { none: 0, basic: 1, active: 2, advanced: 3 };
export const RETENTION_SCORE = { strong: 5, mixed: 3, weak: 1 };
export const DELIVERY_LOAD = { light: 1, moderate: 3, heavy: 5 };

const ord = (map, v) => (v in map ? map[v] : null);

/**
 * The single derived object the scoring engine reads. Built once so every
 * dimension sees the same numbers, and so a test can assert on the derived
 * layer without going through the UI.
 */
export function deriveProfile(a) {
  const yearValue = firstYearValue(a);
  const band = valueBand(yearValue);
  const margin = pct(a.grossMargin);

  return {
    raw: a,
    // Economics
    firstYearValueInr: yearValue,
    valueBand: band,
    grossMargin: margin,
    minOrderValueInr: num(a.minOrderValue) === null ? null : num(a.minOrderValue) * (TO_INR[a.currency] || 1),
    purchasesPerYear: PURCHASES_PER_YEAR[a.repeatFrequency] ?? null,
    // Sales and capacity
    cycle: ord(CYCLE_ORDINAL, a.salesCycle),
    salesCapacity: ord(SALES_CAPACITY, a.salesTeamSize),
    marketingCapacity: ord(MARKETING_CAPACITY, a.marketingTeamSize),
    budget: ord(BUDGET_ORDINAL, a.marketingBudget),
    maturity: ord(MATURITY_ORDINAL, a.marketingMaturity),
    headroom: num(a.additionalCustomers),
    deliveryLoad: ord(DELIVERY_LOAD, a.deliveryLoad),
    // Customers
    retention: ord(RETENTION_SCORE, a.retention),
    hasCustomers: a.hasCustomers === 'yes' ? 'yes' : a.hasCustomers === 'few' ? 'few' : a.hasCustomers === 'no' ? 'no' : null,
    topSegmentShare: pct(a.topSegmentShare),
    // Market
    currentMarket: a.currentMarket || null,
    targetMarket: a.targetMarket || null,
    expanding: !!a.targetMarket && a.targetMarket !== 'same',
    remoteDelivery: a.deliversRemotely || null,
  };
}

/** Which derived signals the user actually supplied. Drives confidence. */
export const SIGNAL_KEYS = [
  'firstYearValueInr', 'grossMargin', 'purchasesPerYear', 'cycle', 'salesCapacity',
  'marketingCapacity', 'budget', 'maturity', 'headroom', 'retention', 'hasCustomers',
  'topSegmentShare', 'currentMarket', 'targetMarket', 'remoteDelivery', 'minOrderValueInr',
];

export function suppliedSignals(derived) {
  const supplied = [];
  const missing = [];
  SIGNAL_KEYS.forEach((k) => {
    const v = derived[k];
    (v === null || v === undefined ? missing : supplied).push(k);
  });
  return { supplied, missing };
}

/** Strips anything that could carry markup before it reaches the DOM or an email. */
export function clean(str, max = 600) {
  return String(str ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}
