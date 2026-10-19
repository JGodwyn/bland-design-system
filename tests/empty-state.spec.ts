// Behaviour of Empty State: structure, heading level, the illustration slot, actions and focus, Figma's sizes.
import { expect, test, type Locator } from '@playwright/test';
import { openStory } from './stories';

const style = (el: Locator, prop: string) => el.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

test.describe('story', () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, 'empty-state', 'light');
  });

  test('the title is an h2 by default and titleAs changes its element', async ({ page }) => {
    await expect(page.getByTestId('plain-sm').getByRole('heading', { level: 2, name: 'This part is empty.' })).toBeVisible();
    await expect(page.getByTestId('title-only').getByRole('heading', { level: 3, name: 'Nothing here' })).toBeVisible();
  });

  test('the empty state takes no focus: Tab reaches only its action buttons', async ({ page }) => {
    const state = page.getByTestId('actions-sm');
    await expect(state).not.toHaveAttribute('tabindex');
    const buttons = state.getByRole('button');
    await expect(buttons).toHaveCount(2);
    await buttons.first().focus();
    await page.keyboard.press('Tab');
    await expect(buttons.nth(1)).toBeFocused();
    await expect(page.getByTestId('plain-sm').locator('button, a, [tabindex]')).toHaveCount(0);
  });

  test('without an illustration nothing renders in the slot: Bland ships no default', async ({ page }) => {
    await expect(page.getByTestId('no-illustration').locator('.bland-empty-state__illustration')).toHaveCount(0);
    await expect(page.getByTestId('title-only').locator('.bland-empty-state__illustration')).toHaveCount(0);
    await expect(page.getByTestId('plain-sm').locator('.bland-empty-state__illustration')).toHaveCount(1);
  });

  test('actions stack at the full content width, primary first', async ({ page }) => {
    for (const size of ['sm', 'lg']) {
      const state = page.getByTestId(`actions-${size}`);
      const actions = state.locator('.bland-empty-state__actions');
      const [box, first, second] = await Promise.all([
        actions.boundingBox(),
        state.getByRole('button').first().boundingBox(),
        state.getByRole('button').nth(1).boundingBox(),
      ]);
      expect(first!.width).toBeCloseTo(box!.width, 0);
      expect(second!.width).toBeCloseTo(box!.width, 0);
      expect(second!.y - (first!.y + first!.height)).toBeCloseTo(8, 0); // space-sm
      await expect(state.getByRole('button').first()).toHaveAttribute('data-type', 'primary');
    }
  });

  test('sizes follow Figma: gap, padding and type per size, filling the frame', async ({ page }) => {
    const sm = page.getByTestId('plain-sm');
    const lg = page.getByTestId('plain-lg');
    expect(await style(sm, 'row-gap')).toBe('16px'); // space-lg
    expect(await style(lg, 'row-gap')).toBe('24px'); // space-xl
    expect(await style(sm, 'padding-top')).toBe('12px'); // space-md
    expect((await sm.boundingBox())!.width).toBe(256); // fills empty-state/width-sm
    expect((await lg.boundingBox())!.width).toBe(384); // fills empty-state/width-lg
    const title = (s: Locator) => s.locator('.bland-empty-state__title');
    const text = (s: Locator) => s.locator('.bland-empty-state__description');
    expect(await style(title(sm), 'font-size')).toBe('16px'); // body-lg-bold
    expect(await style(title(lg), 'font-size')).toBe('22px'); // title-lg (size/xl)
    expect(await style(text(sm), 'font-size')).toBe('14px'); // body-md
    expect(await style(text(lg), 'font-size')).toBe('16px'); // body-lg
    expect(await style(title(sm), 'text-align')).toBe('center');
    expect(await style(title(sm), 'margin-top')).toBe('0px');
  });
});

test('the docs offer "focused" only while actions render', async ({ page }) => {
  await page.goto('/#/components/empty-state');
  const focused = page.locator('#ctl-focused');
  await expect(focused).toBeVisible();
  await page.getByLabel('actions').selectOption('none');
  await expect(page.locator('.docs-demo-stage')).toBeVisible();
  await expect(focused).toHaveCount(0);
});
