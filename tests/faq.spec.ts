// The landing page's FAQ (site/src/faq/, Figma 7189:37802, Godwin's redesign): Figma's heading and line beside
// Bland's Accordion, md and flush, dotted rules between, the first open, one open at a time (INTERFACE.md, "Landing
// page", FAQ; copy in docs/landing-copy.md).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const sec = (page: Page) => page.locator('section.faq');
const items = (page: Page) => sec(page).locator('details.bland-accordion');

async function open(page: Page) {
  await page.goto(site);
  await sec(page).scrollIntoViewIfNeeded();
  await expect(sec(page)).toHaveAttribute('data-shown', 'true');
}

test("Figma's heading, line and twelve questions, the first open, after the Figma kit", async ({ page }) => {
  await open(page);
  await expect(sec(page)).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('heading', { level: 2, name: 'Some questions about Bland' })).toBeVisible();
  // Two lines, broken after "questions" (Godwin 2026-11-09).
  await expect(sec(page).locator('.faq__title-line')).toHaveText(['Some questions', 'about Bland']);
  await expect(sec(page).getByText(/^Common questions about brand tokens/)).toBeVisible();
  await expect(items(page)).toHaveCount(12);
  await expect(items(page).locator('summary').first()).toHaveText('How do brand tokens work?');
  await expect(items(page).locator('summary').last()).toHaveText('Are there performance considerations for token usage?');
  await expect(items(page).first()).toHaveAttribute('open', '');
  for (const d of (await items(page).all()).slice(1)) await expect(d).not.toHaveAttribute('open');
  await expect(items(page).first()).toHaveAttribute('data-size', 'md');
  await expect(items(page).first()).toHaveAttribute('data-flush', 'true');
  // Figma's dotted rules between the questions, hidden from screen readers.
  await expect(sec(page).locator('.faq__rule')).toHaveCount(11);
  await expect(sec(page).locator('.faq__rule').first()).toHaveAttribute('aria-hidden', 'true');
  // Between the Figma kit and whatever follows it.
  const prev = await sec(page).evaluate((el) => el.previousElementSibling?.className);
  expect(prev).toContain('fk');
  // Everything has come in.
  await expect(items(page).last()).toHaveCSS('opacity', '1');
});

test("at 1440 Figma's columns: heading on 2 to 4, questions on 5 to 7, 416 wide each", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const head = (await sec(page).locator('.faq__head').boundingBox())!;
  const list = (await sec(page).locator('.faq__list').boundingBox())!;
  expect(Math.round(head.width)).toBe(416);
  expect(Math.round(list.width)).toBe(416);
  expect(Math.round(head.x)).toBe(296);
  expect(Math.round(list.x)).toBe(296 + 416 + 16);
  expect(Math.round(list.y)).toBe(Math.round(head.y));
  // The questions start space-lg inside the list, 376 wide as in Figma.
  const q = (await items(page).first().boundingBox())!;
  expect(Math.round(q.width)).toBe(376);
  expect(Math.round(q.x)).toBe(Math.round(list.x) + 16);
});

test('one question open at a time, by pointer and keyboard', async ({ page }) => {
  await open(page);
  const summary = (i: number) => items(page).nth(i).locator('summary');
  await summary(1).click();
  await expect(items(page).nth(1)).toHaveAttribute('open', '');
  await expect(items(page).first()).not.toHaveAttribute('open');
  await expect(items(page).nth(1).getByText('--space-md')).toBeVisible();
  await summary(4).focus();
  await page.keyboard.press('Enter');
  await expect(items(page).nth(4)).toHaveAttribute('open', '');
  await expect(items(page).nth(1)).not.toHaveAttribute('open');
  await page.keyboard.press('Space');
  await expect(items(page).nth(4)).not.toHaveAttribute('open');
});

test('opening another question folds the open one, never snaps it shut (Godwin 2026-11-10)', async ({ page }) => {
  await open(page);
  await expect(items(page).first()).toHaveAttribute('open', '');
  // Heights of the open first question over the first frames after another is opened.
  const heights = await page.evaluate(async () => {
    const d = [...document.querySelectorAll('section.faq details')];
    const first = d[0] as HTMLElement;
    const out = [first.getBoundingClientRect().height];
    (d[3]!.querySelector('summary') as HTMLElement).click();
    for (let i = 0; i < 8; i++) {
      await new Promise((r) => requestAnimationFrame(r));
      out.push(first.getBoundingClientRect().height);
    }
    return out;
  });
  const [start, ...rest] = heights;
  const end = 40;
  // Some frame shows it part way, between open and closed.
  expect(rest.some((h) => h < start! - 1 && h > end + 1)).toBe(true);
  await expect(items(page).nth(3)).toHaveAttribute('open', '');
  await expect(items(page).first()).not.toHaveAttribute('open');
});

test('no accessibility violations, closed and open', async ({ page }) => {
  await open(page);
  await expect(items(page).last()).toHaveCSS('opacity', '1');
  const scan = () => new AxeBuilder({ page }).include('section.faq').analyze();
  expect((await scan()).violations).toEqual([]);
  await items(page).nth(2).locator('summary').click();
  await expect(items(page).nth(2)).toHaveAttribute('open', '');
  expect((await scan()).violations).toEqual([]);
});

test('on a phone the column fits and the page never scrolls sideways', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await open(page);
  const box = await sec(page).locator('.faq__list').boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(16);
  expect(box!.x + box!.width).toBeLessThanOrEqual(304);
  // Stacked: the questions under the heading.
  const head = (await sec(page).locator('.faq__head').boundingBox())!;
  expect(box!.y).toBeGreaterThan(head.y + head.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await expect(page.getByRole('heading', { level: 2, name: 'Some questions about Bland' })).toHaveCSS('font-size', '27px');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('everything fades in without moving', async ({ page }) => {
    await open(page);
    const name = await items(page).first().evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe('faq-fade');
    await expect(items(page).last()).toHaveCSS('opacity', '1');
  });
});
