// The docs site: every page opens without errors, the theme switch works, demo controls drive the demo.
import { expect, test, type Page } from '@playwright/test';
import { storyIds } from './stories';

const stylePages = ['colors', 'typography', 'spacing', 'radius', 'stroke', 'elevation', 'motion', 'breakpoints', 'sizing', 'icons'];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

for (const path of ['', ...stylePages.map((p) => `styles/${p}`), ...storyIds.map((id) => `components/${id}`)]) {
  test(`docs page /${path} opens without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/#/${path}`);
    await expect(page.locator('.docs-page-header h1')).toBeVisible();
    await expect(page.locator('.docs-page-header h1')).not.toBeEmpty();
    expect(errors).toEqual([]);
  });
}

test('the theme switch sets and clears data-theme', async ({ page }) => {
  await page.goto('/#/styles/colors');
  const html = page.locator('html');
  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Dark' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'System' }).click();
  await expect(html).not.toHaveAttribute('data-theme');
});

test('demo controls change the component and the code snippet', async ({ page }) => {
  await page.goto('/#/components/button');
  const demo = page.locator('.docs-demo-stage .bland-button');
  await expect(demo).toHaveAttribute('data-emotion', 'brand');
  await page.getByLabel('emotion').selectOption('danger');
  await expect(demo).toHaveAttribute('data-emotion', 'danger');
  await expect(page.locator('.docs-code').last()).toContainText('emotion="danger"');
  await page.getByLabel('children').fill('Delete file');
  await expect(demo).toContainText('Delete file');
});

test('every component page shows a props table with rows', async ({ page }) => {
  for (const id of storyIds) {
    await page.goto(`/#/components/${id}`);
    await expect(page.locator('.docs-table tbody tr').first()).toBeVisible();
  }
});
