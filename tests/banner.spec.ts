// Behaviour of Banner: no live role by default, the close button, keyboard and layout.
import { expect, test } from '@playwright/test';
import { css, tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'banner', 'light');
});

test('a banner has no live role unless one is passed, and spans its container', async ({ page }) => {
  const banner = page.locator('.bland-banner').first();
  await expect(banner).not.toHaveAttribute('role');
  const frame = (await page.getByTestId('frame-light').locator('.pg-stack').first().boundingBox())!;
  expect((await banner.boundingBox())!.width).toBe(frame.width);
});

test('surface-100 with a border-bold inside stroke, whatever the status', async ({ page }) => {
  for (const status of ['info', 'danger', 'success', 'warning']) {
    const banner = page.locator(`.bland-banner[data-status="${status}"]`).first();
    expect(await css(banner, 'background-color')).toBe(await tokenColor(page, '--surface-100'));
    expect(await css(banner, 'box-shadow')).toContain(await tokenColor(page, '--border-bold'));
  }
});

test('the close button is a named 24px Icon Button with a 20px icon-subtle X, and works by keyboard', async ({ page }) => {
  const close = page.getByRole('button', { name: 'Dismiss maintenance notice' });
  const box = (await close.boundingBox())!;
  expect([box.width, box.height]).toEqual([24, 24]);
  const icon = close.locator('.bland-icon');
  expect((await icon.boundingBox())!.width).toBe(20);
  expect(await css(icon, 'color')).toBe(await tokenColor(page, '--icon-subtle'));

  await close.focus();
  expect(await css(close, 'outline-style')).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('dismissed')).toBeVisible();
  await expect(page.getByTestId('dismissible')).toHaveCount(0);
});

test('vertical banners put the actions under the text; horizontal ones keep them on the line', async ({ page }) => {
  const vertical = page.locator('.bland-banner', { hasText: 'Payment failed' });
  const text = (await vertical.locator('.bland-message__text').boundingBox())!;
  const actions = (await vertical.locator('.bland-message__actions').boundingBox())!;
  expect(actions.y).toBeGreaterThanOrEqual(text.y + text.height);
  expect(actions.height).toBe(40);

  const horizontal = page.locator('.bland-banner', { hasText: 'A new version is available' }).first();
  const line = (await horizontal.locator('.bland-message__content').boundingBox())!;
  const inline = (await horizontal.locator('.bland-message__actions').boundingBox())!;
  expect(inline.x).toBeGreaterThanOrEqual(line.x + line.width);
  expect(inline.height).toBe(24);
});
