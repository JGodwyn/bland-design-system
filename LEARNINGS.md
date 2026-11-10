# LEARNINGS.md — solved once, never again

Every non-obvious thing this project has been bitten by, in the shortest form
that still prevents a repeat: **symptom → cause → rule**. Read the section that
matches what you're about to touch *before* you touch it.

**Add an entry the moment something surprises you**, while the cause is still in
front of you, not reconstructed at the end of the task. One entry per learning;
if you're writing a narrative, it belongs in `EXECUTIONS.md`.

Companions: `INTERFACE.md` (design decisions), `EXECUTIONS.md` (what was done),
`CLAUDE.md` (the rules).

---

## Figma (MCP and Plugin API)

**`use_figma` returns nothing past 20 KB.** The full variable export is about
200 KB and the call fails with "Return value exceeds the 20480-byte limit".
The plugin sandbox has no `fetch` either, so it can't send the data anywhere
else. → Export in chunks (`scripts/figma/dump-tokens.js`, `CHUNK = n`), save
each to `tokens/figma/raw/NN.json`, and prove the copy is exact with the
checksum pair (`scripts/figma/checksum.js` in Figma = `npm run tokens:checksum`
locally). Never trust a hand-copied chunk without the matching hash.

**Copying data out of Figma is the expensive direction.** A `use_figma` result only reaches the repo by being copied into a file, so a check that returns a hash per variable (about 15 KB) costs that copy every run. → Send the repo's side into the script instead (the code input takes 50 KB) and have Figma return only the differences. That is how `npm run tokens:drift` works; a clean check returns about 150 bytes.

**The REST variables endpoint needs an Enterprise plan, and Bland's variables
are local and unpublished.** → Read variables only through the Figma MCP
(`use_figma` read-only scripts or `get_variable_defs`).

**An alpha primitive stores its opacity as 0 to 100, beside an alias:**
`{color: {type: 'VARIABLE_ALIAS', id}, opacity: 6}`. Rounding it through 8-bit
hex turned 6% into 5.9%. → Carry the exact fraction through the build
(`#rrggbb@0.06` internally) and emit `rgb(r g b / 6%)`.

**Figma descriptions can hold HTML entities** (`&#39;` in the `Purple/*`
descriptions). → The build decodes them; fix them at the source when convenient.

**`variable.scopes` cannot be set on a TIMING variable.** Creating
`duration/toast-visible` with `v.scopes = spin.scopes` threw "Cannot set
scopes on this variable type" (the whole script rolled back). → Leave scopes
alone on Motion variables; they stay `ALL_SCOPES` like the existing ones.

**Motion variables are their own types.** Durations are `TIMING` in seconds
(`0.8`), easings are `EASING` objects (`CUSTOM_CUBIC_BEZIER` or `LINEAR`). The
file's existing ones use `ALL_SCOPES` and no code syntax. → Convert seconds to
`ms` in the build; match the existing variables' settings when adding one.

**A Figma frame name can mislead about which node carries a binding.** On the
Button, padding is bound to `space-none` on the root; the real padding lives on
an inner `Base` frame, and a stroke weight showed up on the hidden `focus-ring`
frame. → Read the bindings of every child frame before writing CSS, not just
the component root.

**A Figma placeholder can be bound to primitives on purpose.** Empty
State's `_empty-illustration` binds its icon to `unit/40` and `unit/64`
("placeholder only, so no component tokens"), and primitives are never
emitted to CSS, so code had no token for its size. → Check whether a
binding is a primitive before planning CSS for it; if it is, it is a
question for Godwin (Empty State: ship no default illustration).

**A drift check can carry an unrelated Figma change.** Syncing six Table
colors, the check also reported Typography renamed to `_Typography` and
hidden, which `--apply` would have turned into 28 removed CSS tokens. →
Read the report's "CSS tokens affected" before applying. To take only the
variable records, set `metaChanged` to false (and drop `meta`) in the saved
result: `--apply` then keeps the repo's collections and styles. Say in the
commit that the checksum will differ until the rest is settled.

**Hiding a Figma collection removes its CSS.** `hiddenFromPublishing` is how
the build tells a primitive, so hiding `Typography` (to keep it out of
library files) dropped every raw type token. → Before hiding a collection in
Figma, list what components read from it and give them a non-primitive
source first (for type: the per-style `--type-*-line-height` and
`-letter-spacing`, 2026-10-25).

**When only the metadata differs, skip the 17 KB drift script.** If Figma's
`checksum.js` equals the repo's, the variables are in sync; patch the
collection or style record in `00.json` and compare an FNV hash of
`JSON.stringify(meta)` from Figma with the same hash of the local meta.
Cheaper than pasting `check.js` through `use_figma`.

**The Figma MCP has a per-seat call limit.** Mid-read, `use_figma` on the
plugin connector returned "You've reached the Figma MCP tool call limit for your
View seat", and Framelink answered 403 "Token expired". → Read a component in
as few `use_figma` calls as possible (one script dumping the tree, bindings
and text styles of every variant); the second Figma MCP connector in the
session kept working when the first was limited. Go straight to that second
official connector; don't try Framelink (Godwin's call: official MCP only).

**A Figma description can disagree with its own variable.** Tooltip's set
description says the content wraps at 264; `tooltip/max-width` is 256. →
The variable wins (it is what the frame is bound to); report the stale
description.

**Figma returns descriptions HTML-escaped, and a setter stores what you give
it.** Appending a line to the Modal set's description by reading it and
writing it back turned `&quot;` into `&amp;quot;`; a description written with
real quotes reads back as `&quot;`. → Never round-trip a description:
write the whole text fresh, with plain characters.

**Slicing a string with an emoji can break the `use_figma` reply.** A dump
that returned `characters.slice(0, 20)` cut "🫧" in half; the lone surrogate
made the connector fail with "Invalid JSON: unexpected end of hex escape".
→ Don't return sliced text from Figma (or slice with `Array.from`); return
names or ids instead.

**The docs focus preview overrides component focus styles.** `.pg-focus
.bland-focus-ring` sets the whole outline (brand color, 2px outward offset)
at the same specificity as a component rule, so an `outline-color`
override for a ring on a brand fill did not show in the preview. → Change
the color by redefining `--border-focused` on the container, and the
offset with a three-class selector (Chat bubble, Chat list item).

**A long-running docs server misses new component folders.** With the
5180 server started before `chat-navbar/` existed, `#/raw/chat-navbar`
said "No story called" (the stories glob was cached), and
`docs.spec.ts` failed on an empty props table because `props.json` is
built only when `npm run docs` starts. → After adding a component, touch
`playground/docs/data.ts` and run `npm run props` (or restart the docs
server) before looking or testing.

- **`get_design_context` on a Figma section returns megabytes of sparse metadata** (2.5 MB for the 8 frame
  docs section, saved to a file, flagged sparse) → the node was a section of whole pages → for page mockups,
  take `get_screenshot` of each frame, then a read-only `use_figma` script that walks a frame and returns
  layout, padding, radius, text style and bound variable names per node (skip dot patterns and other repeats).

- **`variable.scopes = …` throws "Cannot set scopes on this variable type" on a TIMING variable** → scopes
  exist only for some types → leave TIMING (Motion) variables at their default `ALL_SCOPES`, as the
  existing delays are; a failed `use_figma` rolls the whole script back, so recreate rather than patch.

**An instance's `children` leave out layers hidden by a boolean property.**
Editing a `_fade` instance's end piece found nothing while `👀 Fade end`
was off. → Turn the boolean on, edit, then restore it.

**`resetOverrides()` on a nested instance after `swapComponent` undoes the
swap.** Swapping Lucide icons to Phosphor inside other components, the reset
put the old icon back. → For nested swaps, rebuild the vector paints from the
new main instead of resetting overrides.

**Property changes on a fresh instance may not reach its sublayers in the
same call.** Creating an instance, setting its properties and editing a
sublayer in one script failed on the sublayer. → Split "create and set
properties" and "edit sublayers" across two `use_figma` calls.

**Frame-only getters throw on TEXT nodes.** A generic dump reading
`overflowDirection` stopped at the first text layer. → Guard with
`'prop' in node` before reading a property generically.

## Fonts

**Fontsource *variable* packages register a different family name**
(`"Inter Variable"`), which never matches `--font-family-sans: "Inter"`. →
Use the static packages (`@fontsource/inter/400.css` etc.), whose family names
are exactly "Inter" and "Geist Mono", and load only the weights the text styles
use.

**A family token keyed by the family's name breaks the build when Figma changes the font** (2026-10-29). The first
cut mapped `Inter` → `--font-sans`, `Geist Mono` → `--font-mono`, so swapping `family/sans` in Figma would have
thrown instead of flowing through. → Map by role (`Code/*` → mono, the rest → sans) and take the family from Figma;
the drift test changes `family/sans` to Söhne and expects `--font-sans` to follow. Also: the drift report calls a
single-mode token's change `value`, not `light`.

## TypeScript and React

