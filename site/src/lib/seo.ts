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
    areaServed: 'Worldwide',
    address: [
      { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
      { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressRegion: 'Maharashtra', addressCountry: 'IN' },
    ],
    sameAs: [
      'https://www.instagram.com/click.n.likes/',
      'https://www.linkedin.com/company/click-n-likes/',
    ],
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
  const toolDetailPages: SitemapEntry[] = toolPages.map((t) => ({
    path: `/tools/${t.slug}/`,
    changefreq: 'monthly',
    priority: 0.7,
  }));
  // services from site.ts and serviceDetails share slugs; use serviceDetails
  // (the render source) to stay 1:1 with generated pages.
  void services;
  return [...staticPages, ...servicePages, ...articlePages, ...toolDetailPages];
}
