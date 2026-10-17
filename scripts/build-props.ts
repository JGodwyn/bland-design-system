// Reads every component's props (types, defaults, JSDoc) from the TypeScript source and writes
// playground/.generated/props.json for the docs site's props tables and live controls.
// Runs before `npm run playground` and the Playwright web server. Generated; not committed.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import Module from 'node:module';
import { join, resolve } from 'node:path';

// The project compiles with TypeScript 7, which has no JavaScript API. react-docgen-typescript needs
// one, so its `require('typescript')` is pointed at the typescript5 alias (typescript@5.9) instead.
const M = Module as unknown as { _resolveFilename: (request: string, ...rest: unknown[]) => string };
const resolveFilename = M._resolveFilename;
M._resolveFilename = function (request, ...rest) {
  return resolveFilename.call(this, request === 'typescript' ? 'typescript5' : request, ...rest);
};
const { withCustomConfig } = await import('react-docgen-typescript');

const root = resolve(import.meta.dirname, '..');
const componentsDir = join(root, 'src/components');
const files = readdirSync(componentsDir, { withFileTypes: true, recursive: true })
  .filter((f) => f.isFile() && /^[A-Z].*\.tsx$/.test(f.name))
  .map((f) => join(f.parentPath, f.name));

const parser = withCustomConfig(join(root, 'tsconfig.json'), {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  savePropValueAsString: true,
  // Keep only props declared in Bland's own source, not the hundreds inherited from HTML attributes.
  propFilter: (prop) => !prop.parent || !prop.parent.fileName.includes('node_modules'),
});

type Prop = { name: string; type: string; options?: string[]; required: boolean; default?: string; description: string };
const out: Record<string, { description: string; file: string; props: Prop[] }> = {};

for (const doc of parser.parse(files)) {
  if (!/^[A-Z]/.test(doc.displayName)) continue;
  const props = Object.values(doc.props).map((p): Prop => {
    const values = (p.type.value as { value: string }[] | undefined)?.map((v) => v.value.replace(/^"|"$/g, ''));
    return {
      name: p.name,
      type: p.type.raw ?? p.type.name,
      ...(p.type.name === 'enum' && values && { options: values }),
      required: p.required,
      ...(p.defaultValue?.value !== undefined && { default: String(p.defaultValue.value).replace(/^'|'$/g, '') }),
      description: p.description,
    };
  });
  out[doc.displayName] = { description: doc.description, file: doc.filePath.replace(root + '/', ''), props };
}

mkdirSync(join(root, 'playground/.generated'), { recursive: true });
writeFileSync(join(root, 'playground/.generated/props.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`props: ${Object.keys(out).length} components (${Object.keys(out).join(', ')})`);
