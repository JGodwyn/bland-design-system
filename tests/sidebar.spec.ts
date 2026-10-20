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
  // No top slot: the expand button stands in the logo's place, a row-sized square.
  const expand = rail.getByRole('button', { name: 'Expand sidebar' });
  await expect(expand).toBeVisible();
  expect(await width(expand)).toBe(24);
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
  await expect(rail).toHaveAttribute('data-peek', 'closing');
  await expect(rail).not.toHaveAttribute('data-peek');
  await expect(rail).toHaveAttribute('data-layout', 'rail');
});

test('the icons stay where the rail puts them through the peek: no jump at either end', async ({ page }) => {
  const rail = page.getByTestId('rail-md');
  const iconX = () =>
    rail.evaluate((sb) => Math.round(sb.querySelector('.bland-sidebar__icon')!.getBoundingClientRect().x - sb.getBoundingClientRect().x));
  expect(await iconX()).toBe(14);
  await rail.getByRole('link', { name: 'Home' }).hover();
  // The rows slide from the rail's places to the full sidebar's, with the panel (duration/2xl, easing/drawer).
  const t = await rail.getByRole('link', { name: 'Home' }).evaluate((e) => getComputedStyle(e).transitionProperty);
  expect(t).toContain('padding-inline-start');
  await expect.poll(iconX).toBe(24);
  await page.mouse.move(900, 700);
  await expect(rail).not.toHaveAttribute('data-peek');
  expect(await iconX()).toBe(14);
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

test('collapse closes the sidebar to the rail even under the pointer; expand pins it open again', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  const collapse = sidebar.getByRole('button', { name: 'Collapse sidebar' });
  await expect(collapse).toHaveAttribute('aria-expanded', 'true');
  const nav = page.getByRole('navigation', { name: 'With slots' });
  await expect(collapse).toHaveAttribute('aria-controls', (await nav.getAttribute('id'))!);
  await collapse.click();
  await expect(sidebar).toHaveAttribute('data-minimized');
  await expect(sidebar).toHaveAttribute('data-peek', 'closing');
  await expect(sidebar).toHaveAttribute('data-layout', 'rail');
  expect(await width(sidebar)).toBe(40);
  await expect(sidebar).not.toHaveAttribute('data-peek');
  await sidebar.getByRole('link', { name: 'Home' }).hover();
  await expect(sidebar).toHaveAttribute('data-peek', 'open');
  await sidebar.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(sidebar).not.toHaveAttribute('data-minimized');
  await expect.poll(() => width(sidebar)).toBe(256);
  await expect(sidebar.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
});

test('under the pointer, a collapsed sidebar stays closed until the pointer leaves and comes back', async ({ page }) => {
  const sidebar = page.locator('.bland-sidebar').filter({ has: page.getByRole('navigation', { name: 'Size sm' }) });
  await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
  // No top slot: the same button stays under the pointer in the rail, now expanding.
  await expect(sidebar).toHaveAttribute('data-layout', 'rail');
  const expand = sidebar.getByRole('button', { name: 'Expand sidebar' });
  await expand.hover();
  // Longer than the open delay (duration/sidebar-peek-delay).
  await page.waitForTimeout(400);
  await expect(sidebar).not.toHaveAttribute('data-peek');
  await page.mouse.move(900, 20);
  await sidebar.getByRole('link', { name: 'Home' }).hover();
  await expect(sidebar).toHaveAttribute('data-peek', 'open');
});

test('the collapse button sits in flow: beside the logo, or in its place, never over a row', async ({ page }) => {
  for (const id of ['Size sm', 'With slots']) {
    const sidebar = page.locator('.bland-sidebar').filter({ has: page.getByRole('navigation', { name: id }) });
    const toggle = await sidebar.getByRole('button', { name: 'Collapse sidebar' }).boundingBox();
    const first = await sidebar.getByRole('link', { name: 'Home' }).boundingBox();
    expect(toggle!.y + toggle!.height).toBeLessThanOrEqual(first!.y);
  }
  // Without a top slot its icon lines up with the rows' icons.
  const sm = page.locator('.bland-sidebar').filter({ has: page.getByRole('navigation', { name: 'Size sm' }) });
  const x = (sel: string) => sm.locator(sel).first().evaluate((e) => Math.round(e.getBoundingClientRect().x));
  expect(await x('.bland-sidebar__toggle-icon')).toBe(await x('.bland-sidebar__icon'));
});

test('a group opens and folds with its height', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Size xl' });
  const header = nav.getByRole('button', { name: 'Projects' });
  const nest = page.locator(`[id="${await header.getAttribute('aria-controls')}"]`);
  const height = () => nest.evaluate((e) => Math.round(e.getBoundingClientRect().height));
  const open = await height();
  await header.click();
  await expect(nest).toHaveAttribute('data-closed');
  const mid = await height();
  expect(mid).toBeGreaterThan(0);
  await expect.poll(height).toBe(0);
  await expect(nest).toBeHidden();
  await header.click();
  await expect.poll(height).toBe(open);
});

test('the list scrolls between the fixed slots with the fade alone, no scrollbar', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  await expect(sidebar.locator('.bland-scroll-area')).toHaveAttribute('data-overflow');
  await expect(sidebar.locator('.bland-scroll-area__thumb')).toHaveCount(0);
  const bottom = await sidebar.locator('.bland-sidebar__bottom').evaluate((e) => e.getBoundingClientRect().bottom);
  expect(bottom).toBe(await sidebar.evaluate((e) => e.getBoundingClientRect().bottom));
});

