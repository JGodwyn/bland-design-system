// Tests for the brand override tool (npm run test:brand).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { readFileSync } from 'node:fs';

import { blandChart, CHART_CONTRAST, CHART_COUNT, chartCss, chartHues, checkChart, colorOf, deltaE, generateChart, EXTRA_PAIRS, EXTRA_ROLES, extraNameError, harmonyColor, HARMONY_TURNS, parseExtras, blandNeutrals, blandScale, check, contrast, fixScale, generate, generateNeutrals, parseNeutrals, placeStep, parseScale, STEPS, toCss, toOklch } from './core';

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


test('extra colors mirror the brand roles and check out on their own pairings', () => {
  // The roles take the brand's steps in each mode: solid 600 in light, 400 in dark; the light fill 50 / 1000.
  const role = (r: string) => EXTRA_ROLES.find((x) => x.role === r)!;
  assert.deepEqual([role('surface').light, role('surface').dark], ['600', '400']);
  assert.deepEqual([role('surface-light').light, role('surface-light').dark], ['50', '1000']);
  assert.deepEqual([role('surface-strong').light, role('surface-strong').dark], ['600', '600']);
  const green = generate('#16a34a');
  const n = generateNeutrals(generate('#0062ff'));
  assert.ok(check(green, n, EXTRA_PAIRS).some((f) => f.where === 'White text on its strong fill'));
  const fixed = fixScale(green, n, placeStep('#16a34a'), EXTRA_PAIRS);
  assert.equal(fixed[placeStep('#16a34a')], '#16a34a');
  assert.equal(check(fixed, n, EXTRA_PAIRS).filter((f) => f.baseline >= f.min).length, 0);
});

