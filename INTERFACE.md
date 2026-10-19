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
  from the verified export. 613 variables, 518 CSS tokens (2026-10-18).
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
  components need them: Check, X, CaretDown, CaretRight, Plus, Minus, User, Spinner,
  MagnifyingGlass, XCircle, WarningOctagon, CheckCircle, WarningCircle, Info,
  ArrowUp, ArrowDown, ArrowsDownUp, DotsThree (filled) so far.

## 4. Overflow

- Anything that scrolls uses `ScrollArea`: the `.bland-scroll-fade` mask plus an
  overlay thumb (Figma `_scrollbar`) 4px in from the scrolling edge, always
  visible, draggable, outside the mask. The native scrollbar is hidden; wheel,
  touch and keyboard scrolling stay native.
- Fade length `md` (32) by default, `sm` (16) for compact areas such as Menu.
- The thumb's minimum length is `control/xs` (24).

## 5. Motion

Rules in `CLAUDE.md` and `docs/motion.md`. Decisions on top of them:
- **Time on screen is not motion, but it is a Motion token:** `duration/toast-visible`
  (5000ms, 2026-10-18) is how long a Toast stays up, not how long it moves.
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
- **Disabled matches Text Input** (Godwin, 2026-10-18): label `text-subtle`,
  border `border-subtle` whatever the status, value, placeholder and helper
  `text-minimal`. Figma first drew a disabled Text Area with a `text-bold`
  label and its status border; its four disabled variants were rebound to
  match. This is also the common standard (a disabled field shows no
  validation state), so neither component needed more.

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
- Disabled matches Text Input (Godwin, 2026-10-18): label `text-subtle`,
  every box `border-subtle` whatever the status, helper `text-minimal`.
  Figma's twelve disabled variants were rebound from a `text-bold` label.

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
- **While the field is empty the clear button is `visibility: hidden`, not
  removed** (2026-10-18): it keeps its 20px and the gap, so a field sized by
  its content (the docs demo, an inline toolbar) does not widen by 28px on
  the first keystroke.
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
  - Each toast dismisses itself after `duration`, by default the
    **`duration/toast-visible` token** (5000ms, added in Figma 2026-10-18 at
    Godwin's request, so the time on screen is a token like every other
    value). The Toaster reads `--duration-toast-visible` from where it sits,
    so a project retunes it with CSS alone; without tokens.css, toasts stay
    until dismissed rather than fall back to an invented number. `null`
    keeps one. Timers pause while the pointer is
    over the stack, focus is inside it or the page is hidden, and resume with
    the time that was left. A reused `id` replaces the toast in place.
- **Toast motion:** enters with `@starting-style` and exits with
  `data-state="closed"` along the same path: from `translateY(space-lg)
  scale(0.97)` and opacity 0, over `duration/xl` with `easing/out`. The item
  leaves the DOM once its transition time has passed (read from the computed
  style, so no second constant). Reduced motion: opacity only.

### Breadcrumb (2026-10-19)
- Built from both Figma sets: `Breadcrumb` (Crumbs 2 to 7) and `_Breadcrumb
  Base` (link, current page, overflow; rest and hover). Every binding read,
  inner frames included.
- **Items array, not children** (decided 2026-10-19): `items` of
  `{ label, href, icon, hideLabel }`. The component needs the count and the
  order to collapse the middle and to know which item is the current page,
  so an array is simpler than child components. `label` is a string so it
  can name an icon-only crumb and the overflow count.
- **Any router through `renderLink(props, item)`** (decided 2026-10-19): it
  gets `{ href, className, children }` and the item, and returns the link.
  Default `<a>`. A render function rather than an `as` component because
  routers disagree on the prop (`href` in Next, `to` in React Router). The
  link must keep `className`: it carries the look, the focus ring, and is
  how the overflow finds the first revealed crumb to focus.
- **The current page is never a link**: a `<span aria-current="page">`,
  not focusable, no separator, even if its item has an `href`.
