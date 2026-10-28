# Page grid

`.bland-grid` is Bland's page grid in code: the columns, gutters and side margins of the Figma grid styles, switching at the breakpoints, mobile first. It ships in `bland/base.css`. It is **optional**: components fill whatever holds them, so a page can use the grid, plain flex, or both. The docs site's Grid page shows it at each breakpoint and live.

## What it does

| Layout | From | Columns | Gutter | Side margins | Width |
| --- | --- | --- | --- | --- | --- |
| Mobile | 0 | `--layout-columns-mobile` (4) | `--space-sm` (8) | `--layout-margin-mobile` (24) | fills the screen |
| Tablet | `breakpoint/md` 768 | `--layout-columns-tablet` (6) | `--space-lg` (16) | `--layout-margin-mobile` (24) | fills the screen |
| Desktop | `breakpoint/xl` 1280 | `--layout-columns-desktop` (8) | `--space-lg` (16) | `--layout-margin-desktop` (152) | content at most `--layout-max-width` (1136), centred |

Columns are fluid (`minmax(0, 1fr)`): they stretch with the screen. At 375 and 1440, the frames the Figma styles were drawn on, the columns land exactly where Figma's do. In between they stretch, where Figma's Tablet and Desktop styles centre fixed-width columns; fixed widths are a canvas aid, not something code needs (Godwin 2026-10-28). Past 1440 the content stops at 1136 and the margins grow.

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
- `data-inset` keeps the columns and gutters but drops the side margins and the width cap: a grid inside a card, a panel, or the area beside a Sidebar. A nested grid divides its own width.
- `--span`, `--span-md` and `--span-xl` are registered with `inherits: false`, so a nested grid's children never take the span of the cell the grid sits in.

## Tokens

All in Figma's `Spacing` collection, `Layout/` group, emitted to `tokens.css`:

| Token | Value | Figma |
| --- | --- | --- |
| `--layout-columns-mobile` | 4 | bound to the count of `Mobile/sm`, `md`, `lg` |
| `--layout-columns-tablet` | 6 | bound to the count of `Tablet/sm`, `md`, `lg` |
| `--layout-columns-desktop` | 8 | bound to the count of `Desktop/sm` |
| `--layout-max-width` | 1136px | eight 128 columns and seven 16 gutters: a 1440 frame minus `Layout/margin-desktop` each side |
| `--layout-margin-mobile` | 24px | bound to the offset of the Mobile styles |
| `--layout-margin-desktop` | 152px | not bound to a style (Figma's Desktop styles are centred, without a margin) |

Column counts are plain numbers in CSS (`--layout-columns-mobile: 4`), the one kind of FLOAT the token build emits without `px` (`scripts/tokens/core.ts`, any `Layout/columns-*`).

## Not in code

- **Desktop/md (10 columns) and Desktop/lg (14)**, drawn on 1920 and 2560 frames: Figma only. Code keeps 8 columns on every desktop width and caps the content instead (Godwin 2026-10-28).
- **The Dashboard styles** (left/right, tight/basic/loose/wide; columns anchored to one side with a 24 offset): ignored (Godwin 2026-10-28). The area beside a Sidebar uses `.bland-grid` with `data-inset`.
- Figma's fixed Tablet and Desktop column widths (104 to 144): fluid columns instead.

## Figma audit (2026-10-27)

17 column grid styles on the Grid system page (1145:1071). Before 2026-10-28 they bound only their gutters (`space-sm`, `space-lg`, `space-xl`) and the Mobile offset (`Layout/margin-mobile`); counts, column widths and the Dashboard offset were raw. Godwin decided: column counts become tokens, desktop gets a max content width, the Dashboard styles are ignored. The four variables were added in Figma and bound to the Mobile, Tablet and Desktop/sm styles, whose descriptions now point here. The full audit table is in `EXECUTIONS.md`.
