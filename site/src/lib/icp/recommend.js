/**
 * ICP Intelligence: turning a chosen segment into things a business can
 * actually do on Monday morning.
 *
 * Channels, messaging and content are all derived from the segment's own
 * published properties and the constraints the business described. Nothing
 * here is a generic marketing checklist: a channel appears only when the
 * segment's buyer uses it AND the business can afford to run it, and every
 * recommendation carries the reason it was chosen, so a reader can disagree
 * with the reasoning rather than just with the conclusion.
 */

import { CHANNELS } from './segments.js';
import { clean } from './normalize.js';
import { goalById } from './taxonomy.js';

/* Why a given channel suits a given segment. Written as a function of the
   segment so the sentence is about this buyer, not about the channel. */
const CHANNEL_WHY = {
  seo: (s) => `${s.type === 'b2b' ? 'This buyer researches before they contact anyone' : 'This buyer searches before they buy'}, so the answer they find needs to be yours.`,
  local_seo: () => 'The decision is made on a map and a phone, within minutes, by someone already nearby.',
  google_ads: (s) => `Captures the moment this buyer is actively looking, which matters because they decide in ${s.cycleNeed <= 1 ? 'minutes' : 'a short window'}.`,
  meta_ads: () => 'Reaches this buyer before they are looking, which is where demand for this kind of purchase is created rather than captured.',
  linkedin: () => 'This is where the person who signs off actually spends professional attention, and where their peers are visible to them.',
  linkedin_ads: () => 'Lets you reach a narrow job title and company size directly, which is the only efficient way to buy attention from this buyer.',
  outbound: (s) => `With a decision this ${s.decisionComplexity >= 4 ? 'structured' : 'considered'}, waiting to be found is slower than going directly to the named account.`,
  email: () => 'The buying moment is predictable for this segment, so owning the reminder is worth more than winning the click.',
  referral: () => 'This buyer trusts someone like them more than they trust any brand, and a referral arrives pre-qualified.',
  partners: () => 'Someone already sells to this buyer and is trusted by them. Borrowing that relationship is faster than building your own.',
  trade_pubs: () => 'Credibility in this segment is conferred by the industry press it already reads, not by your own website.',
  communities: () => 'This buyer asks peers before vendors, and those conversations happen in places you can be useful in without selling.',
  events: () => 'A high-value, high-trust decision often needs a face, and this segment still buys at trade events.',
  marketplaces: () => 'This buyer starts their search inside the marketplace, not on Google, so being absent there is being invisible.',
  influencers: () => 'Trust for this purchase transfers through people, not brands, and a demonstration beats a description.',
  content: () => 'The gap between what this buyer wants and what they understand is the sale, and content is what closes it.',
  directories: () => 'This buyer shortlists from a list before they ever visit a website.',
  whatsapp: () => 'The enquiry arrives as a message and dies if it is not answered quickly. Being answerable is the channel.',
  pr: () => 'This buyer needs third-party validation before an unknown name is considered safe.',
};

/* Channels a budget level can realistically sustain. Paid and event-led
   channels are withheld from businesses that told us they have no budget,
   because recommending them would be advice that cannot be taken. */
const BUDGET_GATED = {
  google_ads: 1, meta_ads: 1, linkedin_ads: 3, events: 3, pr: 3, influencers: 2, outbound: 1,
};

