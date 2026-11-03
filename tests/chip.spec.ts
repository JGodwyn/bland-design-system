// Behaviour of Chip: sizes, the close button's name, keyboard, hit area and focus ring.
import { expect, test } from '@playwright/test';
import { openStory, clickToFocus } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'chip', 'light');
});

test('chips are chip/* high and the count and close boxes chip/trail-*', async ({ page }) => {
  for (const [size, h, trail] of [['sm', 20, 16], ['md', 24, 20], ['lg', 32, 24]] as const) {
    const chip = page.locator(`.bland-chip[data-size="${size}"][data-type="cancellable"]`).first();
    expect((await chip.boundingBox())!.height).toBe(h);
    const close = (await chip.locator('.bland-chip__close').boundingBox())!;
    expect([close.width, close.height]).toEqual([trail, trail]);
    const count = (await page.locator(`.bland-chip[data-size="${size}"] .bland-chip__count`).first().boundingBox())!;
    expect(count.height).toBe(trail);
    expect(count.width).toBeGreaterThanOrEqual(trail);
  }
});

test('the close button is named after the label and removes the chip by keyboard and pointer', async ({ page }) => {
  const list = page.getByTestId('removable');
  const count = page.getByTestId('removable-count');

  const design = list.getByRole('button', { name: 'Remove Design' });
  await design.focus();
  await page.keyboard.press('Enter');
  await expect(count).toHaveText('2');

  const research = list.getByRole('button', { name: 'Remove Research' });
  await research.focus();
  await page.keyboard.press('Space');
  await expect(count).toHaveText('1');

  await list.getByRole('button', { name: 'Remove Writing' }).click();
  await expect(count).toHaveText('0');
});

test('the chip itself is not focusable; only its close button is', async ({ page }) => {
  const chip = page.getByTestId('removable').locator('.bland-chip').first();
  expect(await chip.evaluate((e) => e.tabIndex)).toBe(-1);
  await expect(page.locator('.bland-chip[data-type="countable"] button')).toHaveCount(0);
});

test('the close button hit area is at least 24 by 24', async ({ page }) => {
  const close = page.locator('.bland-chip[data-size="sm"] .bland-chip__close').first();
  const hit = await close.evaluate((e) => {
    const cs = getComputedStyle(e, '::before');
    return [cs.width, cs.height];
  });
  expect(hit).toEqual(['24px', '24px']);

  // A click just outside the 16px box still lands on the button.
  const box = (await close.boundingBox())!;
  const target = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest('.bland-chip__close') != null,
    { x: box.x + box.width + 3, y: box.y + box.height / 2 },
  );
  expect(target).toBe(true);
});

test('the close button focus ring shows on keyboard focus only', async ({ page }) => {
  // A close button in the sizes section: its onRemove does nothing, so it stays on the page.
  const close = page.locator('.bland-chip[data-size="md"][data-type="cancellable"] .bland-chip__close').first();
  const outline = () => close.evaluate((e) => getComputedStyle(e).outlineStyle);

  await clickToFocus(close);
  await expect(close).toBeFocused();
  expect(await outline()).toBe('none');

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  expect(await outline()).toBe('solid');
  expect(await close.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('2px');
});
