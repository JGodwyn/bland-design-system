// The highlighter stroke behind a lit phrase (Godwin 2026-11-07: darker, with rough edges like a real
// highlighter). CSS cannot draw ragged edges, so it is a small SVG built here: wobbly top and bottom edges,
// slanted chisel-tip ends, and a few darker streaks where the ink overlaps. It is used as a background image
// stretched to each line of the phrase (preserveAspectRatio none), so its coordinates are a share of the line:
// x 0 to 1000, y 0 to 100. The color is --landing-marker-color (highlighter yellow), read from the page.

/** A small seeded random, so the stroke is the same on every render. */
function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export interface MarkerShape {
  /** Top and bottom of the band, as shares of the line's height. */
  top: number;
  bottom: number;
  /** How far the edges wobble, as a share of the line's height. */
  roughness: number;
  /** Ink strength, 0 to 1. */
  strength: number;
}

/** The stroke as an SVG data URL, for `background-image`. */
export function markerImage(color: string, shape: MarkerShape, seed = 7): string {
  const rand = random(seed);
  const top = shape.top * 100;
  const bottom = shape.bottom * 100;
  const r = shape.roughness * 100;
  const jitter = () => (rand() - 0.5) * 2 * r;
  const steps = 14;
  // The chisel tip: both ends slant, the top edge starting further in than the bottom one.
  const slant = Math.min(40, (bottom - top) * 0.6);
  const topEdge: string[] = [];
  const bottomEdge: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = slant + (i / steps) * (1000 - slant * 2);
    topEdge.push(`${(x + slant * 0.5).toFixed(1)},${(top + jitter()).toFixed(1)}`);
    bottomEdge.push(`${(x - slant * 0.5).toFixed(1)},${(bottom + jitter()).toFixed(1)}`);
  }
  const band = `M${topEdge.join(' L')} L${bottomEdge.reverse().join(' L')} Z`;
  // Darker streaks: thin bands where a second pass of the pen overlaps.
  const streak = (y: number, h: number, from: number, to: number) => {
    const a = `${from},${(y + jitter() * 0.4).toFixed(1)}`;
    const b = `${to},${(y + jitter() * 0.4).toFixed(1)}`;
    const c = `${to - 10},${(y + h + jitter() * 0.4).toFixed(1)}`;
    const d = `${from + 10},${(y + h + jitter() * 0.4).toFixed(1)}`;
    return `M${a} L${b} L${c} L${d} Z`;
  };
  const h = bottom - top;
  const streaks = [
    streak(top + h * 0.08, h * 0.16, 60, 940),
    streak(bottom - h * 0.22, h * 0.14, 30, 900),
  ].join(' ');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">` +
    `<path d="${band}" fill="${color}" fill-opacity="${shape.strength.toFixed(3)}"/>` +
    `<path d="${streaks}" fill="${color}" fill-opacity="${Math.min(1, shape.strength * 0.35).toFixed(3)}"/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
