// The landing page's Brand theme section (site/src/brand/, Figma 7066:28878): a three-step stepper that follows
// the scroll from breakpoint/md (pick, check, copy), each step with its own Stageshow picture, and on a phone
// steps that advance on their own (INTERFACE.md, "Landing page", Brand theme).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const sec = (page: Page) => page.locator('section.brand-sec');
const STEPS = [
  'Pick your color. Any hex. It never moves.',
  'See every pairing in light and dark, and fix the ones that fail.',
  'Copy the CSS. One file, loaded last. Done.',
];

/** Scrolls to the middle of step `i`'s share of the track and waits for it to be the current step. */
async function goTo(page: Page, i: number) {
  await sec(page).evaluate((el, k) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * (k + 0.5)) / 3);
  }, i);
  await expect(sec(page).getByRole('button', { name: STEPS[i] })).toHaveAttribute('aria-current', 'step');
}
const picture = (page: Page, i: number) => sec(page).locator('.brand-sec__picture').nth(i);

test('the tag names the section; the three steps are a list in order', async ({ page }) => {
  await page.goto(site);
  await expect(sec(page)).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('heading', { level: 2, name: 'One color in. A whole theme out.' })).toBeVisible();
  await expect(sec(page).locator('.brand-sec__step [data-layer="big"]')).toHaveText(STEPS);
  await expect(sec(page).getByRole('button', { name: 'Open Brand theme' })).toBeVisible();
});

test('scrolling down moves through the steps; the current one is the headline', async ({ page }) => {
  await page.goto(site);
  for (const i of [0, 1, 2]) {
    await goTo(page, i);
    await expect(picture(page, i)).toHaveAttribute('data-current', 'true');
    // The current step shows its headline (Figma's 43px) in its place; the others their small line.
    const step = sec(page).locator('.brand-sec__step').nth(i);
    await expect(step.locator('[data-layer="big"]')).toHaveCSS('visibility', 'visible');
    await expect(step.locator('[data-layer="big"]')).toHaveCSS('font-size', '43px');
    await expect(step.locator('[data-layer="small"]')).toHaveCSS('visibility', 'hidden');
  }
  await expect(sec(page).locator('.brand-sec__step').first().locator('[data-layer="small"]')).toHaveCSS('visibility', 'visible');
});

test('a step rolls into the headline in its place: the line goes at once, the headline rises, nothing scales', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  await page.waitForTimeout(900);
  const trace = await sec(page).evaluate(async (el) => {
    const step = el.querySelectorAll<HTMLElement>('.brand-sec__step')[1]!;
    const big = step.querySelector<HTMLElement>('[data-layer="big"]')!;
    const small = step.querySelector<HTMLElement>('[data-layer="small"]')!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * 1.5) / 3);
    const heights: number[] = [];
    const sizes = new Set<string>();
    let bigFromBelow = false;
    let bothShown = false;
    const t0 = performance.now();
    while (performance.now() - t0 < 800) {
      await new Promise(requestAnimationFrame);
      heights.push(step.getBoundingClientRect().height);
      const yb = new DOMMatrix(getComputedStyle(big).transform).m42;
      const ys = new DOMMatrix(getComputedStyle(small).transform).m42;
      if (yb > 1) bigFromBelow = true;
      if (getComputedStyle(small).visibility === 'visible' && getComputedStyle(big).visibility === 'visible') bothShown = true;
      void ys;
      sizes.add(`${getComputedStyle(big).fontSize} ${getComputedStyle(small).fontSize}`);
      if (new DOMMatrix(getComputedStyle(big).transform).a !== 1) sizes.add('scaled');
    }
    return { heights, bigFromBelow, bothShown, sizes: [...sizes] };
  });
  for (let k = 1; k < trace.heights.length; k++) expect(trace.heights[k]!).toBeGreaterThanOrEqual(trace.heights[k - 1]! - 0.5);
  expect(trace.heights.at(-1)!).toBeGreaterThan(trace.heights[0]! + 20);
  expect(trace.bigFromBelow).toBe(true);
  // The old line never stays beside the arriving headline.
  expect(trace.bothShown).toBe(false);
  expect(trace.sizes).toEqual(['43px 16px']);
});

test("the current step's underline fills with the scroll through it", async ({ page }) => {
  await page.goto(site);
  for (const [at, expected] of [
    [1.25, 0.25],
    [1.75, 0.75],
  ] as const) {
    await sec(page).evaluate((el, a) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = (el as HTMLElement).offsetHeight - window.innerHeight;
      window.scrollTo(0, top + (span * a) / 3);
    }, at);
    await expect
      .poll(() => sec(page).locator('.brand-sec__item').nth(1).evaluate((li) => Number(getComputedStyle(li).getPropertyValue('--fill'))))
      .toBeCloseTo(expected, 2);
    expect(await sec(page).locator('.brand-sec__item').nth(0).evaluate((li) => Number(getComputedStyle(li).getPropertyValue('--fill')))).toBe(0);
  }
});

