// Behaviour of Section tab: React Aria tabs (arrow keys, Home/End, disabled skipped), panels, colors, sideways scroll.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory, clickToFocus } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'section-tab', 'light');
});

test('arrow keys select the next tab and show its panel; the panel is labelled by its tab', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Controlled' });
  const activity = list.getByRole('tab', { name: 'Activity' });
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  await activity.focus();
  await page.keyboard.press('ArrowRight');
  const members = list.getByRole('tab', { name: 'Members' });
  await expect(members).toBeFocused();
  await expect(members).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByTestId('controlled-value')).toHaveText('members');
  const panel = page.getByTestId('controlled').getByRole('tabpanel');
  await expect(panel).toHaveText('Members panel');
  await expect(panel).toHaveAccessibleName('Members');
  await expect(members).toHaveAttribute('aria-controls', (await panel.getAttribute('id'))!);
  await page.keyboard.press('Home');
  await expect(list.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(list.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
});

test('only the selected tab is a Tab stop, and disabled tabs are skipped', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Sections sm' });
  await expect(list.getByRole('tab', { name: 'Overview' })).toHaveAttribute('tabindex', '0');
  await expect(list.getByRole('tab', { name: 'Activity' })).toHaveAttribute('tabindex', '-1');
  const members = list.getByRole('tab', { name: /Members/ });
  await members.click();
  await expect(members).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  // Archived is disabled, so the arrow wraps to the first tab.
  await expect(list.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
  const archived = list.getByRole('tab', { name: /Archived/ });
  await expect(archived).toHaveAttribute('aria-disabled', 'true');
  await archived.click({ force: true });
  await expect(archived).toHaveAttribute('aria-selected', 'false');
});

test('a tab without a panel points at nothing', async ({ page }) => {
  const tab = page.getByRole('tablist', { name: 'Sections sm' }).getByRole('tab', { name: 'Overview' });
  await expect(tab).not.toHaveAttribute('aria-controls');
});

test('the brand underline sits on the divider under the selected tab; hover fills surface-200', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Sections md' });
  const row = page.locator('.bland-section-tabs__row', { has: list });
  const selected = list.getByRole('tab', { name: 'Overview' });
  const underline = list.locator('.bland-section-tabs__underline');
  expect(await underline.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(await tokenColor(page, '--border-brand'));
  const [tabBox, lineBox, rowBox] = await Promise.all([selected.boundingBox(), underline.boundingBox(), row.boundingBox()]);
  // Figma: the row is as tall as its tabs, and the 2px underline covers the 1px divider (no gap).
  expect(rowBox!.height).toBe(48);
  expect(tabBox!.height).toBe(48);
  expect(lineBox!.height).toBe(2);
  expect([lineBox!.x, lineBox!.width]).toEqual([tabBox!.x, tabBox!.width]);
  expect(lineBox!.y + lineBox!.height).toBe(rowBox!.y + rowBox!.height);
  const rest = list.getByRole('tab', { name: 'Activity' });
  const inner = rest.locator('.bland-section-tabs__inner');
  await page.mouse.move(1, 1);
  await rest.hover();
  await expect.poll(() => inner.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(await tokenColor(page, '--surface-200'));
});

test('the underline slides to a pressed tab, and jumps on arrow keys', async ({ page }) => {
  const list = page.getByRole('tablist', { name: 'Controlled' });
  const underline = list.locator('.bland-section-tabs__underline');
  await clickToFocus(list.getByRole('tab', { name: 'Settings' }));
  await expect(underline).toHaveAttribute('data-moving', '');
  expect(await underline.evaluate((e) => getComputedStyle(e).transitionProperty)).toContain('translate');
  await page.keyboard.press('ArrowLeft');
  await expect(underline).not.toHaveAttribute('data-moving');
  const [tab, line] = await Promise.all([list.getByRole('tab', { name: 'Members' }).boundingBox(), underline.boundingBox()]);
  expect(line!.x).toBe(tab!.x);
});

test('a row too long for its container scrolls sideways with the fade alone; wheel and focus scroll it', async ({ page }) => {
  const row = page.getByTestId('overflow');
  const viewport = row.locator('.bland-scroll-area__viewport');
  expect(await viewport.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  await expect(row.locator('.bland-scroll-area')).toHaveAttribute('data-overflow', '');
  await expect(row.locator('.bland-scroll-area__track')).toHaveCount(0);
  await expect(viewport).toHaveAttribute('data-fade-end', '');
  await viewport.hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(() => viewport.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await viewport.evaluate((e) => (e.scrollLeft = 0));
  await row.getByRole('tab', { name: 'Overview' }).focus();
  await page.keyboard.press('End');
  await expect.poll(() => viewport.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await expect(row.getByRole('tab', { name: 'Logs' })).toBeInViewport({ ratio: 1 });
});
