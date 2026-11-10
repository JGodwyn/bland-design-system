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
- **Surfaces that don't mirror (Godwin 2026-11-02).** The numbered surfaces
  (`surface-100` … `600`) mirror between modes, so "darker in light" becomes
  "lighter in dark". That breaks a gray page with white cards: mirrored, the
  page turns lighter than the cards. Three Theme tokens hold the pairs the
  mirror can't make: `surface-sunken` (Neutral50 / Neutral950: a gray app
  background, a demo stage, a well), `surface-raised` (Neutral0 / Neutral900:
  a card on it) and `surface-raised-hover` (Neutral50 / Neutral800). For
  project layouts; no Bland component uses them, and components keep the
  numbered steps for states and nesting. No `surface-raised` alias of
  `surface-200`: raised means on top of sunken. On the docs site the Overview
  page is `surface-sunken` with `surface-raised` stat cards and tiles (hover
  `surface-raised-hover`), through a `--docs-page` color the page, top bar and
  toolbar share. The Playground and variant frames stay `surface-200` around a
  `surface-100` box (Godwin: their lighter gray frame in dark is wanted; a sunken
  frame matched the page and showed nothing). Superseded in part on the same
  day: components now use `surface-raised` (next entry).
- **Raised parts and see-through fields (Godwin 2026-11-02).** The audit after
  the raised and sunken surfaces: a part that is white in light should sit
  above the page in dark, and a field should stay visible on a raised card or
  a modal, which are Neutral900 in dark like the old field fill. Two rules:
  - White parts take `surface-raised` (hover `surface-raised-hover`): Chip,
    Pill, Code snippet and its action bar, Banner and Notification (uncolored),
    Tab bar, Progress wizard markers. Pill disabled stays `surface-200`.
  - Fields and small fills inside controls take `surface-field` /
    `surface-field-hover`, **see-through in both modes** (Godwin: light too, so
    a field on a gray page or the Sidebar doesn't vanish): `Neutral/Alpha/a6` /
    `a10` (black) in light, new `Neutral/Alpha/white-a6` / `white-a10` in dark,
    so the field is always one small step darker (light) or lighter (dark) than
    whatever it sits on: on the page, a card or a modal. Same reasoning as
    shadcn's dark inputs (white at about 5%) and Apple's fill colors. Used by
    the TextInput, Dropdown and Messaging message bar tokens (so Text Input,
    Text Area, Search, Numeric, the date and time fields, Dropdown, the chat
    bar), Checkbox and Radio boxes (also in Menu), Chip count and close,
    Section tab count, Code snippet language button, CodeText, the File Upload
    drop zone and the Accordion header. Rejected: solid Neutral800 fields (1.50:1
    on the dark page against 1.12 in light, too bright) and a field token per
    background (components would have to know what they sit on).
  - Kept: Sidebar panel, selected File tab, Indicator ring, Chat navbar, the
    Segmented bar track (its own token), Slider dots, File Upload icon disc.
  - The docs Elevation page is a sunken stage with raised cards.
  - Code snippet file tabs (Godwin 2026-11-02): the selected tab takes the
    snippet's own fill (`surface-raised`, close box `surface-raised-hover`) so
    it runs into the code below; overridden in Code-snippet only. A File tab
    elsewhere keeps `surface-100`, the page's color.
  - Docs Overview, Godwin's Figma update (2026-11-02): stat cards sit straight on
    the dotted page (surface-raised, rad-lg, no frame or border); the Figma link
    is a raised tile (border-subtle, icon/lg) in a tray; style cards (88 tall,
    icon on top, border-subtle) and component tiles (border-bold) without the
    brand frames. Tokens changed from the Figma frame: the tray is
    `surface-field`, not `surface-300` (in dark surface-300 is lighter than the
    tile it holds; rebound in Figma too); the dots stay `border-subtle` (Figma
    surface-600 is bright in dark).

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
- **Cursor** (Godwin 2026-11-10): every Button and Icon Button shows the hand
  (`cursor: pointer`), a link drawn with `.bland-button` too; disabled
  `not-allowed`, loading (`aria-busy`) `progress`.

- **Dark ghost and stroke hover** (Godwin 2026-10-20: too hard to see): the
  hover and pressed fills of ghost and stroke Buttons and Icon Buttons used
  each family's darkest tones in dark mode (Brand1000/950, Green, Red and
  Amber 1100/1000), barely off the #0a0c10 page. They moved one step
  lighter in Figma: hover Brand900, Green1000, Red1000, Amber1000; pressed
  Brand800, Green900, Red900, Amber900. Light mode is unchanged.
