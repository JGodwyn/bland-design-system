// Behaviour of Sidebar: links and aria-current, groups, sizes, the rail and its hover peek, collapse and expand.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'sidebar', 'light');
});

const width = (el: import('@playwright/test').Locator) => el.evaluate((e) => Math.round(e.getBoundingClientRect().width));

test('a named nav of links; the current one has aria-current="page" and the selected colors', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Size sm' });
  const mobile = nav.getByRole('link', { name: 'Mobile app 3' });
  await expect(mobile).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
  expect(await mobile.evaluate((e) => getComputedStyle(e).color)).toBe(await tokenColor(page, '--sidebar-text-selected'));
  expect(await mobile.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe(
    await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--sidebar-surface-selected)';
      document.body.append(probe);
      const c = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return c;
    }),
  );
});

test('pressing a link makes it current', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Size md' });
  await nav.getByRole('link', { name: 'Calendar' }).click();
  await expect(nav.getByRole('link', { name: 'Calendar' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Mobile app 3' })).not.toHaveAttribute('aria-current');
});

test('a group header is a button that shows and hides its nested links', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Size lg' });
  const header = nav.getByRole('button', { name: 'Projects' });
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  const nest = page.locator(`[id="${await header.getAttribute('aria-controls')}"]`);
  await expect(nest.getByRole('link')).toHaveCount(3);
  await header.press('Enter');
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await expect(nest).toBeHidden();
  await header.click();
  await expect(nest).toBeVisible();
});

test('rows are sidebar/item-sm to xl high', async ({ page }) => {
  for (const [size, h] of [['sm', 24], ['md', 32], ['lg', 40], ['xl', 48]] as const) {
    const home = page.getByRole('navigation', { name: `Size ${size}` }).getByRole('link', { name: 'Home' });
    expect(await home.evaluate((e) => e.getBoundingClientRect().height)).toBe(h);
  }
});

test('a disabled row cannot be followed or focused', async ({ page }) => {
  const reports = page.getByRole('navigation', { name: 'Size sm' }).getByRole('link', { name: 'Reports' });
  await expect(reports).toHaveAttribute('aria-disabled', 'true');
  await expect(reports).not.toHaveAttribute('href');
});

test('the rail is an item plus space-sm each side, icons only, labels kept as names', async ({ page }) => {
  for (const [size, w] of [['sm', 40], ['md', 48], ['lg', 56], ['xl', 64]] as const) {
    const rail = page.getByTestId(`rail-${size}`);
    expect(await width(rail)).toBe(w);
    await expect(rail).toHaveAttribute('data-layout', 'rail');
  }
  const rail = page.getByTestId('rail-sm');
  await expect(rail.getByRole('link', { name: 'Inbox 8' })).toBeVisible();
  expect(await width(rail.getByRole('link', { name: 'Home' }))).toBe(24);
  await expect(rail.getByRole('button', { name: 'Expand sidebar' })).toHaveCount(0);
});

test('the pointer over the rail opens the full sidebar over the page; leaving closes it', async ({ page }) => {
  const rail = page.getByTestId('rail-md');
  await rail.getByRole('link', { name: 'Home' }).hover();
  await expect(rail).toHaveAttribute('data-peek', 'open');
  await expect(rail).toHaveAttribute('data-layout', 'full');
  expect(await width(rail.locator('.bland-sidebar__panel'))).toBe(256);
  expect(await width(rail)).toBe(48);
  await expect(rail.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  await page.mouse.move(900, 700);
  await expect(rail).not.toHaveAttribute('data-peek');
  await expect(rail).toHaveAttribute('data-layout', 'rail');
});

test('keyboard focus in the rail opens it at once; Escape closes it', async ({ page }) => {
  const rail = page.getByTestId('rail-lg');
  await page.getByTestId('rail-md').getByRole('link', { name: 'Settings' }).focus();
  await page.keyboard.press('Tab');
  await expect(rail).toHaveAttribute('data-peek', 'open');
  await expect(rail).toHaveAttribute('data-instant');
  await page.keyboard.press('Escape');
  await expect(rail).not.toHaveAttribute('data-peek');
});

test('collapse minimizes to the rail, and expand pins it open again', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  const collapse = sidebar.getByRole('button', { name: 'Collapse sidebar' });
  await expect(collapse).toHaveAttribute('aria-expanded', 'true');
  const nav = page.getByRole('navigation', { name: 'With slots' });
  await expect(collapse).toHaveAttribute('aria-controls', (await nav.getAttribute('id'))!);
  await collapse.click();
  // The pointer is still over it, so it stays open over the page while the rail takes its place.
  await expect(sidebar).toHaveAttribute('data-minimized');
  await expect(sidebar).toHaveAttribute('data-peek', 'open');
  await expect.poll(() => width(sidebar)).toBe(40);
  const expand = sidebar.getByRole('button', { name: 'Expand sidebar' });
  await expand.click();
  await expect(sidebar).not.toHaveAttribute('data-minimized');
  await expect.poll(() => width(sidebar)).toBe(256);
  await expect(sidebar.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
});

test('the list scrolls between the fixed slots, with the scrollbar showing', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  await expect(sidebar.locator('.bland-scroll-area')).toHaveAttribute('data-overflow');
  const bottom = await sidebar.locator('.bland-sidebar__bottom').evaluate((e) => e.getBoundingClientRect().bottom);
  expect(bottom).toBe(await sidebar.evaluate((e) => e.getBoundingClientRect().bottom));
});
