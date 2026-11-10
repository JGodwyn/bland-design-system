// The public landing page (npm run site). It imports Bland straight from src/, so it always runs on the
// current components and tokens. `npm run site:build` builds it into dist-site/ at / and copies the docs
// under /docs/ (docs/release.md, "Hosting"). Files in site/public/ (_redirects, _headers, llms.txt, icons, og.png) are copied as they are;
// robots.txt, sitemap.xml and .well-known/ard.json come from siteAddress() below;
// 404.html is a second page.
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Preloads the hero's two Inter files (700 for the headline, 600 for the description) in the built page. The page
 * renders from JS, so without this the browser only asks for the fonts once React has drawn the hero, and the
 * fallback font shows first: the headline and description re-flow when Inter arrives (layout shift, landing audit
 * 2026-11-10). The file names are hashed, so they are read from the bundle.
 */
function preloadHeroFonts(): Plugin {
  const wanted = [/^assets\/inter-latin-700-normal-[\w-]+\.woff2$/, /^assets\/inter-latin-600-normal-[\w-]+\.woff2$/];
  return {
    name: 'bland-preload-hero-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        // The landing page only; the 404 page has no hero.
        if (!ctx.path.endsWith('/index.html')) return [];
        const files = Object.keys(ctx.bundle ?? {});
        return wanted.map((pattern) => {
          const file = files.find((name) => pattern.test(name));
          if (!file) throw new Error(`preloadHeroFonts: no built file matches ${pattern}`);
          return {
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
            injectTo: 'head' as const,
          };
        });
      },
    },
  };
}

/**
 * The dev server has no docs: /docs/ fell through to the landing page, so Read the docs seemed to do nothing
 * (Godwin 2026-11-10). In dev it redirects /docs/… to the docs' own dev server (npm run docs, port 5180); the
 * browser keeps the #/route. The built site has the docs under /docs/ (site:build), so this is dev only.
 */
function devDocsRedirect(): Plugin {
  return {
    name: 'bland-dev-docs-redirect',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? '';
        if (url !== '/docs' && !url.startsWith('/docs/')) return next();
        res.statusCode = 302;
        res.setHeader('Location', `http://${req.headers.host?.split(':')[0] ?? 'localhost'}:5180${url.slice('/docs'.length) || '/'}`);
        res.end();
      });
    },
  };
}

/**
 * The site's own address, for what needs a full URL: the canonical link, og:image and og:url, sitemap.xml, the
 * Sitemap line in robots.txt and the agent manifest (/.well-known/ard.json). Set it once the domain is known
 * (landing audit 2026-11-10), with no trailing slash, e.g. 'https://bland.example'. Until then the build leaves
 * these out (robots.txt without a Sitemap line, og:image relative) and says so.
 */
const SITE_URL: string | undefined = undefined;

/** Writes the files and tags that need SITE_URL (see above), and robots.txt either way. */
function siteAddress(): Plugin {
  const site = SITE_URL?.replace(/\/$/, '');
  return {
    name: 'bland-site-address',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!site || !ctx.path.endsWith('/index.html')) return html;
        return html
          .replace('content="/og.png"', `content="${site}/og.png"`)
          .replace('</head>', `    <link rel="canonical" href="${site}/" />\n    <meta property="og:url" content="${site}/" />\n  </head>`);
      },
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', ...(site ? [`Sitemap: ${site}/sitemap.xml`] : [])];
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `${robots.join('\n')}\n` });
      if (!site) {
        this.warn('SITE_URL is not set: no canonical link, sitemap.xml or ard.json, and og:image stays relative (site/vite.config.ts).');
        return;
      }
      // The docs' pages are hash routes (#/components/button), one document, so the sitemap has two URLs.
      const urls = [`${site}/`, `${site}/docs/`].map((u) => `  <url><loc>${u}</loc></url>`).join('\n');
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` });
      // Agentic Resource Discovery (agenticresourcediscovery.org/spec): one entry, the llms.txt summary. The
      // agent skill joins it once it ships (CLAUDE.md roadmap).
      const host = new URL(site).hostname;
      const ard = {
        entries: [
          {
            identifier: `urn:air:${host}:docs:bland`,
            displayName: 'Bland design system',
            type: 'text/markdown',
            url: `${site}/llms.txt`,
            description: 'Bland, a React design system on CSS tokens (npm bland-ui): how to install it, rebrand it from one color, and where the component docs are.',
            tags: ['design-system', 'react', 'css-tokens', 'components'],
            representativeQueries: [
              'how do I install the bland-ui design system',
              'how do I change the brand color in Bland',
              'which React components does Bland have',
            ],
          },
        ],
      };
      this.emitFile({ type: 'asset', fileName: '.well-known/ard.json', source: `${JSON.stringify(ard, null, 2)}\n` });
    },
  };
}

export default defineConfig(({ command }) => ({
  root: resolve(import.meta.dirname),
  // DialKit (the hero's tuning panel, site/src/hero/tuning.ts) only in the dev server; builds get its defaults.
  resolve: command === 'build' ? { alias: [{ find: /^dialkit$/, replacement: resolve(import.meta.dirname, 'src/dialkit-stub.ts') }, { find: 'dialkit/styles.css', replacement: resolve(import.meta.dirname, 'src/dialkit-stub.css') }] } : {},
  base: '/',
  plugins: [react(), devDocsRedirect(), preloadHeroFonts(), siteAddress()],
  server: { port: 5182, strictPort: true },
  preview: { port: 5183, strictPort: true },
  build: {
    outDir: resolve(import.meta.dirname, '../dist-site'),
    emptyOutDir: true,
    // Two pages: the landing page and the 404 page Cloudflare Pages serves for unknown paths.
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), notFound: resolve(import.meta.dirname, '404.html') } },
  },
}));