export function recommendChannels(segment, d, a) {
  const already = new Set(a.acquisitionSource || []);
  const picks = [];
  const withheld = [];

  segment.channels.forEach((id) => {
    const needed = BUDGET_GATED[id] ?? 0;
    if (d.budget !== null && d.budget < needed) {
      withheld.push({
        id, name: CHANNELS[id],
        why: 'Held back because it needs sustained budget you told us you do not have yet. Worth revisiting when that changes.',
      });
      return;
    }
    if (segment.geo === 'local' && ['events', 'trade_pubs'].includes(id)) return;

    const proven = (id === 'seo' && already.has('seo'))
      || (id === 'referral' && already.has('referral'))
      || (id === 'local_seo' && already.has('walkin'))
      || (id === 'marketplaces' && already.has('marketplace'))
      || (id === 'events' && already.has('events'))
      || (id === 'partners' && already.has('partners'))
      || ((id === 'google_ads' || id === 'meta_ads') && already.has('paid'));

    picks.push({
      id,
      name: CHANNELS[id],
      why: (CHANNEL_WHY[id] || (() => 'Matches how this segment finds suppliers.'))(segment),
      status: proven ? 'already-working' : 'new',
      note: proven ? 'You already told us customers come from here, so this is about doing more of something proven rather than starting something new.' : null,
    });
  });

  // Anything already producing customers that this segment does not obviously
  // use is still worth naming, because abandoning a working channel on a
  // model's say-so would be a bad trade.
  const kept = [];
  already.forEach((src) => {
    const map = { seo: 'seo', paid: 'google_ads', social: 'meta_ads', referral: 'referral', outbound: 'outbound', marketplace: 'marketplaces', events: 'events', partners: 'partners', walkin: 'local_seo' };
    const id = map[src];
    if (id && !picks.some((p) => p.id === id)) {
      kept.push({ id, name: CHANNELS[id], why: 'This is not a natural fit for the recommended segment, but it is currently producing customers for you. Keep it running and judge it on its own numbers rather than on this analysis.' });
    }
  });

  return { recommended: picks.slice(0, 6), withheld, keepRunning: kept };
}

/* ------------------------------------------------------------- Messaging */
export function buildMessaging(segment, d, a) {
  const primaryPain = segment.pains[0];
  const product = clean(a.productName) || 'what you sell';
  const problem = clean(a.problemSolved);
  const goal = goalById(a.primaryGoal)?.label || '';

  const outcome = {
    b2b: 'Getting the outcome they are measured on, without creating work for themselves in the process.',
    b2c: 'Getting the thing they want without the risk of choosing wrong.',
  }[segment.type];

  const proof = [];
  if (segment.decisionComplexity >= 4) proof.push('Named references from organisations of comparable size, and documentation a procurement or security reviewer can read without you present.');
  if (segment.type === 'b2b' && segment.decisionComplexity <= 2) proof.push('A specific, dated result from a business that looks like theirs, with the number attached.');
  if (segment.type === 'b2c') proof.push('Reviews in volume and recency, because this buyer checks what other buyers said before they check what you said.');
  if (segment.acquireDifficulty >= 4) proof.push('Evidence you will still be here in two years: longevity, client tenure, financial stability.');
  if (segment.repeatPotential >= 4) proof.push('Proof that customers stay, not just that they arrive.');
  if (d.grossMargin !== null && d.grossMargin >= 55) proof.push('A clear account of what the price buys, since this segment will ask why it costs what it does.');

  return {
    primaryPain,
    secondaryPains: segment.pains.slice(1),
    desiredOutcome: outcome,
    positioning: `For ${segment.name.toLowerCase()}, ${product} is the option that addresses ${problem ? `"${problem}"` : 'their core problem'} without the cost they are actually afraid of: ${primaryPain.toLowerCase()}.`,
    angle: segment.type === 'b2b'
      ? `Lead with the consequence of doing nothing, stated in their terms, then show the shortest credible path out of it. This buyer moves when inaction becomes the riskier option${goal ? `, which is also what makes "${goal.toLowerCase()}" achievable` : ''}.`
      : 'Lead with the outcome they can picture, then remove the risk of being wrong. This buyer does not need to be convinced the category is good, only that choosing you is safe.',
    offerAngle: segment.cycleNeed >= 3
      ? 'Give them a low-commitment first step that produces something useful on its own: an assessment, a pilot, a sample. A long decision needs a short first move.'
      : 'Reduce the cost of saying yes rather than the price: guarantees, easy returns, a first order that does not require a commitment.',
    proofPoints: proof,
    objections: segment.objections,
    cta: segment.cycleNeed >= 3
      ? 'Ask for a conversation, not a purchase. The commitment you request should match the size of the decision they are actually making.'
      : 'Ask for the action directly. A considered call-to-action on a fast decision adds friction without adding trust.',
  };
}

