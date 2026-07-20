// Full per-service page content, ported verbatim from v1 (index.html
// service pages). toolKey matches the v1 tool ids so the tools
// migration can embed each service's gated tool + quote calculator
// straight into these pages. Icon names are Lucide file names.

export interface ServiceDetail {
  slug: string;
  toolKey: string;
  title: string;
  eyebrow: string;
  h1: string;
  lead: string;
  cards: { icon: string; title: string; text: string }[];
  tool: { name: string; lead: string };
  quote: { name: string; lead: string };
  crossLink?: { text: string; label: string; href: string };
}

// "Why it matters" band per service. Cited hard numbers appear ONLY
// where they are genuinely defensible (local-seo, website-development);
// every other service uses honest qualitative framing rather than an
// invented statistic. The SEO page reuses the interactive ranking graph.
export interface ServiceProof {
  title: string;
  intro: string;
  showCliff?: boolean;
  stat?: { value: string; label: string; source: string };
  note?: string;
}

export const serviceProof: Record<string, ServiceProof> = {
  seo: {
    title: 'Why does ranking, not just showing up, decide the outcome?',
    intro:
      'Because attention on Google collapses toward the top. The first organic result earns more clicks than the next three positions combined, so the distance between page one and the top of page one is the distance between being found and being chosen. Tap through the positions to see what each rank is actually worth.',
    showCliff: true,
  },
  'local-seo': {
    title: 'Why is the local pack worth winning on its own?',
    intro:
      'Because local intent converts fast, and it converts nearby. When someone searches for a business close to them on a phone, the visit is frequently same-day, which makes your Maps position less a vanity ranking and more next week\'s revenue.',
    stat: {
      value: '76%',
      label: 'of people who search for something nearby on a phone visit a business within a day',
      source: 'Google / Think with Google',
    },
  },
  'ai-seo': {
    title: 'Why does being cited by AI now matter as much as ranking?',
    intro:
      'Because search is splitting into two tracks: the familiar list of blue links, and a short AI answer that names only two or three businesses. There is no page two of an AI answer. Either the model trusts your content enough to quote you, or that buyer never learns you exist.',
    note: 'We structure your content, schema and entity signals so AI engines can extract and cite you, then track where you actually appear across ChatGPT, Gemini and AI Overviews.',
  },
  'social-media-growth': {
    title: 'What actually makes social growth worth paying for?',
    intro:
      'Not the follower count. A following only earns its keep when it produces conversations, DMs and bookings, so we build every calendar and caption around the audience that buys, never the number that merely watches.',
    note: 'Content pillars mapped to education, authority, relatability, engagement and conversion, with an engagement playbook that turns comments and DMs into leads.',
  },
  'content-marketing': {
    title: 'Why does structure decide whether content earns anything?',
    intro:
      'Because both Google and AI models reward content they can extract answers from. A page written to a clear, question-led structure can rank in search and be quoted in an AI answer at the same time, while a wall of adjectives does neither.',
    note: 'Every piece is built to a structure search engines index cleanly and language models can lift and cite verbatim.',
  },
  'website-development': {
    title: 'Why is speed a revenue decision, not a technical one?',
    intro:
      'Because visitors leave before they ever reach your offer. The moment a page slows from one second to three, the chance a visitor abandons it climbs sharply, so every hundred milliseconds you shave back is a booking you would otherwise have lost.',
    stat: {
      value: '+32%',
      label: 'higher chance a visitor bounces when a page slows from one second to three',
      source: 'Google / SOASTA mobile speed study',
    },
  },
  'paid-campaigns': {
    title: 'Where do paid campaigns actually belong?',
    intro:
      'On top of an organic engine that already works, never in place of it. Ads rent attention for exactly as long as you keep paying; SEO and content own it. We run paid to capture the high-intent demand your organic has not reached yet, so spend compounds instead of vanishing the day you stop.',
    note: 'Meta and Google campaigns reported on cost per lead and cost per booking, every week.',
  },
};

