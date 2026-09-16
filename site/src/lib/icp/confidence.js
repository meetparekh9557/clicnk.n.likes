/**
 * ICP Intelligence: confidence, assumptions, contradictions, and the part
 * that argues back.
 *
 * Three jobs, all of them about honesty rather than cleverness:
 *
 * 1. CONFIDENCE reports how much of the analysis rests on real answers.
 *    It counts signals actually supplied, not questions displayed, so
 *    skipping things you do not track lowers confidence without ever
 *    invalidating the result.
 *
 * 2. ASSUMPTIONS are the small number of places the engine fills a gap by
 *    inference. Each one is recorded with what it assumed and what it
 *    assumed it from, and each one is shown in the report. An assumption
 *    the user cannot see is indistinguishable from a fabrication.
 *
 * 3. CONTRADICTIONS and the CHALLENGE are the reason this is a diagnostic
 *    rather than a form. If someone says their ideal customer is enterprise
 *    while their own numbers describe a business built for small, fast
 *    deals, repeating their answer back would be worse than useless. The
 *    engine scores the business independently and then says so.
 */

import { suppliedSignals, SIGNAL_KEYS, valueBand } from './normalize.js';
import { segmentById, STATED_TARGET_MAP } from './segments.js';
import { goalById, stageById, traitsFor } from './taxonomy.js';

/* ------------------------------------------------------------- Assumptions */
/**
 * The complete set of inferences the engine is permitted to make, each one
 * declared. Anything not listed here is never invented: it is dropped from
 * the weighting instead.
 */
export function buildAssumptions(d, a) {
  const out = [];
  const traits = traitsFor(a.businessModel, a.secondaryModels);

  if (d.firstYearValueInr === null && d.minOrderValueInr !== null) {
    out.push({
      id: 'value_from_floor',
      assumed: `Customer value treated as at least your minimum order value.`,
      basis: 'You gave a minimum order value but not an average order or contract value, so the floor was used as a conservative stand-in for deal size.',
      affects: 'Deal-size fit',
    });
  }
  if (d.purchasesPerYear === null && traits.has('recurring')) {
    out.push({
      id: 'recurring_repeat',
      assumed: 'Customers were treated as recurring rather than one-off.',
      basis: 'You did not state a repeat frequency, but your business model is a recurring one, so repeat value was scored from the model rather than left out.',
      affects: 'Repeat and lifetime value',
    });
  }
  if (d.hasCustomers === null && ['idea', 'prerevenue'].includes(a.stage)) {
    out.push({
      id: 'no_customers_yet',
      assumed: 'The analysis was run without any existing-customer evidence.',
      basis: `You told us the business is at the ${stageById(a.stage)?.label.toLowerCase()} stage, so there is no customer base to reason from yet.`,
      affects: 'Evidence fit, which was excluded entirely',
    });
  }
  if (d.grossMargin === null) {
    out.push({
      id: 'no_margin',
      assumed: 'No margin assumption was made.',
      basis: 'Margin was not supplied, so it was excluded from the weighting rather than estimated. Segments that are expensive to acquire were therefore not penalised for a margin we cannot see.',
      affects: 'Deal-size fit and negative signals',
    });
  }
  if (d.retention === null && d.hasCustomers && d.hasCustomers !== 'no') {
    out.push({
      id: 'no_retention',
      assumed: 'No retention assumption was made.',
      basis: 'Retention was not supplied, so repeat value was scored from your business model and purchase frequency alone.',
      affects: 'Repeat and lifetime value',
    });
  }
  return out;
}

/** Applies the declared assumptions that actually change a derived value. */
export function applyAssumptions(d, assumptions) {
  const next = { ...d };
  if (assumptions.some((x) => x.id === 'value_from_floor') && next.minOrderValueInr !== null) {
    next.firstYearValueInr = next.minOrderValueInr;
    next.valueBand = valueBand(next.minOrderValueInr);
  }
  if (assumptions.some((x) => x.id === 'recurring_repeat')) {
    next.purchasesPerYear = next.purchasesPerYear ?? 12;
  }
  return next;
}

