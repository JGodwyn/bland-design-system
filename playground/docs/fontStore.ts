// The fonts picked on the Brand theme page's Fonts tab, applied to the whole docs site: --font-body and
// --font-heading set on <html>, where tokens.css computes every --type-* text style, so every page follows. The
// choice is one of six self-hosted presets (Fontsource packages, the same files a project installs), so the docs
// site never calls a font host. A font's stylesheets load only once it is picked; Inter is already loaded. Code
// stays Geist Mono. Kept for the visit (sessionStorage) like the brand.
import { useSyncExternalStore } from 'react';
import { fontStack, type FontRole, type Fonts } from '../../scripts/brand/core';

export type FontKind = 'sans' | 'serif';
export type FontPreset = { id: string; name: string; kind: FontKind; pkg: string };

/** The six fonts the tab offers: three sans (Inter, Bland's own, first), then three serif. */
export const FONT_PRESETS: FontPreset[] = [
  { id: 'inter', name: 'Inter', kind: 'sans', pkg: 'inter' },
  { id: 'geist', name: 'Geist', kind: 'sans', pkg: 'geist' },
  { id: 'dm-sans', name: 'DM Sans', kind: 'sans', pkg: 'dm-sans' },
  { id: 'source-serif-4', name: 'Source Serif 4', kind: 'serif', pkg: 'source-serif-4' },
  { id: 'lora', name: 'Lora', kind: 'serif', pkg: 'lora' },
  { id: 'playfair-display', name: 'Playfair Display', kind: 'serif', pkg: 'playfair-display' },
];
export const presetOf = (id?: string) => FONT_PRESETS.find((p) => p.id === id);

/** The roles the tab sets. Code stays Geist Mono. */
export type PickRole = Extract<FontRole, 'body' | 'heading'>;
export const PICK_ROLES: PickRole[] = ['body', 'heading'];
/** A preset id per role. No body pick is Inter; no heading pick follows the body font. */
export type FontPicks = Partial<Record<PickRole, string>>;

/**
 * Each preset's stylesheets, one per weight Bland's text styles use (400, 500, 600). Written out so Vite sees
 * every import and splits each into its own file; the font files download only when text uses them.
 */
const LOADERS: Record<string, () => Promise<unknown>[]> = {
  geist: () => [import('@fontsource/geist/400.css'), import('@fontsource/geist/500.css'), import('@fontsource/geist/600.css')],
  'dm-sans': () => [import('@fontsource/dm-sans/400.css'), import('@fontsource/dm-sans/500.css'), import('@fontsource/dm-sans/600.css')],
  'source-serif-4': () => [import('@fontsource/source-serif-4/400.css'), import('@fontsource/source-serif-4/500.css'), import('@fontsource/source-serif-4/600.css')],
  lora: () => [import('@fontsource/lora/400.css'), import('@fontsource/lora/500.css'), import('@fontsource/lora/600.css')],
  'playfair-display': () => [import('@fontsource/playfair-display/400.css'), import('@fontsource/playfair-display/500.css'), import('@fontsource/playfair-display/600.css')],
};
const loaded = new Map<string, Promise<unknown>>();
/** Loads a preset's stylesheets once. Inter is in the docs site's fonts.css already. */
export function loadPreset(id: string) {
  const load = LOADERS[id];
  if (!load) return Promise.resolve();
  if (!loaded.has(id)) loaded.set(id, Promise.all(load()));
  return loaded.get(id)!;
}

const KEY = 'bland-docs-fonts';
const listeners = new Set<() => void>();
let picks: FontPicks = read();
const NONE: FontPicks = {};

function read(): FontPicks {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
    return Object.fromEntries(PICK_ROLES.filter((r) => typeof saved?.[r] === 'string' && presetOf(saved[r] as string)).map((r) => [r, saved[r]])) as FontPicks;
  } catch {
    return {};
  }
}

/** A preset's font-family list, as the brand tool writes it: a serif falls back to serif, a sans to Bland's fallbacks. */
export const presetStack = (preset: FontPreset, role: FontRole) => fontStack(preset.kind === 'serif' ? `${preset.name}, serif` : preset.name, role);

/** The stacks the picks make, for toCss. Inter as the body font is Bland's own, so it writes nothing. */
export function pickedFonts(all: FontPicks = picks): Fonts {
  const fonts: Fonts = {};
  if (all.body && all.body !== 'inter') fonts.body = presetStack(presetOf(all.body)!, 'body');
  if (all.heading) fonts.heading = presetStack(presetOf(all.heading)!, 'heading');
  return fonts;
}

/**
 * The Fontsource packages a project installs for the picks, each with the weights its roles use: body 400 and 500
 * (and 600 while headings follow it), heading 600. Inter is left out: bland-ui/fonts.css loads it.
 */
export function fontInstalls(all: FontPicks = picks): { pkg: string; weights: number[] }[] {
  const out = new Map<string, Set<number>>();
  const add = (id: string | undefined, weights: number[]) => {
    const preset = presetOf(id);
    if (!preset || preset.id === 'inter') return;
    const set = out.get(preset.pkg) ?? new Set<number>();
    for (const w of weights) set.add(w);
    out.set(preset.pkg, set);
  };
  add(all.body, all.heading ? [400, 500] : [400, 500, 600]);
  add(all.heading, [600]);
  return [...out].map(([pkg, w]) => ({ pkg, weights: [...w].sort((a, b) => a - b) }));
}

function paint() {
  const root = document.documentElement.style;
  const fonts = pickedFonts();
  for (const r of PICK_ROLES) {
    if (fonts[r]) root.setProperty(`--font-${r}`, fonts[r]!);
    else root.removeProperty(`--font-${r}`);
  }
}

export function setFontPick(role: PickRole, id: string | null) {
  const { [role]: _, ...rest } = picks;
  picks = id && !(role === 'body' && id === 'inter') ? { ...rest, [role]: id } : rest;
  try {
    if (Object.keys(picks).length) sessionStorage.setItem(KEY, JSON.stringify(picks));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* Private mode: they last until the page reloads. */
  }
  if (id) void loadPreset(id);
  paint();
  for (const on of listeners) on();
}

export const resetFonts = () => PICK_ROLES.forEach((r) => setFontPick(r, null));

export function useFontPicks() {
  return useSyncExternalStore(
    (on) => {
      listeners.add(on);
      return () => listeners.delete(on);
    },
    () => picks,
    () => NONE,
  );
}

if (typeof document !== 'undefined') {
  for (const r of PICK_ROLES) if (picks[r]) void loadPreset(picks[r]!);
  paint();
}