export const serviceDetails: ServiceDetail[] = [
  {
    slug: 'seo',
    toolKey: 'seo',
    title: 'SEO (Organic & On-Page)',
    eyebrow: 'SEO (Organic & On-Page)',
    h1: 'Rank on Google search where it actually drives revenue.',
    lead: 'Keyword strategy, on-page optimization, technical fixes and supporting blog content, built around how your category actually gets searched on Google: separate from Google Maps/Local, which we treat as its own discipline.',
    cards: [
      { icon: 'layout-template', title: 'On-page SEO', text: 'Titles, structure and copy built around real search intent.' },
      { icon: 'search', title: 'Keyword strategy', text: 'Tracking and targeting the exact terms your buyers search.' },
      { icon: 'zap', title: 'Technical SEO', text: 'Speed, crawlability and indexing fixed at the root.' },
      { icon: 'newspaper', title: 'SEO-supporting blogs', text: 'Short, keyword-targeted posts written to move specific rankings.' },
    ],
    tool: {
      name: 'Organic Authority Index',
      lead: 'A quick directional read on your site architecture and keyword footing. Full breakdown unlocks after the scan.',
    },
    quote: {
      name: 'Instant SEO quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Looking for Google Maps / Local Pack ranking?',
      label: 'See Local SEO →',
      href: '/services/local-seo/',
    },
  },
  {
    slug: 'local-seo',
    toolKey: 'localseo',
    title: 'Local SEO & Google Business',
    eyebrow: 'Local SEO & Google Business Profile',
    h1: 'Show up first when your city searches for what you sell.',
    lead: 'Google Business Profile optimization, review strategy and local link building: the Google Maps / "local pack" discipline, run separately from organic SEO because it\'s won with a different set of signals.',
    cards: [
      { icon: 'map-pin', title: 'Google Business Profile', text: 'Optimized listing, posts and photos kept current every month.' },
      { icon: 'link-2', title: 'Local link building', text: 'Citations and backlinks from real, relevant local sources.' },
      { icon: 'star', title: 'Review strategy', text: 'Systems to earn and respond to reviews consistently.' },
      { icon: 'trophy', title: 'Maps pack ranking', text: 'Tracked monthly against your named local competitors.' },
    ],
    tool: {
      name: 'Local Visibility Radius Checker',
      lead: 'A quick directional read on how visible your business is on Google Maps right now. Full breakdown unlocks after the scan.',
    },
    quote: {
      name: 'Instant Local SEO quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Also want to rank organically on Google search?',
      label: 'See SEO →',
      href: '/services/seo/',
    },
  },
  {
    slug: 'ai-seo',
    toolKey: 'aiseo',
    title: 'AI SEO & AI Overviews',
    eyebrow: 'AI SEO · AEO · GEO · LLMO',
    h1: "Be the answer when someone asks ChatGPT or Google's AI Overview.",
    lead: 'Search is splitting into two tracks: blue links and AI answers. We structure your content, schema and entity signals so AI engines cite you, not your competitor.',
    cards: [
      { icon: 'quote', title: 'Answer-first content', text: 'Content structured the way LLMs actually extract answers.' },
      { icon: 'code-xml', title: 'Schema & structured data', text: 'Markup that makes your entity unmistakable to crawlers.' },
      { icon: 'network', title: 'Entity building', text: 'Consistent brand signals across the web so AI trusts your facts.' },
      { icon: 'radar', title: 'Citation tracking', text: 'We monitor where you actually get cited across AI engines.' },
    ],
    tool: {
      name: 'AI Readability Index',
      lead: 'A directional read on how ready your existing copy is to get pulled into AI answers.',
    },
    quote: {
      name: 'Instant AI SEO & AI Overview quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Need content built to be cited in the first place?',
      label: 'See Content Marketing →',
      href: '/services/content-marketing/',
    },
  },
  {
    slug: 'social-media-growth',
    toolKey: 'social',
    title: 'Social Media Growth',
    eyebrow: 'Social Media Growth',
    h1: "Content that builds an audience your competitors can't copy.",
    lead: 'Strategy, calendars, captions and creative direction for Instagram and LinkedIn, aimed at DMs and bookings, not just likes.',
    cards: [
      { icon: 'calendar', title: 'Content calendars', text: 'Monthly plans mapped to pillars: education, authority, relatability, engagement, conversion.' },
      { icon: 'pen-line', title: 'Caption & copy', text: 'Hooks and captions written to stop the scroll and start conversations.' },
      { icon: 'palette', title: 'Creative direction', text: 'Reels concepts, carousel design direction, on-brand visual system.' },
      { icon: 'message-circle', title: 'Community & DMs', text: 'Engagement playbooks that turn comments and DMs into leads.' },
    ],
    tool: {
      name: 'Reach Efficiency Checker',
      lead: 'A directional read on whether algorithmic suppression is capping your reach.',
    },
    quote: {
      name: 'Instant Social Media quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Ready to amplify the best of it with paid?',
      label: 'See Paid Campaigns →',
      href: '/services/paid-campaigns/',
    },
  },
  {
    slug: 'content-marketing',
    toolKey: 'content',
    title: 'Content Marketing',
    eyebrow: 'Content Marketing',
    h1: 'Words that rank on Google and get quoted by AI.',
    lead: 'Blogs, guides, landing page copy and case studies, written to a structure that both search engines and AI models can actually extract answers from.',
    cards: [
      { icon: 'notebook-pen', title: 'SEO blogs & guides', text: 'Long-form content built around real search demand, not keyword stuffing.' },
      { icon: 'layout-template', title: 'Landing page copy', text: 'Persuasive copy that pairs with our website builds and your existing site.' },
      { icon: 'file-text', title: 'Case studies', text: 'Proof-driven stories that convert warm leads into signed clients.' },
      { icon: 'sparkles', title: 'AI-answer structuring', text: 'Every piece formatted so AI Overviews and chat assistants can cite it.' },
    ],
    tool: {
      name: 'Content Gap Snapshot',
      lead: "A directional read on the content opportunity you're leaving on the table.",
    },
    quote: {
      name: 'Instant Content Marketing quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Want that content cited by AI answers too?',
      label: 'See AI SEO →',
      href: '/services/ai-seo/',
    },
  },
  {
    slug: 'website-development',
    toolKey: 'webdev',
    title: 'Website Development',
    eyebrow: 'Website Development',
    h1: 'A website that works while you sleep.',
    lead: 'Fast, mobile-first websites built on top of the same SEO and content strategy that drives your traffic, so the site is never a separate project from your growth.',
    cards: [
      { icon: 'gauge', title: 'Built for speed', text: 'Sub-2-second loads on mobile, not a bloated template.' },
      { icon: 'mouse-pointer-click', title: 'Conversion-first UX', text: 'Every page engineered around one clear action: call, book, buy.' },
      { icon: 'scan-search', title: 'SEO-ready from day one', text: 'Schema, sitemaps and structure baked in, not bolted on later.' },
      { icon: 'key-round', title: 'You own it', text: 'Clean handover, no lock-in to a proprietary builder.' },
    ],
    tool: {
      name: 'Infrastructure Health Check',
      lead: 'A directional read on how much friction is costing you in mobile conversions.',
    },
    quote: {
      name: 'Instant Website Development quote',
      lead: "Adjust the sliders, we'll email you the exact number.",
    },
    crossLink: {
      text: 'Want the new site engineered to rank from day one?',
      label: 'See SEO →',
      href: '/services/seo/',
    },
  },
  {
    slug: 'paid-campaigns',
    toolKey: 'paid',
    title: 'Paid Campaigns',
    eyebrow: 'Paid Campaigns',
    h1: 'Ads that support the organic engine, never replace it.',
    lead: "Meta and Google campaigns layered on top of SEO and content that's already working, so every rupee of ad spend compounds instead of disappearing the day you stop paying.",
    cards: [
      { icon: 'megaphone', title: 'Meta lead generation', text: 'Instagram and Facebook campaigns built for DMs and form fills.' },
      { icon: 'target', title: 'Google Search & Local', text: "Capture high-intent search demand your SEO hasn't won yet." },
      { icon: 'repeat', title: 'Retargeting', text: 'Bring back the visitors your content already warmed up.' },
      { icon: 'receipt-text', title: 'Transparent reporting', text: 'Cost per lead and cost per booking, reported weekly.' },
    ],
    tool: {
      name: 'Ad Budget Waste Simulator',
      lead: 'A directional read on how much of your ad budget is leaking to preventable waste.',
    },
    quote: {
      name: 'Instant Paid Campaigns quote',
      lead: "Management fee only, ad budget is separate. We'll email you the exact number.",
    },
    crossLink: {
      text: 'Building the organic social engine underneath it?',
      label: 'See Social Media Growth →',
      href: '/services/social-media-growth/',
    },
  },
];

