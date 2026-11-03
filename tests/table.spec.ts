// Behaviour of Table: table semantics, row selection (multiple and single), sorting, expand, sizes, hover, overflow.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory, clickToFocus } from './stories';

/** The computed color of a token, resolved the way the browser resolves a background. */
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

const bg = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
const firstCell = (row: Locator) => row.locator('td').nth(1);

test.beforeEach(async ({ page }) => {
  await openStory(page, 'table', 'light');
});

test('a native table: named, column headers with scope, rows and cells', async ({ page }) => {
  const table = page.getByRole('table', { name: 'People sm', exact: true });
  await expect(table.getByRole('columnheader')).toHaveCount(4);
  await expect(table.locator('th').first()).toHaveAttribute('scope', 'col');
  await expect(table.getByRole('row')).toHaveCount(4);
  await expect(table.getByRole('cell', { name: 'Ada Lovelace' })).toBeVisible();
});

test('rows and headers are table/sm, md and lg high; control columns are squares', async ({ page }) => {
  for (const [size, h] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
    const heights = await page.getByRole('table', { name: `People ${size}`, exact: true }).locator('tr').evaluateAll((rows) => rows.map((r) => r.getBoundingClientRect().height));
    expect(heights).toEqual([h, h, h, h]);
  }
  const control = page.getByTestId('multiple').locator('td').first();
  expect(await control.evaluate((e) => e.getBoundingClientRect().width)).toBe(32);
});

test('multiple: a row Checkbox selects the row; select all goes mixed, then all, skipping a disabled row', async ({ page }) => {
  const table = page.getByTestId('multiple');
  const all = table.getByRole('checkbox', { name: 'Select all rows' });
  const ada = table.getByRole('row').filter({ hasText: 'Ada Lovelace' });
  const grace = table.getByRole('row').filter({ hasText: 'Grace Hopper' });
  const alan = table.getByRole('row').filter({ hasText: 'Alan Turing' });

  await expect(grace).toHaveAttribute('aria-selected', 'true');
  await expect(ada).toHaveAttribute('aria-selected', 'false');
  expect(await all.evaluate((i: HTMLInputElement) => i.indeterminate)).toBe(true);
  expect(await bg(firstCell(grace))).toBe(await tokenColor(page, '--table-surface-cell-selected'));

  await table.getByRole('checkbox', { name: 'Select Ada Lovelace' }).check();
  await expect(ada).toHaveAttribute('aria-selected', 'true');
  // Every enabled row is selected now, so select all is checked; the disabled row stays out.
  await expect(all).toBeChecked();
  expect(await all.evaluate((i: HTMLInputElement) => i.indeterminate)).toBe(false);
  await expect(table.getByRole('checkbox', { name: 'Select Alan Turing' })).toBeDisabled();
  await expect(alan).toHaveAttribute('aria-selected', 'false');
  expect(await bg(table.locator('thead th').first())).toBe(await tokenColor(page, '--table-surface-header-selected'));

  await all.uncheck();
  await expect(ada).toHaveAttribute('aria-selected', 'false');
  await expect(grace).toHaveAttribute('aria-selected', 'false');
  await all.check();
  await expect(ada).toHaveAttribute('aria-selected', 'true');
  await expect(alan).toHaveAttribute('aria-selected', 'false');
});

test('multiple: Space on a focused row Checkbox toggles it', async ({ page }) => {
  const box = page.getByTestId('multiple').getByRole('checkbox', { name: 'Select Ada Lovelace' });
  await box.focus();
  await page.keyboard.press('Space');
  await expect(box).toBeChecked();
});

test('single: a Radio column selects one row at a time, under a blank header', async ({ page }) => {
  const table = page.getByTestId('single');
  await expect(table.locator('thead tr > :first-child')).toHaveText('');
  expect(await table.locator('thead tr > :first-child').evaluate((e) => e.tagName)).toBe('TD');
  const grace = table.getByRole('radio', { name: 'Select Grace Hopper' });
  await clickToFocus(grace);
  await expect(table.getByRole('row').filter({ hasText: 'Grace Hopper' })).toHaveAttribute('aria-selected', 'true');
  await expect(table.getByRole('row').filter({ hasText: 'Ada Lovelace' })).toHaveAttribute('aria-selected', 'false');
  // Arrow keys move the selection within the radio group, natively.
  await page.keyboard.press('ArrowDown');
  await expect(table.getByRole('row').filter({ hasText: 'Alan Turing' })).toHaveAttribute('aria-selected', 'true');
});

