# Landing page copy

Draft copy for the public landing page at `/` (Godwin designs it in Figma; `docs/release.md`, "Hosting"). Section by section, top to bottom. Where a line has options, the first is the pick.

Voice: short, plain, a little dry. The name is a joke Bland is in on: the system is neutral so a project's brand is what people see. Say what it does in words a project's designer understands; no token jargon above the install section. No em dashes.

## Nav

- Logo: Bland
- Links: Docs · Components · Brand theme · GitHub
- Button: Get started (to `/docs/`)

## Hero

**Headline**

1. Bland on purpose.
2. Boring by design. Yours in one color.
3. The design system that stays out of your brand's way.

**Subhead**

A React design system that looks like nothing until you give it a color. Pick one, and every button, field and chart follows, in light and dark.

**Buttons**

- Primary: Get started
- Secondary: Try your color (to the Brand theme page)

**Under the buttons, small**

`npm install bland-ui` · MIT · Free

## Proof strip

Four short facts in a row:

- Over 45 components
- Light and dark, built in
- One color to rebrand
- Keyboard and screen reader tested

## Your brand, in one color

**Heading:** One color in. A whole theme out.

**Body:** Bland ships blue so it has something to show. Give it your brand color and it works out the other twelve shades, tints the grays toward it, and checks the contrast for you. Your fonts too.

**Three steps**

1. **Pick your color.** Any hex. It never moves.
2. **Check it.** See every pairing in light and dark, and fix the ones that fail with one tap.
3. **Copy the CSS.** One file, loaded last. Done.

**Link:** Open the Brand theme page

## What you get

Six cards, heading plus one line each:

- **Every part a project needs.** Buttons and fields, menus and modals, tables and date pickers, chat and file upload.
- **Dark mode that thinks.** Not an inverted page: surfaces, shadows and colors each have a dark version made for it.
- **Works for everyone.** Keyboard, focus and screen reader behaviour from React Aria, checked in Chromium, WebKit and Firefox.
- **Motion with manners.** Quick, quiet animations that step aside when someone asks for reduced motion.
- **Nothing hardcoded.** Every color, size and space comes from a token, so a rebrand never touches component code.
- **Your icons.** Bring Phosphor, Lucide or your own SVGs. Bland sizes and colors them.

## Components showcase

**Heading:** Plain until it's yours.

**Body:** The same components, three brands. Switch the color and watch them follow.

(Design note: a live strip of components with three or four brand swatches to tap, and a light/dark switch.)

**Link:** Browse all components

## Built for the details

**Heading:** The small things, done once.

**Body:** Corner smoothing on every curve. Scroll areas that fade where content hides. Text that lines up with its icon whether it takes one line or three. Tooltips that wait before they show. The details you'd fix on every project, already fixed.

## From Figma to code

**Heading:** Designed in Figma. Shipped in React.

**Body:** Every component starts in the Figma kit and lands in code with the same names, sizes and states. When a token changes in Figma, code catches up in one sync.

**Kit card** (beside the body, a mock of the Figma file: a frame of components with the layers panel showing)

- Eyebrow: Figma kit
- Title: The whole system, in Figma.
- Line: Every component, variant and token, with light and dark modes. Duplicate it and design with the same parts you'll ship.
- Three facts, small: Variables for every token · Light and dark modes · Same names as the code
- Button: Get the Figma kit (to the Community file)

**Until the file is public** (swap these in for the button and line above)

- Button, disabled: Figma kit coming soon
- Line: The Figma file goes public soon. The code is ready today.

(The Figma file will be public soon, Godwin 2026-11-03. Point the button at the Community link once it's live.)

## Get started

**Heading:** Up and running in a minute.

```bash
npm install bland-ui
```

```tsx
import 'bland-ui/tokens.css';
import 'bland-ui/styles.css';
import { Button } from 'bland-ui';

<Button emotion="brand" type="primary">Ship it</Button>
```

**Small print:** React 19. Plain CSS, no Tailwind needed. Tokens work without React too.

**Button:** Read the docs

## Closing band

**Heading:** Start bland. End up yours.

**Button:** Get started

## Footer

- Bland, made by Godwin.
- Links: Docs · GitHub · npm · Changelog
- MIT license

## Small copy

- Page title: Bland, a design system that wears your brand
- Meta description: A React design system for light and dark that takes on your brand from one color. Over 45 accessible components, all built on tokens.
- Social card: Bland on purpose. Yours in one color.
