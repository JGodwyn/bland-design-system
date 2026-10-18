// Behaviour of Text Input: label and description wiring, status, controlled and uncontrolled values, sizes, focus.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the way the browser resolves the field's background. */
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

const field = (input: Locator) => input.locator('xpath=ancestor::div[contains(@class,"bland-text-input__field")][1]');
const root = (input: Locator) => input.locator('xpath=ancestor::div[contains(concat(" ", @class, " "), " bland-text-input ")][1]');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'text-input', 'light');
});

test('the label names the input and the helper text describes it', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  await expect(input).toHaveAccessibleName('Uncontrolled');
  await expect(input).toHaveAccessibleDescription('Read with the input');
  await page.getByText('Uncontrolled', { exact: true }).click();
  await expect(input).toBeFocused();
});

test('danger sets aria-invalid; other statuses do not', async ({ page }) => {
  await expect(page.getByTestId('invalid')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByTestId('invalid')).toHaveAccessibleDescription('Required');
  await expect(page.getByTestId('uncontrolled')).not.toHaveAttribute('aria-invalid');
});

test('uncontrolled: typing fills the field and the add-on label turns bold', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  const addon = root(input).locator('.bland-text-input__addon-content');
  const color = () => addon.evaluate((e) => getComputedStyle(e).color);
  expect(await color()).toBe(await tokenColor(page, '--text-subtle'));
  await input.fill('ada');
  await expect(input).toHaveValue('ada');
  await expect(root(input)).toHaveAttribute('data-filled', 'true');
  await expect.poll(color).toBe(await tokenColor(page, '--text-bold'));
});

test('controlled: the value follows the parent state', async ({ page }) => {
  const input = page.getByTestId('controlled');
  await input.fill('Grace');
  await expect(page.getByTestId('controlled-value')).toHaveText('Grace');
  await expect(input).toHaveValue('Grace');
});

test('a click anywhere in the field, add-on included, focuses the input', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  await field(input).scrollIntoViewIfNeeded();
  const box = (await field(input).boundingBox())!;
  await page.mouse.click(box.x + 4, box.y + box.height / 2); // the leading add-on
  await expect(input).toBeFocused();
});

test('field heights follow input/sm, md and lg', async ({ page }) => {
  for (const [size, height] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
    const f = page.locator(`.bland-text-input[data-size="${size}"] .bland-text-input__field`).first();
    expect((await f.boundingBox())!.height).toBe(height);
  }
});

test('focus shows the 2px ring on the field box, offset 2px', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  await input.focus();
  const ring = await field(input).evaluate((e) => {
    const s = getComputedStyle(e);
    return [s.outlineStyle, s.outlineWidth, s.outlineOffset];
  });
  expect(ring).toEqual(['solid', '2px', '2px']);
});

test('hover and disabled use the Text Input fills and the subtle border', async ({ page }) => {
  const input = page.getByTestId('uncontrolled');
  const f = field(input);
  const bg = () => f.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(await bg()).toBe(await tokenColor(page, '--text-input-surface-rest'));
  await f.hover();
  // The fill eases over duration/xs.
  await expect.poll(bg).toBe(await tokenColor(page, '--text-input-surface-hover'));

  const disabled = page.locator('.bland-text-input__input:disabled').first();
  await expect(disabled).toBeDisabled();
  const shadow = await field(disabled).evaluate((e) => getComputedStyle(e).boxShadow);
  expect(shadow).toContain(await tokenColor(page, '--border-subtle'));
});
