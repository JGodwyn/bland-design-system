# Bland Design System

Bland is Godwin's personal design system: a Figma UI kit reused across client projects, being turned into code with a token pipeline and (later) a docs site. Figma is finished; this repo is the code side.

- Light and dark themes. A per-project brand color: edit the 12 `Brand/*` steps and everything follows.
- Inter for UI text, Geist Mono for code, Phosphor icons, 100% corner smoothing on every rounded corner.
- One-person system (Godwin plus Claude). Keep process light: no review flow, no client-facing docs yet.

## Repo

```
CLAUDE.md                 rules (this file)
docs/                     long-form notes: tokens.md (pipeline), lint.md, motion.md
tokens/figma/raw/         raw Figma export, verified by checksum (generated)
tokens/tokens.json        resolved tokens with descriptions (generated)
src/tokens/tokens.css     CSS custom properties, shipped as bland/tokens.css (generated)
src/components/           components (none yet)
scripts/build-tokens.ts   raw export -> tokens.json + tokens.css
scripts/figma/            Plugin API scripts run through use_figma, plus the local checksum
scripts/stylelint/        bland/use-tokens lint rule, fixtures and test
```

- `npm run tokens`: regenerate `tokens.json` and `tokens.css` from the raw export.
- `npm run tokens:checksum`: hash of the raw export; must equal `scripts/figma/checksum.js` run in Figma.
- `npm run build`: tokens, Vite library build, `dist/tokens.css`, type declarations.
- `npm run typecheck`.
- `npm run lint:css`: Stylelint on `src/components/**/*.css`; rejects any value that is not a `var(--…)` token (including durations, easings and `@media` widths) and names the token to use (`docs/lint.md`). `npm run test:lint` runs its fixtures.
- `npm run audit`: `npm audit --omit=dev`, the audit check. The full audit flags dev-only `braces` with no fix yet (`docs/lint.md`).
- npm, not pnpm. Vite 8 library mode, TypeScript strict, React as a peer dependency.

To sync tokens from Figma, follow `docs/tokens.md` step by step. Never hand-edit generated files.

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

Three layers. **Components bind only to Theme or scale tokens, never primitives.** 611 variables in 12 collections (as of 2026-10-17), plus 15 elevation styles and 23 text styles. Primitives are not emitted to CSS at all, so a component cannot reach them.

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
| `Motion` | Scale | 1 | `duration/xs` 125, `sm` 160, `md` 200, `lg` 250, `xl` 400 (Toast), `2xl` 500 (Sidebar, sheets); `easing/out`, `in-out`, `drawer`, `ease`, `linear` |
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

