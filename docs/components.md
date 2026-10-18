# Building components

How every Bland component is built, so components made in separate chats come out the same. Read `CLAUDE.md` and `INTERFACE.md` first: their rules, decisions and component map apply here. Skim `LEARNINGS.md` for the area you're touching.

## Before you start

1. Find the component set in Figma (file `32J76yQH71a7sENjf60RqD`) and read its description and every property. Read the variable bindings of its variants with a read-only `use_figma` script: fills, strokes, padding, gap, radius, size and text style per variant. Build from those bindings, never from screenshots alone.
2. Check the component map row in `CLAUDE.md` and the dependency waves below. If your component nests another one (a Badge's Indicator, a Toast's Icon Button), use the built one; if it isn't built yet, stop and say so.
3. Set the task to in progress in the [Bland Build Tracker](https://claude.ai/code/artifact/6bcbb578-c0e8-411f-a75c-966e611e0134).

## Files

```
src/components/<name>/
  <Name>.tsx            the React component; imports its CSS
  <name>.css            plain CSS, tokens only (npm run lint:css)
  <name>.stories.tsx    the docs page and the screenshots: description, demo, every state
tests/<name>.spec.ts    behaviour: keyboard, focus, states (optional when there is none)
```

`<name>` is the Figma set name in kebab-case (`icon-button` lives inside `button/`, next to Button, because they share CSS). Export the component and its prop types from `src/index.ts`.

## CSS

- **Plain classes, not CSS Modules.** The root is `.bland-<name>`, parts are `.bland-<name>__<part>`, variants are data attributes: `data-size="md"`, `data-type="primary"`, `data-emotion="danger"`. Projects override with ordinary selectors.
- **Tokens only.** The lint rejects any raw value and names the token to use. If no token fits, stop and ask Godwin; never add a value or a token.
- **Component tokens first.** Use the component's own Theme tokens (`--button-brand-primary-hover`) where Figma binds them, then the semantic ones (`--text-bold`, `--border-subtle`).
- **States:** hover is `:hover` inside `@media (hover: hover) and (pointer: fine)`, pressed is `:active`, disabled is `:disabled` or `[aria-disabled="true"]` with the disabled color tokens (never opacity). Selected and checked come from the element's real state (`:checked`, `aria-selected`, `aria-pressed`), not a class.
- **Variant colors (copy `button.css`):** each `data-emotion` block names that emotion's component tokens in private `--_e-*` properties, each `data-type` block picks from them into `--_bg`, `--_text`, `--_icon`, `--_border` and their state twins, and the hover, pressed and disabled rules read only those. One rule per emotion and per type, not one per combination. Private properties start with `--_` and never leave the component.
- **Composite type and shadows:** `font: var(--type-body-md)`, `box-shadow: var(--elevation-neutral-mid)`.
- **Motion:** follow `docs/motion.md`. Name each transitioned property, use the Motion tokens, and give every animation a `prefers-reduced-motion` fallback.

## Shared helpers (`src/styles/base.css`)

Add these classes in the markup instead of rewriting their CSS:

| Class | What it does | Put it on |
| --- | --- | --- |
| `bland-focus-ring` | 2px `--border-focused` ring, 2px offset, on `:focus-visible` only | Every element that takes keyboard focus |
| `bland-smooth` | Figma's 100% corner smoothing: draws `border-radius` from `--bland-radius`, doubled with `corner-shape: superellipse(2)` where supported | Every rounded element. Set `--bland-radius: var(--rad-*)` (the Figma radius) instead of `border-radius` |

The smoothing was tuned against an 8x Figma render of Button lg (2026-10-18): Figma's 100% smoothing spreads the curve over twice the radius, so the CSS radius doubles. If it ever needs retuning, change it once in `base.css`; every component follows.

## Props

- Figma property names become camelCase props; prefixes are dropped (`👀`, `✏️`, `🌟`, `🧩`). Variant values stay lowercase strings: `size="md"`, `type="secondary"`, `emotion="danger"`.
- `👀 Focused` is never a prop; focus is `:focus-visible`. State (rest, hover, pressed) is never a prop; the browser drives it. Disabled is the native `disabled` prop.
- Text properties become `children` when they are the main label, otherwise a named string prop.
- `🧩` slots and `🌟` instance swaps become React nodes: `children`, or named props like `iconStart`, `iconEnd`, `leading`, `trailing`.
- Spread the remaining native props onto the root element and accept `className`, so projects can add attributes and classes.
- Default each variant to Figma's default, unless the set's description says that value is unsafe as a default; then pick the safe one and note why in the component map row (Button defaults to `size="md"` because xs is below the comfortable touch target).
- A Figma property that collides with a native attribute keeps the Figma name, and the native one moves to `html<Name>`: Button's `type` is Figma's Type, `htmlType` is the native type (default `button`, so it never submits a form by accident).
- Loading: set `aria-busy`, keep the accessible name and the rest colors, stay focusable (not `disabled`), and ignore clicks until loading ends. The spinner is `ButtonSpinner` from `button/Button.tsx` in the icon slot.

## Icons

Bland ships no icon pack (CLAUDE.md, "Icons"). An icon prop takes any SVG node. Wrap it in `<Icon>` (`src/components/icon/Icon.tsx`). Set the size from the component's CSS with `--bland-icon-size: var(--icon-md)` on the slot's parent, not with a prop, so icons follow the component's size (the default sits on `:root`, so the parent's value inherits). Color comes from `currentColor`, so set `color` to the matching `Icon/*` or component content token. Icons next to a text label are decorative (no `label`). An icon-only control needs an accessible name (`aria-label`).

