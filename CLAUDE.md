# Bland Design System

Bland is Godwin's personal design system: a Figma UI kit reused across client projects, being turned into code with a token pipeline and (later) a docs site. Figma is finished; this repo is the code side.

- Light and dark themes. A per-project brand color: edit the 12 `Brand/*` steps and everything follows.
- Inter for UI text, Geist Mono for code, Phosphor icons, 100% corner smoothing on every rounded corner.
- One-person system (Godwin plus Claude). Keep process light: no review flow, no client-facing docs yet.

## Repo

```
CLAUDE.md                 rules (this file)
docs/                     long-form notes: components.md (how to build one), tokens.md, lint.md, motion.md
tokens/figma/raw/         raw Figma export, verified by checksum (generated)
tokens/tokens.json        resolved tokens with descriptions (generated)
src/tokens/tokens.css     CSS custom properties, shipped as bland/tokens.css (generated)
src/styles/               fonts.css (self-hosted Inter, Geist Mono) and base.css (reset, focus and smoothing helpers)
src/components/           one folder per component: <Name>.tsx, <name>.css, <name>.stories.tsx
src/icons/                Bland's own icons, exported from Figma
playground/               the docs site (npm run docs): style pages from tokens.json, component pages from stories and generated props; #/raw/<id> is what Playwright screenshots
tests/                    Playwright: screenshots, axe checks, behaviour specs
scripts/build-tokens.ts   raw export -> tokens.json + tokens.css
scripts/tokens/           token build core (core.ts) and drift check logic (drift.ts)
scripts/figma/            Plugin API scripts run through use_figma, plus the local checksum
scripts/stylelint/        bland/use-tokens lint rule, fixtures and test
```

- `npm run tokens`: regenerate `tokens.json` and `tokens.css` from the raw export.
- `npm run tokens:checksum`: hash of the raw export; must equal `scripts/figma/checksum.js` run in Figma.
- `npm run tokens:drift`: drift check against Figma, variable by variable, with the CSS tokens each change reaches; `-- --apply` takes the Figma version. Two steps around one `use_figma` call (`docs/tokens.md`, "Drift check"). `npm run test:drift` runs its tests.
- `npm run build`: tokens, Vite library build, `dist/tokens.css`, type declarations.
- `npm run typecheck`.
- `npm run lint:css`: Stylelint on `src/components/**/*.css`; rejects any value that is not a `var(--…)` token (including durations, easings and `@media` widths) and names the token to use (`docs/lint.md`). `npm run test:lint` runs its fixtures.
- `npm test`: Playwright in Chromium against the docs site: screenshots of every story in both themes, axe, behaviour specs, docs smoke tests. `npm run test:update` re-baselines screenshots after an intended visual change.
- `npm run docs:stop`: frees port 5180 when an old dev server holds it ("Port 5180 is already in use").
- `npm run docs`: the docs site at http://localhost:5180. It first runs `npm run props`, which reads each component's props from its TypeScript (via a TypeScript 5.9 alias, since TypeScript 7 has no JS API) into `playground/.generated/props.json`.

**Building a component: follow `docs/components.md`.**
- `npm run audit`: `npm audit --omit=dev`, the audit check. The full audit flags dev-only `braces` with no fix yet (`docs/lint.md`).
- npm, not pnpm. Vite 8 library mode, TypeScript strict, React as a peer dependency.

To sync tokens from Figma, follow `docs/tokens.md` step by step. Never hand-edit generated files.

## Project logs — read and write these

Three append-as-you-go files at the repo root, the working memory this file is too short to hold:

- **`INTERFACE.md`**: every design and API decision settled in code (tokens, conventions, icons, overflow, motion, each component, the docs site). **Read it before building a component**; write to it the moment a decision is made.
- **`LEARNINGS.md`**: symptom → cause → rule for everything this project has been bitten by (Figma MCP limits, fonts, TypeScript 7, CSS, ports, parallel sessions). Read the section matching what you're about to touch; add an entry the moment something surprises you.
- **`EXECUTIONS.md`**: the steps taken, task by task, including dead ends. Append a section **during** the task, not reconstructed after. Side sessions append their own.

They merge with git's `union` strategy (`.gitattributes`): append, never restructure another session's section.

## Hard rule

