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

test('uncolored is surface-100 with a border-bold inside stroke; colored takes the status tint and border, no shadow', async ({ page }) => {
  for (const [status, tint] of [['info', 'brand'], ['danger', 'danger'], ['success', 'success'], ['warning', 'warning']]) {
    const plain = page.locator(`.bland-banner[data-status="${status}"][data-colored="false"]`).first();
    expect(await css(plain, 'background-color')).toBe(await tokenColor(page, '--surface-100'));
    expect(await css(plain, 'box-shadow')).toContain(await tokenColor(page, '--border-bold'));

    const colored = page.locator(`.bland-banner[data-status="${status}"][data-colored="true"]`).first();
    expect(await css(colored, 'background-color')).toBe(await tokenColor(page, `--surface-${tint}-light`));
    const shadow = await css(colored, 'box-shadow');
    expect(shadow).toContain(await tokenColor(page, `--border-${tint}`));
    expect(shadow.split('inset').length - 1).toBe(1);
    expect(shadow).not.toContain(await tokenColor(page, `--shadow-${tint}-key`));
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
  expect(actions.y - (text.y + text.height)).toBe(8); // space-sm (Figma; Notification keeps space-lg)
  expect(actions.height).toBe(32); // Buttons default to sm

  const horizontal = page.locator('.bland-banner', { hasText: 'A new version is available' }).first();
  const line = (await horizontal.locator('.bland-message__content').boundingBox())!;
  const inline = (await horizontal.locator('.bland-message__actions').boundingBox())!;
  expect(inline.x).toBeGreaterThanOrEqual(line.x + line.width);
  expect(inline.height).toBe(32);
});

test("Buttons in the actions default to sm; a Button's own size wins", async ({ page }) => {
  const sizes = await page
    .locator('.bland-banner .bland-message__actions .bland-button:not(:has-text("Own size"))')
    .evaluateAll((els) => els.map((e) => e.getAttribute('data-size')));
  expect(sizes.length).toBeGreaterThan(0);
  expect(new Set(sizes)).toEqual(new Set(['sm']));
  await expect(page.getByRole('button', { name: 'Own size' })).toHaveAttribute('data-size', 'xs');
  // Elsewhere the default is still md, and the close button keeps xs.
  await expect(page.locator('.bland-banner .bland-message__close').first()).toHaveAttribute('data-size', 'xs');
});

test('on a horizontal banner the first line centres on its sm Buttons', async ({ page }) => {
  const banner = page.locator('.bland-banner', { hasText: 'A new version is available' }).first();
  const mid = async (sel: string) => {
    const b = (await banner.locator(sel).first().boundingBox())!;
    return b.y + b.height / 2;
  };
  const button = await mid('.bland-message__actions .bland-button');
  expect(Math.abs((await mid('.bland-message__description')) - button)).toBeLessThanOrEqual(0.5);
  expect(Math.abs((await mid('.bland-message__icon')) - button)).toBeLessThanOrEqual(0.5);
  expect(Math.abs((await mid('.bland-message__close')) - button)).toBeLessThanOrEqual(0.5);
});
