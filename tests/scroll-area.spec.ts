// Behaviour of the overflow rule: fade edges and thumb follow the scroll position.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test('vertical scroll area shows the end fade at the top and both fades mid-way', async ({ page }) => {
  await openStory(page, 'scroll-area', 'light');
  const area = page.getByTestId('scroll-y');
  const viewport = area.locator('.bland-scroll-area__viewport');
  await expect(area).toHaveAttribute('data-overflow', '');
  await expect(viewport).not.toHaveAttribute('data-fade-start');
  await expect(viewport).toHaveAttribute('data-fade-end', '');

  await viewport.evaluate((el) => (el.scrollTop = 100));
  await expect(viewport).toHaveAttribute('data-fade-start', '');
  await expect(viewport).toHaveAttribute('data-fade-end', '');

  await viewport.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(viewport).not.toHaveAttribute('data-fade-end');
});

test('keyboard scrolling moves the thumb', async ({ page }) => {
  await openStory(page, 'scroll-area', 'light');
  const area = page.getByTestId('scroll-y');
  const thumb = area.locator('.bland-scroll-area__thumb');
  const before = await thumb.boundingBox();
  await area.locator('.bland-scroll-area__viewport').focus();
  await page.keyboard.press('PageDown');
  await expect.poll(async () => (await thumb.boundingBox())!.y).toBeGreaterThan(before!.y);
});

test('content that fits shows no scrollbar and no fade', async ({ page }) => {
  await openStory(page, 'scroll-area', 'light');
  const area = page.getByTestId('scroll-fits');
  await expect(area).not.toHaveAttribute('data-overflow');
  await expect(area.locator('.bland-scroll-area__track')).toBeHidden();
});

test('dragging the thumb scrolls the content', async ({ page }) => {
  await openStory(page, 'scroll-area', 'light');
  const area = page.getByTestId('scroll-y');
  const box = (await area.locator('.bland-scroll-area__thumb').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 4);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 80, { steps: 5 });
  await page.mouse.up();
  const top = await area.locator('.bland-scroll-area__viewport').evaluate((el) => el.scrollTop);
  expect(top).toBeGreaterThan(0);
});
