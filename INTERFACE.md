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
  from the verified export. 624 variables, 528 CSS tokens (2026-10-20).
- Components read only Theme and scale tokens. Primitives are never emitted.
- No value without a token. When none fits, stop and ask Godwin; the answer is a
  new Figma variable, synced (that is how `duration/spin` came about).

### Light and dark
- Light on `:root`. Dark redefines only the Theme tokens and the elevation
  shadows, under `[data-theme="dark"]`, and under `prefers-color-scheme: dark`
  when no `data-theme="light"` is set. **Both ways stay (Godwin 2026-10-27):**
  `data-theme` wins, else the system preference; a project's toggle sets
  `data-theme` on `<html>`.

### Brand override (Godwin, 2026-10-26)
- One package; a project brings its brand by overriding the 13 `--brand-*`
  steps at `:root` in a stylesheet after Bland's. The 57 tokens whose Figma
  alias ends in a brand step hold `var(--brand-N)` (alphas a `color-mix`), in
  both themes, so the override cascades. The brand steps sit in their own
  `:root` block, outside `[data-theme="light"]`, so a light-themed subtree
  can't reset a project's override.
- The brand scale is the only primitive emitted, and only for the override;
  the lint rejects `var(--brand-*)` in components and names the Theme tokens
  built on that step.
- `npm run brand` (`docs/brand.md`): a generator that makes 13 steps from
  one color in the shape of Bland's OKLCH scale (the color on 600, `--at` to
  move it), and a contrast check of the 35 brand pairings that warns, never
  blocks, with suggested steps and `--fix`.
- **Neutrals lean toward the brand** (Godwin, 2026-10-26): the 13 neutral
  steps are emitted and overridable like the brand's; the generator makes
  them from the brand (Bland's chroma curve, the brand's hue, less for warm
  hues, none for gray brands) at Tinted, Subtle or Pure gray, holding each
  step's luminance so neutral contrast stays Bland's. Transparent neutrals
  and neutral shadows follow `--neutral-1000` (pure black). Client neutrals
  are code only; Figma keeps Bland's. Method in `docs/brand.md`.
- **Brand theme page on the docs site** (`#/brand`, under Overview, Godwin
  2026-10-26): the tool in the browser, with Apply to the site (steps on
  `<html>`, kept per visit) and Reset; previews set `data-theme` and the steps
  on their own element, so they show a brand before it is applied.

### Type
- Inter for interface text, Geist Mono for code, self-hosted through
  Fontsource (`bland/fonts.css`): Inter 400, 500, 600 and Geist Mono 400, 600
  only, because those are the weights the text styles use.
- Components set type with the composite: `font: var(--type-body-md)`.
- **Type only through text styles (Godwin, 2026-10-25).** Figma's raw type
  scale (`_Typography`: families, weights, sizes, line heights, letter
  spacing) is hidden from publishing like the color and unit primitives, so
  library users see only text styles. The usual design system setup. Code
  follows: no `--font-*`, `--line-height-*` or `--letter-spacing-*` tokens.
  Each text style instead emits its two loose parts:
  `--type-<style>-letter-spacing` (the `font` shorthand can't set it; set it
  beside the style) and `--type-<style>-line-height` (to size something by
  lines, as Text Area's rows and Code text's copy button). A root without its
  own `font` sets the letter spacing of its main style (body-lg).

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
- **First-line alignment** (Godwin 2026-10-27, from Banner): in a row of
  text and other items, a one-line text is centred with them and a wrapping
  one keeps them at the top, on its first line. Rows use
  `align-items: flex-start` and offset the shorter side by half the height
  difference (icon, timestamp, or the text itself when buttons are taller);
  `align-items: center` only where the text can never wrap. Applied in
  `message/` (Alert, Banner, Toast, Notification).
- **Audit of every component against it (2026-10-27):**
  - *Changed:* **Menu** rows (also Dropdown's and every Menu inside
    Breadcrumb, Table, CodeSnippet, ChatNavbar): `align-items: center` →
    `flex-start`. The 24px slots equal the label's 24px line, so one line
    looks the same and a wrapping label keeps its icon, shortcut or Check on
    the first line. Figma's `_menu-item` centres the row (its description
    says the label wraps): Figma to rebind. **List item 3+**: the trailing
    slot is at least one body-lg line tall, so an icon/md (20) centres on the
    title line instead of sitting 2px high.
  - *Already right:* Accordion header (caret space-2xs), Modal title row
    (icon space-2xs, xs close = line), File Upload rows (icon space-2xs),
    Checkbox, Radio and Toggle labels (label-wrap padding), Progress wizard
    inline (marker space-2xs), CodeText copy button, `message/`.
  - *Can't wrap, centre kept:* one-line text with an ellipsis or nowrap
    (Badge, Button, Chip, Pill, tabs of every kind, Breadcrumb crumbs,
    Sidebar rows, Table cells and headers, List 1 and 2 line rows, Chat list
    item, Chat navbar, Chat bubble meta and file, Chat message bar reply,
    Code snippet bar, Pagination, Logo, fields), and stacked columns (Empty
    State, File Upload drop zone, Tooltip, Progress bar).
  - *For Godwin:* List item 3+ follows Figma, which puts the 40px leading
    slot at the top beside the text, so a 24px icon in it centres 8px below
    the title line. The rule would move the text down 8 (or the slot up);
    left as Figma until decided.

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
  ArrowUp, ArrowDown, ArrowsDownUp, DotsThree (filled), CaretLeft, CloudArrowUp,
  FileArrowUp, Copy, Eye, EyeClosed, SidebarSimple, Checks, Play, Pause,
  File, Phone, VideoCamera, ArrowBendUpLeft, Smiley (stroked, filled eyes),
  Sticker, PlusCircle, Microphone, PaperPlaneRight, Trash so far.

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
- **`ButtonSizeContext`** (2026-10-27, for Banner): a component whose action
  slot has a set button size provides it; Button and Icon Button take their
  own `size`, else the context's, else md. Internal, not exported.
- CSS pattern every component copies: emotion and type blocks set private
  custom properties, and one rule per state reads them.

- **Dark ghost and stroke hover** (Godwin 2026-10-20: too hard to see): the
  hover and pressed fills of ghost and stroke Buttons and Icon Buttons used
  each family's darkest tones in dark mode (Brand1000/950, Green, Red and
  Amber 1100/1000), barely off the #0a0c10 page. They moved one step
  lighter in Figma: hover Brand900, Green1000, Red1000, Amber1000; pressed
  Brand800, Green900, Red900, Amber900. Light mode is unchanged.
