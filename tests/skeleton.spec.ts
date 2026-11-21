// Behaviour of Skeleton: text lines on the text style's line height, circle and rect sizes, the pulse and its
// reduced-motion fallback, and SkeletonGroup's busy region with one announcement.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'skeleton', 'light');
});

const frame = (page: import('@playwright/test').Page) => page.getByTestId('frame-light');

test('a text line is exactly as tall as the real text, with a bar the size of its font', async ({ page }) => {
  const f = frame(page);
  const skeleton = f.getByTestId('title-skeleton');
  const text = f.getByTestId('title-text');
  const skeletonBox = await skeleton.boundingBox();
  const textBox = await text.boundingBox();
  expect(skeletonBox!.height).toBe(textBox!.height); // title-lg: 28
  const bar = skeleton.locator('.bland-skeleton__bar');
  expect((await bar.boundingBox())!.height).toBe(22); // title-lg font size
  expect((await bar.boundingBox())!.width).toBe(skeletonBox!.width); // one line: full width
});

test('lines stack touching; the last of several is 60% wide', async ({ page }) => {
  const skeleton = frame(page).locator('.bland-skeleton[data-type="body-md"]').first();
  const lines = skeleton.locator('.bland-skeleton__line');
  await expect(lines).toHaveCount(3);
  expect((await skeleton.boundingBox())!.height).toBe(60); // 3 x body-md 20
  const full = (await lines.nth(0).locator('.bland-skeleton__bar').boundingBox())!.width;
  const last = (await lines.nth(2).locator('.bland-skeleton__bar').boundingBox())!.width;
  expect(last / full).toBeCloseTo(0.6, 2);
});

test('circles take Avatar sizes; a rect fills its box at 16:9', async ({ page }) => {
  const f = frame(page);
  for (const [size, px] of [['xs', 16], ['md', 32], ['3xl', 80]] as const) {
    const box = (await f.locator(`.bland-skeleton[data-shape="circle"][data-size="${size}"]`).first().boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
  }
  const rect = (await f.locator('.bland-skeleton[data-shape="rect"][data-radius="md"]').first().boundingBox())!;
  expect(rect.width / rect.height).toBeCloseTo(16 / 9, 1);
});

test('every skeleton is hidden from screen readers', async ({ page }) => {
  const skeletons = frame(page).locator('.bland-skeleton');
  const count = await skeletons.count();
  expect(count).toBeGreaterThan(10);
  for (let i = 0; i < count; i++) await expect(skeletons.nth(i)).toHaveAttribute('aria-hidden', 'true');
});

test('SkeletonGroup is busy and says Loading once, in a polite status', async ({ page }) => {
  const group = frame(page).locator('.bland-skeleton-group').first();
  await expect(group).toHaveAttribute('aria-busy', 'true');
  const status = group.getByRole('status');
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText('Loading');
});

test('the fill pulses over duration/pulse, and stands still under reduced motion', async ({ page }) => {
  const bar = frame(page).locator('.bland-skeleton__bar').first();
  await expect(bar).toHaveCSS('animation-name', 'bland-skeleton-pulse');
  await expect(bar).toHaveCSS('animation-duration', '1.6s');
  await expect(bar).toHaveCSS('animation-iteration-count', 'infinite');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(bar).toHaveCSS('animation-name', 'none');
});
