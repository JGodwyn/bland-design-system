// The lead text of each style page: shown under its title and searched by the search dialog.
import type { StylePageId } from './data';

export const leads: Record<StylePageId, string> = {
  colors: 'Theme colors switch between Light and Dark. Components use only these tokens, never the primitives behind them. Use the theme switch to see both.',
  typography: 'Inter for interface text, Geist Mono for code. Use a text style as one value: font: var(--type-body-md).',
  spacing: 'Padding and gaps. Steps follow value order, from space-none to space-9xl.',
  radius: 'Every rounded corner is drawn with 100% corner smoothing in Figma; in code, set the radius as --bland-radius and add the bland-smooth class.',
  stroke: 'Border, icon and focus ring weights.',
  elevation: 'Each elevation is one box-shadow: a tight ambient layer and a soft key layer. Colors switch in dark mode.',
  motion: 'Durations and easings for every transition. UI motion stays at or under duration-lg; see docs/motion.md for the rules.',
  breakpoints: 'Mobile first: base styles are mobile, md starts the tablet layout and xl the desktop layout. Media queries use the pixel value; the tokens are for JavaScript.',
  grid: 'An optional page grid: columns, gutters and side margins that switch at the tablet and desktop breakpoints, the Figma grid styles in code. Add the bland-grid class and give each child a span.',
  sizing: 'Component dimensions: heights, slots, widths and icon sizes.',
  icons: 'Bland ships no icon pack: any SVG works in an icon slot. These are Bland’s own icons, exported from the Figma Icons page, used inside components.',
};