test('extra color names avoid Bland prefixes, and the override file round-trips them with their roles', () => {
  assert.equal(extraNameError('accent'), undefined);
  assert.equal(extraNameError('chart-orange'), undefined);
  assert.match(extraNameError('surface')!, /already uses/);
  assert.match(extraNameError('Accent')!, /lowercase/);
  assert.match(extraNameError('accent', ['accent'])!, /Another/);
  const accent = generate('#7c3aed');
  const css = toCss(blandScale, '', blandNeutrals, [{ name: 'accent', scale: accent }]);
  assert.match(css, /\[data-theme="dark"\] \{\n  --accent-surface: var\(--accent-400\);/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.deepEqual(parseExtras(css), [{ name: 'accent', scale: accent }]);
  assert.deepEqual(parseScale(css), blandScale);
});

test('default extra colors go with the brand: complement first, then the square, apart on the wheel', () => {
  for (const brand of [blandScale['600'], '#ff5a1f', '#16a34a', '#7c3aed']) {
    const h = toOklch(brand).h;
    HARMONY_TURNS.forEach((turn, i) => {
      const color = harmonyColor(brand, i);
      const off = (((toOklch(color).h - h - turn) % 360) + 540) % 360 - 180;
      assert.ok(Math.abs(off) < 3, `${brand} extra ${i} is ${turn}° round (off ${off.toFixed(1)}°)`);
      assert.ok(toOklch(color).c <= toOklch(brand).c + 0.005, 'never more colorful than the brand');
    });
  }
  // A gray brand has no hue: Bland's blue stands in.
  assert.equal(harmonyColor('#777777', 0), harmonyColor(blandScale['600'], 0));
});


// ---------- chart palette ----------

const bg = (mode: 'light' | 'dark') => colorOf('--surface-100', mode, blandScale).hex;
const turn = (a: number, b: number) => Math.abs(((((a - b) % 360) + 540) % 360) - 180);

test('generated chart hues fill the widest gaps: with the brand alone, 45° apart', () => {
  const hues = chartHues([250], 7);
  assert.deepEqual(hues.map(Math.round), [70, 160, 340, 115, 205, 295, 25]);
  const all = [250, ...hues].sort((a, b) => a - b);
  all.forEach((h, i) => assert.ok(Math.abs(turn(h, all[(i + 1) % all.length]!) - 45) < 1e-6));
  // Taken hues bunched together leave the rest of the wheel to the generated ones.
  for (const h of chartHues([0, 20], 6)) assert.ok(turn(h, 0) > 20 && turn(h, 20) > 20);
});

test('deltaE: zero for the same color, and red and green collapse under deutan vision but not tritan', () => {
  assert.equal(deltaE('#123456', '#123456'), 0);
  assert.ok(deltaE('#d03030', '#30a030', 'deutan') < deltaE('#d03030', '#30a030') / 5);
  assert.ok(deltaE('#d03030', '#30a030', 'tritan') > deltaE('#d03030', '#30a030'));
});

test('Bland’s own chart palette: brand first by reference, 3:1 in both modes, every neighbour pair clear', () => {
  const chart = blandChart();
  assert.equal(chart.length, CHART_COUNT);
  assert.equal(chart[0]!.from, 'brand');
  assert.deepEqual(chart[0]!.ref, { light: 'var(--brand-600)', dark: 'var(--brand-400)' });
  assert.equal(chart[0]!.light, blandScale['600']);
  for (const s of chart) {
    assert.ok(contrast(s.light, bg('light')) >= CHART_CONTRAST && contrast(s.dark, bg('dark')) >= CHART_CONTRAST, `${s.light} / ${s.dark}`);
    assert.ok(toOklch(s.dark).l > toOklch(s.light).l, `${s.light}: dark is lighter`);
  }
  assert.deepEqual(checkChart(chart), [], 'no misses and no warnings');
});

test('tokens.css ships Bland’s current chart palette', () => {
  const css = readFileSync(new URL('../../src/tokens/tokens.css', import.meta.url), 'utf8');
  assert.ok(css.includes(chartCss(blandChart())), 'run npm run tokens');
});

test('a project’s chart: brand, then its extras in order, then generated series that pass among themselves', () => {
  for (const hex of ['#ff5a1f', '#16a34a', '#ffcc00', '#7c3aed', '#e11d48', '#111111']) {
    const brand = generate(hex);
    const extras = [{ name: 'accent', scale: generate(harmonyColor(hex, 0)) }, { name: 'second', scale: generate(harmonyColor(hex, 1)) }];
    const chart = generateChart(brand, extras, generateNeutrals(brand));
    assert.deepEqual(chart.map((s) => s.from), ['brand', 'accent', 'second', 'generated', 'generated', 'generated', 'generated', 'generated']);
    assert.equal(chart[1]!.ref?.light.startsWith('var(--accent-'), true);
    // The project's own colors can't move, so a miss between two of them is theirs; every other pairing passes.
    const fails = checkChart(chart, generateNeutrals(brand)).filter((f) => f.level === 'fail' && !f.series.every((n) => n <= 3));
    assert.deepEqual(fails, [], hex);
  }
});

test('a brand step under 3:1 moves along its scale until it holds', () => {
  // Yellow's 400 is far too light for the dark page's opposite: the light value goes darker than 600.
  const yellow = generate('#ffe14d', '600');
  const s = generateChart(yellow)[0]!;
  assert.ok(contrast(s.light, bg('light')) >= CHART_CONTRAST);
  assert.notEqual(s.ref!.light, 'var(--brand-600)');
});

test('the chart tokens go in the override file, and an extra can’t be called chart', () => {
  const extras = [{ name: 'accent', scale: generate('#7c3aed') }];
  const css = toCss(blandScale, '', blandNeutrals, extras, generateChart(blandScale, extras));
  assert.match(css, /\[data-theme="light"\] \{\n  --chart-1: var\(--brand-600\);\n  --chart-2: var\(--accent-600\);\n  --chart-3: #[0-9a-f]{6};/);
  assert.match(css, /\[data-theme="dark"\] \{\n  --chart-1: var\(--brand-400\);/);
  assert.deepEqual(parseExtras(css), extras);
  assert.match(extraNameError('chart')!, /chart palette/);
});
