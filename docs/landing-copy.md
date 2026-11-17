# Landing page copy

The copy on the public landing page at `/` (`site/src/`), section by section, top to bottom. The sections read their words from here by hand, so change this file first. Godwin designs the page in Figma; `docs/release.md`, "Hosting".

Voice (reworded 2026-11-11 after the review in `docs/landing-copy-review.md`, Godwin): confident and specific. Every claim is something a reader can check: a count, a standard, a browser, a file. The product or the reader is the subject, never a personified component. Short sentences, plain words, no token jargon above the install section, no em dashes. One wink only: the name, in the hero title and the footer.

Counts used on the page (2026-11-11): 61 exported React components (Table's parts, the groups, Toaster and IconButton counted separately, as Mantine counts), about 600 design tokens (unique custom properties in `tokens.css`), and in Figma 52 public component sets with 1,281 variants (plus 33 private sets with 601 variants and 2,684 icon components). Recount before a release that adds components.

## Nav

- Logo: Bland
- Links: Docs · Components · Brand theme · Figma · GitHub

## Hero

- **Title:** Bland by design. Built for purpose.
- **Description**, five tagged phrases with icons (React, swatches, diamonds, sun, moon): A production-ready [React design system] built on tokens. Set one [brand color] and every [button, field, chart] follows, in [light] and [dark.] (Option B from the review, with the tags' original wording so it keeps Figma's line count: "field and chart" and "dark mode" ran a line over.) A tagged phrase never breaks across lines, so "React design system" starts the second line.
- **Button:** Read the docs

## Feature cards

A row of six cards that moves sideways as you scroll (Figma 7141:36653, `site/src/features/cards.ts`). Each card is a title, a moving picture and one line; on the cards you can use, the line ends by telling you what to do.

1. **60+ components, one set of tokens.** Forms, navigation, overlays, tables, date pickers and messaging, built on the same 600 design tokens, so every screen stays consistent.
2. **Light and dark, designed separately.** Dark is its own palette, not an inverted light theme. Every surface, shadow and color is tuned for it. Drag the divider to compare.
3. **Rebrand with one color.** Enter your brand color and Bland builds the full scale, tints the neutrals and updates every component.
4. **Accessible by default.** Full keyboard support, managed focus and screen reader labels on every control, built on React Aria. Tab through the form to try it.
5. **Chart palettes from your brand.** Eight series colors led by your brand, each checked for contrast and kept distinct for color-blind readers. Switch the view to compare.
6. **Fully typed in TypeScript.** Every prop and variant is typed, so your editor suggests the valid options and flags the wrong ones before they ship. Pick one to see it.

## What you get

Six slides under the "What you get" tag (`site/src/what-you-get/slides.tsx`). They cover scope and engineering; the feature cards carry the demos.

- **Complete coverage.** From buttons and fields to data tables, date pickers, chat and file upload.
- **A dedicated dark theme.** Surfaces, shadows and colors are defined for dark mode, not inverted from light. (This slide turns the stage dark.)
- **Purposeful motion.** Short, consistent transitions that respect the reduced-motion setting.
- **Tested in every engine.** Automated accessibility and behaviour tests run in Chromium, WebKit and Firefox.
- **Token-driven.** Every color, size and spacing value is a design token, so a rebrand never touches component code.
- **Bring your own icons.** Use Phosphor, Lucide or your own SVGs. Bland sizes and colors them to match.

## Your brand, in one color

Figma 7066:28878, `site/src/brand/`. The heading is the section's tag; the current step becomes the headline, so each step stays short enough for three lines.

- **Tag:** From one color to a complete theme.
- **Steps:**
  1. Choose your brand color. Bland builds the scale around it.
  2. Check contrast in light and dark, with a fix for any pairing that falls short.
  3. Copy one CSS file, and every component takes on your brand.
- **Button:** Open the Brand theme tool
- **Note under the picture:** Bland ships in blue by default. Enter your brand color and it generates the other twelve shades, tints the neutrals toward it and checks the contrast. Your fonts can be set the same way.
- The pictures' own words: Brand color, Brand, Neutrals, "500 is your color, unchanged"; the check mirrors the Brand theme page: "Contrast warning", "1 of 35 color pairs is harder to read than it should be.", Fix contrast, Show breakdown / Hide breakdown, the breakdown row "progress" / "Fill on its track in dark: 2.85:1, needs 3:1" (2026-11-11); brand.css.

## Components showcase

Figma 7071:32494, `site/src/showcase/`. Eight preset brands plus any color, a light/dark switch and a font switch.

- **Heading:** See it in your brand
- **Line:** One set of components, any brand. Change the color, font or theme and watch every component update.

## Figma kit

Figma 7078:34292, `site/src/figma-kit/`.

- **Tag:** Figma kit
- **Title:** The whole system, in Figma.
- **Line:** Over 1,200 variants across 50 component sets, each starting in Figma and landing in code with the same names, sizes and states. When a token changes in Figma, code follows in a single sync.
- **Facts:** Variables for every token · Same names as the code · Light and dark modes
- **Button:** Get the Figma kit (the Bland file until the Community link is live; the Figma file goes public soon, Godwin 2026-11-10)

## FAQ

Figma `7189:37802`, `site/src/faq/questions.tsx`. Each answer checked against the repo (`package.json`, `docs/brand.md`, `docs/release.md`, `docs/agent-skill.md`, `CLAUDE.md`).

**Heading**, in two lines at every width: "Frequently asked" / "questions"

**Line:** Brand tokens, light and dark themes, and what changes when you change the color.

1. **How do brand tokens work?** Override the brand color once and every button, field, chart and surface updates, in light and dark. Component names, sizes and states stay the same, so nothing else in your code changes.
2. **Do I need to write custom CSS?** Not to use the components: sizes, colors and types are props. For your own layouts, use Bland's tokens (CSS variables such as `--space-md` or `--surface-raised`) instead of fixed values, so your parts rebrand with everything else.
3. **Can I use this in light and dark?** Yes. Both come built in, and each is designed on its own rather than flipped. Bland follows the system setting until you set `data-theme="light"` or `"dark"`, on the whole page or on one section.
4. **How can I customize the spacing between elements?** Use the spacing tokens, from `--space-2xs` up to `--space-9xl`, for the gaps in your own layouts, and the optional page grid for columns. Inside a component, spacing comes with its size: pick a smaller or larger size rather than changing its padding.
5. **What accessibility standards are supported?** Bland follows WCAG where it applies to components: 4.5:1 contrast for text and 3:1 for controls (the Brand theme page checks your color against both), full keyboard use, a visible focus ring, and tooltips you can hover. Automated accessibility checks run on every component in Chromium, WebKit and Firefox. Right-to-left layouts aren't supported yet.
6. **Can I override global tokens for specific components?** Yes. Every component has its own tokens. Set one on a wrapper, such as `--button-brand-primary-rest`, and only the components inside it change.
7. **How do updates to tokens affect existing designs?** When you upgrade Bland, everything that reads a token takes its new value, since nothing is hardcoded. Your brand file loads last, so your colors stay yours. A renamed token keeps its old name for one minor version, and the changelog names the replacement.
8. **Is there version control for token sets?** Tokens are versioned with Bland itself: each npm release carries one set, and the changelog lists every token that changed. In Figma they are the same variables, synced to code in one step.
9. **Can tokens be exported for other platforms?** Not yet. Bland ships its tokens as CSS variables in `bland-ui/tokens.css`, for the web. The repo keeps them as JSON too, but there is no export for iOS, Android or other tools.
10. **How do Figma and code stay in sync?** Each Figma variable becomes a CSS token with the same name, and every component reads only tokens, so a change in Figma reaches the code in one sync. Use the same tokens in your own UI and it matches.
11. **Are there performance considerations for token usage?** Minimal. Tokens are CSS variables in one stylesheet, so light, dark and your brand are applied by CSS alone, with no JavaScript doing the theming.

**Spares** (not on the page; swap any in):

- **How do I install it?** Run `npm install bland-ui`, import its stylesheets and then your brand file, and use the components: `import { Button } from 'bland-ui'`. It needs React 19.
- **Can I use it without React?** The components need React. The tokens don't: `bland-ui/tokens.css` is plain CSS variables, so any site can share the same colors, spacing and type.
- **Does it work with Tailwind?** Bland doesn't use Tailwind and ships no Tailwind theme. Its styles are plain CSS, and its tokens are CSS variables that any setup can read.
- **Can I use my own fonts?** Yes. Set the body, heading and code fonts in your brand file (`--font-body`, `--font-heading`, `--font-code`) and load the font files; every text style follows. Until then Bland uses Inter and Geist Mono.
- **Which icons does it use?** Yours. Every icon slot takes any SVG, so Phosphor, Lucide or your own all work, and Bland sizes and colors them to match.
- **Which browsers does it support?** Bland is tested in Chromium, WebKit and Firefox, the engines behind Chrome, Edge, Safari and Firefox, and fits phones down to 320px wide. Chrome and Edge draw its smoothed corners; Safari and Firefox show plain rounded corners.
- **Is there a Figma file?** Yes. The Figma kit has every component, variant and token, in light and dark, with the same names as the code. It goes public soon.
- **How much does it cost?** Nothing. Bland is free and open source under the MIT license, for personal and commercial work.

## Footer

Figma `7100:36365`, `site/src/footer/`.

- **Logo:** Bland's own (mark and wordmark) above the headline
- **Headline**, two lines in the 848 column: Start Bland. / Ship yours. ("Start with Bland. Ship your brand." ran to four lines.)
- **Install:** `npm install bland-ui` (copyable)
- **Snippet:** the README's four imports, then `<Button emotion="brand" type="primary">Ship it</Button>`
- **Links:** Read the docs · Changelog · MIT license · npm
- **Line:** © 2026 Godwin John. Released under the MIT license. (Was "All rights reserved.", which contradicted the license.)

## Small copy

- Page title: Bland design system
- Meta and social description: A production-ready React design system built on tokens. Over 60 components and 600 design tokens, themed from one brand color, in light and dark.
- 404: Page not found. "This address doesn't lead anywhere. It may have moved, or the link has a typo." Buttons: Go to the home page · Read the docs

- Keyboard card captions (2026-11-16, short enough for a phone): "Sign up, tab 1 of 3", "Email, text field", "Remember me, checked" / "Remember me, unchecked", "Sign in, button"; the checkbox reads "Remember me".
