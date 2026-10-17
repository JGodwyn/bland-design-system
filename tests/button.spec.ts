// Behaviour of Button and Icon Button: activation, focus ring, disabled, loading, hover and press.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the same way the browser resolves the button's background. */
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
  await openStory(page, 'button', 'light');
});

test('Enter and Space activate the button', async ({ page }) => {
  const button = page.getByTestId('Counter');
  const count = page.getByTestId('Counter-count');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(count).toHaveText('1');
  await page.keyboard.press('Space');
  await expect(count).toHaveText('2');
});

test('the focus ring shows on keyboard focus only', async ({ page }) => {
  const button = page.getByTestId('Counter');
  const outline = () => button.evaluate((e) => getComputedStyle(e).outlineStyle);

  await button.click();
  await expect(button).toBeFocused();
  expect(await outline()).toBe('none');

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  expect(await outline()).toBe('solid');
  expect(await button.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe('2px');
});

test('a disabled button cannot be clicked', async ({ page }) => {
  const button = page.getByTestId('Disabled counter');
  await expect(button).toBeDisabled();
  await button.click({ force: true });
  await expect(page.getByTestId('Disabled counter-count')).toHaveText('0');
});

test('loading sets aria-busy, keeps the accessible name and ignores clicks', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Loading counter' });
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button).toBeEnabled();
  await button.click();
  await button.press('Enter');
  await expect(page.getByTestId('Loading counter-count')).toHaveText('0');

  // An Icon Button keeps its aria-label while the spinner replaces the icon.
  const iconButton = page.getByRole('button', { name: 'Add' }).and(page.locator('[aria-busy="true"]')).first();
  await expect(iconButton).toBeVisible();
  await expect(iconButton.locator('.bland-button__spinner')).toBeVisible();

  // The spinner turns once per --duration-spin, linearly, forever.
  const spin = await iconButton.locator('.bland-button__spinner svg').evaluate((e) => {
    const cs = getComputedStyle(e);
    return [cs.animationName, cs.animationDuration, cs.animationTimingFunction, cs.animationIterationCount];
  });
  expect(spin).toEqual(['bland-button-spin', '0.8s', 'linear', 'infinite']);

  // Not loading: no aria-busy at all.
  await expect(page.getByTestId('Counter')).not.toHaveAttribute('aria-busy');
});

test('hover and press use the Button state tokens; press scales to 0.97', async ({ page }) => {
  const button = page.getByTestId('Counter');
  expect(await bg(button)).toBe(await tokenColor(page, '--button-brand-secondary-rest'));

  await button.hover();
  await expect.poll(() => bg(button)).toBe(await tokenColor(page, '--button-brand-secondary-hover'));

  await page.mouse.down();
  await expect.poll(() => bg(button)).toBe(await tokenColor(page, '--button-brand-secondary-pressed'));
  await expect
    .poll(() => button.evaluate((e) => getComputedStyle(e).transform))
    .toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
  await page.mouse.up();
});

test('a disabled button keeps its disabled colors on hover', async ({ page }) => {
  const button = page.getByTestId('Disabled counter');
  await button.hover({ force: true });
  expect(await bg(button)).toBe(await tokenColor(page, '--button-brand-secondary-disabled'));
});

test('icon buttons are square at every size', async ({ page }) => {
  for (const [size, px] of [['lg', 56], ['md', 40], ['sm', 32], ['xs', 24]] as const) {
    const box = (await page.locator(`.bland-icon-button[data-size="${size}"]`).first().boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
  }
});

test('the button sizes its icons from the size prop', async ({ page }) => {
  for (const [size, px] of [['lg', 24], ['md', 20], ['sm', 20], ['xs', 12]] as const) {
    const box = (await page.locator(`.bland-button[data-size="${size}"] .bland-button__icon`).first().boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
  }
});
