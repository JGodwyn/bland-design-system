// Behaviour of Numeric Input Field: typing moves on, Backspace moves back, arrows, paste, letters ignored, wiring.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const boxes = (page: Page, id: string) => page.getByTestId(id).getByRole('textbox');
const values = async (page: Page, id: string) => (await boxes(page, id).evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value))).join('|');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'numeric-input-field', 'light');
});

test('a labelled group of boxes, each named and described', async ({ page }) => {
  const group = page.getByRole('group', { name: 'Uncontrolled' });
  await expect(group).toBeVisible();
  const first = boxes(page, 'uncontrolled').first();
  await expect(first).toHaveAccessibleName('Digit 1 of 4');
  await expect(first).toHaveAccessibleDescription('Check your messages');
  await expect(first).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(first).toHaveAttribute('inputmode', 'numeric');
});

test('typing fills a box and moves on; letters are ignored', async ({ page }) => {
  const b = boxes(page, 'uncontrolled');
  await b.first().click();
  await page.keyboard.type('1a2');
  expect(await values(page, 'uncontrolled')).toBe('1|2||');
  await expect(b.nth(2)).toBeFocused();
});

test('Backspace clears, then moves back; the arrow keys move between boxes', async ({ page }) => {
  const b = boxes(page, 'uncontrolled');
  await b.first().click();
  await page.keyboard.type('123');
  await page.keyboard.press('Backspace'); // box 4 is empty: clears box 3 and moves there
  expect(await values(page, 'uncontrolled')).toBe('1|2||');
  await expect(b.nth(2)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(b.nth(1)).toBeFocused();
  await page.keyboard.press('Backspace'); // box 2 holds a digit: clears it, stays
  expect(await values(page, 'uncontrolled')).toBe('1|||');
  await expect(b.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(b.nth(3)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(b.nth(0)).toBeFocused();
});

test('pasting a code fills every box', async ({ page }) => {
  const b = boxes(page, 'uncontrolled');
  await b.nth(2).focus();
  await page.evaluate(() => {
    const data = new DataTransfer();
    data.setData('text', '98-76');
    document.activeElement!.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  });
  expect(await values(page, 'uncontrolled')).toBe('9|8|7|6');
  await expect(b.nth(3)).toBeFocused();
  await expect(page.locator('input[type="hidden"][name="otp"]')).toHaveValue('9876');
});

test('controlled: onValueChange and onComplete', async ({ page }) => {
  await boxes(page, 'controlled').first().click();
  await page.keyboard.type('4321');
  await expect(page.getByTestId('controlled-value')).toHaveText('4321 · complete: 4321');
});

test('boxes are digit/sm, md and lg squares', async ({ page }) => {
  for (const [size, px] of [['sm', 40], ['md', 56], ['lg', 72]] as const) {
    const box = (await page.locator(`.bland-numeric-input-field[data-size="${size}"] .bland-numeric-input-field__box`).first().boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
  }
});
