// Behaviour of Popover: a non-modal dialog beside its trigger, built on the shared floating panel (overlay/
// FloatingPanel.tsx). Opening and closing, focus, names, placement, the page staying usable, sizes, motion.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const popover = (page: Page, id: string) => page.getByTestId(`${id}-popover`);
const trigger = (page: Page, id: string) => page.getByTestId(`${id}-trigger`);

test.beforeEach(async ({ page }) => {
  await openStory(page, 'popover', 'light');
});

test('a press opens it under its trigger with motion, focused, named and described; not modal', async ({ page }) => {
  const t = trigger(page, 'filters');
  await expect(t).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(t).toHaveAttribute('aria-expanded', 'false');
  await t.click();
  const p = popover(page, 'filters');
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await expect(p).toBeFocused();
  await expect(p).not.toHaveAttribute('aria-modal');
  await expect(p).toHaveAccessibleDescription(/Show only conversations/);
  await expect(t).toHaveAttribute('aria-expanded', 'true');
  await expect(t).toHaveAttribute('aria-controls', (await p.getAttribute('id'))!);
  await expect(p.locator('xpath=..')).not.toHaveAttribute('data-instant');
});

/** Opens from the keyboard (no motion, so the box is measured at full size) and returns both boxes and the side. */
async function openAtOnce(page: Page, id: string) {
  await trigger(page, id).focus();
  await page.keyboard.press('Enter');
  const p = popover(page, id);
  await expect(p).toBeVisible();
  const side = await p.locator('xpath=..').getAttribute('data-side');
  const [pr, tr] = await Promise.all([p.boundingBox(), trigger(page, id).boundingBox()]);
  return { p: pr!, t: tr!, side };
}

test('md is 320 wide, space-xs from its trigger, lined up with its start', async ({ page }) => {
  const { p, t, side } = await openAtOnce(page, 'filters');
  expect(Math.round(p.width)).toBe(320);
  const gap = side === 'top' ? t.y - (p.y + p.height) : p.y - (t.y + t.height);
  expect(Math.round(gap)).toBe(4); // space-xs, on whichever side it fits
  expect(Math.round(p.x)).toBe(Math.round(t.x)); // bottom-start (or top-start once flipped)
});

test('Escape closes it and focus goes back to the trigger; the keyboard opens it at once', async ({ page }) => {
  const t = trigger(page, 'filters');
  await t.focus();
  await page.keyboard.press('Enter');
  const p = popover(page, 'filters');
  await expect(p).toBeVisible();
  await expect(p.locator('xpath=..')).toHaveAttribute('data-instant', 'true');
  await page.keyboard.press('Escape');
  await expect(p).toBeHidden();
  await expect(t).toBeFocused();
  await expect(t).toHaveAttribute('aria-expanded', 'false');
});

test('a press outside closes it; the page behind is never inert', async ({ page }) => {
  await trigger(page, 'filters').click();
  await expect(popover(page, 'filters')).toBeVisible();
  await expect(page.locator('[inert], [aria-hidden="true"]:has([data-testid="share-trigger"])')).toHaveCount(0);
  // The press that closes it is taken by the popover (as Menu's), so the next one reaches the page.
  await trigger(page, 'share').click();
  await expect(popover(page, 'filters')).toBeHidden();
  await trigger(page, 'share').click();
  await expect(popover(page, 'share')).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(popover(page, 'share')).toBeHidden();
});

test('a second press on the trigger closes it', async ({ page }) => {
  const t = trigger(page, 'filters');
  await t.click();
  await expect(popover(page, 'filters')).toBeVisible();
  await t.click();
  await expect(popover(page, 'filters')).toBeHidden();
});

test('Tab moves through its controls; the close button and an action close it', async ({ page }) => {
  await trigger(page, 'share').click();
  const share = popover(page, 'share');
  await page.keyboard.press('Tab');
  await expect(share.getByRole('button', { name: 'Close' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(share.getByRole('textbox', { name: 'Link' })).toBeFocused();
  await share.getByRole('button', { name: 'Close' }).click();
  await expect(share).toBeHidden();
  await expect(trigger(page, 'share')).toBeFocused();

  await trigger(page, 'filters').click();
  await popover(page, 'filters').getByRole('button', { name: 'Apply' }).click();
  await expect(popover(page, 'filters')).toBeHidden();
});

test('focus leaving it closes it', async ({ page }) => {
  await trigger(page, 'profile').click();
  const p = popover(page, 'profile');
  await expect(p).toBeFocused();
  await page.getByTestId('filters-trigger').focus();
  await expect(p).toBeHidden();
});

test('sm is 256 wide, named by aria-label without a title, and bottom-end lines up its end', async ({ page }) => {
  const { p, t } = await openAtOnce(page, 'profile');
  await expect(page.getByRole('dialog', { name: 'Account' })).toBeVisible();
  expect(Math.round(p.width)).toBe(256);
  expect(Math.round(p.x + p.width)).toBe(Math.round(t.x + t.width));
});

test('controlled: it follows open and onOpenChange', async ({ page }) => {
  const t = trigger(page, 'controlled');
  await t.click();
  const p = popover(page, 'controlled');
  await expect(p).toBeVisible();
  await p.getByRole('button', { name: 'Apply' }).click();
  await expect(p).toBeHidden();
});

test('open, light and dark', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'screenshots are Chromium baselines');
  for (const theme of ['light', 'dark'] as const) {
    await openStory(page, 'popover', theme);
    await trigger(page, 'filters').focus();
    await page.keyboard.press('Enter');
    const p = popover(page, 'filters');
    await expect(p).toBeVisible();
    await expect(p).toHaveScreenshot(`popover-open-${theme}.png`);
    await page.keyboard.press('Escape');
  }
});
