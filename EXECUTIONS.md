# EXECUTIONS.md — what was done, in order

An append-only log of the steps taken to solve each problem, newest section at
the bottom. It answers "how did this get like this?": the narrative that
doesn't belong in `LEARNINGS.md` (rules) or `INTERFACE.md` (decisions).

## Format

```
## YYYY-MM-DD — Short task title
**Asked:** one line, in Godwin's own framing.

- `HH:MM` step taken, in the order it actually happened
- `HH:MM` …

**Verified:** how it was checked — the command, the measurement, the thing looked at.
**Logged:** LEARNINGS.md §… · INTERFACE.md §…   (omit if nothing new)
```

Rules: log **during** the task, not reconstructed after. Record the steps that
actually happened, including the ones that turned out to be wrong; a dead end
is the most useful thing in here. Times are local. Side sessions append their
own section when they finish a task.

The sections up to "Project logs" were reconstructed on 2026-10-17 from the
conversation and the git history, so their times are commit times, not step
times.

---

## 2026-10-16 — Handoff to CLAUDE.md
**Asked:** "this doc will get you up to speed. from this doc, also write up a claude.md."

- Read `Bland Design System Claude Code Handoff.md` (now `docs/archive/handoff-2026-10-16.md`).
- Wrote `CLAUDE.md`: hard rule, sources of truth, token architecture, export
  rules, decisions, code stack, workflow, component map, roadmap, open questions.
- Godwin asked which framework is standard for design systems; React confirmed
  and recorded.

## 2026-10-16 — Repo, React package and token pipeline
**Asked:** "git init this folder, seed docs/, scaffold the React package, and start on the token export pipeline."

- `git init`, archived the handoff, npm (no pnpm installed), Vite 8 library
  mode, TypeScript strict.
- Probed Figma: 594 variables (the handoff said 584), alphas stored as
  `{color: alias, opacity: 0–100}`.
- Dead end: the full dump through `use_figma` was 206 KB against a 20 KB return
  cap. Checked for `fetch` in the plugin sandbox to post it locally: not there.
- Chunked the export (compact format: hex colors, `@id` aliases), trimmed style
  data to bindings, pulled 7 chunks and saved them to `tokens/figma/raw/`.
- Wrote `scripts/build-tokens.ts`: resolves aliases and alphas, skips
  `Fade/*-clear`, names CSS variables, builds elevation `box-shadow`s and text
  style `font` values, fails on collisions.
- Bug: 6% alphas came out as 5.9% through 8-bit hex. Switched to exact alpha.
- Added the checksum pair; Figma and local both `4950e4c2`.
- Committed later as part of `564a2ab` (2026-10-17 06:32).

**Verified:** checksum match; spot-checked 20 tokens against Figma; build and typecheck.
**Logged:** LEARNINGS.md §Figma.

## 2026-10-16 — Token lint (side session)
**Asked:** proposed as a follow-up; Godwin started it.

- A side session built Stylelint rule `bland/use-tokens` with fixtures, then
  synced the Motion and Breakpoints collections (611 variables, checksum
  `b0959f0e`) and wrote `docs/motion.md`. Godwin added Motion rules,
  mobile-first layout and "no disabled opacity" to `CLAUDE.md` with it.
- The braces audit warning was recorded in `docs/lint.md`; `npm run audit`
  checks shipped dependencies only.

**Verified:** `lint:css`, `test:lint` 4/4, typecheck, rerun in the main session.

## 2026-10-17 — First commit and GitHub
**Asked:** "Commit the working tree changes with a sensible message." Then: "you can't create a github repo?"

- `06:32` `564a2ab`: 58 files, including the project skills in `.claude/skills`.
- `06:36` Created the private repo `JGodwyn/bland-design-system` with `gh`,
  pushed, recorded it in CLAUDE.md (`00af29c`).

## 2026-10-17 — Progress tracker
**Asked:** "spin up an artifact or doc or something to track tasks and progress … you and i can update as we go on."

- `06:59` First version: an HTML artifact with a shared database (40 tasks,
  5 questions, 4 log notes), pointed to from CLAUDE.md (`d19fd80`).
- Godwin: "too complicated … just a live md file called a doc." Rebuilt as a
  Claude Doc (Where we are, Needs your call, Next up, Checklist, Log).
- `07:03` CLAUDE.md now points at the doc (`db98fa5`); the database artifact
  was deleted at Godwin's request.

## 2026-10-17 — Finish the base before components
**Asked:** "before we do button, are we done with the base? styles and all? so we can move on to the components in other chats"

- Audited the Figma base pages against the repo: tokens done; missing base CSS,
  font loading, focus and smoothing helpers, icon approach, scrollbar, shared
  conventions. Grid system (17 layout grids) deferred.
- Decisions from Godwin: finish the base here; plain CSS classes; for icons
  "what if someone wants bold icons or a different pack?", so Bland ships no
  pack and icon slots take any SVG.
- Added Fontsource static fonts, `base.css` (reset, `bland-focus-ring`,
  `bland-smooth`), the `Icon` slot, Bland icons exported from Figma.
- Read the Figma `_scrollbar` (4 in from the edge, outside the mask); built
  `ScrollArea` with an overlay thumb because native scrollbars can't match.
- Playground plus Playwright: screenshots in both themes, axe, scroll area
  behaviour. Downloaded Chromium headless.
- Wrote `docs/components.md` with dependency waves.
- `07:19` `360edbc`.

**Verified:** lint, typecheck, build, 12 Playwright tests, audit 0; looked at every screenshot.
**Logged:** INTERFACE.md §2–4.

## 2026-10-17 — Button and Icon Button (side session) and `duration/spin`
**Asked:** "build buttons in another chat"

- Started a side session with the Figma bindings already read (sizes, colors
  per emotion, type and state).
- It stopped on the spinner speed: no Motion token fit. Godwin chose a new
  token. Created `duration/spin` = 0.8s (TIMING) in the Figma Motion
  collection, re-exported chunk 06 only, checksum `7c3b334a` (612 variables),
  `07:28` `2500c31`. Staged token files only, since the side session was
  working in the same folder.
- `07:29` The side session pushed `c249223`. It also fixed icon size
  inheritance in `icon.css`.

**Verified:** 24 Playwright tests; looked at the Button screenshot.
**Logged:** LEARNINGS.md §CSS, §Working with parallel sessions · INTERFACE.md §5–6.

## 2026-10-17 — Local docs site
**Asked:** "a web page where i can preview the components & styles built … a sidebar … the variants and props … dark mode. more like a mini doc site."

- Props tables from the TypeScript: `react-docgen-typescript` crashed on
  TypeScript 7 (no JS API). Added the `typescript5` alias and a resolve hook in
  `scripts/build-props.ts`.
- Extended stories with `description`, `components` and `demo`; built the docs
  shell, style pages from `tokens.json`, and component pages.
- Port 5180 was held by an old playground server; used it instead of stopping it.
- Browser checks: display text samples were cut off (switched to style
  names); the selected theme option was invisible (`secondary` on
  `surface-200`, switched to `stroke`); the scroll area demo pushed the page
  sideways on a phone (fixed the demo grid and stage).
- Moved screenshots to `#/raw/<id>`; screenshots unchanged. Added docs smoke tests.
- `07:50` `231831f`.

**Verified:** 41 Playwright tests; desktop and 375px in the browser pane; page width equals viewport.
**Logged:** LEARNINGS.md §TypeScript, §CSS, §Tooling, §Browser pane · INTERFACE.md §7.

## 2026-10-17 — Project logs
**Asked:** "add a LEARNINGS, EXECUTION, INTERFACE md files just like in Presto … also npm run docs reports an error: Port 5180 is already in use."

- Read Presto's `LEARNINGS.md`, `EXECUTIONS.md`, `INTERFACE.md` and how its
  `AGENTS.md` points to them.
- Wrote Bland's three files from this project's history, added a "Project
  logs" section to CLAUDE.md, and a union merge rule for them in
  `.gitattributes`.
- Port: the old `vite --config playground/vite.config.ts` server (pid 6111)
  was still holding 5180. Added `npm run docs:stop`.

## 2026-10-18 — Avatar (side session, wave 2)
**Asked:** build Avatar from the Figma set (page 82:6937, set 132:2818), nesting the Indicator from the Badge session.

- Read the set description, properties and bindings of every variant through
  `use_figma`. Figma has **two** slots, `🧩 Top slot` (count badge) and
  `🧩 Bottom slot` (status dot), not one: both centred on the circle edge at
  45°, sized `avatar/slot-*`. Initials: `Surface/surface-brand` fill,
  `Indicator/brand-primary-content` text; placeholder: `surface-300` fill,
  User icon in `Icon/icon-subtle` at `avatar/icon-*`; image: `surface-500`
  under the image.
- The first Figma connector hit its View-seat call limit mid-read, and
  Framelink's token had expired; the second Figma MCP connector finished the
  read (text styles per size, slot positions, User icon SVG).
- The Indicator was not in `src/components/` yet; built everything else first.
- Exported User (6080:106234) into `src/icons/` as `UserIcon`. Built
  `Avatar.tsx`, `avatar.css`, the story and `tests/avatar.spec.ts` (6 specs:
  both fallbacks, alt as the name, xs initial, slot geometry, decorative).
- Slot geometry measured in the browser: within 0.5px of Figma's x/y for every
  size (Figma rounds to whole pixels).
- The docs server on 5180 had been running since 2026-10-17 and did not list
  the new story; restarted it with `docs:stop` + `npm run docs`.
- The Indicator was still uncommitted when Avatar was done, so the slots take
  any node and the story uses a stand-in dot; swap in `<Indicator ring>` once
  it is on main.
- Gates: lint:css clean; typecheck clean for Avatar (the only errors are in
  another session's uncommitted `scripts/drift.ts` and `scripts/tokens/`);
  Avatar visual, axe and behaviour tests pass; build passes. The Chip, Pills
  and Indicator stories fail while their sessions finish them.

**Verified:** 6 Avatar specs, avatar screenshots in light and dark looked at, axe clean.
**Logged:** INTERFACE.md §3, §6 Avatar · LEARNINGS.md §Figma, §Tooling · CLAUDE.md component map.

## 2026-10-18 — Badge and Indicator (side session, wave 1)
**Asked:** build Badge and Indicator; Indicator first, since Avatar and Chip nest it.

- Read both set descriptions, properties and variant bindings (inner frames
  included). The first Figma connector hit its View-seat limit and
  Framelink's token had expired; the second Figma MCP connector worked.
- Indicator: fill and size sit on an inner frame, ring is a hidden-by-prop
  frame with a 2px outside `surface-100` stroke. Labels: lg and xl
  `Body/body-sm`, 2xl `Body/body-lg`; padding lg `space-2xs`, xl/2xl `space-xs`.
- Decided: `rad-rd` shapes skip `.bland-smooth` (corner-shape would make a
  squircle; Figma keeps a circle). `ring` defaults off (Figma on).
- axe: danger primary labels in dark (3.7:1, deliberate) and success primary
  in light (4.47:1, token just under 4.5) fail contrast. Excluded exactly
  those in `tests/a11y.spec.ts` and raised the success one with Godwin.
- Full `npm test` had failures only in other sessions' uncommitted work
  (pills story, `scripts/tokens/drift.test.ts` typecheck).
- Committed Indicator as 72628ba from a temporary staging of HEAD plus my
  lines only: Avatar had its files staged in the shared index at the time.
- Badge: icon only is a union-typed variant of Badge (`icon` + `aria-label`),
  not a separate component. Outline border per emotion read from Figma
  (neutral uses `border-bold`). The docs server needed `npm run props` to
  show the new component's props table (props are generated at startup).

## 2026-10-18 — Chip and Pills (side session, wave 2)
**Asked:** build Chip and Pills (pages 542:25321, 708:23768), nesting the Indicator from the Badge session for the count.

- The first Figma connector hit its View-seat limit on the first call; the
  second Figma MCP connector read both sets (descriptions, properties, every
  variant's bindings, inner frames).
- Chip (542:25533): no selected state, so a static `<span>`; `Type` is
  default/cancellable/countable. Its count is **not** an Indicator: a
  `chip/trail-*` frame, `surface-200`, `text-subtle` body-sm-bold
  (body-md-bold on lg). Padding end `space-2xs` (lg `space-xs`) with a trailing
  box, `space-sm` (lg `space-md`) without. Close icon X at icon/xs (lg icon/sm),
  `icon-subtle`. The description asks for a bigger hit area on sm and md:
  centred `control/xs` `::before`.
- Pills (708:23772): description says toggle button with `aria-pressed`. Outer
  frame zero padding, inner frame carries height/min width `pill/*`, padding
  `space-md/lg/xl`, gap `space-xs`, body-lg and icon/md at every size. Count is
  an Indicator xl secondary: brand when selected, neutral otherwise.
- First render of the pills had squircle ends: `rad-rd` with `.bland-smooth`.
  Dropped the class, as Indicator and Avatar had already decided.
- The docs server on 5180 did not pick up the new `pills/` folder's story
  until `playground/docs/data.ts` was touched (Vite's glob watcher missed the
  new directory).
- A spec expected an icon-only sm pill to be 32 wide; it is 44 (12 + 20 + 12),
  the same as Figma's padding gives. The spec was wrong, not the pill.

## 2026-10-18 — Drift check with a per-variable diff report
**Asked:** "Drift check with a per-variable diff report (do in this chat)", alongside Badge, Avatar and Chip in three parallel sessions.

- Started the Badge, Avatar and Chip sessions first, telling Avatar and Chip to wire the Indicator only once the Badge session had committed it.
- Split `scripts/build-tokens.ts` into `scripts/tokens/core.ts` (load and build) and the writer, so the drift check can build two exports and compare the CSS. Output checked byte-identical before and after.
- First design: a Figma script returning a fingerprint per variable, then a second script fetching the changed ones. Wrote it and its tests, then dropped it: every check meant copying about 15 KB of hashes out of a `use_figma` result by hand.
- Flipped the direction: `npm run tokens:drift` bakes the repo's hashes into `tokens/figma/drift/check.js`; Figma compares and returns only the records that differ. A clean check returns about 150 bytes.
- `scripts/tokens/drift.ts` turns the result into a report: per-variable field changes (aliases shown by name) and every CSS token whose value or description moves, found by building both exports. `--apply` writes the Figma version back into `tokens/figma/raw`.
- One test failed on a wrong expectation: Brand primary uses Brand600 in both modes, so both change. Fixed the test, not the code.

**Verified:** `npm run test:drift` 5/5 (recolor, reworded description, add, remove, broken alias, apply round trip); live run against Figma: "No drift: all 612 variables, the collections and the styles match Figma"; a simulated Brand600 recolor through the real CLI listed 14 affected tokens and `--apply` produced `--button-brand-primary-rest: #1a4fe0`, then the committed files were restored.
**Logged:** LEARNINGS.md §Figma · docs/tokens.md "Drift check".
- The Indicator landed on main (72628ba) as the rest was finishing, so Pill
  wraps a numeric `count` in it, and the Chip story shows the leading slot
  with an Avatar and an Indicator.
- Seen in the dark screenshot: a selected, disabled pill's neutral count
  (`indicator-neutral-secondary`, #576275) is the same colour as
  `control-checked-disabled`, so the badge disappears. That is Figma's binding;
  kept and raised with Godwin.
- Gates: lint:css clean, typecheck clean for `src/` and `tests/` (the
  remaining errors are another session's uncommitted `scripts/drift.ts` and
  `scripts/tokens/`), `npm test` 82 passed, build passes. Re-baselined only
  `chip-*` and `pills-*` screenshots and looked at them.

**Verified:** 5 Chip and 8 Pill specs, chip and pills screenshots in light and dark, axe clean.
**Logged:** INTERFACE.md §6 Chip and Pill · CLAUDE.md component map.
- Commit race: while the Chip and Pills files sat staged, the drift session
  committed and pushed everything in the index, so Chip and Pills shipped in
  9ab048c under the drift check's message. Content checked complete (26 files,
  `src/index.ts` with only the Chip and Pill exports). History left as is,
  since it was already on origin; LEARNINGS.md §Working with parallel sessions
  has the rule.

## Avatar slots get the real Indicator (2026-10-18)

- Indicator was on main (72628ba), so the Avatar story's hand-styled `Dot`
  became `<Indicator ring>` at the slot's size: xs/sm sm, md/lg md, xl lg,
  2xl xl, 3xl 2xl. Danger count on top, success dot with `aria-label="Online"`
  at the bottom. sm and md Indicators drop their label, so the count reads
  from avatar xl up; md and lg show a plain danger dot on top.
- `npx playwright test -g avatar --update-snapshots` passed without touching
  the PNGs: the change fit inside `maxDiffPixelRatio`. Re-ran with
  `--update-snapshots=all` on `avatar looks` only and looked at both themes.

**Verified:** lint:css and typecheck clean, `npm test` 87 passed, build passes.
**Logged:** INTERFACE.md §Avatar · CLAUDE.md component map · LEARNINGS.md §Tooling.

## 2026-10-18 — Avatar story photo
**Asked:** use the Unsplash photo that Figma's Avatar uses (3TLl_97HNJo).

- Fetched it through Unsplash's download redirect, cropped on the face to
  160x160 (2x the 3xl avatar), 7.8 KB, into `playground/assets/avatar-portrait.jpg`;
  the story imports it, so docs and screenshots stay offline.
- Re-baselined only Avatar's screenshots and looked at them.

## 2026-10-18 — Playground keeps its size when zoomed
**Asked:** "the playground increases vertically when i zoom to 400%. i don't want the playground changing sizes."

- Cause: `.docs-demo-stage` sized to its content between 240 and 480px, and
  CSS `zoom` grows the content's layout box (Avatar xl at 400%: 248 → ~290).
- Fix: the stage fills `.docs-demo-view` out of flow (`position: absolute;
  inset: 0`); the view is `min-height: 320px` and stretches to the props panel
  on desktop. Measured 100% vs 400% on Avatar, Button, Pills, Scroll area
  (desktop) and Avatar at 375px: same height, no sideways scroll.
- Added a docs test: zooming to 400% leaves the view's box unchanged.

## 2026-10-18 — Badge optical padding (Badge and Indicator session)
**Asked:** "increases the padding on an area without an icon if there's an area with an icon … from 8 to 12 … just do this for sm, md, and lg."

- Badge sets `data-icon` start/end/both; CSS widens the bare side to
  `space-md` on sm, md, lg. xl untouched. No Figma change (noted in
  INTERFACE.md and the component map row instead).
- Story row "Optical padding" at every size; `tests/badge.spec.ts` checks the
  computed padding. Badge screenshots re-baselined (intended change).

## 2026-10-18 — Checkbox and Radio (Checkbox and Radio session)
**Asked:** build Checkbox and Radio, each with its Group, from the Figma sets.

- Read all four sets in one `use_figma` dump per page (split in two 19 KB
  slices for the 20 KB limit): descriptions, properties, every variant's
  bindings including hit-area, box, glyph/dot, focus-ring and label-wrap frames.
- Built on native inputs drawn as the box (`appearance: none`) inside a
  `<label>` hit area; groups are fieldsets with a required aria name. Details
  in INTERFACE.md §Checkbox and Radio; map row in CLAUDE.md.
- Stories with every state, a Focused row, groups and behaviour fixtures;
  `tests/checkbox.spec.ts` (10) and `tests/radio-button.spec.ts` (7).
- Restarted the docs server (it predated the new folders). Checked the docs
  demo: mixed default and the focused preview both work.
**Verified:** lint:css, typecheck, `npm test` 120 passed, build. New
baselines looked at in both themes.

## 2026-10-18 — Toggle (Toggle session)
**Asked:** build Toggle from the Figma set, following docs/components.md, on a native switch input.

- One `use_figma` dump of all 12 variants (first try hit the 20 KB limit;
  compacted to one line per node): description, properties, track, knob,
  focus-ring and label bindings.
- Built on `<input type="checkbox" role="switch">` as the track inside a
  `<label>`, knob as a sibling. Travel = track width - track height, so no
  new token. Details in INTERFACE.md §Toggle; map row in CLAUDE.md.
- Story with every state, a Focused row, behaviour fixtures and a long label;
  `tests/toggle.spec.ts` (8): switch role, Space, controlled, sizes and knob
  travel, hit area, tokens per state, focus, reduced motion.
**Verified:** lint:css, typecheck, `npm test` 133 passed, build. New
baselines looked at in both themes.

## 2026-10-18 — Avatar demo: slot controls
**Asked:** "can we have an option to tweak the slot content?"

- ReactNode props get no generated control, so the Avatar story adds its own:
  `topSlot` / `bottomSlot` (none, dot, count), `topEmotion` / `bottomEmotion`,
  `topCount` / `bottomCount`. The slot holds a ringed Indicator sized for the
  avatar; a dot gets an `aria-label` from its emotion (Online, Busy, Away…).
- The snippet printed every control as a prop, so `Story.demo` got an optional
  `code(args)` and the snippet prints a string starting with `<` as JSX.
- Checked in the browser; added a docs test for the slot controls.

## 2026-10-18 — Text Input (Text Input family session)
**Asked:** build the text input family (Text Input, Text Area, Numeric Input Field, Search) from the Figma page "Text-input"; Text Input first, committed on its own.

- Read all eight sets on the page with a `use_figma` dumper that walks every
  variant and groups each binding by the variant property that changes it
  (48 Text Input variants in one 9 KB answer), then targeted reads for the
  field's child order, icon colors and the five icons' SVGs.
- Built Text Input on a native `<input>` inside the Figma field box; add-ons,
  icons, alt text, status icon. `InputField` (internal) carries an
  `endAction` slot for Search's clear button. Details in INTERFACE.md
  §Text Input; map row in CLAUDE.md.
- Exported MagnifyingGlass, XCircle, WarningOctagon, CheckCircle,
  WarningCircle into `src/icons/`.
- Dead ends: two spec failures were test bugs (mouse coordinates below the
  fold, a color read mid-transition); axe flagged disabled helper text,
  excluded as WCAG-exempt. All three in LEARNINGS.md.
**Verified:** lint:css, typecheck, `npm test` 148 passed, build. New
baselines looked at in both themes.
- Search Input: Text Input's field with `type="search"`, the magnifier and a
  clear button (Escape clears, not a Tab stop); `tests/search-input.spec.ts`
  (5). Verified: lint:css, typecheck, `npm test` 158 passed, build;
  baselines looked at in both themes.
- Text Area: a growing `<textarea>` inside ScrollArea (fade and thumb), rows
  for the height, a drag handle from Figma's resizer;
  `tests/text-area.spec.ts` (6), including caret-follow scrolling and the
  drag. One `a11y` run of text-area (light) failed once under the full suite
  and never again in 270 reruns; message not captured. Verified: lint:css,
  my typecheck and tests (another session's alert/banner/toast work had type
  errors and missing baselines at the time), build; baselines looked at.
- Numeric Input Field: one native input per box in a labelled group; type,
  Backspace, arrows, paste and one-time-code autofill handled in React;
  `tests/numeric-input-field.spec.ts` (6). Verified: lint:css, typecheck,
  `npm test` 219 passed, build; baselines looked at in both themes.
- Slip: 0b4c4c6 shipped the Feedback session's uncommitted CLAUDE.md and
  INTERFACE.md lines (my edit script read the working copy). Told that
  session; nothing to undo. LEARNINGS.md §Working with parallel sessions.

## 2026-10-18 — Alert, Banner, Toast and Notification (feedback session)
**Asked:** build the four feedback components from their Figma pages, sharing one status model, with a minimal Toaster.

- Read all 32 variants (Alert 4, Banner 8, Toast 4, Notification 16) with a
  `use_figma` tree dumper (bindings, text styles, effect styles, instance
  mains) per page, in parallel calls; Banner's first dump went over the
  20 KB limit and was split by orientation. Then one read for the icon and
  close-icon colors inside the instances, and the four status icons' SVGs.
- Text Input had already exported WarningOctagon, CheckCircle and
  WarningCircle (uncommitted at the time); reused them and added Info, which
  rode into Text Input's commit b27faca.
- Built the internal `message/` (status tokens per `data-status`, status
  icon, shared Banner/Notification layout), then Alert, Banner, Toast with
  the Toaster, Notification. Decisions in INTERFACE.md §Alert, Banner, Toast
  and Notification; map row in CLAUDE.md.
- Dead end: the Toaster pause test failed because Playwright's installed
  clock still runs in real time between `runFor` calls (LEARNINGS.md).
**Verified:** see the commit; specs alert (5), banner (4), notification (3),
toast (7); baselines looked at in both themes.
- Follow-up (Godwin): Figma now has the horizontal title. Added a `👀 Title`
  boolean (off by default) to the Banner and Notification sets, bound to
  `✏️ Title` in a new `text` frame (space-xs) above the description in all
  12 horizontal variants; set descriptions updated, checked with temporary
  instances (removed). Repo docs, JSDoc, story descriptions and a horizontal
  title example in both stories followed; banner and notification baselines
  re-taken.

## 2026-10-18 — Text input fixes (Text Input family session)
**Asked:** make Text Area match Text Input (in Figma too, and say if a better standard exists); Search Input grows as you type.

- Search: reproduced in the docs demo, whose canvas sizes to its content:
  233.5 → 261.5px when the clear button appeared. The button now stays in
  the layout with `visibility: hidden` while empty. Story fixture and test
  for a content-sized field.
- Text Area disabled now uses Text Input's tokens (label `text-subtle`,
  `border-subtle` for every status). In Figma, rebound the four disabled
  Text Area variants (166:5125, 166:5254, 166:5534, 166:5814): Label fill
  and user-input stroke; checked a screenshot. Test added.
**Verified:** lint:css, typecheck, `npm test` 221 passed, build; changed
baselines looked at.
- Follow-up (Godwin): the toast's time on screen is now a token. Created
  `duration/toast-visible` (TIMING, 5s, ALL_SCOPES like `duration/spin`;
  setting scopes on a TIMING variable throws) in Figma's Motion collection,
  synced it with the drift check and `--apply` (checksum 613 / 5e42e07e in
  both), and the Toaster's default duration now reads
  `--duration-toast-visible` (a test retunes it with CSS alone).
- Numeric Input Field disabled label now `text-subtle` in code and in Figma
  (12 disabled variants of 168:5383 rebound, checked on a temporary
  instance that was then removed). Verified: lint:css, typecheck,
  `npm test` 223 passed, build; Numeric baselines re-taken and looked at.

## 2026-10-19 — Breadcrumb (breadcrumb session)
**Asked:** build Breadcrumb from the Figma Breadcrumbs page, router-agnostic links, decide the overflow behaviour.

- Read both sets with three `use_figma` scripts: descriptions and
  properties, the five `_Breadcrumb Base` variants (every child's bindings
  and text styles), the six `Breadcrumb` variants (instance properties,
  separators) plus the CaretRight SVG. Overflow is a "…" text, so no
  DotsThree export.
- Built `src/components/breadcrumb/` (component, CSS, story), CaretRightIcon,
  exports; `tests/breadcrumb.spec.ts` (5). Decisions in INTERFACE.md
  §Breadcrumb, map row in CLAUDE.md.
- Session hit the usage limit mid-build (handover note in the side-session
  notes folder) and resumed the next day.
- Dead ends: the story's icon example first used CaretRight, which read as
  a separator; swapped to a house and a user icon, but `--update-snapshots`
  kept the old PNG (under the diff threshold). The docs props test failed on
  a reused server's stale props. Both in LEARNINGS.md §Tooling.
**Verified:** lint:css, typecheck, `npm test` 233 passed (after `npm run
props`), build; baselines looked at in both themes.

## 2026-10-18/19 — Progress-bar and Progress-wizard (progress session)
**Asked:** build Progress-bar and Progress-wizard from the Figma Progress indicators page (180:6577).

- Read the four sets (Progress-bar, Progress-wizard, `_progress-wizard-item`,
  `_progress-icon`) with six read-only `use_figma` scripts on the second
  connector: descriptions and properties, then every variant's tree with
  bindings. The bar's full dump passed the 20 KB limit, so later scripts
  printed only the lines that differ from a base variant.
- Usage limit hit after the Figma read; findings and the planned API went to
  `progress.md` in the side-session notes folder, and the build resumed from
  it the next day.
- Built `src/components/progress-bar/` and `src/components/progress-wizard/`
  (components, CSS, stories), exports, `tests/progress-bar.spec.ts` (6) and
  `tests/progress-wizard.spec.ts` (5). Decisions in INTERFACE.md §Progress,
  map row in CLAUDE.md.
- Dead end: steps first used `flex: 0 1 step-width` and came out about 120px
  wide in the story (LEARNINGS, CSS); switched to a width.
- axe flagged the disabled wizard steps' `text-minimal` text (12 nodes);
  excluded like disabled field text, with the reason in `tests/a11y.spec.ts`.

## 2026-10-18/19 — Accordion (accordion session)
**Asked:** build Accordion from the Figma Accordion page (1458:27759) on native `<details>`.

- Read the set (1460:28041) with four read-only `use_figma` scripts: the first
  full dump passed the 20 KB limit, then the description and properties, then
  compact per-line binding trees for the 12 default and 12 flush variants plus
  the caret's inner stroke per variant.
- Usage limit hit after the Figma read; findings and the plan went to
  `accordion.md` in the side-session notes, and the build resumed from it the
  next day.
- Built `src/components/accordion/` (component, CSS, story), the export and
  `tests/accordion.spec.ts` (11). Checked in the browser that the height
  animates both ways (136px open at md, as in Figma). Decisions in
  INTERFACE.md §Accordion, map row in CLAUDE.md.
- Dead ends: `getByRole('button')` found no summary (LEARNINGS, Tooling);
  switched to CDP. axe flagged the disabled open content (`text-minimal`);
  excluded like disabled field text in `tests/a11y.spec.ts`.

## 2026-10-19 — List item (list session)
**Asked:** build List item from the Figma Lists page (82:6945).

- Read the one set, `List` (375:6454), with five read-only `use_figma`
  scripts: description and properties, then binding trees grouped by node
  path for the 12 default and 12 flush variants (the first dump of all 24
  passed the 20 KB limit), then the fixed heights and a screenshot.
- Found Figma fixes 1 and 2 line rows at 40 and 64 with no variable; chose
  `space-sm` padding (40 and 62) and raised the 2px with Godwin on the tracker.
- Built `src/components/list/` (ListItem, CSS, story), the export and
  `tests/list.spec.ts` (10). Decisions in INTERFACE.md §List item, map row in
  CLAUDE.md.
- Fixed in the browser: a focused row's ring was cut off by the next row's
  fill; the focused row is now `position: relative`.
- Dead end: tested a disabled link row with `tabIndex === -1`; Chromium
  reports 0 for an `<a>` without href though it cannot take focus (LEARNINGS).

## 2026-10-19 — Progress-wizard: fill and long titles (progress session)
**Asked:** steps of fixed width or filling the container, and whether a label squeezing the inline connector is normal; then build both, in Figma where needed.

- Answer: yes, the line takes what the title leaves (Figma, Ant, MUI), but a
  title past the line's minimum overflowed into the next step.
- Code: `fill` prop (equal steps across the container) and ellipsis
  truncation for inline connector titles; story rows, two specs, wizard
  baselines re-taken on purpose and looked at.
- Figma (one `use_figma` write): ending truncation and one line on the six
  inline connector titles (no visual change while they hug), and code
  pointers in the Progress-wizard and `_progress-wizard-item` descriptions.
- Slip caught by the test: the stories said the line's minimum was 32px;
  `space-xl` is 24.

## 2026-10-19 — Empty State (empty-state session)
**Asked:** build Empty State from the Figma Empty State page (82:6947).

- One read-only `use_figma` dump of both sets on the page, `Empty-state`
  and `_empty-illustration`: description, properties and binding trees of
  every variant, hidden actions included; a second call exported the
  Package icon SVG.
- Found the placeholder icon bound to primitives `unit/40` / `unit/64`, with
  no CSS token to reach. Built everything else, asked; Godwin chose no
  default illustration. Removed the drafted disc CSS and the PackageIcon
  export; the story draws the placeholder as project code.
- Built `src/components/empty-state/` (EmptyState, CSS, story), the export
  and `tests/empty-state.spec.ts` (6, including the docs "focused" control
  following `actions`). Decisions in INTERFACE.md §Empty State, map row in
  CLAUDE.md.
- Slip caught by the test: assumed title-lg was 20px; `size/xl` is 22.
- Figma (one `use_figma` write, after merge): a "Code:" line in the
  `Empty-state` and `_empty-illustration` descriptions saying Bland ships no
  default illustration, pointing to the component map.

## 2026-10-19 — Table (table session)
**Asked:** build Table from the Figma Table page (53:10005), composable on a
native `<table>`, with selection, sorting and horizontal overflow.

- Three read-only `use_figma` dumps: `_table-cell` (60 variants),
  `_table-header` (45) and `Table-row` (12), descriptions, properties and
  deduped binding trees of every variant, inner frames and hidden
  slots/focus rings included. The first Table-row dump exceeded 20 KB;
  re-ran it compact (top-level children only). One more call exported
  ArrowUp, ArrowDown, ArrowsDownUp and DotsThree.
- Found: dividers are inside strokes (cells stroke-xs, header stroke-sm);
  control columns are table/sm-lg squares; expand and option hold ghost Icon
  Buttons (sm, md in lg); the sort icon's fill is unbound; the header's
  selected variant pairs with a checked select all.
- Built `src/components/table/` (eight parts, CSS, story), the four icons,
  the exports and `tests/table.spec.ts` (11). Decisions in INTERFACE.md
  §Table, map row in CLAUDE.md, axe exclusion for disabled cells.
- Fixed in the browser: rows measured 32.5 / 33 with border dividers;
  switched to inset shadows (LEARNINGS). Verified `max-width: 0` gives
  ellipsis plus sideways scroll at 128px minimum columns.
- Dead end: a static test page under the scratchpad could not be scripted
  in the browser pane (local file); tested in the docs server instead.


## 2026-10-19 — Tooltip (tooltip session)
**Asked:** build Tooltip from the Figma Tooltip page (180:6572), the first
component on React Aria and Floating UI, and write the pattern down for the
overlays that follow.

- Read CLAUDE.md, INTERFACE.md, docs/components.md, docs/motion.md,
  LEARNINGS (Figma, CSS, tooling, parallel sessions) and Button's files.
- Figma, four read-only `use_figma` calls: the first full dump of both sets
  exceeded 20 KB, so: sets, properties and descriptions; the top and
  bottom variants plus the four pointers with bindings; the left and right
  variants' layout plus the pointer's vector; the pointer exported as SVG.
  Found: content padding space-sm / space-md, gap space-xs, rad-md, fill
  Tooltip/surface, body-md Tooltip/text, max width bound to
  tooltip/max-width (256; the set description says 264), Elevation/neutral/near
  on the whole frame, pointer inset space-md, pointer a 16 x 14 triangle
  clipped to 16 x 12 with rad-xs corners.
- Dependencies: react-aria 3.52.1, react-stately 3.50.0 (its pair) and
  @floating-ui/react-dom 2.1.9, exact; 3.53 and 3.51 were under two weeks
  old. `npm run audit` clean. First build bundled React Aria (117 KB);
  made them external in vite.config.ts (62 KB).
- Built `src/components/tooltip/` (Tooltip.tsx, tooltip.css, story),
  `tests/tooltip.spec.ts` (7), the export and baselines. Pattern written in
  docs/components.md ("Behaviour") and INTERFACE.md §Tooltip.
- Fixed along the way: open tooltips below the first viewport were hidden
  in the full-page screenshot (`hide()` measured against the viewport; now
  `rootBoundary: 'document'`), and the story's bottom placements flipped
  for the same reason (moved to top). Hover-opened tooltips were marked
  instant because `useFocusVisible` had not seen the pointer move; now
  "from the keyboard" is the trigger matching `:focus-visible`. Playwright's
  one-step hover was ignored by React Aria; the spec moves the mouse first.
- Gates: lint:css, test:lint, typecheck, npm test (325), audit, build.

## 2026-10-19 — Table colors from Figma (table session)
**Asked:** Godwin changed the six `Table/*` surface colors in Figma; use them.

- Drift check (`npm run tokens:drift`, one read-only `use_figma`): the six
  Table variables changed (dark: cells Neutral900 / hover 800, header 800 /
  hover 700, selected Brand900; light: cell selected Brand100), and the
  collections changed too: Typography is now `_Typography`, hidden, which
  the build would treat as primitives and drop 28 CSS tokens
  (`--font-*`, `--line-height-*`, `--letter-spacing-normal`, used directly
  by 21 component files).
- Asked Godwin: Table colors only for now; the Typography rename stays an
  open question on the tracker.
- Applied only the six records: set `metaChanged` false in the saved
  result so `--apply` kept the repo's collection metadata, then
  `npm run tokens` (518 tokens, only the six Table values moved). The
  checksum will not match Figma's until the Typography question is
  settled, because Figma's collection metadata differs.
- Confirmed the Table sets still bind the same six variables;
  re-baselined the Table screenshots on purpose and looked at them.
- Follow-up (Godwin): the story's lists now space rows `space-xs` apart, since
  filled rows ran together in dark mode; list baselines re-taken.

## 2026-10-19 — Tooltip fixes from Godwin's review (tooltip session)
**Asked:** variants closed until hover; tooltips stuck to the top after
scrolling; too slow to open; a Motion variable for the delay and an offset
variable if standard; use 256 and fix the Figma description.

- Figma (one write): `duration/tooltip-delay` 0.5s and
  `duration/tooltip-close-delay` 0.1s in Motion (descriptions in the
  `toast-visible` style: time, not motion), `tooltip/offset` in Sizing
  (alias `unit/4`, scope GAP), and the Tooltip set description now says 256
  plus a "Code:" pointer.
- Sync: drift check (three added), `--apply`, `npm run tokens`, checksum
  616 / `e8f5443` equal in Figma and locally. The check also reported
  `Typography` renamed to `_Typography` and hidden in Figma; not taken
  (it would drop the font tokens), asked Godwin. Saved the result without
  the collection change, since the checksum covers variables only.
- Sticking: `shift()` keeps a tooltip on screen along its alignment axis,
  which for left and right placements is vertical, so after scrolling it sat
  pinned at the top. Fixed with `limitShift()`; `hide()` back to its default
  boundary (the screenshot reason for `rootBoundary: 'document'` is gone now
  that variants are closed). New spec scrolls a right tooltip's trigger away.
- Slow: delays now 500 / 100 from the tokens (React Aria's 1500 / 500 were
  the defaults). The tooltip now takes the pointer, so it stays open while
  hovered (WCAG 1.4.13).
- Story: every variant closed; the demo stays held open. Visual coverage
  moved to `tests/tooltip.spec.ts`: four tooltips opened by focus,
  screenshotted in both themes. 12 tooltip specs.

## 2026-10-19 — Tooltip: zoom, closed demo, tight variants (tooltip session)
**Asked:** the docs zoom moves the tooltip off its trigger; the demo says
"hover or focus me" but is always open; too much space in Variants.

- Probed the docs page in Playwright at 150%: trigger rect 301 wide (screen
  px), tooltip `offsetWidth` 85 (unzoomed), `left` 329 drawn at 494. Fixed
  with a zoom-aware `platform`, zoomed token distances and unzoomed
  render positions. Position and gap then matched, but the pointer did not:
  `arrow()` reads `clientWidth`. Replaced it with `aimPointer`, a middleware
  working from the rects; then matched Floating UI's shrinking inset (and
  its 1px edge, zoomed) for short side tooltips. Checked at 100, 150, 300%.
