/**
 * ICP Intelligence: how the objective reshapes the scoring.
 *
 * Two separate mechanisms, deliberately kept apart:
 *
 * 1. WEIGHTS change how much each scoring dimension counts. Chasing lower
 *    acquisition cost makes reachability matter more and deal size matter
 *    less. The dimensions are unchanged; their importance is not.
 *
 * 2. AFFINITY is a dimension in its own right, scoring how directly a
 *    segment serves the stated objective. Retention goals favour segments
 *    that recur by nature; expansion goals favour segments that travel.
 *
 * Without the second mechanism, weights alone would only ever reorder
 * segments slightly. With it, changing the objective can genuinely change
 * the answer, which is the entire premise of the tool.
 *
 * The primary goal carries full force. Each secondary goal contributes at
 * SECONDARY_INFLUENCE, so three secondary goals together still cannot
 * outvote the primary one. That ceiling is intentional: a founder who says
 * "revenue first, and also these three" has told us an order of priority,
 * and the engine should respect it rather than averaging it away.
 */

import { goalById } from './taxonomy.js';

export const SECONDARY_INFLUENCE = 0.35;

export const DIMENSIONS = [
  'economicFit', 'capacityFit', 'goalAlignment', 'acquisitionFeasibility',
  'marketAccess', 'evidenceFit', 'retentionValue', 'demandIntensity',
];

/* Base importance before the objective is applied. Economic and capacity fit
   lead because a customer who cannot pay enough, or cannot be served, is not
   a customer regardless of how appealing they look on paper. */
export const BASE_WEIGHTS = {
  economicFit: 1.3,
  capacityFit: 1.2,
  goalAlignment: 1.4,
  acquisitionFeasibility: 1.1,
  marketAccess: 1.0,
  evidenceFit: 0.9,
  retentionValue: 0.9,
  demandIntensity: 1.0,
};

/** Combined multiplier per dimension, primary goal plus damped secondaries. */
export function resolveWeights(primaryGoalId, secondaryGoalIds = []) {
  const weights = { ...BASE_WEIGHTS };
  const primary = goalById(primaryGoalId);
  if (primary) {
    Object.entries(primary.weights).forEach(([dim, mult]) => {
      if (weights[dim] !== undefined) weights[dim] *= mult;
    });
  }
  (secondaryGoalIds || []).forEach((id) => {
    const g = goalById(id);
    if (!g || id === primaryGoalId) return;
    Object.entries(g.weights).forEach(([dim, mult]) => {
      if (weights[dim] === undefined) return;
      // Pull the multiplier a fraction of the way towards the secondary
      // goal's preference rather than applying it outright.
      weights[dim] *= 1 + (mult - 1) * SECONDARY_INFLUENCE;
    });
  });
  return weights;
}

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const band = (v, lo, hi) => clamp(((v - lo) / (hi - lo)) * 100);

/**
 * How well a segment's own nature serves a given objective, 0 to 100.
 * Each rule reads only published segment properties, so the reasoning can be
 * shown to the user rather than asserted.
 */
const AFFINITY = {
  revenue: (s) => band((s.valueBand[1] + s.expansionPotential) / 2, 1, 5),
  aov: (s) => band(s.valueBand[1], 1, 5),
  ltv: (s) => band((s.repeatPotential * 2 + s.expansionPotential) / 3, 1, 5),
  recurring: (s) => band(s.repeatPotential, 1, 5),
  retention: (s) => band(s.repeatPotential, 1, 5),
  repeat: (s) => band(s.repeatPotential, 1, 5),
  reduce_cac: (s) => band(6 - s.acquireDifficulty, 1, 5),
  qualified_leads: (s) => band((6 - s.acquireDifficulty + (6 - s.decisionComplexity)) / 2, 1, 5),
  organic_traffic: (s) => band(6 - s.acquireDifficulty, 1, 5),
  paid_efficiency: (s) => band(((6 - s.acquireDifficulty) + s.valueBand[0]) / 2, 1, 5),
  awareness: (s) => band(6 - s.acquireDifficulty, 1, 5),
  consumers: (s) => (s.type === 'b2c' ? 90 : 20),
  smb: (s) => (['owner_micro', 'smb'].includes(s.id) ? 95 : s.type === 'b2b' ? 40 : 15),
  enterprise: (s) => (['enterprise', 'procurement_led'].includes(s.id) ? 95 : s.id === 'mid_market' ? 60 : 15),
  sales: (s) => band((6 - s.cycleNeed + (6 - s.decisionComplexity)) / 2, 1, 6),
  ecom_purchases: (s) => (s.type === 'b2c' ? band((6 - s.cycleNeed + s.repeatPotential) / 2, 1, 5) : 15),
  conversion: (s) => band((6 - s.decisionComplexity + (6 - s.cycleNeed)) / 2, 1, 6),
  sales_efficiency: (s) => band((6 - s.cycleNeed + (6 - s.serviceLoad)) / 2, 1, 6),
  pipeline: (s) => band((6 - s.acquireDifficulty + s.repeatPotential) / 2, 1, 5),
  lead_quality: (s) => band((s.valueBand[0] + s.repeatPotential) / 2, 1, 5),
  market_share: (s) => band((6 - s.acquireDifficulty + s.expansionPotential) / 2, 1, 5),
  // Expansion goals reward segments that are not tied to a travel radius.
  new_market: (s) => (s.geo === 'local' ? 20 : 80),
  new_country: (s) => (s.geo === 'local' ? 10 : s.geo === 'international' ? 95 : 70),
  international: (s) => (s.geo === 'local' ? 10 : s.geo === 'international' ? 95 : 70),
  validate: (s) => band((6 - s.acquireDifficulty + (6 - s.cycleNeed)) / 2, 1, 6),
  new_product: (s) => band((6 - s.cycleNeed + s.repeatPotential) / 2, 1, 5),
  new_product_customers: (s) => band((6 - s.acquireDifficulty + (6 - s.cycleNeed)) / 2, 1, 6),
};