test('sortable headers are buttons; aria-sort follows the sort and the rows reorder', async ({ page }) => {
  const table = page.getByTestId('sortable');
  const name = table.getByRole('columnheader', { name: 'Name' });
  const seen = table.getByRole('columnheader', { name: 'Last seen' });
  const firstName = () => table.locator('tbody tr').first().locator('td').first();

  await expect(name).toHaveAttribute('aria-sort', 'ascending');
  await expect(seen).not.toHaveAttribute('aria-sort');
  await expect(firstName()).toHaveText('Ada Lovelace');
  // Role is not sortable: no button.
  await expect(table.getByRole('columnheader', { name: 'Role' }).getByRole('button')).toHaveCount(0);

  await name.getByRole('button').click();
  await expect(name).toHaveAttribute('aria-sort', 'descending');
  await expect(firstName()).toHaveText('Grace Hopper');

  await seen.getByRole('button').focus();
  await page.keyboard.press('Enter');
  await expect(seen).toHaveAttribute('aria-sort', 'ascending');
  await expect(name).not.toHaveAttribute('aria-sort');
});

test('a sort button shows the inset focus ring and the header hover fill', async ({ page }) => {
  const button = page.getByTestId('sortable').getByRole('button', { name: 'Name' });
  await button.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(button).toHaveCSS('outline-offset', '-2px');
  const th = page.getByTestId('sortable').getByRole('columnheader', { name: 'Name' });
  await button.hover();
  expect(await bg(th)).toBe(await tokenColor(page, '--table-surface-header-hover'));
});

test('body rows take the hover fill; selected rows keep the selected fill', async ({ page }) => {
  const table = page.getByTestId('multiple');
  const ada = table.getByRole('row').filter({ hasText: 'Ada Lovelace' });
  await firstCell(ada).hover();
  expect(await bg(firstCell(ada))).toBe(await tokenColor(page, '--table-surface-cell-hover'));
  const grace = table.getByRole('row').filter({ hasText: 'Grace Hopper' });
  await firstCell(grace).hover();
  expect(await bg(firstCell(grace))).toBe(await tokenColor(page, '--table-surface-cell-selected'));
});

test('expand: the caret button sets aria-expanded and shows the details row; a disabled row disables its buttons', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Expandable people sm' });
  const ada = table.getByRole('button', { name: 'Details for Ada Lovelace' });
  await expect(ada).toHaveAttribute('aria-expanded', 'false');
  await ada.click();
  await expect(ada).toHaveAttribute('aria-expanded', 'true');
  await expect(table.getByRole('cell', { name: /ada@example.com/ })).toBeVisible();
  const controls = await ada.getAttribute('aria-controls');
  await expect(table.locator(`#${controls}`)).toBeVisible();
  await expect(table.getByRole('button', { name: 'Details for Alan Turing' })).toBeDisabled();
  await expect(table.getByRole('button', { name: 'Options for Alan Turing' })).toBeDisabled();
  await expect(table.getByRole('button', { name: 'Table options' })).toBeEnabled();
});

test('option: the DotsThree button opens a Menu of the row actions; choosing one runs it and returns focus', async ({ page }) => {
  const table = page.getByRole('table', { name: 'Expandable people sm' });
  const ada = table.getByRole('button', { name: 'Options for Ada Lovelace' });
  await expect(ada).toHaveAttribute('aria-haspopup', 'true');
  await ada.click();
  const menu = page.getByRole('menu');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAccessibleName('Options for Ada Lovelace');
  await expect(menu.getByRole('menuitem')).toHaveText(['Edit', 'Send a message', 'Remove']);
  // bottom-end: the menu's right edge lines up with the button's.
  const [b, m] = [(await ada.boundingBox())!, (await menu.locator('xpath=ancestor::*[contains(@class,"bland-menu ")][1]').boundingBox())!];
  expect(Math.round(m.x + m.width)).toBe(Math.round(b.x + b.width));
  await page.getByRole('menuitem', { name: 'Remove' }).click();
  await expect(menu).toBeHidden();
  await expect(table).toHaveAttribute('data-last-action', 'ada:remove');
  await expect(ada).toBeFocused();
});

test('a table wider than its container scrolls sideways and takes focus; labels end in an ellipsis', async ({ page }) => {
  const viewport = page.getByTestId('narrow').locator('.bland-scroll-area__viewport');
  expect(await viewport.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  await expect(viewport).toHaveAttribute('tabindex', '0');
  await expect(page.getByTestId('narrow').locator('.bland-scroll-area')).toHaveAttribute('data-overflow', '');
  // Basic columns keep table/cell-width.
  const widths = await page.getByTestId('narrow').locator('thead th').evaluateAll((ths) => ths.map((t) => t.getBoundingClientRect().width));
  expect(widths).toEqual([128, 128, 128, 128]);
  const label = page.getByTestId('narrow').locator('thead .bland-table__label').first();
  expect(await label.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).textOverflow === 'ellipsis')).toBe(true);
  // A table that fits is not a tab stop.
  await expect(page.getByTestId('multiple').locator('xpath=ancestor::div[contains(@class,"bland-scroll-area__viewport")]')).not.toHaveAttribute('tabindex');
});
