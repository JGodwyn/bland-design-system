// The landing page's "What you get" section (site/src/what-you-get/, Figma 7066:29609 and its five states): six
// slides on a tall track as the feature row's (the slide follows the scroll and the page settles on the nearest), the
// text moving as the hero description does and the components appearing one after another and the drawn icons popping in as the hero's icons do (INTERFACE.md, "Landing
// page", What you get).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const sec = (page: Page) => page.locator('section.wyg');
const SLIDES = ['parts', 'dark', 'motion', 'everyone', 'tokens', 'icons'];
const FIRST_WORDS = ['Every part', 'Dark mode', 'Motion with', 'Works for', 'Nothing hardcoded', 'Your icons'];

/** Scrolls the page to slide `i`'s place in the track (k / 5 of it) and waits for that slide's parts. */
async function goTo(page: Page, i: number) {
  await sec(page).evaluate((el, k) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * k) / 5);
  }, i);
  // A phone has two clusters (the parts above the sentence and under it), both of the same slide.
  await expect(sec(page).locator('.wyg__layer--parts:not([data-leaving])').first()).toHaveAttribute('data-slide', SLIDES[i]!);
}

/** Where the page is in the track, in slides (0 to 5). */
const place = (page: Page) =>
  sec(page).evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    return ((window.scrollY - top) / span) * 5;
  });

test('the tag names the section; every sentence is there for screen readers', async ({ page }) => {
  await page.goto(site);
  await expect(page.getByRole('heading', { level: 2, name: 'What you get' })).toBeAttached();
  await expect(sec(page)).toHaveAttribute('data-layout', 'stage');
  const hidden = sec(page).locator('.wyg__hidden li');
  await expect(hidden).toHaveCount(6);
  for (const [k, words] of FIRST_WORDS.entries()) await expect(hidden.nth(k)).toContainText(words);
  // The animated copy and the parts are hidden from screen readers and out of the Tab order.
  await expect(sec(page).locator('.wyg__sentences')).toHaveAttribute('aria-hidden', 'true');
  await expect(sec(page).locator('.wyg__parts')).toHaveAttribute('inert', '');
});

test('scrolling down moves through the six slides; "Dark mode that thinks" turns the stage dark', async ({ page }) => {
  await page.goto(site);
  for (const [i, id] of SLIDES.entries()) {
    await goTo(page, i);
    await expect(sec(page).locator('.wyg__layer:not([data-leaving]) .wyg__sentence')).toContainText(FIRST_WORDS[i]!);
    await expect(sec(page).locator('.wyg__stage')).toHaveAttribute('data-theme', id === 'dark' ? 'dark' : 'light');
  }
  // What left is gone once its exit has played.
  await expect(sec(page).locator('[data-leaving]')).toHaveCount(0);
});

test("the parts sit at Figma's place and tilt on the 1440 frame", async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const modal = sec(page).locator('[data-part="modal"]');
  await expect(modal).toHaveCSS('left', '1013px');
  await expect(modal).toHaveCSS('top', '259px');
  await expect(modal).toHaveCSS('rotate', '10deg');
  // The frame is scaled to fit the screen (1024 x 768 here, so the width decides: 1024 / 1440).
  const scale = Number(await sec(page).locator('.wyg__frame').evaluate((f) => getComputedStyle(f).scale));
  expect(scale).toBeCloseTo(1024 / 1440, 3);
});

test('the words are text-bold from the start: no gray-to-black wash', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  await page.waitForTimeout(1500);
  const colors = await sec(page)
    .locator('.wyg__layer:not([data-leaving]) .wyg__word')
    .evaluateAll((words) => [...new Set(words.map((w) => getComputedStyle(w).color))]);
  // Text/text-bold in light, black.
  expect(colors).toEqual(['rgb(0, 0, 0)']);
});

/** The slide on screen. */
const current = (page: Page) => sec(page).locator('.wyg__layer--parts:not([data-leaving])').getAttribute('data-slide');

test('stopped between two slides, the page glides to the nearest: never left between them', async ({ page }) => {
  // Godwin 2026-11-09: the feature row's model.
  await page.goto(site);
  await sec(page).evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * 2.3) / 5);
  });
  await expect.poll(() => place(page), { timeout: 4000 }).toBeCloseTo(2, 2);
  expect(await current(page)).toBe('motion');
  await sec(page).evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * 2.7) / 5);
  });
  await expect.poll(() => place(page), { timeout: 4000 }).toBeCloseTo(3, 2);
  expect(await current(page)).toBe('everyone');
});

