# Landing page copy review (2026-11-10)

A review of the live copy in `site/src/` and the plan to tighten it; each section lists what was there, what was wrong with it, and the proposed line.

**Applied 2026-11-11** (Godwin: hero option B, the rest as proposed, and the Figma variant count added). Four lines changed when they met the layout: the hero keeps option B's wording but its tags read "button, field, chart" and "dark." (as before), since "field and chart" and "dark mode" ran a line past Figma's block; the brand steps were shortened (the current step is a headline, and the first ran to five lines), the footer headline became "Start Bland. Ship yours." ("Start with Bland. Ship your brand." ran to four lines), and the brand section's note was reworded too. The live copy is `docs/landing-copy.md`.

## What other systems do

Read for this review: Mantine, Chakra UI, React Aria, Untitled UI, Radix Themes, Carbon.

- **The hero names the category and the outcome, plainly.** Mantine: "A fully featured React components library". Chakra: "Accessible React components for building high-quality web apps and design systems". React Aria: "Over 50 components with built-in behavior, adaptive interactions, top-tier accessibility, and internationalization out of the box". No metaphors; the product is the subject.
- **Numbers lead, and they count generously.** Mantine says "120+ components and 70 hooks". Untitled UI says "10,000+ components and variants". React Aria says "Over 50 components". They count every exported part, and they put tokens, icons and hooks beside the components.
- **Feature headings are capabilities, not jokes.** "Flexible styling", "Dark color scheme", "Accessibility that's truly first-class", "Ready for an international audience". The description under each one carries a concrete fact: a standard, a browser, a number.
- **One light touch, at most.** React Aria allows itself "Tested. Like, really." once, and only after paragraphs of specifics. The rest of its page is plain and confident.

## Where Bland sounds like a pet project

