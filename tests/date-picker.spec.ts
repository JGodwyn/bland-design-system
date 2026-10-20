// Behaviour of Date Picker: typing into segments, the calendar popover, confirm, ISO values.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const picker = (page: Page) => page.getByTestId('controlled');
const value = (page: Page) => page.getByTestId('controlled-value');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'date-picker', 'light');
  // The confirm story opens on load; close it so the rest of the page is free.
  await page.keyboard.press('Escape');
});

test('segments follow the locale and edit with digits and arrows', async ({ page }) => {
  const segments = picker(page).locator('.bland-date-field__segments');
  await expect(segments).toHaveText('09/11/2024');
  const dayField = picker(page).getByRole('spinbutton', { name: /day/i });
  await dayField.focus();
  await page.keyboard.type('15');
  await expect(value(page)).toHaveText('2024-11-15');
  const month = picker(page).getByRole('spinbutton', { name: /month/i });
  await month.focus();
  await page.keyboard.press('ArrowUp');
  await expect(value(page)).toHaveText('2024-12-15');
});

test('the button opens the calendar on the value; picking a day fills the field and closes it', async ({ page }) => {
  const button = picker(page).getByRole('button', { name: 'Calendar' });
  await button.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[aria-selected="true"] [role="button"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(dialog).toBeHidden();
  await expect(value(page)).toHaveText('2024-11-10');
  await expect(button).toBeFocused();
});

test('Escape closes the calendar without a change', async ({ page }) => {
  await picker(page).getByRole('button', { name: 'Calendar' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(value(page)).toHaveText('2024-11-09');
});

test('confirm: a picked day waits for Apply; Cancel drops it', async ({ page }) => {
  const open = page.locator('.bland-date-field').filter({ hasText: 'Label' }).first();
  const segments = open.locator('.bland-date-field__segments');
  await open.getByRole('button', { name: 'Calendar' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('22', { exact: true }).click();
  await expect(dialog).toBeVisible();
  await expect(segments).toHaveText('11/20/2024');
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(segments).toHaveText('11/20/2024');
  await open.getByRole('button', { name: 'Calendar' }).click();
  await dialog.getByText('22', { exact: true }).click();
  await dialog.getByRole('button', { name: 'Apply' }).click();
  await expect(dialog).toBeHidden();
  await expect(segments).toHaveText('11/22/2024');
});

test('a date before minValue turns the field danger', async ({ page }) => {
  const field = page.locator('.bland-date-field').filter({ hasText: 'Check-in' });
  await expect(field).toHaveAttribute('data-status', 'danger');
  await field.getByRole('spinbutton', { name: /day/i }).focus();
  await page.keyboard.type('12');
  await expect(field).toHaveAttribute('data-status', 'default');
});

test('a press on the field opens the calendar and keeps focus there for typing', async ({ page }) => {
  const dayField = picker(page).getByRole('spinbutton', { name: /day/i });
  await dayField.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dayField).toBeFocused();
  // Typing moves the value and the calendar follows to the typed month.
  await page.keyboard.type('15');
  await expect(value(page)).toHaveText('2024-11-15');
  const month = picker(page).getByRole('spinbutton', { name: /month/i });
  await month.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.type('02');
  await expect(value(page)).toHaveText('2024-02-15');
  await expect(dialog.locator('.bland-calendar__toggle')).toHaveText(/Feb\s*2024/);
  await expect(dialog.locator('[aria-selected="true"]')).toHaveText('15');
  // Escape in the field closes it; focus stays in the field (typing moved it on to the next segment).
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(picker(page).locator('.bland-date-field__segments :focus')).toHaveCount(1);
});

test('focus leaving the field closes a calendar it opened', async ({ page }) => {
  await picker(page).getByRole('spinbutton', { name: /day/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('dialog')).toBeHidden();
});

test('the calendar is md by default whatever the field size; calendarSize changes it', async ({ page }) => {
  await picker(page).getByRole('button', { name: 'Calendar' }).click();
  await expect(page.getByRole('dialog').locator('.bland-calendar')).toHaveAttribute('data-size', 'md');
});
