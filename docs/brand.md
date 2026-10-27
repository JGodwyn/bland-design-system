# Brand override

Bland ships with a blue brand. A project brings its own by overriding the 13 brand steps at `:root`; every brand-colored token follows, in light and dark. Decided 2026-10-26 (Godwin): one package, a brand override file per project.

## How it works

- `tokens.css` emits the brand scale alone in its own `:root` block: `--brand-0`, `--brand-50`, `--brand-100` … `--brand-950`, `--brand-1000` (13 steps, the Figma `Brand/*` primitives).
- Every token whose Figma alias chain ends in a brand step points at it instead of holding a value: `--button-brand-primary-rest: var(--brand-600)`, and in dark `--text-link: var(--brand-300)`. The three brand alpha steps become `color-mix(in srgb, var(--brand-600) 12%, transparent)`, so the brand shadows follow too. 57 tokens in all; `tokens.json` lists the reference under `cssValue` and keeps the resolved color in `light` / `dark`.
- Dark mode points at different steps, as Figma does (solids two steps lighter, tints become deep tones), so one set of 13 covers both themes.
- The 13 neutral steps are emitted the same way (`--neutral-0` … `--neutral-1000`), and the 107 tokens built on them (text, icons, borders, surfaces, the transparent neutrals, neutral shadows, modal backdrops) hold `var(--neutral-N)` or a `color-mix` of `--neutral-1000`. A project's override carries its neutrals beside its brand (below); without them Bland's blue-leaning grays stay.
- The other primitives (red, green, amber, purple, units, type) stay hidden. Components never use `--brand-*` or `--neutral-*`: the lint rejects them and names the Theme tokens built on that step.

## Neutrals lean toward the brand (decided 2026-10-26)

