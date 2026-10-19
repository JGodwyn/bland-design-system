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
