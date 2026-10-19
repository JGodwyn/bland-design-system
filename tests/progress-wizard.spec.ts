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
