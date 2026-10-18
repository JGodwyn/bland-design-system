// Drift check logic: compare Figma's variables with the repo's raw export, variable by variable,
// and work out which CSS tokens a change reaches (aliases included). Used by scripts/drift.ts.
import { buildTokens, type Export, type Meta, type RawValue, type RawVariable, type Token } from './core';

/** The same 32-bit FNV-1a hash the Figma scripts compute, as hex. */
export const fnv = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16);
};

/** What the repo has, as the hashes baked into the Figma script. */
export type LocalFingerprint = { hashes: Record<string, string>; meta: string; localHash: string };

export function fingerprint(local: Export): LocalFingerprint {
  const hashes = Object.fromEntries(local.raw.map((v) => [v[0], fnv(JSON.stringify(v))]));
  const meta = fnv(JSON.stringify(local.meta));
  return { hashes, meta, localHash: fnv(JSON.stringify(hashes) + meta) };
}

/** What scripts/figma/drift-check.js returns, all chunks joined. */
export type FigmaResult = {
  at: string;
  count: number;
  localHash: string;
  metaChanged: boolean;
  meta?: Meta;
  removed: string[];
  records: RawVariable[];
};

export type Comparison = { added: string[]; removed: string[]; changed: string[]; metaChanged: boolean };

export function compare(local: Export, result: FigmaResult): Comparison {
  const here = new Set(local.raw.map((v) => v[0]));
  return {
    added: result.records.filter((v) => !here.has(v[0])).map((v) => v[0]),
    removed: result.removed,
    changed: result.records.filter((v) => here.has(v[0])).map((v) => v[0]),
    metaChanged: result.metaChanged,
  };
}

export const hasDrift = (c: Comparison) => c.added.length + c.removed.length + c.changed.length > 0 || c.metaChanged;

/** The export as it stands in Figma: local, minus removed, with changed and added records swapped in. */
export function mergeExport(local: Export, cmp: Comparison, result: FigmaResult): Export {
  const byId = new Map(result.records.map((v) => [v[0], v]));
  const removed = new Set(cmp.removed);
  const raw = local.raw.filter((v) => !removed.has(v[0])).map((v) => byId.get(v[0]) ?? v);
  for (const id of cmp.added) raw.push(byId.get(id)!);
  return { meta: cmp.metaChanged && result.meta ? result.meta : local.meta, exportedAt: result.at, raw };
}

export type FieldChange = { field: string; before: string; after: string };
export type VariableChange = { id: string; name: string; collection: string; kind: 'added' | 'removed' | 'changed'; fields: FieldChange[] };
export type TokenChange = { css: string; name: string; kind: 'added' | 'removed' | 'changed'; fields: FieldChange[] };
export type Report = { variables: VariableChange[]; tokens: TokenChange[]; styles: FieldChange[]; buildError?: string };

