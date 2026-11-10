// What the showcase's toolbar switches: the brand (eight presets or any color), the theme and the font. A picked
// color goes through the brand tool's own code (scripts/brand/core.ts, the same as `npm run brand -- generate
// "#hex" --neutrals subtle --fix` and the docs site's Brand theme page), so the panel shows exactly what a project's
// brand.css would give it. Nothing is drawn by hand.
import type { CSSProperties } from 'react';
import { STEPS, blandNeutrals, blandScale, check, fixScale, fontStack, generate, generateNeutrals, inherited, placeStep, type Scale } from '../../../scripts/brand/core';

export type Brand = { id: string; name: string; hex: string };

/**
 * The presets, Godwin's bright palette (2026-11-09, his reference image), in its order: lime, green, mint, blue,
 * violet, pink, red, orange, amber. The blue is Bland's own (the image's sky blue sits next to it), so the panel
 * starts on tokens.css as it ships. Each still goes through the brand tool, which darkens a step where white text or
 * the page needs it and keeps the picked color as a step.
 */
export const BRANDS: Brand[] = [
  { id: 'lime', name: 'Lime', hex: '#c8ee32' },
  { id: 'green', name: 'Green', hex: '#72f122' },
  { id: 'mint', name: 'Mint', hex: '#2fefba' },
  { id: 'bland', name: 'Bland blue', hex: '#0062ff' },
  { id: 'violet', name: 'Violet', hex: '#7845ff' },
  { id: 'pink', name: 'Pink', hex: '#f86db4' },
  { id: 'red', name: 'Red', hex: '#ff4538' },
  { id: 'orange', name: 'Orange', hex: '#ff5a1f' },
  { id: 'amber', name: 'Amber', hex: '#ffb12a' },
];

/** The panel's first brand: Bland's blue. */
export const BLAND = BRANDS.find((b) => b.id === 'bland')!;

export type Palette = { brand: Scale; neutrals: Scale };

const cache = new Map<string, Palette>();

/**
 * The 13 brand steps and the 13 neutrals for a color, with any failing pairing fixed (the picked color itself is
 * kept). Bland's own blue is tokens.css's steps, set like any other, so every card holds its own values and eases
 * them on its own (a card inheriting a transitioning value would not ease in its own turn).
 */
export function paletteFor(hex: string): Palette {
  const key = hex.toLowerCase();
  if (key === BLAND.hex) return { brand: blandScale, neutrals: blandNeutrals };
  if (!cache.has(key)) {
    const brand = generate(key);
    const neutrals = generateNeutrals(brand, 'subtle');
    const misses = check(brand, neutrals).filter((f) => !inherited(f));
    cache.set(key, { brand: misses.length ? fixScale(brand, neutrals, placeStep(key)) : brand, neutrals });
  }
  return cache.get(key)!;
}

/** The override as inline custom properties: put them on an element that also has data-theme (LEARNINGS). */
export function paletteStyle(palette: Palette): CSSProperties {
  return Object.fromEntries(STEPS.flatMap((s) => [[`--brand-${s}`, palette.brand[s]], [`--neutral-${s}`, palette.neutrals[s]]]));
}

export type Theme = 'light' | 'dark';

export type Font = { id: string; name: string; serif: boolean };

/** The fonts the font button cycles through: Bland's Inter, two more sans, three serif (the docs site's presets). */
export const FONTS: Font[] = [
  { id: 'inter', name: 'Inter', serif: false },
  { id: 'geist', name: 'Geist', serif: false },
  { id: 'dm-sans', name: 'DM Sans', serif: false },
  { id: 'source-serif-4', name: 'Source Serif 4', serif: true },
  { id: 'lora', name: 'Lora', serif: true },
  { id: 'playfair-display', name: 'Playfair Display', serif: true },
];

/**
 * Each font's stylesheets, one per weight Bland's text styles use (400, 500, 600), written out so Vite splits each
 * into its own file and the files download only when the font is picked. Inter is on the page already.
 */
const LOADERS: Record<string, () => Promise<unknown>[]> = {
  geist: () => [import('@fontsource/geist/400.css'), import('@fontsource/geist/500.css'), import('@fontsource/geist/600.css')],
  'dm-sans': () => [import('@fontsource/dm-sans/400.css'), import('@fontsource/dm-sans/500.css'), import('@fontsource/dm-sans/600.css')],
  'source-serif-4': () => [import('@fontsource/source-serif-4/400.css'), import('@fontsource/source-serif-4/500.css'), import('@fontsource/source-serif-4/600.css')],
  lora: () => [import('@fontsource/lora/400.css'), import('@fontsource/lora/500.css'), import('@fontsource/lora/600.css')],
  'playfair-display': () => [import('@fontsource/playfair-display/400.css'), import('@fontsource/playfair-display/500.css'), import('@fontsource/playfair-display/600.css')],
};
const loaded = new Map<string, Promise<unknown>>();

/** Loads a font's stylesheets once; resolves when they are in (the font files follow as text uses them). */
export function loadFont(id: string): Promise<unknown> {
  const load = LOADERS[id];
  if (!load) return Promise.resolve();
  if (!loaded.has(id)) loaded.set(id, Promise.all(load()));
  return loaded.get(id)!;
}

/**
 * The body and heading families for a font, as the brand tool writes them in brand.css. Bland's Inter sets nothing.
 * Both are set: --font-heading is var(--font-body) at :root, already resolved by the time it reaches the panel.
 */
export function fontStyle(font: Font): CSSProperties {
  if (font.id === 'inter') return {};
  const value = font.serif ? `${font.name}, serif` : font.name;
  return { '--font-body': fontStack(value, 'body'), '--font-heading': fontStack(value, 'heading') } as CSSProperties;
}

/** What one card shows: the toolbar's settings reach each card in turn (the change wave). */
export type Look = { hex: string; theme: Theme; font: Font };
