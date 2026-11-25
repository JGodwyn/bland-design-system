# Changelog

Bland follows [semantic versioning](https://semver.org). Until 1.0, a minor version (0.2.0) may change an API or a token name; a patch (0.1.1) never does. Each entry says what a project has to change, if anything.

## 0.4.0 (2026-11-25)

- **Removed: Modal `top`** (deprecated in 0.3.0). What to change: put that content in `children`; for something above the text, leave `description` out and put both in `children`.

- **Buttons: tighter on the icon side.** A Button's side that holds an icon or the loading spinner now has one step less padding than a bare side: 24px on `lg` (32 bare), 12px on `md` (16), 8px on `sm` (12), 4px on `xs` (8). Buttons with icons get a little narrower. Icon Button is unchanged.
- **xs buttons: rounder, lighter icons.** `size="xs"` Buttons and Icon Buttons use `--rad-md` corners like the other sizes (they used `--rad-sm`), and stroked icons in them draw at 1px (`--stroke-sm`). This includes the close buttons of Banner, Notification and Modal.
- **Progress Wizard: vertical.** New `orientation` prop: `vertical` stacks the steps top to bottom (a checkout or onboarding list down the side of a page), the marker beside the text on the title's first line, a line (connector) or bar running down between steps; it fills its container's width and its titles wrap. `auto` is vertical below 768px and horizontal from there, in CSS only. The default stays `horizontal`, so existing wizards don't change.
- **Sidebar: raised selected style, floating, border.** New `selectedStyle="raised"`: the current row is white with a small shadow instead of the brand tint (in dark, one step above the panel). New `floating`: the panel sits 8px from the top, bottom and start edges, rounded (`--rad-lg`) with its border all round; the sidebar's own box grows by those 8px. New `border` (default `true`): `border={false}` drops the panel's edge, for a gray page. Rows and the collapse button are rounder (`--rad-md`, was `--rad-sm`), count boxes `--rad-sm` (was `--rad-xs`). The minimized rail's hover peek now casts `--elevation-neutral-mid` over the page. New tokens `--sidebar-surface-selected-raised` and `--sidebar-count-selected-raised`.
- **Breadcrumb: sizes.** New `size`: `lg` (default, unchanged), `md` (14px text, 16px icons) and `sm` (12px text, 12px icons), the same steps as Link.
- **File Upload: regular-weight title.** The title above the drop zone is `--type-body-lg` (was `--type-body-lg-bold`).
- Nothing else to change in a project.

## 0.3.4 (2026-11-23)

- **Agent skill:** says the see-through fills carry a faint brand hue on purpose (Brand 950 / 50), so an agent doesn't swap them for a gray.

## 0.3.3 (2026-11-23)

- **Numeric Input Field: new look and an xs size.** The digits are in the code font (`--font-code`, Geist Mono) and larger: 22px on `sm`, 27px on `md`, 34px on `lg`. Corners are rounder: 8px on `xs` and `sm`, 16px on `md` and `lg`. New `size="xs"`, 32px boxes with 16px digits, below the touch target, for dense layouts. New tokens `--digit-xs` and the text styles `--type-code-title-lg`, `--type-code-heading-sm`, `--type-code-heading-md` (Geist Mono Medium, with their line-height and letter-spacing).
- **Fonts:** `bland-ui/fonts.css` now loads Geist Mono 500 too, for the new Code styles. If you replace the code font (`--font-code`), load its 500 weight beside 400 and 600.
- **Fields carry the brand's hue.** The see-through fills (`--surface-field`, `--surface-alpha`, the Text Input, Dropdown and message bar fills, and their hovers) are now the brand's 950 step at 6% / 10% in light and its 50 step in dark, instead of black and white. On a brand with tinted grays a field no longer looks flat gray beside its tinted border and text (a violet brand's field goes from `#f0f0f0` to `#f1f0f6`). Checked on 22 brand colors: never stronger than the brand's own light surface. Shadows and modal backdrops stay neutral. A brand.css made before this needs nothing: the fills follow its `--brand-950` and `--brand-50`.
- **Docs:** the Overview page is white (`--surface-100`) again, like every other page, with restyled stats. On the Brand theme page the font lists show in dark mode, and the preview sits under How to use only.
- Nothing to change in a project; a field you have keeps its size and changes look.

## 0.3.2 (2026-11-21)

- **Toast docs:** the variant toasts are centred.
- **Agent skill in the package.** `dist/skill/` holds a skill for AI agents (Claude Code, Codex, Cursor, …) building UI with Bland: `SKILL.md` with the rules (stylesheet order, tokens instead of values, light and dark, brand override, the tokens used most), and `references/` with setup, CSS, choosing components, and every component's props, generated from the code so it matches the version you install. Copy it into your project: `cp -R node_modules/bland-ui/dist/skill .claude/skills/bland-ui` (README, "For your AI agent").
- **New command: `npx bland-ui brand`.** The Brand theme page's generator now ships with the package: `npx bland-ui brand "#ff5a1f" --fix --out src/brand.css` writes the project's brand override (13 brand and 13 neutral steps, the chart palette, optional `--extra` colors and `--font-*` fonts) and checks its contrast, the same CSS the page gives. `npx bland-ui brand check src/brand.css` re-checks a file after a hand edit; `npx bland-ui` lists every option. The agent skill runs it when you tell your agent your brand color, and puts CSS you paste from the Brand theme page into `brand.css` as is.
- **`tokens.json` in the package.** Every token with its CSS name, light and dark values and its description, at `bland-ui/tokens.json`, for agents and tools to search.
- Nothing to change in a project.

## 0.3.1 (2026-11-21)

- **New: Popover.** `import { Popover } from 'bland-ui'`: a small panel that opens beside the element that was pressed and holds any content (a profile, a Share panel with a link and Copy, a few filters and Apply). The page stays usable: a press outside, Escape or focus leaving it closes it, and focus returns to the trigger. Pass the opener as `trigger`; `size` sm 256 / md 320 (default); `placement` in Floating UI's names (default `bottom-start`). It takes Modal's `title`, `description`, `children` and `actions` (use sm Buttons), with the title and actions off until you pass them and `closeButton` off by default. New tokens `--popover-surface`, `--popover-border`, `--popover-width-sm`, `--popover-width-md`.
- **New: Link.** `import { Link } from 'bland-ui'`: a text link for running text or on its own, so a project stops styling its own. Without `size` it takes the font of the text around it; `size` sm / md / lg sets body-sm / md / lg. `underline` is `always` (default, a 1px underline that thickens to 2px on hover) or `hover`; `color` is `link` (default, `--text-link`) or `inherit`. `iconStart` / `iconEnd` take any SVG, sized to the text and never underlined. With `target="_blank"` it shows an arrow and tells screen readers it opens a new tab (`external={false}` turns that off). `renderLink` plugs in a router. New icon `ArrowUpRightIcon`.
- **New: Skeleton.** `import { Skeleton, SkeletonGroup } from 'bland-ui'`: a loading placeholder that holds the space of the content, so the layout doesn't jump when it arrives. `shape="text"` (default) takes the line height of the text style it stands in for (`type`, default `body-md`) with `lines` lines, the last of several 60% wide; `shape="circle"` takes Avatar's sizes (`size`, default `md`); `shape="rect"` fills its container at 16:9 until you give it a height (`radius` from the rad scale). The fill is `--surface-alpha` and pulses to `--surface-alpha-hover`, still under reduced motion. Skeletons are hidden from screen readers: wrap the loading region in `SkeletonGroup`, which sets `aria-busy` and announces "Loading" (`label`) once; set `loading={false}` when the content is in. New token `--duration-pulse` (1600ms).
- **New: Spinner.** `import { Spinner } from 'bland-ui'`: a loading indicator for a section, a card or beside a label. `type="ring"` (default) turns; `type="spokes"` stays put while its eight spokes fade in turn. `size` xs to lg are the icon sizes, `xl` 32 and `2xl` 48 for a section or a page (new tokens `--spinner-xl`, `--spinner-2xl`); without `size` it takes the icon size around it. `color` default (the text color), subtle, brand or on-color. It tells screen readers "Loading" (`label`) once; `showLabel` shows it after, before or under the spinner (`labelPlacement` end, start or bottom); `decorative` hides it inside something already marked busy. A loading Button now draws this Spinner; it looks the same.
- **New text styles** `--type-body-md-underline` and `--type-body-sm-underline` (with their line-height and letter-spacing), the underlined siblings of body-md and body-sm.
- **Breadcrumb links are Links.** Its crumbs now carry Link's classes; they look the same, except the hover underline is a fixed 1px, 2px below the text.
- Nothing to change in a project.

## 0.3.0 (2026-11-21)

- **New: Sheet.** `import { Sheet } from 'bland-ui'`: a panel that slides in from an edge of the screen over the page, for details, editing a record, filters, or a phone's navigation. `side` is `end` (default), `start` or `bottom`; `end` and `start` follow the reading direction, so in a right-to-left language the end sheet comes in from the left. `size` sm 384 / md 512 / lg 640 for side sheets; `floating` detaches it 8px from every screen edge with every corner rounded; the bottom sheet has a grab handle (`handle`) and stacked actions. It takes Modal's title, description, body, actions, `trigger`, `open` / `defaultOpen` / `onOpenChange` and `dismissable`. New tokens `--sheet-surface`, `--sheet-handle`, `--sheet-backdrop`, `--sheet-width-sm`, `-md`, `-lg`, `--sheet-height`, `--sheet-handle-width`, `--sheet-handle-height`.
- **Deprecated: Modal `top`.** Figma's Modal body now has one slot. `top` still shows above the description, with a development warning, and goes in 0.4.0. What to change: put that content in `children`; for something above the text, leave `description` out and put both in `children`.
- **Removed: Logo `children`** (deprecated in 0.2.0). What to change: a product with another name renders its own logo; Bland's `Logo` always draws "Bland".
- **Stroke buttons: lighter edges on small sizes.** The edge of a `type="stroke"` Button or Icon Button is now 1.5px on `sm` and 1px on `xs` (it was 2px at every size); `md` and `lg` keep 2px. The edge also matches Figma in hover and pressed.
- **Brand stroke hover is neutral.** A brand stroke button's hover and pressed fills are now gray (`--button-brand-stroke-hover`, `--button-brand-stroke-pressed` read `--neutral-50` / `--neutral-100`, and `--neutral-900` / `--neutral-800` in dark) instead of a light brand tint, matching its gray edge and label. Other emotions keep their tints.
- **Softer text field borders; checkbox and radio keep theirs.** `--border-input` (Text Input, Text Area, Search Input, Numeric Input Field, Dropdown, the date and time pickers, the File Upload drop zone, the chat message bar, the next-step Progress wizard marker) is now `--neutral-200` in light and `--neutral-700` in dark (it was 500 / 400), so fields read quieter. New token `--control-border` (`--neutral-500` / `--neutral-400`, the old values) for the unchecked Checkbox, Radio and the Menu multi-select box, which keep 3:1 against the page.
- Nothing to change in a project. If you used `--border-input` on your own checkbox-like control, switch it to `--control-border`.

## 0.2.1 (2026-11-20)

- **Toggle `size="xs"`.** A 32 × 16 track with a 12 knob and a body-md label, for dense layouts such as table rows and toolbars. Its track is under the 24px touch target, so keep a label beside it (the label is part of the hit area). New tokens `--toggle-track-xs`, `--toggle-height-xs`, `--toggle-knob-xs`.
- **Segmented bar `size="sm"`.** A 24 track with 20 segments, body-md labels, 12px icons and `--rad-sm` corners. New token `--segment-sm`.
- **Alert `size` and `status="neutral"`.** `size="sm"` gives body-md text and a 16 icon; `md` stays the default and looks as before. `status="neutral"` is a quiet note: the info icon and the text in `--icon-subtle` / `--text-subtle`, announced politely (`role="status"`). The new `AlertSize` type is exported.
- **See-through tint for any area.** New tokens `--surface-alpha` and `--surface-alpha-hover`: the darkest neutral at 6% and 10% in light, white at 6% and 10% in dark, so an area (a panel inside a panel, a table stripe, inline code) sits one step apart from whatever neutral surface it is on, the page, a card or a modal. Use one layer only (tints add up when nested), and not on brand or status fills. Fields keep `--surface-field`, which has the same values today but is kept separate.
- Nothing to change in a project.

## 0.2.0 (2026-11-10)

- **Logo: Bland's own logo.** `Logo` now draws the Bland logomark before the wordmark, and the wordmark is a drawing (an SVG named "Bland" for screen readers), bolder and tighter than the text it replaces. The gap between mark and wordmark is `--space-2xs` (it was `--space-sm`). New `mono` prop: the logomark takes the wordmark's color; use it with `color="on-color"` on brand fills. `mark={false}` shows the wordmark alone; your own `mark` still replaces Bland's. **Deprecated: `children`.** Text passed as `children` still shows in place of the wordmark, with a development warning, and goes in 0.3.0: a product with another name draws its own logo. What to change: if you render `<Logo>` with no `mark`, it now shows Bland's logomark; pass `mark={false}` to keep the wordmark alone.
- **Tab rows inside a scaled container.** The sliding selection of Section tabs, Pill tabs, File tabs and Segmented bar was measured in screen pixels and corrected only for CSS `zoom`, so inside anything with a `scale` transform (a card in a carousel) it sat off its tab. It is now measured against the row's own layout width, which covers zoom and scale alike. Nothing to change in a project.
- **Buttons show the hand cursor.** Button and Icon Button (and links drawn with `.bland-button`) show `cursor: pointer` on hover; disabled keeps `not-allowed`, and a loading button shows `progress`. Nothing to change in a project; drop any `cursor: pointer` you added to Bland buttons yourself.

## 0.1.3 (2026-11-03)

- **Exit motion plays in Safari and Firefox.** Menu, Dropdown, Tooltip and Modal used to vanish there when they closed. They now play their exit there too, as they already did in Chromium. Accordion now animates its height in every browser.
- **Safari fixes.** A Section tab or Segmented bar picked with a key right after a click goes straight to that tab. Before, it slid to the old tab and snapped back. A growing Text Area keeps the line you type in view.
- **Sidebar:** the full sidebar's list now sits `--space-sm` from the edges (it was `--space-lg`), so icons stay put as it collapses. Counts, trailing icons and carets fade out as it collapses. A plain `top` slot fades out too, and the rail shows the expand button in its place.
- **Renamed tokens keep their old names.** After a rename, the old name stays in `tokens.css` as an alias for one minor version (README and `docs/release.md`, "Deprecation"). No token has been renamed yet.

- **Fields stay visible on cards and modals.** New tokens `--surface-field` and `--surface-field-hover`: see-through fills (black at 6% and 10% in light, white at 6% and 10% in dark) that always land one small step from whatever is under them. Text Input, Text Area, Search, Numeric, the date and time fields, Dropdown and the chat message bar use them through their own tokens, as do Checkbox and Radio boxes, Chip counts, Section tab counts, inline code, the Code snippet language button, the File Upload drop zone and the Accordion header. In dark these no longer blend into a raised card or a modal; in light they no longer vanish on a gray page.
- **White parts lift in dark.** Chip, Pill, Code snippet, uncolored Banner and Notification, Tab bar and Progress wizard markers now use `--surface-raised`, so in dark they sit a step above the page instead of matching it.
- **Code snippet file tabs:** the selected tab takes the snippet's own fill, so in dark it runs into the code instead of showing the page color. File tabs elsewhere are unchanged.
- Light mode on a white page looks the same as before. Nothing to change in a project; if you styled your own fields with `--surface-200`, `--surface-field` is the better fit.
- **Clearer token descriptions** (in `tokens.json` and the docs): `--surface-100` is the page and what sits flat on it, `--surface-raised` anything that sits on top (cards, banners, chips), `--surface-field` small fills inside controls, `--layout-margin-desktop` a landing page's wide margin and `--layout-margin-mobile` a Modal's gap from the screen edge. No values change.

## 0.1.2 (2026-11-02)

- **Raised and sunken surfaces.** Three new tokens: `--surface-sunken` (a gray app background, a demo stage, a well), `--surface-raised` (a card on it) and `--surface-raised-hover`. Use them for a gray page with white cards: `--surface-200` under `--surface-100` mirrors in dark mode, so the page turned lighter than its cards; with these the page stays darkest and the cards lift. `--surface-200`'s description no longer suggests it for wells.
- Nothing to change in a project. No component's look changes.

## 0.1.1 (2026-11-01)

- **Fonts are swappable.** Three new tokens in `tokens.css`, named by role so any font fits: `--font-body` (Body styles, Inter), `--font-heading` (Display, Heading and Title; `var(--font-body)` until set) and `--font-code` (Code styles, Geist Mono). Every `--type-*` text style now reads one of them (`600 34px/40px var(--font-heading)`). Set them on `:root` in your `brand.css` to change every component's type, and load the font files yourself; skip `bland-ui/fonts.css` if you replace every font. The resolved styles are unchanged, so nothing changes for a project that keeps Inter and Geist Mono. See the README, "Your fonts".
- **Setting them:** write the lines in your `brand.css` (the README has the example), or copy them from the docs site's Brand theme page, whose Fonts tab tries fonts live and gives the install lines too. The `brand` command in the Bland repo (not part of the package) takes `--font-body`, `--font-heading` and `--font-code` as well.
- Nothing to change in a project.

## 0.1.0 (2026-10-30)

First release.

- **Tokens:** `tokens.css` with every Theme and scale token from Figma, light and dark (`data-theme` on any element, else `prefers-color-scheme`), 15 elevation styles as one `box-shadow` each, 23 text styles as `font` shorthands.
- **Brand override:** 13 `--brand-*` and 13 `--neutral-*` steps at `:root`, made with `npm run brand`; up to three extra project colors with light and dark roles.
- **Styles:** `fonts.css` (Inter, Geist Mono via Fontsource), `base.css` (reset, focus ring, corner smoothing, scroll fade), `styles.css` (all components).
- **Components:** Accordion, Alert, Avatar, Badge, Banner, Breadcrumb, Button, Calendar, ChatBubble, ChatListItem, ChatMessageBar, ChatNavbar, Checkbox, CheckboxGroup, Chip, CodeSnippet, CodeText, DatePicker, DateRangePicker, Dropdown, EmptyState, FileTabs, FileUpload, Icon, IconButton, Indicator, ListItem, Logo, Menu, Modal, Notification, NumericInputField, Pagination, PaginationTable, Pill, PillTabs, ProgressBar, ProgressWizard, Radio, RadioGroup, ScrollArea, SearchInput, SectionTabs, SegmentedBar, Sidebar, Slider, Table (and its parts), TabBar, TextArea, TextInput, TimePicker, Toast (Toaster, useToaster), Toggle, Tooltip.
- **Icons:** the few Bland uses itself (`CheckIcon`, `XIcon`, `CaretDownIcon`, …); any SVG works in every icon prop.
- **Requires** React 19.
