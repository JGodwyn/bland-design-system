// The `bland-ui` command that ships in the package (Godwin 2026-11-21), bundled to dist/cli.js by `npm run build`.
// Today it has one job: the brand override, the same generator and contrast check as the docs site's Brand theme
// page and the repo's `npm run brand`, so a project (or its agent) can make brand.css from one color:
//
//   npx bland-ui brand "#ff5a1f" --out src/brand.css      (generate; `brand generate "#…"` works too)
//   npx bland-ui brand check src/brand.css                 (re-check a file after a hand edit)
//
// It hands the arguments to scripts/brand.ts, which reads them from process.argv.
const usage = `bland-ui: tools for projects that use Bland.

  npx bland-ui brand "#rrggbb" --out src/brand.css [options]
      Makes the project's brand override: 13 brand steps from one color (the color itself lands unchanged on
      the step its lightness belongs on), 13 neutral steps tinted toward it, the chart palette, then the
      contrast check. The same result as the Brand theme page on https://blandui.com/docs/#/brand.
      --fix                         move other steps until the brand pairings pass (never the color you gave)
      --neutrals full|subtle|none   how far the grays lean toward the brand (default full)
      --extra name[=#rrggbb]        an extra color for the project's own UI, up to three
      --chart N=#rrggbb             pick chart series N's color (2 to 8)
      --font-body "Family"          the project's fonts (also --font-heading, --font-code)
      --at <step>                   put the color on another step

  npx bland-ui brand check src/brand.css [--fix] [--out fixed.css]
      Re-checks an override file's contrast after a hand edit.

The check warns and never blocks: exit code 1 when a pairing is below its minimum, 0 otherwise.`;

const [command, ...args] = process.argv.slice(2);

if (command !== 'brand' || !args.length || args[0] === '--help' || args[0] === '-h') {
  console.log(usage);
  process.exitCode = command && command !== '--help' && command !== '-h' ? 2 : 0;
} else {
  const sub = args[0] === 'generate' || args[0] === 'check' ? args : ['generate', ...args];
  process.argv = [process.argv[0]!, process.argv[1]!, ...sub];
  try {
    await import('./brand');
  } catch (error) {
    console.error(`bland-ui brand: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 2;
  }
}

export {};
