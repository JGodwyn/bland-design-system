// Behaviour of Pill: toggling with aria-pressed, keyboard, disabled, state colors and sizes.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory, clickToFocus } from './stories';

/** The computed color of a token, resolved the same way the browser resolves the pill's background. */
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
  await openStory(page, 'pills', 'light');
});

test('an uncontrolled pill toggles aria-pressed on click, Enter and Space', async ({ page }) => {
  const pill = page.getByTestId('uncontrolled');
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
  await clickToFocus(pill);
  await expect(pill).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Enter');
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Space');
  await expect(pill).toHaveAttribute('aria-pressed', 'true');
});

test('a controlled pill reports the new state and follows the selected prop', async ({ page }) => {
  const pill = page.getByTestId('controlled');
  await pill.click();
  await expect(page.getByTestId('controlled-state')).toHaveText('true');
  await expect(pill).toHaveAttribute('aria-pressed', 'true');
  await pill.click();
  await expect(page.getByTestId('controlled-state')).toHaveText('false');
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
});

test('a disabled pill does not toggle', async ({ page }) => {
  const pill = page.getByTestId('disabled');
  await expect(pill).toBeDisabled();
  await pill.click({ force: true });
  await expect(pill).toHaveAttribute('aria-pressed', 'false');
});

test('rest, hover and selected use the raised surface and Control/checked tokens; press scales to 0.97', async ({ page }) => {
  const pill = page.getByTestId('uncontrolled');
  expect(await bg(pill)).toBe(await tokenColor(page, '--surface-raised'));

  await pill.hover();
  await expect.poll(() => bg(pill)).toBe(await tokenColor(page, '--surface-raised-hover'));

  await page.mouse.down();
  await expect
    .poll(() => pill.evaluate((e) => getComputedStyle(e).transform))
    .toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
  await page.mouse.up();

  await expect(pill).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => bg(pill)).toBe(await tokenColor(page, '--control-checked-hover'));
  await page.mouse.move(0, 0);
  await expect.poll(() => bg(pill)).toBe(await tokenColor(page, '--control-checked-rest'));
});

test('disabled pills use the disabled fills', async ({ page }) => {
  const off = page.locator('.bland-pill:disabled[aria-pressed="false"]').first();
  const on = page.locator('.bland-pill:disabled[aria-pressed="true"]').first();
  expect(await bg(off)).toBe(await tokenColor(page, '--surface-200'));
  expect(await bg(on)).toBe(await tokenColor(page, '--control-checked-disabled'));
});

test('pills are pill/* high and never narrower than high', async ({ page }) => {
  for (const [size, px] of [['sm', 32], ['md', 40], ['lg', 48]] as const) {
    for (const pill of await page.locator(`.bland-pill[data-size="${size}"]`).all()) {
      const box = (await pill.boundingBox())!;
      expect(box.height).toBe(px);
      expect(box.width).toBeGreaterThanOrEqual(px);
    }
    expect(await page.locator(`.bland-pill[data-size="${size}"]`).first().evaluate((e) => getComputedStyle(e).minWidth)).toBe(`${px}px`);
  }
});

test('the focus ring shows on keyboard focus only', async ({ page }) => {
  const pill = page.getByTestId('uncontrolled');
  const outline = () => pill.evaluate((e) => getComputedStyle(e).outlineStyle);

  await clickToFocus(pill);
  expect(await outline()).toBe('none');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(pill).toBeFocused();
  expect(await outline()).toBe('solid');
});

test('a numeric count is an Indicator xl secondary: brand when selected, neutral otherwise; neutral primary when selected and disabled', async ({ page }) => {
  const emotion = (selector: string) =>
    page.locator(`${selector} .bland-pill__count .bland-indicator`).first().evaluate((e) => [e.getAttribute('data-size'), e.getAttribute('data-type'), e.getAttribute('data-emotion')]);
  expect(await emotion('.bland-pill[aria-pressed="false"]:not(:disabled)')).toEqual(['xl', 'secondary', 'neutral']);
  expect(await emotion('.bland-pill[aria-pressed="true"]:not(:disabled)')).toEqual(['xl', 'secondary', 'brand']);
  // Figma 2026-10-27: neutral secondary vanished on the checked-disabled fill in dark.
  expect(await emotion('.bland-pill[aria-pressed="true"]:disabled')).toEqual(['xl', 'primary', 'neutral']);
});
