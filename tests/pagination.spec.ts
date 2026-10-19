// Behaviour of Pagination: landmark, current page, previous and next, the seven slots, sizes, links, disabled.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'pagination', 'light');
});

test('a nav landmark; the current page has aria-current and items are named', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Pagination sm' });
  await expect(nav.getByRole('button')).toHaveCount(8); // previous, 1 to 5, 10, next
  await expect(nav.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(nav.locator('[aria-current]')).toHaveCount(1);
  await expect(nav.getByRole('button', { name: 'Previous page' })).toHaveAttribute('aria-disabled', 'true');
  await expect(nav.getByRole('button', { name: 'Next page' })).not.toHaveAttribute('aria-disabled');
  // The overflow item is a mark, not a control, and hidden from assistive tech.
  await expect(nav.locator('.bland-pagination__gap[aria-hidden="true"]')).toHaveCount(1);
});

test('pressing a page, next and previous moves the current page; focus stays put at the ends', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Overflow at the end' });
  await nav.getByRole('button', { name: 'Page 2' }).click();
  await expect(nav.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('button', { name: 'Next page' }).click();
  await expect(nav.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  const prev = nav.getByRole('button', { name: 'Previous page' });
  await prev.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await expect(nav.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
  // Previous is now aria-disabled, but still focused, and pressing it again does nothing.
  await expect(prev).toHaveAttribute('aria-disabled', 'true');
  await expect(prev).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(nav.getByRole('button', { name: 'Page 1', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('past seven pages it always shows seven slots, with a gap where pages are skipped', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Overflow at the end' });
  const labels = () => nav.locator('li').evaluateAll((lis) => lis.map((li) => li.textContent || '…'));
  expect(await labels()).toEqual(['…', '1', '2', '3', '4', '5', '…', '10', '…']);
  await nav.getByRole('button', { name: 'Page 5' }).click();
  expect(await labels()).toEqual(['…', '1', '…', '4', '5', '6', '…', '10', '…']);
  await nav.getByRole('button', { name: 'Page 10' }).click();
  expect(await labels()).toEqual(['…', '1', '…', '6', '7', '8', '9', '10', '…']);
  // Up to seven pages, every page shows.
  await expect(page.getByRole('navigation', { name: 'Five pages' }).locator('.bland-pagination__gap')).toHaveCount(0);
});

test('items are control/xs, sm, md high and square at least; the box adds space-xs around them', async ({ page }) => {
  for (const [size, px] of [['sm', 24], ['md', 32], ['lg', 40]] as const) {
    const nav = page.getByRole('navigation', { name: `Pagination ${size}` });
    const box = (await nav.getByRole('button', { name: 'Page 2' }).boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
    expect((await nav.locator('ul').boundingBox())!.height).toBe(px + 8);
  }
  // Three digits grow the item past its square.
  const wide = (await page.getByRole('navigation', { name: 'Wide sm' }).getByRole('button', { name: 'Page 120' }).boundingBox())!;
  expect(wide.width).toBeGreaterThan(24);
});

test('getHref makes each page a link; the current page and the blocked side keep their state', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Link pagination' });
  await expect(nav.getByRole('link', { name: 'Page 4' })).toHaveAttribute('href', '#?page=4');
  await expect(nav.getByRole('link', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'Next page' }).click();
  await expect(nav.getByRole('link', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page');
});

test('disabled disables every item', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Disabled pagination' });
  for (const button of await nav.getByRole('button').all()) await expect(button).toBeDisabled();
});
