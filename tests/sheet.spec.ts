// Behaviour of Sheet: opening and closing like Modal (it shares Modal's dialog), the edge each side sits on,
// right-to-left, floating, the bottom sheet, the pinned action bar, the backdrop, motion, and open screenshots.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const sheet = (page: Page, id: string) => page.getByTestId(`${id}-sheet`);
const rectOf = (page: Page, id: string) =>
  sheet(page, id).evaluate((d) => {
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      w: Math.round(r.width),
      h: Math.round(r.height),
      vw: innerWidth,
      vh: innerHeight,
      border: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth],
    };
  });

test.beforeEach(async ({ page }) => {
  await openStory(page, 'sheet', 'light');
});

test('a press opens it with motion, focuses it, names and describes it; Cancel closes and returns focus', async ({ page }) => {
  const trigger = page.getByTestId('end-trigger');
  const end = sheet(page, 'end');
  await expect(end).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible();
  await expect(end).not.toHaveAttribute('data-instant');
  await expect(end).toBeFocused();
  await expect(end).toHaveAccessibleDescription(/Narrow the list down/);
  await page.keyboard.press('Tab');
  await expect(end.getByRole('button', { name: 'Close' })).toBeFocused();
  await end.getByRole('button', { name: 'Cancel' }).click();
  await expect(end).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('the keyboard opens it at once; Escape and the backdrop close it', async ({ page }) => {
  const trigger = page.getByTestId('end-trigger');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(sheet(page, 'end')).toHaveAttribute('data-instant', 'true');
  await page.keyboard.press('Escape');
  await expect(sheet(page, 'end')).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByTestId('end-trigger').click();
  await expect(sheet(page, 'end')).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(sheet(page, 'end')).toBeHidden();
});

test('end sits on the right edge at full height with its border inside; start on the left', async ({ page }) => {
  await page.getByTestId('end-trigger').focus();
  await page.keyboard.press('Enter');
  const end = await rectOf(page, 'end');
  expect(end).toMatchObject({ x: end.vw - 384, y: 0, w: 384, h: end.vh, border: ['0px', '0px', '0px', '1px'] });
  await page.keyboard.press('Escape');
  await page.getByTestId('start-trigger').focus();
  await page.keyboard.press('Enter');
  const start = await rectOf(page, 'start');
  expect(start).toMatchObject({ x: 0, y: 0, w: 384, h: start.vh, border: ['0px', '1px', '0px', '0px'] });
});

test('in a right-to-left page, end comes in from the left', async ({ page }) => {
  await page.evaluate(() => (document.documentElement.dir = 'rtl'));
  await page.getByTestId('end-trigger').focus();
  await page.keyboard.press('Enter');
  const end = await rectOf(page, 'end');
  expect(end).toMatchObject({ x: 0, w: 384, border: ['0px', '1px', '0px', '0px'] });
});

test('floating keeps space-sm from every edge with a border all round; the body scrolls, the actions stay', async ({ page }) => {
  await page.getByTestId('floating-trigger').focus();
  await page.keyboard.press('Enter');
  const r = await rectOf(page, 'floating');
  expect(r).toMatchObject({ x: r.vw - 512 - 8, y: 8, w: 512, h: r.vh - 16, border: ['1px', '1px', '1px', '1px'] });
  const floating = sheet(page, 'floating');
  const viewport = floating.locator('.bland-scroll-area__viewport');
  expect(await viewport.evaluate((v) => v.scrollHeight > v.clientHeight)).toBe(true);
  const { bar, box } = await floating.evaluate((d) => ({
    bar: Math.round(d.querySelector('.bland-modal__actions')!.getBoundingClientRect().bottom),
    box: Math.round(d.getBoundingClientRect().bottom),
  }));
  expect(Math.abs(bar - box)).toBeLessThanOrEqual(1);
});

test('the bottom sheet spans the width at the bottom with a handle and stacked actions, primary on top', async ({ page }) => {
  await page.getByTestId('bottom-trigger').focus();
  await page.keyboard.press('Enter');
  const r = await rectOf(page, 'bottom');
  expect(r).toMatchObject({ x: 0, w: r.vw, border: ['1px', '0px', '0px', '0px'] });
  expect(r.y + r.h).toBe(r.vh);
  const bottom = sheet(page, 'bottom');
  await expect(bottom.locator('.bland-sheet__handle')).toBeVisible();
  const [first, second] = await bottom.locator('.bland-modal__actions > *').evaluateAll((els) =>
    els.map((e) => ({ text: e.textContent, ...JSON.parse(JSON.stringify(e.getBoundingClientRect())) })),
  );
  expect(first.text).toBe('Apply');
  expect(first.y).toBeLessThan(second.y);
  expect(first.width).toBe(second.width);
});

test('side sheets put the primary last on the right', async ({ page }) => {
  await page.getByTestId('end-trigger').focus();
  await page.keyboard.press('Enter');
  await expect(sheet(page, 'end').locator('.bland-modal__actions > *').last()).toHaveText('Apply');
});

test('it dims the page with Sheet/backdrop and slides with translate; reduced motion only fades', async ({ page }) => {
  // A press, not the keyboard: a keyboard open has no motion (data-instant).
  await page.getByTestId('end-trigger').click();
  await expect(sheet(page, 'end')).toBeVisible();
  const backdrop = await sheet(page, 'end').evaluate((d) => getComputedStyle(d, '::backdrop').backgroundColor);
  const token = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.style.background = 'var(--sheet-backdrop)';
    document.body.append(probe);
    const c = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return c;
  });
  expect(backdrop).toBe(token);
  expect(await sheet(page, 'end').evaluate((d) => getComputedStyle(d).transitionProperty)).toContain('translate');
  await page.keyboard.press('Escape');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('end-trigger').click();
  await expect(sheet(page, 'end')).toBeVisible();
  expect(await sheet(page, 'end').evaluate((d) => getComputedStyle(d).transitionProperty)).toBe('opacity');
});

for (const theme of ['light', 'dark'] as const) {
  test(`an open sheet looks the same (${theme})`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'screenshot baselines are Chromium (playwright.config.ts)');
    await openStory(page, 'sheet', theme);
    await page.getByTestId('end-trigger').focus();
    await page.keyboard.press('Enter');
    await expect(sheet(page, 'end')).toBeVisible();
    await expect(page).toHaveScreenshot(`sheet-open-${theme}.png`);
  });
}
