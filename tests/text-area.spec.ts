// Behaviour of Text Area: wiring, rows, growth into the ScrollArea (fade and thumb), resizing, focus.
import { expect, test, type Locator } from '@playwright/test';
import { openStory } from './stories';

const field = (input: Locator) => input.locator('xpath=ancestor::div[contains(@class,"bland-text-area__field")][1]');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'text-area', 'light');
});

test('the label names the textarea, the helper describes it, danger sets aria-invalid', async ({ page }) => {
  await expect(page.getByTestId('uncontrolled')).toHaveAccessibleName('Uncontrolled');
  await expect(page.getByTestId('uncontrolled')).toHaveAccessibleDescription('Read with the field');
  await expect(page.getByTestId('invalid')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('uncontrolled')).not.toHaveAttribute('aria-invalid');
});

test('the field is rows lines of 24 plus 8 above and below', async ({ page }) => {
  const box = (await field(page.getByTestId('uncontrolled')).boundingBox())!;
  expect(box.height).toBe(2 * 24 + 16);
  const defaultRows = page.locator('.bland-text-area__field').first();
  expect((await defaultRows.boundingBox())!.height).toBe(4 * 24 + 16);
});

test('long text scrolls inside the field with the fade and a visible thumb; the caret stays in view', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  const f = field(input);
  const fieldHeight = (await f.boundingBox())!.height;
  await input.click();
  for (let i = 0; i < 8; i++) await page.keyboard.type(`Line ${i + 1}\n`);
  await expect(input).toHaveValue(/Line 8\n$/);
  expect((await f.boundingBox())!.height).toBe(fieldHeight);
  await expect(f.locator('.bland-scroll-area')).toHaveAttribute('data-overflow', '');
  await expect(f.locator('.bland-scroll-area__thumb')).toBeVisible();
  await expect(f.locator('.bland-scroll-area__viewport')).toHaveAttribute('data-fade-start', '');
  // Typed to the end, so the viewport followed the caret to the bottom.
  const atBottom = await f.locator('.bland-scroll-area__viewport').evaluate((v) => v.scrollTop + v.clientHeight >= v.scrollHeight - 1);
  expect(atBottom).toBe(true);
});

test('controlled: the value follows the parent state', async ({ page }) => {
  await page.getByTestId('controlled').fill('Hello');
  await expect(page.getByText('5 characters')).toBeVisible();
});

test('dragging the handle makes the field taller', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  const f = field(input);
  await f.scrollIntoViewIfNeeded();
  const before = (await f.boundingBox())!.height;
  const handle = (await f.locator('.bland-text-area__resizer').boundingBox())!;
  await page.mouse.move(handle.x + 8, handle.y + 8);
  await page.mouse.down();
  await page.mouse.move(handle.x + 8, handle.y + 48, { steps: 4 });
  await page.mouse.up();
  expect((await f.boundingBox())!.height).toBe(before + 40);
});

test('focus shows the 2px ring on the field box', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  await input.focus();
  const ring = await field(input).evaluate((e) => [getComputedStyle(e).outlineWidth, getComputedStyle(e).outlineOffset]);
  expect(ring).toEqual(['2px', '2px']);
});

test('disabled matches Text Input: border-subtle whatever the status, label text-subtle', async ({ page }) => {
  const color = (token: string) =>
    page.evaluate((t) => {
      const probe = document.createElement('div');
      probe.style.color = `var(${t})`;
      document.querySelector('[data-testid^="frame-"]')!.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, token);
  const danger = page.locator('.bland-text-area[data-status="danger"]:has(textarea:disabled)').first();
  expect(await danger.locator('.bland-text-area__field').evaluate((e) => getComputedStyle(e).boxShadow)).toContain(await color('--border-subtle'));
  expect(await danger.locator('.bland-text-area__label').evaluate((e) => getComputedStyle(e).color)).toBe(await color('--text-subtle'));
});
