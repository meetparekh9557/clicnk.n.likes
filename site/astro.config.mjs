import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Static output for GitHub Pages; every page gets a real URL.
// PREVIEW_BASE (set by the preview workflow) rebases the whole site to
// /preview/ so it can be browsed at clicknlikes.com/preview/ while v1
// keeps serving the root. Internal links go through src/lib/url.ts.
export default defineConfig({
  site: 'https://clicknlikes.com',
  base: process.env.PREVIEW_BASE || '/',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] }
});
