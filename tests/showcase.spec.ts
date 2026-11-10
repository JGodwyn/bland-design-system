// The landing page's Components showcase (site/src/showcase/, Figma 7071:32494): nine real Bland components on a
// panel whose toolbar switches the brand (presets or any color, through the brand tool), light or dark, and the
// font, reaching the cards one after another (INTERFACE.md, "Landing page", Components showcase).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const sec = (page: Page) => page.locator('section.showcase');
const cards = (page: Page) => sec(page).locator('.showcase__card');
const CARD_ORDER = ['alert', 'calendar', 'button', 'input', 'segments', 'avatar', 'checkboxes', 'upload', 'chat'];

async function open(page: Page) {
  await page.goto(site);
  await sec(page).scrollIntoViewIfNeeded();
  await expect(sec(page)).toHaveAttribute('data-shown', 'true');
}

/** Each card's inline --brand-500 (what it has been told to show), and the panel's. */
const targets = (page: Page) =>
  sec(page).evaluate((s) => [...s.querySelectorAll<HTMLElement>('.showcase__panel, .showcase__card')].map((el) => el.style.getPropertyValue('--brand-500')));

test('the headline, nine cards in Figma order, the toolbar and the link to every component', async ({ page }) => {
  await open(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Components showcase' })).toBeVisible();
  await expect(cards(page)).toHaveCount(9);
  const order = await cards(page).evaluateAll((els) => els.map((el) => el.querySelector<HTMLElement>('.showcase__card-body')!.dataset.card));
  expect(order).toEqual(CARD_ORDER);
  await expect(sec(page).getByRole('radiogroup', { name: 'Brand color' }).getByRole('radio')).toHaveCount(9);
  await expect(sec(page).getByRole('button', { name: 'Any color' })).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(sec(page).getByRole('link', { name: 'Browse all components' })).toHaveAttribute('href', '/docs/#/components/button');
  // Every card has popped in.
  await expect(cards(page).last()).toHaveCSS('opacity', '1');
  // Figma's smoothed corners (.bland-smooth draws twice rad-lg), the Button hugs its label, the link has no underline.
  if (await page.evaluate(() => CSS.supports('corner-shape', 'superellipse(2)'))) await expect(cards(page).first()).toHaveCSS('border-radius', '32px');
  const button = await cards(page).nth(2).locator('.bland-button').boundingBox();
  const body = await cards(page).nth(2).locator('.showcase__card-body').boundingBox();
  expect(button!.width).toBeLessThan(body!.width / 2);
  await expect(sec(page).getByRole('link', { name: 'Browse all components' })).toHaveCSS('text-decoration-line', 'none');
});

test('a preset brand reaches the panel first, then each card in reading order', async ({ page }) => {
  await open(page);
  const before = await targets(page);
  expect(new Set(before).size).toBe(1);
  // Sample every frame: the frame each element first holds the new brand.
  const firstFrames = await sec(page).evaluate(async (s) => {
    const els = [...s.querySelectorAll<HTMLElement>('.showcase__panel, .showcase__card')];
    const start = els[0]!.style.getPropertyValue('--brand-500');
    const seen: number[] = els.map(() => -1);
    s.querySelector<HTMLInputElement>('input[aria-label="Pink"]')!.click();
    for (let f = 0; f < 120 && seen.includes(-1); f++) {
      await new Promise(requestAnimationFrame);
      els.forEach((el, i) => {
        if (seen[i] === -1 && el.style.getPropertyValue('--brand-500') !== start) seen[i] = performance.now();
      });
    }
    return seen;
  });
  expect(firstFrames).not.toContain(-1);
  for (let i = 1; i < firstFrames.length; i++) expect(firstFrames[i]).toBeGreaterThanOrEqual(firstFrames[i - 1]!);
  // A wave, not all at once (its length depends on the machine's load; DialKit's staggerMs sets it).
  expect(firstFrames.at(-1)!).toBeGreaterThan(firstFrames[0]!);
  // The brand reaches the components: the Button and the ticked Checkbox wear its color.
  const pink = await targets(page);
  expect(new Set(pink).size).toBe(1);
  await expect(cards(page).nth(2).locator('.bland-button')).not.toHaveCSS('background-color', 'rgb(0, 98, 255)');
});

test('"Any color" opens the docs color picker; a color goes through the brand tool and the ring follows', async ({ page }) => {
  await open(page);
  const any = sec(page).getByRole('button', { name: 'Any color' });
  await any.click();
  const picker = page.getByRole('dialog', { name: 'Pick a brand color' });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('slider', { name: 'Saturation and brightness' })).toBeVisible();
  await picker.getByLabel('HEX color').fill('#1a7f37');
  await expect.poll(async () => new Set(await targets(page)).size).toBe(1);
  const [step] = await targets(page);
  expect(step).not.toBe('#0062ff');
  // The panel holds all 26 steps the brand tool makes.
  const steps = await sec(page).locator('.showcase__panel').evaluate((el) => (el as HTMLElement).style.cssText.match(/--(brand|neutral)-\d+/g)?.length);
  expect(steps).toBe(26);
  const ring = sec(page).locator('.showcase__ring');
  await expect(ring).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 216, 0)');
  // At the strip's end the ring's outer corners round with it.
  await expect(ring).toHaveAttribute('data-edge', 'end');
  await page.keyboard.press('Escape');
  await expect(picker).toBeHidden();
  await expect(any).toHaveAccessibleName(/^Any color: #/);
});

