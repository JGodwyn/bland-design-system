# Landing page copy

Draft copy for the public landing page at `/` (Godwin designs it in Figma; `docs/release.md`, "Hosting"). Section by section, top to bottom. Where a line has options, the first is the pick.

Voice: short, plain, a little dry. The name is a joke Bland is in on: the system is neutral so a project's brand is what people see. Say what it does in words a project's designer understands; no token jargon above the install section. No em dashes.

## Nav

- Logo: Bland
- Links: Docs · Components · Brand theme · GitHub
- Button: Get started (to `/docs/`)

## Hero

**Headline**

1. Bland on purpose.
2. Boring by design. Yours in one color.
3. The design system that stays out of your brand's way.

**Subhead**

A React design system that looks like nothing until you give it a color. Pick one, and every button, field and chart follows, in light and dark.

**Buttons**

- Primary: Get started
- Secondary: Try your color (to the Brand theme page)

**Under the buttons, small**

`npm install bland-ui` · MIT · Free

## Feature cards

Under the hero: a row of six cards that moves sideways as you scroll (Figma 7141:36653, `site/src/features/`; it started as a strip of four facts, then a grid, removed 2026-11-08). Each card is a title, a moving picture and one line (Godwin 2026-11-08). Titles say what you get; the line says why it matters, and on the four cards you can use it ends by telling you what to do.

1. **Over 45 components that fit together.** Built on one set of tokens and rules, so whatever you put together looks like one product.
2. **Light and dark, each designed.** Each theme is drawn on its own, not flipped. Drag the line to compare.
3. **One color rebrands it all.** Change one hex and every button, toggle and bar follows.
4. **Works without a mouse.** Every control takes the keyboard and tells screen readers what it is. Tab through the form to try it.
5. **Charts in your colors.** Your brand leads, and every series stays clear for color-blind readers. Switch the view to check.
6. **Typed down to every prop.** Your editor offers every option and flags the wrong ones before they ship. Pick one to see it.

(Earlier titles, from Figma: Over 45 components · Light and dark, built in · One color to rebrand · Keyboard, screen reader tested; 5 and 6 were added in code.)

## Your brand, in one color

**Heading:** One color in. A whole theme out.

**Body:** Bland ships blue so it has something to show. Give it your brand color and it works out the other twelve shades, tints the grays toward it, and checks the contrast for you. Your fonts too.

**Three steps**

1. **Pick your color.** Any hex. It never moves.
2. **Check it.** See every pairing in light and dark, and fix the ones that fail with one tap.
3. **Copy the CSS.** One file, loaded last. Done.

**Link:** Open the Brand theme page

As built (Figma 7066:28878, 2026-11-08): the heading is the section's tag, the three steps are Figma's lines and the current one becomes the headline: "Pick your color. Any hex. It never moves." · "See every pairing in light and dark, and fix the ones that fail." · "Copy the CSS. One file, loaded last. Done." Button: Open Brand theme. Under the picture, the body above as an info note. The pictures' own words: Brand color, Brand, Neutrals, "500 is your color, unchanged"; Button label, Link on the page, Progress on its track, "Light · needs 4.5:1", Pass, Fix; brand.css.

## What you get

