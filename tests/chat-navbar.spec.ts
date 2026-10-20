// Behaviour of Chat navbar: header and heading, buttons by handler, the More menu, truncation, the divider.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'chat-navbar', 'light');
});

test('a header with the name as an h2 and its status line', async ({ page }) => {
  const first = page.locator('header.bland-chat-navbar').first();
  await expect(first.getByRole('heading', { level: 2, name: 'Jane Doe' })).toBeVisible();
  await expect(first.locator('.bland-chat-navbar__description')).toHaveText('Online');
  expect((await first.boundingBox())!.height).toBe(56);
});

test('each button shows only when its handler is given, named for screen readers', async ({ page }) => {
  const navs = page.locator('header.bland-chat-navbar');
  for (const name of ['Back', 'Search', 'Voice call', 'Video call', 'More', 'Close']) {
    await expect(navs.nth(0).getByRole('button', { name, exact: true })).toBeVisible();
  }
  await expect(navs.nth(1).getByRole('button')).toHaveCount(2);
  await expect(navs.nth(2).getByRole('button')).toHaveCount(0);
});

test('buttons call their handlers; More opens a Menu and reports the chosen item', async ({ page }) => {
  const nav = page.getByTestId('pressed');
  const last = page.getByTestId('pressed-last');
  await nav.getByRole('button', { name: 'Video call' }).click();
  await expect(last).toHaveText('video');
  await nav.getByRole('button', { name: 'Back' }).click();
  await expect(last).toHaveText('back');
  await nav.getByRole('button', { name: 'More' }).click();
  await page.getByRole('menuitem', { name: 'Mute' }).click();
  await expect(last).toHaveText('mute');
});

test('name and status end in an ellipsis', async ({ page }) => {
  const nav = page.locator('header.bland-chat-navbar').nth(3);
  for (const part of ['__name', '__description']) {
    const el = nav.locator(`.bland-chat-navbar${part}`);
    expect(await el.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).textOverflow === 'ellipsis')).toBe(true);
  }
});
