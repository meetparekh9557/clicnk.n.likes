/**
 * ICP Intelligence: the scoring engine.
 *
 * Eight dimensions, each scored 0 to 100 on its own, then combined using the
 * weights the objective produced. The output is an ALIGNMENT score, not a
 * probability. It says how well a segment matches this business as described,
 * and it deliberately never says how likely anyone is to buy, because nothing
 * in this engine could support that claim.
 *
 * The rule that shapes everything else: a dimension with no data is dropped
 * from the weighted mean, never scored as zero. Scoring an unknown as zero
 * would punish a business for not tracking its churn, which would be both
 * unfair and wrong. Dropping it narrows the evidence base instead, and
 * confidence.js reports that narrowing honestly.
 */

import { candidateSegments, segmentById } from './segments.js';
import { resolveWeights, goalAffinity, DIMENSIONS } from './goalWeights.js';
import { audienceOf, stageById, scopeById, traitsFor } from './taxonomy.js';

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));
const dim = (score, reasons, available = true) => ({ score: clamp(score), reasons, available });
const NA = (why) => ({ score: 50, reasons: [{ label: 'Not scored', detail: why }], available: false });

/* --------------------------------------------------------------- 1. Economics */
/* Distance between what this business charges and what the segment transacts
   at. Distance in either direction is a mismatch: a price too small for an
   enterprise motion to be worth running, or too large for a micro business
   to sign. */
function economicFit(seg, d) {
  if (d.valueBand === null) return NA('You did not give an order or contract value, so deal-size fit was left out of the weighting rather than guessed.');
  const [lo, hi] = seg.valueBand;
  const distance = d.valueBand < lo ? lo - d.valueBand : d.valueBand > hi ? d.valueBand - hi : 0;
  const base = [95, 60, 30, 12, 6][Math.min(distance, 4)];
  const reasons = [];
  if (distance === 0) {
    reasons.push({ label: 'Deal size fits', detail: `Your first-year customer value sits in band ${d.valueBand}, inside this segment's usual band ${lo} to ${hi}.` });
  } else if (d.valueBand < lo) {
    reasons.push({ label: 'Your price is below this segment', detail: `You are in band ${d.valueBand}; this segment usually transacts at band ${lo} or above. Winning them would cost more than the deal returns.` });
  } else {
    reasons.push({ label: 'Your price is above this segment', detail: `You are in band ${d.valueBand}; this segment usually transacts at band ${hi} or below, so most of them cannot sign what you charge.` });
  }

  let score = base;
  if (d.grossMargin !== null && d.grossMargin < 25 && seg.acquireDifficulty >= 4) {
    score -= 15;
    reasons.push({ label: 'Margin cannot fund this acquisition', detail: `At ${d.grossMargin}% gross margin there is little left to spend winning a segment this slow and expensive to reach.` });
  }
  if (d.grossMargin !== null && d.grossMargin >= 60 && seg.acquireDifficulty >= 3) {
    score += 6;
    reasons.push({ label: 'Margin gives you room', detail: `${d.grossMargin}% gross margin leaves enough headroom to fund a longer acquisition path.` });
  }
  return dim(score, reasons);
}

/* --------------------------------------------------------------- 2. Capacity */
/* Can this business actually sell to, and then serve, this segment. */
function capacityFit(seg, d) {
  const reasons = [];
  let score = 80;

  if (d.salesCapacity !== null) {
    const needed = seg.decisionComplexity >= 4 ? 2 : seg.decisionComplexity >= 3 ? 1 : 0;
    if (d.salesCapacity < needed) {
      score -= (needed - d.salesCapacity) * 22;
      reasons.push({ label: 'Not enough people to run this sale', detail: `This segment's decision involves several people and a formal process. With ${d.salesCapacity === 0 ? 'nobody selling actively' : `${d.salesCapacity === 1 ? 'one person' : 'a small team'}`}, that process would stall.` });
    } else {
      reasons.push({ label: 'Sales capacity is sufficient', detail: 'You have enough selling capacity for how this segment decides.' });
    }
  }

  if (d.cycle !== null) {
    const gap = seg.cycleNeed - d.cycle;
    if (gap >= 2) {
      score -= gap * 9;
      reasons.push({ label: 'Longer sale than you are set up for', detail: `This segment typically takes considerably longer to close than your current cycle, so cash and attention would be committed for longer than you are used to.` });
    }
  }

  if (d.headroom !== null) {
    if (d.headroom === 0) {
      score -= 25;
      reasons.push({ label: 'No capacity to take anyone on', detail: 'You told us you cannot take on additional customers right now, which caps every segment equally until that changes.' });
    } else if (d.headroom <= 3 && seg.valueBand[0] <= 2) {
      score -= 12;
      reasons.push({ label: 'Too few slots for a high-volume segment', detail: `With room for about ${d.headroom} more customers, a segment that pays in small amounts cannot fill your capacity profitably.` });
    } else if (d.headroom >= 20 && seg.valueBand[0] >= 4) {
      score -= 8;
      reasons.push({ label: 'Capacity outruns this segment\'s pace', detail: 'You have room for many more customers, but this segment arrives slowly and in small numbers.' });
    } else {
      reasons.push({ label: 'Capacity matches', detail: `Room for about ${d.headroom} more customers is a reasonable fit for how this segment arrives.` });
    }
  }

  if (d.deliveryLoad !== null && d.deliveryLoad >= 4 && seg.serviceLoad >= 4) {
    score -= 12;
    reasons.push({ label: 'Both sides are hands-on', detail: 'Your delivery is already heavy per customer and this segment expects a lot of attention, which compounds.' });
  }
  return dim(score, reasons);
}

