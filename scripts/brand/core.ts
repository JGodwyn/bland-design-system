// Brand override tooling: generate a 13-step brand scale from one color, read a project's override file, and check
// the color pairings that depend on the brand. Used by scripts/brand.ts (npm run brand), its tests and the docs
// site's Brand theme page, so it stays free of Node APIs. See docs/brand.md.
import tokensFile from '../../tokens/tokens.json';
import type { Token } from '../tokens/core';

export const STEPS = ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950', '1000'] as const;
export type Step = (typeof STEPS)[number];
export type Scale = Record<Step, string>;

export const tokens = tokensFile.tokens as Token[];

/** Bland's own brand scale, from the tokens. */
export const blandScale = Object.fromEntries(STEPS.map((s) => [s, tokens.find((t) => t.css === `--brand-${s}`)!.light])) as Scale;

// ---------- color math (sRGB hex <-> OKLCH) ----------

type Oklch = { l: number; c: number; h: number };

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function parseHex(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`"${hex}" is not a hex color (#rrggbb).`);
  const h = m[1]!.length === 3 ? [...m[1]!].map((c) => c + c).join('') : m[1]!;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

export function toOklch(hex: string): Oklch {
  const [r, g, b] = parseHex(hex).map(toLinear) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

/** OKLCH to linear sRGB; may fall outside 0..1 (out of gamut). */
function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

/** OKLCH to hex, reducing chroma until the color fits sRGB (the hue and lightness stay). */
export function fromOklch(color: Oklch): string {
  const inGamut = (rgb: number[]) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let rgb = oklchToLinear(color);
  if (!inGamut(rgb)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    rgb = oklchToLinear({ ...color, c: lo });
  }
  const hex = (v: number) =>
    Math.round(Math.min(1, Math.max(0, fromLinear(Math.min(1, Math.max(0, v))))) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${rgb.map(hex).join('')}`;
}

// ---------- generator ----------

/**
 * Builds 13 steps around one color, in the shape of Bland's own scale (made in OKLCH): the color lands exactly on
 * `at` (default 600, the step primary fills use), lighter steps spread its lightness up to white and darker steps
 * down to Bland's darkest, chroma follows Bland's curve scaled to the color's, and the hue stays the color's.
 * Step 0 is always white. A starting point: tune the steps by hand, then run the check.
 */
export function generate(hex: string, at: Step = '600'): Scale {
  const input = toOklch(hex);
  const ref = Object.fromEntries(STEPS.map((s) => [s, toOklch(blandScale[s])])) as Record<Step, Oklch>;
  const anchor = ref[at];
  const top = ref['0'].l;
  // A color darker than Bland's darkest step still gets darker steps after it.
  const bottom = at === '1000' ? input.l : Math.min(ref['1000'].l, input.l * 0.8);
  const chroma = anchor.c > 0 ? input.c / anchor.c : 0;
  const out = {} as Scale;
  for (const s of STEPS) {
    if (s === '0') {
      out[s] = '#ffffff';
      continue;
    }
    if (s === at) {
      out[s] = `#${parseHex(hex)
        .map((v) => Math.round(v * 255).toString(16).padStart(2, '0'))
        .join('')}`;
      continue;
    }
    const r = ref[s];
    const l =
      r.l >= anchor.l
        ? input.l + ((r.l - anchor.l) / (top - anchor.l)) * (top - input.l)
        : bottom + ((r.l - ref['1000'].l) / (anchor.l - ref['1000'].l)) * (input.l - bottom);
    out[s] = fromOklch({ l, c: r.c * chroma, h: input.h });
  }
  return out;
}

// ---------- reading an override file ----------

/**
 * Reads the 13 steps from a project's override: a CSS file (`--brand-600: #…;`) or a JSON object
 * (`{ "600": "#…" }` or `{ "--brand-600": "#…" }`). Every step is required.
 */
export function parseScale(text: string): Scale {
  const found: Partial<Record<string, string>> = {};
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) {
    for (const [k, v] of Object.entries(JSON.parse(trimmed) as Record<string, string>)) found[k.replace(/^--brand-/, '')] = v;
  } else {
    for (const m of text.matchAll(/--brand-(\d+)\s*:\s*([^;}\s]+)/g)) found[m[1]!] = m[2]!;
  }
  const missing = STEPS.filter((s) => !found[s]);
  if (missing.length) throw new Error(`The brand override is missing step${missing.length > 1 ? 's' : ''} ${missing.join(', ')}. It needs all 13.`);
  return Object.fromEntries(STEPS.map((s) => [s, `#${parseHex(found[s]!).map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('')}`])) as Scale;
}

