// Behaviour of Radio and Radio Group: one choice, arrow keys, controlled value, hit areas, states, focus.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the same way the browser resolves the circle's background. */
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

test.beforeEach(async ({ page }) => {
  await openStory(page, 'radio-button', 'light');
});

test('a group is a named radiogroup and keeps one option selected', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Size' });
  const small = group.getByRole('radio', { name: 'Small' });
  const medium = group.getByRole('radio', { name: 'Medium' });
  await group.getByText('Small').click();
  await expect(small).toBeChecked();
  await group.getByText('Medium').click();
  await expect(medium).toBeChecked();
  await expect(small).not.toBeChecked();
});

test('arrow keys move the selection and skip a disabled option', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Size' });
  await group.getByText('Small').click();
  await page.keyboard.press('ArrowDown');
  await expect(group.getByRole('radio', { name: 'Medium' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Medium' })).toBeFocused();
  await page.keyboard.press('ArrowDown'); // Large is disabled: wraps to Small
  await expect(group.getByRole('radio', { name: 'Small' })).toBeChecked();
});

test('a controlled group reports the new value and follows it', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Plan' });
  await expect(group.getByRole('radio', { name: 'Free' })).toBeChecked();
  await group.getByText('Team').click();
  await expect(page.getByTestId('controlled-value')).toHaveText('team');
  await expect(group.getByRole('radio', { name: 'Team' })).toBeChecked();
  await expect(group.getByRole('radio', { name: 'Free' })).not.toBeChecked();
});

test('the hit area is control/xs (sm) or control/sm (md) around a 16 or 20 circle', async ({ page }) => {
  for (const [size, hit, box] of [['sm', 24, 16], ['md', 32, 20]] as const) {
    const input = page.locator(`.bland-radio[data-size="${size}"] .bland-radio__input`).first();
    const area = (await input.locator('xpath=..').boundingBox())!;
    expect([area.width, area.height]).toEqual([hit, hit]);
    expect((await input.boundingBox())!.width).toBe(box);
  }
  const small = page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: 'Small' });
  const area = (await small.locator('xpath=..').boundingBox())!;
  await page.mouse.click(area.x + 1, area.y + 1); // the hit area's corner, outside the circle
  await expect(small).toBeChecked();
});

test('rest, hover and checked use the field and Control/checked tokens; disabled stays put', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Size' });
  const small = group.getByRole('radio', { name: 'Small' });
  expect(await bg(small)).toBe(await tokenColor(page, '--surface-field'));
  await group.getByText('Small').hover();
  await expect.poll(() => bg(small)).toBe(await tokenColor(page, '--surface-field-hover'));
  await group.getByText('Small').click();
  await expect.poll(() => bg(small)).toBe(await tokenColor(page, '--control-checked-hover'));
  await page.mouse.move(0, 0);
  await expect.poll(() => bg(small)).toBe(await tokenColor(page, '--control-checked-rest'));

  const large = group.getByRole('radio', { name: 'Large' });
  await expect(large).toBeDisabled();
  await group.getByText('Large').click({ force: true });
  await expect(large).not.toBeChecked();
  const disabledOn = page.locator('.bland-radio__input:disabled:checked').first();
  expect(await bg(disabledOn)).toBe(await tokenColor(page, '--control-checked-disabled'));
});

test('the focus ring shows on keyboard focus only', async ({ page }) => {
  const small = page.getByRole('radiogroup', { name: 'Size' }).getByRole('radio', { name: 'Small' });
  const outline = () => small.evaluate((e) => getComputedStyle(e).outlineStyle);
  await small.click();
  expect(await outline()).toBe('none');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(small).toBeFocused();
  expect(await outline()).toBe('solid');
});

test('vertical rows touch, horizontal items sit 16 apart, and a disabled group disables every radio', async ({ page }) => {
  const rows = page.getByRole('radiogroup', { name: 'Vertical sm' }).locator('.bland-radio');
  const a = (await rows.nth(0).boundingBox())!;
  const b = (await rows.nth(1).boundingBox())!;
  expect(b.y).toBe(a.y + a.height);

  const items = page.getByRole('radiogroup', { name: 'Horizontal sm' }).locator('.bland-radio');
  const c = (await items.nth(0).boundingBox())!;
  const d = (await items.nth(1).boundingBox())!;
  expect(d.x - (c.x + c.width)).toBe(16);

  for (const r of await page.getByRole('radiogroup', { name: 'Disabled group' }).getByRole('radio').all()) {
    await expect(r).toBeDisabled();
  }
  await expect(page.getByRole('radiogroup', { name: 'Vertical md' }).locator('.bland-radio').first()).toHaveAttribute('data-size', 'md');
});
