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
| `scripts/build-tokens.ts`, `scripts/tokens/core.ts` | Raw chunks to `tokens.json` and `tokens.css` (the logic lives in `core.ts`) | By hand |
| `scripts/drift.ts`, `scripts/tokens/drift.ts`, `scripts/figma/drift-check.js` | The drift check (below) | By hand |
| `tokens/figma/drift/` | The drift check's working files: `check.js`, `result-N.json`, `report.md`. Not committed | `npm run tokens:drift` |

## Syncing from Figma

The variables are local and unpublished, and the REST variables endpoint needs an Enterprise plan, so the export runs as a Plugin API script through the Figma MCP `use_figma` tool (file key `32J76yQH71a7sENjf60RqD`).

1. Run `scripts/figma/dump-tokens.js` through `use_figma` with `CHUNK = 0`. The result reports `of`, the number of chunks.
2. Run it again for each `CHUNK` from 1 to `of - 1` (these calls can run in parallel).
3. Replace `tokens/figma/raw/` with the results, one file per chunk: `00.json`, `01.json`, and so on.
4. Run `scripts/figma/checksum.js` through `use_figma` and `npm run tokens:checksum` locally. The `count` and `hash` must match. If they don't, a chunk was saved wrong; re-export it.
5. Run `npm run tokens`. It fails on unknown aliases, alias cycles, unbound style fields, unknown font weights and CSS name collisions.
6. Commit the raw chunks, `tokens/tokens.json` and `src/tokens/tokens.css` together. The `tokens.json` diff is the readable record of what changed.

Why chunks: `use_figma` caps a return value at 20 KB, the full export is about 200 KB, and the plugin sandbox has no `fetch`, so it cannot write anywhere else.

## Drift check

Answers "does the repo still match Figma?", variable by variable, and shows which CSS tokens a Figma change would move. Use it before a sync to see what changed, or on its own to confirm nothing has.

The work is split so almost nothing has to be copied out of Figma: the repo sends its hashes in, and Figma sends back only what differs.

