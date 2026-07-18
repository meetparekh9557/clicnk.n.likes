// Real, cited market statistics — NOT client results. Every number here
// is an industry figure with a named, checkable source, shown on-page.
// Client-specific outcomes belong in case studies (Phase 4) with their
// own numbers and permissions. Re-verify against live sources when
// refreshing; each `source` is the attribution rendered beside the stat.

export interface MarketStat {
  value: string;
  label: string;
  source: string;
}

// Google organic click-through rate by result position.
// Backlinko analysis of 4M+ Google search results (widely cited).
export interface CtrPoint {
  position: number;
  ctr: number; // percent
  highlight?: boolean;
}

export const ctrByPosition: CtrPoint[] = [
  { position: 1, ctr: 27.6, highlight: true },
  { position: 2, ctr: 15.8 },
  { position: 3, ctr: 11.0 },
  { position: 4, ctr: 8.4 },
  { position: 5, ctr: 6.3 },
  { position: 6, ctr: 4.6 },
  { position: 7, ctr: 3.6 },
  { position: 8, ctr: 2.8 },
  { position: 9, ctr: 2.4 },
  { position: 10, ctr: 2.1 },
];

export const ctrSource = 'Backlinko — analysis of 4 million Google search results';

// Headline market figures (stat tiles).
export const marketStats: MarketStat[] = [
  {
    value: '53%',
    label: 'of all trackable website traffic starts with organic search — more than every other channel combined',
    source: 'BrightEdge Research',
  },
  {
    value: '76%',
    label: 'of people who search for something nearby on a phone visit a business within a day',
    source: 'Google / Think with Google',
  },
  {
    value: '4–6 months',
    label: 'the honest timeline for SEO to compound into results — Google itself says four months to a year',
    source: 'Google Search Central',
  },
  {
    value: '+32%',
    label: 'jump in the chance a visitor bounces when a page slows from one second to three',
    source: 'Google / SOASTA mobile speed study',
  },
];
