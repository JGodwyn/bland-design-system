// Behaviour of Time Picker: segments, the AM / PM add-on, 24-hour values.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const picker = (page: Page) => page.getByTestId('controlled');
const value = (page: Page) => page.getByTestId('controlled-value');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'time-picker', 'light');
});

test('12-hour time shows the period in the trailing add-on; the value stays 24-hour', async ({ page }) => {
  await expect(picker(page).locator('.bland-date-field__segments')).toHaveText(/^\W*02:30\W*$/);
  const period = picker(page).locator('.bland-text-input__addon').getByRole('spinbutton');
  await expect(period).toHaveText('PM');
  await period.focus();
  await page.keyboard.press('ArrowUp');
  await expect(period).toHaveText('AM');
  await expect(value(page)).toHaveText('02:30');
});

test('arrows step a segment, digits type it, and ArrowRight reaches the add-on', async ({ page }) => {
  const hour = picker(page).getByRole('spinbutton', { name: /hour/i });
  await hour.focus();
  await page.keyboard.press('ArrowUp');
  await expect(value(page)).toHaveText('15:30');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.type('45');
  await expect(value(page)).toHaveText('15:45');
  await page.keyboard.press('ArrowRight');
  await expect(picker(page).locator('.bland-text-input__addon').getByRole('spinbutton')).toBeFocused();
});

test('24-hour time has no add-on', async ({ page }) => {
  const field = page.locator('.bland-date-field').filter({ hasText: '24-hour' });
  await expect(field.locator('.bland-date-field__segments')).toHaveText(/^\W*14:30\W*$/);
  await expect(field.locator('.bland-text-input__addon')).toHaveCount(0);
});

test('a press on AM / PM switches it', async ({ page }) => {
  const period = picker(page).locator('.bland-text-input__addon').getByRole('spinbutton');
  await period.click();
  await expect(period).toHaveText('AM');
  await expect(value(page)).toHaveText('02:30');
  await period.click();
  await expect(period).toHaveText('PM');
  await expect(value(page)).toHaveText('14:30');
  // Typing still works.
  await page.keyboard.type('a');
  await expect(value(page)).toHaveText('02:30');
});