Bland's own icons live in `src/icons/` and come from the Figma Icons page: export one with `node.exportAsync({format: 'SVG_STRING'})`, swap its colors to `currentColor`, and drop its `stroke-width` (the `.bland-icon` CSS sets it).

## Overflow

Anything that can scroll uses `<ScrollArea>` (`src/components/scroll-area/ScrollArea.tsx`). It handles the fade and the visible scrollbar together. Use `fadeSize="sm"` in compact areas (Menu). Truncated text is not overflow: give it `text-overflow: ellipsis`.

## Behaviour

- Simple components are native HTML (`<button>`, `<input type="checkbox">`, `<details>`): see "Code stack" in `CLAUDE.md` for the list.
- Interactive components (Menu, Modal, Tooltip, Tabs, Slider, Date pickers) use React Aria hooks or components for keyboard, focus and screen reader behaviour, with Bland's CSS for every visual. Placement uses Floating UI.

## Testing

- `npm run docs` opens the docs site at `http://localhost:5180`. Each story becomes a page at `#/components/<name>`; `#/raw/<name>?theme=dark` shows the story alone, which is what the screenshots capture.
- A story (`playground/story.ts`) has: `title`; `description` (the Figma set description, without em dashes); `components` (export names that get a props table); `demo` (the component whose props drive the controls, starting `args`, `controls` overrides such as a text field for `children` or `false` to hide one, `render(args)`, and optionally `code(args)`, the args the code snippet prints, for controls that build a slot's content: a string starting with `<` prints as JSX); and `render`, every state, shown under Variants and screenshotted. Name demo icon options after their exports (`PlusIcon`) so the code snippet reads like real usage.
- Props tables are generated from the component's TypeScript and JSDoc, so write a JSDoc line on every prop: that line is the docs.
- Focus preview: the demo offers a "focused" checkbox by itself whenever the component renders an element with `.bland-focus-ring`, so don't add a `focused` arg. In the story's `render`, show a Focused row (a `pg-focus` wrapper) only if the component takes keyboard focus; display-only components (Badge, Indicator, Avatar, Icon) never get one.
- `npm test` runs Playwright in Chromium: a screenshot of every story in light and dark (`tests/visual.spec.ts`), axe accessibility checks (`tests/a11y.spec.ts`), and each component's own spec.
- A new story has no screenshot yet: run `npm run test:update` once, look at the PNGs in `tests/__screenshots__/`, and commit them with the component. Run it again only when a visual change is intended, and say so in the commit.
- Baselines are taken on macOS. Another OS renders fonts differently; re-baseline there rather than loosening the threshold.

## Done means

- [ ] Every Figma variant and property is covered; differences from Figma are written down in the component map row.
- [ ] `npm run lint:css`, `npm run typecheck` and `npm test` pass.
- [ ] The story shows every state, and the screenshots were looked at.
- [ ] The component map row in `CLAUDE.md` has the import and the prop mapping.
- [ ] The tracker doc shows it done, with a log row.
- [ ] `EXECUTIONS.md` has a section for the task; anything decided is in `INTERFACE.md` and anything surprising in `LEARNINGS.md`.

## Dependency waves

Components that nest others come after them. Within a wave, components can be built in parallel chats.

| Wave | Components | Needs |
| --- | --- | --- |
| 0 | Icon, Scroll area, Button and Icon Button | Base only. Button is the reference implementation: copy its patterns. |
| 1 | Badge and Indicator, Toggle, Checkbox and Radio, Progress, Breadcrumb, Accordion, Empty State, Logo, Text Input family | Wave 0 |
| 2 | Avatar, Chip and Pills, Alert, Banner, Toast, Notification, List item, Table, File Upload, Tooltip | Indicator, Button, Checkbox, Progress |
| 3 | Dropdown and Menu, Modal, Tabs, Pagination, Slider, Date and Time, Code snippet, Sidebar, Messaging | Tooltip, Scroll area, Text Input, Badge |
