// The landing page's Figma kit section (site/src/figma-kit/, Figma 7078:34292): Figma's copy and checklist beside a
// simplified Bland Figma file whose three-beat story (a variable changes the brand, the frame turns dark, a variant
// selected shows its names in code) lights the checklist row of its beat (INTERFACE.md, "Landing page", Figma kit).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const sec = (page: Page) => page.locator('section.fk');
const pic = (page: Page) => sec(page).locator('.fk-pic');
const rows = (page: Page) => sec(page).locator('.fk__item');

async function open(page: Page) {
  await page.goto(site);
  await sec(page).scrollIntoViewIfNeeded();
  await expect(sec(page)).toHaveAttribute('data-shown', 'true');
}

/** Which checklist rows are lit. */
const lit = (page: Page) => rows(page).evaluateAll((els) => els.map((el) => el.hasAttribute('data-lit')));

test('Figma copy, the link to the kit and the checklist; the picture is decorative', async ({ page }) => {
  await open(page);
  await expect(sec(page)).toHaveAttribute('data-theme', 'light');
  await expect(sec(page).getByText('Figma kit', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'The whole system, in Figma.' })).toBeVisible();
  const link = sec(page).getByRole('link', { name: 'Get the Figma kit' });
  await expect(link).toHaveAttribute('href', /figma\.com/);
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveCSS('text-decoration-line', 'none');
  await expect(sec(page).getByRole('list', { name: 'In the Figma kit' }).getByRole('listitem')).toHaveText([
    'Variables for every token',
    'Same names as the code',
    'Light and dark modes',
  ]);
  await expect(pic(page)).toHaveAttribute('aria-hidden', 'true');
  // Everything has come in.
  await expect(sec(page).locator('.fk__visual')).toHaveCSS('opacity', '1');
  await expect(sec(page).locator('.fk__word').last()).toHaveCSS('opacity', '1');
});

test('each beat lights its checklist row and changes the file', async ({ page }) => {
  test.setTimeout(60_000);
  await open(page);
  const canvas = pic(page).locator('.fk-pic__canvas');
  const frame = pic(page).locator('.fk-pic__frame');

  await expect(pic(page)).toHaveAttribute('data-step', '0', { timeout: 15_000 });
  const pinkBefore = await canvas.evaluate((el) => el.classList.contains('brand-pink'));

  // 1. The variable changes: the brand flips and only the first row is lit.
  await expect(pic(page)).toHaveAttribute('data-step', '3', { timeout: 15_000 });
  expect(await canvas.evaluate((el) => el.classList.contains('brand-pink'))).toBe(!pinkBefore);
  expect(await lit(page)).toEqual([true, false, false]);
  await expect(frame).toHaveAttribute('data-theme', 'light');
  // The lit row's blue progress line, the theme section's, is the only one.
  await expect(sec(page).locator('.fk__fill')).toHaveCount(1);
  const [fill, brand] = await rows(page)
    .nth(0)
    .locator('.fk__fill')
    .evaluate((el) => {
      const probe = document.createElement('span');
      probe.style.color = 'var(--border-brand)';
      el.parentElement!.append(probe);
      const out = [getComputedStyle(el).backgroundColor, getComputedStyle(probe).color];
      probe.remove();
      return out;
    });
  expect(fill).toBe(brand);

  // 2. The variant is selected: its layer row, the button's outline and the dark code card with the same names.
  await expect(pic(page)).toHaveAttribute('data-step', '6', { timeout: 15_000 });
  expect(await lit(page)).toEqual([false, true, false]);
  await expect(pic(page)).toHaveAttribute('data-theme', 'light');
  const variant = pic(page).locator('.fk-pic__variant[data-selected]');
  await expect(variant).toHaveCount(1);
  await expect(variant).toHaveText('Size=md, Emotion=brand, Type=primary, State=rest');
  const code = pic(page).locator('.fk-pic__code');
  await expect(code).toHaveAttribute('data-shown', 'true');
  await expect(code).toHaveAttribute('data-theme', 'dark');
  await expect(code).toHaveText('<Button size="md" emotion="brand" type="primary">');

  // 3. Dark: the whole file turns dark, panel, canvas and frame; the selection stays.
  await expect(pic(page)).toHaveAttribute('data-step', '9', { timeout: 15_000 });
  expect(await lit(page)).toEqual([false, false, true]);
  await expect(pic(page)).toHaveAttribute('data-theme', 'dark');
  await expect(canvas).toHaveAttribute('data-theme', 'dark');
  await expect(frame).toHaveAttribute('data-theme', 'dark');
  await expect(code).toHaveAttribute('data-shown', 'true');

  // The reset has its cause: Light is pressed (step 11), the frame is light again and the card leaves.
  await expect(pic(page)).toHaveAttribute('data-step', '0', { timeout: 15_000 });
  await expect(pic(page)).toHaveAttribute('data-theme', 'light');
  await expect(code).not.toHaveAttribute('data-shown', 'true');
});

test('the cursor glides to what it presses', async ({ page }) => {
  test.setTimeout(30_000);
  await open(page);
  // The press (step 2) is too short to poll for; the cursor stays on the swatch through step 3.
  await expect(pic(page)).toHaveAttribute('data-step', '3', { timeout: 15_000 });
  await page.waitForTimeout(300);
  const cursor = await pic(page).locator('.fk-pic__cursor').boundingBox();
  const swatch = await pic(page).locator('[data-target="swatch"]').boundingBox();
  // The arrow's tip (its box's top left, less the tip offset) is inside the swatch.
  expect(cursor!.x).toBeGreaterThan(swatch!.x - 8);
  expect(cursor!.x).toBeLessThan(swatch!.x + swatch!.width);
  expect(cursor!.y).toBeGreaterThan(swatch!.y - 8);
  expect(cursor!.y).toBeLessThan(swatch!.y + swatch!.height);
});

