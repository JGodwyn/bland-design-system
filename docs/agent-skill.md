# Agent skill notes

Raw material for the skill we package at the end of the project: what an agent needs to know to build a project's UI with Bland. Add to it the moment something is settled that a project's agent (not an agent working on Bland itself) must follow. Short rules, each with where the detail lives. The skill is written from this file; this file is not the skill.

## Setup in a project

- Install the package (not published yet: see the roadmap), import `bland/tokens.css`, then the project's `brand.css`, then the components' CSS. Order matters: the override comes after Bland's tokens (`docs/brand.md`).
- Fonts: Inter and Geist Mono ship self-hosted in `src/styles/fonts.css`; base reset and helpers in `base.css`.
- Theme: `data-theme="light|dark"` on any element wins; without it `prefers-color-scheme` decides. Nested `data-theme` sections work.

## Brand and colors

- A project's brand is 13 `--brand-*` steps and 13 `--neutral-*` steps at `:root`, made by `npm run brand -- generate "#hex"` or the docs site's Brand theme page. Never edit Bland's tokens to rebrand.
- The entered color lands unchanged on the step its lightness belongs on; Fix contrast moves the other steps only.
- Up to three extra colors (`--extra name=#hex`), for the project's own UI: charts, illustrations, a section, a tag. Bland's components never read them.
- **Use roles, not steps.** Brand: Bland's Theme tokens (`--surface-brand`, `--text-brand`, …). Extras: `--name-surface`, `-surface-strong`, `-surface-light`, `-text`, `-icon`, `-border`, which switch in dark mode. Raw steps (`--name-600`) are the same in both modes: only for something meant to look identical in light and dark.
- White text goes on `-surface-strong`, never `-surface` (it lightens in dark).
- To recolor a Bland component in one area, override that component's tokens on a wrapper: `.promo { --button-brand-primary-rest: var(--accent-surface-strong); }`.
- Run `npm run brand -- check brand.css` after any hand change; it warns, never blocks.

## Writing project CSS

- Every color, size, space, radius, stroke, shadow, type value, duration and easing is a `var(--…)` token; the Stylelint rule `bland/use-tokens` names the token to use (`docs/lint.md`).
- Components bind only to Theme or scale tokens, never `--brand-*` / `--neutral-*` primitives.
- Type: `font: var(--type-body-md)` plus `letter-spacing: var(--type-body-md-letter-spacing)`.
- Shadows: `box-shadow: var(--elevation-neutral-mid)` (also brand, danger, success, warning).
- Rounded corners: set `--bland-radius` and add `.bland-smooth`.
- Scroll areas: `ScrollArea` or `.bland-scroll-fade`, never a custom mask. Truncated text ends in an ellipsis, never a fade.
- Media queries: `min-width` on the breakpoint values only, mobile first.
- Motion: tokens only, `easing/out` for enter and exit, at most `duration/lg` for UI, reduced-motion fallback, no animation on keyboard actions (`docs/motion.md`).
- Focus: `:focus-visible` ring only (`.bland-focus-ring`).

## Using components

- The component map in `CLAUDE.md` is the prop reference (Figma name → prop); the docs site shows each with live props.
- Icons: Bland ships none for the project; pass any SVG (Phosphor React recommended). Icon-only controls need `aria-label`.
- Variants are props (`size`, `emotion`, `type`), never class overrides. Defaults: most sizes default to sm or md; check the map.
- Routers: links take `renderLink` (Breadcrumb, TabBar, Sidebar, Pagination, ListItem, Logo).
- Disabled uses the disabled tokens, never opacity.

## Open (decide before writing the skill)

- Package name and import paths once published.
- Chart palette (`--chart-1…8`), waiting on Figma.
- Whether the skill ships the lint config and the brand command as part of the package.