/* Short, honest explanations of why a goal favours what it favours. Shown
   verbatim in the results, so they have to read as reasoning rather than as
   a label. */
const AFFINITY_REASON = {
  revenue: 'Revenue goals favour segments that spend more per customer and can grow that spend over time.',
  aov: 'Raising order value favours segments that transact at a higher band to begin with.',
  ltv: 'Lifetime value is driven far more by how often a customer returns than by what they spend once.',
  recurring: 'Recurring revenue depends on segments whose buying is naturally repeated rather than one-off.',
  retention: 'Retention goals favour segments that have a reason to come back without being re-sold.',
  repeat: 'Repeat purchase goals favour segments where buying again is part of normal behaviour.',
  reduce_cac: 'Lowering acquisition cost favours segments that are cheap to reach and quick to decide.',
  qualified_leads: 'Lead volume and quality improve fastest in segments that are reachable and decide without a committee.',
  organic_traffic: 'Organic growth compounds fastest where the audience is searchable and reachable without paid spend.',
  paid_efficiency: 'Paid efficiency needs both a reachable audience and enough value per customer to cover the click.',
  awareness: 'Awareness goals favour segments that can be reached at scale without a long sales process.',
  consumers: 'A consumer acquisition goal only makes sense against consumer segments.',
  smb: 'Targeting smaller organisations favours the owner-led and small-business archetypes directly.',
  enterprise: 'An enterprise goal favours the segments that actually carry enterprise budgets and processes.',
  sales: 'Increasing sales favours segments that decide quickly and without layers of approval.',
  ecom_purchases: 'Ecommerce purchase goals favour consumer segments that buy fast and buy again.',
  conversion: 'Conversion improves fastest where fewer people are involved and the decision is quick.',
  sales_efficiency: 'Sales efficiency favours short cycles and low service load per customer.',
  pipeline: 'Predictable pipeline needs segments that are reliably reachable and recur.',
  lead_quality: 'Better lead quality means fewer, larger, more repeatable customers rather than more enquiries.',
  market_share: 'Share gain favours segments that are reachable and can expand their spend with you.',
  new_market: 'Entering a new market rules out segments defined by proximity to where you already are.',
  new_country: 'Crossing a border favours segments that trade across borders by nature, such as distributors and importers.',
  international: 'International expansion favours segments that are not tied to a travel radius.',
  validate: 'Validating a market favours segments that can be reached and can decide quickly, so you learn sooner.',
  new_product: 'A new product needs segments that will try it and buy it again, not segments that buy once after a long evaluation.',
  new_product_customers: 'Finding first customers for something new favours the fastest, most reachable segments.',
};

/** Goal alignment for one segment, with the sentence explaining it. */
export function goalAffinity(segment, primaryGoalId, secondaryGoalIds = []) {
  const fn = AFFINITY[primaryGoalId];
  if (!fn) {
    return { score: 50, available: false, reason: 'No goal-specific rule applies, so this dimension is held neutral rather than guessed at.' };
  }
  let score = fn(segment);
  const notes = [AFFINITY_REASON[primaryGoalId]];
  (secondaryGoalIds || []).forEach((id) => {
    const sfn = AFFINITY[id];
    if (!sfn || id === primaryGoalId) return;
    score = score + (sfn(segment) - score) * SECONDARY_INFLUENCE;
    if (AFFINITY_REASON[id]) notes.push(`Secondary goal: ${AFFINITY_REASON[id]}`);
  });
  return { score: clamp(score), available: true, reason: notes.join(' ') };
}
