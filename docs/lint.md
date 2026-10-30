# Token lint

`npm run lint:css` runs Stylelint over `src/components/**/*.css` with one custom rule, `bland/use-tokens`. It enforces the hard rule in `CLAUDE.md`: every color, size, space, radius, stroke, shadow and type value in component CSS is a `var(--…)` token.

Each error names the token to use and why, read from `tokens/tokens.json`, so an agent can fix every error in one pass:

```
padding: "12px" is hardcoded. Use var(--space-md) (Spacing 12px): "Spacing of 12px for padding and gaps."
background-color: "#0062ff" is a hardcoded color. Theme tokens resolving to it in Light: var(--surface-brand) "…", var(--surface-brand-strong), var(--text-link), var(--text-brand), +13 more Theme tokens.
gap: "10px" is hardcoded and no Spacing token is 10px. Nearest Spacing: var(--space-sm) (8px) or var(--space-md) (12px). If none fits, stop and ask Godwin; do not invent a value or a token.
```

## Files

| Path | What |
| --- | --- |
| `stylelint.config.js` | Loads the plugin, ignores `src/tokens/**` (generated) and `dist/**` |
| `scripts/stylelint/bland-tokens.js` | The rule and its suggestion logic |
| `scripts/stylelint/named-colors.js` | CSS named colors, so `color: white` is caught and resolved |
| `scripts/stylelint/fixtures/` | `good.css` must pass, `bad.css` must fail with the expected tokens |
| `scripts/stylelint/bland-tokens.test.js` | `npm run test:lint` (Node's built-in test runner) |

## What it rejects

- **Lengths** in `px`, `rem`, `em`, `pt`, `ch`, `ex`, `lh` and the other absolute or font-relative units, in any property, including custom properties and `calc()`.
- **Colors**: hex, named colors, and color functions (`rgb()`, `hsl()`, `oklch()`, `color-mix()`, …).
- **Font weights** as numbers or `normal`/`bold`, and any **font family** name. The message names the text style, and `font-family: var(--font-body)`, `var(--font-heading)` or `var(--font-code)` for a part that changes only the family.
- **Redefining `--font-body`, `--font-heading` or `--font-code`** in a component: they are a project's font choice, set in its `brand.css` (`brand.md`, "Fonts").
- **`em` and `ch` outside their one use.** `em` is allowed only on `width`, `height`, `inline-size` and `block-size` (icons sized to the adjacent text); `ch` only on `max-width` and `max-inline-size` (a text measure). Everywhere else they are rejected.
- **Durations and easings.** Raw `ms` or `s` values, easing keywords (`ease`, `ease-out`, `linear`, …), `cubic-bezier()`, `steps()` and `linear()` in `transition*`, `animation*` and custom properties. The message names the Motion token: an exact match by value, else the nearest durations or the easing for the same intent (`ease-out` → `--easing-out`). **`ease-in` is banned outright**, including `cubic-bezier(0.42, 0, 1, 1)`.
- **`transition: all`** (and `transition-property: all`): name the exact properties.
- **Opacity on disabled states.** `opacity` inside a rule whose selector mentions disabled (`:disabled`, `[disabled]`, `[aria-disabled]`, `[data-disabled]`, `.is-disabled`, `--disabled`) fails and lists the disabled color tokens. There is no opacity token.
- **`@media` widths** that are not a breakpoint. Only mobile-first `(min-width: N)` or `(width >= N)` with N one of the `Breakpoints` values from `tokens.json` (640, 768, 1024, 1280, 1536, 1920px) passes. `max-width`, ranges, `em` widths and any other value fail and name the nearest breakpoint. Other media features (`hover`, `pointer`, `prefers-reduced-motion`, …) pass.
- **Mask colors outside the fade pattern.** Inside `mask-image` only `black` and `transparent` pass; any other color, or any color in another property (including the `mask` shorthand), fails.
- **`font` and `box-shadow` shorthands** with any hardcoded part. These get one message for the whole value pointing at the composite (`--type-*`, `--elevation-*`). `font: 400 14px/20px var(--font-body)` counts as hardcoded: the family token doesn't excuse the size and weight.
- **`var()` fallbacks**: `var(--control-sm, 32px)` is rejected, because the fallback is a hardcoded value too.

## What it allows

- `0` (with or without a unit, including `0s`), global keywords (`inherit`, `initial`, `unset`, `revert`, `revert-layer`), `currentColor`, `transparent`, `none`, `auto` and other non-color keywords.
- Units with no token: `%`, viewport units, `fr`, angles. Unitless numbers such as `opacity: 0.5` (outside disabled states), `z-index: 1`, `scale(0.97)` and unitless `line-height: 1`.
- `black` and `transparent` inside `mask-image`, because a mask only reads alpha. Components don't write their own fade: they use the shared `.bland-scroll-fade` class in `src/components/scroll-area/scroll-fade.css`, whose length is `--fade-md` or `--fade-sm`.
- Negative values via `calc(var(--space-md) * -1)`; the message suggests this form.
- `font-family: var(--font-body)`, `var(--font-heading)` and `var(--font-code)` (the family tokens, Godwin 2026-10-29, roles 2026-10-30). Components still set type with `font: var(--type-…)`.
- Generated files: `src/tokens/**` and `dist/**` are in `ignoreFiles`, and the test proves `tokens.css` is ignored. `lint:css` only globs `src/components/**` anyway.

## Dependency audit

`npm audit` reports a high-severity advisory in `braces` ([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), stack exhaustion on deeply nested patterns), pulled in by Stylelint through `micromatch`. No fix exists: every `braces` version up to the latest, 3.0.3, is affected. Stylelint stays at 17 and there is no override. It is dev-only and the lint only expands globs written in this repo.

The audit check is `npm run audit` (`npm audit --omit=dev`), which reports 0 vulnerabilities. Recheck the full `npm audit` when `braces` or `micromatch` ships a fix (recorded 2026-10-17).

## Scope kept as is (Godwin 2026-10-27)

The rule stays at the values above; no new rules for now:

- **`%` and viewport units** are layout (a column's share, a full-height panel), not design values, and no token could name them.
- **Angles** are rotations (a caret turning 180°, a spinner), set by the motion, not by the design scale.
- **Opacity** is needed for fades and enter/exit motion, so it stays allowed outside disabled states, where it is already rejected. Raw times are already rejected too.
- **`z-index`** is rare because overlays (Tooltip, Menu, Modal, Toaster) use the top layer. Add a rule only if `z-index` starts appearing in component CSS.

## Known gaps

- A `transition` with a token duration but no easing (`transition: color var(--duration-xs)`) passes and gets the browser default `ease`. Always write the easing token.
- `@container` queries are not checked.

## How suggestions are chosen

- Durations match `--duration-*` by ms; easings match `--easing-*` by curve.
- The property picks the scale: padding, margin, gap and inset use Spacing; `border-radius` uses Corner Radius; border and outline widths use Stroke; width and height use Sizing, then Spacing; `line-height` and `letter-spacing` use the text styles' parts (`--type-*-line-height`, `--type-*-letter-spacing`); `font-size`, `font-weight` and `font-family` point to the text styles of that size, weight or family, since the raw type scale is not emitted. Unknown properties and custom properties try Spacing, Sizing, Corner Radius and Stroke in that order.
- `rem` and `em` convert to px at a 16px root. Other units cannot convert, so the message asks for a token by scale.
- An exact match is named with its description. Several matches are listed (four at most, the first with its description) with a note to pick the one named for the component or role. No match gives the nearest step below and above, and says to ask Godwin.
- Colors match the Light value first, then the Dark value. Matches are ordered by the group that fits the property (`color` → `Text/`, `background` → `Surface/`, border and outline → `Border/`, `fill` and `stroke` → `Icon/`, shadows → `Shadow/`), then the other semantic groups, then component groups. Inside a component, prefer that component's own group (`--button-*` in Button).
- Only Theme and scale tokens are in `tokens.json`, so a primitive is never suggested.

## Changing it

The rule reads `tokens/tokens.json` at load time, so a token sync updates the suggestions with no change here. If a new case needs allowing, add it to `good.css`. If a new case needs rejecting, add the line to `bad.css` ending in `/* expect: part | part */`; the test checks that every expect line is reported with each part in its message, and that no other line is. Run `npm run test:lint`.