- Retuned in Figma 2026-10-25 (Godwin): every `Button/*-disabled` fill is lighter in light (#c4cad4, was #a8b0be) and darker in dark (#2b313b, was #576275), so disabled reads as receded in both themes; brand secondary rest, hover and pressed each moved one step brighter in dark only (#001b55, #002873, #003a9e). Token-only change, no CSS.

### Indicator (2026-10-18)
- `import { Indicator } from 'bland-ui'`. Props: `size` sm/md/lg/xl/2xl (default
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
- `import { Badge } from 'bland-ui'`. Props: `size` sm/md/lg/xl (16, 20, 24, 32;
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
- **Chip** (`import { Chip } from 'bland-ui'`): `size` sm/md/lg (default sm, as
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
- **Pill** (`import { Pill } from 'bland-ui'`, folder `pills/` after the Figma
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
- `import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'bland-ui'`. Folders
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
- `import { Toggle } from 'bland-ui'`, folder `toggle/`. Same pattern as
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
- `import { TextInput } from 'bland-ui'`, folder `text-input/`. Figma set
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
- `import { TextArea } from 'bland-ui'`, folder `text-area/`. Same contract as
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
- `import { NumericInputField } from 'bland-ui'`, folder `numeric-input-field/`.
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
- `import { SearchInput } from 'bland-ui'`, folder `search-input/`. It is Text
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
- `import { Alert, Banner, Toast, Toaster, useToaster, Notification } from 'bland-ui'`.
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
- `import { ProgressBar, ProgressWizard } from 'bland-ui'`. Folders follow the
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
- `import { Accordion } from 'bland-ui'`, folder `accordion/`. A native
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
- `import { ListItem } from 'bland-ui'`, folder `list/`. Figma has one set,
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
- `import { EmptyState } from 'bland-ui'`, folder `empty-state/`. Figma: set
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
  TableExpandCell, TableOptionCell } from 'bland-ui'`, folder `table/`. Figma:
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
- `import { Tooltip } from 'bland-ui'`, folder `tooltip/`. Figma: set `Tooltip`
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
- `import { Menu, Dropdown } from 'bland-ui'`, folders `menu/` and `dropdown/`.
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
- `import { Modal } from 'bland-ui'`, folder `modal/`. Figma page Modals: set
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
- `import { SectionTabs, PillTabs, FileTabs, SegmentedBar, TabBar } from 'bland-ui'`,
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
- `import { Pagination, PaginationTable } from 'bland-ui'`, folders `pagination/`
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
- `import { Slider } from 'bland-ui'`, folder `slider/`. Figma: `Slider`
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
- `import { FileUpload } from 'bland-ui'`, folder `file-upload/`. Figma: File
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
- `import { CodeSnippet, CodeText } from 'bland-ui'`, folder `code-snippet/`.
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
- `import { Sidebar } from 'bland-ui'`, folder `sidebar/`. Figma: `Sidebar`
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
- `import { ChatBubble, ChatListItem } from 'bland-ui'`, folders `chat-bubble/`,
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
- `import { ChatNavbar, ChatMessageBar } from 'bland-ui'`, folders
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

## Page grid (2026-10-28, Godwin; docs/grid.md)

- Godwin: column counts become tokens, desktop gets a max content width, Dashboard grids are ignored. Added in Figma (Spacing, `Layout/`): `columns-mobile` 4, `columns-tablet` 6, `columns-desktop` 8 (bound to the counts of the Mobile, Tablet and Desktop/sm grid styles) and `max-width` 1136 (WIDTH_HEIGHT scope; the counts have no scope, since Figma has none for grid counts).
- Code: `.bland-grid` in `base.css` (ships as `bland/base.css`), not a component and no React wrapper. Fluid `minmax(0, 1fr)` columns; gutters space-sm then space-lg (md); margins Layout/margin-mobile, then margin-desktop at xl, where `max-width` is `--layout-max-width` plus both margins and the grid centres. Exact match with Figma at 375 and 1440.
- Tablet keeps the mobile 24 margin: Figma's tablet styles centre fixed columns with no margin value, and inventing a tablet margin token was not asked for.
- Placement: `--span`, `--span-md`, `--span-xl` per child, each falling back to the one before, none = full row, capped with `min()` at the grid's count. Registered with `@property` `syntax: "*"`, `inherits: false`, so nested grids start clean. `data-inset` drops margins and cap.
- Column gaps only; row gaps are the page's.
- Token build: `Layout/columns-*` FLOATs are emitted without `px`.
- Docs site: Grid style page after Breakpoints (Columns icon from the Figma Icons page): four Figma frames (375, 768, 1440, 1920) drawn from the same tokens and scaled to fit, a live inset grid that follows the window, HTML/React/CSS usage, the Layout tokens. Layout tokens moved off the Spacing page; search sends them to Grid.

## Page grid: columns on the 8 grid, margins left over (2026-10-28, Godwin)

- Godwin: in Figma he sets the column width (on his 8 spacing unit) and the gutter (a spacing token), and the margin is whatever remains; margins are not variables, he likes them roomy (mobile 16 to 32, usually 20 to 24), and desktop margins depend on the page (a dashboard almost none, a landing page large). Column counts need not be multiples of anything; he prefers even ones. The first `.bland-grid` (fixed margins, fluid columns) did the opposite: off-grid columns everywhere but 1440.
- Now: each layout sets a count, a gutter and a minimum margin (space-lg 16, space-2xl 32, space-6xl 64); columns are the widest multiple of space-sm inside it, the leftover is split by `justify-content: center`. Desktop content capped at Layout/max-width (128 columns). Reproduces Figma Tablet/sm, md, lg (768, 912, 1024) and Desktop/sm (1280, 1440, 1536) exactly; mobile margins land between 16 and 32. The minimum margins are Claude's pick from Godwin's ranges.
- `--bland-grid-margin`, `--bland-grid-columns`, `--bland-grid-gutter` are the knobs (set inside the project's own media query). `data-inset`: minimum margin none, no cap.
- Layout/margin-mobile and margin-desktop are no longer read by the grid (margins are derived); margin-desktop is the suggested landing-page minimum. No column-width tokens: the rule derives 104 / 128 / 144 from the screen.
- Docs Grid page: seven frames (375, 412, 768, 1024, 1280, 1440, 1920), each a real `.bland-grid` with the layout's values inline, captioned with its column width and margins.

## Figma grid styles tidied (2026-10-28, Godwin: "remove the ones not in line")

- Kept seven, all centred columns on the 8 grid: Mobile/sm 4x72 (360, 375), md 4x80 (390), lg 4x88 (412, 430); Tablet/sm 6x104 (768, 820), md 6x128 (912), lg 6x144 (1024); Desktop/sm 8x128 (1280 up). Mobile changed from stretch + 24 offset to the code rule's widths. Counts bound to Layout/columns-*, gutters to space tokens, column widths raw (derived, not tokens).
- Removed: Desktop/md, Desktop/lg, the eight Dashboard styles, and the eight Dashboard demo frames on the Grid system page (rows below moved up, frame and footer follow).
- Styles now attached to the 14 Screen templates main components (Spacing page), so every template a design starts from carries the grid; descriptions name the screens and margins.
- Known gap: at 820 the Tablet/sm style draws 104 columns where code computes 112 (a style covers a range of screens).
- **Brand page keeps your work (2026-10-28):** the brand color, neutral tint and contrast fix are kept for the visit (sessionStorage `bland-docs-brand-draft`, like the extras and chart picks), so leaving the page and coming back shows them as left; without a draft the applied brand comes back with its fix. Reset clears it.

## Desktop md and lg grids, the Grid page on its own grid (2026-10-28, Godwin)

- Godwin asked for Desktop md and lg styles differing only in width, and picked md 144 from 1536, lg 160 from 1920 (Claude's recommended options). Figma: Desktop/md 8x144 and Desktop/lg 8x160 (count and gutter bound), new `breakpoint/3xl` 1920, `Layout/max-width-md` 1264 and `-lg` 1392, `Layout/max-width` renamed `-sm`. Templates: 1536 uses md, 1920 and 2560 use lg; 1280 and 1440 stay sm.
- Code: `--bland-grid-max` steps sm → md (2xl) → lg (3xl); everything else unchanged. Every template frame comes out exactly (1536: 144/136, 1920: 160/264, 2560: 160/584).
- Docs Grid page laid out on an inset `.bland-grid` (header, sections and the frame list are full-width cells; sections and the frame list are nested grids so their columns line up; notes span 5 at md and 6 at xl; frames pair up, span 3 at md and 4 at xl). A Toggle under the header and Shift+G (Figma's shortcut, not while typing) lay the columns over the page in a pale danger tint, like Figma's grid. Only the Grid page; the rest of the docs site keeps its own layout.
- (Godwin 2026-10-28) The Grid page's column switch is drawn like the toolbar's Search Bland button: a label that reads "Show columns", then "Hide columns" while they show (brand-light tint; no `aria-pressed`, since the name changes) and the shortcut as key caps, ArrowFatUp + G on Apple, Shift + G elsewhere, keys hidden below md as Search's are. Replaced the Toggle.

## Docs site copy (2026-10-28, copy review before hosting)

Readers are designers, developers and agents. The voice follows systems known for clear copy (Primer, Polaris, Atlassian, Radix, Geist, Carbon): say what a thing is, when to use it, and the few rules that matter.

- **Bland states its own decisions.** No "as in Figma", "Figma's default", "Figma draws…" or Figma property names (`✏️ Label`, `👀 Icon`) in anything the docs site shows: story descriptions, usage, captions, prop descriptions, page notes. Figma is the design source; the component map in CLAUDE.md keeps the Figma property → prop mapping for maintainers. Code comments that aren't JSDoc on a public prop may still cite Figma.
- **Component page lead** (story `description`): one to three short sentences: what it is, when to use it. No sizes in px, token names, ARIA plumbing or states the Variants section already shows.
- **Usage** (story `usage`, new): two to five one-sentence rules, shown as a list after the Playground. Alternatives ("For a status, use Badge"), the props that change behaviour, and accessibility only where the reader must act (`aria-label` on an icon-only button). Agents read this too, so name props exactly.
- **Code text:** prop names and values are code. In `description`, `usage`, prop JSDoc and style page leads, wrap them in backticks; the docs site's `Prose` renders each as CodeText lg (search strips them). Variant captions write `<code>` in the story JSX, so the raw story (screenshots) shows them too; the docs draw caption `<code>` as CodeText. The props table also marks a prop's own option values as code where the description lists them (`codeValues`: followed by punctuation, a number, or/and, or the end).
- **Captions** say what the row shows, in plain words: `<code>size</code>: <code>sm</code>, <code>md</code>…`. No "(used by the behaviour tests)" (interactive groups start with "Try it:"), no file paths, no token names. The focus row reads "Keyboard focus: the ring shows when people tab to it (turned on here to show it)".
- **Prop descriptions:** what the prop does, then its default. Sizes as plain numbers (`sm 32, md 40`), not token paths (`input/*`, `control/xs`).
- **Messages** (Brand page): plain words a project's designer understands: "color pairs harder to read than they should be", not "pairings below their minimum"; no ΔE or color-vision terms on the page (the CLI report keeps them).
- No em dashes, as everywhere.

## Docs site on phones (2026-10-28)

- Every docs page fits 320px with no sideways page scroll; `tests/docs.spec.ts` "on a phone" holds it for every route.
- Wide content scrolls inside its own box, never the page: a grid that holds a table gets `minmax(0, 1fr)` columns (`.docs-fold`).
- The Brand page's contrast breakdown is a stacked list below breakpoint/md (one card per pair: where, then theme and contrast, then the fix) and the table from md up. Both are named "Color pairs that are hard to read"; CSS shows one.
- Popovers on the docs site are never wider than the screen less space-sm each side (color picker).
- Date Range Picker stacks its two fields below breakpoint/sm.
- Buttons smaller than 24px get a centred control/xs `::before` hit area (Chip close, Search clear, and now CodeText copy, Dropdown toggle and Clear, date field calendar button, Chat message bar icons).
- `npm run docs:phone` serves the docs on the local network for a real phone.
- Phone toolbar (Godwin 2026-10-29): below breakpoint/md the theme switch and search bar slide up under the top bar while the page scrolls down and come back on any scroll up (8px slack, always shown within 120px of the top, while the menu is open, or while focus is in it). duration/md easing/out, a fade under reduced motion. From md up it always shows.
- Phone top bar and menu (Godwin 2026-10-29): a menu IconButton (List, X while open) left of the logo, which is heading-sm. The menu is the sidebar sliding in from the left (at most sidebar-width, leaving a space-6xl strip) and pushing the top bar, toolbar and page right by its width; duration/2xl easing/drawer, instant under reduced motion. The strip, Escape, the close button or a link closes it.
- Phone top bar (Godwin 2026-10-29, later the same day): space-md above and below (56 tall), no bottom border, menu icon icon/lg. While the menu is open the logo cross-fades (with a space-xs blur, duration/md easing/out) into Close in body-lg, which also closes it.
- Phone top bar (Godwin 2026-10-29, revised): logo first, the menu button (ListBullets, icon/lg) at the end. While the menu is open that button is pushed off screen; the logo's place shows Close (body-lg), the menu's close button, which takes focus on open and returns it to the menu button on close.
- (2026-10-29, Godwin) The preview's sample chart bars are space-md (12) tall, was space-xl.
- Phone menu (Godwin 2026-10-29, final): the sidebar slides in from the right, the menu button's side, and pushes the page left; at most sidebar-width, leaving a strip of at least 2 x space-5xl. The menu button stays in the strip as X ("Close menu") with Close (body-lg, blur cross-fade) beside it.
- Phone menu open state (Godwin 2026-10-29): the button shows EyeClosed ("Hide menu") with Hide beside it, not X and Close.
- Grid page columns switch (Godwin 2026-10-29): on phones a floating button at the bottom left (space-lg in, elevation/neutral/mid, surface-100; brand tint while on); inline under the page header from breakpoint/md.
- Grid page columns switch on phones (revised 2026-10-29): bottom right, not left; while the columns show it is a primary button (button-brand-primary-rest, text-on-color, elevation/brand/mid).
- Grid page columns switch on phones (2026-10-29, final): primary in both states; the label says Show or Hide. No tap highlight anywhere on the docs site (`-webkit-tap-highlight-color: transparent` on html).
- Phone sizes (2026-10-29): the floating columns switch is Button md's size (40); the menu button keeps its 32 look with a 56 (control/lg) hit area.
- Phone round (Godwin 2026-10-29): Overview stat cards one a line below md. A swipe left opens the phone menu, right closes it (it follows the finger; scrollable rows under the finger scroll first, fields, sliders and the picker are skipped). The toolbar stays put only for keyboard focus. Variant rows centre every wrapped line. The Brand picker shows its color at once and the page follows a frame later; the chart palette updates once colors settle (120 ms).

- Docs, Brand theme breakdown on phones (Godwin 2026-10-29): the stacked list is body-lg, the pair's name body-lg-bold; the tablet table is unchanged.

## Smallest to largest everywhere (2026-10-29, Godwin)

- Anywhere the docs list sizes or steps, they run smallest to largest. The Typography page is left as it is.
- Token tables: `bySize()` in `playground/docs/data.ts` sorts each family's steps (`icon/xs` … `icon/lg`, `space-none` … `space-9xl`, `rad-null` … `rad-rd`, `surface-100` … `surface-600`, Layout mobile → tablet → desktop). A family is the name minus its last step, and families stay where they first appear. Applied on Colors, Spacing, Sizing, Breakpoints, Grid tokens, Corner radius and Stroke. Figma's export order is no longer what the pages show.
- Motion durations are sorted by milliseconds, so the delays and hold times sit among the animation durations (100 tooltip-close-delay … 5000 toast-visible). Easings keep their order.
- Prop options: TypeScript lists a union's values in its own order (`sm md xs lg`). `componentDocs` sorts any all-size-step options (`bySteps`), which covers the props table and the demo's select.
- Code follows: `LogoSize` is `'sm' | 'lg'`, and the Button and Logo stories and the Button, Logo and ScrollArea `fadeSize` descriptions list sizes smallest first.
- Motion page (2026-10-29, Godwin): Easings has its own Play button on its heading row, which replays only the easing dots. Durations' Play all still runs every dot. The dots' track is surface-300; surface-200 matched the table in dark.

- Docs, Motion page on phones (Godwin 2026-10-29): the Durations and Easings tables keep the Use column at least 280px wide (the table scrolls sideways), so long notes don't stretch the rows; from md the columns size as before.

## Public site on Cloudflare Pages (Godwin 2026-10-29)

- Host: Cloudflare Pages (not Vercel). Landing page at `/`, designed by Godwin in Figma; the docs at `/docs/`, linked from it.
- `npm run site:build` → `dist-site/` = `dist-docs/` copied to `docs/` + the files in `site/`. Until the landing page exists, `site/_redirects` sends `/` to `/docs/` (302, so it can change later without browsers caching it).
- `.node-version` 24 for Cloudflare's build image. Open: public or behind Cloudflare Access.

## Package name, license, site visibility (Godwin 2026-10-29)

- npm name **`bland-ui`** (`bland` is taken); the product is still Bland. Imports: `from 'bland-ui'`, `bland-ui/tokens.css` and the other stylesheets. Renamed everywhere a project reads it (package.json, README, docs site import lines, stories, component map); class names stay `bland-*`.
- **MIT** license (`LICENSE`, `license` field).
- The public site is **public** (no Cloudflare Access).
- Docs site Grid page: the Show/Hide columns button has no shadow from tablet up in either state; the phone's floating button keeps elevation/brand/mid (Godwin 2026-10-29).

## Font family tokens (Godwin 2026-10-29)

- **Godwin's call, reversing the old "no raw `--font-*` tokens" rule:** two family tokens, `--font-sans` (UI text, Inter) and `--font-mono` (code, Geist Mono), so a project swaps its fonts in `brand.css` like its brand. Nothing else of the type scale becomes a token: no size, weight, line height or letter spacing tokens.
- Emitted in the overridable `:root` block after the brand and neutral steps (collection `Font families` in `tokens.json`), with the fallback stacks the build always used: `"Inter", system-ui, sans-serif` and `"Geist Mono", ui-monospace, monospace`.
- Named by role, not family. The build maps by text style: `Code/*` reads `--font-mono`, every other style `--font-sans`; the value is the family Figma's `family/sans` / `family/mono` hold, so a family change in Figma lands in the token (a family without a known stack gets the role's fallbacks). Two styles of one role on different families fail the build.
- All 23 `--type-*` shorthands end in `var(--font-sans)` or `var(--font-mono)`; `tokens.json` keeps the resolved shorthand in `light` and the `var()` form under `cssValue`. Resolved, every style is byte-for-byte what it was.
- Lint: `font-family: var(--font-sans|mono)` passes (for a part that changes only the family); a component redefining either token fails and points at `brand.css`; a `font` shorthand with only a family token and raw size/weight still fails.
- Brand tool: `--font-sans "…"` / `--font-mono "…"` on `generate` and `check`, a font-family list: names quoted, generic families bare, Bland's fallbacks appended when the list ends in no generic family; written at the end of `:root` under a "load their files yourself" comment; `check` keeps a file's own fonts unless a flag replaces them.
- Docs site: Typography page opens with a Font families table (sample "Aa" in each). The Brand theme page has no font fields yet (follow-up: its previews would need the project's font files).
- Shipped as 0.1.1.

## Font tokens by role (2026-10-30, Godwin)

- Godwin: "sans" is wrong when a project picks a serif, and an app may want a separate heading font, with Title counting as a heading. Before 0.1.1 shipped, `--font-sans` / `--font-mono` became `--font-body`, `--font-heading` and `--font-code` (no aliases: the old names were never published).
- Body styles read `--font-body`; Display, Heading and Title read `--font-heading`; Code reads `--font-code`. `--font-heading` is `var(--font-body)` in `tokens.css`, so one override sets all text and a second sets headings apart. Three roles, no more.
- Figma follows: `family/sans` → `family/body`, `family/mono` → `family/code`, new `family/heading` aliasing `family/body`; the nine Display, Heading and Title styles bound to it. The build maps each text style through the `family/<role>` variable it is bound to (not by style name), and a family variable aliasing another becomes `var()` of that token.
- Brand tool flags `--font-body`, `--font-heading`, `--font-code`; the lint allows the three in `font-family` and rejects redefining them in a component. Resolved text styles are unchanged.

## Font tester on the Brand theme page (2026-10-30)

- A **Fonts** tab after Chart colors: Body, Heading, Code blocks laid out as the Extra colors tab, each with a SegmentedBar for the source (Installed, Google, Upload; "Google Fonts" truncated at 320), a TextInput + Button form or a FileUpload, and a sample in the role's text style. Heading shows "Same as body" until set.
- Applies at once, no Apply button: a font is only set once it renders, and trying fonts on the site is the point. Fonts live in `playground/docs/fontStore.ts` beside `brandStore.ts`, set on `<html>` (sessionStorage key `bland-docs-fonts`), painted on load from `DocsApp.tsx`. Separate from the brand: the brand's Reset leaves fonts alone; **Reset fonts** clears them.
- Installed check: canvas width against monospace, sans-serif and serif (after `document.fonts.load`), not `document.fonts.check`.
- Google: the stylesheet is fetched, not linked, so a missing family is told apart from no connection; loaded with 400;500;600 on the site, retried without weights when Google refuses one. The project `<link>` asks only for each role's weights (merged when roles share a font).
- Upload: family, weight and style from the file name; several files make one family; kept in the tab only, the pick survives a reload with a "upload this file again" row.
- The CSS panel passes the picks to `toCss(..., fonts)`; a second snippet holds the Google `<link>` lines.

## Font tester: six presets (2026-10-30, Godwin)

Replaces the sources in "Font tester on the Brand theme page" above: Installed, Google and Upload are gone, with the installed-font check, the Google fetch and `<link>` snippet, and the file loader. That section's first, third, fourth and fifth bullets and its last bullet's `<link>` snippet no longer hold; the second (applies at once, `fontStore.ts`, sessionStorage `bland-docs-fonts`, Reset fonts separate from the brand's Reset) still does.

- **Body** and **Heading** each get a basic `Dropdown` (label "Body font" / "Heading font", width `--dropdown-width`) of six presets, sans then serif with a divider, a "Sans" / "Serif" word in each row's trailing slot, each label in its own font: Inter, Geist, DM Sans, Source Serif 4, Lora, Playfair Display. Heading's first option is "Same as body" (no pick, `--font-heading` left to `var(--font-body)`). Body on Inter is no pick either, so the CSS stays Bland's.
- **Code** has no picker: its block says it stays Geist Mono and shows the sample.
- Fonts come from Fontsource devDependencies (`@fontsource/geist`, `dm-sans`, `source-serif-4`, `lora`, `playfair-display`, all with 400, 500 and 600). `fontStore.ts` holds a literal `import()` per preset and weight so Vite splits each into its own CSS file; they load when the Fonts tab mounts (for the labels) or when a saved pick is painted on load. Font files download only when text uses them.
- Stacks through `fontStack`: a serif preset is passed as `Name, serif` (so it ends in `serif`, not Bland's sans fallbacks), a sans as the name alone (`"Geist", system-ui, sans-serif`).
- How to use: the CSS from `toCss(..., fonts)`, then, when any pick isn't Inter, a note, a Terminal snippet (`npm install @fontsource/a @fontsource/b`) and a CSS snippet of `@import "@fontsource/<pkg>/<weight>.css";` lines: body 400 and 500 (and 600 while Heading is Same as body), heading 600, merged when both roles use one font. Inter needs no install: `bland-ui/fonts.css` loads it.

## Fonts tab from Figma (2026-10-31, Godwin)

- The Brand theme page's Fonts tab follows Figma's Brand theme / Fonts (6907:11680): per role a title, then a surface-200 card (rad-lg) with the font in a Chip md and "Tap to change", a dark sample in the role's text style that opens the font list, and what the role covers. The Dropdowns are gone.
- The list is a RadioGroup of List rows (`ListItem`, a Radio in the leading slot, the font name as its label in its own font, Sans or Serif as alt text), hidden until the sample (a button with `aria-expanded`) opens it; the caret turns 180° over duration/md easing/out, at once under reduced motion. Heading's list starts with Same as body.
- Code keeps Geist Mono: its card shows the Chip and the sample with no list or caret, as the card's own copy says (the Figma card shows "Tap to change" and a caret on Code; not drawn in code since there's nothing to pick).
- The sample uses `text-inverse` on `surface-inverse`, not Figma's `text-on-color` (white on white in dark). Icons line up with the sample's first line.
- Fonts tab follow-up (Godwin 2026-10-31): the whole row picks its font (the label covers the row; hover and pressed use List's fills), and the list folds open and closed as the contrast breakdown does (`.docs-fold`).

## Fonts tab: a code font picker; live font values (2026-10-31, Godwin)

Reverses "Code has no picker" (Font tester: six presets) and "Code keeps Geist Mono" (Fonts tab from Figma): the Code card now has a picker, so a project can try a code font with ligatures.
- The Code card works like Body and Heading: "Tap to change", the dark sample is a button (`aria-expanded`) that folds open (`.docs-fold`) a radio list of four self-hosted monospace fonts as List rows, each name in its own font, the whole row pressable: **Geist Mono** (Bland's own, first), **JetBrains Mono**, **Fira Code**, **IBM Plex Mono**. The alt text says what each is known for in a word or two (Bland's own, Ligatures, Ligatures, Plain), short enough that no name is cut at 320px.
- Sample: `const ok = (a, b) => a !== b && a <= b;`, so `=>`, `!==` and `<=` join in a font with ligatures.
- `fontStore.ts`: `CODE_PRESETS`, `presetsFor(role)`, `PICK_ROLES` is body, heading, code; the pick sets `--font-code` on `<html>` through `fontStack(..., 'code')` (`"Fira Code", ui-monospace, monospace`). Geist Mono, like Inter for body, is no pick and writes nothing. Reset fonts clears it. Fontsource devDependencies `@fontsource/jetbrains-mono`, `fira-code`, `ibm-plex-mono` 5.3.0, weights 400 and 600, loaded lazily per weight as the other presets.
- How to use adds the `--font-code` line, the `npm install` line and the 400 and 600 imports; its note says `bland-ui/fonts.css` loads Inter and Geist Mono.
- Live values: font values on the docs site are read from the page (`useLiveValue` in `fontStore.ts`, re-read when the picks change), so they name the picked fonts: every `TokenTable` row whose token is a font family or a text style, and each text style's value on the Typography page. Bland's own values come back after Reset.
- Token tables (every one, in `TokenTable`): the Figma name sits space-sm under the token's code chip; the Use column is `text-bold`.

## The brand command is not part of the package (2026-10-31, Godwin)

- `npm run brand` runs only in a clone of the Bland repo; the `bland-ui` package ships no command. Projects get their `brand.css` from the docs site's Brand theme page (copy the CSS), and fonts need no tool at all: three `--font-*` lines written by hand. README, CHANGELOG 0.1.1, `docs/agent-skill.md`, `docs/release.md` and the Brand theme page's intro now say so. A command people run with npx may come later if projects ask.

## Brand theme page: own fonts, wider intro (2026-11-01, Godwin)

- The Fonts tab ends with **Your own font**: the presets are for trying things out, a project can use any font. It shows an `@font-face` and the `--font-body` line to copy; How to use points to it.
- The page intro now covers the whole page (brand color and contrast, extra and chart colors, fonts, one CSS file to copy), not colors alone; the search description says the same.

### Motion in every engine (2026-11-03)

- Godwin: Accordion did not animate in Safari or Firefox; fix that and the like, leave the corner smoothing (plain rounding there stays, `@supports (corner-shape)` turns it on wherever it ships).
- **Heights:** Accordion and the Sidebar's groups no longer use `interpolate-size` or `::details-content`. `slideHeight` (`src/components/motion/height.ts`) sets the start and end heights in pixels and the component's own CSS `transition: height var(--duration-md) var(--easing-out)` runs between them; reduced motion and `data-instant` switch the transition off, so the change is at once. Supersedes the Accordion and Sidebar motion notes above.
  - Accordion keeps `open` while it folds (`data-closing`), so the content shows to the end. A change the browser makes (find in page, a `name` group closing an item) is at once: drawing that item open again would close its sibling. Content is clipped while the height eases, with `overflow-clip-margin: space-xs` for the header's focus ring.
  - Sidebar groups: the space-xs above the nested rows moved from the nest's padding to its first row, so the measured height covers it.
- **Exits:** Menu, Dropdown (the shared Popover), Tooltip and Modal no longer leave the top layer through `display` / `overlay` transitions (Chromium only; WebKit hid them at once). `exitThenHide` (`src/components/overlay/exit.ts`) sets `data-closing`, whose styles are the exit, while the popover or dialog is still open, and hides it once those CSS transitions finish (transitions only, so a spinner inside can't hold it); `cancelExit` when it opens again. The page behind a Modal stays inert and focus returns once the exit has played (duration/lg). A dialog the browser closes (a `<form method="dialog">`, Escape's second press) closes at once.
- Accordion's caret and bold title follow `data-open` (the open state), not the native `open`, which stays while the item folds; so they change with the fold, not after it (Godwin 2026-11-03).
- **Sidebar top slot without a rail version** (Godwin 2026-11-03): a plain `top` node fades out as the sidebar collapses (SlotFade to nothing) and the rail shows the expand button in the rows' column (`data-top-plain`). A function of `{ rail }` is the way to give a minified logo, as before; its rail version keeps the expand button hidden.
- **Sidebar trailing parts fade on collapse** (Godwin 2026-11-03): count, trailing icon and caret go to opacity 0 over duration/2xl easing/drawer while `data-compact`, so nothing lingers at the closing edge; they fade back as it opens. Instant from the keyboard; kept under reduced motion (opacity only).
- **Sidebar rail keeps the icons in place** (Godwin 2026-11-03, option A of two; B was tightening the full sidebar's padding): the rail's side padding is `--_rail-pad` = space-lg + the row padding - the square row's inset, so each icon sits at the same x in the rail and the full sidebar (sm 20, md 24, lg 28, xl 32) and the rail is 56 / 68 / 76 / 84 wide (was item + space-sm each side: 40 / 48 / 56 / 64). The list and row paddings switch at once; easing them separately nudged the icons 2px mid-slide in WebKit. Figma's Minimized variants still have the old rail width: to update in Figma.
- **Superseded the same day** (Godwin did not like the wider rail): option B. The rail is back to item + space-sm each side (40 / 48 / 56 / 64); the full sidebar's list padding is space-sm, not Figma's space-lg, so an icon sits at 12 / 16 / 20 / 24 full against 12 / 14 / 18 / 22 in the rail: no move at sm, 2px at md and up, eased with the panel (the row padding transition is back; the list padding no longer changes). Figma's expanded Sidebar variants still have space-lg: to update in Figma.
- **Sidebar collapse button beside a top slot comes in last** (Godwin 2026-11-03): while the sidebar slides out of the rail (`data-opening`, duration/2xl, set from Sidebar.tsx; none from the keyboard or under reduced motion) it stays at opacity 0, then fades in over duration/md easing/out; as the sidebar starts to close it fades out over duration/xs. With no top slot the button never leaves its place, so it doesn't fade. A plain top's rail expand button shows at once when the rail is in place.

## Landing page (2026-11-06, Godwin)

- **Every illustration is SVG or vector** (Godwin 2026-11-06), for the whole landing page. If a raster image seems needed, stop and ask him first.
- Lives in this repo under `site/`: a Vite + React entry that imports Bland from `src/` (components, `tokens.css`, `fonts.css`, `base.css`), so the page always runs on the current components. `npm run site:build` builds it at `/` with the docs under `/docs/`. `docs/motion.md` applies.
- **The landing page follows Figma exactly** (Godwin 2026-11-06), and may break from Bland's text styles. Figma's own values (type sizes, tracking, the glow's pink and blurs, widths, the hero's rhythm) live in ONE file, `site/src/landing-values.css`, as `--landing-*` custom properties; the token lint skips that file and checks every other landing stylesheet, so they read Bland tokens or `--landing-*` through `var()`. Desktop values are Figma's 1440 frame; below it they scale with the viewport (`clamp`) down to a floor, since Figma has no phone frame.
- **Sections set their own theme** (Godwin 2026-11-06): a section drawn light in Figma is light whatever the system theme (`data-theme="light"` on the section, and on `<html>` for the page around them); a section drawn dark is dark. The hero is light and turns dark on its last scroll state, as in Figma 7087:36040.
- **Hero scroll story** (Figma 7097:36095 and the states 7082:35309, 7086:35405, 7087:35771, 7087:35948, 7087:36040; reworked 2026-11-07, Godwin): the hero is a track `--landing-hero-track` (640svh) tall with a sticky one-screen stage. Fractions of the track in `site/src/hero/story.ts`: headline words go from bold (with the glow) **straight to the outline**, no gray step, in reading order (0.03 to 0.42), **while** the description's words go text-minimal to text-bold one by one (0.05 to 0.9; Godwin 2026-11-07: the two run together, no still moment between them) and **each phrase is marked once the active text reaches it and keeps its highlighter as the pass goes on** (Godwin 2026-11-07; the active text is where the wash is halfway, a word position; scrolling back above a phrase takes its mark off), while **its icon shows only for the newest marked phrase**, popping in when reached and leaving when the next takes over (the moon by "dark." stays). Before that the same day: lit only while active, then lit until the next phrase ("React design system", "color.", "button, field, chart", "light", "dark."); "dark." turns the stage to Dark mode (background eases over duration/lg); the rest of the track holds the end.
- Headline: one `<h1>` of word spans; each word's real text is the outline (a stroke-lg text-minimal stroke painted under a surface-100 fill, `paint-order: stroke fill`, so only Figma's 1px outside stroke shows and the font's overlapping inner contours stay hidden), the aria-hidden bold fill over it and the glow under it; scroll sets `--bold`. Inter 700 is loaded for the page (`@fontsource/inter/700.css`; Bland's `fonts.css` stops at 600, so Bold was synthesized and looked thinner than Figma). Figma's line breaks from breakpoint/xl.
- Glow: Figma's two copies have **progressive** layer blurs top to bottom: purple #eb09ff 8 to 32, blue text-brand 32 to 8, both 75%, purple 1px up, blue 1px down. In CSS each is four layers at stepped blurs (3/4 of Figma's radii: 6, 12, 18, 24; checked side by side with Figma's render), each masked to its band of the whole headline (`--title-h`, `--word-y` measured in Hero.tsx), per word so the glow fades with its word.
- **Tuning with DialKit** (Godwin 2026-11-07, dialkit.dev): every hero motion parameter (entrance, scroll thresholds and softness, smoothing, glides, glow opacity and blur scale, magnet) lives in `site/src/hero/tuning.ts` with its default and range; `useDialKit` makes them live sliders in the panel bottom right of `npm run site` (starts collapsed; Copy parameters exports a set; Replay entrance reruns the entrance). Timings CSS needs reach `hero.css` as custom properties set on the hero (`heroStyle`), so there is one source. `dialkit` and `motion` are dev dependencies; `site/vite.config.ts` aliases `dialkit` to `site/src/dialkit-stub.ts` in builds, which returns the defaults (the library tripled the bundle, 244 to 566 kB). To keep a tuned value: copy it into `tuning.ts`.
- **Resting description** (Godwin 2026-11-07, "even fainter"): text-minimal mixed `descriptionRest` (60%) of the way from the page color, so lighter than text-minimal; the ink wash goes from there to text-bold.
- **Godwin's tuned defaults** (DialKit, 2026-11-07, now in `tuning.ts`): characters rise 60px over 520ms, 18ms apart; description words rise 68px, from 420ms, 14ms apart; track 4 screens (was 2: the description raced, about 40px of scroll a word; now about 130px); smoothing 120ms for the headline and 300ms for the description (`descriptionSmoothingMs`, its own follower, so it drifts after the scroll); headline 0.063 to 0.12 (softness 3; Godwin's 0.19 / 0.36 of one screen of scroll, the same 207 to 393px on three); description 0 to 1 (softness 5); glide in 640 / out 460 / theme 1260ms; glow opacity 0.92, blur scale 0.85; magnet 0.25 / 0.18 / 0.14.
- **Headline pace** (Godwin 2026-11-09: too quick to see, follow the footer): `titleStart` 0.02, `titleEnd` 0.22, so the bold-to-outline wave runs over about 500px of scroll on an 850px screen, as the footer's fill does. The glow layers carry `will-change: opacity` (each blur drawn once, then only faded).
- **Button cursor and highlighter color** (Godwin 2026-11-10): the hero's Read the docs button shows the pointer (since the same day every Bland Button does, so the hero rule is gone). The highlighter is a saturated light yellow, `--landing-marker-color` #ffe733 at `markerStrength` 85, in both themes. A lit phrase keeps dark text (`data-theme="light"` on it), and once the hero is dark its stroke covers the letters' full height (`DARK_MARKER_TOP` 0.06): over the low band the black letter tops sat on the dark page.
- **Entrance** (Godwin 2026-11-07): each headline character rises from below and fades in, one after another (by its place in the headline); every layer of a word holds the same character spans so outline, bold and glow move as one, and the `<h1>` carries the whole headline as its accessible name. The description's words follow from 420ms, 14ms apart, rising 16px. The scroll effects start at 0 (the first 177px of scroll did nothing before).
- **Buttery motion** (Godwin 2026-11-07: "it all feels snappy"): the story follows the scroll with inertia (`SMOOTHING_MS` 180, an exponential ease every frame until it settles; none under reduced motion), headline words overlap three word-slots (`TITLE_SOFTNESS`), and the description's words take a continuous ink wash four words wide (`--ink` 0 to 1, color mixed from text-minimal to text-bold in `landing-values.css`, the only rule there, since the lint rejects `color-mix()`); a phrase lights when the wash is halfway into its first word. The hero's own moves (entrance, pill, icon, theme change) use `--landing-glide` 640ms / `--landing-glide-out` 320ms / `--landing-theme-glide` 900ms with `--landing-ease-glide` (0.22, 1, 0.36, 1), above Bland's 250ms UI ceiling on purpose: this is the landing page, not a control. The button's reveal stays on Bland's UI timing.
- **Headline size** (Godwin 2026-11-07): Figma's 128 / 112 / -8 / 848 made a quarter bigger, 160 / 140 / -10 / 1060 at 1440, scaling with the viewport below; the least gap above the description is 64 so it still fits a 1024 tall screen.
- **Button** (Godwin 2026-11-07): label only, no arrow. **Magnetic** (after typesafe.ai): while a mouse is over the headline the button drifts toward the pointer, 0.25 of the way from the centre of the headline's words, at most 0.18 of their half width and half height away (it stays near the middle), easing 0.14 of the gap per frame (CSS `translate`, set from JS), and eases back on leave. Hover reveal, magnet and Figma's three lines start at breakpoint/md (they started at xl, so a 1084px window never got them). Off under reduced motion and without a fine pointer.
- Lit phrase (Godwin 2026-11-07, replacing Figma's blue pill and its white text): a **highlighter stroke**, a rough SVG built in `site/src/hero/marker.ts` (wobbly edges by `markerRoughness` 0.035 of the line, slanted chisel ends, two faint darker streaks; seeded per phrase so each differs) in the stage's Surface/surface-brand read from the page (rebuilt on the dark switch) at `markerStrength` (55%; was 30%, Godwin: darker), over the lower part of the line (`markerTop` 0.38 to `markerBottom` 0.92), stretched to each line as a background image, drawn left to right with `background-size` on a pen-like curve (`--landing-ease-marker`), wiping away to the right when the phrase goes out (wraps across lines with `box-decoration-break: clone`). The words keep their ink color (the description's color is one `color-mix` of --ink, never transitioned, since the scroll sets it every frame).
- Icon **pop**: from `popFrom` (0.4) of its size turned -12deg, past full size and back over `popMs` (620) on a back-out curve whose overshoot is `popOvershoot` (2.2: peaks at about 1.2x); fades in over the first 40%. All DialKit sliders (Highlight folder). its Figma icon popping in (every icon 52 tall, the React logo's height; Godwin 2026-11-07) (opacity + scale 0.95 and a small turn, duration/lg); the old pill leaves first in duration/xs, the new one waits that long. Icons sit before the start of the phrase's line (Moon after "dark."), placed in JS from the words' layout offsets (their screen boxes move while they rise in); where that would leave the screen (phones) they sit just above the phrase.
- Reduced motion: no transforms anywhere; the headline and description change in two steps (each crossfaded over duration/md), not scrubbed; pills appear without the draw; icons only fade.
- Description sits `--landing-hero-gap-bottom` (Figma 72) above the bottom of the screen.
- Design source: Figma frame `7079:35060` (page "Landing page"). The notes are Y-tool annotations on their elements; the "Screen templates" frames beside it are later states of the same sections (scroll keyframes).
- **Some features** (Figma `7064:28783`; side session landing-features, 2026-11-07, Godwin): `site/src/features/`, mounted under the hero in `main.tsx`. Four cards (surface-raised, rad-lg smoothed) of a 272 picture (surface-200) over a title, Figma's Medium 27/40 (`--landing-features-title-font`, no Bland text style matches), on `.bland-grid`: one a row, two from md, Figma's columns 2 to 7 from xl; the section is light whatever the system theme and pads `--landing-features-pad` (Figma 144). The pictures follow the **Stageshow** skill (benji.org/stageshow, installed in `~/.claude/skills/stageshow`), with Bland's own components inside instead of its kit (its kit has raw CSS values). Godwin's pick of four, each a different kind (bento rules: one thing per tile, no string twice): **Over 45 components** a wall of 30 real parts on five centred rows running off both sides, wordless parts at the row ends so only they are cut, settling in 40ms apart, then a Toggle switches, a Checkbox ticks and a Slider moves; **Light and dark, built in** one Notification drawn twice, the dark copy (nested `data-theme="dark"`) clipped right of a line that sweeps from 0.86 to 0.42 of the width (`easing/in-out`, 900ms), its grip below the card; **One color to rebrand** a hex chip (rolling), the 13 steps and three controls going Bland blue, then `#0F9D58`, then `#F2541B` (real `npm run brand` output in `landing-values.css`; the picture has `data-theme="light"` on itself so Bland's roles are computed from its own steps), steps changing left to right 30ms apart over 220ms; **Keyboard, screen reader tested** a sign-in form opening with focus on Email, Tab pressed twice, Bland's focus ring jumping (keyboard moves are never animated) and a dark caption reading "Email, edit text", "Keep me signed in, checkbox", "Sign in, button".
- Playback (Godwin 2026-11-07, Stageshow's grid rule): each card plays once when 45% of it is in view, 100ms apart in reading order, and holds its result; a mouse hover replays it (from a snap to its opening frame with transitions off), never mid-story. Under reduced motion every card shows its last frame at once, no rises, rolls or sweeps. Timings in `site/src/features/timing.ts`, set on the section as `--features-*`. The pictures are `aria-hidden` and `inert`; the four titles are `<h2>`s.
- Some features spacing (Godwin 2026-11-08, "more space around and inside the cards", label 22): section padding 192 at 1440 (`--landing-features-pad`, was Figma's 144), rows space-4xl (48) apart (was space-lg), titles space-2xl (32) above and below (was space-xl), title Medium 22 / 32 (`--landing-features-title-font`, was Figma's 27 / 40). Cards are now 368 tall.
- Some features, second pass (Godwin 2026-11-08: "inside the card" meant the gray picture): pictures 336 tall (`--landing-features-picture-height`, was Figma's 272) and rounded on all four corners (rad-lg, `.bland-smooth`), titles back to space-xl (24) above and below; cards are 416 tall, rows 464 apart at 1440. The components wall has a sixth row of wordless parts so the taller picture has no empty bands.
- Some features, third pass (Godwin 2026-11-08), replacing play-once and hover-replay: **every story loops while its card is in view** and **pauses while a mouse is over the card, a press is held on it or focus is inside it**, resuming where it was (`useLoop` in `playback.ts` keeps what was left of the step). Entrances play once (the wall's arrival); loops: wall Toggle on, Checkbox on, Slider up, then back; line 0.82 then 0.3 and 0.7 in turn; rebrand blue, green, orange, blue; keyboard Email, Tab, Space ticks, Tab to Sign in, Shift+Tab, Space clears, Shift+Tab. Text that changes rolls upward (`Roll.tsx`), even when a loop wraps. Reduced motion: the poster, nothing loops, controls still work. Pictures 400 tall. The wall has seven rows, 45 parts.
- **Two cards can be used**: the light/dark line is a real slider (`role="slider"`, "Dark part of the card", value = percent dark): drag anywhere on the picture (`touch-action: pan-y` keeps phone scrolling), or arrows (5%), Home and End on the focused grip; a set value holds until the loop's next step. The sign-in form is a real form ("Sign in, a keyboard demo"): Tab through it and Bland's own focus ring shows (the scripted ring hides), the keycap presses with your Tab, Shift+Tab and Space, the caption (aria-hidden, stacked under the keycap at full width so "not checked" fits) reads what you focus; typing and ticking work, Sign in does nothing. Every other part of the pictures stays aria-hidden and inert.
- **Two more features, in code only** (Godwin 2026-11-08, picked from three proposals; not in the Figma frame yet), so the grid is three rows of two: **Charts in your colors** (a diagram): six stacked columns of four series in `--chart-1` to `--chart-4` (series 1 the brand) with a legend, growing up from the axis once, then looping through how people with typical, red-green (deutan) and blue-yellow (tritan) vision see it, by SVG color matrices (Machado 2009 severity 1, the brand tool's own), each view a crossfading copy; the switch is real Pill tabs sm ("Color vision"), whose pick holds until the loop's next step; its panel is 344 wide (the three pills), capped to the picture, so on a narrow phone the pills scroll sideways. **Typed down to every prop** (one component and its code): a live Button md "Deploy" over a JSX line `<Button emotion="…" />` (Code/* colors, a blinking caret) and its suggestions, Button's four real ButtonEmotion values, the type shown on the chosen one; the choice loops brand, success, danger, warning, the value rolls into the code and the Button restyles; the list is a real listbox ("Button emotion": click, arrows, Home, End).
- Some features copy (Godwin 2026-11-08: better labels plus a line under each): the titles and lines live in `docs/landing-copy.md`, "Feature cards" (which replaces its "Proof strip"), and `Features.tsx` reads from there by hand; change the doc first. Each card's text is the title (Medium 22 / 32) then one line in Body/body-lg text-subtle, space-xs apart, space-xl above and below; cards in a row share a height. The four usable cards end their line with what to do (drag, tab, switch, pick). Every line is two lines at 1440.
- **Feature row** (Figma `7141:36653`; Godwin 2026-11-08: "duplicate this section, but let it flow horizontally on scroll", after a Framer template's glide on Cosmos): `site/src/features/row/`, mounted under Some features so the two can be compared. The same six cards (`FEATURES`, pictures and copy) in Figma's card: 560 x 703 (`--landing-row-card-*`, capped to the screen), title Heading/heading-lg with -2 tracking (heading-sm below md), the picture filling the middle (rad-lg), the line in Body/body-lg text-bold. A track of one screen plus `screensPerCard` (0.9) screens per further card with a sticky stage; scroll picks a place along the row that **holds still on each card for `hold` (30%) of the way** and eases between them (smootherstep), followed with `smoothingMs` (260) of inertia. Each card's translate, scale and opacity follow its distance from the middle: 1, then Figma's 0.797 and 20% one card away (608 centre to centre at 560, `spacing` 1.086), fading out over the next 0.75. Only the middle card is live (picture playing, controls usable); the rest are aria-hidden and inert, and a press on one scrolls the page to centre it. All of it is DialKit sliders ("Feature row", `row/tuning.ts`). Reduced motion: whole cards at a time, no glide. The pictures measure in unscaled pixels (the keyboard ring) and use `useId` for ids, since each is on the page twice.
- Feature row, second pass (Godwin 2026-11-08): card 840 tall (`--landing-row-card-height`, was Figma's 703; still capped to the screen), so the picture is taller; space-3xl (40) between the picture and the title above and the line below (was space-xl); the component wall's rows space-3xl apart in the row's taller picture. **Stories start as soon as a picture shows** (5% in view, was 45%): in the row every card plays from the moment it is on screen, neighbours too, with no stagger, so a card is already moving when it reaches the middle; only the middle card's controls work. The grid keeps its 100ms reading-order stagger.
- Feature row, guidance (Godwin 2026-11-08: "I don't want to be in the middle of 2 cards; move to the closest one, smoothly"): once scrolling stops for `settleDelayMs` (140) with the row between cards, the page glides to the nearest card's place on an ease-out of `glideMs` (380) plus `glideMsPerScreen` (420) per screen it covers; the row follows it with its usual inertia. A wheel, touch, key or press stops the glide at once. Not before the first card or after the last, and not under reduced motion (whole cards already). A press on a neighbour uses the same glide. DialKit "Feature row", Guidance.
- Charts card (both sections): every change of view, the loop's or a pick, grows the bars in again from the axis, as on the first entrance (Godwin 2026-11-08); the views remount under a new key while they crossfade.
- **The grid is gone** (Godwin 2026-11-08, "remove the first section and leave this one"): the page is the hero, then the feature row. The card list and `PictureProps` moved from the grid's `Features.tsx` (deleted) to `site/src/features/cards.ts`; `features.css` keeps only the pictures' styles; the grid's values (`--landing-features-pad`, `-title-font`, `-title-tracking`, `-picture-height`) are removed. The Some features entries above describe the pictures, which are unchanged; their grid layout (columns 2 to 7, 192 padding, 22px titles) no longer applies.
- **Story speed** (Godwin 2026-11-08, "all the features animation 50% faster"): `STORY_SPEED` 1.5 in `timing.ts`, a DialKit slider ("Feature row", Stories, 0.5 to 3). Every story step divides by it (`useLoop` reads it from the `StorySpeed` context the row provides), and so do the pictures' CSS durations: the `--features-*` timings and the Bland duration tokens used in `features.css` (as `calc(var(--duration-…) / var(--features-speed))`). Left as they were: the components' own UI timing inside the pictures, the caret's blink, and the row's scroll glide and guidance. Rebrand now changes every 1.6s (was 2.4).
- Story speed, corrected (Godwin 2026-11-08: "50% faster means the speed at which it repeats"): `STORY_SPEED` 1.5 now divides **only the waits between story steps**, so each loop repeats 1.5 times as often; every movement keeps its own duration (`--features-*` at timing.ts's values, Bland duration tokens as they are). The entry above that also scaled the CSS durations no longer applies.
- **Brand theme** (Figma `7066:28878`, states `7066:28914` and `7066:28936`; Godwin 2026-11-08, from the top session): `site/src/brand/`, mounted under the feature row. A three-step stepper, the steps a fixed list (pick, check, copy; Godwin: Figma's middle frame reorders it, the build does not), the current one growing into Figma's headline (Semi Bold 43 / 48, -2; 27 below md) by transitioning font size, line height, tracking and color over duration/xl, the others Body/body-lg text-subtle over a border-subtle rule. The tag (brand-light pill, body-lg-bold text-brand) is the section's `<h2>`; steps are buttons with `aria-current="step"`. Figma's card (416 x 360, border-subtle, surface-200) holds three crossfading pictures, then Figma's info Alert. **From md a scroll stepper** (Godwin's pick): a track of one screen plus 0.8 screens per step with a sticky stage, the step from the scroll; pressing a step scrolls to the middle of its share. **On a phone** the stage would not fit, so it scrolls normally and the steps advance on their own every 5.2s while in view and untouched; a tap picks one. Reduced motion: steps at once, posters, no advancing.
- Its pictures (Stageshow, Godwin approved the three ideas), on one example brand, `#e11d74` (`npm run brand -- generate "#e11d74" --neutrals subtle`, `.brand-pink` in landing-values.css with `data-theme` on the same element): **Pick** a picker panel (swatch, a Text Input "Brand color" retyped from #387eff to #e11d74 and back, an OKLCH hue strip whose dot slides) over the 13 brand steps and the 13 tinted neutrals, 500 ringed, "500 is your color, unchanged"; **Check** four real pairings from the brand tool (light button label 5.82:1, light link 5.82:1, dark link 9.22:1, dark progress on its track 2.85:1 of 3:1), each drawn in its own theme; Fix is pressed, step 400 takes the tool's suggestion #f16694 (`data-fixed`), 3.00:1 and Pass, then the list leaves as one and comes back; **Copy** Bland's Code snippet with the real brand.css (fixed 400; its Copy button copies it) and a satellite app card whose real "brand.css" Toggle loads the brand (Godwin can flip it). Each picture restarts its story when its step becomes current, plays only then, and pauses under the pointer.
- Brand theme, second pass (Godwin 2026-11-08: "the movement from one point to the other is incredibly jittery; wire it to DialKit"; "the container doesn't have to be gray"): a step no longer animates its font size (that rewrapped the words every frame). Each step button holds two layers over each other, the small line (Body/body-lg text-subtle) and the headline (Heading/heading-lg, -2; heading-sm below md); the button's height eases between their measured heights (`--h-small`, `--h-big`) while they crossfade, the headline rising `rise` px and growing from `growFrom` (0.94), over `growMs` (560) easing/out. DialKit "Brand theme" (`brand/tuning.ts`): screens per step, the phone's step time, grow time, grow-from, rise, the pictures' crossfade. Reduced motion: crossfade only. **The picture card and its pictures are tinted** Surface/surface-brand-light of the brand each shows (pale pink for #e11d74, pale blue for Bland's), easing as the brand changes.
- Brand theme, third pass (Godwin 2026-11-08: no opacity, "as if the text scales down and up"; an underline that fills as you scroll, after Granola): a step is one run of word spans; the font changes at once and each word glides and scales from where it was (FLIP: `translate` plus a `scale` from the ratio of the word's widths, centred on its old line box) while the button's height eases, over `growMs` (620) on easing/out. No fade; nothing is laid out at in-between sizes. Every step sits on a stroke-sm border-subtle rule; the current step's stroke-lg border-bold bar fills left to right with the scroll through its share (`--fill`, followed with `underline.smoothingMs` 140), empty for the others. On a phone the bar is the step's timer (a linear fill over `phoneStepMs`, paused with the story, its end advancing the step). DialKit "Brand theme": screens per step, phone step time, grow time, underline smoothing, crossfade.
- The components card's Slider (feature row) now glides to each new value (`left`/`right` transitions over `--features-travel`, scoped to the picture; Bland's Slider itself stays instant, since it follows a drag). Off under reduced motion.
- Brand theme, fourth pass (Godwin 2026-11-08: "add an opacity effect on the text as it moves; the change in width is too much and looks rowdy"): the gliding words also dim, from 1 to `fadeTo` (0.15) at `fadeAt` (0.4) of the move and back to 1 as they land, and each word starts `wordStaggerMs` (14) after the one before (holding its start while it waits), so a line settles word by word. DialKit "Brand theme", Headline.
- Brand theme, fifth pass (Godwin 2026-11-08: "let the moving line be blue; the opacity did nothing; add a blur replace effect"): the underline's bar is Border/border-brand. The gliding words now blur, up to `blur` (6px) at `fadeAt` (0.4) of the move, and sharpen as they land; the opacity dip is kept as a DialKit slider, off by default (`fadeTo` 1).
- Brand theme, sixth pass (Godwin 2026-11-08: the blur and the scale were still too much; picked Granola's way): **the step list stays small** (Body/body-lg; the current one text-bold with the brand bar filling under it), and **the current step stands as a headline above the picture** (Heading/heading-lg, -2; heading-sm below md). It rolls from step to step: the three share one cell in a mask whose height eases to the current one's; earlier steps wait `rollDistance` (40%) above and later ones below, so going on rolls up and going back rolls down, with an opacity fade, over `rollMs` (520) easing/out. Nothing changes size. The headline is aria-hidden (the list's buttons carry the words). The word FLIP, its blur, dim and stagger are removed. DialKit "Brand theme": Headline rollMs and rollDistance.
- Brand theme, seventh pass (Godwin 2026-11-08: "revert, and try something that doesn't look as rowdy as the scale"): back to Figma's layout, the current step the headline in its place (the separate headline above the picture is gone). **It rolls in place**: each step button is a clipping row holding its small line and its headline; the row's height eases between their measured heights over `rollMs` (560) easing/out, and on a change the leaving layer slides out of the row (up when going on, down when going back) while the arriving one slides in from the other side (Web Animations; the hidden layer is `visibility: hidden` at rest). No scaling, blur or fade. Buttons are named by `aria-label` (the hidden layer drops out of the name). Reduced motion: the switch is instant.
- Brand theme, eighth pass (Godwin 2026-11-08: the old and new text lingered together for a moment): on a change only the arriving layer moves; the leaving one is gone at once. The new headline slides in (from below going on, from above going back) and the old step's small line slides back the same way, while both rows' heights ease.
- Feature row, keyboard (Godwin 2026-11-08: Tab past "Sign in" jumped to the Brand theme section): Tab past the middle card's last control, or Shift+Tab before its first, glides the row to the next card that way with controls (the line, the form, the pills, the listbox) and focuses its first (or last) control once that card is live; with none left that way, Tab leaves the row. The guidance glide is now cancelled only by keys that scroll the page (arrows, Page Up/Down, Home, End, Space), not every keydown, since Tab starts one.
- Brand theme, layout (Godwin 2026-11-08): more room between the steps and the picture (the copy keeps space-3xl clear from md; from xl the picture also sits space-6xl into the empty eighth column), and the info note fills the picture's width (Alert's alert/max-width cap lifted in this section; the component itself is unchanged).
- Brand theme, copy picture (Godwin 2026-11-08: more padding outside the code; he did not like the brand.css card): the snippet sits inside the tinted card space-2xl from the top and sides (running off only its foot), with a near elevation. The file card (a satellite on the snippet's lower right, 216 wide, mid elevation) is now a file row, File icon, `brand.css` in Code/body-md and the switch (named "brand.css"), over a rule and a preview of an Avatar, two placeholder lines and a Publish button that wear whatever is loaded. The code's first line is now `/* Load after tokens.css */`, so it fits.
- Brand theme, copy picture: the preview Avatar shows one letter, "M" (Godwin 2026-11-08: two letters looked off there).
- Feature row, Godwin's DialKit defaults (2026-11-08), now in `row/tuning.ts`: story speed 1.5; screens per card 1 (was 0.9); hold 0.71 (was 0.3); smoothing 160ms (was 260); guidance settle delay 260ms (was 140), glide 380ms plus 410ms per screen; neighbours at scale 0.65 (was Figma's 0.797) and 20%, spacing 0.991 of a card's width (was Figma's 1.086). The row is now 6 screens of scroll.
- Brand theme, Godwin's DialKit defaults (2026-11-08), now in brand/tuning.ts: screens per step 0.8, phone step 5200ms (both as before), roll 400ms (was 560), underline smoothing 100ms (was 140), pictures' crossfade 300ms (was 420).
- **What you get** (Figma `7066:29609` and its states `7068:29845`, `7068:30366`, `7068:30959`, `7071:31173`, `7071:31734`; Godwin 2026-11-08, motion plan agreed before the build): `site/src/what-you-get/`, mounted under Brand theme. Six slides in Figma's order on the canvas (every part, dark mode, motion, works for everyone, nothing hardcoded, your icons), each Figma's sentence with its parts around it. **From md a scroll stepper** as Brand theme: a track of one screen plus `screensPerSlide` (0.9) per slide with a sticky stage; the stage is Figma's 1440 x 1024 frame scaled to fit the screen (never above 1), so every part keeps Figma's place (`box`, centred) and tilt (`tilt`, negated for CSS). "What you get" stays put in Text/text-minimal (Figma's), the section's `<h2>`. **Text, the hero description's motion and numbers**: a new sentence's words rise in one after another (68px, 14ms apart, 520ms on the landing glide), after the old one leaves in duration/xs; then they ink from the rest gray to text-bold across the slide's first `inkEnd` (60%) of scroll, the hero's wash (`wave`, softness 5, rest 60%) with the same color-mix rule. **Parts pop in** as the hero's icons do (from 0.4, 620ms, back-out 2.2), 60ms apart, after the old ones leave in duration/xs. "Dark mode that thinks" sets the stage `data-theme="dark"` with the hero's 1260ms theme glide. Live moments while a slide shows: the field types "Ship it", the button presses (0.97), the Segmented bar's selection moves, the Toggle flips, the Accordion opens, the Calendar picks a day, the typing dots wave (the component's own); the accessibility figure's arms and legs spread out from the shoulders and hips and do it again on a loop (annotation), one eye blinks in the closed eye's place (annotation: the open eye was a reference), the eight token icons pop in staggered (annotation), and the icon grid draws its lines from nothing, grid then keylines then the icon (annotation). All vectors are Figma's exports in currentColor (Icon/icon-brand); the figure and the grid are rebuilt as strokes so they can move. Modal is Modal's own markup and CSS in place (a native dialog would open over the page). Parts are aria-hidden and inert (a picture); every sentence is in a visually hidden list. **On a phone** each slide is its own block (the sentence in Heading/heading-sm, its parts wrapped under it, tilts at 40% of Figma's), playing its rise and pops when it scrolls into view; the dark slide's block is dark. Reduced motion: words and parts fade only, no rise, pop, swing, blink or draw (figure spread, eye open, grid drawn), no scroll inertia. DialKit "What you get" (`what-you-get/tuning.ts`): scroll, text, pop and theme timings. Figma's placeholder copy kept ("User input", "Tab", "Crumb", "Label", "Title", "Click me"), except the bubble's "88:88 AM", shown as 9:41 AM.
- What you get, second pass (Godwin 2026-11-08: "remove the inactive to active text transition. a scroll should take you to the next one"): the gray-to-black ink is gone (words are text-bold as they rise in; the entrance stays). **One gesture, one slide**: while the stage is pinned, a wheel or trackpad gesture, a swipe, or Arrow Down/Up, Page Down/Up and Space glide the page to the next or previous slide's place (the middle of its share of the track), and the rest of that gesture is swallowed until it stops for 200ms and the glide arrives, so a flick never skips a slide. Before the first slide and after the last the page scrolls as usual. Reduced motion: the jump is instant. The scroll's inertia smoothing and the ink sliders left DialKit.
- What you get, third pass (Godwin 2026-11-08: scroll-locked at times; dark slide text black; the tab bar wrong; "wire all this to dialkit"): **no lock**: after a wheel gesture moves a slide, only its own dying tail is ignored (same direction, each event no more than `newFlickRatio` (1.6) times the last, until `gestureQuietMs` (200) without one); a scroll the other way or a fresh flick moves at once, and keys and swipes never wait for anything; the glide no longer has to arrive before the next gesture counts (it counts on from the slide being glided to). The sentence sets its own `color: var(--text-bold)`, so the dark slide's words are white (an inherited color kept the section's light value). **Tab indicator in a turned ancestor** (`src/components/tabs/tabs.tsx`, every tab row): when the selected tab's on-screen box no longer matches its layout size, a rotation, the indicator is placed from layout offsets instead of rects (whole pixels); the Segmented bar's thumb on the tilted slide sat low and wide before. **Every timing in DialKit** ("What you get": Scroll, Text, Pop, Theme, Parts, Figure, Eye, Grid): screens per slide, the gesture's quiet time, new-flick ratio and swipe distance, the text rise, the pop and the phone tilt share, the theme glide, the parts' loops (typing, tabs, toggle, accordion, calendar, press loop and scale), the figure's loop and angles, the eye's loop and lid, the grid's line, stagger and icon draws. Figma's sizes stay in landing-values.css.
- What you get, fourth pass (Godwin 2026-11-09: "even the tiniest scroll can move through all the sections"): one gesture moves one slide. Its events count as that gesture until `gestureQuietMs` (200) pass without one; a scroll the other way of at least `newFlickMinDelta` (15) moves back at once; a new push the same way moves on early only after `newFlickGapMs` (450) since the move, at least 15 and `newFlickRatio` (1.6) times the last event. The third pass's ratio alone read a trackpad gesture's growing start (2, 5, 12, 30…) as a string of new flicks. All three in DialKit, Scroll.
- What you get, fifth pass (Godwin 2026-11-09: "remove the pop animation on the components… i am cool with it for the icons. stagger the appearance of the component as they come into view"): **components appear, icons pop**. A component part (no `data-vector`) rises in from `appear.y` (16px) below with opacity, over duration/lg easing/out, `appear.staggerMs` (60, 30 to 80) apart, by its place in the list, after the old slide leaves in duration/xs; never scaled. It moves with `transform` (translate already places a part on the stage). The drawn icons (figure, eye, token icons, grid, shapes, logos) keep the hero pop. Reduced motion: both fade only. DialKit "What you get", Appear (y, stagger) beside Pop.

- **Components showcase** (Figma `7071:32494`; side session landing-showcase, 2026-11-09, plan agreed with Godwin before the build): `site/src/showcase/`, mounted under What you get. Figma's headline (Heading/heading-lg, -2; heading-sm below md) and line, a sunken panel (surface-sunken, rad-lg, padding and gaps space-lg) of nine surface-raised cards (rad-lg, padding space-lg, at least Figma's 200 tall, growing to fit: the Calendar needs its last week, which Figma's card cuts off), the toolbar, and "Browse all components" as a real link (`/docs/#/components/button`) in the Button's own markup. Layout: one card a row with the toolbar above the cards (the switches in reach before scrolling), two from md, Figma's three on columns 2 to 7 from xl, toolbar below. **Every card is a real, working component** (annotation): Alert (a press swaps its icon: warning, Smiley, Sticker, Clock, which is what its line says), Calendar sm, Button xs (a press shows the spinner for `buttonLoadingMs`), Text Input, Segmented bar, Avatar xl (initials "JD": Figma's photo is raster and the page is vectors only; a press steps its status dot Online, Away, Busy, Offline), Checkbox Group of five, File upload (picked or dropped files become one row that climbs to done; nothing is sent), Chat bubble (a press steps sent, delivered, seen). Parts without a press of their own get a transparent button over them, named for what it does. **Toolbar** (annotations): the font button (Figma's TextT, name, CaretUpDown) cycles Inter, Geist, DM Sans, Source Serif 4, Lora, Playfair Display (the docs site's presets, already installed; each loads on first use) by setting `--font-body` and `--font-heading`; the theme button (Sun, Moon in dark, `aria-pressed`) turns the panel and cards dark, the page stays as it is; the swatches are a radio group of eight presets around the hue wheel (Bland blue, pink, violet, teal, green, amber, orange, graphite) plus "Any color", a native color input under an OKLCH hue wheel swatch. **A color goes through the brand tool** (`scripts/brand/core.ts`: `generate`, `generateNeutrals` subtle, `check` and `fixScale` keeping the picked step, exactly `npm run brand -- generate "#hex" --neutrals subtle --fix`), set as inline steps with `data-theme` on the panel and on each card. Figma's ring (stroke-xl border-inverse, rad-sm, mid elevation) slides to the active swatch over `swatchRingMs` (200). **The change wave**: a change reaches the panel and toolbar first, then each card in reading order, `wave.staggerMs` (40) apart; brand colors ease over `wave.brandMs` (200, easing/out) on each card, theme and font switch at once in each card; a font change waits for its stylesheets first, and only the newest change runs. **Entrance**: the cards pop in once when the panel is a fifth in view, 40ms apart, from 0.8 with the What you get pop's curve (overshoot 1.6, 620ms; WYG's parts pop from 0.4, too much for cards). Reduced motion: cards fade in, a change reaches every card at once, the ring jumps; colors still ease. DialKit "Showcase" (`showcase/tuning.ts`): entrance, wave, parts. Figma's placeholder copy kept ("Label", "User input", "Tab", "Click me", "You should check me"); the bubble's "88:88 AM" shows 9:41 AM. The line under the headline still says "three brands" (Figma and `docs/landing-copy.md`); the panel now offers eight presets and any color, so Godwin may want "any brand".
  - **Godwin's review (2026-11-09):** the line says "any brand". Corners are `.bland-smooth` alone (a component's own `border-radius` overrode its doubled radius, LEARNINGS). The Button hugs its label. "Browse all components" has no underline. The font button has no hover, a `scale(0.97)` press over duration/sm easing/out instead (none under reduced motion). **Light and dark reach every card at once**, no wave, and the surfaces flip without easing; only brand and font travel as the wave. The swatch ring sits outside its swatch (stroke-xl past each edge, so the whole color shows inside and it may run past the strip), rad-sm smoothed, mid elevation. Extra room inside the cards: Alert, Text Input and Segmented bar space-2xl from the sides, File upload space-xl all round (its instruction is one sentence, "Drop files here or click to upload", so it wraps cleanly), Calendar space-xl above and below.
  - **Theme switch** (Godwin 2026-11-09): the theme button sinks to `theme.sink` (0.9) while pressed and pops past full size (`theme.pop` 1.08, `theme.popMs` 420, easing/out) as it lets go; the new theme grows out of it as a circle until it covers the panel's visible part (`theme.revealMs` 600, easing/drawer). A view transition of the panel alone (`view-transition-name: showcase-panel`, default cross-fade off): the old panel stays as a picture underneath, the new one is live inside the growing `clip-path: circle()`, every card switches in the same frame. Keyboard (a click with `detail` 0) and browsers without view transitions switch at once; reduced motion cross-fades the panel over `theme.fadeMs` (200), no sink or pop. Over Bland's 250 cap on purpose: a landing page flourish, tuned in DialKit "Showcase" > theme.
  - **Godwin's review 2 (2026-11-09):** the swatch ring is `icon-on-color` (white in light and dark) and at either end of the strip its two outer corners take rad-md plus the stroke (concentric with the strip's end, smoothed per corner, easing as the ring arrives; the strip's ends are smoothed too). The Alert stays on one line: "Tap to swap icons", its extra side room only from md (checked in all six fonts at 307px). **"Any color" opens the docs site's color picker** (`playground/docs/ColorPicker.tsx`, its CSS moved out of `docs.css` into `playground/docs/color-picker.css` so both sites share it) in the shared Popover above the swatch, `role="dialog"` "Pick a brand color"; the swatch is a button (`aria-haspopup`, named with the picked hex), the eight presets stay a radio group. While the picker is dragged a color reaches every card at once. **A second set of nine**, behind a round switcher beside the font button (Stack icon, the theme button's look, sink and pop; "Show more components" / "Show the first components"): Toggle, Slider, Pills, Search Input, Pagination (4 pages, fits a phone), Tooltip on a Button, Radio group, Numeric Input Field, Accordion, all working, no Figma frame for them. The cards are keyed by the set, so a switch mounts them and they pop in as on arrival; from the keyboard they show at once. Cards never widen past their column (`min-width: 0`, fills capped at 100%).
  - **Godwin's review 3 (2026-11-09):** **every card is one height** in every set, `--landing-showcase-card-height` 256 (Figma's 200 raised to fit the calendar's five weeks with its room); a part that grows (an open Accordion, an uploaded file, a six-week month) scrolls inside its card in a ScrollArea (`fadeSize` sm, the card's padding inside the viewport so focus rings are never cut), so nothing a card does moves the panel. **The switcher comes before the font button** and cycles **three sets** ("Components: set 1 of 3. Show set 2"): Figma's nine, the second set, and a third: Dropdown, Section tabs, a Toast button (its own Toaster), a Progress bar (a press fills it 40, 65, 90, 100, 15), cancellable Chips (a ghost Button brings them back), Badges (a press steps secondary, primary, outline), Code text with copy, Time picker, a Menu on a Button.
  - **Godwin's review 4 (2026-11-09):** the File upload centres in its card like the rest (no longer pinned to the top). Every field-wide part of the other sets (Slider, Search, Accordion, Time picker, Dropdown, Progress bar) is the Text Input's width, space-2xl from the card's sides; Search's placeholder is "Search" so it fits. **Presets are Godwin's bright palette** (his reference image): Lime #c8ee32, Green #72f122, Mint #2fefba, Bland blue (in the image's sky-blue place, still the panel's first brand), Violet #7845ff, Pink #f86db4, Red #ff4538, Orange #ff5a1f, Amber #ffb12a, plus Any color: ten swatches, 240 wide, which fits a phone. The brand tool darkens the steps that carry white text, so a light brand's filled controls read deeper than its swatch (Lime's are olive); axe passes on all nine, light and dark.

- **Figma kit** (Figma `7078:34292`, "Figma system" in the Landing page frame; side session landing-figma-kit, 2026-11-09, plan agreed with Godwin before the build, all three beats): `site/src/figma-kit/`, mounted under the Components showcase. Figma's copy: the "Figma kit" tag (Brand theme's pill), the headline in two lines (Heading/heading-lg, -2; heading-sm below md), the description (body-lg text-subtle), "Get the Figma kit" as a real link in Button sm brand primary markup with the FigmaLogo, opening in a new tab (`FIGMA_KIT_URL` in `FigmaKit.tsx`, **the Bland file's own URL until Godwin names the Community link**), and the checklist (DiamondsFour, ToggleRight, Code at icon/md over a stroke-xs border-subtle rule, body-lg). Layout: stacked below xl (copy, checklist, picture); from xl Figma's columns, the copy on columns 2 to 4 starting 68 above the picture with the checklist level with its foot, the picture from column 5 at Figma's 760 x 584, running past the page's right edge (the section clips it). **The picture** (annotation: "a simple design of the Figma file ... something simplified"): Figma's left panel (200, the 40px FigmaLogo at Figma's 1.875 stroke, "Bland Design System", the pages with Buttons current, the Button set's layers with the variant `Emotion=brand, Type=primary`, everything else filler bars; hidden on a phone) and the canvas (surface-200) with the Button set in Figma's dashed component-purple frame (real Bland Buttons sm: a brand row and a danger row, primary, secondary, stroke; two columns on a phone), a Mode switch (a real SegmentedBar, top left so it is never past the edge) and a Variables card with `Button/brand-primary-rest` drawn in its Light and Dark columns by the variable itself. Figma's own UI colors (component purple `#9747ff`, selection blue `#0d99ff`) are `--landing-figma-kit-*` values: a picture of Figma, not theme colors. **Story** (one loop, about 13 seconds, `story` in DialKit "Figma kit"): a drawn cursor glides to the Light swatch and presses it, the brand flips (blue to pink, `.brand-pink`, or back on the next loop) and the buttons follow one column after another (`hueStaggerMs` 60, `hueMs` 220); it presses Dark and the frame turns dark; it selects the primary button (selection-blue outline), its layer row lights up and a code card slides up under the frame with `<Button emotion="brand" type="primary">` in the Code colors; it presses Light (the reset's cause), the card leaves. **The checklist follows the story**: the current beat's row is text-bold with an icon-brand icon, the others text-subtle and icon-subtle, easing over duration/md; before the story starts and under reduced motion every row is lit. The story runs while the picture is in view and pauses under a mouse (`usePlayback`). **Entrance** once, at a fifth in view: the tag, then the headline's words rise (68px, 14ms apart, 520ms on the landing glide, What you get's), then the description, button and rows (`blockStaggerMs` 80), then the picture pops in (from 0.8, 620ms, overshoot 1.6, the showcase cards'). Reduced motion: fades only, the poster (pink, dark frame, variant selected, code card shown), no cursor.
  - **Fuller file** (Godwin 2026-11-09: "everything is sparse"): the panel lists the file's real pages as Figma names them (the `❖  BASE  ❖` headings, the `     •  ` indents, `---` pages as divider lines), in a 176 list (`--landing-figma-kit-pages-height`) scrolled so Buttons sits in its middle and fading at both ends, then Layers: the Buttons frame, the Button set and its first twelve variants with Figma's full names (`Size=md, Emotion=brand, Type=primary, State=rest`, one line with an ellipsis; the selected one wraps), running off the panel's foot with a fade. The canvas holds the whole set, 64 real Bland Buttons (brand, success, danger, warning x lg, md, sm, xs x primary, secondary, ghost, stroke; primary and secondary only on a phone), in Figma's order, running off the canvas's right and bottom edges under the Mode and Variables cards. **Dark turns the whole picture dark**: `data-theme` on the picture, the canvas (so the pink brand's roles recompute there) and the frame; panel, canvas, cards and rows ease over duration/md. The story now selects the md brand primary; its code card is `<Button size="md" emotion="brand" type="primary">` under the button itself (232 wide on a phone so it wraps, `--landing-figma-kit-code-width-sm`).
  - **Variables card and progress line** (Godwin 2026-11-09): the Variables card is always dark (`data-theme="dark"`, surface-100, rad-lg, Elevation/neutral/far plus a stroke-sm border-subtle edge), 344 wide, and lists the brand primary Button's four real variables (`Button/brand-primary-rest`, `-hover`, `-pressed`, `-disabled`), each swatch drawn by its own token in its column's mode; the cursor presses rest's Light swatch. On a phone it shows rest and hover only, with narrower columns, so the names fit. **The current checklist row gets the Brand theme section's progress line**: the 2px border-brand bar fills along the row's rule over the beat's own time (`beatDurations`, the sum of its steps), linear, paused while the story pauses; it restarts with each beat, and is not drawn before the story starts or under reduced motion.
  - **No pop on the picture** (Godwin 2026-11-09): the entrance's showcase-style pop is gone. The picture's card fades in (`fadeMs` 320, after `delayMs` 240), then its parts rise in one after another, 24px on the landing glide over 520ms, 90ms apart: the panel, the Mode switch, the Button set, the Variables card; then the 64 buttons appear in a wave from the set's top left (opacity and scale from 0.96, 18ms per step of row plus column), and the cursor fades in last. DialKit "Figma kit" > `parts`. Reduced motion: fades only.
  - **Code before dark** (Godwin 2026-11-09): the checklist and the story run Variables for every token, Same names as the code, Light and dark modes. The cursor selects the md brand primary while the file is still light, the code card slides in, then it presses Dark with the selection and card still shown (the poster, step 9, has all three). The code card is always dark (`data-theme="dark"`, surface-100, Elevation/neutral/far plus a border-subtle edge), as the Variables card, so it reads over the white frame. **The Variables card sits on the canvas's right**: from xl the picture runs past the page's edge, so the picture measures how far (`--fk-cut`, less its border) and the card keeps its space-lg gap from the edge you can see.
- **FAQ** (Figma `7189:37802`, "FAQs"; side session landing-faq, 2026-11-09): `site/src/faq/`, mounted after the Figma kit (the footer follows). No annotations in the frame. Figma's centred heading "Some questions about Bland" (Heading/heading-lg, -2; heading-sm below md) and line (body-lg text-subtle) over a column of Bland's own **Accordion**, md, not flush, as in Figma, 560 wide at most (`--landing-faq-width`), space-md apart, Figma's 148 above (`--landing-faq-pad`, scaling to 64). **One open at a time** (a native `name="faq"` group; the browser closes the others), all closed to start. Answers are plain text with inline code as Bland's CodeText sm. **Copy**: Figma's four questions first, then ten added for a project's designer or developer (install, React, Tailwind, fonts, icons, restyling one component, accessibility, browsers, the Figma kit, cost), each checked against the repo; the copy lives in `docs/landing-copy.md`, "FAQ", and `faq/questions.tsx` mirrors it. **Entrance** once, at a fifth in view: the heading's words rise as the Figma kit's (68px, 14ms apart, 520ms on the landing glide), then the line, then the questions top to bottom (24px, 40ms apart). DialKit "FAQ". Reduced motion: fades only. The section is light whatever the system theme.
- **Footer** (Figma `7100:36365`; side session landing-footer, 2026-11-09, plan agreed with Godwin before the build): `site/src/footer/`, mounted last, **outside `<main>`**, so it is the page's `contentinfo`. No annotations in the frame. **Dark whatever the system theme** (`data-theme="dark"`), as Figma draws it and as the hero ends. Figma's 848 column (`--landing-footer-width`) centred in a 960 tall band from md (`--landing-footer-pad` 134, scaling to 96; on a phone the footer is as tall as its content), space-2xl apart: **the Logo** (Figma `7203:40791`, added 2026-11-10, Godwin: "add the logo to the footer"), Bland's own `<Logo mono />`: Figma's Logo lg with its Mark slot set to the white Logomark, which is `mono` (the inverse tile, white on dark, the wordmark's color), at Figma's 1.2 (48 tall, 154 wide, `--landing-footer-logo-zoom`, 1 on a phone; `zoom` scales mark, wordmark and gap together), flush left, not a link (Figma's has none; the hero's is), coming in with the headline's first characters rather than after them; the headline "Start Bland. End up yours." in two lines (Figma's Inter Bold 128 / 112, -8; `--landing-footer-title-font`, scaling to 48); Bland's **CodeText** lg `npm install bland-ui`, copy on ("Copy install command"), scaled with `zoom` to Figma's 30.8 (1.926 from xl, 1.5 from md, 1.25 on a phone, so it fits 320); Bland's **CodeSnippet** with line numbers, no action bar and no toggle (Figma), holding **the README's four imports** (Figma showed tokens.css and styles.css only; fonts.css and base.css are needed for the fonts, focus ring and smoothing) and the Button line; the links row, Figma's Menu item pills (body-lg, space-2xs space-sm, rad-md smoothed, icon/md): Read the docs (`surface-inverse`, `/docs/`), Changelog and MIT license (`surface-200`, icons icon-subtle; Figma's MIT mark was a raw near-white fill), and the npm mark (icon-bold, 48 x 20); hover underlines the label (body-lg-underline), gated to a fine pointer. **Links while the repository is private** (`FOOTER_LINKS` in `Footer.tsx`): Changelog the npm package's Code tab (CHANGELOG.md ships in it), MIT license unpkg's copy of the package's LICENSE, npm the package page; **Figma's GitHub mark is left out** until the repository is public. Copyright: Figma's line, body-lg text-subtle. **The glow** is Figma's two copies, each at 75%: the hero's pink (`--landing-hero-glow-outer`) blurred 16 one pixel up, Text/text-brand blurred 4 one pixel down, at the hero's 3/4 CSS blur scale; the footer clips sideways (`overflow-x: clip`), since the glow's blur room pushed a phone page 38px wide. **Motion, the hero's story run the other way**: each word's real text is its outline (the hero's stroke-lg under a page-colored fill); when a fifth of the footer is on screen its characters rise in (the hero's entrance: 60px, 18ms apart, 520ms on the landing glide) and the install line, snippet, links and copyright follow (24px, 300ms after, 50ms apart); then, as the footer scrolls in, each word fills from outline to bold with its glow (`--bold`, a soft wave two words wide between 0.3 and 0.8 of the footer scrolled in, followed with the hero's 120ms inertia), so the page ends on the glow; scrolling back unfills it. DialKit "Footer" (`footer/tuning.ts`). Reduced motion: nothing moves; the headline turns bold in one step once shown, crossfaded over duration/md.
  - **Redesign** (Godwin 2026-11-09, Figma `7189:37802` updated): two columns, the heading and line on the left (left aligned, grid columns 2 to 4 from xl, 1 to 3 from md) and the questions on the right (columns 5 to 7 from xl, 4 to 6 from md), both top aligned; stacked on a phone. The questions are **flush** Accordion md, 376 of the list's 416 (space-lg in from the left, space-xl left on the right), space-xs from **Figma's dotted rule** between each two: round stroke-md dots in Border/border-bold every space-xs (`--landing-faq-dots`, a radial-gradient tile in `landing-values.css`; Figma's Line has dash 0.1 / gap 4 and round caps), `aria-hidden`. **The first question is open to start** (Figma's Expanded=true), still one open at a time. Figma's twelve questions in its order replace the first draft's fourteen; the first answer is Figma's own, the other eleven are written to be true to the repo; the first draft's extra questions are kept as spares in `docs/landing-copy.md`. Pad `--landing-faq-pad` is Figma's 112 at 1440, scaling to 64.
  - **Heading in two lines** (Godwin 2026-11-09): "Some questions" / "about Bland" at every width, one block span per line (`FAQ_TITLE` is the two lines); screen readers still hear one heading, "Some questions about Bland".

