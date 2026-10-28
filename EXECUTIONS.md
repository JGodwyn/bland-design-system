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
