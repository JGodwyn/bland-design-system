// Builds the agent skill that ships in the package at dist/skill/ (Godwin 2026-11-21):
// the hand-written files in skill/ (SKILL.md and references/), with {{version}} filled in, plus
// references/components.md generated from playground/.generated/props.json (npm run props), so the
// component reference always matches the code it ships with. Run by `npm run build` after Vite.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = join(root, 'skill');
const out = join(root, 'dist/skill');
const version: string = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;

type Prop = { name: string; type: string; options?: string[]; required: boolean; default?: string; description: string };
type Doc = { description: string; file: string; props: Prop[] };

const propsFile = join(root, 'playground/.generated/props.json');
if (!existsSync(propsFile)) throw new Error('build-skill: run `npm run props` first (playground/.generated/props.json is missing)');
const docs: Record<string, Doc> = JSON.parse(readFileSync(propsFile, 'utf8'));

// Only what a project can import: the names exported from src/index.ts.
const index = readFileSync(join(root, 'src/index.ts'), 'utf8');
const exported = new Set(
  [...index.matchAll(/export\s*\{([^}]+)\}\s*from/g)]
    .flatMap((m) => m[1]!.split(','))
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith('type '))
    .map((s) => s.split(/\s+as\s+/).pop()!.trim()),
);

// Internal notes don't help a project: the Figma pointer at the end of each description.
const clean = (text: string) =>
  text
    .replace(/\s*Figma:[^\n]*$/s, '')
    .replace(/\s+/g, ' ')
    .trim();
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

const names = Object.keys(docs).filter((n) => exported.has(n)).sort((a, b) => a.localeCompare(b, 'en'));
const missing = [...exported].filter((n) => /^[A-Z]/.test(n) && !n.endsWith('Icon') && !docs[n]);

let md = `# Bland components (bland-ui ${version})\n\n`;
md +=
  'Generated from the package\'s TypeScript at build time: every component a project can import, its description and its props. ' +
  'Every component also takes the native attributes of its root element (`className`, `id`, `data-*`, `aria-*`), unless a prop below says where they go. ' +
  'Bland\'s own icons (`CheckIcon`, `XIcon`, …) are exported too; any SVG works in every icon prop.\n\n';
md += `Components: ${names.join(', ')}.\n`;
for (const name of names) {
  const doc = docs[name]!;
  md += `\n## ${name}\n\n\`import { ${name} } from 'bland-ui'\`\n\n`;
  const description = clean(doc.description);
  if (description) md += `${description}\n\n`;
  if (!doc.props.length) {
    md += 'No props of its own.\n';
    continue;
  }
  md += '| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n';
  for (const p of doc.props) {
    const type = p.options?.length ? p.options.map((o) => `\`'${o}'\``).join(' \\| ') : `\`${cell(p.type)}\``;
    const def = p.default != null && p.default !== '' ? `\`${cell(p.default)}\`` : p.required ? 'required' : '';
    md += `| \`${p.name}\` | ${type} | ${def} | ${cell(p.description)} |\n`;
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(src, out, { recursive: true });
const fill = (dir: string) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) fill(path);
    else if (entry.name.endsWith('.md')) writeFileSync(path, readFileSync(path, 'utf8').replaceAll('{{version}}', version));
  }
};
fill(out);
mkdirSync(join(out, 'references'), { recursive: true });
writeFileSync(join(out, 'references/components.md'), md);

console.log(`skill: dist/skill for bland-ui ${version}, ${names.length} components in references/components.md` + (missing.length ? `; no props found for ${missing.join(', ')}` : ''));
