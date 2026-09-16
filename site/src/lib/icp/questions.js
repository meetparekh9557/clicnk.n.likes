/**
 * ICP Intelligence: the adaptive questionnaire, expressed as data.
 *
 * Every field carries an optional `when(a)` predicate over the answers so
 * far. The UI never decides what to ask; it renders whatever survives the
 * predicates for the current step, which keeps the branching logic testable
 * without a browser and stops the same rule being written twice.
 *
 * Two rules run through all of it:
 *
 * 1. Nothing is required unless the engine genuinely cannot reason without
 *    it. A business owner who does not know their churn rate should not be
 *    blocked, and should not be tempted to invent a number to get past a
 *    form. Missing values become explicit assumptions or drop out of the
 *    weighting entirely (see confidence.js), which is the honest handling.
 *
 * 2. Questions are asked because an answer changes the recommendation. A
 *    question whose answer the engine never reads does not belong here, no
 *    matter how natural it feels to ask it.
 */

import { businessModels, industries, stages, goals, scopes } from './taxonomy.js';
import { traitsFor, audienceOf } from './taxonomy.js';

const opt = (v, l) => ({ v, l: l || v });
const has = (a, trait) => traitsFor(a.businessModel, a.secondaryModels).has(trait);
const isB2B = (a) => ['b2b', 'hybrid'].includes(audienceOf(a.businessModel, a.secondaryModels));
const isB2C = (a) => ['b2c', 'hybrid'].includes(audienceOf(a.businessModel, a.secondaryModels));

