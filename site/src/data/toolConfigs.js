// Per-service tool configs: form fields + which scorer + which field (if
// any) triggers a live page fetch. Field labels/questions match v1's forms.
// Rendered by components/islands/GatedTool.jsx and scored by
// lib/toolScorers.js. Keyed by service slug.
export const toolConfigs = {
  seo: {
    scorer: 'seo', urlField: 'seo_url',
    name: 'Organic Authority Index',
    lead: 'A directional read on your site architecture and keyword footing. Add a URL for a live on-page check.',
    resultNote: 'Your directional score appears on screen; the full page-by-page ranking opportunity breakdown is emailed.',
    fields: [
      { id: 'seo_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. legal, manufacturing, dental' },
      { id: 'seo_url', type: 'url', label: 'Your page URL', optional: true, placeholder: 'yourwebsite.com (optional, checked live)' },
      { id: 'seo_pillar', type: 'checkbox', label: 'Do you have dedicated pillar pages for your primary services?' },
      { id: 'seo_linking', type: 'checkbox', label: 'Is your blog updated with multi-layered internal linking?' },
      { id: 'seo_page23', type: 'checkbox', label: 'Are your target keywords ranking on page 2 or 3 instead of page 1?' },
      { id: 'seo_monthly', type: 'checkbox', label: 'Do you publish new content at least monthly?' },
    ],
  },
  localseo: {
    scorer: 'localseo',
    name: 'Local Visibility Radius Checker',
    lead: 'A directional read on how visible your business is on Google Maps right now.',
    resultNote: 'Your visibility radius appears on screen; the full profile and review-gap breakdown is emailed.',
    fields: [
      { id: 'localseo_industry', type: 'text', label: 'Your category', placeholder: 'e.g. dental clinic, salon' },
      { id: 'localseo_radius', type: 'select', label: 'Target radius', default: '5km', options: [{ v: '1km', l: '1 km' }, { v: '5km', l: '5 km' }, { v: '10km', l: '10 km' }] },
      { id: 'localseo_reviews_own', type: 'number', label: 'Your 5-star reviews', placeholder: 'e.g. 20' },
      { id: 'localseo_reviews_competitor', type: 'number', label: "Top competitor's 5-star reviews", placeholder: 'e.g. 50' },
      { id: 'localseo_nap', type: 'checkbox', label: 'Is your NAP (Name, Address, Phone) exactly identical across the web?' },
      { id: 'localseo_weekly', type: 'checkbox', label: 'Are you publishing weekly updates to your Google profile?' },
    ],
  },
  aiseo: {
    scorer: 'aiseo', urlField: 'aiseo_url', requireOneOf: ['aiseo_content', 'aiseo_url'],
    name: 'AI Readability Index',
    lead: 'Paste your copy or give a URL: we scan how ready it is to be pulled into AI answers.',
    resultNote: 'Your AI-readiness score appears on screen; the full citation-readiness breakdown is emailed.',
    fields: [
      { id: 'aiseo_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. dermatology, SaaS' },
      { id: 'aiseo_content', type: 'textarea', label: 'Paste your page copy', optional: true, placeholder: 'Paste the copy you want scanned (or use the URL below)...' },
      { id: 'aiseo_url', type: 'url', label: '...or your page URL', optional: true, placeholder: 'yourwebsite.com' },
      { id: 'aiseo_faq', type: 'checkbox', label: 'Does your site have an FAQ section answering real customer questions?' },
    ],
  },
  social: {
    scorer: 'social',
    name: 'Reach Efficiency Checker',
    lead: 'A directional read on whether algorithmic suppression is capping your reach.',
    resultNote: 'Your reach efficiency score appears on screen; the full platform-by-platform breakdown is emailed.',
    fields: [
      { id: 'social_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. D2C skincare' },
      { id: 'social_platform', type: 'select', label: 'Main platform', default: 'Instagram', options: [{ v: 'Instagram', l: 'Instagram' }, { v: 'Meta', l: 'Meta (Facebook)' }, { v: 'LinkedIn', l: 'LinkedIn' }] },
      { id: 'social_followers', type: 'number', label: 'Follower count', placeholder: 'e.g. 5000' },
      { id: 'social_engagement', type: 'number', label: 'Avg engagements per post', placeholder: 'e.g. 80' },
      { id: 'social_freq', type: 'range', label: 'Posts per week', min: 0, max: 14, step: 1, default: 3 },
      { id: 'social_shoot', type: 'select', label: 'Do you need a shoot?', default: 'none', options: [{ v: 'none', l: 'No, I have assets' }, { v: 'photo', l: 'Photo shoot' }, { v: 'video', l: 'Video shoot' }, { v: 'both', l: 'Both photo & video' }] },
    ],
  },
  content: {
    scorer: 'content', urlField: 'content_url',
    name: 'Content Gap Snapshot',
    lead: 'A directional read on the content opportunity you are leaving on the table.',
    resultNote: 'Your content gap score appears on screen; the full topic-by-topic opportunity list is emailed.',
    fields: [
      { id: 'content_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. apparel manufacturing' },
      { id: 'content_topic', type: 'text', label: 'Core service / topic', placeholder: 'e.g. seamless bras' },
      { id: 'content_url', type: 'url', label: 'A content page URL', optional: true, placeholder: 'yourwebsite.com/blog/... (optional, checked live)' },
      { id: 'content_freq', type: 'select', label: 'How often do you publish?', default: 'rarely', options: [{ v: 'weekly', l: 'Weekly or more' }, { v: 'fewmonth', l: 'A few times a month' }, { v: 'monthly', l: 'About once a month' }, { v: 'rarely', l: 'Rarely or never' }] },
      { id: 'content_pillars', type: 'checkbox', label: 'Every core service/topic has its own dedicated page' },
      { id: 'content_refresh', type: 'checkbox', label: 'You have refreshed old posts in the last 6 months' },
    ],
  },
  webdev: {
    scorer: 'webdev', urlField: 'webdev_url',
    // The two weakest checkboxes below (CLS, mobile speed) are exactly what
    // Google PageSpeed Insights measures directly. When a URL is given, fetch
    // it live instead of asking the visitor to self-diagnose their own site's
    // layout shift and load time — the same real check the standalone Speed
    // Test runs, reused here rather than re-self-reported.
    wantsPageSpeed: true,
    name: 'Infrastructure Health Check',
    lead: 'A directional read on how much friction is costing you in mobile conversions. Add a URL for a live Core Web Vitals + on-page check.',
    resultNote: 'Your live Core Web Vitals appear on screen; the full LCP, CLS and blocking-time breakdown is emailed.',
    fields: [
      { id: 'webdev_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. hospitality' },
      { id: 'webdev_url', type: 'url', label: 'Your website URL', optional: true, placeholder: 'yourwebsite.com (optional, on-page facts checked live)' },
      { id: 'webdev_leads', type: 'number', label: 'Monthly leads / enquiries', placeholder: 'e.g. 40' },
      { id: 'webdev_cls', type: 'checkbox', label: 'Do images or text blocks shift while loading? (CLS symptom)' },
      { id: 'webdev_longform', type: 'checkbox', label: 'Does your main lead form have more than 5 fields?' },
      { id: 'webdev_slow', type: 'checkbox', label: 'Does your site take over 3 seconds to become interactive on mobile?' },
    ],
  },
  paid: {
    scorer: 'paid',
    name: 'Ad Budget Waste Simulator',
    lead: 'A directional read on how much of your ad budget is leaking to preventable waste.',
    resultNote: 'Your budget-waste estimate appears on screen; the full platform-by-platform leak breakdown is emailed.',
    fields: [
      { id: 'paid_industry', type: 'text', label: 'Your industry', placeholder: 'e.g. real estate' },
      { id: 'paid_budget', type: 'number', label: 'Monthly ad budget (₹)', placeholder: 'e.g. 25000' },
      { id: 'paid_platforms', type: 'heading', label: 'Which platforms are you running?' },
      { id: 'paid_platform_google', type: 'checkbox', label: 'Google Ads' },
      { id: 'paid_platform_meta', type: 'checkbox', label: 'Meta Ads' },
      { id: 'paid_platform_linkedin', type: 'checkbox', label: 'LinkedIn Ads' },
      { id: 'paid_homepage', type: 'checkbox', label: 'Are you sending ad traffic directly to your homepage?' },
      { id: 'paid_pixel', type: 'checkbox', label: 'Is your conversion tracking / pixel unverified?' },
      { id: 'paid_negkw', type: 'checkbox', label: 'Are you missing a negative keyword list?' },
    ],
  },
  contentscore: {
    scorer: 'contentscore', urlField: 'contentscore_url', requireOneOf: ['contentscore_content', 'contentscore_url'],
    name: 'Content SEO Score',
    lead: 'Paste one page of copy or its URL: we score that specific piece on the on-page fundamentals that actually move rankings.',
    resultNote: 'Your score appears on screen; the full on-page fundamentals breakdown is emailed.',
    fields: [
      { id: 'contentscore_keyword', type: 'text', label: 'Target keyword or topic', placeholder: 'e.g. seamless bras for daily wear' },
      { id: 'contentscore_content', type: 'textarea', label: 'Paste your content', optional: true, placeholder: 'Paste the full page copy you want scored...' },
      { id: 'contentscore_url', type: 'url', label: '...or your page URL', optional: true, placeholder: 'yourwebsite.com/blog/... (optional, checked live)' },
    ],
  },
};
