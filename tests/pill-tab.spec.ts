// Behaviour of Pill tab: pills that are tabs (role="tab", aria-selected, no aria-pressed), panels, colors.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'pill-tab', 'light');
});

test('pills are tabs: aria-selected, never aria-pressed; arrow keys select and show the panel', async ({ page }) => {
  const root = page.getByTestId('panels');
  const all = root.getByRole('tab', { name: 'All' });
  await expect(all).toHaveAttribute('aria-selected', 'true');
  await expect(all).not.toHaveAttribute('aria-pressed');
  await all.focus();
  await page.keyboard.press('ArrowRight');
  await expect(root.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true');
  await expect(root.getByRole('tabpanel')).toHaveText('Design panel');
  await root.getByRole('tab', { name: 'Code' }).click();
  await expect(root.getByRole('tabpanel')).toHaveText('Code panel');
});

test('the selected pill takes the Control/checked fill; the count is a brand Indicator on it', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Topics sm' });
  const all = list.getByRole('tab', { name: /All/ });
  // React Aria selects after the first render, so the fill eases in over duration/xs.
  const fill = await tokenColor(page, '--control-checked-rest');
  await expect.poll(() => all.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(fill);
  await expect(all.locator('.bland-indicator')).toHaveAttribute('data-emotion', 'brand');
  await expect(list.getByRole('tab', { name: /Code/ }).locator('.bland-indicator')).toHaveAttribute('data-emotion', 'neutral');
  await expect(list.getByRole('tab', { name: 'Info' })).toBeVisible();
});

test('the selection does not slide: there is no indicator, the pressed pill takes the fill', async ({ page }) => {
  const root = page.getByTestId('panels');
  await expect(root.locator('.bland-tabs__indicator')).toHaveCount(0);
  const code = root.getByRole('tab', { name: 'Code' });
  await code.click();
  await page.mouse.move(1, 1);
  const fill = await tokenColor(page, '--control-checked-rest');
  await expect.poll(() => code.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(fill);
});
