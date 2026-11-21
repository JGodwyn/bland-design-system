// Behaviour of Link: text styles, underline at rest and on hover, external links, icons, focus ring.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'link', 'light');
});

const frame = (page: import('@playwright/test').Page) => page.getByTestId('frame-light');

test('a plain <a> with its href; sizes set body-sm, md and lg', async ({ page }) => {
  const f = frame(page);
  for (const [size, px] of [['sm', '12px'], ['md', '14px'], ['lg', '16px']] as const) {
    const link = f.getByRole('link', { name: `Link ${size}` }).first();
    expect(await link.evaluate((a) => a.tagName)).toBe('A');
    await expect(link).toHaveAttribute('href', '#/components/link');
    await expect(link).toHaveCSS('font-size', px);
  }
});

test('without a size it takes the font of the running text and stays inline', async ({ page }) => {
  const link = frame(page).getByTestId('running-text').getByRole('link');
  await expect(link).toHaveCSS('font-size', '16px');
  await expect(link).toHaveCSS('display', 'inline');
  // Long enough to wrap in the 28ch paragraph: more than one line box.
  expect(await link.evaluate((a) => a.getClientRects().length)).toBeGreaterThan(1);
});

test('underline always: 1px at rest, 2px on hover, 2px below the text', async ({ page }) => {
  const link = frame(page).getByRole('link', { name: 'Link md' }).first();
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
  await expect(link).toHaveCSS('text-decoration-thickness', '1px');
  await expect(link).toHaveCSS('text-underline-offset', '2px');
  await link.hover();
  await expect(link).toHaveCSS('text-decoration-thickness', '2px');
});

test('underline hover: none at rest, 1px under the pointer', async ({ page }) => {
  const link = frame(page).locator('.bland-link[data-underline="hover"][data-size="md"]').first();
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await link.hover();
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
  await expect(link).toHaveCSS('text-decoration-thickness', '1px');
});

test('colors: link is text-link, inherit takes the surrounding color', async ({ page }) => {
  const f = frame(page);
  const link = f.locator('.bland-link[data-color="link"]').first();
  const linkColor = await link.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--text-link)';
    document.querySelector('[data-testid="frame-light"]')!.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  await expect(link).toHaveCSS('color', linkColor);
  const onBrand = f.getByRole('link', { name: 'Choose a plan' });
  const parentColor = await onBrand.evaluate((a) => getComputedStyle(a.parentElement!).color);
  await expect(onBrand).toHaveCSS('color', parentColor);
});

test('target="_blank" adds the external mark and says it opens a new tab; external={false} drops both', async ({ page }) => {
  const f = frame(page);
  const github = f.getByRole('link', { name: 'GitHub (opens in a new tab)' });
  await expect(github).toHaveCount(3);
  await expect(github.first().locator('.bland-link__external[aria-hidden="true"]')).toHaveCount(1);
  const plain = f.locator('a[target="_blank"]').filter({ hasText: 'external' });
  await expect(plain.locator('.bland-link__external')).toHaveCount(0);
  await expect(plain).not.toContainText('opens in a new tab');
});

test('icons are sized by the link size and never break from their word', async ({ page }) => {
  const f = frame(page);
  for (const [size, px] of [['sm', 12], ['md', 16], ['lg', 20]] as const) {
    const icon = f.locator(`.bland-link[data-size="${size}"] .bland-link__icon--start`).first();
    const box = (await icon.boundingBox())!;
    expect([box.width, box.height]).toEqual([px, px]);
  }
  await expect(f.locator('.bland-link__end').first()).toHaveCSS('white-space', 'nowrap');
});

test('keyboard focus: the ring is stroke-lg, and stroke-sm on sm', async ({ page }) => {
  const f = frame(page);
  const md = f.getByRole('link', { name: 'Link md' }).first();
  await md.focus();
  await expect(md).toHaveCSS('outline-width', '2px');
  await expect(md).toHaveCSS('outline-offset', '2px');
  const sm = f.getByRole('link', { name: 'Link sm' }).first();
  await sm.focus();
  await expect(sm).toHaveCSS('outline-width', '1px');
});
