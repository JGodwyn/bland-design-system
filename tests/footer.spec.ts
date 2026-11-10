// The landing page's footer (site/src/footer/, Figma 7100:36365): dark whatever the theme, the headline filling
// from outline to bold with its glow as the footer scrolls in (the hero's story run the other way), Bland's CodeText
// and CodeSnippet, the links row, the copyright and the Logo above the headline (INTERFACE.md, "Landing page", Footer).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const ft = (page: Page) => page.locator('footer.ft');

/** Each headline word's boldness, 0 (outline) to 1 (bold with its glow). */
const boldness = (page: Page) =>
  ft(page)
    .locator('[data-word]')
    .evaluateAll((els) => els.map((el) => Number((el as HTMLElement).style.getPropertyValue('--bold'))));

/** Opens the page and waits for the footer: it comes with the chunk loaded after the hero (site/src/rest.tsx). */
async function open(page: Page) {
  await page.goto(site);
  await expect(ft(page)).toBeAttached();
}

/** Scrolls so that `frac` of the footer is above the screen's bottom. */
async function scrollFooterTo(page: Page, frac: number) {
  await page.evaluate((f) => {
    const el = document.querySelector<HTMLElement>('footer.ft')!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top - window.innerHeight + f * el.offsetHeight);
  }, frac);
}

async function toEnd(page: Page) {
  await open(page);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(ft(page)).toHaveAttribute('data-shown', 'true');
}

test('Figma copy, landmark and links; dark whatever the system theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await toEnd(page);
  await expect(ft(page)).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('contentinfo')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2, name: 'Start Bland. End up yours.' })).toBeVisible();
  await expect(ft(page).locator('.bland-code-text code')).toHaveText('npm install bland-ui');
  await expect(ft(page).getByRole('button', { name: 'Copy install command' })).toBeVisible();
  await expect(ft(page).locator('pre code')).toContainText(`import 'bland-ui/styles.css';`);
  await expect(ft(page).locator('pre code')).toContainText('<Button emotion="brand" type="primary">Ship it</Button>');
  const nav = ft(page).getByRole('navigation', { name: 'Footer' });
  await expect(nav.getByRole('link', { name: 'Read the docs' })).toHaveAttribute('href', '/docs/');
  await expect(nav.getByRole('link', { name: 'Changelog' })).toHaveAttribute('href', /npmjs\.com\/package\/bland-ui/);
  await expect(nav.getByRole('link', { name: 'MIT license' })).toHaveAttribute('href', /bland-ui\/LICENSE$/);
  await expect(nav.getByRole('link', { name: 'bland-ui on npm' })).toHaveAttribute('href', 'https://www.npmjs.com/package/bland-ui');
  await expect(ft(page).getByText('© 2026 Bland Design System. All rights reserved.')).toBeVisible();
  // The page's colors are the dark theme's whatever the system says.
  const bg = await ft(page).evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await ft(page).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(bg);
});

