// Behaviour of Progress-wizard: an ordered list, the current step, marker names, step width,
// connector colors and no focus stops.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'progress-wizard', 'light');
});

test('it is a named ordered list whose current step has aria-current="step"', async ({ page }) => {
  const wizard = page.getByRole('list', { name: 'inline bar' });
  expect(await wizard.evaluate((e) => e.tagName)).toBe('OL');
  const steps = wizard.getByRole('listitem');
  await expect(steps).toHaveCount(5);
  await expect(steps.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(wizard.locator('[aria-current]')).toHaveCount(1);
});

test('markers tell done, current and upcoming steps apart', async ({ page }) => {
  const wizard = page.getByRole('list', { name: 'inline bar' });
  await expect(wizard.getByRole('img', { name: 'Completed' })).toHaveCount(1);
  await expect(wizard.getByRole('img', { name: 'Current' })).toHaveCount(1);
  await expect(wizard.getByRole('img', { name: 'Not started' })).toHaveCount(3);
  const all = page.getByRole('list', { name: 'All done' });
  await expect(all.getByRole('img', { name: 'Completed' })).toHaveCount(4);
  await expect(all.locator('[aria-current]')).toHaveCount(0);
});

test('each step is progress/step-width wide and markers progress/marker', async ({ page }) => {
  for (const name of ['inline bar', 'centered connector', 'stacked connector']) {
    const wizard = page.getByRole('list', { name });
    for (const box of await wizard.getByRole('listitem').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width))) {
      expect(box).toBe(152);
    }
    const marker = (await wizard.locator('.bland-progress-wizard__marker').first().boundingBox())!;
    expect([marker.width, marker.height]).toEqual([20, 20]);
  }
});

test('connector lines are brand up to the current step and track after it', async ({ page }) => {
  const wizard = page.getByRole('list', { name: 'centered connector' });
  const colors = await wizard.locator('.bland-progress-wizard__line').evaluateAll((els) =>
    els.map((e) => [e.getAttribute('data-side'), getComputedStyle(e).backgroundColor, getComputedStyle(e).visibility]),
  );
  const brand = colors[1]![1];
  const track = colors[3]![1];
  expect(brand).not.toBe(track);
  // Step 1: hidden start, end into step 2 (current) brand. Step 2: start brand, end track.
  expect(colors[0]![2]).toBe('hidden');
  expect(colors.slice(1, 3).map((c) => c[1])).toEqual([brand, brand]);
  expect(colors.slice(3).every((c) => c[1] === track || c[2] === 'hidden')).toBe(true);
});

test('nothing in a wizard takes focus', async ({ page }) => {
  const focusable = await page
    .locator('.bland-progress-wizard')
    .evaluateAll((els) => els.flatMap((e) => [...e.querySelectorAll('a, button, input, [tabindex]')]).length);
  expect(focusable).toBe(0);
});

test('fill stretches the wizard and shares its width equally between the steps', async ({ page }) => {
  for (const name of ['Fill bar', 'Fill connector']) {
    const wizard = page.getByRole('list', { name });
    const total = (await wizard.boundingBox())!.width;
    const widths = await wizard.getByRole('listitem').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().width));
    for (const w of widths) expect(Math.abs(w - total / widths.length)).toBeLessThan(1);
    expect(widths[0]).toBeGreaterThan(152);
  }
});

test('a long inline connector title truncates with an ellipsis and leaves the line space-xl', async ({ page }) => {
  const step = page.getByRole('list', { name: 'Long title' }).getByRole('listitem').first();
  const title = step.locator('.bland-progress-wizard__title');
  const [scroll, client, overflow] = await title.evaluate((e) => [e.scrollWidth, e.clientWidth, getComputedStyle(e).textOverflow]);
  expect(scroll).toBeGreaterThan(client as number);
  expect(overflow).toBe('ellipsis');
  const line = (await step.locator('.bland-progress-wizard__connector').boundingBox())!;
  expect(line.width).toBeGreaterThanOrEqual(24);
  expect(line.x + line.width).toBeLessThanOrEqual((await step.boundingBox())!.x + 152 + 0.5);
});

test('vertical stacks the steps down its container, markers on the title\'s first line', async ({ page }) => {
  for (const name of ['Vertical bar', 'Vertical connector']) {
    const wizard = page.getByRole('list', { name });
    const steps = await wizard.getByRole('listitem').evaluateAll((els) =>
      els.map((e) => {
        const step = e.getBoundingClientRect();
        const marker = e.querySelector('.bland-progress-wizard__marker')!.getBoundingClientRect();
        const title = e.querySelector('.bland-progress-wizard__title')!.getBoundingClientRect();
        return { x: step.x, top: step.top, bottom: step.bottom, width: step.width, markerMid: marker.top + marker.height / 2, titleTop: title.top };
      }),
    );
    expect(steps).toHaveLength(5);
    for (const [i, s] of steps.entries()) {
      expect(s.width).toBe(256); // fills its 256 wide container
      expect(s.x).toBe(steps[0]!.x);
      if (i > 0) expect(s.top).toBeGreaterThanOrEqual(steps[i - 1]!.bottom - 0.5);
      // body-lg's 24 line: the 20 marker centres 12 below the title's top.
      expect(Math.abs(s.markerMid - (s.titleTop + 12))).toBeLessThanOrEqual(0.5);
    }
  }
});

test('vertical bar runs down the start edge; vertical connector lines run down to the next marker', async ({ page }) => {
  const bar = page.getByRole('list', { name: 'Vertical bar' }).getByRole('listitem').first();
  expect(await bar.evaluate((e) => getComputedStyle(e).boxShadow)).toMatch(/2px 0px 0px 0px inset$/);

  const wizard = page.getByRole('list', { name: 'Vertical connector' });
  const lines = await wizard.locator('.bland-progress-wizard__line[data-axis="y"]').evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { width: r.width, height: r.height, color: getComputedStyle(e).backgroundColor };
    }),
  );
  // One line under every step but the last, the horizontal title-row lines hidden.
  expect(lines).toHaveLength(4);
  expect(await wizard.locator('.bland-progress-wizard__connector').first().isVisible()).toBe(false);
  for (const l of lines) {
    expect(l.width).toBe(2);
    expect(l.height).toBeGreaterThanOrEqual(24);
  }
  // Brand into the current step (step 2), track after it.
  expect(lines[0]!.color).not.toBe(lines[1]!.color);
  expect(lines.slice(1).every((l) => l.color === lines[1]!.color)).toBe(true);
});

test('auto is horizontal from breakpoint/md and vertical below it', async ({ page }) => {
  const xs = async (name: string) =>
    page.getByRole('list', { name }).getByRole('listitem').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().x));
  await page.setViewportSize({ width: 1024, height: 900 });
  for (const name of ['Auto wizard (centered)', 'Auto wizard (inline)', 'Auto wizard (stacked, bar)']) {
    const x = await xs(name);
    expect(x[1]! - x[0]!).toBe(152);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  for (const name of ['Auto wizard (centered)', 'Auto wizard (inline)', 'Auto wizard (stacked, bar)']) {
    const x = await xs(name);
    expect(new Set(x).size).toBe(1);
  }
  // Below md the centered connector reads as vertical: no start lines, lines run down.
  const centered = page.getByRole('list', { name: 'Auto wizard (centered)' });
  expect(await centered.locator('.bland-progress-wizard__line[data-side="start"]').first().isVisible()).toBe(false);
  const line = (await centered.locator('.bland-progress-wizard__line[data-side="end"]').first().boundingBox())!;
  expect(line.width).toBe(2);
});
