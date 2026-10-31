# Changelog

Bland follows [semantic versioning](https://semver.org). Until 1.0, a minor version (0.2.0) may change an API or a token name; a patch (0.1.1) never does. Each entry says what a project has to change, if anything.

## 0.1.1 (2026-10-31)

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
