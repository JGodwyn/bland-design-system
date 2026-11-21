# Writing the project's own CSS with Bland

## Every value is a token

Every color, size, space, radius, stroke, shadow, type value, duration and easing is a `var(--…)` token. To find one, search `node_modules/bland-ui/dist/tokens.json`: each entry has `css` (the name), `collection`, `type`, `light` and `dark` values and a `description` saying where to use it. Example: search descriptions for "divider", "card" or "disabled".

If nothing fits, say so and ask; don't invent a value or a look-alike token. Components bind only to role and scale tokens, never to the `--brand-*` / `--neutral-*` steps.

## Type

```css
.title {
  font: var(--type-title-md);
  letter-spacing: var(--type-title-md-letter-spacing);
}
```

Styles: display, heading, title, body (plus `-bold` and `-underline`), code, in sm, md and lg where they exist. The `font` shorthand can't carry letter spacing, so always set it beside. `-underline` styles also need `text-decoration: underline`. There are no size, weight or line-height tokens: pick the style. `--type-*-line-height` exists when a part needs the line height alone (to align an icon with the first line of text).

## Surfaces

| Situation | Tokens |
| --- | --- |
| White page | `--surface-100` |
| Gray app page with white cards | page `--surface-sunken`, cards `--surface-raised` (hover `--surface-raised-hover`) |
| A white part of your own (a tag, a toolbar) on the page | `--surface-raised`, so it lifts in dark instead of turning black |
| A recessed area on a white page (a well, a demo stage) | `--surface-sunken` with a `--border-subtle` border |
| An area one step apart from what it sits on (a panel in a panel, a table stripe, inline code) | `--surface-alpha`, hover `--surface-alpha-hover` |
| The fill of your own field or small control | `--surface-field`, hover `--surface-field-hover` |
| Brand or status fill with white text | `--surface-brand-strong` (or `-danger-strong`, …) with `--text-on-color` |

`--surface-200`, `-300` … mirror in dark mode. Don't stack them as page and card.

## Borders

- Dividers and card edges: `--border-subtle`, `--stroke-sm`.
- Your own text field: `--border-input` (soft; the label and fill also mark the field).
- Your own checkbox-like box, or anything whose outline is the whole control: `--control-border` (keeps 3:1 against the page).
- Focus: the `bland-focus-ring` class, never a hand-made outline.

## Rows of text beside icons or buttons (first-line alignment)

A row of text beside an icon, a check mark, a button or a badge is centred on them while the text is one line, and stays at the top, lined up with the first line, once it wraps. So never `align-items: center` on a row whose text can wrap. Use `align-items: flex-start` and move the shorter item down by half the difference between the line height and its own height:

```css
.feature {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font: var(--type-body-md);
  letter-spacing: var(--type-body-md-letter-spacing);
}

.feature__icon {
  margin-block-start: calc((var(--type-body-md-line-height) - var(--icon-sm)) / 2);
}
```

When the item is taller than the line (a 32px button beside body text), move the text down instead. `align-items: center` is fine only where the text can never wrap (one-word labels, `white-space: nowrap`).

## Shape and depth

- Rounded corners: `--bland-radius: var(--rad-md);` and the `bland-smooth` class (it draws Figma's corner smoothing where the browser can). Full-round parts use `--rad-rd` without `bland-smooth`.
- Shadows: `box-shadow: var(--elevation-neutral-near | -mid | -far)`, or the brand, danger, success and warning versions. Parts that sit in the page flow get none.

## Layout

- Mobile first: base styles are the phone layout, `min-width: 768px` is tablet, `min-width: 1280px` desktop. Media queries use `min-width` on Bland's breakpoint values only: 640, 768, 1024, 1280, 1536, 1920.
- Optional page grid: `class="bland-grid"` on the main container gives 4, 6 and 8 columns per breakpoint with token gutters and margins that take what is left. Place children with `--span`, `--span-md`, `--span-xl` (a child without one fills the row); `data-inset` for a grid nested in a card or beside a Sidebar. Raise or lower the minimum margin with `--bland-grid-margin` inside your own media query, never by setting a margin. Set `row-gap` yourself with a space token. Use `--layout-columns-*` and `--layout-max-width-sm` / `-md` / `-lg` rather than hardcoding a column count or page width.
- Never let the page scroll sideways. In CSS grid, use `minmax(0, 1fr)` columns so wide content can't push the page.

## Motion

- Durations and easings are tokens. Entering and leaving use `--easing-out`; never `ease-in` on UI.
- UI motion stays at or under `--duration-lg` (250ms). Sheets and sidebars use `--duration-2xl` with `--easing-drawer`.
- Every animation has a `prefers-reduced-motion: reduce` fallback that keeps opacity and color and drops movement.
- Gate hover motion behind `@media (hover: hover) and (pointer: fine)`. Name the properties you transition, never `transition: all`.
- Don't animate what the keyboard does, or anything used hundreds of times a day. Press feedback is `scale(0.97)` on `:active` over `--duration-sm`.
- Never scale from 0: start at 0.95 to 0.97 with opacity 0.

## Overflow

- A scrolling area is a `ScrollArea` component (or the `bland-scroll-fade` class): it draws the edge fade and the scrollbar Bland uses. Never write your own mask.
- Truncated text ends in an ellipsis (`text-overflow: ellipsis`), never a fade.

## States

Hover inside `@media (hover: hover) and (pointer: fine)`, pressed on `:active`, focus with `bland-focus-ring`, disabled with the disabled tokens. Never `opacity` for disabled.