/* ---------------------------------------------------------- Contradictions */
/**
 * Places where the answers disagree with each other. These are shown to the
 * user as things to resolve, and they lower confidence, because an
 * inconsistent input set produces a less trustworthy result no matter how
 * complete it is.
 */
export function findContradictions(d, a) {
  const out = [];
  const traits = traitsFor(a.businessModel, a.secondaryModels);
  const goalLabel = goalById(a.primaryGoal)?.label || 'your goal';

  if (['growth', 'scale', 'mature'].includes(a.stage) && d.hasCustomers === 'no') {
    out.push({
      id: 'stage_vs_customers',
      detail: `You described the business as ${stageById(a.stage)?.label.toLowerCase()} but also said there are no paying customers yet. One of those is probably not what you meant, and the analysis leaned on the customer answer.`,
    });
  }
  if (['recurring', 'retention', 'repeat', 'ltv'].includes(a.primaryGoal)
      && a.repeatFrequency === 'never' && !traits.has('recurring')) {
    out.push({
      id: 'recurring_goal_oneoff_model',
      detail: `Your goal is "${goalLabel}", but you sell a one-off purchase that customers almost never repeat. No customer segment can fix that on its own; the offer itself has to give people a reason to come back.`,
    });
  }
  if (a.primaryGoal === 'enterprise' && d.valueBand !== null && d.valueBand <= 2) {
    out.push({
      id: 'enterprise_goal_small_deal',
      detail: 'Your goal is to win enterprise customers, but your deal size sits in the smallest bands. Enterprise buying processes cost more to run than deals that size return.',
    });
  }
  if (['international', 'new_country'].includes(a.primaryGoal) && d.remoteDelivery === 'no') {
    out.push({
      id: 'expand_but_cannot_deliver',
      detail: 'You want to sell in another country, but you also said delivery requires your physical presence. Until that changes, the constraint matters more than the target market does.',
    });
  }
  if (d.headroom === 0 && !['retention', 'repeat', 'ltv', 'aov'].includes(a.primaryGoal)) {
    out.push({
      id: 'no_capacity_growth_goal',
      detail: 'You said you cannot take on more customers right now, but your goal is about winning more of them. Either capacity has to come first, or the goal should be about value per customer rather than volume.',
    });
  }
  if (a.primaryGoal === 'paid_efficiency' && d.budget === 0) {
    out.push({
      id: 'paid_goal_no_budget',
      detail: 'Your goal is paid acquisition efficiency, but you have effectively no marketing budget. There is nothing to make efficient yet.',
    });
  }
  return out;
}

/* ------------------------------------------------------------- Confidence */
const LEVELS = [
  { min: 75, level: 'High', label: 'High confidence' },
  { min: 50, level: 'Moderate', label: 'Moderate confidence' },
  { min: 0, level: 'Low', label: 'Low confidence' },
];

export function assessConfidence(d, a, assumptions, contradictions) {
  const { supplied, missing } = suppliedSignals(d);
  const coverage = (supplied.length / SIGNAL_KEYS.length) * 100;

  // Each assumption and each contradiction narrows how much the result can
  // be relied on. The penalties are small on purpose: a complete but
  // slightly inconsistent set of answers is still far more useful than a
  // sparse one, and the user should not be scared off a usable result.
  const penalty = assumptions.filter((x) => x.id !== 'no_margin' && x.id !== 'no_retention').length * 5
    + contradictions.length * 7;
  const score = Math.max(5, Math.min(95, Math.round(coverage - penalty)));
  const tier = LEVELS.find((l) => score >= l.min);

  const readable = {
    firstYearValueInr: 'customer value', grossMargin: 'gross margin',
    purchasesPerYear: 'purchase frequency', cycle: 'sales cycle',
    salesCapacity: 'sales team size', marketingCapacity: 'marketing team size',
    budget: 'marketing budget', maturity: 'marketing maturity',
    headroom: 'spare capacity', retention: 'retention', hasCustomers: 'existing customers',
    topSegmentShare: 'revenue concentration', currentMarket: 'current market',
    targetMarket: 'target market', remoteDelivery: 'remote delivery',
    minOrderValueInr: 'minimum order value',
  };

  const missingNames = missing.map((k) => readable[k] || k);
  const summary = `${tier.label}. The recommendation is based on ${supplied.length} of ${SIGNAL_KEYS.length} business signals.`
    + (missingNames.length
      ? ` ${missingNames.slice(0, 4).join(', ')}${missingNames.length > 4 ? ` and ${missingNames.length - 4} more` : ''} ${missingNames.length === 1 ? 'was' : 'were'} not available, so ${missingNames.length === 1 ? 'it was' : 'they were'} not weighted.`
      : ' Every signal the engine reads was supplied.')
    + (contradictions.length ? ` ${contradictions.length} inconsistenc${contradictions.length === 1 ? 'y was' : 'ies were'} found in your answers and ${contradictions.length === 1 ? 'is' : 'are'} listed below.` : '');

  return {
    score, level: tier.level, label: tier.label, summary,
    signalsSupplied: supplied.length, signalsTotal: SIGNAL_KEYS.length,
    missing: missingNames,
  };
}