test('the ring is white in dark too, and rounds at the strip\'s start', async ({ page }) => {
  await open(page);
  const ring = sec(page).locator('.showcase__ring');
  await expect(ring).not.toHaveAttribute('data-edge', /.+/);
  await sec(page).getByRole('radio', { name: 'Lime' }).check();
  await expect(ring).toHaveAttribute('data-edge', 'start');
  const white = await ring.evaluate((el) => getComputedStyle(el).borderTopColor);
  await sec(page).getByRole('button', { name: 'Dark theme' }).click();
  await expect(cards(page).last()).toHaveAttribute('data-theme', 'dark');
  await expect(ring).toHaveCSS('border-top-color', white);
  await sec(page).getByRole('radio', { name: 'Pink' }).check();
  await expect(ring).not.toHaveAttribute('data-edge', /.+/);
});

test('the switcher cycles three sets of nine working components, which pop in; every card keeps one height', async ({ page }) => {
  await open(page);
  const ids = () => cards(page).evaluateAll((els) => els.map((el) => el.querySelector<HTMLElement>('.showcase__card-body')!.dataset.card));
  const heights = () => cards(page).evaluateAll((els) => [...new Set(els.map((el) => (el as HTMLElement).offsetHeight))]);
  const panel = () => sec(page).locator('.showcase__panel').evaluate((el) => (el as HTMLElement).offsetHeight);
  const [height] = await heights();
  const panelHeight = await panel();
  expect(await heights()).toEqual([height]);
  // The switcher comes before the font button.
  const toolbar = await sec(page).locator('.showcase__toolbar button').evaluateAll((els) => els.slice(0, 2).map((el) => el.className));
  expect(toolbar[0]).toContain('showcase__round');
  expect(toolbar[1]).toContain('showcase__font');

  await sec(page).getByRole('button', { name: 'Components: set 1 of 3. Show set 2' }).click();
  await expect.poll(ids).toEqual(['toggle', 'slider', 'pills', 'search', 'pagination', 'tooltip', 'radios', 'code', 'accordion']);
  await expect(cards(page).first()).toHaveCSS('animation-name', 'showcase-pop');
  await expect(cards(page).last()).toHaveCSS('opacity', '1');
  const toggle = sec(page).getByRole('switch', { name: 'Notifications' });
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await sec(page).getByRole('radio', { name: 'Team' }).check();
  await expect(sec(page).getByRole('radio', { name: 'Team' })).toBeChecked();
  // An open Accordion grows inside its card: no card and not the panel change height.
  await sec(page).getByText('What is Bland?').click();
  await expect(sec(page).getByText(/A design system you make your own/)).toBeVisible();
  expect(await heights()).toEqual([height]);
  expect(await panel()).toBe(panelHeight);

  await sec(page).getByRole('button', { name: 'Components: set 2 of 3. Show set 3' }).click();
  await expect.poll(ids).toEqual(['dropdown', 'tabs', 'toast', 'progress', 'chips', 'badges', 'code-text', 'time', 'menu']);
  await sec(page).getByRole('tab', { name: 'Code' }).click();
  await expect(sec(page).getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true');
  await sec(page).getByRole('button', { name: 'Remove Tokens' }).click();
  await expect(sec(page).getByRole('button', { name: 'Remove Tokens' })).toHaveCount(0);
  await sec(page).getByRole('button', { name: 'Fill the bar' }).click();
  await expect(sec(page).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65');
  await sec(page).getByRole('button', { name: 'Show a toast' }).click();
  await expect(page.getByText('Saved. Toasts look like this.')).toBeVisible();
  await sec(page).getByRole('button', { name: 'Open a menu' }).click();
  await expect(page.getByRole('menuitem', { name: 'Duplicate' })).toBeVisible();
  await page.keyboard.press('Escape');
  // A brand still reaches them.
  await sec(page).getByRole('radio', { name: 'Mint' }).check();
  await expect.poll(async () => new Set(await targets(page)).size).toBe(1);
  expect(await heights()).toEqual([height]);
  expect(await panel()).toBe(panelHeight);

  await sec(page).getByRole('button', { name: 'Components: set 3 of 3. Show set 1' }).click();
  await expect.poll(ids).toEqual(CARD_ORDER);
});

test('the theme button turns the panel and every card dark, and back', async ({ page }) => {
  await open(page);
  const theme = sec(page).getByRole('button', { name: 'Dark theme' });
  await expect(theme).toHaveAttribute('aria-pressed', 'false');
  // Light and dark reach every card in the same frame, no wave (Godwin 2026-11-09).
  const together = await sec(page).evaluate(async (s) => {
    s.querySelector<HTMLButtonElement>('.showcase__theme')!.click();
    for (let f = 0; f < 60; f++) {
      await new Promise(requestAnimationFrame);
      const all = [...s.querySelectorAll<HTMLElement>('.showcase__panel, .showcase__card')].map((el) => el.dataset.theme);
      if (all.includes('dark')) return all.every((t) => t === 'dark');
    }
    return false;
  });
  expect(together).toBe(true);
  await expect(theme).toHaveAttribute('aria-pressed', 'true');
  await expect(sec(page).locator('.showcase__panel')).toHaveAttribute('data-theme', 'dark');
  await expect(cards(page).last()).toHaveAttribute('data-theme', 'dark');
  // The rest of the page stays as it was.
  await expect(sec(page)).not.toHaveAttribute('data-theme', 'dark');
  await theme.click();
  await expect(cards(page).last()).toHaveAttribute('data-theme', 'light');
});

test('the theme button pops, and the new theme grows out of it as a circle over the panel; keys switch at once', async ({ page }) => {
  await open(page);
  const theme = sec(page).getByRole('button', { name: 'Dark theme' });
  const reveal = await page.evaluate(async () => {
    if (!('startViewTransition' in document)) return 'unsupported';
    const button = document.querySelector<HTMLButtonElement>('.showcase__theme')!;
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    for (let f = 0; f < 60; f++) {
      await new Promise(requestAnimationFrame);
      const circle = document.getAnimations().find((a) => (a.effect as KeyframeEffect).pseudoElement === '::view-transition-new(showcase-panel)');
      if (circle) {
        const frames = (circle.effect as KeyframeEffect).getKeyframes();
        const pop = button.getAnimations().length > 0;
        return `${String(frames[0]!.clipPath).startsWith('circle(0px') && pop}`;
      }
    }
    return 'no reveal';
  });
  if (reveal !== 'unsupported') expect(reveal).toBe('true');
  await expect(theme).toHaveAttribute('aria-pressed', 'true');
  await expect(cards(page).last()).toHaveAttribute('data-theme', 'dark');
  // From the keyboard: no pop, no reveal, the theme switches in the same task.
  const revealing = () => page.evaluate(() => document.getAnimations().some((a) => String((a.effect as KeyframeEffect).pseudoElement).includes('showcase-panel')));
  await expect.poll(revealing).toBe(false);
  await theme.focus();
  await page.keyboard.press('Enter');
  await expect(theme).toHaveAttribute('aria-pressed', 'false');
  expect(await revealing()).toBe(false);
});

test('the font button cycles the preset fonts through the text styles, in light and dark', async ({ page }) => {
  await open(page);
  const font = sec(page).locator('.showcase__font');
  await expect(font).toHaveAccessibleName('Font: Inter. Switch to Geist');
  await sec(page).getByRole('button', { name: 'Dark theme' }).click();
  await font.click();
  await expect(font).toHaveAccessibleName('Font: Geist. Switch to DM Sans');
  // The Text Input's label, a Body text style, inside a dark card.
  await expect(cards(page).nth(3).locator('label').first()).toHaveCSS('font-family', /^Geist/);
  await font.click();
  await font.click();
  await font.click();
  await expect(font).toHaveAccessibleName(/^Font: Lora\./);
  await expect(cards(page).nth(6).locator('label').first()).toHaveCSS('font-family', /^Lora/);
});

test('every component works', async ({ page }) => {
  await open(page);
  // Alert: a press swaps its icon.
  await sec(page).getByRole('button', { name: 'Use the smiley icon' }).click();
  await expect(sec(page).getByRole('button', { name: 'Use the sticker icon' })).toBeVisible();
  // Button: a spinner for a moment.
  const button = sec(page).getByRole('button', { name: 'Click me' });
  await button.click();
  await expect(button).toHaveAttribute('aria-busy', 'true');
  await expect(button).not.toHaveAttribute('aria-busy', 'true', { timeout: 4000 });
  // Text Input, Segmented bar, Checkbox.
  await sec(page).getByLabel('Label').fill('Ship it');
  await expect(sec(page).getByLabel('Label')).toHaveValue('Ship it');
  await sec(page).getByRole('radio', { name: 'Tab' }).nth(2).check();
  await expect(sec(page).getByRole('radio', { name: 'Tab' }).nth(2)).toBeChecked();
  await sec(page).getByRole('checkbox').nth(1).check();
  await expect(sec(page).getByRole('checkbox').nth(1)).toBeChecked();
  // Avatar: status changes.
  await expect(sec(page).getByRole('img', { name: 'Jane Doe, Online' })).toBeVisible();
  await sec(page).getByRole('button', { name: 'Set status to Away' }).click();
  await expect(sec(page).getByRole('img', { name: 'Jane Doe, Away' })).toBeVisible();
  // Chat bubble: sent, delivered, seen.
  await sec(page).getByRole('button', { name: 'Mark as delivered' }).click();
  await expect(sec(page).getByRole('button', { name: 'Mark as seen' })).toBeVisible();
  // Calendar: a day can be picked.
  const day = sec(page).locator('.showcase__card').nth(1).getByRole('gridcell').filter({ hasText: /^15$/ }).getByRole('button');
  await day.click();
  await expect(sec(page).locator('.showcase__card').nth(1).locator('[aria-selected="true"]')).toHaveCount(1);
  // File upload: a picked file climbs to done, and nothing is sent.
  let requests = 0;
  page.on('request', (r) => {
    if (r.method() !== 'GET') requests++;
  });
  await sec(page).locator('input[type="file"]').setInputFiles({ name: 'logo.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(sec(page).getByText('logo.svg', { exact: true })).toBeVisible();
  await expect(sec(page).getByText('logo.svg uploaded')).toBeAttached({ timeout: 5000 });
  expect(requests).toBe(0);
});

test('keyboard: the toolbar is reachable and the swatches are one radio group', async ({ page }) => {
  await open(page);
  await sec(page).getByRole('radio', { name: 'Bland blue' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(sec(page).getByRole('radio', { name: 'Violet' })).toBeChecked();
  await expect.poll(async () => new Set(await targets(page)).size).toBe(1);
});

for (const theme of ['light', 'dark'] as const) {
  test(`no axe violations with the panel ${theme}, on every preset`, async ({ page }) => {
    // Nine presets, each settled and checked: longer than one test's default.
    test.setTimeout(120_000);
    await open(page);
    if (theme === 'dark') await sec(page).getByRole('button', { name: 'Dark theme' }).click();
    for (const brand of ['Bland blue', 'Lime', 'Green', 'Mint', 'Violet', 'Pink', 'Red', 'Orange', 'Amber']) {
      await sec(page).getByRole('radio', { name: brand }).check();
      // Let the wave and the colors settle.
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).include('section.showcase').analyze();
      expect(results.violations).toEqual([]);
    }
  });
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('cards fade in without the pop, and a change reaches every card at once', async ({ page }) => {
    await open(page);
    await expect(cards(page).first()).toHaveCSS('animation-name', 'showcase-fade');
    const sameFrame = await sec(page).evaluate(async (s) => {
      s.querySelector<HTMLInputElement>('input[aria-label="Mint"]')!.click();
      for (let f = 0; f < 30; f++) {
        await new Promise(requestAnimationFrame);
        const all = [...s.querySelectorAll<HTMLElement>('.showcase__panel, .showcase__card')].map((el) => el.style.getPropertyValue('--brand-500'));
        if (all[0] !== '#0062ff' && all[0] !== '') return new Set(all).size === 1;
      }
      return false;
    });
    expect(sameFrame).toBe(true);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 320, height: 720 }, hasTouch: true });

  test('one card a row, the toolbar above the cards, nothing runs off the screen', async ({ page }) => {
    await open(page);
    const toolbar = await sec(page).locator('.showcase__toolbar').boundingBox();
    const first = await cards(page).first().boundingBox();
    expect(toolbar!.y).toBeLessThan(first!.y);
    const columns = await sec(page).locator('.showcase__cards').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });
});
