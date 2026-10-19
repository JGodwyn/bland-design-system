import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // Peer and runtime dependencies stay imports, so apps share one copy (React Aria keeps global tooltip state).
      external: ['react', 'react-dom', 'react/jsx-runtime', /^react-aria(\/|$)/, /^react-stately(\/|$)/, /^@floating-ui\//],
    },
    cssCodeSplit: false,
  },
});