**TypeScript 7 has no JavaScript API.** `react-docgen-typescript` crashed with
"Cannot read properties of undefined (reading 'React')" at `ts.JsxEmit`. →
`scripts/build-props.ts` installs the `typescript5` alias
(`npm:typescript@5.9.3`) and points the docgen's `require('typescript')` at it.
The project itself still compiles with TypeScript 7.

**CSS side-effect imports fail the typecheck** with TS2882 ("Cannot find module
or type declarations for side-effect import of './icon.css'"). →
`src/vite-env.d.ts` references `vite/client`.

**React 19 types have no global `JSX` namespace.** `() => JSX.Element` fails
with TS2503. → Import `ReactElement` (or `ReactNode`) from `react`.

**React's `autoFocus` does nothing inside a `<dialog>` that is not shown yet.**
A Modal's form field with `autoFocus` never got focus: React focuses it
during the commit, before the layout effect that calls `showModal()`, while
the dialog is still `display: none`. React renders no `autofocus` attribute
either, so the dialog can't find it afterwards. → Call `showModal()` first,
then mount the content (Modal sets `mounted` in that layout effect).

**A dialog's `close` event is queued, so it can land after a reopen.** A
Modal closed with Escape and reopened at once from the keyboard shut again:
the `close` event from our own `dialog.close()` arrived after the new
`showModal()` and closed the state. → In the `close` handler, act only if
the dialog is still closed (`!dialog.open`).

**React Aria's tab panel keeps the id it first got.** After an arrow key
moved to the next tab, the panel showed the new content but kept the old
tab's `tabpanel` id, so the selected tab's `aria-controls` pointed at
nothing (axe: aria-valid-attr-value). `useTabPanel` passes its id through
`useLabels`, which holds the first value. → Render one panel per tab: key
the panel component by the selected id (`tabs/tabs.tsx`).

**React Aria's tooltip eats Escape at the document, but only sometimes.**
A Slider thumb hid its value tooltip on Escape after an arrow key, but
not after Page Up: `useTooltipTrigger` adds a capture-phase `keydown`
listener on `document` while open and stops Escape there, so the thumb's
own `onKeyDown` saw it in one case and not the other. → To react to
Escape near a tooltip, listen on `document` in the capture phase too
(listeners on the same node all run), as `Slider.tsx` does.

**The docs page's zoom keys ate 0 in date fields.** Godwin couldn't type 0
(or 2026) into any date or time segment on a component page, while
Playwright on `#/raw/` could. The demo's zoom shortcut (`+`, `-`, `0` while
hovering the demo) skipped only inputs, selects and textareas; React Aria's
segments are contenteditable spinbuttons. → Global key shortcuts skip
`isContentEditable` targets and `[role=spinbutton]` too
(`playground/docs/ComponentPage.tsx`); test typing on the component page,
not only the raw story.

**`--update-snapshots` keeps a baseline when the change is under the tolerance.**
After the Calendar title bar was redesigned, the Date Picker and Date Range
Picker baselines still showed the old one: their open calendar's title bar
is fewer pixels than `maxDiffPixelRatio` 0.002 of a full page (about 3,100
on a 1024 x 1524 shot), so the tests passed and nothing was rewritten. →
After an intended visual change, delete the affected baselines before
`--update-snapshots` (or run `npm run test:update`), and look at them.

