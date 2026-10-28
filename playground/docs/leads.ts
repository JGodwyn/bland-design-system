// The lead text of each style page: shown under its title and searched by the search dialog. Backticks mark code (see Prose).
import type { StylePageId } from './data';

export const leads: Record<StylePageId, string> = {
  colors: 'Every color has a light and a dark value and switches with the theme. Components use these tokens only, never the color steps behind them. Switch the theme to see both.',
  typography: 'Inter for interface text, Geist Mono for code. Set a text style as one value, `font: var(--type-body-md)`, with its letter spacing beside it.',
  spacing: 'Padding and gaps, from `--space-none` (0) to `--space-9xl` (256).',
  radius: 'Corner sizes. Every rounded corner in Bland is smoothed: set the radius as `--bland-radius` and add the `bland-smooth` class.',
  stroke: 'Weights for borders, icons and focus rings.',
  elevation: 'Shadows that lift a surface off the page. Each is one `box-shadow` value, and its color follows the theme.',
  motion: 'Durations and easings for transitions. Keep interface motion at `--duration-lg` (250ms) or shorter.',
  breakpoints: 'Screen widths where the layout changes. Styles start at mobile; `md` (768) starts the tablet layout and `xl` (1280) the desktop layout. Media queries use the pixel value; the tokens are for JavaScript.',
  grid: 'An optional page grid: columns, gutters and side margins that change at the tablet and desktop breakpoints. Add the `bland-grid` class and give each child a span.',
  sizing: 'Fixed sizes inside components: heights, slots, widths and icon sizes.',
  icons: 'Bland ships no icon pack: any SVG works in an icon slot. These are the few icons Bland’s components use themselves.',
};
