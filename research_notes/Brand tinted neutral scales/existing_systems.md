# How existing design systems and palette tools derive brand-tinted neutral scales

Method note: wherever a source publishes only hex/sRGB values, I converted them to OKLCH with culori (L / C / H, H shown as "-" when C < 0.0005). Those conversions are my computation from the cited package or file, not numbers the source states. sRGB 8-bit rounding adds about ±0.002 of chroma noise at these very low chroma levels, so treat the third decimal as approximate. Versions read on 2026-10-26: `@radix-ui/colors` (latest on npm), `material-color-utilities` main branch (TS) + npm 0.4.0, tailwindcss main `theme.css`, `@primer/primitives` 11.10.0, `@carbon/colors` 11.61.0, `@shopify/polaris-tokens` 9.4.2.

For scale: Bland's current hand-tinted neutrals peak at OKLCH C ≈ 0.031–0.033 (hue 261, L 0.49–0.67). In Material's HCT units that is about **C 16** (I converted oklch(0.58 0.033 261) to HCT C 16.6, T 51; oklch(0.97 0.006 261) to HCT C 5.2). By the standards below, that is at the "colored gray" end, about where Tailwind slate and GitHub Primer sit, and far above Material's neutral palettes (HCT C 2–10).

## Radix Colors custom palette generator (radix-ui.com/colors/custom)