/* --------------------------------------------------- 4. Acquisition feasibility */
function acquisitionFeasibility(seg, d) {
  const reasons = [];
  let score = 75;

  if (d.budget !== null) {
    const needed = Math.max(0, seg.acquireDifficulty - 1);
    if (d.budget < needed) {
      score -= (needed - d.budget) * 18;
      reasons.push({ label: 'Budget below what this segment costs to reach', detail: 'This segment sits behind slower, more expensive channels than your current budget supports.' });
    } else {
      reasons.push({ label: 'Budget is workable', detail: 'Your stated budget is in range for the channels this segment actually uses.' });
    }
  }

  if (d.maturity !== null && seg.acquireDifficulty >= 4 && d.maturity <= 1) {
    score -= 15;
    reasons.push({ label: 'Marketing is not yet built for this', detail: 'Reaching this segment depends on channels that take sustained operation, and your marketing is still early.' });
  }

  if (seg.acquireDifficulty <= 2) {
    score += 10;
    reasons.push({ label: 'Reachable without heavy spend', detail: 'This segment can be found through search, local presence and referral rather than bought attention.' });
  }
  return dim(score, reasons);
}

/* ------------------------------------------------------------ 5. Market access */
function marketAccess(seg, d, a) {
  const reasons = [];
  let score = 75;
  const wantsInternational = ['international', 'national'].includes(d.targetMarket) || d.targetMarket === 'wider_local';
  const goingAbroad = d.targetMarket === 'international';

  if (seg.geo === 'local') {
    if (goingAbroad) {
      score -= 55;
      reasons.push({ label: 'Cannot travel with you', detail: 'This segment is defined by being near you. It cannot serve a goal of selling in another country.' });
    } else if (d.currentMarket === 'local') {
      score += 18;
      reasons.push({ label: 'Matches where you actually sell', detail: 'You sell within a travel radius, and this segment is defined by being inside it.' });
    } else if (wantsInternational) {
      score -= 18;
      reasons.push({ label: 'Limits your stated reach', detail: 'You want to sell more widely, and this segment keeps you local.' });
    }
  } else if (seg.geo === 'international') {
    if (goingAbroad) {
      score += 20;
      reasons.push({ label: 'Built for crossing borders', detail: 'This segment trades across markets by nature, which is the shortest route into a new country.' });
    } else if (d.currentMarket === 'local') {
      score -= 12;
      reasons.push({ label: 'Beyond your current footprint', detail: 'You currently sell locally, so this segment would mean building a new route to market.' });
    }
  }

  if (d.remoteDelivery === 'no' && goingAbroad) {
    score -= 25;
    reasons.push({ label: 'Delivery needs you present', detail: 'You told us delivery requires physical presence, which constrains any cross-border segment until that changes.' });
  }
  if (a && a.targetMarketDetail && goingAbroad && seg.geo !== 'local') {
    reasons.push({ label: 'Target market noted', detail: `Scored against your stated target of ${a.targetMarketDetail}. This engine holds no market data for that territory, so no local demand claim is made.` });
  }
  return dim(score, reasons);
}

/* ------------------------------------------------------------ 6. Evidence fit */
/* Do the customers this business already has look like this segment. Damped
   by maturity and by scope: a brand new product should not be judged against
   the customer base of an older one. */
