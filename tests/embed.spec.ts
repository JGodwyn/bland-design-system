// The showcase embed (site/embed/showcase/, the Bland case study on godwinjohn.com frames it): the landing page's
// showcase as one sideways row of every card, no title and no set switcher, light whatever the system says, and a
// height and ready message to the page that frames it. Contract in the portfolio's AGENTS.md, "The Bland showcase embed".
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const embed = 'http://localhost:5182/embed/showcase/';
const section = (page: Page) => page.locator('section.showcase');

type Msg = { type: string; height?: number };

/** A parent page that frames the embed and keeps every message it posts. */
async function framed(page: Page) {
  await page.goto('http://localhost:5182/');
  await page.setContent(
    `<!doctype html><body style="margin:0"><iframe id="f" src="${embed}" style="width:1024px;height:600px;border:0"></iframe>
     <script>window.msgs = []; addEventListener('message', (e) => window.msgs.push(e.data));</script></body>`,
  );
  return page.frameLocator('#f');
}

const msgs = (page: Page) => page.evaluate(() => (window as unknown as { msgs: Msg[] }).msgs);

test('row layout, no title, no set switcher, 27 cards', async ({ page }) => {
  await page.goto(embed);
  await expect(section(page)).toHaveAttribute('data-layout', 'row');
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Components: set/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Browse all components' })).toHaveCount(0);
  await expect(page.locator('.showcase__card')).toHaveCount(27);
});

test('cards scroll sideways, never inside', async ({ page }) => {
  await page.goto(embed);
  const row = page.locator('.showcase__cards');
  const { scroll, client } = await row.evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
  expect(scroll).toBeGreaterThan(client);
  // No card scrolls inside itself (a component may keep its own scroll area, like the chat bar's; the card does not).
  await expect(page.locator('.showcase__card-scroll')).toHaveCount(0);
  const clipped = await page.locator('.showcase__card').evaluateAll((all) => all.filter((el) => el.scrollHeight > el.clientHeight + 1).length);
  expect(clipped).toBe(0);
  // The page itself never scrolls sideways.
  const pageWide = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(pageWide).toBe(false);
});

test('starts light under a dark system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(embed);
  await expect(section(page)).toHaveAttribute('data-layout', 'row');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.showcase__panel')).toHaveAttribute('data-theme', 'light');
});

test('?theme=dark starts dark', async ({ page }) => {
  await page.goto(`${embed}?theme=dark`);
  await expect(page.locator('.showcase__panel')).toHaveAttribute('data-theme', 'dark');
});

test('is not for search engines', async ({ page }) => {
  await page.goto(embed);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('posts its height and ready to the parent', async ({ page }) => {
  await framed(page);
  await expect.poll(async () => (await msgs(page)).some((m) => m.type === 'bland:ready'), { timeout: 10_000 }).toBe(true);
  await expect
    .poll(async () => (await msgs(page)).filter((m) => m.type === 'bland:height').at(-1)?.height ?? 0, { timeout: 10_000 })
    .toBeGreaterThan(200);
});

test('the height is the content\'s, not the frame\'s', async ({ page }) => {
  // A frame far taller than the showcase: the reported height must still be the showcase's, or a frame could only
  // ever grow (a document is never shorter than its viewport).
  await page.goto('http://localhost:5182/');
  await page.setContent(
    `<!doctype html><body style="margin:0"><iframe id="f" src="${embed}" style="width:1024px;height:1200px;border:0"></iframe>
     <script>window.msgs = []; addEventListener('message', (e) => window.msgs.push(e.data));</script></body>`,
  );
  const content = await page
    .frameLocator('#f')
    .locator('.showcase__panel')
    .evaluate((el) => el.getBoundingClientRect().bottom);
  await expect
    .poll(async () => (await msgs(page)).filter((m) => m.type === 'bland:height').at(-1)?.height ?? 0, { timeout: 10_000 })
    .toBeLessThan(content + 64);
});

test('the height follows an open colour picker', async ({ page }) => {
  const frame = await framed(page);
  await expect.poll(async () => (await msgs(page)).some((m) => m.type === 'bland:ready'), { timeout: 10_000 }).toBe(true);
  await frame.getByRole('button', { name: /^Any color/ }).click();
  const picker = frame.getByRole('dialog', { name: 'Pick a brand color' });
  await expect(picker).toBeVisible();
  const bottom = await picker.evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
  await expect
    .poll(async () => (await msgs(page)).filter((m) => m.type === 'bland:height').at(-1)?.height ?? 0)
    .toBeGreaterThanOrEqual(Math.floor(bottom));
});

test('no axe violations', async ({ page }) => {
  await page.goto(embed);
  await expect(section(page)).toHaveAttribute('data-shown', 'true');
  // Let the cards' pop-in finish: mid-animation, a card's text is checked against a half-faded ground.
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
  // The showcase only, as the landing page's own axe test does: the page around it is a frame's shell.
  const results = await new AxeBuilder({ page }).include('section.showcase').analyze();
  expect(results.violations).toEqual([]);
});
