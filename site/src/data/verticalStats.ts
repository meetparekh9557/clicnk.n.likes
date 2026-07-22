// Per-vertical market statistics for the /why-organic/ tabbed hub. Every
// figure is a cited INDUSTRY stat (never a client result), with a named,
// checkable source rendered on-page. This file is refreshed on a schedule
// by an autonomous agent task (see docs/STATS-REFRESH.md): it re-verifies
// each stat against a reputable current source, updates the numbers and
// `lastUpdated`, and never invents an unsourced figure. Keep 3 stats per
// vertical and keep every `source` real and attributable.

export interface VerticalStat {
  value: string;
  label: string;
  source: string;
}

export interface Vertical {
  key: string;
  label: string; // tab label
  blurb: string; // one-line framing under the tab
  stats: VerticalStat[];
}

// Month the figures below were last verified/refreshed (YYYY-MM).
export const statsLastUpdated = '2026-07';

export const verticalStats: Vertical[] = [
  {
    key: 'seo',
    label: 'SEO',
    blurb: 'Organic search is still the largest single source of trackable web traffic.',
    stats: [
      { value: '53%', label: 'of all trackable website traffic starts with organic search, more than every other channel combined', source: 'BrightEdge Research' },
      { value: '27.6%', label: 'of clicks go to the very first organic Google result, more than positions two and three combined', source: 'Backlinko (4M-result study)' },
      { value: '68%', label: 'of all online experiences begin with a search engine', source: 'BrightEdge Research' },
    ],
  },
  {
    key: 'local',
    label: 'Local SEO',
    blurb: 'When people search nearby, they act fast, often the same day.',
    stats: [
      { value: '76%', label: 'of people who search for something nearby on a phone visit a business within a day', source: 'Google / Think with Google' },
      { value: '28%', label: 'of local searches for something nearby result in a purchase', source: 'Google / Think with Google' },
      { value: '46%', label: 'of all Google searches are looking for local information', source: 'GoGulf / HubSpot' },
    ],
  },
  {
    key: 'ai',
    label: 'AI Search',
    blurb: 'Buyers increasingly ask an AI first, and never click through at all.',
    stats: [
      { value: '~59%', label: 'of US Google searches now end without a single click as answers appear on the results page', source: 'SparkToro / Similarweb' },
      { value: '25%', label: 'projected drop in traditional search-engine volume by 2026 as users shift to AI assistants', source: 'Gartner' },
      { value: '200M+', label: 'weekly active users on ChatGPT alone, a new front door for "who is the best…" questions', source: 'OpenAI' },
    ],
  },
  {
    key: 'social',
    label: 'Social',
    blurb: 'Social is where attention lives, and increasingly where buying starts.',
    stats: [
      { value: '5.2B', label: 'people use social media worldwide, roughly 63% of the planet', source: 'DataReportal' },
      { value: '2h 20m', label: 'the average person spends on social media every single day', source: 'DataReportal / GWI' },
      { value: '76%', label: 'of social media users have bought something they first saw on social', source: 'Curalate / Bazaarvoice' },
    ],
  },
  {
    key: 'content',
    label: 'Content',
    blurb: 'Useful content compounds: more visitors, more leads, less cost.',
    stats: [
      { value: '55%', label: 'more website visitors for businesses that blog consistently', source: 'HubSpot' },
      { value: '3x', label: 'as many leads as outbound marketing, at about 62% less cost', source: 'Demand Metric' },
      { value: '70%', label: 'of people would rather learn about a company through articles than ads', source: 'Content Marketing Institute' },
    ],
  },
  {
    key: 'web',
    label: 'Websites',
    blurb: 'Your site has seconds, sometimes milliseconds, to earn the next click.',
    stats: [
      { value: '0.05s', label: 'is all it takes for a visitor to form a first impression of your website', source: 'Behaviour & IT (Google-cited)' },
      { value: '+32%', label: 'jump in the chance a visitor bounces when a page slows from one second to three', source: 'Google / SOASTA' },
      { value: '88%', label: 'of online shoppers are less likely to return to a site after a bad experience', source: 'Sweor / Amazon' },
    ],
  },
  {
    key: 'paid',
    label: 'Paid',
    blurb: 'Ads work hardest when they support, not replace, the organic engine.',
    stats: [
      { value: '$2', label: 'in revenue, on average, for every $1 a business spends on Google Ads', source: 'Google Economic Impact' },
      { value: '65%', label: 'of clicks from high-intent, ready-to-buy searches go to the paid ads', source: 'WordStream' },
      { value: '50%', label: 'more likely to purchase: paid-search visitors versus organic visitors', source: 'Unbounce' },
    ],
  },
];