test('the story pauses under a mouse', async ({ page }) => {
  test.setTimeout(30_000);
  await open(page);
  await expect(pic(page)).toHaveAttribute('data-step', '1', { timeout: 15_000 });
  await sec(page).locator('.fk__visual').hover();
  const held = await pic(page).getAttribute('data-step');
  await page.waitForTimeout(3000);
  await expect(pic(page)).toHaveAttribute('data-step', held!);
  await expect(sec(page).locator('.fk__fill')).toHaveCSS('animation-play-state', 'paused');
  await page.mouse.move(0, 0);
  await expect(pic(page)).not.toHaveAttribute('data-step', held!, { timeout: 5000 });
});

test('the picture does not pop: its card fades in and its parts follow one after another', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  await expect(sec(page).locator('.fk__visual')).toHaveCSS('animation-name', 'fk-fade');
  const delays = await pic(page).evaluate((el) =>
    ['.fk-pic__panel', '.fk-pic__mode', '.fk-pic__set-box', '.fk-pic__vars'].map((s) =>
      parseFloat(getComputedStyle(el.querySelector(s)!).animationDelay),
    ),
  );
  expect([...delays].sort((a, b) => a - b)).toEqual(delays);
  expect(new Set(delays).size).toBe(4);
  // The buttons come after the parts, in a wave.
  const [first, last] = await pic(page)
    .locator('.fk-pic__button')
    .evaluateAll((els) => [els[0], els.at(-1)].map((el) => parseFloat(getComputedStyle(el!).animationDelay)));
  expect(first).toBeGreaterThanOrEqual(delays[3]!);
  expect(last).toBeGreaterThan(first!);
});

test('reduced motion: the poster, no cursor, every row lit', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await expect(pic(page)).toHaveAttribute('data-step', '9');
  await expect(pic(page).locator('.fk-pic__cursor')).toHaveCount(0);
  await expect(pic(page).locator('.fk-pic__code')).toHaveAttribute('data-shown', 'true');
  expect(await lit(page)).toEqual([true, true, true]);
  await expect(sec(page).locator('.fk__fill')).toHaveCount(0);
  await page.waitForTimeout(2500);
  await expect(pic(page)).toHaveAttribute('data-step', '9');
});

test('on a phone: stacked, no sideways scroll, the compact file', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await expect(pic(page).locator('.fk-pic__panel')).toBeHidden();
  await expect(pic(page).locator('.fk-pic__button[data-type="stroke"]').first()).toBeHidden();
  const box = await pic(page).boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  // The copy's head comes before the picture, the checklist it cycles through after it (Godwin 2026-11-09).
  const head = await sec(page).locator('.fk__head').boundingBox();
  const list = await rows(page).first().boundingBox();
  expect(box!.y).toBeGreaterThan(head!.y + head!.height);
  expect(list!.y).toBeGreaterThan(box!.y + box!.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('the panel lists the file\'s pages, scrolled to Buttons, and the set\'s layers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  const pages = pic(page).locator('.fk-pic__pages');
  await expect(pages.locator('.fk-pic__page')).toHaveCount(29);
  const current = pages.locator('[data-current]');
  await expect(current).toHaveText(/^\s*•\s+Buttons$/);
  const list = (await pages.boundingBox())!;
  const row = (await current.boundingBox())!;
  expect(row.y).toBeGreaterThan(list.y);
  expect(row.y + row.height).toBeLessThan(list.y + list.height);
  await expect(pic(page).locator('.fk-pic__variant')).toHaveCount(12);
  // Every button of the set is a real Bland Button: 4 emotions x 4 sizes x 4 types.
  await expect(pic(page).locator('.fk-pic__frame .bland-button')).toHaveCount(64);
});

test('desktop: Figma columns, the checklist level with the picture foot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page);
  // Measured once the pop has settled.
  await expect(sec(page).locator('.fk__visual')).toHaveCSS('opacity', '1');
  await page.waitForTimeout(400);
  const picture = (await pic(page).boundingBox())!;
  const copy = (await sec(page).locator('.fk__copy').boundingBox())!;
  const last = (await rows(page).last().boundingBox())!;
  // Figma: copy at 296 (416 wide), picture at 728 (760 wide, past the right edge).
  expect(Math.round(copy.x)).toBe(296);
  expect(Math.round(picture.x)).toBe(728);
  expect(Math.round(picture.width)).toBe(760);
  expect(Math.abs(last.y + last.height - (picture.y + picture.height))).toBeLessThanOrEqual(2);
  // The Mode switch stays on screen (only filler runs off the edge).
  const mode = (await pic(page).locator('.fk-pic__mode').boundingBox())!;
  expect(mode.x + mode.width).toBeLessThanOrEqual(1440);
  // The Variables card sits on the canvas's right, its gap kept from the page's edge, not the picture's.
  const vars = (await pic(page).locator('.fk-pic__vars').boundingBox())!;
  expect(Math.round(1440 - (vars.x + vars.width))).toBe(16);
  const panel = (await pic(page).locator('.fk-pic__panel').boundingBox())!;
  expect(vars.x - (panel.x + panel.width)).toBeGreaterThan(100);
});

test('no axe violations in the section', async ({ page }) => {
  await open(page);
  await expect(sec(page).locator('.fk__visual')).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page }).include('section.fk').analyze();
  expect(results.violations).toEqual([]);
});
