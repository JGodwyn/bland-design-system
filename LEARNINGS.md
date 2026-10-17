# LEARNINGS.md — solved once, never again

Every non-obvious thing this project has been bitten by, in the shortest form
that still prevents a repeat: **symptom → cause → rule**. Read the section that
matches what you're about to touch *before* you touch it.

**Add an entry the moment something surprises you**, while the cause is still in
front of you, not reconstructed at the end of the task. One entry per learning;
if you're writing a narrative, it belongs in `EXECUTIONS.md`.

Companions: `INTERFACE.md` (design decisions), `EXECUTIONS.md` (what was done),
`CLAUDE.md` (the rules).

---

## Figma (MCP and Plugin API)

**`use_figma` returns nothing past 20 KB.** The full variable export is about
200 KB and the call fails with "Return value exceeds the 20480-byte limit".
The plugin sandbox has no `fetch` either, so it can't send the data anywhere
else. → Export in chunks (`scripts/figma/dump-tokens.js`, `CHUNK = n`), save
each to `tokens/figma/raw/NN.json`, and prove the copy is exact with the
checksum pair (`scripts/figma/checksum.js` in Figma = `npm run tokens:checksum`
locally). Never trust a hand-copied chunk without the matching hash.

**The REST variables endpoint needs an Enterprise plan, and Bland's variables
are local and unpublished.** → Read variables only through the Figma MCP
(`use_figma` read-only scripts or `get_variable_defs`).

**An alpha primitive stores its opacity as 0 to 100, beside an alias:**
`{color: {type: 'VARIABLE_ALIAS', id}, opacity: 6}`. Rounding it through 8-bit
hex turned 6% into 5.9%. → Carry the exact fraction through the build
(`#rrggbb@0.06` internally) and emit `rgb(r g b / 6%)`.

**Figma descriptions can hold HTML entities** (`&#39;` in the `Purple/*`
descriptions). → The build decodes them; fix them at the source when convenient.

**Motion variables are their own types.** Durations are `TIMING` in seconds
(`0.8`), easings are `EASING` objects (`CUSTOM_CUBIC_BEZIER` or `LINEAR`). The
file's existing ones use `ALL_SCOPES` and no code syntax. → Convert seconds to
`ms` in the build; match the existing variables' settings when adding one.

**A Figma frame name can mislead about which node carries a binding.** On the
Button, padding is bound to `space-none` on the root; the real padding lives on
an inner `Base` frame, and a stroke weight showed up on the hidden `focus-ring`
frame. → Read the bindings of every child frame before writing CSS, not just
the component root.

## Fonts

**Fontsource *variable* packages register a different family name**
(`"Inter Variable"`), which never matches `--font-family-sans: "Inter"`. →
Use the static packages (`@fontsource/inter/400.css` etc.), whose family names
are exactly "Inter" and "Geist Mono", and load only the weights the text styles
use.

## TypeScript and React

**TypeScript 7 has no JavaScript API.** `react-docgen-typescript` crashed with
"Cannot read properties of undefined (reading 'React')" at `ts.JsxEmit`. →
`scripts/build-props.ts` installs the `typescript5` alias
(`npm:typescript@5.9.3`) and points the docgen's `require('typescript')` at it.
The project itself still compiles with TypeScript 7.

**CSS side-effect imports fail the typecheck** with TS2882 ("Cannot find module
or type declarations for side-effect import of './icon.css'"). →
`src/vite-env.d.ts` references `vite/client`.

**React 19 types have no global `JSX` namespace.** `() => JSX.Element` fails
with TS2503. → Import `ReactElement` (or `ReactNode`) from `react`.

## CSS

**A custom property's default set on the element itself beats the parent's
value.** `.bland-icon { --bland-icon-size: var(--icon-md) }` meant a Button's
`--bland-icon-size` never reached its icon, so every icon rendered at md. →
Defaults for a variable a parent is meant to set go on `:root`, so inheritance
can override them.

**Native scrollbars can't meet the overflow rule.** macOS overlay scrollbars hide
when idle, and the standard `scrollbar-width` has no 4px option. → The
`ScrollArea` component hides the native bar and draws its own always-visible
thumb, outside the fade mask.

**A pale tint disappears on a grey surface.** The `secondary` Button fill
(`Brand50`) on `surface-200` read as no selection at all in the docs sidebar. →
On `surface-200` and darker, mark a selected option with `stroke` (an outline),
not `secondary`.

## Tooling

**Port 5180 is fixed** (`strictPort`) because Playwright and the docs both expect
it. A dev server left running from an earlier session makes `npm run docs` fail
with "Port 5180 is already in use", and Playwright's `reuseExistingServer`
silently tests against that old server. → `npm run docs:stop` frees the port.
Check what is on it (`lsof -iTCP:5180 -sTCP:LISTEN`) before assuming your
change is broken.

**Generated files are not committed**, so a fresh clone has no
`playground/.generated/props.json`. → The docs import it through
`import.meta.glob`, so a missing file is not a type error; `npm run docs` and the
Playwright web server regenerate it first.

## Working with parallel sessions

**Two sessions share this folder and commit on `main`.** A `git add -A` from one
session picks up another session's half-done work. → Stage explicit paths when
another session is working here, and check `git show --stat` before pushing.

**A side session can't make design decisions.** The Button session stopped on
the spinner's rotation speed because no Motion token fit. → When a value has no
token, the session asks; the answer is a new Figma variable synced through the
pipeline, never a value in CSS.

## Claude Docs (the tracker)

**A table row is not a block.** Inserting a log row with `"as":"markdown"`
before a row id is refused with `shape_mismatch` (needs `tableRow`). → Insert
rows with `"as":"blocks"` and a `row` → `cell` → `paragraph` structure, `side`
`"before"` the newest row.

**Read the doc before writing.** Godwin and other sessions edit it between
turns. → Start with `read( …, {"kind":"view","sinceRev":<last rev>} )` and keep
their edits.

## Browser pane

**Navigating to a URL that only changes the hash can screenshot the old page.**
The screenshot fires before the hashchange render. → Click the sidebar link, or
wait a second, before trusting the screenshot.