- Demo: `open` unticked by default and left out (not `false`) when
  unticked, so hover and focus open it. Variants: one `pg-row` per side, no
  fixed cells; open tooltips may cover neighbours (Godwin is fine with it).
- New spec: frame at `zoom: 1.5`, top and right-end tooltips on their
  triggers with the gap zoomed. 13 tooltip specs; tooltip screenshots
  re-baselined.

## 2026-10-19 — Menu and Dropdown (menu session)
**Asked:** build Dropdown and Menu.

- Read `docs/components.md`, INTERFACE (Tooltip pattern), LEARNINGS (Figma,
  CSS), the Text Input, Search Input, Chip, Checkbox and ScrollArea code.
- Figma, five read-only `use_figma` calls on the second official connector:
  page and set list with descriptions and properties; `_menu-item` (rest per
  size in full, every state's fills); `Menu` (all three sizes, items as
  instances, the divider's position); `_dropdown-trigger` (sm rest in full,
  every sm state and status); the field colors per state, icon colors and
  the `Dropdown` compositions (menu size and offset per variant). A shared
  dump helper kept each call under 20 KB.
- Found: every Dropdown opens a Menu md; the menu sits 4 under the trigger;
  the trigger's disabled label is `text-minimal` (Text Input's was rebound
  to `text-subtle`); Figma's Menu fade instance is md while the token says
  sm; no token for a menu's max height. Asked Godwin all four: fit screen
  space, md, match Text Input, sm.
- Mid-task, a Tooltip session landed a zoom-aware Floating UI platform on
  main; the shared helpers move to `src/components/overlay/` so Tooltip,
  Menu and Dropdown use one copy.
- Built `overlay/floating.ts` (Tooltip now imports it), `overlay/Popover.tsx`
  and `popover.css`, `menu/items.tsx` (item model and row), `Menu.tsx`,
  `menu.css`, `dropdown/Dropdown.tsx` (`useSelect` for basic and
  multi-select, `useComboBox` for filterable) and `dropdown.css`; stories
  with a static panel of every row state; `tests/menu.spec.ts` (10) and
  `tests/dropdown.spec.ts` (8), with open-menu screenshots in both themes.
- Dead ends, each now in LEARNINGS: the trigger lost its Button style
  (`useButton`'s `type`); a menu near the bottom never flipped (`size` cap
  fed back into `flip`); excluding the trigger from outside presses stopped
  it toggling shut; filterable did not filter (`items` vs `defaultItems`);
  every mouse press counted as keyboard (`:focus-visible` after script
  focus). The forced Focused row had no ring until the field took
  `bland-focus-ring`.
- Checks: lint:css, typecheck, build, `npm test` 359 passed. New
  baselines: menu and dropdown stories, 2 menu-open and 6 dropdown-open
  screenshots, all looked at.
- Left for later: Breadcrumb's overflow crumb and Table's option cell can
  now open a Menu; Figma's trigger disabled label and Menu fade instance
  need rebinding (text-subtle, fade sm).

## Breadcrumb overflow and Table option cell open a Menu (2026-10-19, side session)
- Read INTERFACE "Breadcrumb", "Table", "Menu and Dropdown" and `Menu.tsx`.
  Menu has no link items, so the open question was how a menu choice
  navigates through `renderLink`. Chose to render the hidden crumbs' links
  in a `hidden` span and click the matching one from `onAction`: one API
  for plain links and routers, no new `onNavigate` prop.
- Breadcrumb: dropped the expanded state and focus effect; the overflow
  `<button>` is now Menu's trigger (items: label, icon as leading). API
  unchanged (`maxItems`, `overflowLabel`).
- Table: `TableOptionCell` gained `items`, `onAction`, `menuPlacement`
  (default bottom-end); the DotsThree button or `children` becomes the
  Menu trigger; a disabled row disables it. Stories: row actions on the
  expandable tables and the demo's option column.
- Specs: breadcrumb (menu opens from Enter, focus to the first item,
  Escape returns; a choice clicks the hidden link with its href), table
  (option menu named by its button, bottom-end aligned, action runs, focus
  returns). Only the Table story label grew a line: re-baselined
  table-light/dark (looked at the diff: only the shift). Breadcrumb stayed
  within tolerance.
- Checks: lint:css, typecheck, `npm test` 361 passed.

## 2026-10-19 — Modal (modal session)
**Asked:** build Modal.

- Read `docs/components.md`, INTERFACE (Tooltip, Menu and Dropdown),
  LEARNINGS (Figma, CSS, parallel sessions), `overlay/Popover.tsx`, Menu,
  Message (Banner's close), ScrollArea, Table's overflow focus.
- Figma, three read-only `use_figma` calls on the second official connector:
  the Modals page's sets with descriptions and properties; every part's
  tree and bindings (Modal sm/md, `_modal-title`, `_modal-body` left/center,
  action bar right 2, fill 2, vertical 2); a search for any backdrop
  variable (none), the center text alignment and the dividers' placement.
- Asked Godwin: backdrop (no token) → add `Modal/backdrop` in Figma; narrow
  screens → actions stack by themselves below breakpoint/sm.
- Built `modal/Modal.tsx` (native `<dialog>` + `showModal()`, React Aria
  `useOverlayTriggerState`, `useOverlayTrigger`, `useButton`,
  `usePreventScroll`, `useFocusVisible`; internal `ModalContent` for the
  inside), `modal.css`, `modal.stories.tsx` (static panels of every
  variant, four real modals), `tests/modal.spec.ts` (11 tests).
- Dead ends, each now in LEARNINGS: every closed Modal pulled focus to its
  trigger on mount (focus now moves only after a real open); `autoFocus`
  failed in the hidden dialog (content mounts after `showModal()`); a quick
  reopen after Escape shut again (queued `close` event); specs measured the
  scaling entrance. React Aria sets no `aria-haspopup` for dialogs; kept.
  axe flagged the static long body (scrollable region): the body's viewport
  is a Tab stop while it overflows, with an inset ring.
- Checks: lint:css, typecheck, `npm test` (modal specs 5x repeated clean).
  New baselines: modal-light/dark, modal-open-light/dark, looked at.
- Left: `Modal/backdrop` in Figma, then sync and re-baseline
  modal-open-*.png; nothing committed (other sessions' Menu/Dropdown work
  is uncommitted in the same tree).

## 2026-10-19 — Modal backdrop tokens (modal session)
**Asked:** add the Modal backdrop in Figma, three transparency steps
(minimal, subtle, bold), and wire it in code.

- Read Theme conventions in Figma (Modal/surface scopes, Shadow aliases,
  the Neutral alphas: black at 6, 10, 24, 40%). Created
  `Neutral/Alpha/a60` (_Core Colors, no scopes) and Theme
  `Modal/backdrop-minimal`, `-subtle`, `-bold` (FRAME_FILL, SHAPE_FILL):
  a10/a24/a40 light, a24/a40/a60 dark. Descriptions first written with
  quotes came back escaped; reworded without them.
- Sync: instead of retyping the 17 KB check.js, Figma returned the four
  new records and one combined hash of the other 616, which matched the
  repo's; wrote result-0.json with `metaChanged: false` (the Typography
  rename stays out, as before), `tokens:drift` reported exactly 4 added
  and 3 CSS tokens, applied, `npm run tokens`. The checksum differs from
  Figma's for the known Typography metadata only.
- Code: `backdrop` prop (default subtle) → `data-backdrop` → `--_backdrop`
  → `::backdrop`. Story alert uses bold; new spec checks the painted
  colors. Re-baselined modal-open-* and modal-light/dark, looked at.
- Figma Modal set description: one pointer line. Rewriting it doubled the
  old `&quot;` entities (LEARNINGS); rewrote it whole with plain quotes.
- Checks: lint:css, typecheck, build, `npm test` 378 passed.
- Godwin saw the Modal title too big in the playground: the docs'
  `.docs-section h2` rule beat `.bland-modal__title`. Scoped it to
  `.docs-section > h2` (playground/docs/docs.css); the title computes to
  body-lg-bold 16/24 in the demo now.
- Godwin then chose title-md for the title (Figma binds body-lg-bold);
  changed `.bland-modal__title`, re-baselined the four Modal screenshots,
  looked at them. Figma's `_modal-title` still says body-lg-bold.
- Godwin rebound `_modal-title` in Figma: title text Title/title-md and
  top padding space-lg (16). Read both back with a read-only `use_figma`;
  the title row is now `space-lg space-lg space-sm`.

## 2026-10-19 — Tabs: Section tab, Pill tab, File tab, Segmented bar, Tab bar
**Asked:** build the five tab components.

- Figma, read only: listed the sets on the five pages (descriptions and
  properties), then dumped every item variant's bindings (hidden icon and
  focus-ring frames included) and one row per set, in seven `use_figma`
  calls on the plugin connector. Found File tab fills disagreeing (full
  unselected 300/400, Minimized and the description 200/300).
- Asked Godwin: File tab fill (first question unclear to him; reasked in
  plain words) → darker 300/400; overflow → scroll sideways, not a
  DotsThree menu.
- Built internal `tabs/` (React Aria tab list, panels), then SectionTabs,
  PillTabs (pills.css selected rule now also reads aria-selected),
  FileTabs, SegmentedBar (native radios, or tabs with panels), TabBar.
- Dead end: the File tab close button inside the tablist; settled on a
  presentational item holding the tab and a pointer-only close, with
  Delete for keyboards (INTERFACE.md).
- Restarted the docs server (one from 15:09 held 5180 and predated the new
  folders). Checked every story in the browser pane, both themes; moved
  the scroll thumb under the tabs after it covered a Section underline.
- Specs: section-tab (5), pill-tab (2), file-tab (5), segmented-bar (4),
  tab-bar (2). Fixed on the way: stale tab panel id (axe), a stray space in
  the Tab bar's indicator name, mid-transition color reads, a radio laid
  over its label text (all in LEARNINGS).
- Baselines for the five stories, looked at.
- Figma: rebound the six Minimized unselected `_file-tab-item` fills to
  surface-300 / 400 and rewrote its description; added a code overflow
  pointer to the Section-tab and Pill-tab descriptions.
- Godwin's review (same day): no scrollbar under tab rows (fade only), the
  selection slides between tabs, no gap between the Section underline and
  divider, Segmented items rad-md (his Figma change), no padding around
  the File tab bar, Tab bar selects on press. Re-read Figma: Section row 48
  with the underline at 46 to 48 over the divider at 47, items and focus
  rings rad-md. Both gaps were one bug: negative margins collapsing through
  the row (LEARNINGS). Added ScrollArea `scrollbar`, `TabScroll` (wheel
  scrolls sideways), `useSelectionIndicator`; TabBar `defaultCurrent` and
  `onCurrentChange`. Dead ends on the indicator: measured from the thumb
  (ref not attached yet), observing itself (slide cut short), rounded
  offsets; and the radio's square focus ring (`--bland-radius` does not
  inherit). Specs updated and extended, the five baselines re-taken and
  looked at.
- Godwin, after trying it: Pill tabs should not slide. Removed the Pill
  tab indicator (the selected pill keeps its own fill, as before); Section
  and Segmented still slide. Pill spec and baselines updated.

## Pagination and Pagination-table (2026-10-19)

- Read `docs/components.md`, `INTERFACE.md` conventions and the Tabs section,
  LEARNINGS (Figma, parallel sessions). Tabs work from another session was
  uncommitted in the tree; left it alone.
- Figma, four read-only `use_figma` calls on the second official connector:
  the page's three sets with descriptions and properties, `_pagination-item`
  bindings (18 variants), `Pagination-simple` and `Pagination-table` bindings,
  and the CaretLeft SVG plus the disabled caret's color (icon-minimal).
- Found: the advanced page field is Text Input sm at every size; the overflow
  item is just a DotsThree item; Figma's sm example is the seven slot window.
- Built `pagination/` (Pagination, `pageSlots`) and `pagination-table/`
  (PaginationTable with a React Aria NumberField page field over TextInput),
  CaretLeft icon, stories, two specs. Decided: automatic overflow with seven
  fixed slots, a static overflow mark, aria-disabled ends, buttons or links.
- Port 5180 was held by another session's docs server (same folder), so
  previewed through it instead of starting one.
- Specs first failed on `name: 'Page 1'` also matching "Page 10" (fixed with
  `exact`). `npm run test:update -- -g pagination` wrote four baselines;
  looked at them. lint:css, typecheck and `npm test` (445) pass.
- Not committed (the tree also holds the Tabs session's uncommitted work).


## Slider (2026-10-19)

- Read `docs/components.md`, INTERFACE (foundations, Tooltip), LEARNINGS
  (Figma, tooling, parallel sessions). Tabs and Pagination work from other
  sessions was uncommitted in the tree; left it alone.
- Figma, three read-only `use_figma` calls: the page's sets (Slider,
  `_knob`, `_slider-labels`) with descriptions and properties; bindings of
  md single/double/disabled and lg; `_knob` variants and sm. Found the
  bars' space-2xs gap to the thumb, the dot sizes, the field as Text Input
  sm (md on lg).
- Asked Godwin three things (tooltip, range field, label placement); all
  three took the recommended option (INTERFACE).
- Built `slider/` (React Aria state and hooks, Tooltip per thumb,
  NumberField fields over TextInput), story, spec; one line in Tooltip for
  `:has(:focus-visible)`.
- Port 5180 was held by another chat's docs server (same folder);
  `preview_start` failed on it, so checked through Playwright screenshots
  against that server instead.
- Dead end: Escape hid the tooltip only without a preceding Page Up;
  React Aria's document listener (LEARNINGS). Specs first asserted
  `aria-valuenow` (LEARNINGS). Range story with fields got labels 3:
  five crowded the 128px track.
- Baselines: slider light/dark and two tooltip shots, looked at.
  lint:css, typecheck, `npm test` (461) pass.


## Calendar and Date and Time pickers (2026-10-19)

- Read `docs/components.md`, LEARNINGS (Figma, TypeScript and React),
  INTERFACE (Slider, Popover pattern), Dropdown, Popover, Text Input code.
- Figma, five read-only `use_figma` calls: the page's seven sets with
  descriptions and properties; `_calendar-item` bindings; the Calendar tree
  (sm, lg range, md, month and year views, action bar sizes, title bar);
  picker layouts; today-bar geometry. One more to export CalendarBlank and
  Clock. Screenshots of all four sets.
- Asked Godwin three questions; he chose ISO strings (and asked about AM/PM
  and dd-mm-yyyy: both covered by `hourCycle` and `locale`), segmented
  fields and a field-only Time Picker.
- Added `@internationalized/date` 3.12.4 (already installed through React
  Aria) as a direct dependency, external in Vite.
- Built `calendar/` (Calendar, internal SingleCalendar / RangeCalendar for
  the pickers, `dates.ts`), `date-field/` (internal segmented Text Input),
  `date-picker/`, `date-range-picker/`, `time-picker/`, two icons, stories,
  four specs. Text Input CSS reads `data-disabled`; a11y spec exempts
  disabled date fields like other disabled fields.
- Dead ends: the Date Picker story crashed with "Too many re-renders"
  (controlled value parsed every render; LEARNINGS). A `defaultOpen` picker
  never got focus, so the next press anywhere was swallowed: Popover now
  shows from its own ref (LEARNINGS). React Aria's dialog props have no
  role; added `role="dialog"`. Picking a year jumped to January; it keeps
  the month now. Segments first had space-2xs padding, too airy next to
  Figma's dd/mm/yyyy. The open-calendar variants moved to the top of their
  stories: at the bottom the screenshot viewport flipped them upward.
- The docs server needed a restart to list new story files.
- Baselines for calendar, date-picker, date-range-picker, time-picker (light
  and dark), looked at. lint:css, typecheck, `npm test` (499) pass.
- Not committed.
- Figma (Godwin's yes): wrote the seven Date & Time set descriptions fresh
  with an "In code (2026-10-19)" pointer to INTERFACE.md, one `use_figma`
  call. Calendar, Single Date picker and Time picker held `&amp;quot;`
  from an earlier round-trip; the fresh text has plain quotes again.

## File Upload (2026-10-19)

- Read `docs/components.md`, INTERFACE (conventions, Progress-bar),
  LEARNINGS (Figma, parallel sessions).
- Figma, three read-only `use_figma` calls on the second official
  connector: the page's sets with descriptions and properties; every
  variant's tree with bindings (the first dump was cut at 19 KB, so a
  second one read the success and danger rows, icon colors inside
  instances, and File-upload itself); row strokes per status and the
  CloudArrowUp and FileArrowUp SVGs. One more for screenshots to compare.
- Built `file-upload/` (FileUpload.tsx, file-upload.css, story), two icons,
  export in `src/index.ts`, `tests/file-upload.spec.ts` (8 tests).
- First draft let the instruction wrap by itself; Figma breaks after "or",
  so the default does too.
- Drag-over in the story: a real `dragenter` with a `DataTransfer` on mount
  (LEARNINGS). The drag-over spec first read the border mid-transition;
  polls now (LEARNINGS).
- Baselines for file-upload light and dark only (`-g file-upload
  --update-snapshots`, so other sessions' baselines stay as they are),
  looked at in both themes. lint:css, typecheck, `npm test` (512) pass.
- Not committed (other sessions' Date, Tabs, Pagination and Slider work is
  uncommitted in the same tree). Figma descriptions not touched.

## Code snippet and Code text (2026-10-19)

- Read `docs/components.md`, INTERFACE (foundations, conventions),
  LEARNINGS (Figma, parallel sessions, Claude Docs, Browser pane), the
  FileTabs, SectionTabs, PillTabs, Menu, ScrollArea and Table code.
- Figma, three read-only `use_figma` calls on the second official
  connector: the page's three sets (Code-text, `_code-action-bar`,
  Code-snippet) with descriptions, properties and bindings (the first dump
  was cut at 19 KB, so the second read Code-snippet alone, without nested
  instances); gutter stroke sides, the action bar divider, toggle icons and
  the Copy SVG. One more to export Eye and EyeClosed. One screenshot.
- Found Code-text on the page (not in the map). Asked Godwin four
  questions: bring-your-own highlighter, files x languages, fullscreen as a
  layout variant, ship Code text too. All four as recommended.
- Built `code-snippet/` (CodeSnippet.tsx, CodeText.tsx, shared `copy.tsx`,
  two CSS files, one story), three icons, exports, `tests/code-snippet.spec.ts`
  (9 tests). The story has a small regex highlighter emitting `data-token`
  spans so the Code colors show.
- Dead ends: `onCopy` clashed with the native prop (renamed `onCopied`,
  LEARNINGS). The nested horizontal ScrollArea drew a vertical thumb: fixed
  `scroll-area.css` to child combinators (LEARNINGS; whole suite still
  passes). A single `language` without `languages` showed nothing; it is a
  label now. In the spec, `mouse.move(0, 0)` did not reset the copied
  state; hovering another element does.
- Docs server: another session's server on 5180 picked the new story up
  after `npm run props`, no restart needed.
- Baselines for code-snippet light and dark only (`-g code-snippet
  --update-snapshots`), looked at in both themes. lint:css, typecheck,
  `npm test` (526) pass.
- Figma: Code-snippet's description holds `pre &amp;amp;gt; code`
  (double escaped). Not touched; descriptions not updated.
- Not committed (other sessions' work is uncommitted in the same tree).

## Sidebar (2026-10-19)

**Asked:** "now let's do Sidebar".

- Read `docs/components.md`, INTERFACE (conventions, List, Tabs), LEARNINGS
  (Figma, parallel sessions, Claude Docs, Browser pane), TabBar and
  ScrollArea code.
- Figma, five read-only `use_figma` calls on the second official
  connector: the page's sets with descriptions and properties; every
  `_sidebar-item` variant's bindings (base in full, the rest as diffs);
  the group and the Sidebar variants (full, rail, hover); the example
  slots and the collapse frame with a page screenshot; the SidebarSimple SVG.
- Found the conflict in Figma's Sidebar description (rail tooltips and
  menus vs the hover peek). Asked Godwin three questions: rail behaviour,
  data rows vs parts, mobile. Hover peek, data rows, leave mobile to the app.
- Built `sidebar/` (Sidebar.tsx, sidebar.css, story), SidebarSimple icon,
  export, `tests/sidebar.spec.ts` (10 tests).
- Dead end: the rail hid the count with `display: none`, which dropped it
  from the link's name ("Inbox" vs "Inbox 8"); it is visually hidden now.
- Docs server: another session holds 5180, so `.claude/launch.json` got a
  `docs-5181` entry (it landed on 5182); Playwright reused the 5180 server.
- Baselines for sidebar light and dark only, looked at in both themes;
  moved the Focused example into a row with a top slot (it stretched and
  the collapse button sat on the first row). lint:css, typecheck,
  `npm test` (541) pass.
- Figma: the Sidebar description's `aria-current` quote is escaped five
  times (`&amp;amp;amp;amp;amp;quot;`). Not touched; descriptions not updated.
- Not committed (other sessions' work is uncommitted in the same tree).


## Messaging: Chat bubble and Chat list item (2026-10-20)

**Asked:** "now let's do Messaging: Chat-bubble and Chat-list-item".

- Read `docs/components.md`, INTERFACE (conventions, List item), LEARNINGS
  (Figma, tracker), ListItem, its story and spec, the Messaging tokens.
- Figma, five read-only `use_figma` calls on the second official
  connector: the page's sets (Chat-list-item, `_message-sent-indicator`,
  Chat-navbar, Chat-message-bar, Chat-bubble, `_chat-bubble-tail`);
  bindings of Chat-list-item, the indicator and the tail; receiver bubbles
  in full; sender bubbles, icon colors and the tail paths; the Checks,
  Play, Pause and File SVGs. Dead end: one dump sliced emoji text and the
  reply failed as invalid JSON (LEARNINGS).
- Built `chat-bubble/`, `chat-list-item/`, internal
  `message-sent-indicator/`, four icons, exports, stories and specs (9 +
  6 tests). Photo asset `playground/assets/chat-photo.svg` for the media
  stories.
- Fixes on the way: `--bland-radius` set on the root did nothing (it does
  not inherit; set per part); a Figma render showed the file separator is a
  vertical tick, not a dash; the brand focus ring vanished on the sender
  bubble, now white through a local `--border-focused`.
- Decided without asking (raised on the tracker): audio is controlled (the
  project owns `<audio>`), typing dots static, `unread` off by default, no
  look for the open chat, separator space-sm tall.
- Docs server on 5180 was this checkout's own, reused. Baselines for both
  stories in both themes, looked at. lint:css, typecheck, build, `npm test`
  (566) pass.
- Figma: Chat-bubble's description has escaped quotes
  (`&amp;amp;amp;quot;`); not touched. Chat-navbar and Chat-message-bar
  not built. Not committed.

## Messaging: Chat navbar and Chat message bar (2026-10-20)

**Asked:** "Do this task here: Build Chat navbar and Chat message bar"
(the follow-up card from the bubble task).

- Figma, four read-only `use_figma` calls: Chat-navbar's tree and
  bindings plus the message bar's variant ids; three message bar variants
  (replying rest, filled, recording) in full; icon colors in all three
  plus the navbar; nine icon SVGs (Phone, VideoCamera, ArrowBendUpLeft,
  Smiley, Sticker, PlusCircle, Microphone, PaperPlaneRight, Trash).
- Built `chat-navbar/` and `chat-message-bar/` (TSX, CSS, stories),
  exports, nine icons, `tests/chat-navbar.spec.ts` (4) and
  `tests/chat-message-bar.spec.ts` (6).
- Dead ends: `:is()` with `::placeholder` inside is invalid, split out;
  the docs server had cached the stories glob and props.json (LEARNINGS).
- Baselines for both stories in both themes, looked at. lint:css,
  typecheck, build, `npm test` (586) pass.
- Not committed (the bubble and list work is uncommitted too).


## Calendar: title bar redesign, dividers, height motion (2026-10-20)

- Godwin asked for three things: animate the calendar's height changes,
  the new `👀 Divider` on `_calendar-title-bar` and `_calendar-action-bar`
  (hidden by default), and the redesigned title bar.
- Figma, one read-only `use_figma`: both sets' properties and bindings.
  Found the toggle's new fill bound to a new variable,
  "Date/Calender-title-bar/surface", with no description, and the List
  icon in place of the caret.
- Drift check: one variable added; the result also carried the known
  `_Typography` meta change, so saved it with `metaChanged` false
  (LEARNINGS). Asked Godwin about the misspelling; he chose to rename it in
  Figma. Renamed it and added a description (one `use_figma` write), applied
  the drift, `npm run tokens`, checksum 621 / 7416e30a in both.
- Exported the List icon. Calendar: new title bar CSS, `titleDivider` and
  `actionsDivider`, a measured views area with a height transition
  (instant from the keyboard). First pass ran Prettier over Calendar.tsx and
  reformatted the whole file; restored it and re-applied the edits by hand.
- Spec: the height eases from a click and jumps from Enter; dividers off
  and on. React Aria reports keyboard modality before any interaction, so
  the area starts out instant (the spec checks the duration after a click).
- Dead end: `--update-snapshots` left the Date Picker and Date Range Picker
  baselines on the old title bar: the change was under the page-wide
  tolerance (LEARNINGS). Deleted those baselines and wrote them again;
  looked at them.
- Port 5180 was held by another session's docs server for this folder;
  tested against it.
- lint:css, typecheck, test:drift, `npm test` (588) pass.


## Date and time pickers: feedback round (2026-10-20)

- Godwin's list: action bar in the Calendar demo; md as the Calendar
  default; 0 can't be typed in date or time fields; a press on the field
  should open the calendar while typing still works; an md calendar under
  an sm field; no reserved space under open calendars in the stories;
  AM / PM switches on a press.
- "Can't type 0": Playwright typed 2026 fine on `#/raw/`; the cause was
  the component page's zoom shortcut (`0` resets zoom while hovering the
  demo), which skipped only inputs. Fixed in `ComponentPage.tsx`, docs spec
  added (LEARNINGS).
- `useFieldOpen` in DatePicker (shared with DateRangePicker), Popover
  `keepOpenOn`, Calendar `useFollowValue`, `calendarSize`, Segment toggles
  AM / PM on click, Calendar default md, demo `actionBar` control.
- Dead end: the field's `onPointerDown` never fired: React Aria's segments
  stop pointerdown; moved to the capture phase. A spec expected focus to
  stay on the month after typing two digits; React Aria moves it on.
- Deleted and rewrote the calendar and picker baselines (four stories, both
  themes); looked at them. lint:css, typecheck, `npm test` (594) pass.

## Code snippet fixes from Godwin's review (2026-10-20)

- Godwin: scrolling went past the last line; the playground cut the
  snippet off; the language menu was too wide; asked what five props do.
- Removed the toggle room under the body (scroll ends 12px under the last
  line now). The language Menu takes `bland-code-snippet__menu`,
  `width: max-content`.
- The docs stage centres a 640 frame that is wider than it, so both sides
  were cut. Made `.docs-demo-stage` an inline-size container and the story
  frame `min(var(--code-snippet-width), 100cqi)`. The first try (width
  100%) did nothing: the canvas sizes to its content.
- Re-baselined code-snippet light and dark (intended), looked at them.
  lint:css, typecheck, `npm test` (594) pass. Not committed.

## File Upload: demo height, multiple, dark colors (2026-10-20)

- Godwin: the playground is too short, multiple doesn't upload several
  files, and the dark row and close should be Neutral900 and Neutral800.
- Multiple: in the demo, two files picked at once and two dropped at once
  all became rows; the input has `multiple`. The 320px demo view hid the new
  rows below the drop zone, which looks like nothing happened. Not a
  component bug.
- Added `demo.height` to the Story type (`playground/story.ts`,
  `ComponentPage.tsx`); File Upload's demo is 640 high.
- Figma already had the dark values (Neutral900 / Neutral800); only the
  repo was behind. Rewrote both descriptions in Figma (they named the old
  steps), ran the drift check: two records. Its meta also differed (the
  known `_Typography` change), so the saved result took the records only.
  Applied, `npm run tokens`, checksum 6d913c72 equals Figma.
- `--update-snapshots` kept the old dark PNG (under the threshold,
  LEARNINGS); deleted and regenerated it. File Upload spec, axe, docs pass.
- Port 5180 was held by another session's docs server; used it.

## Sidebar revisions (2026-10-20)

