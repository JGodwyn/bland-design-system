// Dev server for the playground: every component story, in light or dark. Playwright runs against it.
// `npm run docs:build` builds the same site as static files into dist-docs/ (docs/release.md).
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: resolve(import.meta.dirname),
  // Relative asset paths: routes are hashes, so the build works at a domain root or under a GitHub Pages subpath.
  base: './',
  plugins: [react()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
  // The docs bundle holds every story and the highlighter: one large chunk is fine for a docs site.
  build: { outDir: resolve(import.meta.dirname, '../dist-docs'), emptyOutDir: true, chunkSizeWarningLimit: 2000 },
});