### Takeaway
Radix does **not** derive the gray from the accent. The gray is its own input color, `#8B8D98` by default. The generator snaps that input to the nearest hand-made Radix gray scales (gray, mauve, slate, sage, olive, sand), mixes the two closest, then rescales chroma by the ratio of the input's chroma to the matched step's chroma (capped at 1.5× the input's chroma) and sets **every step's hue to the input's hue**. The hand-made Radix grays have a chroma curve that peaks around steps 8–9 (OKLCH C ≈ 0.010–0.019), and their hues are **not** the accent's hue.

### Cited Findings
- `generateRadixColors({ appearance, accent, gray, background })` takes a separate `gray` input; the gray scale comes from `getScaleFromColor(grayBaseColor, grayScales, backgroundColor)`, which uses only the six gray scales as references — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- The default palette is `lightAccent: "#3D63DD"`, `lightGray: "#8B8D98"`, `lightBg: "#FFFFFF"`, `darkGray: "#8B8D98"`, `darkBg: "#111111"` — [palette-cookie.ts](https://github.com/radix-ui/website/blob/main/app/colors/custom/palette-cookie.ts)
- Algorithm in `getScaleFromColor`: sort every reference step by `deltaEOK` to the source; keep the closest step per scale; mix the closest two scales step by step (`Color.mix(scaleA[i], scaleB[i], ratio)`, ratio = `max(0, tanC1/tanC2) * 0.5`, from a triangle construction on the distances); pick the mixed step closest to the source; compute `ratioC = source.C / baseColor.C`; then for every step `C = min(source.C * 1.5, step.C * ratioC)` and `H = source.H`; finally the lightness is re-eased so the scale starts from the chosen background (`transposeProgressionStart`, with separate light and dark easing) — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- So the gray's chroma curve **shape** comes from the hand-made reference grays; only its **amplitude** follows the input, and its hue is constant. If the closest match is a gray, the second closest is skipped while it is also a gray, so a tinted input can borrow shape from a chromatic scale — same file
- Pure white or black accents are rebuilt from the gray scale ("Make sure we use the tint from the gray scale for when base is pure white or black") — same file
- Radix's documented pairings: mauve with tomato/red/ruby/crimson/pink/plum/purple/violet; slate with iris/indigo/blue/sky/cyan; sage with mint/teal/jade/green; olive with grass/lime; sand with yellow/amber/orange/brown — [color-gray-pairs.tsx](https://github.com/radix-ui/website/blob/main/components/color-gray-pairs.tsx)
- My OKLCH conversion of `@radix-ui/colors` (light, steps 1→12; L/C/H) — [@radix-ui/colors](https://www.npmjs.com/package/@radix-ui/colors):
  - slate: 0.991/0.0013/286 … step 8 0.794/0.0156/278, step 9 0.645/0.0165/278, step 11 0.502/0.0136/264, step 12 0.241/0.0097/248
  - mauve: peak step 9 0.646/0.0193/293; step 1 0.0017; step 12 0.0134
  - sage: peak around 0.010 (steps 9–10), step 12 0.0117, hue 157–174
  - olive: peak 0.0119 (step 10), hue 129–146
  - sand: peak 0.0102 (step 9), hue 68–107
  - gray: chroma 0 throughout
  - Dark scales peak at steps 9–10 too (slateDark 0.0155, mauveDark 0.0171, sageDark 0.0175, oliveDark 0.0181)
- Hue offsets of the pairs (OKLCH hue of the accent's step 9 vs its gray): blue9 h 252 vs slate ≈ 278–286 (about +30°); indigo9 267 vs slate (≈ +15°); green9 158 vs sage ≈ 165–174; amber9 84 vs sand ≈ 90–107; tomato9 33 vs mauve ≈ 293–326 (a big cool shift: red accents get a purple-gray, not a red-gray) — my conversion of [@radix-ui/colors](https://www.npmjs.com/package/@radix-ui/colors)

### Inferences
- Radix's hand-made grays put peak chroma at about 0.010 (sage, olive, sand) to 0.019 (mauve). That is roughly half of Bland's 0.031–0.033.
- Radix chose gray hues by eye, not by copying the accent's hue. Warm and red accents get grays rotated toward purple or toward yellow-brown, which avoids "dirty" red or green grays.
- Lightness comes from a fixed progression, and only chroma amplitude and hue follow the input. That shape-plus-amplitude split is directly reusable for Bland.

### Gaps
- No Radix doc or comment explains how the reference gray hues were chosen. It looks like hand tuning.
- The custom page lets users pick the gray input by hand. Nothing in the code suggests a gray from the accent.

## Material Design 3 / Material Color Utilities (neutral and neutral-variant palettes)

### Takeaway
Material builds neutrals as a **constant HCT chroma at the source hue across every tone**. HCT tone is CIELAB L*, and HCT chroma is CAM16 chroma, so a constant HCT chroma becomes a roughly constant perceived colorfulness. The chroma is a small fixed number per scheme variant (2025 phone spec: Neutral 1.4, Tonal Spot 5, Expressive 18 light / 14 dark, Vibrant 28; neutral-variant is ×1.7 to ×2.3). It is not proportional to the source's chroma, except in Content/Fidelity, which use source chroma ÷ 8. Hue is the source hue, except Expressive and Vibrant, which rotate it through piecewise tables. There is special handling for yellow hues.

### Cited Findings
- Legacy `CorePalette` (deprecated): `n1 = fromHueAndChroma(hue, 4)`, `n2 = fromHueAndChroma(hue, 8)`, primary `max(48, chroma)`, secondary 16, tertiary hue + 60 at 24. The "content" mode uses `n1 = min(chroma/12, 4)` and `n2 = min(chroma/6, 8)` — [core_palette.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/palettes/core_palette.ts)
- 2021 spec `getNeutralPalette` / `getNeutralVariantPalette` (HCT chroma, at the source hue unless stated): Content and Fidelity `chroma/8` / `chroma/8 + 4`; Fruit Salad 10 / 16; Monochrome 0 / 0; Neutral 2 / 2; Rainbow 0 / 0; **Tonal Spot (the default) 6 / 8**; Expressive hue + 15 at 8 / 12; Vibrant 10 / 12 — [dynamic_scheme.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/dynamic_scheme.ts)
- 2025 spec overrides: Neutral `platform === 'phone' ? 1.4 : 6`, neutral-variant ×2.2; **Tonal Spot `phone ? 5 : 10`**, neutral-variant ×1.7; Expressive neutral chroma on phone `isDark ? (isYellow ? 6 : 14) : 18` (12 elsewhere), neutral-variant ×1.6 when the neutral hue is yellow, else ×2.3; Vibrant neutral chroma 28 on phone (20 elsewhere), neutral-variant ×1.29; Content on watch `clamp(6, 20, chroma * 0.333)` — same file
- 2025 hue rotation of neutrals: Expressive (phone) breakpoints `[0, 71, 124, 253, 278, 300, 360]`, rotations `[10, 0, 10, 0, 10, 0]`; Vibrant breakpoints `[0, 38, 105, 140, 333, 360]`, rotations `[-14, 10, -14, 10, -14]` — same file
- `Hct.isYellow(hue)` is `hue >= 105 && hue < 125` (HCT hue). The 2025 spec uses it to pick different surface tones and chroma multipliers for yellow neutrals (for example `Hct.isYellow(s.neutralPalette.hue) ? 2.7 : 1.75`) — [hct.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/hct/hct.ts), [color_spec_2025.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/color_spec_2025.ts)
- Tone mapping: surfaces and backgrounds are read off the neutral palette at fixed tones (2021: surface T98 light / T6 dark, with surface-container steps between). The 2025 spec computes several of them per variant and per platform — [color_spec_2021.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/color_spec_2021.ts), [color_spec_2025.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/color_spec_2025.ts)
- HCT chroma converted to OKLCH chroma (my computation with `@material/material-color-utilities` 0.4.0 + culori, tones 95…10):
  - Blue source `#3D63DD` (HCT h 275): C4 → OKLCH ≈ 0.006–0.008; C6 → 0.010–0.012; C8 → 0.013–0.016; C10 → 0.018–0.020. The OKLCH hue of the neutral drifts to about 278–298 (the source is OKLCH h 267).
  - Yellow `#F5C400`: C4 → 0.011–0.014; C8 → 0.021–0.027; C10 → 0.026–0.034.
  - Red `#E5484D`: C8 → 0.020–0.026.
  - Green `#2E9E4F`: C8 → 0.015–0.018.
  - The same HCT chroma therefore gives about **1.6× more OKLCH chroma for yellow and red than for blue**.
  - At T99 everything rounds to about 0.006 (sRGB quantization).
  - Constant HCT chroma comes out as a **nearly flat** OKLCH chroma curve across tones, slightly lower at the dark end for warm hues.

### Inferences
- Material's default Tonal Spot neutral (HCT 5–6) is about OKLCH 0.010 for a blue brand: roughly a third of Bland's peak. Bland's peak (HCT ≈ 16) equals Material's *secondary accent* chroma (16), so by Material's taxonomy Bland's grays are "colored," not "neutral."
- Holding chroma constant in a CAM16/HCT-like space works better across hues than holding OKLCH chroma constant: OKLCH under-tints blue relative to yellow/red at equal numbers. Equivalently, an OKLCH tool may want a hue-dependent multiplier: lower for yellow/orange/red, higher for blue.
- Material makes no chroma exception for highly saturated sources (the chroma is fixed), so a very saturated brand and a muted brand of the same hue get the same neutrals. Only the Content and Fidelity variants scale with source chroma (÷8, with a ×1/12 cap of 4 in the legacy content palette).

### Gaps
- I did not read the M3 web docs' prose on why 4/8 changed to 6/8 and then 5/10. The source code numbers above are authoritative for current behaviour.

## Tailwind CSS (v4 OKLCH palettes)

### Takeaway
Tailwind's grays are hand-tuned OKLCH scales with **curved chroma**: near 0 at 50, rising to a peak at about 400–500 (L 0.55–0.71), then roughly flat or gently falling into 950. Hue is almost constant per scale. Peaks range from 0.013 (stone) to 0.046 (slate). v4.2 (Feb 2026) added four more tinted neutrals (mauve, olive, mist, taupe) with peaks of 0.021–0.034.

### Cited Findings
- Values from `theme.css` (L% C H) — [tailwindcss theme.css](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css):
  - **slate**: 50 98.4/0.003/248, 100 0.007, 200 0.013, 300 0.022, 400 70.4/0.040, **500 55.4/0.046/257**, 600 0.043, 700 0.044, 800 0.041, 900 20.8/0.042/266, 950 12.9/0.042/265. Chroma stays high through the darks.
  - **gray**: 50 0.002, 100 0.003, 200 0.006, 300 0.010, 400 0.022, 500 0.027, 600 0.030, 700 0.034, 800 0.033, 900 0.034, 950 0.028; hue 248–265.
  - **zinc**: 50 0, 100 0.001, 200 0.004, 300 0.006, 400 0.015, 500 0.016, **600 0.017**, 700 0.013, 800 0.006, 900 0.006, 950 0.005; hue 286. This one falls in the darks.
  - **neutral**: chroma 0 throughout.
  - **stone**: 0.001 → 500 0.013 → 950 0.004; hue wanders 34–106.
  - **mauve** (hue 320–326): peak 500 54.2/0.034, 950 0.008.
  - **olive** (hue 106.5–107.4): peak 500 58/0.031, 950 0.006.
  - **mist** (hue 197–229): peak 500 56/0.021, 950 0.004.
  - **taupe** (hue 17–68): peak 500 54.7/0.021, 950 0.004.
- For comparison, Tailwind blue-500 is 62.3%/0.214/259.8, so slate's peak 0.046 is about 21% of blue-500's chroma at nearly the same hue. Indigo-500 is 58.5%/0.233/277 — same file
- mauve, olive, mist and taupe shipped in v4.2 (tagged 2026-02-18) — [Laravel News](https://laravel-news.com/tailwindcss-4-2-0); [InfoQ](https://infoq.com/news/2026/04/tailwind-css-4-2-webpack). Tailwind says they came from its "Oatmeal" marketing kit and are meant as substitutes for the existing grays — [Tailwind v4.3 blog](https://tailwindcss.com/blog/tailwindcss-v4-3)
- Tailwind's docs suggest adding the brand as its own scale and keeping a default gray family for neutrals; Tailwind has no generator — [Tailwind colors docs](https://tailwindcss.com/docs/customizing-colors)

### Inferences
- The newer v4.2 neutrals all follow one shape: about 0.002–0.005 at 50/100, peak at 500 (L ≈ 0.54–0.58), then falling to 0.004–0.008 at 950. That is the same bell as Bland's current neutrals, with a lower peak (0.021–0.034 vs Bland's 0.031–0.033). olive's 0.031 and mauve's 0.034 peaks are close to Bland's.
- slate and gray keep their chroma into the darks; zinc and the v4.2 palettes drop it. Bland's falling dark end matches the newer, more "neutral" behaviour.
- Tailwind keeps a yellow-green neutral (olive, hue 107) at chroma up to 0.031, so a tinted yellow-green gray is not unusable if chroma stays at or under about 0.03 and lightness is moderate.

### Gaps
- Tailwind publishes no algorithm; the scales are hand-tuned.

## Other systems and generators

### Takeaway
Most large systems ship **fixed** neutral families (pure gray, plus optional cool or warm grays) instead of deriving them from a brand. Tinted examples sit at OKLCH peak chroma of about 0.006–0.023 and are cool blue (hue 240–290). Generators that do derive tinted neutrals use one of two models: a constant chroma at the brand hue (Open Props, Material), or a bell-shaped chroma curve with a small peak (Preline's guidance, Tailwind's shapes).

### Cited Findings
- **Open Props (OKLCH)**: 16 gray steps at fixed lightness (99, 95, 88, 80, 74, 68, 63, 58, 53, 49, 43, 37, 31, 25, 18, 10%), each `oklch(L var(--gray-chroma, none) var(--gray-hue, none))`. That is **one constant chroma and hue for all steps**, set by the user (neutral by default) — [props.gray-oklch.css](https://github.com/argyleink/open-props/blob/main/src/props.gray-oklch.css). The color scales use a bell (`--color-0` 99%/.03 … peak `--color-7` 58%/.21 … `--color-15` 11%/.05) at `var(--color-hue)` — [props.colors-oklch.css](https://github.com/argyleink/open-props/blob/main/src/props.colors-oklch.css). Its author warns the OKLCH grays are "funky" under 10% lightness — [nerdy.dev](https://nerdy.dev/open-props-oklch-palettes-beta)
- **GitHub Primer** (`@primer/primitives` 11.10.0; my OKLCH conversion of `base/color/neutral/0–13`) — [@primer/primitives](https://www.npmjs.com/package/@primer/primitives):
  - Light: 0 white; 1 0.98/0.0034; 4 0.92/0.0094; 7 0.86/0.0159; **8 0.63/0.0228** (peak); 9 0.50/0.0215; 10 0.41/0.0162; 12 0.28/0.0109; 13 0.25/0.0111. Hue 243–255 throughout.
  - Dark: 0 0.10/0.0194; 5 0.31/0.0221; 6 0.33/0.0223; 9 0.68/0.0155; 12 0.97/0.0103.
  - A fixed blue-gray bell peaking at about 0.022, with darks staying more chromatic than lights.
- **IBM Carbon** (`@carbon/colors` 11.61.0; my conversion) — [@carbon/colors](https://www.npmjs.com/package/@carbon/colors). Three fixed families, none derived from the brand:
  - gray: chroma 0
  - coolGray: 10 0.97/0.0058 … **50 0.64/0.0152** … 100 0.20/0.0087, hue 229–265 (bell)
  - warmGray: about 0.003–0.007 flat, hue 17–34
- **Shopify Polaris** (`@shopify/polaris-tokens` 9.4.2): light theme backgrounds are pure grays, for example `color-bg` `rgba(241, 241, 241, 1)` and `color-bg-surface-hover` `rgba(247, 247, 247, 1)`. No tint — [@shopify/polaris-tokens](https://www.npmjs.com/package/@shopify/polaris-tokens)
- **Apple (iOS light system grays)**: `#8E8E93, #AEAEB2, #C7C7CC, #D1D1D6, #E5E5EA, #F2F2F7` convert to a nearly **constant** OKLCH chroma of 0.006–0.007 at hue 286 (a slight blue-violet cast), the same at every lightness — hex values as published in [Apple HIG, Color](https://developer.apple.com/design/human-interface-guidelines/color); conversion mine. (I quoted the hex values from the HIG's system gray table without re-reading the page in this session, so check them before relying on them.)
- **Linear**: since its redesign, light, dark and custom themes come from three inputs (base color, accent color, contrast) computed in LCH. A later tuning aimed for "a more neutral and timeless appearance" by limiting how much blue chroma feeds the calculations. No formulas are published — [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- **Adobe Leonardo**: neutrals are a `BackgroundColor` defined like any color (`colorKeys`, e.g. `['#cacaca']`, plus contrast `ratios`); interpolation colorspace options are LCH, LAB, CAM02, HSL, HSLuv, HSV and RGB. A theme-wide `saturation` 0–100 (default 100) desaturates *all* colors. Nothing derives the neutral from the brand automatically — [Leonardo contrast-colors README](https://github.com/adobe/leonardo/blob/main/packages/contrast-colors/README.md)
- **Preline theme-generator guidance** (published agent skill, npm `preline@4.2.0`): tinted gray chroma is a bell. Per step (L / C): 50 98% / 0.002, 100 95.5% / 0.004, 200 89.7% / 0.008, 300 82.7% / 0.012, 400 73% / 0.018, **500 62.5% / 0.020 (peak)**, 600 52.8% / 0.016, 700 41.4% / 0.012, 800 34.6% / 0.008, 900 30.6% / 0.005, 950 20.1% / 0.003. Hue held to ±5°; "the dark end must have lower chroma than the light end so dark backgrounds stay clean." Allowed chroma by family: warm (hue 60–100) 0.002–0.035, cool (200–260) 0.002–0.030, rose (330–360) 0.002–0.040, green (120–160) 0.002–0.030 — [Preline palette-guidance.md](https://cdn.jsdelivr.net/npm/preline@4.2.0/skills/theme-generator/docs/palette-guidance.md)
- **Evil Martians Harmonizer / Harmony**: OKLCH + APCA palettes with contrast-consistent lightness levels across hues. I found no published gray-from-brand derivation — [Harmonizer](https://evilmartians.com/opensource/harmonizer), [Harmony](https://github.com/evilmartians/harmony), [Exploring the OKLCH ecosystem](https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools)
- **Huetone**: an accessible color-system tool (APCA, CIELAB-related). Its README does not describe tinted neutral generation — [huetone](https://github.com/ardov/huetone)
- **uicolors.app, tints.dev**: each expands one base color into a 50–950 scale; tints.dev adds hue/saturation/lightness tweaks. Neither documents deriving a tinted gray from the brand — [supastarter on uicolors](https://supastarter.dev/dev-tips/2025-08-15-ui-colors), [dev.to](https://dev.to/hosseinyazdi/9-lesser-known-but-powerful-color-tools-youll-regret-missing-1bk6), [tints.dev source](https://github.com/SimeonGriggs/tints.dev)
- **Supa Palette**: Figma plugin with Tint & Shades, Tints, Shades, Tones, Opacities and Gradient palette types, plus HSL/OKLCH/RGB support. I found no documented tinted-neutral derivation — [Supa Palette (Gumroad)](https://supaproducts.gumroad.com/l/supa-palette), [AlternativeTo](https://alternativeto.net/software/supa-palette/about)
- Blog guidance (lower authority): keep tinted neutrals very low chroma, with examples around OKLCH 0.005–0.01 — [Rails Designer](https://railsdesigner.com/color-for-rails-developers/), [Carmen Ansio](https://www.carmenansio.com/articles/oklch-and-the-modern-color-stack/), [Atmos](https://atmos.style/blog/how-to-build-a-color-system-for-ui-design)

### Inferences
- The fixed tinted families converge on cool blue-gray (Carbon coolGray, Primer, Apple, Tailwind slate and gray). Warm families (Carbon warmGray, Tailwind stone and taupe) carry less chroma (0.004–0.021). Few systems ship red or green grays; when they do (Tailwind mauve, olive; Radix sage, olive) the hue is rotated off the pure accent or the chroma is kept at or under about 0.012–0.031.
- No system examined derives neutrals from the brand at Bland's peak (0.031–0.033) other than Tailwind slate, gray and olive/mauve-level palettes, and those are hand-tuned for one hue, not generated.

### Gaps
- Atlassian's neutral hexes: its palette page rendered empty to the fetcher, and the npm package failed to install in time, so I have no numbers. It is believed to be a blue-tinted fixed scale, but that is unverified.
- Vercel Geist: the colors page lists only variable names (`--ds-gray-100` …), not values, and I found no source for its chroma.
- Coolors: not investigated (it is a palette picker, not a scale system).

## Chroma ranges, scaling rules and edge cases (cross-cutting)

### Takeaway
Across sources, **"tinted gray"** peaks at roughly OKLCH 0.005–0.015 (Material Tonal Spot, Apple, Radix sage/olive/sand, Carbon coolGray, zinc). **"Colored gray"** peaks at roughly 0.02–0.046 (Primer, Tailwind gray/slate/mauve/olive, Bland today). The dominant rule is a **fixed or capped** chroma, not one proportional to the brand. Proportional rules exist only with a cap (Material Content: chroma/8; legacy content `min(chroma/12, 4)`; Radix: `min(1.5 × input C, …)`). Yellow is the one hue every algorithmic source special-cases.

### Cited Findings
- Fixed chroma regardless of brand saturation: Material Tonal Spot 5–6, Neutral 1.4–2, Vibrant 10 (2021) / 28 (2025 phone), in HCT — [dynamic_scheme.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/dynamic_scheme.ts)
- Proportional with a cap: legacy content `n1 = min(chroma/12, 4)`, `n2 = min(chroma/6, 8)` — [core_palette.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/palettes/core_palette.ts); 2025 watch Content `clamp(6, 20, chroma * 0.333)` — [dynamic_scheme.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/dynamic_scheme.ts)
- Radix scales the reference curve by `source.C / matched.C`, capped at `1.5 × source.C` per step — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- Yellow handling: Material detects yellow neutrals (`105 ≤ HCT hue < 125`) and in Expressive dark drops neutral chroma from 14 to 6, also adjusting surface tones and the neutral-variant multiplier (1.6 vs 2.3) — [hct.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/hct/hct.ts), [dynamic_scheme.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/dynamic_scheme.ts). Material's Vibrant/Expressive tables rotate neutral hues by ±10–14° in specific hue bands — same file
- Radix pairs warm/red accents with grays rotated in hue (tomato h 33 → mauve h ≈ 300; amber h 84 → sand h 90–107; green h 158 → sage h 165–174) — my conversion of [@radix-ui/colors](https://www.npmjs.com/package/@radix-ui/colors); pairing list in [color-gray-pairs.tsx](https://github.com/radix-ui/website/blob/main/components/color-gray-pairs.tsx)
- Equal HCT chroma 8 → OKLCH ≈ 0.015 for blue but ≈ 0.025 for yellow and red (my computation with `@material/material-color-utilities`)
- User tint-strength controls: Open Props `--gray-chroma` and `--gray-hue` ([props.gray-oklch.css](https://github.com/argyleink/open-props/blob/main/src/props.gray-oklch.css)); Radix's separate gray color input, whose chroma sets the amplitude ([generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)); Material's variant choice (Monochrome 0 → Neutral → Tonal Spot → Vibrant) ([dynamic_scheme.ts](https://github.com/material-foundation/material-color-utilities/blob/main/typescript/dynamiccolor/dynamic_scheme.ts)); Leonardo's global `saturation` ([README](https://github.com/adobe/leonardo/blob/main/packages/contrast-colors/README.md)); Linear's limit on blue chroma feeding its themes ([Linear](https://linear.app/now/how-we-redesigned-the-linear-ui))
- Low-chroma brands: Material clamps nothing at the bottom for Tonal Spot (the neutral chroma is fixed and does not depend on the source). Radix returns the gray scale for a pure white or black accent — sources above

### Inferences
- A defensible design for Bland, synthesised from the above:
  1. Keep Bland's existing **bell shape** (the per-step chroma profile, normalised to peak 1), as Radix, Tailwind v4.2 and Preline do.
  2. Set hue = brand hue, with optional rotations for problem bands (yellow-green, red), as Material 2025 and Radix's pairings do.
  3. Set the peak to `min(cap, k × brandC)` or a fixed value, with a hue-dependent factor so warm hues get less OKLCH chroma than blue for the same visual tint. The Material conversions above suggest roughly 0.6× for yellow and red relative to blue.
  4. Expose a strength control (0 = pure gray), as Open Props, Material variants and Linear do.
- Bland's current blue peak (0.031–0.033) is plausible for blue. Copying the same number onto yellow or red would look about 1.6× more tinted perceptually. A likely cap for warm hues is about 0.02 (Tailwind taupe 0.021, Carbon warmGray ≤ 0.007, Preline warm ≤ 0.035 but green ≤ 0.030).
- Low-chroma brands: a proportional rule would collapse to near pure gray, which is usually desired; a fixed rule would tint grays more than the brand itself. That argues for `min(fixed, k × brandC)`.

### Gaps
- None of the sources publishes perceptual testing for where "tinted" turns into "dirty" for yellow-green hues. The thresholds above come from shipped hand-tuned palettes, not from studies.
- I found no system that changes the neutral chroma curve's *shape* by hue. All change only amplitude and hue.