/* -------------------------------------------------------------- Content */
export function buildContent(segment, a) {
  const industry = clean(a.industry === 'Other' ? a.industryOther : a.industry) || 'your industry';
  const product = clean(a.productName) || 'what you sell';
  const who = segment.name.toLowerCase();

  const awareness = segment.pains.slice(0, 2).map((p) => ({
    topic: `The problem behind "${p.split(',')[0].toLowerCase()}"`,
    why: 'Written for the stage before they know a solution exists. This is the pain in their words, which is what they actually search.',
  }));
  awareness.push({
    topic: `What ${who} in ${industry} usually get wrong about ${product.toLowerCase()}`,
    why: 'Mistake-framed content earns attention from people not yet looking to buy, and positions you as the one who noticed.',
  });

  const consideration = [
    { topic: `How to choose a ${product.toLowerCase()} supplier: the questions worth asking`, why: 'This buyer is building a shortlist. Supply the criteria and you shape the comparison.' },
    { topic: `What ${product.toLowerCase()} actually costs, and what changes the price`, why: `${segment.type === 'b2b' ? 'This buyer must justify a number internally' : 'This buyer is deciding whether they can afford it'}, and vagueness about price reads as something to hide.` },
  ];
  if (segment.objections[0]) {
    consideration.push({
      topic: `Answering "${segment.objections[0].says}"`,
      why: `The real concern underneath it is: ${segment.objections[0].means.toLowerCase()}. Addressing that in public removes it from the sales conversation.`,
    });
  }

  const decision = [
    { topic: `A worked example with a ${who.replace(/s$/, '')} like them`, why: 'At this stage they are looking for evidence that someone in their situation already did this successfully.' },
    { topic: segment.decisionComplexity >= 4 ? 'Security, compliance and onboarding, documented' : 'Exactly what happens after they say yes', why: segment.decisionComplexity >= 4 ? 'Enterprise evaluation is a risk review. Publishing the answers shortens it.' : 'Uncertainty about what happens next is a silent reason people do not act.' },
  ];

  const seo = [
    `"${product.toLowerCase()} for ${who}" and the variants your buyers actually type`,
    `Comparison and alternative pages, because this buyer is comparing whether or not you participate`,
    segment.geo === 'local' ? 'Location pages and a fully completed Google Business Profile' : `"${industry} ${product.toLowerCase()}" informational queries that sit above the transactional ones`,
  ];

  const social = segment.type === 'b2b'
    ? ['The working, not the result: show how the outcome was produced', 'Short, specific observations about this industry that only an operator would know', 'Customer situations, anonymised, with what was actually done']
    : ['Demonstration over description: show it being used', 'Real customers over studio shots, because this buyer trusts people who look like them', 'Answer the question they are embarrassed to ask'];

  const magnets = [
    segment.type === 'b2b'
      ? { name: `A ${product.toLowerCase()} specification checklist`, why: 'Useful before they talk to anyone, which is when this buyer wants to feel prepared.' }
      : { name: 'A short fit guide or selector', why: 'Removes the fear of choosing wrong, which is the actual barrier for this buyer.' },
    segment.decisionComplexity >= 3
      ? { name: 'A one-page internal business case they can forward', why: 'This buyer has to convince someone else. Write that document for them.' }
      : { name: 'A first-order offer with a clean exit', why: 'Lowers the cost of being wrong rather than lowering the price.' },
  ];

  return { awareness, consideration, decision, seo, social, magnets };
}

/* ------------------------------------------------------------ Next steps */
export function buildNextSteps(primary, d, a, contradictions) {
  const steps = [];
  if (contradictions.length) {
    steps.push(`Resolve the ${contradictions.length === 1 ? 'inconsistency' : 'inconsistencies'} listed under Confidence first. They affect what any of this is worth.`);
  }
  if (d.headroom === 0) {
    steps.push('Fix capacity before demand. Winning more customers than you can serve damages the retention you will need later.');
  }
  steps.push(`Rewrite your main page for ${primary.name.toLowerCase()} specifically, leading with the pain named in the messaging section rather than with what you do.`);
  steps.push(`Pick the top two channels from the acquisition list and run only those for one quarter. Running six badly is how most small marketing budgets are lost.`);
  if (d.hasCustomers && d.hasCustomers !== 'no') {
    steps.push('Check this against your own records: pull your last twenty customers and see how many match the primary segment. If very few do, the gap between who you win and who you should win is the actual strategy question.');
  }
  steps.push('Re-run this when your pricing, capacity or objective changes. The recommendation is a function of those inputs, so it should move when they do.');
  return steps;
}
