# Using Bland's components

Props for every component are in `components.md`, generated from the package. This file is about choosing and combining them.

## Which component

| You need | Use |
| --- | --- |
| An action | `Button` (`emotion` brand, neutral, danger, success, warning; `type` primary, secondary, ghost, stroke); `IconButton` when there is no label |
| A text link | `Link` |
| A field | `TextInput`, `TextArea`, `SearchInput`, `NumericInputField` (codes), `Dropdown` (basic, filterable, multi-select), `DatePicker`, `DateRangePicker`, `TimePicker`, `Slider`, `FileUpload` |
| On/off that applies at once | `Toggle`; in a form people submit, `Checkbox` |
| One of a few | `RadioGroup`, `SegmentedBar`, or `PillTabs` / `Pill` for filters |
| A list of actions from a button | `Menu` |
| A small panel of content beside a button (profile, Share, a few filters) | `Popover` (not modal) |
| A decision that needs an answer | `Modal` |
| A panel from a screen edge (details, editing, filters, phone navigation) | `Sheet` |
| A hint on hover or focus | `Tooltip` (text only, nothing clickable inside) |
| Feedback tied to a field | `Alert` (`status`, `size`; `neutral` for a quiet note) |
| A message about a page or section | `Banner` |
| Feedback after an action | `Toast` (through `useToaster`) or `Notification` |
| Loading with a known layout | `Skeleton` inside a `SkeletonGroup` |
| Loading with no known layout or length | `Spinner` |
| Known progress | `ProgressBar`; steps of a flow, `ProgressWizard` |
| Navigation | `Sidebar` (desktop), `TabBar` (phone), `Breadcrumb`, `SectionTabs`, `Pagination` |
| Content switching | `SectionTabs`, `PillTabs`, `FileTabs`, `SegmentedBar`, `Accordion` |
| Data | `Table` and its parts, `ListItem`, `PaginationTable` |
| People and status | `Avatar`, `Badge`, `Indicator`, `Chip` |
| Nothing to show | `EmptyState` |
| Code | `CodeSnippet`, `CodeText` |
| Chat | `ChatBubble`, `ChatListItem`, `ChatNavbar`, `ChatMessageBar` |
| A scrolling area | `ScrollArea` |
| An icon from your icon set | `Icon` wraps it at Bland's sizes |
| The Bland logo itself | `Logo` (not for a project's own name: a project with another name draws its own logo) |

## Rules per component

- **Variants are props** (`size`, `emotion`, `type`, `status`). Defaults are usually sm or md; check `components.md`. Never restyle a component's internals with class overrides.
- **Button**: `type` is the visual type; the native button type is `htmlType` (default `button`, so it never submits a form by accident). `loading` keeps the label and ignores clicks. `xs` is below the comfortable touch target.
- **Icons**: pass any SVG node to `icon`, `iconStart`, `iconEnd`, `leading` and the like; Bland sizes and colors it. Icons beside a label are decorative. Icon-only controls (`IconButton`, a Badge with only an icon) need `aria-label`.
- **Link**: inside running text leave `size` off (it takes the text's font) and keep `underline="always"`. A link on its own gets a `size` and may use `underline="hover"`. `color="inherit"` for footers, legal text and brand fills. `target="_blank"` adds the external mark and a screen reader hint by itself.
- **Routers**: Link, Breadcrumb, TabBar, Sidebar, Pagination, ListItem and Logo take `renderLink` to render the project's router link (keep the `className` it passes).
- **Modal, Sheet, Popover** share their parts: `title`, `description`, `children` (the one body slot) and `actions` (primary first; a function gets `close`). Pass the opener as `trigger`, or control them with `open` / `defaultOpen` / `onOpenChange`. Modal's `top` is deprecated: put that content in `children`. Popover's title and actions are off until passed; use sm Buttons in its `actions`.
- **Sheet**: `side="end"` (default), `"start"` or `"bottom"`; `end` and `start` follow the reading direction. `floating` detaches it from the screen edges. Use Modal instead for a decision.
- **Forms**: every field takes `label` and `helperText`, and `status` (danger sets `aria-invalid`). Without a visible label, give an `aria-label`. Link an Alert to its field with `aria-describedby`.
- **Toggle**: name the setting, not the action ("Notifications"). `size="xs"` is under the touch target: dense layouts only, with a label beside it.
- **Skeleton**: one `SkeletonGroup` per loading region carries `aria-busy` and the single "Loading" announcement; skeletons inside it are silent. `type` is the text style the real text uses, `shape="circle"` with the Avatar's `size`, `shape="rect"` with the image's height. Set `loading={false}` on the group and render the content when it arrives. Never put `aria-busy` or a Loading text on each skeleton.
- **Spinner**: give `label` saying what is loading (`showLabel` to show it). `decorative` inside a loading Button or an `aria-busy` region.
- **Tooltip**: wraps one focusable element that forwards `ref` (every Bland control does). Keep its content non-interactive.
- **Table**: give it `aria-label` or `aria-labelledby`. It scrolls sideways inside itself when its columns don't fit.
- **Sidebar**: the minimized rail opens over the page, past its own box, so no ancestor may clip it (`overflow: hidden`) narrower than `--sidebar-width`. For a product logo in the rail, pass `top` as `({ rail }) => (rail ? <Mark /> : <Logo />)`. No phone layout: hide it there and use `TabBar`.
- **ChatBubble audio**: the project owns the `<audio>` element and its playback; the bubble only draws it (`playing`, `onPlayingChange`, `progress`, `duration`).
- **Copy buttons** (CodeSnippet, CodeText) work on plain-http pages too.
- **Disabled** is the native `disabled` prop, drawn with the disabled tokens.

## Accessibility you get, and what you still give

Bland handles keyboard behaviour, focus, roles and screen reader names inside its components (React Aria where needed). You still give: visible labels or `aria-label`s, `aria-label` on icon-only controls, a heading level that fits the page (`titleAs`), `alt` on images, and `aria-describedby` from a field to its Alert.