Bland's grays lean toward its blue, so a project's grays lean toward its brand: a desaturated version of it. The research behind the method is in `reports/Brand tinted neutral scales.md`. Godwin's calls: a project picks **Tinted** (full, the default), **Subtle** (half) or **Pure gray**; the hue is the brand's own; a dark or grayish brand gets whatever the method gives (close to gray is fine); the transparent neutrals and the neutral shadows follow the neutrals; client neutrals live in code only (Figma keeps Bland's).

How `generateNeutrals` makes them:

- **Shape:** Bland's own chroma curve, step by step: none at 0 (white) and 1000 (black), the most at 600 (OKLCH 0.033).
- **Hue:** the brand's, taken from its most colorful step.
- **Strength:** the curve times three factors. How colorful the brand is: none below OKLCH chroma 0.02, all of it from 0.12, so gray and near-black brands get gray. The hue: 1 for blues and violets, about 0.45 to 0.7 for reds, oranges, yellows and greens, because equal chroma reads about 1.6x stronger there and Tailwind, Radix and Material all hold warm grays back. The tint: 1, 0.5 or 0. Never more than a fifth of the chroma sRGB holds at that step.
- **Contrast:** each step keeps the WCAG luminance of Bland's step (its lightness is searched to match), so every neutral-on-neutral contrast stays Bland's whatever the brand, within hex rounding.
- **Bland's blue** at full tint gives Figma's neutrals exactly.
- **Shadows and overlays** are `color-mix`es of `--neutral-1000`, which the curve keeps pure black, as in Figma; so they follow the neutrals but stay black in practice. Kept that way on purpose (Godwin 2026-10-26): the brand elevations already carry the brand color.

| Brand | Neutral 600 | Chroma | Hue |
| --- | --- | --- | --- |
| Bland #0062ff | #576275 | 0.033 | 261 |
| #7c3aed violet | #635f74 | 0.033 | 294 |
| #e11d48 red | #6f5d5e | 0.024 | 14 |
| #ff5a1f orange | #6d5f5a | 0.020 | 41 |
| #16a34a green | #5a645c | 0.018 | 151 |
| #ffcc00 yellow | #656158 | 0.015 | 87 |
| #111111, #777777 | #616161 | 0 | |

## Using it in a project

Load a stylesheet after Bland's tokens:

```css
/* brand.css */
:root {
  --brand-0: #ffffff;
  --brand-50: #fff5f2;
  /* … all 13 … */
  --brand-1000: #2d0700;

  --neutral-0: #ffffff;
  /* … all 13 … */
  --neutral-1000: #000000;
}
```

Neutrals are optional in the file: set all 13 or none. Override at `:root`, not on a nested element: the brand-colored tokens are computed where `tokens.css` defines them (`:root` and `[data-theme]`), and they read the brand steps from there. Step 0 is white in Bland's scale; keep it white unless the brand needs otherwise.

## Extra colors (decided 2026-10-27)

A project can add up to three colors beside the brand, for charts, illustrations or any part of its own UI. Godwin's calls: the brand stays on every component; extras are the project's to place; they get light and dark theming; three at most.

- **Bland's components never read them.** They're for the project's own CSS and components: a chart series, an illustration, a promo section, a tag. A project can also recolor a Bland component in one area by pointing that component's tokens at an extra's roles there, for example `.promo { --button-brand-primary-rest: var(--accent-surface-strong); }`, and dark mode follows because the roles switch.
- **Default colors go with the brand** (Godwin 2026-10-27): a new extra starts on the next color in harmony with the brand, turning its hue in OKLCH: the complement (180°) first, then the square's other two (90°, 270°), so brand and extras sit evenly round the wheel. Each is lit halfway between the brand's lightness and its own hue's most vivid one, and never more colorful than the brand. Bland's blue gives gold, magenta and teal. A gray brand uses Bland's blue as the starting hue. The page does this on Add color; the command does it for `--extra name` with no color. Typing a color replaces it. (`harmonyColor` in `scripts/brand/core.ts`.)
- **Steps:** 13, made like the brand's (the color lands unchanged on the step its lightness belongs on), as `--name-0 … --name-1000` on `:root`.
- **The steps don't switch, the roles do**, as with the brand: `--brand-600` is one color in both modes, and the tokens built on it (`--surface-brand` 600 in light, 400 in dark) move. So every extra color gets dark mode through its roles; its raw steps are fixed.
- **Roles** switch between light and dark exactly as the brand's do (they mirror the brand tokens in `tokens.json`, so they never drift):

| Role | Mirrors | Light | Dark | For |
| --- | --- | --- | --- | --- |
| `--name-surface` | `surface-brand` | 600 | 400 | Solid fills, chart marks; no white text on it (it lightens in dark) |
| `--name-surface-strong` | `surface-brand-strong` | 600 | 600 | Solid fills that carry white text |
| `--name-surface-light` | `surface-brand-light` | 50 | 1000 | Quiet tinted fills |
| `--name-text` | `text-brand` | 600 | 400 | Text on the page |
| `--name-icon` | `icon-brand` | 600 | 400 | Icons |
| `--name-border` | `border-brand` | 600 | 400 | Borders and bars |

- **Check:** six pairings per extra, both modes (`EXTRA_PAIRS`): white text on its strong fill, its text on the page and on its light fill (4.5:1), its icon, border and fill against the page (3:1). Fix contrast never moves the entered color's step.
- **Names:** lowercase letters and hyphens, and not a prefix Bland already uses (`surface`, `text`, `brand`, `space` …), so an extra never shadows a Bland token.
- **What theming costs:** the override file grows a light block and two dark blocks (the same selectors as `tokens.css`: `[data-theme="dark"]` and the `prefers-color-scheme` media query), about 20 lines per extra. Roles are `var()`s of the extra's own steps, so a nested `data-theme` section works as it does for Bland. Use the roles in project code and dark mode is handled; reach for raw steps only where a fixed color is meant (an illustration that should look the same in both modes).
- **Not yet:** a chart palette (ordered `--chart-1…8`, brand first, then the extras), which needs a Figma design first; and Figma variables for extras (they live in code, like a project's neutrals).

## The Brand theme page (docs site)

`npm run docs`, then **Brand theme** under Overview (`#/brand`; Figma 6773:21840): the same tool in the browser.

- **Brand color:** tap the big swatch and a color picker opens where you tapped (under the hex from the keyboard): saturation and brightness area, hue slider, and a field that reads and writes HEX, RGB, HSL or OKLCH (pick the format from its menu, kept for your next visit; paste CSS like `rgb(255 90 31)` or `oklch(68% 0.21 38)` in any format). The swatch shows your color exactly, with a copy button. Under it, the 13 steps it makes (your color on its own step) and the contrast result: **Contrast checks out**, or a **Contrast warning** with **Fix contrast** (moves the other steps, never the color you entered) and **Show breakdown** (the misses as a table). Misses Bland's own blue shares, and this brand makes no worse, count as passing on the page: they are Bland's to fix (the command still lists them). The result hides while you drag in the picker and eases back in when you let go. **Reset** and **Apply to site** sit in the section heading: Reset goes back to Bland everywhere, including the site; Apply sets the steps on `<html>` so every docs page shows the brand, kept for the visit in sessionStorage with the color it was made from (it survives a reload).
- **Neutral color:** Tinted, Subtle or Pure gray, the 400 neutral as a big swatch, and the 13 neutral steps.
- **Extra colors:** Add color (up to three), each with a name, the same tap-to-change swatch, its steps, its roles in light and dark, and its own contrast check. They show in the previews and the CSS, and are kept for the visit; Reset clears them.
- **Preview** in light and dark, and **Use in a project** with the CSS to copy.

The page imports `scripts/brand/core.ts`, so it never disagrees with the command.

## The tool: `npm run brand`

```bash
npm run brand -- generate "#ff5a1f"                 # 13 brand + 13 neutral steps from one color, then the check
npm run brand -- generate "#ff5a1f" --neutrals none # pure gray neutrals (or subtle; full is the default)
npm run brand -- generate "#ff5a1f" --extra accent=#7c3aed --extra chart  # up to three extra colors; no color = the next in harmony
npm run brand -- generate "#ff5a1f" --fix --out brand.css
npm run brand -- check brand.css                    # check a project's override (CSS or JSON)
npm run brand -- check brand.css --fix --out fixed.css
```

**Generate** builds a scale in the shape of Bland's own, which was made in OKLCH. **The color lands exactly, unchanged, on the step its lightness belongs on** (`placeStep`: the Bland step closest in OKLCH lightness; decided 2026-10-26, Godwin: you never pick a step). Bland's blue lands on 600, a bright orange on 400, a green on 500, a yellow on 200, a near-black on 1000. Lighter steps spread its lightness up to white, darker ones down to Bland's darkest, chroma follows Bland's curve scaled to the color's, and the hue stays the color's. Generating from Bland's blue rebuilds Bland's scale. `--at <step>` still forces a step on the command line.

**Check** tests the 35 brand pairings Bland draws, in both themes: text at 4.5:1 (button labels on brand fills, links, brand text, selected sidebar rows, sent chat bubbles, calendar days, badge and indicator labels) and icons, borders, fills and the focus ring at 3:1. Each miss names the pairing, its ratio and the step to move (`darken 600`). The pairings are listed in `scripts/brand/core.ts` (`PAIRS`); add one when a new component draws on the brand.

**Warn, never block** (Godwin's default): the check exits 1 when something misses, and a brand may keep a miss on purpose, as Bland keeps its white success labels.

**Suggestions and `--fix`**: the step holding the color you entered never moves (generate pins it; so does the page's Fix contrast). A miss only that step could fix stays listed, as yours to keep or to answer with another color. For each other step behind a miss, the nearest color with the same hue and chroma, lightness moved until its pairings pass. A miss between a tint and a solid step is the solid step's to fix, so the light end isn't washed out. The rest of the scale is then kept in order (each step darker than the one before), and the rounds repeat until the check passes. Bright brands land on a light step (orange 400, yellow 200), so 600, the primary fill, already comes out deep enough for white labels: a yellow's 600 is a dark gold, which is the honest answer for white text on yellow; a project that wants yellow fills needs dark labels, which Bland doesn't do today.

**Bland's own near-misses** are listed apart when the brand makes them no worse: a link on a surface-200 panel (4.47:1) and the hovered selected calendar day in dark (3.75:1).

## Edge cases

| Brand | What happens | What to do |
| --- | --- | --- |
| Bright (orange, green, cyan) | White labels on 600 miss 4.5:1 | `--fix`, or pick a deeper 600 with the brand team |
| Yellow, lime | Fills, focus ring, toggles miss in light | `--fix` turns 600 to dark gold; or keep the miss knowingly |
| Near-black | Lands on 1000; the lighter steps carry its hue | Check, then keep or adjust |
| Red or close to it | Brand and danger look alike | No contrast issue; a design question for the project |
| Brand step 0 not white | Nothing in Bland uses it today | Keep it white |

## Files

| Path | What |
| --- | --- |
| `scripts/brand.ts` | The command |
| `scripts/brand/core.ts` | Generator, file parsing, pairings, check, suggestions |
| `scripts/brand/brand.test.ts` | Tests (`npm run test:brand`) |
| `scripts/tokens/core.ts` | `brandRef`: which tokens point at which step |
