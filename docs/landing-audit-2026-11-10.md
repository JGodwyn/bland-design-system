# Landing page web quality audit (2026-11-10)

The full audit of the Bland landing page (`site/`), run with the `web-quality-audit` skill (performance, Core Web Vitals, accessibility, SEO, best practices, agentic browsing). It follows a performance-only Lighthouse run earlier the same day and is compared against it. Read-only: no code was changed.

**Target:** the production build (`npm run site:build`, rebuilt after the landing-mobile session's hero change), served by `vite preview` at http://localhost:5183/. Local, public, no sign-in, cold cache.

**Tools:** Chrome DevTools MCP was held by another session ("browser is already running"), so the fallback ran: Lighthouse CLI 13.6.0 (headless Chrome, simulated throttling, default mobile and `--preset=desktop`, all five categories, three runs each), a Playwright probe in real Chromium (LCP and layout shifts with their sources, mobile at 4x CPU and about 1.6 Mbps / 150 ms; axe on the whole page in light and dark, desktop and phone; a Tab walk through every stop; reduced motion), and the skill's `scripts/analyze.sh` on `dist-site/`.

Line numbers are as of the audit; other sessions are editing `site/` at the same time.

## Audit results

### Evidence

| Signal | Scope/conditions | Result | Source |
| --- | --- | --- | --- |
| LCP | `/`, mobile, simulated, 3 runs | **2.56 s** median (2.45 to 2.63), needs improvement. Was 0.92 s | Lighthouse |
| LCP element | mobile | `p.hero__description` (was the headline); desktop: `h1#hero-title` | Lighthouse, Playwright |
| LCP | `/`, desktop, simulated, 3 runs | 0.47 s median (0.39 to 0.53). Was 0.53 s | Lighthouse |
| CLS | mobile, simulated, 3 runs | **0.058** in all three (was 0.105). Source: `h1#hero-title` | Lighthouse |
| CLS | mobile, real Chromium throttled, 3 runs | 0.076 median (0.033 to **0.214**). Source: the description's lines and the headline's bold layer moving when Inter replaces the fallback font | Playwright |
| CLS | desktop, simulated, 3 runs | 0.095 median (0.037 to 0.095), Lighthouse names the Inter 400/500/600/700 web fonts as the cause | Lighthouse |
| "Read the docs" shift | both | **Gone.** The button now fades and rises with opacity and transform only | Lighthouse, Playwright |
| TBT | mobile / desktop | 102 ms median (61 to 144) / 17 ms (2 to 30). Was 56 / 0 | Lighthouse |
| FCP | mobile / desktop | 1.57 s median (0.91 to 2.63) / 0.37 s | Lighthouse |
| Speed Index | mobile / desktop | 2.26 s (2.22 to 2.63) / 0.64 s. Was 2.07 / n.a. | Lighthouse |
| Performance score | mobile / desktop | 95 (92 to 96) / 98 (98 to 100). Was 97 / 98 | Lighthouse |
| INP | field | **Unavailable** (local, no CrUX, no RUM). Lab proxy: four long tasks on mobile, the longest 154 ms in `index.js` | Lighthouse |
| Field data (CrUX) | any | Unavailable: the page is not public yet | n/a |
| Accessibility | mobile and desktop | 97. One failing audit: color contrast | Lighthouse |
| axe (whole page) | light and dark, 1350 and 390 wide | Only `color-contrast` (serious), 14 to 15 nodes, all `.hero__desc-word` at 1.31:1 | axe-core via Playwright |
| Best Practices | both | 96: favicon 404 in the console; no source map for `rest.js` | Lighthouse |
| SEO | both | 92: `robots.txt` invalid (the server answers with the page's HTML) | Lighthouse |
| Agentic Browsing | both | 48 to 50: `llms.txt` and the ARD manifest return HTML; CLS | Lighthouse |
| Security headers | local server | No CSP, HSTS, COOP or frame policy (informative; set by the host) | Lighthouse |
| Weight | mobile | 445 KiB transferred; 2,010 DOM elements | Lighthouse |
| Static smoke test | `dist-site/index.html` | 0 issues, 0 warnings (the page is rendered by JS, so the HTML is almost empty) | `analyze.sh` |

### Critical issues (0 found)

None.

### High priority (4 found)

- **[Launch / hosting] The root still redirects to the docs.** File: `site/public/_redirects:3` (`/  /docs/  302`)
  - **Impact:** On Cloudflare Pages, `_redirects` rules run before static files, so with this line no visitor would ever see the landing page at `/`.
  - **Evidence:** Source, plus Cloudflare's documented order. Not testable here: `vite preview` ignores `_redirects`.
  - **Fix:** Remove the line when the landing page goes live (and the comment above it), keeping the file for later rules. Check `/` on the first Cloudflare preview deploy.

- **[Core Web Vitals: LCP] Mobile LCP is now the hero description, which only appears after the headline's entrance.** File: `site/src/hero/hero.css:260-274` (`.hero__desc-word` starts at opacity 0, then fades in after `--landing-description-delay` 420 ms plus 14 ms a word, `site/src/hero/tuning.ts:16-17`)
  - **Impact:** 2.56 s median in the lab on a mobile profile, just over the 2.5 s "good" line (was 0.92 s). On a real mid-range phone it could be worse. On the phone layout the bigger headline is split into one span per character, so the four-line description is now the largest text block and LCP waits for its fade.
  - **Evidence:** Measured, all three mobile runs. Lighthouse's breakdown shows the time is render delay, not network (TTFB 9 ms). Desktop is unaffected (the headline is LCP there, 0.47 s).
  - **Fix (pick one):** start the description visible (keep its scroll ink, drop the load fade, or fade only from 0.5 opacity so it paints at once); or start the fade at the same time as the headline instead of 420 ms later. Re-run the three mobile Lighthouse runs to confirm under 2.5 s.

- **[Core Web Vitals: CLS] Web font swap moves the headline and description.** Files: `site/src/main.tsx:4-8` (fonts come in through CSS `@import`), `src/styles/fonts.css:8-12` (Fontsource, `font-display: swap`), `site/index.html` (no preload)
  - **Impact:** Lighthouse 0.058 mobile, 0.095 desktop (just under the 0.1 line); in real throttled Chromium one run reached 0.214 (poor). The bottom-anchored description grows by a line in the fallback font, then jumps down 84 to 110 px when Inter arrives; the headline's letters re-flow too.
  - **Evidence:** Measured. Layout-shift sources are the description text nodes and `.hero__word-bold`; Lighthouse names `inter-latin-400/500/600/700` as the cause. The four Inter files are only requested about 50 ms after the CSS, once React has rendered.
  - **Fix:** preload the two hero weights (Inter 700 for the headline, 400 for the description) with `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `site/index.html` (Vite can inject the hashed URLs from a small plugin or `?url` import), and add a metric-matched fallback (`@font-face { font-family: 'Inter fallback'; src: local('Arial'); size-adjust / ascent-override … }`) at the end of the `--font-body` stack on the landing page so the swap no longer changes line breaks. Either one alone should bring CLS near 0.

- **[Accessibility] The hero description rests at 1.31:1 contrast.** File: `site/src/hero/hero.css:245-254` (`color: var(--text-minimal)`), `site/src/hero/Hero.tsx:316-321` (ink stays 0 until scrolled)
  - **Impact:** The page's one-sentence pitch is the only failing WCAG check (1.4.3 needs 3:1 at this size). Low-vision readers, and anyone who does not scroll, get near-invisible text. It is also the mobile LCP element.
  - **Evidence:** Measured: axe in light and dark, desktop and phone; Lighthouse. Already known: `tests/site.spec.ts:17-19` leaves the description out of the axe check, "PENDING Godwin".
  - **Fix:** Godwin's call (it is Figma's inactive gray). Options: rest at `text-subtle` (passes on surface-100) and ink to `text-bold`; or keep the gray only while motion is allowed and show `text-bold` under `prefers-reduced-motion` and `prefers-contrast: more`. Then drop the exclusion in the spec.

### Medium priority (5 found)

- **[Performance] Render-blocking CSS, half unused.** `index-*.css` is 41 KB gzipped (122 KB raw) and blocks first paint: about 300 ms on mobile, 90 ms on desktop. 57% of it is unused at load; `rest-*.css` (22 KB) is 53% unused.
  - **Evidence:** Measured (unchanged from the earlier run). It holds every Theme token in both modes plus Bland's base styles and the landing styles.
  - **Fix:** inline the hero's critical CSS and load the rest without blocking, or split the token file so the landing loads only what the hero needs first. Worth doing only once the High items are fixed; the gain is a few hundred ms of FCP on slow phones.

- **[Performance] Unused JavaScript and a large `rest` chunk.** `rest-*.js` 185 KB gz with 82 KB unused at load; `index-*.js` 79 KB gz with 32 KB unused. Mobile TBT rose to 102 ms median (was 56), with long tasks of 154 and 92 ms from `index.js`.
  - **Evidence:** Measured. The 700 KB raw `rest` chunk carries the showcase's components and both font switcher families.
  - **Fix:** split `rest.tsx` per section and load each when it nears the viewport (an `IntersectionObserver` around each `lazy()`), so the showcase's Calendar, Dropdown and chat code do not run at startup.

- **[Performance] Forced reflow at startup.** 65 ms in `index.js` on mobile, plus about 37 ms in `rest.js`.
  - **Evidence:** Measured; source attribution is minified. Hypothesis: `useIconPlacement` (`site/src/hero/Hero.tsx:132-180`, `getBoundingClientRect` and `offsetWidth` in a layout effect) and `useMarkers` (`Hero.tsx:242-256`, a probe span read with `getComputedStyle` right after a style write).
  - **Fix:** batch reads before writes, or read the marker color from a token value once instead of appending a probe. Confirm with a DevTools trace when the MCP browser is free.

- **[SEO / Agentic] No `robots.txt`, `sitemap.xml` or `llms.txt`, and unknown paths return the landing page.** File: `site/public/` (only `_redirects`)
  - **Impact:** `/robots.txt`, `/llms.txt` and `/.well-known/…` answer with the page's HTML and status 200, so crawlers and agents read garbage. Cloudflare Pages does the same (single-page fallback when there is no `404.html`).
  - **Evidence:** Measured: Lighthouse `robots-txt`, `llms-txt`, `ard-schema`.
  - **Fix:** add `site/public/robots.txt` (allow all, point at the sitemap), `sitemap.xml` (`/` and `/docs/`), optionally a short `llms.txt` (H1, one-line summary, links to the docs, npm and GitHub), and a `404.html` so unknown paths return 404.

- **[SEO / Sharing] No favicon, canonical, Open Graph or Twitter tags, and no structured data.** File: `site/index.html:3-8`
  - **Impact:** The favicon 404 is the console error that costs Best Practices; links shared in Slack, X or iMessage show no image or title card; no canonical URL for the eventual domain.
  - **Evidence:** Measured (favicon 404) and source.
  - **Fix:** add a favicon (the Logo mark as SVG plus a PNG fallback), `<link rel="canonical">`, `og:title` / `og:description` / `og:image` / `twitter:card`, `<meta name="theme-color">`, and optionally `SoftwareSourceCode` JSON-LD with the npm and GitHub links.

### Low priority (5 found)

- **[Best practices / Agentic] "Read the docs" in the hero is a button that sets `location.href`.** File: `site/src/hero/Hero.tsx:433-441`. It cannot be opened in a new tab, middle-clicked or followed by a crawler or agent, and screen readers announce a button that navigates. Use a link styled as the Button (the footer already has a real "Read the docs" link).
- **[Content] The nav's Figma link goes to the generic `https://www.figma.com/community`.** File: `site/src/hero/Hero.tsx:386`. Point it at the kit's Community page once it is published (the Figma kit section links the real file).
- **[Accessibility] Nav icon links are 20 x 20.** Figma kit and GitHub in the nav (`Hero.tsx:386-397`) pass Lighthouse's target-size check through spacing, but 24 x 24 (WCAG 2.5.8) or a larger hit area would be safer on touch. The footer's npm icon link is 48 x 20.
- **[Accessibility] No skip link.** Only six nav links precede the content, so the cost is small; a "Skip to content" link would still help keyboard users on every visit.
- **[Best practices] Host security headers.** No CSP, HSTS, COOP or `frame-ancestors` (informative, from the local server). Add a `site/public/_headers` for Cloudflare with at least `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'self'` and a CSP once the third-party links are final. The missing source map for `rest.js` is a non-issue for a public marketing page.

### What passed

- The "Read the docs" layout shift from the earlier run is fixed.
- Keyboard: 52 Tab stops in a logical top-to-bottom order (nav, hero button, Brand theme, showcase, Figma kit, FAQ, footer), every one with a visible focus ring except the showcase's Text Input, whose ring is drawn on its field box by design; no traps; the hidden desktop hero button comes out on focus.
- Landmarks: `main`, `header`, `nav` Main, `nav` Footer, `footer`; one `h1` and twelve `h2`s in order.
- Dark theme: no axe violations beyond the hero description (the hero is light by design).
- Reduced motion: characters and description words have no transform; only the button's opacity transition runs.
- Fonts are self-hosted, text is compressed, server latency is fine, bfcache works, no images to size (all vector).

### Summary

- Performance: mobile 95 median, LCP 2.56 s (needs improvement, up from 0.92 s), CLS 0.058 lab but up to 0.21 in a real throttled run; desktop good. 3 High-adjacent and 3 Medium findings. Field data unavailable.
- Accessibility: 97; one automated failure (hero description contrast, pending Godwin's call); keyboard, landmarks, headings and reduced motion checked by hand and pass. Screen reader pass not done.
- SEO: 92; missing `robots.txt`, sitemap, canonical and social tags (2 findings).
- Best Practices: 96; favicon 404, the button that navigates, host headers (3 findings).
- Agentic Browsing: 48 to 50; `llms.txt` and ARD return HTML, CLS (shares fixes with SEO and CLS).

### Recommended priority

1. Remove the `/` redirect in `_redirects` when the page goes live, or the landing page never shows.
2. Fix the font swap (preload Inter 700 and 400, metric-matched fallback): it is the only CLS left and the worst real run was poor.
3. Let the description paint at once on load (or start its fade with the headline) to bring mobile LCP back under 2.5 s.
4. Decide the description's resting color (contrast); this also settles the pending axe exclusion.
5. Add `robots.txt`, `sitemap.xml`, `404.html`, favicon, canonical and social tags (one small batch).
6. Then the performance polish: per-section lazy loading of `rest`, critical CSS, the startup reflow.

### Verification

- Re-run under the same conditions: `npm run site:build`, `vite preview` on 5183, `npx -y lighthouse@13 http://localhost:5183/ --chrome-flags="--headless=new"` three times mobile and three with `--preset=desktop`; compare medians with this table. The raw JSON of this run is in the auditing session's scratchpad (not kept in the repo).
- Still to do by hand: a VoiceOver pass on the hero (the headline's `aria-label` over duplicated character spans) and the showcase; a real phone on mobile data for LCP and CLS; a DevTools trace for the forced reflow once the MCP browser is free.
- Field validation pending: CrUX and INP only exist once the page is public and has traffic.

## Fixes applied (2026-11-10, same day)

Godwin: fix all of it, keep the description's resting gray, and say first what any change that alters the look or the interaction will do. Done so far: the changes that leave the page as it looks and works.

| Fix | Where | Result |
| --- | --- | --- |
| Preload the hero's Inter 700 (headline) and 600 (description; first try preloaded 400, which the hero does not use, and left 0.025) | `site/vite.config.ts` (`preloadHeroFonts`, reads the hashed names from the bundle) | **CLS 0** in all three Lighthouse runs on both profiles (was 0.058 mobile, 0.095 desktop) and in ten real throttled Chromium runs (was up to 0.214) |
| `robots.txt` (allow all; the Sitemap line waits for the domain) | `site/public/robots.txt` | SEO 92 to **100** |
| `llms.txt` (summary, docs and npm links; GitHub left out, the repo is private) | `site/public/llms.txt` | Agentic Browsing 48 to 50 up to **75** |
| Security and cache headers: nosniff, referrer policy, `frame-ancestors 'self'` + `X-Frame-Options`, permissions policy, HSTS, immutable `/assets/*` and `/docs/assets/*` | `site/public/_headers` | Checked on Cloudflare's local server (`npx wrangler pages dev dist-site`): all present |

Re-run, same conditions (three runs each, Lighthouse 13.6.0):

| | Mobile median (range) | Desktop median (range) |
| --- | --- | --- |
| Performance score | 96 (93 to 98) | 100 |
| LCP | 2.56 s (2.41 to 2.61), unchanged: it needs the description entrance change below | 0.54 s |
| CLS | **0** | **0** |
| TBT | 55 ms (51 to 133) | 0 ms |
| Accessibility / Best Practices / SEO / Agentic | 97 / 96 / 100 / 75 | 97 / 96 / 100 / 75 |

Looked at and left alone, with the reason:

- **Startup forced reflow.** With source maps (a scratch build) the 95 ms "top function" is React's commit, the page's first layout; the attributed reads are Bland's tab indicator measuring itself (`src/components/tabs/tabs.tsx:203-209`, about 60 ms at 4x CPU, after the hero has painted) and What you get's scroll position (`site/src/what-you-get/WhatYouGet.tsx:170`, 28 ms). Not the hero hooks guessed above. Moving it would change a library component for a small gain after first paint.
- **Render-blocking CSS.** The page draws nothing until its script has run, and the script downloads beside the CSS, so inlining or splitting the CSS would not bring first paint earlier. Only prerendering the hero's HTML would, a larger change.
- **Source maps.** Not needed on a marketing page.
- **Full CSP.** Waits for the final list of outside links; React's inline style attributes need `style-src 'unsafe-inline'`.
- **Hero description contrast.** Kept by Godwin's choice (Figma's inactive gray); stays a known Lighthouse and axe failure, already excluded in `tests/site.spec.ts`.

Still to come, each changes what visitors see or how something behaves, so it waits for Godwin's go-ahead: the description's entrance (mobile LCP), removing the `/` redirect, favicon and share image, canonical and sitemap (need the domain), a 404 page, "Read the docs" as a real link, larger hit areas on the nav icons, a skip link, the Figma and GitHub nav links, and loading the sections below the hero one by one.

## Second pass (2026-11-10, after Godwin's answers)

Changed: the description's entrance starts with the headline (`descriptionDelay` 420 to 0 ms; the words still rise in one by one); "Read the docs" is a real link drawn with the Button's classes (same look, hover and magnetic motion; new tab and Cmd-click work); the Figma nav icon is hidden below breakpoint/sm and the icon links have a 24px hit area; `/` shows the landing page (redirect removed); `404.html` (logo, "Page not found", home and docs buttons) is served with a 404 status for unknown paths; favicon (the solid Colored Logomark, same file as the docs), `apple-touch-icon.png`, and an `og:image` / Twitter card from the hero (`og.png`, 1200 x 630); the GitHub repo is public and in `llms.txt`; the chunk for everything under the hero is requested two frames after the hero mounts instead of at once. Left out on Godwin's call: the skip link, per-section lazy loading.

| Signal | Mobile | Desktop | Source |
| --- | --- | --- | --- |
| Performance | 96, 96, 92 | 100, 100, 100 | Lighthouse 13.6, simulated, 3 runs |
| LCP (simulated) | 2.3 s, 2.5 s, 2.7 s | 0.5 to 0.6 s | Lighthouse |
| FCP (simulated) | 1.2 s, 1.2 s, 2.7 s | 0.2 to 0.4 s | Lighthouse |
| TBT | 50 to 150 ms | 0 ms | Lighthouse |
| CLS | 0 | 0 | Lighthouse and real Chromium, 5 runs each |
| LCP, real Chromium (4x CPU, 1.6 Mbps, 150 ms) | 1.30 to 1.45 s (description) | 0.06 to 0.1 s (headline) | Playwright probe, 5 runs |
| Accessibility | 97 (only the hero description's contrast, kept by Godwin) | 97 | Lighthouse |
| Best practices | 100 (was 96: the favicon) | 100 | Lighthouse |
| SEO | 100 | 100 | Lighthouse |
| Agentic browsing | 75 (no agent manifest) | 75 | Lighthouse |

Reading the mobile numbers: unthrottled, the hero first paints at about 0.45 s. Lighthouse's simulated phone counts every file requested before that first paint. When the 188 KB chunk for the sections below was requested at once, two of three runs counted it and showed 2.8 s. Requesting it once the hero has painted brought those runs to 2.3 to 2.5 s; one run in three still catches it, because the hero's first visible paint waits for its entrance to start (its letters begin at opacity 0). The real throttled browser was at about 1.3 s either way. A build without the 404 page measured the same, so the extra shared chunk the second page creates costs nothing measurable.

Still open: the render-blocking CSS (about 440 ms estimated; the page draws nothing before its JavaScript anyway), the forced reflows (React's first layout, the tabs indicator), source maps not shipped by default but a full CSP and absolute share URLs, canonical and sitemap need the domain; the Figma nav link needs the kit's Community URL.

## Third pass (2026-11-10)

Everything left but the Figma link waits on one thing, the site's address: `SITE_URL` in `site/vite.config.ts`. Set, the build writes the canonical link, absolute `og:image` and `og:url`, `sitemap.xml`, the robots.txt Sitemap line and `/.well-known/ard.json`. Checked with a test address: Agentic browsing **98** (was 75; one Low note left, see EXECUTIONS.md), SEO 100, Best practices 100. The faq spec's type error is fixed. Accessibility stays 97 by choice (the hero description's color).
