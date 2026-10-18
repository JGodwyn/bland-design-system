// Behaviour of Search Input: searchbox role and name, the clear button (click and Escape), controlled clearing.
import { expect, test, type Locator } from '@playwright/test';
import { openStory } from './stories';

const clearButton = (input: Locator) =>
  input.locator('xpath=ancestor::div[contains(concat(" ", @class, " "), " bland-search-input ")][1]').getByRole('button');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'search-input', 'light');
});

test('a searchbox named "Search" by default, or by its own aria-label', async ({ page }) => {
  await expect(page.getByTestId('uncontrolled')).toHaveAttribute('type', 'search');
  await expect(page.getByTestId('uncontrolled')).toHaveAccessibleName('Search');
  await expect(page.getByRole('searchbox', { name: 'Controlled search' })).toBeVisible();
});

test('the clear button shows only while there is a value, and clears and refocuses', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  const clear = clearButton(input);
  await expect(clear).toBeHidden();
  await input.fill('tokens');
  await expect(clear).toBeVisible();
  await expect(clear).toHaveAccessibleName('Clear search');
  await clear.click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(clear).toBeHidden();
});

test('Escape clears; the clear button is not a Tab stop', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  await input.fill('tokens');
  await expect(clearButton(input)).toHaveAttribute('tabindex', '-1');
  await input.press('Escape');
  await expect(input).toHaveValue('');
});

test('a controlled field gets onChange with the empty value, then onClear', async ({ page }) => {
  const input = page.getByTestId('controlled');
  await expect(input).toHaveValue('Bland');
  await clearButton(input).click();
  await expect(input).toHaveValue('');
  await expect(page.getByTestId('controlled-value')).toHaveText('(empty) · 1 cleared');
});

test('the clear hit area is control/xs around the 20px icon', async ({ page }) => {
  const input = page.getByTestId('controlled');
  const hit = await clearButton(input).evaluate((b) => {
    const s = getComputedStyle(b, '::before');
    return [s.width, s.height, b.getBoundingClientRect().width];
  });
  expect(hit).toEqual(['24px', '24px', 20]);
});
