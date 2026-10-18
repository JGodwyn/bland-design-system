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
  components need them: Check, X, CaretDown, Plus, Minus, User, Spinner so far.

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
- Mobile first: below the tablet breakpoint the sidebar becomes a Menu.
- **"focused" is offered only for components that take keyboard focus**
  (decided 2026-10-18). The demo shows the control only when what it renders
  contains a `.bland-focus-ring` element, and it follows the props: Button,
  Icon Button and Pill always, Chip only with `onRemove` (its close button),
  never Icon, Badge, Indicator or Avatar. Stories likewise show a Focused row
  only for focusable components.
- The docs chrome lives in `playground/`, outside the Bland package and the
  lint, but uses Bland's tokens and components wherever one fits.
