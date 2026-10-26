// The brand applied to the whole docs site from the Brand theme page: the 13 --brand-* and 13 --neutral-* steps
// set on <html>, where tokens.css computes the brand-colored and neutral tokens, so every page follows. Kept for
// the visit (sessionStorage) so reloading a page keeps it; Reset removes it.
import { useSyncExternalStore } from 'react';
import { blandNeutrals, STEPS, type Scale } from '../../scripts/brand/core';

/** A project's colors: its brand steps, the neutral steps that go with them, and the color they were made from. */
export type Palette = { brand: Scale; neutrals: Scale; color?: string };

const KEY = 'bland-docs-brand';
const listeners = new Set<() => void>();
const isScale = (s: unknown): s is Scale => !!s && STEPS.every((step) => typeof (s as Scale)[step] === 'string');
// After isScale: read() uses it, and a const read before its line throws (caught, so the brand was silently lost).
let applied: Palette | null = read();

function read(): Palette | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const saved = raw ? (JSON.parse(raw) as Partial<Palette>) : null;
    if (!saved || !isScale(saved.brand)) return null;
    return { brand: saved.brand, neutrals: isScale(saved.neutrals) ? saved.neutrals : blandNeutrals, color: typeof saved.color === 'string' ? saved.color : undefined };
  } catch {
    return null;
  }
}

function paint() {
  const root = document.documentElement.style;
  for (const s of STEPS) {
    for (const [name, scale] of [['brand', applied?.brand], ['neutral', applied?.neutrals]] as const) {
      if (scale) root.setProperty(`--${name}-${s}`, scale[s]);
      else root.removeProperty(`--${name}-${s}`);
    }
  }
}

export function setAppliedBrand(palette: Palette | null) {
  applied = palette;
  try {
    if (palette) sessionStorage.setItem(KEY, JSON.stringify(palette));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* Private mode: it lasts until the page reloads. */
  }
  paint();
  for (const on of listeners) on();
}

if (typeof document !== 'undefined') paint();

export function useAppliedBrand() {
  return useSyncExternalStore(
    (on) => {
      listeners.add(on);
      return () => listeners.delete(on);
    },
    () => applied,
    () => null,
  );
}

/** The palette as inline custom properties, for a preview that shows it before it is applied. */
export const paletteStyle = ({ brand, neutrals }: Palette) =>
  Object.fromEntries(STEPS.flatMap((s) => [[`--brand-${s}`, brand[s]], [`--neutral-${s}`, neutrals[s]]]));
