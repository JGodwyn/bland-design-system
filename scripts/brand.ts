// Brand override tool (docs/brand.md).
//
//   npm run brand -- generate "#ff5a1f" [--at 600] [--fix] [--out brand.css]   13 steps from one color, then the check
//   npm run brand -- check brand.css [--fix] [--out fixed.css]                 the contrast check for an override file
//
// --fix takes the suggested steps (one round) and checks again. The check warns and never blocks: exit code 1 when
// a pairing still misses its minimum, 0 otherwise.
import { readFileSync, writeFileSync } from 'node:fs';

import { generate, parseScale, report, STEPS, toCss, type Scale, type Step } from './brand/core';

const [command, arg, ...rest] = process.argv.slice(2);
const fix = rest.includes('--fix');
const flag = (name: string) => {
  const i = rest.indexOf(`--${name}`);
  return i === -1 ? undefined : rest[i + 1];
};

function finish(text: string, failures: number) {
  console.log(text);
  if (failures) console.log(`\n${failures} pairing${failures > 1 ? 's' : ''} below the minimum. Adjust the steps named, or keep them on purpose.`);
  process.exitCode = failures ? 1 : 0;
}

/** Checks a scale; with --fix takes the suggestions once and checks again. Writes or prints the CSS when asked. */
function run(scale: Scale, note: string, print: boolean) {
  let { text, failures, fixes } = report(scale);
  if (fix && Object.keys(fixes).length) {
    console.log(`${text}\n\nApplying the suggested steps…\n`);
    scale = { ...scale, ...fixes };
    note += ', suggested steps applied';
    ({ text, failures } = report(scale));
  }
  const out = flag('out');
  const css = toCss(scale, note);
  if (out) writeFileSync(out, css);
  if (out) console.log(`Wrote ${out}.\n`);
  else if (print || fix) console.log(css);
  finish(text, failures);
}

if (command === 'generate' && arg) {
  const at = (flag('at') ?? '600') as Step;
  if (!STEPS.includes(at)) throw new Error(`--at must be one of ${STEPS.join(', ')}.`);
  run(generate(arg, at), `generated from ${arg} at step ${at}`, true);
} else if (command === 'check' && arg) {
  run(parseScale(readFileSync(arg, 'utf8')), `checked from ${arg}`, false);
} else {
  console.log('Usage:\n  npm run brand -- generate "#rrggbb" [--at 600] [--fix] [--out brand.css]\n  npm run brand -- check brand.css [--fix] [--out fixed.css]');
  process.exitCode = 2;
}
