// Deprecated token names (docs/release.md, "Deprecation"): an old CSS name kept for one minor version as an
// alias of its replacement. The list is tokens/deprecated.json, kept by hand (not generated: Figma holds only the
// new name). The build writes each alias next to its replacement in every block that defines it, so a themed
// alias follows dark mode and nested data-theme sections, and lists them under "deprecated" in tokens.json for
// the lint and the docs.

import { existsSync, readFileSync } from 'node:fs';

import type { Token } from './core';

export type Deprecation = {
  /** The old CSS name, e.g. "--surface-card". */
  name: string;
  /** The CSS token that replaces it. */
  use: string;
  /** The version that deprecated it, and the minor that removes it. */
  since: string;
  removeIn: string;
};

/** Reads tokens/deprecated.json; a missing file means none. */
export function loadDeprecations(file: string): Deprecation[] {
  if (!existsSync(file)) return [];
  const list = (JSON.parse(readFileSync(file, 'utf8')) as { tokens?: Deprecation[] }).tokens ?? [];
  for (const d of list) {
    for (const key of ['name', 'use', 'since', 'removeIn'] as const) {
      if (typeof d[key] !== 'string' || !d[key]) throw new Error(`tokens/deprecated.json: ${JSON.stringify(d)} needs "${key}".`);
    }
  }
  return list;
}

export const deprecationNote = (d: Deprecation) => `Deprecated in ${d.since}: use ${d.use}. Removed in ${d.removeIn}.`;

/** Checks the list against the built tokens: the old name must be gone and the replacement must exist. */
export function checkDeprecations(list: Deprecation[], tokens: Token[]): void {
  const css = new Set(tokens.map((t) => t.css));
  const seen = new Set<string>();
  for (const d of list) {
    if (!/^--[a-z0-9-]+$/.test(d.name) || !/^--[a-z0-9-]+$/.test(d.use)) throw new Error(`Deprecated token: ${d.name} -> ${d.use} must both be CSS custom property names.`);
    if (seen.has(d.name)) throw new Error(`Deprecated token ${d.name} is listed twice.`);
    seen.add(d.name);
    if (css.has(d.name)) throw new Error(`Deprecated token ${d.name} still exists in Figma: remove it from tokens/deprecated.json, or rename the variable.`);
    if (!css.has(d.use)) throw new Error(`Deprecated token ${d.name} points at ${d.use}, which is not a token. Aliases only point at tokens in tokens.json.`);
  }
}

/** The alias lines for the tokens one CSS block defines, in the block's own format. */
export function aliasLines(list: Deprecation[], definedHere: Set<string>, indent = '  '): string {
  const here = list.filter((d) => definedHere.has(d.use));
  if (here.length === 0) return '';
  let out = `\n${indent}/* ---- Deprecated names (docs/release.md, "Deprecation") ---- */\n`;
  for (const d of here) out += `${indent}/* ${deprecationNote(d)} */\n${indent}${d.name}: var(${d.use});\n`;
  return out;
}
