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
  },
];
