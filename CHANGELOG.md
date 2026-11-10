# Changelog

Bland follows [semantic versioning](https://semver.org). Until 1.0, a minor version (0.2.0) may change an API or a token name; a patch (0.1.1) never does. Each entry says what a project has to change, if anything.

## 0.2.0 (2026-11-10)

- **Logo: Bland's own logo.** `Logo` now draws the Bland logomark before the wordmark, and the wordmark is a drawing (an SVG named "Bland" for screen readers), bolder and tighter than the text it replaces. The gap between mark and wordmark is `--space-2xs` (it was `--space-sm`). New `mono` prop: the logomark takes the wordmark's color; use it with `color="on-color"` on brand fills. `mark={false}` shows the wordmark alone; your own `mark` still replaces Bland's. **Deprecated: `children`.** Text passed as `children` still shows in place of the wordmark, with a development warning, and goes in 0.3.0: a product with another name draws its own logo. What to change: if you render `<Logo>` with no `mark`, it now shows Bland's logomark; pass `mark={false}` to keep the wordmark alone.- **Tab rows inside a scaled container.** The sliding selection of Section tabs, Pill tabs, File tabs and Segmented bar was measured in screen pixels and corrected only for CSS `zoom`, so inside anything with a `scale` transform (a card in a carousel) it sat off its tab. It is now measured against the row's own layout width, which covers zoom and scale alike. Nothing to change in a project.
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
