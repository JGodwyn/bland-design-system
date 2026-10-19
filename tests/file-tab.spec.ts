// Behaviour of File tab: tabs, closing (button and Delete), neighbour selection and focus, fills per state.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'file-tab', 'light');
});

const bg = (el: import('@playwright/test').Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);

test('the close button removes its tab; closing the selected tab selects the next one', async ({ page }) => {
  const root = page.getByTestId('closable');
  const index = root.getByRole('tab', { name: 'index.tsx' });
  await expect(index).toHaveAttribute('aria-selected', 'true');
  await root.locator('.bland-file-tabs__item', { has: page.getByRole('tab', { name: 'index.tsx' }) }).locator('.bland-file-tabs__close').click();
  await expect(index).toHaveCount(0);
  await expect(root.getByRole('tab', { name: 'Button.tsx' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('closable-value')).toHaveText('Button.tsx of 3');
  await expect(root.getByRole('tabpanel')).toHaveText('Button.tsx contents');
});

test('Delete closes the focused tab and keeps focus in the row, on its neighbour', async ({ page }) => {
  const root = page.getByTestId('closable');
  const index = root.getByRole('tab', { name: 'index.tsx' });
  await expect(index).toHaveAttribute('aria-keyshortcuts', 'Delete');
  await index.focus();
  await page.keyboard.press('End');
  const last = root.getByRole('tab', { name: 'tokens.css' });
  await expect(last).toBeFocused();
  await page.keyboard.press('Delete');
  await expect(last).toHaveCount(0);
  const previous = root.getByRole('tab', { name: 'button.css' });
  await expect(previous).toBeFocused();
  await expect(previous).toHaveAttribute('aria-selected', 'true');
});

test('the close button is pointer only: not a Tab stop, out of the accessibility tree', async ({ page }) => {
  const close = page.getByTestId('closable').locator('.bland-file-tabs__close').first();
  await expect(close).toHaveAttribute('tabindex', '-1');
  await expect(close).toHaveAttribute('aria-hidden', 'true');
  await page.getByTestId('closable').getByRole('tab', { name: 'index.tsx' }).focus();
  await page.keyboard.press('Tab');
  await expect(close).not.toBeFocused();
});

test('fills: selected surface-100, unselected surface-300 and hover 400, disabled 200; minimized is square', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Files sm' });
  const item = (name: string) => list.locator('.bland-file-tabs__item', { has: page.getByRole('tab', { name, exact: true }) });
  expect(await bg(item('index.tsx'))).toBe(await tokenColor(page, '--surface-100'));
  expect(await bg(item('Button.tsx'))).toBe(await tokenColor(page, '--surface-300'));
  expect(await bg(item('locked.ts'))).toBe(await tokenColor(page, '--surface-200'));
  await page.mouse.move(1, 1);
  await item('Button.tsx').hover();
  await expect.poll(() => bg(item('Button.tsx'))).toBe(await tokenColor(page, '--surface-400'));
  const pinned = await item('Pinned').boundingBox();
  expect([pinned!.width, pinned!.height]).toEqual([32, 32]);
  await expect(list.getByRole('tab', { name: 'README.md' })).not.toHaveAttribute('aria-keyshortcuts');
});

test('the ring shows on the tab item while its tab has keyboard focus', async ({ page }) => {
  const tab = page.getByRole('tablist', { name: 'Files md' }).getByRole('tab', { name: 'index.tsx' });
  await tab.focus();
  await page.keyboard.press('ArrowRight');
  const next = page.getByRole('tablist', { name: 'Files md' }).getByRole('tab', { name: 'Button.tsx' });
  await expect(next).toBeFocused();
  const outline = await next.evaluate((e) => getComputedStyle(e.parentElement!).outlineStyle);
  expect(outline).toBe('solid');
});

test('the bar is as tall as its tabs: no room around them', async ({ page }) => {
  for (const [size, height] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
    const list = page.getByRole('tablist', { name: `Files ${size}` });
    const bar = page.locator('.bland-file-tabs__bar', { has: list });
    const tab = list.locator('.bland-file-tabs__item').nth(1);
    const [barBox, tabBox] = await Promise.all([bar.boundingBox(), tab.boundingBox()]);
    expect([barBox!.height, tabBox!.height, tabBox!.y]).toEqual([height, height, barBox!.y]);
  }
});
