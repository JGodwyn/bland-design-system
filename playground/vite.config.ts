// Dev server for the playground: every component story, in light or dark. Playwright runs against it.
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [react()],
  server: { port: 5180, strictPort: true },
});
