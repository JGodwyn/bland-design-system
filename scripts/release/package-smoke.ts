// Package smoke test: what a project gets from `npm install bland-ui` (docs/release.md, "Check the package").
//
//   npm run test:package              packs bland, installs the tarball into a throwaway Vite + React app,
//                                     type-checks and builds that app, then checks it in Chromium
//   npm run test:package -- <dir>     builds the app in <dir> (kept) instead of a temp folder
//
// The app imports the four stylesheets in the documented order, a brand override made by `npm run brand`
// (with one extra color and its own code font) and a few components, in a light and a dark section. Needs the network (npm install).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '../..');
const app = process.argv[2] ? resolve(process.argv[2]) : mkdtempSync(join(tmpdir(), 'bland-smoke-'));
const port = 5191;
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const dev = pkg.devDependencies as Record<string, string>;

function run(cmd: string, args: string[], cwd: string, allowFail = false) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' });
  if (r.status !== 0 && !allowFail) throw new Error(`${cmd} ${args.join(' ')} exited ${r.status}`);
  return r.status;
}

// 1. Pack (prepack runs the build) and check what the tarball holds.
mkdirSync(app, { recursive: true });
console.log(`$ npm pack (into ${app})`);
const packed = spawnSync('npm', ['pack', '--json', '--pack-destination', app], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
if (packed.status !== 0) throw new Error('npm pack failed');
const [info] = JSON.parse(packed.stdout.slice(packed.stdout.indexOf('['))) as { filename: string; size: number; unpackedSize: number; files: { path: string }[] }[];
const files = info!.files.map((f) => f.path);
const required = ['package.json', 'LICENSE', 'README.md', 'CHANGELOG.md', 'dist/index.js', 'dist/index.d.ts', 'dist/index.css', 'dist/tokens.css', 'dist/fonts.css', 'dist/base.css'];
const missing = required.filter((f) => !files.includes(f));
const stray = files.filter((f) => !/^(package\.json|README\.md|CHANGELOG\.md|LICENSE|dist\/.*\.(js|d\.ts|css))$/.test(f) || /stories|\.test\./.test(f));
console.log(`${info!.filename}: ${files.length} files, ${(info!.size / 1024).toFixed(0)} kB packed, ${(info!.unpackedSize / 1024).toFixed(0)} kB unpacked`);
if (missing.length || stray.length) throw new Error(`tarball: missing ${missing.join(', ') || 'none'}; unexpected ${stray.join(', ') || 'none'}`);

// 2. The throwaway app.
mkdirSync(join(app, 'src'), { recursive: true });
writeFileSync(join(app, 'package.json'), JSON.stringify({
  name: 'bland-smoke-app',
  private: true,
  type: 'module',
  scripts: { build: 'tsc --noEmit && vite build', preview: `vite preview --port ${port} --strictPort` },
  dependencies: { 'bland-ui': `file:./${info!.filename}`, react: dev.react, 'react-dom': dev['react-dom'] },
  devDependencies: { vite: dev.vite, '@vitejs/plugin-react': dev['@vitejs/plugin-react'], typescript: dev.typescript, '@types/react': dev['@types/react'], '@types/react-dom': dev['@types/react-dom'] },
}, null, 2));
// ES2023 lib: React Aria's @internationalized/number types use Intl.NumberRangeFormatPart. skipLibCheck off, so Bland's own .d.ts files are checked too.
writeFileSync(join(app, 'tsconfig.json'), JSON.stringify({
  compilerOptions: { target: 'ES2023', lib: ['ES2023', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: false, noEmit: true, types: [] },
  include: ['src'],
}, null, 2));
writeFileSync(join(app, 'vite.config.js'), `import react from '@vitejs/plugin-react';\nexport default { plugins: [react()] };\n`);
writeFileSync(join(app, 'index.html'), `<!doctype html>\n<html lang="en"><head><meta charset="utf-8" /><title>Bland smoke</title></head>\n<body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`);
writeFileSync(join(app, 'src/css.d.ts'), `declare module '*.css';\n`);
writeFileSync(join(app, 'src/main.tsx'), `// Order: tokens, fonts, base, components, then the project's brand override.
import 'bland-ui/tokens.css';
import 'bland-ui/fonts.css';
import 'bland-ui/base.css';
import 'bland-ui/styles.css';
import './brand.css';
import './app.css';
import { createRoot } from 'react-dom/client';
import { Alert, Badge, Button, CodeText, TextInput, Toggle, Tooltip, type ButtonProps } from 'bland-ui';

const primary: ButtonProps['emotion'] = 'brand';

function Section({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <section data-theme={theme} data-testid={theme} className="section">
      <h2 className="title">Settings</h2>
      <Tooltip text="Saves the draft">
        <Button emotion={primary} type="primary">Save</Button>
      </Tooltip>
      <Badge emotion="success">Live</Badge>
      <TextInput label="Name" placeholder="Ada Lovelace" />
      <Toggle defaultChecked>Notifications</Toggle>
      <Alert status="warning">Heads up</Alert>
      <CodeText>npm install bland-ui</CodeText>
      <div className="accent" data-testid={theme + '-accent'}>Accent</div>
    </section>
  );
}

createRoot(document.getElementById('root')!).render(<><Section theme="light" /><Section theme="dark" /></>);
`);
writeFileSync(join(app, 'src/app.css'), `.section { display: flex; flex-wrap: wrap; gap: var(--space-md); padding: var(--space-lg); background: var(--surface-100); color: var(--text-bold); }
.accent { padding: var(--space-sm); background: var(--accent-surface-light); color: var(--accent-text); }
.title { margin: 0; font: var(--type-title-md); letter-spacing: var(--type-title-md-letter-spacing); }
`);

// 3. The brand override, made by the tool as a project would (it exits 1 on a contrast warning; that's fine here).
run('npx', ['tsx', 'scripts/brand.ts', 'generate', '#ff5a1f', '--extra', 'accent', '--font-heading', 'Smoke Serif, serif', '--font-code', 'Smoke Mono', '--out', join(app, 'src/brand.css')], root, true);
if (!existsSync(join(app, 'src/brand.css'))) throw new Error('npm run brand wrote no brand.css');

// 4. Install, type-check, build. A reused app dir would keep the old tarball's copy (same version), so drop it.
rmSync(join(app, 'node_modules/bland-ui'), { recursive: true, force: true });
rmSync(join(app, 'package-lock.json'), { force: true });
run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], app);
run('npm', ['run', 'build'], app);

