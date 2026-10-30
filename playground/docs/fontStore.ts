// The fonts tried on the Brand theme page's Fonts tab, applied to the whole docs site: --font-body, --font-heading
// and --font-code set on <html>, where tokens.css computes every --type-* text style, so every page follows. A
// font comes from the viewer's computer, from Google Fonts (its stylesheet added to the page) or from a file
// (FontFace, kept in this tab only). Kept for the visit (sessionStorage) like the brand; an uploaded file can't be
// kept, so after a reload its name stays and the page asks for the file again.
import { useSyncExternalStore } from 'react';
import { FONT_ROLES, fontStack, type FontRole, type Fonts } from '../../scripts/brand/core';

export type FontSource = 'local' | 'google' | 'file';
/** One role's font: the family as typed (or taken from a file name), where it comes from, and the file it came from. */
export type FontPick = { family: string; source: FontSource; file?: string };
export type FontPicks = Partial<Record<FontRole, FontPick>>;

const KEY = 'bland-docs-fonts';
const listeners = new Set<() => void>();
/** Families loaded from files in this tab: lost on reload, since a file can't be kept in sessionStorage. */
const loadedFiles = new Set<string>();
const isPick = (p: unknown): p is FontPick =>
  !!p && typeof (p as FontPick).family === 'string' && ['local', 'google', 'file'].includes((p as FontPick).source);
let picks: FontPicks = read();
const NONE: FontPicks = {};

function read(): FontPicks {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as Record<string, unknown>;
    return Object.fromEntries(FONT_ROLES.filter((r) => isPick(saved?.[r])).map((r) => [r, saved[r]])) as FontPicks;
  } catch {
    return {};
  }
}

