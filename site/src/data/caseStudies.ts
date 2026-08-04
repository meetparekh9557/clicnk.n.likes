// Client case studies. Every figure here is reported from the engagement's
// own campaign and analytics reporting — nothing is modelled, smoothed or
// invented, and the awkward parts (the ad-platform learning phase, the
// mid-engagement dip) stay in, because a curve that only goes up is the
// least believable thing a case study can show.
//
// Legal note: our Master Services Agreement states that figures describing
// past work illustrate that engagement only and are not a prediction of
// comparable results. Every case study page carries that line.

export interface LeadPoint {
  /** Month index within the engagement, 1-based. */
  m: number;
  /** Reported leads from paid campaigns that month. */
  paid: number;
  /** Reported leads from organic search that month (0 before the channel existed). */
  organic: number;
  /** Optional short annotation shown on the chart. */
  note?: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  /**
   * Categories for filtering. A real engagement usually spans several
   * disciplines, so this holds every one it genuinely covered rather than
   * forcing a single label.
   */
  categories: string[];
  /** Client logo in /public/clients/. Omitted until we have permission. */
  logo?: string;
  tag: string;
  title: string;
  excerpt: string;
  /**
   * Engagement window, e.g. 'April 2025 – May 2026'. Omit entirely (rather
   * than guessing) when the client hasn't given dates to publish; the page
   * falls back to showing only lengthLabel.
   */
  period?: string;
  lengthLabel: string;
  services: string[];
  sector: string;
  location: string;
  /**
   * Headline numbers for the stat row. Omit for engagements with no
   * permissioned performance figures (e.g. a website-only build) rather than
   * inventing a metric — the page skips the stat row entirely when absent.
   */
  stats?: { value: string; label: string; sub?: string }[];
  overview: string;
  /**
   * Optional trusted-HTML version of `overview`, rendered in place of the
   * plain-text version when present. Exists so a case study can carry a real
   * outbound link to the client's own site (e.g. a dofollow mention on their
   * business description) without turning every case study's body copy into
   * raw HTML. Content here is founder-authored static data, never user input.
   */
  overviewHtml?: string;
  challenge: string;
  approach: { phase: string; when: string; body: string }[];
  /**
   * Website before/after comparison rows. Only meaningful for a redesign of
   * an existing site; omit for a from-scratch build.
   */
  siteCompare?: { row: string; before: string; after: string }[];
  /**
   * Before/after screenshots in /public/work/. Presence is detected at build
   * time, so dropping the file in is all that is needed. Crop raws with
   * scripts/crop-shot.mjs first: a full-page capture renders as an unreadable
   * sliver, and both sides should share one ratio so the comparison is fair.
   * Only for a redesign of an existing site — see siteCompare above.
   */
  shotBefore?: string;
  shotAfter?: string;
  /**
   * A single screenshot of the finished site, for a from-scratch build with
   * no prior site to compare against. Renders instead of the before/after
   * slider; leave shotBefore/shotAfter/siteCompare unset when using this.
   * If `gallery` is also set, `gallery` takes over the section instead.
   */
  shot?: string;
  /**
   * Multiple screenshots of the finished site (homepage, a work grid, a
   * client wall, etc.) for a from-scratch build with more than one page
   * worth showing. Each optionally captioned. Takes over from `shot` when
   * present.
   */
  gallery?: { src: string; caption?: string }[];
  /** Month-by-month reported lead volume. Omit when there's no ad/SEO retainer to report on (e.g. a website-only build) — the page skips the chart entirely. */
  leads?: LeadPoint[];
  /** Omit alongside `leads` for a website-only build with no performance figures to report. */
  results?: { h: string; p: string }[];
  /**
   * A real client quote or paraphrase, given with permission — never invent
   * one, even a plausible-sounding one, and attribute it to a named business.
   * Omit entirely if nothing real is on hand yet.
   */
  feedback?: string;
  summary: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'aidbylaw',
    client: 'AidByLaw',
    categories: ['Paid Media', 'SEO', 'Content Marketing', 'Websites & Conversion'],
    logo: '/clients/aidbylaw.png',
    tag: 'Legal & Consultation',
    title: 'From ads-dependent to a second channel that pays for itself',
    excerpt:
      'A Pan-India legal consultation platform came to us wanting leads. Thirteen months later they had a scaled paid channel and an organic one built from zero.',
    period: 'April 2025 – May 2026',
    lengthLabel: '13-month retainer',
    services: ['Website Revamp', 'SEO', 'Content Writing', 'Paid Ads (Google & Meta)'],
    sector: 'Legal and business consultation',
    location: 'Faridabad, serving Pan-India and NRIs',
    stats: [
      { value: '~10x', label: 'growth in paid leads', sub: 'from the learning-phase months' },
      { value: '0 → 40', label: 'organic leads a month', sub: 'a channel that did not exist' },
      { value: 'Every page', label: 'redesigned and re-optimised', sub: 'metas and copy rewritten for search' },
      { value: '340–390', label: 'leads a month at close', sub: 'across both channels' },
    ],
    overview:
      'AidByLaw is a Pan-India legal and business consultation platform based in Faridabad, offering services across real estate documentation, business incorporation and compliance, individual legal matters such as name change, wills and marriage registration, and a dedicated track for NRIs managing Indian legal processes remotely. As a consultation-first business, its growth depends entirely on converting online visibility into calls, WhatsApp enquiries and form submissions.',
    challenge:
      'When AidByLaw approached us they had a generic template website with no meaningful SEO and no paid presence. Their immediate need was leads, but they were clear-eyed about wanting more than a short-term fix: a paid channel that could generate volume quickly, and an organic channel built alongside it, so the business would not stay permanently dependent on ad spend to keep enquiries coming in.',
    approach: [
      {
        phase: 'Paid ads first',
        when: 'Month 1 onward',
        body:
          'We started with Google Search and Meta lead-generation campaigns at a monthly budget in the ₹50,000 to ₹1,50,000 range. The first two months meant working through both platforms’ algorithmic learning phases, which is expected on any new ad account but demands close, hands-on management, before the campaigns found their stride.',
      },
      {
        phase: 'Website revamp and SEO',
        when: 'From month 2',
        body:
          'Within two months we began rebuilding the website and layering in SEO. That sequencing was deliberate: organic growth compounds slowly, so starting it early meant it was contributing real leads by the middle of the engagement rather than beginning from zero at the end of it.',
      },
      {
        phase: 'Rebuilt around search',
        when: 'Months 2–5',
        body:
          'Rather than adding pages, we rebuilt the ones that existed. Every page was redesigned, its meta title and description rewritten around the queries buyers actually use, and its copy reworked to match that intent. On top of that: a homepage lead-capture form, a dedicated NRI section, verified Google reviews in place of stock testimonials, and the trust signals the original site had none of.',
      },
    ],
    siteCompare: [
      { row: 'Design', before: 'Generic clip-art template', after: 'Custom, photography-led design' },
      { row: 'Meta titles & descriptions', before: 'Generic and duplicated', after: 'Written per page around real search queries' },
      { row: 'On-page content', before: 'Written for the business', after: 'Rewritten around what buyers actually search' },
      { row: 'Navigation', before: '4 flat links, no sub-navigation', after: 'Grouped dropdowns by service area' },
      { row: 'Homepage lead capture', before: 'None, banner CTAs only', after: 'Embedded form above the fold' },
      { row: 'Trust signals', before: 'None', after: 'Client volume, guarantees, verified reviews' },
      { row: 'NRI audience', before: 'Not addressed', after: 'Dedicated section and enquiry form' },
      { row: 'Testimonials', before: 'Stock avatars', after: 'Verified Google reviews' },
    ],
    shotBefore: '/work/aidbylaw-old.png',
    shotAfter: '/work/aidbylaw-new.png',
    // Reported monthly lead volume across the engagement. The two flat months
    // at the start are the ad-platform learning phase; the dip at months 8-9
    // is the mid-engagement plateau before further optimisation.
    leads: [
      { m: 1, paid: 20, organic: 0, note: 'Learning phase' },
      { m: 2, paid: 30, organic: 0 },
      { m: 3, paid: 60, organic: 0 },
      { m: 4, paid: 150, organic: 0 },
      { m: 5, paid: 200, organic: 20, note: 'Organic begins' },
      { m: 6, paid: 300, organic: 22 },
      { m: 7, paid: 300, organic: 25 },
      { m: 8, paid: 270, organic: 28, note: 'Dip, then re-optimised' },
      { m: 9, paid: 270, organic: 30 },
      { m: 10, paid: 300, organic: 32 },
      { m: 11, paid: 320, organic: 35 },
      { m: 12, paid: 340, organic: 38 },
      { m: 13, paid: 350, organic: 40, note: 'Close of retainer' },
    ],
    results: [
      {
        h: 'Paid campaigns',
        p: 'The first two months were rougher than the rest. Both Google and Meta needed time to learn the business and its audience, and campaigns saw intermittent pausing and inconsistent delivery through that learning phase, holding leads to 20 to 30 a month. Once the algorithms stabilised, delivery smoothed and leads climbed steadily: 60, then 150, then 200, then 300 a month as the campaigns matured. Volume then settled back to around 270 a month for a stretch mid-engagement before further optimisation, recovering to a sustained 300 to 350 through the later months and into the close of the retainer. That is roughly a tenfold increase on the early learning-phase numbers, and both the slow start and the mid-course dip reflect the hands-on management a live ad account actually needs rather than a one-time win.',
      },
      {
        h: 'Organic search',
        p: 'Organic leads began appearing around month 5, starting at 20 a month and growing to 40 a month by the end of the engagement. This was a channel that did not exist at all beforehand, now contributing meaningfully without any ad spend behind it.',
      },
      {
        h: 'Both channels together',
        p: 'By the close of the 13-month engagement, AidByLaw was generating roughly 340 to 390 leads a month across both channels, up from 20 to 30 a month in the early learning-phase period, with a genuine second channel in place that had not previously existed.',
      },
    ],
    feedback:
      'AidByLaw’s published client reviews reflect the same experience their lead numbers suggest: reviewers point to fast turnaround, including same-day and ahead-of-schedule processing on name-change and Gazette matters, responsive communication throughout, and clients returning for additional services after a first interaction.',
    summary:
      'AidByLaw came in dependent on the idea of ads for lead volume. Thirteen months later they had both a scaled paid channel and a genuinely new organic one built from zero, on top of a website whose every page had been redesigned, re-titled and rewritten around what buyers actually search, with the trust infrastructure it never had. Durable volume from ads, compounding growth from search: that combination was the sequencing we set out to deliver at the start.',
  },
  {
    slug: 'adamas-films',
    client: 'Adamas Films',
    categories: ['Websites & Conversion'],
    logo: '/clients/adamas-films.png',
    tag: 'Film & Media',
    title: 'A dark, cinematic home for a reel that already speaks for itself',
    excerpt:
      'A Mumbai production house that shoots for Disney, Viacom18, Star and Zee needed a website with the same restraint as its work. We built one from scratch.',
    lengthLabel: 'Website design & build',
    services: ['Website Design & Build'],
    sector: 'Film, television and brand production',
    location: 'Mumbai, India',
    overview:
      "Adamas Films is a Mumbai-based production house founded by Aditya S. Chopra, producing television commercials, brand films, promotional campaigns and show packaging for entertainment networks and corporate clients. Its client list spans Disney, Viacom18, Discovery, Star and the full Zee network (Zee Café, Zee5, Zee Cinema, Zee Zest), alongside &flix, &privé HD, FashionTV and corporate clients like Prescon: work built for audiences who judge a production house in the first three seconds of a video, not a paragraph of copy.",
    challenge:
      "A production house's real case study is the work itself: a 55-second promo, a stop-motion TVC, a brand film. The website's only real job was to get out of the way of that footage while still proving, instantly, that the studio behind it plays in the same league as the broadcasters and brands on its client list. That is a narrower brief than it sounds: most portfolio sites either bury the reel under agency-speak, or strip out enough context that the work loses its frame.",
    approach: [
      {
        phase: 'Structure first',
        when: 'Information architecture',
        body: 'Before any visual design, we mapped how a producer or brand manager actually evaluates a shop like this: reel, then range, then who else trusts them. That became the spine of the site: a featured-work grid on the homepage, dedicated Shoot and Graphics sections for the full body of work, and a Services & Clients page as the credibility layer.',
      },
      {
        phase: 'A frame that disappears',
        when: 'Visual design',
        body: "Founder Aditya Chopra's brief was direct: an all-black aesthetic. We built the visual language around that, sleek and sophisticated, with a clean typeface chosen to complement the studio's personality rather than compete with it. Every decision kept attention on the thumbnail and the video player, not the website around it: subtle rather than loud, so visitors engage with each project instead of the site's own design.",
      },
      {
        phase: 'One page per project',
        when: 'Build',
        body: 'Every commercial, brand film and show package got its own page: embedded video, one paragraph of real context, nothing else competing for attention. The client wall does the trust-building the copy does not have to.',
      },
    ],
    gallery: [
      { src: '/work/adamas-films.png', caption: 'Homepage: about, then straight into featured work' },
      { src: '/work/adamas-films-work.png', caption: 'The Shoot section, one thumbnail per commercial and brand film' },
      { src: '/work/adamas-films-clients.png', caption: 'Services & Clients: the trust layer, in logos instead of copy' },
    ],
    summary:
      'Adamas Films did not need a website that argued for the studio; the client roster and the reel already do that. What it needed was a site with the same discipline as the work: full-bleed, unhurried, letting a 55-second cut do what no paragraph of agency copy could. That is what got built.',
  },
  {
    slug: 'kopa-seamless',
    client: 'Kopa Seamless',
    categories: ['SEO'],
    logo: '/clients/kopa-seamless.png',
    tag: 'Apparel Manufacturing',
    title: 'One self-built page, and organic search became the lead engine',
    excerpt:
      'A Mumbai apparel manufacturer built their own one-page site and asked us for SEO only. It now drives most of their new leads.',
    lengthLabel: 'Ongoing SEO retainer, started September 2025',
    services: ['SEO'],
    sector: 'Apparel manufacturing (seamless bonded intimate apparel, OEM & private label)',
    location: 'Mumbai, India',
    stats: [
      { value: '71%', label: 'of new leads from organic search', sub: 'Oct 2025 – Jul 2026, GA4' },
      { value: '12x', label: 'growth in monthly organic clicks', sub: '6/mo in Sep 2025 to 71/mo by Jun 2026, Search Console' },
      { value: '#1–8', label: 'ranking across their core business keywords', sub: 'Search Console + live-verified, August 2026' },
      { value: '1+/day', label: 'direct inquiries since March 2026', sub: 'WhatsApp, calls & email (client-reported)' },
    ],
    overview:
      'Kopa Seamless is a Mumbai-based seamless bra manufacturer, producing bonded, seamless-knit intimate apparel as an OEM and private-label partner for fashion brands. The business built and launched its own one-page website in September 2025, and came to us for SEO specifically, not a website rebuild, to get that new site found by the brands and buyers already searching for a bra manufacturer in India.',
    overviewHtml:
      'Kopa Seamless is a Mumbai-based <a href="https://www.kopaseamless.com/" target="_blank" rel="noopener">seamless bra manufacturer</a>, producing bonded, seamless-knit intimate apparel as an OEM and private-label partner for fashion brands. The business built and launched its own one-page website in September 2025, and came to us for SEO specifically, not a website rebuild, to get that new site found by the brands and buyers already searching for a <a href="https://www.kopaseamless.com/" target="_blank" rel="noopener">bra manufacturer</a> in India.',
    challenge:
      'A brand-new, self-built one-page site had no search history and no content depth to lean on, just a single page competing against manufacturers who had been ranking for years. The brief was narrow because the site itself was staying as it was: get that one page found for the terms real buyers actually search, without waiting on a redesign or a content library to make it happen.',
    approach: [
      {
        phase: 'Keyword & content strategy',
        when: 'Month 1',
        body: 'Before touching the page, we mapped out exactly which terms a real buyer types when sourcing a manufacturer, category phrases like "bra manufacturer in india" that carry genuine sourcing intent, not just casual traffic, and that mapping drove every decision after it.',
      },
      {
        phase: 'On-page and local optimisation',
        when: 'Month 1 onward',
        body: 'Every meta title, heading and paragraph on the single page was rewritten around those terms, alongside optimising their Google Business Profile and local listings so the business showed up consistently everywhere a buyer might look, not just in organic results.',
      },
      {
        phase: 'Building off-site authority',
        when: 'Ongoing',
        body: 'A single page has a ceiling on how much on-page work alone can do, so the work has continued with backlinks pointing back to the site to build domain authority, including the link this case study itself carries.',
      },
    ],
    results: [
      {
        h: 'Organic search leads',
        p: '34 of the 48 new leads recorded in GA4 between October 2025 and July 2026 came from organic search, 71% of all new leads in that window, ahead of direct, AI-assistant referrals, and every other channel combined.',
      },
      {
        h: 'Search visibility',
        p: 'Search Console shows monthly organic clicks growing from 6 in September 2025 to a peak of 71 in June 2026, roughly a twelvefold increase, with impressions climbing from 46 to 751 a month over the same stretch. The keywords driving the large majority of those clicks now rank between position 1 and 8, including outright #1 placement on their most exact-match positioning terms, confirmed both in Search Console and live search checks.',
      },
      {
        h: 'Beyond what analytics can see',
        p: 'Since March 2026, Kopa Seamless has reported at least one direct inquiry a day through channels analytics cannot capture, WhatsApp messages, phone calls and direct email, on top of the organic leads tracked in GA4.',
      },
      {
        h: 'AI search visibility',
        p: 'Also surfaces as the top-named manufacturer in AI-generated search answers for niche buyer queries matching their positioning, tested live in August 2026.',
      },
    ],
    summary:
      'Kopa Seamless came to us with a one-page site they had built themselves and one job for us: get it found. It now supplies the majority of the business’s new leads, ranks on page one for the exact category terms a buyer sourcing a bra manufacturer would type in, and is generating daily inbound interest through channels no dashboard tracks, all from optimising the single page that already existed rather than building a new one.',
  },
];

export const caseStudyBySlug = (slug: string) => caseStudies.find((c) => c.slug === slug);