**Asked:** Godwin's review: collapse should close on click and not leave
the page sliding under an open sidebar; taller story; surface-200
background (done in Figma); icons jumped at the ends of the hover peek;
no scrollbar; the collapse button in place of the logo, not floating over
rows; groups should animate.

- One `use_figma` read: only the Sidebar fill changed (surface-200); the
  rows' hover, count and selected disabled fills still bind surface-200.
  Asked Godwin: one step up in code; the page follows a collapse.
- Sidebar.tsx: `suppressed` after a pointer collapse, a closing slide on
  collapse, `data-compact`, a header row holding the top slot and the
  toggle, nests with `data-closed`, `scrollbar={false}`. sidebar.css
  rewritten around `--_list-pad` / `--_icon-x`.
- Measured in Playwright (the browser pane throttles rAF in the
  background): icon 14 to 24 and back, row fill 32 to 224 and back, no
  step at either end.
- Dead end in the spec: after collapsing the sidebar with a logo, the
  pointer is off the rail, so it really has left; the stays-closed check
  uses a sidebar without a logo, whose expand button stays under the pointer.
- Story: frames sidebar/height tall, demo `height: 736` (the demo height
  option another session added), page stand-in surface-100. Spec 15
  tests; re-baselined sidebar light and dark, looked at; `npm test` 599 pass.


## Messaging follow-up: separator tokens, sender typing, typing animation (2026-10-20)

**Asked:** the doc type and size separator pulled attention, so Godwin added
`Messaging/receiver-content-border` and `sender-content-border` in Figma
(rename them if a better name fits, add descriptions); no sender typing
state; typing should animate like chat apps.

- Read the new variables: bound to the separators, descriptions copied from
  `*-content-subtle`, scopes included TEXT_FILL. Asked Godwin: add a sender
  typing variant (yes) and the loop length (1200ms).
- Figma writes: renamed to `Messaging/receiver-separator` /
  `sender-separator`, new descriptions, scopes SHAPE_FILL + STROKE_COLOR;
  added `duration/typing` 1.2 (TIMING, left at ALL_SCOPES as the other
  Motion variables); added `Who=sender, Type=typing` (clone of the
  receiver's, sender tail, brand fill, dots sender-wave / content-subtle /
  content); rewrote the Chat-bubble description (both typing sides, the
  wave, duration/typing).
- Sync: drift check found 3 added variables; `metaChanged` was the known
  `_Typography` rename, so the result was saved without meta (LEARNINGS).
  `--apply`, `npm run tokens`: 528 CSS tokens. Checksum still differs from
  Figma's until the `_Typography` question is settled.
- Code: `--_separator` per side; typing dots animate (lift + color wave,
  a still keyframe under reduced motion), sender typing in the story;
  four new tests (12 in the spec). Frames checked at six moments.
- Baselines re-taken for chat-bubble only. lint:css, typecheck, `npm test`
  (602) pass.
- Other sessions' uncommitted work (calendar, sidebar, date pickers) is in
  the same tree; only this task's files go in its commit.

## Sidebar hover intent and slot fade (2026-10-20)

**Asked:** no sharp open and close on quick hovers (wait for the pointer to
rest); a graceful blur or fade for the logo and plan sections.

- Asked Godwin: new Figma Motion tokens for the two delays (he adds them;
  checked with `use_figma`: not there yet), and a fade with a space-xs blur.
- Sidebar.tsx: hover timers (enter, move restarts, leave with a close
  delay), `peekDelay` / `peekCloseDelay` props reading the pending tokens;
  `SlotFade` for top and bottom. CSS: slot layers, two keyframe pairs
  (blur and opacity only for reduced motion), clipped labels while compact.
- Probe screenshots mid-collapse showed the new "B" in while "Bland" blurs
  out, and busy "Sea…" ellipses on shrinking rows: clipped those.
- Spec 17 tests (hover intent with the tokens set on the page, slot
  cross-fade). The rail sits below the fold in the taller story: raw
  `mouse.move` needs `scrollIntoViewIfNeeded` first. One icon test raced the
  animation under full-suite load; it now checks the transition instead.
  Re-baselined sidebar; `npm test` 604 pass.


## Dark ghost hover, message bar layout and playground (2026-10-20)

**Asked:** brighter dark-mode hover for no-fill buttons (Icon Buttons too);
message bar: icons on the last line when text wraps, a fixed width in the
playground, the reply panel as wide as the field, record and the reply's X
working in the playground.

- Button tokens: dark hover/pressed of ghost and stroke aliased each
  family's darkest steps. Moved one step lighter in Figma (16 variables,
  descriptions say which step); drift check returned exactly those 16
  (meta saved as unchanged, the `_Typography` rename again); applied,
  `npm run tokens`. Checked a hovered navbar Icon Button in dark.
- Message bar: DOM now [main column: reply, field] + send; the bar and the
  field align to the bottom; field icons offset (input/md - icon/md) / 2;
  recording stays centred. Measured in the playground: icons, last line
  and send share one centre.
- Playground: Frame fixed at message-bar/width; a stateful DemoBar (keyed
  by the controls) with a running timer.
- Dead end: Prettier with defaults reformatted the file (double quotes,
  80 columns); re-ran at the repo's style and restored the import.
- Dead end: `--update-snapshots` did not rewrite the message bar
  baselines (change under the tolerance); `--update-snapshots=all`
  (LEARNINGS).
- Three new tests in the message bar spec. lint:css, typecheck,
  `npm test` (607) pass.

## Sidebar delays, centred rail slots, one per row (2026-10-20)

**Asked:** a tweakable delay before the rail opens (it still opened at
once: the delay tokens did not exist yet); variant sidebars full width,
not wrapped; rail contents centred (logo and account icon were off).

- Created `duration/sidebar-peek-delay` 0.2 and
  `duration/sidebar-peek-close-delay` 0.3 in Figma's Motion collection
  (`use_figma`, TIMING, ALL_SCOPES like the others, descriptions).
- Drift check: 2 added, plus the known `_Typography` meta change, dropped
  (`metaChanged` false). `--apply`, `npm run tokens` (530 emitted),
  checksum 626 / `679912ec` equal in Figma and locally. Another session's
  uncommitted token changes were already in `tokens/figma/raw` and stay.
- `SlotFade` marks the rail version's layer `data-rail`: rail-wide, items
  centred. Story rail slots lost their side padding.
