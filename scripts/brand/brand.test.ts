// Tests for the brand override tool (npm run test:brand).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blandScale, check, contrast, fixScale, generate, parseScale, STEPS, toCss, toOklch } from './core';

const close = (a: string, b: string) => toOklch(a).l - toOklch(b).l;

test('generating from Bland blue rebuilds Bland’s own scale', () => {
  const scale = generate(blandScale['600']);
  for (const s of STEPS) assert.ok(Math.abs(close(scale[s], blandScale[s])) < 0.005, `step ${s}: ${scale[s]} vs ${blandScale[s]}`);
});

test('the input lands exactly on its step, and the scale runs light to dark', () => {
  const scale = generate('#ff5a1f');
  assert.equal(scale['600'], '#ff5a1f');
  assert.equal(scale['0'], '#ffffff');
  for (let i = 1; i < STEPS.length; i++) assert.ok(close(scale[STEPS[i - 1]!], scale[STEPS[i]!]) > 0, `step ${STEPS[i]} is not darker than ${STEPS[i - 1]}`);
});

test('Bland’s own brand misses nothing beyond its known near-misses', () => {
  assert.ok(check(blandScale).every((f) => f.baseline < f.min));
});

test('a yellow brand fails white labels on primary fills, and the fix clears every pairing in order', () => {
  const yellow = generate('#ffcc00');
  const misses = check(yellow).filter((f) => f.baseline >= f.min);
  assert.ok(misses.some((f) => f.fg === '--text-on-color' && f.bg === '--button-brand-primary-rest' && f.steps.includes('600')));
  const fixed = fixScale(yellow);
  assert.ok(check(fixed).every((f) => f.baseline < f.min && f.ratio >= f.baseline - 0.01));
  assert.ok(contrast('#ffffff', fixed['600']) >= 4.5);
  for (let i = 1; i < STEPS.length; i++) assert.ok(close(fixed[STEPS[i - 1]!], fixed[STEPS[i]!]) > 0, `fixed step ${STEPS[i]} out of order`);
});

test('override files parse from CSS and JSON, and need all 13 steps', () => {
  const scale = generate('#7c3aed');
  assert.deepEqual(parseScale(toCss(scale)), scale);
  assert.deepEqual(parseScale(JSON.stringify(Object.fromEntries(STEPS.map((s) => [`--brand-${s}`, scale[s]])))), scale);
  assert.throws(() => parseScale('{"600": "#7c3aed"}'), /missing steps 0, 50/);
});