- **Separator** is Figma's CaretRight (exported to `src/icons/`), outside
  the link inside the `<li>`, aria-hidden via `<Icon>`.
- **Overflow** (decided 2026-10-19): `maxItems` collapses a trail longer
  than it (and longer than three) to the first item, an overflow crumb and
  the last two, the rule in the Figma description. Figma's overflow is the
  text "…", not a DotsThree icon. Its description says it opens a menu of
  the hidden items; Dropdown is not built yet, so for now pressing it
  reveals them in place for good and moves focus to the first one. When
  Dropdown exists, switch to a menu and keep the API.
- **Wraps in code**: the list wraps onto more lines rather than overflowing
  the page. Figma does not wrap; collapsing is still the intended fix.
- Hover: link label underlined (`body-lg-underline`, same size); overflow
  gets `Breadcrumb/surface-hover`. No pressed state or motion (Figma has
  none; links are used constantly).

### Progress-bar and Progress-wizard (2026-10-19)
- `import { ProgressBar, ProgressWizard } from 'bland'`. Folders follow the
  Figma sets: `progress-bar/`, `progress-wizard/` (with the private
  `_progress-wizard-item` and `_progress-icon` drawn inside it).
- **Progress-bar is determinate only**, as in Figma. `value` with `min` 0 and
  `max` 100 by default; any value, though Figma draws quarters (its four
  segments are a Figma drawing aid: code draws one fill).
- **`role="progressbar"` sits on the track, not the root**, because the root
  can hold the cancel button and a progressbar's children are presentational.
  The track gets `aria-valuenow` / `min` / `max`, its name from `label`
  (`aria-labelledby`) or `aria-label` / `aria-labelledby` (a TypeScript
  union: one is required), and `helperText` through `aria-describedby`. The
  visible "N%" is `aria-hidden`; the value attributes carry it.
