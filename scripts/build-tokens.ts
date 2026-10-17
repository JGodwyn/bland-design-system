// Builds the token outputs from the raw Figma export in tokens/figma/raw/.
//
//   tokens/tokens.json      resolved tokens with descriptions (the reviewable diff)
//   src/tokens/tokens.css   CSS custom properties, Light on :root and Dark redefined
//
// Rules (see CLAUDE.md, "Export rules"):
// - Primitives (hidden collections) are resolved away and never emitted.
// - Alias chains resolve to final values; alpha primitives resolve to the source color at their opacity.
// - Fade/*-clear tokens are Figma-only drawing aids and are skipped.
// - Every token keeps its Figma description.
// - Motion: TIMING (seconds in Figma) becomes rounded ms; EASING becomes cubic-bezier() or linear.

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const rawDir = join(root, 'tokens/figma/raw');

type RawEasing = { type: string; easingFunctionCubicBezier: { x1: number; y1: number; x2: number; y2: number } };
type RawValue = string | number | boolean | { '@': string; o: number } | RawEasing;
type RawVariable = [id: string, name: string, collectionId: string, type: string, description: string, values: Record<string, RawValue>];
type Collection = { id: string; name: string; hidden: boolean; modes: [string, string][] };
type EffectLayer = { type: string; color?: string; offsetX?: string; offsetY?: string; radius?: string; spread?: string };
type EffectStyle = { name: string; description: string; layers: EffectLayer[] };
type TextStyle = {
  name: string;
  description: string;
  textDecoration: string;
  fontSize?: string;
  fontStyle?: string;
  fontFamily?: string;
  lineHeight?: string;
};
type Meta = { fileKey: string; collections: Collection[]; effectStyles: EffectStyle[]; textStyles: TextStyle[] };

// ---------- load ----------

let meta: Meta | undefined;
let exportedAt = '';
const raw: RawVariable[] = [];
for (const file of readdirSync(rawDir).filter((f) => f.endsWith('.json')).sort()) {
  const chunk = JSON.parse(readFileSync(join(rawDir, file), 'utf8'));
  if (chunk.meta) {
    meta = chunk.meta;
    exportedAt = chunk.exportedAt;
  }
  if (chunk.variables) raw.push(...chunk.variables);
}
if (!meta) throw new Error('tokens/figma/raw is missing chunk 00.json (collections and styles).');

const collections = new Map(meta.collections.map((c) => [c.id, c]));
const variables = new Map(raw.map((v) => [v[0], v]));

// ---------- resolve ----------

type Mode = 'light' | 'dark';
type Resolved = { value: string | number; aliasOf?: string };

const decode = (s: string) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

function modeId(collection: Collection, mode: Mode): string {
  if (collection.modes.length === 1) return collection.modes[0]![0];
  const wanted = mode === 'light' ? 'Light' : 'Dark';
  const found = collection.modes.find(([, name]) => name === wanted);
  if (!found) throw new Error(`Collection ${collection.name} has no ${wanted} mode.`);
  return found[0];
}

// Colors travel internally as "#rrggbbaa", or "#rrggbb@<alpha>" once an alpha primitive
// applies an exact opacity, so 6% stays 6% instead of rounding through 8-bit hex.
function hexToRgba(color: string) {
  const [hex, exactAlpha] = color.split('@') as [string, string | undefined];
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const a = exactAlpha !== undefined ? Number(exactAlpha) : hex.length > 7 ? n(7) / 255 : 1;
  return { r: n(1), g: n(3), b: n(5), a };
}

function formatColor({ r, g, b, a }: { r: number; g: number; b: number; a: number }): string {
  const h = (x: number) => x.toString(16).padStart(2, '0');
  if (a >= 1) return `#${h(r)}${h(g)}${h(b)}`;
  return `rgb(${r} ${g} ${b} / ${Math.round(a * 1000) / 10}%)`;
}

function resolveRaw(id: string, mode: Mode, seen: string[] = []): string | number {
  if (seen.includes(id)) throw new Error(`Alias cycle: ${seen.join(' -> ')} -> ${id}`);
  const v = variables.get(id);
  if (!v) throw new Error(`Unknown variable ${id} (aliased from ${seen.at(-1) ?? 'a style'}).`);
  const collection = collections.get(v[2])!;
  const value = v[5][modeId(collection, mode)];
  if (value === undefined) throw new Error(`${v[1]} has no value for ${mode}.`);
  if (typeof value === 'string' && value.startsWith('@')) return resolveRaw(value.slice(1), mode, [...seen, id]);
  if (typeof value === 'object' && 'easingFunctionCubicBezier' in value) return easing(value, v[1]);
  if (typeof value === 'object') {
    const source = value['@'].startsWith('#') ? value['@'] : String(resolveRaw(value['@'], mode, [...seen, id]));
    const c = hexToRgba(source);
    return `${source.slice(0, 7)}@${Math.round(c.a * value.o * 100) / 10000}`;
  }
  return value as string | number;
}

