// Behaviour of Avatar: image fallback, accessible name, xs initials, slots outside the clipped circle.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'avatar', 'light');
});

test('a failed image falls back to the initials', async ({ page }) => {
  const avatar = page.getByTestId('fallback-initials');
  await expect(avatar).toHaveAttribute('data-type', 'initials');
  await expect(avatar.locator('img')).toHaveCount(0);
  await expect(avatar.getByRole('img', { name: 'Godwin John' })).toHaveText('GJ');
});

test('a failed image without initials falls back to the placeholder', async ({ page }) => {
  const avatar = page.getByTestId('fallback-placeholder');
  await expect(avatar).toHaveAttribute('data-type', 'placeholder');
  await expect(avatar.getByRole('img', { name: 'Unknown person' })).toBeVisible();
});

test('an image keeps its alt text as the accessible name', async ({ page }) => {
  await expect(page.getByRole('img', { name: 'Ada Lovelace (image, md)' })).toHaveJSProperty('tagName', 'IMG');
});

test('xs shows a single initial, larger sizes up to two', async ({ page }) => {
  await expect(page.getByRole('img', { name: 'Ada Lovelace (initials, xs)' })).toHaveText('A');
  await expect(page.getByRole('img', { name: 'Ada Lovelace (initials, sm)' })).toHaveText('AL');
});

test('slots sit on the circle edge at 45 degrees, outside the clipped circle', async ({ page }) => {
  const avatar = page.locator('.bland-avatar[data-size="3xl"]:has([data-slot])');
  const box = (await avatar.boundingBox())!;
  for (const [slot, y] of [
    ['top', 0.5 - 0.5 * Math.SQRT1_2],
    ['bottom', 0.5 + 0.5 * Math.SQRT1_2],
  ] as const) {
    const s = (await avatar.locator(`[data-slot="${slot}"]`).boundingBox())!;
    expect(s.x + s.width / 2 - box.x).toBeCloseTo(box.width * (0.5 + 0.5 * Math.SQRT1_2), 0);
    expect(s.y + s.height / 2 - box.y).toBeCloseTo(box.height * y, 0);
  }
  await expect(avatar.locator('.bland-avatar__inner [data-slot]')).toHaveCount(0);
});

test('without alt the avatar is decorative, so a name beside it is not read twice', async ({ page }) => {
  const avatar = page.getByTestId('decorative');
  await expect(avatar.locator('.bland-avatar__inner')).toHaveAttribute('aria-hidden', 'true');
  await expect(avatar.getByRole('img')).toHaveCount(0);
});