### Landing page on phones (Godwin 2026-11-09, mobile pass)

- **One letter spacing everywhere:** every section headline uses `--landing-heading-tracking` (-0.0465em, Figma's -2 at 43) at every width; desktop's is the reference.
- **No tap highlight** on the site (`-webkit-tap-highlight-color: transparent` on `html`); focus rings and press feedback stay.
- **Feature cards** stack down the page below breakpoint/md; the sideways row is from md.
- **What you get** keeps the pinned stage on a phone and changes slide with the scroll, like desktop: the tag space-sm over the sentence, the components space-4xl under it, the drawn icons at 0.6. The cluster zooms down to fit a short screen. No gesture moves a slide on a phone.
- **Showcase controls on a phone** (Godwin's mockup): component set, font field and theme in one row, the font field filling the room between them; the swatch strip full width under them, each swatch an equal share. Tablet and desktop keep the toolbar row.
- **Tighter phone padding:** showcase, Figma kit and FAQ use space-3xl above and below on a phone (the showcase's grid margin space-md, the others space-lg), and the FAQ list has no inset there. Figma's rhythm from breakpoint/md.
- **Phone, second pass (Godwin 2026-11-09):** feature cards space-5xl apart, their words space-lg from the picture. What you get puts each slide's parts above or under the sentence as Figma places them (above or below the frame's middle), at 0.8 of Figma's size (drawn icons 0.6 in all); a part that grows (the Accordion) keeps its largest room, so it never moves the page. The Figma kit's checklist sits under the picture on a phone.
- **Phone, third pass (Godwin 2026-11-09):** feature cards keep their space-3xl text gap and get space-7xl above and below the stack. What you get's stage is `100lvh` (a dark slide fills the screen once the address bar hides), its content kept in the small viewport; the component pairs above the sentence stand side by side at 0.7, clipped by the screen's edges.
- **Hero on a phone (Godwin 2026-11-09):** the same scroll track as desktop, natively scrolled. The stage is `100lvh` tall, its bottom padding raised by `100lvh - 100svh`, so the address bar sliding away no longer shifts it or leaves a band; the one-time move of the whole page by the bar's height as it hides is the browser's and stays.
- **What you get scrolling (Godwin 2026-11-09):** the feature row's model. A tall track the page scrolls through (so a fast flick can't skip it), the slide by scroll position (slide k at k / 5), and once scrolling stops between slides the page glides to the nearest, as the feature row's cards do. A strong flick inside can pass more than one slide; the page never rests between two. (A one-screen snapping scroller was tried and dropped: a fast page flick crossed it before its snapping took over.)

- Feature cards, light/dark line (Godwin 2026-11-09, through the top session): with a mouse (`(hover: hover) and (pointer: fine)`) the line follows the cursor while it is over the picture, at once, no click needed; on touch a tap puts it where you tap and a sideways drag moves it (vertical swipes still scroll, `touch-action: pan-y`). The grip still takes arrows, Home and End. Where you leave it holds until the story's next step (the story pauses while you are on the card). No motion is added, so reduced motion needs nothing more.
- Feature cards, light/dark line, corrected (Godwin 2026-11-09: "you misunderstood; it should work as before; the little circular button should follow my pointer and expand when dragged"): the line moves only on a drag or tap again, as before (the hover-follow of the line is reverted). **The round grip** rides up and down the line to the pointer's height (with a mouse, as it moves over the picture, gated to `(hover: hover) and (pointer: fine)`; on touch, where the finger is), easing there over duration/sm, kept between 8% and 92% of the height and back at its place (84%) when the mouse leaves; it **grows to 1.25 while you drag** (`--landing-features-grip-drag-scale`) and goes back on release. No easing under reduced motion.
- **Hero headline glow (2026-11-09):** one text shadow on each word's bold fill (Figma's purple above, blue below, at their middle blurs), not 48 blurred copies; the fill and outline are each a compositor layer, and the scroll writes `--bold` and the description's `--ink` straight to the page (React renders only when a phrase is reached). An even blur, close to Figma's top-to-bottom ramp.

