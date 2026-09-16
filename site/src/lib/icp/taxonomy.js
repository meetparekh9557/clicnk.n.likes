/**
 * ICP Intelligence: the vocabularies the rest of the engine reasons over.
 *
 * Nothing here scores anything. These are the closed lists the questionnaire
 * offers and the scoring engine reads traits from, kept in one file so a new
 * business model or industry can be added without touching scoring logic.
 *
 * The important idea is `traits`. A business model is not scored by its name;
 * it is scored by what its name implies about how money arrives (recurring
 * vs one-off), who signs (an individual vs a committee), and what delivery
 * costs. Two models that behave the same economically share traits and
 * therefore share logic, which is why adding "EdTech" later needs a list
 * entry rather than a new branch in the engine.
 */

/* Trait glossary, referenced by models below.
   b2b / b2c        who the buyer is. A model can carry both.
   recurring        revenue renews without a new sale being made
   transactional    many small purchases, decided fast, low ceremony
   highTouch        delivery consumes people's time per customer, so capacity binds
   inventory        physical goods, so MOQ and production capacity bind
   local            served within a travel radius, so geography binds hard
   committee        more than one person signs off
   platform         value depends on both sides of a marketplace           */

export const businessModels = [
  { id: 'b2b', label: 'B2B (sell to businesses)', traits: ['b2b'] },
  { id: 'b2c', label: 'B2C (sell to consumers)', traits: ['b2c'] },
  { id: 'd2c', label: 'D2C (direct to consumer)', traits: ['b2c', 'transactional'] },
  { id: 'saas', label: 'SaaS', traits: ['b2b', 'recurring'] },
  { id: 'ecommerce', label: 'Ecommerce', traits: ['b2c', 'transactional', 'inventory'] },
  { id: 'marketplace', label: 'Marketplace', traits: ['b2b', 'b2c', 'platform'] },
  { id: 'agency', label: 'Agency', traits: ['b2b', 'highTouch', 'recurring'] },
  { id: 'consultancy', label: 'Consultancy', traits: ['b2b', 'highTouch'] },
  { id: 'proservices', label: 'Professional services', traits: ['b2b', 'highTouch'] },
  { id: 'manufacturing', label: 'Manufacturing', traits: ['b2b', 'inventory', 'committee'] },
  { id: 'distributor', label: 'Distributor / wholesale', traits: ['b2b', 'inventory'] },
  { id: 'retail', label: 'Retail', traits: ['b2c', 'transactional', 'inventory', 'local'] },
  { id: 'education', label: 'Education', traits: ['b2c', 'highTouch'] },
  { id: 'edtech', label: 'EdTech', traits: ['b2c', 'b2b', 'recurring'] },
  { id: 'healthcare', label: 'Healthcare', traits: ['b2c', 'highTouch', 'local'] },
  { id: 'realestate', label: 'Real estate', traits: ['b2c', 'b2b', 'highTouch', 'local'] },
  { id: 'finserv', label: 'Financial services', traits: ['b2b', 'b2c', 'highTouch', 'committee'] },
  { id: 'hospitality', label: 'Hospitality', traits: ['b2c', 'local', 'transactional'] },
  { id: 'travel', label: 'Travel', traits: ['b2c', 'transactional'] },
  { id: 'food', label: 'Food & beverage', traits: ['b2c', 'transactional', 'inventory', 'local'] },
  { id: 'construction', label: 'Construction', traits: ['b2b', 'highTouch', 'committee', 'local'] },
  { id: 'interiors', label: 'Home & interiors', traits: ['b2c', 'b2b', 'highTouch', 'local'] },
  { id: 'logistics', label: 'Logistics', traits: ['b2b', 'recurring'] },
  { id: 'subscription', label: 'Subscription', traits: ['b2c', 'recurring'] },
  { id: 'franchise', label: 'Franchise', traits: ['b2b', 'highTouch'] },
  { id: 'productized', label: 'Productized / information service', traits: ['b2b', 'b2c', 'recurring'] },
  { id: 'app', label: 'Mobile / app business', traits: ['b2c', 'recurring', 'transactional'] },
  { id: 'local', label: 'Local business', traits: ['b2c', 'local', 'transactional'] },
  { id: 'other', label: 'Other', traits: [] },
];

