// Behaviour of Alert: roles per status, colors and the icon slot.
import { expect, test } from '@playwright/test';
import { css, tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'alert', 'light');
});

test('danger alerts are role="alert"; the others are role="status"', async ({ page }) => {
  for (const status of ['info', 'danger', 'success', 'warning']) {
    await expect(page.locator(`.bland-alert[data-status="${status}"]`).first()).toHaveAttribute('role', status === 'danger' ? 'alert' : 'status');
  }
});

test('the text and icon take the status colors; info text stays text-bold', async ({ page }) => {
  for (const [status, text, icon] of [
    ['info', '--text-bold', '--icon-brand'],
    ['danger', '--text-danger', '--icon-danger'],
    ['success', '--text-success', '--icon-success'],
    ['warning', '--text-warning', '--icon-warning'],
    ['neutral', '--text-subtle', '--icon-subtle'],
  ] as const) {
    const alert = page.locator(`.bland-alert[data-status="${status}"]`).first();
    expect(await css(alert.locator('.bland-alert__label'), 'color')).toBe(await tokenColor(page, text));
    expect(await css(alert.locator('.bland-message__icon'), 'color')).toBe(await tokenColor(page, icon));
  }
});

test('the md icon is 20px and decorative; icon={false} hides it', async ({ page }) => {
  const icon = page.locator('.bland-alert[data-size="md"] .bland-message__icon').first();
  const box = (await icon.boundingBox())!;
  expect([box.width, box.height]).toEqual([20, 20]);
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.bland-alert', { hasText: 'Username is available' }).locator('.bland-message__icon')).toHaveCount(0);
});

test('sm: body-md text and a 16 icon, centred on the first line', async ({ page }) => {
  const alert = page.locator('.bland-alert[data-size="sm"]').first();
  const icon = (await alert.locator('.bland-message__icon').boundingBox())!;
  const text = alert.locator('.bland-alert__label');
  expect([icon.width, icon.height]).toEqual([16, 16]);
  expect(await css(text, 'font-size')).toBe('14px');
  expect(icon.y - (await text.boundingBox())!.y).toBe(2);
});

test('neutral is role="status"', async ({ page }) => {
  await expect(page.locator('.bland-alert[data-status="neutral"]').first()).toHaveAttribute('role', 'status');
});

test('long text wraps at alert/max-width (384)', async ({ page }) => {
  const alert = page.locator('.bland-alert', { hasText: 'twelve characters' });
  expect((await alert.boundingBox())!.width).toBeLessThanOrEqual(384);
});

test('the field it describes reads it through aria-describedby', async ({ page }) => {
  await expect(page.getByLabel('Email')).toHaveAccessibleDescription('Enter an email address like name@example.com');
});
