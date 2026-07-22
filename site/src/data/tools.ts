// Single source of truth for the interactive free tools. Powers the tools
// hub grid, the individual tool pages, the "Free Tools" nav dropdown, and
// the sitemap. The flagship Website Health Scan lives on the hub itself
// (/tools/), so it carries an empty slug; the rest each get their own page.
export interface ToolLink {
  slug: string; // '' = the hub flagship (Website Health Scan)
  name: string;
  tagline: string; // short one-liner for cards + nav
  icon: string; // lucide icon name, resolved where rendered
}

export const tools: ToolLink[] = [
  { slug: '', name: 'Website Health Scan', tagline: 'A live 11-signal on-page SEO audit of your page.', icon: 'Search' },
  { slug: 'website-speed', name: 'Website Speed Test', tagline: 'Your real mobile load speed, in plain English.', icon: 'Gauge' },
  { slug: 'first-impression', name: 'First-Impression Snapshot', tagline: 'See your homepage the way a new visitor does.', icon: 'Eye' },
  { slug: 'funnel-roi', name: 'Funnel Leak & ROI', tagline: 'The revenue you leak below a healthy 3% conversion.', icon: 'BarChart3' },
  { slug: 'competitor-threat', name: 'Competitor Threat', tagline: 'Score how much of a threat your main rival really is.', icon: 'Target' },
];

// The path a tool links to ('' → the hub, otherwise its own page).
export const toolHref = (t: ToolLink): string => (t.slug ? `/tools/${t.slug}/` : '/tools/');

// Just the sub-tools that get their own page (everything but the hub flagship).
export const toolPages = tools.filter((t) => t.slug);