- From Figma: root `space-xs` gap, width `progress/width` capped at 100% of
  its container (set a width to fill a layout); row `space-sm` gap; track
  `progress/track-sm|md`, `rad-rd`, `Progress/track`; value column
  `progress/value-width`, body-sm text-bold, tabular numbers; label body-lg
  text-bold; helper body-sm text-bold, `text-success` / `text-danger` by
  status. Default size **sm** (Figma's).
- `status` default/success/danger sets the fill (`Progress/fill-*`) and, on
  success and danger, a decorative status icon after the value (CheckCircle /
  WarningOctagon, icon/sm, `Icon/icon-success|danger`). Say what happened in
  `helperText`.
- `onCancel` (Figma `👀 Cancel`, default status only): a `control/xs` button,
  `rad-sm` with `.bland-smooth`, the X at icon/sm in `icon-subtle` (Figma's X
  carries no readable color binding; Banner's close uses icon-subtle),
  `cancelLabel` default "Cancel", press `scale(0.97)`, no hover (Figma has
  none). Stopping the work is the app's job.
- **Fill motion:** the fill is the full track length, rounded at both ends,
  and slides in with `translateX(value - 100%)` inside the clipped track, so
  the rounded end survives any value and only `transform` animates:
  `duration/md` with `easing/linear` (docs/motion.md reserves linear for
  progress fills). Under reduced motion it jumps.
- **Progress-wizard** is an `<ol>` (name it with `aria-label`) of `<li>`
  steps. `steps` is data (`title`, `description`, `disabled`), `current` the
  index: earlier steps are done, later ones next, and `current =
  steps.length` means all done. Figma's per-step `Progress` follows from
  `current` instead of being set by hand. The current step gets
  `aria-current="step"`; each marker is `role="img"` named "Completed",
  "Current" or "Not started" (`progressLabels` to translate).
- **Figma `Style` keeps its name** (`style="bar" | "connector"`), so the
  native style attribute is `htmlStyle`, as Button's `type` / `htmlType`
  (docs/components.md, "Props").
- `layout` inline (default) / centered / stacked, `disabled` for all steps
  or per step. Steps are `width: progress/step-width` and may shrink to share
  a narrower row (a width, not a flex-basis: see LEARNINGS, CSS).
- **`fill`** (2026-10-19, Godwin): the wizard stretches across its container
  and the steps share it equally (`flex: 1 1 0`), the common stepper default
  and Figma's "set the wizard and each step to Fill container". Off by
  default, so the wizard hugs 152px steps as in Figma.
- **Long titles in an inline connector step truncate** (2026-10-19, Godwin):
  the title hugs its text and the line fills what is left, as in Figma and
  Ant Design, so a longer title means a shorter line; past the line's
  `space-xl` (24) minimum the title ends in an ellipsis instead of pushing
  into the next step. Other layouts wrap their titles. Figma's six inline
  connector titles now have ending truncation (one line), which shows only
  once a title is not set to Hug, and the item description says so.
- From Figma: bar style pads `space-sm` all round with a `stroke-lg` top
  inside stroke (inset shadow), `Progress/fill-brand` on done and current,
  `Progress/track` on next. Connector style drops the inline padding; lines
  are `stroke-lg` high: inline puts one after the title (`space-xl` minimum,
  `space-sm` end padding), centered draws one each side of the marker
  (full bleed; the first step's is kept invisible so its marker stays
  centred), stacked one after the marker. A line is brand once the step it
  leads into is reached. Markers `progress/marker`: done `Control/checked-rest`
  with a Check (icon/xs, `icon-on-color`), current `surface-100` with a
  `stroke-lg` `border-brand` ring and a `progress/marker-dot`, next
  `surface-100` with a `stroke-sm` `border-input` ring. Title body-lg
  text-bold (current body-lg-bold), description body-lg text-subtle.
- Disabled (Figma `State=disabled`): brand becomes `Control/checked-disabled`,
  rings `border-subtle`, text `text-minimal`. axe skips that text in
  `tests/a11y.spec.ts`, as it does for disabled fields.
- Not interactive: nothing takes focus, so no Focused row. Circles skip
  `.bland-smooth`.

### Accordion (2026-10-19)
- `import { Accordion } from 'bland'`, folder `accordion/`. A native
  `<details>` whose `<summary>` is Figma's header, so it opens without scripts
  and keeps the browser's keyboard (Enter, Space) and screen reader behaviour:
  Chromium exposes the summary as a disclosure button with an expanded state,
  which is what Figma's "button with aria-expanded and aria-controls" note asks
  for. No ARIA is added.
- **React owns the open state.** The summary's click (also fired by Enter and
  Space) is cancelled and `open` / `defaultOpen` decide; `onToggle` follows
  changes the browser makes itself (find in page, a `name` group closing the
  item) and reports them through `onOpenChange`. `defaultOpen` renders the
  native `open` attribute, so server-rendered pages start right.
- **Groups:** Figma has no group set and describes none, so there is no
  `AccordionGroup`. Items that share the native `name` attribute form a group
  where only one is open at a time; the browser closes the others.
- **Disabled:** `<details>` has no native disabled. `disabled` sets
  `aria-disabled` and `tabIndex=-1` on the summary (out of the Tab order, like
  a disabled button) and ignores clicks; an open item stays open. Header and
  content text `text-minimal`, caret `icon-minimal`, header fill unchanged
  (Figma). axe excludes the disabled content text, like disabled field text.
- Figma bindings: header `surface-200` (hover `surface-300`), padding
  `space-xs` (sm) / `space-sm` (md) by `space-md`, gap `space-sm`, `rad-md`
  with `.bland-smooth`; title body-lg, body-lg-bold while open; caret `icon/md`
  `icon-bold`, nudged `space-2xs` so it sits on the title's first line (long
  titles wrap); content padding `space-md`, gap `space-lg`, body-lg
  `text-bold`. Root and content have no fill.
- **Flush:** no header fill, no side padding; content padded `space-xs` above
  and below only; on hover the title underlines with the
  `body-lg(-bold)-underline` styles. Non-flush hover does not underline.
