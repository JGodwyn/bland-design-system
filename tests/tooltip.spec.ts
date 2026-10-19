// Behaviour of Tooltip: hover delay, keyboard focus, Escape, aria-describedby, one at a time, motion, pointer.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const tooltipFor = (page: Page, text: string) => page.getByRole('tooltip', { name: text, exact: true });

/**
 * Hover like a person: React Aria only counts a hover once the pointer has moved on the page (its modality
 * becomes "pointer"), and Playwright's hover() jumps onto the element in one move.
 */
async function hover(page: Page, testId: string) {
  await page.mouse.move(1, 1);
  await page.getByTestId(testId).hover();
}

test.beforeEach(async ({ page }) => {
  await openStory(page, 'tooltip', 'light');
});

test('hover opens it after the delay and describes the trigger', async ({ page }) => {
  const trigger = page.getByTestId('first');
  const tooltip = tooltipFor(page, 'First hint');
  const delay = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-tooltip-delay')));
  expect(delay).toBe(500);
  await hover(page, 'first');
  await page.waitForTimeout(delay / 2);
  await expect(tooltip).toBeHidden();
  await expect(tooltip).toBeVisible({ timeout: delay * 2 });
  const id = await tooltip.getAttribute('id');
  await expect(trigger).toHaveAttribute('aria-describedby', id!);
  // Opened cold by hover: it animates in.
  await expect(tooltip).not.toHaveAttribute('data-instant');
  await expect.poll(() => tooltip.evaluate((e) => getComputedStyle(e).opacity)).toBe('1');
});

test('keyboard focus opens it at once without motion, and focus stays on the trigger', async ({ page }) => {
  const trigger = page.getByTestId('first');
  await page.getByTestId('second').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(trigger).toBeFocused();
  const tooltip = tooltipFor(page, 'First hint');
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveAttribute('data-instant', 'true');
  await expect(trigger).toBeFocused();
  expect(await tooltip.evaluate((e) => e.contains(document.activeElement))).toBe(false);
});

test('Escape closes it', async ({ page }) => {
  await page.getByTestId('second').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const tooltip = tooltipFor(page, 'Second hint');
  await expect(tooltip).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(tooltip).toBeHidden();
  await expect(page.getByTestId('second')).not.toHaveAttribute('aria-describedby');
});

test('once one is open, the next opens without the delay or the motion', async ({ page }) => {
  await hover(page, 'first');
  await expect(tooltipFor(page, 'First hint')).toBeVisible({ timeout: 3000 });
  await page.getByTestId('second').hover();
  const second = tooltipFor(page, 'Second hint');
  await expect(second).toBeVisible({ timeout: 300 });
  await expect(second).toHaveAttribute('data-instant', 'true');
  // Only one tooltip at a time.
  await expect(tooltipFor(page, 'First hint')).toBeHidden();
});

test('trigger="focus" ignores hover; disabled never opens', async ({ page }) => {
  await hover(page, 'focus-only');
  await page.getByTestId('disabled-tooltip').hover();
  await page.getByTestId('focus-only').hover();
  await page.waitForTimeout(2000);
  await expect(tooltipFor(page, 'Focus only')).toBeHidden();

  await page.getByTestId('second').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('focus-only')).toBeFocused();
  await expect(tooltipFor(page, 'Focus only')).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByTestId('disabled-tooltip')).toBeFocused();
  await expect(tooltipFor(page, 'Never shown')).toBeHidden();
});

