# INTERFACE.md — design decisions

Every design and API decision Bland has settled in code, written so a new
component can be built from this file, `CLAUDE.md` and `docs/components.md`
without re-deciding anything. If you are about to invent a value, a pattern, a
prop name or a component, look here first.

**Update this file the moment a decision is made**, not at the end of a task. A
decision is anything a future component would otherwise have to guess at. The
short rule goes in `CLAUDE.md` ("Decisions code must follow"); the detail, the
reason and the date go here.

Companions: `LEARNINGS.md` (bugs and gotchas), `EXECUTIONS.md` (what was done,
when), `docs/components.md` (how to build one).

---

## 1. Foundations

### Tokens are the only source of values
- Figma owns every value; `npm run tokens` generates `src/tokens/tokens.css`
  from the verified export. 612 variables, 517 CSS tokens (2026-10-17).
- Components read only Theme and scale tokens. Primitives are never emitted.
- No value without a token. When none fits, stop and ask Godwin; the answer is a
  new Figma variable, synced (that is how `duration/spin` came about).

### Light and dark
- Light on `:root`. Dark redefines only the Theme tokens and the elevation
  shadows, under `[data-theme="dark"]`, and under `prefers-color-scheme: dark`
  when no `data-theme="light"` is set. Apps can use either; which one products
  use is still an open question in `CLAUDE.md`.

### Type
- Inter for interface text, Geist Mono for code, self-hosted through
  Fontsource (`bland/fonts.css`): Inter 400, 500, 600 and Geist Mono 400, 600
  only, because those are the weights the text styles use.
- Components set type with the composite: `font: var(--type-body-md)`.

### Corners and focus
- Every rounded element gets `bland-smooth` (`corner-shape: superellipse(2)`).
  The exponent is a first guess, not yet tuned against Figma; tune it once in
  `src/styles/base.css`.
- Every focusable element gets `bland-focus-ring`: `:focus-visible` only, 2px
  `--border-focused`, 2px offset.
- **Full radius (`rad-rd`) skips `bland-smooth`** (2026-10-18, Indicator): set
  `border-radius: var(--rad-rd)` directly. On a circle or pill Figma's 100%
  smoothing has no room to spread and the shape stays round, while
  `corner-shape: superellipse(2)` would turn it into a squircle. Applies to
  Indicator, Badge, Avatar, Chip and every other pill or circle.

### Deliberate contrast exceptions
- White labels on primary colored fills stay white even where they fall under
  4.5:1: danger primary in dark (3.7:1) and success primary in light (4.47:1,
  Godwin kept it on 2026-10-18). Both are token values; `tests/a11y.spec.ts`
  excludes exactly these. Any other contrast miss is a bug to raise.

### Disabled
- Disabled states use the disabled color tokens. No opacity, ever; the lint
  rejects `opacity` on disabled selectors.

## 2. Component API conventions (decided 2026-10-17)

- **Plain CSS classes, not CSS Modules.** `.bland-<name>`, parts
  `.bland-<name>__<part>`, variants as data attributes (`data-size`,
  `data-type`, `data-emotion`), so projects can override with ordinary
  selectors.
- **Figma property names become camelCase props**, prefixes dropped; variant
  values stay lowercase strings. State (rest, hover, pressed) and `👀 Focused`
  are never props.
- **Defaults:** a component's size defaults to `md` in code even where Figma's
  component default is `xs` (Button: xs is for dense desktop UI only).
- **A Figma property that clashes with a native attribute is renamed on the
  native side:** Button's Figma `Type` is the `type` prop; the native button
  type is `htmlType`, defaulting to `button` so a Button in a form never
  submits by accident.
- **Slots and instance swaps are React nodes**: `children`, `iconStart`,
  `iconEnd`, `icon`, `leading`, `trailing`.
- Remaining native props spread onto the root; `className` is accepted.

## 3. Icons (decided 2026-10-17)

- Bland ships no icon pack. Every icon prop takes any SVG node, so projects can
  use Phosphor at any weight, Lucide or their own.
- `<Icon>` sizes the SVG from `icon/*` and colors it with `currentColor`.
  Stroked icons get `stroke-md` (1.5) at every size with
  `vector-effect: non-scaling-stroke`; filled icons keep their own weight.
- A component sets its icon size with `--bland-icon-size` on the slot's parent;
  the default lives on `:root` (see LEARNINGS).
