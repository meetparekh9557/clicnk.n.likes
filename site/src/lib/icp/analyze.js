/**
 * ICP Intelligence: the single public entry point.
 *
 *     analyzeIcp(answers) -> analysisResult
 *
 * Everything the UI knows about the intelligence is this one function and the
 * shape it returns. That is deliberate. It means the scoring can be rewritten,
 * or a future AI layer can be added to enrich or critique the deterministic
 * result, without touching a single component. The seam for that layer is
 * documented at the bottom of this file.
 *
 * This function is pure: same answers in, same result out, no network, no
 * clock, no randomness. That is what makes the test suite meaningful and what
 * lets the whole thing run in the browser at zero cost.
 */

import { deriveProfile } from './normalize.js';
import { scoreAll } from './scoring.js';
import { segmentById } from './segments.js';
import { buildAssumptions, applyAssumptions, findContradictions, assessConfidence, challengeStatedTarget } from './confidence.js';
import { recommendChannels, buildMessaging, buildContent, buildNextSteps } from './recommend.js';
import { goalById, audienceOf } from './taxonomy.js';

const ALIGNMENT = [
  { min: 78, label: 'Strong alignment' },
  { min: 62, label: 'Good alignment' },
  { min: 45, label: 'Moderate alignment' },
  { min: 0, label: 'Limited alignment' },
];
export const alignmentLabel = (score) => ALIGNMENT.find((a) => score >= a.min).label;

/* Human-readable names for the scoring dimensions, used everywhere the
   working is shown. */
export const DIMENSION_LABELS = {
  economicFit: 'Deal-size fit',
  capacityFit: 'Capacity to sell and serve',
  goalAlignment: 'Goal alignment',
  acquisitionFeasibility: 'Acquisition feasibility',
  marketAccess: 'Market and geography',
  evidenceFit: 'Fit with your current customers',
  retentionValue: 'Repeat and lifetime value',
  demandIntensity: 'Buying rhythm',
};

/** Builds the full profile block for one scored segment. */
function expand(scored, d, a) {
  const seg = segmentById(scored.segmentId);
  return {
    ...scored,
    alignment: alignmentLabel(scored.score),
    buyer: seg.buyer,
    pains: seg.pains,
    triggers: seg.triggers,
    objections: seg.objections,
    attributes: {
      dealSizeBand: `Band ${seg.valueBand[0]} to ${seg.valueBand[1]}`,
      decisionComplexity: seg.decisionComplexity,
      serviceLoad: seg.serviceLoad,
      repeatPotential: seg.repeatPotential,
      expansionPotential: seg.expansionPotential,
      acquireDifficulty: seg.acquireDifficulty,
      geography: seg.geo,
    },
    whyThis: scored.drivers.filter((x) => x.pull > 0).slice(0, 4).map((x) => ({
      dimension: DIMENSION_LABELS[x.dimension] || x.dimension,
      score: x.score,
      weight: x.weight,
      reasons: x.reasons,
    })),
    whatWouldChangeThis: buildSensitivity(scored, d, a),
  };
}

/**
 * What would have to be different for this recommendation to change. Derived
 * from the dimensions that are currently carrying the result, so it is real
 * sensitivity rather than a disclaimer.
 */
function buildSensitivity(scored, d, a) {
  const out = [];
  const top = scored.drivers[0];
  const worst = scored.drivers[scored.drivers.length - 1];
  const seg = segmentById(scored.segmentId);

  if (d.valueBand !== null) {
    const [lo, hi] = seg.valueBand;
    if (d.valueBand >= lo && d.valueBand <= hi) {
      out.push(`If your average customer value moved out of band ${lo} to ${hi}, deal-size fit would fall and a different segment would very likely take first place.`);
    } else {
      out.push(`If your average customer value moved into band ${lo} to ${hi}, this segment would become a materially stronger fit than it is now.`);
    }
  } else {
    out.push('Adding your average order or contract value would change this result more than any other single answer, because deal-size fit is currently excluded from the weighting.');
  }

  if (d.salesCapacity !== null && seg.decisionComplexity >= 4 && d.salesCapacity < 2) {
    out.push('Hiring or assigning dedicated sales capacity would remove the largest single deduction against this segment.');
  }
  if (d.headroom === 0) {
    out.push('Freeing up delivery capacity would lift every segment here, this one included.');
  }
  if (top && worst && top.dimension !== worst.dimension) {
    out.push(`This result is currently carried by ${DIMENSION_LABELS[top.dimension]} and held back most by ${DIMENSION_LABELS[worst.dimension]}. Changing your objective would reweight both.`);
  }
  return out;
}

/** Picks a secondary segment that is genuinely a different strategic bet. */
function pickSecondary(ranked, primary) {
  const different = ranked.slice(1).find((r) => {
    const a = segmentById(primary.segmentId);
    const b = segmentById(r.segmentId);
    return b.type !== a.type
      || Math.abs(b.valueBand[0] - a.valueBand[0]) >= 1
      || Math.abs(b.decisionComplexity - a.decisionComplexity) >= 2;
  });
  return different || ranked[1] || null;
}

