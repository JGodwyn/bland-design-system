// Figma Plugin API script, run through the Figma MCP `use_figma` tool (read-only).
//
// use_figma caps a return value at 20 KB, so the export is split into chunks.
// Set CHUNK below and run once per chunk, starting at 0. Each result says how many
// chunks there are. Save chunk N as tokens/figma/raw/NN.json, then `npm run tokens`
// merges them and generates the CSS.
//
// Compact format (expanded by scripts/build-tokens.ts):
//   color      "#rrggbbaa"
//   alias      "@25:62"                    (VariableID prefix stripped)
//   alpha      { "@": "25:62", "o": 6 }    (alias at N% opacity)
//   variable   [id, name, collectionId, type, description, { modeId: value }]

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

// Chunk 0 is meta; the rest are variables packed under MAX_BYTES.
const chunks = [];
let current = [];
let size = 0;
for (const v of vars) {
  const n = JSON.stringify(v).length + 1;
  if (size + n > MAX_BYTES && current.length) { chunks.push(current); current = []; size = 0; }
  current.push(v);
  size += n;
}
if (current.length) chunks.push(current);

const of = chunks.length + 1;
if (CHUNK === 0) return { chunk: 0, of, totalVariables: vars.length, exportedAt: new Date().toISOString(), meta };
return { chunk: CHUNK, of, variables: chunks[CHUNK - 1] };
