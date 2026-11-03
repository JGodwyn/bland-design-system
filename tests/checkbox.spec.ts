// Behaviour of Checkbox and Checkbox Group: native toggling, mixed, labels and hit areas, states, focus, groups.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the same way the browser resolves the box's background. */
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
const indeterminate = (el: Locator) => el.evaluate((e) => (e as HTMLInputElement).indeterminate);
const label = (input: Locator) => input.locator('xpath=ancestor::label[1]');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'checkbox', 'light');
});

test('clicking the label or pressing Space toggles the native checkbox', async ({ page }) => {
  const box = page.getByTestId('uncontrolled');
  await expect(box).not.toBeChecked();
  await page.getByText('Uncontrolled', { exact: true }).click();
  await expect(box).toBeChecked();
  await expect(box).toBeFocused();
  await page.keyboard.press('Space');
  await expect(box).not.toBeChecked();
});

test('the whole hit area toggles, and it is control/xs (sm) or control/sm (md) around the box', async ({ page }) => {
  const box = page.getByTestId('uncontrolled');
  const hit = (await box.locator('xpath=..').boundingBox())!;
  expect([hit.width, hit.height]).toEqual([24, 24]);
  expect(((await box.boundingBox())!).width).toBe(16);
  await page.mouse.click(hit.x + 1, hit.y + 1); // the hit area's corner, outside the 16px box
  await expect(box).toBeChecked();

  const md = page.locator('.bland-checkbox[data-size="md"] .bland-checkbox__input').first();
  const mdHit = (await md.locator('xpath=..').boundingBox())!;
  expect([mdHit.width, mdHit.height]).toEqual([32, 32]);
  expect(((await md.boundingBox())!).width).toBe(20);
});

test('checked="mixed" sets the native indeterminate state and shows the minus', async ({ page }) => {
  const mixed = page.locator('.bland-checkbox__input:indeterminate').first();
  await expect(mixed).toBeVisible();
  await expect(mixed.locator('xpath=..').locator('.bland-checkbox__mixed')).toBeVisible();
  await expect(mixed.locator('xpath=..').locator('.bland-checkbox__check')).toBeHidden();
});

test('an uncontrolled mixed checkbox becomes checked on click', async ({ page }) => {
  const box = page.getByTestId('default-mixed');
  expect(await indeterminate(box)).toBe(true);
  await box.click();
  expect(await indeterminate(box)).toBe(false);
  await expect(box).toBeChecked();
});

test('a parent is mixed while some children are checked, and selects or clears them all', async ({ page }) => {
  const all = page.getByTestId('all');
  expect(await indeterminate(all)).toBe(true);

  await all.click();
  expect(await indeterminate(all)).toBe(false);
  await expect(all).toBeChecked();
  for (const t of ['Cheese', 'Olives', 'Basil']) await expect(page.getByTestId(`topping-${t}`)).toBeChecked();

  await all.click();
  await expect(all).not.toBeChecked();
  for (const t of ['Cheese', 'Olives', 'Basil']) await expect(page.getByTestId(`topping-${t}`)).not.toBeChecked();

  await page.getByTestId('topping-Olives').click();
  expect(await indeterminate(all)).toBe(true);
});

test('a disabled checkbox does not toggle and greys its label', async ({ page }) => {
  const box = page.getByTestId('disabled');
  await expect(box).toBeDisabled();
  await label(box).click({ force: true });
  await expect(box).not.toBeChecked();
  expect(await label(box).evaluate((e) => getComputedStyle(e).color)).toBe(await tokenColor(page, '--text-minimal'));
});

test('rest, hover and checked use the field and Control/checked tokens', async ({ page }) => {
  const box = page.getByTestId('uncontrolled');
  expect(await bg(box)).toBe(await tokenColor(page, '--surface-field'));
  await page.getByText('Uncontrolled', { exact: true }).hover();
  await expect.poll(() => bg(box)).toBe(await tokenColor(page, '--surface-field-hover'));
  await page.getByText('Uncontrolled', { exact: true }).click();
  await expect.poll(() => bg(box)).toBe(await tokenColor(page, '--control-checked-hover'));
  await page.mouse.move(0, 0);
  await expect.poll(() => bg(box)).toBe(await tokenColor(page, '--control-checked-rest'));

  const disabledOn = page.locator('.bland-checkbox__input:disabled:checked').first();
  expect(await bg(disabledOn)).toBe(await tokenColor(page, '--control-checked-disabled'));
});

test('the focus ring shows on keyboard focus only, on the box', async ({ page }) => {
  const box = page.getByTestId('uncontrolled');
  const outline = () => box.evaluate((e) => getComputedStyle(e).outlineStyle);
  await box.click();
  expect(await outline()).toBe('none');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(box).toBeFocused();
  expect(await outline()).toBe('solid');
});

test('a group is a named fieldset; vertical rows touch, horizontal items sit 16 apart', async ({ page }) => {
  const vertical = page.getByRole('group', { name: 'Vertical sm' });
  await expect(vertical).toBeVisible();
  const rows = vertical.locator('.bland-checkbox');
  const a = (await rows.nth(0).boundingBox())!;
  const b = (await rows.nth(1).boundingBox())!;
  expect(b.y).toBe(a.y + a.height);

  const horizontal = page.getByRole('group', { name: 'Horizontal sm' }).locator('.bland-checkbox');
  const c = (await horizontal.nth(0).boundingBox())!;
  const d = (await horizontal.nth(1).boundingBox())!;
  expect(d.x - (c.x + c.width)).toBe(16);

  for (const box of await page.getByRole('group', { name: 'Disabled group' }).getByRole('checkbox').all()) {
    await expect(box).toBeDisabled();
  }
});

test('a group passes its size to its checkboxes', async ({ page }) => {
  await expect(page.getByRole('group', { name: 'Vertical md' }).locator('.bland-checkbox').first()).toHaveAttribute('data-size', 'md');
});
