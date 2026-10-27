// Behaviour of Notification: colored and uncolored tokens, width, layout and the close button.
import { expect, test } from '@playwright/test';
import { css, tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'notification', 'light');
});

const tints = { info: 'brand', danger: 'danger', success: 'success', warning: 'warning' } as const;

test('colored uses the tinted surface and border; uncolored surface-100 and border-bold', async ({ page }) => {
  for (const [status, tint] of Object.entries(tints)) {
    const colored = page.locator(`.bland-notification[data-status="${status}"][data-colored="true"]`).first();
    expect(await css(colored, 'background-color')).toBe(await tokenColor(page, `--surface-${tint}-light`));
    expect(await css(colored, 'box-shadow')).toContain(await tokenColor(page, `--border-${tint}`));
    expect(await css(colored, 'box-shadow')).toContain(await tokenColor(page, `--shadow-${tint}-key`));

    const plain = page.locator(`.bland-notification[data-status="${status}"][data-colored="false"]`).first();
    expect(await css(plain, 'background-color')).toBe(await tokenColor(page, '--surface-100'));
    expect(await css(plain, 'box-shadow')).toContain(await tokenColor(page, '--border-bold'));
    expect(await css(plain, 'box-shadow')).toContain(await tokenColor(page, '--shadow-neutral-key'));
  }
});

test('notifications are notification/width (384) wide and padded md, or lg when vertical', async ({ page }) => {
  const horizontal = page.locator('.bland-notification[data-orientation="horizontal"]').first();
  const vertical = page.locator('.bland-notification[data-orientation="vertical"]').first();
  expect((await horizontal.boundingBox())!.width).toBe(384);
  expect((await vertical.boundingBox())!.width).toBe(384);
  expect(await css(horizontal, 'padding')).toBe('12px');
  expect(await css(vertical, 'padding')).toBe('16px');
});

test('the vertical timestamp sits beside the title; the close button is named and focusable', async ({ page }) => {
  const n = page.locator('.bland-notification', { hasText: 'Upload failed' });
  const title = (await n.locator('.bland-message__title').boundingBox())!;
  const time = (await n.locator('.bland-message__timestamp').boundingBox())!;
  expect(time.x).toBeGreaterThanOrEqual(title.x + title.width);
  expect(Math.abs(time.y + time.height / 2 - (title.y + title.height / 2))).toBeLessThanOrEqual(1);

  const text = (await n.locator('.bland-message__text').boundingBox())!;
  const actions = (await n.locator('.bland-message__actions').boundingBox())!;
  expect(actions.y - (text.y + text.height)).toBe(16); // space-lg, unlike Banner's space-sm

  const close = n.getByRole('button', { name: 'Dismiss' });
  await close.focus();
  await expect(close).toBeFocused();
});

test('timestamps centre on the first line of text, also when the title wraps', async ({ page }) => {
  const mid = (b: { y: number; height: number }) => b.y + b.height / 2;
  const horizontal = page.locator('.bland-notification[data-orientation="horizontal"]', { hasText: 'File deleted' }).first();
  const line = (await horizontal.locator('.bland-message__description').boundingBox())!;
  const time = (await horizontal.locator('.bland-message__timestamp').boundingBox())!;
  expect(Math.abs(mid(time) - mid(line))).toBeLessThanOrEqual(0.5);

  const wrapped = page.locator('.bland-notification', { hasText: 'long enough to wrap' });
  const title = (await wrapped.locator('.bland-message__title').boundingBox())!;
  expect(title.height).toBeGreaterThan(24); // two lines
  const stamp = (await wrapped.locator('.bland-message__timestamp').boundingBox())!;
  expect(Math.abs(mid(stamp) - (title.y + 12))).toBeLessThanOrEqual(0.5); // centre of the first 24px line
});
