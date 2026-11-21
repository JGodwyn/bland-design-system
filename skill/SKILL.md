---
name: bland-ui
description: How to build and style UI in a project that uses Bland (the bland-ui npm package), a React design system of tokens and components. Use whenever you write or change UI, CSS, colors, fonts, layout, theming or React components in a project that depends on bland-ui, imports from 'bland-ui' or loads bland-ui/tokens.css, even if the request does not name Bland.
---

# Bland (bland-ui {{version}})

Bland is a design system: CSS custom properties (tokens) for every color, size, space, radius, stroke, shadow, type style, duration and easing, light and dark, and React 19 components built only on those tokens. A project rebrands it by overriding the brand and neutral color steps; it never edits Bland's CSS.

This skill matches the installed version. The files beside it:

- `references/setup.md`: install, the stylesheet order, the brand and font override, extra colors, charts, light and dark.
- `references/css.md`: rules for the project's own CSS, which tokens to use for what, the page grid, motion.
- `references/using-components.md`: which component to reach for, and the rules each one has.
- `references/components.md`: every component's import, description and props, generated from the package's TypeScript.
- Every token, with its light and dark value and a description of where to use it: `node_modules/bland-ui/dist/tokens.json` (in code: `import tokens from 'bland-ui/tokens.json' with { type: 'json' }`). Each entry has `css` (the name), `collection`, `type`, `light`, `dark` and `description`. The same descriptions sit as comments in `node_modules/bland-ui/dist/tokens.css`.

## The rule that overrides everything

**No hardcoded values.** In the project's CSS and inline styles, every color, size, space, radius, stroke, shadow, font, duration and easing is a `var(--…)` token: `padding: var(--space-md)`, `color: var(--text-bold)`, `font: var(--type-body-md)`. Never `16px`, `#333`, `bold`, `200ms`. If you can't find a token that fits, search `tokens.json` by description. If none fits, say so and ask; don't invent a value, and don't define a new `--token` that imitates Bland's.

Media queries are the one place `var()` can't work: use `min-width` on Bland's breakpoint values only (640, 768, 1024, 1280, 1536, 1920; `--breakpoint-*` holds them for JavaScript).

## Before writing UI

1. Check the stylesheets are loaded in order (`references/setup.md`): `bland-ui/tokens.css`, `bland-ui/fonts.css`, `bland-ui/base.css`, `bland-ui/styles.css`, then the project's `brand.css`.
2. Reach for a Bland component before building your own (`references/components.md`). Variants are props (`size`, `emotion`, `type`, `status`), never class overrides or restyled internals.
3. For anything the components don't cover, write CSS on tokens (`references/css.md`).

## Tokens you'll use most

| Need | Token |
| --- | --- |
| Page background | `--surface-100` (white page), or `--surface-sunken` (a gray app page) |
| Card, panel or any part sitting on the page | `--surface-raised`, hover `--surface-raised-hover` |
| Area one step apart from whatever it's on (panel in a panel, table stripe) | `--surface-alpha`, hover `--surface-alpha-hover` |
| Fill of your own field or small control | `--surface-field`, hover `--surface-field-hover` |
| Text | `--text-bold` (main), `--text-subtle` (secondary), `--text-minimal` (disabled), `--text-link`, `--text-on-color` (on brand or status fills) |
| Icons | `--icon-bold`, `--icon-subtle`, `--icon-minimal`, `--icon-brand`, `--icon-on-color` |
| Borders | `--border-subtle` (dividers, cards), `--border-bold`, `--border-input` (your own text fields), `--control-border` (your own checkbox-like boxes) |
| Brand and status | `--surface-brand`, `-brand-strong` (carries white text), `-brand-light`; the same for `danger`, `success`, `warning`; `--text-brand`, `--border-brand` |
| Space | `--space-none`, `--space-2xs` 2, `--space-xs` 4, `--space-sm` 8, `--space-md` 12, `--space-lg` 16, `--space-xl` 24 … `--space-9xl` 256 |
| Radius | `--rad-xs` 2, `--rad-sm` 4, `--rad-md` 8, `--rad-lg` 16, `--rad-xl` 24, `--rad-rd` full |
| Stroke | `--stroke-sm` 1 (borders), `--stroke-md` 1.5 (icons), `--stroke-lg` 2 (focus) |
| Type | `font: var(--type-body-md)` + `letter-spacing: var(--type-body-md-letter-spacing)`; styles: display, heading, title, body (`-bold`, `-underline`), code; sizes sm, md, lg |
| Shadow | `box-shadow: var(--elevation-neutral-mid)`; near, mid, far; also brand, danger, success, warning |
| Motion | `--duration-xs` … `--duration-lg` with `--easing-out` |