- Bland's own icons (`src/icons/`) are exported from the Figma Icons page as
  components need them: Check, X, CaretDown, Plus, Minus, User, Spinner,
  MagnifyingGlass, XCircle, WarningOctagon, CheckCircle, WarningCircle, Info so far.

## 4. Overflow

- Anything that scrolls uses `ScrollArea`: the `.bland-scroll-fade` mask plus an
  overlay thumb (Figma `_scrollbar`) 4px in from the scrolling edge, always
  visible, draggable, outside the mask. The native scrollbar is hidden; wheel,
  touch and keyboard scrolling stay native.
- Fade length `md` (32) by default, `sm` (16) for compact areas such as Menu.
- The thumb's minimum length is `control/xs` (24).

## 5. Motion

Rules in `CLAUDE.md` and `docs/motion.md`. Decisions on top of them:
- **Loading spinners** turn once per `duration/spin` (800ms, added 2026-10-17)
  with `easing/linear`, and stand still under `prefers-reduced-motion`.
- **Press feedback:** `scale(0.97)` on `:active`, `duration/sm`, `easing/out`.

## 6. Components

### Button and Icon Button (2026-10-17, the reference component)
- Props: `size` xs/sm/md/lg (default md), `emotion` brand/success/danger/warning,
  `type` primary/secondary/ghost/stroke, `htmlType`, `iconStart`, `iconEnd`,
  `loading` (`true` = start side, or `'start'` / `'end'`).
- Loading puts the spinner in place of the icon on that side, keeps the label
  and colors, sets `aria-busy`, and ignores clicks until it ends.
- Icon Button requires `aria-label`; loading swaps its icon for the spinner.
- CSS pattern every component copies: emotion and type blocks set private
  custom properties, and one rule per state reads them.