test('a fast flick from above stops inside the track, on a whole slide: the section is not skipped', async ({ page }) => {
  await page.goto(site);
  // Just above the section, then a long, fast wheel flick (about three screens).
  await sec(page).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2));
  await page.mouse.move(500, 380);
  for (let k = 0; k < 12; k++) await page.mouse.wheel(0, 200);
  await expect.poll(async () => { const p = await place(page); return Math.abs(p - Math.round(p)); }, { timeout: 5000 }).toBeLessThan(0.01);
  const p = await place(page);
  expect(p).toBeGreaterThan(0.5);
  expect(p).toBeLessThan(5.01);
});

test('the dark slide\'s words are white', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  await page.waitForTimeout(2200);
  const colors = await sec(page)
    .locator('.wyg__layer:not([data-leaving]) .wyg__word')
    .evaluateAll((words) => [...new Set(words.map((w) => getComputedStyle(w).color))]);
  expect(colors).toEqual(['rgb(255, 255, 255)']);
});

test('the Segmented bar\'s thumb sits on its tab though the bar is turned', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  await page.waitForTimeout(2600);
  const fit = await sec(page)
    .locator('.bland-segmented-bar')
    .evaluate((bar) => {
      const thumb = bar.querySelector<HTMLElement>('.bland-segmented-bar__thumb')!;
      const tab = bar.querySelector<HTMLElement>('[data-selected]')!;
      return {
        x: parseFloat(thumb.style.getPropertyValue('--_ind-x')) - tab.offsetLeft,
        y: parseFloat(thumb.style.getPropertyValue('--_ind-y')) - tab.offsetTop,
        w: parseFloat(thumb.style.getPropertyValue('--_ind-w')) - tab.offsetWidth,
      };
    });
  expect(fit).toEqual({ x: 0, y: 0, w: 0 });
});

test('Page Down moves a slide at a time', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 3);
  await page.waitForTimeout(500);
  await page.keyboard.press('PageDown');
  await expect.poll(() => current(page)).toBe('tokens');
  await expect.poll(() => place(page), { timeout: 4000 }).toBeCloseTo(4, 2);
});

test("a new slide's words rise in one after another and its components appear one after another, unscaled", async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  await page.waitForTimeout(1500);
  const trace = await sec(page).evaluate(async (el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + span / 5);
    let risen = false;
    let staggered = false;
    let moved = false;
    let partsStaggered = false;
    let scaled = false;
    const t0 = performance.now();
    while (performance.now() - t0 < 900) {
      await new Promise(requestAnimationFrame);
      const layer = el.querySelector('.wyg__sentences .wyg__layer:not([data-leaving])');
      const words = [...(layer?.querySelectorAll<HTMLElement>('.wyg__word') ?? [])];
      const ys = words.map((w) => new DOMMatrix(getComputedStyle(w).transform).m42 || parseFloat(getComputedStyle(w).translate.split(' ')[1] ?? '0'));
      if (ys.some((y) => y > 1)) risen = true;
      if (ys.length > 2 && ys.at(-1)! > ys[0]! + 1) staggered = true;
      const parts = [...el.querySelectorAll<HTMLElement>('.wyg__layer--parts:not([data-leaving]) .wyg__part')];
      const lifts = parts.map((p) => new DOMMatrix(getComputedStyle(p).transform).m42);
      if (lifts.some((y) => y > 1)) moved = true;
      if (lifts.length > 2 && lifts.at(-1)! > lifts[0]! + 1) partsStaggered = true;
      if (parts.some((p) => parseFloat(getComputedStyle(p).scale) < 0.999)) scaled = true;
    }
    return { risen, staggered, moved, partsStaggered, scaled };
  });
  expect(trace).toEqual({ risen: true, staggered: true, moved: true, partsStaggered: true, scaled: false });
});

test('the drawn icons still pop in', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  await page.waitForTimeout(1500);
  const popped = await sec(page).evaluate(async (el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * 3.5) / 6);
    const t0 = performance.now();
    while (performance.now() - t0 < 900) {
      await new Promise(requestAnimationFrame);
      const part = el.querySelector<HTMLElement>('.wyg__layer--parts:not([data-leaving]) .wyg__part[data-vector]');
      if (part && parseFloat(getComputedStyle(part).scale) < 0.95) return true;
    }
    return false;
  });
  expect(popped).toBe(true);
});

test('the parts are real Bland components and vectors, no images', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  await expect(sec(page).locator('[data-part="field"] .bland-text-input input, [data-part="field"] input')).toHaveCount(1);
  await expect(sec(page).locator('[data-part="button"] .bland-button')).toHaveText('Click me');
  await goTo(page, 3);
  await expect(sec(page).locator('[data-part="figure"] svg')).toBeVisible();
  await expect(sec(page).locator('[data-part="eye"] svg')).toBeVisible();
  // Icon/icon-brand, Bland's blue.
  await expect(sec(page).locator('[data-part="figure"]')).toHaveCSS('color', 'rgb(0, 98, 255)');
  await goTo(page, 5);
  await expect(sec(page).locator('.wyg-grid__line')).not.toHaveCount(0);
  await expect(sec(page).locator('img')).toHaveCount(0);
});

