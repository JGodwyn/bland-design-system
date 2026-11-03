# Agent skill notes

Raw material for the skill we package at the end of the project: what an agent needs to know to build a project's UI with Bland. Add to it the moment something is settled that a project's agent (not an agent working on Bland itself) must follow. Short rules, each with where the detail lives. The skill is written from this file; this file is not the skill.

## Setup in a project

- Install with `npm install bland-ui` (the product is Bland; the npm name is `bland-ui`, published 2026-10-30). Needs React 19. Import `bland-ui/tokens.css`, `bland-ui/fonts.css`, `bland-ui/base.css`, `bland-ui/styles.css`, then the project's `brand.css`: the override comes after Bland's tokens (`docs/brand.md`, README). Components: `import { Button } from 'bland-ui'`. MIT license.
- Fonts: Inter and Geist Mono ship self-hosted in `src/styles/fonts.css`; base reset and helpers in `base.css`.
- Changing fonts (2026-10-29, roles 2026-10-30): three tokens on `:root` in `brand.css`, `--font-body` (Body styles), `--font-heading` (Display, Heading, Title; it is `var(--font-body)` until set, so one font needs only `--font-body`) and `--font-code` (Code). `npm run brand -- generate … --font-body "Söhne" --font-heading "Lora" --font-code "…"` writes them. Load the font files yourself (an `@font-face` per weight: body 400/500, heading 600, code 400/600) and skip `bland-ui/fonts.css` if every font is replaced. Every `--type-*` style follows; sizes, line heights and letter spacing stay Bland's. Never set a family in project CSS beside a text style; never redefine the tokens anywhere but `:root` (`docs/brand.md`, "Fonts").
- Trying fonts first (2026-10-30): the docs site's Brand theme page, Fonts tab, offers six self-hosted fonts for body and heading (Inter, Geist, DM Sans, Source Serif 4, Lora, Playfair Display) and, from 2026-10-31, four for code (Geist Mono, JetBrains Mono, Fira Code, IBM Plex Mono), and applies the pick to every docs page. Its How to use tab gives the `--font-*` lines, the `npm install @fontsource/<name>` line and the CSS imports for the weights Bland uses (body 400/500, heading 600, code 400/600). Keep `bland-ui/fonts.css`: it loads Inter and Geist Mono.
- Theme (Godwin 2026-10-27: both ways): `data-theme="light|dark"` on any element wins; without it `prefers-color-scheme` decides. Nested `data-theme` sections work. A theme toggle sets `data-theme` on `<html>` (and removes it to follow the system again); don't add a class or a second set of dark styles.

## Brand and colors

- A project's brand is 13 `--brand-*` steps and 13 `--neutral-*` steps at `:root`, made on the docs site's Brand theme page (copy its CSS): that is the default to suggest. `npm run brand -- generate "#hex"` is fine too when someone prefers it (Godwin 2026-10-31), but it runs only in a clone of the Bland repo: the `bland-ui` npm package has no command, so `npm run brand` inside the project itself fails. Fonts need no tool: write the `--font-*` lines by hand. Never edit Bland's tokens to rebrand.
- The entered color lands unchanged on the step its lightness belongs on; Fix contrast moves the other steps only. Never change a project's brand color to clear a contrast miss; a miss on that color's own step is the project's to keep or answer with another color.
- Up to three extra colors (`--extra name=#hex`), for the project's own UI: charts, illustrations, a section, a tag. Bland's components never read them.
- A new extra's default color is the next one in harmony with the brand (complement, then the square); pass a hex to choose your own.
- **Use roles, not steps.** Brand: Bland's Theme tokens (`--surface-brand`, `--text-brand`, …). Extras: `--name-surface`, `-surface-strong`, `-surface-light`, `-text`, `-icon`, `-border`, which switch in dark mode. Raw steps (`--name-600`) are the same in both modes: only for something meant to look identical in light and dark.
- White text goes on `-surface-strong`, never `-surface` (it lightens in dark).
- **Charts:** series use `--chart-1` … `--chart-8` in order (series 1 = `--chart-1`, the brand), never cycled; past eight, fold into Other or split the chart. They switch in dark mode and hold 3:1 on `--surface-100`; keep a legend, and label series directly when the check warns. Meaning (good/bad) uses danger/success/warning tokens instead. Bland's components never use chart tokens.
- To use a specific color for a chart series, pick it on the Brand theme page (Chart colors) or regenerate with `npm run brand -- generate "#hex" --chart N=#hex` in the Bland repo rather than editing `--chart-N` by hand, so it gets a dark value and the check runs (other series are unchanged); then `check brand.css`.
- **Gray page with white cards:** the page is `--surface-sunken`, the cards `--surface-raised` (hover `--surface-raised-hover`). Not `--surface-200` under `--surface-100`: those mirror, so in dark the page would turn lighter than its cards. A white page keeps `--surface-100`; a recessed area on it (a well, a demo stage) is `--surface-sunken` with a border.
- **Fields and small fills on your own parts:** use `--surface-field` (hover `--surface-field-hover`), not `--surface-200`. It is see-through (black 6% in light, white 6% in dark), so it reads on the page, a card or a modal. A white part of your own (a tag, a toolbar) on the page uses `--surface-raised`, so it lifts in dark instead of turning black.
- To recolor a Bland component in one area, override that component's tokens on a wrapper: `.promo { --button-brand-primary-rest: var(--accent-surface-strong); }`.
- After a hand change to the colors, re-check them: paste the brand color into the Brand theme page, or run `npm run brand -- check brand.css` in the Bland repo; it warns, never blocks.