- **Width:** fills its container. `accordion/width` (256) is Figma's frame
  default; its description says "Use Fill container in layouts" (as Banner).
- **Motion:** the caret turns 180° (Figma swaps CaretDown for CaretUp; code
  rotates the one `CaretDownIcon`) and the content's height animates with
  `::details-content`, `interpolate-size: allow-keywords` and
  `content-visibility ... allow-discrete`, both over `duration/md` with
  `easing/out`, opening and closing along the same path. Browsers without
  `::details-content` open at once. Under reduced motion both happen at once.
  No press scale: Figma has no pressed state.
- Figma's `🌟 Slot` property is defined on the set but no layer uses it; ignored.

### List item (2026-10-19)
- `import { ListItem } from 'bland'`, folder `list/`. Figma has one set,
  `List` (375:6454, 24 variants: Flush x Lines x State); every variant's
  bindings read, inner frames included. There is **no List wrapper** in
  Figma, so none in code: a row is an `<li>` (Figma: "li inside ul") and the
  project supplies the `<ul>` / `<ol>`. Figma draws no dividers and no gap
  between rows; neither does code.
- **Which rows are interactive** (decided 2026-10-19): a row with `href` or
  `onClick` is one link or one button (the `<a>` / `<button>` inside the
  `<li>`), takes focus and gets Figma's hover and pressed fills
  (`List/surface-hover`, `-pressed`). Without them it is a plain row (a
  `<div>`): no hover, no focus. Use the plain row whenever the trailing slot
  holds its own control (Toggle, Checkbox, a Button), so a control is never
  nested inside a button or link; on a button or link row the trailing slot
  holds only non-interactive content (a value, a Badge, a caret). Links go
  through `renderLink(props)` for routers, as Breadcrumb.
- Figma's "role=option inside a listbox when rows are selectable" is left to
  Dropdown/Menu, which will use React Aria's listbox; ListItem has no
  selected state.
- **Lines** (decided 2026-10-19): a row without `description` is Figma's
  `Lines=1`; with one, `lines` picks `2` (default; the description is one
  line ending in an ellipsis) or `3+` (it wraps). The title is always one
  line with an ellipsis; `altText` never truncates, the title gives way.
- **Heights:** Figma fixes 1 and 2 line rows at 40 and 64 (unbound) and
  centres the content, so its `space-md` padding never shows there. Code pads
  them `space-sm` above and below: 8 + 24 + 8 = 40, and 8 + 46 + 8 = **62**,
  2px under Figma's 64 (raised with Godwin on the tracker). 3+ line rows hug,
  `space-md` (flush `space-sm`) above and below, as in Figma, with slots and
  text at the top; 1 and 2 line rows centre them.
- From Figma: fill `List/surface-rest` (flush: none), `rad-md` with
  `.bland-smooth` (flush `rad-null`; its focus ring `rad-xs`, so the flush
  row takes `rad-xs` only while focused); padding `space-md` (1 line) or
  `space-lg` at the sides, flush `space-2xs`; gap `space-sm`; text column gap
  `space-2xs`, header gap `space-sm`. Title body-lg `text-bold`, alt text
  body-lg `text-subtle`, description body-md `text-subtle`. Disabled: all
  text `text-minimal`, fill unchanged.
- **Slots:** leading is `list/slot-sm` (24) on 1 line rows, `list/slot-lg`
  (40) otherwise, content centred; an `<Icon>` in it is `icon/lg` in
  `icon-bold` (`icon-minimal` disabled), an Avatar should be `sm` (24) or
  `lg` (40). Trailing hugs its content, text `text-subtle`, an `<Icon>`
  `icon/md` in `icon-subtle`. Figma leaves both slots empty, so these icon
  sizes and colors are code decisions.
- **Width:** fills its container. `list/width` (384) is Figma's frame
  default ("Use Fill container in layouts").
