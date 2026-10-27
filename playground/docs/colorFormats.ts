// Color math for the Brand theme page's picker: HSV for the picker's own controls, and the formats its field
// reads and writes (HEX, RGB, HSL, OKLCH). Pure, so it can be tested without the page.
import { fromOklch, toOklch } from '../../scripts/brand/core';

export type Hsv = { h: number; s: number; v: number };

export const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));
export const isHex = (s: string) => /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());

export function toHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return `#${[f(5), f(3), f(1)].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function toHsv(hex: string): Hsv {
  let t = hex.trim().replace('#', '');
  if (t.length === 3) t = [...t].map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(t.slice(i, i + 2), 16) / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max === 0 ? 0 : d / max, v: max };
}

/** Normalises a typed or picked hex to lowercase #rrggbb. */
export const normalHex = (s: string) => toHex(toHsv(s));

// ---------- color formats for the field ----------

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';
export const FORMATS: { id: ColorFormat; label: string }[] = [
  { id: 'hex', label: 'HEX' },
  { id: 'rgb', label: 'RGB' },
  { id: 'hsl', label: 'HSL' },
  { id: 'oklch', label: 'OKLCH' },
];
export const FORMAT_KEY = 'bland-docs-color-format';
const round = (n: number, places = 0) => Number(n.toFixed(places));

function rgbOf(hex: string): [number, number, number] {
  const t = normalHex(hex).slice(1);
  return [0, 2, 4].map((i) => parseInt(t.slice(i, i + 2), 16)) as [number, number, number];
}
const fromRgb = (rgb: number[]) => `#${rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, '0')).join('')}`;

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return fromRgb([f(0), f(8), f(4)].map((c) => c * 255));
}

/** The color as the field shows it: the numbers alone, CSS order and units (the menu names the format). */
export function formatColor(hex: string, format: ColorFormat): string {
  if (format === 'hex') return normalHex(hex);
  if (format === 'rgb') return rgbOf(hex).join(' ');
  if (format === 'oklch') {
    const { l, c, h } = toOklch(hex);
    return `${l.toFixed(3)} ${c.toFixed(3)} ${c < 1e-4 ? 0 : round(h)}`;
  }
  const [r, g, b] = rgbOf(hex).map((c) => c / 255) as [number, number, number];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return `${round(toHsv(hex).h, 1)} ${round(s * 100, 1)}% ${round(l * 100, 1)}%`;
}

/**
 * Reads what was typed: a hex in any format, CSS (`rgb(255 90 31)`, `hsl(16deg 100% 56%)`, `oklch(68% 0.21 38)`)
 * or the bare numbers of the chosen format, commas or spaces. Undefined until it is a whole color.
 */
export function parseColor(text: string, format: ColorFormat): string | undefined {
  const t = text.trim().toLowerCase();
  if (isHex(t)) return normalHex(t);
  const fn = /^(rgba?|hsla?|oklch)\s*\(/.exec(t)?.[1]?.replace(/a$/, '') as ColorFormat | undefined;
  const as = fn ?? format;
  const parts = [...t.matchAll(/-?\d*\.?\d+%?/g)].map((m) => m[0]);
  if (as === 'hex' || parts.length < 3) return undefined;
  const num = (p: string) => parseFloat(p);
  const [a, b, c] = parts as [string, string, string];
  if (as === 'rgb') return fromRgb([a, b, c].map((p) => (p.endsWith('%') ? num(p) * 2.55 : num(p))));
  if (as === 'hsl') return hslToHex(((num(a) % 360) + 360) % 360, clamp(num(b) / 100), clamp(num(c) / 100));
  const l = a.endsWith('%') || num(a) > 1 ? num(a) / 100 : num(a);
  return fromOklch({ l: clamp(l), c: Math.max(0, b.endsWith('%') ? (num(b) / 100) * 0.4 : num(b)), h: ((num(c) % 360) + 360) % 360 });
}


// ---------- channels: one field per number (RGB, HSL, OKLCH) ----------

/** One number of a format: its field's name, range, decimals shown and unit, and how far an arrow key moves it. */
export type Channel = { id: string; label: string; min: number; max: number; places: number; unit?: string; step: number };
export const CHANNELS: Record<Exclude<ColorFormat, 'hex'>, Channel[]> = {
  rgb: [
    { id: 'r', label: 'Red', min: 0, max: 255, places: 0, step: 1 },
    { id: 'g', label: 'Green', min: 0, max: 255, places: 0, step: 1 },
    { id: 'b', label: 'Blue', min: 0, max: 255, places: 0, step: 1 },
  ],
  hsl: [
    { id: 'h', label: 'Hue', min: 0, max: 360, places: 1, unit: '°', step: 1 },
    { id: 's', label: 'Saturation', min: 0, max: 100, places: 1, unit: '%', step: 1 },
    { id: 'l', label: 'Lightness', min: 0, max: 100, places: 1, unit: '%', step: 1 },
  ],
  oklch: [
    { id: 'l', label: 'Lightness', min: 0, max: 100, places: 1, unit: '%', step: 1 },
    { id: 'c', label: 'Chroma', min: 0, max: 0.4, places: 3, step: 0.005 },
    { id: 'h', label: 'Hue', min: 0, max: 360, places: 0, unit: '°', step: 1 },
  ],
};

/** The color's numbers in a format, rounded as their fields show them. */
export function channelsOf(hex: string, format: Exclude<ColorFormat, 'hex'>): number[] {
  if (format === 'oklch') {
    const { l, c, h } = toOklch(hex);
    return [round(l * 100, 1), round(c, 3), c < 1e-4 ? 0 : round(h) % 360];
  }
  return formatColor(hex, format)
    .split(' ')
    .map((p) => parseFloat(p));
}

/** The hex for a format's numbers (each clamped to its range first). */
export function fromChannels(values: number[], format: Exclude<ColorFormat, 'hex'>): string {
  const [a, b, c] = values.map((v, i) => clamp(v, CHANNELS[format][i]!.min, CHANNELS[format][i]!.max)) as [number, number, number];
  if (format === 'rgb') return fromRgb([a, b, c]);
  if (format === 'hsl') return hslToHex(a % 360, b / 100, c / 100);
  return fromOklch({ l: a / 100, c: b, h: c % 360 });
}
