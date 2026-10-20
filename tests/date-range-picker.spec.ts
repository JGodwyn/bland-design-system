// Behaviour of Date Range Picker: two labelled fields, one Range calendar, ISO values.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const picker = (page: Page) => page.getByTestId('controlled');
const value = (page: Page) => page.getByTestId('controlled-value');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'date-range-picker', 'light');
  await page.keyboard.press('Escape');
});

test("each field's segments are labelled by its own label", async ({ page }) => {
  await expect(picker(page).getByRole('spinbutton', { name: /^day.*Start date/ })).toBeVisible();
  await expect(picker(page).getByRole('spinbutton', { name: /^day.*End date/ })).toBeVisible();
});

test('the calendar picks a start then an end', async ({ page }) => {
  await picker(page).getByRole('button', { name: 'Calendar' }).last().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByText('12', { exact: true }).click();
  await dialog.getByText('15', { exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(value(page)).toHaveText('2024-11-12 to 2024-11-15');
});

test('typing the end date changes the range', async ({ page }) => {
  await picker(page).getByRole('spinbutton', { name: /^day.*End date/ }).focus();
  await page.keyboard.type('25');
  await expect(value(page)).toHaveText('2024-11-09 to 2024-11-25');
});

test('a press on either field opens the shared calendar with focus left in the field', async ({ page }) => {
  const endDay = picker(page).getByRole('spinbutton', { name: /^day.*End date/ });
  await endDay.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(endDay).toBeFocused();
  // A press on the other field keeps it open.
  await picker(page).getByRole('spinbutton', { name: /^day.*Start date/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});