/** Step 2: the full per-variable report, plus every CSS token whose output changes. */
export function diff(before: Export, after: Export, cmp: Comparison): Report {
  const names = (e: Export) => new Map(e.raw.map((v) => [v[0], v[1]]));
  const beforeNames = names(before);
  const afterNames = names(after);
  const collectionName = (e: Export, id: string) => e.meta.collections.find((c) => c.id === id)?.name ?? id;
  const modeName = (e: Export, id: string) => {
    for (const c of e.meta.collections) for (const [m, n] of c.modes) if (m === id) return c.modes.length > 1 ? n : 'Value';
    return id;
  };
  const show = (e: Export, nameOf: Map<string, string>, value: RawValue | undefined): string => {
    if (value === undefined) return '(none)';
    if (typeof value === 'string' && value.startsWith('@')) return `→ ${nameOf.get(value.slice(1)) ?? value}`;
    if (typeof value === 'object' && '@' in value) {
      const src = value['@'].startsWith('#') ? value['@'] : (nameOf.get(value['@']) ?? value['@']);
      return `${src} at ${value.o}%`;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const before_ = new Map(before.raw.map((v) => [v[0], v]));
  const after_ = new Map(after.raw.map((v) => [v[0], v]));
  const variables: VariableChange[] = [];

  for (const id of cmp.removed) {
    const v = before_.get(id)!;
    variables.push({ id, name: v[1], collection: collectionName(before, v[2]), kind: 'removed', fields: [] });
  }
  for (const id of cmp.added) {
    const v = after_.get(id)!;
    const fields = Object.entries(v[5]).map(([m, val]) => ({ field: modeName(after, m), before: '', after: show(after, afterNames, val) }));
    variables.push({ id, name: v[1], collection: collectionName(after, v[2]), kind: 'added', fields });
  }
  for (const id of cmp.changed) {
    const a = before_.get(id)!;
    const b = after_.get(id)!;
    const fields: FieldChange[] = [];
    if (a[1] !== b[1]) fields.push({ field: 'name', before: a[1], after: b[1] });
    if (a[2] !== b[2]) fields.push({ field: 'collection', before: collectionName(before, a[2]), after: collectionName(after, b[2]) });
    if (a[3] !== b[3]) fields.push({ field: 'type', before: a[3], after: b[3] });
    if (a[4] !== b[4]) fields.push({ field: 'description', before: a[4], after: b[4] });
    for (const m of new Set([...Object.keys(a[5]), ...Object.keys(b[5])])) {
      const x = show(before, beforeNames, a[5][m]);
      const y = show(after, afterNames, b[5][m]);
      if (x !== y) fields.push({ field: modeName(after, m), before: x, after: y });
    }
    // An alias whose target was renamed reads the same but hashes differently; say so rather than show nothing.
    if (!fields.length) fields.push({ field: 'value', before: 'raw record changed', after: 'same when read (an alias target was renamed?)' });
    variables.push({ id, name: b[1], collection: collectionName(after, b[2]), kind: 'changed', fields });
  }

  const styles: FieldChange[] = [];
  if (cmp.metaChanged) {
    const list = (m: Meta) => [...m.effectStyles.map((s) => ['effect', s.name, JSON.stringify(s)]), ...m.textStyles.map((s) => ['text', s.name, JSON.stringify(s)])];
    const a = new Map(list(before.meta).map(([k, n, j]) => [`${k}:${n}`, j]));
    const b = new Map(list(after.meta).map(([k, n, j]) => [`${k}:${n}`, j]));
    for (const key of new Set([...a.keys(), ...b.keys()])) {
      if (a.get(key) !== b.get(key)) styles.push({ field: key.replace(':', ' style '), before: a.has(key) ? 'present' : '(none)', after: b.has(key) ? (a.has(key) ? 'changed' : 'added') : 'removed' });
    }
    if (JSON.stringify(before.meta.collections) !== JSON.stringify(after.meta.collections)) styles.push({ field: 'collections or modes', before: 'as in repo', after: 'changed in Figma' });
  }

  let tokens: TokenChange[] = [];
  let buildError: string | undefined;
  try {
    tokens = diffTokens(buildTokens(before).tokens, buildTokens(after).tokens);
  } catch (e) {
    buildError = (e as Error).message;
  }
  return { variables, tokens, styles, buildError };
}

function diffTokens(before: Token[], after: Token[]): TokenChange[] {
  const a = new Map(before.map((t) => [t.css, t]));
  const b = new Map(after.map((t) => [t.css, t]));
  const out: TokenChange[] = [];
  for (const [css, t] of a) if (!b.has(css)) out.push({ css, name: t.name, kind: 'removed', fields: [] });
  for (const [css, t] of b) {
    const old = a.get(css);
    if (!old) {
      out.push({ css, name: t.name, kind: 'added', fields: [{ field: 'value', before: '', after: t.dark && t.dark !== t.light ? `${t.light} / ${t.dark}` : t.light }] });
      continue;
    }
    const fields: FieldChange[] = [];
    if (old.light !== t.light) fields.push({ field: t.dark !== undefined ? 'light' : 'value', before: old.light, after: t.light });
    if ((old.dark ?? '') !== (t.dark ?? '')) fields.push({ field: 'dark', before: old.dark ?? '(none)', after: t.dark ?? '(none)' });
    if (old.description !== t.description) fields.push({ field: 'description', before: old.description, after: t.description });
    if (fields.length) out.push({ css, name: t.name, kind: 'changed', fields });
  }
  return out;
}

/** Splits variables into chunks under the use_figma size the raw export uses. */
export function chunk(raw: RawVariable[], maxBytes = 18000): RawVariable[][] {
  const chunks: RawVariable[][] = [];
  let current: RawVariable[] = [];
  let size = 0;
  for (const v of raw) {
    const n = JSON.stringify(v).length + 1;
    if (size + n > maxBytes && current.length) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(v);
    size += n;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/** The report as Markdown: what changed in Figma, then what that does to the CSS. */
export function toMarkdown(report: Report, cmp: Comparison, at: string, total: number): string {
  const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const lines: string[] = [
    '# Token drift report',
    '',
    `Checked against Figma ${at}. ${total} variables in Figma: ${cmp.added.length} added, ${cmp.removed.length} removed, ${cmp.changed.length} changed${cmp.metaChanged ? ', collections or styles changed' : ''}.`,
    '',
  ];
  if (report.buildError) lines.push(`**The Figma version does not build:** ${report.buildError}`, '');
  if (report.variables.length) {
    lines.push('## Variables', '', '| Variable | Collection | Change | Field | Repo | Figma |', '| --- | --- | --- | --- | --- | --- |');
    for (const v of report.variables) {
      if (!v.fields.length) lines.push(`| ${esc(v.name)} | ${v.collection} | ${v.kind} | | | |`);
      for (const [i, f] of v.fields.entries())
        lines.push(`| ${i ? '' : esc(v.name)} | ${i ? '' : v.collection} | ${i ? '' : v.kind} | ${f.field} | ${esc(f.before)} | ${esc(f.after)} |`);
    }
    lines.push('');
  }
  if (report.styles.length) {
    lines.push('## Styles and collections', '', '| What | Repo | Figma |', '| --- | --- | --- |');
    for (const s of report.styles) lines.push(`| ${esc(s.field)} | ${s.before} | ${s.after} |`);
    lines.push('');
  }
  lines.push('## CSS tokens affected', '');
  if (!report.tokens.length) lines.push(report.buildError ? 'Unknown until the Figma version builds.' : 'None: the change does not reach the generated CSS.', '');
  else {
    lines.push('| Token | Change | Field | Repo | Figma |', '| --- | --- | --- | --- | --- |');
    for (const t of report.tokens) {
      if (!t.fields.length) lines.push(`| \`${t.css}\` | ${t.kind} | | | |`);
      for (const [i, f] of t.fields.entries()) lines.push(`| ${i ? '' : `\`${t.css}\``} | ${i ? '' : t.kind} | ${f.field} | ${esc(f.before)} | ${esc(f.after)} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
}
