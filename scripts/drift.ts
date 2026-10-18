// Drift check: does the repo's token export still match Figma? (docs/tokens.md, "Drift check")
//
//   npm run tokens:drift              step 1 writes tokens/figma/drift/check.js; step 2 reads its result
//   npm run tokens:drift -- --apply   write the Figma version into tokens/figma/raw (then npm run tokens)
//
// tokens/figma/drift/ is not committed. check.js is scripts/figma/drift-check.js with the repo's
// per-variable hashes filled in; run it through use_figma and save each result as result-N.json.
// Exit code: 0 no drift, 1 drift reported, 2 waiting for the Figma result.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { loadExport } from './tokens/core';
import { chunk, compare, diff, fingerprint, hasDrift, mergeExport, toMarkdown, type FigmaResult } from './tokens/drift';

const root = resolve(import.meta.dirname, '..');
const rawDir = join(root, 'tokens/figma/raw');
const driftDir = join(root, 'tokens/figma/drift');
const apply = process.argv.includes('--apply');
const rel = (p: string) => p.replace(root + '/', '');

const local = loadExport(rawDir);
const mine = fingerprint(local);

function writeCheckScript(reason: string) {
  const template = readFileSync(join(root, 'scripts/figma/drift-check.js'), 'utf8');
  const script = template.replace("const LOCAL = { hashes: {}, meta: '', localHash: '' };", `const LOCAL = ${JSON.stringify(mine)};`);
  mkdirSync(driftDir, { recursive: true });
  for (const f of readdirSync(driftDir).filter((f) => f.startsWith('result-'))) rmSync(join(driftDir, f));
  writeFileSync(join(driftDir, 'check.js'), script);
  console.log(
    `${reason}Run ${rel(driftDir)}/check.js through use_figma (read-only) and save its result as ${rel(driftDir)}/result-0.json ` +
      `(and result-1.json, … with CHUNK = 1, … if it reports of > 1). Then run npm run tokens:drift again.`,
  );
  process.exit(2);
}

// ---------- step 1: no result yet, or a result for an older repo state ----------

const parts = existsSync(driftDir)
  ? readdirSync(driftDir)
      .filter((f) => /^result-\d+\.json$/.test(f))
      .sort((a, b) => parseInt(a.slice(7)) - parseInt(b.slice(7)))
      .map((f) => JSON.parse(readFileSync(join(driftDir, f), 'utf8')))
  : [];
if (!parts.length) writeCheckScript('');
if (parts[0].localHash !== mine.localHash) writeCheckScript('The saved Figma result was checked against an older tokens/figma/raw; wrote a fresh check. ');
if (parts.length < parts[0].of) {
  console.log(`The Figma result has ${parts[0].of} chunks and ${parts.length} are saved. Run check.js with CHUNK = ${parts.length}…${parts[0].of - 1}.`);
  process.exit(2);
}

// ---------- step 2: compare and report ----------

const result: FigmaResult = {
  at: parts[0].at,
  count: parts[0].count,
  localHash: parts[0].localHash,
  metaChanged: parts[0].metaChanged,
  meta: parts[0].meta,
  removed: parts[0].removed,
  records: parts.flatMap((p) => p.records),
};
const cmp = compare(local, result);
if (!hasDrift(cmp)) {
  console.log(`No drift: all ${result.count} variables, the collections and the styles match Figma (checked ${result.at}).`);
  process.exit(0);
}

const next = mergeExport(local, cmp, result);
const report = diff(local, next, cmp);
const markdown = toMarkdown(report, cmp, result.at, result.count);
writeFileSync(join(driftDir, 'report.md'), markdown + '\n');
console.log(markdown);
console.log(`Report saved to ${rel(driftDir)}/report.md.`);

if (!apply) {
  console.log('To take the Figma version: npm run tokens:drift -- --apply, then npm run tokens and the checksum (docs/tokens.md).');
  process.exit(1);
}
if (report.buildError) {
  console.log('Not applied: the Figma version does not build. Fix it in Figma first.');
  process.exit(1);
}

// ---------- apply ----------

for (const f of readdirSync(rawDir).filter((f) => f.endsWith('.json'))) rmSync(join(rawDir, f));
const pad = (n: number) => String(n).padStart(2, '0');
const chunks = chunk(next.raw);
const of = chunks.length + 1;
writeFileSync(join(rawDir, '00.json'), JSON.stringify({ chunk: 0, of, totalVariables: next.raw.length, exportedAt: next.exportedAt, meta: next.meta }) + '\n');
chunks.forEach((vars, i) => writeFileSync(join(rawDir, `${pad(i + 1)}.json`), JSON.stringify({ chunk: i + 1, of, variables: vars }) + '\n'));
rmSync(driftDir, { recursive: true, force: true });
console.log(
  `Applied: ${rel(rawDir)} now holds the Figma version (${next.raw.length} variables in ${of} chunks). ` +
    'Next: npm run tokens, then confirm npm run tokens:checksum equals scripts/figma/checksum.js in Figma.',
);