test('variants stay closed until their trigger is hovered or focused', async ({ page }) => {
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('it stays open while the pointer moves onto it', async ({ page }) => {
  await hover(page, 'first');
  const tooltip = tooltipFor(page, 'First hint');
  await expect(tooltip).toBeVisible({ timeout: 3000 });
  await tooltip.hover();
  await page.waitForTimeout(500);
  await expect(tooltip).toBeVisible();
});

test('the pointer aims at the trigger, tooltip/offset away, and the tooltip keeps its placement', async ({ page }) => {
  const gapToken = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tooltip-offset')));
  expect(gapToken).toBe(4);
  for (const placement of ['top-start', 'bottom', 'left-end', 'right']) {
    const trigger = page.getByRole('button', { name: placement, exact: true });
    await trigger.focus();
    const tooltip = tooltipFor(page, placement);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute('data-placement', placement);
    const t = (await trigger.boundingBox())!;
    const p = (await tooltip.locator('.bland-tooltip__pointer').boundingBox())!;
    if (placement.startsWith('top') || placement.startsWith('bottom')) {
      expect(Math.abs(p.x + p.width / 2 - (t.x + t.width / 2))).toBeLessThan(1);
    } else {
      expect(Math.abs(p.y + p.height / 2 - (t.y + t.height / 2))).toBeLessThan(1);
    }
    // The tip sits tooltip/offset from the trigger edge.
    const gap = placement.startsWith('top') ? t.y - (p.y + p.height) : placement.startsWith('bottom') ? p.y - (t.y + t.height) : placement.startsWith('left') ? t.x - (p.x + p.width) : p.x - (t.x + t.width);
    expect(Math.abs(gap - gapToken)).toBeLessThan(1);
  }
});

test('a left or right tooltip leaves with its trigger instead of sticking to the screen edge', async ({ page }) => {
  await page.evaluate(() => (document.body.style.paddingBottom = '2000px'));
  const trigger = page.getByRole('button', { name: 'right', exact: true });
  await trigger.focus();
  await expect(tooltipFor(page, 'right')).toBeVisible();
  // Hidden tooltips leave the accessibility tree, so follow it by id from here.
  const tooltip = page.locator(`[id="${await tooltipFor(page, 'right').getAttribute('id')}"]`);
  // Scroll the trigger above the viewport: the tooltip must not stay pinned at the top.
  const box = (await trigger.boundingBox())!;
  await page.evaluate((y) => window.scrollBy(0, y), box.y + box.height + 200);
  await expect(tooltip).toHaveCSS('visibility', 'hidden');
  const t = (await trigger.boundingBox())!;
  const tip = (await tooltip.boundingBox())!;
  // limitShift: it may slide along the trigger, never off it (before the fix it stayed pinned at the viewport top).
  expect(tip.y).toBeLessThanOrEqual(t.y + t.height);
  expect(tip.y + tip.height).toBeGreaterThanOrEqual(t.y);
});

for (const theme of ['light', 'dark'] as const) {
  test(`open tooltips look the same (${theme})`, async ({ page }) => {
    await openStory(page, 'tooltip', theme);
    for (const name of ['top-start', 'left', 'bottom-end', 'Copy']) {
      const trigger = page.getByRole('button', { name, exact: true });
      await trigger.focus();
      const tooltip = page.getByRole('tooltip');
      await expect(tooltip).toBeVisible();
      const t = (await trigger.boundingBox())!;
      const b = (await tooltip.boundingBox())!;
      const pad = 16;
      const x = Math.min(t.x, b.x) - pad;
      const y = Math.min(t.y, b.y) - pad;
      const clip = { x, y, width: Math.max(t.x + t.width, b.x + b.width) + pad - x, height: Math.max(t.y + t.height, b.y + b.height) + pad - y };
      await expect(page).toHaveScreenshot(`tooltip-open-${name.toLowerCase()}-${theme}.png`, { clip });
    }
  });
}

test('reduced motion drops the scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await hover(page, 'first');
  const tooltip = tooltipFor(page, 'First hint');
  await expect(tooltip).toBeVisible({ timeout: 3000 });
  const closedTransform = await page.evaluate(() => {
    const el = document.createElement('div');
    el.className = 'bland-tooltip';
    document.body.append(el);
    const value = getComputedStyle(el).transform;
    el.remove();
    return value;
  });
  expect(closedTransform).toBe('none');
});