### Indicator (2026-10-18)
- `import { Indicator } from 'bland'`. Props: `size` sm/md/lg/xl/2xl (default
  sm, Figma's), `emotion` brand/neutral/success/danger/warning (default brand),
  `type` primary/secondary (default primary), `children` (the label, usually a
  count), `ring` (default **false**), plus native span props and `className`.
- sm (8) and md (12) are dots and ignore `children`; lg (16), xl (20) and 2xl
  (24) show it and grow into a pill (height = min width = `indicator/*`).
  No `children` at lg+ = an empty circle (Figma `👀 Label` off).
- `ring` = Figma `👀 Ring`, a `stroke-lg` `surface-100` outside outline as a
  box-shadow (adds no size). Figma defaults it on, code defaults it off: the
  set description says to turn it on only over an Avatar or image. Nesting
  components pass `ring` themselves.
- A dot with meaning gets `aria-label`; the Indicator then sets `role="img"`.
  A labelled one is read as its text. Static, never focusable.
- Root is `.bland-indicator` with `data-size`, `data-emotion`, `data-type`,
  `data-ring`; label part `.bland-indicator__label`. Position it from the
  parent (Avatar's slot), not inside Indicator.

### Badge (2026-10-18)
- `import { Badge } from 'bland'`. Props: `size` sm/md/lg/xl (16, 20, 24, 32;
  default sm, Figma's), `emotion` brand/neutral/success/danger/warning,
  `type` primary/secondary/outline, `children` (label), `iconStart`,
  `iconEnd` (Figma `🌟 Leading/Trailing icon`; the `👀` booleans are "pass an
  icon or don't", same names as Button).
- **Icon only** is the same component, not an IconBadge: pass `icon` (no
  children) and a required `aria-label`; the badge becomes a circle with
  `role="img"`. Its size type excludes sm and defaults to md, as the set
  description asks. The props type is a union (`BadgeLabelProps |
  BadgeIconOnlyProps`), so TypeScript rejects a label plus `icon`.
- Sizes from Figma: padding `space-sm` (xl `space-lg`), gap `space-2xs` on sm
  else `space-xs`, type body-sm/md/lg/lg, icons `icon/xs` (sm, md), `icon/sm`
  (lg), `icon/md` (xl).
- Outline: no fill, `stroke-sm` inside border as an inset shadow in
  `Border/border-{brand,bold (neutral),success,danger,warning}`, content in
  the `*-secondary-content` token.
- Long labels truncate with an ellipsis. Static: no states, not focusable.
- **Optical padding (code only, 2026-10-18, Godwin):** an icon on one side
  makes that side look roomier, so on sm, md and lg the side without an icon
  steps up from `space-sm` (8) to `space-md` (12) when the other side has one
  (`data-icon="start"|"end"`). Both icons or none keep 8. xl keeps
  `space-lg` (16) on both sides, since the next step (24) is too big a jump.
  Figma can't express this and doesn't show it.

### Avatar (2026-10-18)
- Props: `size` xs–3xl (default md; Figma's default xs is 16px), `type`
  image/placeholder/initials, `src`, `alt`, `initials`, `topSlot`,
  `bottomSlot`, `imgProps`.
- **`type` is optional:** omitted, it is image with a `src`, initials with
  `initials`, else placeholder. A missing or failed image falls back to the
  initials, then the placeholder; the failure is keyed to the `src`, so a new
  `src` tries again. The image's `surface-500` fill shows while it loads.
- **Accessible name is `alt`.** With it, the image (or the initials or
  placeholder circle, as `role="img"`) is named; without it, the avatar is
  decorative, for when the name is printed beside it.
- **Initials:** xs shows the first character (Figma's description); other
  sizes show up to two, so a name like "Ada Lovelace" passed as "AL" fits.
- **Two slots, as in Figma:** `topSlot` for a count, `bottomSlot` for a status
  dot. Both sit outside the clipped circle, centred on its edge at 45 degrees
  (`50% ± 50% × cos(45deg)`), in a box of `avatar/slot-*` that fits the
  matching Indicator size. They accept any node; the story wires in
  `<Indicator ring>` at the matching size (slot xs/sm 8 = Indicator sm,
  md/lg 12 = md, xl 16 = lg, 2xl 20 = xl, 3xl 24 = 2xl), a danger count on
  top and a success dot with `aria-label` at the bottom. Below avatar xl the
  Indicator is a dot, so the count shows from xl up.
- **Circles skip `.bland-smooth`:** on a full circle Figma's smoothing has no
  straight edge to act on, and `corner-shape` would make it a squircle.
- Not interactive; wrap it in a button or link when it needs focus.

### Chip and Pill (2026-10-18)
- **Chip is not interactive; Pill is a toggle.** From the set descriptions:
  Chip is a "compact label for a value, filter or attribute" with no selected
  state, so the chip is a `<span>` and only its close button is a `<button>`.
  Pills is "selectable … a toggle button with aria-pressed", so a Pill is a
  native `<button aria-pressed>`. Neither is both.
- **Chip** (`import { Chip } from 'bland'`): `size` sm/md/lg (default sm, as
  in Figma; 20, 24, 32), `children` (label), `leading` (Figma `🧩 Slot`, one
  Avatar or Indicator; named for its place because a Figma slot called just
  "Slot" says nothing), `count` (Figma `Type=countable` + `✏️ Count`), and
  `onRemove` (Figma `Type=cancellable`). Figma's `Type` is not a prop: it
  follows from `count` / `onRemove`, and `data-type` reflects it. Both at
  once is allowed in code (count, then close), though Figma has no such
  variant.
- Chip's count is **its own box, not an Indicator**: Figma draws a
  `chip/trail-*` frame filled `surface-200` with `text-subtle` body-sm-bold
  (body-md-bold on lg). It grows past square for wide numbers.
- Chip close button: `aria-label` defaults to "Remove <label>" when the label
  is a string (`removeLabel` overrides). The box is `chip/trail-*` (16, 20,
  24) but the hit area is a centred `control/xs` (24) `::before`, as the set
  description asks. No hover or disabled look: Figma has none. Press feedback
  `scale(0.97)`. Removing is the app's job (`onRemove`), the chip never hides
  itself.
- **Pill** (`import { Pill } from 'bland'`, folder `pills/` after the Figma
  set): `size` sm/md/lg (default sm, as in Figma; 32, 40, 48, `min-width`
  the same), `selected` (controlled) or `defaultSelected`, `onSelectedChange`,
  `icon` (Figma `🌟 Icon`, icon/md at every size), `count` (Figma
  `👀 Number`), `htmlType` (default `button`), `disabled`. `👀 Label` off =
  no `children`; give it an `aria-label`. Its width then follows the padding
  (44 on sm), as in Figma.
- Pill colours: rest `surface-100` with a `stroke-sm` `border-subtle` inside
  stroke (inset shadow), hover and disabled `surface-200`, disabled text
  `text-minimal`. Selected: `Control/checked-{rest,hover,disabled}`, white
  content in both modes, no stroke. Full radius without `.bland-smooth`.
- Pill `count` is Figma's nested Indicator: a number or string becomes an
  Indicator xl secondary, brand when selected and enabled, neutral otherwise
  (Figma's selected-disabled pill switches it back to neutral). Any other node
  is shown as is.

### Checkbox and Radio (2026-10-18)
- `import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'bland'`. Folders
  follow the Figma sets: `checkbox/` and `radio-button/`, each with its group.
  The code name is `Radio`, shorter than Figma's "Radio Button".
- **The native input is the box.** `<input type="checkbox|radio">` with
  `appearance: none` is drawn as Figma's box or circle (fill, `stroke-sm`
  inside stroke as an inset shadow), so keyboard, forms, `:checked`,
  `:indeterminate`, `:disabled` and the focus ring stay native, and
  `.bland-focus-ring` lands 2px off the box exactly as Figma's focus-ring
  frame. The glyph (Check / Minus, icon/xs) or radio dot (`selection/dot-*`)
  is a sibling shown by `:checked` / `:indeterminate`, with no pointer events.
- **The `<label>` is the hit area**: Figma's hit-area frame (control/xs 24 on
  sm, control/sm 32 on md) plus the label text, so every pixel of it toggles.
  Hover (`Surface/surface-300`, or `Control/checked-hover`) reacts anywhere on
  the label. Label offsets come from Figma's label-wrap (top padding
  `space-2xs` sm, `space-xs` md) so the first line centres on the box and
  longer labels wrap beside it.
- **Props split:** `className` goes on the root label; every other prop
  (`name`, `value`, `onChange`, `aria-*`, `data-*`, `ref`) on the input,
  because form code expects them there. This is the pattern for every
  native form control in Bland.
- **Mixed** is `checked="mixed"` (or `defaultChecked="mixed"`), set as the
  input's `indeterminate` property, which screen readers announce as mixed.
  A controlled mixed checkbox stays mixed after a click until the parent
  changes `checked`; an uncontrolled one becomes checked, as natively.
- Figma's `👀 Label` defaults off; in code the label is `children`, and a
  checkbox without one needs `aria-label`. Default size sm (Figma's; 24 is
  the minimum target).
- **Groups are `<fieldset>`s** (`role="radiogroup"` on RadioGroup) so
  `disabled` disables every control natively. Figma draws no legend, so the
  group's name is a required `aria-label` or `aria-labelledby` (a TypeScript
  union) instead of a visual legend Bland would have to invent. Vertical rows
  touch (gap `space-none`; the hit areas give the 8 / 12 box spacing),
  horizontal items sit `space-lg` apart and wrap. The group's `size` is
  passed down through context; a child's own `size` wins.
- RadioGroup gives every radio one `name` (generated with `useId` when left
  out), so the browser keeps one selected and arrow keys move between them;
  `value` / `defaultValue` / `onValueChange` control it from the group.
- Disabled uses `Border/border-subtle` (unchecked) or
  `Control/checked-disabled` and `Text/text-minimal` on the label; no opacity.
- Press feedback `scale(0.97)` on the box, dropped under reduced motion.

### Toggle (2026-10-18)
- `import { Toggle } from 'bland'`, folder `toggle/`. Same pattern as
  Checkbox: a native `<input type="checkbox" role="switch">` drawn as Figma's
  track (`appearance: none`), so Space, forms, `:checked`, `:disabled` and
  the focus ring stay native and screen readers announce on/off. The knob is
  a sibling `<span>` laid over the track (an input has no children). The
  `<label>` is the whole hit area; `className` on it, every other prop (and
  `ref`) on the input.
- Track `toggle/track-*` by `control/xs|sm`, padding `space-xs`, fill
  `Toggle/surface-{checked,unchecked}` with `-hover` and `-disabled`; knob
  `toggle/knob-*`, `Toggle/knob-rest` (white in both modes), `knob-disabled`.
  Root gap `space-sm`; the label is body-lg at both sizes (Figma's), text-bold,
  disabled text-minimal. Full radius, no `.bland-smooth`.
- The knob's travel is track width minus track height (40 - 24 = 16 on sm,
  56 - 32 = 24 on md), which equals track - knob - 2 x space-xs, so it needs
  no new token.
- The label starts at the track's top (`space-xs` padding on md) so a long
  label wraps beside the track with its first line centred, as Checkbox does.
  Figma centres the single-line label; for one line the result is the same.
- Figma's `👀 Label` defaults off; in code the label is `children`, and a
  toggle without one needs `aria-label`. Default size sm (Figma's).
- **Motion:** the knob slides with `transform` over `duration/xs` and
  `easing/out` (a small, frequent control, so the shortest step); the track
  color changes over `duration/xs` with `easing/ease`. Under reduced motion
  the knob jumps and the color change stays. No press scale: the slide is the
  feedback, and a toggle is used constantly.
- Figma binds a `stroke-lg` weight on the disabled tracks with no stroke
  paint; nothing is drawn, so code draws no stroke.
- Not handled yet: right-to-left. The knob translates on the physical x axis.

### Text Input (2026-10-18)
- `import { TextInput } from 'bland'`, folder `text-input/`. Figma set
  "Text Input" plus its private add-ons `_leading-input` / `_trailing-input`.
- **The contract other components build on (Dropdown's trigger, the Date
  pickers):** Text Input is a plain native `<input>`. It works controlled
  (`value` + `onChange`) or uncontrolled (`defaultValue`); every native input
  prop (`type`, `name`, `placeholder`, `onKeyDown`, `aria-*`, `data-*`, …)
  and `ref` reach the input; `className` goes on the wrapper, as with
  Checkbox. `fieldRef` reaches the bordered field box, the element a popover
  anchors to. A wrapper adds its own `iconEnd` (a caret) or `trailing` and
  keeps the rest. Native `size` is not exposed (Figma `Size` owns the name).
- Wiring: `label` is a `<label for>` (an `id` is generated with `useId` when
  none is given); `helperText` gets an id and joins `aria-describedby` (a
  passed `aria-describedby` is kept too); `status="danger"` sets
  `aria-invalid`. The status icon is decorative: the message belongs in
  `helperText`.
- From Figma: field height `input/sm|md|lg` (32, 40, 48), default **sm**
  (Figma's; its description does not call it unsafe). Text body-lg at every
  size, label body-lg, helper body-sm. Root and field-to-helper gaps
  `space-xs`. Main row padding `space-xs` / `space-md`, gap `space-sm`,
  icons `icon/md`. Radius `rad-md` with `.bland-smooth`; the `stroke-sm`
  border is an inset shadow (Figma's inside stroke). Fills
  `TextInput/surface-rest`, `-hover` on hover.
- Colors: border `Border/border-input`, or `border-danger|success|warning`
  by status; helper `text-subtle` or `text-danger|success|warning`; status
  icon `Icon/icon-danger|success|warning`. Placeholder `text-subtle` (Figma's
  rest state shows the placeholder there), value `text-bold`. Disabled:
  `border-subtle`, label `text-subtle`, value, placeholder and helper
  `text-minimal`, icons `icon-minimal`, whatever the status.
- Figma's start/end icon placeholders carry no color binding; code uses
  `Icon/icon-subtle`, as Search Input's magnifier does.
- Order inside the field, from Figma: start icon, input, alt text, status
  icon, end icon. Alt text is body-sm `text-subtle`, never wraps.
- Add-ons: padding `space-xs` / `space-sm`, gap `space-xs`, label body-lg
  `text-subtle` at rest and `text-bold` when filled or hovered (Figma
  `State=filled|hover`), a divider `stroke-sm` wide in `Border/border-bold`.
  Its height is unbound in Figma (20 on sm and md, 24 on lg); code uses
  `icon/md` and `icon/lg`, the same values.
- **Filled** is tracked in React (`data-filled`): from `value` when
  controlled, from change events otherwise, and read from the DOM on mount
  for autofill. Only the add-ons use it.
- **Focus ring on the box:** the input has no outline; the field box gets
  the `.bland-focus-ring` values while the input matches `:focus-visible`
  (always true for a text field, so mouse focus shows it too, as browsers
  do for text fields). The box carries `.bland-focus-ring`, so the docs
  "focused" preview and `.pg-focus` find it.
- A mouse-down anywhere in the field (padding, icons, add-on labels) focuses
  the input; buttons and other controls inside keep their own clicks.
- Background color eases over `duration/xs` (`easing/ease`); no transform,
  so nothing to drop under reduced motion.
- Disabled field text is exempt from contrast (WCAG 1.4.3, inactive
  component) and stays `text-minimal`; `tests/a11y.spec.ts` excludes
  `.bland-text-input:has(:disabled)` for that reason.

### Text Area (2026-10-18)
- `import { TextArea } from 'bland'`, folder `text-area/`. Same contract as
  Text Input: a native `<textarea>`, controlled or uncontrolled, native props
  and `ref` on it, `className` on the wrapper; `label`, `helperText`,
  `status` wired the same way (danger sets `aria-invalid`).
- **Overflow:** the textarea never scrolls itself. It grows to its text
  (and at least to the field, so a click anywhere lands in it) inside a
  `ScrollArea`, which draws the fade and the always-visible thumb. That is
  Figma's `👀 Overflow` and its description's code note; in code it is
  automatic. Chromium keeps the caret in view by scrolling the viewport.
  The thumb's track stops `space-xl` above the bottom so it clears the
  handle.
- **Height:** `rows` (default 4) lines of body-lg (`line-height/md`) plus
  `space-sm` above and below; Figma's field is a fixed 124 with no token,
  so rows is the code knob. At least one line when resized.
- **Resize handle** (Figma `text-area-resizer`, inlined SVG): 16 square
  (`icon/sm`), `space-xs` from the bottom right, `Border/border-bold`
  strokes at `stroke-sm`. Dragging it sets the field's height (vertical
  only; width follows the layout). `resizable={false}` hides it. It is
  mouse and touch only and hidden from assistive tech; the text stays
  reachable by scrolling.
- From Figma: padding `space-sm` / `space-md`, radius `rad-md` with
  `.bland-smooth`, inside stroke `stroke-sm`, fills `TextInput/surface-rest`
  and `-hover`, borders and helper colors as Text Input. No status icon.
- **Figma differs from Text Input in two places, and code follows Figma:**
  the label is `text-bold` even when disabled (Text Input: `text-subtle`),
  and a disabled danger, success or warning Text Area keeps its status
  border (Text Input: `border-subtle`). Raised with Godwin in the tracker.

### Numeric Input Field (2026-10-18)
- `import { NumericInputField } from 'bland'`, folder `numeric-input-field/`.
  Figma "Numeric Input Field" (the row) and "_Numeric Input Field Base"
  (one box, private).
- **One native input per box** (`type="text"`, `inputMode="numeric"`,
  `pattern="[0-9]*"`), drawn as Figma's square: `digit/sm|md|lg` (40, 56,
  72), radius `rad-sm` with `.bland-smooth`, inside stroke `stroke-sm`,
  fills `TextInput/surface-rest` / `-hover`, digit body-md on sm and
  title-lg on md and lg (Figma), placeholder `text-subtle`, digit
  `text-bold`, disabled `text-minimal` with `border-subtle`. Boxes and
  rows sit `space-xs` apart. Each box has its own `.bland-focus-ring`
  (Figma focuses one box), so the ring touches the next box, as in Figma.
- **Accessibility:** the row is `role="group"` named by `label` (a span
  referenced by `aria-labelledby`) or the group's own `aria-label`; each
  box is "Digit n of 4" and is described by the helper; danger sets
  `aria-invalid` on every box. The first box has
  `autocomplete="one-time-code"`, so phones offer the code from a message.
- **Keyboard and input:** focusing a box selects its digit, so typing
  replaces it and moves to the next box (typing the same digit moves on
  too); a letter is ignored; Backspace on an empty box clears the one
  before and moves there, on a filled box clears it; Delete clears in
  place; ArrowLeft/Right, Home and End move. Paste (any text; non-digits
  dropped) or an autofilled code fills from the focused box, or from the
  first when it is a whole code, and focus lands after the last digit.
- **Value:** a string of digits. Boxes keep their positions internally, so
  clearing a middle box leaves a gap; `onValueChange` gets the digits in
  order, `onComplete` fires when every box gets a digit. A controlled
  `value` resyncs the boxes only when it differs from them. `name` adds a
  hidden input for forms; `ref` reaches the first box.
- `👀 6 digits` → `length` (4 or 6, default 4). Figma's description: on
  mobile use sm for 6 digits. Figma's field has no hover state; each box
  has its own (base set).
- The label is `text-bold` in every state, as Figma binds it.

### Search Input (2026-10-18)
- `import { SearchInput } from 'bland'`, folder `search-input/`. It is Text
  Input's field (`InputField`, same classes and CSS) with `type="search"`
  and the MagnifyingGlass icon at the start; Figma's Search set binds the
  same tokens as Text Input's default status. No label, helper or status
  (Figma has none); the input is named "Search" unless it gets `aria-label`
  or `aria-labelledby`. Figma's `✏️ Label` ("Search here") is the
  placeholder.
- `👀 Clear` → `clearable`: an XCircle `<button>` (icon/md, hit area
  `control/xs` via `::before`, press `scale(0.97)`) that shows only while the
  field has a value. Clearing sets the value through the native setter and
  fires an `input` event, so `onChange` runs with `''` for controlled and
  uncontrolled fields alike; then `onClear`. Escape clears too.
- **The clear button is not a Tab stop** (`tabIndex={-1}`): Escape is the
  keyboard path, so Tab moves straight on, as in most search fields. The
  browser's own cancel button is hidden.
- Figma's clear icon carries no color binding; it uses the field's icon
  color (`icon-subtle`, `icon-minimal` disabled).

### Alert, Banner, Toast and Notification (2026-10-18)
- `import { Alert, Banner, Toast, Toaster, useToaster, Notification } from 'bland'`.
  Folders follow the Figma sets (`alert/`, `banner/`, `toast/` with the
  Toaster, `notification/`).
- **One status model, written once.** `status` info/danger/success/warning
  (default info, Figma's) on all four. The internal `message/` folder holds
  it: `message.css` maps each `data-status` to private `--_s-*` properties
  (icon, text, light surface, strong surface, border, elevation) and each
  component draws with the ones it needs; `Message.tsx` holds the status icon
  and the icon, content, actions, close layout that Banner and Notification
  share. Not exported, not a story.
- **Status icons** (Figma's, exported to `src/icons/`): info Info, danger
  WarningOctagon, success CheckCircle, warning WarningCircle, icon/md, colored
  `Icon/icon-{brand,danger,success,warning}` (Toast: `icon-on-color`), with
  Figma's `space-2xs` above so the icon centres on the first 24px line.
  Decorative: the text carries the meaning.
- **`icon` prop** (Figma `👀 Icon`): `true` (default) draws the status icon,
  `false` hides it, any SVG node replaces it, following the icon policy that
  every icon slot takes any pack.
- **Who has what**, from the set descriptions and variants:
  - Alert: icon and label only (`children`, body-lg in
    `Text/text-{status}`; info is `text-bold`, as Figma binds it). No
    surface, close or actions. `max-width: alert/max-width`; text wraps.
  - Banner: surface-100, `border-bold` inside stroke for every status, no
    elevation, rad-md, padding `space-sm` `space-md`. `title`, `children`
    (description), `actions`, `onClose` (Figma `👀 Close`), `orientation`
    horizontal (default) / vertical. Figma's `banner/width` (384) is only its
    default frame: the description says to fill the container, so in code it
    is a block spanning its container.
  - Toast: strong fill `surface-{status}-strong`, white content
    (`text-on-color` body-lg-bold, `icon-on-color`), `Elevation/{status}/mid`,
    rad-md, padding `space-sm` `space-md`, `max-width: toast/max-width`. No
    title, actions or close: the description sends those to Notification.
  - Notification: `colored` (default true, Figma's) = `surface-{status}-light`,
    `border-{status}`, `Elevation/{status}/mid`; uncolored = surface-100,
    `border-bold`, `Elevation/neutral/mid`. Width `notification/width` (384,
    capped at 100% of its container), padding `space-md`, or `space-lg` when
    vertical. `title`, `children`, `timestamp` (body-sm text-subtle, beside
    the title when vertical, after the text when horizontal), `actions`,
    `onClose` (Figma `👀 Close btn`), `orientation`.
- **Title on horizontal** (2026-10-18, Godwin): code shows `title` in both
  orientations; horizontal stacks it over the description on the same row as
  the actions. Figma now matches: the horizontal Banner and Notification
  variants have a `👀 Title` boolean (off by default, so the one-line look
  stays the default) bound to `✏️ Title`, in a `text` frame (`space-xs` gap)
  above the description. Vertical always shows its title.
- **Actions are a slot** (`actions`, Figma `👀 Btn` / `👀 Btn (2nd)`): pass
  one or two Buttons, size xs on horizontal and md on vertical (Figma's), a
  primary then a secondary. Kept a slot so apps choose labels, handlers and
  loading states with the real Button API.
- **Close** is an xs ghost Icon Button (control/xs, 24) holding the X at
  icon/md in `icon-subtle`, as Figma draws it; `closeLabel` names it
  (default "Dismiss"). The component never hides itself: `onClose` is the
  app's job, or the Toaster's `dismiss`. Figma's close is a plain frame with
  no hover; code gets the ghost button's hover and press.
- **Roles** (decided 2026-10-18):
  - Alert: `role="alert"` for danger (an error that appears after an action
    is announced at once), `role="status"` for the others. Pass `role` to
    change it, or `role={undefined}` for a message on the page from the start.
    Link it to its field with `aria-describedby`.
  - Banner and Notification: no role. A banner is usually on the page from
    the start; pass `role="alert"` or `role="status"` when one is inserted
    after an action. Notifications are announced by the Toaster.
  - Toast: no role of its own; the Toaster announces it.
- **Toaster** (built, minimal): `<Toaster>` wraps the app and `useToaster()`
  returns `toast(message, { status, icon, duration, id })`,
  `show(content | (dismiss) => content, { duration, id })` for a
  Notification or anything else, and `dismiss(id)`.
  - A `<section popover="manual">` named "Notifications" (`label`), shown on
    mount: the top layer puts it above the page without a z-index token.
    Inside, an `<ol aria-live="polite">` that exists before the first toast,
    so each addition is announced. Danger toasts are polite too: urgent
    errors belong in an Alert or Banner with `role="alert"`.
  - Bottom of the screen, `space-lg` from the edges, full width on mobile and
    bottom right from `breakpoint/md`; newest last, `space-sm` apart.
  - Each toast dismisses itself after `duration`, **5000 ms by default**
    (code constant, a timing rather than a visual value; on the tracker for
    Godwin to confirm), `null` to keep it. Timers pause while the pointer is
    over the stack, focus is inside it or the page is hidden, and resume with
    the time that was left. A reused `id` replaces the toast in place.
- **Toast motion:** enters with `@starting-style` and exits with
  `data-state="closed"` along the same path: from `translateY(space-lg)
  scale(0.97)` and opacity 0, over `duration/xl` with `easing/out`. The item
  leaves the DOM once its transition time has passed (read from the computed
  style, so no second constant). Reduced motion: opacity only.

## 7. The docs site (`npm run docs`, 2026-10-17)

- A sidebar of style pages (generated from `tokens.json`) and components
  (one per story), and a System / Light / Dark switch remembered per browser.
  The selected option is a `stroke` Button, because `secondary` vanishes on
  `surface-200`.
- A component page has: description (the Figma set description), the import
  line, a live demo with controls, the code snippet for the current props,
  Variants (the story's `render`, also the screenshot fixture) and props
  tables generated from the TypeScript and JSDoc.
- The playground's size never follows the demo, so zooming never resizes it
  (2026-10-18): the view is 320px tall, or the props panel's height beside it
  on desktop, and a demo bigger than that scrolls inside it.
- Slot props get demo controls by building their content (2026-10-18):
  Avatar's `topSlot` / `bottomSlot` pick none, a status dot or a count, with an
  emotion and a count label, as a ringed Indicator sized for the slot. The
  story's `code(args)` turns those controls into real JSX in the snippet.
- Mobile first: below the tablet breakpoint the sidebar becomes a Menu.
- **"focused" is offered only for components that take keyboard focus**
  (decided 2026-10-18). The demo shows the control only when what it renders
  contains a `.bland-focus-ring` element, and it follows the props: Button,
  Icon Button and Pill always, Chip only with `onRemove` (its close button),
  never Icon, Badge, Indicator or Avatar. Stories likewise show a Focused row
  only for focusable components.
- **Variants: one bordered container per group** (decided 2026-10-18). Each
  top-level group a story's `render` returns (a `pg-stack`: its label and rows)
  gets its own border on the component page, so a story's sections read as
  separate cases. Screenshots (`#/raw/<id>`) are unaffected.
- The docs chrome lives in `playground/`, outside the Bland package and the
  lint, but uses Bland's tokens and components wherever one fits.