**No hardcoded values in component code.** Every color, size, space, radius, stroke, shadow and type value is a `var(--…)` token. If no token fits, stop and ask; do not invent a value or a token.

## Sources of truth

| What | Owner | Rule |
| --- | --- | --- |
| Token values, styles, component visuals | [Figma file](https://www.figma.com/design/32J76yQH71a7sENjf60RqD/Bland-Design-System), key `32J76yQH71a7sENjf60RqD` | Read through the Figma MCP. Never hand-edit generated tokens in the repo. |
| Component behaviour, APIs, rules | This repo: `CLAUDE.md` + `docs/` | Figma descriptions point here. |
| Planning chats | claude.ai project "Bland design system" | Reads the repo via GitHub; keeps no copies. |

- Variables are **local and unpublished**, and the REST variables endpoint needs Enterprise. Read them with the Figma MCP (`get_variable_defs`, or a `use_figma` script that dumps JSON). `get_design_context` and screenshots for components.
- Every variable and component set has a description written for code. **Read descriptions before guessing intent.**
- Names starting with `_` (`_menu-item`, `_fade`, `_Spinner`, `_scrollbar`) are private building blocks, not public components.
- Build components from the component set and its description, never from screenshots alone.
- No Code Connect (Godwin's call). The component map below replaces it.

## Token architecture

Three layers. **Components bind only to Theme or scale tokens, never primitives.** 613 variables in 12 collections (as of 2026-10-18), plus 15 elevation styles and 23 text styles. Primitives are not emitted to CSS at all, so a component cannot reach them.

| Collection | Layer | Modes | Holds |
| --- | --- | --- | --- |
| `_Core Colors` | Primitive, hidden | 1 | `Brand/*`, `Neutral/*`, `Purple/*` (OKLCH) + `Alpha/aN` steps |
| `_Functional Colors` | Primitive, hidden | 1 | `Red/*`, `Green/*`, `Amber/*` + alphas |
| `_Units` | Primitive, hidden | 1 | `unit/0`–`unit/640`, `unit/0-5`, `unit/1-5`, `unit/full` |
| `Theme` | Semantic + component | Light, Dark | `Text/`, `Icon/`, `Surface/`, `Border/`, `Shadow/`, `Scrollbar/`, `Fade/`, one group per component (`Button/`, `Indicator/`, `Badge/`, `Toggle/`, `TextInput/`, `Menu/`, `Table/`, `Messaging/`, `Code/`, …) |
| `Spacing` | Scale | 1 | `space-none` 0 – `space-9xl` 256, `Layout/margin-desktop` 152, `Layout/margin-mobile` 24 |
| `Corner Radius` | Scale | 1 | `rad-null` 0, `rad-xs` 2, `rad-sm` 4, `rad-md` 8, `rad-lg` 16, `rad-xl` 24, `rad-rd` full |
| `Stroke` | Scale | 1 | `stroke-none` 0, `stroke-xs` 0.5, `stroke-sm` 1 (borders), `stroke-md` 1.5 (icons), `stroke-lg` 2 (focus), `stroke-xl` 4 |
| `Typography` | Scale | 1 | `family/`, `weight/`, `size/`, `line-height/`, `letter-spacing/normal` (0) |
| `Effects` | Scale | 1 | `elevation/{near,mid,far}/{ambient,key}-{y,blur,spread}`, `elevation/x` |
| `Sizing` | Scale | 1 | `control/*`, `icon/*`, `input/*`, `avatar/*`, `table/*`, `fade/*`, `scrollbar/width`, `logo/mark-*`, … |
| `Motion` | Scale | 1 | `duration/xs` 125, `sm` 160, `md` 200, `lg` 250, `xl` 400 (Toast), `2xl` 500 (Sidebar, sheets), `spin` 800 (one turn of a loading spinner), `toast-visible` 5000 (how long a Toast stays on screen, not an animation); `easing/out`, `in-out`, `drawer`, `ease`, `linear` |
| `Breakpoints` | Scale | 1 | `breakpoint/sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 (mobile-first `min-width`) |

### Export rules

Implemented in `scripts/build-tokens.ts`; CSS naming and the sync steps are in `docs/tokens.md`.

- Output is CSS custom properties (`--space-md`, `--surface-100`, …). Dark mode redefines the Theme variables only. No Tailwind theme.
- In components, use the composites: `font: var(--type-body-md)`, `box-shadow: var(--elevation-neutral-mid)`.
- Resolve alias chains to final values. Theme tokens alias primitives in both modes.
- Component tokens alias primitives directly, never another component's tokens (so they can diverge). Sole exception: `Badge/*` aliases `Indicator/*` on purpose.
- Alpha primitives are stored as `{color: alias, opacity: N}`. Resolve to the source color at that opacity.
- **Do not export `Fade/*-clear`** (Figma-only drawing aids).
- Export every variable's description alongside its value.
- Elevation: 15 styles `Elevation/{neutral,brand,danger,success,warning}/{near,mid,far}`, each an ambient + key layer. Geometry from `Effects`, color from `Shadow/{family}-{ambient,key}`. In code each is **one `box-shadow` variable** whose color switches in dark mode.
- Text styles: Display, Heading, Title, Body (incl. `-bold`, `-underline`), `Code/*` in Geist Mono. `weight/semibold` (Inter "Semi Bold") and `weight/mono-semibold` (Geist "SemiBold") are both real: the families spell the style differently.
- Naming: size steps follow value order (`xs` < `sm` < `md` < `lg`). Variant values lowercase; property names capitalized.

## Decisions code must follow

- **Dark mode:** Neutral mirrors (0↔950, 50↔900, …); color tints (50–300) become deep tones; color solids (400+) move two steps lighter. Toggle knob is white in both modes. Danger primary Badge/Indicator label stays white in dark (3.7:1, deliberate). Success primary Badge/Indicator label stays white in light (4.47:1, deliberate, decided 2026-10-18).
- **Focus:** `:focus-visible` only, never a state or prop. 2px ring (`stroke-lg`) in `Border/border-focused`, offset 2px. Figma's `👀 Focused` boolean is dropped in code.
- **States:** rest, hover, pressed (where relevant), disabled. Selected and checked are their own props.
- **Slots:** Figma `🧩` slots map to `children` or named slot props.
- **Prop names:** strip Figma prefixes (`👀` boolean, `✏️` text, `🌟` instance swap, `🧩` slot).
- **Corner smoothing:** components set `--bland-radius` to the Figma radius and add `.bland-smooth`, which draws twice that radius with `corner-shape: superellipse(2)` (Figma's 100% smoothing spreads the curve over 2× the radius; tuned 2026-10-18). Safari/Firefox fall back to plain rounding at the Figma radius; that is accepted.
- **Icons (decided 2026-10-17):** Bland ships no icon pack. Every icon prop takes any SVG as a React node; Bland sizes it from `icon/*` (12, 16, 20, 24) and colors it through `currentColor` from the matching `Icon/*` token. Stroked icons (the Figma set, Lucide) get `stroke-md` (1.5) at every size; filled packs (Phosphor React, any weight) keep their own weight. The design source is the Phosphor-based Figma Icons page; the few icons Bland needs internally (spinner, caret, close, check) are exported from it into `src/icons/` as components need them. Details in `docs/components.md`.
- **Overflow:** every overflowing scroll area shows **both** a visible scrollbar (thumb `Scrollbar/thumb`, width `scrollbar/width`) and an edge fade. The fade is a real `mask-image: linear-gradient(...)` on the scroll container, transparent only on edges with hidden content, length `fade/md` (32) by default or `fade/sm` (16), updated on scroll; a focused item scrolls clear of it. (Figma's surface-colored overlay is only a workaround.) In code every fade uses the shared `.bland-scroll-fade` class; don't write another mask. Scrolling in Figma today: Menu, Calendar month/year, Sidebar, Code snippet, Text Area. Table, Modal body, chat list and tab rows follow the same rule if they scroll in code.
- **Disabled:** disabled states use the disabled color tokens (`Button/*-disabled`, `Toggle/*-disabled`, `Control/checked-disabled`). No opacity, and no opacity token; the lint rejects `opacity` on disabled selectors.
- **Layout:** mobile-first. Base styles are mobile, `breakpoint/md` (768) is the tablet layout, `breakpoint/xl` (1280) the desktop layout; `sm`, `lg` and `2xl` are for component-level tweaks. Media queries use `min-width` on a breakpoint value only (`var()` does not work there; the lint holds the list). `--breakpoint-*` exist for JS (`matchMedia`, Floating UI).
- **Motion:** details and reasons in `docs/motion.md`.
  - Durations and easings are Motion tokens only. Never `ease-in` on UI; entering and exiting use `easing/out`.
  - UI motion stays at or under `duration/lg` (250). Only Toast (`xl`) and Sidebar/sheets (`2xl`, with `easing/drawer`) go above. Loading spinners rotate continuously at `duration/spin` with `easing/linear`.
  - Don't animate keyboard-initiated actions or anything used hundreds of times a day.
  - Never scale from 0: start at 0.95 to 0.97 with opacity 0. Popovers, dropdowns and tooltips scale from their trigger; modals stay centered.
  - Press feedback: `scale(0.97)` on `:active`, `duration/sm`, `easing/out`.
  - Exit along the same path as the entrance.
  - Every animation has a `prefers-reduced-motion` fallback: keep opacity and color, drop transform motion.
  - Gate hover motion behind `@media (hover: hover) and (pointer: fine)`.
  - Name exact properties, never `transition: all`.
  - Stagger lists 30 to 80ms per item. No stagger token until a component needs one.
- **Truncation is not overflow:** truncated text always ends in an ellipsis, never a fade.
- **Tooltip placement:** Floating UI names (`top-start` … `right-end`).
- **Writing:** descriptions and docs never use em dashes.

## Code stack

Raw build: plain CSS on token variables (decided 2026-10-17: plain classes, not CSS Modules). Classes are `bland-<component>`, variants are data attributes (`data-size`, `data-type`), parts are `bland-<component>__<part>`. **No Tailwind, no shadcn.**

- **Raw HTML components:** Button, Badge, Indicator, Chip, Avatar, Alert, Banner, Toast, Progress, Breadcrumb, Table, Empty State, Accordion (`<details>`), Toggle, Checkbox, Radio (native inputs).
- **React Aria for behaviour only** (keyboard, focus, screen reader); all styling is Bland CSS: Dropdown/Menu, Modal, Tooltip, Tabs, Slider, Date and Time pickers, Pagination input. Chosen over Radix and Base UI for focus handling and date components.
- **Positioning:** Floating UI for Tooltip and Dropdown. Native `<dialog>` and `popover` are fine where they fit; don't rely on CSS anchor positioning yet.
- **Framework:** React (confirmed 2026-10-16). It's the standard for design systems and React Aria requires it. Tokens stay plain CSS, so non-React client projects can still use them.
- **Lint:** Stylelint with a strict-value rule rejects any color, size, space, radius, stroke, shadow or font value that is not `var(--…)`. Each error names the token to use and why, so an agent can fix it in one pass. Set this up before building components.

## Workflow

1. Godwin changes a token, style or component in Figma.
2. Token sync: read variables through the Figma MCP, write token JSON into the repo, regenerate CSS, as one commit/PR whose diff shows exactly what changed.
3. Components pick it up because they only read tokens.
4. A decision made while coding goes into `docs/` or this file **in the same commit**, and the matching Figma description gets a one-line pointer.
5. Changing a component means updating its row in the component map in the same commit.

A drift-check script compares Figma variables with repo tokens and reports differences (optionally as a weekly scheduled task).

## Component map

For each component: Figma set, code import, and Figma property → prop mapping. Prefixes stripped, `👀 Focused` dropped. Fill in the import and full props when the component is built.

| Figma page | Figma set(s) | Code import | Props (Figma → code) / notes |
| --- | --- | --- | --- |
| Accordion | Accordion | TBD | Header + content; content is a slot. Built on `<details>` |
| Alert / Banner / Toast / Notification | Alert, Banner, Toast, Notification | `import { Alert, Banner, Toast, Toaster, useToaster, Notification } from 'bland'` | All: `Status` → `status` info/danger/success/warning (default info; info uses the brand tokens), `👀 Icon` → `icon` (`true` status icon, `false` none, or any SVG). Shared status model and layout in internal `message/`. Alert: `✏️ Label` → `children`, text `Text/text-{status}` (info text-bold), max alert/max-width; `role` alert for danger, status otherwise. Banner: `Orientation` → `orientation` horizontal/vertical, `✏️ Title` → `title`, `✏️ Description` → `children`, `👀 Btn`/`(2nd)` → `actions` slot (Buttons xs horizontal, md vertical), `👀 Close` → `onClose` + `closeLabel`; surface-100 + border-bold, fills its container (banner/width is Figma's frame only); no role. Toast: `✏️ Label` → `children`; strong fill, white content, status elevation; no close or actions. Toaster: `useToaster()` `toast` / `show` / `dismiss`, polite live region in a manual popover, time on screen `duration/toast-visible` (5000), paused on hover, focus and hidden page; motion duration/xl easing/out, opacity only under reduced motion. Notification: as Banner plus `Colored` → `colored` (default true), `✏️`/`👀 Timestamp` → `timestamp`, `👀 Close btn` → `onClose`; width notification/width. Banner and Notification: `👀 Title` (horizontal, off by default; added in Figma 2026-10-18) = pass `title`. Close is an xs ghost Icon Button with an icon/md icon-subtle X |
| Avatar | Avatar | `import { Avatar } from 'bland'` | `Size` → `size` xs–3xl (avatar/*), default **md** (Figma xs). `Type` → `type`: image/placeholder/initials; omitted, it follows `src`/`initials`. Image: `src`, `alt` (accessible name; omit it next to a visible name and the avatar is decorative), `imgProps`; a missing or failed image falls back to the initials, else the placeholder. `✏️ Initials` → `initials` (xs shows one character, others up to two). `🧩 Top slot` / `🧩 Bottom slot` → `topSlot` (count) / `bottomSlot` (status): any node, centred on the circle edge at 45°, sized `avatar/slot-*` to fit `<Indicator ring>` (slot xs/sm = Indicator sm, md/lg = md, xl = lg, 2xl = xl, 3xl = 2xl; counts read from avatar xl up). Placeholder icon `UserIcon`. Circle has no `.bland-smooth`. Not focusable |
| Badges | Badge, Indicator | `import { Badge, Indicator } from 'bland'` | Badge: `Size` → `size` sm/md/lg/xl (default sm), `Emotion` → `emotion` brand/neutral/success/danger/warning, `Type` → `type` primary/secondary/outline, `✏️ Label` → `children`, `🌟`/`👀 Leading/Trailing icon` → `iconStart`/`iconEnd`, `Icon only` → pass `icon` + required `aria-label` (no sm; defaults to md; `role="img"`). Code only: with one icon, the bare side's padding steps up 8 → 12 on sm/md/lg (optical padding; not in Figma). Indicator: `Size` → `size` sm/md/lg/xl/2xl (default sm; sm, md are dots), `Emotion` → `emotion`, `Type` → `type` primary/secondary, `✏️ Label` → `children` (shown at lg+; `👀 Label` off = no children), `👀 Ring` → `ring`, default **false** (Figma true; its description says on only over an Avatar or image). Both: inner frame not rendered, fill on the root; full radius without `.bland-smooth`. Badge tokens alias Indicator |
| Breadcrumbs | Breadcrumb | `import { Breadcrumb } from 'bland'` | A `<nav aria-label="Breadcrumb">` (override with `aria-label`) around an `<ol>`. `items`: `{ label, href, icon, hideLabel }[]` from the top level down; the last is the current page, static text with `aria-current="page"` (body-lg-bold `text-bold`, icon `icon-bold`), never a link or focusable. `Crumbs` → the length of `items`. `✏️ Label` → `label` (a string), `🌟`/`👀 Icon` → `icon` (icon/md, `icon-link`), `👀 Label` off → `hideLabel` (icon only; the label becomes its name). Links: body-lg `text-link`, hover underline (body-lg-underline), plain `<a>` unless `renderLink(props, item)` renders the project's router link (keep `props.className`). Separator CaretRight icon/xs `icon-subtle`, outside the link, aria-hidden. Overflow: `maxItems` collapses longer trails to the first item, an overflow crumb and the last two (Figma's rule); the crumb is a `<button>` showing "…" named `overflowLabel` ("Show hidden pages") plus the count, hover `Breadcrumb/surface-hover`; pressing it reveals the hidden crumbs in place and focuses the first (Figma says a menu: switch once Dropdown exists). Code only: the list wraps instead of overflowing (Figma no-wrap). Crumbs `.bland-smooth` rad-sm |
| Buttons | Button, Icon Button | `import { Button, IconButton } from 'bland'` | `Size` → `size` lg/md/sm/xs, default **md** (Figma xs; its description says xs is below the touch target). `Emotion` → `emotion`, `Type` → `type`; native type is `htmlType` (default `button`). `✏️ Label` → `children` (`👀 Label` off → use IconButton). `🌟 Icon (L)/(R)` → `iconStart`/`iconEnd`. `👀 Loading (L)/(R)` → `loading`: `true`/`'start'`/`'end'`, spinner (rotates at `duration/spin`, static under reduced motion) replaces that side's icon, `aria-busy`, clicks ignored. Icon Button: `icon`, required `aria-label`, `loading` swaps the icon. State is CSS; `👀 Focused` dropped. Figma's inner Base frame is not rendered: padding sits on the `<button>`; stroke type is an inset `stroke-lg` shadow (Figma inside stroke) |
| Checkbox / Radio Button | Checkbox, Checkbox Group, Radio Button, Radio Button Group | `import { Checkbox, CheckboxGroup, Radio, RadioGroup } from 'bland'` | Native `<input>` drawn as the Figma box/circle (`appearance: none`) inside a `<label>` that is the whole hit area (control/xs 24 sm, control/sm 32 md, around selection/box-sm 16 / box-md 20); `className` on the label, every other prop on the input (`ref` too). `Size` → `size` sm/md, default **sm** (Figma's), or the group's. `Checked` → `checked` / `defaultChecked`: Checkbox true/false/`'mixed'` (native `indeterminate`, Minus glyph), Radio true/false; plus `onCheckedChange` (Checkbox). `✏️ Label` → `children` (`👀 Label` off = none, add `aria-label`). `State` is CSS (hover on the whole label) or `disabled`. Radio needs `value`. Groups: a `<fieldset>` (RadioGroup `role="radiogroup"`) needing `aria-label` or `aria-labelledby` (Figma has no legend), `Size` → `size` (passed down), `Orientation` → `orientation` vertical (rows touch) / horizontal (space-lg, wraps), `disabled` disables all. RadioGroup: `name` (generated), `value` / `defaultValue` / `onValueChange`. Glyph and dot `Icon/icon-on-color` (Figma's glyph fill is raw white). Box `.bland-smooth` rad-sm; circle rad-rd without |
| Chip / Pills | Chip, Pills | `import { Chip, Pill } from 'bland'` | Chip (static `<span>`): `Size` → `size` sm/md/lg, default **sm** (Figma's). `✏️ Label` → `children`. `Type` is not a prop: `count` (Figma countable + `✏️ Count`, the chip's own `surface-200` box, not an Indicator) and `onRemove` (cancellable: a close `<button>`, `aria-label` "Remove <label>" or `removeLabel`, 24px hit area). `🧩 Slot` → `leading`. Pill (toggle `<button aria-pressed>`, folder `pills/`): `Size` → `size` sm/md/lg, default **sm**. `Selected` → `selected` / `defaultSelected` + `onSelectedChange`. `State` is CSS (hover) or `disabled`. `🌟 Icon` → `icon`; `👀 Number` → `count` (a number or string becomes an Indicator xl secondary: brand when selected, neutral otherwise or disabled; any other node as is); `👀 Label` off → no `children`, add `aria-label`. Full radius without `.bland-smooth` |
| Code snippet | Code-snippet | TBD | `View`: collapsed/expanded/fullscreen. Resizable height; collapsed body capped at 384. Geist Mono + `Code/*` syntax tokens |
| Date & Time | Calendar, pickers | TBD | Pickers wrap an exposed Text Input. React Aria |
| Dropdown | Dropdown, Menu | TBD | Exposed trigger + menu. Menu uses `Elevation/neutral/mid`. React Aria + Floating UI |
| Empty State | Empty State | TBD | Illustration slot |
| File tab / Section tab / Pill tab / Segmented bar / Tab bar | one set each | TBD | Shared item anatomy; overflow is a DotsThree item. React Aria |
| File Upload | File-upload | TBD | Uploader states + file rows with nested Progress-bar |
| Lists | List item | TBD | Leading and trailing slots |
| Messaging | Chat-bubble, Chat-list-item | TBD | Sent / delivered / seen indicator |
| Modals | Modal | TBD | `Size`: sm 384 / md 512. Resizable. React Aria |
| Pagination | Simple, table | TBD | Items follow the tab pattern |
| Progress indicators | Progress-bar, Progress-wizard | TBD | |
| Sidebar | Sidebar, group, item | TBD | Top and bottom slots; minimized mode |
| Slider | Slider | TBD | Knob: hover, focus, real Tooltip. React Aria |
| Table | Table-row, cells | TBD | Sizes sm/md/lg. Selected rows use `surface-brand-light` |
| Text-input | Text Input, Text Area, Numeric Input Field, Search Input | `import { TextInput, TextArea, NumericInputField, SearchInput } from 'bland'` | Text Input: a plain native `<input>` (controlled or uncontrolled, every native prop and `ref` reach it; `className` on the wrapper; `fieldRef` reaches the bordered box for popovers). `Size` → `size` sm/md/lg (input/*, 32/40/48; default **sm**, Figma's), body-lg at every size. `Status` → `status` default/danger/success/warning: border, helper color, status icon (WarningOctagon, CheckCircle, WarningCircle); danger sets `aria-invalid`. `✏️ Label` → `label` (a `<label for>`; `👀 Label` off = none, add `aria-label`). `✏️ Helper text` → `helperText` (`aria-describedby`). `🌟 Icon ( L )/( R )` → `iconStart`/`iconEnd`. `✏️ Alt text` → `altText`. `👀 Leading/Trailing input` → `leading`/`trailing` (text, an `<Icon>` or a slot, with a 1px `border-bold` divider). `✏️ User input` → `value`/`defaultValue`/`placeholder` (placeholder `text-subtle`, Figma's rest). `State` is CSS: hover, filled (`data-filled`, add-on labels go bold), disabled (`disabled`). Focus ring on the field box while the input is focused. Native `size` attribute not exposed. Search Input: the Text Input field with `type="search"`, MagnifyingGlass at the start, named "Search" unless given `aria-label`; `Size` → `size` (default sm); `👀 Clear` → `clearable` (XCircle button while filled, its space kept while empty so the width never changes; `clearLabel`, `onClear`; Escape clears; not a Tab stop); `✏️ Label` is the `placeholder`. Text Area: a native `<textarea>` (same contract) that grows with its text inside a ScrollArea (Figma `👀 Overflow`: fade plus visible thumb, automatic); `rows` (default 4) sets the field height, the Figma resizer → `resizable` (default true, drags the height). `Status` → `status` (border, helper; danger `aria-invalid`; no status icon, as in Figma), `label`, `helperText`. Disabled matches Text Input (label `text-subtle`, `border-subtle` whatever the status; Figma rebound 2026-10-18). Numeric Input Field: one native input per box in a `role="group"` named by `label` (or `aria-label`); `Size` → `size` sm/md/lg (digit/* squares, default sm; sm body-md, md/lg title-lg), `Status` → `status` (every box border, helper; danger `aria-invalid` on each box), `👀 6 digits` → `length` 4/6 (default 4), `helperText`, `value`/`defaultValue`/`onValueChange` (digits string), `onComplete`, `placeholder` (one character), `disabled`, `name` (hidden input), `ref` on the first box. Typing moves on, Backspace moves back, arrows/Home/End move, paste and `one-time-code` autofill fill every box, letters ignored. `State` is CSS (hover per box, filled = has a digit); disabled matches Text Input (label `text-subtle`, `border-subtle`; Figma rebound 2026-10-18) |
| Toggle | Toggle | `import { Toggle } from 'bland'` | Native `<input type="checkbox" role="switch">` drawn as the track (`appearance: none`), knob a sibling span, inside a `<label>` that is the whole hit area; `className` on the label, every other prop (`ref` too) on the input. `Size` → `size` sm (track/sm 40 x control/xs 24, knob 16) / md (56 x 32, knob 24), default **sm** (Figma's). `Checked` → `checked` / `defaultChecked` + `onCheckedChange`. `State` is CSS (hover on the whole label) or `disabled`. `✏️ Label` → `children`, body-lg at both sizes (`👀 Label` off = none, add `aria-label`). Knob white in both modes (`Toggle/knob-rest`). Knob slides `duration/xs` `easing/out`, jumps under reduced motion; no press scale. Full radius without `.bland-smooth`. Not RTL-aware yet |
| Tooltip | Tooltip | TBD | Floating UI placements; optional slot |
| Scroll area | `_scrollbar`, `_fade` | `import { ScrollArea } from 'bland'` | `Axis` → `axis`: `y` (default) / `x`; `_fade` `Size` → `fadeSize`: `md` (default) / `sm`; fade edges and the thumb follow the scroll. Overlay thumb 4 in from the edge, always visible, draggable; native scrollbar hidden. `viewportProps` reach the scrolling element. Built on `.bland-scroll-fade` |
| Icons page | Phosphor icons, `_Spinner` | `import { Icon, CheckIcon, … } from 'bland'` | `<Icon size label>` wraps any SVG: `size` xs/sm/md/lg (icon/*) or the parent's `--bland-icon-size`; stroked icons get `stroke-md`; `label` makes it non-decorative. Bland icons so far: Check, X, CaretDown, CaretRight, Plus, Minus, User, Spinner, MagnifyingGlass, XCircle, WarningOctagon, CheckCircle, WarningCircle, Info |
| Brand elements | Logo | TBD | `Color`: default/on-color; optional `Mark` slot |

Base Figma pages (Colors, Effects, Grid system, Icons, Spacing, Typography) document tokens. Annotations (Header, Footer, Notes, Typo card) is doc chrome, not kit. Landing page and site Navbar are pending a redesign.

## Progress tracker

Godwin follows progress in the [Bland Build Tracker](https://claude.ai/code/artifact/6bcbb578-c0e8-411f-a75c-966e611e0134), a Claude Doc that both of you edit. **Keep it current as you work**, with the Claude Docs tools (read the doc first; Godwin's edits win):

- **Where we are:** one short paragraph, rewritten when the state changes.
- **Needs your call:** open decisions and Godwin's tasks as a checklist. When Godwin answers one, apply it in the repo, record it here or in `docs/`, and remove it from the list.
- **Next up:** the next few tasks in order.
- **Checklist:** every task by phase. Tick it when it's done.
- **Log:** one row per meaningful step (a merge, a sync, a decision), newest first.

The doc shows status; the roadmap below and the component map stay the source for scope.

## Roadmap

In order; tokens come before components.

- [ ] Repo + sync setup. Done: git repo on GitHub (private, [JGodwyn/bland-design-system](https://github.com/JGodwyn/bland-design-system)), `docs/` seeded, handoff archived. Left: connect it to the claude.ai project, merge and retire the project's `claude/bland-handoff*.md` files.
- [x] Drift check with a per-variable diff report (2026-10-18): `npm run tokens:drift`, see `docs/tokens.md`.
- [ ] Weekly drift check on a schedule (optional): it needs the Figma MCP, so it would be a scheduled Claude task.
- [x] Token export pipeline (Light/Dark CSS, resolved aliases and alphas, descriptions kept, `Fade/*-clear` skipped). First export 2026-10-16.
- [x] Token lint (Stylelint) before any component code. Set up 2026-10-16, see `docs/lint.md`.
- [x] Playwright (decided 2026-10-17): screenshots of every story in both themes, axe checks and behaviour specs, Chromium only, against the playground. Set up 2026-10-17.
- [x] Base: fonts, reset, focus and smoothing helpers, icon slot, scroll area, conventions in `docs/components.md`. Done 2026-10-17. Grid system (17 Figma layout grids) is deferred until page layouts need it.
- [x] Docs site, local (2026-10-17): sidebar of styles and components, live demo with controls, variants, props tables, theme switch. Runs with `npm run docs`.
- [ ] Docs site hosting: not deployed anywhere yet.

## Open questions (ask Godwin, don't assume)

- Dark mode switch: root class/attribute, system preference, or both? The generated CSS currently supports both (`data-theme` wins over `prefers-color-scheme`).
- Docs site hosting: where, if anywhere, to deploy `npm run docs` as a static site.
- Brand swap per client: one package with a brand override file, or a build per client? Today the build resolves primitives to values, so a brand swap means editing `Brand/*` in Figma (or a client copy) and re-running the sync. A runtime override would need Theme tokens emitted as `var()` references to brand primitives instead.

## Pending context to merge into `docs/`

The original handoff is in `docs/archive/`. The claude.ai project still holds `claude/bland-handoff.md` (component build notes, node ids) and `claude/bland-handoff-update-2026-10-16.md` (newer; wins on conflicts, including a stroke token rename). The [Figma audit doc](https://claude.ai/code/artifact/8aba9baf-ab27-4b44-b98b-133ba5093546) records foundation decisions. Merge them into `docs/` as components are built; then this repo is the only source.
