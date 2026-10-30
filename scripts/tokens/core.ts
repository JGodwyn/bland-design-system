// Token build logic shared by scripts/build-tokens.ts (writes the outputs) and scripts/drift.ts
// (compares two exports). Rules are listed at the top of build-tokens.ts.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export type RawEasing = { type: string; easingFunctionCubicBezier: { x1: number; y1: number; x2: number; y2: number } };
export type RawValue = string | number | boolean | { '@': string; o: number } | RawEasing;
export type RawVariable = [id: string, name: string, collectionId: string, type: string, description: string, values: Record<string, RawValue>];
export type Collection = { id: string; name: string; hidden: boolean; modes: [string, string][] };
export type EffectLayer = { type: string; color?: string; offsetX?: string; offsetY?: string; radius?: string; spread?: string };
export type EffectStyle = { name: string; description: string; layers: EffectLayer[] };
export type TextStyle = {
  name: string;
  description: string;
  textDecoration: string;
  fontSize?: string;
  fontStyle?: string;
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
};
export type Meta = { fileKey: string; collections: Collection[]; effectStyles: EffectStyle[]; textStyles: TextStyle[] };

export type Token = {
  name: string;
  css: string;
  collection: string;
  type: string;
  description: string;
  light: string;
  dark?: string;
  aliasOf?: { light?: string; dark?: string };
  /**
   * The CSS value per mode when it differs from the resolved one: tokens that follow the brand point at the
   * --brand-* steps, so a project's brand override cascades. `light` and `dark` stay the resolved colors.
   */
  cssValue?: { light?: string; dark?: string };
};

export type Export = { meta: Meta; exportedAt: string; raw: RawVariable[] };

/** Reads every chunk in a raw export folder (tokens/figma/raw). */
export function loadExport(rawDir: string): Export {
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
  if (!meta) throw new Error(`${rawDir} is missing chunk 00.json (collections and styles).`);
  return { meta, exportedAt, raw };
}

