# Color science of brand-tinted neutral scales

Scope: perceptual and technical factors for deriving a 13-step neutral (gray) scale tinted toward any brand color, for Bland (OKLCH, steps 0-1000, light/dark mirrored). Local computations (marked "computed") were run with the published Oklab matrices from Ottosson's post (https://bottosson.github.io/posts/oklab/) against the sRGB gamut; they are reproducible arithmetic, not literature claims.

## Which color space is best (OKLCH, CAM16/HCT, CIELCh, Okhsl), and known OKLCH problems

### Takeaway
OKLCH is the right working space for a CSS-native token pipeline: its lightness and chroma predictions are close to CAM16-UCS and much better than CIELAB, and blue stays blue when chroma or lightness change (unlike CIELCh). Its weak points are lack of viewing-condition/H-K modelling, slightly dark near-black lightness, and non-uniform chroma ceilings per hue, which matter when a fixed chroma is applied to every hue. HCT (Material) is a credible alternative that encodes tinted neutrals directly as "same hue, chroma 4/8 in CAM16 units"; Okhsl's saturation is useful as a gamut-relative chroma knob.

### Cited Findings
- Oklab design goals: an opponent space that "should predict lightness, chroma and hue well", D65, well-lit viewing conditions, numerically simple, scale-invariant. — [Ottosson, A perceptual color space for image processing](https://bottosson.github.io/posts/oklab/)
- Error table (RMS vs CAM16-generated data): Oklab L 0.20, C 0.81, H 0.49; CIELAB L 1.70, C 1.84, H 0.69; IPT L 4.92, C 2.18, H 0.48; CAM16-UCS H 0.59 (its L/C zeros are because the L/C test data were generated with CAM16, so they are not independent). — [Ottosson](https://bottosson.github.io/posts/oklab/)
- Caveat from the author himself: the L and C datasets come from CAM16, not human experiments, so they "can't be used to say which model best matches human perception." — [Ottosson](https://bottosson.github.io/posts/oklab/)
- CIELAB/CIELUV predict blue hues "badly"; in early Oklab fits blue "folded in on themselves slightly", producing a non-convex sRGB gamut, and a constraint was added to prevent this. — [Ottosson](https://bottosson.github.io/posts/oklab/)
- CAM16 "explicitly compresses chroma to better match experimental data", which makes blending worse; Oklab's chroma and lightness predictions are "close to those of CAM16-UCS". — [Ottosson](https://bottosson.github.io/posts/oklab/)
- CIELCh shows "an unexpected hue shift on chroma and lightness changes in blue colors" between hue 270 and 330 (lch(35% 75 300) turns purple); in OKLCH, oklch(0.48 0.185 274) and oklch(0.48 0.1 274) both stay blue. — [Evil Martians, OKLCH in CSS](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- CIELAB's worst hue shift is in the blue range (blue mixed with white goes purple, Maxwell's spinning-top observation); IPT, ICtCp and Oklab are all "quite good" on hue linearity (all fitted to Ebner-Fairchild data). — [Raph Levien, An interactive review of Oklab](https://raphlinus.github.io/color/2021/01/18/oklab-critique.html)
- Oklab uses a pure cube root with no linear segment near black; Levien finds Oklab "a bit darker" than CIELAB on a lightness placement scale and would prefer more contrast in the near-black region. — [Levien](https://raphlinus.github.io/color/2021/01/18/oklab-critique.html)
- Ottosson's toe function gives a CIELAB-like lightness from Oklab L: Lr = (k3·L − k1 + sqrt((k3·L − k1)² + 4·k2·k3·L)) / 2 with k1 = 0.206, k2 = 0.03, k3 = (1 + k1)/(1 + k2); inverse L = Lr(Lr + k1) / (k3(Lr + k2)). Near-identical to CIELAB at mid gray (Y 0.18406 vs 0.18419). — [Ottosson, Okhsv and Okhsl](https://bottosson.github.io/posts/colorpicker/)
- Okhsl saturation is chroma relative to the sRGB gamut edge for that lightness and hue, smoothed in the interior (C0 low-saturation term depends only on lightness; C_mid at s = 0.8; C_max at s = 1). It is "not matching perceived chroma fully" but "smoothly varying"; sRGB only. — [Ottosson, Okhsv and Okhsl](https://bottosson.github.io/posts/colorpicker/)
- Max chroma differs per hue and leaves "holes"; at L 44% only blue reaches high chroma on sRGB. Chroma stays below 0.37 in sRGB and P3. Browsers (Chrome, Safari) clip out-of-gamut colors in a way that can shift hue. — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Material Color Utilities (HCT, CAM16-based chroma) derive neutrals from the seed hue: non-content schemes use n1 (Neutral) chroma 4 and n2 (Neutral Variant) chroma 8 at the seed hue; content schemes use min(chroma/12, 4) and min(chroma/6, 8). — [material-color-utilities core_palette.ts](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/palettes/core_palette.ts)
- Some Material schemes override these (SchemeVibrant neutral chroma changed to 10 from 8 in v0.6.0). — [material_color_utilities changelog](https://pub.dev/packages/material_color_utilities/changelog)
- Linear moved its theme generator from HSL to LCH (98 variables replaced by 3 inputs: base, accent, contrast) because equal L reads as equal lightness; it does not publish the neutral formulas. — [Linear, How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)

### Inferences
- For Bland, OKLCH is the pragmatic choice (CSS-native, Figma variables already OKLCH, good blue behaviour at ~261°). Use HCT or CAM16 only as a cross-check, not as the storage space.
- A useful hybrid: define the neutral chroma in OKLCH, but express its size as a fraction of the sRGB max chroma at that L and hue (an Okhsl-style relative saturation). This automatically tapers to 0 at white and black and adapts to hues with small gamuts (yellow, cyan).

### Gaps
- No primary quantitative measurement found of OKLCH hue drift for low-chroma blues (C < 0.05). At neutral chroma levels hue errors of a few degrees are likely invisible, but this was not found in a source.
- HCT chroma 4/8 has no published exact OKLCH equivalent; a conversion per tone would need to be computed (e.g., with Color.js/culori).

## How chroma should vary across lightness; is Bland's curve a good model; gamut limits

### Takeaway
Every well-regarded tinted-gray scale studied (Tailwind slate/gray/zinc/stone/mauve/olive/mist/taupe, Radix via hand-tuned reference grays, Bland itself) uses a curve that is near zero at the light end, peaks around L 0.45-0.6, and tapers (but often not to zero) in the darks. Bland's curve is a good model: computed against the sRGB gamut at hue 261, it holds roughly 11-20% of the available chroma at every step, which is why it tapers at the ends.

### Cited Findings
- Tailwind v4 `slate` (blue tint): 50 L 0.984 C 0.003; 100 0.968/0.007; 200 0.929/0.013; 300 0.869/0.022; 400 0.704/0.040; 500 0.554/0.046 (peak); 600 0.446/0.043; 700 0.372/0.044; 800 0.279/0.041; 900 0.208/0.042; 950 0.129/0.042 (h 248-266). — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css)
- Tailwind `gray`: C 0.002, 0.003, 0.006, 0.010, 0.022, 0.027, 0.030, 0.034, 0.033, 0.034, 0.028 (h ~257-265). `zinc`: 0, 0.001, 0.004, 0.006, 0.015, 0.016, 0.017 (600 peak), 0.013, 0.006, 0.006, 0.005 (h ~286). `stone` (warm): 0.001, 0.001, 0.003, 0.005, 0.010, 0.013 (500 peak), 0.011, 0.010, 0.007, 0.006, 0.004 with hue drifting 106 → 49-73. — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css)
- Tailwind newer tinted neutrals peak at 500 and taper on both sides: `mauve` (h ~323) 0, 0.003, 0.005, 0.012, 0.019, 0.034, 0.029, 0.029, 0.024, 0.019, 0.008; `olive` (h ~107) 0.003, 0.005, 0.007, 0.011, 0.021, 0.031, 0.025, 0.023, 0.016, 0.013, 0.006; `mist` (h ~197-229) peak 0.021; `taupe` (h ~17-68) peak 0.021. — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css)
- Radix's custom palette generator builds a gray from a user color by finding the closest of its six hand-tuned gray scales (gray, mauve, slate, sage, olive, sand) by deltaEOK, optionally mixing the two closest, then for every step setting `C = min(sourceC × 1.5, stepC × sourceC / baseC)` and `h = sourceHue`, and remapping lightness to the chosen background. So the chroma *shape* comes from a reference curve, scaled by the input's chroma, capped at 1.5x the input chroma, hue held constant. — [Radix website, generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- Radix's official guidance is that its colors are not meant to be customised; Themes pairs an accent with a preset complementary gray. — [Radix Themes color docs](https://radix-ui.com/themes/docs/theme/color); [Radix composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)
- Material's approach is the opposite model: constant chroma (4 or 8 CAM16 units) across all tones at the seed hue; the gamut and CAM16's chroma scaling taper it at the ends. — [material-color-utilities core_palette.ts](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/palettes/core_palette.ts)
- At L = 1 any hue renders white (`oklch(1 0 none)`), so chroma must reach 0 at white. — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Computed sRGB max chroma at hue 261 (Bland blue) for L = 0.961 / 0.921 / 0.85 / 0.75 / 0.67 / 0.58 / 0.49 / 0.40 / 0.30 / 0.21 / 0.15 / 0.05: 0.018 / 0.038 / 0.074 / 0.128 / 0.175 / 0.230 / 0.212 / 0.173 / 0.130 / 0.091 / 0.065 / 0.022. At hue 90 (yellow): 0.049 / 0.101 / 0.174 / 0.153 / 0.137 / 0.119 / 0.100 / 0.082 / 0.061 / 0.043 / 0.031 / 0.010. At hue 30 (red-orange) the peak is 0.233 at L 0.58; at hue 200 (cyan) the curve is low everywhere (0.145 max at L 0.85, 0.036 at L 0.21). — computed from [Oklab matrices](https://bottosson.github.io/posts/oklab/)
- Bland's chroma as a fraction of that sRGB max at hue 261 (computed): step 50 0.002/0.018 ≈ 11%; step 100 0.0075/0.038 ≈ 20%; L 0.67 0.032/0.175 ≈ 18%; L 0.49 0.032/0.212 ≈ 15%; step 900 0.011/0.091 ≈ 12%; step 950 0.009/0.065 ≈ 14%. — computed from [Oklab matrices](https://bottosson.github.io/posts/oklab/)

### Inferences
- Three candidate models: (a) constant absolute chroma (Material style) fails near white/black where the gamut is tiny, and gives yellow/cyan neutrals relatively far more saturation than blue; (b) proportional to brand chroma (Radix, Material content: chroma/12) needs a cap so vivid brands don't produce colored grays; (c) a mid-peaked curve. Bland's hand curve is effectively (c) and closely approximates "about 15% of gamut max at that L and hue" (range 11-20%). A generator can reproduce it as `C(L) = k × Cmax_sRGB(L, h)` with k ≈ 0.12-0.20, or as Bland's own curve shape normalised to its peak and scaled.
- A gamut-relative rule would give a yellow brand (hue 90) much higher absolute chroma in the lights (gamut max at L 0.921 is 0.101 vs 0.038 for blue), which risks visibly yellow light surfaces; combine the relative rule with an absolute cap per step (e.g., never above Bland's blue values), or use the absolute Bland curve shape and only clamp to gamut.
- Tailwind slate keeps C ~0.042 down to L 0.129, more than Bland (0.009 at L 0.15); Tailwind gray/zinc/stone/mauve/olive taper the darks like Bland. Both are shipping, so dark-end chroma is a taste choice; Bland's taper is closer to the newer Tailwind neutrals.

### Gaps
- No published perceptual study validates a particular chroma-vs-lightness curve for UI neutrals; all evidence is from shipped palettes.
- Radix's six reference gray curves (in @radix-ui/colors) were not tabulated here.

## Perceptual effects: H-K, simultaneous contrast, adaptation, visibility thresholds, muddy yellow/green

### Takeaway
At neutral-scale chroma (≤ 0.035 OKLCH), the Helmholtz-Kohlrausch brightness boost is negligible, but tint visibility is strongly hue-dependent: bluish tints are more readily accepted as "neutral/white" than yellowish ones (daylight-locus bias), and chroma discrimination is worst in orange directions. That supports giving blue/violet brands their full tint and cutting chroma for yellow/green/orange brands rather than shifting hue arbitrarily.

### Cited Findings
- H-K effect: saturated colors appear brighter than unsaturated colors of equal luminance; strongest for reds, pinks, blues, weaker for greens and yellows. Models (Fairchild-Pirrotta 1991, Nayatani 1997, High-Green-Nussbaum 2023) give an "equivalent achromatic lightness" from CIELAB. — [Wikipedia, Helmholtz-Kohlrausch effect](https://en.wikipedia.org/wiki/Helmholtz%E2%80%93Kohlrausch_effect)
- Display study: Fairchild-Pirrotta needs a correction in red-magenta hues; effect strongest for bluish, weakest for yellowish colors. — [High, Green, Nussbaum 2023, NTNU Open](https://hdl.handle.net/11250/3110488)
- Oklab does not model H-K; it assumes well-lit viewing only. — [Ottosson](https://bottosson.github.io/posts/oklab/)
- APCA deliberately does not address H-K: chroma contrast "does not help readability". — [SAPC-APCA repo](https://github.com/davidscotson/SAPC-APCA)
- Chroma JNDs are larger than hue JNDs, especially in the orangish direction and less in the purplish direction; equal distances from the achromatic axis are not perceived as equally saturated across quadrants. — [Hedjar, Toscani, Gegenfurtner 2025, JOSA A](https://eprints.bournemouth.ac.uk/40927/1/josaa-42-5-b305.pdf)
- Achromatic loci: chromaticities along the blue direction are more likely to be classified as achromatic than equivalent contrasts in the yellow direction (blue-yellow bias). — [Basim et al. 2025, "Achromatic loci in normal and anomalous trichromats", JOSA A, doi 10.1364/JOSAA.546890](https://goddardlab.psy.unsw.edu.au/assets/files/basim2025.pdf) (search-result snippet; PDF body was not machine-readable here)
- Discrimination is best near the white/adaptation point; thresholds rise away from neutral. Proposed display chromaticity JND Δu′v′ = 0.001 and just-acceptable difference 0.002 for achromatic vs primaries. — [Chromatic Discrimination Thresholds, Periodica Polytechnica](https://pp.bme.hu/me/article/view/18691)
- CSS Color 4's gamut-mapping algorithm treats deltaEOK 0.02 as its JND (the threshold below which a clipped color is accepted). Because OKLab is Euclidean, a pure chroma offset from gray at the same L equals deltaEOK = C, so C 0.002-0.0075 (Bland 50/100) is well below that 0.02 "JND", while C ~0.032 at mid tones exceeds it. — [CSS Color 4, gamut mapping (binary search, JND)](https://www.w3.org/TR/css-color-4/#binsearch) (the 0.02 value is a gamut-mapping tolerance, not a vision-science threshold)
- Tinted-neutral examples in practice: light surface oklch(0.96 0.005 300), dark surface oklch(0.29 0.01 300), header #f3f7fa = oklch(0.97 0.006 240). — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Linear limited how much blue entered its calculations "for a more neutral, timeless look". — [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Tailwind's warm `stone` keeps very low chroma (peak 0.013, vs slate 0.046) and its hue moves from ~106 in the lights to ~49-73 in the mid/darks, i.e. yellow lights shift toward orange-red in mid and dark steps. `olive` (h 107) peaks 0.031, `taupe` (h ~40) 0.021. — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css)

### Inferences
- "Muddy" yellow/green grays: yellow-green is low in H-K boost and sits where the visual system least readily reads "neutral", so a small tint reads as discoloration (aged paper, khaki). The palettes respond by (1) cutting chroma (stone peak 0.013 vs slate 0.046, about 0.3x) and (2) nudging hue toward orange/red in mid and dark tones. A generator can apply a hue-dependent chroma multiplier: about 1.0 for hue 230-300 (blue to violet), about 0.6-0.7 for reds/magentas, about 0.4-0.5 for yellow/green/orange (60-160). These multipliers are derived from the shipped palettes above, not from a vision study.
- Blue tints read "clean" because bluish shifts are accepted as white (daylight-locus bias), which is also why most tinted UI grays (slate, gray, zinc) are blue.
- Simultaneous contrast and chromatic adaptation are relevant: next to a saturated brand accent, a tinted gray of the same hue looks grayer (contrast reduces its apparent tint), while a gray of opposite hue would look tinted toward the complement. Matching neutral hue to brand hue therefore harmonises. No primary numeric source was retrieved on this point.

### Gaps
- No primary source gave a hue-by-hue "just-noticeable chroma" in OKLCH units; the 0.002-0.005 visibility range in the question is not confirmed by a found study. The Δu′v′ 0.001 JND converts to roughly OKLCH C ≈ 0.003-0.005 near mid gray, but that conversion was not computed or sourced here.
- Fairchild-Pirrotta formulas were not retrieved; the effect at C < 0.04 is inferred to be small from the model's dependence on chroma, not quantified.

## Should neutral hue follow the brand hue exactly, or shift?

### Takeaway
Programmatic systems (Material, Radix generator) hold the neutral at the brand's exact hue. Hand-tuned palettes drift hue modestly: Tailwind slate goes ~248 in the lights to ~265 in the darks (bluer/more violet in the darks); stone goes from yellowish ~106 lights to orange-red ~35-73 in the darks. A small, rule-based drift is defensible, but exact hue is the safe default for blue/violet brands.

### Cited Findings
- Material: n1/n2 use the seed hue unchanged. — [material-color-utilities core_palette.ts](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/palettes/core_palette.ts)
- Radix generator: `color.coords[2] = source.coords[2]` for every step (exact hue). — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- Tailwind slate hue: 247.9 (50), 255.5 (200), 257.4 (500), 265.8 (900), 264.7 (950); gray 247.8 (50) then ~256-265; stone 106.4 (50/100) then 48.7-73.6; mist 197.1 (50) → 228.8 (950); taupe 67.8 (50), 17.2 (100), ~35-49 thereafter. — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css)
- In the lightest steps (C ≤ 0.003) the hue numbers are near-meaningless, since hue is undefined at C = 0 and `none` is used. — [Tailwind theme.css](https://raw.githubusercontent.com/tailwindlabs/tailwindcss/main/packages/tailwindcss/theme.css); [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)

### Inferences
- Observed drift pattern across Tailwind: cool neutrals get slightly cooler/more violet with depth (+10 to +30°), warm neutrals move from yellow toward orange/red with depth. This mirrors the "yellow is only nice when light" constraint: dark yellow reads as olive/brown, so drifting toward orange keeps darks warm rather than muddy. A generator can do: if brand hue is in 60-120, rotate darks toward ~50-70; otherwise keep the hue (optionally +5-10° in the darks for blues).

### Gaps
- No source states the design rationale for Tailwind's hue drift; the pattern is read from the values.

## Dark mode: how tinted dark surfaces read; should chroma differ

### Takeaway
Shipped palettes keep some chroma in the darks (Tailwind slate 0.042 at L 0.129; most others 0.004-0.019 at L 0.15-0.21), and the sRGB gamut at hue 261 allows only 0.065 at L 0.15, so the same absolute chroma is a larger share of the available colorfulness in the darks. Evidence on whether tints are more visible on dark backgrounds was not found in primary sources.

### Cited Findings
- Example dark tinted surface oklch(0.29 0.01 300) vs light oklch(0.96 0.005 300): the dark one uses 2x the chroma. — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- Radix keeps separate light and dark reference gray scales (lightGrayColors / darkGrayColors from the P3 and DarkP3 sets) and remaps dark-mode lightness to the background with its own easing. — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- Linear made text and neutral icons darker in light mode and lighter in dark mode for contrast, and reined in blue. — [Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)
- Oklab is a bit dark near black and assumes well-lit viewing. — [Levien](https://raphlinus.github.io/color/2021/01/18/oklab-critique.html); [Ottosson](https://bottosson.github.io/posts/oklab/)
- Computed: at hue 261, Bland 900 (C 0.011, L 0.21) uses 12% and 950 (C 0.009, L 0.15) 14% of sRGB max; at hue 90 the same absolute chroma would be 26% (L 0.21, max 0.043) and 29% (L 0.15, max 0.031). — computed from [Oklab matrices](https://bottosson.github.io/posts/oklab/)

### Inferences
- Because Bland mirrors the scale, dark-mode page backgrounds come from steps 900-1000. A gamut-relative chroma rule keeps the dark tint proportionally the same as the light one; an absolute rule makes yellow/cyan darks relatively more colored. The question of whether Bland needs a separate dark curve is mainly about yellow/green brands, where darks turn olive; cut chroma there.

### Gaps
- No primary vision-science source was found on tint visibility vs adaptation level for dark UI; dark-mode viewing (dim surround) is outside Oklab's "well-lit" design condition.

## Accessibility: does tinting change WCAG 2 / APCA; hold OKLCH L or luminance?

### Takeaway
At neutral chroma levels the luminance change from tinting at fixed OKLCH L is tiny for blue and yellow (≤ 0.2%) but reaches about 1.5-3.5% for red/orange and green hues, which moves WCAG contrast by up to roughly 0.1-0.13 ratio units at mid tones. That is small but can tip a value sitting exactly on 4.5:1. Hold OKLCH L for visual consistency and verify WCAG/APCA per generated step, or hold luminance Y if contrast pairs must be identical across brands.

### Cited Findings
- Computed luminance shift (relative Y, tinted vs pure gray at the same OKLCH L), and WCAG ratio vs white: hue 261, L 0.49 C 0.033: −0.01%, 6.263 → 6.264; hue 261 L 0.55 C 0.06: −0.19%, 4.853 → 4.860. Hue 90 L 0.49 C 0.033: +0.10%. Hue 30 (red-orange) L 0.49 C 0.033: −2.13%, 6.263 → 6.358; L 0.55 C 0.06: −3.50%, 4.853 → 4.987. Hue 145 (green) L 0.49 C 0.033: +2.21%, 6.263 → 6.167; L 0.55 C 0.06: +3.54%, 4.853 → 4.724. Lightest steps (L 0.961, C 0.002) change < 0.1% for all hues. — computed from [Oklab matrices](https://bottosson.github.io/posts/oklab/) and the WCAG 2 contrast formula
- APCA is built on luminance (soft clamp of very dark Y below 0.022, polarity-aware) and does not model H-K, treating chroma contrast as not helping readability. — [APCA introduction](https://github.com/Myndex/apca-introduction); [SAPC-APCA](https://github.com/davidscotson/SAPC-APCA)
- Achromatic luminance contrast is what matters most for readability and fine detail. — [W3C public-css-archive, 2022-07](https://lists.w3.org/Archives/Public/public-css-archive/2022Jul/0289.html)
- OKLCH L predicts contrast well enough for a rule like "backgrounds with L ≥ 87% have good contrast with black text". — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)

### Inferences
- Because WCAG 2 and APCA both use luminance only, and the luminance shift at Bland's chroma levels is ≤ ~2% for any hue, holding OKLCH L is acceptable; but a generator should re-check the specific text/border pairs Bland relies on (e.g., the step chosen for `Text/text-subtle` against surfaces) for every brand, and nudge L by ±0.005 if a pair drops below threshold. Green-hued neutrals at fixed L come out slightly lighter (lower contrast on white); red/orange slightly darker.

### Gaps
- APCA Lc deltas were not computed; given the luminance deltas above they would be of similar relative size, but this was not verified.

## Low-chroma (gray) brands and near-black / near-white brands

### Takeaway
Use a proportional rule with a floor and a cap: when the brand chroma is very low, the neutral should become pure gray (or inherit the brand's slight tint), not invent a hue. Radix and Material both show this: chroma derived from the source with caps, and a gray fallback for pure white/black.

### Cited Findings
- Material content schemes: neutral chroma = min(sourceChroma / 12, 4), neutral variant = min(sourceChroma / 6, 8); so a gray seed gives near-zero neutral chroma. Non-content schemes force fixed 4/8 regardless. — [material-color-utilities core_palette.ts](https://raw.githubusercontent.com/material-foundation/material-color-utilities/main/typescript/palettes/core_palette.ts)
- Radix: per-step chroma = min(source C × 1.5, referenceStepC × sourceC/baseC), so a low-chroma input yields a proportionally low-chroma gray; if the accent is pure #000 or #fff, the accent scale is replaced by the gray scale. — [generate-radix-colors.tsx](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- Hue is undefined at C = 0 (`none`), and at L = 1 any hue is white. — [Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)

### Inferences
- Suggested rule for Bland: tint strength t = clamp(brandC / Cref, 0, 1), with Cref ≈ 0.10-0.12 (a typical solid brand chroma); neutral C(step) = t × BlandCurve(step) × hueFactor(h), clipped to gamut. Below brandC ≈ 0.02 the result is practically gray (≤ 0.006 peak), which avoids unstable hue from a near-gray brand (hue of a C 0.01 color is noisy). Near-black or near-white brands carry their hue and chroma in the brand color itself; derive the tint from the brand's mid steps (400-600) rather than the input swatch, or from the input chroma relative to its gamut max (Okhsl saturation), since a near-black brand's absolute chroma is small even when it is "fully saturated".

### Gaps
- No source discusses tinted neutrals for near-black/near-white brands specifically; the rule above is an inference from the Material and Radix code paths.