// Figma EASING values -> CSS. Coordinates are stored as float32, so round to 3 decimals.
function easing(value: RawEasing, name: string): string {
  if (value.type === 'LINEAR') return 'linear';
  if (value.type !== 'CUSTOM_CUBIC_BEZIER') throw new Error(`Unsupported easing type ${value.type} on ${name}.`);
  const r = (n: number) => Math.round(n * 1000) / 1000;
  const { x1, y1, x2, y2 } = value.easingFunctionCubicBezier;
  return `cubic-bezier(${r(x1)}, ${r(y1)}, ${r(x2)}, ${r(y2)})`;
}

function aliasName(id: string, mode: Mode): string | undefined {
  const v = variables.get(id)!;
  const value = v[5][modeId(collections.get(v[2])!, mode)];
  if (typeof value === 'string' && value.startsWith('@')) return variables.get(value.slice(1))?.[1];
  if (typeof value === 'object' && '@' in value && !value['@'].startsWith('#')) return variables.get(value['@'])?.[1];
  return undefined;
}

// ---------- naming ----------

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s/_]+/g, '-')
    .toLowerCase();

// Figma name -> CSS custom property name (without the leading --).
function cssName(name: string, collection: string): string {
  if (collection === 'Typography') {
    const [group, step] = name.split('/');
    if (group === 'line-height' || group === 'letter-spacing') return `${group}-${step}`;
    return `font-${group}-${step}`;
  }
  // "Surface/surface-100" -> "surface-100", "Button/brand-primary-rest" -> "button-brand-primary-rest"
  return name
    .split('/')
    .map(kebab)
    .reduce((acc, part) => (!acc || part.startsWith(`${acc}-`) ? part : `${acc}-${part}`), '');
}

// ---------- values ----------

const FONT_WEIGHTS: Record<string, number> = { Regular: 400, Medium: 500, 'Semi Bold': 600, SemiBold: 600, Bold: 700 };
const FONT_STACKS: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  'Geist Mono': '"Geist Mono", ui-monospace, monospace',
};

function cssValue(value: string | number, type: string, name: string): string {
  if (type === 'COLOR') return formatColor(hexToRgba(String(value)));
  if (type === 'FLOAT') return `${value}px`;
  // Figma stores durations in seconds as float32 (0.16 arrives as 0.1599999964).
  if (type === 'TIMING') return `${Math.round(Number(value) * 1000)}ms`;
  if (type === 'STRING') {
    if (name.startsWith('weight/')) {
      const w = FONT_WEIGHTS[String(value)];
      if (!w) throw new Error(`Unknown font weight "${value}" on ${name}. Add it to FONT_WEIGHTS.`);
      return String(w);
    }
    if (name.startsWith('family/')) return FONT_STACKS[String(value)] ?? `"${value}"`;
  }
  return String(value);
}

// ---------- build tokens ----------

type Token = {
  name: string;
  css: string;
  collection: string;
  type: string;
  description: string;
  light: string;
  dark?: string;
  aliasOf?: { light?: string; dark?: string };
};

const skip = (name: string) => /^Fade\/.*-clear$/.test(name);
const tokens: Token[] = [];
const skipped: string[] = [];

for (const v of raw) {
  const [id, name, collectionId, type, description] = v;
  const collection = collections.get(collectionId)!;
  if (collection.hidden) continue;
  if (skip(name)) {
    skipped.push(name);
    continue;
  }
  const themed = collection.modes.length > 1;
  const light = cssValue(resolveRaw(id, 'light'), type, name);
  const dark = themed ? cssValue(resolveRaw(id, 'dark'), type, name) : undefined;
  const aliasLight = aliasName(id, 'light');
  const aliasDark = themed ? aliasName(id, 'dark') : undefined;
  tokens.push({
    name,
    css: `--${cssName(name, collection.name)}`,
    collection: collection.name,
    type,
    description: decode(description),
    light,
    ...(dark !== undefined && { dark }),
    ...((aliasLight || aliasDark) && { aliasOf: { light: aliasLight, ...(aliasDark && { dark: aliasDark }) } }),
  });
}