export function toCss(scale: Scale, note = ''): string {
  return `/* Brand override for Bland${note ? `: ${note}` : ''}. Load after bland/tokens.css. */\n:root {\n${STEPS.map((s) => `  --brand-${s}: ${scale[s]};`).join('\n')}\n}\n`;
}

// ---------- contrast check ----------

export type Mode = 'light' | 'dark';

const luminance = (hex: string) => {
  const [r, g, b] = parseHex(hex).map(toLinear) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};

const byCss = new Map(tokens.map((t) => [t.css, t]));

/** A token's color in a mode with the given brand scale, and the brand step it comes from (if any). */
export function colorOf(css: string, mode: Mode, scale: Scale): { hex: string; step?: Step } {
  const t = byCss.get(css);
  if (!t) throw new Error(`Unknown token ${css}.`);
  const ref = mode === 'dark' ? (t.dark !== undefined ? t.cssValue?.dark : t.cssValue?.light) : t.cssValue?.light;
  const step = ref && /^var\(--brand-(\d+)\)$/.exec(ref)?.[1];
  if (step) return { hex: scale[step as Step], step: step as Step };
  return { hex: mode === 'dark' ? (t.dark ?? t.light) : t.light };
}

/** A foreground on a background, where Bland draws it, and the WCAG minimum it needs. */
export type Pair = { fg: string; bg: string; min: 4.5 | 3; where: string };

const text = (fg: string, bg: string, where: string): Pair => ({ fg, bg, min: 4.5, where });
const part = (fg: string, bg: string, where: string): Pair => ({ fg, bg, min: 3, where });

/** The brand-dependent pairings Bland draws: text needs 4.5:1, icons, borders, fills and focus rings 3:1. */
export const PAIRS: Pair[] = [
  ...['rest', 'hover', 'pressed'].map((s) => text('--text-on-color', `--button-brand-primary-${s}`, `Button primary label (${s})`)),
  ...['rest', 'hover', 'pressed'].map((s) => text('--text-bold', `--button-brand-secondary-${s}`, `Button secondary label (${s})`)),
  ...['hover', 'pressed'].map((s) => text('--text-bold', `--button-brand-ghost-${s}`, `Button ghost label (${s})`)),
  text('--text-on-color', '--surface-brand-strong', 'White content on the strong brand fill (Toast, on-color Logo)'),
  text('--badge-brand-primary-content', '--badge-brand-primary', 'Badge primary label'),
  text('--badge-brand-secondary-content', '--badge-brand-secondary', 'Badge secondary label'),
  text('--indicator-brand-primary-content', '--indicator-brand-primary', 'Indicator primary label'),
  text('--indicator-brand-secondary-content', '--indicator-brand-secondary', 'Indicator secondary label'),
  text('--text-link', '--surface-100', 'Link on the page'),
  text('--text-link', '--surface-200', 'Link on a raised surface'),
  text('--text-brand', '--surface-100', 'Brand text on the page'),
  text('--text-brand', '--surface-brand-light', 'Brand text on the light brand fill'),
  text('--sidebar-text-selected', '--sidebar-surface-selected', 'Sidebar selected row'),
  text('--sidebar-text-selected', '--sidebar-surface-selected-hover', 'Sidebar selected row (hover)'),
  text('--sidebar-count-selected-content', '--sidebar-count-selected', 'Sidebar selected count'),
  text('--code-function', '--surface-100', 'Code function names'),
  text('--messaging-sender-content', '--messaging-surface-sender', 'Sent chat bubble text'),
  text('--messaging-sender-content-subtle', '--messaging-surface-sender', 'Sent chat bubble time and status'),
  text('--messaging-sender-content', '--messaging-surface-sender-quote', 'Quoted reply in a sent bubble'),
  text('--text-on-color', '--date-calendar-item-surface-checked', 'Calendar selected day'),
  text('--text-on-color', '--date-calendar-item-surface-checked-hover', 'Calendar selected day (hover)'),
  part('--border-focused', '--surface-100', 'Focus ring on the page'),
  part('--border-focused', '--surface-200', 'Focus ring on a raised surface'),
  part('--border-brand', '--surface-100', 'Brand border (selected tab underline)'),
  part('--icon-brand', '--surface-100', 'Brand icon on the page'),
  part('--control-checked-rest', '--surface-100', 'Checked checkbox and radio against the page'),
  part('--icon-on-color', '--control-checked-rest', 'Checkbox tick and radio dot'),
  part('--toggle-surface-checked', '--surface-100', 'Toggle on, against the page'),
  part('--toggle-knob-rest', '--toggle-surface-checked', 'Toggle knob on the checked track'),
  part('--progress-fill-brand', '--progress-track', 'Progress fill against its track'),
];