## Writing project CSS

- Every color, size, space, radius, stroke, shadow, type value, duration and easing is a `var(--…)` token; the Stylelint rule `bland/use-tokens` names the token to use (`docs/lint.md`).
- Components bind only to Theme or scale tokens, never `--brand-*` / `--neutral-*` primitives.
- Type: `font: var(--type-body-md)` plus `letter-spacing: var(--type-body-md-letter-spacing)`.
- Shadows: `box-shadow: var(--elevation-neutral-mid)` (also brand, danger, success, warning).
- Rounded corners: set `--bland-radius` and add `.bland-smooth`.
- Scroll areas: `ScrollArea` or `.bland-scroll-fade`, never a custom mask. Truncated text ends in an ellipsis, never a fade.
- Media queries: `min-width` on the breakpoint values only, mobile first.
- Page layout (optional, `docs/grid.md`): `class="bland-grid"` on the main container gives 4 / 6 / 8 columns per breakpoint whose width stays on the 8 grid, spacing-token gutters, and margins that take what is left (never set a margin as the design: set `--bland-grid-margin`, the minimum, higher for a landing page or lower for a dashboard, inside your own media query); place children with `--span`, `--span-md`, `--span-xl` (a child with none fills the row); `data-inset` for a grid inside a card or beside a Sidebar. Set `row-gap` yourself with a space token. Don't hardcode column counts or a page max width: use `--layout-columns-*` and `--layout-max-width-sm`, `-md`, `-lg`.
- Motion: tokens only, `easing/out` for enter and exit, at most `duration/lg` for UI, reduced-motion fallback, no animation on keyboard actions (`docs/motion.md`).
- Focus: `:focus-visible` ring only (`.bland-focus-ring`).

## Using components

- The component map in `CLAUDE.md` is the prop reference (Figma name → prop); the docs site shows each with live props.
- Phones: Bland's components fit 320px wide; DateRangePicker stacks its fields below 640. Give wide content (Table, code) its own sideways scroll and never let the page scroll sideways; in a CSS grid that means `minmax(0, 1fr)` columns.
- Copy buttons (CodeSnippet, CodeText) work on plain-http pages too (a fallback), so a phone on the LAN can copy.
- Icons: Bland ships none for the project; pass any SVG (Phosphor React recommended). Icon-only controls need `aria-label`.
- Variants are props (`size`, `emotion`, `type`), never class overrides. Defaults: most sizes default to sm or md; check the map.
- Routers: links take `renderLink` (Breadcrumb, TabBar, Sidebar, Pagination, ListItem, Logo).
- Sidebar peek: the minimized rail opens over the page, past its own box, so no ancestor may clip it (`overflow: hidden`) narrower than `--sidebar-width`.
- Sidebar logo: pass `top` as `({ rail }) => rail ? <Mark /> : <Logo />` when the product has a logo mark; a plain `top` hides in the rail and the expand button takes its place.
- Disabled uses the disabled tokens, never opacity.
- Left to right only: right-to-left (RTL) layouts are not supported yet (Godwin 2026-11-03). Don't promise an RTL page with Bland; Toggle and Slider are known not to mirror.
- Deprecated names (`docs/release.md`, "Deprecation"): an old token name, prop or component keeps working for one minor version, with a console warning in development for props and components. When the CHANGELOG or a warning names a replacement, switch to it in the same upgrade; never add new uses of a deprecated name.
- ChatBubble audio: the project owns the `<audio>` element and its playback; the bubble only draws it (`playing`, `onPlayingChange`, `progress`, `duration`). Wire play/pause and progress to the project's own player.

## Open (decide before writing the skill)

- Package name and import paths once published.
- Chart palette (`--chart-1…8`), waiting on Figma.
- Whether the skill ships the lint config and the brand command as part of the package.