/** The family's first name, unquoted: the one a check or a font host looks for. */
export const firstFamily = (family: string) => family.split(',')[0]!.trim().replace(/^(["'])(.*)\1$/, '$2').trim();

/** The stacks the picks make, as the brand tool writes them. A heading without a pick follows the body font. */
export function pickedFonts(all: FontPicks = picks): Fonts {
  return Object.fromEntries(FONT_ROLES.filter((r) => all[r]).map((r) => [r, fontStack(all[r]!.family, r)])) as Fonts;
}

function paint() {
  const root = document.documentElement.style;
  const fonts = pickedFonts();
  for (const r of FONT_ROLES) {
    if (fonts[r]) root.setProperty(`--font-${r}`, fonts[r]!);
    else root.removeProperty(`--font-${r}`);
  }
}

export function setFontPick(role: FontRole, pick: FontPick | null) {
  const { [role]: _, ...rest } = picks;
  picks = pick ? { ...rest, [role]: pick } : rest;
  try {
    if (Object.keys(picks).length) sessionStorage.setItem(KEY, JSON.stringify(picks));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* Private mode: they last until the page reloads. */
  }
  paint();
  for (const on of listeners) on();
}

export const resetFonts = () => FONT_ROLES.forEach((r) => setFontPick(r, null));

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

/** True while a file pick's font is loaded in this tab (false after a reload: the file needs adding again). */
export const fileLoaded = (family: string) => loadedFiles.has(family);

// ---------- checking a font ----------

const SAMPLE = 'mmmmmmmmmmlli1WQ@#';
const BASES = ['monospace', 'sans-serif', 'serif'];

/**
 * Whether a family renders: text in it is measured against each generic family alone, and any difference means a
 * real font drew it (a missing one falls back to the generic and measures the same). document.fonts.check can't
 * tell: it says true for any family it has no faces for. Loads the family's faces first, if the page has any.
 */
export async function fontRenders(family: string): Promise<boolean> {
  const name = firstFamily(family).replace(/"/g, '\\"');
  try {
    await document.fonts.load(`16px "${name}"`, SAMPLE);
  } catch {
    /* Not a valid font: it is measured as missing. */
  }
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return true;
  return BASES.some((base) => {
    ctx.font = `72px ${base}`;
    const fallback = ctx.measureText(SAMPLE).width;
    ctx.font = `72px "${name}", ${base}`;
    return ctx.measureText(SAMPLE).width !== fallback;
  });
}

// ---------- Google Fonts ----------

/**
 * The weights each role's text styles use: body 400 and 500, headings 600, code 400 and 600. A body font also
 * carries 600 while headings follow it, since headings then draw in it.
 */
export const roleWeights = (role: FontRole, headingFollowsBody = false) =>
  role === 'body' ? (headingFollowsBody ? [400, 500, 600] : [400, 500]) : role === 'heading' ? [600] : [400, 600];

const family = (name: string, weights?: number[]) => `family=${encodeURIComponent(name).replace(/%20/g, '+')}${weights ? `:wght@${weights.join(';')}` : ''}`;
/** A Google Fonts stylesheet URL for families and their weights (no weights: the font's default). */
export const googleHref = (families: { name: string; weights?: number[] }[]) =>
  `https://fonts.googleapis.com/css2?${families.map((f) => family(f.name, f.weights)).join('&')}&display=swap`;

/** The Google families the picks use, with the weights a project loads (merged when two roles share one). */
export function googleFamilies(all: FontPicks): { name: string; weights: number[] }[] {
  const out = new Map<string, Set<number>>();
  for (const r of FONT_ROLES) {
    const p = all[r];
    if (p?.source !== 'google') continue;
    const name = firstFamily(p.family);
    const weights = out.get(name) ?? new Set<number>();
    for (const w of roleWeights(r, !all.heading)) weights.add(w);
    out.set(name, weights);
  }
  return [...out].map(([name, w]) => ({ name, weights: [...w].sort((a, b) => a - b) }));
}

export type GoogleResult = { ok: true; allWeights: boolean } | { ok: false; reason: 'missing' | 'offline' };
const googleLoaded = new Map<string, Promise<GoogleResult>>();

/**
 * Adds a Google font's stylesheet to the page and waits for its faces. Asks for every weight Bland's text styles
 * use; a font without one of them makes Google refuse the whole request, so it asks again for the font's default.
 * The stylesheet is fetched (not a <link>), so a failure can be told apart from a font that isn't there.
 */
export function loadGoogleFont(name: string): Promise<GoogleResult> {
  const known = googleLoaded.get(name);
  if (known) return known;
  const load = (async (): Promise<GoogleResult> => {
    let css: string | undefined;
    let allWeights = true;
    for (const weights of [[400, 500, 600], undefined]) {
      let response: Response;
      try {
        response = await fetch(googleHref([{ name, weights }]));
      } catch {
        return { ok: false, reason: 'offline' };
      }
      if (response.ok) {
        css = await response.text();
        break;
      }
      allWeights = false;
    }
    if (!css || !css.includes('@font-face')) return { ok: false, reason: 'missing' };
    const style = document.createElement('style');
    style.dataset.docsFont = name;
    style.textContent = css;
    document.head.append(style);
    const faces = await document.fonts.load(`16px "${name.replace(/"/g, '\\"')}"`, SAMPLE).catch(() => []);
    if (!faces.length) {
      style.remove();
      return { ok: false, reason: 'missing' };
    }
    return { ok: true, allWeights };
  })();
  googleLoaded.set(name, load);
  // A failure is not kept: the next try asks again (the connection may be back).
  load.then((r) => !r.ok && googleLoaded.delete(name));
  return load;
}

// ---------- font files ----------

export const FONT_FILE_TYPES = '.woff2,.woff,.otf,.ttf';
const WEIGHTS: [RegExp, string][] = [
  [/thin|hairline/, '100'],
  [/extra-?light|ultra-?light/, '200'],
  [/light/, '300'],
  [/medium/, '500'],
  [/semi-?bold|demi-?bold/, '600'],
  [/extra-?bold|ultra-?bold/, '800'],
  [/bold/, '700'],
  [/black|heavy/, '900'],
];
const STYLE_WORDS = new Set(['thin', 'hairline', 'extra', 'ultra', 'light', 'extralight', 'ultralight', 'regular', 'book', 'normal', 'medium', 'semi', 'demi', 'semibold', 'demibold', 'extrabold', 'ultrabold', 'bold', 'black', 'heavy', 'italic', 'oblique', 'variable']);

/**
 * The family, weight and style a font file's name gives ("Lora-SemiBoldItalic.woff2": Lora, 600, italic; a
 * variable font, "Lora[wght].ttf" or "Lora-VariableFont_wght.ttf", covers every weight). The file's own name
 * table is not read: a .woff2 is Brotli-compressed, and the browser has no Brotli decoder to call.
 */
export function fontFileFace(fileName: string): { family: string; weight: string; style: string } {
  const base = fileName.replace(/\.(woff2?|otf|ttf)$/i, '');
  const lower = base.toLowerCase();
  const variable = /variable|\[/.test(lower);
  const words = base
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[-_ ]?variable[-_ ]?font.*$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[-_\s]+/)
    .filter(Boolean);
  // Style words and weight numbers come off the end, whole words only, and never the last one left ("Ultra" is a family).
  while (words.length > 1 && (STYLE_WORDS.has(words.at(-1)!.toLowerCase()) || /^\d+$/.test(words.at(-1)!))) words.pop();
  const weight = variable ? '100 900' : (lower.match(/(?<!\d)[1-9]00(?!\d)/)?.[0] ?? WEIGHTS.find(([re]) => re.test(lower))?.[1] ?? '400');
  return { family: words.join(' ') || base, weight, style: /italic|oblique/.test(lower) ? 'italic' : 'normal' };
}

/** Loads font files into the page under the family their names give (the first file's family names them all). */
export async function loadFontFiles(files: File[]): Promise<string> {
  const family = fontFileFace(files[0]!.name).family;
  for (const file of files) {
    const { weight, style } = fontFileFace(file.name);
    const face = new FontFace(family, await file.arrayBuffer(), { weight, style });
    await face.load();
    document.fonts.add(face);
  }
  loadedFiles.add(family);
  return family;
}

if (typeof document !== 'undefined') {
  paint();
  // A Google pick comes back on reload: its stylesheet is added again.
  for (const r of FONT_ROLES) if (picks[r]?.source === 'google') void loadGoogleFont(firstFamily(picks[r]!.family));
}
