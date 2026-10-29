# Bland

Godwin's design system: design tokens as CSS custom properties and React components built on them. One package, rebranded per project with a 13-step brand color (and neutrals tinted toward it), in light and dark.

- Inter for UI text, Geist Mono for code, self-hosted.
- Every component value is a token: rebranding or theming never touches component CSS.
- React 19, React Aria for keyboard and screen reader behaviour, Floating UI for positioning.

## Install

Bland is published on npm as `bland-ui` (not yet: `docs/release.md` has the steps):

```bash
npm install bland-ui
```

Peer dependencies: `react` and `react-dom` 19. Components take `ref` as a prop, which React 18 does not pass through.

## Load the CSS, in this order

```ts
import 'bland-ui/tokens.css';  // every token, light and dark
import 'bland-ui/fonts.css';   // Inter and Geist Mono (skip it if the project already loads them)
import 'bland-ui/base.css';    // light reset, page defaults, focus ring, corner smoothing, scroll fade
import 'bland-ui/styles.css';  // every component's CSS
import './brand.css';       // the project's brand override, last
```

The stylesheets are plain CSS. `fonts.css` imports the font files from the `@fontsource` packages Bland depends on, so it needs a bundler that resolves CSS `@import` from `node_modules` (Vite, webpack, Next.js, Parcel all do). Without a bundler, link `tokens.css`, `base.css` and `styles.css` from `node_modules/bland-ui/dist/` and load the fonts yourself.

## Use the components

```tsx
import { Button, TextInput, Tooltip } from 'bland-ui';

export function Form() {
  return (
    <>
      <TextInput label="Name" placeholder="Ada Lovelace" />
      <Tooltip text="Saves the draft">
        <Button emotion="brand" type="primary">Save</Button>
      </Tooltip>
    </>
  );
}
```

Icons are any SVG passed as a React node (Phosphor, Lucide, your own); Bland sizes and colors them. Every component, its props and its variants are on the docs site.

## Your brand

Bland ships blue. A project brings its own color by overriding the 13 `--brand-*` steps (and the 13 `--neutral-*` steps, tinted toward the brand) at `:root`; every brand-colored token follows in light and dark.

Make the override from one color, in a Bland checkout:

```bash
npm run brand -- generate "#ff5a1f" --out brand.css
```

- `--neutrals full|subtle|none`: grays tinted toward the brand (default), half as much, or pure gray.
- `--fix`: moves other steps until the brand's contrast pairings pass. The color you entered never moves.
- `npm run brand -- check brand.css`: re-checks an override after a hand edit. It warns, never blocks.

Or use the **Brand theme** page on the docs site: pick the color, check contrast, copy the CSS.

Load `brand.css` after Bland's CSS and keep it on `:root`, not on a nested element.

### Extra colors

Up to three more colors for the project's own UI (charts, illustrations, a section, a tag). Bland's components never use them.

```bash
npm run brand -- generate "#ff5a1f" --extra accent=#7c3aed --extra chart --out brand.css
```

Each gets 13 steps (`--accent-0` … `--accent-1000`) and six roles that switch in dark mode: `--accent-surface`, `-surface-strong` (the one that carries white text), `-surface-light`, `-text`, `-icon`, `-border`. Use the roles; the raw steps look the same in both modes. An extra with no color takes the next one in harmony with the brand.

## Light and dark

Without anything set, the theme follows the system (`prefers-color-scheme`). `data-theme="light"` or `data-theme="dark"` on any element wins for it and everything inside, so a theme toggle sets it on `<html>` (and removes it to follow the system again), and a dark section inside a light page works:

```html
<html data-theme="dark">
<section data-theme="light">…</section>
```

## Your own CSS

Build on the same tokens, never raw values: `color: var(--text-bold)`, `padding: var(--space-md)`, `font: var(--type-body-md)` with `letter-spacing: var(--type-body-md-letter-spacing)`, `box-shadow: var(--elevation-neutral-mid)`. Rounded corners: set `--bland-radius` and add the `bland-smooth` class.

## Docs

The docs site shows every token and component with live controls, in both themes. It is not hosted yet: run it from a checkout with `npm run docs` (http://localhost:5180). To try it on a phone on the same Wi-Fi, run `npm run docs:phone` instead and open the `Network:` address it prints.

## Developing Bland

See `CLAUDE.md` for the commands and rules, `docs/components.md` to build a component, `docs/tokens.md` to sync tokens from Figma, and `docs/release.md` to publish.

## License

MIT (`LICENSE`). Inter and Geist Mono are under the SIL Open Font License.