export type Finding = Pair & {
  mode: Mode;
  ratio: number;
  /** The ratio with Bland's own brand: below `min` there too means a deliberate Bland choice, not this brand. */
  baseline: number;
  steps: Step[];
  /** Which way to move each brand step involved to gain contrast. */
  advice: string;
};

/** Every pairing below its minimum with this scale, in both modes. */
export function check(scale: Scale): Finding[] {
  const out: Finding[] = [];
  for (const mode of ['light', 'dark'] as const) {
    for (const pair of PAIRS) {
      const fg = colorOf(pair.fg, mode, scale);
      const bg = colorOf(pair.bg, mode, scale);
      const ratio = contrast(fg.hex, bg.hex);
      if (ratio >= pair.min) continue;
      const base = contrast(colorOf(pair.fg, mode, blandScale).hex, colorOf(pair.bg, mode, blandScale).hex);
      const moves = [fg, bg]
        .map((side, i) => {
          if (!side.step) return undefined;
          const other = i === 0 ? bg : fg;
          return `${luminance(side.hex) > luminance(other.hex) ? 'lighten' : 'darken'} ${side.step}`;
        })
        .filter(Boolean) as string[];
      out.push({
        ...pair,
        mode,
        ratio,
        baseline: base,
        steps: [fg.step, bg.step].filter(Boolean) as Step[],
        advice: moves.join(' or '),
      });
    }
  }
  return out;
}

/** A miss Bland's own brand has too, and this brand makes no worse: not this brand's doing. */
const inherited = (f: Finding) => f.baseline < f.min && f.ratio >= f.baseline - 0.01;

/**
 * For each brand step behind a miss, the nearest color (same hue and chroma, lightness moved the way the advice
 * says) that clears every pairing it is in, with the other steps as they are. One step at a time: run the check
 * again after taking them.
 */
export function suggest(scale: Scale): Partial<Scale> {
  const misses = check(scale).filter((f) => !inherited(f));
  // A miss between a tint (below 400) and a solid step is the solid step's to fix: moving the tint would wash out
  // the light end of the scale. Between two of a kind, the darker step.
  const owner = (f: Finding) => {
    const solid = f.steps.filter((s) => Number(s) >= 400);
    return (solid.length ? solid : f.steps).sort((a, b) => Number(b) - Number(a))[0]!;
  };
  const out: Partial<Scale> = {};
  for (const step of new Set(misses.map(owner))) {
    const pairs = PAIRS.filter((p) => ['light', 'dark'].some((m) => [p.fg, p.bg].some((css) => colorOf(css, m as Mode, scale).step === step)));
    const passes = (hex: string) => {
      const trial = { ...scale, [step]: hex };
      return check(trial).filter((f) => !inherited(f) && pairs.includes(PAIRS.find((p) => p.fg === f.fg && p.bg === f.bg)!) && f.steps.includes(step)).length === 0;
    };
    const base = toOklch(scale[step]);
    const lighten = misses.some((f) => owner(f) === step && f.advice.includes(`lighten ${step}`));
    let found: string | undefined;
    for (let i = 1; i <= 100 && !found; i++) {
      const l = lighten ? base.l + (i / 100) * (1 - base.l) : base.l - (i / 100) * base.l;
      const hex = fromOklch({ ...base, l });
      if (passes(hex)) found = hex;
    }
    if (found) out[step] = found;
  }
  return out;
}

