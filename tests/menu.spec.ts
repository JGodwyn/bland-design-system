// Behaviour of Menu: opening from a press or the keyboard, arrow keys, typeahead, actions, Escape, selection,
// flipping and scrolling, motion, and screenshots of open menus.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const menu = (page: Page) => page.getByRole('menu');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'menu', 'light');
});

test('a press opens it with motion; choosing an item runs it, closes and returns focus', async ({ page }) => {
  const trigger = page.getByTestId('actions-trigger');
  await expect(trigger).toHaveAttribute('aria-haspopup', 'true');
  await trigger.click();
  await expect(menu(page)).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.bland-popover:popover-open')).not.toHaveAttribute('data-instant');
  await page.getByRole('menuitem', { name: 'Share' }).click();
  await expect(page.getByTestId('last-action')).toHaveText('share');
  await expect(menu(page)).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('the keyboard opens it at once, arrows skip disabled items, typeahead jumps, Escape returns focus', async ({ page }) => {
  const trigger = page.getByTestId('actions-trigger');
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  await expect(menu(page)).toBeVisible();
  await expect(page.locator('.bland-popover:popover-open')).toHaveAttribute('data-instant', 'true');
  const item = (name: string) => page.getByRole('menuitem', { name });
  await expect(item('New file')).toBeFocused();
  await expect(item('New file')).toHaveAttribute('data-focus-visible', 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(item('Move to')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(item('Delete')).toBeFocused(); // Archive is disabled
  await expect(item('Archive')).toHaveAttribute('aria-disabled', 'true');
  await page.keyboard.type('sh');
  await expect(item('Share')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByTestId('last-action')).toHaveText('none');
});

test('a press outside closes it; the trigger toggles it', async ({ page }) => {
  const trigger = page.getByTestId('actions-trigger');
  await trigger.click();
  await expect(menu(page)).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(menu(page)).toBeHidden();
  await trigger.click();
  await expect(menu(page)).toBeVisible();
  await trigger.click();
  await expect(menu(page)).toBeHidden();
});

test('single selection marks the chosen item with a Check', async ({ page }) => {
  await page.getByTestId('view-trigger').click();
  const grid = page.getByRole('menuitemradio', { name: 'Grid' });
  await expect(page.getByRole('menuitemradio', { name: 'List' })).toHaveAttribute('aria-checked', 'true');
  await grid.click();
  await expect(page.getByTestId('view-value')).toHaveText('grid');
  await page.getByTestId('view-trigger').click();
  await expect(grid).toHaveAttribute('aria-checked', 'true');
  await expect(grid.locator('.bland-menu__check')).toBeVisible();
});

test('it sits space-xs under the trigger, menu/width wide, and flips above near the bottom of the screen', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  // Room to scroll the trigger to the top or the bottom of the screen.
  await page.evaluate(() => {
    document.body.style.paddingBlock = '800px';
  });
  const trigger = page.getByTestId('more-trigger');
  await trigger.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await trigger.click();
  const panel = page.locator('.bland-popover:popover-open .bland-menu');
  await expect(panel).toBeVisible();
  await expect.poll(() => panel.evaluate((e) => getComputedStyle(e.parentElement!).opacity)).toBe('1');
  const t = (await trigger.boundingBox())!;
  const m = (await panel.boundingBox())!;
  expect(m.y - (t.y + t.height)).toBeCloseTo(4, 0);
  expect(m.width).toBeCloseTo(256, 0);
  // bottom-end would leave the screen this close to the left edge, so flip() turns it to bottom-start.
  expect(m.x).toBeCloseTo(t.x, 0);
  await page.keyboard.press('Escape');
  // Near the bottom edge it flips above instead of squeezing.
  await expect(page.locator('.bland-popover:popover-open')).toHaveCount(0);
  await trigger.evaluate((el) => el.scrollIntoView({ block: 'end' }));
  await trigger.click();
  await expect(page.locator('.bland-popover:popover-open')).toHaveAttribute('data-side', 'top');
});

test('a long menu is capped to the screen and scrolls with the fade and thumb; the focused item stays in view', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 500 });
  const trigger = page.getByTestId('long-trigger');
  await trigger.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await trigger.focus();
  await page.keyboard.press('ArrowDown');
  const popover = page.locator('.bland-popover:popover-open');
  const box = (await popover.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(8);
  expect(box.y + box.height).toBeLessThanOrEqual(500 - 8 + 1);
  await expect(popover.locator('.bland-scroll-area')).toHaveAttribute('data-overflow', '');
  await page.keyboard.press('End');
  const last = page.getByRole('menuitem', { name: 'Menu item 24' });
  await expect(last).toBeFocused();
  await expect(last).toBeInViewport();
  await expect(popover.locator('.bland-scroll-fade')).toHaveAttribute('data-fade-start', '');
});

test('a disabled trigger never opens it', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Disabled' });
  await expect(trigger).toBeDisabled();
  await trigger.click({ force: true });
  await expect(menu(page)).toBeHidden();
});

test('reduced motion drops the scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('actions-trigger').click();
  await expect(menu(page)).toBeVisible();
  const transform = await page.locator('.bland-popover:popover-open').evaluate((e) => getComputedStyle(e).transform);
  expect(transform).toBe('none');
});

for (const theme of ['light', 'dark'] as const) {
  test(`an open menu looks the same (${theme})`, async ({ page }) => {
    await openStory(page, 'menu', theme);
    const trigger = page.getByTestId('actions-trigger');
    await trigger.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const popover = page.locator('.bland-popover:popover-open');
    await expect(popover).toBeVisible();
    const t = (await trigger.boundingBox())!;
    const b = (await popover.boundingBox())!;
    const pad = 16;
    const x = Math.min(t.x, b.x) - pad;
    const y = Math.min(t.y, b.y) - pad;
    const clip = { x, y, width: Math.max(t.x + t.width, b.x + b.width) + pad - x, height: Math.max(t.y + t.height, b.y + b.height) + pad - y };
    await expect(page).toHaveScreenshot(`menu-open-${theme}.png`, { clip });
  });
}
