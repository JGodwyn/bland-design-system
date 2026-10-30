// npm run test:drift. Simulates drift on a copy of the real export and checks what the report finds.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { loadExport, type Export, type RawVariable } from './core';
import { chunk, compare, diff, fingerprint, fnv, hasDrift, mergeExport, type FigmaResult, type LocalFingerprint } from './drift';

const local = loadExport(resolve(import.meta.dirname, '../../tokens/figma/raw'));
/** What scripts/figma/drift-check.js returns, computed the same way in TypeScript. */
function figmaSide(figmaExport: Export, mine: LocalFingerprint): FigmaResult {
  const inFigma = new Set(figmaExport.raw.map((v) => v[0]));
  const metaChanged = fnv(JSON.stringify(figmaExport.meta)) !== mine.meta;
  return {
    at: '2026-10-18T00:00:00.000Z',
    count: figmaExport.raw.length,
    localHash: mine.localHash,
    metaChanged,
    ...(metaChanged && { meta: figmaExport.meta }),
    removed: Object.keys(mine.hashes).filter((id) => !inFigma.has(id)),
    records: figmaExport.raw.filter((v) => mine.hashes[v[0]] !== fnv(JSON.stringify(v))),
  };
}
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
const find = (e: Export, name: string) => e.raw.find((v) => v[1] === name)!;

// Figma after a round of edits: Brand600 recolored, a description reworded, one variable added, one deleted.
const figmaExport = clone(local);
find(figmaExport, 'Brand/Brand600')[5]['25:1'] = '#1a4fe0ff';
find(figmaExport, 'space-md')[4] = 'Spacing of 12px, reworded.';
figmaExport.raw = figmaExport.raw.filter((v) => v[1] !== 'Border/border-minimal');
const added: RawVariable = ['9999:1', 'duration/test', '6367:388', 'TIMING', 'A test duration.', { '6367:0': 0.3 }];
figmaExport.raw.push(added);
const result = figmaSide(figmaExport, fingerprint(local));
const ids = (names: string[]) => names.map((n) => find(figmaExport, n)[0]).sort();

test('no drift when Figma matches the repo: the result carries no records', () => {
  const clean = figmaSide(local, fingerprint(local));
  assert.deepEqual([clean.records, clean.removed, clean.metaChanged], [[], [], false]);
  assert.equal(hasDrift(compare(local, clean)), false);
});

test('Figma returns only the records that differ, and the repo sorts them into added and changed', () => {
  assert.equal(result.records.length, 3);
  const cmp = compare(local, result);
  assert.deepEqual(cmp.added, ['9999:1']);
  assert.deepEqual(cmp.removed, [find(local, 'Border/border-minimal')[0]]);
  assert.deepEqual([...cmp.changed].sort(), ids(['Brand/Brand600', 'space-md']));
});

test('the report lists each variable change and every CSS token it reaches', () => {
  const cmp = compare(local, result);
  const report = diff(local, mergeExport(local, cmp, result), cmp);

  const brand = report.variables.find((v) => v.name === 'Brand/Brand600')!;
  assert.deepEqual(brand.fields, [{ field: 'Value', before: '#0062ffff', after: '#1a4fe0ff' }]);
  assert.equal(report.variables.find((v) => v.name === 'space-md')!.fields[0]!.field, 'description');

  const token = (css: string) => report.tokens.find((t) => t.css === css);
  // The primitive is hidden, but the change reaches every Theme token and shadow that aliases it.
  // Brand primary uses Brand600 in both modes, so both change.
  assert.deepEqual(token('--button-brand-primary-rest')!.fields, [
    { field: 'light', before: '#0062ff', after: '#1a4fe0' },
    { field: 'dark', before: '#0062ff', after: '#1a4fe0' },
  ]);
  // surface-brand is Brand600 in light only (Brand400 in dark), so only light changes.
  assert.deepEqual(token('--surface-brand')!.fields.map((f) => f.field), ['light']);
  assert.ok(token('--elevation-brand-near'), 'brand shadows use Brand alphas, which follow Brand600');
  assert.equal(token('--space-md')!.fields[0]!.field, 'description');
  assert.equal(token('--border-minimal')!.kind, 'removed');
  assert.equal(token('--duration-test')!.kind, 'added');
  assert.equal(report.buildError, undefined);
});

test('a deleted variable that others alias makes the report say the Figma version does not build', () => {
  const broken = clone(local);
  broken.raw = broken.raw.filter((v) => v[1] !== 'Brand/Brand600');
  const r = figmaSide(broken, fingerprint(local));
  const cmp = compare(local, r);
  const report = diff(local, mergeExport(local, cmp, r), cmp);
  assert.match(report.buildError ?? '', /Unknown variable/);
});

test('applying writes chunks that hash exactly like Figma', () => {
  const merged = mergeExport(local, compare(local, result), result);
  const sorted = (raw: RawVariable[]) => fnv(JSON.stringify([...raw].sort((a, b) => a[0].localeCompare(b[0]))));
  assert.equal(sorted(chunk(merged.raw).flat()), sorted(figmaExport.raw));
  assert.ok(chunk(merged.raw).every((c) => JSON.stringify(c).length < 18100));
});

test('a family change in Figma reaches its font token, and the text styles follow through it', () => {
  const renamed = clone(local);
  find(renamed, 'family/body')[5]['6047:1'] = 'Söhne';
  const r = figmaSide(renamed, fingerprint(local));
  const cmp = compare(local, r);
  const report = diff(local, mergeExport(local, cmp, r), cmp);
  const token = (css: string) => report.tokens.find((t) => t.css === css);
  // A family Bland has no stack for gets the role's fallbacks.
  assert.deepEqual(token('--font-body')!.fields.find((f) => f.field === 'value'), {
    field: 'value',
    before: '"Inter", system-ui, sans-serif',
    after: '"Söhne", system-ui, sans-serif',
  });
  assert.ok(token('--type-body-md'), 'the resolved text style changes too');
  // Headings point at body, so they follow it: their resolved stack changes, their var() does not.
  assert.ok(token('--font-heading'), 'the heading font follows the body font');
  assert.equal(token('--font-code'), undefined);
  assert.equal(report.buildError, undefined);
});
