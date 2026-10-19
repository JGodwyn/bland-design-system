// Behaviour of Breadcrumb: landmark and list, current page, separators, collapse and the overflow menu.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'breadcrumb', 'light');
});

test('a nav landmark around an ordered list; only the last item is the current page', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Breadcrumb 4' });
  await expect(nav.locator('ol > li')).toHaveCount(4);
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Projects', 'Bland']);
  const current = nav.locator('[aria-current="page"]');
  await expect(current).toHaveText('Components');
  expect(await current.evaluate((el) => el.tagName)).toBe('SPAN');
  // Separators sit outside the links, after every crumb but the last, hidden from assistive tech.
  await expect(nav.locator('.bland-breadcrumb__separator[aria-hidden="true"]')).toHaveCount(3);
  await expect(nav.locator('a .bland-breadcrumb__separator')).toHaveCount(0);
});

test('crumbs are control/xs high and the separator icon/xs', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Breadcrumb 4' });
  expect((await nav.getByRole('link').first().boundingBox())!.height).toBe(24);
  const sep = (await nav.locator('.bland-breadcrumb__separator').first().boundingBox())!;
  expect([sep.width, sep.height]).toEqual([12, 12]);
});

test('a collapsed trail keeps the first and last two; the overflow crumb opens a menu of the rest', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Collapsed breadcrumb' });
  await expect(nav.locator('ol > li')).toHaveCount(4);
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Breadcrumb']);
  const overflow = nav.getByRole('button', { name: 'Show hidden pages (4)' });
  await expect(overflow).toHaveAttribute('aria-haspopup', 'true');
  await overflow.focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Show hidden pages (4)' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem')).toHaveText(['Projects', 'Bland', 'Components', 'Navigation']);
  await expect(menu.getByRole('menuitem', { name: 'Projects' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(overflow).toBeFocused();
  // The trail stays collapsed; the hidden crumbs' links are out of sight and out of the accessibility tree.
  await expect(nav.locator('ol > li')).toHaveCount(4);
});

test('choosing a hidden crumb follows its link (the rendered link is clicked, so routers work)', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Collapsed breadcrumb' });
  await nav.evaluate((el) =>
    el.addEventListener('click', (e) => {
      const a = (e.target as Element).closest('a');
      if (a) el.setAttribute('data-followed', a.getAttribute('href') ?? '');
    }),
  );
  await nav.getByRole('button', { name: 'Show hidden pages (4)' }).click();
  await page.getByRole('menuitem', { name: 'Components' }).click();
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(nav).toHaveAttribute('data-followed', '#/Projects/Bland/Components');
});

test('an icon-only crumb is named by its label', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Breadcrumb with icons' });
  await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Home' }).locator('.bland-breadcrumb__label')).toHaveCount(0);
});

test('hover underlines a link label and fills the overflow crumb', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Collapsed breadcrumb' });
  const home = nav.getByRole('link', { name: 'Home' });
  await home.hover();
  await expect(home.locator('.bland-breadcrumb__label')).toHaveCSS('text-decoration-line', 'underline');
  const overflow = nav.getByRole('button');
  await overflow.hover();
  await expect(overflow).toHaveCSS('background-color', 'rgb(226, 229, 234)');
});