// 5. Serve the build and check it in Chromium.
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { cwd: app, stdio: 'ignore' });
const problems: string[] = [];
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://localhost:${port}/`)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // tsx compiles named inner functions with an __name() helper that page.evaluate carries into the page.
  await page.addInitScript('window.__name = (fn) => fn');
  page.on('pageerror', (e) => problems.push(`page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => document.fonts.ready);

  const result = await page.evaluate(() => {
    const color = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop);
    const probe = (value: string, host: Element = document.body) => {
      const el = document.createElement('i');
      el.style.color = value;
      host.append(el);
      const c = getComputedStyle(el).color;
      el.remove();
      return c;
    };
    const light = document.querySelector('[data-testid=light]')!;
    const dark = document.querySelector('[data-testid=dark]')!;
    const button = light.querySelector('.bland-button')!;
    return {
      buttonFill: color(button, 'background-color'),
      brand600: probe('var(--brand-600)'),
      blandBlue: probe('#0062ff'),
      font: color(button, 'font-family'),
      interLoaded: document.fonts.check('16px Inter'),
      codeFont: color(light.querySelector('.bland-code-text__code')!, 'font-family'),
      titleFont: color(light.querySelector('.title')!, 'font-family'),
      lightSurface: color(light, 'background-color'),
      darkSurface: color(dark, 'background-color'),
      lightAccent: color(document.querySelector('[data-testid=light-accent]')!, 'color'),
      darkAccent: color(document.querySelector('[data-testid=dark-accent]')!, 'color'),
      smoothRadius: color(button, 'border-top-left-radius'),
      toggle: !!light.querySelector('input[role=switch]:checked'),
    };
  });
  console.log('\n', result);
  if (result.buttonFill !== result.brand600) problems.push(`primary button fill ${result.buttonFill} is not the brand override's 600 (${result.brand600})`);
  if (result.buttonFill === result.blandBlue) problems.push('primary button is still Bland blue: the brand override did not apply');
  if (!result.interLoaded || !result.font.includes('Inter')) problems.push(`Inter not in use (${result.font})`);
  if (!result.codeFont.startsWith('"Smoke Mono"')) problems.push(`CodeText does not follow the brand file's --font-code (${result.codeFont})`);
  // A heading font of its own reaches the Title styles while body text stays on Inter.
  if (result.titleFont !== '"Smoke Serif", serif') problems.push(`a Title style does not follow the brand file's --font-heading (${result.titleFont})`);
  if (result.lightSurface === result.darkSurface) problems.push('data-theme="dark" section has the light surface');
  if (!result.lightAccent || result.lightAccent === result.darkAccent) problems.push('extra color roles do not switch in dark');
  if (!result.toggle) problems.push('Toggle did not render checked');

  // Behaviour through the packaged React Aria: keyboard focus opens the tooltip at once.
  await page.keyboard.press('Tab');
  const tooltip = await page.getByRole('tooltip').textContent({ timeout: 2000 }).catch(() => null);
  if (tooltip !== 'Saves the draft') problems.push(`tooltip on focus: ${tooltip ?? 'none'}`);
  await page.screenshot({ path: join(app, 'smoke.png'), fullPage: true });
  await browser.close();
} finally {
  server.kill();
}

if (problems.length) {
  console.error(`\nPackage smoke test failed:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`\nPackage smoke test passed. App and screenshot: ${app}`);