// Elevation: one box-shadow per style; colors come from Theme so it switches with the mode.
const byId = (id: string | undefined, mode: Mode, style: string, field: string) => {
  if (!id) throw new Error(`${style}: layer ${field} is not bound to a variable.`);
  return resolveRaw(id, mode);
};
for (const style of meta.effectStyles) {
  const shadow = (mode: Mode) =>
    style.layers
      .filter((l) => l.type === 'DROP_SHADOW')
      .map((l) => {
        const px = (f: keyof EffectLayer) => `${byId(l[f], mode, style.name, f)}px`;
        const color = formatColor(hexToRgba(String(byId(l.color, mode, style.name, 'color'))));
        return `${px('offsetX')} ${px('offsetY')} ${px('radius')} ${px('spread')} ${color}`;
      })
      .join(', ');
  tokens.push({
    name: style.name,
    css: `--${kebab(style.name)}`,
    collection: 'Effect styles',
    type: 'SHADOW',
    description: decode(style.description),
    light: shadow('light'),
    dark: shadow('dark'),
  });
}

// Text styles: a `font` shorthand per style. Underline variants also need text-decoration: underline.
for (const style of meta.textStyles) {
  const val = (id: string | undefined, field: string) => {
    if (!id) throw new Error(`${style.name}: ${field} is not bound to a variable.`);
    return resolveRaw(id, 'light');
  };
  const weight = FONT_WEIGHTS[String(val(style.fontStyle, 'fontStyle'))];
  const family = String(val(style.fontFamily, 'fontFamily'));
  const font = `${weight} ${val(style.fontSize, 'fontSize')}px/${val(style.lineHeight, 'lineHeight')}px ${FONT_STACKS[family] ?? `"${family}"`}`;
  const underline = style.textDecoration === 'UNDERLINE';
  tokens.push({
    name: style.name,
    css: `--type-${kebab(style.name.split('/').slice(1).join('-'))}`,
    collection: 'Text styles',
    type: 'FONT',
    description: decode(style.description) + (underline ? ' Pair with text-decoration: underline.' : ''),
    light: font,
  });
}

// Code/* text styles share step names with Body/*, so prefix them to stay unique.
for (const t of tokens) {
  if (t.collection === 'Text styles' && t.name.startsWith('Code/')) t.css = t.css.replace('--type-', '--type-code-');
}

// ---------- checks ----------

const seenCss = new Map<string, string>();
for (const t of tokens) {
  const clash = seenCss.get(t.css);
  if (clash) throw new Error(`CSS name collision: ${t.name} and ${clash} both map to ${t.css}.`);
  seenCss.set(t.css, t.name);
}

// ---------- write ----------

const order = ['Theme', 'Spacing', 'Corner Radius', 'Stroke', 'Typography', 'Text styles', 'Effects', 'Effect styles', 'Sizing', 'Motion', 'Breakpoints'];
tokens.sort((a, b) => order.indexOf(a.collection) - order.indexOf(b.collection));

const json = {
  $source: `https://www.figma.com/design/${meta.fileKey}`,
  $exportedAt: exportedAt,
  $note: 'Generated by scripts/build-tokens.ts from tokens/figma/raw. Do not edit by hand.',
  skipped,
  tokens,
};
writeFileSync(join(root, 'tokens/tokens.json'), JSON.stringify(json, null, 2) + '\n');

const comment = (s: string) => (s ? `  /* ${s.replace(/\*\//g, '* /')} */\n` : '');
const block = (list: Token[], pick: (t: Token) => string | undefined) => {
  let out = '';
  let group = '';
  for (const t of list) {
    const value = pick(t);
    if (value === undefined) continue;
    if (t.collection !== group) {
      group = t.collection;
      out += `\n  /* ---- ${group} ---- */\n`;
    }
    out += comment(t.description) + `  ${t.css}: ${value};\n`;
  }
  return out;
};
const darkOnly = (t: Token) => t.dark;
const darkBlock = block(tokens, darkOnly).replace(/^ {2}/gm, '    ');

const css = `/* Bland design tokens. Generated by scripts/build-tokens.ts from the Figma file; do not edit by hand.
 * Source: https://www.figma.com/design/${meta.fileKey} (exported ${exportedAt})
 *
 * Light values live on :root. Dark redefines only the themed tokens and applies when
 * [data-theme="dark"] is set on an ancestor, or when the system prefers dark and no
 * [data-theme="light"] override is set.
 */

:root,
[data-theme="light"] {
  color-scheme: light;
${block(tokens, (t) => t.light)}}

[data-theme="dark"] {
  color-scheme: dark;
${block(tokens, darkOnly)}}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
${darkBlock}  }
}
`;
mkdirSync(join(root, 'src/tokens'), { recursive: true });
writeFileSync(join(root, 'src/tokens/tokens.css'), css);

const count = (c: string) => tokens.filter((t) => t.collection === c).length;
console.log(
  `tokens: ${tokens.length} emitted (${order.map((c) => `${c} ${count(c)}`).join(', ')}); ` +
    `${skipped.length} Fade/*-clear skipped; ${raw.length} variables read.`,
);