/** Picks the segment worth growing into rather than the next-best one now. */
function pickExpansion(ranked, chosenIds, a) {
  const pool = ranked.filter((r) => !chosenIds.includes(r.segmentId) && r.score >= 35);
  if (!pool.length) return null;
  const expanding = ['international', 'new_country', 'new_market', 'validate'].includes(a.primaryGoal);
  const scored = pool.map((r) => {
    const seg = segmentById(r.segmentId);
    const travel = expanding ? (seg.geo === 'international' ? 30 : seg.geo === 'local' ? -40 : 0) : 0;
    return { r, rank: seg.expansionPotential * 10 + seg.valueBand[1] * 5 + travel + r.score * 0.3 };
  }).sort((x, y) => y.rank - x.rank);
  return scored[0].r;
}

export function analyzeIcp(rawAnswers) {
  const a = { ...rawAnswers };

  // 1. Derive, then declare and apply the permitted assumptions.
  const derived0 = deriveProfile(a);
  const assumptions = buildAssumptions(derived0, a);
  const d = applyAssumptions(derived0, assumptions);

  // 2. Contradictions are found before scoring so they can be reported even
  //    when the scoring itself completes cleanly.
  const contradictions = findContradictions(d, a);

  // 3. Score every candidate segment.
  const { ranked, weights, audience } = scoreAll(d, a);
  if (!ranked.length) {
    return {
      ok: false,
      reason: 'no_candidates',
      message: 'No candidate segments matched the business model you selected. Choose a primary model that sells to businesses, consumers, or both.',
    };
  }

  const primaryScored = ranked[0];
  const secondaryScored = pickSecondary(ranked, primaryScored);
  const chosen = [primaryScored.segmentId, secondaryScored?.segmentId].filter(Boolean);
  const expansionScored = pickExpansion(ranked, chosen, a);
  const lowFitScored = ranked[ranked.length - 1];

  const primary = expand(primaryScored, d, a);
  const messaging = buildMessaging(segmentById(primary.segmentId), d, a);
  const channels = recommendChannels(segmentById(primary.segmentId), d, a);
  const content = buildContent(segmentById(primary.segmentId), a);
  const confidence = assessConfidence(d, a, assumptions, contradictions);
  const challenge = challengeStatedTarget(ranked, a);

  return {
    ok: true,
    generatedFor: {
      audience,
      goal: goalById(a.primaryGoal)?.label || a.primaryGoalOther || 'Not stated',
      secondaryGoals: (a.secondaryGoals || []).map((g) => goalById(g)?.label).filter(Boolean),
      scope: a.scope,
      industry: a.industry === 'Other' ? a.industryOther : a.industry,
    },
    derived: {
      firstYearValueInr: d.firstYearValueInr,
      valueBand: d.valueBand,
      grossMargin: d.grossMargin,
      purchasesPerYear: d.purchasesPerYear,
      headroom: d.headroom,
    },
    weights,
    primary,
    secondary: secondaryScored && secondaryScored.segmentId !== primary.segmentId ? expand(secondaryScored, d, a) : null,
    expansion: expansionScored ? expand(expansionScored, d, a) : null,
    lowFit: lowFitScored.segmentId !== primary.segmentId ? {
      ...expand(lowFitScored, d, a),
      whyLowFit: [
        ...lowFitScored.negatives.map((n) => ({ label: n.label, detail: n.detail })),
        ...lowFitScored.drivers.filter((x) => x.pull < 0).slice(0, 3).map((x) => ({
          label: DIMENSION_LABELS[x.dimension] || x.dimension,
          detail: x.reasons.map((r) => r.detail).join(' '),
        })),
      ],
    } : null,
    ranked: ranked.map((r) => ({ id: r.segmentId, name: r.name, score: r.score, alignment: alignmentLabel(r.score) })),
    messaging,
    channels,
    content,
    confidence,
    assumptions,
    contradictions,
    challenge,
    nextSteps: buildNextSteps(primary, d, a, contradictions),
    methodology: {
      scoreMeaning: 'Alignment, not probability. The score describes how well a segment matches the business you described. It makes no claim about how likely anyone is to buy.',
      dimensions: Object.entries(DIMENSION_LABELS).map(([k, label]) => ({ key: k, label, weight: Number((weights[k] ?? 1).toFixed(2)) })),
      dataSources: 'Every figure comes from your answers or from arithmetic on them. This version holds no external market data, no benchmarks and no industry averages, and makes no claims that would require them.',
    },
  };
}

/**
 * FUTURE AI LAYER
 *
 * The seam is here and nowhere else. An enrichment layer should take the
 * result of analyzeIcp and return the same shape, adding or refining fields
 * without changing their meaning:
 *
 *     const base = analyzeIcp(answers);
 *     const enriched = await enrich(base, answers);   // optional, may fail
 *
 * Two rules for whatever fills that slot. It must never be required for a
 * result to render, so a failed or absent call leaves the deterministic
 * output intact. And anything it adds must be labelled as model-generated
 * where it appears, so a reader can always tell which parts of the report
 * were computed from their own numbers and which were written by a model.
 */
export function enrich(base) {
  return Promise.resolve(base);
}
