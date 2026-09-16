/**
 * ICP Intelligence: the candidate segment library.
 *
 * Each entry is a buyer archetype, not a persona. The difference matters:
 * a persona is a description, an archetype is a set of properties the engine
 * can reason against. "Enterprise" is not scored because it sounds
 * impressive, it is scored because it carries a deal-size band, a decision
 * complexity, a service load and an acquisition difficulty that either do or
 * do not match the business in front of it.
 *
 * Every numeric property is an ordinal on a defined scale, never a market
 * statistic. We are not claiming that enterprise deals average some amount
 * of money in the real world; we are claiming that within this engine,
 * enterprise sits in deal-size band 4 to 5, and the bands are published
 * below. That distinction is the whole reason the output can be honest.
 *
 * SCALES
 *   valueBand          1 micro, 2 small, 3 mid, 4 large, 5 very large
 *                      (thresholds in normalize.js, stated in the UI)
 *   cycleNeed          0 instant, 1 days, 2 weeks, 3 one to three months,
 *                      4 three to six months, 5 over six months
 *   decisionComplexity 1 one person decides, 5 formal committee and process
 *   serviceLoad        1 almost self-serve, 5 heavily hands-on
 *   repeatPotential    1 genuinely one-off, 5 recurring by nature
 *   expansionPotential 1 spend cannot grow, 5 lands small and grows a lot
 *   acquireDifficulty  1 cheap and easy to reach, 5 slow and expensive
 *
 * Pains, triggers and objections are written as the concern actually felt,
 * not the words usually said. A procurement officer does not say "I am
 * personally exposed if this fails"; they say "we need three quotes".
 */

export const CHANNELS = {
  seo: 'Google organic search',
  local_seo: 'Google Business Profile and local search',
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  linkedin: 'LinkedIn',
  linkedin_ads: 'LinkedIn Ads',
  outbound: 'Outbound sales',
  email: 'Email marketing',
  referral: 'Referrals and word of mouth',
  partners: 'Partnerships and resellers',
  trade_pubs: 'Industry publications',
  communities: 'Industry communities and forums',
  events: 'Events and trade shows',
  marketplaces: 'Marketplaces',
  influencers: 'Creators and influencers',
  content: 'Content marketing',
  directories: 'Directories and listings',
  whatsapp: 'WhatsApp and direct messaging',
  pr: 'Press and industry media',
};