test('the panel is surface-200; a hovered row one step above', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  const bg = (el: import('@playwright/test').Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
  const probe = (token: string) =>
    page.evaluate((t) => {
      const d = document.createElement('div');
      d.style.backgroundColor = `var(${t})`;
      document.querySelector('[data-testid^="frame-"]')!.append(d);
      const c = getComputedStyle(d).backgroundColor;
      d.remove();
      return c;
    }, token);
  expect(await bg(sidebar.locator('.bland-sidebar__panel'))).toBe(await probe('--surface-200'));
  const search = sidebar.getByRole('link', { name: 'Search' });
  await search.hover();
  await expect.poll(() => bg(search)).toBe(await probe('--surface-300'));
});

test('hover intent: the rail opens once the pointer rests, and a brief exit does not close it', async ({ page }) => {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--duration-sidebar-peek-delay', '300ms');
    document.documentElement.style.setProperty('--duration-sidebar-peek-close-delay', '300ms');
  });
  const rail = page.getByTestId('rail-md');
  await rail.scrollIntoViewIfNeeded();
  const box = (await rail.boundingBox())!;
  // Passing across the rail: never opens.
  await page.mouse.move(box.x - 40, box.y + 200);
  await page.mouse.move(box.x + 200, box.y + 200, { steps: 4 });
  await page.waitForTimeout(400);
  await expect(rail).not.toHaveAttribute('data-peek');
  // Resting on it: opens after the delay.
  await page.mouse.move(box.x + 20, box.y + 200);
  await page.waitForTimeout(100);
  await expect(rail).not.toHaveAttribute('data-peek');
  await expect(rail).toHaveAttribute('data-peek', 'open');
  // Out and back within the close delay: stays open.
  await page.mouse.move(box.x + 400, box.y + 200);
  await page.waitForTimeout(100);
  await page.mouse.move(box.x + 20, box.y + 220);
  await page.waitForTimeout(400);
  await expect(rail).toHaveAttribute('data-peek', 'open');
});

test('the top and bottom slots cross-fade between their rail and full versions', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  const top = sidebar.locator('.bland-sidebar__top');
  await expect(top).toHaveText('Bland');
  await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
  // Both versions are drawn while they cross: the old one out of flow, inert and hidden from assistive tech.
  await expect(top.locator('[data-leave]')).toHaveText('Bland');
  await expect(top.locator('[data-leave]')).toHaveAttribute('inert', '');
  await expect(top.locator('[data-enter]')).toHaveText('B');
  await expect(top.locator('[data-leave]')).toHaveCount(0);
  await expect(top).toHaveText('B');
  await expect(sidebar.locator('.bland-sidebar__bottom').getByRole('img', { name: 'Account' })).toBeVisible();
});

test('the open and close delays come from the Motion tokens', async ({ page }) => {
  const ms = (t: string) => page.evaluate((t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim(), t);
  expect(await ms('--duration-sidebar-peek-delay')).toBe('200ms');
  expect(await ms('--duration-sidebar-peek-close-delay')).toBe('300ms');
});

test('collapsed, the slots\' rail versions sit in the middle of the rail', async ({ page }) => {
  const sidebar = page.getByTestId('slots');
  await sidebar.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(sidebar).toHaveAttribute('data-layout', 'rail');
  await page.mouse.move(900, 20);
  await expect(sidebar.locator('[data-leave]')).toHaveCount(0);
  const mid = (el: import('@playwright/test').Locator) => el.evaluate((e) => { const r = e.getBoundingClientRect(); return Math.round(r.x + r.width / 2); });
  const rail = await mid(sidebar);
  expect(Math.abs((await mid(sidebar.locator('.bland-sidebar__top > [data-rail] > *'))) - rail)).toBeLessThanOrEqual(1);
  expect(Math.abs((await mid(sidebar.getByRole('img', { name: 'Account' }))) - rail)).toBeLessThanOrEqual(1);
  expect(Math.abs((await mid(sidebar.locator('.bland-sidebar__icon').first())) - rail)).toBeLessThanOrEqual(1);
});