- Retuned in Figma 2026-10-25 (Godwin): every `Button/*-disabled` fill is lighter in light (#c4cad4, was #a8b0be) and darker in dark (#2b313b, was #576275), so disabled reads as receded in both themes; brand secondary rest, hover and pressed each moved one step brighter in dark only (#001b55, #002873, #003a9e). Token-only change, no CSS.

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
  - Banner: `colored` (Figma `Colored`, added 2026-10-27, default **false**,
    Figma's) = `surface-{status}-light` with `border-{status}`; uncolored =
    surface-100 with `border-bold`. No elevation either way. rad-md, padding
    `space-sm` `space-md`. `title`, `children` (description), `actions`,
    `onClose` (Figma `👀 Close`), `orientation` horizontal (default) /
    vertical. On vertical the actions sit `space-sm` under the text (Godwin
    2026-10-27, tighter than Notification's `space-lg`); message.css reads it
    from a private `--_actions-gap` that Banner sets.
    **Action Buttons default to sm** in both orientations (Godwin
    2026-10-27; Figma draws xs horizontal, md vertical): Banner passes
    `actionSize="sm"` and MessageLayout wraps `actions` in
    `ButtonSizeContext`, so a Button without a `size` takes sm and one with a
    `size` keeps it. On horizontal banners sm Buttons (32) are taller than the
    first line (24), so the icon, text and close move down half the
    difference (`--_line-offset`, set only while the actions hold an sm
    Button) and centre on them. Figma's `banner/width` (384) is only its
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
  text "…", not a DotsThree icon. It opens a Menu of the hidden items, as
  its description says (switched from reveal-in-place 2026-10-19, API
  unchanged).
- **Overflow menu navigation** (decided 2026-10-19): Menu has no link
  items, so the hidden crumbs' links are still rendered through
  `renderLink`, inside a `hidden` span in the overflow `<li>` (out of
  sight, out of the accessibility tree), and `onAction` clicks the
  matching one. A plain `<a>` navigates and a router's link runs its own
  click handler, so a project needs no second prop (no `onNavigate`).
  Items: the label, the crumb's icon in the leading slot, Menu sm (Figma's
  default). The menu is named by the button (React Aria's
  `aria-labelledby`); the trail stays collapsed. Lost against real links:
  modifier clicks (new tab) on a hidden crumb. Revisit if Menu gets link
  items.
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
- The docs story spaces rows `space-xs` apart (Godwin, 2026-10-19): with no
  gap, filled rows run together in dark mode. That gap is the story's, not
  the component's; a project picks its own gap on its `<ul>`.

- **1 line rows are 32 (Figma, 2026-10-22):** `space-xs` above and below,
  flush or not (4 + 24 + 4); supersedes the 40 above. Dark mode fills moved
  one step darker in Figma the same day (`List/surface-rest` Neutral900,
  hover 800, pressed 700), synced as tokens.
- **3+ rows follow the first-line rule (Godwin 2026-10-27):** with a leading
  slot (40) the text and the trailing slot move down half the difference
  from the title's line (`(list/slot-lg - body-lg line) / 2`, 8), so the
  title centres on the slot and the description runs below; without a
  leading slot nothing moves. Code first; Figma to follow.
- **2 line rows (Godwin 2026-10-27):** Figma's row is to hug with padding
  tokens instead of the fixed 64, with no new token; code's 62 stands.

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
  Button, or `children` as a custom trigger).
- **Option menu** (decided 2026-10-19): `TableOptionCell` takes Menu's
  `items` + `onAction`; the trigger (the DotsThree button, or `children`,
  one element that forwards `ref`) then opens a Menu (sm, `menu/width`).
  `menuPlacement` defaults to `bottom-end` so the panel lines up under the
  button at the row's end; Floating UI still flips and shifts. A disabled
  row disables the menu. Without `items` it is a plain button (`onClick`). The Icon Button is
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

### Tooltip (2026-10-19, the React Aria and Floating UI pattern)
- `import { Tooltip } from 'bland'`, folder `tooltip/`. Figma: set `Tooltip`
  (244:2806, 12 Placement variants) and the private `_Tooltip-pointers`
  (244:2778, 4 directions); every variant's bindings read, inner frames
  included.
- **The pattern every overlay copies** (decided 2026-10-19; Dropdown, Menu,
  Modal, Slider and the pickers follow it):
  - React Aria hooks run the behaviour (`useTooltipTriggerState` from
    `react-stately`, `useTooltipTrigger` and `useTooltip` from `react-aria`);
    Bland renders every element and draws it with its own CSS. No React Aria
    components, no React Aria styles.
  - Bland's own prop names wrap React Aria's: `open` / `defaultOpen` /
    `onOpenChange` / `disabled` (as Accordion), mapped to `isOpen`,
    `isDisabled` and so on inside the component.
  - Floating UI (`@floating-ui/react-dom`) places it: `useFloating` with
    `strategy: 'fixed'` and `transform: false` (it sets `left` / `top`, so
    `transform` stays free for motion), middleware `offset`, `flip`,
    `shift`, a small `aimPointer` middleware in place of `arrow`, `hide`.
    Distances are tokens read at run time with `getComputedStyle` inside
    derivable middleware options
    (`offset(({ elements }) => tokenPx(elements.floating, '--…'))`), never
    numbers in code. `autoUpdate` runs only while open.
  - **CSS `zoom` aware** (2026-10-19, Godwin saw the tooltip drift with the
    docs zoom): under a zoomed ancestor the trigger's rect is in screen px
    but the overlay's size is in its own unzoomed px, and the `left` / `top`
    written to it are drawn zoomed again. So: a `platform` whose
    `getDimensions` multiplies by the element's `currentCSSZoom`, token
    distances multiplied by it too, and every position divided by it when
    rendered. `arrow()` reads the overlay's unzoomed `clientWidth` directly,
    so it can't be fixed that way; the pointer is placed by Bland's own
    middleware from the rects. Every overlay copies this.
  - The floating element is a **manual popover rendered right after the
    trigger** in the DOM, not a portal: the top layer means no overflow clips
    it and no z-index is needed, and staying in place means it inherits the
    trigger's theme (`data-theme` on any ancestor). The open state drives
    `showPopover()` / `hidePopover()` in a layout effect.
  - Entry and exit are CSS: `@starting-style` plus `display` and `overlay`
    transitions with `allow-discrete`, so the exit plays the entrance in
    reverse without keeping React state alive. `data-side` (after a flip) and
    `data-placement` describe where it landed; `transform-origin` is set per
    side from the pointer's offset (`--_origin`), so it scales from the tip.
  - `data-instant` turns motion off: opened from the keyboard (the trigger
    matches `:focus-visible`; React Aria only opens on visible focus), opened
    warm (React Aria's `shouldSkipAnimation`: another tooltip was just open,
    so the next shows without the delay or the animation), or open from the
    first render. It closes the way it opened.
  - The trigger is the caller's element (`children`), cloned with React
    Aria's trigger props and a merged `ref` (`mergeRefs`; React 19 passes
    `ref` as a prop, as Checkbox and Text Input already rely on). It must be
    focusable and forward `ref` and DOM props: Button, Icon Button, a link.
  - `react-aria`, `react-stately` and `@floating-ui/react-dom` are exact
    runtime dependencies, external in the library build like React, so an
    app keeps one copy (React Aria's one-tooltip-at-a-time state is global).
- Props: `✏️ Text` → `text`; `🧩 Slot` with `👀 Slot` → `extra` (named for
  its role, as Chip's slot is `leading`; any node under the text, stacked
  space-sm apart, space-xs below the text). The tooltip never takes focus,
  so `extra` must stay non-interactive (a shortcut, not a button), whatever
  Figma's "small action" says. `Placement` → `placement`, Floating UI's
  twelve names, default **top-start** (Figma's); it flips and shifts at the
  screen edge. **Delays are Motion tokens** (Godwin, 2026-10-19): it opens
  after `duration/tooltip-delay` (500ms) of hover and closes
  `duration/tooltip-close-delay` (100ms) after the pointer leaves, read
  from `:root` once per tooltip; `delay` / `closeDelay` override them, and
  without tokens.css React Aria's defaults (1500 / 500) apply. Like
  `duration/toast-visible`, they are time, not motion. `trigger="focus"` opens on keyboard focus only. Escape
  closes it, a press on the trigger closes it, one tooltip at a time.
  `aria-describedby` points at it only while open. The tooltip takes the
  pointer (no `pointer-events: none`), so moving onto it keeps it open
  (WCAG 1.4.13, hoverable); the close delay covers the gap.
- Visuals: content padding space-sm / space-md, gap space-xs, `rad-md` with
  `.bland-smooth`, `Tooltip/surface`, body-md `Tooltip/text`, width hugs up
  to `tooltip/max-width` (256; the Figma description said 264 and now says
  256, Godwin 2026-10-19) and wraps beyond it. `Elevation/neutral/near` sits on the
  content box; Figma puts it on the whole frame (content plus pointer), so
  in code the pointer has no shadow.
- Pointer: Figma's `_Tooltip-pointers` Direction=down exported as SVG
  (16 x 12, its rad-xs corners baked in) and turned per side by CSS, sized
  `tooltip/pointer-width` x `tooltip/pointer-depth`, filled
  `Tooltip/surface`. `aimPointer` aims it at the trigger's centre, kept
  space-md from the corners (Figma's start and end inset); on a tooltip too
  short for that (a one-line side tooltip, 36 against a 32 trigger) the
  inset shrinks as in Floating UI's `arrow()`, so an end placement's pointer
  can sit up to 1px off the trigger's centre. The distance
  from the trigger is `tooltip/pointer-depth` + `tooltip/offset` (4, the
  gap between the tip and the trigger; added to Figma 2026-10-19). `shift`
  keeps space-sm from the screen edge with `limitShift()`, so it slides
  along the trigger but never off it: without the limiter a left or right
  tooltip stayed pinned to the top of the screen after its trigger
  scrolled away. `hide()` (default boundary) hides it once the trigger is
  out of view.
- Motion: `duration/xs`, `easing/out`, opacity 0 and `scale(0.96)` to full,
  from the tip; opacity only under reduced motion.
- A disabled `<button>` gets no pointer events, so its hover tooltip never
  opens; give a disabled control's reason another way.
- Docs: the demo and the Variants are closed until hovered or focused
  (Godwin, 2026-10-19); the demo's `open` box holds it open (unticked, the
  prop is left out, not `false`, or it would be controlled shut). Variants
  sit tight in rows (open tooltips may cover their neighbours), so the story
  screenshot shows triggers only and `tests/tooltip.spec.ts`
  screenshots four tooltips opened by focus, in both themes. "focused"
  follows the trigger (the Button), never the tooltip.

### Menu and Dropdown (2026-10-19)
- `import { Menu, Dropdown } from 'bland'`, folders `menu/` and `dropdown/`.
  Figma page Dropdown: sets `Menu` (580:9303), `_menu-item` (579:8897, 24
  variants), `_dropdown-trigger` (562:29520, 96 variants) and `Dropdown`
  (585:12559, 27 ready-made compositions); every variant's bindings read.
- **Decided with Godwin (2026-10-19):**
  - **Menu height:** no token. Floating UI's `size` middleware caps the
    panel to the screen space left beside the trigger (space-sm from the
    edge); past that it scrolls in a `ScrollArea`. A project caps it lower
    with its own CSS (`max-height` on `.bland-menu`).
  - **A Dropdown opens a Menu md** at every trigger size, as Figma draws it
    (40px rows, a comfortable touch target); `menuSize` overrides it.
  - **Disabled trigger matches Text Input**: label `text-subtle`, value,
    placeholder, helper and icons `*-minimal`, border `border-subtle`. Figma
    binds the trigger's disabled label to `text-minimal`; it needs the same
    rebinding Text Input had on 2026-10-18.
  - **Menu fade is `fade/sm`** (16), as the token and `docs/components.md`
    say; Figma's Menu instance draws the md fade and should switch to sm.
- **Two components, one panel.** Menu is an action menu (React Aria
  `useMenuTrigger` / `useMenu` / `useMenuItem`, `role="menu"`), opened from
  the caller's trigger like Tooltip. Dropdown is a select (Figma `Type`):
  `basic` and `multi-select` are React Aria `useSelect` + `useListBox`
  (`role="listbox"`, options with `aria-selected`, a `HiddenSelect` for
  forms), `filterable` is `useComboBox` (an `<input role="combobox">`, the
  options filtered as you type, virtual focus). Both draw the same
  `.bland-menu` panel and `.bland-menu__item` rows (Figma `Menu` and
  `_menu-item`), placed by the shared overlay helpers in
  `src/components/overlay/` (the Tooltip pattern: manual popover after the
  trigger, Floating UI fixed with `transform: false`, zoom-aware, tokens
  read at run time).
- **Items are data**, as Breadcrumb's `items` and Progress-wizard's
  `steps`: `items: { id, label, textValue?, leading?, trailing?, danger?,
  disabled?, divider? }[]`. `label` is Figma `✏️ Text` (wraps; a string
  label is also the typeahead text, otherwise give `textValue`). `🧩
  Leading` / `🧩 Trailing` → `leading` / `trailing` (menu/slot 24 square,
  icons icon/md). `Danger=true` → `danger` (`text-danger` label; the
  Menu's `👀 Danger` last item is just a danger item). `👀 Divider` →
  `divider`: a `stroke-sm` `Menu/border` line along the item's bottom,
  inset space-md, as Figma draws it.
- Item states: hover fill `Menu/surface-hover`, pressed
  `Menu/surface-pressed`, disabled label `text-minimal` (`aria-disabled`,
  skipped by the keyboard). `👀 Focused` is an inset 2px `border-focused`
  ring (Figma: inset because the menu clips its content), drawn on
  keyboard focus only (React Aria's `isFocusVisible`, also for the
  combobox's virtual focus). Item padding space-xs / sm / md by size
  (rows 32, 40, 48 with one line), space-md at the sides, gap space-sm,
  label body-lg `text-bold`.
- Panel (Figma `Menu`): `Menu/surface-rest`, an inside `stroke-sm`
  `Menu/border` (an inset shadow), `rad-md` with `.bland-smooth`,
  `Elevation/neutral/mid`, content clipped, no padding. Width `menu/width`
  (256) for Menu; a Dropdown's panel takes the field's width (Figma: Fill
  container inside Dropdown). It sits space-xs (4) under the field or the
  trigger (the Dropdown description), flips above when there is no room.
- Selection marks: a single-select option (and a Menu item in a
  `selectionMode`) shows Figma's Check in the trailing slot, `icon-bold`
  (Figma draws no selected option, so the color is the plain bold icon).
  A multi-select Dropdown option shows a checkbox in the leading slot, as
  the description says: drawn as Checkbox sm's box (selection/box-sm in
  the 24 slot, the Control/checked fills, `Icon/icon-on-color` Check), not
  a native input, since an option can't hold a control.
- **Menu API:** `children` is the trigger (cloned like Tooltip's; React
  Aria's `useButton` props minus its native `type`, which would replace a
  Bland Button's Figma `type`), `items`, `onAction(id)`, `size` (default
  sm, Figma's), `placement` (default bottom-start), `open` / `defaultOpen`
  / `onOpenChange`, `disabled`, and checkable items through
  `selectionMode` + `selectedKeys` / `defaultSelectedKeys` /
  `onSelectionChange` (`menuitemradio` / `menuitemcheckbox`). Width
  `menu/width`.
- **Dropdown API:** one component, `type` basic / filterable /
  multi-select. `value` / `defaultValue` / `onValueChange` take an id
  (or `null`), or an array of ids for multi-select. The trigger follows
  Text Input's contract: `size`, `status` (border, helper, status icon,
  `aria-invalid` on danger), `label`, `helperText`, `icon` (Figma `🌟
  Icon`), `leading` (Figma `👀 Leading input`), `placeholder` (Figma's
  empty `✏️ User input`: "Select…", "Type to filter…"), `disabled`,
  `name`, `ref` (the button or the input), `fieldRef` (the box the menu
  anchors to); other props go on the root. Basic and multi-select draw
  an empty `<button>` over the whole field, under its content, so a
  press anywhere opens it while the chips' remove buttons stay on top;
  its name is the value then the label (React Aria's order), and for
  multi-select a visually hidden list of the values, so the chips'
  "Remove …" names stay out of it. Filterable shows Clear (XCircle,
  `clearLabel`, not a Tab stop) while the input has text and a chevron
  button that toggles the list (not a Tab stop either, React Aria's
  combobox pattern); `inputValue` / `defaultInputValue` /
  `onInputChange`. Figma swaps CaretDown for CaretUp while open; code
  turns the CaretDown 180°, at once.
- **Multi-select chips wrap** (code only): Chips of the field's size
  (sm, md, lg), space-xs apart, wrap onto more lines and the field grows
  from its `input/*` height, rather than hiding values. Figma keeps
  "Select…" after the chips; code draws nothing there.
- Not built yet: submenus (Figma's trailing caret is only an icon here),
  sections and group headings, link items, filterable multi-select.
- Motion: duration/md, easing/out, opacity 0 and `scale(0.96)` from the
  trigger side (`transform-origin` from `data-side`), exit along the same
  path; none when opened from the keyboard (the trigger or input matches
  `:focus-visible`) or open from the start; opacity only under reduced
  motion. The list stays mounted until the exit has played.

### Modal (2026-10-19)
- `import { Modal } from 'bland'`, folder `modal/`. Figma page Modals: set
  `Modal` (6210:1009, Size sm/md) built from the private `_modal-title`
  (614:14281), `_modal-body` (649:3797, Alignment left/center) and
  `_modal-action-bar` (615:14570, Orientation x Alignment x Buttons); every
  variant's bindings read.
- **Decided with Godwin (2026-10-19):**
  - **Backdrop is three Theme tokens**, added in Figma by Claude at
    Godwin's request (2026-10-19; Figma had no scrim):
    `Modal/backdrop-minimal`, `-subtle`, `-bold`, black (Neutral1000) at
    10 / 24 / 40% in light and 24 / 40 / 60% in dark (a dark page needs a
    stronger dim to read as dimmed). The dark bold step needed a new
    primitive, `Neutral/Alpha/a60`. Code: `backdrop` prop, default
    **subtle**; bold for a decision that needs full attention. The dialog
    sets `--_backdrop` from `data-backdrop` and `::backdrop` reads it
    (`::backdrop` inherits from its dialog).
  - **Actions stack by themselves on narrow screens**: `actionsOrientation`
    defaults to `auto`, vertical (full width, primary on top) below
    `breakpoint/sm` (640) and horizontal from sm up; `horizontal` or
    `vertical` forces one.
- **A native `<dialog>` opened with `showModal()`**, rendered where the Modal
  sits (not a portal), like the overlay popovers: top layer, the page behind
  is inert (focus stays inside: Figma's "keep it inside while open"), it
  inherits the theme, and `::backdrop` is the scrim. Implicit
  `aria-modal`. React Aria supplies the rest: `useOverlayTriggerState`,
  `useOverlayTrigger` + `useButton` for an optional `trigger` (cloned like
  Menu's; React Aria gives it `aria-expanded` and, on purpose, no
  `aria-haspopup`), `usePreventScroll`
  while open, `useFocusVisible` for the keyboard check. No React Aria
  `useModalOverlay`: it portals, which loses the theme.
- **Focus:** on open the dialog itself takes focus (React Aria's `useDialog`
  behaviour), so a screen reader reads the title and description first and
  Tab reaches the first control; an element with `autoFocus` inside wins
  (the content mounts only after `showModal()`, since React's `autoFocus`
  can't focus inside a dialog that is still hidden).
  On close focus goes back to what had it (the trigger).
- **Closing:** Escape always closes (the native `cancel`, routed through
  `onOpenChange`); a press on the backdrop closes unless `dismissable` is
  false (an alert dialog that needs an answer); the close button (Figma
  `👀 Close`, on by default) closes; a `<form method="dialog">` inside
  closes natively and the state follows (the native `close` event).
- Props: `size` sm/md (`modal/width-*`, default **sm**, Figma's). `title`
  (`✏️ Title`; `👀 Title` off = no title, give `aria-label`), its element
  `titleAs` (default h2, as Empty State), `aria-labelledby` points at it.
  `icon` (`👀`/`🌟 Icon`, icon/md `icon-bold`, nudged space-2xs down to sit
  on the first line). `closeButton` (default true) + `closeLabel`
  ("Close"). `titleDivider` (`_modal-title` `👀 Divider`). `description`
  (`✏️ Description`, `aria-describedby`), `top` (`🧩 Top slot`), `children`
  (`🧩 Bottom slot`: the form, list or content), `align` left/center
  (`_modal-body` Alignment). `actions` (`👀 Actions`, Buttons count = how
  many you pass) **primary first**; `actionsAlign` left/right/fill (default
  left, Figma's): right puts the primary last on the trailing edge (the DOM
  order is reversed too, so Tab follows what you see), fill shares the
  width. `actionsDivider` (`_modal-action-bar` `👀 Divider`).
  `open`/`defaultOpen`/`onOpenChange`, `trigger`, `dismissable`.
- **Resizing** (Figma: "can be resized wider in layouts") is a width
  override from the project (`className` / `style` on the dialog), not a
  drag handle. The dialog never gets closer than `Layout/margin-mobile`
  (24) to the screen edge, in width or height; past that height the body
  scrolls in a `ScrollArea` (fade md plus thumb) while the title and
  actions stay put. No max-height token, as Menu.
- Visuals: `Modal/surface`, inside `stroke-sm` `Border/border-subtle` (an
  inset shadow, as Menu), `rad-md` with `.bland-smooth`,
  `Elevation/neutral/far`. Title row padding space-lg top, space-sm
  bottom, space-lg sides (top was space-sm until Godwin changed Figma on
  2026-10-19), gap space-sm, **title-md** `text-bold` (Godwin rebound it
  from body-lg-bold in Figma the same day), wraps. Close: Figma's control/xs box
  with an icon/md `icon-subtle` X, drawn as an xs ghost Icon Button (as
  Banner's). Body padding space-md / space-lg, gap space-sm, description
  body-lg `text-bold`; center alignment centres the text and slots. Action
  bar padding space-md / space-lg, gap space-sm; Figma draws md Buttons.
  Dividers `stroke-sm` `border-subtle`, inset space-lg, under the title and
  over the actions.
- Motion: duration/lg (Modals), easing/out, opacity 0 and `scale(0.96)`,
  centred (never from the trigger), the backdrop fading with it; exit along
  the same path; none when opened from the keyboard or open from the start;
  opacity only under reduced motion. Content stays mounted until the exit
  has played and remounts on each open (a form starts fresh).

- **Corners are `rad-lg` (16) (Figma, 2026-10-22),** was `rad-md`.

### Tabs: Section tab, Pill tab, File tab, Segmented bar, Tab bar (2026-10-19)
- `import { SectionTabs, PillTabs, FileTabs, SegmentedBar, TabBar } from 'bland'`,
  folders named after the Figma sets: `section-tab/`, `pill-tab/`,
  `file-tab/`, `segmented-bar/`, `tab-bar/`, plus the internal `tabs/`.
  Figma: `Section-tab` (1471:35740) + `_section-tab-item` (1471:35889, 18),
  `Pill-tab` (632:15552, built from Pills), `File-tab` (1475:3316) +
  `_file-tab-item` (1472:36096, 36), `Segmented-bar` (1471:18170) +
  `_segmented-bar-item` (1471:18248, 12), `Tab-bar` (1471:26961) +
  `_tab-bar-item` (1471:27031, 2); every variant's bindings read.
- **Names**: a component draws the Figma row, so it is plural where the row
  is a set of tabs (`SectionTabs`, `PillTabs`, `FileTabs`) and keeps Figma's
  name otherwise (`SegmentedBar`, `TabBar`).
- **Shared behaviour** (`tabs/tabs.tsx`, not exported): React Aria
  `useTabListState` + `useTabList` / `useTab` / `useTabPanel`, Bland renders
  every element (the Tooltip pattern). Rows are data, as Menu and
  Breadcrumb: `items: { id, label, textValue?, disabled?, panel? }[]` plus
  each row's own fields. Selection is `value` / `defaultValue` /
  `onValueChange` (an id), as Dropdown and RadioGroup; the default is the
  first enabled tab (Figma: "the first is selected"). `keyboardActivation`
  automatic (default) or manual; `disabled` disables the whole row and keeps
  its selection (Figma's Selected + disabled).
- **Panels**: an item's `panel` shows under the row in a `role="tabpanel"`
  labelled by its tab, a Tab stop with the focus ring only while it holds
  nothing focusable (React Aria). No Figma spacing between the row and the
  panel, so none in code: the page spaces it. A tab with no `panel` (tabs
  that drive content elsewhere) drops React Aria's `aria-controls`, which
  would point at nothing. One panel element per tab (keyed), because React
  Aria's panel keeps the id it first got (LEARNINGS). Link tabs (routing)
  are not built yet; use TabBar for navigation.
- **Overflow scrolls sideways, fade only** (Godwin, 2026-10-19): Section,
  Pill and File rows sit in a `ScrollArea axis="x" scrollbar={false}`
  (fade sm, no thumb: an exception to the overflow rule, Godwin's second
  call the same day; `scrollbar` is a new ScrollArea prop, default true).
  Figma's `👀 Overflow` DotsThree item is not used in code (both set
  descriptions say so). With no thumb to drag, a vertical mouse wheel
  scrolls the row sideways (`TabScroll`), handing back to the page at
  either end; arrow keys move focus, which scrolls the focused tab clear of
  the fade. The list keeps space-xs of room on every side for the focus
  ring, given back by a negative margin on the scroll area; the row around
  it is a flex container so those margins never collapse through it (they
  did: the File tab bar showed 4px around its tabs and the Section divider
  sat 4px under the underline; Figma has neither).
- **The selection slides** (Godwin, 2026-10-19): Section's underline and
  Segmented bar's raised thumb are a list indicator
  (`useSelectionIndicator`, `.bland-tabs__indicator`) placed over the
  `data-selected` tab from its rect (fractions kept, divided by CSS zoom),
  and moving by `translate`, `width` and `height` over duration/md
  easing/out when a pointer picks the tab. Arrow keys, the first render and
  resizes place it at once (no motion on keyboard navigation,
  docs/motion.md); reduced motion keeps only the color change. Section's
  underline sits over the tabs (a hovered fill would hide it). **Pill tabs
  do not slide** (Godwin, the same day, after trying it): the pressed pill
  takes its own Control/checked fill. File tab and Tab bar change color
  only.
- **Section tab**: tab height `tab/sm|md|lg` (40, 48, 56, default sm,
  Figma's); Figma's inner frame carries padding space-sm / md / lg, gap
  space-sm, rad-sm and the hover fill `surface-200`. Label body-lg
  `text-subtle`, bold on hover and selected, minimal disabled; icon icon/md
  with the same colors (Figma binds none on hover; it follows the label).
  Count: a square-cornered box (rad-xs) `tab/count-*` high and wide at
  least, padding space-xs, `surface-200` (hover 300), body-sm-bold (lg
  body-md-bold) `text-subtle`. Selected: a stroke-lg `border-brand`
  underline across the tab's bottom over the row's stroke-sm `border-subtle`
  divider (an inset shadow on the row, as wide as the row);
  `control-checked-disabled` when disabled. The row fills its container.
- **Pill tab**: each tab is a Pill (pills.css; its selected rule now reads
  `aria-selected` as well as `aria-pressed`), a `role="tab"` element, row
  gap space-xs. `count` becomes the Pill's Indicator xl secondary.
- **File tab** (fills decided with Godwin, 2026-10-19): Figma bound full
  unselected tabs to surface-300 / hover 400 but Minimized ones and the
  description to 200 / 300. Decision: **unselected surface-300, hover
  surface-400**, the bar's own color, so unselected tabs blend into the bar;
  Minimized rebound in Figma and the description rewritten. Disabled 200,
  selected 100 whatever the state. Height `file-tab/*`, square corners,
  padding space-md (lg space-lg), gap space-sm, body-lg; leading slot
  icon/sm, md, lg by size; separators are Figma's 1px border-subtle gap
  (space-3xs). Close box `file-tab/close-*`, rad-xs, X icon/xs, sm, md
  `icon-subtle`; its fill matches an unselected tab, one step above a
  selected (200) or disabled (300) one; Figma has no close hover, so code has
  none. Minimized: a `file-tab/*` square with the slot only, no close.
- **File tab close** (decided 2026-10-19): a tab's content is presentational
  (ARIA), so the close button cannot sit inside the `role="tab"`, and a
  button beside it inside the tablist fails axe's allowed children. So the
  tab and the button share a `role="presentation"` item that draws the tab;
  the button is pointer only (`tabIndex=-1`, `aria-hidden`), and Delete on a
  focused tab closes it, announced with `aria-keyshortcuts="Delete"` (as
  Search Input's clear is not a Tab stop). `onClose(id)` on the row, per
  item `closable` (default true). Closing the selected tab first selects its
  neighbour (next, else previous) and keeps keyboard focus on it. The focus
  ring is the item's (`:has(:focus-visible)`), square like the tab (Figma
  rounds it rad-xs).
- **Segmented bar**: Figma's "radio group, or tabs if it switches panels"
  is decided by the data: without `panel`s it is native radios
  (`appearance: none`, laid over the whole segment as its hit area and focus
  ring) in a `role="radiogroup"`, with `name` for forms; with `panel`s it is
  the shared tab list. Track `segment/md|lg` (32, 40, default md, Figma's),
  `Segment/track`, rad-md, space-2xs inset, fills its container
  (`segment/width` is Figma's frame). Segments share it equally, rad-md (Godwin raised them from rad-sm in Figma, 2026-10-19),
  padding space-2xs / sm (lg md), gap space-xs, icon icon/sm (lg md).
  Selected `Segment/selected` + `Elevation/neutral/near` + body-lg-bold;
  hover `Segment/hover`; disabled minimal text; selected disabled
  `surface-200` without elevation.
- **Tab bar**: navigation, not tabs: a `<nav>` (default name "Main") of
  links in a list; the current one gets `aria-current="page"`. `current`
  (controlled, from your router) or `defaultCurrent` (default the first);
  pressing an item makes it current and calls `onCurrentChange` (Godwin,
  2026-10-19), then the link is followed. `renderLink` for routers
  (Breadcrumb's contract, plus the `onClick` to keep). Height `tab-bar/height`, `surface-100`, a
  stroke-sm `border-subtle` divider along the top (inset shadow); items share
  the width, icon/lg over body-sm, space-2xs apart, padding space-xs at the
  sides; current `icon-brand` + body-sm-bold `text-brand`. `indicator`:
  Indicator sm danger with its ring, space-2xs outside the icon's top right
  corner; a string is read after the label through the link's
  `aria-label`. No hover (Figma: touch) and no press motion (used all day).
- Motion: color and fill changes ease over duration/xs (as Pill); the
  selection slides as above.

### Pagination and Pagination-table (2026-10-19)
- `import { Pagination, PaginationTable } from 'bland'`, folders `pagination/`
  and `pagination-table/`. Figma: `_pagination-item` (786:9, 18 variants),
  `Pagination-simple` (787:1338, 3), `Pagination-table` (787:2186, 6); every
  variant's bindings read in three read-only `use_figma` calls.
- **Names**: `Pagination` is Figma's Pagination-simple (the plain row is the
  one most pages use); `PaginationTable` keeps Figma's name, as ProgressBar
  and ProgressWizard do.
- **Overflow is automatic** (as Menu's): up to seven pages show every page;
  past that the row always holds seven slots: the first and last page, the
  current page with one page either side, and an overflow item for each gap
  (`1 2 3 4 5 … 10`, `1 … 4 5 6 … 10`, `1 … 6 7 8 9 10`), so the row keeps its
  length as the page changes. Figma's sm example (1 to 5, then 10) is exactly
  the first case. No `siblings` prop yet.
- **The overflow item is a mark, not a control**: DotsThree in the item's
  box, `aria-hidden`, no hover. A Menu of the hidden pages (Breadcrumb's
  pattern) does not scale to hundreds of pages, and the page field of the
  advanced table covers jumping.
- **Previous and next at the ends are `aria-disabled`, not `disabled`**, so
  pressing previous onto page 1 keeps focus on it (a native disabled button
  drops focus to the page). The `disabled` prop disables every item natively.
- **Buttons or links**: items are buttons named "Page N" (`pageLabel`);
  `getHref(page)` makes them links, rendered through `renderLink` (TabBar's
  contract, `onClick` kept) and still calling `onPageChange`.
- **Item**: control/xs, sm, md high and at least as wide (more digits
  grow it), padding space-xs (lg space-sm), rad-sm, body-md (sm) or body-lg,
  icons icon/sm (sm) or icon/md `icon-bold`; tabular figures. Hover
  `Pagination/surface-hover`; current Control/checked-rest (hover
  checked-hover) with text-on-color; disabled text-minimal and icon-minimal
  (Figma binds icon-minimal on the disabled caret), current disabled
  checked-disabled. Figma has no pressed state, so no press motion; fills
  ease over duration/xs. The box: an inside stroke-sm `border-subtle` (inset
  shadow), rad-md, padding space-xs, gap space-2xs.
- **Pagination-table**: `total` and `pageSize` (default 10) give the page
  count and the summary ("1-10 of 100 items", "0 items", singular for one);
  `summary` and `pagesLabel` take a node to replace the text (translations)
  or `false` to hide it (Figma `👀 Items`, `👀 Pages`). Summary fills the
  row, padding space-sm, body-md (sm) or body-lg, text-bold; space-sm to the
  navigation. Advanced: a `<nav>` of the page field, the page count (which
  describes the field) and a box of previous and next.
- **The page field is a Text Input sm at every table size**, as Figma draws
  it (56 x 32 even in the 48 high row), pagination/input-width wide. React
  Aria `useNumberField` drives it: Enter or blur commits, out of range clamps
  to 1 to the page count, an empty or unreadable entry goes back to the
  current page, arrow keys step a page; the wheel is off so scrolling past a
  focused field never changes the page. No grouping (page 1000, not 1,000).
- Fills its container (pagination/width is Figma's frame). Code only: on a
  row too narrow for both, the navigation wraps under the summary.
- New icon: CaretLeft (6080:106855), exported from Figma.

### Slider (2026-10-19)
- `import { Slider } from 'bland'`, folder `slider/`. Figma: `Slider`
  (289:10407, 12 variants), private `_knob` (289:3819, 9) and
  `_slider-labels` (350:1341, 8); bindings read for every size and type,
  rest and disabled, in three read-only `use_figma` calls.
- **One component, `type` single / double** (Figma `Type`), typed as a
  union like Dropdown: single takes a number, double a `[start, end]`
  tuple, for `value` / `defaultValue` / `onValueChange` and
  `onValueCommit` (React Aria's `onChangeEnd`: pointer up, a key, a field
  commit). Defaults `min` 0, `max` 100, `step` 1; the value defaults to
  `min` (single) or `[min, max]`.
- **Behaviour is React Aria** (`useSliderState`, `useSlider`,
  `useSliderThumb`): each thumb is a visually hidden native range input
  (arrows, Page Up and Down, Home and End, forms through `name`), drags
  and track presses move the nearest thumb, a range's thumbs cannot
  cross. Figma has no visible label: name it with `aria-label` /
  `aria-labelledby`; a range's thumbs add `thumbLabels` (default
  Minimum, Maximum). `formatOptions` formats the tooltip, the labels, the
  fields and `aria-valuetext`.
- **Geometry**: a thumb's centre sits on its value, half a thumb in from
  each end, so a thumb never leaves the track (Figma's fr grid puts it
  space-2xs in; a grid cannot share one travel between two thumbs). The
  element React Aria measures is a `__rail` inset by half a thumb, so a
  drag keeps the thumb under the pointer. Bars stop space-2xs short of
  each thumb (Figma's column gap); where a range's thumbs meet, the
  middle bar is simply gone. Row control/xs, sm, md; thumb
  slider/thumb-*; dot selection/dot-sm (sm) or dot-md (md, lg); track
  slider/track; width slider/width, capped at its container.
- **Colors** (Figma bindings): active bar and thumb
  `Control/checked-rest`, thumb hover (and while dragged)
  `checked-hover`, inactive bar `surface-300`, dot `surface-100`; disabled:
  `checked-disabled`, inactive `surface-200`, labels `text-minimal`. No
  press scale (dragging a scaled thumb reads wrong), no motion on the
  value (keys and drags must be direct); the thumb fill eases over
  duration/xs.
- **Value tooltip, on by default** (Godwin 2026-10-19; Figma's `👀
  Tooltip` is off): the real Tooltip, placement top, shows a thumb's
  value while it is hovered, focused from the keyboard or dragged, at once
  (no hover delay), and follows the thumb. Escape hides it until the next
  key, pointer entry or press. `tooltip={false}` turns it off. Tooltip now
  also skips its motion when the trigger holds the focused element
  (`:has(:focus-visible)`), which a thumb does.
- **Labels on their values** (Godwin 2026-10-19; Figma spreads them
  space-between): `labels` true (default, Figma's, five values), 2 to 5
  values spread from min to max and snapped to the step, an array of
  exact values, or false. The ones at min and max sit flush with the
  ends. body-md `text-subtle`, space-xs under the track row, `aria-hidden`
  (the thumbs already read their values and ends).
- **Value fields** (`inputField`, Figma `👀 Input field`): a Text Input
  slider/input-width wide, sm for sm and md, md for lg (as Figma), driven
  by React Aria `useNumberField`: Enter or blur commits, out of range
  clamps (a range's start stays at or under its end), empty goes back.
  **A range gets two** (Godwin 2026-10-19), the start before the track
  and the end after it, named by the slider plus the thumb ("Price
  Minimum"). Fields line up with the track row, not with track and labels
  together (Figma centres the whole column). With two fields the track is
  short: use fewer labels.
- **Snap to checkpoints** (Godwin 2026-10-20, code only; Figma has no
  property for it): `snap` true keeps the thumbs on the labels' values
  (the default five when labels are off), an array keeps them on exactly
  those values, which need not be evenly spaced or match the labels.
  Default false. A drag or a track press lands on the nearest checkpoint
  (the thumb jumps, it does not follow the pointer between them); arrows
  and Page Up and Down step to the next checkpoint that way, Home and End
  to the first and last; a typed field value goes to the nearest. A
  range's thumbs stay on their side of each other. How: React Aria's
  state has only an even `step`, so with `snap` the Slider holds the
  value itself and moves every change React Aria reports to a
  checkpoint; a keydown on a thumb's range input marks the change as
  from a key (step on), anything else takes the nearest. A first value
  off the checkpoints starts on the nearest one; a controlled `value` is
  shown as given.
- Not RTL-aware yet.

### Calendar, Date Picker, Date Range Picker, Time Picker (2026-10-19)
- Imports `Calendar`, `DatePicker`, `DateRangePicker`, `TimePicker`; folders
  `calendar/` (with `dates.ts`), `date-picker/`, `date-range-picker/`,
  `time-picker/` and the internal `date-field/`. Figma: Date & Time page,
  sets Calendar (464:28555), `_calendar-item` (461:13963),
  `_calendar-title-bar` (463:19382), `_calendar-action-bar` (474:3709),
  Single Date picker (483:16976), Date range picker (499:39378), Time picker
  (504:56895). Read in five read-only `use_figma` calls.
- **Values are ISO strings** (Godwin 2026-10-19, asked): a date
  `"2024-11-09"`, a range `{ start, end }`, a time 24-hour `"14:30"`. Same as
  native inputs; no timezone, no extra library in client code. React Aria's
  `@internationalized/date` objects stay inside (now a direct, external
  dependency). Props are parsed once per string (`useDateProp` and friends):
  see LEARNINGS.
- **Segmented fields** (Godwin, asked): React Aria DateField / TimeField
  segments drawn inside Text Input's markup and CSS (`date-field/`). The
  order, separators and placeholders follow `locale` (default the app's
  I18nProvider, else the browser's): en-GB dd/mm/yyyy, en-US mm/dd/yyyy,
  nl-NL dd-mm-jjjj. Leading zeros always. Time placeholders are Figma's
  hh / mm / ss. An empty field draws its separators in the placeholder
  color. The segment being edited is Control/checked-rest behind
  text-on-color (code only: Figma has no editing state). Text Input's
  disabled rules now also read `data-disabled` on the root.
- **Time Picker is the field only** (Godwin, asked): no list of times until
  Figma has one. `hourCycle` 12 puts the AM / PM segment in Figma's trailing
  add-on (the whole box is React Aria's field so arrows reach it); 24 has
  no add-on. Value stays 24-hour.
- **Calendar views**: day grid from React Aria; month and year grids are
  Bland's (3 x 4 buttons in role grid, roving focus, arrows by 1 and 3,
  Home / End, Enter). The title toggle is a button with `aria-expanded`:
  day → month → year (the year view's range label is static, Figma's
  `👀 Dropdown` off). Picking a year keeps the month and opens the month
  view, picking a month opens the days, focus following. The month or year
  in view is the selected cell. Year pages: twelve years from a decade
  (2020 – 2031, as Figma), arrows step ten. Prev / next reuse Pagination
  item sm (Figma's exposed `_pagination-item`). The toggle has no hover
  (Figma draws none; see the 2026-10-20 redesign below).
- **Title bar**: redesigned in Figma on 2026-10-20 (below); the arrows now
  sit at the far end.
- **Today**: an underline under the label (stroke-lg, border-brand;
  icon-on-color on selected, border-bold when disabled). Figma's bar is an
  absolutely placed rectangle with unbound insets, so code uses
  `text-decoration` with tokens; its width follows the label.
- **Outside-month days** show in text-minimal and are not selectable
  (Figma: State=disabled). Weeks per month vary (4 to 6 rows), so the
  height changes between months.
- **Action bar**: Calendar takes any `actions` (they share the width);
  the pickers' `confirm` builds Cancel / Apply sized xs, sm, md per size,
  and a pick waits for Apply. Off by default (Figma's `👀 Action-bar`).
- **Pickers**: the calendar button is a Tab stop (Figma CalendarBlank); the
  calendar opens in the shared Popover as `role="dialog"`, under the field
  (range: under the start field), the same size as the field, focus on the
  selected day, Escape or an outside press closes, focus returns to the
  button. A value out of bounds or unavailable turns the field danger by
  itself. The range picker has one helper under both fields and its group is
  named by `aria-label` (default "Date range"); each field's segments are
  labelled by its own visible label. All fill their container (Figma's 287
  and 582 are frames).
- **Title bar redesign (Figma, 2026-10-20)**: the toggle is a pill filled
  with the new Date/Calendar-title-bar/surface (rad-md, padding space-sm
  start, space-xs end, gap space-xs) holding the bold month or year, the
  plain year, and the List icon (icon/sm, icon-subtle) where the caret
  was; the arrows sit at the far end (space-between). The year view's
  range is bold plain text filling the row. Figma draws no hover for the
  toggle, so code has none (the Pagination hover is gone). The variable
  arrived spelled "Calender" with no description; Godwin chose to fix it
  in Figma before the sync, so the token is
  `--date-calendar-title-bar-surface`.
- **Dividers off by default** (Figma `👀 Divider` on `_calendar-title-bar`
  and `_calendar-action-bar`, 2026-10-20): `titleDivider` and
  `actionsDivider`, both false. The bars keep their space-sm padding
  either way.
- **Height eases** (Godwin 2026-10-20): the area holding the day, month or
  year grid measures its content (ResizeObserver) and sets its own height,
  which transitions over duration/md easing/out, so a five-week month
  growing to six or a switch to the 3 x 4 views slides instead of jumping.
  At once when the change comes from the keyboard (React Aria's modality;
  also before any interaction) and under reduced motion. The area clips
  while it eases with a space-xs clip margin, so focus rings still show.
  The title bar and action bar don't move; a popover around it follows
  through Floating UI's autoUpdate.
- **Feedback round (Godwin 2026-10-20)**:
  - Calendar defaults to **md** (Figma's default variant is sm). The
    pickers' calendar has its own `calendarSize`, default md whatever the
    field's size; the action bar's Buttons follow the calendar's size.
  - **A press on a picker's field opens the calendar** (segments or
    padding, not only the CalendarBlank button) and leaves focus in the
    segment, so typing goes on. The field is not "outside" the popover
    (Popover `keepOpenOn`), so pressing another segment keeps it open;
    Escape in the field, or focus leaving field and calendar, closes it.
    The button still opens it with focus on the selected day and toggles
    it shut. The calendar follows a typed date to its month (unless focus
    is in the calendar); with `confirm` the pending date follows the field.
    React Aria's segments stop `pointerdown`, so the field listens in the
    capture phase.
  - **AM / PM toggles on a press** (two values); typing A or P and the
    arrows still work.
  - Stories keep no room under an open calendar: it opens over what is
    below.
  - The "can't type 0" report was the docs page's zoom shortcut eating the
    key in contenteditable segments, not the components (LEARNINGS).
- Screenshots and specs run these stories on a fixed clock, 11 November 2024
  (Figma's today), in `tests/stories.ts`.

### File Upload (2026-10-19)
- `import { FileUpload } from 'bland'`, folder `file-upload/`. Figma: File
  Upload page, sets File-upload (608:7433), `_uploader` (608:207),
  `_file-upload-progress` (608:384). Read in three read-only `use_figma`
  calls (descriptions and properties, bindings, icon colors and exports).
- **One component, rows as data.** The two `_` sets are private, so code
  has one `FileUpload` with `files` `{ id, name, status, description,
  progress }[]`, like Tabs' `items`. `status` defaults to **uploaded** (the
  rows File-upload shows), not Figma's uploading: a file row with no status
  is a file already there. Uploading itself is the app's job: `onFilesAdd`
  hands over the files, the app puts rows in `files` and updates them.
- **The drop zone is a `<label>` around a visually hidden native
  `<input type="file">`** (Figma: "a button or label tied to a hidden file
  input"). The input is the Tab stop, so click, Enter and Space open the
  picker natively and forms work; the zone draws the focus ring with
  `:has(input:focus-visible)`, as Text Input's field. The input is named by
  `title` (`aria-labelledby`; without a title `aria-label` or
  `aria-labelledby` is required, a TypeScript union as Progress-bar) and
  described by `description` and `fileTypes`.
- **Drag-over is automatic**, not a prop: `data-drag-over` while files are
  dragged over the zone (a depth counter, so moving over its children does
  not flicker); only drags that carry files count. A drop is filtered
  against `accept` (".pdf", "image/*", "image/png", as the picker does);
  misses go to `onFilesReject`. Without `multiple` a drop keeps one file.
- **The input and forms:** without `name` the input is cleared after each
  pick, so picking the same file again (after removing it) still fires;
  with `name` it keeps the last pick, and drops are copied into it with a
  `DataTransfer`, so a plain form submit carries them.
- **Announcements:** a polite `role="status"` region, always rendered, says
  "Added a.png, b.png" on a pick or drop and "<name> uploaded" / "<name>
  failed to upload" when a row turns success or danger. `announcements`
  overrides each sentence. The list itself is not live (progress would be
  read out on every step).
- **Disabled hides the file list**, as Figma's description says; the input
  is disabled and drops are ignored.
- From Figma: root and lists `space-sm` gap, header `space-2xs`; title
  body-lg-bold text-bold, description body-lg text-subtle. Zone: padding
  `space-xl` / `space-lg`, gap `space-sm`, `rad-md` with `.bland-smooth`,
  `stroke-sm` dashed `border-input` on `surface-200`; disc `space-sm`
  padding, `rad-rd`, `surface-300`, CloudArrowUp icon/md `icon-subtle`;
  instruction body-lg text-bold (Figma breaks after "or", so the default
  does too), file types body-sm-bold text-subtle. Hover `surface-300`, disc
  `surface-400`. Drag-over `surface-brand-light`, `border-brand`, disc
  `surface-100`, icon `icon-brand`. Disabled `border-subtle`, text and icon
  minimal. Row: `FileUpload/surface`, `stroke-sm` `border-subtle`, `rad-md`
  smooth, padding `space-md`, gap `space-sm`; FileArrowUp icon/md
  `icon-subtle` with `space-2xs` top padding; filename body-lg one line with
  an ellipsis; description body-sm text-subtle; uploading adds the
  ProgressBar sm (value column on) under the text, `space-sm` apart; danger
  swaps the icon for WarningOctagon `icon-danger`, the border for
  `border-danger`, the description for `text-danger`; success puts a
  CheckCircle `icon-success` where the close button was. Close:
  `control/xs`, `rad-rd`, `FileUpload/close`, X icon/sm `icon-subtle`, no
  hover in Figma, press `scale(0.97)`; named `removeLabel(file)`.
- **Dark row colors** (Godwin 2026-10-20): `FileUpload/surface` is
  Neutral900 and `FileUpload/close` Neutral800 in dark (were 800 and 700),
  set in Figma and synced; the descriptions were rewritten to match.
- **Docs demo height:** a story's `demo.height` sets the playground's
  minimum height (default 320); File Upload uses 640 so added rows stay in
  view.
- **Code only:** the border is CSS `dashed` (the browser's dash length,
  not Figma's 4/4 pattern, which has no token); the component fills its
  container (`file-upload/width` is Figma's frame, used by the story);
  zone colors transition over `duration/xs` `easing/ease`, as Button.

### Code snippet and Code text (2026-10-19)
- `import { CodeSnippet, CodeText } from 'bland'`, folder `code-snippet/`.
  Figma: Code snippet page, sets Code-snippet (990:11356), `_code-action-bar`
  (988:10933), Code-text (6259:1754). Read in three read-only `use_figma`
  calls plus one icon export (Copy, Eye, EyeClosed).
- **Godwin's calls (2026-10-19):**
  - **Bring your own highlighter.** Bland ships none. `highlight(code,
    language)` returns nodes; Bland's CSS maps the usual token classes
    (highlight.js `hljs-*`, Prism `.token.*`, Shiki's css-variables theme
    `--shiki-*`, or Bland's own `data-token`) to the five `Code/*` colors.
    Without it, the code is plain `Code/text`.
  - **Files x languages.** `files: { id, name, code }[]` drive the File tabs;
    `code` is a string or `{ [language]: string }`. `languages: { id, label
    }[]` drive the switcher (`switcher` dropdown / tabs / pills). One file is
    `code` (+ `language`), no tabs.
  - **Fullscreen is a layout variant**, `fullscreen`: square corners, fills
    its container's height, scrolls inside, no Show more. No button enters
    it (Figma has none).
  - **Code text ships too**, the inline `<code>`.
- **Structure:** root `<div>` (surface-100, stroke-sm border-subtle, rad-md
  smooth, clips); with `files` the File tabs' tab panel holds the main area
  (action bar, body, toggle), so the files are a real tablist + tabpanel.
  The body is a vertical ScrollArea around the gutter and a horizontal
  ScrollArea around `pre > code`: long lines scroll sideways while the line
  numbers stay put, and the code never wraps. Each scrolling viewport is a
  Tab stop while it overflows (as Table), its ring drawn inside because the
  snippet clips.
- **Show more only when it is needed:** the toggle appears when the body is
  taller than `code-snippet/height-collapsed` (measured with a
  ResizeObserver). Collapsed without `collapsible` stays capped and scrolls.
  The toggle floats over the bottom of the code, as Figma draws it, and
  scrolling stops at the last line plus the code's own padding (Godwin
  2026-10-20: no extra room under the last line, which the first build
  added). Centered with auto margins, not a transform, so the Button's
  press scale still works.
- **The language menu hugs its labels** (`width: max-content`, Godwin
  2026-10-20), not Menu's `menu/width`.
- **Copy feedback without a timer:** the icon turns into a Check and a
  polite `role="status"` says "Copied"; both reset when the pointer leaves
  the button or it blurs. No duration token is needed. The prop is
  `onCopied`, because `onCopy` is the native clipboard event.
- **The language switcher:** dropdown is a Code/body-md button (surface-200,
  stroke-xs, CaretDown icon/xs icon-subtle; Figma has no hover) opening a
  single-select Menu at bottom-end; with one language it is a plain label
  (no menu to open). Tabs and pills reuse SectionTabs and PillTabs sm, named
  "Language". Without languages the switcher is absent.
- **Highlight mapping:** comment `hljs-comment`, `hljs-quote`, `.token.comment`
  / `prolog` / `doctype`; keyword `hljs-keyword`, `hljs-literal`,
  `.token.keyword` / `boolean`; function `hljs-title`, `.token.function` /
  `class-name`; string `hljs-string`, `.token.string` / `char` /
  `attr-value`; plus `data-token` and the `--shiki-token-*` variables.
- **Dropped from the old map row:** "resizable height". Figma has no
  resizer on Code-snippet; ask before adding one.
- **Code text:** `<span>` (surface-200, stroke-xs border-subtle inset,
  rad-sm, padding space-2xs on sm, space-xs on md and lg) around `<code>`
  in Code/body-sm, -md, -lg text-bold; copy icon icon/xs (sm, md) or icon/sm
  (lg) in icon-subtle (Figma binds none); default size sm (Figma's), so set
  it to match the surrounding text. The copy target is under 24px, as
  Figma's description warns.

### Sidebar (2026-10-19)
- `import { Sidebar } from 'bland'`, folder `sidebar/`. Figma: `Sidebar`
  (1084:13817, 12 variants), `_sidebar-item-group` (1078:9910, 16),
  `_sidebar-item` (1077:3151, 48); every variant's bindings read.
- **Godwin's calls (2026-10-19):** the minimized rail uses the **hover peek**
  (Figma's Minimized State=hover), not tooltips and group menus: the pointer
  over the rail, or keyboard focus in it, opens the full sidebar over the
  page; it closes when the pointer or focus leaves, or on Escape. Rows are
  **data** (`items`, as TabBar, Breadcrumb and Menu), not composable parts.
  **No mobile layout**: below md the app hides it or uses TabBar; a drawer
  waits for a Figma frame.
- **Structure:** the root is the layout box (sidebar/width, or the rail:
  item + space-sm each side); a panel inside draws everything (surface-100,
  a stroke-sm border-subtle right edge as an inset shadow, space-sm above).
  Outside the rail the panel is always sidebar/width, so collapse and expand
  only animate the root's width (duration/2xl, easing/drawer): the page
  slides while the labels never reflow. The peek lays the panel over the
  page (`position: absolute`, `z-index: 1`, no elevation, as Figma's hover
  variant) and reveals it from the rail's edge with `clip-path`; it slides
  back the same way (`data-peek="closing"` until the transition time has
  passed). Keyboard-opened peeks and keyboard toggles are instant
  (`data-instant`); reduced motion drops both transitions.
- **Peek triggers:** mouse pointer only (`pointerType === 'mouse'`), and
  focus only when it is `:focus-visible`: a click leaves focus on the link
  after the pointer has gone, which would keep it open.
- **Rows:** every row is a link (`renderLink` for routers); a disabled row
  loses its `href` and gets `role="link"` + `aria-disabled`. A row with
  `items` is a group: its header is a button (`aria-expanded`,
  `aria-controls`) and cannot be a link. One level of nesting (Figma).
  Default current: the first enabled link (as TabBar's first item);
  default open groups: the one holding the current row.
- **From Figma:** row height sidebar/item-sm|md|lg|xl (24, 32, 40, 48,
  default sm), padding space-xs|sm|md|lg, gap space-sm, rad-sm, icons icon/sm
  at sm and icon/md above; label body-lg text-bold (selected body-lg-bold
  Sidebar/text-selected), icons icon-subtle (selected Sidebar/icon-selected),
  disabled text-minimal / icon-minimal. Fills: hover surface-200, selected
  Sidebar/surface-selected, selected hover -selected-hover, selected
  disabled surface-200. Count box sidebar/count-* high and wide at least,
  padding space-2xs (lg/xl space-xs), rad-xs, surface-200 (hover 300,
  selected Sidebar/count-selected), body-sm-bold (lg/xl body-md-bold)
  text-subtle (selected Sidebar/count-selected-content). Nested rows: an
  icon-wide indent before the icon. List padding space-lg (rail: space-sm
  at the sides), gap space-xs; group and nest gap space-xs. Slots gap
  space-sm and no padding (content brings its own, as Figma's Upper and
  Lower slot examples). Scrolling: ScrollArea with `fadeSize="sm"` (Figma's
  16px fade-mask) and the visible thumb.
- **Rail:** square rows (sidebar/item-*), the icon alone; label and count
  are visually hidden (clip-path), not `display: none`, so the link's name
  stays "Inbox 8" in both layouts; indent, trailing and chevron are hidden;
  nested rows are hidden. `top` and `bottom` may be functions of
  `{ rail }` to draw a narrow version (Figma's rail slot is 32 wide).
- **Collapse button (code decisions):** Figma's collapse frame binds no icon
  color and no hover; code uses icon-subtle, icon-bold on hover, and a 24px
  hit area (control/xs) around the 20px icon. It sits where Figma puts it,
  space-lg from the top and right, over the top slot's row, so a top slot
  should leave that corner free; without a top slot it overlaps the first
  row (as in Figma). DOM order: after the top slot, before the nav.
- **Not built:** Figma's Pipe frame in the minimized group's hidden nest
  (vestigial), tooltips and menus in the rail (replaced by the peek).

### Chat bubble and Chat list item (2026-10-20)
- `import { ChatBubble, ChatListItem } from 'bland'`, folders `chat-bubble/`,
  `chat-list-item/`, and internal `message-sent-indicator/` (Figma
  `_message-sent-indicator`, used by both). Figma sets read with every
  variant's bindings: Chat-bubble (926:9102, 13 variants), `_chat-bubble-tail`
  (6258:1196), Chat-list-item (893:601), `_message-sent-indicator` (895:909).
  Chat-navbar and Chat-message-bar follow below.
- **A bubble is an `<li>`**, as ListItem: the project puts bubbles in an
  `<ol>` inside an element with `role="log"` (Figma's note). Not `role="log"`
  on the list itself: that drops the list role and orphans the `<li>`s.
- **Audio is controlled; the project owns playback** (decided 2026-10-20,
  open for Godwin on the tracker): Bland draws the play/pause button,
  waveform and duration; `playing`/`onPlayingChange` and `progress` (0 to 1,
  played bars) come from the project's `<audio>`. Figma's `audio-playing` is
  `playing`. Waveform: levels 1 to 5 map to chat-bubble/wave-xs to wave-xl;
  default Figma's 26 bars.
- **Typing dots wave** (Godwin 2026-10-20, superseding the static dots):
  each dot steps faint, mid, strong and back (Figma's three dot colors:
  icon-minimal, icon-subtle, receiver content; sender `Messaging/sender-wave`,
  `sender-content-subtle`, `sender-content`) and lifts space-xs at 30% of
  the cycle. One wave per `duration/typing` (1200ms, added to Figma's Motion
  collection for this), `easing/in-out`, looping; dots start a sixth of the
  cycle apart (200ms; a wave, not a list stagger). Reduced motion runs a
  second keyframe with the colors only. Figma's frame is one moment of the
  wave and is also the look without animation (and in the screenshots,
  where Playwright cancels infinite animations). The dots are
  `aria-hidden`; `typingLabel` is read instead (visually hidden), since an
  `aria-label` on a generic span is not allowed.
- **Sender typing** (Godwin 2026-10-20): Figma had the receiver's only;
  `Who=sender, Type=typing` was added to the set (brand bubble, mirrored
  tail, dots in sender colors), so `who` works with `type="typing"`.
- **Tail:** Figma's tail is a 20 x 16 vector in an 8 x 16 frame; 12 of it
  lies under the bubble's rounded corner. Code draws the same path as an
  inline SVG (`height: 100%`, width from the viewBox), mirrored with
  `scaleX(-1)` for the sender (Figma's sender path is the exact mirror).
  Body row aligns bottom, so the tail meets the bottom corner.
- From Figma: bubble padding space-sm space-md, gap space-xs, rad-md
  (`.bland-smooth`), max chat-bubble/max-width; image, video and document
  bubbles are that width. Text body-lg in `Messaging/*-content`. Quote:
  `Messaging/surface-*-quote`, padding space-sm space-md, gap space-2xs,
  rad-md, name body-sm subtle, message body-lg, both one line; receiver
  quote has a stroke-xs `border-subtle` inset stroke, sender none. Root
  gap space-2xs to the meta row (time body-sm `text-subtle`, status, gap
  space-xs). Typing bubble padding space-md (56 x 32). Video play disc
  `Messaging/surface-video-control`, icon `video-control-content`.
- **Focus rings on brand or photo:** `--border-focused` (brand) vanishes on
  the sender bubble, so inside it `--border-focused` is redefined to
  `Messaging/sender-content` (white), and on the video disc to
  `video-control-content`. Redefining the token (not `outline-color`) keeps
  `.bland-focus-ring` and the docs focus preview working. The poster's
  ring is inset, since the media box clips.
- **File meta separator:** Figma draws an unbound 6px vertical line; code
  uses `stroke-sm` x `space-sm` (8), the nearest token (raised on the
  tracker). Its color is `Messaging/receiver-separator` /
  `sender-separator` (Godwin 2026-10-20: the content-subtle color pulled
  attention from the details on either side). Godwin named them
  `*-content-border`; renamed to `*-separator` for what they draw, with
  descriptions.
- Press scale 0.97 on the audio and video play buttons (duration/sm,
  easing/out, none under reduced motion). No hover: Figma has none.
- **ChatListItem** follows ListItem: an `<li>` holding one link
  (`renderLink`), one button, or a plain row. Square (rad-null, no
  smoothing), `surface-100`, hover `surface-200`, padding space-md, avatar
  to text space-md, name body-lg-bold `text-bold`, date and message body-lg
  `text-subtle`, header and preview gap space-sm. Focus ring inset
  (`outline-offset: -stroke-lg`), because rows touch (Figma).
- `unread` defaults **false** (Figma's 👀 Unread is on): an unread dot by
  default would be wrong data. It is an Indicator sm brand plus a visually
  hidden "Unread". Sender rows show `status`, default delivered (Figma's).
- `current` sets `aria-current` (`page` on a link, `true` on a button);
  Figma draws no look for the open chat (raised on the tracker).

### Chat navbar and Chat message bar (2026-10-20)
- `import { ChatNavbar, ChatMessageBar } from 'bland'`, folders
  `chat-navbar/`, `chat-message-bar/`. Figma: Chat-navbar (902:1874, one
  component) and Chat-message-bar (904:3354, State x Replying, 6 variants);
  every binding read.
- **A button per handler** (decided 2026-10-20): Figma's `👀 Back`,
  `Search`, `Voice-call`, `Video-call`, `More`, `Close` booleans become
  `onBack` … `onClose`; a button shows when its handler is given, so a
  shown button always does something. The same for the message bar's field
  icons (`onEmoji`, `onSticker`, `onAttach`), which Figma always draws.
- Navbar icons are fixed by the component (Figma's), so Bland ships them:
  Phone and VideoCamera joined the icon set. `moreItems` + `onMoreAction`
  turn More into a Menu trigger (bottom-end), as TableOptionCell.
- Navbar from Figma: `<header>`, surface-100, padding space-sm space-md,
  gap space-lg, user group gap space-sm, actions gap space-xs, sm ghost
  Icon Buttons (icon-bold), Avatar md, name body-lg-bold `text-bold` (an
  h2, `nameAs`), description body-sm `text-subtle`. Figma's divider is an
  absolute stroke-sm `border-subtle` rectangle; code draws it as an inset
  bottom shadow, so the bar stays 56.
- **Message bar state is derived, not a prop:** filled = the text has
  non-space characters; rest shows the record button (Microphone) only
  with `onRecordStart`, otherwise send stays and is disabled while empty;
  `recording` is the project's state (it owns the recorder), with
  `recordingTime` in a Chip md + Indicator sm danger (Figma's timer).
- **Sending:** the send button or Enter calls `onSend(text)`; Shift+Enter
  is a new line; IME composition never sends. Uncontrolled, the field
  clears after sending.
- **The textarea grows with its lines** (`field-sizing: content`, code
  only; Figma's field is one line at input/md). No cap: there is no token
  for one (raised on the tracker). The send button stays at the bottom.
- From Figma: root gap space-xs; reply panel Messaging/surface-reply,
  inside stroke-sm `Messaging/border-reply`, rad-md, padding space-sm
  space-md, gap space-sm, ArrowBendUpLeft icon/md icon-subtle, "Replying
  to" body-sm `text-subtle` + name body-sm-bold, message body-lg
  `text-bold` (one line each), close control/xs rad-rd
  `Messaging/surface-reply-close` with an icon/sm X in icon-brand. Row gap
  space-sm; field Messaging/surface-messagebar, inside stroke-sm
  `border-input`, rad-md, padding 0 space-md, gap space-sm, icons icon/md
  icon-subtle (Trash icon-danger); send md primary brand Icon Button.
- **Wrapped messages** (Godwin 2026-10-20): the field aligns to its bottom,
  and the field icons sit (input/md - icon/md) / 2 above it, so they stay
  level with the last line of text and with the send button (the bar
  aligns to its bottom too). Recording stays one centred line.
- **The reply panel is as wide as the field** (Godwin 2026-10-20): it sits
  in a column with the field, beside the send button, not across the
  whole bar.
- The docs playground's bar is fixed at message-bar/width (384), so a
  wrapping message doesn't resize it, and it works: record starts the
  recording state with a running timer, delete and send end it, the
  reply's close button closes the reply.
- Field icons are plain 20px buttons (rad-xs ring, icon-bold on hover);
  Figma draws icons, not Icon Buttons. Placeholder `text-subtle` (Text
  Input's). Disabled is Text Input's look (border-subtle, text-minimal,
  icon-minimal). The ring sits on the field while the textarea has focus.

- **Revised 2026-10-20 (Godwin's review):**
  - **Collapse closes at once.** A pointer collapse used to leave the full
    sidebar open over the page (the pointer was still over it) while the page
    slid underneath. Now it slides to the rail (`data-peek="closing"`, panel
    clip and root width together), and hover does not reopen it until the
    pointer has left (`suppressed`). The page follows the root's width in
    step (Godwin: page follows). A keyboard collapse is instant and keeps
    the focus peek, so the focused button stays usable.
  - **No icon jumps.** `data-compact` (minimized and not open) puts the
    rows in the rail's places (list padding space-sm, icon inset
    (item - icon) / 2, row width sidebar/item-*) while the labels stay drawn;
    padding and width move with the panel (duration/2xl, easing/drawer), so
    icons and fills slide from rail to full and back. Labels hide only in
    the rail itself. Open groups fold while compact.
  - **Toggle in flow** in a header row: beside the top slot (end of the
    row, space-lg in), or in its place when there is none, a row-sized
    button whose icon lines up with the rows' (the size's icon, not
    Figma's icon/md); the list then starts space-xs under it. In the rail
    it stays as the expand button, except beside a top slot (no room).
  - **Panel surface-200** (Figma, 2026-10-20). Figma still binds row hover,
    the count box and the selected disabled fill to surface-200, which
    vanish on it; code goes one step up (hover surface-300, count 300 / hover
    400, selected disabled 300 / count 400), Godwin's call, for Figma to
    rebind.
  - **No scrollbar** on the list, the fade alone (Godwin), a second
    exception to the overflow rule after tab rows.
  - **Groups animate:** the nest's height (and its space-xs top padding)
    eases over duration/md easing/out with `interpolate-size`; closed it is
    `visibility: hidden` as well, out of the Tab order;
    `overflow-clip-margin: space-xs` keeps nested focus rings whole.
    Keyboard toggles are instant.

- **Revised again 2026-10-20 (hover and slots):**
  - **Hover intent.** Quick passes flashed the rail open and shut. It now
    opens only once the pointer rests on it for `peekDelay` (each
    `pointermove` restarts the wait) and closes `peekCloseDelay` after it
    leaves, so a brief exit does not close it. Defaults are the Motion
    tokens `duration/sidebar-peek-delay` and
    `duration/sidebar-peek-close-delay`, which Godwin adds in Figma
    (suggested 200 and 300 ms, as Tooltip's delays came about); until the
    sync `tokenMs` finds neither and both are 0. The props take ms, as
    Tooltip's `delay` / `closeDelay`.
  - **Slots cross-fade.** A slot function now gets `rail` from the compact
    state (minimized and not open), so it switches when the slide starts,
    not when it ends. `SlotFade` keeps the old version as an out-of-flow,
    inert, `aria-hidden` layer that fades out into a blur while the new one
    fades in out of it (opacity + `blur(var(--space-xs))`, Godwin's call:
    space-xs as the radius), over duration/md easing/out; the slot's height
    eases from the measured old height to the new one. Reduced motion keeps
    the opacity only; keyboard switches are instant.
  - While sliding, labels are clipped (`text-overflow: clip`) instead of
    re-ellipsized every frame; at rest they still end in an ellipsis.

- **Revised a third time 2026-10-20:**
  - **The hover delays exist now.** Claude added `duration/sidebar-peek-delay`
    (200ms) and `duration/sidebar-peek-close-delay` (300ms) to Figma's
    Motion collection, with descriptions, and synced them (docs/tokens.md).
    Tweak them there for every Sidebar, or per Sidebar with `peekDelay` /
    `peekCloseDelay` (ms).
  - **Rail slots are centred.** A slot function's rail version is laid out
    in a rail-wide box with its content centred (`data-rail` on the slot
    layer), during the slide as well as at rest, so a logo mark or an
    account icon sits on the rail's centre line with the row icons. The
    rail version brings no side padding of its own.
  - **Story:** one sidebar per row, each in a full-width frame with a page
    beside it, so collapsing one never moves another; the demo frame is as
    wide as the playground stage (`100cqi`), so it never re-centres.

## 7. The docs site (`npm run docs`, 2026-10-17)

- The demo stage is an inline-size container (2026-10-20), so a demo that
  fills its container can size to it: Code snippet's frame is
  `min(var(--code-snippet-width), 100cqi)`.

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

### Logo (2026-10-25)

- **The wordmark is live text** in the text style of its size (lg
  Heading/heading-md, sm Title/title-md), the same as Figma's text layer, so it
  follows the tokens and themes. Figma's description says code should name the
  product with alt text; the visible text does that, so there is no SVG or alt.
- **`children` replaces the wordmark (code only)**, default "Bland". Figma's
  text is fixed, but a client project needs its own product name next to its
  mark. Figma only offers the mark slot.
- **The mark is decorative** (`aria-hidden`) and sits in the logo/mark-*
  square; an `img` or `svg` inside keeps its own aspect ratio up to that size.
  On a brand fill the project supplies its white version; Bland doesn't recolor it.
- **On-color goes on `surface-brand-strong`.** It stays #0062ff in both themes
  (5.0:1 with white); `surface-brand` lightens to #659cff in dark, where white is
  2.7:1 and axe fails it. Found by the dark a11y check on the story.
- **`href` makes it the home link**, rendered through `renderLink` as TabBar and
  Breadcrumb do, with the focus ring at rad-sm. No hover, as in Figma.

### Docs site redesign (2026-10-22, Figma "Doc Design update", node 6612:88042)

- **Layout:** sidebar (sidebar/width) | page (720 reading width, inside
  space-2xl padding) | page contents rail (sidebar/width, from
  breakpoint-xl). A toolbar over the page holds the theme switch (left) and
  the search trigger (right). Mobile keeps the top bar with a Menu.
- **Sidebar:** brand (heading-sm "Bland", body-sm uppercase "Design
  system"), then Overview, Foundations and Components; rows drawn as
  `_sidebar-item` md with a Phosphor icon for Overview and each style page
  (Breakpoints, absent from the mockup, uses Devices). Docs-only icons live
  in `playground/docs/icons.tsx`, exported from the Figma Icons page.
- **Theme switch is a SegmentedBar, Light / Dark** (Figma). No System
  option: until one is picked the page follows `prefers-color-scheme` (no
  `data-theme`) and the bar shows the system's choice; a pick is
  remembered per browser. Replaces System / Light / Dark buttons.
- **Page header:** heading-lg title with stroke sm Icon Buttons to the
  previous and next page in sidebar order (`playground/docs/pages.tsx` is
  the one list for sidebar, pager and search); lead body-lg text-subtle;
  the import line is a copyable Code text lg.
- **Playground controls are Bland components:** Dropdown (sm, basic) for
  options, Toggle for booleans, Text Input (sm) for text, a stroke xs
  Reset button, in a surface-200 panel. `children` is labelled `label`
  (Figma's word). The panel is 240 wide (Figma 200; 240 keeps option names
  readable). The stage has Figma's dot grid (border-bold dots every
  space-sm). Zoom buttons are stroke sm Icon Buttons.
- **Code view under the playground** (as shadcn): a Code snippet with a
  whole file to copy, the imports of every Bland name the JSX uses and an
  `Example` component rendering the current props; long tags put one prop
  per line. A small regex highlighter (`playground/docs/highlight.tsx`)
  emits `data-token` spans, since Bland ships no highlighter.
- **Variants:** each story group is Figma's variant card: surface-200 frame,
  the rows centred in a bordered surface-100 box, the group's label under
  it as the caption. Stories are unchanged (the page splits each pg-stack).
- **Props tables use Bland's Table** (md): Prop 192, Type and Default 160,
  Description the rest; names, types and defaults are Code text lg,
  options one chip each, Required in text-danger; descriptions wrap
  (overrides the cell's one-line ellipsis in docs CSS).
- **Page contents rail:** every `Section` (and the header, as Installation
  or Introduction) is listed; the section being read is bold. Buttons, not
  links, because the router owns the hash.
- **Search (⌘K / Ctrl+K, or the toolbar trigger):** a Modal (md, no title,
  named "Search Bland") holding a Search Input and 1 line List rows grouped
  Foundations / Components (title matches), then Other results (page
  descriptions, component props, token names and uses, with the text that
  matched). Every word must match. Arrow keys walk the results, Enter in
  the field opens the first. Nothing found is an Empty State with
  ListMagnifyingGlass. The results list is 400 tall (Figma's dialog is 480).
- **Overview:** stat cards (surface-brand-light frames, border-brand
  cards, brand numbers) on the dot grid, a View Figma file link, Styles
  and Components as tile grids, and the install snippet as a Code snippet.
- **Follow-ups (Godwin, 2026-10-22, same day):**
  - The theme switch and search stay at the top (sticky toolbar, under the
    mobile top bar); a border-subtle hairline shows once the page has
    scrolled under it.
  - The contents rail glides to a section (native smooth scroll, a jump
    under reduced motion); sections stop space-lg under the toolbar.
  - Search is a combobox: focus stays in the field, the first result
    (Colors when empty) is highlighted on opening and after each keystroke,
    arrows move the highlight (List's hover fill), Enter opens it, the
    pointer moves it too.
  - More room: the page is 960 wide (leads stay at 720). The playground is
    a container: beside the preview in a 320 panel once the frame is 880
    wide, otherwise under a full-width preview in two columns of label and
    control. Preview 400 tall beside the panel, 360 stacked; controls
    space-xl padding, space-md between rows. The props table keeps its
    columns and a 280 description, and scrolls sideways when narrower.
- **Second round (Godwin, 2026-10-22):**
  - **Scrollbars show only while scrolling, everywhere** (ScrollArea, so
    every component and the docs): the thumb appears on scroll, stays while
    dragged or under the pointer, and fades out over duration/md once
    scrolling has stopped for `duration/scrollbar-hide-delay` (1000, the
    macOS overlay scrollbar standard; added to Figma's Motion collection,
    Godwin's call). The edge fade is unchanged. CLAUDE.md "Overflow" and
    the Figma `_scrollbar` description updated.
  - The sticky toolbar has no hairline; once the page scrolls, the page
    colour fades out over fade/md below it.
  - Contents rail: an entry is current once its top reaches the toolbar
    (was a third of the way down, so short sections such as Installation
    lost to the next); a clicked entry stays current while the page glides.
    Variants expands to one entry per variant card (its caption, one line
    with an ellipsis) while Variants or one of them is current.
- **Third round (Godwin, 2026-10-22):**
  - The contents rail lists sections only; the variant entries are gone
    (cards sit close together, so the entries added nothing). The rail
    list is at most half the window tall, then scrolls, and keeps
    space-2xl from the right edge.
  - Playground: softer dots (border-subtle), a taller preview (520 beside
    the panel, 440 stacked), Reset is a Button sm.
  - Variant captions always sit under the box: story helper components
    (Modal's Row, Table's Group) are called to reach their pg-stack, and
    the stack keeps its own props (max width, the click handler that stops
    Tab bar links navigating). A stack with a max width fills it.
  - **Code text:** when the code wraps, the copy button stays on the first
    line (top aligned, one line of the code's text style tall).
- **Fourth round (Godwin, 2026-10-22):**
  - **Copy feedback is timed:** Code snippet and Code text show the Check
    and announce Copied for `duration/copied-visible` (2000, the common
    standard; new Figma Motion token), wherever the pointer goes, then the
    Copy icon returns. Supersedes "until the pointer or focus leaves". A
    second copy restarts the wait.
  - Style page token tables use Bland's Table (md), as the props tables:
    shared `.docs-data` styles (border, wrapping, top-aligned cells), the
    sample column hugging its drawing, token names on one line, Use in
    text-subtle.
  - Contents rail: a brand bar on a border-subtle track slides to the
    current entry, and the rail's list scrolls itself to keep that entry in
    view (both duration/md easing/out; at once under reduced motion; no
    animation for the first placement on a page). Entry colours ease too.
- **Fifth round (Godwin, 2026-10-22):**
  - Style pages run Colors, Typography, Spacing, Icons, Sizing,
    Breakpoints, Elevation, Motion, Corner radius, Stroke (sidebar, pager,
    search and overview follow `stylePages`).
  - Token tables: names are Code text md with its copy button (copies the
    name); values are Code/body-md. Data table containers are rad-lg.
  - Icons page: cards pad space-md at the sides; long names end in an
    ellipsis (full name in the tooltip title).
- **Contents rail has no scrollbar (Godwin, 2026-10-23):** its list scrolls
  with the edge fade alone (`scrollbar={false}`, as the Sidebar's list); it
  scrolls itself to keep the current entry in view.


- **Docs site, brand reset (2026-10-26, Godwin):** one reset, **Reset to Bland** on the Brand theme page; no toolbar button. The anchor field reads **Your color becomes step**.

- **Brand color placement (2026-10-26, Godwin):** no step to choose. A color lands unchanged on the Bland step closest in OKLCH lightness (`placeStep`), and the contrast fix never moves that step. Brand theme page rebuilt from Figma 6773:21840 (picker on the swatch, floating action bar: Reset to Bland, Fix contrast, Apply to site).
- **Brand page action bar (2026-10-27, Godwin):** shown only while there is something to reset (a non-Bland palette, or a brand applied); rises in and sinks out over duration/lg easing/out.
- **Color picker formats (2026-10-27, Godwin):** the picker field reads and writes HEX, RGB, HSL and OKLCH (format menu, kept per viewer); the panel is 288 wide (Figma 256) so an OKLCH value fits.
- **Brand page actions (2026-10-27, Figma 6773:21840):** Reset and Apply to site in the Brand color heading (the floating bar is gone); contrast misses as a colored warning Banner with Fix contrast and Show breakdown; nothing about Bland's own near-misses on Bland's base blue.
- **Brand page contrast result (2026-10-27, Godwin):** "Contrast checks out" when nothing a project caused misses (Bland's own near-misses count as passing on the page); hidden while dragging in the picker, eases in on release. The picker opens at the tap point.
- **Brand page contrast result motion (2026-10-27, Godwin):** scale 0.97 + opacity, in duration/md, out duration/xs, easing/out, from the top centre; no height animation.
- **Popover exit (2026-10-27, Godwin):** the shared popover opens over duration/md and closes over duration/xs (same path, easing/out). Exits quicker than entries is now the motion rule (docs/motion.md).
- **Extra project colors (2026-10-27, Godwin):** up to three, beside the brand, never used by Bland's components. Each: `--name-0…1000` and themed roles `--name-surface`, `-surface-strong`, `-surface-light`, `-text`, `-icon`, `-border` that mirror the brand roles' light/dark steps; six contrast pairings; names can't take a Bland prefix. Chart palette deferred to a Figma design.

## Agent skill notes (2026-10-27)

- `docs/agent-skill.md` collects what a project's agent must know to use Bland, as we go; the end-of-project skill is written from it (Godwin 2026-10-27).
- Brand theme page: the brand's contrast result hides on Bland's own brand whatever the extras; each extra's result counts its own pairings (12), not the brand's 70.

## Brand theme page: tabs, contrast inside the card (2026-10-27, Figma 6806:6170 / 7199 / 8283)

- The tools sit in Section tabs: Brand colors (brand + neutral), Extra colors, How to use (the CSS). Preview stays under the tabs. The table of contents shows one "Colors" entry for the tab block (`Section toc={false}` inside it).
- The contrast result (banner, and the breakdown table on surface-100) sits inside the color's brand-light card, space-sm under the swatch; `--docs-fold-gap` lets the fold use the card's gap.
- Extra colors: primary Add color in the heading; an Empty State (Swatches icon, "No colors added", Add a color) when there are none. Each extra's header is its name as an in-place field (title-md, pencil) with a danger stroke Icon Button to remove it; a bad name shows its error under it. Every color card uses surface-brand-light, as Figma draws it (an extra's card is not tinted with the extra).
- Roles row: six equal columns, each the role's token and its value for the page's theme only; switching the theme switches them (Figma annotation on 6806:9008). Both values are set inline and CSS picks one.
- (2026-10-27, later) Each extra's card takes its own surface-light role (step 50 in light, 1000 in dark, as the brand card's surface-brand-light), switching with the page theme. The Extra colors tab has no heading: its note and Add color share a row (note's first line level with the button, wrapping under it on a phone). The extra's name is title-lg, shown capitalized; the token stays lowercase.
- (2026-10-27) Default extra colors come from the brand by color harmony (Godwin): complement first, then 90° and 270°, each halfway to its hue's most vivid lightness and capped at the brand's chroma (`harmonyColor`). Replaces the fixed purple/amber/teal list.
- (2026-10-27) Reset on the Brand theme page asks first (Godwin): a Modal "Reset to Bland’s colors?", no icon, one short paragraph: "Your N extra accent colors will be removed too." (when there are any) and that it can’t be undone (Godwin dropped the list of what goes back); danger "Reset colors" first, secondary Cancel.
- (2026-10-27) Color picker: RGB, HSL and OKLCH are one field per number (Godwin: values must not run together), each with its unit beside it (°, %), its range clamped, arrow keys stepping (Shift ten), a paste of a whole color taken by any of them; HEX stays one field. OKLCH lightness shows as a percent. The format label is body-lg-bold; the picker is 352 wide (space-9xl + 0.75 x space-7xl).
- (2026-10-27) Reset dialog rebuilt from Figma 6819:11620: description "Reset this color to Bland’s default color. Your N extra accent colors will also be removed. You can’t undo this." and an info Banner (colored) in the body's bottom slot: "Copy the CSS under How to use first if you want to keep this palette." Reset colors (danger) then Cancel (secondary).

## Batch 1 of the open decisions (Godwin, 2026-10-27)

- Dark mode switch: both (`data-theme` wins, else `prefers-color-scheme`); recorded in CLAUDE.md, Light and dark above, `docs/agent-skill.md`.
- Lint scope kept as is (`docs/lint.md`, "Scope kept as is").
- ChatBubble audio stays project-owned; an optional hook may come later.
- Waiting on Figma (Batch 2), not built yet: Chat list item selected look (as the Sidebar's selected row, on `aria-current`); message bar cap from a new `message-bar/max-height` (about 200), the textarea then scrolls in a ScrollArea; selected disabled pill count rebound to a contrasting color in dark; `_menu-item` slots rebound to the top; List 2 line row hug; chat file separator bound to space-sm (code is already 8).
- Built: List 3+ rows centre the title on the leading slot (List item above).

## Batch 2: Figma rebinds and the code that waited on them (2026-10-27)

- Figma (done by Claude through use_figma): `_menu-item` rows top aligned; `_dropdown-trigger` disabled label Text/text-subtle; Menu `_fade` Size=sm; selected disabled Pills count Indicator neutral **primary** (secondary vanished on Control/checked-disabled in dark); List 2 line rows hug at 62 (space-sm padding, no fixed 64); Chat-list-item gets `Selected=true` variants on new `Messaging/surface-list-selected` (Brand100 / Brand950) and `-selected-hover` (Brand200 / Brand900), the Sidebar's selected tint; document file separator length bound to space-sm; new `message-bar/max-height` = unit/168 (about six lines; no unit/200 primitive exists, so 168 rather than a new primitive); `_sidebar-item` hover, count and selected-disabled fills one step up (surface-300, count 300/400); Sidebar, group and item descriptions cleaned (no rail tooltips or menus, quotes unescaped via `descriptionMarkdown`).
- Code: Pill count for selected disabled is neutral primary; ChatListItem `current` takes `--messaging-surface-list-selected` (hover `-hover`); ChatMessageBar's textarea sits in a ScrollArea capped at `--message-bar-max-height` (the textarea is `display: block` there, or an inline line gap made the field 46).

## Chart palette (2026-10-27)

- `--chart-1` … `--chart-8`, generated, not designed in Figma first (Godwin). Order: brand, extras in order, then hues in the widest gaps left (45° apart with the brand alone), lit and saturated like `harmonyColor`. Every series light and dark; dark lighter by Bland's 600-to-400 gap; 3:1 on `--surface-100` in each mode. Brand and extras are `var()`s of their `--surface-brand`-mirroring steps (600/400, moved along their scale only for 3:1); generated series are hexes.
- Neighbours: ΔE (OKLab ×100) at least 15 under normal vision and 6 under protan, deutan and tritan (Machado 2009, severity 1), target 8 (6 to 8 warns: label the series). Generated series are ordered (all orderings tried) and nudged in lightness to keep them apart; brand and extras never move. Neighbours only: scatter and maps should stay at three or four series.
- Bland's default is appended to `tokens.css` by `npm run tokens` (not in `tokens.json`: not a Figma variable); a project's goes at the end of its override file. `chart` is a reserved extra name.
- Brand theme page: a Chart colors tab (series in both modes, source, check banner) between Extra colors and How to use; the previews draw a stacked bar chart (2px gaps, legend) from inline `--chart-N` values for their theme. Apply to site does not set the chart tokens (only `--chart-1` follows, through `var(--brand-600)`).
- Lint unchanged: it doesn't reject `var(--chart-N)` (it only rejects raw values and brand/neutral primitives); "components never use them" is a rule in docs, not enforced.

## Release prep: package and docs hosting (2026-10-27)

- Version **0.1.0** (CHANGELOG "unreleased"); `"private": true` stays until Godwin picks a registry. Semver: before 1.0 a minor may break, a patch never does.
- Peer deps **React 19** (`^19.0.0`): components take `ref` as a plain prop, which React 18 drops. Was `>=18`, which was wrong.
- `exports`: `bland`, `bland/tokens.css`, `bland/fonts.css`, `bland/base.css`, `bland/styles.css`, plus `bland/package.json`. `files`: `dist`, README, CHANGELOG. `prepack` runs the build. `repository` set (GitHub Packages links through it).
- CSS order for projects: tokens, fonts, base, styles, then the project's `brand.css` (README).
- Name: `bland` is taken on public npm, so npm or GitHub Packages means `@jgodwyn/bland`; a git install keeps `bland`. Godwin's call (`docs/release.md`).
- Docs site builds static with `npm run docs:build` into `dist-docs/` (`base: './'`, hash routes, works under a subpath); `docs:preview` on 5181. Host configs are inert examples in `docs/hosting/`.
- `npm run test:package` proves the tarball in a throwaway Vite app (`scripts/release/package-smoke.ts`).
- **Adjust my color (2026-10-27):** when every miss left is one only the entered color's step can fix, the Contrast warning swaps Fix contrast (which used to sit disabled) for Adjust my color: the color moves to the nearest lightness that clears it, same hue and chroma (`adjustColor` in `scripts/brand/core.ts`), the banner names the new hex first, and the result turns to Contrast checks out. Brand and extras alike. The fix itself still never moves your color.
- **Your brand color is never changed (Godwin 2026-10-27):** no tool on the page or in the command moves or suggests moving the color you entered. When every contrast miss left is on its own step, the warning drops Fix contrast (no disabled button) and says the miss is on your color, kept as picked: keep it or pick another color. An Adjust my color button that nudged the color was tried and taken out the same day.

## Chart palette: your own picks, plain check, card layout (2026-10-27)

- A project can pick the color of any series after the brand and extras (Godwin, yes to "should users change chart colors"): `--chart N=#hex` or tap the swatch. The pick keeps its place and light color exactly; dark is made from it (lift capped at OKLCH 0.85). Generated series fill the hue gaps around picks; only they are ordered and nudged. Picks are marked `/* picked */` in the override file; `check` reads a file's chart block as it is.
- Chart colors tab laid out like Brand/Extra colors: intro note with "Use Bland's picks" beside it (as Add color), one brand-light card ("Tap to change") holding a 4-column grid (2 on a phone) of compact swatches (title-md hex, md copy icon), each headed by its token and its source (Brand color, Extra: name, Bland's pick, or Reset on your pick), the check inside the card, then Light and Dark step rows. Brand and extra swatches aren't tappable here.
- The page's chart check is plain words (`chartAdvice`): one line per too-faint series or neighbour pair, the worst of it only, and what to do. No ratios, ΔE or protan/deutan/tritan on the page (Godwin: nobody understands them). Fails: "Some colors need a change"; near misses only: "Some colors are close for color-blind readers".
- Picks are kept for the visit in sessionStorage (`bland-docs-chart-picks`); Reset on the Brand colors tab clears them too.
- (2026-10-27, later; Godwin) No Light and Dark rows: each swatch shows its color for the page's theme. One block per color, as an extra color's (token heading, source or Use Bland's pick, card); only Bland's picks and yours say Tap to change. Each color has its own check inside its card ("This color checks out" / "This color needs a change" / "Close for color-blind readers") and Fix color, naming the hex first; a pair's problem shows on the color to change.
- (2026-10-27, later; Godwin) Chart colors: the brand's and extras' cards say "You can't change this" where the others say Tap to change; blocks space-2xl apart (the extras keep space-5xl); a color's check is hidden while a color Bland made checks out (as the brand's), shown on your picks and on any problem.
- (2026-10-28, Godwin) A chart pick changes nothing else: Bland's picks come from the brand and extras only, and a pick replaces Bland's in its slot (before, every pick moved the hue gaps, so all of Bland's picks shifted). Clashes a pick makes show in the check, and Fix color (hue search now all the way round) solves them on that color.
- (2026-10-28, Godwin) No "checks out" banner anywhere on the Brand theme page (brand, extras, chart colors): a result shows only when something misses.
- (2026-10-28, Godwin) A chart color's warning folds in and out like the brand's and extras' (the shared `.docs-fold`, keeping the last warning while it folds away, each new warning easing in).
- (2026-10-28, Godwin) A clash between two chart colors shows on the one you just changed (`chartAdvice(…, edited)`; the page tracks the last series you picked or fixed), then on a pick, then on the later one.
- (2026-10-28, Godwin; replaced below) Picks moved on to the next free slot when an extra needed theirs.
- (2026-10-28, Godwin) Every chart color but the brand's is editable, an extra's slot too; a pick stays in its slot over an extra (no more moving it on, `placePins` dropped) until Use Bland's pick. Each card's warning is written about that color, one line per kind of problem naming its neighbours (`localNotes`), never "Series N … pick another color for series N".
- (2026-10-28, Godwin) Banner messages are sentences in one run, no line per sentence (break lines only for a real list). The chart warning ends "Fixing this color changes it to #…".
- (2026-10-28, Godwin) Each chart color's card takes its own quiet tint (steps 50 / 1000 of a scale made from the color, the extras' surface-light role), not surface-brand-light; the brand's card keeps the brand tint.
