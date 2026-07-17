// Single source of truth for navigation, services and contact details.
// URL scheme locked here: service pages live under /services/<slug>/.
// Nav, Footer and (later) sitemap/JSON-LD all read from this file.

export interface ServiceLink {
  title: string;
  blurb: string;
  href: string;
}

export const services: ServiceLink[] = [
  {
    title: 'SEO (Organic & On-Page)',
    blurb: 'Rank where your customers search · free check included',
    href: '/services/seo/',
  },
  {
    title: 'Local SEO & Google Business',
    blurb: 'Win the Google Maps / local pack · free check included',
    href: '/services/local-seo/',
  },
  {
    title: 'AI SEO & AI Overviews',
    blurb: 'Get cited by ChatGPT, Gemini, AI Overview · free check included',
    href: '/services/ai-seo/',
  },
  {
    title: 'Social Media Growth',
    blurb: 'Content that builds a real audience · free check included',
    href: '/services/social-media-growth/',
  },
  {
    title: 'Content Marketing',
    blurb: 'Words that rank and convert · free check included',
    href: '/services/content-marketing/',
  },
  {
    title: 'Website Development',
    blurb: 'Fast, conversion-built websites · free check included',
    href: '/services/website-development/',
  },
  {
    title: 'Paid Campaigns',
    blurb: 'Ads that support the organic engine · free check included',
    href: '/services/paid-campaigns/',
  },
];

export const primaryNav = [
  { title: 'Work', href: '/work/' },
  { title: 'About', href: '/about/' },
  { title: 'Insights', href: '/insights/' },
  { title: 'More Free Checks', href: '/tools/' },
  { title: 'FAQs', href: '/faq/' },
];

export const contact = {
  email: 'business@clicknlikes.com',
  whatsappDisplay: '+91 84691 63322',
  whatsappHref: 'https://wa.me/918469163322',
  instagram: 'https://www.instagram.com/click.n.likes/',
  linkedin: 'https://www.linkedin.com/company/click-n-likes/',
  location: 'Ahmedabad & Mumbai · Worldwide',
};