/* --------------------------------------------------------------- Challenge */
/**
 * Compares what the user said they were targeting against what their own
 * numbers score highest. Returns null when they did not state a target, or
 * when their belief and the analysis already agree.
 *
 * The output deliberately never says the user is wrong. It says which
 * specific dimensions disagree and by how much, because the user knows
 * things this engine does not, and the useful move is to show the working
 * rather than to overrule them.
 */
export function challengeStatedTarget(ranked, a) {
  const mappedId = STATED_TARGET_MAP[a.statedTarget];
  if (!mappedId) return null;
  const stated = ranked.find((r) => r.segmentId === mappedId);
  if (!stated) {
    return {
      kind: 'unavailable',
      statedName: segmentById(mappedId)?.name || 'your stated target',
      detail: 'The segment you named is not a candidate for the business model you described, so it could not be scored alongside the others.',
    };
  }
  const top = ranked[0];
  const rank = ranked.indexOf(stated) + 1;
  const gap = top.score - stated.score;
  if (stated.segmentId === top.segmentId) {
    return {
      kind: 'agrees', statedName: stated.name, rank, gap: 0, score: stated.score,
      detail: `Your own reading matches the analysis. ${stated.name} scored highest on your inputs as well, at ${stated.score} out of 100.`,
    };
  }
  if (gap < 10) {
    return {
      kind: 'close', statedName: stated.name, topName: top.name, rank, gap, score: stated.score,
      detail: `${stated.name} scored ${stated.score} against ${top.name} at ${top.score}. That is close enough that your judgement about your own market may well be the better guide.`,
      weakest: [],
    };
  }

  // A real disagreement. Name the dimensions where the stated target loses
  // most ground, so the user can check the reasoning rather than the verdict.
  const byDim = {};
  top.contributions.forEach((c) => { byDim[c.dimension] = { top: c.score, weight: c.weight }; });
  const weakest = stated.contributions
    .filter((c) => byDim[c.dimension])
    .map((c) => ({
      dimension: c.dimension,
      statedScore: c.score,
      topScore: byDim[c.dimension].top,
      deficit: (byDim[c.dimension].top - c.score) * c.weight,
      reasons: c.reasons,
    }))
    .filter((x) => x.deficit > 0)
    .sort((x, y) => y.deficit - x.deficit)
    .slice(0, 3);

  return {
    kind: 'conflicts',
    statedName: stated.name, topName: top.name, rank, gap, score: stated.score, topScore: top.score,
    detail: `You said you should be targeting ${stated.name}. On the answers you gave, that segment ranks ${rank} of ${ranked.length} at ${stated.score} out of 100, while ${top.name} scores ${top.score}. Here is where the difference comes from.`,
    weakest,
    negatives: stated.negatives,
    caveat: 'This is a model reading your inputs, not a verdict on your market. If you know something about these buyers that the questions did not capture, that knowledge should win.',
  };
}
