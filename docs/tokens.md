# Tokens

Figma owns every token value. The repo holds a verified copy of the Figma variables and generates CSS from it. Never edit generated files by hand.

## Files

| Path | What | Edited by |
| --- | --- | --- |
| `tokens/figma/raw/NN.json` | Raw export from Figma, compact format, in chunks | The sync (copied from `use_figma` output) |
| `tokens/tokens.json` | Resolved tokens: CSS name, Light and Dark values, alias source, description | `npm run tokens` |
| `src/tokens/tokens.css` | CSS custom properties, shipped as `bland/tokens.css` | `npm run tokens` |
| `scripts/figma/dump-tokens.js` | Plugin API script that produces the raw chunks | By hand |
| `scripts/figma/checksum.js`, `checksum.ts` | Same hash computed in Figma and locally | By hand |
| `scripts/build-tokens.ts` | Raw chunks to `tokens.json` and `tokens.css` | By hand |

## Syncing from Figma

The variables are local and unpublished, and the REST variables endpoint needs an Enterprise plan, so the export runs as a Plugin API script through the Figma MCP `use_figma` tool (file key `32J76yQH71a7sENjf60RqD`).

1. Run `scripts/figma/dump-tokens.js` through `use_figma` with `CHUNK = 0`. The result reports `of`, the number of chunks.
2. Run it again for each `CHUNK` from 1 to `of - 1` (these calls can run in parallel).
3. Replace `tokens/figma/raw/` with the results, one file per chunk: `00.json`, `01.json`, and so on.
4. Run `scripts/figma/checksum.js` through `use_figma` and `npm run tokens:checksum` locally. The `count` and `hash` must match. If they don't, a chunk was saved wrong; re-export it.
5. Run `npm run tokens`. It fails on unknown aliases, alias cycles, unbound style fields, unknown font weights and CSS name collisions.
6. Commit the raw chunks, `tokens/tokens.json` and `src/tokens/tokens.css` together. The `tokens.json` diff is the readable record of what changed.

Why chunks: `use_figma` caps a return value at 20 KB, the full export is about 200 KB, and the plugin sandbox has no `fetch`, so it cannot write anywhere else.

## What the build does

- **Primitives are not emitted.** `_Core Colors`, `_Functional Colors` and `_Units` are hidden collections. Every exported token resolves through them to a final value.
- **Alias chains resolve to values**, per mode. `tokens.json` keeps the first alias hop (`aliasOf`) so you can see which primitive a token points at.
- **Alpha primitives** (`{color: alias, opacity: N}`) resolve to the source color at exactly N%, written as `rgb(r g b / N%)`.
- **`Fade/*-clear` is skipped** (Figma-only drawing aids). The build lists them under `skipped` in `tokens.json`.
- **Elevation styles** become one `box-shadow` value each, ambient layer first, then key. The colors come from `Shadow/*` Theme tokens, so each elevation token is redefined in Dark.
- **Text styles** become a `font` shorthand value each (`weight size/line-height family`). The `-underline` styles also need `text-decoration: underline`; their description says so.
- **Font weights** map from Figma style names to numbers: Regular 400, Medium 500, Semi Bold / SemiBold 600.
- **Font families** get fallback stacks: Inter falls back to `system-ui, sans-serif`, Geist Mono to `ui-monospace, monospace`.
- All dimensions are in `px`.
- **Durations** (Figma `TIMING`, stored in seconds as float32, so 0.16 arrives as 0.1599999964) become whole milliseconds: `--duration-sm: 160ms`.
- **Easings** (Figma `EASING`) become `cubic-bezier()` with coordinates rounded to 3 decimals, and `LINEAR` becomes `linear`. Any other easing type fails the build.
- **Breakpoints** are emitted as `--breakpoint-*` for JS (`matchMedia`, Floating UI). CSS media queries cannot read `var()`, so `bland/use-tokens` reads the values from `tokens.json` and allows only those in `@media` (see `lint.md`).
- **Text styles bind letter spacing** to `letter-spacing/normal` (0). The `font` shorthand cannot carry it, and 0 is the default, so the `--type-*` composites leave it out.

## CSS names

| Figma | CSS | Rule |
| --- | --- | --- |
| `Surface/surface-100` | `--surface-100` | Group dropped when the token name already starts with it |
| `Button/brand-primary-rest` | `--button-brand-primary-rest` | Otherwise the path joins with `-` |
| `Date/Calendar-item/surface-hover` | `--date-calendar-item-surface-hover` | Lowercased, any depth |
| `space-md`, `rad-md`, `stroke-md` | `--space-md`, `--rad-md`, `--stroke-md` | Scale tokens keep their names |
| `control/sm`, `icon/md` | `--control-sm`, `--icon-md` | Sizing |
| `family/sans`, `weight/medium`, `size/md` | `--font-family-sans`, `--font-weight-medium`, `--font-size-md` | Typography gets a `font-` prefix |
| `line-height/md` | `--line-height-md` | |
| `elevation/mid/key-y` | `--elevation-mid-key-y` | Effects geometry |
| `Elevation/neutral/mid` (style) | `--elevation-neutral-mid` | Full `box-shadow` |
| `Body/body-md` (style) | `--type-body-md` | Use as `font: var(--type-body-md)` |
| `Code/body-md` (style) | `--type-code-body-md` | |
| `letter-spacing/normal` | `--letter-spacing-normal` | Typography, like `line-height` |
| `duration/md` | `--duration-md` | Motion |
| `easing/in-out` | `--easing-in-out` | Motion |
| `breakpoint/md` | `--breakpoint-md` | Breakpoints |

Prefer the composite tokens in components: `font: var(--type-body-md)` and `box-shadow: var(--elevation-neutral-mid)`. Reach for the parts (`--font-size-md`, `--elevation-mid-key-y`) only when a component needs one property alone.

## Light and dark

Light values sit on `:root` (and `[data-theme="light"]`). Dark redefines only the Theme tokens and the elevation shadows, and applies when:

- an ancestor has `data-theme="dark"`, or
- the system prefers dark and no ancestor has `data-theme="light"`.

This supports both an explicit switch and the system preference. Which one the products use is still an open question (see `CLAUDE.md`), and the selectors may change once it's answered.

## Collections

Twelve collections; the table in `CLAUDE.md` lists what each holds. Emitted: `Theme` (Light and Dark), `Spacing`, `Corner Radius`, `Stroke`, `Typography`, `Effects`, `Sizing`, `Motion`, `Breakpoints`, plus the elevation and text styles. Hidden and never emitted: `_Core Colors`, `_Functional Colors`, `_Units`.

## Sync of 2026-10-17

- Added `Motion` (11: six durations, five easings) and `Breakpoints` (5), and `letter-spacing/normal` in Typography. 611 variables, 516 tokens emitted.
- Chunks 01 to 05 were byte-identical to the previous export (checked by per-chunk hash in Figma), so only `00.json` and `06.json` changed. Full checksum: count 611, hash `b0959f0e`, equal in Figma and locally.

## Notes from the first export (2026-10-16)

- 594 variables (the handoff said 584), 15 elevation styles, 23 text styles. 499 tokens emitted.
- The raw descriptions of the `Purple/*` primitives contain an HTML entity (`&#39;`). The build decodes it. Fix it at the source in Figma when convenient.
