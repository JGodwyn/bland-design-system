import { platform, type Placement, type Platform } from '@floating-ui/react-dom';

// Shared by every Floating UI overlay (Tooltip, Menu, Dropdown): tokens read at run time, and CSS `zoom` handled.

/** The CSS `zoom` an element renders at, its own and its ancestors' (1 where the browser has no currentCSSZoom). */
export const zoomOf = (el: Element) => (el as Element & { currentCSSZoom?: number }).currentCSSZoom ?? 1;

/**
 * A length token in screen px, read where the overlay sits (0 if tokens.css is not loaded). Under a CSS `zoom`
 * (the docs' zoom control, or an app's) a token's 4px draws as 4 x zoom, and Floating UI works in screen px.
 */
export function tokenPx(el: Element, token: string) {
  return (parseFloat(getComputedStyle(el).getPropertyValue(token)) || 0) * zoomOf(el);
}

/**
 * Floating UI under CSS `zoom`: the reference's rect comes back in screen px, but the overlay's size in its own
 * unzoomed px. Scale it to screen px; the render divides the results back by the zoom, because `left` and `top`
 * are drawn zoomed again.
 */
export const zoomAwarePlatform: Platform = {
  ...platform,
  getDimensions: async (el) => {
    const size = await platform.getDimensions(el);
    const zoom = zoomOf(el);
    return { width: size.width * zoom, height: size.height * zoom };
  },
};

/** A Motion token in ms, read from the root where tokens.css defines it (undefined if it is not loaded). */
export function tokenMs(token: string) {
  if (typeof document === 'undefined') return undefined;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return undefined;
  return raw.endsWith('ms') ? value : value * 1000;
}

export type Side = 'top' | 'right' | 'bottom' | 'left';

export const sideOf = (placement: Placement) => placement.split('-')[0] as Side;
