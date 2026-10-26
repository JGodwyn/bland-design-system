// The brand applied to the whole docs site from the Brand theme page: the 13 --brand-* steps set on <html>,
// where tokens.css computes the brand-colored tokens, so every page follows. Kept for the visit
// (sessionStorage) so reloading a page keeps it; Reset removes it.
import { useSyncExternalStore } from 'react';
import { STEPS, type Scale } from '../../scripts/brand/core';

const KEY = 'bland-docs-brand';
const listeners = new Set<() => void>();
let applied: Scale | null = read();

function read(): Scale | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    const scale = raw ? (JSON.parse(raw) as Scale) : null;
    return scale && STEPS.every((s) => typeof scale[s] === 'string') ? scale : null;
  } catch {
    return null;
  }
}

function paint() {
  const root = document.documentElement.style;
  for (const s of STEPS) {
    if (applied) root.setProperty(`--brand-${s}`, applied[s]);
    else root.removeProperty(`--brand-${s}`);
  }
}

export function setAppliedBrand(scale: Scale | null) {
  applied = scale;
  try {
    if (scale) sessionStorage.setItem(KEY, JSON.stringify(scale));
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

/** The scale as inline custom properties, for a preview that shows a brand before it is applied. */
export const brandStyle = (scale: Scale) => Object.fromEntries(STEPS.map((s) => [`--brand-${s}`, scale[s]]));
