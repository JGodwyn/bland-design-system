// Figma Plugin API script, run through the Figma MCP `use_figma` tool (read-only). The drift check's Figma half.
//
// You don't edit this file: `npm run tokens:drift` writes a copy to tokens/figma/drift/check.js with
// LOCAL filled in (a hash of every variable in tokens/figma/raw). Figma compares its own variables
// against those hashes and returns only what differs, with the full records, so a clean check returns
// almost nothing. Save the result as tokens/figma/drift/result-0.json; if it reports of > 1, run again
// with CHUNK = 1, 2, … and save result-1.json, … Then run `npm run tokens:drift` again. See docs/tokens.md.

const LOCAL = { hashes: {}, meta: '', localHash: '' };
const CHUNK = 0;
const MAX_BYTES = 18000;

const hex = c => {
  const h = n => Math.round(n * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b) + h(c.a ?? 1);
};
const strip = id => id.replace(/^VariableID:/, '');
const value = v => {
  if (v && typeof v === 'object') {
    if (v.type === 'VARIABLE_ALIAS') return '@' + strip(v.id);
    if ('color' in v) {
      const src = v.color.type === 'VARIABLE_ALIAS' ? strip(v.color.id) : hex(v.color);
      return { '@': src, o: v.opacity };
    }
    if ('r' in v) return hex(v);
  }
  return typeof v === 'number' ? Math.round(v * 10000) / 10000 : v;
};
const bound = b => {
  if (!b) return undefined;
  const out = {};
  for (const [k, ref] of Object.entries(b)) out[k] = strip(Array.isArray(ref) ? ref[0].id : ref.id);
  return out;
};

const meta = {
  fileKey: figma.fileKey,
  collections: (await figma.variables.getLocalVariableCollectionsAsync()).map(c => ({
    id: c.id.replace(/^VariableCollectionId:/, ''),
    name: c.name,
    hidden: c.hiddenFromPublishing,
    modes: c.modes.map(m => [m.modeId, m.name]),
  })),
  // Styles carry only their variable bindings; values are resolved from the variables.
  effectStyles: (await figma.getLocalEffectStylesAsync()).map(s => ({
    name: s.name,
    description: s.description,
    layers: s.effects.map(e => ({ type: e.type, ...bound(e.boundVariables) })),
  })),
  textStyles: (await figma.getLocalTextStylesAsync()).map(s => ({
    name: s.name,
    description: s.description,
    letterSpacing: s.letterSpacing,
    textCase: s.textCase,
    textDecoration: s.textDecoration,
    ...bound(s.boundVariables),
  })),
};

const vars = (await figma.variables.getLocalVariablesAsync()).map(v => [
  strip(v.id),
  v.name,
  v.variableCollectionId.replace(/^VariableCollectionId:/, ''),
  v.resolvedType,
  v.description,
  Object.fromEntries(Object.entries(v.valuesByMode).map(([m, x]) => [m, value(x)])),
]);

const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0; return h.toString(16); };
const inFigma = new Set(vars.map(v => v[0]));
const differing = vars.filter(v => LOCAL.hashes[v[0]] !== fnv(JSON.stringify(v)));
const metaChanged = fnv(JSON.stringify(meta)) !== LOCAL.meta;

const chunks = [];
let current = [];
let size = metaChanged ? JSON.stringify(meta).length : 0;
for (const v of differing) {
  const n = JSON.stringify(v).length + 1;
  if (size + n > MAX_BYTES && current.length) { chunks.push(current); current = []; size = 0; }
  current.push(v);
  size += n;
}
chunks.push(current);

return {
  chunk: CHUNK,
  of: chunks.length,
  at: new Date().toISOString(),
  count: vars.length,
  localHash: LOCAL.localHash,
  metaChanged,
  ...(metaChanged && CHUNK === 0 && { meta }),
  removed: CHUNK === 0 ? Object.keys(LOCAL.hashes).filter(id => !inFigma.has(id)) : [],
  records: chunks[CHUNK] ?? [],
};
