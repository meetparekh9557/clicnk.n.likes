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
  /** Client logo in /public/clients/. Omitted until we have permission. */
  logo?: string;
  tag: string;
  title: string;
  excerpt: string;
  /** Engagement window, e.g. 'April 2025 – May 2026'. */
  period: string;
  lengthLabel: string;
  services: string[];
  sector: string;
  location: string;
  /** Headline numbers for the stat row. */
  stats: { value: string; label: string; sub?: string }[];
  overview: string;
  challenge: string;
  approach: { phase: string; when: string; body: string }[];
  /** Website before/after comparison rows. */
  siteCompare: { row: string; before: string; after: string }[];
  /**
   * Before/after screenshots in /public/work/. Presence is detected at build
   * time, so dropping the file in is all that is needed. Crop raws with
   * scripts/crop-shot.mjs first: a full-page capture renders as an unreadable
   * sliver, and both sides should share one ratio so the comparison is fair.
   */
  shotBefore?: string;
  shotAfter?: string;
  leads: LeadPoint[];
  results: { h: string; p: string }[];
  feedback: string;
  summary: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'aidbylaw',
    client: 'AidByLaw',
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
      { value: '4 → 25+', label: 'pages on the website', sub: 'one per service, not per category' },
      { value: '340–390', label: 'leads a month at close', sub: 'across both channels' },
    ],
    overview:
      'AidByLaw is a Pan-India legal and business consultation platform based in Faridabad, offering services across real estate documentation, business incorporation and compliance, individual legal matters such as name change, wills and marriage registration, and a dedicated track for NRIs managing Indian legal processes remotely. As a consultation-first business, its growth depends entirely on converting online visibility into calls, WhatsApp enquiries and form submissions.',
    challenge:
      'When AidByLaw approached us they had a basic template website with no meaningful SEO and no paid presence. Their immediate need was leads, but they were clear-eyed about wanting more than a short-term fix: a paid channel that could generate volume quickly, and an organic channel built alongside it, so the business would not stay permanently dependent on ad spend to keep enquiries coming in.',
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
        phase: 'A platform, not a brochure',
        when: 'Months 2–5',
        body:
          'The revamped site replaced a generic four-page template with a structured platform: more than 25 individual service landing pages, one per service rather than broad category pages, a homepage lead-capture form, a dedicated NRI section, verified Google reviews in place of stock testimonials, and the trust signals the original site had none of.',
      },
    ],
    siteCompare: [
      { row: 'Navigation', before: '4 flat top-level links', after: 'Full mega-menu, 25+ dedicated service pages' },
      { row: 'Homepage lead capture', before: 'None, banner CTAs only', after: 'Embedded form above the fold' },
      { row: 'Trust signals', before: 'None', after: 'Client volume, guarantees, verified reviews' },
      { row: 'NRI audience', before: 'Not addressed', after: 'Dedicated section and enquiry form' },
      { row: 'Testimonials', before: 'Stock avatars', after: 'Verified Google reviews' },
      { row: 'Design', before: 'Generic clip-art template', after: 'Custom, photography-led design' },
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
      'AidByLaw came in dependent on the idea of ads for lead volume. Thirteen months later they had both a scaled paid channel and a genuinely new organic one built from zero, on top of a website rebuilt from a generic four-page template into a 25-page conversion-structured platform with trust infrastructure it never had. Durable volume from ads, compounding growth from search: that combination was the sequencing we set out to deliver at the start.',
  },
];

export const caseStudyBySlug = (slug: string) => caseStudies.find((c) => c.slug === slug);