/** Resolves an export into CSS tokens, sorted for output. Throws on broken aliases and name collisions. */
export function buildTokens({ meta, raw }: Pick<Export, 'meta' | 'raw'>) {
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

  // The brand and neutral scales are the primitives emitted (--brand-0 … --brand-1000, --neutral-0 …
  // --neutral-1000), so a project can override them at :root (its brand, and its neutrals tinted toward it).
  // Anything whose alias chain ends in one of their steps points at it; an alpha step becomes a color-mix.
  const overridable = (name: string) => {
    const m = /^(Brand|Neutral)\/\1(\d+)$/.exec(name);
    return m ? { scale: m[1] as 'Brand' | 'Neutral', step: m[2]!, css: `--${m[1]!.toLowerCase()}-${m[2]}` } : undefined;
  };
  function primitiveRef(id: string, mode: Mode): string | undefined {
    const v = variables.get(id);
    if (!v) return undefined;
    const own = overridable(v[1]);
    if (own) return `var(${own.css})`;
    const value = v[5][modeId(collections.get(v[2])!, mode)];
    if (typeof value === 'string' && value.startsWith('@')) return primitiveRef(value.slice(1), mode);
    if (typeof value === 'object' && '@' in value && !value['@'].startsWith('#')) {
      const inner = primitiveRef(value['@'], mode);
      return inner && `color-mix(in srgb, ${inner} ${value.o}%, transparent)`;
    }
    return undefined;
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
  function cssName(name: string): string {
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
  // The two family tokens a project can override at :root to swap its fonts (Godwin 2026-10-29): Code/* text
  // styles read --font-mono, every other one --font-sans. Nothing else of the type scale is emitted (no size,
  // line height or letter spacing tokens). A family Figma names without a stack here gets the role's fallback.
  const FONT_ROLES = {
    sans: { css: '--font-sans', fallback: 'system-ui, sans-serif', what: 'UI text: every Display, Heading, Title and Body text style' },
    mono: { css: '--font-mono', fallback: 'ui-monospace, monospace', what: 'code: every Code/* text style' },
  };
  const fontRole = (styleName: string) => (styleName.startsWith('Code/') ? FONT_ROLES.mono : FONT_ROLES.sans);

  function cssValue(value: string | number, type: string, name: string): string {
    if (type === 'COLOR') return formatColor(hexToRgba(String(value)));
    // Column counts are plain numbers (repeat(var(--layout-columns-mobile), …)); every other FLOAT is a dimension.
    if (type === 'FLOAT') return /^Layout\/columns-/.test(name) ? String(value) : `${value}px`;
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


  const skip = (name: string) => /^Fade\/.*-clear$/.test(name);
  const tokens: Token[] = [];
  const skipped: string[] = [];

  for (const v of raw) {
    const [id, name, collectionId, type, description] = v;
    const collection = collections.get(collectionId)!;
    const own = overridable(name);
    if (own) {
      const what = own.scale === 'Brand' ? 'brand-colored token' : 'neutral token (text, borders, surfaces)';
      tokens.push({
        name,
        css: own.css,
        collection: own.scale,
        type,
        description: decode(description) || `${own.scale} step ${own.step}. Override it per project at :root; every ${what} follows.`,
        light: cssValue(resolveRaw(id, 'light'), type, name),
      });
      continue;
    }
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
    const refLight = type === 'COLOR' ? primitiveRef(id, 'light') : undefined;
    const refDark = themed && type === 'COLOR' ? primitiveRef(id, 'dark') : undefined;
    tokens.push({
      name,
      css: `--${cssName(name)}`,
      collection: collection.name,
      type,
      description: decode(description),
      light,
      ...(dark !== undefined && { dark }),
      ...((aliasLight || aliasDark) && { aliasOf: { light: aliasLight, ...(aliasDark && { dark: aliasDark }) } }),
      ...((refLight || refDark) && { cssValue: { ...(refLight && { light: refLight }), ...(refDark && { dark: refDark }) } }),
    });
  }

  // Elevation: one box-shadow per style; colors come from Theme so it switches with the mode.
  const byId = (id: string | undefined, mode: Mode, style: string, field: string) => {
    if (!id) throw new Error(`${style}: layer ${field} is not bound to a variable.`);
    return resolveRaw(id, mode);
  };
  for (const style of meta.effectStyles) {
    const shadow = (mode: Mode, refs = false) =>
      style.layers
        .filter((l) => l.type === 'DROP_SHADOW')
        .map((l) => {
          const px = (f: keyof EffectLayer) => `${byId(l[f], mode, style.name, f)}px`;
          const resolved = formatColor(hexToRgba(String(byId(l.color, mode, style.name, 'color'))));
          const color = (refs && l.color && primitiveRef(l.color, mode)) || resolved;
          return `${px('offsetX')} ${px('offsetY')} ${px('radius')} ${px('spread')} ${color}`;
        })
        .join(', ');
    const [refLight, refDark] = [shadow('light', true), shadow('dark', true)];
    tokens.push({
      name: style.name,
      css: `--${kebab(style.name)}`,
      collection: 'Effect styles',
      type: 'SHADOW',
      description: decode(style.description),
      light: shadow('light'),
      dark: shadow('dark'),
      ...(refLight !== shadow('light') && { cssValue: { light: refLight, dark: refDark } }),
    });
  }

  // Font families: one token per role, holding the family its text styles use in Figma and its fallbacks.
  const familyOf = new Map<string, string>();
  for (const style of meta.textStyles) {
    if (!style.fontFamily) continue;
    const family = String(resolveRaw(style.fontFamily, 'light'));
    const { css } = fontRole(style.name);
    const other = familyOf.get(css);
    if (other && other !== family) throw new Error(`${style.name} uses "${family}" but other text styles on ${css} use "${other}". One family per token.`);
    familyOf.set(css, family);
  }
  const fontStack = (family: string, fallback: string) => FONT_STACKS[family] ?? `"${family}", ${fallback}`;
  for (const { css, fallback, what } of Object.values(FONT_ROLES)) {
    const family = familyOf.get(css);
    if (!family) continue;
    tokens.push({
      name: `Font/${css.slice(2)}`,
      css,
      collection: 'Font families',
      type: 'FONT_FAMILY',
      description: `The ${family} family and its fallbacks, for ${what}. Override it per project at :root to change the font; every text style follows.`,
      light: fontStack(family, fallback),
    });
  }

  // Text styles: a `font` shorthand per style. Underline variants also need text-decoration: underline.
  // The raw type scale (_Typography) is hidden like the other primitives, so each style also carries
  // the two parts the shorthand can't set or a component may need alone: line height and letter spacing.
  for (const style of meta.textStyles) {
    const val = (id: string | undefined, field: string) => {
      if (!id) throw new Error(`${style.name}: ${field} is not bound to a variable.`);
      return resolveRaw(id, 'light');
    };
    const weight = FONT_WEIGHTS[String(val(style.fontStyle, 'fontStyle'))];
    const family = String(val(style.fontFamily, 'fontFamily'));
    const lineHeight = `${val(style.lineHeight, 'lineHeight')}px`;
    const role = fontRole(style.name);
    const shorthand = (stack: string) => `${weight} ${val(style.fontSize, 'fontSize')}px/${lineHeight} ${stack}`;
    const font = shorthand(fontStack(family, role.fallback));
    const underline = style.textDecoration === 'UNDERLINE';
    // Code/* text styles share step names with Body/*, so they get their own prefix.
    const css = `--type-${style.name.startsWith('Code/') ? 'code-' : ''}${kebab(style.name.split('/').slice(1).join('-'))}`;
    tokens.push(
      {
        name: style.name,
        css,
        collection: 'Text styles',
        type: 'FONT',
        description: decode(style.description) + (underline ? ' Pair with text-decoration: underline.' : ''),
        light: font,
        cssValue: { light: shorthand(`var(${role.css})`) },
      },
      {
        name: `${style.name}/line-height`,
        css: `${css}-line-height`,
        collection: 'Text styles',
        type: 'FLOAT',
        description: `Line height of ${style.name}, for sizing by lines of that text.`,
        light: lineHeight,
      },
      {
        name: `${style.name}/letter-spacing`,
        css: `${css}-letter-spacing`,
        collection: 'Text styles',
        type: 'FLOAT',
        description: `Letter spacing of ${style.name}. The font shorthand can't set it, so set it beside font: var(${css}).`,
        light: `${val(style.letterSpacing, 'letterSpacing')}px`,
      },
    );
  }

  // ---------- checks ----------

  const seenCss = new Map<string, string>();
  for (const t of tokens) {
    const clash = seenCss.get(t.css);
    if (clash) throw new Error(`CSS name collision: ${t.name} and ${clash} both map to ${t.css}.`);
    seenCss.set(t.css, t.name);
  }

  const order = ['Brand', 'Neutral', 'Font families', 'Theme', 'Spacing', 'Corner Radius', 'Stroke', 'Text styles', 'Effects', 'Effect styles', 'Sizing', 'Motion', 'Breakpoints'];
  tokens.sort((a, b) => order.indexOf(a.collection) - order.indexOf(b.collection));

  return { tokens, skipped, order };
}