1. `npm run tokens:drift`. With no Figma result saved, it writes `tokens/figma/drift/check.js`: `scripts/figma/drift-check.js` with a hash of every variable in `tokens/figma/raw` filled in (about 17 KB, under `use_figma`'s 50 KB code limit). Exit code 2.
2. Run `check.js` through `use_figma` (read-only). Figma hashes its own variables the same way and returns only the records that differ, the ids that are gone, and the collections and styles if those changed. Save the result as `tokens/figma/drift/result-0.json`. If it reports `of` above 1, run it again with `CHUNK = 1`, … and save `result-1.json`, ….
3. `npm run tokens:drift` again.
   - **No drift:** "No drift: all 612 variables, the collections and the styles match Figma." Exit code 0.
   - **Drift:** a report in the terminal and in `tokens/figma/drift/report.md`, exit code 1. It has two tables. **Variables** lists each added, removed or changed variable with the field that changed (name, collection, type, description, or the value per mode, with aliases shown by name). **CSS tokens affected** lists every generated token whose value or description would change, including the ones that change only through an alias: recoloring `Brand/Brand600` lists `--button-brand-primary-rest` in both modes, `--surface-brand` in light only, and the brand shadows. If the Figma version would not build (a deleted variable that others alias), the report says so first.
4. To take the Figma version: `npm run tokens:drift -- --apply` writes it into `tokens/figma/raw` (re-chunked) without a full export. Then run `npm run tokens`, and confirm `npm run tokens:checksum` equals `scripts/figma/checksum.js` in Figma before committing, as in a normal sync.

A result saved against an older `tokens/figma/raw` is ignored and a fresh `check.js` is written, so a stale check can't report the wrong thing. `npm run test:drift` simulates drift on a copy of the real export (a recolor, a reworded description, an added and a removed variable, a broken alias) and checks the report.

Not set up yet: running the check on a schedule. It needs the Figma MCP, so it would run as a scheduled Claude task rather than a plain cron job.

## What the build does

- **Primitives are not emitted, except the brand scale.** `_Core Colors`, `_Functional Colors`, `_Units` and `_Typography` are hidden collections. The 13 `Brand/BrandN` steps are emitted as `--brand-N` in a `:root` block of their own, and every token whose alias chain ends in one holds `var(--brand-N)` (alpha steps a `color-mix`), so a project's override cascades (`brand.md`). Every exported token resolves through them to a final value.
- **Alias chains resolve to values**, per mode. `tokens.json` keeps the first alias hop (`aliasOf`) so you can see which primitive a token points at.
- **Alpha primitives** (`{color: alias, opacity: N}`) resolve to the source color at exactly N%, written as `rgb(r g b / N%)`.
- **`Fade/*-clear` is skipped** (Figma-only drawing aids). The build lists them under `skipped` in `tokens.json`.
- **Elevation styles** become one `box-shadow` value each, ambient layer first, then key. The colors come from `Shadow/*` Theme tokens, so each elevation token is redefined in Dark.
- **Text styles** become a `font` shorthand value each (`weight size/line-height family`), plus `--type-<style>-line-height` and `--type-<style>-letter-spacing` (the shorthand can't carry letter spacing, so components set it beside the `font`). The `-underline` styles also need `text-decoration: underline`; their description says so.
- **Font weights** map from Figma style names to numbers: Regular 400, Medium 500, Semi Bold / SemiBold 600.
- **Font families** get fallback stacks: Inter falls back to `system-ui, sans-serif`, Geist Mono to `ui-monospace, monospace`.
- All dimensions are in `px`. Column counts (`Layout/columns-*`) are plain numbers.
- **Durations** (Figma `TIMING`, stored in seconds as float32, so 0.16 arrives as 0.1599999964) become whole milliseconds: `--duration-sm: 160ms`.
- **Easings** (Figma `EASING`) become `cubic-bezier()` with coordinates rounded to 3 decimals, and `LINEAR` becomes `linear`. Any other easing type fails the build.
- **Breakpoints** are emitted as `--breakpoint-*` for JS (`matchMedia`, Floating UI). CSS media queries cannot read `var()`, so `bland/use-tokens` reads the values from `tokens.json` and allows only those in `@media` (see `lint.md`).

## CSS names

| Figma | CSS | Rule |
| --- | --- | --- |
| `Surface/surface-100` | `--surface-100` | Group dropped when the token name already starts with it |
| `Button/brand-primary-rest` | `--button-brand-primary-rest` | Otherwise the path joins with `-` |
| `Date/Calendar-item/surface-hover` | `--date-calendar-item-surface-hover` | Lowercased, any depth |
| `space-md`, `rad-md`, `stroke-md` | `--space-md`, `--rad-md`, `--stroke-md` | Scale tokens keep their names |
| `control/sm`, `icon/md` | `--control-sm`, `--icon-md` | Sizing |
| `elevation/mid/key-y` | `--elevation-mid-key-y` | Effects geometry |
| `Elevation/neutral/mid` (style) | `--elevation-neutral-mid` | Full `box-shadow` |
| `Body/body-md` (style) | `--type-body-md` | Use as `font: var(--type-body-md)` |
| `Code/body-md` (style) | `--type-code-body-md` | |
| `Body/body-md` line height, letter spacing | `--type-body-md-line-height`, `--type-body-md-letter-spacing` | From the style's bindings |
| `duration/md` | `--duration-md` | Motion |
| `easing/in-out` | `--easing-in-out` | Motion |
| `breakpoint/md` | `--breakpoint-md` | Breakpoints |
| `Layout/columns-mobile` | `--layout-columns-mobile` | Page grid (`grid.md`), unitless |

Prefer the composite tokens in components: `font: var(--type-body-md)` and `box-shadow: var(--elevation-neutral-mid)`. Reach for the parts (`--type-body-md-line-height`, `--elevation-mid-key-y`) only when a component needs one property alone. Families, weights and sizes have no tokens of their own: pick the text style.

## Light and dark

Light values sit on `:root` (and `[data-theme="light"]`). Dark redefines only the Theme tokens and the elevation shadows, and applies when:

- an ancestor has `data-theme="dark"`, or
- the system prefers dark and no ancestor has `data-theme="light"`.

This supports both an explicit switch and the system preference. Which one the products use is still an open question (see `CLAUDE.md`), and the selectors may change once it's answered.

## Collections

Twelve collections; the table in `CLAUDE.md` lists what each holds. Emitted: `Theme` (Light and Dark), `Spacing`, `Corner Radius`, `Stroke`, `Effects`, `Sizing`, `Motion`, `Breakpoints`, plus the elevation and text styles. Hidden and never emitted: `_Core Colors`, `_Functional Colors`, `_Units`, `_Typography`.

## Sync of 2026-10-25 (`_Typography` hidden)

Godwin hid the Typography collection from publishing (renamed `_Typography`) so files using the library show only text styles. Kept, as the standard setup. The variables were already in sync (628, `a4d83579`, equal in Figma and the repo); only `00.json`'s collection record changed, checked by hashing the meta in Figma and locally (`94b32fe7`). The build drops the 28 `--font-*`, `--line-height-*` and `--letter-spacing-normal` tokens and adds a line height and letter spacing per text style (46); the `--type-*` composites are unchanged. 550 tokens emitted. Components moved onto the per-style tokens in the same commit.

## Sync of 2026-10-20 (Sidebar delays)

Two Motion variables added in Figma for the Sidebar's hover intent, through the drift check (`--apply`): `duration/sidebar-peek-delay` (200ms, how long the pointer rests on the rail before it opens) and `duration/sidebar-peek-close-delay` (300ms, how long it lingers after the pointer leaves). Delays, not animations, like Tooltip's. The check also reported the Typography collection's rename to `_Typography`; only the variable records were taken (`metaChanged` false), as before. Checksum 626 variables, `679912ec`, equal in Figma and the repo.

## Sync of 2026-10-19 (Tooltip)

- Added `duration/tooltip-delay` (500ms) and `duration/tooltip-close-delay` (100ms) in Motion and `tooltip/offset` (Sizing, alias of `unit/4`) for the Tooltip. Synced through the drift check (three added variables) and `--apply`; only `00.json` and `06.json` changed. Checksum: count 616, hash `e8f5443`, equal in Figma and locally. 521 tokens emitted.
- Not synced: the same check reported Figma's `Typography` collection renamed to `_Typography` and hidden. The build skips hidden collections, so taking it would drop every `--font-*`, `--line-height-*` and `--letter-spacing-normal` token. Left for Godwin; the repo keeps `Typography` (the checksum covers variables only, so it still matches).

## Sync of 2026-10-18

- Added `duration/toast-visible` (Motion, 5s) for the Toaster. Synced through the drift check (one added variable) and `--apply`; only `00.json` and `06.json` changed. Checksum: count 613, hash `5e42e07e`, equal in Figma and locally. 518 tokens emitted.

## Sync of 2026-10-17

- Added `Motion` (11: six durations, five easings) and `Breakpoints` (5), and `letter-spacing/normal` in Typography. 611 variables, 516 tokens emitted.
- Chunks 01 to 05 were byte-identical to the previous export (checked by per-chunk hash in Figma), so only `00.json` and `06.json` changed. Full checksum: count 611, hash `b0959f0e`, equal in Figma and locally.

## Notes from the first export (2026-10-16)

- 594 variables (the handoff said 584), 15 elevation styles, 23 text styles. 499 tokens emitted.
- The raw descriptions of the `Purple/*` primitives contain an HTML entity (`&#39;`). The build decodes it. Fix it at the source in Figma when convenient.

## Sync of 2026-10-28 (page grid)

Four Spacing variables added in Figma for the page grid (`docs/grid.md`): `Layout/columns-mobile` 4, `Layout/columns-tablet` 6, `Layout/columns-desktop` 8 and `Layout/max-width` 1136. Synced through the drift check (4 added) and `--apply`; checksum 635 variables, `e33ab92a`, equal in Figma and the repo. The column counts are the first unitless FLOATs: the build emits `Layout/columns-*` as plain numbers (`--layout-columns-mobile: 4`). 583 tokens emitted.

## Sync of 2026-10-28 (Desktop md and lg grids)

`breakpoint/3xl` 1920 and `Layout/max-width-md` 1264 / `-lg` 1392 added; `Layout/max-width` renamed `Layout/max-width-sm` (so `--layout-max-width` became `--layout-max-width-sm`; nothing outside the grid used it); `breakpoint/2xl`'s description now names the grid. Through the drift check (3 added, 2 changed) and `--apply`; checksum 638 variables, `4a186ff6`, equal in Figma and the repo. 586 tokens emitted.
