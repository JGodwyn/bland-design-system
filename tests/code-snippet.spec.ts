// Behaviour of Code snippet and Code text: Show more, file tabs, the language switchers, copy, scrolling.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openStory(page, 'code-snippet', 'light');
});

const clipboard = (page: import('@playwright/test').Page) => page.evaluate(() => navigator.clipboard.readText());

test('collapsed caps the code; Show more expands it and Show less collapses it', async ({ page }) => {
  const snippet = page.getByTestId('collapsed');
  const scroll = snippet.locator('.bland-code-snippet__scroll');
  const cap = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--code-snippet-height-collapsed')),
  );
  expect((await scroll.boundingBox())!.height).toBeCloseTo(cap, 0);

  const toggle = snippet.getByRole('button', { name: 'Show more' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  const body = await toggle.getAttribute('aria-controls');
  await expect(snippet.locator(`[id="${body}"]`)).toHaveClass(/bland-code-snippet__body/);
  await toggle.click();
  await expect(snippet.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  expect((await scroll.boundingBox())!.height).toBeGreaterThan(cap);
  await snippet.getByRole('button', { name: 'Show less' }).click();
  expect((await scroll.boundingBox())!.height).toBeCloseTo(cap, 0);
});

test('short code and fullscreen have no toggle', async ({ page }) => {
  await expect(page.getByTestId('switcher-dropdown').getByRole('button', { name: 'Show more' })).toHaveCount(0);
  await expect(page.getByTestId('fullscreen').getByRole('button', { name: /Show (more|less)/ })).toHaveCount(0);
});

test('file tabs switch the code, and the line numbers follow', async ({ page }) => {
  const snippet = page.getByTestId('collapsed');
  await expect(snippet.getByRole('tablist', { name: 'Files' })).toBeVisible();
  await snippet.getByRole('tab', { name: 'Button.html' }).click();
  await expect(snippet.locator('code')).toHaveText('<button type="button">Save</button>\n');
  await expect(snippet.locator('.bland-code-snippet__gutter > span')).toHaveCount(1);
  await expect(snippet.locator('.bland-code-snippet__gutter')).toHaveAttribute('aria-hidden', 'true');
  await expect(snippet.getByRole('button', { name: 'Show more' })).toHaveCount(0);
});

test('the dropdown switcher picks a language from a Menu', async ({ page }) => {
  const snippet = page.getByTestId('controlled');
  const trigger = snippet.getByRole('button', { name: 'Language: python' });
  await trigger.click();
  await page.getByRole('menuitemradio', { name: 'javascript' }).click();
  await expect(snippet.getByRole('button', { name: 'Language: javascript' })).toBeVisible();
  await expect(snippet.locator('code')).toContainText('updateQuantity(change)');
  await expect(page.getByTestId('controlled-state')).toHaveText('javascript collapsed');
});

test('tabs and pills switchers are tab lists named Language', async ({ page }) => {
  for (const id of ['switcher-tabs', 'switcher-pills']) {
    const snippet = page.getByTestId(id);
    await snippet.getByRole('tablist', { name: 'Language' }).getByRole('tab', { name: 'Javascript' }).click();
    await expect(snippet.locator('code')).toHaveText('// Javascript\nconsole.log("hello");\n');
  }
});

test('one language is a label, not a menu', async ({ page }) => {
  const snippet = page.getByTestId('single');
  await expect(snippet.locator('.bland-code-snippet__language')).toHaveText('javascript');
  await expect(snippet.getByRole('button', { name: /Language/ })).toHaveCount(0);
});

test('copy copies the shown code and announces Copied', async ({ page }) => {
  const snippet = page.getByTestId('switcher-tabs');
  const copy = snippet.getByRole('button', { name: 'Copy code' });
  const copiedAt = Date.now();
  await copy.click();
  expect(await clipboard(page)).toBe('# Python\nprint("hello")\n');
  await expect(snippet.getByRole('status')).toHaveText('Copied');
  // It stays for duration/copied-visible (2s) wherever the pointer goes, then the Copy icon comes back.
  await page.getByTestId('plain').hover();
  await expect(snippet.getByRole('status')).toHaveText('Copied');
  await expect(snippet.getByRole('status')).toHaveText('', { timeout: 5000 });
  expect(Date.now() - copiedAt).toBeGreaterThanOrEqual(2000);
});

test('long lines scroll sideways and the scrolling area is a Tab stop', async ({ page }) => {
  const viewport = page.getByTestId('single').locator('.bland-code-snippet__code-scroll > .bland-scroll-area__viewport');
  await expect(viewport).toHaveAttribute('tabindex', '0');
  const gutter = page.getByTestId('single').locator('.bland-code-snippet__gutter');
  const before = (await gutter.boundingBox())!.x;
  await viewport.evaluate((el) => (el.scrollLeft = 200));
  expect((await gutter.boundingBox())!.x).toBe(before);
  // A short snippet has nothing to scroll, so no Tab stop.
  await expect(page.getByTestId('plain').locator('.bland-scroll-area__viewport').first()).not.toHaveAttribute('tabindex');
});

test('code text copies its code', async ({ page }) => {
  const text = page.getByTestId('code-text-md');
  await text.getByRole('button', { name: 'Copy code' }).click();
  expect(await clipboard(page)).toBe('bland/tokens.css');
  await expect(text.getByRole('status')).toHaveText('Copied');
});