export const steps = [
  {
    id: 'basics',
    title: 'Business basics',
    blurb: 'How your business is shaped. This decides which questions you get asked next.',
    fields: [
      {
        id: 'businessModel', type: 'select', required: true,
        label: 'Your primary business model',
        options: businessModels.map((m) => opt(m.id, m.label)),
      },
      {
        id: 'businessModelOther', type: 'text', label: 'Describe your model',
        placeholder: 'e.g. licensing IP to manufacturers',
        when: (a) => a.businessModel === 'other',
      },
      {
        id: 'secondaryModels', type: 'multiselect', max: 3,
        label: 'Any secondary models', hint: 'Optional. Pick up to 3 if you genuinely run more than one.',
        options: businessModels.filter((m) => m.id !== 'other').map((m) => opt(m.id, m.label)),
      },
      {
        id: 'industry', type: 'select', required: true, label: 'Your industry',
        options: industries.map((i) => opt(i)),
      },
      {
        id: 'industryOther', type: 'text', label: 'Your industry',
        placeholder: 'Type your industry', when: (a) => a.industry === 'Other',
      },
      {
        id: 'stage', type: 'select', required: true, label: 'Where the business is right now',
        options: stages.map((s) => opt(s.id, s.label)),
      },
      {
        id: 'teamSize', type: 'select', label: 'How many people work in the business',
        options: [opt('solo', 'Just me'), opt('2-9', '2 to 9'), opt('10-49', '10 to 49'),
          opt('50-249', '50 to 249'), opt('250+', '250 or more')],
      },
    ],
  },

  {
    id: 'sell',
    title: 'What you sell',
    blurb: 'The offer itself, and which offer this ICP is for.',
    fields: [
      {
        id: 'scope', type: 'select', required: true,
        label: 'This ICP is for',
        hint: 'A new product and an established one rarely share an ideal customer.',
        options: scopes.map((s) => opt(s.id, s.label)),
      },
      { id: 'productName', type: 'text', label: 'What is it called', placeholder: 'e.g. Retainer SEO programme' },
      {
        id: 'productDescription', type: 'textarea', label: 'What it does, in one or two lines',
        placeholder: 'Describe it the way you would to a customer.',
      },
      {
        id: 'problemSolved', type: 'textarea', label: 'The main problem it solves',
        placeholder: 'What is broken or missing for the customer before they buy?',
      },
      {
        id: 'pricingModel', type: 'select', label: 'How you charge',
        options: [opt('onetime', 'One-time purchase'), opt('subscription', 'Subscription'),
          opt('retainer', 'Monthly retainer'), opt('project', 'Per project'),
          opt('usage', 'Usage based'), opt('mixed', 'A mix')],
      },
      {
        id: 'website', type: 'url', label: 'Website', optional: true,
        placeholder: 'yourwebsite.com (optional)',
        hint: 'Stored with your answers only. Nothing is fetched or scraped in this version.',
      },
    ],
  },

  {
    id: 'economics',
    title: 'Business economics',
    blurb: 'The numbers that decide which customers you can actually afford to win and keep.',
    fields: [
      {
        id: 'currency', type: 'select', label: 'Currency',
        options: [opt('INR', 'INR (₹)'), opt('USD', 'USD ($)'), opt('AED', 'AED'),
          opt('GBP', 'GBP (£)'), opt('EUR', 'EUR (€)')],
      },
      {
        id: 'avgOrderValue', type: 'money', label: 'Average order or contract value',
        hint: 'What a typical customer pays you in one transaction. Leave blank if you are not sure.',
        when: (a) => !has(a, 'recurring') || a.pricingModel === 'onetime' || a.pricingModel === 'project',
      },
      {
        id: 'monthlyValue', type: 'money', label: 'Typical monthly value per customer',
        hint: 'Retainer, subscription or average monthly spend.',
        when: (a) => has(a, 'recurring') || ['subscription', 'retainer', 'usage'].includes(a.pricingModel),
      },
      {
        id: 'contractMonths', type: 'number', label: 'Typical commitment, in months',
        when: (a) => has(a, 'recurring') || ['subscription', 'retainer'].includes(a.pricingModel),
      },
      {
        id: 'grossMargin', type: 'percent', label: 'Gross margin',
        hint: 'Roughly what is left after the direct cost of delivering. Leave blank if unknown.',
      },
      {
        id: 'repeatFrequency', type: 'select', label: 'How often a customer buys again',
        options: [opt('never', 'Almost never, it is a one-off'), opt('yearly', 'About once a year'),
          opt('quarterly', 'Every few months'), opt('monthly', 'Monthly'),
          opt('weekly', 'Weekly or more'), opt('unknown', 'Not sure')],
      },
      {
        id: 'moq', type: 'number', label: 'Minimum order quantity',
        hint: 'Units. Leave blank if you do not enforce one.',
        when: (a) => has(a, 'inventory'),
      },
      {
        id: 'minOrderValue', type: 'money', label: 'Minimum order value you will accept',
        hint: 'Leave blank if you have no floor.',
      },
      {
        id: 'annualRevenue', type: 'select', label: 'Annual revenue band',
        hint: 'Optional. Used only to sense-check capacity against ambition.',
        options: [opt('prerevenue', 'Pre-revenue'), opt('u10l', 'Under 10 lakh / under 12k USD'),
          opt('10l-1cr', '10 lakh to 1 crore / 12k to 120k USD'),
          opt('1-10cr', '1 to 10 crore / 120k to 1.2m USD'),
          opt('10cr+', 'Over 10 crore / over 1.2m USD'), opt('unknown', 'Prefer not to say')],
      },
    ],
  },

  {
    id: 'customers',
    title: 'Current customers',
    blurb: 'Who already buys. Skip anything you do not track; missing answers lower confidence rather than breaking the analysis.',
    skippableWhen: (a) => ['idea', 'prerevenue'].includes(a.stage),
    fields: [
      {
        id: 'hasCustomers', type: 'select', label: 'Do you have paying customers today',
        options: [opt('yes', 'Yes'), opt('few', 'A handful'), opt('no', 'Not yet')],
      },
      {
        id: 'bestCustomerDescription', type: 'textarea', label: 'Describe your best customers',
        placeholder: 'The ones you would happily take ten more of.',
        when: (a) => a.hasCustomers !== 'no',
      },
      {
        id: 'worstCustomerDescription', type: 'textarea', label: 'Describe your worst-fit customers',
        placeholder: 'The ones that cost more than they are worth.',
        when: (a) => a.hasCustomers !== 'no',
      },
      {
        id: 'customerCompanySize', type: 'select', label: 'Typical customer company size',
        when: (a) => isB2B(a) && a.hasCustomers !== 'no',
        options: [opt('micro', 'Owner-led, under 10 staff'), opt('small', '10 to 49 staff'),
          opt('mid', '50 to 249 staff'), opt('large', '250+ staff'),
          opt('mixed', 'Genuinely mixed'), opt('unknown', 'Not sure')],
      },
      {
        id: 'buyerRole', type: 'select', label: 'Who usually signs off',
        when: (a) => isB2B(a),
        options: [opt('owner', 'Owner or founder'), opt('manager', 'Department manager'),
          opt('director', 'Director or head of function'), opt('cxo', 'C-level'),
          opt('procurement', 'Procurement or purchasing'), opt('committee', 'A committee'),
          opt('unknown', 'Not sure')],
      },
      {
        id: 'consumerLifeStage', type: 'select', label: 'Typical customer life stage',
        when: (a) => isB2C(a) && a.hasCustomers !== 'no',
        options: [opt('student', 'Students and early twenties'), opt('young_prof', 'Working professionals'),
          opt('family', 'Families with children'), opt('established', 'Established households'),
          opt('senior', 'Older adults'), opt('mixed', 'Genuinely mixed'), opt('unknown', 'Not sure')],
      },
      {
        id: 'priceSensitivity', type: 'select', label: 'How price-sensitive are they',
        when: (a) => isB2C(a),
        options: [opt('high', 'Very, they compare on price'), opt('medium', 'Somewhat'),
          opt('low', 'Not really, they buy on quality or trust'), opt('unknown', 'Not sure')],
      },
      {
        id: 'topSegmentShare', type: 'percent', label: 'Share of revenue from your biggest customer type',
        hint: 'Leave blank if you do not track it.',
        when: (a) => a.hasCustomers !== 'no',
      },
      {
        id: 'retention', type: 'select', label: 'How well do customers stick',
        when: (a) => a.hasCustomers !== 'no',
        options: [opt('strong', 'Most stay or come back'), opt('mixed', 'About half'),
          opt('weak', 'Most do not return'), opt('unknown', 'Not sure')],
      },
      {
        id: 'acquisitionSource', type: 'multiselect', label: 'Where your current customers came from',
        when: (a) => a.hasCustomers !== 'no',
        options: [opt('referral', 'Referrals and word of mouth'), opt('seo', 'Google / organic search'),
          opt('paid', 'Paid ads'), opt('social', 'Social media'), opt('outbound', 'Outbound / cold outreach'),
          opt('marketplace', 'Marketplaces'), opt('events', 'Events or trade shows'),
          opt('partners', 'Partners or resellers'), opt('walkin', 'Walk-in or local footfall')],
      },
    ],
  },

  {
    id: 'sales',
    title: 'Sales and acquisition',
    blurb: 'How a sale actually happens today, and what you have to make it happen with.',
    fields: [
      {
        id: 'salesCycle', type: 'select', required: true, label: 'How long from first contact to payment',
        options: [opt('instant', 'Immediate, they buy on the spot'), opt('days', 'A few days'),
          opt('weeks', 'A few weeks'), opt('1-3m', 'One to three months'),
          opt('3-6m', 'Three to six months'), opt('6m+', 'Over six months')],
      },
      {
        id: 'salesTeamSize', type: 'select', label: 'People selling, including you',
        options: [opt('0', 'Nobody sells actively'), opt('1', 'Just one'), opt('2-5', 'Two to five'),
          opt('6-20', 'Six to twenty'), opt('20+', 'More than twenty')],
      },
      {
        id: 'marketingTeamSize', type: 'select', label: 'People doing marketing',
        options: [opt('0', 'Nobody'), opt('1', 'One'), opt('2-5', 'Two to five'), opt('6+', 'Six or more')],
      },
      {
        id: 'marketingMaturity', type: 'select', label: 'How developed is your marketing',
        options: [opt('none', 'Barely started'), opt('basic', 'A website and some social'),
          opt('active', 'Running channels consistently'), opt('advanced', 'Measured, optimised, multi-channel')],
      },
      {
        id: 'marketingBudget', type: 'select', required: true, label: 'Monthly marketing budget',
        options: [opt('none', 'Effectively nothing'), opt('under25k', 'Under ₹25,000 / under $300'),
          opt('25k-1l', '₹25,000 to ₹1 lakh / $300 to $1,200'),
          opt('1l-5l', '₹1 to 5 lakh / $1,200 to $6,000'),
          opt('5l+', 'Over ₹5 lakh / over $6,000')],
      },
      {
        id: 'trialOffered', type: 'select', label: 'Do you offer a free trial or freemium tier',
        when: (a) => has(a, 'recurring'),
        options: [opt('yes', 'Yes'), opt('no', 'No'), opt('demo', 'Demo only')],
      },
      {
        id: 'procurementExposure', type: 'select', label: 'How often do you face formal procurement or tenders',
        when: (a) => isB2B(a),
        options: [opt('never', 'Never'), opt('sometimes', 'Sometimes'), opt('often', 'Routinely'),
          opt('unknown', 'Not sure')],
      },
    ],
  },

  {
    id: 'market',
    title: 'Market and geography',
    blurb: 'Where you sell now, and where you want to sell. These are deliberately separate questions.',
    fields: [
      {
        id: 'currentMarket', type: 'select', required: true, label: 'Where you sell today',
        options: [opt('local', 'One city or travel radius'), opt('regional', 'One state or region'),
          opt('national', 'Nationally'), opt('international', 'Several countries')],
      },
      { id: 'currentMarketDetail', type: 'text', label: 'Which city, region or country', placeholder: 'e.g. Ahmedabad, or India' },
      {
        id: 'targetMarket', type: 'select', label: 'Where you want to sell',
        options: [opt('same', 'Same as today'), opt('wider_local', 'More of the same country'),
          opt('national', 'Nationally'), opt('international', 'Internationally')],
      },
      {
        id: 'targetMarketDetail', type: 'text', label: 'Which market specifically',
        placeholder: 'e.g. UAE, or the UK',
        when: (a) => a.targetMarket && a.targetMarket !== 'same',
      },
      {
        id: 'deliversRemotely', type: 'select', label: 'Can you deliver without being physically present',
        options: [opt('yes', 'Yes, fully'), opt('partly', 'Partly'), opt('no', 'No, presence is required')],
      },
    ],
  },

  {
    id: 'capacity',
    title: 'Capacity',
    blurb: 'An attractive customer you cannot serve is not an attractive customer.',
    fields: [
      {
        id: 'additionalCustomers', type: 'number', required: true,
        label: 'How many more customers could you take on right now',
        hint: 'Your honest ceiling before quality slips.',
      },
      {
        id: 'deliveryLoad', type: 'select', label: 'How much of your time does one customer take',
        when: (a) => has(a, 'highTouch'),
        options: [opt('light', 'Very little once set up'), opt('moderate', 'A regular commitment'),
          opt('heavy', 'Significant, hands-on')],
      },
      {
        id: 'productionHeadroom', type: 'select', label: 'Spare production capacity',
        when: (a) => has(a, 'inventory'),
        options: [opt('none', 'Running at capacity'), opt('some', 'Some headroom'),
          opt('plenty', 'Plenty'), opt('unknown', 'Not sure')],
      },
      {
        id: 'timeline', type: 'select', label: 'When do you need results',
        options: [opt('1m', 'Within a month'), opt('3m', 'Within three months'),
          opt('6m', 'Within six months'), opt('12m', 'Within a year'), opt('flexible', 'No fixed deadline')],
      },
    ],
  },

  {
    id: 'goals',
    title: 'Your objective',
    blurb: 'This is the single biggest influence on the result. The same business gets a different answer here.',
    fields: [
      {
        id: 'primaryGoal', type: 'select', required: true, label: 'Your primary goal',
        options: goals.map((g) => opt(g.id, g.label)),
      },
      {
        id: 'primaryGoalOther', type: 'text', label: 'Describe your goal',
        when: (a) => a.primaryGoal === 'other',
      },
      {
        id: 'secondaryGoals', type: 'multiselect', max: 3, label: 'Secondary goals',
        hint: 'Up to 3. These influence the result but never override your primary goal.',
        options: goals.filter((g) => g.id !== 'other').map((g) => opt(g.id, g.label)),
      },
    ],
  },

  {
    id: 'assumption',
    title: 'Your current assumption',
    blurb: 'Tell us who you think you should be targeting. The engine scores your business independently, then compares.',
    fields: [
      {
        id: 'statedTarget', type: 'select', label: 'Who do you currently believe your ideal customer is',
        hint: 'Optional, and it does not influence the scoring. It is only used to check your assumption against your own numbers.',
        options: [opt('', 'No strong view / skip'), opt('micro', 'Owner-led micro businesses'),
          opt('smb', 'Small businesses'), opt('mid', 'Mid-market companies'),
          opt('enterprise', 'Enterprise companies'), opt('procurement', 'Procurement-led organisations'),
          opt('distributor', 'Distributors or importers'), opt('startup', 'Funded startups'),
          opt('value_consumer', 'Price-conscious consumers'), opt('premium_consumer', 'Premium consumers'),
          opt('repeat_consumer', 'Repeat or subscription consumers'),
          opt('local_consumer', 'Local consumers nearby')],
      },
      {
        id: 'constraintNotes', type: 'textarea', label: 'Anything else constraining you',
        placeholder: 'Regulatory limits, a channel you cannot use, a market you cannot serve.',
      },
    ],
  },
];

/** Fields on a step that should actually render, given answers so far. */
export function visibleFields(step, answers) {
  return step.fields.filter((f) => (typeof f.when === 'function' ? f.when(answers) : true));
}

/** Steps that should actually render. A step whose every field is hidden is skipped. */
export function visibleSteps(answers) {
  return steps.filter((s) => {
    if (typeof s.skippableWhen === 'function' && s.skippableWhen(answers)) {
      // Pre-revenue businesses still get asked whether they have customers,
      // because "not yet" is itself a signal the engine reads.
      return true;
    }
    return visibleFields(s, answers).length > 0;
  });
}

/** Required fields on a step that are still empty. Drives Next being disabled. */
export function missingRequired(step, answers) {
  return visibleFields(step, answers)
    .filter((f) => f.required)
    .filter((f) => {
      const v = answers[f.id];
      if (Array.isArray(v)) return v.length === 0;
      return v === undefined || v === null || String(v).trim() === '';
    });
}