export const segments = [
  /* ---------------------------------------------------------------- B2B */
  {
    id: 'owner_micro', name: 'Owner-led micro businesses', type: 'b2b',
    summary: 'Businesses under roughly ten people where the founder or owner still makes every buying decision personally.',
    valueBand: [1, 2], cycleNeed: 1, decisionComplexity: 1, serviceLoad: 3,
    repeatPotential: 3, expansionPotential: 2, acquireDifficulty: 2,
    geo: 'any',
    buyer: {
      who: 'The owner or founder', seniority: 'Decision-maker and operator in the same person',
      responsibilities: 'Everything. Buying is squeezed between delivering the work and running the business.',
      evaluates: 'Whether it will work quickly, what it costs in total, and whether they will have to manage it.',
      sources: 'Peers in the same trade, WhatsApp groups, Google searches, whoever a friend used.',
    },
    pains: [
      'Money spent on marketing has produced nothing they can point to, so every new proposal is read as another possible waste',
      'They are the bottleneck: nothing gets bought, delivered or fixed without their attention',
      'They cannot tell which of their current activity is working, so they cannot stop any of it',
    ],
    triggers: [
      'A competitor visibly appearing where they are not',
      'A run of quiet weeks with no obvious explanation',
      'An existing supplier letting them down',
      'A specific, dated deadline such as a season, a launch or a renewal',
    ],
    objections: [
      { says: 'It is too expensive', means: 'I cannot see how it returns, and I personally carry the loss if it does not' },
      { says: 'I need to think about it', means: 'I do not have the information to feel safe deciding, and nobody is making me decide today' },
      { says: 'I tried this before and it did not work', means: 'I do not know why it failed, so I cannot tell whether you are different' },
    ],
    channels: ['local_seo', 'seo', 'referral', 'meta_ads', 'whatsapp', 'directories', 'communities'],
  },
  {
    id: 'smb', name: 'Small businesses', type: 'b2b',
    summary: 'Roughly ten to fifty staff, with someone other than the owner running the function that would use what you sell.',
    valueBand: [2, 3], cycleNeed: 2, decisionComplexity: 2, serviceLoad: 3,
    repeatPotential: 3, expansionPotential: 3, acquireDifficulty: 2,
    geo: 'any',
    buyer: {
      who: 'A department manager, with the owner signing off',
      seniority: 'Recommends, rarely decides alone on larger spend',
      responsibilities: 'Owns the outcome your product affects, and is measured on it.',
      evaluates: 'Whether it makes their number, and whether recommending it is safe for them.',
      sources: 'Google, comparison content, peer recommendations, vendor case studies.',
    },
    pains: [
      'They own a target without owning the budget, so they have to sell internally before they can buy',
      'Their current stack or supplier half-works, and the cost of switching feels higher than the cost of tolerating it',
      'They are asked for results in a timeframe shorter than the thing they are being asked to build',
    ],
    triggers: [
      'A new manager arriving in the function and wanting a visible win',
      'A target being missed two periods running',
      'Headcount growth making a manual process finally break',
      'Budget cycle opening',
    ],
    objections: [
      { says: 'I need to check with my boss', means: 'I need something I can forward that makes the case without me in the room' },
      { says: 'Can you do a discount', means: 'I have to justify this against an approved number, not against value' },
      { says: 'We are already using someone', means: 'Switching is work I will personally absorb, and I need to know it is worth that' },
    ],
    channels: ['seo', 'google_ads', 'linkedin', 'content', 'email', 'referral', 'communities'],
  },
  {
    id: 'mid_market', name: 'Mid-market companies', type: 'b2b',
    summary: 'Roughly fifty to two hundred and fifty staff, with real budgets, real process, and more than one person involved in a decision.',
    valueBand: [3, 4], cycleNeed: 3, decisionComplexity: 3, serviceLoad: 3,
    repeatPotential: 4, expansionPotential: 4, acquireDifficulty: 3,
    geo: 'any',
    buyer: {
      who: 'A head of function or director', seniority: 'Owns a budget, needs a business case',
      responsibilities: 'Accountable for a function and the outcomes it produces.',
      evaluates: 'Business case, integration cost, vendor stability, internal disruption.',
      sources: 'Peer networks, LinkedIn, analyst content, existing vendor relationships.',
    },
    pains: [
      'Growth has outrun the systems and processes that got them here, and the seams are showing',
      'Several functions each solved the same problem differently, and nobody owns the resulting mess',
      'They are compared to larger competitors while working with meaningfully smaller resources',
    ],
    triggers: [
      'A funding round, acquisition or ownership change',
      'A new director hired into the function',
      'Entering a new market or launching a new line',
      'An audit, incident or compliance requirement forcing the issue',
    ],
    objections: [
      { says: 'How does this integrate with what we have', means: 'The hidden cost is my team\'s time, not your invoice' },
      { says: 'Who else in our industry uses you', means: 'I need evidence that choosing you is defensible if it goes wrong' },
      { says: 'Send us a proposal', means: 'I am not yet convinced enough to spend political capital on this' },
    ],
    channels: ['linkedin', 'seo', 'content', 'events', 'outbound', 'partners', 'trade_pubs', 'email'],
  },
  {
    id: 'enterprise', name: 'Enterprise companies', type: 'b2b',
    summary: 'Large organisations where the decision involves a committee, a process, and a procurement function that can say no.',
    valueBand: [4, 5], cycleNeed: 4, decisionComplexity: 5, serviceLoad: 4,
    repeatPotential: 5, expansionPotential: 5, acquireDifficulty: 5,
    geo: 'any',
    buyer: {
      who: 'A committee, usually led by a senior director or C-level sponsor',
      seniority: 'Sponsor plus evaluators plus procurement plus legal plus security',
      responsibilities: 'Each participant protects a different interest, and any one of them can stop it.',
      evaluates: 'Risk first, capability second. Security, compliance, references, financial stability, exit terms.',
      sources: 'Analysts, peer executives, existing vendors, formal RFP processes.',
    },
    pains: [
      'Scale makes every change expensive, so inertia is usually the cheapest option and has to be overcome deliberately',
      'No single person can approve, but several people can veto, so momentum dies quietly',
      'The personal downside of a failed vendor choice is far larger than the personal upside of a good one',
    ],
    triggers: [
      'A new executive with a mandate to change something',
      'An incumbent contract approaching renewal',
      'A regulatory change or failed audit',
      'A public incident or competitive threat that makes inaction the risky option',
    ],
    objections: [
      { says: 'We need to go through procurement', means: 'You have to be de-risked as a supplier before your product is even evaluated' },
      { says: 'Are you SOC 2 / ISO certified', means: 'I cannot personally vouch for you, so I need a third party to have done it' },
      { says: 'Can you handle our scale', means: 'I am checking whether you will still exist and still cope in two years' },
    ],
    channels: ['outbound', 'linkedin', 'events', 'partners', 'trade_pubs', 'pr', 'content'],
  },
  {
    id: 'procurement_led', name: 'Procurement-led organisations', type: 'b2b',
    summary: 'Buyers whose process is owned by purchasing: tenders, multiple quotes, vendor registration, and formal comparison.',
    valueBand: [3, 5], cycleNeed: 4, decisionComplexity: 5, serviceLoad: 3,
    repeatPotential: 4, expansionPotential: 3, acquireDifficulty: 4,
    geo: 'any',
    buyer: {
      who: 'A purchasing or procurement officer, with a technical evaluator alongside',
      seniority: 'Owns the process, not the outcome',
      responsibilities: 'Secure compliant supply at a defensible price, without personal exposure.',
      evaluates: 'Specification compliance, price, supplier credentials, delivery reliability, documentation.',
      sources: 'Approved vendor lists, tender portals, trade bodies, incumbent suppliers.',
    },
    pains: [
      'They are measured on cost and compliance, not on the upside your product creates, which is why value arguments land poorly',
      'A supplier failure is traceable directly back to them, so unfamiliar vendors carry personal risk',
      'They must produce a defensible comparison, which means an offer that cannot be compared cannot be bought',
    ],
    triggers: [
      'A scheduled tender or contract renewal date',
      'An incumbent failing on delivery or quality',
      'A specification change forcing requalification',
      'Annual budget release',
    ],
    objections: [
      { says: 'We need three quotes', means: 'I need to show I did not favour anyone, which is about my exposure, not your price' },
      { says: 'You are not on our approved vendor list', means: 'The paperwork to add you is work I will do only if you are clearly worth it' },
      { says: 'Your price is higher than the others', means: 'Nobody has given me a way to justify paying more' },
    ],
    channels: ['directories', 'trade_pubs', 'events', 'outbound', 'seo', 'partners'],
  },
  {
    id: 'distributor', name: 'Distributors, importers and trade buyers', type: 'b2b',
    summary: 'Businesses that buy to resell or to supply onward, judging you on margin, reliability and whether you make their life easier.',
    valueBand: [3, 5], cycleNeed: 3, decisionComplexity: 3, serviceLoad: 2,
    repeatPotential: 5, expansionPotential: 5, acquireDifficulty: 3,
    geo: 'international',
    buyer: {
      who: 'An owner, category buyer or sourcing manager',
      seniority: 'Commercially fluent, decides relatively fast once convinced',
      responsibilities: 'Keep the shelf or pipeline full at a margin that works, without supply surprises.',
      evaluates: 'Landed cost, margin, MOQ, lead time, consistency, exclusivity, and whether it will actually sell through.',
      sources: 'Trade shows, industry directories, existing supplier networks, sourcing platforms.',
    },
    pains: [
      'They carry the inventory risk, so a product that does not move is their loss, not yours',
      'Supply inconsistency damages their own customer relationships, which is worth more to them than a price break',
      'They are approached constantly by suppliers who cannot demonstrate sell-through',
    ],
    triggers: [
      'Losing or dropping an existing supplier',
      'Entering a new category or territory',
      'Seasonal buying windows',
      'A competitor in their market gaining share with a product they cannot source',
    ],
    objections: [
      { says: 'What are your terms and MOQ', means: 'I am calculating how much of my capital you are asking me to tie up' },
      { says: 'Do you supply anyone else in my territory', means: 'I will not build demand for a product my neighbour can undercut me on' },
      { says: 'Can you hold stock', means: 'My real problem is lead time, and I am testing whether you understand that' },
    ],
    channels: ['events', 'directories', 'trade_pubs', 'outbound', 'seo', 'partners', 'linkedin'],
  },
  {
    id: 'funded_startup', name: 'Funded startups and founder-led tech', type: 'b2b',
    summary: 'Venture or angel-backed companies buying quickly against a growth mandate and a runway clock.',
    valueBand: [2, 4], cycleNeed: 2, decisionComplexity: 2, serviceLoad: 3,
    repeatPotential: 4, expansionPotential: 5, acquireDifficulty: 3,
    geo: 'any',
    buyer: {
      who: 'A founder or an early functional lead',
      seniority: 'Decides fast, and can unwind the decision just as fast',
      responsibilities: 'Hit growth milestones before the next raise.',
      evaluates: 'Speed to value, whether it scales, whether it can be ripped out cheaply if wrong.',
      sources: 'Peer founders, investor networks, communities, X and LinkedIn.',
    },
    pains: [
      'They are measured against a milestone and a date, which makes anything slow unattractive regardless of quality',
      'They hire and buy ahead of process, so tools and suppliers are adopted then outgrown quickly',
      'Runway turns every recurring commitment into a risk they will need to justify',
    ],
    triggers: [
      'Closing a funding round',
      'A board meeting with a missed metric',
      'Hiring a first functional lead who wants their own stack',
      'A launch date',
    ],
    objections: [
      { says: 'Can we do a month-to-month', means: 'I cannot commit past my own visibility, which is short' },
      { says: 'How fast can we see results', means: 'Anything slower than my next board meeting is useless to me' },
      { says: 'We might build this ourselves', means: 'I have engineers and I am testing whether you are worth not building' },
    ],
    channels: ['communities', 'linkedin', 'content', 'referral', 'seo', 'events', 'partners'],
  },

  /* ---------------------------------------------------------------- B2C */
  {
    id: 'value_consumer', name: 'Price-led consumers', type: 'b2c',
    summary: 'Shoppers who compare before buying and for whom price is the deciding factor once quality clears a basic bar.',
    valueBand: [1, 2], cycleNeed: 0, decisionComplexity: 1, serviceLoad: 1,
    repeatPotential: 3, expansionPotential: 1, acquireDifficulty: 3,
    geo: 'any',
    buyer: {
      who: 'A comparison shopper', seniority: 'Decides alone, quickly, and reverses easily',
      responsibilities: 'Getting the most for a fixed amount of money.',
      evaluates: 'Price, delivery cost, returns policy, review volume.',
      sources: 'Search, marketplaces, price comparison, review sites, deal communities.',
    },
    pains: [
      'They have been burned by something cheap that failed, so they are simultaneously price-driven and risk-averse',
      'Hidden costs at checkout feel like a bait and switch and reliably end the purchase',
      'Too much choice makes deciding tiring, and tired shoppers default to the cheapest visible option',
    ],
    triggers: ['Sales and seasonal events', 'A discount or first-order offer', 'Their current item wearing out', 'Free shipping thresholds'],
    objections: [
      { says: 'It is cheaper elsewhere', means: 'You have not given me a reason that paying more is not simply losing money' },
      { says: 'What if it does not fit or work', means: 'I am calculating the cost of being wrong, including the hassle of returning it' },
    ],
    channels: ['marketplaces', 'google_ads', 'meta_ads', 'seo', 'email', 'influencers'],
  },
  {
    id: 'premium_consumer', name: 'Quality-led consumers', type: 'b2c',
    summary: 'Buyers with the means and the inclination to pay more for something better made, better serviced or better trusted.',
    valueBand: [2, 4], cycleNeed: 1, decisionComplexity: 1, serviceLoad: 2,
    repeatPotential: 4, expansionPotential: 3, acquireDifficulty: 3,
    geo: 'any',
    buyer: {
      who: 'A considered buyer', seniority: 'Decides alone but researches first',
      responsibilities: 'Buying something they will not regret or have to replace.',
      evaluates: 'Materials, craft, provenance, service, reviews from people like them.',
      sources: 'Editorial content, creators they trust, brand-owned channels, considered search.',
    },
    pains: [
      'Everything claims to be premium, so the word itself has stopped carrying information and they must look for proof',
      'They have paid more before and received no more, which makes them sceptical of price as a quality signal',
      'Buying badly costs them time and identity, not just money',
    ],
    triggers: ['A life event such as a move, a role change or a milestone', 'Replacing something that disappointed them', 'A trusted recommendation', 'Seasonal or gifting moments'],
    objections: [
      { says: 'Why is it this price', means: 'Show me what I am paying for, specifically, or I will assume it is margin' },
      { says: 'I have not heard of you', means: 'Unknown brands carry risk that known brands do not, and I need that closed' },
    ],
    channels: ['seo', 'content', 'influencers', 'meta_ads', 'email', 'pr'],
  },
  {
    id: 'repeat_consumer', name: 'Habitual repeat buyers', type: 'b2c',
    summary: 'Consumers who buy the same category again and again, where the real contest is becoming the default rather than winning one sale.',
    valueBand: [1, 3], cycleNeed: 0, decisionComplexity: 1, serviceLoad: 2,
    repeatPotential: 5, expansionPotential: 4, acquireDifficulty: 3,
    geo: 'any',
    buyer: {
      who: 'A routine buyer', seniority: 'Decides once, then stops deciding',
      responsibilities: 'Keeping something they rely on in stock without thinking about it.',
      evaluates: 'Consistency, convenience, whether reordering is effortless.',
      sources: 'Habit, email and messaging reminders, the brand they last bought from.',
    },
    pains: [
      'Running out at the wrong moment is the actual problem, and it is about disruption rather than cost',
      'Switching means re-learning and re-risking something that currently works, so inertia is strong in both directions',
      'They do not want a relationship with the brand, they want the thing to arrive',
    ],
    triggers: ['Running low, which is predictable and therefore addressable', 'A subscription or reorder prompt', 'Their usual option going out of stock', 'A bundle that reduces reordering effort'],
    objections: [
      { says: 'I do not want a subscription', means: 'I am afraid of being locked in or forgetting to cancel, not of the product' },
      { says: 'I will just reorder when I need it', means: 'Nothing has made reordering easier than remembering, so I default to remembering' },
    ],
    channels: ['email', 'whatsapp', 'meta_ads', 'seo', 'marketplaces', 'influencers'],
  },
  {
    id: 'local_consumer', name: 'Local high-intent consumers', type: 'b2c',
    summary: 'People searching for something nearby, now, with the intention of booking or visiting rather than browsing.',
    valueBand: [1, 3], cycleNeed: 0, decisionComplexity: 1, serviceLoad: 2,
    repeatPotential: 4, expansionPotential: 2, acquireDifficulty: 1,
    geo: 'local',
    buyer: {
      who: 'A nearby customer with an immediate need',
      seniority: 'Decides within minutes, often on a phone',
      responsibilities: 'Solving something today, close to where they are.',
      evaluates: 'Distance, availability, reviews, how easy it is to book or call.',
      sources: 'Google Maps, local search, WhatsApp, recommendations from neighbours.',
    },
    pains: [
      'They need it now, so anything that adds a step, a wait or an unanswered call loses them to whoever answers',
      'They cannot judge quality before arriving, so reviews carry disproportionate weight',
      'Getting it wrong costs them a wasted trip, which they resent more than the money',
    ],
    triggers: ['An immediate need or breakdown', 'A nearby search on a phone', 'A recommendation from someone local', 'Visible presence while passing'],
    objections: [
      { says: 'Are you open now', means: 'I will call the next listing if you do not answer this in one glance' },
      { says: 'How far are you', means: 'Convenience is the product as much as what you sell' },
    ],
    channels: ['local_seo', 'google_ads', 'directories', 'whatsapp', 'meta_ads', 'referral'],
  },
  {
    id: 'gift_occasion', name: 'Occasion and gift buyers', type: 'b2c',
    summary: 'Buyers purchasing for someone else, against a date, where getting it wrong carries social cost.',
    valueBand: [1, 3], cycleNeed: 0, decisionComplexity: 1, serviceLoad: 2,
    repeatPotential: 2, expansionPotential: 2, acquireDifficulty: 2,
    geo: 'any',
    buyer: {
      who: 'Someone buying for another person', seniority: 'Decides alone, under time pressure',
      responsibilities: 'Not disappointing the recipient, and not being late.',
      evaluates: 'Whether it will arrive in time, whether it will look thoughtful, whether it can be returned.',
      sources: 'Search, gift guides, social, marketplaces.',
    },
    pains: [
      'The deadline is immovable, so delivery certainty outranks almost everything including price',
      'They are buying for someone whose taste they are guessing at, which is the real anxiety',
      'They cannot easily judge whether it will feel generous enough',
    ],
    triggers: ['Festivals and gifting seasons', 'Birthdays and anniversaries', 'Weddings and milestones', 'Corporate gifting cycles'],
    objections: [
      { says: 'Will it arrive by the date', means: 'Being late makes me look bad, and that is worse than paying more' },
      { says: 'Can it be returned or exchanged', means: 'I need an escape route because I am guessing at someone else\'s taste' },
    ],
    channels: ['seo', 'google_ads', 'meta_ads', 'marketplaces', 'influencers', 'email'],
  },
  {
    id: 'prosumer', name: 'Professionals buying for their own work', type: 'b2c',
    summary: 'Individuals spending their own money on something they use to earn, which makes them price-aware but capability-driven.',
    valueBand: [2, 3], cycleNeed: 1, decisionComplexity: 1, serviceLoad: 2,
    repeatPotential: 4, expansionPotential: 4, acquireDifficulty: 2,
    geo: 'any',
    buyer: {
      who: 'A freelancer, practitioner or small operator',
      seniority: 'Decides alone and fast, with their own money',
      responsibilities: 'Doing their work better, faster or more profitably.',
      evaluates: 'Whether it pays for itself, whether peers use it, how long it takes to learn.',
      sources: 'Peer communities, YouTube, creators in their craft, search.',
    },
    pains: [
      'Every purchase competes directly with their own income, so the return has to be legible within weeks',
      'Time spent learning a tool is time not spent earning, which makes onboarding effort a real cost',
      'They are sold to constantly by brands that do not understand their actual workflow',
    ],
    triggers: ['Taking on bigger or different work', 'An existing tool failing at a critical moment', 'A peer demonstrating a better way', 'A tax or financial year boundary'],
    objections: [
      { says: 'I can do this manually for free', means: 'My time feels free to me even though it is not, so show me the arithmetic' },
      { says: 'Is there a free version', means: 'I want to prove it works on my actual work before I commit money' },
    ],
    channels: ['communities', 'seo', 'content', 'influencers', 'email', 'referral'],
  },
];

export const segmentById = (id) => segments.find((s) => s.id === id) || null;

/* Which of the archetypes are even candidates for this business. A B2C-only
   business is never shown an enterprise segment, because scoring a segment
   the business structurally cannot sell to produces a confident number about
   an impossible outcome. */
export function candidateSegments(audience) {
  if (audience === 'b2b') return segments.filter((s) => s.type === 'b2b');
  if (audience === 'b2c') return segments.filter((s) => s.type === 'b2c');
  return segments.slice();
}

/* Maps the questionnaire's optional "who do you think it is" answer onto a
   segment id, so the challenge engine can compare a belief to a score. */
export const STATED_TARGET_MAP = {
  micro: 'owner_micro', smb: 'smb', mid: 'mid_market', enterprise: 'enterprise',
  procurement: 'procurement_led', distributor: 'distributor', startup: 'funded_startup',
  value_consumer: 'value_consumer', premium_consumer: 'premium_consumer',
  repeat_consumer: 'repeat_consumer', local_consumer: 'local_consumer',
};
