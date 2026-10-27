# Changelog

Bland follows [semantic versioning](https://semver.org). Until 1.0, a minor version (0.2.0) may change an API or a token name; a patch (0.1.1) never does. Each entry says what a project has to change, if anything.

## 0.1.0 (unreleased)

First release.

- **Tokens:** `tokens.css` with every Theme and scale token from Figma, light and dark (`data-theme` on any element, else `prefers-color-scheme`), 15 elevation styles as one `box-shadow` each, 23 text styles as `font` shorthands.
- **Brand override:** 13 `--brand-*` and 13 `--neutral-*` steps at `:root`, made with `npm run brand`; up to three extra project colors with light and dark roles.
- **Styles:** `fonts.css` (Inter, Geist Mono via Fontsource), `base.css` (reset, focus ring, corner smoothing, scroll fade), `styles.css` (all components).
- **Components:** Accordion, Alert, Avatar, Badge, Banner, Breadcrumb, Button, Calendar, ChatBubble, ChatListItem, ChatMessageBar, ChatNavbar, Checkbox, CheckboxGroup, Chip, CodeSnippet, CodeText, DatePicker, DateRangePicker, Dropdown, EmptyState, FileTabs, FileUpload, Icon, IconButton, Indicator, ListItem, Logo, Menu, Modal, Notification, NumericInputField, Pagination, PaginationTable, Pill, PillTabs, ProgressBar, ProgressWizard, Radio, RadioGroup, ScrollArea, SearchInput, SectionTabs, SegmentedBar, Sidebar, Slider, Table (and its parts), TabBar, TextArea, TextInput, TimePicker, Toast (Toaster, useToaster), Toggle, Tooltip.
- **Icons:** the few Bland uses itself (`CheckIcon`, `XIcon`, `CaretDownIcon`, …); any SVG works in every icon prop.
- **Requires** React 19.