Exact names and values are in `tokens.json`; when unsure, look there rather than guessing a name.

## Rules that are easy to get wrong

- **Use roles, not steps.** Colors come from role tokens (`--surface-brand`, `--text-subtle`), never the `--brand-*` or `--neutral-*` steps: those exist only for the brand override and look the same in light and dark.
- **Light and dark come for free.** Every role token switches by itself. `data-theme="dark"` or `"light"` on any element sets the theme for it and its children; without it the system preference decides. A theme toggle sets `data-theme` on `<html>`. Never write a second set of dark styles or a `.dark` class.
- **White text** goes on a `-strong` surface (`--surface-brand-strong`), never on `--surface-brand`, which lightens in dark mode.
- **A gray page with white cards** is `--surface-sunken` under `--surface-raised`, not `--surface-200` under `--surface-100` (those mirror in dark, so the page would end up lighter than its cards).
- **See-through tints** (`--surface-alpha`, `--surface-field`) go on one layer only; nested, they add up. Not on brand or status fills.
- **Type** is always a `--type-*` style, never a separate size or weight (there are no `--font-size-*` or `--font-weight-*` tokens). Set its letter-spacing token beside it.
- **Text beside an icon or button** (a feature list, a row with a badge): never `align-items: center` when the text can wrap. Align to the first line: `align-items: flex-start` and move the shorter item down by half the difference to the line height (`references/css.md`, "Rows of text").
- **Rounded corners** on your own parts: `--bland-radius: var(--rad-md)` plus the `bland-smooth` class, not `border-radius`.
- **Focus** is the `bland-focus-ring` class (a 2px ring on `:focus-visible` only). Never remove outlines without it.
- **Disabled** uses the disabled tokens (`--text-minimal`, a component's `-disabled` tokens), never `opacity`.
- **Truncated text** ends in an ellipsis; scrolling areas use `ScrollArea` (it draws the fade and scrollbar), never a hand-made mask.
- **Icons**: Bland ships no icon set. Pass any SVG as a React node (Phosphor React is a good fit); Bland sizes it and colors it with `currentColor`. Icon-only controls need an `aria-label`.
- **Links**: use `Link`, never a styled `<a>`. Router links plug in through `renderLink` (Link, Breadcrumb, TabBar, Sidebar, Pagination, ListItem, Logo).
- **Recolor one component in one area** by overriding its own tokens on a wrapper: `.promo { --button-brand-primary-rest: var(--accent-surface-strong); }`.
- **The brand color.** When the user tells you their brand color, run `npx bland-ui brand "#hex" --fix --out src/brand.css` (the project's brand.css path). When they paste CSS from the Brand theme page, put it in `brand.css` exactly as given. Never write or adjust `--brand-*`, `--neutral-*` or `--chart-*` steps yourself: hand-made steps look close and are wrong. Details and options: `references/setup.md`, "The brand override".
- **Rebranding** happens only in the project's `brand.css`, on `:root`, imported last. Never edit `bland-ui`'s files or copy its CSS.
- **Motion**: tokens only, `--easing-out` for entering and leaving, at most `--duration-lg` for UI, a `prefers-reduced-motion` fallback, nothing animated on keyboard actions.
- **Phones**: Bland's components fit 320px wide. Never let the page scroll sideways; give wide content (a Table, code) its own sideways scroll, and use `minmax(0, 1fr)` columns in CSS grid.
- **Left to right only**: right-to-left layouts aren't supported yet.
- **Deprecated names** keep working for one minor version, with a development warning for props. Switch to the named replacement; never add new uses of a deprecated name. The package's `CHANGELOG.md` says what changed in each version and what to change.

## Docs

Every token and component, with live controls in both themes: https://blandui.com/docs/. The Brand theme page (https://blandui.com/docs/#/brand) makes a project's `brand.css` from one color, the same as `npx bland-ui brand`.