/**
 * Keeps the scale in order after steps moved: each step stays darker than the one before it by at least half its
 * original gap. Steps after a darkened one are pushed darker, steps before a lightened one lighter, which only adds
 * contrast to the pairings they are in.
 */
function keepOrder(scale: Scale, original: Scale, moved: Partial<Scale>): Scale {
  // A moved step may go further the way it moved (that only adds contrast), never back.
  const darkened = (s: Step) => moved[s] !== undefined && toOklch(moved[s]!).l < toOklch(original[s]).l;
  const lightened = (s: Step) => moved[s] !== undefined && !darkened(s);
  const L = STEPS.map((s) => toOklch(scale[s]));
  const gap = (i: number) => Math.max(0.01, (toOklch(original[STEPS[i - 1]!]).l - toOklch(original[STEPS[i]!]).l) / 2);
  // Darker steps give way downward, lighter ones upward.
  for (let i = 1; i < STEPS.length; i++) {
    if (!lightened(STEPS[i]!) && L[i]!.l > L[i - 1]!.l - gap(i)) L[i] = { ...L[i]!, l: Math.max(0.05, L[i - 1]!.l - gap(i)) };
  }
  for (let i = STEPS.length - 2; i >= 1; i--) {
    if (!darkened(STEPS[i]!) && L[i]!.l < L[i + 1]!.l + gap(i + 1)) L[i] = { ...L[i]!, l: Math.min(0.99, L[i + 1]!.l + gap(i + 1)) };
  }
  return Object.fromEntries(
    STEPS.map((s, i) => [s, s === '0' || toOklch(scale[s]).l === L[i]!.l ? scale[s] : fromOklch(L[i]!)]),
  ) as Scale;
}

/** The suggested steps, applied and kept in order, repeated (up to four rounds) until the check passes. */
export function fixScale(scale: Scale): Scale {
  let current = scale;
  for (let round = 0; round < 4; round++) {
    if (check(current).every(inherited)) break;
    const moved = suggest(current);
    current = keepOrder({ ...current, ...moved }, scale, moved);
  }
  return current;
}

export function report(scale: Scale): { text: string; failures: number; fixes: Partial<Scale> } {
  const findings = check(scale);
  const real = findings.filter((f) => !inherited(f));
  const known = findings.filter(inherited);
  const lines = [`Brand check: ${PAIRS.length} brand pairings in light and dark.`];
  if (real.length === 0) lines.push('All pass with this brand.');
  for (const f of real) {
    lines.push(`  ✗ ${f.mode.padEnd(5)} ${f.ratio.toFixed(2)}:1, needs ${f.min}:1  ${f.where} (${f.fg} on ${f.bg}). ${f.advice}.`);
  }
  const all = real.length ? fixScale(scale) : scale;
  const fixes = Object.fromEntries(STEPS.filter((s) => all[s] !== scale[s]).map((s) => [s, all[s]])) as Partial<Scale>;
  const fixed = Object.entries(fixes);
  if (fixed.length) {
    lines.push('Suggested steps (same hue, lightness moved until the pairings pass, the scale kept in order; --fix applies them):');
    for (const [step, hex] of fixed) lines.push(`  ${step.padStart(4)}: ${scale[step as Step]} → ${hex}`);
  }
  if (known.length) {
    lines.push('Below the minimum with Bland’s own brand too, and no worse here:');
    for (const f of known) lines.push(`  · ${f.mode.padEnd(5)} ${f.ratio.toFixed(2)}:1 (Bland ${f.baseline.toFixed(2)}:1)  ${f.where}`);
  }
  return { text: lines.join('\n'), failures: real.length, fixes };
}