- **Dark mode:** Neutral mirrors (0↔950, 50↔900, …); color tints (50–300) become deep tones; color solids (400+) move two steps lighter. Toggle knob is white in both modes. Danger primary Badge/Indicator label stays white in dark (3.7:1, deliberate).
- **Focus:** `:focus-visible` only, never a state or prop. 2px ring (`stroke-lg`) in `Border/border-focused`, offset 2px. Figma's `👀 Focused` boolean is dropped in code.
- **States:** rest, hover, pressed (where relevant), disabled. Selected and checked are their own props.
- **Slots:** Figma `🧩` slots map to `children` or named slot props.
- **Prop names:** strip Figma prefixes (`👀` boolean, `✏️` text, `🌟` instance swap, `🧩` slot).
- **Corner smoothing:** `border-radius` plus `corner-shape: superellipse(n)` tuned to match. Safari/Firefox fall back to plain rounding; that is accepted.
- **Icons:** Phosphor, stroke `stroke-md` (1.5), sized by `icon/*` (12, 16, 20, 24). Color via the `Icon/*` token matching the adjacent text.
- **Overflow:** every overflowing scroll area shows **both** a visible scrollbar (thumb `Scrollbar/thumb`, width `scrollbar/width`) and an edge fade. The fade is a real `mask-image: linear-gradient(...)` on the scroll container, transparent only on edges with hidden content, length `fade/md` (32) by default or `fade/sm` (16), updated on scroll; a focused item scrolls clear of it. (Figma's surface-colored overlay is only a workaround.) In code every fade uses the shared `.bland-scroll-fade` class; don't write another mask. Scrolling in Figma today: Menu, Calendar month/year, Sidebar, Code snippet, Text Area. Table, Modal body, chat list and tab rows follow the same rule if they scroll in code.
- **Disabled:** disabled states use the disabled color tokens (`Button/*-disabled`, `Toggle/*-disabled`, `Control/checked-disabled`). No opacity, and no opacity token; the lint rejects `opacity` on disabled selectors.
- **Layout:** mobile-first. Base styles are mobile, `breakpoint/md` (768) is the tablet layout, `breakpoint/xl` (1280) the desktop layout; `sm`, `lg` and `2xl` are for component-level tweaks. Media queries use `min-width` on a breakpoint value only (`var()` does not work there; the lint holds the list). `--breakpoint-*` exist for JS (`matchMedia`, Floating UI).
- **Motion:** details and reasons in `docs/motion.md`.
  - Durations and easings are Motion tokens only. Never `ease-in` on UI; entering and exiting use `easing/out`.
  - UI motion stays at or under `duration/lg` (250). Only Toast (`xl`) and Sidebar/sheets (`2xl`, with `easing/drawer`) go above.
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

Raw build: plain CSS (or CSS Modules) on token variables. **No Tailwind, no shadcn.**

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
| Alert / Banner / Toast / Notification | one set each | TBD | `Status` → `status`: info/danger/success/warning. Text wraps at 384 |
| Avatar | Avatar | TBD | `Type` → `type`: image/placeholder/initials. Nested Indicator |
| Badges | Badge, Indicator | TBD | `Emotion` × `Type`. Badge tokens alias Indicator |
| Breadcrumbs | Breadcrumb | TBD | Current page static; separator outside the link |
| Buttons | Button, Icon Button | TBD | Loading uses `_Spinner` |
| Checkbox / Radio Button | Control, Group | TBD | `Checked` → `checked`: false/true/mixed. 24 and 32 hit areas |
| Chip / Pills | Chip, Pills | TBD | Count is a nested Indicator |
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
| Text-input | Text Input, Text Area, Numeric, Search | TBD | `Status` (replaces Type); leading/trailing add-on slots |
| Toggle | Toggle | TBD | Knob white in both modes |
| Tooltip | Tooltip | TBD | Floating UI placements; optional slot |
| Scroll area | `_scrollbar`, `_fade` | `src/components/scroll-area/scroll-fade.css`, class `bland-scroll-fade` (internal) | Fade only so far: script sets `data-fade-start` / `data-fade-end` on scroll; `data-fade-axis="x"`, `data-fade-size="sm"`. Scrollbar TBD. See Overflow decision |
| Brand elements | Logo | TBD | `Color`: default/on-color; optional `Mark` slot |

Base Figma pages (Colors, Effects, Grid system, Icons, Spacing, Typography) document tokens. Annotations (Header, Footer, Notes, Typo card) is doc chrome, not kit. Landing page and site Navbar are pending a redesign.

## Roadmap

In order; tokens come before components.

- [ ] Repo + sync setup. Done: local git repo, `docs/` seeded, handoff archived. Left: GitHub remote (Godwin), connect it to the claude.ai project, merge and retire the project's `claude/bland-handoff*.md` files.
- [ ] Drift check script. The checksum pair in `scripts/figma/` is the base; it still needs a per-variable diff report and an optional weekly schedule.
- [x] Token export pipeline (Light/Dark CSS, resolved aliases and alphas, descriptions kept, `Fade/*-clear` skipped). First export 2026-10-16.
- [x] Token lint (Stylelint) before any component code. Set up 2026-10-16, see `docs/lint.md`.
- [ ] Playwright: scope to confirm (visual regression and/or interaction, both themes).
- [ ] Docs site: lower priority; stack and hosting to decide.

## Open questions (ask Godwin, don't assume)

- Where the repo lives (GitHub account/org and name).
- Dark mode switch: root class/attribute, system preference, or both? The generated CSS currently supports both (`data-theme` wins over `prefers-color-scheme`).
- Docs site stack and hosting.
- Playwright scope.
- Brand swap per client: one package with a brand override file, or a build per client? Today the build resolves primitives to values, so a brand swap means editing `Brand/*` in Figma (or a client copy) and re-running the sync. A runtime override would need Theme tokens emitted as `var()` references to brand primitives instead.

## Pending context to merge into `docs/`

The original handoff is in `docs/archive/`. The claude.ai project still holds `claude/bland-handoff.md` (component build notes, node ids) and `claude/bland-handoff-update-2026-10-16.md` (newer; wins on conflicts, including a stroke token rename). The [Figma audit doc](https://claude.ai/code/artifact/8aba9baf-ab27-4b44-b98b-133ba5093546) records foundation decisions. Merge them into `docs/` as components are built; then this repo is the only source.