function evidenceFit(seg, d, a) {
  if (d.hasCustomers === 'no' || d.hasCustomers === null) {
    return NA('You have no customer base yet, so the analysis reasons from your product, price, capacity and objective instead.');
  }
  const stageWeight = stageById(a.stage)?.customerEvidenceWeight ?? 0.5;
  const scopeWeight = scopeById(a.scope)?.evidenceMultiplier ?? 1;
  const damp = stageWeight * scopeWeight;
  if (damp < 0.2) {
    return NA('Your existing customers were largely set aside here, because this ICP is for something new and those customers bought something else.');
  }

  const reasons = [];
  let raw = 50;
  const sizeMap = { micro: 'owner_micro', small: 'smb', mid: 'mid_market', large: 'enterprise' };
  if (a.customerCompanySize && sizeMap[a.customerCompanySize]) {
    if (sizeMap[a.customerCompanySize] === seg.id) {
      raw = 95;
      reasons.push({ label: 'Your existing customers already look like this', detail: 'The customer size you described matches this segment directly.' });
    } else {
      raw = 30;
      reasons.push({ label: 'Different from who buys today', detail: 'This segment is a different size from the customers you described, so it would be a deliberate shift rather than more of the same.' });
    }
  }
  const roleMap = { procurement: 'procurement_led', committee: 'enterprise', cxo: 'enterprise', owner: 'owner_micro' };
  if (a.buyerRole && roleMap[a.buyerRole] === seg.id) {
    raw = Math.max(raw, 90);
    reasons.push({ label: 'Matches who signs today', detail: 'The person who signs off in this segment is the same kind of buyer you already sell to.' });
  }
  if (seg.type === 'b2c' && a.priceSensitivity) {
    const wanted = { high: 'value_consumer', low: 'premium_consumer' }[a.priceSensitivity];
    if (wanted === seg.id) {
      raw = Math.max(raw, 88);
      reasons.push({ label: 'Matches how your customers buy', detail: 'The price behaviour you described matches this segment.' });
    }
  }
  if (d.topSegmentShare !== null && d.topSegmentShare >= 60 && raw >= 80) {
    raw += 6;
    reasons.push({ label: 'Concentrated in this type already', detail: `${d.topSegmentShare}% of your revenue already comes from one customer type, and this is it.` });
  }
  if (!reasons.length) {
    reasons.push({ label: 'Limited customer detail', detail: 'You have customers but did not describe them in enough detail to compare, so this dimension carries little weight here.' });
  }
  // Pull towards neutral in proportion to how much the evidence should count.
  return dim(50 + (raw - 50) * damp, reasons);
}

/* --------------------------------------------------------- 7. Retention value */
/* A segment can only recur as often as the business model lets it. Selling a
   genuinely one-off product to a segment that would happily buy monthly does
   not produce recurring revenue. */
function retentionValue(seg, d, a) {
  const reasons = [];
  const modelCap = d.purchasesPerYear === null ? null
    : d.purchasesPerYear >= 12 ? 5 : d.purchasesPerYear >= 4 ? 4 : d.purchasesPerYear > 1 ? 3 : 2;
  const recurring = traitsFor(a.businessModel, a.secondaryModels).has('recurring');
  const effectiveCap = modelCap === null ? (recurring ? 5 : null) : Math.max(modelCap, recurring ? 4 : modelCap);

  if (effectiveCap === null) {
    return NA('You did not tell us how often customers buy again, so repeat value was left out of the weighting.');
  }
  const potential = Math.min(seg.repeatPotential, effectiveCap);
  let score = ((potential - 1) / 4) * 100;
  if (seg.repeatPotential > effectiveCap) {
    reasons.push({ label: 'Your model caps the repeat value', detail: 'This segment would buy again more often than what you sell allows, so the extra potential cannot be realised as things stand.' });
  } else {
    reasons.push({ label: 'Repeat potential is real here', detail: 'How often this segment buys is compatible with how often you can sell.' });
  }
  if (d.retention !== null) {
    score += (d.retention - 3) * 6;
    reasons.push({ label: 'Measured against your actual retention', detail: d.retention >= 4 ? 'You told us most customers stay or return, which supports a retention-led segment.' : d.retention <= 1 ? 'You told us most customers do not return, which weakens any segment chosen for its repeat value until that is fixed.' : 'Your retention is mixed, which moderates the repeat case.' });
  }
  if (seg.expansionPotential >= 4) {
    score += 6;
    reasons.push({ label: 'Room to grow the account', detail: 'This segment typically starts smaller and increases spend over time.' });
  }
  return dim(score, reasons);
}

/* -------------------------------------------------------- 8. Demand intensity */
/* How closely the way this segment buys matches the way your customers
   actually buy today. A business that closes in days is built around urgent
   demand; a segment that takes six months is a different kind of demand. */
function demandIntensity(seg, d) {
  if (d.cycle === null) return NA('Sales cycle was not given, so buying-rhythm fit was not scored.');
  const gap = Math.abs(seg.cycleNeed - d.cycle);
  const score = Math.max(15, 100 - gap * 18);
  const reasons = [{
    label: gap <= 1 ? 'Buying rhythm matches' : 'Buying rhythm differs',
    detail: gap <= 1
      ? 'This segment decides on roughly the timescale your customers already decide on.'
      : 'This segment decides on a noticeably different timescale from your current customers, which changes how the whole funnel has to be built.',
  }];
  return dim(score, reasons);
}