Built as six slides (site/src/what-you-get/slides.tsx reads these by hand; change this first). Each slide shows the heading and its line as one sentence, under the "What you get" tag, in this order: every part, dark mode, motion, works for everyone, nothing hardcoded, your icons (Figma's order on the canvas).

- **Every part a project needs.** Buttons and fields, menus and modals, tables and date pickers, chat and file upload.
- **Dark mode that thinks.** Not an inverted page: surfaces, shadows and colors each have a dark version made for it.
- **Works for everyone.** Keyboard, focus and screen reader behaviour from React Aria, checked in Chromium, WebKit and Firefox.
- **Motion with manners.** Quick, quiet animations that step aside when someone asks for reduced motion.
- **Nothing hardcoded.** Every color, size and space comes from a token, so a rebrand never touches component code.
- **Your icons.** Bring Phosphor, Lucide or your own SVGs. Bland sizes and colors them.

## Components showcase

**Heading:** Plain until it's yours.

**Body:** The same components, any brand. Switch the color and watch them follow.

(Design note: a live strip of components with three or four brand swatches to tap, and a light/dark switch.)

(Built 2026-11-09: Figma's heading is "Components showcase" with the body under it; the panel has eight preset brands plus any color, a light/dark switch and a font switch. "three brands" became "any brand" (Godwin 2026-11-09); Figma still says three.)

**Link:** Browse all components

## Built for the details

**Heading:** The small things, done once.

**Body:** Corner smoothing on every curve. Scroll areas that fade where content hides. Text that lines up with its icon whether it takes one line or three. Tooltips that wait before they show. The details you'd fix on every project, already fixed.

## From Figma to code

**Heading:** Designed in Figma. Shipped in React.

**Body:** Every component starts in the Figma kit and lands in code with the same names, sizes and states. When a token changes in Figma, code catches up in one sync.

**Kit card** (beside the body, a mock of the Figma file: a frame of components with the layers panel showing)

- Eyebrow: Figma kit
- Title: The whole system, in Figma.
- Line: Every component, variant and token, with light and dark modes. Duplicate it and design with the same parts you'll ship.
- Three facts, small: Variables for every token · Light and dark modes · Same names as the code
- Button: Get the Figma kit (to the Community file)

**Until the file is public** (swap these in for the button and line above)

- Button, disabled: Figma kit coming soon
- Line: The Figma file goes public soon. The code is ready today.

(The Figma file will be public soon, Godwin 2026-11-03. Point the button at the Community link once it's live.)

## Get started

**Heading:** Up and running in a minute.

```bash
npm install bland-ui
```

```tsx
import 'bland-ui/tokens.css';
import 'bland-ui/styles.css';
import { Button } from 'bland-ui';

<Button emotion="brand" type="primary">Ship it</Button>
```

**Small print:** React 19. Plain CSS, no Tailwind needed. Tokens work without React too.

**Button:** Read the docs

## FAQ

Figma `7189:37802`, between the Figma kit and the footer (`site/src/faq/questions.tsx` reads these by hand; change this first). Godwin's redesign (2026-11-09): Figma's twelve questions in its order; the first answer is Figma's own, the others are written for them. Each answer checked against the repo: `package.json`, `docs/brand.md`, `docs/release.md`, `docs/agent-skill.md`, `CLAUDE.md`.

**Heading:** Some questions about Bland, in two lines: "Some questions" / "about Bland" at every width (Godwin 2026-11-09)

**Line** (Figma's): Common questions about brand tokens, light and dark modes, and how the system behaves when you change the color.

1. **How do brand tokens work?** (Figma's) Change the brand token once, and every button, field, chart, and surface updates automatically. The system keeps the same names, sizes, and states, so your design stays consistent.
2. **Do I need to write custom CSS?** Not to use the components: sizes, colors and types are props. For your own layouts, use Bland's tokens (CSS variables such as `--space-md` or `--surface-raised`) instead of fixed values, so your parts rebrand with everything else.
3. **Can I use this in light and dark?** Yes. Both come built in, and each is designed on its own rather than flipped. Bland follows the system setting until you set `data-theme="light"` or `"dark"`, on the whole page or on one section.
4. **Is this ready for production?** Bland is on npm at version 0.1, and every component is checked for keyboard use and accessibility in Chromium, WebKit and Firefox. Before 1.0 a minor release can change an API, but an old name keeps working, with a warning, for one minor version, so you can upgrade at your own pace.
5. **How can I customize the spacing between elements?** Use the spacing tokens, from `--space-2xs` up to `--space-9xl`, for the gaps in your own layouts, and the optional page grid for columns. Inside a component, spacing comes with its size: pick a smaller or larger size rather than changing its padding.
6. **What accessibility standards are supported?** Bland follows WCAG where it applies to components: 4.5:1 contrast for text and 3:1 for controls (the Brand theme page checks your color against both), full keyboard use, a visible focus ring, and tooltips you can hover. Automated accessibility checks run on every component in Chromium, WebKit and Firefox. Right-to-left layouts aren't supported yet.
7. **Can I override global tokens for specific components?** Yes. Every component has its own tokens. Set one on a wrapper, such as `--button-brand-primary-rest`, and only the components inside it change.
8. **How do updates to tokens affect existing designs?** When you upgrade Bland, everything that reads a token takes its new value, since nothing is hardcoded. Your brand file loads last, so your colors stay yours. A renamed token keeps its old name for one minor version, and the changelog names the replacement.
9. **Is there version control for token sets?** Tokens are versioned with Bland itself: each npm release carries one set, and the changelog lists every token that changed. In Figma they are the same variables, synced to code in one step.
10. **Can tokens be exported for other platforms?** Not yet. Bland ships its tokens as CSS variables in `bland-ui/tokens.css`, for the web. The repo keeps them as JSON too, but there is no export for iOS, Android or other tools.
11. **How do tokens integrate with design systems?** They are this one's foundation. Each Figma variable becomes a CSS token with the same name, and every component reads only tokens, so a change in Figma reaches the code in one sync. Use the same tokens in your own UI and it matches.
12. **Are there performance considerations for token usage?** Very few. Tokens are CSS variables in one stylesheet, so light, dark and your brand are all applied by plain CSS, with no JavaScript doing the theming.

**Spares** (from the first draft, not on the page; swap any in):

- **How do I install it?** Run `npm install bland-ui`, import its stylesheets and then your brand file, and use the components: `import { Button } from 'bland-ui'`. It needs React 19.
- **Can I use it without React?** The components need React. The tokens don't: `bland-ui/tokens.css` is plain CSS variables, so any site can share the same colors, spacing and type.
- **Does it work with Tailwind?** Bland doesn't use Tailwind and ships no Tailwind theme. Its styles are plain CSS, and its tokens are CSS variables that any setup can read.
- **Can I use my own fonts?** Yes. Set the body, heading and code fonts in your brand file (`--font-body`, `--font-heading`, `--font-code`) and load the font files; every text style follows. Until then Bland uses Inter and Geist Mono.
- **Which icons does it use?** Yours. Every icon slot takes any SVG, so Phosphor, Lucide or your own all work, and Bland sizes and colors them to match.
- **Which browsers does it support?** Bland is tested in Chromium, WebKit and Firefox, the engines behind Chrome, Edge, Safari and Firefox, and fits phones down to 320px wide. Chrome and Edge draw its smoothed corners; Safari and Firefox show plain rounded corners.
- **Is there a Figma file?** Yes. The Figma kit has every component, variant and token, in light and dark, with the same names as the code. It goes public soon.
- **How much does it cost?** Nothing. Bland is free and open source under the MIT license, for personal and commercial work.

## Closing band

**Heading:** Start bland. End up yours.

**Button:** Get started

## Footer

As built from Figma `7100:36365` (2026-11-09):

- **Logo:** Bland's own (mark and wordmark) above the headline, added 2026-11-10
- **Headline:** Start Bland. End up yours.
- **Install:** `npm install bland-ui` (copyable)
- **Snippet:** the README's four imports, then `<Button emotion="brand" type="primary">Ship it</Button>`
- **Links:** Read the docs · Changelog · MIT license · npm (GitHub left out while the repository is private)
- **Line:** © 2026 Bland Design System. All rights reserved.

The earlier draft was "Bland, made by Godwin." with Docs · GitHub · npm · Changelog and MIT license.

## Small copy

- Page title: Bland, a design system that wears your brand
- Meta description: A React design system for light and dark that takes on your brand from one color. Over 45 accessible components, all built on tokens.
- Social card: Bland on purpose. Yours in one color.

(Figma kit section built 2026-11-09 from Figma `7078:34292`, which uses the kit card's copy as its own section: the tag "Figma kit", the title "The whole system, in Figma.", Figma's line "Every component starts in the Figma kit and lands in code with the same names, sizes and states. When a token changes in Figma, code catches up in one sync.", the three facts and "Get the Figma kit". The button points at the Bland file until the Community link is live; the "until the file is public" swap above is not applied.)
