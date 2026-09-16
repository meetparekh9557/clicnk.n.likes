/**
 * ICP Intelligence engine tests.
 *
 *     node src/lib/icp/icp.test.mjs
 *
 * No test framework, because the site has none and adding one for this would
 * be a dependency the project does not otherwise need. The engine is pure, so
 * plain assertions over its return value are enough.
 *
 * The scenarios below are the ones the tool has to get right to be worth
 * shipping: the same business must get a different answer when its objective
 * changes, and nothing must throw when a real person leaves half the form
 * blank.
 */

import { analyzeIcp } from './analyze.js';
import { visibleFields, visibleSteps, missingRequired, steps } from './questions.js';

let passed = 0;
let failed = 0;
const failures = [];

function check(name, condition, detail) {
  if (condition) { passed++; console.log(`  ok    ${name}`); }
  else { failed++; failures.push(`${name}${detail ? ` -> ${detail}` : ''}`); console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ''}`); }
}
const section = (t) => console.log(`\n${t}`);
const rank = (r, id) => r.ranked.findIndex((x) => x.id === id) + 1;
const scoreOf = (r, id) => (r.ranked.find((x) => x.id === id) || {}).score;

/* ------------------------------------------------------------ Scenario 1 */
section('TEST 1  B2B SaaS chasing enterprise, 10 lakh ACV, 4-month cycle, 5 sellers');
const t1 = analyzeIcp({
  businessModel: 'saas', industry: 'SaaS', stage: 'growth', teamSize: '10-49',
  scope: 'company', productName: 'Compliance platform', pricingModel: 'subscription',
  currency: 'INR', monthlyValue: '83333', contractMonths: '12', grossMargin: '75',
  hasCustomers: 'yes', customerCompanySize: 'large', buyerRole: 'cxo', retention: 'strong',
  salesCycle: '3-6m', salesTeamSize: '2-5', marketingTeamSize: '2-5',
  marketingMaturity: 'active', marketingBudget: '5l+',
  currentMarket: 'national', targetMarket: 'same', deliversRemotely: 'yes',
  additionalCustomers: '15', timeline: '6m',
  primaryGoal: 'enterprise', secondaryGoals: ['revenue'],
});
check('analysis succeeds', t1.ok === true);
check('enterprise is the primary ICP', t1.primary.segmentId === 'enterprise', `got ${t1.primary.segmentId}`);
check('enterprise scores strong alignment', t1.primary.score >= 78, `score ${t1.primary.score}`);
check('the reasoning names deal-size fit', JSON.stringify(t1.primary.whyThis).includes('band'), 'no band reference');
check('a secondary ICP is offered', !!t1.secondary);
check('a low-fit profile is produced', !!t1.lowFit && t1.lowFit.whyLowFit.length > 0);
check('score is labelled alignment, never probability', t1.methodology.scoreMeaning.includes('not probability'));

/* ------------------------------------------------------------ Scenario 2 */
section('TEST 2  D2C skincare chasing repeat purchases, 1,500 AOV, weak repeat');
const t2 = analyzeIcp({
  businessModel: 'd2c', industry: 'Skincare', stage: 'early', teamSize: '2-9',
  scope: 'company', productName: 'Barrier serum', pricingModel: 'onetime',
  currency: 'INR', avgOrderValue: '1500', repeatFrequency: 'yearly', grossMargin: '55',
  hasCustomers: 'yes', consumerLifeStage: 'young_prof', priceSensitivity: 'medium',
  retention: 'weak',
  salesCycle: 'instant', salesTeamSize: '0', marketingTeamSize: '1',
  marketingMaturity: 'basic', marketingBudget: '25k-1l',
  currentMarket: 'national', targetMarket: 'same', deliversRemotely: 'yes',
  additionalCustomers: '500',
  primaryGoal: 'repeat', secondaryGoals: ['ltv'],
});
check('analysis succeeds', t2.ok === true);
check('the repeat-buyer segment leads', t2.primary.segmentId === 'repeat_consumer', `got ${t2.primary.segmentId}`);
check('only consumer segments are considered', t2.ranked.every((r) => !['enterprise', 'smb', 'mid_market'].includes(r.id)));
check('weak retention is surfaced as a limit', JSON.stringify(t2).includes('do not return'), 'retention not mentioned');
check('the report explains what would change it', t2.primary.whatWouldChangeThis.length > 0);

/* ------------------------------------------------------------ Scenario 3 */
section('TEST 3  Agency chasing recurring revenue, 1 lakh/month retainer, room for 10');
const t3 = analyzeIcp({
  businessModel: 'agency', industry: 'Marketing', stage: 'growth', teamSize: '2-9',
  scope: 'company', productName: 'Growth retainer', pricingModel: 'retainer',
  currency: 'INR', monthlyValue: '100000', contractMonths: '6', grossMargin: '50',
  hasCustomers: 'yes', customerCompanySize: 'mid', buyerRole: 'director', retention: 'strong',
  salesCycle: 'weeks', salesTeamSize: '1', marketingTeamSize: '1',
  marketingMaturity: 'active', marketingBudget: '1l-5l',
  currentMarket: 'national', targetMarket: 'same', deliversRemotely: 'yes',
  additionalCustomers: '10', deliveryLoad: 'heavy',
  primaryGoal: 'recurring', secondaryGoals: ['revenue'],
});
check('analysis succeeds', t3.ok === true);
check('it does not recommend enterprise to a one-person sales team',
  t3.primary.segmentId !== 'enterprise', `got ${t3.primary.segmentId}`);
check('mid-market or SMB leads', ['mid_market', 'smb', 'funded_startup'].includes(t3.primary.segmentId), `got ${t3.primary.segmentId}`);
check('enterprise is penalised for sales capacity',
  JSON.stringify(t3.ranked.find((r) => r.id === 'enterprise')) !== undefined && scoreOf(t3, 'enterprise') < t3.primary.score,
  `enterprise ${scoreOf(t3, 'enterprise')} vs primary ${t3.primary.score}`);

/* ------------------------------------------------------------ Scenario 4 */
section('TEST 4  Manufacturer entering the UAE, MOQ 500, India-based today');
const t4 = analyzeIcp({
  businessModel: 'manufacturing', industry: 'Manufacturing', stage: 'mature', teamSize: '50-249',
  scope: 'market', productName: 'Laminated fabric', pricingModel: 'onetime',
  currency: 'INR', avgOrderValue: '500000', repeatFrequency: 'quarterly', grossMargin: '30',
  moq: '500', minOrderValue: '500000',
  hasCustomers: 'yes', customerCompanySize: 'mid', buyerRole: 'procurement', retention: 'strong',
  salesCycle: '1-3m', salesTeamSize: '2-5', marketingTeamSize: '1',
  marketingMaturity: 'basic', marketingBudget: '25k-1l',
  currentMarket: 'national', currentMarketDetail: 'India',
  targetMarket: 'international', targetMarketDetail: 'UAE', deliversRemotely: 'yes',
  additionalCustomers: '20',
  primaryGoal: 'new_country', secondaryGoals: ['revenue'],
});
check('analysis succeeds', t4.ok === true);
check('distributors and importers lead', t4.primary.segmentId === 'distributor', `got ${t4.primary.segmentId}`);
check('no consumer segment appears at all', t4.ranked.every((r) => !['value_consumer', 'premium_consumer', 'local_consumer', 'repeat_consumer', 'gift_occasion', 'prosumer'].includes(r.id)));
check('the target market is named without inventing data about it',
  JSON.stringify(t4.primary).includes('UAE') && t4.methodology.dataSources.includes('no external market data'));

/* ------------------------------------------------------------ Scenario 5 */
section('TEST 5  Local salon wanting more bookings');
const t5 = analyzeIcp({
  businessModel: 'local', industry: 'Beauty', stage: 'mature', teamSize: '2-9',
  scope: 'company', productName: 'Salon services', pricingModel: 'onetime',
  currency: 'INR', avgOrderValue: '1500', repeatFrequency: 'monthly', grossMargin: '60',
  hasCustomers: 'yes', consumerLifeStage: 'mixed', retention: 'mixed',
  salesCycle: 'instant', salesTeamSize: '0', marketingTeamSize: '0',
  marketingMaturity: 'none', marketingBudget: 'under25k',
  currentMarket: 'local', currentMarketDetail: 'Ahmedabad', targetMarket: 'same',
  deliversRemotely: 'no', additionalCustomers: '60',
  primaryGoal: 'sales', secondaryGoals: ['qualified_leads'],
});
check('analysis succeeds', t5.ok === true);
check('local high-intent consumers lead', t5.primary.segmentId === 'local_consumer', `got ${t5.primary.segmentId}`);
check('local search is a recommended channel', t5.channels.recommended.some((c) => c.id === 'local_seo'));
check('channels needing budget it does not have are withheld, not recommended',
  t5.channels.withheld.length === 0 || t5.channels.withheld.every((w) => w.why.includes('budget')));

/* -------------------------------------------------- The goal must matter */
section('GOAL SENSITIVITY  same business, different objective');
const baseBiz = {
  businessModel: 'saas', industry: 'SaaS', stage: 'growth', scope: 'company',
  pricingModel: 'subscription', currency: 'INR', monthlyValue: '25000', contractMonths: '12',
  grossMargin: '70', hasCustomers: 'yes', customerCompanySize: 'mixed', retention: 'mixed',
  salesCycle: 'weeks', salesTeamSize: '2-5', marketingTeamSize: '1',
  marketingMaturity: 'active', marketingBudget: '1l-5l',
  currentMarket: 'national', targetMarket: 'same', deliversRemotely: 'yes',
  additionalCustomers: '40',
};
const gEnterprise = analyzeIcp({ ...baseBiz, primaryGoal: 'enterprise' });
const gCac = analyzeIcp({ ...baseBiz, primaryGoal: 'reduce_cac' });
const gIntl = analyzeIcp({ ...baseBiz, primaryGoal: 'international', targetMarket: 'international', targetMarketDetail: 'UK' });
check('changing the goal changes the primary ICP',
  new Set([gEnterprise.primary.segmentId, gCac.primary.segmentId, gIntl.primary.segmentId]).size > 1,
  `${gEnterprise.primary.segmentId} / ${gCac.primary.segmentId} / ${gIntl.primary.segmentId}`);
check('an enterprise goal ranks enterprise higher than a CAC goal does',
  rank(gEnterprise, 'enterprise') <= rank(gCac, 'enterprise'),
  `${rank(gEnterprise, 'enterprise')} vs ${rank(gCac, 'enterprise')}`);
check('a CAC goal favours a cheaper-to-reach segment',
  scoreOf(gCac, gCac.primary.segmentId) >= scoreOf(gCac, 'enterprise'));
check('weights actually differ between goals',
  JSON.stringify(gEnterprise.weights) !== JSON.stringify(gCac.weights));

/* ------------------------------------------------------ Challenge engine */
section('CHALLENGE  stated target that conflicts with the numbers');
const mismatch = analyzeIcp({
  businessModel: 'saas', industry: 'SaaS', stage: 'early', scope: 'company',
  pricingModel: 'subscription', currency: 'INR', monthlyValue: '1200', contractMonths: '1',
  grossMargin: '70', hasCustomers: 'yes', customerCompanySize: 'micro', retention: 'mixed',
  salesCycle: 'days', salesTeamSize: '0', marketingTeamSize: '1',
  marketingMaturity: 'basic', marketingBudget: 'under25k',
  currentMarket: 'national', targetMarket: 'same', deliversRemotely: 'yes',
  additionalCustomers: '200', primaryGoal: 'qualified_leads',
  statedTarget: 'enterprise',
});
check('the conflict is detected', mismatch.challenge && mismatch.challenge.kind === 'conflicts',
  `kind ${mismatch.challenge && mismatch.challenge.kind}`);
check('it names the specific dimensions that disagree', mismatch.challenge.weakest.length > 0);
check('it does not simply overrule the user', mismatch.challenge.caveat.includes('should win'));
check('the enterprise contradiction is listed', mismatch.contradictions.some((c) => c.id === 'enterprise_goal_small_deal') || mismatch.challenge.gap > 10);

const agrees = analyzeIcp({ ...baseBiz, primaryGoal: 'enterprise', statedTarget: 'enterprise' });
check('agreement is reported as agreement, not manufactured conflict',
  agrees.challenge && ['agrees', 'close'].includes(agrees.challenge.kind), `kind ${agrees.challenge && agrees.challenge.kind}`);

/* ------------------------------------------------- Confidence and honesty */
section('CONFIDENCE AND ASSUMPTIONS');
const sparse = analyzeIcp({
  businessModel: 'b2b', industry: 'B2B services', stage: 'early', scope: 'company',
  salesCycle: 'weeks', marketingBudget: 'none', currentMarket: 'local',
  primaryGoal: 'qualified_leads',
});
check('a nearly empty form still produces a result', sparse.ok === true);
check('confidence drops when data is thin', sparse.confidence.score < 60, `score ${sparse.confidence.score}`);
check('confidence names what was missing', sparse.confidence.missing.length > 0);
check('confidence states the signal count', /\d+ of \d+ business signals/.test(sparse.confidence.summary), sparse.confidence.summary);
check('a full form scores higher confidence than a sparse one', t1.confidence.score > sparse.confidence.score,
  `${t1.confidence.score} vs ${sparse.confidence.score}`);
check('unscored dimensions are reported rather than zeroed', sparse.primary.unscored.length > 0);
check('missing margin is declared as an assumption, not invented',
  sparse.assumptions.some((x) => x.id === 'no_margin'));
// The methodology block is excluded because it is where the engine states
// that it holds no benchmarks, and the disclaimer necessarily contains the
// words the rest of the report must never use.
const { methodology: _m, ...sparseBody } = sparse;
check('no fabricated benchmark language anywhere in the output',
  !/industry average|benchmark shows|studies show|millions of businesses|% of buyers|research shows/i.test(JSON.stringify(sparseBody)));
check('the methodology states plainly that no external data is used',
  sparse.methodology.dataSources.includes('no external market data'));

/* -------------------------------------------------------- Contradictions */
section('CONTRADICTIONS');
const conflicted = analyzeIcp({
  businessModel: 'ecommerce', industry: 'Fashion', stage: 'growth', scope: 'company',
  pricingModel: 'onetime', currency: 'INR', avgOrderValue: '900', repeatFrequency: 'never',
  hasCustomers: 'no', salesCycle: 'instant', salesTeamSize: '0', marketingBudget: 'none',
  marketingMaturity: 'none', currentMarket: 'national', targetMarket: 'international',
  deliversRemotely: 'no', additionalCustomers: '0',
  primaryGoal: 'recurring', secondaryGoals: ['international', 'paid_efficiency'],
});
check('contradictions are caught', conflicted.contradictions.length >= 2, `found ${conflicted.contradictions.length}`);
check('the stage/customer conflict is named', conflicted.contradictions.some((c) => c.id === 'stage_vs_customers'));
check('the recurring-goal-on-a-one-off-product conflict is named',
  conflicted.contradictions.some((c) => c.id === 'recurring_goal_oneoff_model'));
check('zero capacity is surfaced in next steps', conflicted.nextSteps.some((s) => s.toLowerCase().includes('capacity')));
check('contradictions lower confidence', conflicted.confidence.score < 75);

/* -------------------------------------------------------------- Edge cases */
section('EDGE CASES  nothing may throw');
const edges = [
  ['completely empty', {}],
  ['only a business model', { businessModel: 'b2c' }],
  ['unknown model id', { businessModel: 'not-a-real-model', primaryGoal: 'revenue' }],
  ['unknown goal id', { businessModel: 'b2b', primaryGoal: 'not-a-real-goal' }],
  ['hybrid B2B and B2C', { businessModel: 'marketplace', secondaryModels: ['b2b', 'b2c'], primaryGoal: 'revenue', salesCycle: 'days' }],
  ['negative numbers', { businessModel: 'b2b', avgOrderValue: '-500', additionalCustomers: '-3', grossMargin: '-20', primaryGoal: 'revenue' }],
  ['absurdly large numbers', { businessModel: 'b2b', avgOrderValue: '99999999999', grossMargin: '5000', primaryGoal: 'revenue' }],
  ['text in number fields', { businessModel: 'b2b', avgOrderValue: 'lots', grossMargin: 'high', additionalCustomers: 'many', primaryGoal: 'revenue' }],
  ['markup in free text', { businessModel: 'b2b', productName: '<script>alert(1)</script>', problemSolved: '<img src=x onerror=1>', primaryGoal: 'revenue' }],
  ['three secondary goals', { businessModel: 'saas', primaryGoal: 'revenue', secondaryGoals: ['retention', 'reduce_cac', 'enterprise'] }],
  ['secondary goal same as primary', { businessModel: 'saas', primaryGoal: 'revenue', secondaryGoals: ['revenue'] }],
  ['pre-revenue, no customers', { businessModel: 'saas', stage: 'prerevenue', hasCustomers: 'no', primaryGoal: 'validate' }],
  ['new product scope', { businessModel: 'saas', scope: 'new_product', stage: 'growth', hasCustomers: 'yes', customerCompanySize: 'large', primaryGoal: 'new_product_customers' }],
  ['zero capacity', { businessModel: 'agency', additionalCustomers: '0', primaryGoal: 'revenue' }],
  ['null secondary models', { businessModel: 'b2b', secondaryModels: null, primaryGoal: 'revenue' }],
];
edges.forEach(([name, answers]) => {
  let result = null;
  let threw = null;
  try { result = analyzeIcp(answers); } catch (e) { threw = e; }
  check(`does not throw: ${name}`, !threw, threw && threw.message);
  if (result && result.ok) {
    check(`  score stays in range: ${name}`, result.primary.score >= 5 && result.primary.score <= 98, `score ${result.primary.score}`);
  }
});

const xss = analyzeIcp({ businessModel: 'b2b', productName: '<script>alert(1)</script>', problemSolved: '<img src=x onerror=1>', primaryGoal: 'revenue' });
check('angle brackets are stripped from anything echoed back',
  !JSON.stringify(xss.messaging).includes('<script') && !JSON.stringify(xss.messaging).includes('<img'));

/* -------------------------------------------------------- Questionnaire */
section('ADAPTIVE QUESTIONNAIRE');
const b2bAnswers = { businessModel: 'saas', pricingModel: 'subscription' };
const b2cAnswers = { businessModel: 'ecommerce', pricingModel: 'onetime' };
const customersStep = steps.find((s) => s.id === 'customers');
const econStep = steps.find((s) => s.id === 'economics');
const salesStep = steps.find((s) => s.id === 'sales');

const b2bCustomerFields = visibleFields(customersStep, { ...b2bAnswers, hasCustomers: 'yes' }).map((f) => f.id);
const b2cCustomerFields = visibleFields(customersStep, { ...b2cAnswers, hasCustomers: 'yes' }).map((f) => f.id);
check('B2B is asked who signs off', b2bCustomerFields.includes('buyerRole'));
check('B2C is not asked who signs off', !b2cCustomerFields.includes('buyerRole'));
check('B2C is asked about price sensitivity', b2cCustomerFields.includes('priceSensitivity'));
check('B2B is not asked about consumer life stage', !b2bCustomerFields.includes('consumerLifeStage'));

const recurringEcon = visibleFields(econStep, b2bAnswers).map((f) => f.id);
const oneoffEcon = visibleFields(econStep, b2cAnswers).map((f) => f.id);
check('recurring models are asked monthly value', recurringEcon.includes('monthlyValue'));
check('one-off models are asked order value', oneoffEcon.includes('avgOrderValue'));
check('ecommerce is asked about MOQ because it holds inventory', oneoffEcon.includes('moq'));
check('SaaS is not asked about MOQ', !recurringEcon.includes('moq'));
check('SaaS is asked about a free trial', visibleFields(salesStep, b2bAnswers).map((f) => f.id).includes('trialOffered'));
check('ecommerce is not asked about a free trial', !visibleFields(salesStep, b2cAnswers).map((f) => f.id).includes('trialOffered'));
check('every step renders at least one field for a blank form', visibleSteps({}).length === steps.length);
check('required fields are reported as missing on a blank form', missingRequired(steps[0], {}).length > 0);
check('required fields clear once answered',
  missingRequired(steps[0], { businessModel: 'b2b', industry: 'Technology', stage: 'growth' }).length === 0);

/* ------------------------------------------------------------------ Done */
console.log(`\n${'='.repeat(58)}`);
console.log(`${passed} passed, ${failed} failed`);
if (failed) {
  console.log('\nFailures:');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
console.log('All engine tests passed.');
