// Figma Plugin API script, run through the Figma MCP `use_figma` tool (read-only).
// Returns { count, hash } of the variables in the same compact format as dump-tokens.js.
// Compare with `npx tsx scripts/figma/checksum.ts`: equal hashes mean the repo matches Figma.

const hex = c => { const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); return '#' + h(c.r) + h(c.g) + h(c.b) + h(c.a ?? 1); };
const strip = id => id.replace(/^VariableID:/, '');
const value = v => {
  if (v && typeof v === 'object') {
    if (v.type === 'VARIABLE_ALIAS') return '@' + strip(v.id);
    if ('color' in v) { const src = v.color.type === 'VARIABLE_ALIAS' ? strip(v.color.id) : hex(v.color); return { '@': src, o: v.opacity }; }
    if ('r' in v) return hex(v);
  }
  return typeof v === 'number' ? Math.round(v * 10000) / 10000 : v;
};
const vars = (await figma.variables.getLocalVariablesAsync()).map(v => [strip(v.id), v.name, v.variableCollectionId.replace(/^VariableCollectionId:/, ''), v.resolvedType, v.description, Object.fromEntries(Object.entries(v.valuesByMode).map(([m, x]) => [m, value(x)]))]);
vars.sort((a, b) => a[0].localeCompare(b[0]));
const fnv = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0; return h.toString(16); };
return { count: vars.length, hash: fnv(JSON.stringify(vars)) };
