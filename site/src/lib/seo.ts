// Central SEO helpers: the canonical production origin, structured-data
// (JSON-LD) builders, and the single list of real routes the sitemap
// enumerates. Everything here emits absolute production URLs
// (https://clicknlikes.com/...), never the /preview/ base, because
// structured data and sitemaps describe the live site regardless of
// which build produced them. Nav/Footer links still go through
// withBase(); this file is for machines, not on-page navigation.

import { services } from '../data/site';
import { serviceDetails } from '../data/services';
import { articles } from '../data/articles';
import { caseStudies } from '../data/caseStudies';
import { toolPages } from '../data/tools';

// Must match `site` in astro.config.mjs. Kept as a plain constant so the
// builders below work in static frontmatter without Astro.site plumbing.
export const SITE_ORIGIN = 'https://clicknlikes.com';

export const ORG_NAME = 'Click.n.likes';
export const ORG_LEGAL = 'Click.n.likes';
export const ORG_LOGO = `${SITE_ORIGIN}/logo.png`;
export const OG_DEFAULT = `${SITE_ORIGIN}/og-default.png`;

// Absolute production URL for a root-relative path ("/services/seo/").
export function abs(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return SITE_ORIGIN + (path.startsWith('/') ? path : `/${path}`);
}

// Markets we serve, for the Organization schema's `areaServed`. This is the
// property for where a business SELLS, as distinct from `address`, which
// asserts where it is physically located — claiming an address somewhere we
// do not occupy is the kind of misleading markup Google treats as spam.
//
// Deliberately a focused list of the high-income and upper-middle-income
// markets we are actually set up to serve (they mirror the currencies the
// pricing page quotes in), not an exhaustive dump of every country: Google's
// guidelines warn against marking up irrelevant content, and `areaServed` is
// a descriptive property rather than a ranking lever.
const CITIES = [
  // India
  'Ahmedabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Surat', 'Jaipur',
  // International
  'London', 'Manchester', 'New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Toronto', 'Vancouver',
  'Sydney', 'Melbourne', 'Auckland', 'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh', 'Singapore',
  'Dublin', 'Berlin', 'Amsterdam', 'Paris', 'Zurich', 'Stockholm', 'Copenhagen',
];
const STATES = [
  'Gujarat', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Rajasthan', 'Delhi',
  'California', 'New York', 'Texas', 'Ontario', 'British Columbia', 'New South Wales', 'Victoria',
];
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand', 'Ireland',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
  'Singapore', 'Japan', 'South Korea', 'Malaysia', 'Hong Kong',
  'Germany', 'France', 'Netherlands', 'Belgium', 'Spain', 'Italy', 'Portugal', 'Austria', 'Switzerland',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czechia', 'Hungary', 'Romania',
  'South Africa', 'Israel', 'Turkey', 'Mexico', 'Brazil', 'Chile',
];
export const AREA_SERVED = [
  ...CITIES.map((name) => ({ '@type': 'City', name })),
  ...STATES.map((name) => ({ '@type': 'State', name })),
  ...COUNTRIES.map((name) => ({ '@type': 'Country', name })),
];

// Organization / brand identity. Emitted site-wide from the Base layout.
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_ORIGIN}/#organization`,
    name: ORG_NAME,
    url: `${SITE_ORIGIN}/`,
    logo: ORG_LOGO,
    image: OG_DEFAULT,
    description:
      'Full-stack organic growth agency for SaaS, manufacturers, legal and professional firms, D2C brands and local businesses worldwide. SEO, AI Search, Social, Content, Websites and Paid.',
    email: 'business@clicknlikes.com',
    // `address` is a claim to be physically located somewhere, so it lists
    // only where we actually operate from. `areaServed` is the correct
    // property for the markets we serve, and lets us name cities and states
    // we work with without asserting an office there — Google treats an
    // address for a place you do not occupy as spammy structured markup.
    address: [
      { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    ],
    areaServed: [...AREA_SERVED],
    sameAs: [
      'https://www.instagram.com/click.n.likes/',
      'https://www.linkedin.com/company/click-n-likes/',
    ],
  };
}

