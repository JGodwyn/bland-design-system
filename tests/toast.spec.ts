// Behaviour of Toast and Toaster: colors, the live region, timed dismissal with pause, and motion.
import { expect, test } from '@playwright/test';
import { css, tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await page.clock.install();
  await openStory(page, 'toast', 'light');
});

test('a toast is its strong status fill with white content and the status elevation', async ({ page }) => {
  for (const [status, tint] of [['info', 'brand'], ['danger', 'danger'], ['success', 'success'], ['warning', 'warning']]) {
    const toast = page.locator(`.bland-toast[data-status="${status}"]`).first();
    expect(await css(toast, 'background-color')).toBe(await tokenColor(page, `--surface-${tint}-strong`));
    expect(await css(toast, 'box-shadow')).toContain(await tokenColor(page, `--shadow-${tint}-key`));
    expect(await css(toast.locator('.bland-toast__label'), 'color')).toBe(await tokenColor(page, '--text-on-color'));
    expect(await css(toast.locator('.bland-message__icon'), 'color')).toBe(await tokenColor(page, '--icon-on-color'));
  }
});

test('the Toaster is a named polite live region that exists before any toast', async ({ page }) => {
  const region = page.getByRole('region', { name: 'Notifications' });
  await expect(region).toHaveCount(1);
  await expect(region.locator('ol')).toHaveAttribute('aria-live', 'polite');
  await page.getByRole('button', { name: 'Show a toast' }).click();
  await expect(region.getByText('Changes saved')).toBeVisible();
});

test('a toast dismisses itself after 5s, then leaves after its exit transition', async ({ page }) => {
  await page.getByRole('button', { name: 'Show a toast' }).click();
  const item = page.locator('.bland-toaster__item', { hasText: 'Changes saved' });
  await page.mouse.move(0, 0);
  // The installed clock also runs in real time, so leave some margin either side of 5000.
  await page.clock.runFor(4000);
  await expect(item).toHaveAttribute('data-state', 'open');
  await page.clock.runFor(1100);
  await expect(item).toHaveAttribute('data-state', 'closed');
  await page.clock.runFor(450);
  await expect(item).toHaveCount(0);
});

test('the default time on screen is the --duration-toast-visible token', async ({ page }) => {
  expect(await css(page.locator('.bland-toaster'), '--duration-toast-visible')).toBe('5000ms');
  // A project can retune it with the token alone, here on the Toaster itself.
  await page.locator('.bland-toaster').evaluate((e) => (e as HTMLElement).style.setProperty('--duration-toast-visible', '1000ms'));
  await page.getByRole('button', { name: 'Show a toast' }).click();
  const item = page.locator('.bland-toaster__item', { hasText: 'Changes saved' });
  await page.mouse.move(0, 0);
  await page.clock.runFor(1600);
  await expect(item).toHaveAttribute('data-state', 'closed');
});

test('the timer pauses while the pointer is over the stack and resumes after', async ({ page }) => {
  await page.getByRole('button', { name: 'Show a toast' }).click();
  const item = page.locator('.bland-toaster__item', { hasText: 'Changes saved' });
  await page.clock.runFor(1000);
  await item.hover();
  await page.clock.runFor(10000);
  await expect(item).toHaveAttribute('data-state', 'open');
  await page.mouse.move(0, 0);
  await page.clock.runFor(1000);
  await expect(item).toHaveAttribute('data-state', 'open');
  await page.clock.runFor(4100);
  await expect(item).toHaveAttribute('data-state', 'closed');
});

test('focus inside the stack pauses it; a notification closes from its button', async ({ page }) => {
  await page.getByRole('button', { name: 'Show a notification' }).click();
  const close = page.getByRole('region', { name: 'Notifications' }).getByRole('button', { name: 'Dismiss' });
  await page.getByRole('button', { name: 'Show a toast' }).click();
  const toast = page.locator('.bland-toaster__item', { hasText: 'Changes saved' });
  await close.focus();
  await page.clock.runFor(8000);
  await expect(toast).toHaveAttribute('data-state', 'open');
  await page.keyboard.press('Enter');
  await page.clock.runFor(450);
  await expect(page.locator('.bland-toaster__item', { hasText: 'Invitation sent' })).toHaveCount(0);
});

test('duration null keeps a toast until dismiss(id); a reused id replaces it', async ({ page }) => {
  const show = page.getByRole('button', { name: 'Show a lasting toast' });
  await show.click();
  await show.click();
  const item = page.locator('.bland-toaster__item', { hasText: 'Kept until dismissed' });
  await expect(item).toHaveCount(1);
  await page.mouse.move(0, 0);
  await page.clock.runFor(20000);
  await expect(item).toHaveAttribute('data-state', 'open');
  await page.getByRole('button', { name: 'Dismiss it' }).click();
  await page.clock.runFor(450);
  await expect(item).toHaveCount(0);
});

test('toasts enter and exit at duration/xl with easing/out, moving and fading; reduced motion only fades', async ({ page }) => {
  await page.getByRole('button', { name: 'Show a lasting toast' }).click();
  const item = page.locator('.bland-toaster__item').first();
  expect(await css(item, 'transition-property')).toBe('opacity, transform');
  expect(await css(item, 'transition-duration')).toBe('0.4s, 0.4s');
  expect(await css(item, 'transition-timing-function')).toBe('cubic-bezier(0.23, 1, 0.32, 1), cubic-bezier(0.23, 1, 0.32, 1)');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await css(item, 'transition-property')).toBe('opacity');
  await page.getByRole('button', { name: 'Dismiss it' }).click();
  await expect(item).toHaveAttribute('data-state', 'closed');
  expect(await css(item, 'transform')).toBe('none');
});
