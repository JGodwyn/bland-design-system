// Brand override tool (docs/brand.md).
//
//   npm run brand -- generate "#ff5a1f" [--at 400] [--neutrals full|subtle|none] [--extra accent=#7c3aed …] [--fix] [--out brand.css]
//       13 brand steps from one color (placed on the step its lightness belongs on, or --at), 13 neutral steps
//       tinted toward it, up to three extra colors (13 steps and light/dark roles each), then the check
//   npm run brand -- check brand.css [--neutrals full|subtle|none] [--fix] [--out fixed.css]
//       the contrast check for an override file (its neutrals, or Bland's when it sets none, and its extra colors)
//
// --neutrals sets how far the grays lean toward the brand: full (Bland's own amount, the default), subtle (half)
// or none (pure gray). On check it regenerates the file's neutrals from its brand. --fix takes the suggested brand
// steps, regenerates the neutrals from the fixed brand and checks again; on generate it never moves the step that
// holds the color you gave. The check warns and never
// blocks: exit code 1 when a pairing still misses its minimum, 0 otherwise.
import { readFileSync, writeFileSync } from 'node:fs';

import {
  EXTRA_PAIRS,
  extraNameError,
  generate,
  generateNeutrals,
  MAX_EXTRAS,
  parseExtras,
  parseNeutrals,
  parseScale,
  placeStep,
  report,
  STEPS,
  TINTS,
  toCss,
  type Extra,
  type Scale,
  type Step,
  type Tint,
} from './brand/core';

const [command, arg, ...rest] = process.argv.slice(2);
const fix = rest.includes('--fix');
const flag = (name: string) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? undefined : rest[i + 1];
};
const tintFlag = flag('neutrals') as Tint | undefined;
/** Every `--extra name=#hex`, made into scales; the entered color's step is pinned for --fix. */
function extrasFromFlags(): (Extra & { keep?: Step })[] {
  const given = rest.flatMap((a, i) => (a === '--extra' && rest[i + 1] ? [rest[i + 1]!] : []));
  if (given.length > MAX_EXTRAS) throw new Error(`Up to ${MAX_EXTRAS} extra colors.`);
  const names: string[] = [];
  return given.map((g) => {
    const [name = '', hex = ''] = g.split('=');
    const problem = extraNameError(name, names);
    if (problem) throw new Error(`--extra ${g}: ${problem}`);
    names.push(name);
    return { name, scale: generate(hex), keep: placeStep(hex) };
  });
}
if (tintFlag && !TINTS.includes(tintFlag)) throw new Error(`--neutrals must be one of ${TINTS.join(', ')}.`);

function finish(text: string, failures: number) {
  console.log(text);
  if (failures) console.log(`\n${failures} pairing${failures > 1 ? 's' : ''} below the minimum. Adjust the steps named, or keep them on purpose.`);
  process.exitCode = failures ? 1 : 0;
}

/**
 * Checks a brand scale with its neutrals (generated at `tint`, or the file's own when `tint` is undefined); with
 * --fix takes the suggestions once and checks again. Writes or prints the CSS when asked.
 */
function run(scale: Scale, note: string, print: boolean, tint: Tint | undefined, own?: Scale, keep?: Step, extras: (Extra & { keep?: Step })[] = []) {
  const neutralsFor = (brand: Scale) => (tint ? generateNeutrals(brand, tint) : own);
  let neutrals = neutralsFor(scale);
  let { text, failures, fixes } = report(scale, neutrals, keep);
  if (fix && Object.keys(fixes).length) {
    console.log(`${text}\n\nApplying the suggested steps…\n`);
    scale = { ...scale, ...fixes };
    neutrals = neutralsFor(scale);
    note += ', suggested steps applied';
    ({ text, failures } = report(scale, neutrals, keep));
  }
  // Each extra color is checked on its own roles, against the final neutrals.
  for (const x of extras) {
    let r = report(x.scale, neutrals, x.keep, EXTRA_PAIRS, `Extra color ${x.name}`);
    if (fix && Object.keys(r.fixes).length) {
      x.scale = { ...x.scale, ...r.fixes };
      r = report(x.scale, neutrals, x.keep, EXTRA_PAIRS, `Extra color ${x.name}`);
    }
    text += `\n\n${r.text}`;
    failures += r.failures;
  }
  if (tint) note += `, neutrals ${tint === 'none' ? 'pure gray' : `${tint} tint`}`;
  const out = flag('out');
  const css = toCss(scale, note, neutrals, extras);
  if (out) writeFileSync(out, css);
  if (out) console.log(`Wrote ${out}.\n`);
  else if (print || fix) console.log(css);
  finish(text, failures);
}

if (command === 'generate' && arg) {
  const at = (flag('at') ?? placeStep(arg)) as Step;
  if (!STEPS.includes(at)) throw new Error(`--at must be one of ${STEPS.join(', ')}.`);
  run(generate(arg, at), `generated from ${arg} at step ${at}`, true, tintFlag ?? 'full', undefined, at, extrasFromFlags());
} else if (command === 'check' && arg) {
  const file = readFileSync(arg, 'utf8');
  run(parseScale(file), `checked from ${arg}`, false, tintFlag, parseNeutrals(file), undefined, parseExtras(file));
} else {
  console.log(
    'Usage:\n  npm run brand -- generate "#rrggbb" [--at <step>] [--neutrals full|subtle|none] [--extra name=#rrggbb …] [--fix] [--out brand.css]\n  npm run brand -- check brand.css [--neutrals full|subtle|none] [--fix] [--out fixed.css]',
  );
  process.exitCode = 2;
}