test('the icon grid draws itself', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 5);
  const first = sec(page).locator('.wyg-grid__line').first();
  await expect.poll(() => first.evaluate((l) => parseFloat(getComputedStyle(l).strokeDashoffset)), { timeout: 4000 }).toBe(0);
});

test.describe('in both themes', () => {
  for (const theme of ['light', 'dark'] as const) {
    test(`no axe violations (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(site);
      for (const i of [0, 1]) {
        await goTo(page, i);
        await page.waitForTimeout(1600);
        // The tag's contrast is Godwin's call (see the phone test).
        const results = await new AxeBuilder({ page }).include('section.wyg').exclude('.wyg__tag').analyze();
        expect(results.violations).toEqual([]);
      }
    });
  }
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nothing rises, pops, swings or draws: the slides fade and the figure, eye and grid show at rest', async ({ page }) => {
    await page.goto(site);
    await goTo(page, 3);
    await expect(sec(page).locator('.wyg__layer--parts:not([data-leaving]) .wyg__part').first()).toHaveCSS('animation-name', 'wyg-fade-in');
    await expect(sec(page).locator('.wyg__layer:not([data-leaving]) .wyg__word').first()).toHaveCSS('animation-name', 'wyg-fade-in');
    await expect(sec(page).locator('.wyg-figure__arm').first()).toHaveCSS('animation-name', 'none');
    await expect(sec(page).locator('.wyg-eye__closed')).toHaveCSS('opacity', '0');
    await goTo(page, 5);
    await expect(sec(page).locator('.wyg-grid__line').first()).toHaveCSS('stroke-dashoffset', '0px');
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the Accordion on "Motion with manners" opens without moving the sentence', async ({ page }) => {
    // Godwin 2026-11-09: on a phone its opening pushed the page down.
    await page.goto(site);
    await goTo(page, 2);
    const sentence = sec(page).locator('.wyg__layer[data-entering] .wyg__sentence');
    const accordion = sec(page).locator('.wyg__part[data-part="accordion"] .wyg__reserve > details');
    await expect(accordion).not.toHaveAttribute('open', '');
    const before = (await sentence.boundingBox())!.y;
    await expect(accordion).toHaveAttribute('open', '', { timeout: 6000 });
    await page.waitForTimeout(400);
    expect(Math.abs((await sentence.boundingBox())!.y - before)).toBeLessThan(1);
  });

  test('the same pinned stage changes slide as you scroll, the tag close over the sentence; nothing overflows', async ({ page }) => {
    // Godwin 2026-11-09: "just like desktop, have the what you get section change on scroll".
    await page.goto(site);
    await expect(sec(page)).toHaveAttribute('data-layout', 'phone');
    for (const [i, id] of SLIDES.entries()) {
      await goTo(page, i);
      await expect(sec(page).locator('.wyg__stage')).toHaveAttribute('data-theme', id === 'dark' ? 'dark' : 'light');
      await expect(sec(page).locator('.wyg__layer[data-entering] .wyg__sentence')).toContainText(FIRST_WORDS[i]!);
      await expect(sec(page).locator('.wyg__layer--parts:not([data-leaving]) .wyg__part').first()).toBeVisible();
    }
    // The tag sits space-sm over its sentence; the components space-4xl or more under it (the blocks had space-2xl).
    const gaps = await sec(page).evaluate((el) => {
      const tag = el.querySelector('.wyg__tag')!.getBoundingClientRect();
      const words = el.querySelector('.wyg__sentences')!.getBoundingClientRect();
      const parts = el.querySelector('.wyg__phone .wyg__parts[data-half="bottom"]')!.getBoundingClientRect();
      return { tag: words.top - tag.bottom, parts: parts.top - words.bottom };
    });
    expect(gaps.tag).toBeLessThanOrEqual(8);

    expect(gaps.parts).toBeGreaterThanOrEqual(48);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    // Let the last block's rise and pops finish: axe measures a fading word against whatever is behind it.
    await page.waitForTimeout(1500);
    // The "What you get" tag is Figma's Text/text-minimal, 1.64:1 on the page, under the 3:1 large text needs.
    // Kept as Figma has it until Godwin decides (EXECUTIONS.md, What you get); everything else is checked.
    const results = await new AxeBuilder({ page }).include('section.wyg').exclude('.wyg__tag').analyze();
    expect(results.violations).toEqual([]);
  });
});