// LocalBusiness identity, for /contact/ specifically - the page that most
// directly answers "where and how do I reach this business." Distinct from
// organizationSchema (emitted site-wide) because LocalBusiness is the type
// search engines look for when surfacing local-pack/contact-style results,
// and re-declaring the org as a ProfessionalService here is the documented
// way to get that without duplicating the site-wide Organization node.
export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_ORIGIN}/contact/#localbusiness`,
    name: ORG_NAME,
    url: `${SITE_ORIGIN}/contact/`,
    image: OG_DEFAULT,
    email: 'business@clicknlikes.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    areaServed: [...AREA_SERVED],
    sameAs: [
      'https://www.instagram.com/click.n.likes/',
      'https://www.linkedin.com/company/click-n-likes/',
    ],
  };
}

// Founder identity, tied to the Organization node. Emitted on /about/ only -
// the one page that actually establishes who Meet Parekh is and why that
// matters, rather than repeating it on every page.
export function founderSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Meet Parekh',
    jobTitle: 'Founder',
    worksFor: { '@id': `${SITE_ORIGIN}/#organization` },
    url: `${SITE_ORIGIN}/about/`,
    sameAs: ['https://www.linkedin.com/in/meetparekh21/'],
  };
}

// Site-level WebSite node. Emitted site-wide from the Base layout.
export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    name: ORG_NAME,
    url: `${SITE_ORIGIN}/`,
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    inLanguage: 'en',
  };
}

// BreadcrumbList from an ordered [label, path] trail (paths root-relative).
export function breadcrumbSchema(trail: [string, string][]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: abs(path),
    })),
  };
}

// A single service offering, tied back to the organization as provider.
export function serviceSchema(opts: { name: string; description: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: abs(opts.path),
    serviceType: opts.name,
    areaServed: 'Worldwide',
    provider: { '@id': `${SITE_ORIGIN}/#organization` },
  };
}

// A published article (Insights). datePublished is optional; when an
// article carries no date we omit it rather than invent one.
export function articleSchema(opts: {
  title: string;
  description: string;
  path: string;
  author: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.title,
    description: opts.description,
    url: abs(opts.path),
    mainEntityOfPage: abs(opts.path),
    image: OG_DEFAULT,
    author: { '@type': 'Organization', name: opts.author, url: `${SITE_ORIGIN}/` },
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
  };
  if (opts.datePublished) node.datePublished = opts.datePublished;
  if (opts.datePublished) node.dateModified = opts.dateModified ?? opts.datePublished;
  return node;
}

// The one list of real, indexable routes. Static top-level pages plus the
// data-driven service and article pages, so the sitemap never drifts from
// what actually ships. `changefreq`/`priority` are advisory only.
export interface SitemapEntry {
  path: string;
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

export function sitemapEntries(): SitemapEntry[] {
  const staticPages: SitemapEntry[] = [
    { path: '/', changefreq: 'weekly', priority: 1.0 },
    { path: '/work/', changefreq: 'monthly', priority: 0.8 },
    { path: '/about/', changefreq: 'monthly', priority: 0.7 },
    { path: '/insights/', changefreq: 'weekly', priority: 0.7 },
    { path: '/pricing/', changefreq: 'monthly', priority: 0.9 },
    { path: '/tools/', changefreq: 'monthly', priority: 0.8 },
    { path: '/why-organic/', changefreq: 'monthly', priority: 0.6 },
    { path: '/faq/', changefreq: 'monthly', priority: 0.6 },
    { path: '/contact/', changefreq: 'yearly', priority: 0.6 },
    { path: '/privacy/', changefreq: 'yearly', priority: 0.3 },
    { path: '/terms/', changefreq: 'yearly', priority: 0.3 },
  ];
  const servicePages: SitemapEntry[] = serviceDetails.map((s) => ({
    path: `/services/${s.slug}/`,
    changefreq: 'monthly',
    priority: 0.9,
  }));
  const articlePages: SitemapEntry[] = articles.map((a) => ({
    path: `/insights/${a.slug}/`,
    changefreq: 'monthly',
    priority: 0.6,
  }));
  const caseStudyPages: SitemapEntry[] = caseStudies.map((c) => ({
    path: `/work/${c.slug}/`,
    changefreq: 'monthly',
    priority: 0.8,
  }));
  const toolDetailPages: SitemapEntry[] = toolPages.map((t) => ({
    path: `/tools/${t.slug}/`,
    changefreq: 'monthly',
    priority: 0.7,
  }));
  // services from site.ts and serviceDetails share slugs; use serviceDetails
  // (the render source) to stay 1:1 with generated pages.
  void services;
  return [...staticPages, ...servicePages, ...caseStudyPages, ...articlePages, ...toolDetailPages];
}
