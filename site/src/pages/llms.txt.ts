// llms.txt (llmstxt.org convention): a plain-language index of the site for
// LLM-powered assistants and agents to read at query time - the machine
// equivalent of a README, distinct from robots.txt (which already allows
// AI crawlers - see robots.txt.ts - and controls crawling/training access,
// not content discovery). Built from the same data sources as sitemap.xml
// so it can never drift out of sync with what's actually published: every
// link and description below is pulled verbatim from real site copy, never
// invented for this file.
import type { APIRoute } from 'astro';
import { abs, ORG_DESCRIPTION, ORG_NAME, SITE_ORIGIN } from '../lib/seo';
import { serviceDetails } from '../data/services';
import { articles } from '../data/articles';
import { caseStudies } from '../data/caseStudies';
import { tools } from '../data/tools';

export const GET: APIRoute = () => {
  const isPreview = import.meta.env.PUBLIC_PREVIEW === '1';
  if (isPreview) {
    return new Response(`This is a staging build. The real llms.txt is at ${SITE_ORIGIN}/llms.txt\n`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const link = (title: string, path: string, desc?: string) =>
    `- [${title}](${abs(path)})${desc ? `: ${desc}` : ''}`;

  const services = serviceDetails.map((s) => link(s.title, `/services/${s.slug}/`, s.lead)).join('\n');
  const toolLinks = tools
    .map((t) => link(t.name, t.slug ? `/tools/${t.slug}/` : '/tools/', t.tagline))
    .join('\n');
  const insights = articles.map((a) => link(a.title, `/insights/${a.slug}/`, a.excerpt)).join('\n');
  const work = caseStudies.map((c) => link(`${c.client}: ${c.title}`, `/work/${c.slug}/`, c.excerpt)).join('\n');

  const body = `# ${ORG_NAME}

> ${ORG_DESCRIPTION}

Based in Ahmedabad, India, working with clients worldwide. Every score our free tools show is either a live, verifiable measurement (labelled "verified") or a self-reported answer (labelled as such) - never blended or presented as more certain than it is. Pricing is published on the site, not gated behind a sales call.

## Services

${services}

## Free Tools

Live, real scans - not lead-gen quizzes. Each shows a score on screen for free; the full breakdown is emailed.

${toolLinks}

## Work

${work}

## Insights

${insights}

## Company

${link('About', '/about/')}
${link('Pricing', '/pricing/')}
${link('Why Organic (vs. paid ads)', '/why-organic/')}
${link('FAQ', '/faq/')}
${link('Contact', '/contact/')}

## Optional

${link('Privacy Policy', '/privacy/')}
${link('Terms', '/terms/')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