- A focused row is `position: relative` so the next row's fill does not
  cover its ring's offset. No press scale (Figma has only the pressed fill;
  rows are used constantly); the fill eases over `duration/xs`.
- Long lists: Figma does not scroll a List, so ListItem has no ScrollArea;
  a project that scrolls rows wraps the `<ul>` in `ScrollArea`.

### Empty State (2026-10-19)
- `import { EmptyState } from 'bland'`, folder `empty-state/`. Figma: set
  `Empty-state` (864:4114, Size sm/lg) and the private `_empty-illustration`
  (6184:558); every variant's bindings read, inner frames and the hidden
  actions included. A plain `<div>`: no role, no live region, no focus. Only
  the action Buttons take focus, so the docs' "focused" control shows only
  while actions render.
- **No default illustration** (Godwin, 2026-10-19). Figma's slot defaults
  to `_empty-illustration`, a Package icon on a `surface-200` disc whose icon
  is bound straight to the primitives `unit/40` and `unit/64` ("placeholder
  only, so no component tokens"). Primitives never reach CSS, so there was no
  token to size it; rather than add Sizing variables or reuse spacing tokens,
  Bland ships no illustration. `illustration` takes any node (an image, an
  SVG, an `<Icon>`), centered and drawn as is: the project sizes and colors
  it. Omitted, the slot does not render. The story draws Figma's placeholder
  as a project would (its own sizes, outside the package).
- **The title's heading level is the project's choice** (decided
  2026-10-19): `titleAs` is `h1` to `h6` or `p`, default `h2`. An empty
  state usually sits under the page's `h1` or inside a section, so `h2`
  is the common case; use `h3` inside a panel under an `h2`, or `p` when
  the view already names itself. The look never changes with the level.
- From Figma: padding `space-md`, gap `space-lg` (sm) / `space-xl` (lg),
  text column gap `space-sm`. Title body-lg-bold (sm) / title-lg (lg) in
  `text-bold`, description body-md / body-lg in `text-subtle`, all
  centered; long words break (`overflow-wrap: anywhere`).
- **Actions:** the `actions` slot takes up to two Buttons (Figma: md brand
  primary, then secondary), stacked `space-sm` apart, each stretched to the
  content width (Figma's first button fills; the actions frame is the full
  width). Size md is the Button default, so nothing is set.
- **Width:** fills its container. `empty-state/width-sm` (256) and
  `-lg` (384) are Figma's frame widths; its description says "use Fill
  container in layouts" (as Banner, Accordion, List item).

### Table (2026-10-19)
- `import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell,
  TableExpandCell, TableOptionCell } from 'bland'`, folder `table/`. Figma:
  sets `Table-row` (849:6722, 12 variants), `_table-header` (711:72592, 45)
  and `_table-cell` (53:9651, 60); every variant's bindings read, inner
  frames and hidden slots and focus rings included.
- **A native `<table>`, composed, not a data grid** (decided 2026-10-19):
  `Table` > `TableHead` / `TableBody` > `TableRow` > cells, so screen
  readers get rows, columns and headers for free, and projects map their
  own data. Name it with `aria-label` or `aria-labelledby` (Figma has no
  caption). Headers are `<th scope="col">`. No grid keyboard navigation:
  only the interactive parts take focus (sort buttons, selection controls,
  expand and option buttons, links in cells), so Figma's `👀 Focused` inset
  ring is drawn on the sort button only, and the docs "focused" preview
  appears only while one of those renders. A grid (`role="grid"`, arrow
  keys between cells) waits for a project that needs it, with React Aria.
- **Selection** (decided 2026-10-19): Figma's Table-row `👀 Checkbox` /
  `👀 Radio` are `selectionMode` `multiple` / `single` on `Table`, with
  `selectedKeys` / `defaultSelectedKeys` / `onSelectionChange` (an array of
  `rowKey`s). Each body `TableRow` with a `rowKey` gets the control column
  first: a Checkbox sm (`selectLabel`, default "Select row"; give each a
  real name such as "Select Ada Lovelace") or a Radio sm sharing one
  generated `name`. The head gets a select all Checkbox in a `th` (mixed
  while some rows are selected, `selectAllLabel`) or, for single, Figma's
  blank `empty` header as a `<td>` (an empty `th` is an empty column
  header). Select all touches only rows that are not disabled. Selected
  rows set `aria-selected` and take `Table/surface-cell-selected`. Rows are
  selected only through their control, never by clicking the row, so
  nothing interactive nests.
- **Header selected fill** (decided 2026-10-19): Figma's
  `_table-header State=selected` pairs with its checked select all Checkbox,
  so the head row takes `Table/surface-header-selected` while every row is
  selected. Figma's Table-row header is otherwise rest only.
- **Sorting**: `TableHeaderCell` with `onSort` is Figma's
  `Structure=sortable`: a button filling the th (label, then the sort icon
  at the end), `aria-sort` on the th while `sort` is `ascending` or
  `descending`. The project sorts and passes the next `sort`. Icons:
  ArrowUp ascending, ArrowDown descending (Figma's default), ArrowsDownUp
  while unsorted so the column reads as sortable; icon/sm, `icon-bold`
  when sorted, `icon-subtle` otherwise (Figma's sort icon fill is unbound
  white, so the colors are a code decision). `sortIcon` replaces it
  (Figma `🌟 Sort icon`). Hover fill `Table/surface-header-hover` only on
  sortable headers; the focus ring is inset (`outline-offset` minus
  `stroke-lg`), as Figma's, because cells touch.
- **Row hover**: every body row takes `Table/surface-cell-hover` (Figma's
  Table-row `State=hover`), except selected and disabled rows. No
  transition: rows are scanned constantly (motion rules).
- **Expand and option** (`Structure=expand` / `option`, Table-row
  `👀 Option`): `TableExpandCell` (ghost Icon Button, CaretDown turning 180°
  over `duration/md` `easing/out`, `aria-expanded`, `controls` for
  `aria-controls`; the project renders the details row, usually one
  `TableCell` with `colSpan`) and `TableOptionCell` (ghost DotsThree Icon
  Button, or `children` for a Dropdown trigger later). The Icon Button is
  sm in sm and md tables, md in lg, as in Figma. In the head,
  TableExpandCell is Figma's blank `empty` header and TableOptionCell keeps
  its button (Figma draws one there).
- **Disabled**: `disabled` on a `TableRow` (all its cells, its controls) or
  one `TableCell`: text `text-minimal`, slot icons `icon-minimal`, fill
  unchanged, as Figma's `State=disabled`.
- **Sizes and layout** (from Figma): rows and headers `table/sm`, `md`,
  `lg` (32, 40, 48; default sm, Figma's); padding `space-md` at the sides,
  gap `space-sm`; slots at least `table/slot-sm`, `md`, `lg` (20, 24, 32)
  square, content centred, an `<Icon>` icon/md in sm and icon/lg in md and
  lg (leading `icon-bold`, trailing `icon-subtle`, as List item); an Avatar
  fits as xs, sm, md. Slots grow for wider content (code only; Figma's are
  fixed squares). Control cells are squares of the row height. Header
  body-lg-bold, cells body-lg, both `text-bold`.
- **Dividers** are Figma's inside strokes, drawn as an inset bottom
  shadow so rows keep their exact height: cells `stroke-xs` (0.5),
  headers `stroke-sm` (1), both `border-subtle`.
- **Width and overflow** (decided 2026-10-19): the table fills its
  container (`table/width` 640 is Figma's frame). Basic columns are at least
  `table/cell-width` (128) and share the rest; labels never widen a column,
  they end in an ellipsis (one line, Figma's ending truncation). When the
  minimum widths exceed the container, the table scrolls sideways in a
  `ScrollArea axis="x"` (fade plus visible thumb, the overflow rule), and
  the scrolling element becomes a Tab stop while it overflows so keyboard
  users can scroll a table with no controls in it.

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
