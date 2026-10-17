// Checksum of the raw export, compared against the same computation run in Figma
// (scripts/figma/checksum.js through use_figma). A match proves the saved chunks are exact.
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '../../tokens/figma/raw');
const vars: unknown[][] = [];
for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const chunk = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  if (chunk.variables) vars.push(...chunk.variables);
}
vars.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

const fnv = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(16);
};
console.log(JSON.stringify({ count: vars.length, hash: fnv(JSON.stringify(vars)) }));
