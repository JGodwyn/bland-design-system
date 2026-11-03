// Behaviour of Dropdown: basic (select), multi-select (chips), filterable (combobox), forms, placement and
// screenshots of open menus.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const listbox = (page: Page) => page.getByRole('listbox');
const field = (page: Page, id: string) => page.getByTestId(id).locator('.bland-dropdown__field');
const button = (page: Page, id: string) => page.getByTestId(id).locator('.bland-dropdown__button');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'dropdown', 'light');
});

test('basic: a press opens the options under the field, as wide as it; choosing one sets the value', async ({ page }) => {
  const trigger = button(page, 'basic');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAccessibleName('Banana Basic');
  await trigger.click();
  await expect(listbox(page)).toBeVisible();
  const panel = page.locator('.bland-popover:popover-open .bland-menu');
  await expect.poll(() => panel.evaluate((e) => getComputedStyle(e.parentElement!).opacity)).toBe('1');
  const f = (await field(page, 'basic').boundingBox())!;
  const m = (await panel.boundingBox())!;
  expect(m.y - (f.y + f.height)).toBeCloseTo(4, 0);
  expect(m.width).toBeCloseTo(f.width, 0);
  // Rows are Menu md (40) whatever the field size.
  expect((await page.getByRole('option', { name: 'Apple' }).boundingBox())!.height).toBeCloseTo(40, 0);
  await expect(page.getByRole('option', { name: 'Banana' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: 'Banana' }).locator('.bland-menu__check')).toBeVisible();
  await page.getByRole('option', { name: 'Cherry' }).click();
  await expect(listbox(page)).toBeHidden();
  await expect(page.getByTestId('basic-value')).toHaveText('cherry');
  await expect(trigger).toBeFocused();
});

test('basic: the keyboard opens it at once on the chosen option; disabled options are skipped; Escape closes', async ({ page }) => {
  const trigger = button(page, 'basic');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(listbox(page)).toBeVisible();
  await expect(page.locator('.bland-popover:popover-open')).toHaveAttribute('data-instant', 'true');
  await expect(page.getByRole('option', { name: 'Banana' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Cherry' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('option', { name: 'Elderberry' })).toBeFocused(); // Durian is disabled
  await expect(page.getByRole('option', { name: 'Elderberry' })).toHaveAttribute('data-focus-visible', 'true');
  await page.keyboard.press('Escape');
  await expect(listbox(page)).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('basic-value')).toHaveText('banana');
  await page.keyboard.press('Enter');
  await expect(listbox(page)).toBeVisible();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('basic-value')).toHaveText('apple');
});

test('multi-select: options toggle with checkboxes and stay open; chips show and remove the values', async ({ page }) => {
  const trigger = button(page, 'multi');
  await expect(trigger).toHaveAccessibleName('Apple, Cherry Multi-select');
  await trigger.click();
  await page.getByRole('option', { name: 'Fig' }).click();
  await expect(listbox(page)).toBeVisible();
  await expect(page.getByRole('option', { name: 'Fig' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('option', { name: 'Fig' }).locator('.bland-menu__checkbox[data-checked]')).toBeVisible();
  await expect(page.getByTestId('multi-value')).toHaveText('apple, cherry, fig');
  await page.keyboard.press('Escape');
  await expect(listbox(page)).toBeHidden();
  const chips = page.getByTestId('multi').locator('.bland-chip');
  await expect(chips).toHaveText(['Apple', 'Cherry', 'Fig']);
  await page.getByTestId('multi').getByRole('button', { name: 'Remove Cherry' }).click();
  await expect(page.getByTestId('multi-value')).toHaveText('apple, fig');
  await expect(chips).toHaveText(['Apple', 'Fig']);
});

test('filterable: typing narrows the options, arrows and Enter choose, Clear empties it', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Country' });
  await input.fill('');
  await input.pressSequentially('no');
  await expect(listbox(page)).toBeVisible();
  await expect(page.getByRole('option')).toHaveText(['Norway']);
  await input.press('Backspace');
  await input.pressSequentially('ig');
  await expect(page.getByRole('option')).toHaveText(['Nigeria']);
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /.+/);
  await expect(page.getByRole('option', { name: 'Nigeria' })).toHaveAttribute('data-focus-visible', 'true');
  await input.press('Enter');
  await expect(listbox(page)).toBeHidden();
  await expect(input).toHaveValue('Nigeria');
  await expect(page.getByTestId('filterable-value')).toHaveText('nigeria');
  await page.getByTestId('filterable').getByRole('button', { name: 'Clear' }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(page.getByTestId('filterable-value')).toHaveText('none');
});

test('a disabled dropdown never opens', async ({ page }) => {
  const disabled = page.locator('.bland-dropdown[data-disabled][data-type="basic"]').first().locator('button');
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  await expect(listbox(page)).toBeHidden();
});

test('basic and multi-select post their values through a hidden select', async ({ page }) => {
  const values = await page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="basic"] select, [data-testid="multi"] select')].map((s) =>
      [...(s as HTMLSelectElement).selectedOptions].map((o) => o.value).join(','),
    ),
  );
  expect(values).toEqual(['banana', 'apple,cherry']);
});

for (const theme of ['light', 'dark'] as const) {
  test(`open dropdowns look the same (${theme})`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'screenshot baselines are Chromium (playwright.config.ts)');
    await openStory(page, 'dropdown', theme);
    for (const [id, open] of [
      ['basic', (p: Page) => button(p, 'basic').focus().then(() => p.keyboard.press('ArrowDown'))],
      ['multi', (p: Page) => button(p, 'multi').focus().then(() => p.keyboard.press('ArrowDown'))],
      ['filterable', (p: Page) => p.getByRole('combobox', { name: 'Country' }).pressSequentially('a')],
    ] as const) {
      await page.getByTestId(id).evaluate((el) => el.scrollIntoView({ block: 'start' }));
      await open(page);
      const popover = page.locator('.bland-popover:popover-open');
      await expect(popover).toBeVisible();
      const f = (await page.getByTestId(id).boundingBox())!;
      const b = (await popover.boundingBox())!;
      const pad = 16;
      const x = Math.min(f.x, b.x) - pad;
      const y = Math.min(f.y, b.y) - pad;
      const clip = { x, y, width: Math.max(f.x + f.width, b.x + b.width) + pad - x, height: Math.max(f.y + f.height, b.y + b.height) + pad - y };
      await expect(page).toHaveScreenshot(`dropdown-open-${id}-${theme}.png`, { clip });
      await page.keyboard.press('Escape');
      await expect(popover).toHaveCount(0);
    }
  });
}
