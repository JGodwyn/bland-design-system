// Tests for the brand override tool (npm run test:brand).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { blandNeutrals, blandScale, check, contrast, fixScale, generate, generateNeutrals, parseNeutrals, placeStep, parseScale, STEPS, toCss, toOklch } from './core';

const close = (a: string, b: string) => toOklch(a).l - toOklch(b).l;

test('generating from Bland blue rebuilds Bland’s own scale', () => {
  const scale = generate(blandScale['600']);
  for (const s of STEPS) assert.ok(Math.abs(close(scale[s], blandScale[s])) < 0.005, `step ${s}: ${scale[s]} vs ${blandScale[s]}`);
});

test('a color is placed on the step its lightness belongs on', () => {
  assert.equal(placeStep(blandScale['600']), '600');
  assert.equal(placeStep('#ff5a1f'), '400');
  assert.equal(placeStep('#ffcc00'), '200');
  assert.equal(placeStep('#16a34a'), '500');
  assert.equal(placeStep('#111111'), '1000');
});

test('the input lands exactly on its step, and the scale runs light to dark', () => {
  const scale = generate('#ff5a1f');
  assert.equal(scale['400'], '#ff5a1f');
  assert.equal(scale['0'], '#ffffff');
  for (let i = 1; i < STEPS.length; i++) assert.ok(close(scale[STEPS[i - 1]!], scale[STEPS[i]!]) > 0, `step ${STEPS[i]} is not darker than ${STEPS[i - 1]}`);
});

test('Bland’s own brand misses nothing beyond its known near-misses', () => {
  assert.ok(check(blandScale).every((f) => f.baseline < f.min));
});

test('a yellow brand fails white labels on primary fills, and the fix clears every pairing in order', () => {
  const yellow = generate('#ffcc00', '600');
  const misses = check(yellow).filter((f) => f.baseline >= f.min);
  assert.ok(misses.some((f) => f.fg === '--text-on-color' && f.bg === '--button-brand-primary-rest' && f.steps.includes('600')));
  const fixed = fixScale(yellow);
  assert.ok(check(fixed).every((f) => f.baseline < f.min && f.ratio >= f.baseline - 0.01));
  assert.ok(contrast('#ffffff', fixed['600']) >= 4.5);
  for (let i = 1; i < STEPS.length; i++) assert.ok(close(fixed[STEPS[i - 1]!], fixed[STEPS[i]!]) > 0, `fixed step ${STEPS[i]} out of order`);
});

test('the fix never moves the step holding the entered color', () => {
  const orange = generate('#ff5a1f');
  const fixed = fixScale(orange, generateNeutrals(orange), '400');
  assert.equal(fixed['400'], '#ff5a1f');
  const yellow = generate('#ffcc00');
  assert.equal(fixScale(yellow, generateNeutrals(yellow), '200')['200'], '#ffcc00');
});

test('override files parse from CSS and JSON, and need all 13 steps', () => {
  const scale = generate('#7c3aed');
  assert.deepEqual(parseScale(toCss(scale)), scale);
  assert.deepEqual(parseScale(JSON.stringify(Object.fromEntries(STEPS.map((s) => [`--brand-${s}`, scale[s]])))), scale);
  assert.throws(() => parseScale('{"600": "#7c3aed"}'), /missing steps 0, 50/);
});

const peak = (n: Record<string, string>) => Math.max(...STEPS.map((s) => toOklch(n[s]!).c));

test('neutrals from Bland’s blue at full tint are Bland’s own, exactly', () => {
  assert.deepEqual(generateNeutrals(blandScale), blandNeutrals);
});

test('neutrals keep Bland’s contrast at every step, whatever the brand and tint', () => {
  for (const hex of ['#ff5a1f', '#ffcc00', '#16a34a', '#7c3aed', '#e11d48', '#06b6d4']) {
    for (const tint of ['full', 'subtle', 'none'] as const) {
      const n = generateNeutrals(generate(hex), tint);
      // Within 1.5%: hex rounding near black moves the ratio against white by about 0.1.
      for (const s of STEPS) {
        const [got, want] = [contrast(n[s], '#ffffff'), contrast(blandNeutrals[s], '#ffffff')];
        assert.ok(Math.abs(got - want) / want < 0.015, `${hex} ${tint} step ${s}: ${got.toFixed(3)} vs ${want.toFixed(3)}`);
      }
      assert.equal(n['0'], '#ffffff');
      assert.equal(n['1000'], '#000000');
    }
  }
});

test('neutrals lean to the brand hue, less for warm hues, half at subtle, none for gray brands or pure gray', () => {
  const purple = generateNeutrals(generate('#7c3aed'));
  assert.ok(Math.abs(toOklch(purple['600']).h - toOklch('#7c3aed').h) < 3);
  assert.ok(peak(generateNeutrals(generate('#ffcc00'))) < peak(purple) * 0.6);
  const subtle = peak(generateNeutrals(generate('#7c3aed'), 'subtle'));
  assert.ok(subtle > peak(purple) * 0.4 && subtle < peak(purple) * 0.6);
  assert.ok(peak(generateNeutrals(generate('#7c3aed'), 'none')) < 0.002);
  assert.ok(peak(generateNeutrals(generate('#777777'))) < 0.002);
});

test('an override file carries its neutrals, and one without them leaves Bland’s', () => {
  const brand = generate('#16a34a');
  const neutrals = generateNeutrals(brand);
  const css = toCss(brand, '', neutrals);
  assert.deepEqual(parseScale(css), brand);
  assert.deepEqual(parseNeutrals(css), neutrals);
  assert.equal(parseNeutrals(toCss(brand)), undefined);
  assert.throws(() => parseNeutrals('--neutral-600: #616161;'), /Set all 13, or none/);
});

