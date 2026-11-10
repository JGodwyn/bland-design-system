// The hero's scroll story helpers: fractions of the hero track scrolled (0 at the top, 1 when the stage lets go).
// Figma states: 7082:35309 (headline half outlined, "React design system" lit), 7086:35405 (color.),
// 7087:35771 (button, field, chart), 7087:35948 (light), 7087:36040 (dark., the whole hero in Dark mode).

// The thresholds, softness, smoothing and magnet numbers live in tuning.ts (DialKit, Godwin 2026-11-07).

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Progress of item `i` of `n` through a wave over [start, end]: each item takes `width` item slots, so the
 * wave is soft (neighbours overlap) and the last item ends exactly at `end`.
 */
export function wave(p: number, [start, end]: [number, number], i: number, n: number, width = 2): number {
  const q = clamp01((p - start) / (end - start));
  return clamp01((q * (n + width) - i) / width);
}
