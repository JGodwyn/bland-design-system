# Working in the Figma file

How the Figma file is kept, for anyone (Godwin or an agent) editing it through the Figma MCP. Code rules live in `CLAUDE.md` and the other `docs/`; this page is the Figma side. Merged from the two claude.ai handoff files of 2026-10-16 (`docs/archive/bland-handoff.md` and `docs/archive/handoff-update-2026-10-16.md`); where they disagree with this page or the repo, the repo wins.

## File rules

- **Doc pages show what the file has** (Godwin 2026-10-16). When a token, style or component is renamed, added or removed, update the doc page that lists it in the same pass. The Spacing page tables (Units, Spacing, Corner radius, Stroke) and the Colors page cards are static text and swatches built from the variables: rebuild their rows when a token changes. Typography's `Typo card`s use the real text style on their name text.
- **Deleting a variable** (Godwin 2026-10-16): keep every primitive, every spacing and radius step, and anything that may be used later. Delete a variable only when another one already does its job. A token no component uses yet keeps the description "Reserved; not used by any component yet".
- **Every variable has a description**, written from rules: primitives point to the Theme tokens that use them, scale steps state their value, component tokens name the component, variant and state, semantic tokens say where to use them. No em dashes.
- **Stickersheets are components:** edit the stickersheet's main, not a copy on the page.
- **No manual slots:** every slot is a native `🧩` slot.
- **Doc chrome stays on primitives:** the Annotations helpers (Header, Footer, Typo card) bind their colors to primitives on purpose; they are not part of the kit.
- **Destructive file-wide writes** go through Godwin as a lettered list he approves by letter (a bare "ok" on a summary was refused by the permission check).

## Building a component in Figma

How Godwin built the kit (2026-10-15 and 16), for any component added or reworked later.

- **One pass per component:** inspect read-only, propose and get agreement (a lettered list for anything destructive), write in one call, screenshot light and dark with a contrast check, then arrange the page.
- **Leave the page arranged:** inside a set, Size in columns (sm, md, lg) and every other combination in rows, 24 padding and gaps, layer order matching the visual order (one column ordered by Size if columns would pass about 1,400 wide). The page frame restacked top to bottom, gap 72, padding 80 top and bottom, 160 left and right, sized to its children, Header and Footer resized to match. Resize the frame first, then place its children.
- **Units:** every Sizing, Stroke, Spacing and Corner Radius token aliases a `_Units` primitive named by value (`unit/24`, `unit/0-5`). Snap to an existing unit before adding one. Typography and Effects keep raw values on purpose.
- **Component color tokens alias primitives,** never another component's tokens, so they can diverge (`Badge/*` to `Indicator/*` is the one exception). Copy the primitive values when one component should look like another.
- **`-content` suffix** for the token that colors text and icons on a fill (`Button/danger-content`), not `-label`.
- **Slots:** native `🧩` slots with a matching `👀` boolean that hides them (an empty slot still takes the gap). Two stacked slots are `Top slot` / `Bottom slot`, side by side `Leading` / `Trailing`. A slot gets a fixed size bound to a token (`list/slot-*`, `menu/slot`), except open-ended column content, which fills the width and hugs its height.
- **Reuse before inventing:** nest finished pieces (Button, Checkbox, Indicator, Text Input, Pagination item, Progress-bar) as exposed instances, but a nested piece must match its host's shape (Chip has its own square count box, not the round Indicator).
- **Auto layout everywhere;** proportions (a slider's value) as a GRID with FLEX columns.
- **First-line icons:** an icon beside wrapping text sits in an `icon-wrap` frame with `space-2xs` top padding, so it centres on the first line (code: the first-line rule in `CLAUDE.md`).
- **Elevation:** simple boxes carry the style on the surface; shapes with a pointer carry it on a fill-less wrapper. Components in the page flow get none. (Code's Tooltip puts `near` on the content box only.)
- **Row dividers** are an absolute `divider` rectangle as the row's first child (`stroke-sm`, `border-subtle`), not a frame stroke, which would cover a selected underline.
- **Hover never changes size:** add a sibling text style (`body-lg-underline`) rather than switching style. A selected item in a hugging row changes color, not weight.
- **Sizes differ in height, not just density:** no size that only shrinks the type, none that is only wider when the component can be resized.
- **Pressed fills** may have lower contrast; they last a split second.
- **100% corner smoothing** on every rounded layer (set per layer).

The archived `bland-handoff.md` ("How Godwin wants the work done") holds the long list of Plugin API gotchas from that build: native slot migration, variant cloning and renaming, icon swaps and recolors, sizing and text style traps. Read it before restructuring a component set.

## Overflow in Figma

Code draws the fade as a real mask (`.bland-scroll-fade`) and shows the scrollbar only while the area scrolls (`CLAUDE.md`, Overflow). Figma can't do either, so it draws a stand-in:

- **The fade is an overlay, not a mask** (Godwin chose this 2026-10-16). Masks were unreliable in the file: they did nothing inside the Code snippet body, failed in some nested frames, and swapping the variant of an instance used as a mask dropped `isMask` (a solid black block).
- **`_fade`**: `Axis` vertical/horizontal × `Size` md (default)/sm; booleans `👀 Fade start` (off) and `👀 Fade end` (on). Its pieces are gradients from the area's surface token to that surface's `Fade/*-clear` token, the same primitive at 0% so dark mode has no gray halo. A gradient stop bound to a variable takes that variable's alpha, which is why the clear end needs its own token. `Fade/*-clear` exists for this drawing only; the build skips it.
- **`_scrollbar`**: the thumb only (4 × 56), `scrollbar/width`, `rad-rd`, fill `Scrollbar/thumb`.
- **Wiring in each scroll area:** content, then an exposed `_fade` (absolute, full size, stretch constraints), then `_scrollbar` last (absolute, 4 in from the right), both shown by `👀 Overflow`. Figma can't detect overflow, so `👀 Overflow` is off by default (on for Code snippet): turn it on only when the content really overflows, or the fade sits over empty space.
- **Never put absolute children inside a GRID frame:** they still count for its hug sizing (Calendar month and year grids grew extra rows). Put them on the grid's parent, over the grid.
- **Before finishing a structural change,** test a resized instance (taller and shorter) and compare the variant heights with their earlier values.

## Plugin API techniques

The symptom-cause-rule entries are in `LEARNINGS.md` (Figma). Beyond those:

- `page.loadAsync()` on every page in one call, then `findAll` per page, scans the whole file without switching pages.
- `node.screenshot()` returns at most about five images per call, and identical images may be dropped.
- Renaming a chain of variables (sm to xs, md to sm): rename in that order, and swap names in text through placeholders so they don't cascade. A name-keyed map built earlier in the script doesn't follow a rename; re-key it.
- Layout grids bind with `figma.variables.setBoundVariableForLayoutGrid(grid, field, variable)`, which returns a new grid object.
- Gradient stops bind with `boundVariables: { color: figma.variables.createVariableAlias(v) }` per stop.
- A usage census checks the paint bindings on every vector, inside instances too. Before calling a token unused, look at the layer it was made for.
- Doc tables built from `_table-cell` instances: keep the first data row as a template, remove the rest, clone it per token and set the cell texts.
- Sorting variant options (sm/md/lg, false/true) has no API: rename each value away and back with a read of `componentPropertyDefinitions` between steps (`LEARNINGS.md`, Figma).
