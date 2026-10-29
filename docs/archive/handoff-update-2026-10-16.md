> **Archived 2026-10-29.** Merged into `docs/figma.md` (Figma conventions, overflow drawing, Plugin API techniques) and `LEARNINGS.md` (Figma, Claude Docs). Kept for history; the repo wins wherever they disagree. Out of date here:
>
> - **Scrollbar:** "always visible when content overflows" is now "shows only while the area scrolls" (Godwin 2026-10-22; `CLAUDE.md`, Overflow).
> - **Collections:** 12 now, not 10. `Typography` became `_Typography` and is hidden (2026-10-25), and `Motion` and `Breakpoints` were added. Type reaches code only through the text styles.
> - **Grid styles:** the stretch columns with a fixed 24 margin are gone. There are nine styles now (Mobile, Tablet and Desktop sm/md/lg), with column widths on the 8 grid and the margins taking what is left (2026-10-28, `docs/grid.md`). The Dashboard styles were removed.
> - **Code snippet height:** the Figma variants are fixed-height frames; in code, collapsed caps the body at `code-snippet/height-collapsed`, and Figma's "resizable height" note was dropped (`CLAUDE.md`, component map).
> - **Not scroll areas:** in code, Table (sideways) and the Modal body scroll with the same fade and scrollbar. Tab rows scroll sideways with the fade alone, and the overflow item is not used (Godwin 2026-10-19).
> - **Next / shadcn:** the code side uses no shadcn and no Tailwind; the lint, the token pipeline and the docs site are built.
> - **Node ids** are as of 2026-10-16 and may have changed; look nodes up by name.

# Bland handoff: update of 2026-10-16 (read with claude/bland-handoff.md)

This file records changes made after the last full write of `claude/bland-handoff.md`. Where the two disagree, this file is newer. Merge it into the handoff when that file is next rewritten, then delete this file.

## IMPORTANT: stroke tokens renamed (2026-10-16, Godwin approved "keep the rhythm")

Old to new (values unchanged, bindings followed the rename):

- `stroke-sm` (0.5) is now `stroke-xs`
- `stroke-md` (1, borders and row dividers) is now `stroke-sm`
- `stroke-icon` (1.5, every Phosphor icon stroke) is now `stroke-md`
- `stroke-none` 0, `stroke-lg` 2, `stroke-xl` 4 unchanged.

Everywhere the handoff says `stroke-md` for borders, dividers or "1px", read `stroke-sm`; where it says `stroke-icon`, read `stroke-md`; where it says `stroke-sm` (the table cell bottom border, Code-text and code snippet borders), read `stroke-xs`. The three stroke variable descriptions were rewritten; no other variable or component description named these tokens.

## IMPORTANT: overflow rule (2026-10-16, Godwin; Figma drawing is an overlay, option A)

Every scroll area that overflows shows a visible scrollbar AND an edge fade where content is hidden, always both. Truncated text is not overflow: it always ends in an ellipsis, never a fade.