test('the logo sits above the headline, Figma\'s lg Logo at 1.2 with the white mark, and is not a link', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1024 });
  await toEnd(page);
  const logo = ft(page).locator('.bland-logo');
  await expect(logo).toHaveCount(1);
  await expect(logo).toHaveAttribute('data-mono', 'true');
  await expect(logo).toHaveAttribute('data-size', 'lg');
  // Named for screen readers by its wordmark; the mark is decorative; it is not a link.
  await expect(logo.getByRole('img', { name: 'Bland' })).toBeVisible();
  await expect(ft(page).getByRole('link', { name: 'Bland', exact: true })).toHaveCount(0);
  await expect(logo.locator('.bland-logo__mark')).toHaveAttribute('aria-hidden', 'true');
  // Figma 7203:40791: 154 x 48 (the lg Logo, 40 tall, at 1.2), 32 above the headline, flush left with the column.
  await expect(logo).toBeVisible();
  // Measure once it has come in: while it rises (the entrance, 24px) its box sits lower.
  await expect(ft(page).locator('.ft__logo')).toHaveCSS('transform', 'none');
  const box = (await logo.boundingBox())!;
  const title = (await ft(page).locator('.ft__title').boundingBox())!;
  expect(Math.round(box.height)).toBe(48);
  expect(Math.abs(box.width - 154)).toBeLessThanOrEqual(2);
  expect(Math.round(title.y - (box.y + box.height))).toBeGreaterThanOrEqual(30);
  expect(Math.abs(box.x - title.x)).toBeLessThanOrEqual(1);
  // Mono: the mark is the wordmark's color (the inverse tile, white on dark), not the brand's.
  const [mark, word, brand] = await logo.evaluate((el) => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--surface-brand)';
    el.append(probe);
    const out = [
      getComputedStyle(el.querySelector('.bland-logo__mark')!).color,
      getComputedStyle(el).color,
      getComputedStyle(probe).color,
    ];
    probe.remove();
    return out;
  });
  expect(mark).toBe(word);
  expect(mark).not.toBe(brand);
});

test('the headline fills from outline to bold, word by word, as the footer scrolls in', async ({ page }) => {
  await open(page);
  await scrollFooterTo(page, 0.25);
  await expect(ft(page)).toHaveAttribute('data-shown', 'true');
  await expect.poll(() => boldness(page)).toEqual([0, 0, 0, 0, 0]);
  // Midway: the first words are bolder than the last.
  await scrollFooterTo(page, 0.55);
  await expect
    .poll(async () => {
      const b = await boldness(page);
      return b[0]! > b[4]! && b[0]! > 0 && b[4]! < 1;
    })
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => boldness(page)).toEqual([1, 1, 1, 1, 1]);
  // Bold: the fill shows and the outline is gone; the glow is on.
  const word = ft(page).locator('[data-word]').first();
  await expect(word.locator('.ft__word-bold')).toHaveCSS('opacity', '1');
  await expect(word.locator('.ft__word-outline')).toHaveCSS('opacity', '0');
  await expect(word.locator('.ft__glow--outer')).toHaveCSS('opacity', '0.75');
  // Scrolling back takes it back to the outline.
  await scrollFooterTo(page, 0.2);
  await expect.poll(() => boldness(page)).toEqual([0, 0, 0, 0, 0]);
});

test('the blocks come in once, after the headline', async ({ page }) => {
  await open(page);
  await expect(ft(page)).not.toHaveAttribute('data-shown');
  await expect(ft(page).locator('.ft__char').first()).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(ft(page).locator('.ft__block').last()).toHaveCSS('opacity', '1');
  await expect(ft(page).locator('.ft__char').last()).toHaveCSS('opacity', '1');
  await expect(ft(page).locator('.ft__block').first()).toHaveCSS('transform', 'none');
});

test('reduced motion: the headline turns bold in one step, nothing moves', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await scrollFooterTo(page, 0.25);
  await expect(ft(page)).toHaveAttribute('data-shown', 'true');
  await expect.poll(() => boldness(page)).toEqual([1, 1, 1, 1, 1]);
  await expect(ft(page).locator('.ft__char').first()).toHaveCSS('transform', 'none');
  await expect(ft(page).locator('.ft__block').first()).toHaveCSS('transform', 'none');
});

test('on a phone: fits the screen, the links wrap', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await toEnd(page);
  // No sideways scroll on the page (the glow's blur room is clipped at the footer's sides).
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const part of ['.ft__logo', '.ft__title', '.ft__install', '.ft__links', '.ft__copyright']) {
    const box = (await ft(page).locator(part).boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
  }
});

test('no accessibility violations', async ({ page }) => {
  await toEnd(page);
  await expect(ft(page).locator('.ft__block').last()).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page }).include('footer.ft').analyze();
  expect(results.violations).toEqual([]);
});
