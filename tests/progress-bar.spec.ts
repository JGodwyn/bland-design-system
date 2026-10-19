// Behaviour of Progress-bar: the progressbar role and its values, sizes, the fixed value column,
// status icons, the cancel button and the fill's motion.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'progress-bar', 'light');
});

test('the track is a named progressbar with its value, range and helper text', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: 'Installing updates' });
  await expect(bar).toHaveAttribute('aria-valuenow', '62');
  await expect(bar).toHaveAttribute('aria-valuemin', '0');
  await expect(bar).toHaveAttribute('aria-valuemax', '100');
  await expect(bar).toHaveAccessibleDescription('About 2 minutes left');
  await expect(page.getByRole('progressbar', { name: 'Progress 50' }).first()).toBeVisible();
});

test('tracks are progress/track-* high and the value column progress/value-width wide', async ({ page }) => {
  for (const [size, h] of [['sm', 4], ['md', 8]] as const) {
    const root = page.locator(`.bland-progress-bar[data-size="${size}"]`).first();
    expect((await root.locator('.bland-progress-bar__track').boundingBox())!.height).toBe(h);
    expect((await root.locator('.bland-progress-bar__value').boundingBox())!.width).toBe(40);
    expect((await root.boundingBox())!.width).toBe(256);
  }
});

test('the fill covers the value share of the track', async ({ page }) => {
  for (const value of [0, 25, 50, 75, 100]) {
    const track = page.getByRole('progressbar', { name: `Progress ${value}` }).first();
    const t = (await track.boundingBox())!;
    const shown = await track.evaluate((el) => {
      const fill = el.firstElementChild!.getBoundingClientRect();
      const box = el.getBoundingClientRect();
      return Math.max(0, Math.min(fill.right, box.right) - box.left);
    });
    expect(Math.abs(shown - (t.width * value) / 100)).toBeLessThan(1);
  }
});

test('success and danger show their status icon and no cancel button', async ({ page }) => {
  for (const status of ['success', 'danger']) {
    const root = page.locator(`.bland-progress-bar[data-status="${status}"]`).first();
    await expect(root.locator('.bland-progress-bar__status-icon')).toBeVisible();
    await expect(root.getByRole('button')).toHaveCount(0);
  }
});

test('the cancel button is named, keyboard reachable and 24 by 24', async ({ page }) => {
  const cancel = page.getByRole('button', { name: 'Cancel' }).first();
  const box = (await cancel.boundingBox())!;
  expect([box.width, box.height]).toEqual([24, 24]);
  await cancel.focus();
  await expect(cancel).toBeFocused();
  expect(await cancel.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('2px');
});

test('a value change slides the fill linearly, and jumps under reduced motion', async ({ page }) => {
  const fill = page.getByTestId('stepper').locator('.bland-progress-bar__fill');
  const timing = await fill.evaluate((e) => {
    const cs = getComputedStyle(e);
    return [cs.transitionProperty, cs.transitionTimingFunction];
  });
  expect(timing[0]).toContain('transform');
  expect(timing[1]).toContain('linear');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await fill.evaluate((e) => getComputedStyle(e).transitionProperty)).not.toContain('transform');
  await page.getByTestId('stepper').getByRole('button', { name: 'Step' }).click();
  await expect(page.getByTestId('stepper').getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
});