- Light/dark grip, smoother (Godwin 2026-11-09: "the grip snaps between positions as I hover or move"): no CSS transition on its height (one restarted at every pointer event). `ThemePicture.tsx` eases `--grip-y` toward its target every frame (time constant `GRIP_SMOOTHING_MS` 110ms, frame-rate independent), straight on the element, and eases it back to its rest (`--landing-features-grip-rest`, 0.84) when the mouse leaves. At once under reduced motion. The drag growth keeps its duration/sm transition.
- **Landing page loading (2026-11-10):** the hero is in the first script; everything below it is one lazy chunk (`site/src/rest.tsx`) loaded straight after, so the hero shows first. Specs that use a lower section wait for it to be attached.


### Landing page loading (2026-11-10, landing audit)

- The site build preloads the hero's two Inter files, 700 (headline) and 600 (description), through `preloadHeroFonts` in `site/vite.config.ts`: the page renders from JS, so without it the fallback font drew the hero first and the text re-flowed (CLS up to 0.21 on a throttled phone, 0 since). If the hero's type changes weight, change the preload with it.
- `site/public/` holds the host's files: `_redirects`, `_headers` (security headers, immutable `/assets/*`), `robots.txt`, `llms.txt`. Report: `docs/landing-audit-2026-11-10.md`.

