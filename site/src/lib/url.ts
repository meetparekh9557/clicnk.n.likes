// Base-aware URL helper. Internal hrefs are written root-relative
// ("/services/seo/") everywhere in the codebase; withBase() prefixes
// them with Astro's base path so the same build logic serves both
// production ("/") and the /preview/ deployment. External and anchor
// links pass through untouched.
export function withBase(href: string): string {
  if (!href || !href.startsWith('/')) return href;
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return base + href;
}
