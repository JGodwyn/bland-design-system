// Behaviour of Chat list item: list semantics, button and link rows, aria-current, unread and status, hover, inset focus ring, truncation.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

async function tokenColor(page: Page, token: string) {
  return page.evaluate((t) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = `var(${t})`;
    document.querySelector('[data-testid^="frame-"]')!.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, token);
}

const style = (el: Locator, prop: string) => el.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

test.beforeEach(async ({ page }) => {
  await openStory(page, 'chat-list-item', 'light');
});

test('rows are list items; button rows are named by their content, with the unread or status word', async ({ page }) => {
  const types = page.getByRole('list', { name: 'Types' });
  await expect(types.getByRole('listitem')).toHaveCount(5);
  await expect(types.getByRole('button').nth(0)).toHaveAccessibleName('Jane Doe 09:41 Here is a brief message Unread');
  await expect(types.getByRole('button').nth(3)).toHaveAccessibleName(/Delivered$/);
});

test('pressing a row makes it the open chat (aria-current)', async ({ page }) => {
  const list = page.getByRole('list', { name: 'Openable chats' });
  const jane = list.getByRole('button', { name: /^Jane Doe/ });
  const ada = list.getByRole('button', { name: /^Ada Lovelace/ });
  await expect(jane).toHaveAttribute('aria-current', 'true');
  await ada.focus();
  await page.keyboard.press('Enter');
  await expect(ada).toHaveAttribute('aria-current', 'true');
  await expect(jane).not.toHaveAttribute('aria-current');
});

test('the open chat takes the selected fill (Figma Selected), and its hover fill on hover', async ({ page }) => {
  const list = page.getByRole('list', { name: 'Openable chats' });
  const jane = list.getByRole('button', { name: /^Jane Doe/ });
  expect(await style(jane, 'background-color')).toBe(await tokenColor(page, '--messaging-surface-list-selected'));
  await jane.hover();
  await expect.poll(() => style(jane, 'background-color')).toBe(await tokenColor(page, '--messaging-surface-list-selected-hover'));
});

test('a row with href is a link', async ({ page }) => {
  await expect(page.getByRole('list', { name: 'Links' }).getByRole('link')).toHaveAttribute('href', '#/components/chat-list-item');
});

test('rows rest on surface-100 and hover to surface-200; plain rows do not', async ({ page }) => {
  const row = page.getByRole('list', { name: 'Types' }).getByRole('button').first();
  await expect(row).toHaveCSS('background-color', await tokenColor(page, '--surface-100'));
  await row.hover();
  await expect.poll(() => style(row, 'background-color')).toBe(await tokenColor(page, '--surface-200'));
  const plain = page.getByRole('list', { name: 'Truncation' }).locator('.bland-chat-list-item__row').first();
  await plain.hover();
  await page.waitForTimeout(300);
  expect(await style(plain, 'background-color')).toBe(await tokenColor(page, '--surface-100'));
});

test('keyboard focus draws the 2px ring inside the row', async ({ page }) => {
  const row = page.getByRole('list', { name: 'Types' }).getByRole('button').first();
  await row.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(row).toBeFocused();
  await expect(row).toHaveCSS('outline-width', '2px');
  await expect(row).toHaveCSS('outline-offset', '-2px');
  await expect(row).toHaveCSS('outline-color', await tokenColor(page, '--border-focused'));
});

test('rows are 72 high, and name and message end in an ellipsis while the date stays whole', async ({ page }) => {
  const rows = page.getByRole('list', { name: 'Truncation' }).locator('.bland-chat-list-item__row');
  expect((await rows.first().boundingBox())!.height).toBe(72);
  const clipped = (el: Locator) => el.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).textOverflow === 'ellipsis');
  expect(await clipped(rows.first().locator('.bland-chat-list-item__name'))).toBe(true);
  expect(await clipped(rows.first().locator('.bland-chat-list-item__message'))).toBe(true);
  expect(await clipped(rows.first().locator('.bland-chat-list-item__date'))).toBe(false);
});
