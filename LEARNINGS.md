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

## Fonts

**Fontsource *variable* packages register a different family name**
(`"Inter Variable"`), which never matches `--font-family-sans: "Inter"`. →
Use the static packages (`@fontsource/inter/400.css` etc.), whose family names
are exactly "Inter" and "Geist Mono", and load only the weights the text styles
use.

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

## Tooling

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

## Browser pane

**Navigating to a URL that only changes the hash can screenshot the old page.**
The screenshot fires before the hashchange render. → Click the sidebar link, or
wait a second, before trusting the screenshot.

**`form_input` on a React-controlled checkbox flips the DOM, not React's
state.** The docs "focused" toggle looked on but did nothing; the next click
turned it off. → Click React checkboxes with `computer` instead.