- **Figma draws the fade as an overlay, not a mask** (Godwin chose option A). Masks proved unreliable in this file: an absolute mask rendered in Menu, Sidebar and Text Area but did nothing inside the Code snippet `body` (even a plain gradient rectangle used as a mask), a frame used as a mask failed in some nested frames, and swapping the variant of an instance used as a mask silently drops `isMask` (it then shows as a solid black block). The `_fade-mask` set was deleted.
- **Page** `•  Scroll area` (between Radio Button and Section tab): Header, a Notes "How to use" card, `_scrollbar` set `6324:365`, `_fade` set `6330:404`.
- **Tokens:** Sizing `fade/sm` 16 (`VariableID:6324:358`), `fade/md` 32 (`6324:359`), `scrollbar/width` 4 (`6324:360`); Theme `Scrollbar/thumb` (`6324:361`; replaced and deleted `Menu/scrollbar`). Theme `Fade/*-clear` tokens, hidden from pickers (scopes empty), each the matching surface's primitive at 0% opacity per mode (value form `{color: alias(primitive), opacity: 0}`): `Fade/surface-100-clear` (Neutral0 / Neutral950), `Fade/menu-clear` (Neutral0 / Neutral900), `Fade/calendar-clear` (Neutral0 / Neutral900), `Fade/text-input-clear` (Neutral50 / Neutral900), `Fade/text-input-hover-clear` (Neutral100 / Neutral800). Why: a gradient stop bound to a variable takes that variable's alpha, so the transparent end needs its own token; pointing it at the same primitive avoids a gray halo in dark mode.
- **`_scrollbar`**: `Axis` vertical/horizontal; the thumb only (4 x 56 or 56 x 4), `scrollbar/width`, `rad-rd`, 100% smoothing, fill `Scrollbar/thumb`.
- **`_fade`** `6330:404`: `Axis` vertical/horizontal x `Size` md/sm (4 variants; **md is the default**, Godwin 2026-10-16, so `Axis=vertical, Size=md` is the first variant); booleans `👀 Fade start#6330:0` (default off) and `👀 Fade end#6330:5` (default on). Auto layout along the axis: `start` piece (length bound to `fade/md` or `fade/sm`, gradient surface to clear), `middle` (FILL, no fill), `end` piece (clear to surface). Default stops bound to `Surface/surface-100` and `Fade/surface-100-clear`. Booleans, not variants, so overrides survive; swapping Size keeps the stop overrides. Vertical gradient transform `[[0,1,0],[-1,0,1]]`, horizontal identity. Gotcha: an instance's `children` omit layers hidden by a boolean, so turn the booleans on before editing those layers, then restore.
- **Wiring pattern** in each scroll area: content first, then `fade` (an exposed `_fade` instance, absolute, full size of the area, constraints STRETCH/STRETCH), then `scrollbar` last (absolute, 4 in from the right, y 8, MAX/MIN), both visible bound to `👀 Overflow`. The `fade` pieces' stops are overridden to that area's own surface token and its `Fade/*-clear` token. Designers set `👀 Fade start` / `👀 Fade end` on the exposed fade (end at the top of a list, both in the middle, start at the bottom). Every wired fade uses Size md.
- **Wired** (all `👀 Overflow` default **off** except Code snippet; Figma cannot detect overflow, so turn it on only when the content really overflows, otherwise the fade sits over empty space, which is what Godwin saw on a vertically resized Sidebar): Menu (`👀 Overflow#588:0`; `Menu/surface-rest`), Calendar month and year variants (`👀 Overflow#6325:0`; `Date/Calendar/surface`; fade and scrollbar sit on the variant root, absolute over the `months`/`years` grid, not inside the grid), Sidebar (`👀 Overflow#6325:13`, default changed to off; `Sidebar-collection`; `Surface/surface-100`), Code snippet (`👀 Overflow#6325:26`, default on; `body`; `Surface/surface-100`; the "Show more" Button lives in `main`, absolute, CENTER/MAX), Text Area (`👀 Overflow#6325:30`; `user-input`; `TextInput/surface-rest` or `TextInput/surface-hover` by variant). Verified in light and dark with both edges on, and with resized Sidebar and Code snippet instances. Each set's description ends with an "Overflow:" sentence.
- **Code snippet is now resizable in height** (Godwin: "not responsive height-wise"): every variant root is fixed height (collapsed 456, expanded and fullscreen 736 by default), `main` and `body` FILL. Collapsed `body` lost its fixed `height` binding; `code-snippet/height-collapsed` (384) is now bound to the collapsed body's `maxHeight` (description updated), so collapsed caps the body at 384 while expanded and fullscreen have no cap.
- **GRID gotcha:** absolute children in a GRID frame still count for HUG sizing (Figma adds grid rows for them); the Calendar month/year grids grew to 5 rows and absurd heights twice. Never put absolute children inside a GRID frame: place them on the grid's parent, positioned over the grid. Calendar month/year variant heights are back to 172 / 204 / 236 (sm / md / lg), grids 4 rows.
- Not scroll areas today (no change): Table, Modal body, Messaging chat list, tab rows (they use an overflow item). If any is made to scroll, apply the same pattern; add a `Fade/*-clear` token for its surface if missing.
- **Code contract:** scrollbar always visible when content overflows (thumb `Scrollbar/thumb`, width `scrollbar/width`); a real `mask-image: linear-gradient(...)` on the scroll container (not an overlay), transparent ends only on edges with hidden content, length `fade/md` by default (`fade/sm` available), updated on scroll; pointer events unchanged; scroll a focused item clear of the fade. The `Fade/*-clear` tokens are Figma-only drawing aids; code does not need them.

