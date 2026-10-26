# Implementation options for brand-tinted neutrals in a CSS custom-property token system

Scope: how Bland could make its 13-step Neutral scale (82 Theme tokens + 4 alpha neutrals) follow a per-project brand, comparing static generation (A), runtime relative color (B) and a hue/chroma input (C), with 2026 browser support and precedents. Research budget was small (about 16 tool calls), so some precedents are covered from docs pages only and several points are marked as gaps.

## Option A vs B vs C: pros and cons

### Takeaway
Every precedent found ships neutrals as **static values chosen or generated ahead of time** (Radix, Park UI, shadcn, Tailwind, daisyUI, Material's generator); only Open Props exposes a live `--gray-hue` / `--gray-chroma` knob, and it is labelled beta. For Bland, whose selling point is an offline contrast check, Option A (generator emits 13 static `--neutral-*` steps into the override file) fits best; B and C trade that guarantee for zero-build ergonomics.

### Cited Findings
- Open Props' OKLCH gray palette is tinted at runtime with two variables, e.g. `.gray-cool { --gray-hue: 270; --gray-chroma: .02; }` and `.gray-warm { --gray-hue: 50; --gray-chroma: .01; }`; scoping to a class tints only that subtree; without customization it is a neutral set. Its normalize derives 4 surface colors and 2 text colors from the current gray palette — [nerdy.dev, Open Props OKLCH palettes beta](https://nerdy.dev/open-props-oklch-palettes-beta)
- The same post flags limits of this live approach: very low lightness (under ~10%) "looks off", and high chroma at 100% lightness may not give pure white; it requires a browser with `oklch()` support and offers no fallback — [nerdy.dev](https://nerdy.dev/open-props-oklch-palettes-beta)
- MDN documents exactly Option C as a pattern: one `--hue` custom property driving a palette (`lch(from red l c var(--hue))`) and derived steps like `lch(from var(--base-color) calc(l + 40) c h)` — [MDN, Using relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- MDN: channel keywords resolve to plain numbers, so `calc(l + 20%)` is invalid; alpha can be scaled with `calc(alpha * var(--x))`; converting an origin does **not** clamp channels to the target space — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- MDN warns that `@supports` tests must use a literal color, not `var()`, because "a custom property inside `@supports` always passes" (variables only become invalid at substitution time) — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)

### Inferences
- **Option A (static `--neutral-*` from the generator).** Pros: values are plain hex, so the existing `npm run brand` contrast check can verify every Text/Border-on-Surface pair offline before shipping; identical rendering in every browser (no relative-color or gamut-clipping variance); DevTools shows real colors; dark mode keeps working because Theme tokens already switch which `var(--neutral-N)` they read (mirroring 0↔950 stays a token mapping, not math). It also matches how Bland already handles brand (13 `--brand-*` at `:root`). Cons: the override file grows from 13 to 26 values (plus alpha neutrals); a project that edits `--brand-*` by hand but forgets to regenerate gets mismatched neutrals; the 82 neutral Theme tokens must change from resolved hex to `var(--neutral-N)` in `tokens.css` (same change already done for brand).
- **Option B (`oklch(from var(--brand-600) L calc(c * k) h)` per step).** Pros: one source of truth, a hand-edited brand instantly re-tints grays. Cons: each step's L must be hard-coded per step (the brand's own L is discarded), so it is really "brand hue + scaled chroma", i.e. C in disguise but with chroma tied to the brand's saturation, which makes a neon brand produce noticeably tinted grays and a muted brand near-pure grays (inconsistent strength across clients). Contrast can only be checked by rendering in a browser (Playwright `getComputedStyle`), not by the Node tool reading the override file. Hue of a near-achromatic brand (e.g. a black or gray brand) is unstable/`none`, so grays could pick a random hue. Debugging shows the formula, not the value.
- **`color-mix(in oklch, var(--brand-N) x%, <pure gray step>)` variant of B.** Mixing in oklch interpolates hue and chroma, so a small brand percentage into an achromatic gray gives brand hue at low chroma; but `in oklch` with an achromatic endpoint takes the other color's hue (powerless hue), and lightness also shifts by x%, so each step's L drifts slightly. `color-mix(in oklab, ...)` avoids hue interpolation quirks. Same offline-check problem as B.
- **Option C (`--brand-hue` + `--neutral-chroma` feeding `oklch(L C var(--brand-hue))`).** Pros: predictable strength independent of brand saturation (chroma is an explicit dial: none / subtle / strong), easy opt-out (`--neutral-chroma: 0`), tiny override. Cons: still runtime-only for contrast (although at chroma ≤ 0.03 contrast is driven almost entirely by L, so checking L once in Node is a close proxy); needs a per-step chroma curve (Bland's current hand-tinted scale varies chroma by step, up to ~0.033), meaning 13 multipliers emitted in CSS; out-of-gamut is negligible at such low chroma but browsers clip rather than map. The hue must be computed by the generator anyway (from the brand in OKLCH), so C still needs a tool step unless the project types a hue by hand.
- **Hybrid worth considering:** emit static `--neutral-*` (A) as the shipped contract, and let the generator offer C's knobs (`tint: none | subtle | strong`, or a numeric chroma) as *inputs to the tool*, not as runtime CSS. This keeps the offline contrast guarantee and the ergonomics of a strength dial.

### Gaps
- No precedent found that ships brand-derived neutrals via relative color syntax in production CSS (only Open Props' beta hue/chroma variables). Could not confirm whether any major system has moved to runtime derivation in 2026.
- Did not measure contrast delta between Bland's current neutrals and a chroma-scaled version; that needs a local experiment with the generator.

## Browser support (2026) for relative color, color-mix, calc in channels, gamut handling

### Takeaway
Relative color syntax is fully supported in Chrome/Edge 131+, Safari 18.0+, Firefox 133+ (about 88% full + 5% partial global usage); `color-mix()` is at ~95%. The weak spot is gamut handling: browsers **clip** out-of-gamut `oklch()` rather than applying CSS Color 4 gamut mapping, and as of mid-2025 the CSSWG had not settled it. At neutral-level chroma (≤ 0.04) clipping is mostly a non-issue except near L = 0 or 1.

### Cited Findings
- Relative colors (caniuse): Chrome full from 131, partial 119–130, 118 behind a flag; Edge same; Safari full from 18.0, partial 16.4–17.6; Firefox full from 133, partial 128–132; iOS Safari full from 18.0, partial 16.4–17.7. Global usage 93.45% (88.09% full + 5.36% partial). Known-issue links: Chromium issue 1274133, Firefox bug 1701488 — [caniuse: CSS Relative colors](https://caniuse.com/css-relative-colors)
- Firefox 128 enabled relative color syntax by default (bug 1900251); released July 9, 2024 — [MDN, Firefox 128 release notes](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/128)
- An older compatibility table states Firefox's relative color did not support `currentcolor` or system color keywords as origins (bug 1893966); a Feb 2025 CSSWG list post describes the opposite gap (Firefox accepting only currentcolor in a case where Chrome accepts all absolute colors). The two conflict — [w3cub caniuse mirror](https://docs.w3cub.com/browser_support_tables/css-relative-colors); [public-css-archive Feb 2025](https://lists.w3.org/Archives/Public/public-css-archive/2025Feb/0164.html)
- Safari 16.4-era implementations followed an older spec where origin channels resolved with units, so hue math needed `deg` (e.g. `calc(h + 180deg)`); MDN recommends an `@supports`-gated fallback for those — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- `calc()` on channels is part of the syntax; channels are unitless numbers; out-of-gamut origins are not clamped during relative computation (e.g. a P3 red yields r ≈ 273.88), while absolute `rgb()` arguments are clamped — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- `color-mix()`: Chrome 111+, Safari 16.2+, Firefox 113+; 94.79% global usage — [caniuse: color-mix](https://caniuse.com/mdn-css_types_color_color-mix)
- Gamut mapping: CSSWG threads (2023–2025) report browsers ship naive clipping for out-of-gamut `oklch()`, producing "massive hue shifts and even bigger lightness shifts"; a June 2025 post says the WG had not settled the algorithm and authors resort to hard-coding `display-p3` or preprocessors for proper gamut mapping — [csswg #9449 thread, Oct 2023](https://lists.w3.org/Archives/Public/public-css-archive/2023Oct/0389.html); [public-css-archive Apr 2025](https://lists.w3.org/Archives/Public/public-css-archive/2025Apr/0307.html); [public-css-archive Jun 2025](https://lists.w3.org/Archives/Public/public-css-archive/2025Jun/0124.html)
- Libraries that implement CSS Color 4 gamut mapping do it as an OKLCH chroma binary search toward the destination gamut (what Bland's generator could do offline) — [Elixir Color.Gamut docs](https://hexdocs.pm/color/Color.Gamut.html); [Saturon gamut mapping](https://saturon.js.org/docs/architecture/gamut-mapping)

### Inferences
- Release dates not directly verified in this session (from general knowledge, check before citing): Chrome 119 Oct 2023, Chrome 131 Nov 2024, Safari 16.4 Mar 2023, Safari 18.0 Sep 2024, Firefox 133 Nov 2024. Firefox 128 (July 9, 2024) is verified above.
- The "partial" ranges mostly concern `currentcolor`/system-color origins and the old unit-bearing channel behaviour; Bland's use (`var()` holding a hex origin, numeric math) works in the partial range too, except the Safari 16.4–17.x hue-unit quirk if hue math is done.
- If Option B/C ships, `tokens.css` should include a static hex fallback declared first (or the Option A values) so older browsers get the default neutrals rather than an invalid-at-computed-time `transparent`/initial value. Note an invalid relative color inside a custom property makes the consuming property fall back to `unset`, not to an earlier declaration of that property — so the fallback must be in the consuming declaration or via `@supports (color: oklch(from red l c h))`.
- Because browsers clip rather than map, Option A has a real advantage: the generator can gamut-map in Node and emit in-gamut hex.

### Gaps
- Could not read the content of Chromium 1274133 / Firefox 1701488 to list specific open bugs.
- No 2026 source found confirming whether any browser has since shipped CSS Color 4 gamut mapping for `oklch()`; newest evidence is mid-2025.

## How existing systems drive neutral selection

### Takeaway
The dominant pattern is **pick a pre-made tinted gray family that matches the accent's hue region**, decided at build/config time (Radix auto-pairing, Park UI, Tailwind's gray families, shadcn's base color at `init`). Material 3 is the one true *derivation*: neutrals = source hue at fixed low chroma (6 and 8 in HCT), computed in JS, not CSS.

### Cited Findings
- **Radix Themes:** "Your accent color will be automatically paired with a gray shade that complements it"; override with `<Theme grayColor="mauve">`; six grays: Gray, Mauve, Slate, Sage, Olive, Sand. Each step has an alpha twin (`--red-a1`…`a12`) "designed to appear visually the same when placed over the page background"; a custom palette tool generates CSS from a couple of reference colors, pasted for light and again for dark — [Radix Themes, Color](https://www.radix-ui.com/themes/docs/theme/color)
- **Radix auto mapping** (`getMatchingGrayColor` in Radix Themes source): mauve for tomato, red, ruby, crimson, pink, plum, purple, violet; slate for iris, indigo, blue, sky, cyan; sage for teal, jade, mint, green; olive for grass, lime; sand for yellow, amber, orange, brown, gold, bronze; gray for gray — [radix-ui/themes source](https://raw.githubusercontent.com/radix-ui/themes/main/packages/radix-ui-themes/src/helpers/get-matching-gray-color.ts)
- **Radix custom palette generator** takes three inputs: Accent, Gray, Background, and outputs 12 accent + 12 gray steps with Light/Dark toggles (the page does not explain whether gray is pulled toward the accent) — [Radix Colors custom](https://www.radix-ui.com/colors/custom)
- **Park UI** (Panda/Tailwind, built on Radix Colors): grays neutral, mauve, olive, sage, sand, slate, default neutral for both gray and accent; set via `accentColor`, `grayColor` in `createPreset`; recommends a gray "tinted toward a hue near your accent" for a "harmonious, vibrant aura", neutral for minimalism — [Park UI colors](https://park-ui.com/docs/theme/colors); [Park UI customize](https://park-ui.com/solid/docs/theme/customize)
- **Tailwind v4:** colors are `--color-*` CSS variables in `@theme`, all in oklch; gray families with 500-step chroma: slate 0.046 (h 257), gray 0.027 (h 264), zinc 0.016 (h 286), neutral 0, stone 0.013 (h 58), plus newer mauve 0.034 (h 322.5), olive 0.031 (h 107), mist 0.021 (h 213.5), taupe 0.021 (h 43); override by redefining `--color-gray-*`, alias via `@theme inline`, `--alpha()` for opacity — [Tailwind, Colors](https://tailwindcss.com/docs/colors)
- **shadcn/ui:** base colors Neutral, Stone, Zinc, Mauve, Olive, Mist, Taupe; tokens are static oklch literals in `:root` and `.dark` (e.g. `--background: oklch(1 0 0)`); "`tailwind.baseColor` controls the default token values generated for your project when you run `init` or use a preset" (build/init time); no relative-color derivation — [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- **daisyUI 5:** themes are CSS variables (`--color-base-100/200/300`, `--color-neutral`, …) in oklch, switched at runtime by `[data-theme]`; the example base colors share hue 240 with primary at low chroma (`oklch(98% 0.02 240)`), but tinting is a per-theme authoring choice, not computed; theme generator lets you edit and copy CSS — [daisyUI themes](https://daisyui.com/docs/themes/)
- **Material 3 (Tonal Spot, the default Material You scheme on Android 12/13):** `neutralPalette = TonalPalette.of(sourceHue, 6.0)`, `neutralVariantPalette = TonalPalette.of(sourceHue, 8.0)` — source hue, fixed chroma, in HCT — [material-color-utilities scheme_tonal_spot.dart](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/dart/lib/scheme/scheme_tonal_spot.dart)
- Material describes neutral as "usually not colorful at all, intended for background & surface colors" and neutral variant as "slightly more colorful than Neutral"; Tonal Spot's primary chroma was later changed 40 → 36, showing values are revised between spec versions — [Flutter DynamicScheme.neutralPalette](https://api.flutter.dev/flutter/package-material_color_utilities_dynamiccolor_dynamic_scheme/DynamicScheme/neutralPalette.html); [neutralVariantPalette](https://api.flutter.dev/flutter/package-material_color_utilities_dynamiccolor_dynamic_scheme/DynamicScheme/neutralVariantPalette.html); [material_color_utilities changelog](https://pub-web.flutter-io.cn/packages/material_color_utilities/changelog)
- Material's variants include NEUTRAL and MONOCHROME schemes alongside TONAL_SPOT, VIBRANT, FIDELITY, CONTENT (a whole-scheme switch that also changes neutral colorfulness) — [Flutter Variant enum](https://api.flutter.dev/flutter/package-material_color_utilities_dynamiccolor_variant/Variant.html); [color_spec_2021.ts](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/dynamiccolor/color_spec_2021.ts)

### Inferences
- Material's model (brand hue + fixed low chroma, computed in a tool) is the closest analogue to Bland's need and corresponds to Option C run **inside the generator** (i.e. Option A output). Its fixed chroma means tint strength does not depend on how saturated the brand is.
- Radix/Park/Tailwind/shadcn's "pick a family" approach is coarse (5-6 hue buckets) but gives hand-tuned, pre-verified contrast; Bland's generator can do the continuous version and still verify.
- Tailwind's grays show a realistic chroma range for "tinted neutral" at mid-scale: 0.013–0.046; Bland's current ~0.033 peak sits between Tailwind gray and slate.

### Gaps
- Chakra v3 and Panda CSS core presets not researched (budget); Chakra v3 is believed to ship static gray palettes but this is unverified.
- material-web token implementation (how `--md-sys-color-*` is generated for web) not fetched; believed to be generated in JS via material-color-utilities and set as CSS variables, unverified.
- Radix's generator algorithm (whether gray is pulled toward the accent) is not documented on its page.

## Is a "tint strength" control common?

### Takeaway
An explicit strength dial is uncommon. Most systems offer a discrete *choice of gray* (pure neutral vs tinted families) and always include a pure-gray option; Open Props is the only one found exposing chroma directly, and Material exposes it indirectly through scheme variants.

### Cited Findings
- Open Props: `--gray-chroma` is a direct numeric dial (examples .01, .02, .05) — [nerdy.dev](https://nerdy.dev/open-props-oklch-palettes-beta)
- Park UI frames it as a choice between neutral (minimalist, works with any accent) and an accent-near tinted gray (richer) — [Park UI colors](https://park-ui.com/docs/theme/colors)
- Radix: auto pairing plus explicit `grayColor` override, including plain Gray — [Radix Themes, Color](https://www.radix-ui.com/themes/docs/theme/color)
- shadcn and Tailwind include a chroma-0 `neutral` family alongside tinted ones — [shadcn Theming](https://ui.shadcn.com/docs/theming); [Tailwind Colors](https://tailwindcss.com/docs/colors)
- Material: scheme variants (NEUTRAL, MONOCHROME, TONAL_SPOT, VIBRANT …) act as coarse colorfulness presets — [Flutter Variant enum](https://api.flutter.dev/flutter/package-material_color_utilities_dynamiccolor_variant/Variant.html)

### Inferences
- For Bland a three-value generator option (`none` = chroma 0, `subtle` ≈ current Bland strength, `strong`) mirrors the industry's discrete choice while staying continuous under the hood; `none` doubles as the pure-gray opt-out.

### Gaps
- No usage data on how often teams choose pure neutral vs tinted.

## Alpha neutrals (overlays, shadows) when neutrals are tinted

### Takeaway
Radix ships a dedicated alpha twin for every step (gray included) that is computed so it composites to the solid step over the page background; Tailwind uses an `--alpha()` helper on the solid variable. For Bland, the simplest consistent approach is to derive alpha neutrals from the tinted solids with `color-mix(in srgb, var(--neutral-N) X%, transparent)`, the same pattern already used for brand shadows.

### Cited Findings
- Radix: every numbered step has an alpha variant designed to look the same over the page background; the brand override example remaps both `--indigo-9` and `--indigo-a9` — [Radix Themes, Color](https://www.radix-ui.com/themes/docs/theme/color)
- Tailwind v4: `--alpha(var(--color-gray-950) / 10%)` adjusts opacity on variable colors — [Tailwind Colors](https://tailwindcss.com/docs/colors)
- `color-mix()` is supported in Chrome 111+, Safari 16.2+, Firefox 113+ — [caniuse](https://caniuse.com/mdn-css_types_color_color-mix)
- Relative color can scale alpha: `rgb(from teal r g b / calc(alpha * var(--x)))` — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)

### Inferences
- Bland's 4 alpha neutrals (a6, a10, a24, a40) are low-opacity overlays/shadows; at those opacities the tint is barely visible, so tinting them is mostly about consistency (avoiding a blue cast under a red brand). Sourcing them from the darkest tinted neutral via `color-mix` costs nothing and keeps Modal backdrops and elevation in family.
- Radix-style "true" alpha scales (solved per background) are only worth it if Bland ever needs alpha steps that must match solid steps exactly; Bland's current alphas are simple opacities of one source, so `color-mix` matches today's semantics.
- Shadow colors could deliberately stay pure neutral if Godwin prefers; this is a design call, not a technical constraint.

### Gaps
- No source found comparing perceived quality of tinted vs neutral shadows.

## Pitfalls and testing strategies

### Takeaway
The main risks are contrast drift in text/border tokens, semantic colors accidentally inheriting the tint, unstable hue for near-gray brands, browser clipping, and losing the offline verification path. Static generation plus the existing contrast check and Playwright screenshots covers most of them.

### Cited Findings
- Open Props notes oklch grays degrade at very low lightness and may not reach pure white at high chroma — [nerdy.dev](https://nerdy.dev/open-props-oklch-palettes-beta)
- Browser clipping of out-of-gamut `oklch()` shifts hue and lightness — [public-css-archive Oct 2023](https://lists.w3.org/Archives/Public/public-css-archive/2023Oct/0389.html)
- `@supports` with `var()` always passes, so feature detection must use a literal color — [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- Every major system keeps a pure-gray option (Radix Gray, Tailwind/shadcn neutral, Park UI neutral default) — [Radix](https://www.radix-ui.com/themes/docs/theme/color); [Tailwind](https://tailwindcss.com/docs/colors); [Park UI](https://park-ui.com/docs/theme/colors)
- Material keeps neutrals at chroma 6/8 (HCT) regardless of source, bounding tint strength — [scheme_tonal_spot.dart](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/dart/lib/scheme/scheme_tonal_spot.dart)

### Inferences
- **Contrast drift:** keep each step's OKLCH L fixed (only hue and chroma change); at chroma ≤ 0.04 WCAG luminance moves very little, but the generator should still re-check every Text/Icon/Border-on-Surface pair in both modes and fail loudly.
- **Near-achromatic brands** (black, gray, very dark navy): hue is undefined or noisy; the generator should fall back to chroma 0 below a brand-chroma threshold. Option B would get this wrong at runtime.
- **Yellow/green brands:** a tinted neutral at hue ~100 reads olive/dirty; Radix/Tailwind route these to "olive"/"sand" families with lower chroma. The generator might cap chroma by hue region.
- **Semantic colors:** keep `Red/Green/Amber` and their Theme tokens on `_Functional Colors`, untouched by the neutral change; only tokens that reference `Neutral/*` should switch to `var(--neutral-N)`. Check tokens that mix families (e.g. disabled tokens, `Toggle/knob-rest` which must stay white, `Icon/icon-on-color`).
- **Endpoints:** decide whether `neutral-0` (white) and `neutral-1000` stay pure; Bland's knob-white decision suggests at least white surfaces stay pure or near-pure.
- **Testing:** (1) generator unit tests over a set of brand hues (red, orange, yellow, green, cyan, blue, violet, magenta, gray, black) asserting contrast minimums and gamut; (2) a Playwright story set that renders the docs site with 2–3 override files and screenshots both themes; (3) the existing drift check should treat default `--neutral-*` values as generated output equal to Figma's Neutral primitives, so the default theme is byte-identical to today.
- **Figma parity:** Figma's Neutral primitives are hand-tinted; if code generates neutrals from the brand, the default brand's generated neutrals will not equal Figma's unless the default override file simply carries Figma's values. Recommend: defaults = Figma values; generated = only for client overrides.

### Gaps
- No published contrast-drift measurements for tinted neutral schemes were found.