// The "why choose us" argument per service, in the founder's elevated B2B
// voice (see /CLAUDE.md): a bridge from the old world to the digital
// present, bold-lead-in pillars, an honestly-framed "Example in Action"
// (the SEO and AI-SEO examples are the founder's real, named-in-About
// engagements; the rest are mechanism-based illustrations, never invented
// client metrics), and a titled conclusion reframing the service as an
// owned asset rather than an expense.
export interface ServiceDeepDive {
  heading: string;
  bridge: string;
  pillars: { label: string; text: string }[];
  example: { metric: string; text: string };
  conclusion: { title: string; text: string };
}

export const serviceDeepDive: Record<string, ServiceDeepDive> = {
  seo: {
    heading: 'What separates SEO that compounds from SEO you rent.',
    bridge:
      'In the past, a business earned its reputation on the shop floor and through word of mouth. Today, the first place a prospective customer forms an opinion of you is the search results page, and the businesses that own the top of it are quietly winning the customers everyone else is still paying to reach. Ranking is not a vanity exercise; it is the difference between being the option buyers find on their own and the option they never see.',
    pillars: [
      { label: 'Intent before keywords', text: 'We start with how your specific buyers phrase the problem they are trying to solve, then target the exact terms, questions and comparisons that sit closest to a purchase decision, so the rankings we win are the ones that actually convert.' },
      { label: 'Fixed at the root, not patched over', text: 'Crawlability, site speed, internal structure and indexation are resolved at the technical foundation, because a page Google struggles to read or trust will never rank, however good the copy sitting on it.' },
      { label: 'Content that earns the position', text: 'Every supporting article is written to move a specific ranking, structured so it reads as authoritative to Google and quotable to AI answer engines at the same time.' },
    ],
    example: {
      metric: 'Within three months,',
      text: 'a legal services brand that came to us struggling to generate consistent inbound leads had SEO as its single most reliable source of new enquiries, a channel that keeps producing without a media budget behind it.',
    },
    conclusion: {
      title: 'Conclusion: SEO is an asset, not an expense.',
      text: 'Paid traffic stops the moment the invoice does. A page ranked on its own merit keeps generating enquiries month after month, which is why we treat SEO as the compounding foundation of your growth rather than a line item you switch on and off.',
    },
  },
  'local-seo': {
    heading: 'Why local visibility is won differently, and why it pays back fastest.',
    bridge:
      'For a business that serves a city, the most valuable moment is the one where someone nearby reaches for their phone and searches with the intent to act today. That moment is decided in the Google Maps pack, not the organic list beneath it, and it is won with an entirely different set of signals, which is exactly why we run it as its own discipline rather than a footnote to SEO.',
    pillars: [
      { label: 'A profile treated as a storefront', text: 'Your Google Business Profile is optimised, posted to and kept current every month, because an abandoned listing quietly tells both Google and your customer that the business behind it is inattentive.' },
      { label: 'Reviews as a system, not a hope', text: 'We build a repeatable way to earn and respond to reviews, since review volume and recency are among the clearest signals Google uses to decide who sits at the top of the pack.' },
      { label: 'Local authority, locally earned', text: 'Citations and links from genuinely relevant local sources tell Google your business belongs to this place, and that relevance is what moves you up the map.' },
    ],
    example: {
      metric: 'A same-day visit',
      text: 'is the common outcome of a nearby mobile search, which means a stronger map position is rarely an abstract ranking; it is next week\'s foot traffic and phone calls.',
    },
    conclusion: {
      title: 'Conclusion: the map pack is revenue with a short fuse.',
      text: 'Because local intent converts quickly and nearby, every position you climb in the pack tends to appear in the calendar faster than almost any other channel. It is the most immediate return in organic growth, and it deserves to be run deliberately.',
    },
  },
  'ai-seo': {
    heading: 'Why the businesses cited by AI today will own the category tomorrow.',
    bridge:
      'The way a customer discovers you is changing beneath everyone\'s feet. Where a search once returned ten blue links to choose from, it increasingly returns a single composed answer that names only two or three businesses, and there is no second page to that answer. Being absent from it is not a lower ranking; it is not existing for that buyer at all.',
    pillars: [
      { label: 'Structured to be extracted', text: 'We write and format your content the way large language models actually lift answers, so your expertise is the passage the model chooses to quote.' },
      { label: 'An entity a model can trust', text: 'Consistent schema and brand signals across the web make your business unmistakable to crawlers, which is what earns a model the confidence to cite you by name.' },
      { label: 'Measured where it counts', text: 'We track where you actually appear across ChatGPT, Gemini and Google\'s AI Overviews, so this is managed against real citations, not hope.' },
    ],
    example: {
      metric: 'Within two months,',
      text: 'an eCommerce brand we worked with was appearing directly inside Google\'s AI answers, pulling traffic and leads from a channel its competitors had not yet thought to contest.',
    },
    conclusion: {
      title: 'Conclusion: a first-mover advantage with a closing window.',
      text: 'The category\'s AI answers are being written now, from the content that exists now. The businesses that structure themselves to be cited early become the default the models reach for, and that position is far cheaper to claim today than to dislodge later.',
    },
  },
  'social-media-growth': {
    heading: 'Why an audience that buys is worth more than an audience that watches.',
    bridge:
      'A follower count is the easiest number in marketing to grow and the least likely to appear in your revenue. The audience worth building is the one that recognises your business, trusts it, and messages it when they are ready to act. Everything we plan is aimed at that audience, not the passive number that merely inflates a screenshot.',
    pillars: [
      { label: 'A calendar with a job', text: 'Every month is planned across clear pillars, education, authority, relatability, engagement and conversion, so the account builds trust on purpose rather than posting to stay busy.' },
      { label: 'Copy written to start conversations', text: 'Hooks and captions are built to stop the scroll and open a message thread, because a comment or a DM is where social actually turns into a lead.' },
      { label: 'Community treated as pipeline', text: 'We run the engagement and DM playbook that moves an interested follower toward an enquiry, rather than leaving warm attention to cool.' },
    ],
    example: {
      metric: 'A single DM thread',
      text: 'can be worth more than a thousand silent followers, which is why we measure the account by the conversations and enquiries it produces, not the vanity total at the top of the profile.',
    },
    conclusion: {
      title: 'Conclusion: social is a relationship engine, measured like one.',
      text: 'Built this way, your social presence stops being a content treadmill and becomes a durable audience that returns, refers and buys, an asset that keeps compounding as long as the relationship is tended.',
    },
  },
  'content-marketing': {
    heading: 'Why structure, not volume, decides what your content earns.',
    bridge:
      'Most content fails quietly, not because it is poorly written, but because it is built in a shape neither Google nor an AI model can do anything with. The pages that earn attention today are the ones structured around the questions buyers actually ask, answered clearly enough that a search engine can rank them and a language model can quote them, from the same piece.',
    pillars: [
      { label: 'Written to real demand', text: 'Every guide and article targets a genuine question your buyers are searching, so the content answers something people are actively looking for rather than something that was convenient to write.' },
      { label: 'One piece, two engines', text: 'We build each page to a question-led structure that Google indexes cleanly and AI answers can lift verbatim, so a single article works in traditional search and AI search at once.' },
      { label: 'Proof that converts', text: 'Case-style content is written to move a warm lead the last step toward a signed engagement, turning interest into a decision.' },
    ],
    example: {
      metric: 'A single well-structured page',
      text: 'can rank in Google and be quoted inside an AI Overview at the same time, doing the work of two separate assets, while a wall of adjectives does the work of neither.',
    },
    conclusion: {
      title: 'Conclusion: content is the compounding core of organic.',
      text: 'Every properly-built page keeps earning traffic and citations long after it is published, which is why we treat content not as a monthly output to fill a calendar, but as a library of assets that grows more valuable with time.',
    },
  },
  'website-development': {
    heading: 'Why your website is either your best salesperson or your quietest liability.',
    bridge:
      'Your website is the one part of the business that works every hour of every day, and most of them are quietly turning customers away before a conversation ever begins. A slow, unclear or untrustworthy site does not fail loudly; it simply lets the visitor leave, and you never learn about the booking you lost. We build sites that do the opposite: earn the trust and take the action, while you sleep.',
    pillars: [
      { label: 'Speed as a revenue decision', text: 'Sub-two-second mobile loads are engineered in from the start, because the gap between a fast page and a slow one is measured in visitors who abandon before they ever see your offer.' },
      { label: 'Engineered around one action', text: 'Every page is built to lead the visitor toward a single clear step, call, book or buy, rather than leaving them to work out what to do next.' },
      { label: 'Growth-ready from day one', text: 'Schema, sitemaps and clean structure are baked in, so the site strengthens your SEO instead of quietly undermining it, and you own the whole thing outright with no builder lock-in.' },
    ],
    example: {
      metric: 'The jump from one second to three',
      text: 'sharply increases the chance a visitor abandons the page, which means the performance of your site is not a technical detail; it is directly the number of enquiries it does or does not capture.',
    },
    conclusion: {
      title: 'Conclusion: the site is infrastructure, not decoration.',
      text: 'Built on the same strategy that drives your traffic, your website stops being a separate design project and becomes the conversion engine the rest of your growth runs through, an asset that pays back every visit it is sent.',
    },
  },
  'paid-campaigns': {
    heading: 'Why paid works best as an amplifier, never a foundation.',
    bridge:
      'Advertising rents attention for precisely as long as you keep paying for it; the day the budget pauses, the traffic stops with it. That is not a flaw in paid media, it is its nature, and the businesses that get the most from it are the ones that run it on top of an organic engine that already works, so spend accelerates growth rather than substituting for it.',
    pillars: [
      { label: 'Layered on what already ranks', text: 'We run paid to capture the high-intent demand your SEO and content have not yet reached, so the two channels reinforce each other instead of competing for the same budget.' },
      { label: 'Built for enquiries, not impressions', text: 'Meta and Google campaigns are constructed around DMs, form fills and bookings, the actions that show up in revenue, not the reach numbers that only look good in a dashboard.' },
      { label: 'Reported on what it costs to win a customer', text: 'You see cost per lead and cost per booking every week, so the spend is always judged by the outcome it produces, never the activity it generates.' },
    ],
    example: {
      metric: 'Ad spend that lands on an already-ranking site',
      text: 'converts more cheaply than spend sent to a cold one, because the audience arriving has been warmed by the organic presence around it; paid and organic compound when they are run together.',
    },
    conclusion: {
      title: 'Conclusion: rent attention, but own the asset underneath.',
      text: 'Paid is the accelerator you reach for once the organic foundation is in place, a way to buy speed on top of something that keeps working when the spending stops. Run in that order, every rupee of budget does more.',
    },
  },
};
