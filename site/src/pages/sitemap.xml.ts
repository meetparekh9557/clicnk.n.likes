// Dynamic sitemap.xml built from the single route list in lib/seo.ts, so
// it stays 1:1 with the pages that actually ship (static pages + the
// data-driven service and article pages). URLs are always absolute
// production URLs, never the /preview/ base, because the sitemap
// describes the live site. A build-time lastmod is applied site-wide.
import type { APIRoute } from 'astro';
import { abs, sitemapEntries } from '../lib/seo';

export const GET: APIRoute = () => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = sitemapEntries()
    .map((e) => {
      const parts = [
        `    <loc>${abs(e.path)}</loc>`,
        `    <lastmod>${e.lastmod ?? lastmod}</lastmod>`,
      ];
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (typeof e.priority === 'number') parts.push(`    <priority>${e.priority.toFixed(1)}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
