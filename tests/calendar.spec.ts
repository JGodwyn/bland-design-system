// Behaviour of Calendar: the day grid (React Aria), views, navigation, ranges, bounds and today.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const calendar = (page: Page, name: string) => page.locator(`.bland-calendar[aria-label^="${name},"]`);
const day = (page: Page, name: string, n: number) =>
  calendar(page, name).locator('td:not([aria-hidden]) .bland-calendar__item:not([data-outside])').getByText(String(n), { exact: true });
const cellOf = (page: Page, name: string, n: number) => day(page, name, n).locator('xpath=ancestor::td[1]');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'calendar', 'light');
});

test('today is marked with aria-current and an underline', async ({ page }) => {
  const today = day(page, 'Day sm', 11).locator('xpath=..');
  await expect(today).toHaveAttribute('aria-current', 'date');
  await expect(today.locator('.bland-calendar__label')).toHaveCSS('text-decoration-line', 'underline');
});

test('a press selects a day; arrow keys move and Enter picks', async ({ page }) => {
  await day(page, 'Day sm', 14).click();
  await expect(cellOf(page, 'Day sm', 14)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(cellOf(page, 'Day sm', 22)).toHaveAttribute('aria-selected', 'true');
  await expect(cellOf(page, 'Day sm', 14)).not.toHaveAttribute('aria-selected', 'true');
});

test('previous and next change the month', async ({ page }) => {
  const cal = calendar(page, 'Day sm');
  await cal.getByRole('button', { name: 'Next' }).click();
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText(/Dec\s*2024/);
  await cal.getByRole('button', { name: 'Previous' }).click();
  await cal.getByRole('button', { name: 'Previous' }).click();
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText(/Oct\s*2024/);
});

test('the toggle opens months, then years; picking goes back down', async ({ page }) => {
  const cal = calendar(page, 'Day md');
  const toggle = cal.locator('button.bland-calendar__toggle');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(cal).toHaveAttribute('data-view', 'month');
  await expect(cal.getByRole('gridcell', { selected: true })).toHaveText('Nov');
  await cal.locator('button.bland-calendar__toggle').click();
  await expect(cal).toHaveAttribute('data-view', 'year');
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText('2020 – 2031');
  await cal.getByRole('button', { name: 'Next' }).click();
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText('2030 – 2041');
  await cal.getByRole('button', { name: '2032' }).click();
  await expect(cal).toHaveAttribute('data-view', 'month');
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText(/2032/);
  // Focus lands on the month in view; arrows move it, Enter picks it.
  await expect(cal.getByRole('button', { name: 'Nov' })).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(cal.getByRole('button', { name: 'Aug' })).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Enter');
  await expect(cal).toHaveAttribute('data-view', 'day');
  await expect(cal.locator('.bland-calendar__toggle')).toHaveText(/Jul\s*2032/);
  await expect(cal.locator('[role="gridcell"] [tabindex="0"]')).toBeFocused();
});

test('a range: the first press is the start, the second the end', async ({ page }) => {
  await day(page, 'Range md', 4).click();
  await day(page, 'Range md', 7).click();
  for (const n of [4, 7]) await expect(day(page, 'Range md', n).locator('xpath=..')).toHaveAttribute('data-selection', 'selected');
  for (const n of [5, 6]) await expect(day(page, 'Range md', n).locator('xpath=..')).toHaveAttribute('data-selection', 'range');
  await expect(day(page, 'Range md', 9).locator('xpath=..')).toHaveAttribute('data-selection', 'none');
});

test('dates out of bounds and unavailable dates cannot be picked', async ({ page }) => {
  const early = day(page, 'Bounded', 4).locator('xpath=..');
  await expect(early).toHaveAttribute('aria-disabled', 'true');
  await expect(calendar(page, 'Bounded').getByRole('button', { name: 'Previous' })).toBeDisabled();
  await day(page, 'Weekdays only', 9).click({ force: true });
  await expect(cellOf(page, 'Weekdays only', 9)).not.toHaveAttribute('aria-selected', 'true');
});

test('sizes: cells control/xs, sm, md; widths calendar/width-*', async ({ page }) => {
  for (const [size, cell, width] of [
    ['sm', 24, 168],
    ['md', 32, 224],
    ['lg', 40, 280],
  ] as const) {
    const box = (await day(page, `Day ${size}`, 12).locator('xpath=..').boundingBox())!;
    expect([box.width, box.height]).toEqual([cell, cell]);
    const title = (await calendar(page, `Day ${size}`).locator('.bland-calendar__title').boundingBox())!;
    expect(title.width).toBe(width);
  }
});
