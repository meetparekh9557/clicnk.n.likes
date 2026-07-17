import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Static output for GitHub Pages; every page gets a real URL.
export default defineConfig({
  site: 'https://clicknlikes.com',
  output: 'static',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] }
});