test('the picture card is tinted with the brand it shows', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const pick = picture(page, 0).locator('.pick-pic');
  await expect(pick).toHaveAttribute('data-brand', 'pink', { timeout: 6000 });
  // Surface/surface-brand-light is step 50 of the scale it shows (#fef0f3 for #e11d74).
  await expect(pick).toHaveCSS('background-color', 'rgb(254, 240, 243)');
});

test('pressing a step scrolls to it', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  await sec(page).getByRole('button', { name: STEPS[2] }).click();
  await expect(sec(page).getByRole('button', { name: STEPS[2] })).toHaveAttribute('aria-current', 'step', { timeout: 5000 });
});

test('the pick picture types #e11d74 and Bland roles follow its steps', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const pick = picture(page, 0).locator('.pick-pic');
  await expect(pick).toHaveAttribute('data-brand', 'pink', { timeout: 6000 });
  await expect(pick.locator('input')).toHaveValue('#e11d74');
  // Surface/surface-brand is step 600 of the generated scale (#c70063).
  await expect(pick.locator('.pick-pic__swatch')).toHaveCSS('background-color', 'rgb(199, 0, 99)');
});

test('the check picture fixes the failing pairing: 2.85:1 becomes 3.00:1', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  const check = picture(page, 1).locator('.check-pic');
  await expect(check.locator('.check-pic__row[data-failing]')).toContainText('2.85:1');
  await expect(check).toHaveAttribute('data-step', '2', { timeout: 5000 });
  await expect(check.locator('.check-pic__row').last().locator('.features-roll__value:not([data-roll="out"])')).toHaveText('3.00:1');
  // The fixed step 400 is the tool's suggestion, on the dark progress fill.
  await expect(check.locator('.check-pic__row').last().locator('.bland-progress-bar__fill')).toHaveCSS(
    'background-color',
    'rgb(241, 102, 148)',
  );
});

test('the copy picture holds the real brand.css and its toggle works', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  const copy = picture(page, 2).locator('.copy-pic');
  await expect(copy.locator('code')).toContainText('--brand-500: #e11d74;');
  await expect(copy.locator('code')).toContainText('--brand-400: #f16694;');
  await copy.hover();
  const toggle = copy.getByRole('switch', { name: 'brand.css' });
  const before = await toggle.isChecked();
  await toggle.click();
  await expect(toggle).toBeChecked({ checked: !before });
  if (before) await expect(copy).not.toHaveAttribute('data-loaded', 'true');
  else await expect(copy).toHaveAttribute('data-loaded', 'true');
});

for (const theme of ['light', 'dark'] as const) {
  test(`no axe violations on any step (${theme} system)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(site);
    for (const i of [0, 1, 2]) {
      await goTo(page, i);
      // Pause the picture (hover) and let what was moving finish.
      await sec(page).locator('.brand-sec__card').hover();
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).include('section.brand-sec').analyze();
      expect(results.violations).toEqual([]);
    }
  });
}

test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('each step shows its poster at once', async ({ page }) => {
    await page.goto(site);
    await goTo(page, 0);
    await expect(picture(page, 0).locator('.pick-pic')).toHaveAttribute('data-brand', 'pink');
    await goTo(page, 1);
    await expect(picture(page, 1).locator('.check-pic')).toHaveAttribute('data-step', '2');
    await page.waitForTimeout(2500);
    await expect(picture(page, 1).locator('.check-pic')).toHaveAttribute('data-step', '2');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the section scrolls normally, fits, and the steps advance on their own', async ({ page }) => {
    await page.goto(site);
    await sec(page).evaluate((el) => el.scrollIntoView({ block: 'center' }));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await expect(sec(page).locator('.brand-sec__stage')).toHaveCSS('position', 'static');
    await expect(sec(page).getByRole('button', { name: STEPS[1] })).toHaveAttribute('aria-current', 'step', { timeout: 8000 });
    // A tap picks a step.
    await sec(page).getByRole('button', { name: STEPS[0] }).tap();
    await expect(sec(page).getByRole('button', { name: STEPS[0] })).toHaveAttribute('aria-current', 'step');
  });
});

test("the current step's underline is brand blue", async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  // Border/border-brand: Bland's blue step 600.
  await expect(sec(page).locator('.brand-sec__fill').first()).toHaveCSS('background-color', 'rgb(0, 98, 255)');
});

test('the note under the picture is as wide as the picture, and the steps keep clear of it', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const cardBox = (await sec(page).locator('.brand-sec__card').boundingBox())!;
  const note = (await sec(page).locator('.brand-sec__note').boundingBox())!;
  expect(Math.round(note.width)).toBe(Math.round(cardBox.width));
  const copy = (await sec(page).locator('.brand-sec__steps').boundingBox())!;
  // At least space-3xl (40) between the steps and the picture.
  expect(cardBox.x - (copy.x + copy.width)).toBeGreaterThanOrEqual(40);
});