### Landing page follow-ups (2026-11-10, Godwin's answers to the landing audit)

- `/` is the landing page: the `/` to `/docs/` redirect is gone. `site/404.html` (`site/src/not-found/`) is the 404 page: Logo lg as the home link, "Page not found" (Heading/heading-md), one line in text-subtle, and two md link buttons (brand primary "Go to the home page", stroke "Read the docs"), Bland's Button classes on `<a>`; the theme follows the system; `noindex`.
- Nav on a phone (below breakpoint/sm): Logo, Docs and the GitHub icon; the Figma icon comes back with the other text links from sm (Godwin). The icon links keep their 20px look; an invisible `::after` makes their hit area control/xs (24).
- The GitHub repo is public (Godwin 2026-11-10), so the nav's GitHub link works; `llms.txt` lists it.

### Bland's logo and logomark (2026-11-10, Godwin's design)

- **Figma:** a `Logomark` set on the Brand elements page (`7203:40128`): `Type` Colored (tile Surface/surface-brand) / White (tile Surface/surface-inverse: black in light, white in dark) / Black (tile Surface/surface-100, the page color), `CutOut` true (the B and its ruler ticks cut out of the tile) / false (drawn on it), `Size` sm 16 / md 32. The `Logo` set (`14:211`) now holds it in its 🧩 Mark slot (md in the lg logo's 40 slot, sm in the 24 one), with the gap at space-2xs and the wordmark in Inter Bold (34/40, -2 letter spacing; sm 17/24, -1), bound to variables, not a text style.
- **Logo `Mark` property (added for Godwin, who picked "mono logos"):** `colored` (the brand cut-out mark, the four variants he drew) or `mono`: on Color=default the White cut-out mark (the inverse tile, matching the text-bold wordmark in both themes), on Color=on-color the Black cut-out mark with its tile overridden to Icon/icon-on-color, so it stays white in dark (surface-100 would turn near black on a brand fill). Eight variants in all.
- **Docs site:** the brand link (sidebar head and phone top bar) is the Colored cut-out mark, `BlandMark` in `playground/docs/`, one path in currentColor colored `--surface-brand`, drawn at logo/mark-sm (24) space-sm before the heading-sm wordmark; the link hugs the logo. Favicon: the Colored solid mark (`playground/favicon.svg`, static colors: Brand600 tile, white B, Brand50 ticks).
- **Not done, waiting on Godwin:** the package's `Logo` still draws the old look (space-sm gap, heading-md / title-md at Semi Bold, no letter spacing, no built-in mark). Figma's wordmark is Bold with -2 / -1 letter spacing, which no `--type-*` composite holds, so the code change needs either Logo text styles in Figma (then a token sync) or the wordmark as an SVG. The landing page is Godwin's to do.

### Logo in code: SVG wordmark, built-in logomark, mono (Godwin 2026-11-10)

- **The wordmark is an outlined SVG** (Godwin: "go with the SVG. if a project wants to change the name, they'd need to change the whole logo itself"), exported from Figma's lg text layer and placed in its 87 x 40 text box (ink offset 2.149, 7.273, from the layer's render bounds), so it sits where the live text did. sm draws the same shapes at 24 tall: Figma's sm text is exactly half (17 / 24, -1). `role="img"` + `aria-label="Bland"` names the logo and the home link. This replaces "the wordmark is live text" above.
- **`children` is deprecated** (0.2.0, removed in 0.3.0, per `docs/release.md`): text still shows in place of the wordmark, in the old heading-md / title-md, with one development warning.
- **Bland's logomark shows by default** (Godwin). `mark`: undefined or `true` Bland's, `false` or `null` none, a node replaces it and fills the square as before. Bland's mark is the cut-out drawing in currentColor, sized `calc(logo/mark-* - 2 * space-xs)`: 32 and 16, Figma's md and sm Logomark centred in the 40 and 24 slots.
- **`mono`** is Figma's `Mark` property as a boolean (like Banner's `colored`): the mark's color moves from `--surface-brand` to `--surface-inverse`, or `--icon-on-color` with `color="on-color"`.
- **Colored on on-color is blue on blue**, as Figma draws it; the docs say to use `mono` there.
- **No Logomark export.** Only Logo is public; the non-cut-out drawing is used once, in the docs favicon.
- **Docs site:** the brand links are now `<Logo>` itself: sm in the phone top bar, lg in the sidebar head (`.docs-brand` only keeps the link hugging). `playground/docs/BlandMark.tsx` is gone. This replaces the docs note in the section above.
- **Landing page:** its nav and 404 render `<Logo>`, so they picked up the new logo without an edit; `.hero__logo`'s font override no longer does anything (the wordmark is not text). Left for Godwin, who is doing the landing page.
  - **One open at a time, kept by the FAQ** (Godwin 2026-11-10, replacing the native `name` group): opening a question snapped the open one shut, since the browser closes a `name` group's other item at once and Bland's Accordion follows browser changes without motion (on purpose, `Accordion.tsx`). `Faq.tsx` now holds `openIndex` and passes `open`/`onOpenChange`, so the other question folds over duration/md while the new one opens. Find in page still opens a question (the Accordion reports it through `onOpenChange`) and folds the open one. Bland's Accordion is unchanged.
- Second pass (2026-11-10): the description's entrance starts with the headline (no 420 ms wait); "Read the docs" is a link drawn as the md brand primary Button; favicon is the solid Colored Logomark (same file as the docs), plus `apple-touch-icon.png` and a share card from the hero (`og.png`, relative until the domain is set); the sections below the hero are requested once the hero has painted (two frames).
- One address setting (2026-11-10): `SITE_URL` in `site/vite.config.ts` (unset until the domain is known) drives the canonical link, absolute `og:image` / `og:url`, `sitemap.xml`, the robots.txt Sitemap line and `/.well-known/ard.json` (Agentic Resource Discovery, one `text/markdown` entry for `llms.txt`, identifier `urn:air:<host>:docs:bland`). robots.txt is generated, no longer in `site/public/`.

- **Read the docs in dev** (Godwin 2026-11-10): the site's dev server (5182) has no docs, so `/docs/` fell through to the landing page and the button seemed dead. `devDocsRedirect()` in `site/vite.config.ts` redirects `/docs/…` to the docs dev server on 5180 (the `#/` route survives); the built site serves the docs at `/docs/` as before. Run `npm run docs` beside `npm run site` to follow the links.
