// The fonts picked on the Brand theme page's Fonts tab, applied to the whole docs site: --font-body, --font-heading
// and --font-code set on <html>, where tokens.css computes every --type-* text style, so every page follows. Body and
// heading pick from six self-hosted presets, code from four monospace ones (Fontsource packages, the same files a
// project installs), so the docs site never calls a font host. A font's stylesheets load only once it is picked;
// Inter and Geist Mono are already loaded. Kept for the visit (sessionStorage) like the brand.
import { useSyncExternalStore } from 'react';
import { fontStack, type FontRole, type Fonts } from '../../scripts/brand/core';

export type FontKind = 'sans' | 'serif' | 'mono';
/** `about` is the row's alt text: sans or serif for text fonts, what a code font is known for. */
export type FontPreset = { id: string; name: string; kind: FontKind; pkg: string; about: string };

/** The six fonts the tab offers: three sans (Inter, Bland's own, first), then three serif. */
export const FONT_PRESETS: FontPreset[] = [
  { id: 'inter', name: 'Inter', kind: 'sans', pkg: 'inter', about: 'Sans' },
  { id: 'geist', name: 'Geist', kind: 'sans', pkg: 'geist', about: 'Sans' },
  { id: 'dm-sans', name: 'DM Sans', kind: 'sans', pkg: 'dm-sans', about: 'Sans' },
  { id: 'source-serif-4', name: 'Source Serif 4', kind: 'serif', pkg: 'source-serif-4', about: 'Serif' },
  { id: 'lora', name: 'Lora', kind: 'serif', pkg: 'lora', about: 'Serif' },
  { id: 'playfair-display', name: 'Playfair Display', kind: 'serif', pkg: 'playfair-display', about: 'Serif' },
];
/** The four code fonts (Godwin 2026-10-31): Geist Mono, Bland's own, first. */
export const CODE_PRESETS: FontPreset[] = [
  { id: 'geist-mono', name: 'Geist Mono', kind: 'mono', pkg: 'geist-mono', about: 'Bland’s own' },
  { id: 'jetbrains-mono', name: 'JetBrains Mono', kind: 'mono', pkg: 'jetbrains-mono', about: 'Ligatures' },
  { id: 'fira-code', name: 'Fira Code', kind: 'mono', pkg: 'fira-code', about: 'Ligatures' },
  { id: 'ibm-plex-mono', name: 'IBM Plex Mono', kind: 'mono', pkg: 'ibm-plex-mono', about: 'Plain' },
];
export const presetOf = (id?: string) => [...FONT_PRESETS, ...CODE_PRESETS].find((p) => p.id === id);
/** The presets a role picks from. */
export const presetsFor = (role: FontRole) => (role === 'code' ? CODE_PRESETS : FONT_PRESETS);
/** Bland's own font for a role: no pick means this one (heading has none: it follows the body font). */
const DEFAULTS: Partial<Record<FontRole, string>> = { body: 'inter', code: 'geist-mono' };

/** The roles the tab sets: all three. */
export type PickRole = FontRole;
export const PICK_ROLES: PickRole[] = ['body', 'heading', 'code'];
/** A preset id per role. No body pick is Inter, no code pick Geist Mono; no heading pick follows the body font. */
export type FontPicks = Partial<Record<PickRole, string>>;

/**
 * Each preset's stylesheets, one per weight Bland's text styles use (400, 500, 600; code 400 and 600). Written out so Vite sees
 * every import and splits each into its own file; the font files download only when text uses them.
 */
const LOADERS: Record<string, () => Promise<unknown>[]> = {
  geist: () => [import('@fontsource/geist/400.css'), import('@fontsource/geist/500.css'), import('@fontsource/geist/600.css')],
  'dm-sans': () => [import('@fontsource/dm-sans/400.css'), import('@fontsource/dm-sans/500.css'), import('@fontsource/dm-sans/600.css')],
  'source-serif-4': () => [import('@fontsource/source-serif-4/400.css'), import('@fontsource/source-serif-4/500.css'), import('@fontsource/source-serif-4/600.css')],
  lora: () => [import('@fontsource/lora/400.css'), import('@fontsource/lora/500.css'), import('@fontsource/lora/600.css')],
  'playfair-display': () => [import('@fontsource/playfair-display/400.css'), import('@fontsource/playfair-display/500.css'), import('@fontsource/playfair-display/600.css')],
  'jetbrains-mono': () => [import('@fontsource/jetbrains-mono/400.css'), import('@fontsource/jetbrains-mono/600.css')],
  'fira-code': () => [import('@fontsource/fira-code/400.css'), import('@fontsource/fira-code/600.css')],
  'ibm-plex-mono': () => [import('@fontsource/ibm-plex-mono/400.css'), import('@fontsource/ibm-plex-mono/600.css')],
};
const loaded = new Map<string, Promise<unknown>>();
/** Loads a preset's stylesheets once. Inter and Geist Mono are in the docs site's fonts.css already. */
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
    return Object.fromEntries(PICK_ROLES.filter((r) => presetsFor(r).some((p) => p.id === saved?.[r])).map((r) => [r, saved[r]])) as FontPicks;
  } catch {
    return {};
  }
}

/** A preset's font-family list, as the brand tool writes it: a serif falls back to serif, a sans to Bland's fallbacks. */
export const presetStack = (preset: FontPreset, role: FontRole) => fontStack(preset.kind === 'serif' ? `${preset.name}, serif` : preset.name, role);

/** The stacks the picks make, for toCss. Bland's own fonts (Inter for body, Geist Mono for code) write nothing. */
export function pickedFonts(all: FontPicks = picks): Fonts {
  const fonts: Fonts = {};
  for (const r of PICK_ROLES) if (all[r] && all[r] !== DEFAULTS[r]) fonts[r] = presetStack(presetOf(all[r])!, r);
  return fonts;
}

/**
 * The Fontsource packages a project installs for the picks, each with the weights its roles use: body 400 and 500
 * (and 600 while headings follow it), heading 600, code 400 and 600. Inter and Geist Mono are left out:
 * bland-ui/fonts.css loads them.
 */
export function fontInstalls(all: FontPicks = picks): { pkg: string; weights: number[] }[] {
  const out = new Map<string, Set<number>>();
  const add = (id: string | undefined, weights: number[]) => {
    const preset = presetOf(id);
    if (!preset || preset.id === 'inter' || preset.id === 'geist-mono') return;
    const set = out.get(preset.pkg) ?? new Set<number>();
    for (const w of weights) set.add(w);
    out.set(preset.pkg, set);
  };
  add(all.body, all.heading ? [400, 500] : [400, 500, 600]);
  add(all.heading, [600]);
  add(all.code, [400, 600]);
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
  picks = id && id !== DEFAULTS[role] ? { ...rest, [role]: id } : rest;
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

/**
 * A token's value as the page computes it now, re-read whenever the picks change: the font families and the text
 * styles built on them (`--type-*`) name the picked fonts, not only Bland's. Falls back to the value it is given.
 */
export function useLiveValue() {
  useFontPicks();
  const root = typeof document === 'undefined' ? undefined : getComputedStyle(document.documentElement);
  return (css: string, fallback: string) => root?.getPropertyValue(css).trim() || fallback;
}

if (typeof document !== 'undefined') {
  for (const r of PICK_ROLES) if (picks[r]) void loadPreset(picks[r]!);
  paint();
}
