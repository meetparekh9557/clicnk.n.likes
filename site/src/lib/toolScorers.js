// Per-channel tool scorers, ported VERBATIM from v1's TOOL_LOGIC so the
// numbers and copy are identical. Each takes the collected inputs (with
// `_page` set to a live fetchPageFacts result when a URL was given) and
// returns { score, indexLabel, liveNote, interpretation, bullets, gaps,
// factors, nextSteps, howToRead, pivotTitle, pivotText, statusLine }.
// The v1 `seed` argument was never actually used, so it is dropped.
import { fact, escapeHtml } from './engine';

export const toolScorers = {
  // 1. Organic Authority Index
  seo(inp) {
    const page = inp._page && inp._page.available ? inp._page : null;
    const hasPillars = !!inp.seo_pillar;
    const hasLinking = !!inp.seo_linking;
    const stuckPage23 = !!inp.seo_page23;
    const monthly = !!inp.seo_monthly;
    let score = 100;
    const gaps = [];
    const factors = [];
    const nextSteps = [];

    if (!hasPillars) { score -= 30; gaps.push('No dedicated pillar-and-cluster page structure'); }
    factors.push(fact('Pillar-and-cluster architecture', hasPillars ? 'You report dedicated pillar pages per core topic' : 'No pillar-and-cluster structure', 'self', hasPillars ? 'no deduction' : '−30 pts'));
    if (!hasLinking) { score -= 12; gaps.push('Blog lacks multi-layered internal linking'); }
    factors.push(fact('Internal linking depth', hasLinking ? 'You report multi-layered internal linking' : 'Internal linking reported as thin', 'self', hasLinking ? 'no deduction' : '−12 pts'));
    if (stuckPage23) { score -= 20; gaps.push('Target keywords stuck on page 2/3'); }
    factors.push(fact('Keyword position', stuckPage23 ? 'Target keywords reported stuck on page 2/3' : 'Not reported as stuck on page 2/3', 'self', stuckPage23 ? '−20 pts' : 'no deduction'));
    if (!monthly) { score -= 8; gaps.push('No regular publishing cadence (less than monthly)'); }
    factors.push(fact('Publishing cadence', monthly ? 'You publish new content at least monthly' : 'Publishing less than monthly', 'self', monthly ? 'no deduction' : '−8 pts'));

    if (page) {
      if (page.noindex) { score -= 25; gaps.push('CRITICAL: page carries a noindex robots tag (verified)'); }
      factors.push(fact('Robots / indexability', page.noindex ? 'noindex tag found: this page is telling Google NOT to index it' : 'Page is indexable (no noindex tag)', 'verified', page.noindex ? '−25 pts' : 'no deduction'));
      const tl = page.titleLength || 0;
      const titleBad = tl === 0 || tl < 15 || tl > 65;
      if (titleBad) { score -= 5; gaps.push(tl === 0 ? 'Missing <title> tag (verified)' : `Title tag ${tl < 15 ? 'too short' : 'too long'} at ${tl} characters (verified)`); }
      factors.push(fact('Title tag', tl === 0 ? 'Missing entirely' : `"${(page.title || '').slice(0, 70)}" (${tl} chars${titleBad ? ', outside the 15-65 sweet spot' : ''})`, 'verified', titleBad ? '−5 pts' : 'no deduction'));
      const mdMissing = page.metaDescription === null || page.metaDescriptionLength === 0;
      const mdLong = !mdMissing && page.metaDescriptionLength > 160;
      if (mdMissing) { score -= 8; gaps.push('Missing meta description (verified)'); }
      else if (mdLong) { score -= 4; gaps.push(`Meta description over 160 characters (${page.metaDescriptionLength}, verified)`); }
      factors.push(fact('Meta description', mdMissing ? 'Missing: Google is writing your snippet for you' : `${page.metaDescriptionLength} characters${mdLong ? ' (over the ~160 char limit, gets cut off in results)' : ''}`, 'verified', mdMissing ? '−8 pts' : (mdLong ? '−4 pts' : 'no deduction')));
      const h1Bad = page.h1Count !== 1;
      if (h1Bad) { score -= page.h1Count === 0 ? 8 : 4; gaps.push(page.h1Count === 0 ? 'No H1 heading on the page (verified)' : `${page.h1Count} H1 headings, should be exactly one (verified)`); }
      factors.push(fact('H1 heading', page.h1Count === 0 ? 'No H1 found' : `${page.h1Count} H1(s): "${(page.h1Text || '').slice(0, 60)}"`, 'verified', h1Bad ? (page.h1Count === 0 ? '−8 pts' : '−4 pts') : 'no deduction'));
      if (page.headingSkips > 0) { score -= 4; gaps.push(`Heading hierarchy skips levels ${page.headingSkips} time(s) (verified)`); }
      factors.push(fact('Heading hierarchy', page.headingSkips > 0 ? `Skips levels ${page.headingSkips} time(s) (e.g. H1 straight to H3)` : 'Clean H1->H2->H3 order', 'verified', page.headingSkips > 0 ? '−4 pts' : 'no deduction'));
      const fewLinks = page.internalLinks < 10;
      if (fewLinks) { score -= 5; gaps.push(`Only ${page.internalLinks} internal links on the page (verified)`); }
      factors.push(fact('Internal links on this page', `${page.internalLinks} internal / ${page.externalLinks} external`, 'verified', fewLinks ? '−5 pts' : 'no deduction'));
      if (!page.hasCanonical) { score -= 3; gaps.push('No canonical tag (verified)'); }
      factors.push(fact('Canonical tag', page.hasCanonical ? 'Present' : 'Missing: duplicate-URL risk', 'verified', page.hasCanonical ? 'no deduction' : '−3 pts'));
      if (hasPillars && (page.h1Count !== 1 || page.headingSkips > 0)) gaps.push('Pillar structure claimed, but measured heading structure contradicts it on this page');
    }
    score = Math.max(5, Math.min(98, score));
    const status = score < 50 ? 'Stagnant' : score < 75 ? 'Developing' : 'Strong';

    if (!hasPillars) nextSteps.push(`Map your ${inp.seo_industry || 'core'} services into pillar pages (one authoritative page per service) with 4-6 supporting cluster posts each, all interlinked: this is the single biggest structural lever you're missing.`);
    if (page && page.noindex) nextSteps.push('URGENT: remove the noindex robots tag we found on your page: right now you are explicitly telling Google not to show this page at all.');
    if (page && (page.metaDescription === null || page.metaDescriptionLength === 0)) nextSteps.push('Write a meta description (~150 characters, include your main keyword and a reason to click): we verified yours is missing, so Google is improvising your snippet.');
    if (page && page.h1Count !== 1) nextSteps.push(page.h1Count === 0 ? 'Add exactly one H1 heading containing your primary keyword: we verified this page has none.' : `Reduce your ${page.h1Count} H1 headings to exactly one: multiple H1s dilute the page's topical signal.`);
    if (stuckPage23) nextSteps.push('For keywords stuck on page 2/3: strengthen internal links pointing at those pages from your highest-authority pages, and expand the content to fully answer the search intent, that jump is usually links + depth, not new content.');
    if (!hasLinking) nextSteps.push('Add 3-5 contextual internal links from every blog post to your money pages, using descriptive anchor text, not "click here".');
    if (!monthly) nextSteps.push('Commit to at least one substantial piece of content per month: Google measurably deprioritizes sites that go stale.');
    if (nextSteps.length < 3) nextSteps.push('Run this same check on your 3 most important service pages, not just this URL: consistency across money pages is what moves rankings.');

    return {
      score, indexLabel: 'Organic Authority Index',
      liveNote: page ? `Includes on-page facts verified live from ${page.finalUrl}` : null,
      interpretation: `${score}/100 (${status}). ${score >= 75 ? 'Your foundations are solid: the remaining points below are optimization, not rescue.' : score >= 50 ? 'Workable foundations with named, fixable structural gaps: each item below is costing you specific visibility.' : 'Structural problems are actively capping your Google visibility: the factor table below shows exactly where every lost point went.'}`,
      bullets: [
        `Organic Authority Index for "${escapeHtml(inp.seo_industry || 'your industry')}": ${score}/100 (${status})${page ? ': includes facts verified live from your page.' : '.'}`,
        `Biggest factor: ${!hasPillars ? 'missing pillar-and-cluster architecture.' : (page && page.noindex ? 'a noindex tag we found on your page (critical).' : stuckPage23 ? 'keywords stranded on page 2/3.' : 'refinement-level on-page issues.')}`,
        page ? `Live check highlights: title ${page.titleLength} chars, meta description ${page.metaDescription === null ? 'missing' : page.metaDescriptionLength + ' chars'}, ${page.h1Count} H1(s), ${page.internalLinks} internal links.` : `Internal linking depth: ${hasLinking ? 'reasonable, not your bottleneck right now.' : 'thin, quietly capping how much authority flows to your money pages.'}`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `This index starts at 100 and loses points for specific, named gaps${page ? ', including facts we just verified live from your page' : ''}: no pillar-and-cluster structure costs 30, weak internal linking 12, page 2/3 keywords 20, irregular publishing 8${page ? ', and each verified on-page issue (missing meta description, wrong H1 count, noindex) costs its listed amount' : ''}. Every point traces to one answer or one measured fact, nothing is estimated from guesswork.`,
      pivotTitle: 'Custom Structural Recovery Plan',
      pivotText: `An architectural silo cannot be fixed with generic plugins. Book a 15-minute Organic Blueprint Review with our SEO lead to map a custom structural recovery plan for ${inp.seo_industry || 'your industry'}.`,
    };
  },

  // 2. Local Visibility Radius
  localseo(inp) {
    const compReviews = Math.max(0, parseInt(inp.localseo_reviews_competitor, 10) || 0);
    const ownReviews = Math.max(0, parseInt(inp.localseo_reviews_own, 10) || 0);
    const radius = inp.localseo_radius || '5km';
    const napConsistent = !!inp.localseo_nap;
    const weeklyUpdates = !!inp.localseo_weekly;
    const reviewsNeeded = Math.max(0, compReviews - ownReviews);
    let score = 75;
    const gaps = [];
    const factors = [];
    const proximityDecay = (radius === '10km' && !napConsistent);
    if (proximityDecay) { score -= 35; gaps.push('Proximity decay: 10km radius targeted with inconsistent NAP'); }
    factors.push(fact('Proximity decay risk', proximityDecay ? `Targeting ${radius} with inconsistent NAP: Google distrusts inconsistent listings at distance` : 'No proximity-decay combination detected', 'self', proximityDecay ? '−35 pts' : 'no deduction'));
    if (!napConsistent) { score -= 10; gaps.push('NAP not identical across citations'); }
    factors.push(fact('NAP consistency', napConsistent ? 'Name/address/phone reported identical everywhere' : 'NAP reported inconsistent across citations', 'self', napConsistent ? 'no deduction' : '−10 pts'));
    if (!weeklyUpdates) { score -= 15; gaps.push('No weekly Google Business Profile updates'); }
    factors.push(fact('Profile freshness', weeklyUpdates ? 'Weekly GBP updates reported' : 'No weekly GBP updates', 'self', weeklyUpdates ? 'no deduction' : '−15 pts'));
    factors.push(fact('Review gap vs. top competitor', `You: ${ownReviews.toLocaleString('en-IN')} reviews, competitor: ${compReviews.toLocaleString('en-IN')} (gap of ${reviewsNeeded.toLocaleString('en-IN')})`, 'self', reviewsNeeded > 0 ? 'informational' : 'no gap'));
    score = Math.max(8, score);
    const effectiveRadius = proximityDecay ? '<3km' : radius;

    const nextSteps = [];
    if (!napConsistent) nextSteps.push('Fix your NAP first: make your business name, address and phone character-identical on Google Business Profile, your website footer, Justdial, and every directory: this single inconsistency is your biggest penalty.');
    if (reviewsNeeded > 0) nextSteps.push(`Close the ${reviewsNeeded.toLocaleString('en-IN')}-review gap systematically: ask every happy customer at the moment of peak satisfaction with a direct review link: 2-3 per week compounds fast.`);
    if (!weeklyUpdates) nextSteps.push('Post one GBP update per week (an offer, a photo, a tip): Google measurably favors active profiles in the local pack, and most of your competitors are not doing this.');
    nextSteps.push(`Add your primary category keywords into your GBP business description and services list for ${inp.localseo_industry || 'your category'}: it is indexed for local queries.`);
    if (nextSteps.length < 4) nextSteps.push('Reply to every review, positive and negative, within 48 hours: response rate is a trust signal both to Google and to the person reading reviews at 11pm deciding who to call.');

    return {
      score, indexLabel: 'Local Visibility Radius', liveNote: null,
      interpretation: `${score}/100. ${proximityDecay ? 'Your effective visibility radius is collapsing to under 3km while you target ' + radius + ': the factor table shows the exact combination causing it.' : score >= 60 ? 'Your local foundations are reasonable: the review gap and freshness items below are where the local pack is won.' : 'Multiple local ranking signals are working against you: each is individually fixable within weeks.'}`,
      bullets: [
        `Local Visibility Radius for "${escapeHtml(inp.localseo_industry || 'your category')}": restricted to roughly ${effectiveRadius}${proximityDecay ? ', vs. the ' + radius + " you're actually targeting." : '.'}`,
        `Review gap vs. your top local competitor: you need approximately ${reviewsNeeded} more 5-star reviews to close the gap.`,
        `Profile freshness: ${weeklyUpdates ? 'weekly updates are keeping your profile active in local ranking signals.' : 'no weekly updates detected, Google deprioritizes stale profiles in the local pack.'}`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `We start you at 75 and apply real penalties: targeting a 10km radius while your NAP (name/address/phone) is not identical everywhere costs 35 points, since Google actively distrusts inconsistent listings at that distance ("proximity decay"). Inconsistent NAP alone costs 10 more. No weekly profile updates costs 15. The review gap is separate, it is simply the difference between your reviews and your competitor's. All answers here are self-reported: GBP data is not publicly fetchable without Google's paid APIs, and we will not pretend otherwise.`,
      pivotTitle: 'Full Map Pack Audit',
      pivotText: `Overcoming proximity decay requires manual citation building and geo-targeting. Request a Map Pack Audit from our local team for ${inp.localseo_industry || 'your category'}.`,
    };
  },

  // 3. AI Readability Index
  aiseo(inp) {
    const page = inp._page && inp._page.available ? inp._page : null;
    const pasted = (inp.aiseo_content || '').trim();
    const usingLive = !!page;
    const hasH2 = usingLive ? page.headingSequence.indexOf(2) !== -1 : (/<h2[\s>]/i.test(pasted) || /\n#{1,3}\s/.test(pasted));
    const hasList = usingLive ? page.listItems > 0 : (/<li[\s>]|<ul[\s>]|<ol[\s>]/i.test(pasted) || /\n\s*[-•]\s/.test(pasted));
    const textToScan = usingLive ? (page.textSample || '') : pasted;
    const hasFactualAnchor = /(is a|is an|specifically designed for|refers to)/i.test(textToScan);
    const hasDigit = /\d+/.test(textToScan);
    const hasPercent = /%/.test(textToScan);
    const hasFaq = !!inp.aiseo_faq;
    const structureMarkers = [hasH2, hasList].filter(Boolean).length;
    const densityMarkers = [hasFactualAnchor, hasDigit, hasPercent].filter(Boolean).length;
    let score = 15 + structureMarkers * 15 + densityMarkers * 13 + (hasFaq ? 8 : 0);
    const gaps = [];
    const factors = [];
    if (!hasH2 && !hasList) gaps.push('No heading or list structure for AI to parse');
    if (!hasFactualAnchor) gaps.push('No clear entity-definition phrasing ("is a...", "specifically designed for...")');
    if (!hasDigit && !hasPercent) gaps.push('No data density markers (numbers, percentages)');
    if (!hasFaq) gaps.push('No FAQ section answering real customer questions');
    factors.push(fact('H2 heading structure', hasH2 ? 'Present: AI engines can segment your copy into answers' : 'Absent: nothing for an AI engine to segment', 'verified', hasH2 ? '+15 pts' : '0 pts'));
    factors.push(fact('List structure', hasList ? 'Lists found: extractable step/point format' : 'No lists found', 'verified', hasList ? '+15 pts' : '0 pts'));
    factors.push(fact('Entity-definition phrasing', hasFactualAnchor ? 'Clear "is a..."-style definitions found' : 'No definition phrasing an LLM can quote', 'verified', hasFactualAnchor ? '+13 pts' : '0 pts'));
    factors.push(fact('Numeric density', hasDigit ? 'Numbers present: concrete facts to cite' : 'No numbers found', 'verified', hasDigit ? '+13 pts' : '0 pts'));
    factors.push(fact('Percentage/stat markers', hasPercent ? 'Percentages present' : 'No percentages/stats', 'verified', hasPercent ? '+13 pts' : '0 pts'));
    factors.push(fact('FAQ section', hasFaq ? 'You report an FAQ answering real customer questions' : 'No FAQ section', 'self', hasFaq ? '+8 pts' : '0 pts'));
    if (usingLive) {
      const hasFaqSchema = (page.schemaTypes || []).some((t) => /faq/i.test(t));
      const hasAnySchema = !!page.hasSchema;
      if (hasAnySchema) score += 6;
      factors.push(fact('Structured data (schema.org)', hasAnySchema ? `Found: ${(page.schemaTypes || []).slice(0, 4).join(', ')}` : 'No JSON-LD structured data found', 'verified', hasAnySchema ? '+6 pts' : '0 pts'));
      if (!hasAnySchema) gaps.push('No schema.org structured data on the page (verified)');
      if (hasFaqSchema) factors.push(fact('FAQ schema', 'FAQPage schema present: directly feeds AI answer engines', 'verified', 'informational'));
    }
    score = Math.min(95, Math.max(8, score));
    const capability = score < 40 ? 'Low Capability' : score < 70 ? 'Moderate Capability' : 'High Capability';
    const sourceDesc = usingLive ? `your live page (${page.finalUrl})` : 'the copy you pasted';

    const nextSteps = [];
    if (!hasH2) nextSteps.push('Restructure your copy under question-style H2 headings ("How much does X cost?", "What is X?"): AI Overviews lift answers almost verbatim from well-structured H2 sections.');
    if (!hasFactualAnchor) nextSteps.push(`Open key sections with a quotable one-line definition: "${inp.aiseo_industry || 'Your service'} is a ...": LLMs cite sentences that read like facts, not marketing.`);
    if (!hasDigit && !hasPercent) nextSteps.push('Add concrete numbers (prices, timelines, percentages, counts) to your copy: an AI engine will cite "results in 4-6 weeks" but never "fast results".');
    if (!hasFaq) nextSteps.push('Add an FAQ section answering the 5-8 questions customers actually ask you, one clear paragraph each: it is the single most AI-citable format that exists.');
    if (usingLive && !page.hasSchema) nextSteps.push('Add JSON-LD structured data (at minimum Organization + FAQPage): we verified your page has none, and schema is how AI engines confirm who you are.');
    if (!hasList) nextSteps.push('Convert processes and comparisons into bullet or numbered lists: extractable structure beats paragraphs for AI answers.');
    if (nextSteps.length < 3) nextSteps.push('Publish one "definitive answer" page per high-intent question in your category, structured exactly like the checklist above.');

    return {
      score, indexLabel: 'AI Readability Index',
      liveNote: usingLive ? `Structure and factual density scanned live from ${page.finalUrl}` : (pasted ? `Direct scan of the copy you pasted (${pasted.split(/\s+/).length} words)` : null),
      interpretation: `${capability} (${score}/100), from a direct scan of ${sourceDesc}. ${score >= 70 ? 'Your content is already AI-citable: the remaining points are about consistency across your whole site.' : score >= 40 ? 'AI engines can partially parse your content but will struggle to quote it confidently: the factor table shows exactly which signals are missing.' : 'As it stands, AI engines have little they can safely quote from this content: every missing signal below is a concrete, fixable writing pattern.'}`,
      bullets: [
        `AI Readability Index for "${escapeHtml(inp.aiseo_industry || 'your industry')}": ${capability} (${score}/100), scanned from ${usingLive ? 'your live page' : 'your pasted copy'}.`,
        `Structural signals found: ${structureMarkers}/2 (headings, lists): ${structureMarkers === 0 ? 'AI engines have nothing to segment into an answer.' : 'a reasonable starting skeleton.'}`,
        `Factual density found: ${densityMarkers}/3 (entity-definition phrasing, numbers, percentages): ${densityMarkers <= 1 ? 'too thin for an LLM to confidently cite a fact from this copy.' : 'enough for partial extraction.'}`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `We scan ${usingLive ? 'the actual page at the URL you gave us' : 'the exact copy you pasted'} for two things AI engines actually rely on: structure (headings, lists) and factual density (numbers, percentages, clear "is a..." definitions)${usingLive ? ', plus whether the page carries schema.org structured data' : ''}. Each present signal adds its listed points. This is not a guess about your whole site, it is a direct read of the material you gave us.`,
      pivotTitle: 'Full AI Overview Optimization Roadmap',
      pivotText: `LLM SEO requires advanced semantic engineering and schema injection. Submit your content to our specialist team for a complete rewording proposal for ${inp.aiseo_industry || 'your industry'}.`,
    };
  },

  // 4. Reach Efficiency (social)
  social(inp) {
    const platform = inp.social_platform || 'Instagram';
    const followers = Math.max(0, parseInt(inp.social_followers, 10) || 0);
    const freq = Math.max(0, parseInt(inp.social_freq, 10) || 0);
    const engagement = Math.max(0, parseInt(inp.social_engagement, 10) || 0);
    const suppressible = (platform === 'Meta' || platform === 'LinkedIn');
    const suppressed = suppressible && freq < 3;
    const baselineReach = followers * 0.03;
    const deficit = Math.max(0, Math.round(baselineReach - engagement));
    const reachPct = followers > 0 ? (engagement / followers * 100) : 0;
    let score = Math.max(5, Math.min(95, Math.round(reachPct * 20)));
    const gaps = [];
    const factors = [];
    if (suppressed) { score = Math.max(5, score - 25); gaps.push(`Posting under 3x/week on ${platform}, triggering frequency-based suppression`); }
    if (deficit > 0) gaps.push(`Engagement running ${deficit.toLocaleString('en-IN')} below the expected 3% baseline for your follower count`);
    factors.push(fact('Platform', platform, 'self', 'informational'));
    factors.push(fact('Followers', followers.toLocaleString('en-IN'), 'self', 'informational'));
    factors.push(fact('Engagement vs. 3% baseline', `~${engagement.toLocaleString('en-IN')} per post vs. an expected ~${Math.round(baselineReach).toLocaleString('en-IN')} (${reachPct.toFixed(1)}% of followers)`, 'self', deficit > 0 ? `${deficit.toLocaleString('en-IN')} short of baseline` : 'at/above baseline'));
    factors.push(fact('Posting cadence', `${freq}x/week${suppressed ? ' (under the 3x/week suppression threshold on ' + platform + ')' : ''}`, 'self', suppressed ? '−25 pts' : 'no deduction'));
    const status = suppressed && reachPct < 1.5 ? 'Severe Algorithmic Deficit' : (score < 50 ? 'Moderate Algorithmic Deficit' : 'Healthy Reach');

    const nextSteps = [];
    if (suppressed) nextSteps.push(`Get to 3+ posts/week on ${platform} for 4 straight weeks: consistency is the specific lever that lifts frequency-based suppression, and most accounts see reach recover within a month.`);
    if (deficit > 0) nextSteps.push('Audit your last 10 posts: which 2 got the most saves/shares? Make more of exactly that format: the 3% baseline is reached by doubling down on proven formats, not posting more of what already underperforms.');
    if (reachPct < 1) nextSteps.push('Run a follower cleanup mindset check: reach this low often means past follower spikes (giveaways, bought followers) are dragging your ratio: growth from here should prioritize engaged niche followers over raw count.');
    nextSteps.push(`Post native-format content (${platform === 'Instagram' ? 'Reels with on-screen text hooks in the first second' : 'platform-native video and text posts, not cross-posted links'}): algorithms measurably suppress content that pulls users off-platform.`);
    nextSteps.push('Reply to every comment within the first hour of posting: early engagement velocity is the strongest single distribution signal on every major platform.');

    return {
      score, indexLabel: 'Reach Efficiency', liveNote: null,
      interpretation: `${status} (${score}/100). You are reaching about ${reachPct.toFixed(1)}% of your ${followers.toLocaleString('en-IN')} followers per post against a healthy 3% baseline${suppressed ? ', with a frequency-suppression penalty active on ' + platform : ''}. The table shows each signal's exact contribution.`,
      bullets: [
        `Reach Efficiency Status for "${escapeHtml(inp.social_industry || 'your industry')}" on ${platform}: ${status} (${score}/100).`,
        `Algorithmic deficit: your posts are landing roughly ${deficit.toLocaleString('en-IN')} engagements below the expected 3% baseline for ${followers.toLocaleString('en-IN')} followers.`,
        `Posting cadence: ${freq}x/week ${suppressed ? `(under the 3x/week threshold, which triggers a real algorithmic reach penalty on ${platform})` : '(at or above the threshold that avoids frequency-based suppression)'}`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `The expected baseline is 3% of your follower count engaging per post, that is just how organic reach tends to work before any penalties. We compare that expected number to what you actually reported. If you are posting under 3x/week on Meta or LinkedIn specifically, those platforms apply a real frequency-based suppression penalty on top of that gap. All numbers are self-reported: platform APIs do not expose other accounts' analytics, and we will not pretend to scrape what cannot be scraped.`,
      pivotTitle: 'Full Content Studio Package',
      pivotText: `Breaking through algorithmic suppression requires a high-volume, multi-format distribution engine. Ask about our Content Studio Packages for ${inp.social_industry || 'your industry'}.`,
    };
  },

  // 5. Content Opportunity Score
  content(inp) {
    const page = inp._page && inp._page.available ? inp._page : null;
    const freq = inp.content_freq || 'rarely';
    const hasPillars = !!inp.content_pillars;
    const refreshed = !!inp.content_refresh;
    let score = 100;
    const gaps = [];
    const factors = [];
    const freqLabel = { weekly: 'Weekly or more', fewmonth: 'A few times a month', monthly: 'About once a month', rarely: 'Rarely or never' }[freq] || freq;
    const freqPenalty = { weekly: 0, fewmonth: 8, monthly: 20, rarely: 35 }[freq] ?? 35;
    if (freqPenalty) { score -= freqPenalty; if (freqPenalty >= 20) gaps.push(`Publishing cadence too low (${freqLabel.toLowerCase()})`); }
    factors.push(fact('Publishing cadence', freqLabel, 'self', freqPenalty ? `−${freqPenalty} pts` : 'no deduction'));
    if (!hasPillars) { score -= 25; gaps.push('No dedicated page per core service/topic'); }
    factors.push(fact('Topic coverage', hasPillars ? 'Every core service/topic has its own dedicated page' : 'Core services/topics share pages or have none', 'self', hasPillars ? 'no deduction' : '−25 pts'));
    if (!refreshed) { score -= 10; gaps.push('No content refreshed in the last 6 months'); }
    factors.push(fact('Content freshness', refreshed ? 'Old posts refreshed within the last 6 months' : 'No refresh in 6+ months: Google decays stale content', 'self', refreshed ? 'no deduction' : '−10 pts'));

    if (page) {
      const wc = page.wordCount || 0;
      const thinPenalty = wc < 500 ? 10 : (wc < 800 ? 5 : 0);
      if (thinPenalty) { score -= thinPenalty; gaps.push(`Page content thin at ${wc.toLocaleString('en-IN')} words (verified)`); }
      factors.push(fact('Word count of your page', `${wc.toLocaleString('en-IN')} words of visible text`, 'verified', thinPenalty ? `−${thinPenalty} pts` : 'no deduction'));
      const noH2 = page.headingSequence.indexOf(2) === -1;
      if (noH2) { score -= 8; gaps.push('No H2 subheadings structuring the content (verified)'); }
      factors.push(fact('Content structure (H2 sections)', noH2 ? 'No H2 subheadings found: a wall of text to both readers and Google' : 'H2-structured sections found', 'verified', noH2 ? '−8 pts' : 'no deduction'));
      const hasArticleSchema = (page.schemaTypes || []).some((t) => /article|blogposting/i.test(t));
      if (!hasArticleSchema && !page.hasSchema) { score -= 3; gaps.push('No structured data on the content page (verified)'); }
      factors.push(fact('Structured data', page.hasSchema ? `Present: ${(page.schemaTypes || []).slice(0, 3).join(', ')}` : 'None found', 'verified', (!page.hasSchema) ? '−3 pts' : 'no deduction'));
      const h1Bad = page.h1Count !== 1;
      if (h1Bad) { score -= 5; gaps.push(page.h1Count === 0 ? 'No H1 on the page (verified)' : 'Multiple H1s on the page (verified)'); }
      factors.push(fact('H1 heading', page.h1Count === 0 ? 'Missing' : (page.h1Count > 1 ? `${page.h1Count} H1s (should be one)` : 'Exactly one, as it should be'), 'verified', h1Bad ? '−5 pts' : 'no deduction'));
    }
    score = Math.max(5, Math.min(98, score));
    const status = score < 45 ? 'Underpublishing' : score < 75 ? 'Inconsistent' : 'Publishing Well';

    const nextSteps = [];
    if (freqPenalty >= 20) nextSteps.push(`Set a sustainable publishing floor: one genuinely useful piece on "${inp.content_topic || 'your core service'}" every two weeks beats a burst of five posts followed by silence.`);
    if (!hasPillars) nextSteps.push('Create one dedicated, definitive page per core service: right now searches for those topics have no single strong page of yours to land on, so they land on a competitor\'s.');
    if (page && (page.wordCount || 0) < 800) nextSteps.push(`Deepen the page we checked (${(page.wordCount || 0).toLocaleString('en-IN')} words): pages that fully answer intent for "${inp.content_topic || 'your topic'}" in ${inp.content_industry || 'your industry'} typically need 800+ words of genuinely useful content, not padding.`);
    if (page && page.headingSequence.indexOf(2) === -1) nextSteps.push('Break your content into H2-titled sections (one per sub-question): we verified your page has none, and both readers and AI engines skip walls of text.');
    if (!refreshed) nextSteps.push('Refresh your 3 best old posts before writing anything new: update stats, add current-year context, re-submit to Google: refreshed content recovers rankings faster than new content earns them.');
    if (nextSteps.length < 3) nextSteps.push(`Map the 10 questions customers ask before buying "${inp.content_topic || 'your service'}" and publish one definitive answer piece per question.`);

    return {
      score, indexLabel: 'Content Opportunity Score',
      liveNote: page ? `Word count and structure verified live from ${page.finalUrl}` : null,
      interpretation: `${score}/100 (${status}). ${score >= 75 ? 'Your content engine is fundamentally working: the table shows the refinements left.' : score >= 45 ? 'You have a content foundation but it is leaking authority through the named gaps below: each one is costing you specific search visibility.' : 'Your content footprint is thin enough that competitors are winning searches you should own: the factor table shows exactly why, point by point.'}`,
      bullets: [
        `Content Opportunity Score for "${escapeHtml(inp.content_topic || 'your core service')}" in ${escapeHtml(inp.content_industry || 'your industry')}: ${score}/100 (${status})${page ? ': includes facts verified live from your page.' : '.'}`,
        `Biggest gap: ${!hasPillars ? 'no dedicated page per core topic, searches land on generic pages or nowhere.' : freqPenalty >= 20 ? `publishing cadence (${freqLabel.toLowerCase()}), consistency is the compounding lever.` : (page && (page.wordCount || 0) < 800 ? `thin content: your page carries only ${(page.wordCount || 0).toLocaleString('en-IN')} words (verified).` : 'refinement-level: structure and freshness.')}`,
        page ? `Live check: ${(page.wordCount || 0).toLocaleString('en-IN')} words, ${page.h1Count} H1(s), ${page.headingSequence.filter((h) => h === 2).length} H2 sections, schema ${page.hasSchema ? 'present' : 'absent'}.` : `Content freshness: ${refreshed ? 'recently maintained.' : 'no refresh in 6+ months, stale content decays in rankings.'}`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `This score starts at 100 and applies named deductions from your answers: publishing rarely costs 35 (monthly 20, a few times a month 8), no dedicated topic pages costs 25, and no refresh in 6 months costs 10${page ? '. Because you gave a URL, we also verified your actual page: thin word count, missing H2 structure, H1 problems and missing schema each cost their listed points' : ''}. Same inputs always produce the same score: nothing here is randomized.`,
      pivotTitle: 'Full Content Gap Report',
      pivotText: `20 ranked topic ideas, competitor content comparison and a publishing sequence, built for ${inp.content_topic || 'your core service'} in ${inp.content_industry || 'your industry'}.`,
    };
  },

  // 6. Infrastructure Health (webdev; PageSpeed omitted, on-page facts + self-report)
  webdev(inp) {
    const page = inp._page && inp._page.available ? inp._page : null;
    const cls = !!inp.webdev_cls;
    const longForm = !!inp.webdev_longform;
    const slow = !!inp.webdev_slow;
    const leads = Math.max(0, parseInt(inp.webdev_leads, 10) || 0);
    let score = 100;
    const gaps = [];
    const factors = [];
    if (cls) { score -= 30; gaps.push('Layout shifts while loading (CLS symptom, self-reported)'); }
    if (slow) { score -= 25; gaps.push('Takes over 3 seconds to become interactive on mobile (self-reported)'); }
    factors.push(fact('Layout stability (CLS)', cls ? 'Layout shift reported while loading' : 'No layout shift reported', 'self', cls ? '−30 pts' : 'no deduction'));
    factors.push(fact('Mobile load speed', slow ? 'Reported over 3 seconds to interactive' : 'Reported reasonably fast', 'self', slow ? '−25 pts' : 'no deduction'));
    if (longForm) { score -= 20; gaps.push('Lead form has more than 5 fields'); }
    factors.push(fact('Lead form length', longForm ? 'More than 5 fields: measurably suppresses completions' : '5 fields or fewer', 'self', longForm ? '−20 pts' : 'no deduction'));
    if (page) {
      const altBad = page.imgCount > 0 && page.imgMissingAlt > 0;
      if (altBad) gaps.push(`${page.imgMissingAlt} of ${page.imgCount} images missing alt text (verified)`);
      factors.push(fact('Image alt coverage', page.imgCount === 0 ? 'No images on the page' : `${page.imgCount - page.imgMissingAlt}/${page.imgCount} images have alt text`, 'verified', altBad ? 'flagged' : 'no issue'));
      if (!page.hasSchema) gaps.push('No schema.org structured data (verified)');
      factors.push(fact('Structured data (schema.org)', page.hasSchema ? `Present: ${(page.schemaTypes || []).slice(0, 3).join(', ')}` : 'None found', 'verified', page.hasSchema ? 'no issue' : 'flagged'));
      const mdMissing = page.metaDescription === null || page.metaDescriptionLength === 0;
      if (mdMissing) gaps.push('Missing meta description (verified)');
      factors.push(fact('Meta description', mdMissing ? 'Missing' : `Present (${page.metaDescriptionLength} chars)`, 'verified', mdMissing ? 'flagged' : 'no issue'));
      factors.push(fact('Mobile viewport tag', page.hasViewport ? 'Present' : 'Missing: mobile-rendering fail', 'verified', page.hasViewport ? 'no issue' : 'flagged'));
    }
    score = Math.max(8, Math.round(score));
    const dropoff = longForm ? Math.round(leads * 0.26) : 0;
    const status = score < 60 ? 'High Friction' : score < 80 ? 'Moderate Friction' : 'Low Friction';
    const bullets = [
      `Infrastructure Health for "${escapeHtml(inp.webdev_industry || 'your industry')}": ${score}/100 (${status}).`,
      `Projected conversion drop-off from your long lead form: ${longForm ? `roughly ${dropoff.toLocaleString('en-IN')} enquiries/month lost, based on your ${leads.toLocaleString('en-IN')} current monthly leads.` : 'not a live issue: your form is a reasonable length.'}`,
      `Mobile interactivity: ${slow ? 'self-reported as taking over 3 seconds to become interactive, most visitors bounce before that point.' : 'self-reported as reasonably fast on mobile.'}`,
    ];
    if (page && page.imgMissingAlt > 0) bullets.push(`Verified: ${page.imgMissingAlt} of ${page.imgCount} images on your page are missing alt text.`);

    const nextSteps = [];
    if (cls) nextSteps.push('Fix layout shift first: give every image and embed explicit width/height attributes, and preload your web fonts: CLS is both a ranking factor and a conversion killer.');
    if (slow) nextSteps.push('Get mobile load under 3 seconds: compress images to WebP, lazy-load below the fold, and defer non-critical scripts.');
    if (longForm) nextSteps.push(`Cut your lead form to 4 fields or fewer (name, contact, one qualifier): at your volume that is roughly ${dropoff.toLocaleString('en-IN')} recovered enquiries per month.`);
    if (page && !page.hasSchema) nextSteps.push('Add JSON-LD structured data (Organization/LocalBusiness at minimum): we verified your page has none, it costs nothing and feeds both Google rich results and AI answers.');
    if (page && page.imgMissingAlt > 0) nextSteps.push(`Add alt text to the ${page.imgMissingAlt} images missing it: accessibility, image SEO, and a Lighthouse score bump in one pass.`);
    if (nextSteps.length < 3) nextSteps.push('Your fundamentals look healthy: the next win is conversion polish, one clear primary CTA above the fold on every page, and trust signals near the point of decision.');

    return {
      score, indexLabel: 'Infrastructure Health',
      liveNote: page ? `On-page facts verified live from ${page.finalUrl}` : null,
      interpretation: `${score}/100 (${status}). Built from your self-reported answers${page ? ', plus on-page facts verified live from your URL' : ': add a URL next time and we verify the on-page facts directly'}. ${score >= 80 ? 'This site is not the bottleneck: your growth levers are elsewhere.' : score >= 60 ? 'Moderate friction: each flagged item below has a known conversion cost.' : 'High friction: this level of technical drag typically suppresses enquiries by double-digit percentages.'}`,
      bullets,
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `We start at 100 and apply real penalties: visible layout shift while loading costs 30 points, a lead form with more than 5 fields costs 20 (plus the conversion drop-off math), and a slow mobile load costs 25. ${page ? 'The on-page items (alt text, schema, meta description, viewport) WERE verified live from your page.' : 'These are self-reported here because no URL was given: enter one above next time and we verify the on-page facts directly.'}`,
      pivotTitle: 'Full UI/UX Redevelopment Proposal',
      pivotText: `Fixing Core Web Vitals and conversion friction requires specialised front-end engineering. Request a custom UI/UX proposal for ${inp.webdev_industry || 'your industry'}.`,
    };
  },

  // 7. Ad Spend Efficiency (paid)
  paid(inp) {
    const budget = Math.max(0, parseFloat(inp.paid_budget) || 0);
    const homepageRouting = !!inp.paid_homepage;
    const noPixel = !!inp.paid_pixel;
    const noNegKw = !!inp.paid_negkw;
    let leakagePct = 0;
    const gaps = [];
    const factors = [];
    if (homepageRouting) { leakagePct += 35; gaps.push('Ad traffic routed to homepage instead of a dedicated landing page'); }
    factors.push(fact('Landing page routing', homepageRouting ? 'Ads land on your homepage: built to inform, not convert' : 'Ads reported routed to dedicated landing pages', 'self', homepageRouting ? '~35% of spend leaked' : 'no leak'));
    if (noPixel) { leakagePct += 25; gaps.push('Conversion tracking / pixel unverified'); }
    factors.push(fact('Conversion tracking', noPixel ? 'Pixel/tracking unverified: campaigns may optimize toward the wrong signal' : 'Conversion tracking reported verified', 'self', noPixel ? '~25% of spend leaked' : 'no leak'));
    if (noNegKw) { leakagePct += 15; gaps.push('No localized negative keyword list'); }
    factors.push(fact('Negative keywords', noNegKw ? 'No negative keyword list: paying for searches you never wanted' : 'Negative keyword list reported in place', 'self', noNegKw ? '~15% of spend leaked' : 'no leak'));
    leakagePct = Math.min(85, leakagePct);
    const annualLeak = Math.round(budget * (leakagePct / 100) * 12);
    const monthlyLeak = Math.round(budget * (leakagePct / 100));
    const score = Math.max(10, 100 - leakagePct);
    const platforms = ['paid_platform_google', 'paid_platform_meta', 'paid_platform_linkedin']
      .filter((k) => inp[k]).map((k) => ({ paid_platform_google: 'Google Ads', paid_platform_meta: 'Meta Ads', paid_platform_linkedin: 'LinkedIn Ads' }[k]));
    factors.push(fact('Monthly ad budget', `₹${budget.toLocaleString('en-IN')}/month across ${platforms.join(', ') || 'your platforms'}`, 'self', 'informational'));
    factors.push(fact('Estimated combined leak', `~${leakagePct}% = ₹${monthlyLeak.toLocaleString('en-IN')}/month (₹${annualLeak.toLocaleString('en-IN')}/year)`, 'self', leakagePct > 0 ? `−${leakagePct} pts` : 'no leak'));

    const nextSteps = [];
    if (homepageRouting) nextSteps.push(`Build one dedicated landing page per campaign (single offer, single CTA, no navigation menu): at ₹${budget.toLocaleString('en-IN')}/month this one change recovers roughly ₹${Math.round(budget * 0.35).toLocaleString('en-IN')}/month of wasted clicks.`);
    if (noPixel) nextSteps.push('Verify your conversion pixel this week: fire a test conversion and confirm it lands in the platform. Until it does, the algorithm is optimizing blind.');
    if (noNegKw) nextSteps.push('Pull your search terms report, mark every irrelevant query from the last 30 days as a negative keyword, and repeat monthly: 20 minutes of work that permanently stops a recurring leak.');
    if (platforms.length > 1) nextSteps.push(`Compare cost-per-lead across ${platforms.join(' vs ')} monthly and shift budget toward the winner: multi-platform spend without comparison is how budgets quietly bleed.`);
    if (nextSteps.length < 3) nextSteps.push('Your setup basics are in place: the next lever is creative testing, run 2-3 ad variants per campaign and kill the losers every two weeks.');
    nextSteps.push('Pair paid with organic: every rupee of ads works harder when the site it lands on also ranks, loads fast, and looks credible.');

    return {
      score, indexLabel: 'Ad Spend Efficiency', liveNote: null,
      interpretation: `${score}/100 efficiency: roughly ${leakagePct}% of your ₹${budget.toLocaleString('en-IN')}/month spend (₹${monthlyLeak.toLocaleString('en-IN')}/month, ₹${annualLeak.toLocaleString('en-IN')}/year) is leaking to the named setup gaps in the table below. ${leakagePct === 0 ? 'Your fundamentals are in place: the next gains come from creative and bid optimization.' : 'Each leak has a known percentage cost and a concrete fix.'}`,
      bullets: [
        `Estimated Annual Ad Budget Leak for "${escapeHtml(inp.paid_industry || 'your industry')}": ₹${annualLeak.toLocaleString('en-IN')} (roughly ${leakagePct}% of spend across ${platforms.join(', ') || 'your platforms'}).`,
        `Biggest leak source: ${homepageRouting ? 'ad traffic landing on your homepage instead of a dedicated page built to convert.' : (noPixel ? 'unverified conversion tracking, meaning campaigns may be optimizing toward the wrong signal.' : 'relatively contained, the setup basics are in place.')}`,
        `Monthly leak in rupees at your current ₹${budget.toLocaleString('en-IN')}/month budget: roughly ₹${monthlyLeak.toLocaleString('en-IN')}/month.`,
      ],
      gaps, factors, nextSteps: nextSteps.slice(0, 5),
      howToRead: `Each checkbox you ticked maps to a real, named leak: sending traffic straight to your homepage instead of a dedicated landing page wastes roughly 35% of that spend. An unverified pixel wastes another 25%. A missing negative keyword list wastes 15%. These stack, then get multiplied by your actual monthly budget to get the rupee figure. All inputs are self-reported: we cannot see inside your ad account.`,
      pivotTitle: 'Full Ad Account Deep-Dive',
      pivotText: `Stop letting your ad budget bleed out. Request a formal Ad Account Deep-Dive from our performance strategists for ${inp.paid_industry || 'your industry'}.`,
    };
  },
};
