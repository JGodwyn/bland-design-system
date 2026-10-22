// Behaviour of List item: list semantics, button and link rows, plain rows with their own control, states, sizes, truncation.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the way the browser resolves a background. */
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

const style = (el: Locator, prop: string) => el.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);
const row = (item: Locator) => item.locator('.bland-list-item__row');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'list', 'light');
});

test('rows are list items inside the list', async ({ page }) => {
  const settings = page.getByRole('list', { name: 'Settings' });
  await expect(settings.getByRole('listitem')).toHaveCount(3);
});

test('a row with onClick is one button: click, Enter and Space each activate it once', async ({ page }) => {
  const button = page.getByRole('button', { name: /^Counter/ });
  const count = page.getByTestId('Counter-count');
  await button.click();
  await expect(count).toHaveText('1');
  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');
  await expect(count).toHaveText('3');
});

test('a disabled button row is natively disabled and ignores clicks', async ({ page }) => {
  const button = page.getByRole('button', { name: /^Disabled counter/ });
  await expect(button).toBeDisabled();
  await button.click({ force: true });
  await expect(page.getByTestId('Disabled counter-count')).toHaveText('0');
  await expect(row(page.getByTestId('Disabled counter')).locator('.bland-list-item__title')).toHaveCSS('color', await tokenColor(page, '--text-minimal'));
});

test('a row with href is a link; a disabled one has no href and cannot take focus', async ({ page }) => {
  await expect(page.getByRole('link', { name: /^Account/ })).toHaveAttribute('href', '#/components/list');
  const billing = page.locator('a.bland-list-item__row', { hasText: 'Billing' });
  await expect(billing).not.toHaveAttribute('href');
  await expect(billing).toHaveAttribute('aria-disabled', 'true');
  // An <a> without href is not focusable at all.
  expect(await billing.evaluate((a: HTMLAnchorElement) => (a.focus(), document.activeElement === a))).toBe(false);
});

test('a row whose trailing slot holds a control is a plain row, so the control is not nested in a button', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: 'Notifications' });
  expect(await toggle.evaluate((el) => !!el.closest('button, a'))).toBe(false);
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  const plain = page.getByRole('list', { name: 'Settings' }).locator('.bland-list-item__row').first();
  expect(await plain.evaluate((el) => el.tagName)).toBe('DIV');
});

test('button and link rows take the hover and pressed fills; plain rows keep the rest fill', async ({ page }) => {
  const rest = await tokenColor(page, '--list-surface-rest');
  const button = page.getByRole('button', { name: /^Counter/ });
  await expect(button).toHaveCSS('background-color', rest);
  await button.hover();
  await expect.poll(() => style(button, 'background-color')).toBe(await tokenColor(page, '--list-surface-hover'));
  await page.mouse.down();
  await expect.poll(() => style(button, 'background-color')).toBe(await tokenColor(page, '--list-surface-pressed'));
  await page.mouse.up();

  const plain = page.getByRole('list', { name: 'Settings' }).locator('.bland-list-item__row').nth(1);
  await plain.hover();
  await page.waitForTimeout(300);
  expect(await style(plain, 'background-color')).toBe(rest);
});

test('flush rows have no resting fill and still fill on hover', async ({ page }) => {
  const flush = page.getByRole('button', { name: /^Flush counter/ });
  await expect(flush).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await flush.hover();
  await expect.poll(() => style(flush, 'background-color')).toBe(await tokenColor(page, '--list-surface-hover'));
});

test('keyboard focus shows the 2px ring on button rows', async ({ page }) => {
  const button = page.getByRole('button', { name: /^Counter/ });
  await page.getByRole('switch', { name: 'Notifications' }).focus();
  // Tab from the controls above until the counter row is focused.
  for (let i = 0; i < 6 && !(await button.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS('outline-width', '2px');
  await expect(button).toHaveCSS('outline-color', await tokenColor(page, '--border-focused'));
});

test('row heights and leading slot sizes follow Lines', async ({ page }) => {
  const firstGroup = page.locator('ul').first().locator('.bland-list-item');
  expect((await firstGroup.nth(0).boundingBox())!.height).toBe(32);
  expect((await firstGroup.nth(1).boundingBox())!.height).toBe(62);
  const leading = page.locator('.bland-list-item__leading');
  const sizes = await leading.evaluateAll((els) => els.slice(0, 3).map((e) => e.getBoundingClientRect().width));
  expect(sizes).toEqual([24, 24, 40]);
});

test('the title and a 2 line description end in an ellipsis; a 3+ description wraps', async ({ page }) => {
  const long = page.locator('.bland-list-item', { hasText: 'A title far too long' });
  const clipped = (el: Locator) => el.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).textOverflow === 'ellipsis');
  expect(await clipped(long.nth(0).locator('.bland-list-item__title'))).toBe(true);
  expect(await clipped(long.nth(1).locator('.bland-list-item__description'))).toBe(true);
  const wrapped = long.nth(2).locator('.bland-list-item__description');
  expect((await wrapped.boundingBox())!.height).toBeGreaterThan(20);
  // The alt text never gives way.
  expect(await clipped(long.nth(0).locator('.bland-list-item__alt'))).toBe(false);
});
