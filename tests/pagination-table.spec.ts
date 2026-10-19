// Behaviour of Pagination-table: the summary follows the page, the advanced page field commits, clamps and reverts.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'pagination-table', 'light');
});

const row = (page: import('@playwright/test').Page, name: string) =>
  page.locator('.bland-pagination-table').filter({ has: page.getByRole('navigation', { name }) });

test('simple: the summary follows the page', async ({ page }) => {
  const footer = row(page, 'Pagination simple sm');
  await expect(footer.locator('.bland-pagination-table__summary')).toHaveText('1-10 of 100 items');
  await footer.getByRole('button', { name: 'Page 3' }).click();
  await expect(footer.locator('.bland-pagination-table__summary')).toHaveText('21-30 of 100 items');
});

test('advanced: a page field described by the page count, and previous and next', async ({ page }) => {
  const footer = row(page, 'Pagination advanced sm');
  const field = footer.getByRole('textbox', { name: 'Page advanced sm' });
  await expect(field).toHaveValue('1');
  await expect(field).toHaveAccessibleDescription('of 10 pages');
  await footer.getByRole('button', { name: 'Next page' }).click();
  await expect(field).toHaveValue('2');
  await expect(footer.locator('.bland-pagination-table__summary')).toHaveText('11-20 of 100 items');
  // The field is Text Input sm at every size, pagination/input-width wide.
  const box = (await row(page, 'Pagination advanced lg').locator('.bland-text-input__field').boundingBox())!;
  expect([box.width, box.height]).toEqual([56, 32]);
});

test('advanced: Enter commits a page, out of range clamps, empty goes back, arrows step', async ({ page }) => {
  const footer = row(page, 'Pagination advanced sm');
  const field = footer.getByRole('textbox', { name: 'Page advanced sm' });
  const summary = footer.locator('.bland-pagination-table__summary');
  await field.fill('7');
  await field.press('Enter');
  await expect(summary).toHaveText('61-70 of 100 items');
  await field.fill('99');
  await field.press('Enter');
  await expect(field).toHaveValue('10');
  await expect(summary).toHaveText('91-100 of 100 items');
  await expect(footer.getByRole('button', { name: 'Next page' })).toHaveAttribute('aria-disabled', 'true');
  await field.fill('');
  await field.press('Tab');
  await expect(field).toHaveValue('10');
  await field.focus();
  await field.press('ArrowDown');
  await expect(summary).toHaveText('81-90 of 100 items');
});