## Done on 2026-10-16 (Godwin's request: remove How to use frames, relabel stickersheets, fix native slots, doc housekeeping)

- **How to use frames deleted** on all 34 component pages (Godwin's direct request). None held main components. Ids removed: Accordion `1470:5370`, Alert `1472:24563`, Avatar `540:46197`, Badges `540:48946`, Banner `1472:26958`, Breadcrumbs `540:38986`, Buttons `540:57333`, Checkbox `540:49371`, Chip `543:3700`, Code snippet `992:14186`, Date & Time `538:29186`, Dropdown `587:39952`, Empty State `866:6477`, File tab `1472:32727`, File Upload `609:13475`, Lists `539:30924`, Messaging `958:5511`, Modals `615:17747`, Notification `539:38175`, Pagination `787:9776`, Pills `774:8556`, Pill tab `539:32492`, Progress indicators `844:10636`, Radio Button `540:49139`, Section tab `1471:36034`, Segmented bar `1471:18642`, Sidebar `1089:80713`, Slider `539:35533`, Tab bar `1471:27338`, Table `774:9025`, Text-input `540:45583`, Toast `1472:22168`, Toggle `540:39284`, Tooltip `539:36102`. Every "How to use" id in Key IDs and every Pending decisions note about a How to use frame no longer applies. Checkbox, Radio Button, Code snippet, Messaging and Sidebar now have no doc frame at all.
- **Stickersheets relabelled.** Each is Header instance > `Stickersheet` frame of component instances > Footer (Godwin: the stickersheet is a component, so edit its main). Badges stickersheet (`130:18390`) leading icons swapped to Phosphor (Star `6080:106807`, Check, WarningCircle). Tab labels to sentence case: `_section-tab-item` `✏️ Label#356:7` and `_segmented-bar-item` `✏️ Label#355:4` defaults "tab" to "Tab", and 155 "tab" overrides set to "Tab". Progress indicators stickersheet wizard (`844:10608`) set to Steps 4.
- **Native slots on Tooltip and `_leading-input`.** Tooltip: `🧩 Slot#6295:0` in `Content` under the text (VERTICAL, gap `space-sm`, FILL width, HUG height, hidden unless `👀 Slot#1125:0`); `🌟 Slot#1125:25` removed. `_leading-input`: `🧩 Slot#6295:169` first in `inner` (fixed 20 square bound to `icon/md`, centred, max 1 child, hidden unless `👀 Slot#155:8`); `🌟 Slot#155:6` removed. No manual slots remain anywhere; the handoff's "pending" native-slot notes are superseded.
- **Plan doc housekeeping:** Messaging entry corrected; native slots, Phosphor, manual-slot review, cleanup, variable descriptions, variable review and supporting pieces items ticked. (Replacing a paragraph with `"as":"text"` inherits the first run's code mark; use `"as":"markdown"` with backticks instead.)

## Token decisions (2026-10-16)

- `Indicator/danger-primary-content` dark: reverted at Godwin's request to `Text/text-bold` (white text, 3.7:1); he finds dark text on red harder to read. Decided: keep white.
- `Progress/fill-danger` dark and the Pills unselected border: Godwin changed them back by hand. Decided: leave them.
- `Messaging/receiver-content-subtle` dark: Neutral200 (was Neutral300); 4.9 / 5.4 on the receiver quote.
- Renamed `Messaging/receiver-quote` to `Messaging/surface-receiver-quote` (`6258:1178`; light now Neutral100, set by Godwin) and `Messaging/sender-quote` to `Messaging/surface-sender-quote` (`6258:1180`).

## Cleanup (2026-10-16, Godwin approved A to F by letter)

- Godwin deleted the Landing page's content himself (he will redesign it); the page itself is empty. Every Landing note in the handoff no longer applies.
- **A:** all `dist-*` bindings rebound to their `space-*` alias targets file-wide (8 stale overrides in the `_code-action-bar` tabs variant cleared).
- **B:** old shadows on Cover and the Annotations `Shadow` helper main moved to `Elevation/*`.
- **C:** every Lucide instance swapped to Phosphor (Annotations helpers, Typography, Dropdown `Back` `587:39701`, Sidebar `Upper slot`). The four Cover status instances pointed at old page-less copies of Banner, Toast and Alert; they were swapped to the current sets and their overrides reset. Swap gotcha: `resetOverrides()` on a nested instance after `swapComponent` reverts the swap itself; for nested swaps rebuild the vector paints from the Phosphor main instead.
- **D:** deleted `_Distance (deprecated)`, the `Lucide Icons` frame `17:249` (1,258 components) and `Square - Slots` `111:2727`.
- **E:** the Shadows review page was deleted by Godwin. The Effects page doc frame (`253:27424`, now named `Elevation`, inner `253:27423`) shows 15 `Shadow` helper instances (5 families by near/mid/far) with `Elevation/*`. The 36 `_Deprecated/Shadow` styles were deleted.
- **F:** Spacing page `Distance` and `Padding` doc frames deleted.
- Collections now: `_Core Colors`, `_Functional Colors`, `_Units`, `Spacing`, `Corner Radius`, `Theme`, `Stroke`, `Typography`, `Effects`, `Sizing`.

## Variable descriptions (2026-10-16)

Every variable has a description, written from rules (primitives point to Theme tokens; scale steps state their value; component tokens name component, variant and state; semantic tokens say where to use them; unused ones say "Reserved; not used by any component yet"). No em dashes.

## Variable review (2026-10-16, decided)

Godwin's rule: keep all primitives, all spacing and radius steps, and anything that may be used later; delete a variable only when another variable already handles its job.

- **Deleted:** `Border/border-success-focused`, `-danger-focused`, `-warning-focused` (every focus ring uses `Border/border-focused`; one Cover override remapped first). Later: `Menu/scrollbar` (replaced by `Scrollbar/thumb`).
- **Kept, in use:** `Icon/icon-link`, `Sidebar/icon-selected`, `Messaging/video-control-content`.
- **Kept, reserved:** `Icon/icon-inverse`, `Border/border-minimal`, `Border/border-hover`, `Border/border-inverse`, `Surface/surface-600`, `Surface/surface-success`, `Surface/surface-warning`.
- **Kept, scale or primitive:** all primitives, `space-3xl` to `space-9xl`, `rad-lg`, `rad-xl`, `Layout/margin-desktop`, `Layout/margin-mobile`, every type step.

## Supporting pieces (2026-10-16, Godwin approved A to G)

- **Logo** `14:211` (Brand elements page): `Theme` light/dark replaced by `Color` default/on-color (renamed in place, so the 35 instances stayed linked: light became on-color, dark became default). default text `Text/text-bold`; on-color `Text/text-on-color` (white in both modes; was `text-inverse`, which turned dark in dark mode on the brand bars). Gap bound to `space-sm`. New `👀 Mark#6312:30` (default off) and `🧩 Mark#6312:35` (native SLOT, first child, max 1, fixed square bound to new Sizing tokens `logo/mark-lg` 40 `VariableID:6312:697` and `logo/mark-sm` 24 `6312:698`). Description written. Set arranged: Size columns lg, sm; rows default, on-color.
- **Annotations helpers:** `Header` `14:16` (layers `bar`, `top-row`, `text`), `Footer` `25:1301` (`bar`, `brand`, `credits`, `author`, `links`) and `Typo card` `44:520` (`details`, `meta`, `weight`, `line-height`, `size`): gaps and padding bound, descriptions written. Colors stay on primitives by decision (doc chrome). `How to use` helper deleted. `mini-section-header` `537:23904` kept.
- **Screen templates** `1177:13416` (Spacing page): desktop and tablet keep centred columns, gutters bound to `space-lg`; every phone has 4 STRETCH columns, gutter `space-sm`, margins `Layout/margin-mobile` (24). Description written.
- **Navbar:** no component exists (it was on the deleted Landing page); deferred to the landing redesign.

## Doc page housekeeping (2026-10-16, Godwin: "this is the kind of housekeeping i am talking about. Review other pages")

Rule going forward: doc pages must show what the file actually has. Whenever a token, style or component is renamed, added or removed, update the doc page that lists it in the same pass.

- **Spacing page** (`52:8969`): frames left to right are now `Units` (new, x 0), `Spacing` `53:10016`, `Corner radius` `56:10099`, `Stroke` `56:10142`, `Screen templates` `1177:13416` (each 680 apart). Every table was rebuilt from the live variables (Name and Value columns, sorted by value): Units 28 rows; Spacing 18 rows (`space-none` to `space-9xl` plus both `Layout/margin-*`); Corner radius 7 rows; Stroke 6 rows. Header titles and descriptions rewritten. Table bodies named `Units table`, `Spacing table`, `Radius table`, `Stroke table`. The rows are static text: rebuild them from the variables when a token changes. (The `fade/*` and `scrollbar/width` tokens are Sizing tokens and are not listed on the Spacing page.)
- **Typography page** (`49:446`): every `Typo card` rewritten from the live text styles and its name text uses the actual style (`setTextStyleIdAsync`). Deleted cards for removed styles: Others/link, Others/btn-lg, Others/btn-sm, Code/Link. Fixed sm values (10/12 to 12/16). Added Body/body-lg-underline and Body/body-lg-bold-underline. Inter group `44:537` has 17 cards, Geist Mono group `980:299` has 6. Card text layers are found by order (0 name, 2 weight, 5 line height, 7 size).
- **Cover** (`1:3`): three Typo cards rewritten as Heading / heading-md, Heading / heading-sm, Title / title-lg. Five instances linked to deleted old components swapped to current ones (Checkbox, Badge, Text Input, Tooltip, Text Area). Positions and rotations kept.
- **Colors page** (`43:267`): both sections rebuilt from live variables: `_Core Colors` (`25:797`): Brand, Neutral, Purple, Brand alpha, Neutral alpha (46 cards); `_Functional Colors` (`25:941`): Red, Green, Amber and their alphas (54 cards). Swatches bound; hex text static. Alpha primitives are stored as `{color: alias, opacity: N}` (opacity 0 to 100).
- **Grid styles**: gutters bound to `space-sm` / `space-lg` / `space-xl`; `Mobile/sm`, `Mobile/md`, `Mobile/lg` now 4 STRETCH columns, gutter `space-sm`, offset `Layout/margin-mobile`.
- **Doc header text** fixed: Effects page now "Elevation"; Icons Crypto breadcrumb; Tab bar description; grammar on several component descriptions.
- **Left for Godwin** (not changed): the "Good to know 🚧" page holds only three loose headings with no content; a loose note on the Colors page canvas (`6025:10469`); the Footer helper's "Twitter" link label.

## Not changed

- Notification horizontal with every property on (stickersheet `234:4279`) squeezes the description; Godwin: leave as is.

## Next (Godwin's order)

Code side (shadcn/lint, token export pipeline, docs site) happens in Claude Code, not in chat; it must implement the overflow rule above. Navbar comes with the landing page redesign.

## Technique notes from this session

- `page.loadAsync()` on every page in one call, then `findAll` per page, works for a file-wide scan without switching pages; edits on other pages work after the page is loaded.
- `node.screenshot()` in one call returns at most about five images, and identical images may be dropped.
- Renaming a variable inside a script does not update a name-keyed map built earlier in the same script; re-key it. When renaming a chain of variables (sm to xs, md to sm), rename in that order and swap names in text through placeholders so they do not cascade.
- File-wide destructive writes need approval that names the operation (a lettered list approved by letter); a bare "ok" on a summary item was refused by the permission check.
- For a usage census, check paint bindings on every vector, including inside instances, and verify any "unused" token by looking at the layer it was made for before proposing to delete it.
- Layout grids (on frames and on grid styles) bind with `figma.variables.setBoundVariableForLayoutGrid(grid, field, variable)` (fields `gutterSize`, `offset`, `count`, `sectionSize`); it returns a new grid object.
- Doc tables built from `_table-cell` instances: keep the first data row as a template, remove the rest, clone it per token and set the two cell texts.
- Reading node properties generically: guard with `'prop' in node` (TEXT nodes throw on frame-only getters such as `overflowDirection`).
- Gradient stops bind with `boundVariables: {color: figma.variables.createVariableAlias(v)}` per stop; the stop then takes the variable's alpha.
- An instance's `children` exclude layers hidden by a boolean property; turn the boolean on to reach them.
- Property changes on a fresh instance may not show in its sublayers until a later call; split "create and set properties" and "edit sublayers" across calls when the second step fails.
- Before finishing any structural change, test a resized instance (taller and shorter) and check the component's variant heights against their earlier values.
