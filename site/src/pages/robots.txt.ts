// Dynamic robots.txt. The production build (served at the domain root)
// allows crawling and advertises the sitemap. The /preview/ build sets
// PUBLIC_PREVIEW=1 and disallows everything, a belt-and-braces companion
// to the per-page noindex tag so the staging copy never gets crawled.
import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../lib/seo';

export const GET: APIRoute = () => {
  const isPreview = import.meta.env.PUBLIC_PREVIEW === '1';
  const body = isPreview
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ''].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