export const industries = [
  'Technology', 'SaaS', 'Ecommerce', 'Fashion', 'Beauty', 'Skincare', 'Healthcare',
  'Education', 'EdTech', 'Finance', 'Real estate', 'Manufacturing', 'Automotive',
  'Legal', 'Marketing', 'Professional services', 'Hospitality', 'Travel', 'Food',
  'Construction', 'Home & interiors', 'Logistics', 'B2B services', 'Consumer products',
  'Sports', 'Entertainment', 'Media', 'Software', 'Cybersecurity', 'HR', 'Recruitment',
  'Agriculture', 'Energy', 'Industrial', 'Other',
];

/* Business maturity. `customerEvidenceWeight` is how far the engine is
   allowed to lean on "who already buys from you": a pre-revenue business has
   no such evidence, so the engine must reason from product, price and goal
   instead, and say so rather than quietly inventing a customer base. */
export const stages = [
  { id: 'idea', label: 'Idea stage', customerEvidenceWeight: 0 },
  { id: 'prerevenue', label: 'Pre-revenue', customerEvidenceWeight: 0 },
  { id: 'early', label: 'Early revenue', customerEvidenceWeight: 0.5 },
  { id: 'pmf', label: 'Product-market fit', customerEvidenceWeight: 0.85 },
  { id: 'growth', label: 'Growth', customerEvidenceWeight: 1 },
  { id: 'scale', label: 'Scale', customerEvidenceWeight: 1 },
  { id: 'mature', label: 'Mature business', customerEvidenceWeight: 1 },
];

/* Goals. `weights` are multipliers over the scoring dimensions in
   scoring.js; anything omitted stays at 1. A multiplier below 1 is a
   deliberate de-prioritisation, not a penalty on the segment.

   These are the heart of the tool: the same business with the same numbers
   should get a different answer when the objective changes, and it is these
   numbers that make that true. */
