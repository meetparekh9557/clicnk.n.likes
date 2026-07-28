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
    // /demo/ hosts a deliberately-broken fixture page used to record the
    // free-tool reel — it must never be crawled or indexed, on top of its own
    // noindex meta tag.
    : ['User-agent: *', 'Allow: /', 'Disallow: /demo/', '', `Sitemap: ${SITE_ORIGIN}/sitemap.xml`, ''].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
