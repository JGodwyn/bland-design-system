// Behaviour of Segmented bar: native radio group (arrow keys, name, disabled), tabs with panels, colors.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'segmented-bar', 'light');
});

test('without panels it is a radio group: arrow keys select, the value is reported', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Range' });
  const week = group.getByRole('radio', { name: 'Week' });
  await expect(week).toBeChecked();
  await week.focus();
  await page.keyboard.press('ArrowRight');
  await expect(group.getByRole('radio', { name: 'Month' })).toBeChecked();
  await expect(page.getByTestId('radios-value')).toHaveText('month');
  await group.getByRole('radio', { name: 'Day' }).click();
  await expect(page.getByTestId('radios-value')).toHaveText('day');
  const names = await group.getByRole('radio').evaluateAll((els) => new Set(els.map((e) => (e as HTMLInputElement).name)).size);
  expect(names).toBe(1);
});

test('a disabled segment cannot be chosen; icon only segments keep their label as the name', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Icons md' });
  await expect(group.getByRole('radio', { name: 'Off' })).toBeDisabled();
  await expect(group.getByRole('radio', { name: 'Info' })).toBeVisible();
});

test('with panels it is a tab list that shows the selected panel', async ({ page }) => {
  const root = page.getByTestId('tabs');
  await expect(root.getByRole('tablist', { name: 'Views' })).toBeVisible();
  await root.getByRole('tab', { name: 'Week' }).click();
  await expect(root.getByRole('tabpanel')).toHaveText('Week view');
});

test('selected segment: Segment/selected fill, the near elevation and the bold label; fills the track equally', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Three md' });
  const item = (name: string) => group.locator('.bland-segmented-bar__item', { hasText: name });
  const thumb = group.locator('.bland-segmented-bar__thumb');
  expect(await thumb.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(await tokenColor(page, '--segment-selected'));
  expect(await thumb.evaluate((e) => getComputedStyle(e).boxShadow)).not.toBe('none');
  expect(await thumb.boundingBox()).toEqual(await item('Week').boundingBox());
  expect(await item('Week').evaluate((e) => getComputedStyle(e).fontWeight)).toBe('500');
  // Segments are rad-md (8) since 2026-10-19, drawn doubled by .bland-smooth where corner-shape works.
  expect(await item('Week').evaluate((e) => getComputedStyle(e).getPropertyValue('--bland-radius').trim())).toBe('8px');
  const widths = await group.locator('.bland-segmented-bar__item').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(new Set(widths).size).toBe(1);
  expect(await group.evaluate((e) => e.getBoundingClientRect().height)).toBe(32);
});

test('the selected segment slides to a pressed one', async ({ page }) => {
  const group = page.getByRole('radiogroup', { name: 'Range' });
  const thumb = group.locator('.bland-segmented-bar__thumb');
  await group.getByRole('radio', { name: 'Day' }).click();
  await expect(thumb).toHaveAttribute('data-moving', '');
  await expect.poll(async () => (await thumb.boundingBox())!.x).toBe((await group.locator('.bland-segmented-bar__item').first().boundingBox())!.x);
});