1. **Personifying the product.** "Comes alive", "Dark mode that thinks", "Motion with manners". They are cute, but they say nothing a buyer can check.
2. **Stating the bare minimum as a feature.** "Components that fit together" or "Works without a mouse" are table stakes for a design system. Name the standard instead.
3. **Undercounting.** "Over 45" was a conservative count of folders. `bland-ui` exports 61 components (Table's parts, the groups, Toaster and IconButton count separately, as they do in Mantine), plus 41 icons and about 600 design tokens.
4. **Clipped fragments.** "Any hex. It never moves." and "One file, loaded last. Done." read like notes to oneself. Use full, short sentences.
5. **Casual section titles.** "Some questions about Bland" sounds shy. "Components showcase" is a working label.

## Voice for the rewrite

- Confident and specific. Every claim is something a reader can check: a count, a standard, a browser, a file.
- The product or the reader is the subject, never a personified component.
- Short sentences, plain words, no jargon above the install section, no em dashes (the docs rule).
- Keep exactly one wink: the name itself, in the hero title ("Bland by design").

## Section by section

### Meta and `llms.txt`

- Now: "A React design system that comes alive when you give it a color. Pick one, and every button, field and chart follows, in light and dark."
- Proposed: "An accessible React design system, themed from a single brand color. Over 60 components and 600 design tokens, in light and dark."
- Title stays: Bland design system.

### Hero

- **Title** "Bland by design. Built for purpose." Keep. It is the one place the name's joke earns its spot, and the description underneath does the serious work.
- **Description**, now: "A [React design system] that comes alive when you give it a [color.] Pick one, and every [button, field, chart] follows, in [light] and [dark.]"
- Proposed, with the same five tagged phrases and icons (React, swatches, diamonds, sun, moon):
  - **A (pick):** "An accessible [React design system], themed from a single [brand color]. Every [button, field and chart] adapts to it, in [light] and [dark] mode."
  - **B:** "A production-ready [React design system] built on tokens. Set one [brand color] and every [button, field and chart] follows, in [light] and [dark] mode."
- **Button** "Read the docs". Keep. Consider adding a secondary "Get the Figma kit" once the file is public.

### Feature row (`features/cards.ts`)

| Now | Proposed title | Proposed description |
| --- | --- | --- |
| Over 45 components that fit together | **60+ components, one set of tokens** | Forms, navigation, overlays, tables, date pickers and messaging, built on the same 600 design tokens, so every screen stays consistent. |
| Light and dark, each designed | **Light and dark, designed separately** | Dark is its own palette, not an inverted light theme. Every surface, shadow and color is tuned for it. Drag the divider to compare. |
| One color rebrands it all | **Rebrand with one color** | Enter your brand color and Bland builds the full scale, tints the neutrals and updates every component. |
| Works without a mouse | **Accessible by default** | Full keyboard support, managed focus and screen reader labels on every control, built on React Aria. Tab through the form to try it. |
| Charts in your colors | **Chart palettes from your brand** | Eight series colors led by your brand, each checked for contrast and kept distinct for color-blind readers. Switch the view to compare. |
| Typed down to every prop | **Fully typed in TypeScript** | Every prop and variant is typed, so your editor suggests the valid options and flags the wrong ones before they ship. Pick one to see it. |

### What you get (`what-you-get/slides.tsx`)

These overlapped with the feature row (accessibility and theming appear in both). The rewrite makes the slides about scope and engineering, and leaves the demos to the row.

| Now | Proposed |
| --- | --- |
| Every part a project needs. Buttons and fields, menus and modals, tables and date pickers, chat and file upload. | **Complete coverage.** From buttons and fields to data tables, date pickers, chat and file upload. |
| Dark mode that thinks. Not an inverted page: surfaces, shadows and colors each have a dark version made for it. | **A dedicated dark theme.** Surfaces, shadows and colors are defined for dark mode, not inverted from light. |
| Motion with manners. Quick, quiet animations that step aside when someone asks for reduced motion. | **Purposeful motion.** Short, consistent transitions that respect the reduced-motion setting. |
| Works for everyone. Keyboard, focus and screen reader behaviour from React Aria, checked in Chromium, WebKit and Firefox. | **Tested in every engine.** Automated accessibility and behaviour tests run in Chromium, WebKit and Firefox. |
| Nothing hardcoded. Every color, size and space comes from a token, so a rebrand never touches component code. | **Token-driven.** Every color, size and spacing value is a design token, so a rebrand never touches component code. |
| Your icons. Bring Phosphor, Lucide or your own SVGs. Bland sizes and colors them. | **Bring your own icons.** Use Phosphor, Lucide or your own SVGs. Bland sizes and colors them to match. |

The comment in `slides.tsx` that names "Dark mode that thinks" changes with it.

### Brand section (`brand/BrandTheme.tsx`)

- **Heading** "One color in. A whole theme out." Proposed: "From one color to a complete theme."
- **Steps**:
  1. Now "Pick your color. Any hex. It never moves." Proposed: "Choose your brand color. Bland keeps it exactly as you enter it and builds the scale around it."
  2. Now "See every pairing in light and dark, and fix the ones that fail." Proposed: "Check contrast in light and dark. Any pairing that falls short gets a suggested fix."
  3. Now "Copy the CSS. One file, loaded last. Done." Proposed: "Copy one CSS file. Load it after Bland, and every component takes on your brand."
- **Button** "Open Brand theme". Proposed: "Open the Brand theme tool".

### Showcase (`showcase/Showcase.tsx`)

- **Title** "Components showcase". Proposed: "See it in your brand".
- **Lede** "Plain until it's yours. The same components, any brand. Switch the color and watch them follow." Proposed: "One set of components, any brand. Change the color, font or theme and watch every component update."

### Figma kit (`figma-kit/FigmaKit.tsx`)

This section already reads well. One change: "code catches up in one sync" becomes "code follows in a single sync".

### FAQ (`faq/questions.tsx`)

- **Title** "Some questions about Bland". Proposed: "Frequently asked questions".
- **Line** stays, shortened: "Brand tokens, light and dark themes, and what changes when you change the color."
- **Fix, factual:** "Is this ready for production?" says "version 0.1", but 0.2.0 is out. Drop the number so it can't go stale: "Bland is published on npm and follows semantic versioning. Every component is tested for keyboard use and accessibility in Chromium, WebKit and Firefox. Before 1.0 a minor release can change an API, but the old name keeps working, with a warning, for one minor version."
- "How do brand tokens work?": its second sentence is vague. Proposed: "Override the brand color once and every button, field, chart and surface updates, in light and dark. Component names, sizes and states stay the same, so nothing else in your code changes."
- "How do tokens integrate with design systems?" is an odd question for a design system's own page. Proposed question: "How do Figma and code stay in sync?", keeping the same answer.
- "Are there performance considerations…?": the answer opens with "Very few." Proposed: "Minimal. Tokens are CSS variables in one stylesheet, so light, dark and your brand are applied by CSS alone, with no JavaScript doing the theming."
- The other answers are already plain and specific. Keep them.

### Footer (`footer/Footer.tsx`)

- **Title** "Start Bland. End up yours." Proposed: "Start with Bland. Ship your brand."
- **Fix:** "© 2026 Bland Design System. All rights reserved." contradicts the MIT license linked beside it. Proposed: "© 2026 Godwin John. Released under the MIT license."

### 404 (`not-found/main.tsx`)

Already standard. Keep.

## Open

- **Figma variant count.** Untitled UI counts "components and variants". If Bland's Figma file has well over 1,000 variants, "60+ components, 1,000+ variants in Figma" is a stronger and honest stat for the Figma kit section. It needs a count from the file.
