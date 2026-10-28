# Page grid

`.bland-grid` is Bland's page grid in code: the columns, gutters and side margins of the Figma grid styles, switching at the breakpoints, mobile first. It ships in `bland/base.css`. It is **optional**: components fill whatever holds them, so a page can use the grid, plain flex, or both. The docs site's Grid page shows it at each breakpoint and live.

## What it does

Godwin's rule (2026-10-28): **the column width and the gutter set the design; the margins are what is left.** Column widths stay on the 8 grid (multiples of `space-sm`), gutters are spacing tokens, and the margins come out of the count and the column width. They are not tokens; Godwin likes them roomy (on mobile 16 tight to 32 loose, usually 20 to 24).

Each layout sets a column count, a gutter and a **minimum margin**. The columns take the widest multiple of 8 that fits inside the minimum margins, and whatever is left is split between the two sides (`justify-content: center`).

| Layout | From | Columns | Gutter | Minimum margin | Column width cap |
| --- | --- | --- | --- | --- | --- |
| Mobile | 0 | `--layout-columns-mobile` (4) | `--space-sm` (8) | `--space-lg` (16) | none |
| Tablet | `breakpoint/md` 768 | `--layout-columns-tablet` (6) | `--space-lg` (16) | `--space-2xl` (32) | none |
| Desktop | `breakpoint/xl` 1280 | `--layout-columns-desktop` (8) | `--space-lg` (16) | `--space-6xl` (64) | 128: content at most `--layout-max-width` (1136) |

What that gives, and the Figma frame it matches:

| Screen | Columns | Margins | Figma |
| --- | --- | --- | --- |
| 360 / 375 / 390 / 412 / 430 | 72 / 72 / 80 / 88 / 88 | 24 / 31.5 / 23 / 18 / 27 | Mobile styles stretch their columns with a 24 margin; code keeps the column on the 8 grid instead |
| 768 | 104 | 32 | Tablet/sm, exact |
| 912 | 128 | 32 | Tablet/md, exact |
| 1024 | 144 | 40 | Tablet/lg, exact |
| 1280 / 1440 / 1536 | 128 | 72 / 152 / 200 | Desktop/sm, exact |
| 1920 | 128 | 392 | Desktop/md (10 x 136) is Figma only |

The four mobile margins land between 16 and 32 because four columns can each round down by at most 7. The minimum margins are Bland's choice (Claude 2026-10-28, from Godwin's ranges); they make the Figma tablet and desktop frames come out exactly.

The column count is not tied to 8: any count works (`--bland-grid-columns: 5`); Godwin prefers even ones.

The grid sets column gaps only. Rows are the page's: set `row-gap` with a space token.

## Using it

```html
<main class="bland-grid">
  <header>Full row: no span</header>
  <aside style="--span-md: 2; --span-xl: 2">Filters</aside>
  <section style="--span-md: 4; --span-xl: 6">Results</section>
</main>
```

- A child spans `--span` columns; `--span-md` from tablet and `--span-xl` from desktop, each falling back to the one before (`--span-xl` → `--span-md` → `--span`).
- With no span a child fills the row, so content stacks on mobile without any span.
- A span larger than the grid is cut to the grid (`--span: 6` is 4 on mobile).
- Spans are custom properties, not classes, because media queries can't read `var()` but declarations inside them can: one stylesheet covers every combination. Set them inline, or in the project's own classes (`.results-filters { --span-md: 2; }`).
- In React: `style={{ '--span-md': 2 } as React.CSSProperties}` or a class.
- `--bland-grid-margin` is the minimum margin. Desktop sizes are hard to call (Godwin): a landing page raises it (`--layout-margin-desktop`, 152), a dense dashboard lowers it (`--space-xl`). Set it on your own class inside the matching `@media (min-width: …)`, since the grid sets its own per breakpoint. `--bland-grid-columns` and `--bland-grid-gutter` can be overridden the same way.
- `data-inset` sets the minimum margin to none and drops the width cap: a grid inside a card, a panel, or the area beside a Sidebar (this docs site's pages have no margin). A nested grid divides its own width; its columns still snap to 8 and centre.
- `--span`, `--span-md` and `--span-xl` are registered with `inherits: false`, so a nested grid's children never take the span of the cell the grid sits in.

## Tokens

All in Figma's `Spacing` collection, `Layout/` group, emitted to `tokens.css`:

| Token | Value | Figma |
| --- | --- | --- |
| `--layout-columns-mobile` | 4 | bound to the count of `Mobile/sm`, `md`, `lg` |
| `--layout-columns-tablet` | 6 | bound to the count of `Tablet/sm`, `md`, `lg` |
| `--layout-columns-desktop` | 8 | bound to the count of `Desktop/sm` |
| `--layout-max-width` | 1136px | eight 128 columns and seven 16 gutters: a 1440 frame minus `Layout/margin-desktop` each side |
| `--layout-margin-mobile` | 24px | bound to the offset of the Mobile styles; not used by `.bland-grid` (code derives the margin) |
| `--layout-margin-desktop` | 152px | not bound to a style; what a 1440 frame gets, and a landing page's minimum margin |

Column counts are plain numbers in CSS (`--layout-columns-mobile: 4`), the one kind of FLOAT the token build emits without `px` (`scripts/tokens/core.ts`, any `Layout/columns-*`).

## Not in code

- **Desktop/md (10 columns) and Desktop/lg (14)**, drawn on 1920 and 2560 frames: Figma only. Code keeps 8 columns on every desktop width and caps the content instead (Godwin 2026-10-28).
- **The Dashboard styles** (left/right, tight/basic/loose/wide; columns anchored to one side with a 24 offset): ignored (Godwin 2026-10-28). The area beside a Sidebar uses `.bland-grid` with `data-inset`.
- Figma's per-frame column widths are not tokens: code works them out from the screen width by the same rule, so 104, 128 and 144 come out at 768, 912 and 1024 without a variable each.

## Figma audit (2026-10-27)

17 column grid styles on the Grid system page (1145:1071). Before 2026-10-28 they bound only their gutters (`space-sm`, `space-lg`, `space-xl`) and the Mobile offset (`Layout/margin-mobile`); counts, column widths and the Dashboard offset were raw. Godwin decided: column counts become tokens, desktop gets a max content width, the Dashboard styles are ignored. The four variables were added in Figma and bound to the Mobile, Tablet and Desktop/sm styles, whose descriptions now point here. The full audit table is in `EXECUTIONS.md`.