**A popover open from the start showed a render too late for autofocus.**
A `defaultOpen` Date Picker drew its calendar, but focus never went in, so
Escape did nothing and the open popover swallowed the next press anywhere
(React Aria's useOverlay stops an outside press while it closes). Popover
showed itself from Floating UI's `elements.floating`, which is set by a ref
callback and arrives one render later; the calendar cell's focus effect had
already run on a hidden element. → Show and hide the popover from its own
ref in the layout effect (`overlay/Popover.tsx`); a passive autofocus then
finds it in the top layer.

**A controlled date value parsed every render loops React Aria's date field.**
The Date Picker story crashed with "Too many re-renders": the picker turned
its `value` string into a new `CalendarDate` on every render, and
`useDateFieldState` compares the value by identity and resets its display
state during render when it changes. → Parse props once per string
(`useDateProp`, `useRangeProp`, `useTimeProp` in `calendar/dates.ts`), never
inline `parseDate(value)` in the props passed to React Aria.

**React Aria's slider thumb is a native range input: no `aria-valuenow`.**
A spec waiting for `aria-valuenow="51"` timed out; the value is the
input's `value` (and `aria-valuetext`). → Assert with `toHaveValue`.

## CSS

**A custom property's default set on the element itself beats the parent's
value.** `.bland-icon { --bland-icon-size: var(--icon-md) }` meant a Button's
`--bland-icon-size` never reached its icon, so every icon rendered at md. →
Defaults for a variable a parent is meant to set go on `:root`, so inheritance
can override them.

**An inline style set for one variant outlives the switch to another.** ScrollArea set the thumb's `height` inline while vertical; switched to `axis="x"`, that height stayed and beat the CSS, so the 4px horizontal track drew a thumb tens of pixels tall, hanging below the area. → When script sets a variant-specific inline style, clear the other variant's property on every update (`thumb.style.width = ''` when vertical, `height` when horizontal). `tests/scroll-area.spec.ts` switches the axis to hold it.

**A flex-basis does not count toward a shrink-to-fit container's width.**
Progress-wizard steps with `flex: 0 1 var(--progress-step-width)` and
`min-width: 0` measured about 120px, not 152, inside a container sized by its
content: a shrinkable item contributes its content's size, not its basis. →
Give the item a `width` (and `flex: 0 1 auto` to keep shrinking) when a
fixed size must survive an auto-sized parent.

**A focus ring on a stacked row is cut off by the next row.** The outline's
2px offset on a List row sat under the following `<li>`'s fill, which paints
later. → Give the focused element `position: relative` (no z-index needed:
positioned boxes paint after in-flow siblings).

**A border on a table cell adds to the row height.** Table rows with
`height: var(--table-sm)` on the cells came out 32.5 (body, 0.5 divider) and
33 (header, 1px): Figma's dividers are inside strokes, CSS borders are not.
→ Draw a Figma inside stroke on a table cell as an inset shadow
(`box-shadow: inset 0 calc(var(--stroke-xs) * -1) 0 …`).

**Table columns grow to fit one-line labels, so nothing truncates.** With
`white-space: nowrap` a cell's min-content is its whole label, and the table
widens instead of showing an ellipsis. → `max-width: 0` on the cell (plus a
`min-width` token) makes the columns share the table's width; the label
inside ends in an ellipsis and the table scrolls only when the minimums do
not fit.

**Native scrollbars can't meet the overflow rule.** macOS overlay scrollbars hide
when idle, and the standard `scrollbar-width` has no 4px option. → The
`ScrollArea` component hides the native bar and draws its own always-visible
thumb, outside the fade mask.

**A pale tint disappears on a grey surface.** The `secondary` Button fill
(`Brand50`) on `surface-200` read as no selection at all in the docs sidebar. →
On `surface-200` and darker, mark a selected option with `stroke` (an outline),
not `secondary`.

**React Aria's `useButton` props overwrite a Bland Button's `type`.** A Menu
trigger `<Button type="stroke">` lost its styling: `buttonProps` carries the
native `type="button"`, and merged onto the cloned Button it replaced the
Figma `type`. → Drop `type` from React Aria's button props before merging
them into a Bland control (Bland's buttons are `type="button"` already).

**`flip()` never flips a panel that `size()` has already capped.** A menu
under a trigger near the bottom of the screen stayed squeezed below:
`size()` set `max-height` to the space left, and on every later compute
`flip()` measured the capped panel, which always fits. → Lift the cap and
re-measure at the start of each computation (`uncap` middleware in
`overlay/Popover.tsx`, `reset: { rects: true }` once).

**A trigger press closes React Aria's overlay and is swallowed.** Excluding
the trigger from `shouldCloseOnInteractOutside` (so it could toggle) left
the menu open: `useMenuTrigger` only ever *opens* on a mouse press. React
Aria relies on `useOverlay` closing on the outside press and swallowing it.
→ Leave the trigger "outside"; it toggles the menu shut that way.

**`useComboBoxState` does not filter `items`.** Typing in a filterable
Dropdown left all 20 options: controlled `items` are taken as already
filtered by the caller. → Pass the options as `defaultItems` (read on every
render) so `defaultFilter` applies.

**React Aria names a select button value first.** Its `aria-labelledby` is
the value then the label ("Banana Basic"), so a test looking for a name
starting with the label finds nothing. → Find Dropdown triggers by test id,
or match the full value-then-label name.

**An element focused by script matches `:focus-visible`.** React Aria's
`useMenuTrigger` focuses the trigger on a mouse press, so checking
`:focus-visible` to skip motion treated every press as keyboard. → Ask
React Aria's modality (`useFocusVisible()`) instead.

**A docs-site descendant rule restyled a component's heading.** The Modal
title (an `h2`) showed at title-lg in the playground demo: `.docs-section
h2` (0,1,1) beat `.bland-modal__title` (0,1,0). Raw story pages and
screenshots were fine, so no test caught it. → Playground rules target
their own elements with child combinators (`.docs-section > h2`), never
bare descendant tags that reach into demos.

**A visually hidden element adds a space to an accessible name.** A tab bar
link named "Inbox" plus a hidden ", new activity" read "Inbox , new
activity": the hidden span is absolutely positioned, so Chromium treats it
as a block and separates it with a space. → Put a combined name in
`aria-label` instead of appending hidden text.

**Negative margins collapse through a parent with no border or padding.**
The tab rows give their scroll area `margin: -space-xs` to cancel the
list's focus-ring room; inside a plain block the margins escaped the
parent, which grew by 8px, so the File tab bar showed 4px of grey around
its tabs and the Section divider sat 4px under the underline. → Make the
parent a flex container (no margin collapsing).

**`--bland-radius` does not inherit.** A radio laid over a Segmented bar
segment (`.bland-smooth`) drew a square focus ring: base.css registers
`--bland-radius` with `@property`, not inherited, initial 0. → Every
`.bland-smooth` element sets its own `--bland-radius`.

**A child's layout effect runs before its parent's ref is attached.** The
Segmented bar's thumb measured nothing on the first render when the hook
lived in the thumb: React attaches refs child first, so the track's ref was
still null. → Call measuring hooks in the component that owns the ref.

**A ResizeObserver on an animating element stops the animation.** The
sliding indicator re-placed itself (without a transition) on every resize
it observed, its own width included, so the slide jumped to its end. →
Observe the list and the tabs, never the indicator, and skip the
observer's first report.

**`offsetLeft` and `offsetWidth` round to whole pixels.** The indicator
sat a fraction of a pixel off the selected tab. → Measure with
`getBoundingClientRect` against the list (divided by CSS zoom).

**A drag state can be shown and tested without a mouse.** Playwright has no
file drag from the OS. → Dispatch real events: build a `DataTransfer`, add
a `new File(...)`, and send `new DragEvent('dragenter' | 'dragover' |
'drop', { bubbles: true, cancelable: true, dataTransfer })` to the zone;
React handles them like real drags (File Upload's story shows drag-over
this way, and the spec drops files with it).

**A computed color read right after a state change can be mid-transition.**
File Upload's drag-over border read gray once, because `border-color`
transitions over `duration/xs`. → Read transitioned colors with
`expect.poll`, never once.

**A ScrollArea inside another ScrollArea took the outer one's thumb
shape.** Code snippet nests a horizontal ScrollArea in a vertical one; the
inner thumb drew as a 24px tall vertical bar, because
`.bland-scroll-area[data-axis="y"] .bland-scroll-area__thumb` (a descendant
selector) matched it too. → Scope component rules to their own parts with
child combinators (`> .bland-scroll-area__track > .bland-scroll-area__thumb`
since 2026-10-19); write any rule that a nested copy of the same component
could match that way.

**`onCopy` is a native React prop.** A component prop `onCopy?: (text) =>
void` on a type extending `HTMLAttributes` fails to compile (it clashes with
the clipboard event handler). → Name callbacks that report a result in the
past tense (`onCopied`), so they never collide with a native event.

**`display: none` drops text from an accessible name.** Sidebar's rail
hid each row's count with `display: none`, so the link read "Inbox" in the
rail and "Inbox 8" in the full sidebar. → Hide text that belongs to a
name visually (`position: absolute; overflow: hidden; clip-path: inset(50%)`),
and keep `display: none` for decoration.

**`--update-snapshots` keeps a baseline when the change is under the threshold.**
File Upload's dark row went from #2b313b to #15181d and the update wrote
nothing: Playwright's per-pixel color threshold counts two near-black greys
as equal, so the test passes and the old PNG stays. → After a token change
that only darkens or lightens a dark surface, delete that story's PNGs and
run the update again, then check `git status` shows them changed.

**A shrinking element can leave the pointer behind.** After the Sidebar
collapsed, the pointer that pressed the collapse button was over the page,
so `pointerleave` fired with no mouse move. → When a test or a "stays
closed under the pointer" rule depends on hover, check where the pointer
ends up once the layout settles.

**The browser pane runs a hidden page as a background page.** Recording
the Sidebar's motion there with `requestAnimationFrame` got two frames in
a second. → Measure animations in Playwright (headless frames run
normally), not in the pane.

- **A `width` on a Bland Table header cell does nothing** → basic cells set `max-width: 0` at
  `.bland-table__header[data-structure]` specificity (0,2,0), and `:is(th, td)` under a class is only (0,1,1)
  → override with `.x .bland-table__header, .x .bland-table__cell { max-width: none }`, then set widths.
- **`width: max-content` on a Segmented bar still truncates a label** → segments are `flex: 1 1 0`, so the
  bar splits its intrinsic width equally and the wider (bold, selected) label loses → when the bar should
  hug its segments, give the items `flex: 1 0 auto` too.
- **An inset box-shadow "border" on a container vanishes behind its children** → children with a
  background paint over the parent's inset shadow → for a frame around filled panels use a real border
  (with `overflow: hidden` for the corners).

## Tooling

**A screenshot test passes through a small color change.** Retuning the Button disabled and dark secondary fills (#a8b0be to #c4cad4, #00113d to #001b55) left all 98 screenshot tests green: each pixel's change is under Playwright's per-pixel color threshold, so the baselines silently kept the old colors. → After a token-only color change, re-baseline the stories that use those tokens with `--update-snapshots=all` (plain `--update-snapshots` only rewrites failing ones), and check the computed value in the browser rather than trusting a passing run.

**Playwright's mouse misses points below the viewport.** A Slider spec
clicked a track 1352px down a 768px page and nothing happened (`boundingBox`
gives page coordinates, `page.mouse` acts on the viewport). → Call
`scrollIntoViewIfNeeded()` on the element before computing coordinates
for `page.mouse`.

**Port 5180 is fixed** (`strictPort`) because Playwright and the docs both expect
it. A dev server left running from an earlier session makes `npm run docs` fail
with "Port 5180 is already in use", and Playwright's `reuseExistingServer`
silently tests against that old server. → `npm run docs:stop` frees the port.
Check what is on it (`lsof -iTCP:5180 -sTCP:LISTEN`) before assuming your
change is broken.

**`--update-snapshots` alone keeps a baseline the change fits inside.** It
defaults to "changed", and with `maxDiffPixelRatio: 0.002` a small story edit
(Avatar's slot dots becoming Indicators, about 1,500 pixels) still passes, so
the old picture stays. → To re-baseline one story on purpose, run
`npx playwright test -g "<id> looks" --update-snapshots=all` and check
`git status` shows the PNGs changed.

**`page.clock.install()` does not stop time.** A Toaster test that hovered at
2000 ms of fake time found 2959 ms elapsed: the installed clock keeps
running in real time between `runFor` calls, and Playwright's actions take
real time. → Leave a margin of about a second either side of a timer's
deadline, or use `page.clock.pauseAt()` when a test needs exact times.

**Generated files are not committed**, so a fresh clone has no
`playground/.generated/props.json`. → The docs import it through
`import.meta.glob`, so a missing file is not a type error; `npm run docs` and the
Playwright web server regenerate it first.

**A docs server started before a new component folder existed may not list
it** ("No story called avatar" at `#/raw/avatar`, even after a reload). Its
`import.meta.glob` and `props.json` are from when it started. → Restart it
(`npm run docs:stop`, then `npm run docs`) after adding a component folder.

**A new component's props table says "Props are generated when the docs
start"** on a server that is already running. → `npm run props` regenerates
`props.json` and a reload picks it up; no restart needed for props alone.

**axe catches contrast misses that live in the tokens, not the component.**
White on `Indicator/success-primary` (#008b00) is 4.47:1 though the Figma
description promises 4.5:1 (kept on purpose, Godwin 2026-10-18); danger primary in dark is 3.7:1 on purpose. →
Exclude only those selectors, per theme, in `tests/a11y.spec.ts` with the
reason beside them, and raise anything unintended with Godwin.

**A computed color read right after `hover()` is the old one.** Text Input's
fill eases over `duration/xs`, so `getComputedStyle` straight after the hover
still returned the rest fill. → Read transitioned colors with
`expect.poll(...)`, not a single `evaluate`.

**`page.mouse.click(box.x, box.y)` misses an element below the fold.**
`boundingBox()` gives page coordinates (y 3076) but the mouse clicks the
viewport, so nothing was hit and the test failed as "not focused". → Call
`scrollIntoViewIfNeeded()` before taking the box for raw mouse coordinates.

**axe flags text around a disabled input** (helper text, add-on labels in
`text-minimal`) though WCAG exempts inactive components; it only knows the
input itself is disabled. → Exclude `.bland-text-input:has(:disabled)` in
`tests/a11y.spec.ts`, with the reason beside it.

**`--update-snapshots` keeps a baseline that differs by less than the threshold.** After a story change (two small icons swapped), `npx playwright test -g breadcrumb --update-snapshots` passed and left the old PNG, because the change was under `maxDiffPixelRatio` (0.002) and Playwright only rewrites "changed" snapshots. → For a small intended change, delete your own PNGs first and re-run, then look at them.

**A reused docs server has stale props.** `npm test` reuses a dev server on 5180 started before your component existed, so `playground/.generated/props.json` lacks it and `docs.spec.ts` ("every component page shows a props table") fails. → Run `npm run props` (the server picks it up) and re-run.

**Playwright's `getByRole('button')` does not find a `<summary>`.** Chromium
exposes it as `DisclosureTriangle` (`DisclosureTriangleGrouped` inside a
`name` group), which platform screen readers get as a button, but
Playwright's role engine and aria snapshot see only text. → Check a summary's
role and expanded state through CDP (`Accessibility.getFullAXTree`), as
`tests/accordion.spec.ts` does, and locate it by CSS.

**An `<a>` without `href` reports `tabIndex` 0 in Chromium** though it
cannot take focus. → Test focusability by calling `focus()` and checking
`document.activeElement`, not `tabIndex`.


**`getByRole(…, { name })` matches a substring.** `getByRole('table', { name: 'People sm' })` also found
"Expandable people sm" (6 column headers instead of 4). → Pass `exact: true` when one accessible name
contains another.

**React Aria ignores a hover that arrives before any pointer move.**
`useTooltipTrigger` counts a hover only when the interaction modality is
"pointer", which a `pointermove` on the document sets; Playwright's
`hover()` jumps onto the element in one move, so the enter fires first and
the tooltip never opened. → In specs, `page.mouse.move(1, 1)` before
hovering a React Aria trigger (`tests/tooltip.spec.ts`).

**`useFocusVisible()` lags behind the pointer.** Its `isFocusVisible`
re-renders only on pointerdown and keys, not pointer moves, so after a page
load a hover-opened tooltip still read as "keyboard". → To know whether
focus opened something, check `trigger.matches(':focus-visible')` at that
moment.

**Floating UI's `hide()` and `flip()` measure against the viewport.** In a
full-page screenshot, open tooltips below the first viewport were hidden
and bottom placements flipped up. → Don't hold overlays open in a story's
`render`; screenshot them opened by focus in the component's spec, clipped
to the trigger and the overlay (`tests/tooltip.spec.ts`).

**`shift()` alone pins a side placement to the screen edge.** For left and
right placements its main axis is vertical, so once the trigger scrolled
above the viewport the tooltip stayed at the top, detached from it. → Always
pass `limiter: limitShift()`: it slides along the trigger, never off it.

**Floating UI drifts under CSS `zoom`.** With the docs zoom at 125% the
tooltip sat below and right of its trigger and grew. Under a zoomed ancestor
`getBoundingClientRect` (the trigger) is in screen px, but `offsetWidth` and
computed sizes (the tooltip) are unzoomed, and the `left` / `top` Floating UI
writes are drawn zoomed again; `arrow()` also reads `clientWidth`. →
`platform.getDimensions` times `el.currentCSSZoom`, token distances times
it, positions divided by it, and pointers placed by your own middleware
(`src/components/tooltip/Tooltip.tsx`). `tests/tooltip.spec.ts` sets
`zoom: 1.5` on the frame to hold it.

**Vite library mode bundles every dependency not listed as external.**
Adding react-aria grew `dist/index.js` from 62 to 117 KB. → List each
runtime dependency in `rollupOptions.external`, with a regex for its
subpaths (`/^react-aria(\/|$)/`), and check `dist/index.js` imports them.

**A bounding box taken while an element scales in is the scaled one.**
Modal specs measured the dialog 7px off its margin and buttons 3px apart:
the `scale(0.96)` entrance was still running. → Open it from the keyboard
(no motion) before measuring, or wait for the animation.

**A color read right after mount can be mid-transition.** A Pill tab's
selected fill read light blue: React Aria selects the first tab after the
first render, so `aria-selected` arrives a frame late and the fill eases in
over duration/xs. → Read state colors with `expect.poll`, even on load.

**An input laid over its label swallows clicks on the text.** Clicking a
Segmented bar's label text timed out in Playwright ("intercepts pointer
events"): the radio covers the segment as its hit area. → Click the radio
itself (`getByRole('radio')`).

**Playwright's `getByRole` name matches substrings.** In the Pagination spec
`{ name: 'Page 1' }` also matched "Page 10" and failed in strict mode. → Pass
`exact: true` whenever one accessible name is a prefix of another (numbered
items, "Page 1" / "Page 10").

- **A Playwright test on `page.clock.install()` + `runFor` fails under parallel load** → an installed clock
  keeps advancing in real time between steps, so a 2s timer can expire before `runFor` → to test a
  timer, either `pauseAt` the clock before the action or assert the real elapsed time with a generous
  `toHaveText` timeout.

## Working with parallel sessions

**Two sessions share this folder and commit on `main`.** A `git add -A` from one
session picks up another session's half-done work. → Stage explicit paths when
another session is working here, and check `git show --stat` before pushing.

**The git index is shared too.** The Chip and Pills session staged its files,
and before it committed, the drift session ran `git commit`, which took
everything staged: Chip and Pills shipped inside 9ab048c ("Add the drift
check"), already pushed. → Never leave files staged between commands. Stage
and commit in one command, or commit from a private index
(`GIT_INDEX_FILE=<scratch> git read-tree HEAD`, `git add`, `git commit`, then
`git reset -q -- <paths>` in the shared index). Before committing, check
`git diff --cached --stat` lists only your files.

**A shared file can hold another session's unfinished lines** (Chip's map row
in `CLAUDE.md`, Chip's log in `EXECUTIONS.md`) next to yours, so even a
pathspec commit would ship them. → Stage HEAD plus only your lines: write that
version to a scratch file, `git hash-object -w` it, and
`git update-index --cacheinfo 100644,<hash>,<path>` (Indicator, 72628ba).

**A plain `git commit` takes everything staged, including another session's files.** The drift check commit (9ab048c) picked up the Chip session's Chip and Pills work: it was staged in the second between checking the index and committing. → Commit with a pathspec, `git commit -m "…" -- path1 path2`, which commits only those paths whatever else is staged. And make a staged-files check stop the commit, not just print.

**A side session can't make design decisions.** The Button session stopped on
the spinner's rotation speed because no Motion token fit. → When a value has no
token, the session asks; the answer is a new Figma variable synced through the
pipeline, never a value in CSS.

**Editing a shared doc in the working tree, then staging it, ships the other
session's uncommitted lines in it.** The Text Area commit (0b4c4c6) carried
the Feedback session's CLAUDE.md row and INTERFACE.md section, because the
edit script read the working copy. A pathspec does not help: the file is
yours and theirs. → Apply your edits twice: to the working copy, and to
`git show HEAD:<file>`; commit the HEAD-based copy with `git hash-object -w`
+ `update-index --cacheinfo` from a private index.

## Claude Docs (the tracker)

**A table row is not a block.** Inserting a log row with `"as":"markdown"`
before a row id is refused with `shape_mismatch` (needs `tableRow`). → Insert
rows with `"as":"blocks"` and a `row` → `cell` → `paragraph` structure, `side`
`"before"` the newest row.

**A read prints short block ids; a write needs the full one.** Replacing
`.4658` was refused with `relative_id`. → A short `.N` belongs to the
session of the nearest full id printed above it (`mwfmcdf7qq7.4646` makes
`.4658` into `mwfmcdf7qq7.4658`); send that.

**Read the doc before writing.** Godwin and other sessions edit it between
turns. → Start with `read( …, {"kind":"view","sinceRev":<last rev>} )` and keep
their edits.

**The screenshot tolerance can hide a real layout change.** After moving
the message bar's reply panel and icons, `--update-snapshots` left the
baselines untouched and `npm test` passed against the old layout: the
change was mostly a near-white panel edge, under `maxDiffPixelRatio`
0.002. → After an intended visual change, re-baseline with
`--update-snapshots=all` for that story, then look at the PNG (its
modified time tells you it was written).

**Replacing a paragraph with `"as":"text"` keeps the first run's marks.**
A rewritten plan item came out all in code style. → Use `"as":"markdown"`
with backticks around the code words instead.

## Browser pane

**Navigating to a URL that only changes the hash can screenshot the old page.**
The screenshot fires before the hashchange render. → Click the sidebar link, or
wait a second, before trusting the screenshot.

**`form_input` on a React-controlled checkbox flips the DOM, not React's
state.** The docs "focused" toggle looked on but did nothing; the next click
turned it off. → Click React checkboxes with `computer` instead.

- **Screenshots lag one step behind a change** (typing into a dialog's field, a theme click) → the pane
  captured before the next paint → `wait` a second before the screenshot, or check state with
  `javascript_tool` first.

- **Pane screenshots come back blank white** → the Browser pane is hidden (`tabs_context` says so) → read
  state with `javascript_tool`, and take visual checks with a short Playwright script against the dev server.

**A custom property is resolved where it is defined, not where it is used.**
`--button-brand-primary-rest: var(--brand-600)` is computed on `:root` and on
each `[data-theme]` element, from the `--brand-600` those elements see. So a
brand override works at `:root` (or on the `[data-theme]` element), but one
set on a nested element would not reach tokens already computed above it. →
Document overrides at `:root`; keep brand steps out of the `[data-theme]`
blocks so a themed subtree inherits them instead of resetting them.

**A screenshot right after a style change can show the old colors.** Buttons
transition `background-color` (duration/xs), so a capture taken straight after
injecting a brand override showed blue buttons while every computed value was
already orange. → Read computed values to verify, or wait out the transition
before a screenshot.

**A white converted to OKLCH comes back with chroma 1e-8, not 0.** Bland's
Neutral0 `#ffffff` read as a tiny chroma, so the neutral generator tinted it
and white became `#fffffe`. → Treat chroma under 1e-4 as gray, and build grays
straight from luminance, not through an OKLCH round trip.

**A SegmentedBar's radio covers its label.** Playwright's click on the label
text waited 30s ("input intercepts pointer events"). → In tests, check the
radio: `getByRole('radio', { name }).check({ force: true })`, as the theme
switch test does.


## Docs site: module order and popover anchors (2026-10-26)

- **Symptom:** an applied brand vanished on reload. **Cause:** `let applied = read()` sat above `const isScale = …`; read() hit the temporal dead zone, the try swallowed the ReferenceError. **Rule:** module-level calls go below every const they reach; a catch-all `try` around storage reads hides this, so test reloads, not only navigation.
- **Symptom:** a Popover opened with no content (and focus fell to the body) on its first open after a load. **Cause:** `reference={ref.current}` read during render, null on the earlier render. **Rule:** give Popover its anchor through state (`const [el, setEl] = useState(null)` + `ref={setEl}`), as the components do.
- **Symptom:** a CSS transition sat at its start value, `startTime` null, in the browser pane. **Cause:** the pane was hidden, so no frames are produced. **Rule:** measure motion in Playwright (or with the pane shown), not in a hidden pane.
- **Symptom:** a `height: auto` to 0 transition jumped, with `interpolate-size: allow-keywords` set on the element itself. **Rule:** for fold animations use the grid-rows trick (`grid-template-rows: 1fr` to `0fr`, inner `min-height: 0; overflow: clip`); measure it in Playwright.

## Worktree tests and the shared port (2026-10-27)

**A worktree's `npm test` ran against the main checkout's docs server.** The
List spec passed with the old CSS, then a new spec failed by exactly the
change: 5180 was held by a server whose cwd was the main checkout, and
`reuseExistingServer` used it. Stopping it would break another session. →
Check `lsof -p <pid> -a -d cwd` for the server's checkout; to test a worktree
beside it, use a throwaway Playwright config that spreads
`playwright.config.ts` with `baseURL` and `webServer` on another port
(`npx vite --config playground/vite.config.ts --port 5191`; the CLI port
beats `strictPort`'s config value), then delete it.

## Figma descriptions double-escape (2026-10-27)

- Symptom: a description's `aria-current="page"` read back as `&amp;amp;…quot;`, worse after every edit.
- Cause: `node.description` returns HTML-escaped text; assigning that string back escapes it again.
- Rule: to edit a description, decode the entities and write `descriptionMarkdown`, not `description`.

**`overflow: hidden` for an ellipsis clips descenders of tight display type.** The Typography page cut off the bottom of Heading lg and up: their line heights (48 on 43px, 88 on 83px) leave Inter's descenders 2 to 6px below the line box. → For a one-line ellipsis on large type, `overflow-x: clip; overflow-y: visible` (clip doesn't force the other axis to scroll, and text-overflow still works).

## Packaging (2026-10-27)

- **A git install without `prepare` ships no `dist/`.** `npm install git+…#tag` succeeded and gave `package.json`, README and CHANGELOG only: `dist/` is gitignored and `prepack` alone did not build. → A git-installed package needs `"prepare": "npm run build"` (`docs/release.md`, option C).
- **`bland` is taken on public npm** (someone else's 0.0.1). → Public npm or GitHub Packages needs a scope (`@jgodwyn/bland`).
- **React Aria's `@internationalized/number` types need the ES2023 lib** (`Intl.NumberRangeFormatPart`). A consumer app on `lib: ES2022` with `skipLibCheck: false` fails to type-check. → Vite's own template uses ES2023; the smoke app does too.
- **Reinstalling a same-version tarball is "up to date"**: npm keeps the old copy. → The smoke test deletes `node_modules/bland` and the lockfile before installing.
- **`page.evaluate` under tsx throws `__name is not defined`**: esbuild's keep-names wraps named inner functions in `__name()`, which doesn't exist in the page. → `page.addInitScript('window.__name = (fn) => fn')` first.

## Page grid (2026-10-28)

- Symptom: a span set on a grid cell (`--span: 2`) would also reach the children of a grid nested in that cell. Cause: custom properties inherit. Rule: register per-element knobs with `@property { syntax: "*"; inherits: false; }`; `"*"` needs no initial value, so `var(--span, fallback)` still falls back.
- Symptom: the drift report showed the new column counts as `4px`. Cause: the build gives every FLOAT a px unit. Rule: unitless FLOATs are named in `cssValue` (`Layout/columns-*`); add a pattern there for any new count-like variable.
- Figma layout grids can bind `count`, `sectionSize`, `offset` and `gutterSize` (`setBoundVariableForLayoutGrid`, then reassign `style.layoutGrids`); there is no variable scope for a grid count, so count variables get `[]` scopes and are bound through the API.
- Symptom: `round(down, (100% - gutters) / 6, 8px)` gave 96 where 104 fits exactly. Cause: the division lands at 103.984 (Chromium layout units, 1/64 px), and round(down) drops a whole step; a slack value can't fix it (fractions as small as 0.25 are real at other widths). Rule: round before dividing: `round(down, 100% - gutters, n * 8px) / n`.
- Measuring a page layout in Playwright: a classic scrollbar takes about 15px of `100%`; hide overflow on `<html>` when comparing with a Figma frame.
- Figma `moveLocalGridStyleAfter` throws "Target and reference node must live in the same folder" across name prefixes (`Desktop/` vs `Tablet/`): styles are grouped into folders by their name, so a new `Desktop/md` already sits in the Desktop folder.
- An absolutely positioned grid child with `grid-column: 1 / -1` takes those lines as its containing block, but still needs `inset: 0` (or left/right) to fill it; without them it shrinks to fit (0 wide when its content is a grid of fr columns).
- A class that adds `.bland-grid` to an element that already has a docs `gap` (flex stacks) keeps that gap for its columns: set `column-gap: var(--bland-grid-gutter)` where the two meet.

## Checking a page on a phone width (2026-10-28)

- Symptom: a Playwright sweep with `isMobile: true` reported no overflow on a page that clearly ran past the screen. Cause: with a mobile viewport the layout viewport widens to fit the content (375 became 538), so `innerWidth` and `scrollWidth` match. Rule: compare with the intended device width, or test overflow without `isMobile` (`viewport` only, as the "on a phone" spec does).
- Symptom: a table in a `display: grid` wrapper pushed the wrapper wider than its card, though the Table scrolls sideways itself. Cause: an implicit grid column is `auto`, whose minimum is the content's min-content width. Rule: a grid that can hold wide content gets `grid-template-columns: minmax(0, 1fr)` (flex children: `min-width: 0`).
- The in-app browser's mobile preset resets when the pane width changes, mid-script; use a Playwright script for a sweep and the pane for a look.

## Docs on a real phone (2026-10-29)

- Symptom: copy buttons did nothing on a phone. Cause: the docs opened by network address over plain http (`npm run docs:phone`) are not a secure context, so `navigator.clipboard` is undefined. Rule: copy falls back to a hidden read-only textarea + `document.execCommand('copy')` (`useCopy`); `setSelectionRange` too, for iOS.
- Symptom: the Brand page's color picker stuttered on a phone. Cause: every pointer move re-ran the whole page, and `generateChart` alone is ~60 ms on a laptop. Rule: the picker shows its own color at once and sends at most one per frame in `startTransition`; the chart palette waits until the colors settle (`useSettled`, 120 ms). Measure with CDP `Emulation.setCPUThrottlingRate` 4: 40 drag moves went from 24 s to 2.5 s.
- Symptom: after a tap on the theme switch the phone toolbar no longer hid on scroll. Cause: `:focus-within` stays true while the tapped radio keeps focus. Rule: pin a bar for keyboard users with `:has(:focus-visible)`, not `:focus-within`.
- Playwright: `getByText` on a SegmentedBar segment times out on tap/click (the visible text sits over a visually hidden radio); tap its `label`.

## Publishing to npm (2026-10-30)

- **E403 "Two-factor authentication … is required"** → the npm account has no 2FA; publishing needs it on.
- **EOTP from a non-interactive shell** → with 2FA, npm asks for a browser confirmation and exits when it can't wait. Run `npm publish` in a visible terminal (the Terminal panel), press Enter, approve in the browser.
- **`0.0.0-stage` right after publishing** → npm's placeholder while the version is processed; the real version shows within a minute or two.

## Playwright in a cloud container (2026-10-30)

**Every test fails in a few ms: "Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1248".** The
container's preinstalled browser is an older build than the repo's @playwright/test 1.64.1 wants. → Don't run
`playwright install`; run from an uncommitted config that spreads `playwright.config.ts` and sets
`use.launchOptions.executablePath: '/opt/pw-browsers/chromium'` (same for `test:package`'s `chromium.launch()`).
That full Chromium requests `/favicon.ico`, so the package smoke test reports a console 404 there that the headless
shell never produces. Also: don't point two Playwright runs at one log file.

## Fonts in the browser (2026-10-30)

- **`document.fonts.check('16px "Anything"')` is true for a font that doesn't exist.** It only reports on faces in the FontFaceSet, and a family with none needs no loading. → To tell whether a typed family renders, measure text in `"Name", <generic>` against the generic alone (canvas `measureText`) for a few generics; any difference means it drew.
- **A mocked cross-origin `fetch` in Playwright fails without CORS headers.** `page.route` fulfils the response, but the page still applies CORS. → Add `access-control-allow-origin: *` to mocked Google Fonts CSS and font files.

## Dropdown in Playwright (2026-10-30)

- **`toContainText` on a basic Dropdown's `.bland-dropdown__button` reads "".** The button is an empty overlay over the field; the chosen value is drawn in the field beside it. → Click `.bland-dropdown__button` to open, assert the value on `.bland-dropdown__field`.
- The "Fonts in the browser" entries above (installed-font check, mocked Google Fonts) belong to the Fonts tab's first version; it has used self-hosted presets only since 2026-10-30.

## Docs server after new dependencies (2026-10-31)

**Every Playwright test timed out in `beforeEach` after merging a PR that added npm packages.** The docs dev server had been running since before `npm install`, and pages that dynamically import the new packages never finished loading. → After `npm install` brings new dependencies, restart the docs server (`npm run docs:stop`, then `npm run docs`) before testing.

## Screenshots miss small surface shifts (2026-11-02)

**Moving a dozen components from Neutral950 to Neutral900 in dark changed no screenshot.** `toHaveScreenshot` compares each pixel with a color threshold (0.2 by default), and one dark neutral step is below it. → A token swap between near steps is checked by the behaviour specs that compare computed colors with `tokenColor`, not by the screenshots; name the token a part should use in its spec. Specs that compared against `--surface-100` still passed in light, because `surface-raised` has the same light value: compare against the token the CSS uses.

**Rebinding a component's fills in Figma:** walk each variant's own nodes and stop at nested instances. They inherit the main component's binding; rebinding them creates overrides.

**Variable order can't be changed from a plugin.** `VariableCollection.variableIds` is read-only and there is no reorder call for variables or groups (only for styles). → Sorting groups is a drag in the Variables panel; recreating variables would break every binding.

## A token audit from code alone (2026-11-03)

**Asked whether every token has a job, a code-only usage count flagged about 120 tokens as unused or redundant**, including shadow colors and elevation geometry that Figma binds on every elevated layer, and reserved tokens whose descriptions give them a role nothing else has. → A token is in use if Figma or code binds it (census the whole file with one `use_figma` script: `page.loadAsync()` on every page, then node, paint, gradient stop, effect, grid and text-segment bindings). Unused is not redundant: a token is only a problem when nothing uses it and no description gives it a role, or when two descriptions claim the same role.

**A see-through fill stacks wherever nested frames repeat it.** Figma's Text Input carried the field fill on the field frame and on `main` and the add-ons inside it; while the fill was solid that was invisible, at 6% black it came out at 12 to 18%. → A translucent token goes on one layer only; scan for a field-token fill under another field-token fill after any solid-to-translucent change (`EXECUTIONS.md`, 2026-11-03).

## WebKit and Firefox in Playwright (2026-11-03)

- **Safari on the Mac does not focus a button, checkbox or radio when it is clicked**, and a press on a focused button moves focus to the page. A spec that clicks and then uses the keyboard fails in WebKit only. → `clickToFocus` in `tests/stories.ts`; a Modal's focus return to a clicked trigger is checked from the keyboard in WebKit.
- **Safari's Tab skips links** (Option+Tab reaches them). → `tabKey()` in `tests/stories.ts` (`Alt+Tab` in WebKit).
- **WebKit fires pointerenter again when the layout moves under a pointer that has not moved.** A pointer collapse of the Sidebar reopened its peek about 200ms later in WebKit only. → Sidebar ignores enter and move events at the exact point the collapse was pressed.
- **WebKit lets a running transition finish after its `transition-property` is removed** (the spec cancels it). The tab indicator kept sliding to the clicked tab after an arrow key, then jumped. → Cancel `getAnimations()` when moving an element without animation.
- **WebKit does not scroll an outer scroll area to a grown textarea's caret.** → Text Area scrolls its ScrollArea to the bottom while the caret is at the end.
- **WebKit's native radios do not wrap past a disabled last option** (Chromium wraps). Native behaviour; the spec only checks the disabled one is skipped.
- **Playwright's Firefox (1.64.1, firefox-1555) does not start on macOS 27.2**: "Could not find profile folder", also when run by hand with a profile that exists, inside or outside the sandbox, after a forced reinstall. → `npm test` runs chromium and webkit; `npm run test:firefox` is there for a machine or a later Playwright where it starts.
- **Playwright's `grantPermissions(['clipboard-write'])` exists only in Chromium.** → Code snippet's spec records `navigator.clipboard.writeText` in other engines.
- **Snapshot paths have no project name**, so any `toHaveScreenshot` outside Chromium compares with the Chromium baseline. → Screenshot tests skip outside Chromium; `visual.spec.ts` and `docs.spec.ts` are `testIgnore`d there.

**Figma's variant option order is not the layer order, and has no API.** Moving children changed nothing (Chip children ran sm, md, lg; options read md/lg/sm). Renaming every variant with one value to a temporary value and back also changed nothing when the renames ran without a read in between: the option was replaced in place. → To move a value to the end: rename one variant to a temporary value, read `set.componentPropertyDefinitions` (the temporary value is appended), rename the rest, read, then the same back (rename one, read, rename the rest, read). A value held by one variant needs a temporary cloned variant to hold the slot; remove it afterwards. Node ids stay, so instances keep their values. Moving values to the end in the wanted order sorts them (2026-11-03).

**An empty auto-layout frame does not shrink to its padding through the Plugin API.** A `figma.createAutoLayout()` spacer with only `paddingTop` bound to space-sm stayed at the default 100 tall, also after `layoutSizingVertical = 'HUG'`. → For a spacer, use a frame with `layoutMode = 'NONE'`, `resize(w, 8)` and its height bound to the token (2026-11-03).
- **Outside Chromium a top-layer exit doesn't play**: without `overlay` transitions, WebKit makes a hidden popover `display: none` at once, so `@starting-style` entrances worked and exits didn't. → Exit styles on `[data-closing]` while still shown, hide after (`overlay/exit.ts`).
- **"Skip the first effect run" with a ref breaks in Strict Mode**: the effect runs twice on mount, so the second run looked like a change and slid every open Sidebar group in on load. → Compare with the last state the effect handled, not a mounted flag.
- **A hover spec that clicks at once never has hover on**: Playwright moves and clicks within the peek delay, so a bug that needs a resting pointer (the Sidebar reopening after collapse) passed. → Rest past the delay before the press, and record every state with a MutationObserver: a wrong state that corrects itself passes a final-state check.
- **A story frame with `overflow: hidden` clips anything that draws past the component's box** (the Sidebar's peek), and only at window widths where the docs column is narrow, so a 1024px test viewport never sees it. → Give such frames a minimum width that holds the open state; check docs pages at a narrower window too.

## Vite public HTML (2026-11-06)

- Symptom: `site/public/proto/headline.html` came back as the landing page's `index.html` in `npm run site`.
- Cause: Vite's dev server does not serve `.html` files from `public/`; the SPA fallback answers instead.
- Rule: a throwaway HTML page goes at the Vite root (`site/x.html`), not in `public/`.

## Brand steps on a nested element (2026-11-07)

- Symptom: a picture setting `--brand-*` on its own element kept Bland's blue in its Button and Toggle.
- Cause: the brand-colored roles are computed where `tokens.css` declares them (`:root`, `[data-theme]`), from the brand steps there, and inherit as resolved colors.
- Rule: to rebrand one area (a preview, an illustration), put the `--brand-*` steps and `data-theme="light"` (or dark) on the same element; the theme rule then recomputes every role from that element's steps. A project's real brand still goes at `:root` (`docs/brand.md`).

## A fixed-width component in a grid cell (2026-11-07)

- Symptom: Notification (width notification/width 384, max-width 100%) overflowed a 312px grid cell on phones and sliced its Reply button.
- Cause: `max-width: 100%` on a centred grid item did not cap it at the cell in Chromium; the cell grew to the item's width.
- Rule: size it as `width: min(var(--notification-width), 100%)` from the page, rather than relying on its `max-width`.

## Still screenshots of a sweep (2026-11-07)

- Symptom: a Chrome screenshot of the light/dark sweep showed the line about 6% away from the dark half's edge.
- Cause: capture timing; sampled with `getComputedStyle` every 90ms, the `translate` and the `clip-path` moved together.
- Rule: check paired motion by sampling both values in the page, not from one screenshot (Stageshow: film it).

## Faded text and axe (2026-11-08)

- Symptom: axe failed color-contrast at 1.02:1 on the landing page's props card.
- Cause: the type hint on unselected options was `opacity: 0`, still in the tree, so axe measured near-white text.
- Rule: text that is hidden on purpose gets `visibility: hidden` as well as the fade (transition both), never opacity alone.

## Measuring inside a scaled ancestor (2026-11-08)

- Symptom: in the landing page's feature row, the Segmented bar's white thumb sat off "Week" once its card came to the middle; the keyboard card's scripted focus ring sat on the label.
- Cause: both measured with `getBoundingClientRect` (screen pixels) while their card had `scale: 0.797`, then drew those lengths inside the same scaled card. The tab indicator divided by CSS `zoom` only.
- Rule: a length measured on screen and drawn back inside the element is divided by `rect.width / offsetWidth` of the container, which covers zoom and any scale transform (`src/components/tabs/tabs.tsx`).

## Playwright's wheel in WebKit (2026-11-08)

- Symptom: in `tests/feature-row.spec.ts`, `page.mouse.wheel(0, 600)` during the row's guidance glide left `scrollY` unchanged in WebKit, every run; the same steps in a standalone Playwright WebKit script scrolled 527 to 587px and the row settled on the next card.
- Cause: not found; the difference is the test runner's WebKit context (same device, same viewport).
- Rule: don't rely on the emulated wheel for page scrolling in WebKit specs; check scroll behaviour with `window.scrollTo` there, and keep wheel-specific checks to Chromium with a comment saying why.

## An overshooting pop widens the page (2026-11-08)

- Symptom: on a phone, the landing page's `scrollWidth` was 443 instead of 390 in a spec, though nothing in the section was wider than the screen once it had settled.
- Cause: the "What you get" parts pop in on a back-out curve that swings past full size; a part as wide as the screen (Modal, File upload) grew past the edge for a moment, and transforms count toward scroll overflow.
- Rule: a container whose children pop or scale past 1 gets `overflow-x: clip` (not hidden: no scroll container, sticky still works), or the overshoot stays under the room there is.

## A scripted edit that matched the wrong copy (2026-11-08)

- Symptom: `site/src/landing-values.css` held everything from the feature cards to What you get twice, after a script meant to delete one rule.
- Cause: the script cut from my rule's comment to the first match of its `color: color-mix(…)` line, and the hero's rule earlier in the file has the identical line, so the cut ran backwards and the slice joined the file to an earlier copy of itself.
- Rule: delete a block by an anchor that is unique to it (check the count first), or with Edit on the exact text; never search for a line two rules share.

## Rects inside a turned ancestor (2026-11-08)

- Symptom: on the landing page's tilted Segmented bar the thumb sat below its tab and 3px too wide.
- Cause: `getBoundingClientRect` of a rotated element is its upright bounding box, so the rects no longer say where the tab is; dividing by the scale (the earlier fix) covers zoom and scale, not rotation.
- Rule: when an element's rect size and its layout size (offsetWidth/Height, after dividing by the scale) disagree, something turns it: measure with layout offsets instead (`src/components/tabs/tabs.tsx`).

## Wheel gestures in Playwright (2026-11-08)

- Symptom: a spec's 14-event "flick" sometimes moved two slides in Chromium under load.
- Cause: `page.mouse.wheel` waits between events, and under load the gaps outgrew the 200ms quiet window that ends a gesture.
- Rule: test gesture logic with WheelEvents dispatched in the page at a fixed 16ms (a trackpad's rate); keep `mouse.wheel` only for checks that need the browser to scroll natively.

## A font override in a dark area (2026-11-09)

- Symptom: on the landing page's showcase, setting `--font-body` on a card with `data-theme="dark"` left its text in Inter.
- Cause: `tokens.css` declares the `--type-*` composites (which read `var(--font-body)` / `var(--font-heading)`) in `:root, [data-theme="light"]` only, so a dark element inherits them already resolved from the nearest light ancestor or `:root`. `--font-heading` is `var(--font-body)` at `:root`, also resolved there.
- Rule: to change fonts in one area, set `--font-body` and `--font-heading` on an element with `data-theme="light"` around the area, and put the dark `data-theme` (with any brand steps) on an element inside it (`site/src/showcase/Showcase.tsx`, `Themed`). A project's fonts at `:root` are unaffected.

## Easing from one brand to another (2026-11-09)

- Symptom: brand steps set as inline custom properties jump to the new brand; a transition on them does nothing.
- Cause: an unregistered custom property is a token stream and cannot interpolate. Registered with `@property` (`syntax: '<color>'`), it can, and every role computed from it follows each frame. A child that only inherits a transitioning value does not ease in its own turn.
- Rule: register the 26 steps (`landing-values.css`), list them in `transition-property`, and set the steps on every element that should ease on its own schedule (each showcase card holds its own, Bland's blue included).

### `border-radius` beside `.bland-smooth` undoes the smoothing (2026-11-09, landing-showcase)

- **Symptom:** the showcase's cards looked less rounded than Figma's rad-lg with 100% smoothing.
- **Cause:** the card's own rule set `border-radius: var(--rad-lg)`. It has the same specificity as `.bland-smooth` and loads later, so it replaced the smoothing's `calc(var(--bland-radius) * 2)`: 16px with `corner-shape: superellipse(2)` is far squarer than Figma.
- **Rule:** on a `.bland-smooth` element, set only `--bland-radius`, never `border-radius`.

## Landing page: Figma kit (2026-11-09)

- **Prettier rewrote the quotes.** Symptom: `npx prettier --write` turned every `'` into `"` in new site files. Cause: the repo has no Prettier config, so Prettier's defaults apply. Rule: don't run bare Prettier here; if formatting is needed, `--single-quote --print-width 160` matches the code.
- **An inert element can't be hovered in Playwright.** Symptom: `locator.hover()` on an `inert` picture timed out ("<div> intercepts pointer events"). Cause: inert content takes no pointer events, so its parent receives them. Rule: hover the picture's wrapper (the element `usePlayback` observes), not the inert picture.
- **A story step shorter than the poll can't be waited for.** Symptom: `toHaveAttribute('data-step', '11')` never matched a 200ms press step. Cause: Playwright's retries poll slower than the step lasts. Rule: assert the state the step leaves behind on the next, longer step.

### A blurred text copy's room widens the page (2026-11-09, landing-footer)

- **Symptom:** on a 320 phone the landing page scrolled sideways, 358 wide, once the footer was in.
- **Cause:** each glow copy sits at `inset: -pad` (the character rise plus three blur radii, 96px) so its blur is not cut at the word's box. Absolutely positioned overflow still counts toward the page's scroll width.
- **Rule:** a section with glow or blur copies around its text clips sideways (`overflow-x: clip`, which does not make it a scroll container), and a phone spec checks `document.documentElement.scrollWidth`, not the section's own.

### Replacing "from my block to the end" of a shared file deletes what came after (2026-11-09, landing-faq)

- **Symptom:** the footer lost its sizes, type and height: every `--landing-footer-*` value was gone from `landing-values.css`.
- **Cause:** the FAQ session rewrote its own block with `s[:start] + new`, cutting the file at its block's heading. The footer session had appended its block after the FAQ's in the meantime, so it went too.
- **Rule:** in a file other sessions append to, replace your block between its own start and end markers (the next `/* ---------- ` heading), or with an exact `old`→`new` string, never "to the end of the file". Re-read the file's tail right before writing. Restored from the footer session's transcript.

### A visually hidden list without a size widens a phone page (2026-11-09, mobile pass)

- **Symptom:** at 375 the landing page scrolled sideways, 877 wide, once "What you get" rendered its screen-reader list on phones.
- **Cause:** `position: absolute; overflow: hidden; clip-path: inset(50%); white-space: nowrap` with no width: the box keeps its full one-line width, and `scrollWidth` counts it even though nothing paints.
- **Rule:** a visually hidden element also gets one pixel of width and height (`--space-3xs`) and a negative margin. Check `scrollWidth` at 320 to 390 after anything new renders on phones.

### The hero headline's scroll wave is about 140px on a phone (2026-11-09, mobile pass)

- **Symptom:** on Godwin's phone the hero headline "almost never animates" from fill to outline.
- **Cause:** the wave runs from `titleStart` 0.063 to `titleEnd` 0.12 of the hero track (4 screens, so 3 screens of travel): about 0.17 of a screen, roughly 140px at 844 tall, which one flick passes in a frame or two. Each frame also sets React state for the whole hero (every word's `--bold`, every description word's ink), which restyles and repaints 48 blurred, masked glow layers (6 words x 8). A phone drops those frames, so the start and end states are all that shows.
- **Rule:** before tuning it, give the wave a phone-sized share of the track (or drive it from the time since the scroll started), and move per-frame values off React state onto CSS custom properties set on one element. Not changed yet: Godwin decides first.
- **Update (2026-11-09, hero session):** Godwin asked for the footer's pace: the wave is 0.02 to 0.22 now (about 500px on an 850px screen). Measured in Chrome, the blurs were the cost: hiding the glow or its filter took frames from 100 ms+ (dev) to 8 ms, the masks barely mattered. `will-change: opacity` on `.hero__glow` keeps each blurred layer on the compositor, so a scroll frame only changes its opacity: production frames during the change went from a 42 ms p95 (about 70 fps) to 10 ms (120 fps). The dev server stays far slower on the first pass through the page (React's development build re-rendering every section on scroll); judge scroll performance on a production build (`vite build --config site/vite.config.ts`).

### A pinned stage that shifts on a phone is a sizing problem, not a scrolling one (2026-11-09, mobile pass)

- **Symptom:** on a real phone the pinned hero moved up a little as scrolling began. I answered it with a timer, then with captured swipes, then with gain and fling for those swipes, each patching the last, until Godwin asked for a step back.
- **Cause:** the stage was `100svh` (the screen with the address bar shown). The bar slides away as the page scrolls, the screen grows, and the stage moved with it and left a band.
- **Rule:** size a sticky full-screen stage `100lvh` and keep its content inside the small viewport (`100lvh - 100svh` extra padding or inset). Never replace native scrolling to hide a layout problem. Name the cause before writing a fix, and test scroll feel on a real phone: a desktop wheel or trackpad hides it.

### Playwright can't judge scroll snapping (2026-11-09, mobile pass)

- **Symptom:** with `mouse.wheel` flicks, Chromium snapped back to the start every time and WebKit skipped slides despite `scroll-snap-stop: always`, even on a minimal textbook page (a nested mandatory scroller).
- **Cause:** synthetic wheel events carry no gesture phases (began, momentum, ended). Each one reaches the browser as its own gesture, so snapping runs per event instead of once per flick.
- **Rule:** check snap and scroll feel on real hardware (a trackpad, a mouse wheel, a phone). Keep headless specs to structure (the snap points exist, each slide shows at its point), not gesture feel. Likewise, never infer gesture boundaries from wheel deltas in JavaScript; let native snapping decide.

### Many large `will-change` layers run a phone out of GPU memory (2026-11-09, mobile pass)

- **Symptom:** on a phone the hero headline blinked out for frames at a time while scrolling, leaving only its glow; on desktop it was fine.
- **Cause:** 48 blurred copies, each its own compositor layer (`will-change: opacity`) padded for its blur: about 237 MB at 3x. Chrome's phone tile budget is far smaller, so it dropped tiles. Separately, setting React state every scroll frame re-rendered hundreds of spans: 40 to 100 ms a frame at 4x CPU throttle.
- **Rule:** add up layer memory (width x height x DPR squared x 4) before reaching for `will-change`, on a 3x phone profile. Draw glows as a `text-shadow` on the element that already fades (its radius is twice a `blur()` filter's). Write per-frame scroll values to the DOM directly, and keep React state for discrete changes. Measure frame times with CPU throttling, not on a desktop.

### A Figma SVG export can flatten strokes into megabytes (2026-11-10, mobile pass)

- **Symptom:** the hero's 52px swatches icon was 2.3 MB, two thirds of the landing page's download; the other icons were 3 to 7 KB.
- **Cause:** Figma exported its outside strokes as filled outlines traced in tiny segments (paths of up to 280,000 characters), while the other icons kept `stroke` attributes.
- **Rule:** check the size of every exported SVG (`ls -laS`); anything past a few KB for an icon is a broken export. Re-export, or rebuild the outline as a stroke of its clean path, and compare the renders pixel by pixel before swapping.

### Chrome DevTools MCP locked by another session (2026-11-10)

- **Symptom:** every chrome-devtools tool fails with "The browser is already running for ~/.cache/chrome-devtools-mcp/chrome-profile".
- **Cause:** one shared profile; another Claude session's DevTools browser holds it.
- **Rule:** don't close the other session's browser. For performance numbers, run the Lighthouse CLI against the production preview instead (`npx -y lighthouse@13 http://localhost:5183/ --only-categories=performance --form-factor=mobile --chrome-flags="--headless=new"`, and `--preset=desktop`), three runs, median.

### Per-character spans move the LCP element (2026-11-10, landing audit)

- **Symptom:** after the phone headline grew, mobile LCP went from 0.92 s to 2.56 s in Lighthouse, with nothing heavier loaded.
- **Cause:** the headline is one `inline-block` span per character, so no single text block in it is large; on a phone the four-line description became the largest text and so the LCP element. It fades in from opacity 0 after a 420 ms delay, and LCP waits for that paint. On desktop the headline stays LCP.
- **Rule:** after changing hero type or a load animation, check which element Lighthouse names as LCP on mobile and desktop. Never start the LCP candidate at opacity 0 behind a delay; fade it from a visible state or with no delay.

### A preview server's single-page fallback fakes robots.txt (2026-11-10, landing audit)

- **Symptom:** Lighthouse reported `robots.txt` "not valid" with 14 errors, and `llms.txt` and the ARD manifest as malformed, though none of them exist.
- **Cause:** `vite preview` (and Cloudflare Pages without a `404.html`) answers every unknown path with `index.html` and status 200.
- **Rule:** for a client-rendered site, ship real `robots.txt`, `sitemap.xml` and a `404.html` in `site/public/`; read "invalid file" audits as "missing file" first. The skill's `analyze.sh` also finds nothing on such a page (the HTML is an empty root), so rely on the rendered audit.

### Preload the weight the text really uses (2026-11-10, landing audit)

- **Symptom:** preloading Inter 400 and 700 for the hero cut CLS from 0.058 to 0.025, not to 0.
- **Cause:** the hero description is Inter 600 (`--landing-hero-description-font`), not 400; the font still arrived late and the paragraph re-flowed.
- **Rule:** read the computed `font` of each shifting element before choosing preloads; the layout-shift sources (Lighthouse `cls-culprits-insight`, or a `layout-shift` observer) name the element, its font token names the weight.

### Bland's classes without the component leave the CSS behind

- **Symptom:** the 404 page's link buttons (`bland-button` classes on `<a>`) rendered as plain blue links in the build.
- **Cause:** each component's CSS is imported by its `.tsx`; a page that imports only `Logo` from `src` gets Logo's CSS, and the unused Button module (with its CSS) is tree-shaken away.
- **Rule:** a page that uses a component's classes without rendering the component imports that component's CSS file itself.

### Lighthouse's simulated FCP counts every request made before the observed first paint

- **Symptom:** mobile FCP and LCP jumped to 2.8 s in two of three runs while unthrottled first paint was 0.45 s and real throttled Chromium LCP stayed about 1.3 s.
- **Cause:** Lantern builds its FCP estimate from all network requests started before the observed first paint. The landing hero's letters start at opacity 0, so its first contentful paint comes after the lazy `rest` chunk (188 KB) was requested, and the simulation loads that chunk before painting.
- **Rule:** on a page whose first paint waits for an entrance, request below-the-fold chunks after the first paint, and judge mobile timing by several runs plus a real throttled browser, not one simulated number.

- **A link to /docs/ on the site's dev server reloads the landing page.** Symptom: Read the docs did nothing in `npm run site` (5182). Cause: the docs are only copied under `/docs/` by `site:build`; the dev server's SPA fallback answers `/docs/` with the landing's index.html. Rule: dev-only routes to the other app go through `devDocsRedirect()` (to 5180); test links to /docs/ on `site:preview` (5183) or with `npm run docs` running.

## `process` in library code breaks the declarations build (2026-11-10)

- Symptom: `npm run typecheck` passes, `npm run build` / `npm pack` / `test:package` fail at `tsc -p tsconfig.build.json` with TS2591 "Cannot find name 'process'".
- Cause: the build config has `types: []` (no Node types), while the root tsconfig has them. The Logo `children` deprecation warning was the first use of `process.env.NODE_ENV` in `src/`.
- Rule: run `npm run build` (not only `typecheck`) after touching library code. A development-only warning declares `declare const process: { env: { NODE_ENV?: string } } | undefined;` in its own module and guards with `typeof process !== 'undefined'`.