- Story: `Frame` is always full width with a page; rows are `pg-stack`;
  demo frame `100cqi` (`calc(100cqi - 2 * space-lg)` came out 462 on a 558
  stage: the stage's padding is not space-lg, so plain `100cqi`).
- Spec 19 tests (token values, centring). Re-baselined sidebar;
  `npm test` 609 pass.

## Slider snap to checkpoints (2026-10-20)

- Godwin asked for the Slider to snap to the scale's numbers (25, 50, 75),
  settable in code.
- Added `snap` (true = the labels' values, or an array). React Aria's
  slider state only steps evenly, so with `snap` the Slider holds the
  value and moves every reported change to a checkpoint: nearest for a
  drag, press or typed value; the next one for a key on a thumb (an
  arrow's one step never reaches it). Decided: discrete snapping, not a
  magnetic pull near the marks.
- TypeScript's unchecked index access flagged the neighbour lookups;
  fixed with `??` fallbacks.
- Spec: four snap tests (keys, drag and press, range, field). The press
  test first failed because the story row sat below the 768 viewport:
  Playwright's mouse misses off-screen points (scrolled it into view).
- Story: a snap row (labels, range of four, field, uneven array);
  re-baselined slider light/dark.
- Bash's permission check kept failing mid-task, so runs came in bursts.

## Docs site redesign from Figma, List and Modal updates (2026-10-22)

- Godwin mocked the docs in Figma (section "Doc Design update", 6612:88042: Alert page, Overview, three
  search states) and listed: segmented theme toggle, full code under the playground, props in Table, Bland
  controls (toggle for booleans), "children" shown as "label", List 1 line padding 4, Modal radius 16, new
  List fills, search.
- `get_design_context` on the section came back as 2.5 MB of sparse metadata; switched to per-frame
  screenshots and read-only `use_figma` walks for layout, styles and bindings, and exported the icons as
  SVG strings (SunDim, Moon, Warehouse, the style page icons, ListDashes, Command, ListMagnifyingGlass,
  ArrowUpRight, the Figma logo; Devices for Breakpoints, which the mockup lacks).
- Drift check: 3 changed variables (List surface rest/hover/pressed, dark one step darker) and the
  known `_Typography` meta change (still open in the tracker). Applied only the List records (result
  saved with `metaChanged: false`). `npm run tokens`: 530 emitted.
- Figma List: Lines=1 is 32 high, space-xs block padding (flush too); Modal: rad-lg. Applied in
  list.css and modal.css; list spec 40 → 32.
- Docs: new `pages.tsx` (page order, search), `icons.tsx`, `highlight.tsx`, `leads.ts`, `Search.tsx`;
  rewrote `DocsApp`, `ComponentPage`, `Overview`, `parts`, `docs.css`. Moving `leads` out of
  StylePage avoids an import cycle (parts → pages → StylePage → parts).
- Browser checks on :5181 (5180 held by another docs server from this repo): theme bar truncated
  (segments flex-basis 0, fixed with `flex: 1 0 auto`), playground border hidden under the panel (inset
  shadow → border), props column widths ignored (Table's `max-width: 0`, specificity), a search result for
  the current page left the dialog open (close on any result click), the query survived reopening (reset
  on open). Dark mode, mobile (no sideways scroll), Dropdown controls driving demo and code checked.
- Specs: docs.spec theme (system then remembered), code view, search, pager; `pickOption` helper for the
  Dropdown controls (docs, empty-state, scroll-area specs).

## Docs follow-ups: smooth contents scroll, sticky toolbar, search highlight, room (2026-10-22)

- Godwin asked for: animated contents rail, sticky mode switcher and search, search resting on the first
  item, and a less congested playground and props table.
- Rail: `scrollIntoView({ behavior: 'smooth' })` unless reduced motion, plus `scroll-margin-top` on every
  `[data-toc]` so sections clear the sticky bar (lands at 80px: 64 bar + space-lg).
- Toolbar: `position: sticky` (top 0 from md, under the mobile top bar below), surface-100 fill,
  `data-stuck` hairline from a scroll listener.
- Search rewritten as a combobox (`aria-activedescendant`, options are the List rows' links via
  `renderLink`); the old focus-walking arrows dropped. Spec now uses role combobox and checks the
  highlight.
- Room: page 960, playground as a container query (side by side at 880, stacked with two control columns
  from 560), props table min-width 792. Checked at 1536 (side by side), 1440 (stacked) and 375.
- Sampling `scrollY` from `javascript_tool` during a smooth scroll in the pane read a frozen value;
  checked the end position instead.
- docs, empty-state, scroll-area and a11y specs: 182 pass.

## Docs round 3: scrollbars on scroll, toolbar fade, contents rail (2026-10-22)

- Asked Godwin for the hide delay (no token fit); "use the standard and add it as a token": created
  Motion `duration/scrollbar-hide-delay` = 1s in Figma (the first `use_figma` failed on `scopes`, which
  TIMING variables reject, and rolled back), synced it with the drift check (records only, meta left
  for the open Typography question): 531 tokens.
- ScrollArea: `data-scrolling` on scroll, cleared after `tokenMs('--duration-scrollbar-hide-delay')`;
  `data-dragging` while the thumb is held; thumb `opacity: 0` until then, `duration/md` `easing/out`.
- Toolbar: hairline replaced by an `::after` gradient (surface-100 to transparent, fade/md), shown
  while scrolled.
- Contents rail: current entry = last whose top reached the toolbar bottom + space-2xl; clicks hold
  the clicked entry until `scrollend`; variant cards (`data-toc-sub`) listed under Variants, expanded
  while it is current. First try at the variant entries landed under the toolbar: the scroll margin
  only covered `[data-toc]`.
- The Browser pane was hidden, so its screenshots came back blank; took the fade and scrollbar
  captures with a throwaway Playwright script instead.
- Suite 618: 617 passed, Scroll Area dark screenshot changed; rewrote all screenshots, kept Scroll
  Area, Code snippet, Table, Text Area (thumbs gone), reverted Breadcrumb, Section tab and a dropdown
  shot that differed only by noise (they pass untouched).

## Docs round 4: captions, Tab bar, rail, Code text (2026-10-22)

- Captions inside the box (Modal, Table): the Variants splitter only recognised a pg-stack written
  inline; Modal's `Row` and Table's `Group` render it. Now plain helper components are called to
  reach it (hook components fall back to boxing as is). A scan of every component page found all
  cards captioned except Code snippet's hook-based Controlled example, which got a caption in the
  story. Remaining labels inside boxes are demo content (counters, slot text, output values).
- Tab bar navigating to Overview: the splitter rebuilt the stack as a new div, dropping the story's
  `onClickCapture` preventDefault and its max width; it now clones the stack. Fit-content made the
  bar tight; stacks with a max width now fill it.
- While rewriting Variants, cut the ZoomStage code by mistake (the replace ran to the next marker);
  restored it from the saved copy before typechecking passed.
- Rail: variant entries removed, list max 50vh, right padding space-2xl. Playground: border-subtle
  dots, preview 520 / 440, Reset sm. Code text: `align-items: flex-start`, copy button height =
  the size's line height; checked by forcing a wrap (button top = code top, 24 tall on lg).
- Suite 618: 615 passed; Code snippet screenshots re-baselined (new caption), Section tab test
  flaky as before (18 of 18 on repeat).

## Docs round 5: token tables, timed copy, rail follows (2026-10-22)

- Copy: no token fitted the "standard" wait; following Godwin's earlier "use the standard and add it
  as a token", created Motion `duration/copied-visible` = 2s in Figma and synced it (records only; 532
  tokens). `useCopy` now clears after `tokenMs('--duration-copied-visible')`; the pointer/blur reset
  props are gone.
- The copy spec first used `page.clock.install()` + `runFor`; installed clocks still advance in real
  time, so under parallel load 2s passed before the check (12 of 12 failed with 6 workers). Rewrote it
  to measure real elapsed time; 12 of 12 pass under load.
- Token tables on Bland's Table, `.docs-data` shared with the props tables. While removing the old
  table CSS I cut with an anchor that came before the start and duplicated a chunk of docs.css;
  rebuilt it from its two halves and re-cut, then checked every recent rule was present once.
- Rail: sliding bar (an aria-hidden `<li>`, since a `<ul>` takes only list items) and keep-in-view
  scrolling of the rail's viewport; checked on Colors (28 sections): at the page bottom the current
  entry is in view and the bar is level with it.
- Suite 618: 617 passed; the copy test was the one failure (fixed as above).

## Docs round 6: style order, token cells, table radius, icon cards (2026-10-22)

- `stylePages` reordered as Godwin listed; everything that lists style pages reads it.
- `TokenName` is now Code text md copyable (the old click-to-copy button and its CSS removed;
  footnote reworded); `.docs-value` Code/body-md; `.docs-data` rad-md to rad-lg.
- Icon cards: `min-width: 0`, side padding space-md, figcaption ellipsis with a title.
- Checked Spacing and Icons with Playwright captures (the pane is hidden); docs spec 73 pass.

## Contents rail without a scrollbar (2026-10-23)

- Godwin asked to remove the rail's scrollbar: `scrollbar={false}` on its ScrollArea; the fade and
  the keep-in-view scrolling stay.


## Button disabled and dark secondary fills from Figma (2026-10-25)

- Godwin retuned the Button disabled fills (both themes) and brand secondary rest/hover/pressed (dark) in Figma.
- `npm run tokens:drift` -> check.js through `use_figma` -> 11 Button variables changed, plus `metaChanged`: the
  Typography collection is now `_Typography` and hidden in Figma, which `--apply` would turn into 28 removed type
  tokens. Set `metaChanged` false and dropped `meta` in result-0.json (LEARNINGS, "A drift check can carry an
  unrelated Figma change"), so only the 11 records applied. `npm run tokens`: the CSS diff is exactly those tokens.
- The local checksum (a4d83579) will not equal Figma's until the `_Typography` rename is settled.
- Screenshot tests stayed green (under the per-pixel threshold); re-baselined the 12 stories that show Buttons with
  `--update-snapshots=all`; 13 PNGs changed. Computed values checked in the browser. Suite 618 pass.

## `_Typography` kept hidden: type only through text styles (2026-10-25)

- Godwin hid Typography from publishing so library files stop showing font sizes; asked for the standard,
  which is exactly that (raw type scale private, text styles public). Kept.
- Figma: checksum 628 / `a4d83579` = repo, so no variable drift. Instead of pasting the 17 KB `check.js`,
  read the meta in one `use_figma` call, patched the one collection record in `00.json` and compared meta
  hashes (`94b32fe7` both).
- Build: per-style `--type-*-line-height` and `--type-*-letter-spacing` (46), the 28 raw tokens gone,
  composites unchanged (diffed). Folded the `Code/` prefix into the name so descriptions point at
  `--type-code-*`. 550 tokens.
- Components: 35 letter-spacing lines paired with the `font` in the same rule by script; 7 roots without a
  `font` (Sidebar count and Calendar use a private `--_spacing` beside their `--_type`; Progress bar,
  Message, Progress wizard, Table, File upload take body-lg). Text Area and Code text line heights moved
  to body-lg / code-body-* line heights. base.css and the docs site too (Typography page lists the parts;
  inline `code` uses Code/body-md).
- Lint: size, weight and family point to text styles; line height and letter spacing scales are the
  per-style tokens. Fixtures updated; also fixed an old fixture (300ms now has a token, the Sidebar's close
  delay), now 350ms. test:lint 4/4, lint:css, typecheck clean; no `var(--…)` left pointing at a removed token.

## Logo (2026-10-25)

- Read the Logo set (Brand elements page, `14:211`) in one `use_figma` dump: Size lg/sm, Color default/on-color,
  `👀 Mark` + `🧩 Mark` slot (logo/mark-lg 40 / -sm 24), gap space-sm, wordmark text "Bland" in
  Heading/heading-md or Title/title-md, Text/text-bold or text-on-color. No hover, no tokens of its own beyond
  the mark sizes.
- Built `src/components/logo/` (Logo.tsx, logo.css, story). Measured in the browser: lg 93 x 40 (Figma 93 x 40),
  sm 46 x 24 (Figma 47, sub-pixel), marks 40 and 24, gap 8.
- Story: the first project mark (brand square) vanished on the on-color brand fill; the story now gives that
  example a white version, as a project would.
- Suite: 622 of 623; axe failed the dark story: the on-color example sat on surface-brand, which is #659cff in
  dark (white 2.7:1). surface-brand-strong stays #0062ff (5.0:1); the story uses it and the docs say so.

## Brand override per project (2026-10-26)

- Godwin: a project brings 13 brand colors, set at the root, cascading to everything; a tool for edge cases.
  Defaults agreed: 13 hex values at `:root`, a check that warns, a generator from one color.
- Mapped the tokens: 54 Theme tokens alias a Brand step in some mode (plus the 2 brand shadows through
  `Brand/Alpha/a12/24/40`, all of Brand600). Bland already has 13 steps (0 to 1000); CLAUDE.md said 12.
- Build: `brandRef` follows each alias chain to a Brand step; tokens get `cssValue` (`var(--brand-N)`, alphas
  `color-mix(in srgb, … N%, transparent)`), elevation styles too. Brand steps emitted in their own `:root`
  block (a `[data-theme="light"]` subtree would otherwise reset a project's override). 563 tokens; resolved
  values unchanged.
- Lint: `var(--brand-*)` rejected in components with the Theme tokens built on that step, ranked by the
  property's role; brand steps left out of color suggestions. The existing "suggestions never name
  primitives" test caught my first message, which quoted the primitive; reworded.
- Tool (`scripts/brand/`): OKLCH generator anchored at 600 (rebuilds Bland's blue to within 1/255), 35
  curated pairings, misses that Bland's own brand shares and this brand doesn't worsen listed apart.
  Suggestions first moved tints (100, 200 to near white) for tint-on-solid misses: misses now belong to the
  solid step. Yellow's fix flattened 600 to 800 into one color: added an order repair (moved steps may go
  further their own way, never back) and up to four rounds; the new test caught a second flattening before
  that rule. Ten sample brands now pass after `--fix`; near-black reads best with `--at 950`.
- Found in Bland itself: link on surface-200 is 4.47:1, the hovered selected calendar day in dark 3.75:1.
- Docs site: Brand section first on Colors; search sends brand tokens there. Verified in the browser: an
  orange override at `:root` recolours Buttons (light) and the Calendar range and selection (dark).

## Brand theme page on the docs site (2026-10-26)

- Godwin: the tool as a page under Overview: enter or pick a color, generate, apply across the site, reset.
- `scripts/brand/core.ts` now imports `tokens.json` instead of reading it with `fs`, so the docs site runs the
  same generator and check. Palette icon exported from the Figma Icons page (6080:106150).
- `#/brand` route, sidebar entry under Overview, search and prev/next order. `brandStore.ts` sets the steps on
  `<html>` (sessionStorage for the visit); a Reset brand button shows in the toolbar while one is applied.
- Page: Text Input with the native color picker in its leading slot, a Dropdown for the step, Apply / Fix
  contrast / Reset to Bland, the scale beside Bland's, the findings in a Table, previews in both themes (each
  sets `data-theme` and the steps on itself), and the CSS in a Code snippet.
- Browser checks: the lead's inline code broke onto its own line (the lead is a flex column), wrapped it in a
  `<p>`. Bland's blue regenerated 1/255 off, so the page didn't recognise it as Bland's: it now uses Bland's
  scale for that input. Apply was enabled for Bland's own scale; disabled. Dropdown hugged 256 beside a full
  width field; made it fill. Phone width: no horizontal scroll. A screenshot after Reset still showed an
  orange button: the background-color transition again (computed value was blue).
- Spec in `tests/docs.spec.ts`: generate, fix, apply, follow to another page, reset from the toolbar; the page
  is in the open-without-errors list too.

## Neutrals tinted toward the brand (2026-10-26)

- Godwin asked for generated neutrals to lean toward the brand as Bland's lean toward its blue; deep research
  first (`reports/Brand tinted neutral scales.md`, notes in `research_notes/`). Decisions: Tinted / Subtle /
  Pure gray per project; exact brand hue; dark brands get whatever the method gives; transparent neutrals and
  shadows follow the neutrals; client neutrals code only.
- Build: `--neutral-*` emitted beside `--brand-*` in the primitives `:root` block (`overridable` covers both);
  107 tokens now reference them, including every transparent neutral, shadow and backdrop through
  `--neutral-1000`. Lint rejects `--neutral-*` in components (fixture added).
- Generator: research's curve and hue factors, with one change: hold each step's WCAG luminance (search L)
  instead of its OKLCH lightness, so every neutral-on-neutral contrast stays Bland's. Bland's blue at full
  gives Figma's neutrals exactly. Seven sample brands: neutral 600 on white 6.11 to 6.19 (Bland 6.16).
  Snags: white came back `#fffffe` (reference chroma 1e-8 at white), fixed by a threshold and grays straight
  from luminance; the contrast test's absolute tolerance failed near black on hex rounding, now relative.
- Check and fixes take the neutrals (neutral-backed pairs such as secondary button labels use them); override
  files carry neutrals (optional, all 13 or none); `--neutrals` flag on generate and check.
- Brand theme page: Neutrals switch (Tinted, Subtle, Pure gray), neutral rows beside Bland's, previews and
  Apply carry both scales. Verified in the browser: orange gives warm grays and a warm dark surface; Pure
  gray applies gray neutrals site-wide; Reset clears both. The page spec's click on the switch label hung
  (radio covers it); it checks the radio now.
- Shadows: they follow `--neutral-1000`, which stays pure black (Bland's curve, as Figma), so they don't tint
  in practice. Raised with Godwin.


## Brand page follow-ups and elevation names (2026-10-26)

- Godwin: shadows keep pure black neutral-1000 (the brand elevations already carry the brand); noted in docs/brand.md.
- Removed the toolbar's Reset brand button (and `.docs-brand-reset`); Reset to Bland on the Brand theme page is the one reset. DocsApp imports `brandStore` for its side effect so an applied brand still paints on load. The brand spec now resets from the page.
- "Color sits on step" was unclear: renamed **Your color becomes step**, helper says the other steps are built around it, 600 is the primary button fill, higher for dark colors, lower for pale ones.
- Elevation page: token names spilled out of their cards (nowrap names in a 180px column). Columns now start at space-9xl and a name wraps inside its card if it still can't fit; checked at 1440, the pane and 375.

## Brand color lands on its own step; Brand theme page from Figma (2026-10-26)

- Godwin: the brand color is the one entered, with no step to pick. `placeStep(hex)`: the Bland step closest in OKLCH lightness (blue 600, orange 400, green 500, red and violet 600, yellow 200, #111 1000). `generate` defaults to it; `--at` stays as a CLI override. The step dropdown is gone.
- Side effect, good: bright brands no longer need 600 darkened. Orange went from several misses to one (dark progress fill on its track, which only step 400 itself could fix).
- `fixScale`, `suggest`, `keepOrder` and `report` take `keep` (the entered color's step) and never move it; a miss only it could fix stays listed. The page's Fix contrast and `generate --fix` pin it; `check` doesn't (no entered color).
- Page rebuilt from Figma 6773:21840: Brand color section (Reset in the heading, brand-light card with "Tap to change", big swatch in the color itself with a copy button, step row in a sideways ScrollArea, contrast as Banners), Neutral color (SegmentedBar, neutral 400 swatch, steps), Preview and Use in a project kept, floating action bar (surface-inverse, Reset to Bland danger, Fix contrast secondary, Apply to site). New docs icons ArrowClockwise, CopySimple, Knob from the Figma assets. Color picker (`ColorPicker.tsx`) per 6773:22102: SV area (pointer and arrows), native range hue slider with the knob thumb, hex field; the gradients are computed (they are the color space). Figma's hex text uses Gabarito, a slip: body-lg Inter here.
- Dead end: the picker opened empty in Playwright and on a fresh load. The Popover got `reference={hero.current}`, a ref read during render; on the opening render it changed from null, and the panel's content unmounted. Passing the anchor through state (`useState` + callback ref) fixed it.
- Found and fixed an older bug: `brandStore.read()` ran before `isScale` was declared (TDZ), threw inside its try and returned null, so an applied brand never survived a reload (moving between pages hid it). The store now keeps the source color too.

## Brand page action bar only when there's something to reset (2026-10-27)

- Godwin: hide the floating bar while there's nothing to reset; animate it in when there is. It shows while the palette isn't Bland's own or a brand is applied (`hidden` otherwise), so Reset to Bland is never disabled.
- Motion per docs/motion.md: rises space-lg and fades in over duration/lg easing/out (`@starting-style`, `display` allow-discrete), leaves the same way; opacity only under reduced motion. Measured in Playwright (the hidden browser pane renders no frames, so its transitions never start): in 250 ms, out in 250 ms, then display none.

## Color picker formats (2026-10-27)

- Godwin: switch the picker's field between color systems. A format menu (Bland Menu, single select) in the field: HEX, RGB, HSL, OKLCH, kept in localStorage. The field shows the numbers alone (the menu names the format) and reads them back, with commas or spaces, or CSS in any format (`rgb(255 90 31)`, `hsl(16deg 100% 56%)`, `oklch(68% 0.21 38)`) or a hex.
- Color math moved to `playground/docs/colorFormats.ts` (pure; ColorPicker imports CSS, so tsx couldn't load it for a round-trip check). HEX, RGB, HSL (one decimal) round-trip exactly; OKLCH shows 3 decimals and a whole hue, enough to read, close to the color when typed back.
- The OKLCH value overflowed Figma's 256 wide panel: the panel is now space-9xl + space-2xl (288). Measured the longest value of each format in Playwright: all fit. Escape closes the format menu first, then the picker.

## 2026-10-27 — Banner: colored variant and tighter actions (feedback session)
**Asked:** pick up Godwin's Figma changes: a Colored variant on Banner, less space between the text and the actions.

- Read the Banner set again (now 16 variants, `Colored` false/true, default
  false): colored = `surface-{status}-light` + `border-{status}`, no
  elevation; icons unchanged. Vertical content gap is now `space-sm` in all
  eight vertical variants. Notification checked too: unchanged (vertical
  gap still `space-lg`), so only Banner moves.
- Code: `colored` prop on Banner; the shared vertical gap reads a private
  `--_actions-gap` (space-lg) that Banner sets to space-sm. Story shows
  colored horizontal and vertical; specs check the tints, no shadow, and the
  8 vs 16 gaps. Banner baselines re-taken and looked at.
- Follow-up (Godwin): Banner's action Buttons default to sm in both
  orientations. `ButtonSizeContext` in Button.tsx (Button and Icon Button
  use their own size, else the context's, else md); MessageLayout provides
  `actionSize`, Banner passes sm. The 32px buttons left the 24px first line
  4px high, so a `--_line-offset` (only while the actions hold an sm Button)
  moves icon, text and close down to centre on them. Notification and Figma
  unchanged. Banner baselines re-taken; spec checks the default, an own size
  winning and the centring.
- Follow-up (Godwin): **first-line alignment** made a convention
  (CLAUDE.md, docs/components.md CSS, INTERFACE.md §2). In `message/` the
  offset now covers sm, md and lg inline Buttons (xs needs none), and the
  timestamp centres on the first line (horizontal) and stays on a wrapping
  title's first line (header was `align-items: center`). Story: a vertical
  notification with a wrapping title; spec checks both timestamp cases.

## 2026-10-27 — First-line alignment audit (side session)
**Asked:** check every component against the first-line alignment rule and fix the ones that break it.

- Grepped every `align-items: center` in `src/components/*/*.css`, then sorted the rows by whether their text can wrap (nowrap or ellipsis means it can't). Most rows can't wrap; the rows that can were already done (Accordion, Modal, File Upload, Checkbox, Radio, Toggle, Progress wizard inline, CodeText).
- Broken: **Menu** items (label wraps, row centred). Figma's `_menu-item` centres too (read through the Figma MCP; Framelink's token had expired). The slots are 24 = the line, so `flex-start` alone fixes it and one line looks the same. Story row with a wrapping label; spec checks both slots centre on the first line.
- **List item 3+**: a trailing icon/md sat 2px above the title line's centre. The trailing slot gets `min-height` of a body-lg line. Story row and spec.
- Left for Godwin: List 3+ leading slot (40) sits at the top beside the text, as in Figma, so a 24px icon in it centres 8px below the first line.
- The docs pane was 0x0 (hidden) and laid everything out at zero width; measured after `resize_window`. Port 5180 was another session's server, used as is.
- Re-baselined menu and list stories plus the open-menu screenshots (only the page text behind the menu's top edge moved).

## Brand page from the updated Figma (2026-10-27)

- Godwin: no note about Bland's own near-misses on Bland's base blue. `Contrast` takes `base` (the blue, unfixed): the inherited note is dropped and, with no real misses, nothing shows. Real misses (Pure gray neutrals, say) still warn.
- Figma 6773:21840 updated: the floating bar is gone. Reset (stroke sm, no icon; now resets everything, including the site) and Apply to site (primary sm) sit in the Brand color heading. The contrast warning is a Banner `colored` vertical warning titled Contrast warning with Fix contrast (primary) and Show breakdown (stroke, `aria-expanded`, toggles the misses table and the inherited note). The Figma Banner gained `Colored=true/false` variants (6781:24241…); code's Banner already had `colored` (status light surface + status border, info uses brand), so no component change.
- Removed the bar's CSS and its hidden/rise motion, and the ArrowClockwise docs icon (unused now).
- Test selectors: the contents rail's "Brand color" link also matches `/^Brand color/` at desktop widths; the spec uses `/^Brand color #/`.

## Brand page: calmer contrast result, picker at the tap, format field (2026-10-27)

- Godwin: hide the contrast banner while sliding in the picker and show it on release; animate changes subtly. ColorPicker reports `onDraggingChange` (pointerdown on the area or hue until a window pointerup/cancel); the result fades out (opacity, duration/md) while dragging and each new result is keyed and eases in (opacity + space-xs rise, duration/md easing/out; opacity only under reduced motion).
- Godwin asked what "Below the minimum with Bland's own brand too, and no worse here" meant (pairings Bland's own blue already misses, which this brand doesn't make worse) and preferred a plain "Contrast checks out". The page now counts those as passing and drops the note everywhere, including the breakdown; the command still prints them.
- Fix contrast never changes the entered color (its step is pinned since 21d7f8f); the spec now asserts it.
- The picker opens where the swatch was tapped: a zero-size anchor span at the press point (or under the hex for keyboard presses), placement bottom.
- Format field: the trigger is body-sm-bold, full field height and flush with the field's left edge, space-md before the value; its menu is as wide as its labels (`docs-picker-format-menu`), lines up with the field and sits space-xs further down. The field's ring shows only for the value input.

## Brand page: no result on Bland's palette, none of its space while dragging (2026-10-27)

- Godwin: after Reset to Bland, no "Contrast checks out". Bland's own palette (brand and neutrals) shows no result unless it has real misses.
- Godwin: the hidden result still took its space while scrubbing. It now uses `hidden` (display none) while a pointer drags in the picker, so the page closes up; on release the result's ease-in animation replays as display returns (checked in Playwright: running from opacity 0).

## Brand page: the contrast result's exit (2026-10-27)

- Godwin: animate the banner's exit too. It now stays mounted and is `hidden` both while dragging and on Bland's own palette, so both leave the same way: opacity and a fold (grid row 1fr to 0fr) plus a negative margin that folds the section's gap, duration/md easing/out, then display none (`allow-discrete`); entering unfolds the same path (`@starting-style`). Reduced motion keeps the fade only. While hidden it keeps its last result, so the exit plays on what was shown.
- Dead end: `height: auto` to 0 with `interpolate-size: allow-keywords` on the element didn't animate in Chromium 156 (height held at 132 until display none), though `CSS.supports` said yes. The grid-rows fold works; measured in Playwright: out in ~160 ms, in ~160 ms.

## Brand page: contrast result motion is scale + opacity (2026-10-27)

- Godwin didn't like the fold; asked for scale + opacity per Emil Kowalski's course. Following it: transitions (interruptible) instead of keyframes, from scale 0.97 + opacity 0 (never 0), easing/out, exit faster than entry (duration/xs out, duration/md in), only transform and opacity animate (no height or margin). Scaled from the top centre, where the result hangs from the step row; `display` allow-discrete drops it from the layout after the exit. Each new result (keyed) enters the same way with `@starting-style`. Reduced motion: opacity only.
- The fold's grid wrapper is gone. Measured in Playwright: out in ~110 ms, in ~180 ms.

## Brand page: fold plus scale and opacity (2026-10-27)

- Godwin: try the fold again with Emil's principles. Two parts: the content (inner) scales from 0.97 and fades from the top centre; the wrapper's grid row folds 1fr to 0fr (plus the section gap via a negative margin) so the page glides. Exit: content out in duration/xs with no delay while the space folds over duration/md. Entry: the space unfolds first, the content follows a quarter of duration/md later. Transitions throughout (interruptible), easing/out. Reduced motion: fade only, the space goes at once.
- Measured in Playwright: exit content gone ~90 ms, space ~150 ms; entry space ~130 ms, content in by ~160 ms.

## Brand page: breakdown table folds too (2026-10-27)

- Godwin: give Show/Hide breakdown the same fold + scale. The motion is now a shared docs class, `.docs-fold` (wrapper, `hidden` toggles it) + `.docs-fold-inner` (content), used by the contrast result and the breakdown. Measured: the table (362 high) unfolds and scales in by ~170 ms, folds away in ~190 ms with its content gone by ~90 ms.

## Popovers close faster than they open (2026-10-27)

- Godwin: make the shared popover's exit faster than its entry. `popover.css`: the closed state's transitions run duration/xs, `:popover-open` sets duration/md, so opening (Menu, Dropdown, Breadcrumb overflow, date pickers, the docs color picker) stays 200 ms and closing is 125 ms; same path, easing/out; keyboard opens stay instant. Measured in Playwright on a Menu: in ~190 ms, out ~125 ms. Tooltip has its own CSS and is unchanged.
- docs/motion.md and CLAUDE.md now say exits run the same path, quicker. Full suite: 629 passed; the flaky Section tab spec passed on its own.

## Extra project colors (2026-10-27)

- Godwin: projects may want colors beside the brand (charts, illustrations, parts of their UI); the brand stays on every component; extras get light/dark theming; cap 3.
- Researched: Material 3 (secondary/tertiary roles used by components), Carbon/Atlassian/shadcn (ordered chart palettes, data marks only), Radix/Tailwind (custom scales next to the system). Bland takes the third for extras and plans the second as a chart palette (needs Figma).
- core.ts: `check`, `suggest`, `fixScale`, `report` take a set of pairs. `EXTRA_ROLES` mirrors the brand tokens (surface, surface-strong, surface-light, text, icon, border) by reading their light/dark steps from tokens.json; `EXTRA_PAIRS` (6) are the brand pairings those roles draw. `toCss` emits extras' steps on :root and their roles in Bland's light and dark selectors; `parseExtras` reads them back; `extraNameError` blocks Bland's own prefixes.
- Command: `--extra name=#hex` (up to 3) on generate, each reported and fixed on its own with its step pinned; `check` reads a file's extras.
- Page: the brand card became `ColorCard` (reused per extra). Extra colors section: Add color (disabled at 3), Name field with the clash check, Remove, steps, a roles row (light and dark halves, token name), its own Contrast with Fix. Previews show each extra's roles in that theme; the CSS includes them; kept for the visit in sessionStorage; Reset clears them.
- The reusable card first named its dialog "Pick brand color"; tests caught it, so the card takes `pickerLabel`.

## Brand page: extra colors no longer show a brand banner; agent skill notes (2026-10-27)

- Bug: adding an extra on Bland's brand showed "Contrast checks out" under Brand color. `isBland` (used to hide the brand result) also required no extras. Split into `brandIsBland` for the brand result; `isBland` still drives Reset. The spec now adds an extra after Reset and checks the brand result stays hidden.
- Same pass: an extra's warning said "n of 70 pairings"; Contrast takes a `total` (extras 12).
- Started `docs/agent-skill.md` (setup, colors and roles, CSS rules, components, open points); CLAUDE.md points at it. docs/brand.md says plainly that steps are fixed and roles switch.

## Brand theme page from Figma 6806:6170, 6806:7199, 6806:8283 (2026-10-27)

- Read the three frames (sparse at page level; got the extra header, banner and roles row in detail). Figma's breakdown table holds placeholder prop rows; the code keeps the real findings table.
- Restructured BrandPage into SectionTabs panels; ColorCard takes children for the contrast result; new PencilSimpleLine icon; Section got `toc`.
- The browser pane was hidden, so the fold never ran there; screenshots taken with a throwaway Playwright spec (deleted). Fixed the empty state's action stretching full width (centred, hugging).
- Spec updated for the tabs; brand-related tests pass.

## Brand page fixes: tint change, empty preview, table rounding (2026-10-27)

- Switching the neutral tint on Bland's brand showed "Contrast checks out": the brand result hid only when the neutrals were Bland's too. It now hides whenever the brand steps are Bland's (the neutrals keep Bland's contrast). Spec switches to Pure gray and back.
- Preview is left out on the Extra colors tab while there are no extras (Figma 6806:7199).
- Breakdown table: `.docs-data` set a plain rad-lg with superellipse, which reads square; inside the card it now uses .bland-smooth (doubled radius), like the swatch.
- Follow-up: extra cards tinted with their own surface-light (light/dark through the same CSS-var switch as the roles row); extras intro row from Godwin's screenshot; name title-lg. Checked light, dark and 375 wide in Playwright screenshots.
- Follow-up: no rule between extras, space-5xl apart; intro to first color space-3xl; names shown lowercase as typed (capitalize dropped: the name is the token).
- Harmony defaults: first try kept the brand's lightness (blue's complement came out a muddy #956b00); then each hue at its most vivid lightness with the brand's relative saturation (neon, #00ffcc); settled on halfway between the two lightnesses, chroma capped at the brand's. Bland blue gives #c99100, #e41493, #00c19a. Page, CLI (`--extra name` alone) and a unit test.
- Reset warning: Modal with the trigger as the Reset button; the spec checks the listed changes, Cancel keeping the brand, and Reset clearing it (waits for the dialog to close, since its danger Reset button shares the name while it exits).
- Picker number fields: CHANNELS/channelsOf/fromChannels in colorFormats.ts; Channels component keeps the typed field's text while others follow. First pass clipped values at 320 wide with equal columns; widened to 352 and let each column and input hug its number (size attribute, field-sizing).
- Picker follow-up: the dividers were inset shadows on rounded boxes (format button, number fields), so they bent at the corners and read as cut off; now straight 1px lines (pseudo-elements) space-sm in from top and bottom, hidden beside a focused field. Format menu md, at least space-7xl wide.

## Batch 1 of Godwin's open decisions (2026-10-27, branch claude/batch1-decisions-b6936a)

- Recorded the accepted answers: dark mode switch both ways (CLAUDE.md Decisions, open question removed, INTERFACE Light and dark, agent-skill), lint scope kept with reasons (docs/lint.md), chat audio project-owned (map row, agent-skill), and the Figma-first items as notes on the List, Chat list item, Chat bubble, Chat message bar, Pill and Menu rows.
- List 3+ rows: `--_line-offset` on the row, `(list/slot-lg - body-lg line) / 2` when a leading slot is present, applied as margin-top on the text column and the trailing slot (message.css pattern). New spec: title centre equals leading slot centre.
- Dead end: the first run passed visual and failed the new spec by 8px: Playwright reused the main checkout's server on 5180 (LEARNINGS). Ran against this worktree on 5191 with a throwaway config: behaviour specs pass, List screenshot 16px taller (two 3+ rows with a leading slot). Looked at the PNG, re-baselined list light/dark only with `--update-snapshots=all`. lint:css and typecheck clean.
- Not built (needs Figma, Batch 2): Chat list item selected look, message bar max height, pill count in dark. Checklist written into the tracker.

## Batch 2 in Figma, token sync, code (2026-10-27)

- Godwin asked Claude to do Batch 2 in Figma. Inspected each set read-only, then edited: Dropdown page (24 _menu-item variants top aligned, 24 disabled trigger labels 44:917 → 44:916, 3 Menu fades md → sm), Pills (3 selected disabled counts to Type=primary), Lists (8 Lines=2 variants: inner min/max height 64 cleared, padding bound to space-sm; first pass left min/max on the inner frame, so height stayed 64 until cleared), Messaging (2 Theme + 1 Sizing variable, 4 cloned Selected=true Chat-list-item variants, the set grown 192 and the components under it moved down, 2 separators width-bound, 6 message bar fields maxHeight-bound), Sidebar (32 fills stepped up, descriptions rewritten).
- Descriptions read back HTML-escaped; writing `description` from that text escapes again (the "escaped several times" bug). Rewrote through `descriptionMarkdown` with entities decoded.
- Token sync via the drift path: result-0.json built from the three new variables' records, `tokens:drift -- --apply`, `npm run tokens`; Figma checksum.js and `tokens:checksum` both {631, 8089d93b}, so nothing else drifted.
- Code: Pill, ChatListItem CSS, ChatMessageBar ScrollArea; specs added (open chat fill, field cap) and pills expectation updated; screenshots unchanged (100 pass).

## Chat list item: selected option in the playground (2026-10-27, branch claude/batch1-decisions-b6936a)

- Godwin asked for the open chat's selected option on the playground, with the Messaging tokens added in Figma. Figma already had them; synced and built the CSS, then found another session had done the same on main (fee44e3, Batch 2). Rebuilt this branch on main keeping only what main lacked: a Selected section in the story (receiver and sender), labels that name the fill, and a spec that checks the fill, the hover fill and the selection moving. Old commit kept as backup/selected-4079a51.
- Chat list item screenshots re-baselined (the new section); specs pass on a worktree server (5191).

## Typography page: large samples cut off (2026-10-27)

- Godwin: text from Heading lg up looks cut off at the bottom. `.docs-type-sample` had `overflow: hidden` for its ellipsis; scrollHeight exceeded clientHeight by 2 to 6px from Heading lg up (descenders below tight line boxes). Now `overflow-x: clip` with `overflow-y: visible`. Checked in the browser pane on a 5181 server; docs specs pass.
- Follow-up: with descenders visible the samples crowded their token line; the row gap went space-xs to space-md (Godwin).

## Grid system: Figma audit, stopped before code (2026-10-27)

- Read the Grid system page (1145:1071) and the 17 grid styles read-only through the official Figma MCP. All column grids, no descriptions. Bound: every gutter (space-sm, space-lg, space-xl) and the Mobile styles' offset (Layout/margin-mobile), all already CSS tokens. Raw: every column count (4, 6, 8, 10, 12, 14), every fixed column width (104, 112, 128, 136, 144) and the Dashboard offset (24). Layout/margin-desktop (152) is bound by no grid.
- Stopped there (hard rule: no invented tokens). Nothing to extend in the token pipeline yet: the bound values already reach tokens.css. Table and proposal in the side-session notes (grid-system-figma-audit.md) and the tracker's Needs your call.
- The audit table (bound values named, everything else raw):

  | Style | Align | Columns | Column width | Gutter | Margin |
  | --- | --- | --- | --- | --- | --- |
  | Mobile/sm, md, lg (identical) | stretch | 4 | fluid | space-sm | Layout/margin-mobile |
  | Tablet/sm, md, lg | center | 6 | 104, 128, 144 | space-lg | none (704, 848, 944 wide) |
  | Desktop/sm, md, lg | center | 8, 10, 14 | 128, 136, 128 | space-lg | none (1136, 1504, 1999 wide; 1440 - 1136 = 2 x 152) |
  | Dashboard/{left,right}-tight | min/max | 10 | 104 | space-sm | 24 |
  | Dashboard/{left,right}-basic | min/max | 8 | 128 | space-lg | 24 |
  | Dashboard/{left,right}-loose | min/max | 8 | 112 | space-xl | 24 |
  | Dashboard/{left,right}-wide | min/max | 12 | 112 | space-lg | 24 |

  Page frames: mobile 360 to 430, tablet 768 and 820 (Tablet/sm), 912 (md), 1024 (lg), desktop 1280 to 1536 (Desktop/sm), 1920 (Desktop/md), 2560 (Desktop/lg). Several frames carry local copies of a grid instead of the style. Figma can bind `count`, `sectionSize`, `offset` and `gutterSize` on a layout grid.

## Chart palette (side session, 2026-10-27)

- Read the brand tooling (core.ts, CLI, Brand page) and the dataviz method's color checks (lightness band, chroma floor, CVD ΔE via Machado 2009, normal-vision floor 15, contrast 3:1). Kept the task's rules: 3:1 and neighbour ΔE under normal/protan/deutan/tritan; the lightness band is not enforced.
- First prototype took the dark value two steps lighter on a scale made from the light one: generated series placed on 400 came out as pale 200 tints in dark (#e2cca6 gold), and a yellow brand's dark series collapsed under normal vision. Switched to a chroma-keeping lift by Bland's 600-to-400 lightness gap: every test brand (orange, green, yellow, purple, crimson) passes among generated series; a near-black brand's gray series 1 sits too close to its gold extra, which is the project's own pair and is reported.
- Ordering is a brute force over the generated series (up to 7! orders with a precomputed pair matrix, pruned), then up to six nudge rounds of ±0.04/0.08/0.12 lightness. Runs in well under a second.
- `toCss` and the extra roles share one themed-selectors writer now; the roles block ends in one newline instead of two.
- `npm run tokens` appends the default palette to tokens.css via a dynamic import of the brand core after tokens.json is written (core imports tokens.json). tokens.json unchanged.
- An existing docs spec named an extra `chart`; now reserved, so the spec checks the error and uses `charts`.
- Port 5180 was held by another session's docs server on this checkout; verified in the browser pane and ran docs.spec.ts against it (77 passed).

## Release prep: package and docs hosting (2026-10-27, side session)

- Reviewed package.json: exports fine for JS and the four stylesheets; peer `>=18` wrong (components read `ref` as a prop, React 19 only). Set 0.1.0, peers `^19.0.0`, `./package.json` export, `files` with README/CHANGELOG, `repository`, `prepack: npm run build`. Kept `private: true`.
- `npm view bland`: taken (0.0.1). `@jgodwyn/bland` free.
- Docs: `playground/vite.config.ts` gets `base: './'`, `build.outDir` `dist-docs/`, preview port 5181; `docs:build`, `docs:preview` scripts. Served `dist-docs` from `python3 -m http.server` under `/bland-design-system/`: overview, Button, Avatar, Brand, Typography pages load, Inter and Geist Mono load, the avatar jpg loads, no 4xx.
- `scripts/release/package-smoke.ts` (`npm run test:package`): pack → throwaway Vite + React 19 app → `tsc` + `vite build` → `vite preview` → Chromium. First run: app `tsc` failed on `@internationalized/number` (needs ES2023 lib); then `__name is not defined` in `page.evaluate`; then a reused dir kept the old tarball. Fixed all three; passes: button fill = override's 600 (rgb 193 58 0), Inter loaded, dark section switches, accent roles switch, tooltip on Tab.
- Git install test on a local clone tagged v0.1.0: without `prepare`, installs but no `dist/`. With `prepare` (clone only, not in this repo): dist built in about 10 s; npm 11 warns the script isn't in `allowScripts` but runs it.
- README, CHANGELOG (0.1.0 unreleased), `docs/release.md` (decisions, three package options, three hosts, exact go-live commands), `docs/hosting/` inert vercel.json, netlify.toml, github-pages.yml.
- Not touched: other sessions' files (brand scripts, build-tokens, BrandPage, tokens.css regenerated by my builds from their in-progress build-tokens.ts is theirs to commit).

## Brand page: Fix contrast sat disabled (2026-10-27)

- Godwin: with #FF00BB, Fix contrast showed disabled, or went disabled after a press instead of reaching Contrast checks out.
- Cause: the only miss left (dark Progress fill on its track) was on step 400, the entered color's own step, which the fix may not move; `canFix` was false and nothing explained it. A sweep of 360 bright colors: 54 hit it (Progress fill, Calendar selected hover, Link on a raised surface), all cleared by a small move of the color itself.
- Fix: `adjustColor` (core.ts) runs the fix with that step free; the banner offers Adjust my color with the new hex. CLI report names the color too. Unit test (22 brand tests) and the docs spec updated (it had asserted the disabled button).

## Brand page: Adjust my color taken out (2026-10-27)

- Godwin: "my brand color is my brand color": Adjust my color changed the swatch. Reverted 1c01f7a (adjustColor, its test and CLI line gone).
- Now: Fix contrast shows only when it can move something; when every miss left is on the entered color's step, the warning has no Fix button and says the miss is on your color, kept as picked. Show breakdown stays. Docs spec asserts no Fix button and the wording.

## Chart palette picks and the chart tab redesign (2026-10-27)

- Godwin: avoid jargon banners (copy review before going live added to the tracker's Release list and the roadmap), build the picks, redesign the chart tab like the other two.
- Core: `arrange` replaces `bestOrder` (generated series fill open slots around fixed ones: brand, extras, picks; pairs of two fixed series don't count toward the score, else a fixed clash flattened every order to a tie). `pinnedSeries`, `darkFor`, `ChartPins`, `chartPins`, `parseChart` (resolves `var()` steps through the file's scales; plain hexes are generated unless marked `/* picked */`), `chartAdvice`.
- First plain-language pass gave three lines for one pair (normal, red-green, blue-yellow); now one line per pair, saying the worst of it.
- A picked yellow (#f4f000) got #feffdb in dark (lift past white, chroma gone to gamut); `darkFor` now caps the lift at OKLCH 0.85 and keeps an already light color.
- ColorCard split: `PickSwatch` (swatch + picker) used by ColorCard and the chart tiles; `Swatch` takes `compact`.
- Picker typing in the browser pane was flaky after scrolls (stale refs); tested picks there by seeding sessionStorage, and through the docs spec.
- (later) Godwin's design pass: Light/Dark rows dropped (swatches follow the page theme through a `usePageTheme` hook on data-theme and the system scheme), a block per color like ExtraColor, per-color check with Fix color (`fixChartColor`: nearest of lightness ±0.35 and hue ±30° that clears its problems, near misses too if it can). `ChartAdvice` now carries the series it belongs to. Fixing a Bland's pick pins it, so the other picks are made again around it; the check reruns.

## Chart picks decoupled, success banners dropped (2026-10-28)

- Godwin: editing one chart color changed the others. Cause: `chartHues` took the picks as taken hues, so each pick reshaped the gaps and `arrange` reordered every generated series. Now `generateChart` builds Bland's picks from brand + extras only (`generateAround`) and overlays pins slot by slot. Test asserts every other series equals the unpinned palette.
- Side effect: a yellow pick beside Bland's gold had no fix within ±30° hue; `fixChartColor` now searches hue all the way round (nearest first, ~2.5k candidates, well under 100 ms).
- "Contrast checks out" and "This color checks out" removed; Contrast hides when nothing misses (brand and extras), the chart check when a color has no advice.

## Grid system in code (2026-10-28)

- Godwin answered the audit: column counts become tokens, desktop gets a max content width, Dashboard grids ignored.
- Figma (official MCP, use_figma): created `Layout/columns-mobile` 4, `-tablet` 6, `-desktop` 8 and `Layout/max-width` 1136 in Spacing (6849:364 to 367); bound the count of Mobile/sm, md, lg, Tablet/sm, md, lg and Desktop/sm to them; gave those seven styles a one-line description pointing at docs/grid.md.
- Sync through the drift path: `tokens:drift` wrote check.js; instead of pasting its 17 KB, ran a small read-only script returning the four new records in the drift format plus the full checksum (635, e33ab92a), saved as result-0.json with the check's localHash. The report showed exactly 4 added, `--apply`, `npm run tokens`; `tokens:checksum` 635 e33ab92a, equal to Figma, so nothing else drifted.
- The report showed the counts as `4px`: `core.ts` now emits `Layout/columns-*` without a unit.
- `.bland-grid` in base.css; checked it with Stylelint as if it were component CSS (clean). Spans as unregistered custom properties would inherit into a nested grid's children; registered `--span*` with `inherits: false`.
- Docs Grid page; checked in the browser pane at 1440, 800 and 375: column counts, gaps, margins, spans per breakpoint, nested grid not inheriting, span 9 cut to 6, the 1920 frame capped at 1440, no sideways scroll, no console errors.

## Page grid redone: columns on the 8 grid (2026-10-28)

- Godwin pointed out his Figma practice: column width on the 8 unit and gutter set the design, margins are what's left. Checked the first version: code columns were 115.3 at 820, 108 at 1280, only 128 at 1440 matched.
- Modelled "widest multiple of 8 inside a minimum margin" in Python first: with minimums 16 / 32 / 64 it gives Figma's Tablet sm/md/lg and Desktop/sm frames exactly and mobile margins 18 to 31.5.
- CSS `round(down, …, 8px)` per column gave 96 at 768: the column computes as 103.984 (layout units). A 1px slack fixed 768 but broke 375 (79.75 → 80, margin 15.5). Fix: round the columns' total to a multiple of columns x 8, then divide (exact, no slack). Probed 13 widths in Playwright with the scrollbar hidden (a classic scrollbar takes width a Figma frame doesn't have).
- Godwin mid-task: column counts needn't be multiples of 8 (they never were; the 8 is the column width). Noted in docs.
- Grid page frames now real `.bland-grid`s with inline values, captions from the same rule; checked each frame's measured column and margin against its caption. Spec measures 360, 768, 912, 1024, 1280, 1920.

## Figma grid styles tidied (2026-10-28)

- Godwin saw odd grid styles in Figma and allowed removing those out of line. Read the Grid system page: 22 Screen templates instances (main components on the Spacing page, each with a local grid, no style), 8 of them Dashboard demos.
- Reshaped Mobile/sm, md, lg to CENTER 4 x 72 / 80 / 88 (count and gutter bound); deleted Desktop/md, Desktop/lg and 8 Dashboard styles; attached styles to the 14 main components by size; deleted the 8 Dashboard instances, set the 14 remaining instances to their styles, moved the tablet and mobile rows up 2320, shrank the frame to 4060 and moved the Footer up to its edge. Rewrote the Tablet and Desktop descriptions with their screens.

## Brand page: contrast fix lost on return (2026-10-28)

- Godwin: edit the color, Fix contrast, visit another page, come back: the warning is back.
- Cause: the fixed scale and tint lived only in component state; on return the page rebuilt the scale from the color alone (and the color only from an applied brand).
- Fix: a draft {color, tint, fixed} saved to sessionStorage and read on mount; falls back to the applied palette. Docs spec leaves and returns after the fix; it fails without the change.

## Desktop md/lg grids and the Grid page on its grid (2026-10-28)

- Asked Godwin for md/lg widths and switch points (AskUserQuestion): md 144 from 1536, lg 160 from 1920.
- Figma: breakpoint/3xl, Layout/max-width-md/-lg, renamed max-width to -sm, Desktop/md and lg styles, attached to the 1536/1920/2560 templates and Grid page frames. `moveLocalGridStyleAfter` refused across folders ("Desktop/" vs "Tablet/"); styles group by name prefix anyway, so no reorder needed.
- Sync: fresh check.js for localHash, records for the 5 changed variables, `--apply`, checksum 638 4a186ff6 both sides. Lint picked up 1920 from tokens.json.
- Grid page: first pass the section grids inherited `.docs-section`'s 24px gap (columns 872 wide vs 816); set column-gap to the grid gutter. Overlay columns were 0 wide (absolutely positioned without horizontal insets) and columns 7 and 8 stayed hidden (the xl reveal had lower specificity than the nth-child hide). Checked at 1440, 800, 375; spec covers 1440 to 2560 and the overlay.

## Docs site copy review (2026-10-28)

- Mapped where visible copy lives: story `description` (50), variant captions (`pg-label` spans and Modal/Table `label` props, ~270), prop JSDoc via props.json (734 props, 323 mentioning Figma), style page leads (`leads.ts`), notes in StylePage/BrandPage/Overview, Brand contrast banner. Token descriptions (from Figma) had no Figma wording; left alone (generated).
- Plumbing first: `Prose` in parts.tsx (backticks → CodeText lg), `plain()` in pages.tsx for search, `usage?: string[]` on Story rendered as a Usage section after Playground, caption `<code>` styled as CodeText in docs.css. Lead wrapped in `<p>`: the lead is a flex column, so loose text and code nodes would each become a flex item.
- Wrote all 50 descriptions and usage lists by hand (script in the session scratchpad applied them). Checked facts against the props (SearchInput `clearable` default false, Modal `actionsAlign` default left, Toaster wraps the app).
- Captions: one replacement table per story; Table `Group` and Modal `Row` labels became ReactNode for `<code>`.
- Prop JSDoc: a regex stripped the `Figma \`…\`:` prefixes (323 → 71). Dead ends: it also ate ", controlled" ("Pair it with onOpenChange.") and " on X" ("Figma `Status` on the exposed Text Input" → "The exposed Text Input:"), and left 8 empty `/** */`; fixed by hand, then the other 71 and 39 token-path descriptions by hand.
- First auto-code of option values marked prose ("An `image` that fails") and missed `2xl` (filtered as a number); now only a value followed by punctuation, a number, or/and, or the end.
- Port 5180 was held by an existing dev server; used it (HMR) instead of starting one.
- docs.spec: updated the Brand table name and banner text assertions; 80 passed. visual.spec: every story differed, only in caption text (checked the icon diff); re-baselined, then `npm test`.

### Follow-up: prop values left as plain text in captions (2026-10-28)

- Godwin spotted `size="sm": rows and header 32 high` on the Table page drawn as plain text: Table's `Group` captions were template strings, so no `<code>`. Rewrote them as JSX with `<code>`, and added px to the sizes.
- A browser sweep of every component page (captions with `<code>` removed, matched against prop values and `prop=`) found the rest: `vertical`/`horizontal` (Checkbox, Radio, Banner, Notification), `receiver`/`sender` (Chat list item), `inline` `connector` (Progress wizard), `single`/`double` (Slider). Marked as code.
- Dead end: adding `.pg-label code` to docs.css restyled every raw story caption (raw pages load docs.css too) and broke every screenshot. Not needed: docs pages lift the label into `.docs-variant-caption`. Reverted.
- The modal and tooltip "open" screenshots still had the old captions from 47b3329; re-baselined. `npm test` 637 passed.

## Docs site on phones (2026-10-28)

- Port 5180 was held by another session's dev server; used it, then it stopped mid-sweep and I started `docs` from launch.json.
- The in-app browser's mobile preset kept resetting (the pane width changed), so the sweep ran as a Playwright script (scratchpad, not in the repo): every route at 375 and 320, light and dark, listing page overflow, elements past the screen with no scrolling ancestor, and elements clipped by a non-scrolling ancestor.
- Dead end: with `isMobile: true` the layout viewport widens to the content (538 on the brand breakdown), so `innerWidth` and `scrollWidth` agree and nothing reports. Compare with the device width instead (LEARNINGS).
- Brand breakdown (#224B8D, Show breakdown): `.docs-fold` is a grid with an implicit `auto` column, so the Table's min-content set the fold's width (538) and the Banner and table ran past the card. Fixed with `grid-template-columns: minmax(0, 1fr)`. Then the Table scrolled sideways inside the card with the Fix column out of sight, so below breakpoint/md the breakdown is a stacked list (where, theme and contrast, fix); the table from md up.
- Color picker popover was 352 wide on a 320 screen: `max-width: calc(100vw - space-sm * 2)`.
- Date Range Picker: two fields side by side cut the year off at 320 and 375; the fields stack below breakpoint/sm (component CSS, map row updated).
- Sidebar demo: the story Frame (width 100cqi) clipped the sidebar at 320; the Frame is now at least min-content, so the demo stage scrolls.
- False positives filtered: React Aria's hidden selects (clip), Progress fills (translated inside their track).
- Touch targets under 24 outside the demos: CodeText copy (12x20, on every style page), Dropdown toggle and Clear, date field calendar button, Chat message bar field icons (20). Gave each a centred control/xs `::before` hit area, Chip's pattern. Left: date segments (inline text) and the Calendar title toggle (98x20 inside its pill).
- Shell (menu, search modal, page header, theme switch), every style page, all Brand tabs and the Reset modal: no overflow at 320.
- Added "on a phone" to tests/docs.spec.ts (every route at 320, the breakdown inside its card as a list, picker/menu/search on screen); checked it fails with the fold fix taken out. Added `npm run docs:phone` (`vite --host`), in CLAUDE.md and README.

### Follow-up: phone toolbar hides on scroll down (2026-10-29)

- Godwin: the Light/Dark switch and search bar should hide on scroll down and show on scroll up.
- DocsApp's existing scroll listener now also tracks direction: `data-away` on `.docs-toolbar` after 8px down, cleared after 8px up or within 120px of the top; never while the menu is open. CSS below breakpoint/md only: translate -100% under the top bar (top bar raised to z-index 3), duration/md easing/out, opacity under reduced motion, stays while focus is inside. Desktop unchanged.
- Spec "on a phone" covers down, up and back to the top; docs + a11y specs pass (246).

### Follow-up: style page footnote (2026-10-29)

- Godwin: remove "Token values as of <date>" from the style pages. Dropped that sentence (and the unused `tokensExportedAt`); the footnote keeps "Copy a token name with the button beside it." docs.spec passes.

### Follow-up: phone top bar and push menu (2026-10-29)

- Godwin: bigger logo on mobile, a menu icon on its left that opens the sidebar by pushing the content right.
- Top bar: ghost sm IconButton (List, X while open; "Menu" / "Close menu") then the logo at heading-sm (was title-md); same 32 row, so the toolbar's sticky offset is unchanged.
- Sidebar on phones: fixed, full height, `min(sidebar-width, 100vw - space-6xl)` wide, slides in from the left while the top bar, the toolbar's contents and the page translate by the same width (duration/2xl easing/drawer, none under reduced motion). `.docs` gets `overflow-x: clip` so the pushed page never scrolls sideways; the root stops scrolling while open. Written mobile first and undone from breakpoint/md.
- A scrim over the visible strip closes it; first run it sat over the top bar's close button (Playwright waited on the intercepted click), so the top bar goes to z-index 5 while open. Escape and following a link close it too.
- The toolbar's own `translate` (scroll hide) would have clashed with the push, so the push moves the toolbar's children instead.
- Spec covers open, the push distance, strip, Escape and link; docs + a11y pass (247).

### Follow-up: phone top bar polish (2026-10-29)

- Godwin: more padding above and below the logo, a slightly bigger menu icon, no border under the bar, and the logo turning into Close (body-lg, animated) while the menu is open.
- Padding space-sm to space-md (bar 56); the toolbar's sticky top now reads `--docs-topbar-height` instead of repeating the sum; sidebar head top padding follows so its logo stays level. Border removed. Menu icon icon/lg on the sm button.
- Logo and Close share one grid cell and cross-fade with a space-xs blur (the Sidebar slots' recipe), duration/md easing/out, opacity only under reduced motion; the hidden one is `visibility: hidden` so the home link leaves the Tab order. Close is aria-hidden (the X is the named button) and closes on press.
- docs + a11y specs pass (247).

### Follow-up: menu button to the end, ListBullets (2026-10-29)

- Godwin: move the menu icon to the other end of the bar and use ListBullets.
- Logo first, menu button last (`justify-content: space-between`). ListBullets added to playground/docs/icons.tsx from Phosphor's regular glyph on the 24 grid (lines stroked, dots filled).
- The push moves the bar right by the menu's width, so a button at the end leaves the screen while the menu is open: Close (in the strip) became a real button named "Close menu" and takes focus on open; closing from it hands focus back to the menu button. The X icon swap is gone (never seen).
- Dead end: Close could not take focus as the menu opened: its `visibility` transition started at hidden. Visibility now switches on at once and off only after the fade (transition set per state).
- Test names: `{ name: 'Menu' }` also matched "Close menu"; exact match.
- docs + a11y specs pass (247).

### Follow-up: the menu opens from the right (2026-10-29)

- Godwin: the menu should come from the side its button is on: from the right, pushing the page left.
- Sidebar `right: 0`, `translate: 100%` closed; the top bar, toolbar contents and page translate left by its width; the scrim covers the strip on the left. The menu button now stays on screen (pushed into the strip), so it shows X ("Close menu") again and Close fades in beside it (blur cross-fade, aria-hidden, closes on press). The focus hand-off from fc8d354 is gone: focus never leaves the button.
- Strip widened to 2 x space-5xl (112) so Close and the X fit at 320 (menu 208 there, 256 from 368 up).
- docs + a11y specs pass (247).

### Follow-up: Hide instead of Close (2026-10-29)

- Godwin: Hide and the EyeClosed icon instead of Close and X while the phone menu is open. Button named "Hide menu"; class renamed `docs-topbar-hide`. docs + a11y specs pass.

## Docs: Play all beside Durations, Brand theme in search (2026-10-29)

- Godwin: Play all should sit on the Durations heading's row, at the far end; Brand theme never came up in search.
- Play all moved into the Durations section's `action` (`StylePage.tsx`). Search listed only the style pages in Foundations (empty query and title matches); Brand theme added to both (`pages.tsx`). The search spec now opens on Brand theme and finds it by "brand" (that spec edit landed in 42f7361, swept into the mobile session's commit).

### Follow-up: Grid page columns switch floats on phones (2026-10-29)

- Godwin: on mobile only, Show columns as a floating button at the bottom left, with elevation.
- Below breakpoint/md `.docs-grid-switch` is fixed space-lg from the bottom left (plus the safe area), z-index 2 (under the phone menu), label on surface-100 with elevation/neutral/mid (surface-200 sank into the grid frames); brand tint while on. From md it is inline again with the old fill and no shadow. Keys stay hidden on phones as before.
- Spec: after a scroll the switch is in view, 16 from the left and bottom, and works. docs + a11y pass (248).

### Follow-up: columns switch bottom right, primary when on (2026-10-29)

- Godwin meant bottom right, and the button primary while on. Phone only: `right: space-lg`; on, the brand Button's primary fill (`button-brand-primary-rest`), text-on-color, elevation/brand/mid. Desktop keeps its inline brand tint. Spec checks the right edge. docs + a11y pass.

### Follow-up: columns switch primary in both states, no tap highlight (2026-10-29)

- Godwin: the floating columns switch is primary whether on or off; and the blue flash on tap should go.
- Switch: one rule for both states (button-brand-primary-rest, text-on-color, elevation/brand/mid), pressed fill on `:active` (phone only). Tap flash: `html { -webkit-tap-highlight-color: transparent; }` in playground.css (inherited, covers the whole docs site and raw stories).
- Another session was editing DocsApp.tsx and docs.css (search field) at the same time: staged only my docs.css region by writing the index blob from HEAD plus my block (`git apply --unidiff-zero` had put a hunk inside the wrong media block). docs + a11y pass (248).

## Docs: search button as a field (2026-10-29)

- Godwin's image: the toolbar's search trigger as a grey field with a magnifier and "Search", then the ⌘ and K keys.
- `DocsApp.tsx`: MagnifyingGlass icon (icon/md, icon-subtle) + "Search" in the label; `aria-label="Search Bland"` keeps the name. `docs.css`: `.docs-search-field` (inline-flex, gap space-sm). Field and keys all 32 tall. Docs spec passes (148).

### Follow-up: bigger columns switch, bigger menu hit area (2026-10-29)

- Godwin asked which size the columns switch was: 32 tall (the toolbar's search-label look, Button sm's height). Now Button md's on phones: 40 (space-sm by space-lg padding); inline from md it keeps 32.
- Menu button: unchanged 32 button and icon/lg icon, with a control/lg (56) `::before` hit area centred on it, the bar's full height; it reaches the screen corner (checked with elementFromPoint at 370,6). docs + a11y pass (248).

### Follow-up: phone polish round (2026-10-29)

- Godwin's list: Overview stat cards one a line on phones; the toolbar stopped hiding after a theme switch; swipe to open the menu (scrollable rows first); variants centred even when they wrap; Brand page copy broken and the picker choppy on the phone.
- Stat cards: one column below breakpoint/md, auto-fit from md (they are on the Overview page, not Brand theme).
- Toolbar: `:focus-within` → `:has(:focus-visible)`; checked the tapped radio holds focus without :focus-visible.
- Variants: `.docs-variant-box .pg-row { justify-content: center }`; checked badge, toggle, accordion, avatar at 375.
- Swipe: touchstart/touchend on window, phone only; 56 px sideways, 1.5x more sideways than down; left opens (the menu comes from the right), right closes. Scroll containers under the finger that could still scroll that way at touchstart win. Fields, sliders and the picker are skipped. Spec dispatches TouchEvents (row at its end then opens).
- Copy: `useCopy` falls back to execCommand when there is no Clipboard API (plain-http network address); checked with clipboard removed in an init script.
- Picker: profiled core functions (generate 0.1 ms, neutrals 0.8, check 0.2, fixScale 2.3, generateChart 59). Picker local state + rAF/startTransition sends; chart palette via `useSettled`. 4x CPU throttle drag: 24 s → 2.5 s, long tasks 22.8 s → 0.4 s.
- docs + a11y 250, code-snippet 9 pass.

### Brand breakdown on phones in body-lg (2026-10-29)

- Godwin: the contrast warning breakdown on mobile uses the body-lg family. `.docs-findings-list` went body-md → body-lg, `.docs-findings-where` body-md-bold → body-lg-bold; the meta line inherits. Checked at 375 light: rows wrap cleanly, no overflow.

### Smallest to largest ordering (2026-10-29)

- Godwin: every ordered list in the docs should go from smallest to largest (the icon sizing table read xs md lg sm), but leave Typography alone. He agreed to sort durations by ms.
- Cause: the style pages showed tokens in Figma's export order, and props.json kept TypeScript's union order. Added `bySize`/`bySteps` in data.ts and applied them per page (not inside TokenTable, so Typography's table is untouched).
- Scanned the story arrays, hand-written `size="…"` sequences, story labels and prop descriptions for sizes going down. Found Button `['lg','md','sm','xs']`, Logo `['lg','sm']` with its type, and the descriptions of Button, Logo and ScrollArea fadeSize; flipped them. The other hits were mappings (`{ sm: 'xs' }`) or unrelated.
- Checked in the browser: Sizing icon xs sm md lg, Spacing none → 9xl, Motion 100 → 5000, Button props xs sm md lg. Playwright: 703 passed; 4 screenshot diffs, all Button and Logo in the new order, re-baselined.
- Motion page follow-up: Godwin asked whether the Easings dots should move. They did, but only from Play all in Durations, and their track was invisible in dark (surface-200 = the table cell). Track → surface-300 (df9ba18), and Easings got its own Play (separate run counter).

### Motion tables on phones: a wider Use column (2026-10-29)

- Godwin: the Use column on Motion's Durations and Easings tables was too narrow on mobile (128px), so rows ran very tall. `TokenTable` takes a `className`; the two Motion tables get `docs-motion-tokens`, whose Use column has `min-width: 280px` below md (reset from md, desktop unchanged). At 375: Durations 5586 → 2226px tall, Easings 866 → 506. The table already scrolled sideways on phones. Docs tests 150 pass.

### Handoff update merged (2026-10-29)

- Godwin shared `bland-handoff-update-2026-10-16.md` (from the claude.ai project) and asked to prioritise what the repo already has.
- Its code-facing decisions were already current here: stroke rename, overflow (the repo's newer rule wins: scrollbar only while scrolling), `Fade/*-clear` skipped, the Messaging quote renames, the Indicator danger label. Nothing in code changed.
- New `docs/figma.md`: file rules (doc pages show what the file has, when a variable may be deleted, description rules, native slots only, stickersheets as components), the overlay fade wiring, the GRID gotcha, Plugin API techniques. Four Figma entries and one Claude Docs entry added to LEARNINGS.md.
- The file is archived in `docs/archive/` with a header listing what is out of date (scrollbar visibility, 12 collections, grid styles, Code snippet height, scroll areas, shadcn). The older `claude/bland-handoff.md` is still in the claude.ai project.
- Then Godwin shared `bland-handoff.md` (85k tokens, Figma build notes per component) and asked to delete unneeded files after. Read the conventions, Pending decisions, Key IDs and order sections; Status is per-component Figma history, superseded by the component map. Lasting conventions went into `docs/figma.md` ("Building a component in Figma"); the file is archived with a header naming what is stale (pending decisions settled in code, stroke names, the plan doc, the shadow rule for Tooltip). CLAUDE.md "Pending context" is now empty. The two Downloads copies were deleted once archived.

## Cloudflare site build (2026-10-29, release side session)

- Godwin: Cloudflare, not Vercel; landing page plus a link to the docs; he designs the landing page in Figma.
- Added `site/_redirects` (`/` → `/docs/` 302 for now), `npm run site:build` (docs build copied to `dist-site/docs/` plus `site/`), `.node-version` 24, `dist-site/` and `.wrangler/` gitignored.
- Checked with `npx wrangler@4 pages dev dist-site --port 5193`: `/` 302 to `/docs/`, `/docs` 308 to `/docs/`; Chromium on /docs/ (avatar, chat bubble, brand, typography pages): image 200, Inter loaded, no failed requests.
- `docs/release.md` gets a Cloudflare Pages section (dashboard settings, the wrangler command); CLAUDE.md commands, roadmap and open question updated.

## bland-ui, MIT, public site; Grid button shadow (2026-10-29, release side session)

- Grid page: the desktop Show columns button had the phone's brand shadow while on: the phone's `[data-on]` rule set it and the `min-width: 768px` block reset the shadow only for the resting state. Added `box-shadow: none` to the desktop `[data-on]` rule; checked in Chromium at 1280 (none, on and off) and 375 (kept).
- Renamed the package to `bland-ui`: package.json, README, docs/release.md, agent-skill, the docs site's import lines (ComponentPage, Overview), the Code snippet story text and its specs, the smoke test, `from 'bland'` lines in CLAUDE.md and INTERFACE.md. Older log entries left as written.
- MIT LICENSE added (Copyright 2026 Godwin John); the smoke test now requires it in the tarball.

## Published bland-ui 0.1.0 (2026-10-30, release side session)

- Godwin made an npm account (`gdwn`) and ran `npm login`; `bland-ui` still free. Removed `private: true`, dated the CHANGELOG 0.1.0, README and agent notes say published; typecheck and `npm run test:package` passed.
- First `npm publish`: E403, the account had no 2FA. Godwin turned it on. Second, from my shell: EOTP, npm wants a browser confirmation and a non-interactive shell exits instead of waiting. Third: `npm publish` typed into Godwin's Terminal panel; he pressed Enter, approved in the browser: `+ bland-ui@0.1.0`.
- `npm view bland-ui`: first `0.0.0-stage` (npm's placeholder while processing), then `latest: 0.1.0`, MIT, maintainer gdwn.

## Font family tokens, 0.1.1 prep (2026-10-30)

- Godwin's call (2026-10-29): `--font-sans` and `--font-mono` that every text style reads, overridable in `brand.css`; reverses the "no raw `--font-*`" line in CLAUDE.md for these two only. No Figma or tracker access in this session.
- Checksum before: `{"count":638,"hash":"4a186ff6"}`; the raw export is untouched, so it stays that.
- `scripts/tokens/core.ts`: first cut keyed the tokens by family name (Inter, Geist Mono). Dropped it: a family change in Figma would have failed the build. Now by role (`Code/*` → mono, others → sans), the value is Figma's family plus a fallback stack; `cssValue` carries the `var()` shorthand, `light` the resolved one. `build-tokens.ts` puts `Font families` in the overridable `:root` block. 588 tokens (2 new).
- Checked the 23 resolved shorthands against the old `tokens.css` with the `var()`s substituted back: identical.
- Drift test added (family/sans → Söhne reaches `--font-sans` and `--type-body-md`); the report names a single-mode change `value`, not `light` (first run failed on that).
- Lint: `font-family: var(--font-*)` already passed (a function, not a word). Added: redefining either token in a component fails; `font: 400 14px/20px var(--font-sans)` fails like any hardcoded shorthand; the family message names the family tokens. Fixtures in good.css / bad.css.
- Brand tool: `fontStack`, `parseFonts`, `blandFonts`, `toCss(…, fonts)`; `--font-sans` / `--font-mono` on generate and check, `check` keeps the file's. Three tests. Brand theme page left without font fields (its previews would need the font files; screenshots baselined): follow-up.
- Docs site Typography page: a Font families table first. Docs pages have smoke tests, no screenshots.
- Package smoke test now generates with `--font-mono "Smoke Mono"` and checks a CodeText's computed family.
- Docs: tokens.md, brand.md ("Fonts"), lint.md, README ("Your fonts", with an `@font-face` example), agent-skill.md, INTERFACE.md, LEARNINGS.md, CLAUDE.md. `fonts.css` and the CodeText prop comment reworded.
- 0.1.1 in package.json (package-lock had been left at 0.0.0; `npm version` set both), CHANGELOG entry "unreleased" for Godwin to date at publish. Not published.
- Checks: typecheck, lint:css, test:lint (4), test:brand (31), test:drift (6), build, checksum unchanged (4a186ff6). `npm test`: 707 passed, no screenshot changed. This cloud container has Playwright's Chromium only at `/opt/pw-browsers/chromium`, not the 1.64.1 headless shell, so both suites ran from a local config / script copy with `executablePath` set (not committed). `test:package`: every check passed (brand fill, Inter loaded, CodeText on `"Smoke Mono"` from the brand file, dark section, extra roles, tooltip) except one console 404 for `/favicon.ico`, which the full Chromium binary requests and the headless shell doesn't; not from this change. Run it on the Mac before publishing.

### Font tokens merged, Figma pointers (2026-10-30)

- The cloud session's PR #1 (`--font-sans`, `--font-mono`, 0.1.1 prepared) was checked here before merging: typecheck, lint, test:lint, test:brand, test:drift, checksum, build, 707 Playwright tests and `test:package` all passed on the Mac (no favicon 404 here; that was the cloud browser). Fast-forwarded and pushed; the lockfile still said `"name": "bland"`, fixed in its own commit.
- Figma: `family/sans` and `family/mono` descriptions now name `--font-sans` / `--font-mono` and point to docs/brand.md, Fonts. Synced with the drift check (2 descriptions changed, no CSS token affected), applied, regenerated; checksum `e4400790` matches Figma.
- Left: the CHANGELOG date (Godwin, at publish time) and a live font tester on the docs site (next).

### Font tokens by role (2026-10-30)

- Figma: renamed `family/sans`/`mono` to `family/body`/`code`, added `family/heading` (alias of body), rebound Display, Heading, Title. Drift check: 1 added, 2 changed, 9 text styles changed, no CSS affected before the build change. Applied; checksum `b6fb0406` (639 variables) matches Figma.
- Build: font role from the bound family variable; an aliasing family emits `var()`. The CSS writer's `:root` block printed resolved values only, so `--font-heading` came out as Inter until it used `cssValue` too.
- Renamed through the brand tool (and its tests), lint rule and fixtures, drift test, package test (now also sets `--font-heading` and checks a Title follows it while body stays Inter), docs site note, README, CHANGELOG (still unreleased), docs, CLAUDE.md.

## Font tester on the docs site (2026-10-30, cloud session)

- Read CLAUDE.md, INTERFACE.md (Brand theme page, font tokens by role), docs/brand.md, BrandPage.tsx, brandStore.ts, scripts/brand/core.ts (`fontStack`, `toCss`, `FONT_ROLES`).
- Checked that a root inline `--font-body` reaches every `--type-*`: they are defined on `:root, [data-theme]` with `var(--font-*)`, so the value inherits into themed sections too.
- Built `playground/docs/fontStore.ts` (picks, paint, installed check, Google loader, font file loader) and `FontTester.tsx`; wired the tab and the CSS panel into `BrandPage.tsx`, the store into `DocsApp.tsx`; styles in `docs.css` (tokens only).
- Tests in `tests/docs.spec.ts`: installed font (a FontFace added by an init script stands in for an installed font; Geist Mono's woff2 from node_modules under made-up names), heading follows body, other pages follow, Reset; Google with `page.route` (CORS headers needed on both the CSS and the font file, since the page fetches cross-origin); upload through `setInputFiles` with a buffer; phone width for each source.
- First upload run failed: the success note only showed in the file row, so the row now says "Loaded as …".
- Screenshots at 1280 light and dark and at 320: "Google Fonts" truncated in the segmented bar at 320, so the segment says "Google". No story screenshot changes (the Brand page has no visual baseline).
- Playwright ran from an uncommitted config with `executablePath: '/opt/pw-browsers/chromium'` (LEARNINGS, "Playwright in a cloud container").

## Font tester: six presets, merged branches deleted (2026-10-30, cloud session)

- Godwin's call: the Fonts tab is too much and what it tries can't be copied. Read FontTester.tsx, fontStore.ts, BrandPage.tsx's How to use, docs.css, the font tests, docs/brand.md.
- `npm ci` (node_modules was missing), then `npm view` for each package: geist 5.3.0, dm-sans 5.3.0, source-serif-4 5.3.1, lora 5.3.0, playfair-display 5.3.0; each has 400.css, 500.css and 600.css. Added as exact devDependencies.
- Rewrote `fontStore.ts` (presets, literal per-weight `import()` loaders, picks for body and heading, `fontInstalls`) and `FontTester.tsx` (two Dropdowns, a Code block without a picker); How to use now shows the install line and imports instead of the Google `<link>`. Removed the form/input CSS, added `.docs-font-select` and `.docs-font-kind`.
- Showing each option in its own font turned out simple: the tab loads the six presets' `@font-face` rules on mount, and the files download only when the menu draws the names.
- Tests: first run, two failed on `toContainText` on `.bland-dropdown__button`: the chosen value is drawn in the field, the button is an empty overlay. Asserted on `.bland-dropdown__field`; all five font tests pass.
- Looked at screenshots of the open menu and How to use at 1280.
- Playwright from the uncommitted `pw.local.config.ts` with `executablePath` (LEARNINGS, "Playwright in a cloud container").
- Checks: typecheck, lint:css, test:brand (31), docs:build (each preset weight is its own CSS file in `dist-docs/assets`; picked Playfair Display in `docs:preview` and it loaded from there), `npm test` 712 passed, no screenshot changed (the Brand page has no visual baseline).
- Branches: `claude/sharp-brahmagupta-f511pt` (PR #1) and `claude/affectionate-curie-ctsi28` (PR #2) are both in `git branch -r --merged origin/main` and both PRs show merged, but `git push origin --delete` got HTTP 403: this session may push only its own branch. Left for Godwin.

### Branches cleared; Fonts tab from Figma (2026-10-31)

- Removed the last spare branch: `claude/batch1-decisions-b6936a`, merged and checked out in a clean old worktree (`.claude/worktrees/batch1-decisions-b6936a`); `git worktree remove` then `git branch -d`. Only `main` is left, here and on GitHub.
- Read Figma 6907:11680 (Brand theme / Fonts): the whole frame was too large for get_design_context, so read the article (6907:11749) and the sample panel's bindings with use_figma. Found the sample text bound to text-on-color, which is white in dark on a white surface-inverse: used text-inverse.
- Rebuilt `FontTester.tsx` as the design's cards (Chip, inverse sample button, RadioGroup of ListItems), CSS in docs.css. The docs site already had a TextAa icon; my copy duplicated it and was removed. The RadioGroup lines its children up at the start, so the list needed `align-self: stretch`. Coordinate clicks in the browser pane hit the wrong rows; clicking the label element worked, and the tests use `getByRole('radio')`.
- Tests: pickFont now opens the card's sample and checks the radio; the Chip shows the pick; Code's card has no button.
- Follow-up (Godwin): a press anywhere on a font's row picks it (the name's label stretches over the row with `::after`; List's own hover and pressed fills), and the list opens and closes with the shared `.docs-fold` (as the contrast breakdown), `--docs-fold-gap` space-sm. Tests: the helper presses the row's label (the label now covers the radio, so `.check()` waited forever), and a mouse press on a row's "Serif" picks it, after scrolling the row into view and letting the fold finish. One run saw a Pill tab axe contrast failure while the dev server was reloading edited files; it passed 4 of 4 with and without the change afterwards.

## Docs: token table spacing, live font values, code font picker (2026-10-31, cloud session)

- Read CLAUDE.md, INTERFACE.md (font sections), docs/brand.md, parts.tsx, StylePage.tsx, FontTester.tsx, fontStore.ts, docs.css, the Fonts tests.
- `npm ci`; `npm view` / `npm pack --dry-run` for `@fontsource/jetbrains-mono`, `fira-code`, `ibm-plex-mono`: all 5.3.0 with 400.css and 600.css. Added as exact devDependencies.
- TokenTable: Figma name margin space-xs, then space-sm after a screenshot (4px still read as touching the chip); Use column text-bold.
- Live font values: computed root values (`getComputedStyle(document.documentElement)`) re-read on each pick, used by TokenTable for FONT_FAMILY and FONT tokens and by the Typography page's text style rows. The `--type-*` composites are defined on the root, so their computed value already has the picked family substituted.
- Searched the docs for static font names: the Typography lead now says "unless a project sets its own"; How to use's fonts.css note reworded. Left alone as still true: Overview and pages.tsx ("Inter and Geist Mono" as Bland's fonts), CodeText's prop description (already says unless the project changes it), the token descriptions in tokens.json (generated from Figma; they describe Bland's defaults).
- Code picker: fontStore gains CODE_PRESETS and the code role; FontTester's Code card is now a FontCard like the others. First alt texts ("Ligatures, tall letters", "No ligatures, a classic look") squeezed the names into ellipses at 320px; shortened to one or two words, and the phone test checks no name is cut.
- Tests: one new assertion first matched two rows (the heading row's description names `--font-body`); matched on the token chip instead.
- Playwright from an uncommitted `pw.local.config.ts` with `executablePath` (LEARNINGS, "Playwright in a cloud container").

### PR #4 merged: code font picker, live values, token tables (2026-10-31)

- Checked here before merging. The first full run timed out page after page: the docs dev server had been started before `npm install` added the new Fontsource packages, so pages that import them never loaded. Restarted it (`npm run docs:stop`, then the preview); 717 passed. Typecheck, lint, brand tests and docs:build passed.
- Tried it: DM Sans and Fira Code picked; Fira Code's ligatures show in the sample; the Typography page's values and the Font families table name the picks; the Figma name sits 9px under the chip; Use is text-bold.
- Found one more stale font name: the generated `--font-*` descriptions in the Use column said "The Inter family…" beside a DM Sans value. Reworded in `scripts/tokens/core.ts` to "Bland's default is Inter", and the heading one no longer names a family; regenerated (checksum unchanged, b6fb0406).

### 0.1.1 ready to publish (2026-10-31)

- Found the README and the 0.1.1 CHANGELOG told npm users to run `npm run brand`, which only exists in the repo. Reworded: fonts by hand (example in the README), colors from the Brand theme page, the command only in a clone. Also `docs/agent-skill.md` (a project's agent never runs it in the project), `docs/release.md` (opening said nothing was published) and the Brand theme page's intro.
- CHANGELOG 0.1.1 dated 2026-10-31; version already 0.1.1. No earlier tags, so none added.
- Checks: typecheck, lint:css, 717 Playwright tests, test:package all passed. Two stale docs servers were both on port 5180; stopped them and started one before testing.

### Own fonts on the Fonts tab; Brand page intro (2026-11-01)

- Added the Your own font block (FontTester `OwnFont`, a CodeSnippet) and a pointer in How to use; rewrote the Brand theme intro and its search description to cover fonts and extra colors. A test checks the block. 717 passed.

## Raised and sunken surfaces (2026-11-02)

- Godwin's question from shadcn's docs (a screen recording): two grays equal in light, one lighter and one at the page color in dark. Explained as separate role tokens; Bland's numbered surfaces only mirror. Godwin's case: a surface-200 page with surface-100 cards turns inside out in dark. Agreed: `surface-sunken` (Neutral50/950), `surface-raised` (Neutral0/900), `surface-raised-hover` (Neutral50/800); no separate token equal to surface-200.
- Figma: created the three Theme variables (ALL_FILLS, like the other surfaces) and reworded surface-200's description. Figma stored "Bland's" as `&#39;`; reworded both descriptions without the apostrophe.
- Sync: drift check's local half as usual, but on the Figma side ran a short script returning only the four records and the meta hash (131f163, unchanged) instead of pasting the 17 KB check; the checksum after `--apply` (642, fce24ba5, equal both sides) is what proves nothing else differed.
- Docs site: the Playground and variant frames (`.docs-frame`, `.docs-variant`) moved from surface-200 to surface-sunken; the white box inside stays surface-100 so demos sit on the page color. Checked in dark in the browser: frame, box and page all #0a0c10, the box's border shows it (the shadcn look).
- 0.1.1 is already on npm, so version 0.1.2 and a CHANGELOG entry (unreleased until Godwin publishes).
- Godwin rejected the docs frame change (in dark the frame matched the page and "shows nothing"; he wants the lighter frame back): reverted to surface-200. Used the tokens on the Overview instead: page surface-sunken, stat cards and tiles surface-raised, tile hover surface-raised-hover. The page color is a `--docs-page` variable on `.docs` (also the top bar, the toolbar and its fade, and the dotted stats box), set to sunken with `.docs:has(.docs-hero)`. Checked light and dark in the browser. In light the page now matches the sidebar (both Neutral50).
- Godwin: Claude dates the CHANGELOG, not him. Dated 0.1.2 today.

## Raised parts and see-through fields (2026-11-02)

- Godwin asked for an audit of where the new surfaces belong, then sharpened it: code snippet, text input and chips look sunk in dark, and fields blend into raised cards and modals (both Neutral900, like the old field fill).
- First proposal for fields was solid Neutral800 in dark; Godwin pointed out it would glare on the page (1.50:1 against 1.12 in light). Switched to a see-through white overlay (6% / 10%), compared with shadcn (`dark:bg-input/30`, about 5% white) and Apple's fill colors. Godwin then asked for the same in light (a field on a gray page vanishes too): black 6% / 10%, reusing the existing Neutral alphas.
- Figma: scanned each component page for fills bound to surface-100/200/300, rebinding only nodes of the main components (skipping nested instances, which inherit). 13 sets rebound; Pill disabled left on surface-200. Created white-a6/a10 and surface-field/-hover, moved the TextInput, Dropdown and message bar tokens.
- Sync: same short Figma-side script as the morning's sync (11 records, meta unchanged by construction), `--apply`, checksum 646 / `43def3ff` equal on both sides.
- CSS: 24 lines across 13 components, plus header comments that named the old tokens. Docs Elevation page: sunken stage, raised cards.
- 0.1.2 is already on npm, so this is 0.1.3.
- Follow-up: Code snippet's selected file tab was surface-100 (the page) on a snippet now surface-raised; in dark it looked cut out. Scoped override in code-snippet.css and instance overrides in the Code-snippet component (3 variants), so FileTabs alone keep the page color. New spec compares the tab with the snippet in dark.
- Godwin's Overview update in Figma (6967:7376): stats on the dots without the brand frames, plain tiles. Built in Overview.tsx / docs.css. Fixed one token: the Figma link tray surface-300 → surface-field (also rebound in Figma). Kept border-subtle dots over Figma's surface-600. Checked light and dark in the browser.
- Figma has no API to reorder variable groups (collection `variableIds` is read-only); Godwin asked for the Theme groups sorted, gave him the order to drag.

## Token audit (2026-11-03)

- Godwin asked whether every token has a job nothing else does. First pass counted uses in code only (`tokens.json` against `src/` and `playground/`) and flagged about 120 tokens as unused or duplicated. Godwin corrected the criteria: a token is fine if Figma uses it, or if its description gives it a role no other token covers.
- Second pass: one read-only `use_figma` census over all 77,810 layers (node, paint, gradient stop, effect, grid and text-segment bindings; text and effect style use; variables bound in styles; alias counts), split into component pages, base pages and the rest. Then read every semantic description and compared same-value tokens inside each group.
- Result: component tokens with equal values (Button ghost/stroke, the eight disabled fills, Badge/Indicator, Avatar and Chat bubble sizes) all name different variants or parts; shadow colors and Effects geometry are bound in Figma; Motion and Breakpoints are code-only by nature. Four findings left: `Fade/menu-clear`, `calendar-clear`, `text-input-clear`, `text-input-hover-clear` bound nowhere (the Dropdown, Date & Time and Text-input pages have no gradient fills); `surface-100` and `surface-raised` both described for cards and banners (raised's "no Bland component uses it" is stale, it is on ten component pages and in seven components); `surface-field` described as "fill of a field" while Text Input, Dropdown and the message bar keep their own; `Layout/margin-desktop` / `-mobile` still described as page side margins, which the grid now derives. Report only; nothing changed in Figma or code.
- Godwin: fix the three description findings, leave the fades (code draws its fade differently from Figma, which is fine). Rewrote five descriptions in Figma: `surface-100` (the page and parts flat on it; cards and banners point to surface-raised), `surface-raised` (parts on top: cards, banners, notifications, chips, pills, white parts of controls), `surface-field` (small fills inside controls; text fields keep their own tokens), `Layout/margin-desktop` (a landing page's wide minimum margin), `Layout/margin-mobile` (Modal's gap from the screen edges). No apostrophes, so nothing was HTML-escaped.
- Sync: a short Figma-side script returned the five records and the meta hash (131f163, unchanged) as `result-0.json` instead of pasting the 17 KB check; report showed 5 description changes only; `--apply`, `npm run tokens`, checksum 646 / `bacd1679` equal on both sides. CHANGELOG 0.1.3 (unpublished; npm has 0.1.2) gets a line.

## Full design system audit (2026-11-03)

- Godwin gave an audit guide (Figma, code, Figma-to-code, governance; weighted scorecard; issue template). Code side: lint, typecheck, `npm run audit`, the three unit suites (41 tests) and the full Playwright run (718 passed, 4 min) all clean; grep found no raw values in component TSX beyond computed geometry.
- Figma side, three read-only `use_figma` calls (all pages loaded with `loadAsync` in one call each): per set, unbound fills, strokes, gaps, radii, text without a style, effects without a style, default layer names; then the top offenders' exact nodes and values; then every public set's property definitions for parity with the component map. Each set root showed one raw color, stroke and radius: that is the set frame itself (Figma's dashed outline), subtracted.
- Findings and scorecard (4.2, provisional: adoption unmeasured) in `docs/audit-2026-11-03.md`. Checked two CLAUDE.md notes against the file on the way: `_menu-item` rows are already top-aligned, and the selected disabled Pill count is a neutral primary Indicator, so both notes are stale.
- Godwin (2026-11-03): Text Input looked too dark in Figma. Cause: the see-through field fill was on the field frame (`inner-border`) and again on frames inside it (`main` in Text Input and Search Input; root and `inner` of `_leading-input` / `_trailing-input`), so two or three layers added up. Solid fills hid this before. Cleared the inner ones at the source (108 nodes); the pickers, Pagination's page field, the Slider field and the Dropdown trigger follow through their instances. Rescanned every page with field fills and the Doc site: no stacking left (the Chip close box in a Dropdown chip sits on the solid raised Chip). Code was right already: one fill on the field.
- Godwin asked for an audit tracker separate from the Build Tracker, with the issues as tasks (not all will be solved). Made a Claude Doc, Bland Audit Tracker (https://claude.ai/artifact/823kGkGnk4eBSmEJ7cdNDX): an Issues table (report numbers kept, sorted medium then low, Severity and Status dropdowns with Won't fix as a status), Accepted differences, and a Score table with one column per audit. CLAUDE.md's Progress tracker section and the report point to it.

## Audit tasks 2 to 4: axe exclusions, WebKit and Firefox, Figma raw values (2026-11-03, side session)

- Tracker rows #2, #3, #4 set to In progress (Bland Audit Tracker; the status is a dropdown chip, set by replacing the cell's paragraph with a new chip).
- Task 2: `tests/a11y.spec.ts` now runs axe twice per story: every rule but `color-contrast` with nothing excluded, then `color-contrast` alone with the `knownContrast` and `disabledFieldText` exclusions. 100 passed. Check: removing the label from the "Disabled add-ons" TextInput story fails both themes with `label: Form elements must have labels (1)` (the old exclusion hid it); story reverted. Row #2 Done.
- Task 3: `playwright.config.ts` gets webkit and firefox projects (`Desktop Safari`, `Desktop Firefox`, same 1024x768 viewport), `testIgnore: 'visual.spec.ts'`. Five behaviour specs also take screenshots against the shared baselines (dropdown, menu, slider, modal, tooltip); those tests skip outside Chromium. `npx playwright install webkit firefox`.
- Task 4, read-only scan of every component page (mains, instance internals skipped): gaps 165, radii 39, strokes 27. Differences from the audit: every unbound 8px gap sits on a frame with one in-flow child (the second child is a hidden absolute focus-ring) or on a space-between row (`_calendar-title-bar`), so none shows today; the 35 Section-tab instances are not overrides, they inherit radius 4 from the four md `_section-tab-item` variants, whose outer frame has no fill, stroke, effect or clip (the visible radius is the bound rad-sm on `inner`); Progress-bar segments are radius 0 (44 frames all unbound, 12 with rad-rd on the right and unbound 0 on the left), not 4. Otter logo, Upper slot and text-area-resizer also show up: left to audit task 8.
- Task 3, first WebKit + Firefox run: Firefox did not launch at all ("Could not find profile folder"; also by hand, outside the sandbox, after `playwright install --force firefox`; macOS 27.2, Playwright 1.64.1). WebKit: 28 failures. Sorted: Safari does not focus a clicked button, checkbox or radio (Button, Chip, Checkbox, Toggle, Pills, Radio, Table radio, Section-tab arrows, Modal focus return), Tab skips links (Chat-bubble), CDP is Chromium only (Accordion), `clipboard-write` is Chromium only (Code snippet), `new Touch()` (docs phone swipe). Tests fixed with `clickToFocus` / `tabKey()` in `tests/stories.ts`, Accordion's accessibility-tree checks Chromium only, Code snippet records `writeText` outside Chromium, `docs.spec.ts` Chromium only.
- Three were components: Sidebar's peek reopened after a pointer collapse (WebKit sends pointerenter as the panel slides under a still pointer; probe logged leave then enter 200ms later) → enter and move at the collapse point are ignored. Tab indicator kept sliding after an arrow key (WebKit doesn't cancel a transition when its property is removed; probe showed `translate:running` after the key) → cancel animations when placing without motion. Text Area didn't follow the caret in WebKit → scroll the ScrollArea to the bottom while the caret is at the end. Radio's wrap past a disabled last option is WebKit native behaviour: the spec checks only the skip there.
- `npm test` now runs chromium + webkit, `npm run test:firefox` Firefox, `test:update` chromium. CLAUDE.md (`npm test` line, Playwright roadmap line), `docs/components.md` (Testing) updated; LEARNINGS.md entry.

## Audit tasks 7 to 11: Figma asset sets, demo parts, variant order, Table-row Selected, stale notes (2026-11-03, side session)

- Tracker rows #7 to #11 set to In progress.
- Read-only census (`getInstancesAsync` on every variant, all pages loaded): `Payment method icon` (117) and `Flags` (800) have 0 instances anywhere, Doc site included; each sits alone in its own Icons page frame (`Payment icons` 49:5118, `Country flags` 50:8968: Header, set, Footer). `Upper slot` and `Lower slot` have 0 instances; `Otter logo` has 1, inside `Upper slot`. The section `Components used in test sidebar` holds only those three. The How to use Sidebar's slot content was cloned in on 2026-10-15, not instanced. `text-area-resizer` has 19 instances (16 in Text Area, 2 more on Text-input, 1 on Cover). `Table-row` has 0 instances.
- Variant option order: Figma's option order is not the child order (Chip children run sm, md, lg; options read md/lg/sm) and has no API. Tested on a throwaway Chip clone (deleted): renaming every variant with one value to a temporary value and back moves that value to the end of the list, and node ids, so instances, stay. Moving values to the end in the wanted order sorts them.
- Scan of every set: sizes out of order in Logo, Icon Button, Chip, File-tab, `_calendar-action-bar`, `_pagination-item`, `_leading-input`, `_trailing-input`; true before false in Badge Icon only, List Flush, Notification Colored, Toggle Checked, `_section-tab-item` / `_segmented-bar-item` Selected, `_sidebar-item-group` Expandable / Expanded; Badge Type outline first; State with disabled before hover in Toggle, `_section-tab-item`, `_knob`, `_uploader`, `_sidebar-item` (hover/disabled/rest), and `_table-cell` (selected after disabled, and a State=selected of its own).
- Task 11 confirmed in Figma: `_menu-item` rows are top-aligned (`counterAxisAlignItems` MIN) with 24 slots beside a 24 line-height label, so the slots sit on the first line; Pills Selected=true State=disabled counts are Indicator xl neutral primary (dark: neutral-0 on checked-disabled neutral-600). CLAUDE.md Dropdown and Chip / Pills rows corrected, SectionTabs JSDoc now says the fade alone. `npm run typecheck` clean.
- Task 3 verified: `npm test` (chromium + webkit) 1166 passed, 10 skipped, 0 failed in 7.7 min; typecheck and `lint:css` clean. Row #3 Done.
- Task 4: Godwin approved A to L. One `use_figma` write on mains only: gaps bound to `space-sm` (A `_dropdown-trigger` field 96, B `_file-tab-item` close 18, C Toggle track 12, D `_calendar-title-bar` 6, E Banner content 8, F Sidebar collapse/expand 8, G Chat-message-bar close 3, H `_empty-illustration` 2), I the four md `_section-tab-item` outer frames to `rad-null` (were an unbound 4 drawing nothing; now match the other 14), J Text Area user-input 16 and K Code-snippet 3 strokes to `stroke-sm`, L 56 Progress-bar segment zero corners to `rad-null`: 232 nodes. Re-scan: no unbound gap, radius or stroke left in the kit; nested instances (Calendar's title bars, Empty-state's illustrations, Section-tab's 35 items) follow their mains. Left: Otter logo, Upper slot, text-area-resizer (audit task 8). Screenshots of Section-tab, Toggle, Progress-bar unchanged. Drift check: no drift, 646 variables. Row #4 Done.
- Godwin approved A to H (2026-11-03). Applied one page per `use_figma` call:
  - A: deleted the `Payment icons` (49:5118) and `Country flags` (50:8968) frames from the Icons page; `Crypto icons` moved left to x 2840, so the frames keep their 80 gap.
  - B: deleted the section `Components used in test sidebar` (1078:12754) with `Upper slot`, `Lower slot` and `Otter logo` (instances rechecked first: none outside `Upper slot`).
  - C: `text-area-resizer` renamed `_text-area-resizer`, description added; all 19 instances still point to 166:4939. Code comments in `text-area.css` and `TextArea.tsx` follow the new name.
  - D to G: options sorted with the rename-and-back method. First real run on Icon Button changed nothing: the definitions only append a new value when they are read between renames (the clone test had reads in between). Fixed by reading `componentPropertyDefinitions` after the first rename and after the rest; a value held by one variant gets a temporary cloned helper variant, removed at the end. Every set: same ids and names before and after. Now: Icon Button xs/sm/md/lg (layers in visual order), Chip and File-tab sm/md/lg, Badge Type primary/secondary/outline and Icon only false/true, Toggle Checked false/true and State rest/hover/disabled (false columns moved left, so the default variant is unchecked; layers in visual order), Logo Size sm/lg and Color default/on-color (default variant still lg), List Flush and Notification Colored false/true (Notification still defaults to colored), `_calendar-action-bar`, `_pagination-item` (layers in visual order), `_leading-input`, `_trailing-input` sm/md/lg, `_section-tab-item` and `_segmented-bar-item` Selected false/true, `_sidebar-item-group` Expandable and Expanded false/true, State rest/hover/disabled on `_section-tab-item`, `_sidebar-item`, `_knob`, and rest/hover/drag-over/disabled on `_uploader`.
  - H: Table-row (0 instances anywhere) now `State` rest/hover plus `Selected` false/true: the three `State=selected` variants became `State=rest, Selected=true`, node ids kept, no hover and selected variant (code gives selected rows no hover). Description rewritten; CLAUDE.md Table row updated. Screenshot unchanged.
- Variable checksum after the changes: 646 / `bacd1679` in Figma and in the repo, so no variable changed.
- Left for Godwin: `_table-cell` still has `State=selected` (60 variants, used by Table-row and the Table stickersheet).
- Godwin: split `_table-cell` too. Its 15 `State=selected` variants became `State=rest, Selected=true`, the other 45 got `Selected=false`; options now State rest/hover/disabled, Selected false/true. Same node ids; 273 instances before and after (Table 100, Doc site 165, Spacing 8), the 33 selected ones (Table page) now read Selected=true; Table-row screenshot unchanged. Description rewritten, CLAUDE.md Table row notes it. `_table-header` still has `State=selected` (0 instances): asked Godwin.
- Godwin: split `_table-header` too. Its 15 `State=selected` variants became `State=rest, Selected=true`, the other 30 got `Selected=false`; options now State rest/hover, Selected false/true. Same node ids; 89 instances before and after (Table 34, Doc site 55), none selected. Description rewritten (its `&quot;` entity replaced by real quotes), CLAUDE.md Table row notes it. Screenshot unchanged; checksum 646 / `bacd1679`.

## Audit tasks 12 to 17: List first line in Figma, RTL, statuses, deprecation, adoption (2026-11-03, side session)

- Tracker rows: #13 Done (Why: RTL not supported for now, Godwin 2026-11-03), #14 Won't fix (not publishing the library), #15 For later (homepage and bugs once the docs are on Cloudflare), #16 Done, #17 In progress. Existing Why text kept, the reason appended.
- Task 13: one line in `README.md` (top list) and `docs/agent-skill.md` (Using components): left to right only, RTL not supported yet.
- Task 16: `docs/release.md` "Deprecation": renamed token keeps the old name as an alias for one minor, renamed prop one minor with a dev-only warning, removed component deprecated one release and removed the next minor, patches never deprecate. `scripts/build-tokens.ts` emits only what Figma holds, so a token alias needs a small build change (a list of old names written as `--old: var(--new)`); described and left for Godwin, not built. Workflow step 6 in `CLAUDE.md`, a line in `docs/agent-skill.md`.
- Task 17: "Projects using Bland" section added under Issues in the Audit Tracker: Project, bland-ui version, Components used, Workarounds, Last checked; one blank row, no invented projects.
- Task 12, read-only: List set 375:6454 on the Lists page; `Lines=3+` variants (8: Flush x State) have inner (HORIZONTAL, align MIN, padding space-md/space-lg, gap space-sm) > 🧩 Leading 40x40 (list/slot-lg) + text (VERTICAL, gap space-2xs: header with a one-line title that truncates, description wraps) + 🧩 Trailing 40x40 fixed, unbound. Only instance of any 3+ variant outside the demo: the Lists Stickersheet.
- Demo 7042:2185 at 1975,-544 on the Lists page (outside the page frame): a clone of the set reduced to the two `Lines=3+, State=rest` variants (7042:2186). In each, the text and trailing slot sit in `content` > [`line-offset` (8 tall, height bound to space-sm, visible bound to 👀 Leading), `text-row` (gap space-sm, align top)], and the trailing slot hugs with min height list/slot-sm. Measured with Avatar lg + Toggle sm: avatar, title and toggle centres all at 32 with a leading slot (row 70 to 78, as in code), title and toggle both at 24 without one (the current set puts the toggle at 32 there, 8 below the title). Long description: title stays on the avatar, row grows.
- Dead end: an empty `createAutoLayout` frame with a bound top padding stayed 100 tall even with HUG; a plain frame with its height bound to space-sm works.
- Stopped for Godwin's go-ahead before touching the real set.

## Motion in every engine (2026-11-03, side session)

- Godwin: Accordion doesn't animate in Safari or Firefox; corners aren't smoothed there. Inventory of Chromium-only CSS: `interpolate-size` (Accordion, Sidebar groups), `::details-content` (Accordion), `overlay` + `display` exits (Popover, Tooltip, Modal), `corner-shape` (smoothing). Godwin: leave the rounding, fix the rest.
- Added `motion/height.ts` (`slideHeight`): Accordion (keeps `open` while folding, browser toggles instant) and Sidebar's groups (new `Nest` component; padding moved to the first row). First cut skipped the effect's first run with a flag: React Strict Mode runs it twice, so groups slid open on load and the old sidebar test caught it (open height read mid-slide). Fixed by comparing with the last shown state.
- Probe in WebKit before the exit fix: the Menu was `display: none` at once on close; Chromium faded over duration/xs. Added `overlay/exit.ts`; Popover, Tooltip and Modal use it; `allow-discrete` transitions removed. After: WebKit fades 0.39 → 0.02 → hidden, as Chromium.
- New Accordion specs: the height eases and `open` stays while folding; reduced motion is instant.

## Landing page copy (2026-11-03)

- Godwin asked for the landing page's UX copy. No brief in the repo beyond `docs/release.md` (landing at `/`, designed in Figma, docs at `/docs/`).
- Facts checked before writing: 56 component folders, about 48 public after the internal ones (`date-field`, `message`, `motion`, `overlay`, `tabs`, …), so "Over 45 components"; the Brand theme page has a contrast fix (`fixScale` in `playground/docs/BrandPage.tsx`).
- Wrote `docs/landing-copy.md`: nav, hero (three headline options), proof strip, brand-in-one-color steps, six feature cards, showcase, details, Figma to code, install, closing band, footer, page title and meta. Open: whether the Figma kit is public.
- Godwin approved A to D for task 12, the token aliases, and has no client projects yet.
- A: the 8 real `Lines=3+` variants of List 375:6454 got `content` > [`line-offset` (plain frame, height bound to space-sm, visible bound to 👀 Leading), `text-row` (gap space-sm, align top: text + 🧩 Trailing)]; the trailing slot hugs with min height list/slot-sm. Default heights unchanged (70 and 62), since 👀 Leading is off by default.
- B: the one instance (Lists Stickersheet 378:9489, no slots shown) unchanged, screenshot the same. D: no relayout needed, no variant changed size.
- C: demo 7042:2185 deleted (its copied set had no instances outside it). `CLAUDE.md` Lists row: "code only until Figma follows" replaced by how Figma does it. List description got a one-line pointer; my first write used `description` and turned `role="option"` into `&quot;` (the known double-escape); rewritten decoded through `descriptionMarkdown`. Variable checksum 646 / `bacd1679` in Figma and in the repo, so no variable changed (the checksum instead of the full drift round trip: equal hashes mean no drift).
- Token aliases: `tokens/deprecated.json` (by hand, empty) + `scripts/tokens/deprecated.ts`. The build checks the list (old name gone, replacement exists, no duplicates), writes `--old: var(--new)` in every block that defines the replacement (`:root` brand block, light, `[data-theme="dark"]`, the media query), and adds `deprecated` to `tokens.json` only when the list has entries. With the empty list `tokens.css` and `tokens.json` are byte-identical. Tried two temporary entries (themed `--surface-card` and scale `--gap-md`): aliases where expected, scale alias only in the light block; a still-existing old name and a missing target both stop the build; restored. Lint: `var(--old)` is rejected naming the new token. `npm run test:tokens` (3 pass), `test:lint` 4, `test:drift` 6, typecheck and `lint:css` clean.
- Tracker: #12 Done, #16 Why updated, #17 For later (no client projects yet; the table stays for the first one).
- Godwin: the Accordion caret waited before turning back on collapse. Cause: caret and bold title keyed on `[open]`, which now stays until the fold ends. They key on `data-open` (the open state) instead; spec checks the caret turns while `open` is still there. Accordion specs pass in Chromium and WebKit.
- Godwin: the Figma file will be public soon. Added a kit card to "From Figma to code" (Get the Figma kit, three facts) with a "coming soon" version until the Community link exists.
- Godwin: a Sidebar collapse with the pointer reopened toward the pointer. Reproduced in Chromium and WebKit by resting on the button past the peek delay before clicking (the specs clicked at once, so hover was never on): the peek went closing → open → closing. Cause: hover stayed on; the pointer leaving the sliding panel lifted the suppression while hover's 300ms close delay ran. Fix: a pointer collapse turns hover off at once. New spec records every `data-peek` state after the press (fails without the fix, passes with it).
- Godwin: a logo with no small version, and trailing parts lingering as the Sidebar collapses. `top` as a function of `{ rail }` already gives a minified logo; a plain `top` now becomes a function returning nothing in the rail, and the expand button shows there (`data-top-plain`, header padded to the rows' column). Count, trailing and caret fade to 0 over duration/2xl easing/drawer under `data-compact`. Probe: expand button at the rows' x in Chromium and WebKit, trailing opacity 0.9 → 0.25 → 0 over the slide. New story frame "Plain top"; Sidebar screenshots re-baselined (page taller by that frame).
- Godwin: the padding shifted as the Sidebar expanded. Probe: with a plain `top`, the logo started 8px in and slid to 0 as the header's start padding eased out (my rail alignment padding had a transition). Now the padding applies in `data-layout="rail"` only, at once; logo x stays 0 through the expand in Chromium and WebKit, the rail's expand button still at the rows' x.
- Godwin's recording (no top slot, dark): the row icons slid sideways on collapse and expand. Measured: icon x full 20/24/28/32, rail 12/14/18/22. Godwin chose A, a wider rail: `--_rail-pad` from existing tokens, rail 56/68/76/84; list and row padding transitions dropped (WebKit showed 22 for a frame with both easing). Specs: rail widths, icon x equal in rail and full at every size, icon x constant through the peek. Screenshot check passed under the pixel threshold anyway; Sidebar baselines re-taken. Recorded a WebKit collapse/expand for Godwin.
- Godwin didn't like the wider rail; asked for option B. Rail reverted to item + space-sm; full list padding space-sm; row and toggle padding transitions back. Icon x full 12/16/20/24, rail 12/14/18/22. Specs updated (shift 0/2/2/2, peek 14 → 16 at md); Sidebar screenshots re-baselined; story logo padding space-md to line up with the sm icons. New WebKit recording.
- Godwin: parts of the xl sidebar cut off on hover (all variants). Not reproduced: screenshots of the xl "size" sidebar at rest and hovering rows in Chromium and WebKit (raw story) and on the docs page in the built-in browser show nothing clipped; the list fade and scroll area are unchanged on hover. Asked Godwin for a screenshot.
- Godwin: stagger the collapse button. First cut used a transition delay (worked for a top slot's rail version, which is hidden in the rail, but a plain top's button just jumped beside the logo). Added `data-opening` for the slide out of the rail; the button sits at 0 then fades in. Probe in both engines: 0 through the slide, then 0.3 → 1. New spec; Sidebar specs pass.
- Godwin's screenshot: the minimized sidebars' peek was cut on the right in the docs. Cause: the story's Frame has `overflow: hidden` and at a 990px window it was 212px wide, narrower than the 256px panel; the first row (expanded) fit. Frame now has a minimum width of `--sidebar-width` plus the page's space-xl padding each side (304); the peek fits in every frame at 990 and 1280 in Chromium and WebKit. Usage rule and agent-skill line added: no ancestor may clip the rail narrower than `--sidebar-width`. Sidebar and docs specs pass (202).

## Landing page: hero (2026-11-06, side session)

- Started from the session that planned the landing page. Godwin's rule recorded in `INTERFACE.md` (Landing page): illustrations SVG or vector only; ask before any raster image.
- Read Figma: hero is `7097:36095` (Screen templates, 1440 x 1024) in `7079:35060`. Annotations now sit on their elements: nav "nav slides in"; the button ("hover on this text section, this button comes out", after typesafe.ai's hero); the headline in state `7082:35309` ("loses its fill and becomes a stroke" on scroll); the description in `7082:35309` and `7087:35838` (words highlight one by one as you scroll, a blue pill and a supporting visual pop out; ousmaneballondor.fr text scroll).
- States: `7082:35309` shows "Bland by design." as an outline (text-minimal stroke) and "Built for purpose." filled text-minimal, while the description goes text-bold with "React design system" highlighted; `7086:35405`, `7087:35771`, `7087:35948`, `7087:36040` move the highlight to "color.", "button, field, chart", "light", "dark.".
- Headline values with no token: Inter Bold 128 / 112, letter spacing -8, no text style; glow = two blurred copies (pink #eb09ff raw at 75% with a 32 layer blur, Text/text-brand at 75% with an 8 blur). Description: heading-lg variables but letter spacing -2 (the style has 0). Asked Godwin before building them.
- Setup: `site/` is a Vite + React app (`site/vite.config.ts`, root `site/`, dev port 5182, preview 5183) whose `src/main.tsx` imports Bland from `../../src` (tokens, fonts, base CSS). `npm run site`; `site:build` now builds the docs, then the landing page into `dist-site/` (empties it), then copies `dist-docs/` to `dist-site/docs/`; `site/_redirects` moved to `site/public/_redirects` so Vite copies it (still sends `/` to the docs until the whole page is ready). `lint:css` also globs `site/src/**/*.css`; `tsconfig.json` includes `site`; launch config "site"; Playwright starts both servers.
- Icons: Figma's ArrowRight, FigmaLogo and github SVGs had raw white / #15181D strokes, so they became `site/src/icons.tsx` components on `currentColor` (ArrowRight on Bland's 32 grid, the others keep Figma's 20 grid).
- Hero (`site/src/hero/`): nav bar on the page grid with the description's span (Figma's 560 = four desktop columns of 128 + three 16 gutters), Logo sm, text links hidden below breakpoint/sm (icons stay); headline and description in `.bland-grid`; the button sits over the headline and comes out on hover or keyboard focus with a fine pointer from breakpoint/xl (duration/md easing/out, scale 0.96 to 1; opacity only under reduced motion), in the flow under the headline otherwise. The headline uses Display sm / md / lg for now (Figma's 128 has no token), no glow.
- Headline motion prototype: `site/proto-headline.html` (temporary, with `site/public/proto/tokens.css`; delete before committing) at Figma's raw size: words rise in on load, staggered; a scroll scrub fades each word from bold to gray, then to the outline, in reading order (the Figma state 7082:35309 shows at about 70%); the glow rides on the bold layer. Vite served `site/public/proto/headline.html` as the SPA index, so the prototype is a root HTML page.
- `tests/site.spec.ts`: axe in both themes (description left out of the contrast rule: text-minimal is 1.6:1, pending Godwin), phone 320 (no sideways scroll, button shown, text links hidden), desktop hover and focus reveal. 10 pass in Chromium and WebKit. Playwright's `hover()` on the h1 timed out (the absolutely placed button sits over its centre); the test moves the mouse to the heading's top edge instead.
- Godwin: test in Chrome (Claude in Chrome), always leave a dev server he can open (saved to memory). "That's nothing like Figma": follow Figma exactly, the landing page may break from the text styles.
- Rebuilt the hero to Figma: `site/src/landing-values.css` holds Figma's values (lint-ignored), everything else reads them or tokens. Headline Inter Bold 128 / 112, -8, 848 wide, Figma's three lines from xl, glow as two blurred pseudo copies (pink #eb09ff blur 16 and text-brand blur 4, both 75%); description Semi Bold 43 / 48, -2, 560 wide; nav 560 wide at 40 with the Logo at Figma's 60% (20.4 / 24); the button gets Elevation/brand/far as in Figma. Dropped `.bland-grid` from the hero: Figma's widths are fixed and centred.
- Chrome at 1440 wide: nav 560 x 40 at y 40, headline 848 x 336 at y 258, description 560 wide at y 710 (Figma 712). Chrome's window would not shrink below 2056, so the phone check ran in a 390 x 844 iframe in the same tab: no sideways scroll, headline 56 (floor raised from 48), description 24, button shown. New spec holds the desktop geometry to Figma; 12 pass in Chromium and WebKit.
- Godwin: force light where the design is light, whatever the system; description closer to the bottom of the screen; build the animations. Read the five scroll states in Figma: each lights a phrase with a brand pill (Surface/surface-brand, rad-lg) and an icon (react, Swatches, DiamondsFour, Sun, Moon); the last frame (7087:36040) has the Theme collection set to Dark, so the hero ends dark.
- Built it (`site/src/hero/story.ts` for the thresholds, `Hero.tsx`, `hero.css`); prototype page removed. Icons downloaded from Figma into `site/src/hero/visuals/` and used as delivered. Swatches is 2.3 MB (560 kB gzipped): its 22 strokes are outlined paths in the Figma source itself (Figma's own SVG export is 1.3 MB), so it loads lazily; flagged to Godwin to simplify in Figma.
- Chrome, desktop: states at 0.3 / 0.45 / 0.6 / 0.75 / 0.92 of the track match the five Figma frames; dark from "dark."; no console errors. Phone (390 iframe): the React icon went 25px off the left edge, so icons without room beside the phrase now sit above it; all five on screen.
- Specs (`tests/site.spec.ts`, 11 per engine, 22 pass in Chromium and WebKit): Figma geometry after the entrance, description 72 above the bottom (also at 1300 tall), light under a dark system, the five phrases and the dark switch in order, icon beside its phrase, reduced motion (no transforms, headline in steps). Axe and the geometry check failed at first because they ran mid-entrance; they now wait for it.
- Godwin (2026-11-07, with a recording of typesafe.ai): headline thinner than Figma; glow should be more pronounced (Figma's are progressive blurs, purple 8 to 32, blue 32 to 8); bold should go straight to outline; phrases should light during the gray-to-black pass, not after; slower; magnetic button.
- Thinner: `fonts.css` loads Inter 400 to 600, so 700 was synthesized; the site now imports `@fontsource/inter/700.css` (loaded weights 400, 500, 600, 700 checked).
- Glow: read the effects (`blurType: PROGRESSIVE`, `startRadius`, offsets top to bottom). Four masked steps per copy. Halved radii (Figma's CSS hint) spread about half as far as Figma's render, one to one too far; 3/4 matched side by side.
- Outline: `paint-order: stroke fill` with a surface-100 fill and stroke-lg, since a plain text stroke showed Inter's overlapping inner contours (t, f bars, inside e) that Figma's outside stroke hides. Same in WebKit.
- Story: headline 0.02 to 0.22 bold to outline; description pass 0.24 to 0.9 with phrases lit as it reaches them; track 420 to 640svh; description word color over duration/lg. First try overlapped the headline and the pass, so "React design system" lit while "purpose." was still bold; sequenced them.
- Magnet: rAF easing of `translate`; spec moves the mouse to the headline's top left and checks the button drifts up and left but stays short of the pointer. Chrome (Claude in Chrome) disconnected mid-task; checked with Playwright Chromium and WebKit screenshots instead. 24 specs pass.
- Godwin (2026-11-07): bigger headline; headline and description passes at the same time; no arrow on the button, magnet closer to the middle. Headline 160 / 140 (a quarter up), passes 0.03 to 0.42 and 0.05 to 0.9, arrow removed (ArrowRight icon deleted), magnet pull 0.25 with a reach cap of 0.18 of the words' half size, measured from a Range over the h1 (the block spans the window).
- Chrome (connected again): the window is 1084 wide and will not resize, which showed the hover reveal, magnet and three-line break gated at xl never ran there; moved to md. Checked: button 94px off centre at most with the pointer at the far left; at 12% of the track the first headline words are outlines while "React design system" is lit, at 25% the last line is still changing.
- The bigger headline pushed the description 44px below the 1024 screen (gap 116 + 240 under a 640 bottom); least gap now 64. 24 specs pass.
- Godwin: "more buttery", the headline and the text movement felt snappy. Causes: the story read the raw scroll, so each wheel step jumped; description words flipped one at a time. Added inertia to the progress (180ms time constant, frame-rate independent), a wider headline overlap (3), a continuous four-word ink wash on the description, and 640 / 320 / 900ms glides with a long ease-out for the entrance, pill, icons and theme change.
- First ink try was a text-bold copy over each gray word: mid-fade the two layers anti-aliased apart and words looked doubled in Chrome. Replaced with one layer whose color is `color-mix(in oklab, text-bold --ink, text-minimal)`, a rule in `landing-values.css` (lint-exempt).
- Chrome trace after one wheel flick: the second word eased 1 to 0.91 over about a second instead of jumping. The scroll spec now waits for the glide to settle at each step (120s timeout for its 51 steps). 24 specs pass.
- Godwin: per-character staggered rise on the headline, effects sooner on scroll, animate the description, install DialKit and wire the parameters. Read dialkit.dev: `useDialKit(name, config)` with `[default, min, max, step]` sliders, folders, `{ type: 'action' }`, `DialRoot`, hidden in production. Installed `dialkit@2.1.0` and `motion@14.10.1` exact, as dev dependencies (optional peers only; 0 vulnerabilities in `npm run audit`).
- `tuning.ts` is the single source; moved the track, stagger, glide and glow numbers out of `landing-values.css`. `as const` made the tuples readonly, which DialKit's types reject; `satisfies DialConfig` works.
- Characters: every layer of a word split into `.hero__char` spans with a global `--c`. Chrome sample: B, b, n, o leave 56px at 0, 181, 319 and 519ms, all in place by 1.1s. One wheel tick (100px) now moves the first word to 0.86 and starts the description's ink.
- The production build bundled DialKit (566 kB); aliased it to a stub that resolves the defaults (244 kB). Checked the built site in Chrome: same custom properties, no panel.
- Specs: per-character order (records when each starts; under a parallel WebKit run two can share a frame, so only first and last must differ), the first 100px of scroll starts the effects, the heading's accessible name. 28 pass.
- Godwin pasted his DialKit values; applied as the defaults in `tuning.ts` (track 2 screens needed the slider minimum lowered to 1.5).
- Clipping: caught mid-entrance in Chrome, the bottom of "Built" and its glow cut by a straight edge. A blur is drawn only within its layer's box plus a margin, and the margin (56px) was under the rise (60px) plus the blur. `--landing-hero-glow-pad` is now computed (rise + 3 x the widest blur, 142px with the defaults), and the band masks are measured in pixels from the headline's top inside the pad, so a bigger pad does not move the bands.
- Description not smooth. Trace in Chrome: phrase words lagged their neighbours ("that comes" black while "React design system" was gray) because they kept a 460ms color transition that restarted every frame as the scroll set --ink; and on lighting, the text went white on its own timer while the pill was still drawing (white on the page). Now no word's color transitions; lighting eases `--lit`, an `@property` number, from a third into the draw (trace: 0, 0.32, 0.88, 1 over about 500ms, text in step with neighbours).
- Also: the React icon sat on the "A" because icons were placed from screen boxes while the words were still 68px low from their rise; now from layout offsets (icon ends 12px before "A").
- The per-character spec now reads the stagger from styles (each delay larger than the last, all lowered before the entrance) instead of timing frames, which failed under a loaded WebKit run with the shorter 520ms rise. 28 pass.
- Godwin: the description moves too fast. With a 2 screen track the 25 words darkened over one screen of scroll (about 40px each). Track 4 screens, headline start and end rescaled so it still changes between 207 and 393px, and the description follows the scroll on its own heavier smoothing (300ms; a second follower in `useTrackProgress`, new DialKit slider). Chrome: headline bold at 200px, outlines by 400px; description 3 words dark at 800px, 10 at 1600px (about 130px a word). The overlap spec now checks that when the headline is done the description pass is under way but under halfway (React design system now lights at about 383px, just after the headline). 28 pass.
- Godwin: a highlight should come alive while it is the active text, not stay lit after. The active text is where the ink wash is at 0.5 (q * (n + softness) - softness / 2 words in); a phrase is lit from its first word to `phraseHold` (DialKit, 1) words past its last, "dark." stays lit once reached. Dropped the lighting delays (they waited for the previous pill to leave; phrases no longer overlap): pill at once, --lit a third into the draw, icon at once. Chrome log every 150px: React design system lit 450 to 750px while "React design system", "design system that", "system that comes" are active, out at 900px; color. 1650 to 1800; button, field, chart 2250 to 2550; light 2700 to 2850; dark. from 3000.
- Godwin: the other icons looked smaller than React's. Their SVG exports are 46 to 52 (stroke outside the frame) and were drawn at Figma's frame sizes (40 to 50), so shrunk; all now 52 tall like React. 28 specs pass.
- Godwin: icons should pop in with overshoot; try a highlighter in place of the blue box. Highlighter: a brand band at 30% over 38 to 92% of the line, drawn left to right, wiping off to the right (background-position flips with the lit state so neither move jumps); text stays dark; `--lit` and its `@property` removed. Pop: scale 0.4 and -12deg to 1 on cubic-bezier(0.34, overshoot, 0.64, 1). DialKit Highlight folder: marker strength, top, bottom, pop from, pop duration, overshoot. Chrome trace (no screenshots during it, which pause the page): 0.40, 0.76, 1.04, 1.19 at 660ms, 1.07, 1.00 by about 975ms. 28 specs pass.
- Godwin: description even fainter; highlight darker with rougher edges. Rest color now text-minimal at 60% toward surface-100 (lightness 0.84 to 0.90). Highlighter: a CSS gradient cannot have ragged edges, so `marker.ts` builds an SVG per phrase (seeded jitter on top and bottom edges, chisel-slanted ends, two streaks at a third of the strength), in the stage's surface-brand resolved through a probe element, rebuilt when the hero turns dark; strength 55%. New sliders: Marker Roughness, Description Rest. Chrome: strokes on React design system, button field chart, and dark. in dark mode. 28 specs pass.
- Godwin: keep the highlights as we go through the phrases, remove the icons; then mid-change, keep the icons after all. Marks are now kept (`marked`: every phrase the active text has reached), `phraseHold` dropped; the icon belongs to the newest marked phrase (`data-current`). The icon files had been deleted with the icons and were never committed; downloaded again from the same Figma export links (identical sizes). Chrome log: 500px React; 1700 React, color. + swatches; 2350 + button field chart + diamonds; 2800 + light + sun; 3250 all five + moon, dark; back to 1700 two marks; 0 none. 28 specs pass.

## Landing page: Some features section (side session landing-features, 2026-11-07)

- Task from the top session: build Figma `7064:28783` (four feature cards) under the hero, with motion from the Stageshow skill (benji.org/stageshow).
- Stageshow is `npx skills add benjitaylor/skills --skill stageshow` (377 files, 2.7 MB, MIT). I ran `npx --yes skills@1.7.6 --help` before asking, which downloads and runs the third-party CLI's help; nothing installed, told Godwin. He chose a git install: sparse clone of `stageshow/` at 299140f into `~/.claude/skills/stageshow`, no downloaded code run. Its kit (React 18, raw CSS values) is not copied in: Bland's components are the product inside each tile (the skill allows the project's own components) and its CSS would fail the token lint.
- Figma: four 416 x 360 cards (surface-raised, rad-lg, smoothing 100%), each a 272 tall surface-200 picture (empty) over a title at raw primitives (family/heading, Medium, size/2xl 27, line-height/2xl 40, padding space-xl), 16 apart, at columns 2 to 7 of Desktop/sm, 144 from the top and bottom of a 1024 tall surface-100 section. No annotations on the section.
- Plan agreed with Godwin (Stageshow bento rules: each tile a different kind, one thing per tile, no string repeated): 1 a wall of real Bland parts bleeding off the edges, settling in, then a Toggle switches and a Checkbox ticks; 2 one card half light half dark (nested `data-theme`), the line sweeps and the card turns dark; 3 one hex, its 13 brand steps and controls that follow it through three brands; 4 a Tab keycap moving the focus ring through three controls with a screen-reader caption. Playback: once as each card scrolls in, 100ms apart in reading order, holding the result; hover replays; reduced motion shows the final frame.
- Built `site/src/features/` (Features, playback, timing, four pictures, features.css) and `tests/features.spec.ts`; shared files touched: `main.tsx` (two lines, mounting the section), `landing-values.css` (a Some features block and the three brand sets at the end).
- First render (Chrome, 955 wide): the wall left a void and cut labeled parts, SegmentedBar truncated its labels in a nowrap row, the theme grip covered the card's title. Five centred rows with wordless ends, fixed widths for SegmentedBar/SearchInput/Slider/ProgressBar, grip below the card.
- Rebrand: `--brand-500` straight in CSS fails the lint (a primitive); the dot uses Surface/surface-brand (step 600). The step swatches read `var(--brand-<n>)` from TSX, the one deliberate use of the raw steps on the page (commented).
- Phone (390): Notification overflowed its cell (LEARNINGS); `min()` width. The keyboard card opened on an empty caption (a Stageshow fault): it now opens with focus on Email and its caption.
- Specs: 9 per engine (axe in both system themes, order and decorative pictures, in-view start in reading order, the rebrand roles, hover replay, reduced motion, Figma geometry at 1440, phone). Flake caught: WebKit read the dot mid-hue; `toHaveCSS` retries. 36 pass with `--repeat-each=2`; the hero's 28 still pass; lint and typecheck pass.
- Godwin (2026-11-08): more space around the cards and inside them, label at 22. Section padding 144 to 192, row gap 16 to 48, title padding 24 to 32, title 500 22/32. Read "inside the card" as the title's band (the picture already fills the card's top edge to edge); told him so. Desktop geometry spec updated (cards 368 tall, rows 416 apart, 192 padding); 18 specs, lint, typecheck pass.
- Godwin (2026-11-08): he meant the gray picture's height, and wants its corners rounded. Picture 272 to 336, `.bland-smooth` rad-lg on it; title padding back to 24 (the 32 was my misreading). The wall's five rows left 48px bands in the taller picture: added a sixth row (8 wordless parts, 38 in all). Geometry spec: cards 416, rows 464 apart. 18 specs, lint, typecheck pass.
- Godwin (2026-11-08): taller pictures again, the line draggable and the screen-reader form tabbable, stories that keep playing while in view and pause on hover; and two more features, to talk through first. Pictures 400; `usePlayback` now tracks view, hover, presses and focus, `useLoop` replaces `useSteps` with a pausable clock (first cut stored a zero remainder when a step ended, since cleanup ran after the timer fired; a `fired` flag fixed it). `Roll.tsx` replaces the per-value data-at spans, which rolled backwards when a loop wrapped.
- Chrome: dragging to 0.18 gave 82% dark; Tab and Space in the form moved Bland's real ring and the caption; the caption cut "checked" in a 256 bar beside the keycap, so the form is 296 and the caption sits under the keycap at full width. Specs rewritten (11 per engine: loops, hover pause and resume, drag and keys, Tab through, reduced motion poster with no loop, geometry 480 cards and 528 rows); the line is placed with `translate`, so the spec reads the grip's box, not `transform`. 22 pass with the hero's 28 (50, Chromium and WebKit); lint and typecheck pass.
- Godwin (2026-11-08) picked charts and typed props as features five and six. Built `ChartsPicture` and `PropsPicture`, registered them after the four Figma cards. The chart's legend is drawn inside each filtered view so its keys match the bars. SegmentedBar truncated "Red-green" and "Blue-yellow" at 296: Pill tabs sm, which need 311, in a 344 panel. Props: a flex row dropped the space between `Button` and `emotion` (whitespace-only text between flex items); Roll kept the old value mounted at opacity 0, holding the wider width, so the old one is now dropped on animationend (display none under reduced motion, where no animation ends).
- Specs: six cards no longer fit one screen, so `show()` scrolls each in turn; added the pills (pick holds, only that view shows, through its filter) and the listbox (click, arrows, Home restyle the Button and the code). Axe caught the faded type hint (LEARNINGS). 26 feature specs and the hero's 28 pass in Chromium and WebKit; lint and typecheck pass. Checked in Chrome, no console errors.
- Godwin (2026-11-08): better labels and a line under each, recorded in the Landing page UX copy session's `docs/landing-copy.md`. Read it (voice: short, plain, a little dry, no jargon, no em dashes; its "What you get" lines are a later section, so nothing repeats them). New titles: Over 45 components that fit together · Light and dark, each designed · One color rebrands it all · Works without a mouse · Charts in your colors · Typed down to every prop, each with one line; the doc's "Proof strip" became "Feature cards". The chart line wrapped to three lines at 1440 and made its row taller; shortened to "Your brand leads, and every series stays clear for color-blind readers. Switch the view to check." All six are two lines. Specs: new titles, a line per card, cards in a row one height; 54 pass with the hero's.
- Godwin (2026-11-08): duplicate the section as a sideways row on scroll (Figma 7141:36653), smooth like a Cosmos clip (a Framer template, "Studio Terrace"). Figma: a 560 x 703 middle card (title Semi Bold 43/48 -2, picture, line), neighbours scaled to 446 (0.797) at 20%, 608 apart. The Cosmos page's text says nothing; watched its video in Chrome: phone-sized screens on a row, the middle one largest, gliding and settling centred.
- Built `row/FeatureRow.tsx` (a rAF loop while the track is near the screen, setting translate, scale, opacity and z-index per card; React state only for which card is centred), `row.css`, `row/tuning.ts` (DialKit). First cut used a sine "dwell" curve; a stopped scroll could sit between two cards, so it became a hold at each card plus smootherstep between. The keyboard card's scripted ring sat on the label inside a scaled card (measured in screen pixels): now divided by the picture's scale. Props and charts ids clash with two copies on the page: `useId`. The first section's specs now scope to `section.features`.
- `tests/feature-row.spec.ts` (7 per engine: six cards and the live middle, neighbours at 0.797 / 20%, the hold, press to centre, axe, reduced motion in whole cards, phone fit); a first run read the hold mid-glide, so `goTo` waits for the card to sit exactly. 28 pass with `--repeat-each=2`; with the hero and Some features, 68 in Chromium and WebKit. Chrome: a wheel flick glides and settles, no console errors.
- Godwin (2026-11-08): taller gray container, more space between it and the texts, animations playing as soon as the container shows. Applied to the row (the section in front of him): card 703 to 840, picture to text space-xl to space-3xl, wall gap space-3xl in the row. `usePlayback` now starts at 5% in view and takes `{ stagger }`; the row passes false and no longer gates its pictures on being centred. Specs: a neighbour (rebrand) changes color before it is centred, the 40 paddings; 72 landing specs pass in Chromium and WebKit.
- Godwin (2026-11-08), screenshot of the row resting between two cards: guidance. When scrolling stops with the row between cards, the page glides (its own rAF ease-out, cancelled by wheel, touch, key or press) to the nearest card's scroll position; skipped when already inside a card's hold. Specs: stopping at 2.4 settles on card 2 and at 2.62 on card 3, a wheel during the glide wins. Chrome: two wheel ticks from card 1's place, then the row sat on card 1 exactly.
- Godwin: replay the chart's entrance on each color change: Bars remount under a key that changes with the view, rising after a two-frame flat start. Spec: the old bars are gone after a pick and the new ones grow.
- Godwin: the Segmented bar's thumb in the row sat off its tab. Bland's tab indicator measured in screen px and divided by CSS zoom only; the card had been scaled when it was drawn. `tabs.tsx` now divides by `rect.width / offsetWidth` (LEARNINGS); CHANGELOG Unreleased. New row spec (thumb within 1px after the card grows); it fails on the old code (2.0px off) and passes now; the Segmented bar, Section, Pill and File tab specs pass in Chromium and WebKit (64 with the row's).
- Godwin (2026-11-08): remove the grid, keep the row. Moved `FEATURES` and `PictureProps` to `cards.ts`, deleted `Features.tsx` and its mount, cut the grid's rules from `features.css` (its reduced-motion selectors were scoped by `.features`, now `.row__picture`) and its four values. `tests/features.spec.ts` deleted; its picture checks moved into `tests/feature-row.spec.ts` on the card in the middle (copy in order and the grid gone, decorative parts, axe on three cards in both system themes, rebrand loop and roles, hover pause, drag and keys, Tab through, chart pills and regrow, props listbox, reduced-motion posters); row cards now expose `data-started` / `data-active`. 74 pass in Chromium and WebKit with the hero's; lint and typecheck pass. `docs/landing-copy.md` "Feature cards" now says the row.
- Godwin (2026-11-08): every feature animation 50% faster. One speed (1.5, DialKit) divides the loop holds and the pictures' CSS durations; measured in a browser: the rebrand steps 1.6s apart, `--features-arrive` 427ms. The faster loops exposed three spec races: the Tab spec assumed the checkbox unticked (it now reads the box's state), axe caught a pill mid-transition (the axe specs hover the card to pause it first), and the wheel-takeover spec, where WebKit's emulated wheel does not scroll under the runner though it does in a standalone script (LEARNINGS; that spec is Chromium-only now). 73 pass, 1 skipped (that WebKit case), with the hero's.
- Godwin: he meant the repeat rate, not the motion. `featuresStyle` is a plain object again and `features.css` uses the duration tokens directly (7 calc() wrappers removed); only `useLoop`'s holds divide by the speed. Measured: rebrand changes 1.6s apart, `--features-arrive` 640ms, a roll 250ms. The shortest hold (the keycap press, 93ms) still outlasts its own transition. 73 pass, 1 skipped (the WebKit wheel case).

## Landing page: Brand theme section (2026-11-08, from the top session)

- Figma 7066:28878 plus its states 7066:28914 and 7066:28936: a stepper (tag, three steps of which the current is the headline, Open Brand theme), one 416 x 360 card, an info Alert. No annotations; the nearby notes are about other sections.
- Asked Godwin with three picture ideas, the stepping and the order: all as proposed (scroll stepper, pick-check-copy).
- Real numbers: `npm run brand -- generate "#e11d74" --neutrals subtle` and its check (one fail: dark progress fill 2.85:1, suggested 400 #f16694); computed the other ratios from the same tokens (5.82, 5.82, 9.22; the fix gives 3.00).
- Built `brand/BrandTheme.tsx`, `brand-theme.css`, three pictures; values and `.brand-pink` in landing-values.css; mounted in main.tsx. First render: the pictures sat low and were cut, because the code picture's full height set the card's grid row; the card is now one `minmax(0, 1fr)` cell. The lint does not check that a var() exists: a scan found `--type-body-md-underline` (none; body-md plus an underline) and the `--features-*` timings unset on this section (now set from `featuresStyle`).
- `tests/brand-theme.spec.ts` (10 per engine: tag and steps, scroll through the steps with the headline size, press to scroll, pick types #e11d74 with roles from its steps, check fixes 2.85 to 3.00 on the tool's 400, the copy picture's real brand.css and toggle, axe on each step in both system themes, reduced-motion posters, phone: normal scroll, fits, auto-advance and tap). 93 landing specs pass in Chromium and WebKit (1 skipped, the WebKit wheel case). Chrome: step 2 current mid-track, no console errors.
- Godwin: jittery movement, DialKit, and a tint instead of gray. Cause of the jitter: font-size, line-height and letter-spacing transitions re-laid out the headline at every size on the way, so its line breaks jumped. Now two layers per step with an eased, measured height (sampled in Chrome over 700ms: 64 to 160px, rising every frame). `brand/tuning.ts` on DialKit. Card and pictures on Surface/surface-brand-light of their own brand (the check and copy pictures now carry `.brand-pink` and `data-theme` on their roots). Specs: the headline layer shows with Figma's 43px, height only rises while it grows and the headline never rewraps, the tint is step 50 of #e11d74; 97 landing specs pass in Chromium and WebKit (1 skipped, the WebKit wheel case).
- Godwin (2026-11-08): the components card's slider snapped; the Brand theme stepper should scale its text rather than fade, with a Granola-style underline; asked whether I use Playwright (yes: specs, screenshots, timing probes; his Chrome through Claude in Chrome). Slider: transitions on the thumb's `left` and the bars' `left`/`right` inside `.components-pic`; spec samples more than three positions in between. Stepper: FLIP per word with WAAPI (cancelled and re-measured at rest on each change, re-measured on resize and when fonts load) and an animated button height; the first try scaled by the line boxes' ratio (0.5) instead of the glyphs' (16/43), so words started too big; now the widths' ratio, checked in Chrome: a word starts at 29px wide, its small size, and ends at 73. Underline from the scroll with smoothing; on phones a CSS fill whose animationend advances the step. 26 section specs and the row's slider spec pass; 101 landing specs in Chromium and WebKit (1 skipped, the WebKit wheel case).
- Godwin: opacity on the moving words, the width change looked rowdy. The word keyframes gain an opacity dip (a middle keyframe with only opacity, at an offset) and a per-word delay with `fill: backwards`. Chrome trace on step 2's words 1, 4 and 9: at 337ms 0.72, 0.55, 0.24; all about 1 by 608ms. The growth spec now expects a dip below 0.5 and every word back at 1; 26 section specs pass in Chromium and WebKit.
- Godwin: blue bar, blur instead of the dim. `filter: blur()` in the word keyframes beside the transform (opacity left at 1 by default); the bar on Border/border-brand. Specs: the growth spec reads the blur peak (above 3px) and every word ending sharp and opaque; a new one checks the bar's color (rgb(0, 98, 255)). 28 section specs pass in Chromium and WebKit. Chrome: bar color confirmed; the blur trace there caught one frame, likely the background tab throttling animation frames, so the blur itself is shown by the Playwright spec.
- Godwin: blur still too much, maybe the scale too; asked how else it is done. Removed the blur, then offered four ways (headline separate as Granola, roll in place, swap with height only, keep the scale); he picked Granola's. The list is plain small text; a masked headline cell above the card rolls between the three (no direction state needed: past ones sit above, next ones below). Spec: the old headline goes up and the new comes from below, one font size (43px) throughout; 28 section specs pass in Chromium and WebKit, the row and hero specs still pass in Chromium; lint and typecheck pass.
- Godwin: revert the separate headline; something calmer than the scale. Back to two layers per step in a clipping row with eased measured heights; a change animates translateY 0 to -100% on the leaving layer and 100% to 0 on the arriving one (reversed going back), for the step that leaves and the one that arrives. Axe found the steps unnamed (the hidden headline dropped out of the accessible name, the small copy is aria-hidden): `aria-label` on each button. Spec: headline rises from below, the line leaves up, the row only grows, sizes fixed at 43 / 16px, no scale. 103 landing specs pass in Chromium and WebKit (1 skipped, the WebKit wheel case); Chrome: step 2 current at 160px tall, its headline shown, no console errors.
- Godwin: text lingered beside the new headline. The exit animations kept the leaving layers visible while the arriving ones came in; now only the arriving layer animates. Spec: the current step never shows both layers during the roll; Chrome two frames into a change: the left step only its line, the new step only its headline. 28 section specs pass in Chromium and WebKit.
- Godwin: Tab past Sign in jumped to the next section; more space between the Brand theme steps and picture; the note should fill the width (design it if Alert can't). Row: a keydown handler on the section moves to the next card with controls via the guidance glide and focuses it when its content stops being inert; first run, the glide stopped at once because the window keydown listener (meant for scroll keys) caught the same Tab; it now ignores keys that don't scroll. Chrome: Tab from Sign in centred the charts card with "Typical" focused. Brand theme: copy padding and a picture offset; Alert's max-width lifted from this section (Alert could do it, so no custom note). Specs: Tab forward and Shift+Tab back, the note's width equals the card's, 40px or more between steps and picture. 79 row and section specs and the hero's pass in Chromium and WebKit (1 skipped, the WebKit wheel case).
- Godwin: more padding outside the code block; the brand.css card's design. Read "the brand.css field" as the satellite card (said so, offered to change the snippet's header instead). Padding space-2xl; the card rebuilt as a file row over a preview with Stageshow filler bars. The comment line overflowed; shortened. 30 section specs pass in Chromium and WebKit.
- Godwin pasted his Feature row DialKit values; applied as the defaults in row/tuning.ts and updated the row spec (neighbour scale 0.65). 49 row specs pass in Chromium and WebKit (1 skipped, the WebKit wheel case).
- Godwin pasted his Brand theme DialKit values; applied as the defaults in brand/tuning.ts.

## Landing page: What you get (2026-11-08, from the top session)

- Read the shared notes, the hero's text motion (`Hero.tsx`, `tuning.ts`, `story.ts`) and the Brand theme stepper. Figma: 7066:29609 and five Screen templates states; five annotations (pop when the text changes, animate the components, staggered icons, draw the grid, the figure spreading, a blinking eye). Exported every vector with `exportAsync` SVG_STRING.
- Proposed the motion plan (scroll stepper, hero text rise and ink, hero icon pop, live moments per slide, phone blocks, reduced motion); Godwin: build it.
- Built `what-you-get/WhatYouGet.tsx`, `slides.tsx`, `vectors.tsx`, `tuning.ts`, `what-you-get.css`; values and the ink rule appended to landing-values.css; mounted in main.tsx. The stage scales Figma's frame rather than laying the parts out again, so the composition holds at every width from md. Ink is set on the DOM in the frame loop, so React renders only when the slide changes (the parts include a Calendar).
- Chrome, 955 wide: all six slides in place, the dark slide dark, the first word inking, no console errors. Fixes from the specs: my expected frame scale was wrong (the width decides at 1024 x 768); the reduced-motion `animation: none` lost to the limbs' `[data-side]` rules (more specific); on a phone the page widened to 443 for a moment, the pop's overshoot growing a full-width Modal (`overflow-x: clip` on the blocks). A phone screenshot showed the tilted Modal over the field (tilts at 40% there, more row gap) and the Segmented bar's selected "Tab" cut to "T…" in its hug wrapper (Figma's 256 width).
- Axe: the "What you get" tag in Figma's Text/text-minimal is 1.64:1, under 3:1; kept as Figma has it and excluded from the spec's axe runs until Godwin decides. Everything else passes in both themes and on the phone.
- `tests/what-you-get.spec.ts`, 11 per engine. With the hero, row and Brand theme specs: 129 pass in Chromium and WebKit (1 skipped, the WebKit wheel case). Lint and typecheck pass.
- Godwin: "like the hero" meant the headline's entrance (kept); remove the gray-to-black ink; a scroll should take you to the next slide. Ink rule, wave and smoothing removed; a gesture handler (wheel with passive false, keys, touchmove) glides to the next slide and swallows the gesture until it is quiet and arrived. Specs: words are text-bold at once; a 14-event wheel flick moves exactly one slide and rests at its place, a wheel up goes back (Chromium: WebKit's emulated wheel, LEARNINGS); ArrowDown and PageUp step; past the last slide the wheel scrolls to the page's end. 133 landing specs pass in Chromium and WebKit (3 skipped: WebKit wheel cases). Not yet rechecked in Chrome by hand.
- Godwin: scroll-locked at times, dark text black, tab bar off, all to DialKit. Lock: the old handler swallowed every event while busy, restarting a 200ms timer on each (a trackpad tail is a second or more) and waiting for the glide to arrive (up to 1.5s). Now only a same-direction, decaying tail is swallowed; reverse or growing deltas act at once. Dark text: color inherited from the light section; set on the sentence. Tab bar: in Chrome the thumb was at y 2 + rotation offset, 66 wide on a 63 tab, because rects of a rotated tab are its upright bounding box; tabs.tsx falls back to offsets when the box and layout size disagree (thumb now 191 / 2 / 63, exactly the tab). DialKit: tuning.ts holds every timing; the CSS reads --wyg-*, the parts' JS loops a LiveTiming context. Found and fixed my own mistake from the ink removal: the script matched the hero's identical color-mix line and duplicated landing-values.css from the feature cards down (both copies identical, the duplicate removed). Specs: gesture tests now dispatch wheel events in the page 16ms apart (mouse.wheel's gaps under load read as two flicks), so they run in WebKit too; new: reversing mid-tail moves back in under 900ms, a fresh flick inside a tail moves on, dark words white, the thumb on its tab. 214 landing and tab specs pass in Chromium and WebKit (2 skipped), tab screenshots unchanged. Chrome: white text, thumb on its tab, no console errors.
- Godwin (2026-11-09): the tiniest scroll ran through every slide. Cause: the third pass's new-flick test (an event 1.6 times the last) fires on every event of a trackpad gesture's build-up, since its deltas grow before they fade; my specs only sent decaying gestures. Now a same-direction new flick also needs 450ms since the move and a delta of 15 or more; reversing needs 15. New spec: a build-up-then-fade gesture (2, 5, 12, 30, 60, 90, 110, 120, then 30 fading events) moves exactly one slide, as does a 1-3 nudge; the fresh-flick spec waits out the gap. Landing specs pass in Chromium and WebKit three runs in a row.

## Landing page: Components showcase (side session landing-showcase, 2026-11-09)

- Read the sibling notes, INTERFACE's landing entries, the Figma frame `7071:32494` (`get_design_context` plus a `use_figma` read for annotations): four annotations (all interactive; font button cycles preset fonts; sun button light/dark; swatches pick any color, a better range than the placeholders). No loose canvas notes near it.
- Found that `scripts/brand/core.ts` is browser-safe (the docs Brand theme page runs it), so any color can go through the real brand tool at runtime; the docs site's six font presets are already installed (`@fontsource/*`).
- Plan sent to Godwin (layout, toolbar, each card's interaction, wave and entrance, a copy question); he said build it. Copy left as Figma's ("three brands") since he did not answer that part.
- Built `site/src/showcase/` (Showcase, Cards, settings, tuning, vectors, showcase.css). Figma's toolbar icons downloaded from the frame and turned into currentColor components; Moon from the Figma Icons page via the docs site's icon. Avatar uses initials (Figma's is a raster photo).
- Dead end: setting the brand only on the panel and letting cards inherit meant no per-card easing; set every card's steps inline (Bland's blue too) and registered the steps with `@property`.
- Found: text in dark cards stayed Inter after a font change: `--type-*` composites are declared for light only. Wrapped each themed box in a light element that carries the fonts (LEARNINGS).
- Found: a slow font finishing after a newer change applied the older change; only the newest run now starts its wave.
- Found: on a phone the cards' overshooting pop scrolled the page sideways for a moment (WebKit spec, 345 > 320); the section clips horizontally.
- Browser pane screenshots lagged while the pane was hidden (read computed styles instead). Chrome's window would not widen past 307px, so the phone layout was checked in Chrome and desktop in the pane at 1440.
- `tests/showcase.spec.ts`, 11 specs: order, wave order, any color (26 steps, ring), theme, fonts in dark, every component, keyboard radios, axe light and dark on Bland and amber, reduced motion, phone. Chromium and WebKit pass three runs in a row (Firefox does not start on macOS 27). Changed `tests/what-you-get.spec.ts` "past the last slide": it expected the wheel to reach the page's end, true only while What you get was last; it now checks the wheel leaves the section. Landing specs pass in Chromium and WebKit; two other sections' WebKit specs (feature row axe, hero icon) failed once under a full parallel run and pass alone.

### Showcase: Godwin's review fixes (2026-11-09, landing-showcase)

1. Re-read Figma `7071:32494` and measured the live panel at 1440: the widths already match (cards 267 vs 266, content 235), so the extra padding is Godwin's ask on top of Figma.
2. Corners: removed `border-radius` from the panel, cards, font button and its mark; `.bland-smooth` now draws 32px superellipse (LEARNINGS).
3. Copy "any brand"; the link's underline removed; the Button no longer fills; the font button's hover replaced by a press.
4. Theme: `apply` uses no stagger when the theme changes, and `background-color` left the transition list, so dark lands in one frame.
5. Ring outset by stroke-xl and smoothed; checked in Chrome: the whole color shows inside, with the shadow.
6. Padding per card through `data-card`; the upload's instruction is now one sentence (the default broke as "here / or / click to upload" at the narrower width).
7. Specs: added checks for the theme in one frame, the 32px corners, the hugging Button and the link. Showcase and What you get pass in Chromium and WebKit; lint and typecheck pass.

### Showcase: theme button pop and circle reveal (2026-11-09, landing-showcase)

1. Godwin: the theme button should sink and pop, and the new theme should grow out of it as a circle across the panel, smoother than before.
2. Built it as a view transition of the panel alone, driven from the click: `flushSync` swaps every card's theme inside `startViewTransition`, then WAAPI animates `::view-transition-new(showcase-panel)` from `circle(0)` at the button to the furthest visible corner. The button's pop is a WAAPI scale; the sink is CSS `:active`.
3. In Chrome at 307px the circle used the whole 2100px panel, so most of it grew off screen: the radius now reaches the panel's visible part only.
4. The browser pane was hidden, so animation frames stalled and a sampling script timed out: checked in Chrome instead, pausing the animations to screenshot the circle mid-way.
5. A new spec covers the pop, the reveal's start and the keyboard (no reveal). The showcase specs pass twice in Chromium and WebKit; What you get passes.

### Showcase: ring ends, one-line Alert, second set, docs color picker (2026-11-09, landing-showcase)

1. Ring: white through `icon-on-color` in both themes; `data-edge` start/end gives the outer corners rad-md plus the stroke, smoothed per corner in `@supports (corner-shape)`, with the strip's ends smoothed to match.
2. Alert: "Tap to swap the icon" still wrapped at 307px (156px needed, 156 there); now "Tap to swap icons", one line in all six fonts, the extra side room only from md.
3. Color picker: moved the docs picker CSS into `playground/docs/color-picker.css` (imported by ColorPicker.tsx) and used ColorPicker in the shared Popover from a button swatch. The docs picker specs (14) still pass.
4. Second set (`moreCards` in Cards.tsx) behind a round Stack switcher; the cards container is keyed by the set so the entrance replays. On a phone the Slider's own 256 width and the Search field widened their cards past the screen: `min-width: 0` on cards, `max-width: 100%` on fills, Pagination down to 4 pages. Search lost its extra side room (the placeholder was cut).
5. Specs: the picker, the ring's edges and white in dark, the second set working; showcase and What you get pass in Chromium and WebKit (twice for the showcase); lint and typecheck pass.

### Showcase: one card height, switcher first, a third set (2026-11-09, landing-showcase)

1. Cards: fixed `height` (landing value 256, Figma 200), `overflow: clip`, each card's content in a ScrollArea with the padding inside the viewport. Centring needed the viewport and ScrollArea's inner `__content` wrapper as flex columns too (a percentage `min-height` did not resolve). Checked in Chrome: 256 for every card in all three sets, the panel's height unchanged with the Accordion open.
2. Switcher moved before the font button; it cycles three sets.
3. Third set (`lastCards` in Cards.tsx). Code text up to md (sm read too small at desktop).
4. Spec: one test walks all three sets, works parts in each, and checks one card height and a steady panel (offsetHeight: the pop's scale skews bounding boxes). Showcase specs pass twice in Chromium and WebKit; What you get and site specs pass; lint and typecheck pass.

### Showcase: centring, field widths, bright presets (2026-11-09, landing-showcase)

1. Measured every card in the pane at 1440: all parts were centred vertically except the upload (`top`); the field-wide parts of sets 2 and 3 filled 235 against the Text Input's 203. Upload un-pinned; Slider, Search, Accordion, Time, Dropdown and Progress get the Text Input's space-2xl sides; Search's placeholder shortened (it was cut).
2. Presets from Godwin's image, Bland blue in the sky-blue place (`BLAND` in settings.ts keeps it the default). Specs follow (Violet after Bland blue, ring at 216 for Any color, Lime for the start edge, Mint for Teal); axe now runs on all nine presets in both themes (its own 120 s timeout).
3. Chrome's tab had been closed, so checks ran in the browser pane; a mid-wave screenshot looked wrong but the computed steps were right (the hidden pane slows transitions).
4. Showcase and What you get pass in Chromium and WebKit; lint and typecheck pass.

## Landing page: Figma kit section (side session landing-figma-kit, 2026-11-09)

1. Read the "Figma system" frame (`7078:34292`) with `use_figma`: one annotation, on the empty frame beside the logo ("a simple design of the Figma file ... something simplified"). `get_design_context` for the layout and tokens; downloaded the four icons (DiamondsFour, ToggleRight, Code, the 40px FigmaLogo) to the scratchpad and rewrote them in currentColor. Read the other sections' code (features `usePlayback`/`useLoop`, What you get's rise, the showcase pop, `.brand-pink`) to reuse them.
2. Posted the plan (simplified file, three beats lighting the checklist, entrance, reduced motion); Godwin: "Yes, all three beats". He did not name the link yet: the button points at the Bland file.
3. Built `site/src/figma-kit/` (FigmaKit, FigmaFile, tuning, vectors, figma-kit.css), values in `landing-values.css`, mounted in `main.tsx`. Typecheck failed once: Button has no `neutral` emotion, so the second row is danger.
4. In Chrome (the window stays 955 wide, it would not resize to 1440): the code card sat at the canvas top (it was outside the frame's wrapper), the variant name was cut in the 200 panel (it wraps now, body-sm), an empty band under the frame (the set moves down to space-7xl from md). Desktop and phone shots with a Playwright script: the Mode switch was past the page edge at 1440 (moved top left), the set sat off-centre on a phone (label and frame in their own box, centred), the variable name truncated on a phone (narrower swatch columns, the card space-sm from the edges).
5. `npx prettier` with no project config rewrote the files in double quotes; reformatted with `--single-quote --print-width 160`.
6. `tests/figma-kit.spec.ts`, 8 specs: three needed test fixes (a 200ms step is too short to poll for, so check the step after it; the inert picture cannot be hovered, hover its wrapper; measure the desktop columns after the pop settles). 16 pass in Chromium and WebKit.

### Landing page: Figma kit, fuller picture (side session landing-figma-kit, 2026-11-09)

1. Godwin: the picture is too sparse; fill the sidebar with Figma's pages, let the buttons fill the canvas, and make dark mode change the whole picture.
2. Read the page list and the Button set's variant names from Figma (`use_figma`: 54 pages, 256 variants named `Size=…, Emotion=…, Type=…, State=…`).
3. Panel: real pages scrolled to Buttons with end fades, Layers with the real variant names. Canvas: all 64 Buttons (4 emotions x 4 sizes x 4 types), running off the edges. `data-theme` moved onto the picture and canvas.
4. Screenshots at 1440 and 390: the selection outline spanned the whole grid column (fixed with `justify-items: start`), the selected layer row was cut at the panel foot (pages list 208 → 176), the code card ran off a phone's canvas (wraps at 232 there).
5. Spec updated (new names, whole-file theme, a panel test); the cursor test now waits for step 3, as step 2's 200ms press is too short to poll. 18 specs pass twice in Chromium and WebKit; lint and typecheck pass.
6. Godwin: make the Variables card prominent (black) and add the theme section's blue progress line. The card is always dark and lists the four `Button/brand-primary-*` variables; the checklist row fills a 2px border-brand line over its beat's time, paused with the story (`useLoop` keeps the time left when it pauses, so the two stay together). On a phone the variable names were cut: there the card shows two rows with narrower columns. Spec checks the line's color against `--border-brand`, that it pauses under a mouse, and that it is absent under reduced motion; 18 pass in Chromium and WebKit.
7. Godwin: no pop on the Figma card, stagger its elements instead. The `pop` tuning became `parts`: the card fades, panel / Mode / set / Variables rise in 90ms apart, the buttons follow in a row-plus-column wave, the cursor fades in last (it had shown over the empty canvas). Checked mid-entrance by pausing the animations at 350, 550 and 750ms in Playwright (real-time screenshots were too slow to catch it). New spec: the card fades, the parts' delays rise in order.
8. Godwin: Variables card to the other side; "Same names as the code" above "Light and dark modes", on a dark background so it shows over the white. Read as: reorder the checklist and the story (select and code card while light, then Dark), make the code card dark, and move the Variables card right. From xl the picture runs past the page by a width that depends on the window, so the card's right offset adds `--fk-cut` measured in JS (first off by the picture's 1px border). 20 specs pass in Chromium and WebKit.

## Landing page: FAQ section (side session landing-faq, 2026-11-09)

1. Read Figma `7189:37802` with `use_figma`: no annotations in the frame; a heading, a line and four Accordion md (not flush, closed) in a 560 column. `get_design_context` for spacing: 148 top, space-3xl between the head and the list, space-xl inside the head, space-md between questions.
2. Read the sibling notes and the Figma kit's code to reuse its entrance (word rise, DialKit tuning, IntersectionObserver at 0.2) and its landing-values pattern.
3. Wrote the copy in `docs/landing-copy.md` ("FAQ"): Figma's four plus ten. Facts checked in `package.json` (0.1.3, MIT, React 19 peer), `docs/agent-skill.md` (setup, fonts, theme, icons, component token overrides, RTL not supported), `docs/release.md` (one minor of deprecation warning, minors may break before 1.0), CLAUDE.md (corner smoothing falls back in Safari and Firefox, no Tailwind, tests in Chromium, WebKit and Firefox).
4. Built `site/src/faq/` (Faq.tsx, questions.tsx, tuning.ts, faq.css), a FAQ block in `landing-values.css`, one import and one mount in `main.tsx` (re-read first; the footer was not mounted yet).
5. Checked in Chrome at http://localhost:5182: matches Figma; opening one closes the others; inline code reads well.
6. `tests/faq.spec.ts`, 5 specs (Figma copy and order, one-open by pointer and keyboard, axe closed and open, 320px phone, reduced motion): 10 pass in Chromium and WebKit.

## Landing page: footer (side session landing-footer, 2026-11-09)

1. Read Figma `7100:36365` with `get_design_context` and `use_figma`: no annotations on the footer or near it (the page's 16 annotations are all above y 5124; the footer starts at 6913). Downloaded its six SVGs (copy, ReadCvLogo, Log, MIT, npm, GitHub) to the scratchpad; the copy icon is CodeText's own, GitHub is already in `site/src/icons.tsx`.
2. Read the hero's headline code (outline, bold and glow layers, character rise, scroll inertia) and the Figma kit's entrance pattern to reuse them. Checked `package.json` exports (styles.css is `dist/index.css`), the README's imports and the repository's visibility (private).
3. Posted the plan (dark footer, outline to bold as you scroll in, the hero's entrance, blocks after; questions on links, imports, headline wording, the copyright line). Godwin: "Yes, build it", so the suggested answers apply: npm and unpkg links, no GitHub mark, the README's four imports, Figma's "Start Bland." and copyright.
4. Built `site/src/footer/` (Footer.tsx, footer.css, tuning.ts, vectors.tsx), a Footer block in `landing-values.css`, and in `main.tsx` one import and the footer mounted after `<main>` (re-read first; the FAQ was already mounted).
5. Ran bare `npx prettier` again despite the Figma kit's LEARNINGS entry: it turned `main.tsx` to double quotes; reformatted with `--single-quote --print-width 120`.
6. In Chrome at http://localhost:5182: matches Figma at the page's end; midway the first words are bold and the last still outlined.
7. `tests/footer.spec.ts`, 6 specs. The phone spec found the page 358 wide at 320: the glow layers' blur room. Fixed with `overflow-x: clip` on the footer. 12 pass in Chromium and WebKit.
8. Whole landing suite (hero, features, Brand theme, What you get, showcase, Figma kit, FAQ, footer) in Chromium and WebKit: 210 passed, 2 skipped, 2 failed. The hero's phone spec looked for `getByRole('link', { name: 'Docs' })` and now also found the footer's "Read the docs"; scoped it to `.hero` with `exact: true` (a one-line edit to `tests/site.spec.ts`). Hero and footer specs then 40 of 40.
9. A 390 phone screenshot showed a tall empty band under the copyright (Figma's 960 minimum): the footer takes that height from md only.

### Landing page: FAQ redesign (side session landing-faq, 2026-11-09)

1. Godwin updated the Figma frame. Read it again (`use_figma`, `get_design_context`): two columns, flush md Accordions with a dotted Line between each (stroke-md, Border/border-bold, dash 0.1 / gap 4, round caps), the first Expanded, twelve questions (four kept, eight new placeholders), one written answer.
2. Rewrote the copy for Figma's twelve, keeping its first answer; the eight new ones answered from the repo (no WCAG level claimed, only the rules Bland follows; no token export beyond CSS, the JSON stays in the repo; tokens versioned with the npm package). The first draft's extras moved to "Spares" in `docs/landing-copy.md`.
3. Layout on the page grid: `.faq__body` became `display: contents` so the head and list take grid columns (2 to 4 and 5 to 7 at xl, halves at md). Dots as a radial-gradient tile in `landing-values.css`.
4. Spec: a 1440 check of Figma's geometry found the questions 384 wide, not 376: Figma's list hugs 376 inside its 16 padding, so the right side is space-xl. `data-flush` is `"true"`, not empty. 12 FAQ checks pass in Chromium and WebKit.
5. Broke the footer: the redesign's rewrite of the FAQ block in `landing-values.css` cut the file at the block's start and dropped the footer's block appended after it. Restored it verbatim from the footer session's two writes (its append and the phone-height change); all seven values defined again, footer specs 12 pass in Chromium and WebKit, checked in Chrome. LEARNINGS entry added.
6. Godwin: heading as "Some questions" / "about Bland". `FAQ_TITLE` became the two lines, each a block span; spec checks both lines and the one accessible name. 12 FAQ checks pass in Chromium and WebKit.
7. Godwin: centre the npm mark on the footer links row. Its list item's line box put it 2px above the pills' centre; `.ft__links > li { display: flex }` makes every item as tall as its content, all four centres now level (checked in Chrome).
8. Godwin: push the npm mark down a little. `translate: 0 var(--space-2xs)` on `.ft__mark`, 2px below the pills' centre (checked in Chrome).

## Landing page: mobile pass (side session, 2026-11-09)

Godwin tried the landing page on his phone and sent a list of changes.

1. Read the shared notes, every section's CSS and the components behind the changed parts. Every section headline used Heading/heading-sm with Bland's 0 letter spacing on a phone and Figma's -2px from breakpoint/md, which is why a phone looked more spaced.
2. Letter spacing: one `--landing-heading-tracking: -0.0465em` in `landing-values.css` (Figma's -2 at 43, as a share of the size); every section's own tracking value points at it and is used at every width (feature row, Brand theme, What you get, showcase, Figma kit, FAQ). Hero and footer headlines already used em.
3. Tap highlight: `-webkit-tap-highlight-color: transparent` on `html` in `landing.css`.
4. Feature row: below breakpoint/md, `FeatureRow` renders `StackRow`, the same cards stacked in the flow (`data-layout="stack"`). Each plays as it shows. The sideways track is `SideRow`, unchanged.
5. What you get: the phone gets the desktop's pinned track (`data-layout="phone"`): the slide changes with the scroll position, with the same rise and pops. No gesture moves a slide on a phone; the page scrolls freely. The tag sits space-sm over the sentence (was space-4xl), the components space-4xl under it (was space-2xl), and the drawn icons are at 0.6 (`--landing-wyg-icon-zoom-sm`). The cluster zooms down when sentence and parts don't fit the screen together: at 320 x 760 the first slide cut off the tag and the button.
6. The screen-reader list (`ul.wyg__hidden`), now rendered on phones too, widened the page to 877 at 375 (clipped, but full width with `nowrap`). It is now one pixel square.
7. Showcase controls, after Godwin's mockup: below breakpoint/md the toolbar is a grid with the component set, the font field (fills the room, caret at the end) and the theme in one row, and the swatch strip full width under them, each swatch an equal share (`--swatch-count`). The ring moves by `left` there and by its old transform from md. Section padding space-3xl and grid margin space-md on a phone; Figma's values from md.
8. Figma kit and FAQ: space-3xl padding and a space-lg grid margin on a phone; the FAQ list's inset is 0 there. Figma's values from md.
9. Hero headline, not touched (Godwin to decide): see the session's report and LEARNINGS.
10. Checked at 320, 375 and 390, light and dark, with Playwright screenshots: nothing scrolls sideways.
11. Specs: the phone specs of `what-you-get.spec.ts` (blocks to the pinned phone stage, gap checks) and `feature-row.spec.ts` (stacked cards) were rewritten on purpose.
12. Godwin's second phone list. Feature cards: space-5xl between cards (was space-xl); title and description space-lg from the picture (was space-3xl).
13. What you get: each slide's parts split by Figma's place on the frame, the ones above its middle over the sentence and the rest under it (`half` in `Parts`). That gives four icons above and four below on "Nothing hardcoded", the figure above and the eye below, and the grid above the other icons. Parts at 0.8 of Figma's size on a phone (`--landing-wyg-parts-zoom-sm`), the drawn icons 0.75 of that. The fit zoom now covers both clusters.
14. The Accordion on "Motion with manners" pushed the sentence down as it opened. It now sits over an unseen copy of itself open (`reserve` on the part, `.wyg__reserve`), so its room is kept and nothing moves; a spec checks the sentence stays put. The cost: a gap under the closed Accordion.
15. Figma kit: on a phone the copy is `display: contents`, so the head sits above the picture and the checklist under it (`order: 1`); the copy column is back from breakpoint/md.
16. Headlines: the showcase, Figma kit and FAQ titles are all 27px (Heading/heading-sm) on a phone, the same tracking; no change.
17. Specs: `goTo` in `what-you-get.spec.ts` reads the first of the phone's two clusters; the Figma kit phone spec checks the head, picture, checklist order. What you get, feature row and Figma kit specs pass in Chromium and WebKit; lint and typecheck pass; 320 and 390 checked.
18. Godwin's third round, with a phone screen recording (frames pulled with ffmpeg). Feature cards: the title and description gap back to space-3xl; the stacked section's padding space-7xl above and below (was space-xl).
19. What you get filled the screen only to the small viewport: on a dark slide the page's white showed under it once Chrome's address bar slid away. The stage is now `100lvh` tall, its phone content inset to the small viewport (`bottom: calc(100lvh - 100svh)`), so nothing hides under the bar.
20. The pairs above the sentence (Text Input and Modal, Segmented bar and File upload, Accordion and Calendar) stand side by side (`nowrap`), at 0.7 of Figma's size, with narrower phone widths (`--landing-wyg-*-width-sm`), and run off the screen's edges. The drawn icons keep 0.6.
21. Brand theme on a phone never stuck: it was built to scroll and advance its steps on a timer (the pinned stepper is from breakpoint/md). Asked Godwin.
22. The recording also shows the hero's headline and description arriving about six seconds after load (only the button before). Noted for the hero pass, not changed.
23. What you get, feature row and Brand theme specs pass in Chromium and WebKit; lint and typecheck pass.
24. Godwin: the hero should not scroll on a phone; "the texts should just be transitioning" (the pinned stage slid up as the address bar hid). Below breakpoint/md the hero is one `100svh` screen with no track, and `useTrackProgress` plays the story on time: `tuning.phone` (DialKit "phone": delay 1600, headline over 1800, description over 9000 ms), mapped onto the same ranges the scroll covers, so the outline, ink wash, highlights, icons and the turn to dark run as on desktop. Desktop keeps the scroll story. New spec in `tests/site.spec.ts`: one screen, no scroll, ends dark with the headline outlined; hero specs 30 of 30 in Chromium and WebKit; lint and typecheck pass.
25. Misread: Godwin wants the scroll story as it was, only without the page moving until the description has played. Took out the timer (`tuning.phone` removed). On a phone the hero stays one screen, and while the page is at its top `useTrackProgress` turns wheel and touch moves into story progress (prevented, so the page and the address bar stay put), travel `(trackScreens - 1)` screens as before; at the story's end gestures scroll the page; at the top, scrolling up runs it back. The phone spec now wheels it through with `scrollY` at 0, then checks the page scrolls and the story reverses. Hero specs 30 of 30 in Chromium and WebKit; lint and typecheck pass.
26. Godwin asked to step back. The gesture capture (items 24, 25 and the gain/fling added after) replaced native scrolling to hide a sizing problem: a stage `100svh` tall slid up with the address bar. Reverted it all (no `usePhone`, no `tuning.phone`, the phone hero is the scroll track again) and fixed the cause: `.hero__stage` is `100lvh` with its bottom padding raised by `100lvh - 100svh`, as What you get's stage. The phone specs are one native-scroll check again. Hero specs 30 of 30 in Chromium and WebKit; lint and typecheck pass.
27. Godwin: What you get's scrolling is inconsistent (sometimes two scrolls for one slide, sometimes one scroll moves two). Reviewed before fixing. Cause: the desktop code guessed gesture boundaries from wheel deltas (quiet time, size ratios), which JavaScript can't see. It took inertia tails for new flicks (two slides) or swallowed real flicks as tails (two scrolls); three earlier patches had tuned the guesses. On a phone nothing tied a swipe to a slide. Removed the wheel, key and touch gesture code; added one snap point per slide (`.wyg__snap`, `scroll-snap-stop: always`) and `scroll-snap-type: y proximity` on `html`, so the browser, which knows real gesture phases, decides.
28. Tried to verify with Playwright: simulated flicks don't carry gesture phases, so Chromium snapped back to the start every time and WebKit skipped slides, under proximity and mandatory alike. A minimal nested mandatory-snap page did the same (Chromium barely moved, WebKit skipped four). Headless input can't judge native snap feel; it needs Godwin's real trackpad, mouse and phone. LEARNINGS entry added.
29. Godwin's phone recording of item 27's build: on Every part, Dark mode and Motion he swiped again and again while the scrollbar barely moved, then later swipes jumped ahead. Page-level `proximity` snapping pulled each swipe back to the slide's point: the next one, a screen away, is out of reach for proximity. As flagged, moved to the standard pattern: the section is one `100lvh` screen with the stage underneath and its own scroller on top (`.wyg__scroller`, `scroll-snap-type: y mandatory`, six full-height `.wyg__pane`s with `scroll-snap-stop: always`, no visible scrollbar, focusable for arrow keys). The scroller is `overflow-y: hidden` until the section fills the screen (`data-engaged`, IntersectionObserver at 98%), so slides never change half in view; the page settles the section at its top when near (`html` proximity, `.wyg { scroll-snap-align: start }`, the page's only snap point); at either end the next gesture chains to the page. The slide on screen is the scroller's pane. Removed the track, its height rules, the window scroll index and the `scroll` tuning group. Specs: the gesture specs became structural checks (one screen, six panes, snap stop always, engaged only in full view) plus arrow keys on the focused scroller; full landing suite 213 passed, 1 skipped in Chromium and WebKit; lint and typecheck pass. Gesture feel waits on Godwin's devices.
30. Godwin: with the scroller, a fast flick from above or below skipped the whole section (one screen tall, crossed before its snapping took over), on phone and desktop. Asked how the feature row avoids it: a tall track the flick must travel, the card by scroll position, and guidance to the nearest card once scrolling stops. Laid out the trade-off (no skipping, but a strong flick inside can pass two slides) and Godwin chose the feature-row model. What you get is a track again (`(slides - 1) * screensPerSlide` screens plus one, sticky `100lvh` stage), slide k at k / 5 of it, and the feature row's guidance copied with its numbers (settle 260ms, glide 380 + 410/screen, any wheel, touch, key or press takes back). Removed the scroller, `data-engaged` and the page's snap point. Specs: settles on the nearest slide from 2.3 and 2.7, a fast flick from above lands on a whole slide inside the track, Page Down moves one. Landing suite 215 passed, 1 skipped in Chromium and WebKit; lint and typecheck pass.

## Landing hero: headline pace and glow cost (2026-11-09, hero session)

1. Godwin: the headline turns to outline too quickly, follow the footer; and is the headline heavy? Compared: the footer fills over half its own scroll (about 480px) with two blur layers a word; the hero's wave was 0.063 to 0.12 of a 2547px track, about 145px, with 48 blurred, masked layers.
2. Measured scroll frames in Chrome with layers switched off: no glow or no filter took frames from 100 ms to over a second (dev) down to 8 ms; no mask barely helped. `will-change: opacity` on `.hero__glow` gave the same 8 ms.
3. The dev server was still slow on the first pass after a reload: long-animation-frame entries showed React development work and forced layouts from every section's scroll handler (Hero, FeatureRow, WhatYouGet, BrandTheme). A production build served from the scratchpad ran 8 ms median, 10 ms p95 cold; without the `will-change`, the headline's p95 was 42 ms.
4. Set `titleStart` 0.02 and `titleEnd` 0.22 (about 500px) and the `will-change`. Checked in Chrome mid-change: the words go one by one.

## Light/dark line follows the pointer (2026-11-09, from the top session)

- Godwin: the line should sit where the cursor is, and where the user taps on mobile. Re-read the files after the landing-mobile session (stacked cards below md, tap highlight off); `ThemePicture.tsx` was unchanged, so built on it.
- A mouse `pointermove` over the picture (fine hover pointers only) now sets the split and turns on the same instant-follow state a drag uses; `pointerleave` ends it. Tap and drag were already there (pointerdown sets the split, capture moves it).
- Specs: the mouse follow (70 then 20, grip within 2px of the cursor), a tap at a quarter (75) at 390 wide with touch, and a real touch drag through CDP in Chromium (synthetic pointer events can't take pointer capture). Chrome: after a hover the grip sat at the cursor's x (378), no console errors.
- Full landing suite, Chromium and WebKit: 216 passed, 6 failed, 2 skipped (8 minutes, parallel). All six (feature-row dark axe, tab thumb, showcase switcher and every component, FAQ axe, Figma kit cursor) passed when rerun alone, the showcase one on the second try: load flakes. Lint and typecheck pass.

### What you get, fifth pass: components appear instead of popping (2026-11-09, side session, from the top session's relay)
- Godwin: no pop on the components, keep it for the icons, stagger the components as they come into view. Re-read the files first: the landing-mobile session had reworked the scrolling (long track, slide by position, glide to the nearest) and the phone sizes; built on top, nothing reverted.
- `what-you-get.css`: `.wyg__part:not([data-vector])` plays `wyg-appear` (opacity + `transform: translateY(var(--wyg-appear-y))`, duration/lg, easing/out, delay duration/xs + `--k` x `--wyg-appear-stagger`); `[data-vector]` keeps `wyg-pop`. `transform`, since `translate` positions the stage parts. Reduced motion fades both.
- `tuning.ts`: new Appear folder, `y` 16 (0 to 48), `staggerMs` 60 (30 to 80).
- Spec: the rise test now checks components move up, stagger and never scale; a new one checks the "Works for everyone" icons still pop.
- what-you-get spec x3 in Chromium and WebKit: 108 passed. Landing suite (Chromium + WebKit): 221 passed, 1 failed, 2 skipped: the glide-to-nearest spec under the full parallel load (a different scroll spec each run; all pass alone). Lint and typecheck clean.
- Chrome: Godwin's window reports 0 wide (minimized), so no screenshot; a trace there on the phone layout showed field, modal, bubble, button rising 16 to 0 one after another, scale none.
- Godwin corrected it: the line should work as before; the grip should follow the pointer and grow while dragged. Reverted the line's hover-follow; the grip's height is the pointer's (`--grip-y`, `data-grip-follows`), it scales on `data-dragging`. Specs: hover moves the grip to the cursor's height and leaves the split alone, the grip is 1.25 while dragging and none after, a phone tap puts the grip at the touch. Chrome: after a hover the grip sat at the cursor's y (340) while the line stayed at the story's place, no console errors. Landing suite (3 workers): 220 passed, 4 failed, 2 skipped; the 4 (row dark axe, showcase axe twice, hero scroll) passed alone. Lint and typecheck pass.
31. Godwin (with a phone recording): the hero headline's animation is jittery. In the recording the crisp headline vanished for frames at a time mid-scroll, leaving only its blurred glow. Measured on a 390 x 844 3x phone profile: 48 glow layers (8 a word: two colours x four blur bands), each `will-change: opacity` and padded 142px for its blur, about 237 MB of GPU memory, more than a phone browser keeps, so Chrome dropped tiles; and each scroll frame set React state, re-rendering 366 headline spans, at 40 ms median, 87 p90, 102 worst with 4x CPU throttling. Fix: the glow is one text shadow on each word's bold fill (`--landing-hero-glow-shadow`, purple and blue at their middle blurs, doubled since a text-shadow's radius is twice a blur filter's), fill and outline each a compositor layer; the scroll loop writes `--bold`, `--ink` and `data-on` straight to the elements, and React renders only when a phrase is reached (strokes, icon, dark). Removed the glow copies, `useTitleBands` and the glow padding. After: 12 layers, about 7 MB; 16.7 ms median, 17.6 p90, 37 worst at the same throttle. Side by side with the old glow at 1440 and 390: close, with an even blur instead of Figma's top-to-bottom ramp. Hero and footer specs 42 of 42 in Chromium and WebKit; lint and typecheck pass. The footer's own glow is 10 blurred layers, about 25 MB, not composited: noted, not changed.
- Godwin: the grip snapped between positions. The `top` transition (duration/sm) restarted at each pointermove, so it lurched from point to point. Replaced by a per-frame exponential follow in JS (no React render per frame); the rest height moved to `landing-values.css`. Spec: after one pointer jump the grip passes through more than five heights, never backwards, and arrives within 3px. Chrome: path 631, 621, 616, 612 ... 561, 560, no console errors. 11 grip and line specs pass in Chromium and WebKit (1 skipped, the CDP drag in WebKit); lint and typecheck pass.
32. Godwin: the hero takes a moment to show on his phone after a refresh. Measured on a 390 x 844 3x profile, 30 ms round trips, 4x CPU: the dev server (what his phone opens) sends 219 files, 14 MB, first paint at 9.5 s; the production build sends 11 files, first paint at 1.1 to 1.5 s, headline at about 2 s. Of the build's 3.4 MB, 2.3 MB is `site/src/hero/visuals/swatches.svg`: a broken Figma export whose 78 paths hold 2.3 million characters (the stroke outlined into tiny segments; the other icons are 3 to 7 KB). The page also renders nothing until its one 970 KB script (272 KB gzipped, every section) has run. Reported; no change yet.
33. Godwin: fix both. (1) `swatches.svg`: its 18 blue outlines were Figma-flattened into fills with hundreds of thousands of segments; each one's own mask already held the clean outline (a `<use>` of a defs path or an inline path), so each became that outline stroked at 14 under the same mask, as `sun.svg` draws. 2.3 MB to 55 KB; rendered side by side at 4x, 152 of 73,057 inked pixels differ (0.2%, antialiasing), same look. (2) Everything below the hero moved to `site/src/rest.tsx`, loaded with `React.lazy` (one chunk for the sections in `<main>` and the footer). First script 970 KB to 258 KB (272 to 81 KB gzipped). Production build under the same phone profile: first paint 1.1 to 1.5 s down to 0.3 to 0.5 s, hero on the page at about 0.5 s (was 1.6 to 2 s), the rest at about 1.2 s, 3.4 MB to 1.25 MB in all. The footer specs read the footer right after `goto`; they now wait for it (`open()`). Landing suite 226 passed, 2 skipped in Chromium and WebKit; lint and typecheck pass.

### Landing page performance audit with web-quality-skills (2026-11-10, top session)
- Godwin: install https://github.com/addyosmani/web-quality-skills and test the landing page's web performance. Cloned it into the scratchpad and read it first: six Markdown skills (web-quality-audit, performance, core-web-vitals, accessibility, seo, best-practices) and one read-only HTML checker script, MIT, no hooks or network calls. Copied the six into `~/.claude/skills/` (user level, beside stageshow).
- Chrome DevTools MCP would not start: another session's browser holds its profile. Fell back to the skill's second route, the Lighthouse CLI (`npx lighthouse@13`, 13.6.0, not added to the repo), three runs each on `npm run site:build` + `npm run site:preview` (localhost:5183), cold, simulated throttling. Mobile 412 x 823, 4x CPU, 150 ms, 1.6 Mbps; desktop preset.
- Mobile median: FCP/LCP 0.92 s (0.91 to 1.58), TBT 56 ms (55 to 130), CLS 0.105 (0.091 to 0.105), Speed Index 2.07 s, score 97. Desktop median: FCP 0.37 s, LCP 0.53 s, TBT 0 ms, CLS 0.095 (0 to 0.095), score 98. Page weight 445 KB transferred. LCP element: the hero description. No field data (localhost).
- Findings: the only layout shift is `div.hero__action` ("Read the docs now"), 0.105 on mobile, at the 0.1 line. Render-blocking `index.css` (41 KB gz, about 300 ms on mobile, 23 KB of it unused at load). `rest` chunk 185 KB gz with 80 KB unused at load. A 61 ms forced reflow in React's commit at startup. Five font files (Inter 400 to 700, Geist Mono) loaded at start. Reported to Godwin; nothing changed.
34. Godwin: a bigger headline on a phone; the button "Read the docs" (no "now", desktop too) shown once the headline's entrance is done; a bigger phone nav with the Docs text. Headline below md: `--landing-hero-title-font-sm`, `min((100vw - 2 * space-lg) / 5.4, 96px)` (the widest line, "for purpose.", is 5.3 times the size) on Figma's three lines at every width: 53px at 320 (was 56 on four lines), 66 at 390 (was 56), 74 at 430; desktop unchanged. Button: `data-ready` on the hero after `charStagger * (characters - 1) + charDuration` (about 0.8 s); on touch it fades and rises in then, with a fine pointer the hover reveal waits for it (desktop selectors raised to match the touch rule's specificity); reduced motion fades only. Nav below md: space-md padding (48 tall, was 40), Body/body-lg links, Docs shown; Figma's bar from md. Phone spec now checks Docs, three lines and the late button. Hero and footer specs pass in Chromium and WebKit; lint and typecheck pass.

## Landing hero: button cursor and yellow highlighter (2026-11-10, hero session)

1. Godwin: the Read the docs button keeps the arrow cursor; and the highlight should be a highlighter-pen yellow. Bland's Button sets no pointer (only not-allowed when disabled), so `cursor: pointer` went on the hero's button alone.
2. Marker color moved from Surface/surface-brand to `--landing-marker-color` #ffe733 (landing-values.css). At strength 55 it was pale on white; 85 reads as a highlighter.
3. Dark: white text on yellow is unreadable, so lit phrases get `data-theme="light"` (black text). Then the black letter tops sat on the dark page above the low band, so the band covers the whole letter height once dark (`DARK_MARKER_TOP`). Checked both in Chrome.
4. Found the landing-audit session editing Hero.tsx at the same time (the glow constants had moved); my first insert missed and the page crashed until the constant was re-added. Messaged that session with my changes.

### Landing page full web quality audit (2026-11-10, landing-audit side session)
- Task from the top session: the full `web-quality-audit` (performance, Core Web Vitals, accessibility, SEO, best practices, agentic browsing) on the production build, after the landing-mobile hero change. Read-only.
- `npm run site:build`. Port 5183 was already held by another session's `vite preview`; it served the fresh hashed files (200), so it was used as is.
- Chrome DevTools MCP: "browser is already running" again. Fallback: Lighthouse CLI 13.6.0, all five categories, three mobile and three desktop runs, JSON in the scratchpad. A Playwright probe in real Chromium for LCP and shift sources (mobile 4x CPU, 1.6 Mbps, 150 ms), axe on the whole page (light and dark, 1350 and 390 wide, scrolled through so the lazy sections render), a Tab walk and reduced motion. `analyze.sh` on `dist-site/`: 0 issues (the HTML is an empty root).
- Mobile median: LCP 2.56 s (was 0.92), CLS 0.058 (was 0.105), TBT 102 ms, score 95. Desktop: LCP 0.47 s, CLS 0.095, score 98. Accessibility 97, Best Practices 96, SEO 92, Agentic 48 to 50.
- The "Read the docs" shift is gone. New: mobile LCP is the hero description, which fades in 420 ms after the headline; the remaining CLS is the Inter swap (one real throttled run 0.214); the description rests at 1.31:1 (already pending Godwin in `tests/site.spec.ts`); `site/public/_redirects` still sends `/` to `/docs/`; no robots.txt, sitemap, llms.txt, 404, favicon or social tags.
- Report: `docs/landing-audit-2026-11-10.md`. Nothing changed in code, nothing committed.
- Godwin: fix all, keep the description's gray, say first what any visible or interaction change will do. Done the invisible ones: `preloadHeroFonts` in `site/vite.config.ts` (first 700 + 400: CLS 0.025 left, the description is Inter 600; then 700 + 600: CLS 0 in Lighthouse x3 per profile and ten throttled Chromium runs), `site/public/robots.txt`, `llms.txt`, `_headers` (checked with `wrangler pages dev`; it also confirmed `/` still 302s to `/docs/` and unknown paths answer 200). SEO 100, Agentic 75, mobile LCP still 2.56 s. Forced reflow mapped with a scratch source-map build: React's commit plus Bland's tab indicator and What you get, not the hero; left alone. Listed the visible changes for Godwin before making them.

#### Landing audit follow-ups (2026-11-10, Godwin's answers)

- Removed `/ → /docs/` from `site/public/_redirects`. Added `site/404.html` + `site/src/not-found/` as a second Vite input; the font preload plugin now skips it. First build drew the link buttons unstyled: Button's CSS ships with Button.tsx, so a page using only the classes must import `button.css` itself. Wrangler: `/` 200 landing, `/nope` and `/docs/nope` 404 with the 404 page; axe clean on it in both themes, phone and desktop.
- Nav: Figma icon hidden below sm (`li.hero__nav-figma`); icon links get a 24px `::after` hit area (checked with elementFromPoint 1.5px outside the icon).
- Scanned the full git history for secrets (token patterns, key files, .env, .npmrc): only design-token files and a `<token>` placeholder. Made JGodwyn/bland-design-system public with `gh repo edit --visibility public`; the URL returns 200. Added it to `llms.txt`.

## Bland logo and logomark: Figma variants, docs site (2026-11-10)

1. Godwin drew a Logomark set (`7203:40128`) and put it in the Logo set (`14:211`); asked for more Logo variants in Figma and the logo on the docs site (the landing page is his).
2. Read both sets through `use_figma`. Logomark was complete (3 types x cut-out x 2 sizes). Asked which Logo variants to add: mono logos.
3. Figma: renamed the four Logo variants to `Mark=colored`, cloned them as `Mark=mono` (White cut-out mark on default; Black cut-out mark with the tile overridden to Icon/icon-on-color on on-color), set grown to 239 x 216, Logo description rewritten, Logomark given a description (it had none).
4. Exported the mark as SVG strings (`exportAsync` SVG_STRING). Docs: `playground/docs/BlandMark.tsx` (cut-out, currentColor, `useId` for the clip), in both brand links of `DocsApp.tsx`; `.docs-brand` a row with `.docs-brand-mark`; `playground/favicon.svg` linked from `index.html`.
5. Checked in Chrome at http://localhost:5180 (light). Typecheck passes; `tests/docs.spec.ts` in Chromium 160 passed.
6. Left for Godwin: the package Logo's new wordmark (Bold, -2 / -1 letter spacing has no token). See INTERFACE.md.

## Logo component: SVG wordmark, built-in mark, mono (2026-11-10)

1. Godwin: ship the wordmark as SVG, show the Bland mark by default; asked if the docs Logo page changes too (yes: its story).
2. Exported both text layers as outlined SVG (`exportAsync`): the sm path is the lg one halved, so one drawing. Read the lg layer's render bounds against its box for the ink offset.
3. `Logo.tsx`: `Logomark` and `Wordmark` SVGs, `mono`, `mark` default, `children` deprecated with a dev warning. `logo.css`: gap space-2xs, mark colors, `.bland-logo__text` for the deprecated text.
4. Story rewritten (sizes, colors, mono, mark false and custom, focus); demo's mark control is Bland / none / ProjectMark. Docs chrome uses `<Logo>`; `BlandMark.tsx` deleted.
5. Typecheck and lint pass. Chromium suite: 834 passed, 2 failed (the Logo screenshots, as intended), re-baselined. WebKit spot check of the Logo a11y and phone menu specs passes. Checked the Logo page and the raw story in Chrome.
6. CHANGELOG (Unreleased, needs 0.2.0), CLAUDE.md map row, `docs/agent-skill.md`, Figma Logo description, tracker.

### Landing page: footer, the logo (side session landing-footer, 2026-11-10)

1. Godwin: "add the logo to the footer" (same frame `7100:36365`). Read it again with `get_design_context` and `use_figma`: Figma now has a Logo instance (`7203:40791`) first in the column: lg, Mark slot = the Logomark Type=White, CutOut=true, 154 x 48 (the lg Logo, 40 tall, at 1.2: mark box 48, logomark 38.4, gap 2.4), 32 above the headline; no annotations. The column is 692 tall now, so the 960 frame's centred padding is 134 (was 174).
2. Reused Bland's `Logo` with `mono` (its docs: "mono matches the wordmark: the inverse tile on default"), so no Figma asset was downloaded and nothing was redrawn. 1.2 is a `zoom` on the Logo from md (1 on a phone). It is a `.ft__block` like the others but with no delay, so it rises with the headline's first characters.
3. `tests/footer.spec.ts`: a logo spec (named Bland, mono, 48 tall and 154 wide at 1440, 32 above the headline, flush left, mark color = wordmark color and not the brand's, not a link) and the logo in the phone fit check. First run failed on my own locator (`getByRole('link', { name: 'Bland' })` matched "bland-ui on npm"); made it exact. 14 pass in Chromium and WebKit; lint and typecheck pass.
4. In Chrome at 1440: logo 155 x 48, white tile with the B cut out, flush with the headline.
9. Godwin: the open question snaps shut when another opens (a single one animates). Cause: the native `name` group closes it, a browser change the Accordion follows without motion. The FAQ now keeps the open index itself (`open` + `onOpenChange`, no `name`); in Chrome the old one folds 144 to 40 and the new one opens 40 to 216 together over about 200ms. New spec samples the old question's height frame by frame; 14 pass in Chromium and WebKit.
5. Whole landing suite in Chromium and WebKit after the logo: 225 passed, 2 skipped, 3 failed. The logo spec measured the gap to the headline while the logo was still rising into place (the entrance moves it 24px): 22 on Chromium and 29 on WebKit under the suite's load, 32 alone. It now waits for the logo's transform to be `none` first; footer specs 14 of 14 pass in both. The third failure, `tests/feature-row.spec.ts` "a tab row's selection sits on its tab in a card that was small when it was drawn" in WebKit (the indicator 274px off its tab), fails alone too and touches nothing of the footer (`tabs.tsx`, `FeatureRow.tsx`, `row.css` and that spec were last edited Nov 8 and 9, by other sessions); left for landing-features.
- Second pass (Godwin: go on with 1, the link, no skip link, logo added): `descriptionDelay` 0; hero "Read the docs" an `<a>` with Button classes (importing `button.css` itself; tests now look for the link inside `.hero`, since the footer has one too); favicon copied from `playground/favicon.svg` (another session's Logomark export), `apple-touch-icon.png` rendered from it on the tile's blue, `og.png` a 1200 x 630 shot of the built hero with the description hidden; Figma-hidden check added to site.spec. Lighthouse mobile came back 90/91 with FCP = LCP 2.8 s: the simulator counted `rest` (188 KB, requested before the observed first paint). Ruled out the 404 page's shared chunk (single-entry build measured the same in real Chromium; first try served it with python http.server, much slower, not comparable). Deferring the `rest` render two frames: 96/96/92. Landing specs 116 passed. `tests/faq.spec.ts:80` fails typecheck (another session's file, left).
- Third pass (Godwin: everything still open but the Figma links): fixed `tests/faq.spec.ts:80` (`d[3]!`). Canonical, sitemap, absolute share URL and the ARD manifest all need the domain (the ARD identifier is `urn:air:<publisher domain>:…`), and the repo names none, so `siteAddress()` in `site/vite.config.ts` writes them from one `SITE_URL` constant and warns while it is unset. Checked with a test address (`https://bland-test.pages.dev`, scratch build only): Lighthouse agentic 98 (ARD 0.9, one Low note: a `text/markdown` entry is read as agent skills without `profile=`; left, it is not a skill), SEO 100, best practices 100. Without it: robots.txt only, no warning-free sitemap. Site + faq specs 22 passed, typecheck clean.

## Landing: hand cursor on all Buttons, Read the docs in dev (2026-11-10)

- Godwin: "yes, all buttons". `cursor: pointer` on `.bland-button`, `progress` while `aria-busy`, disabled kept at `not-allowed`; removed the hero-only rule. CHANGELOG 0.2.0 (not yet on npm), INTERFACE, component map.
- Godwin: Read the docs does not open the docs. The button was already a real `<a href="/docs/">` (another session, landing audit), fine on the built site; on the dev server `/docs/` served the landing page. Added `devDocsRedirect()` (dev only, 302 to 5180, hash kept). Checked in Chrome: the click lands on the docs Overview, `/docs/#/components/button` lands on Button. Lint, typecheck, button screenshots pass.

## Release 0.2.0 prepared (2026-11-10)

- npm had 0.1.3; the Unreleased CHANGELOG held a Logo change that needs a minor, so the version is 0.2.0 and the entry is dated 2026-11-10.
- Ran typecheck, lint:css, test:lint, test:tokens, test:brand, test:drift (all pass), `npm test` (1400 passed, 12 skipped, 4 failed under load; the four pass alone with `--workers=1`), `npm audit --omit=dev` (0), `npm pack --dry-run` (77 files, 154.5 kB).
- `npm run build` failed in the declarations step: `Logo.tsx` read `process.env.NODE_ENV` and `tsconfig.build.json` has `types: []`. Dead end avoided: no `@types/node` in the library build. Fixed with a module-local `declare const process` in `Logo.tsx`. Then `npm run test:package` passed.
