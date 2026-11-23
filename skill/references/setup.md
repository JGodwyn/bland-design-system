# Setting up Bland in a project

## Install

```bash
npm install bland-ui
```

Needs `react` and `react-dom` 19 (components take `ref` as a prop). MIT license.

## Stylesheets, in this order

```ts
import 'bland-ui/tokens.css';  // every token, light and dark
import 'bland-ui/fonts.css';   // Inter and Geist Mono; skip it only if every font is replaced
import 'bland-ui/base.css';    // light reset, page defaults, focus ring, corner smoothing, scroll fade, page grid
import 'bland-ui/styles.css';  // every component's CSS
import './brand.css';          // the project's brand override, always last
```

`fonts.css` imports font files from Bland's `@fontsource` dependencies, so it needs a bundler that resolves CSS `@import` from `node_modules` (Vite, webpack, Next.js and Parcel do). Without one, link the files in `node_modules/bland-ui/dist/` and load the fonts yourself.

Components: `import { Button, TextInput } from 'bland-ui'`.

## Light and dark

- With nothing set, the theme follows the system (`prefers-color-scheme`).
- `data-theme="light"` or `data-theme="dark"` on any element wins for it and everything inside it, so a dark section inside a light page works.
- A theme toggle sets `data-theme` on `<html>`, and removes it to follow the system again. Don't add a class or write separate dark styles: every role token switches by itself.

## The brand override (`brand.css`)

Bland ships blue. A project's brand is 13 `--brand-*` steps and 13 `--neutral-*` steps (grays tinted toward the brand, or pure gray), plus the chart palette, set on `:root` in `brand.css`, loaded after Bland's CSS. Every brand-colored and neutral token follows, in both themes.

**Never write or edit the steps yourself.** They come from Bland's generator, which places the color, builds the scales and checks contrast. Steps worked out by hand look close and are wrong. There are two ways in, and both give the same CSS:

1. **The user gives a brand color** ("our brand is orange, #ff5a1f", "use #0f766e"): run the command that ships with the package, from the project root:

   ```bash
   npx bland-ui brand "#ff5a1f" --fix --out src/brand.css
   ```

   Use the path of the project's existing `brand.css` (the file imported last, after `bland-ui/styles.css`), or create `src/brand.css` and import it last. `--fix` moves other steps until the brand pairings pass; it never moves the color you were given. Read the output: it lists any pairing still below its minimum. Tell the user about those rather than changing their color.
   - Grays: `--neutrals full` (default, tinted toward the brand), `subtle`, or `none` (pure gray) when the user wants neutral grays.
   - The user's fonts: `--font-body "Söhne"`, `--font-heading "Lora"`, `--font-code "…"` (then load the font files, below).
   - Extra colors: `--extra accent=#7c3aed` (up to three; `--extra accent` alone picks one in harmony with the brand).
   - A chart series in a set color: `--chart 3=#16a34a`.
   - Run it again with all the options whenever one changes: it rewrites the whole file.
   - Only a color name ("orange", "our green")? Ask for the hex, or find it in the project (an existing brand.css, the logo's SVG, a style guide) and say which one you used.
2. **The user pastes CSS from the Brand theme page** (https://blandui.com/docs/#/brand, "Copy CSS"): put it in `brand.css` exactly as given, replacing what was there. Don't reformat it, round values or change a step. Make sure `brand.css` is imported last.

After a hand edit to the colors (one the user asks for), re-check the file: `npx bland-ui brand check src/brand.css`.

- The given color lands unchanged on the step its lightness belongs on. Never change the project's brand color to clear a contrast warning: that is the project's choice to make.
- Keep the override on `:root`. Steps set on a nested element change nothing, because the roles are computed at `:root`. To show another brand in one area only (a preview, an illustration), set that brand's `--brand-*` steps and `data-theme="light"` (or `"dark"`) on the same element.

## Fonts

Every text style reads one of three family tokens:

| Token | Text styles | Bland's font |
| --- | --- | --- |
| `--font-body` | Body | Inter |
| `--font-heading` | Display, Heading, Title | the body font until set |
| `--font-code` | Code | Geist Mono |

Pass them to the brand command (`--font-body`, `--font-heading`, `--font-code`), or set the ones you change on `:root` in `brand.css` by hand, each ending in a generic family:

```css
:root {
  --font-body: "Söhne", system-ui, sans-serif;
  --font-heading: "Lora", Georgia, serif;
}
```

One font for all text: set `--font-body` alone. Load the font files yourself, under the same family name, with the weights Bland's styles use: body 400 and 500, heading 600, code 400, 500 and 600 (`@font-face`, a Fontsource package, or a font host). Skip `bland-ui/fonts.css` only if every font is replaced. Sizes, line heights and letter spacing stay Bland's. Never set `font-family` in project CSS beside a text style.

To change fonts in one area only, set `--font-body` / `--font-heading` on an element that also has `data-theme="light"`, and put `data-theme="dark"` on an element inside it if the area is dark.

## Extra colors

Up to three more colors for the project's own UI (charts, illustrations, a section, a tag), made with the brand command (`--extra name=#hex`) or on the Brand theme page (Extra colors). Bland's components never use them. Each gets 13 steps (`--accent-0` … `--accent-1000`) and six roles that switch in dark mode: `--accent-surface`, `-surface-strong` (the one that carries white text), `-surface-light`, `-text`, `-icon`, `-border`. Use the roles; the raw steps look the same in both modes and are only for something meant to look identical in light and dark.

## Charts

Series use `--chart-1` … `--chart-8` in order (series 1 is the brand), never cycled. Past eight, fold the rest into Other or split the chart. They switch in dark mode and hold 3:1 against `--surface-100`; keep a legend. Meaning (good, bad) uses the danger, success and warning tokens instead. To give a series a specific color, use `--chart N=#hex` with the brand command (or pick it on the Brand theme page) rather than editing `--chart-N` by hand, so it gets a dark value and a contrast check. Bland's components never use chart tokens.