/* ------------------------------------------------------------ Negative signals */
/* Hard mismatches, applied as explicit deductions after the weighted mean so
   they can be listed to the user by name. */
function negativeSignals(seg, d, a) {
  const out = [];
  const inventory = traitsFor(a.businessModel, a.secondaryModels).has('inventory');

  if (d.minOrderValueInr !== null && d.valueBand !== null && seg.valueBand[1] < d.valueBand) {
    out.push({ id: 'below_floor', penalty: 10, label: 'Below your own order floor', detail: 'This segment typically buys smaller than the minimum order value you told us you accept.' });
  }
  if (inventory && a.moq && Number(a.moq) >= 100 && seg.type === 'b2c') {
    out.push({ id: 'moq_consumer', penalty: 18, label: 'Minimum order quantity rules out consumers', detail: `A minimum order of ${a.moq} units is not something an individual consumer buys. Your MOQ points at trade buyers, not end users.` });
  }
  if (d.salesCapacity === 0 && seg.cycleNeed >= 3) {
    out.push({ id: 'no_seller_long_cycle', penalty: 12, label: 'Nobody to run a long sale', detail: 'This segment needs months of active selling and you told us nobody sells actively.' });
  }
  if (d.currentMarket === 'local' && d.remoteDelivery === 'no' && seg.geo !== 'local') {
    out.push({ id: 'cannot_travel', penalty: 14, label: 'You cannot deliver outside your radius', detail: 'Delivery requires your presence, so a segment outside your area cannot currently be served.' });
  }
  if (d.grossMargin !== null && d.grossMargin < 20 && seg.acquireDifficulty >= 4) {
    out.push({ id: 'margin_cac', penalty: 10, label: 'Margin cannot fund the acquisition', detail: `At ${d.grossMargin}% margin, a segment this expensive to win is unlikely to pay back.` });
  }
  if (d.retention !== null && d.retention <= 1 && seg.repeatPotential >= 4) {
    out.push({ id: 'retention_mismatch', penalty: 8, label: 'Repeat value depends on retention you do not have', detail: 'This segment is attractive because it returns, but you told us most customers currently do not.' });
  }
  return out;
}

/* ------------------------------------------------------------------ Compose */
export function scoreSegment(seg, d, a, weights) {
  const scores = {
    economicFit: economicFit(seg, d),
    capacityFit: capacityFit(seg, d),
    goalAlignment: (() => {
      const g = goalAffinity(seg, a.primaryGoal, a.secondaryGoals);
      return { score: g.score, available: g.available, reasons: [{ label: 'Goal alignment', detail: g.reason }] };
    })(),
    acquisitionFeasibility: acquisitionFeasibility(seg, d),
    marketAccess: marketAccess(seg, d, a),
    evidenceFit: evidenceFit(seg, d, a),
    retentionValue: retentionValue(seg, d, a),
    demandIntensity: demandIntensity(seg, d),
  };

  let weighted = 0;
  let totalWeight = 0;
  const contributions = [];
  DIMENSIONS.forEach((k) => {
    const s = scores[k];
    if (!s.available) return;
    const w = weights[k] ?? 1;
    weighted += s.score * w;
    totalWeight += w;
    contributions.push({ dimension: k, score: s.score, weight: Number(w.toFixed(2)), reasons: s.reasons });
  });

  const base = totalWeight > 0 ? weighted / totalWeight : 50;
  const negatives = negativeSignals(seg, d, a);
  const penalty = negatives.reduce((t, n) => t + n.penalty, 0);
  const total = clamp(base - penalty, 5, 98);

  // Ranked by how much each dimension pushed this segment above or below the
  // midpoint, weighted. This is what "why this segment" actually shows.
  const drivers = contributions
    .map((c) => ({ ...c, pull: (c.score - 50) * c.weight }))
    .sort((x, y) => y.pull - x.pull);

  return {
    segmentId: seg.id,
    name: seg.name,
    type: seg.type,
    summary: seg.summary,
    score: total,
    baseScore: Math.round(base),
    contributions,
    drivers,
    negatives,
    unscored: DIMENSIONS.filter((k) => !scores[k].available)
      .map((k) => ({ dimension: k, why: scores[k].reasons[0].detail })),
  };
}

/** Score every candidate segment, best first. */
export function scoreAll(d, a) {
  const audience = audienceOf(a.businessModel, a.secondaryModels);
  const weights = resolveWeights(a.primaryGoal, a.secondaryGoals);
  const ranked = candidateSegments(audience)
    .map((seg) => scoreSegment(seg, d, a, weights))
    .sort((x, y) => y.score - x.score);
  return { ranked, weights, audience };
}

export { segmentById };