export const goals = [
  {
    id: 'revenue', label: 'Increase revenue',
    weights: { economicFit: 1.6, retentionValue: 1.2, capacityFit: 1.1 },
  },
  {
    id: 'qualified_leads', label: 'Generate more qualified leads',
    weights: { acquisitionFeasibility: 1.5, demandIntensity: 1.3, evidenceFit: 1.2 },
  },
  {
    id: 'sales', label: 'Increase sales',
    weights: { demandIntensity: 1.4, acquisitionFeasibility: 1.3, capacityFit: 1.1 },
  },
  {
    id: 'ecom_purchases', label: 'Increase ecommerce purchases',
    weights: { demandIntensity: 1.5, acquisitionFeasibility: 1.4, retentionValue: 1.1 },
  },
  {
    id: 'aov', label: 'Increase average order value',
    weights: { economicFit: 1.7, retentionValue: 1.2, demandIntensity: 0.9 },
  },
  {
    id: 'ltv', label: 'Increase customer lifetime value',
    weights: { retentionValue: 1.8, economicFit: 1.2, acquisitionFeasibility: 0.9 },
  },
  {
    id: 'reduce_cac', label: 'Reduce customer acquisition cost',
    weights: { acquisitionFeasibility: 1.8, evidenceFit: 1.4, retentionValue: 1.2, economicFit: 0.9 },
  },
  {
    id: 'lead_quality', label: 'Improve lead quality',
    weights: { evidenceFit: 1.6, economicFit: 1.3, capacityFit: 1.2, demandIntensity: 1.1 },
  },
  {
    id: 'new_market', label: 'Enter a new market',
    weights: { marketAccess: 1.9, acquisitionFeasibility: 1.3, evidenceFit: 0.5 },
  },
  {
    id: 'new_country', label: 'Enter a new country',
    weights: { marketAccess: 2.0, acquisitionFeasibility: 1.3, capacityFit: 1.2, evidenceFit: 0.4 },
  },
  {
    id: 'international', label: 'Expand internationally',
    weights: { marketAccess: 2.0, capacityFit: 1.3, economicFit: 1.1, evidenceFit: 0.4 },
  },
  {
    id: 'new_product', label: 'Launch a new product',
    weights: { demandIntensity: 1.5, evidenceFit: 0.6, acquisitionFeasibility: 1.2 },
  },
  {
    id: 'new_product_customers', label: 'Find customers for a new product',
    weights: { demandIntensity: 1.6, acquisitionFeasibility: 1.3, evidenceFit: 0.5 },
  },
  {
    id: 'recurring', label: 'Increase recurring revenue',
    weights: { retentionValue: 1.9, economicFit: 1.2, capacityFit: 1.1 },
  },
  {
    id: 'enterprise', label: 'Acquire enterprise customers',
    weights: { economicFit: 1.6, capacityFit: 1.6, demandIntensity: 1.1, acquisitionFeasibility: 1.1 },
  },
  {
    id: 'smb', label: 'Acquire SMB customers',
    weights: { acquisitionFeasibility: 1.5, capacityFit: 1.2, economicFit: 0.8 },
  },
  {
    id: 'consumers', label: 'Acquire consumers',
    weights: { acquisitionFeasibility: 1.5, demandIntensity: 1.3, economicFit: 0.8 },
  },
  {
    id: 'retention', label: 'Improve retention',
    weights: { retentionValue: 2.0, evidenceFit: 1.3, acquisitionFeasibility: 0.7 },
  },
  {
    id: 'repeat', label: 'Increase repeat purchases',
    weights: { retentionValue: 1.9, demandIntensity: 1.2, evidenceFit: 1.2 },
  },
  {
    id: 'awareness', label: 'Build brand awareness',
    weights: { acquisitionFeasibility: 1.4, demandIntensity: 1.2, economicFit: 0.8 },
  },
  {
    id: 'organic_traffic', label: 'Increase organic traffic',
    weights: { acquisitionFeasibility: 1.6, demandIntensity: 1.3, economicFit: 0.8 },
  },
  {
    id: 'paid_efficiency', label: 'Increase paid acquisition efficiency',
    weights: { acquisitionFeasibility: 1.7, economicFit: 1.3, evidenceFit: 1.2 },
  },
  {
    id: 'conversion', label: 'Improve conversion rate',
    weights: { demandIntensity: 1.5, evidenceFit: 1.3, acquisitionFeasibility: 1.1 },
  },
  {
    id: 'sales_efficiency', label: 'Improve sales efficiency',
    weights: { capacityFit: 1.7, economicFit: 1.3, evidenceFit: 1.2 },
  },
  {
    id: 'pipeline', label: 'Build a predictable pipeline',
    weights: { acquisitionFeasibility: 1.5, capacityFit: 1.3, evidenceFit: 1.3 },
  },
  {
    id: 'market_share', label: 'Increase market share',
    weights: { demandIntensity: 1.4, acquisitionFeasibility: 1.3, marketAccess: 1.2 },
  },
  {
    id: 'validate', label: 'Validate a new market',
    weights: { marketAccess: 1.6, demandIntensity: 1.4, evidenceFit: 0.4, economicFit: 0.8 },
  },
  { id: 'other', label: 'Other', weights: {} },
];

/* Scope: an ICP for a whole company and an ICP for one new product are
   different questions, and the difference changes how much the existing
   customer base is allowed to influence the answer. */
export const scopes = [
  { id: 'company', label: 'The whole company', evidenceMultiplier: 1 },
  { id: 'product', label: 'One existing product', evidenceMultiplier: 0.8 },
  { id: 'new_product', label: 'A new product', evidenceMultiplier: 0.3 },
  { id: 'service', label: 'One specific service', evidenceMultiplier: 0.8 },
  { id: 'market', label: 'A specific market', evidenceMultiplier: 0.5 },
];

export const modelById = (id) => businessModels.find((m) => m.id === id) || null;
export const goalById = (id) => goals.find((g) => g.id === id) || null;
export const stageById = (id) => stages.find((s) => s.id === id) || null;
export const scopeById = (id) => scopes.find((s) => s.id === id) || null;

/** Every trait carried by the primary model plus any secondary models. */
export function traitsFor(primaryId, secondaryIds = []) {
  const ids = [primaryId, ...(secondaryIds || [])].filter(Boolean);
  const set = new Set();
  ids.forEach((id) => (modelById(id)?.traits || []).forEach((t) => set.add(t)));
  return set;
}

/** Does this business sell to businesses, consumers, or genuinely both? */
export function audienceOf(primaryId, secondaryIds = []) {
  const t = traitsFor(primaryId, secondaryIds);
  if (t.has('b2b') && t.has('b2c')) return 'hybrid';
  if (t.has('b2c')) return 'b2c';
  if (t.has('b2b')) return 'b2b';
  return 'unknown';
}
