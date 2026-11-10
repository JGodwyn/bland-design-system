// The landing page's feature row (site/src/features/row/, Figma 7141:36653): the six feature cards as a row that
// moves sideways as the page scrolls, the middle card at full size and live, its neighbours at Godwin's tuned 0.65 and
// 20%, holding still on each card for part of the way (INTERFACE.md, "Landing page", Feature row).
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';
const row = (page: Page) => page.locator('section.row');
const cards = (page: Page) => page.locator('.row__card');

/** Scrolls to where card `index` is in the middle, and waits for the row to settle there. */
async function goTo(page: Page, index: number) {
  await row(page).evaluate((el, i) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    const n = el.querySelectorAll('.row__card').length;
    window.scrollTo(0, top + (span * i) / (n - 1));
  }, index);
  await expect(cards(page).nth(index)).toHaveAttribute('data-centered', 'true');
  // Settled: exactly in the middle at full size (the glide ends on the card itself).
  await expect.poll(() => cards(page).nth(index).evaluate((el) => `${el.style.translate} ${el.style.scale}`)).toBe('calc(-50% + 0px) -50% 1');
}

const look = (page: Page, i: number) =>
  cards(page)
    .nth(i)
    .evaluate((el) => ({ scale: Number(el.style.scale), opacity: Number(el.style.opacity) }));

test('the row has the six cards, the first one in the middle and live', async ({ page }) => {
  await page.goto(site);
  await expect(cards(page)).toHaveCount(6);
  await goTo(page, 0);
  await expect(cards(page).first().getByRole('heading', { level: 2 })).toHaveText('Over 45 components that fit together');
  // Only the middle card is reachable; the others are hidden from screen readers and inert.
  for (let i = 1; i < 6; i++) await expect(cards(page).nth(i)).toHaveAttribute('aria-hidden', 'true');
  expect(await cards(page).nth(1).locator('.row__content').evaluate((el) => (el as HTMLElement).inert)).toBe(true);
});

test('scrolling down moves the row sideways, card by card', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  // Neighbours at Godwin's tuned 0.65, 20% opaque; two away, faded out.
  for (const i of [1, 3]) {
    const l = await look(page, i);
    expect(l.scale).toBeCloseTo(0.65, 3);
    expect(l.opacity).toBeCloseTo(0.2, 2);
  }
  expect((await look(page, 0)).opacity).toBe(0);
  // The neighbours sit either side (spacing 0.991 of a card's width, Godwin's tuning).
  const x = await cards(page).evaluateAll((els) => els.map((el) => el.getBoundingClientRect().x + el.getBoundingClientRect().width / 2));
  expect(x[3]! - x[2]!).toBeGreaterThan(0);
  expect(x[2]! - x[1]!).toBeGreaterThan(0);
  // The live card's controls work: the light/dark line only exists for screen readers once its card is centred.
  await goTo(page, 1);
  await expect(row(page).getByRole('slider', { name: 'Dark part of the card' })).toBeVisible();
});

test('the row holds still on a card for part of the scroll', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 3);
  const before = await cards(page).nth(3).evaluate((el) => el.style.translate);
  // A tenth of one card's scroll further on, inside the hold, nothing moves.
  await row(page).evaluate((el) => {
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollBy(0, span / 5 / 10);
  });
  await page.waitForTimeout(800);
  expect(await cards(page).nth(3).evaluate((el) => el.style.translate)).toBe(before);
});

test('stopping between two cards glides on to the nearer one', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  for (const [at, nearest] of [
    [2.4, 2],
    [2.62, 3],
  ] as const) {
    await row(page).evaluate((el, a) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = (el as HTMLElement).offsetHeight - window.innerHeight;
      window.scrollTo(0, top + (span * a) / 5);
    }, at);
    // Left alone, the row ends on a whole card: exactly in the middle, nothing between two.
    await expect(cards(page).nth(nearest)).toHaveAttribute('data-centered', 'true', { timeout: 4000 });
    await expect
      .poll(() => cards(page).nth(nearest).evaluate((el) => el.style.translate), { timeout: 4000 })
      .toBe('calc(-50% + 0px) -50%');
  }
});

test('scrolling again during the glide takes over at once', async ({ page, browserName }) => {
  // Under the test runner, WebKit's emulated wheel does not scroll the page here (scrollY stays put), though the
  // same steps in a standalone Playwright WebKit script do and the row then settles on card 3 (2026-11-08,
  // LEARNINGS). The glide itself is the same code in every engine.
  test.skip(browserName === 'webkit', "Playwright's WebKit wheel does not scroll the page under the runner");
  await page.goto(site);
  await goTo(page, 2);
  await row(page).evaluate((el) => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = (el as HTMLElement).offsetHeight - window.innerHeight;
    window.scrollTo(0, top + (span * 2.45) / 5);
  });
  // The glide starts once scrolling stops; a wheel turn then wins and the page goes where the wheel sends it.
  await page.waitForTimeout(300);
  const box = (await cards(page).nth(2).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 600);
  // The glide was heading back to card 2; the wheel carried the row on past it, and it settles on card 3.
  await expect(cards(page).nth(3)).toHaveAttribute('data-centered', 'true', { timeout: 5000 });
});

test('pressing a neighbour brings it to the middle', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  await cards(page).nth(3).locator('.row__pick').click();
  await expect(cards(page).nth(3)).toHaveAttribute('data-centered', 'true', { timeout: 5000 });
});

test('a card plays as soon as it shows, before it reaches the middle', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  // The rebrand card is the neighbour on the right: its colors already change.
  const rebrand = cards(page).nth(2).locator('.rebrand-pic');
  await expect(rebrand).toHaveAttribute('data-brand', 'green', { timeout: 4000 });
  await expect(cards(page).nth(2)).not.toHaveAttribute('data-centered', 'true');
});

test('the picture is space-3xl (40) from the words above and under it', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const card = cards(page).first();
  await expect(card.locator('.row__title')).toHaveCSS('padding-bottom', '40px');
  await expect(card.locator('.row__description')).toHaveCSS('padding-top', '40px');
});

test("a tab row's selection sits on its tab in a card that was small when it was drawn", async ({ page }) => {
  await page.goto(site);
  // Start one card along, so the first card (the component wall, with a SegmentedBar) is drawn small, then
  // bring it to the middle at full size.
  await goTo(page, 1);
  await goTo(page, 0);
  const off = await cards(page)
    .first()
    .evaluate((el) => {
      const bar = el.querySelector('.components-pic [role="radiogroup"], .components-pic [role="tablist"]')!;
      const chosen = bar.querySelector('[data-selected]')!.getBoundingClientRect();
      const thumb = bar.querySelector('[class*="indicator"]')!.getBoundingClientRect();
      return { x: Math.abs(thumb.left - chosen.left), w: Math.abs(thumb.width - chosen.width) };
    });
  expect(off.x).toBeLessThan(1);
  expect(off.w).toBeLessThan(1);
});

test('the row has no axe violations', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 4);
  // Pause the middle card (hover) and let what was moving finish, so nothing is caught mid-fade.
  await cards(page).nth(4).locator('.row__picture').hover();
  await page.waitForTimeout(800);
  const results = await new AxeBuilder({ page }).include('section.row').analyze();
  expect(results.violations).toEqual([]);
});

test.describe('under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the row moves a whole card at a time', async ({ page }) => {
    await page.goto(site);
    await row(page).evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const span = (el as HTMLElement).offsetHeight - window.innerHeight;
      window.scrollTo(0, top + span * 0.29); // between cards 1 and 2, nearer 1
    });
    await expect(cards(page).nth(1)).toHaveAttribute('data-centered', 'true');
    expect((await look(page, 1)).scale).toBe(1);
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('the cards stack down the page, each live and within the screen; nothing scrolls sideways', async ({ page }) => {
    // Godwin 2026-11-09: vertical on a phone, not the sideways row.
    await page.goto(site);
    await expect(row(page)).toHaveAttribute('data-layout', 'stack');
    await expect(cards(page)).toHaveCount(6);
    let last = -Infinity;
    for (let i = 0; i < 6; i++) {
      await cards(page).nth(i).scrollIntoViewIfNeeded();
      await expect(cards(page).nth(i)).toHaveAttribute('data-started', 'true');
      const box = (await cards(page).nth(i).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      const top = await cards(page).nth(i).evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
      expect(top).toBeGreaterThan(last);
      last = top;
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

// ---------- The pictures, on their card in the middle (moved from the removed grid's specs, 2026-11-08) ----------

// docs/landing-copy.md, "Feature cards".
const TITLES = [
  'Over 45 components that fit together',
  'Light and dark, each designed',
  'One color rebrands it all',
  'Works without a mouse',
  'Charts in your colors',
  'Typed down to every prop',
];
const card = (page: Page, i: number) => cards(page).nth(i);

test('the six cards carry the copy in order, a line under each title', async ({ page }) => {
  await page.goto(site);
  await expect(page.locator('.row__title')).toHaveText(TITLES);
  await expect(page.locator('.row__description')).toHaveCount(TITLES.length);
  // The grid that came first is gone: each title is on the page once.
  await expect(page.locator('section.features')).toHaveCount(0);
});

test('only the line, the form, the pills and the listbox can be used; the rest is decorative', async ({ page }) => {
  await page.goto(site);
  for (const sel of ['.components-pic', '.rebrand-pic', '.theme-pic__layer']) {
    for (const el of await page.locator(sel).all()) {
      await expect(el).toHaveAttribute('aria-hidden', 'true');
      expect(await el.evaluate((e) => (e as HTMLElement).inert)).toBe(true);
    }
  }
});

for (const theme of ['light', 'dark'] as const) {
  test(`the row stays light and has no axe violations on each card (${theme} system)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(site);
    await expect(row(page)).toHaveAttribute('data-theme', 'light');
    for (const i of [1, 3, 5]) {
      await goTo(page, i);
      await cards(page).nth(i).locator('.row__picture').hover();
      await page.waitForTimeout(800);
      const results = await new AxeBuilder({ page }).include('section.row').analyze();
      expect(results.violations).toEqual([]);
    }
  });
}

test('the rebrand story loops while its card shows, on roles computed from its own steps', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  const rebrand = card(page, 2).locator('.rebrand-pic');
  await expect(rebrand).toHaveAttribute('data-brand', 'green', { timeout: 5000 });
  await expect(rebrand).toHaveAttribute('data-brand', 'orange', { timeout: 5000 });
  // Orange's step 600 (npm run brand -- generate "#f2541b") through Surface/surface-brand; toHaveCSS retries while
  // the dot eases between hues.
  await expect(card(page, 2).locator('.rebrand-pic__dot')).toHaveCSS('background-color', 'rgb(213, 65, 0)');
  await expect(rebrand).toHaveAttribute('data-brand', 'blue', { timeout: 5000 });
});

test('hovering the middle card pauses its story; leaving resumes it', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 2);
  await page.mouse.move(5, 5);
  await card(page, 2).locator('.row__picture').hover();
  await expect(card(page, 2)).not.toHaveAttribute('data-active', 'true');
  const rebrand = card(page, 2).locator('.rebrand-pic');
  const step = await rebrand.getAttribute('data-step');
  await page.waitForTimeout(3000);
  await expect(rebrand).toHaveAttribute('data-step', step!);
  await page.mouse.move(5, 5);
  await expect(card(page, 2)).toHaveAttribute('data-active', 'true');
  await expect(rebrand).not.toHaveAttribute('data-step', step!, { timeout: 4000 });
});

test('the light/dark line follows a drag and the arrow keys', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  const pic = card(page, 1).locator('.theme-pic');
  const slider = row(page).getByRole('slider', { name: 'Dark part of the card' });
  const box = (await pic.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height / 2, { steps: 6 });
  await page.mouse.up();
  // A quarter in from the left: three quarters of the card are dark, and the grip sits on the line.
  await expect(slider).toHaveAttribute('aria-valuenow', '75');
  await expect
    .poll(async () => {
      const g = (await card(page, 1).locator('.theme-pic__grip').boundingBox())!;
      return (g.x + g.width / 2 - box.x) / box.width;
    })
    .toBeCloseTo(0.25, 1);
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(slider).toHaveAttribute('aria-valuenow', '94');
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveAttribute('aria-valuenow', '89');
});

test('Tab goes through the sign-in form and the caption reads each control', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 3);
  const c = card(page, 3);
  const caption = c.locator('.keyboard-pic__caption .features-roll__value:not([data-roll="out"])');
  await c.getByRole('textbox', { name: 'Email' }).focus();
  await expect(c.locator('.keyboard-pic')).toHaveAttribute('data-own-focus', 'true');
  await expect(caption).toHaveText('Email, edit text');
  await page.keyboard.press('Tab');
  const box = c.getByRole('checkbox', { name: 'Keep me signed in' });
  await expect(box).toBeFocused();
  // The loop may have ticked it before focus came in; the caption reads the box as it is, and Space flips both.
  const ticked = await box.isChecked();
  const state = (on: boolean) => `Keep me signed in, checkbox, ${on ? 'checked' : 'not checked'}`;
  await expect(caption).toHaveText(state(ticked));
  await page.keyboard.press('Space');
  await expect(caption).toHaveText(state(!ticked));
  await page.keyboard.press('Tab');
  await expect(c.getByRole('button', { name: 'Sign in' })).toBeFocused();
  await expect(caption).toHaveText('Sign in, button');
  // While focus is in the card its story holds still.
  await expect(c).not.toHaveAttribute('data-active', 'true');
});

test('the chart switches color vision from its pills, holds the pick and grows its bars again', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 4);
  const chart = card(page, 4).locator('.charts-pic');
  await chart.hover();
  const oldBars = await chart.locator('.charts-pic__view[data-shown] .charts-pic__bars').elementHandle();
  await card(page, 4).getByRole('tab', { name: 'Blue-yellow' }).click();
  await expect(chart).toHaveAttribute('data-view', 'blue-yellow');
  // A new view grows its bars in again, as on the first entrance: new bars, which rise.
  expect(await oldBars!.evaluate((el) => el.isConnected)).toBe(false);
  await expect(chart.locator('.charts-pic__view[data-shown] .charts-pic__bars')).toHaveAttribute('data-grown', 'true');
  // Only that view shows, through the blue-yellow (tritan) matrix.
  const shown = chart.locator('.charts-pic__view[data-shown]');
  await expect(shown).toHaveCount(1);
  await expect(shown).toHaveCSS('filter', /blue-yellow/);
  await page.waitForTimeout(3000);
  await expect(chart).toHaveAttribute('data-view', 'blue-yellow');
});

test('picking an emotion restyles the Button and fills in the code', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 5);
  const c = card(page, 5);
  const list = c.getByRole('listbox', { name: 'Button emotion' });
  await list.hover();
  await c.getByRole('option', { name: /"danger"/ }).click();
  await expect(c.getByRole('option', { name: /"danger"/ })).toHaveAttribute('aria-selected', 'true');
  await expect(c.locator('.props-pic__result .bland-button')).toHaveAttribute('data-emotion', 'danger');
  await expect(c.locator('.props-pic__line .features-roll__value:not([data-roll="out"])')).toHaveText('danger');
  await list.focus();
  await page.keyboard.press('ArrowDown');
  await expect(c.locator('.props-pic__result .bland-button')).toHaveAttribute('data-emotion', 'warning');
  await page.keyboard.press('Home');
  await expect(c.locator('.props-pic__result .bland-button')).toHaveAttribute('data-emotion', 'brand');
});

test.describe('pictures under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('each picture shows its poster and nothing loops', async ({ page }) => {
    await page.goto(site);
    await goTo(page, 2);
    await expect(card(page, 2).locator('.rebrand-pic')).toHaveAttribute('data-brand', 'orange');
    await goTo(page, 3);
    await expect(card(page, 3).locator('.keyboard-pic__caption .features-roll__value:not([data-roll="out"])')).toHaveText(
      'Sign in, button',
    );
    await goTo(page, 0);
    await expect(card(page, 0).locator('.components-pic [role="switch"]').first()).toBeChecked();
    const part = card(page, 0).locator('.components-pic__part').first();
    await expect(part).toHaveCSS('opacity', '1');
    await expect(part).toHaveCSS('translate', 'none');
    await page.waitForTimeout(3000);
    await expect(card(page, 2).locator('.rebrand-pic')).toHaveAttribute('data-brand', 'orange');
  });
});

test("the components card's Slider glides to its new value instead of snapping", async ({ page }) => {
  await page.goto(site);
  await goTo(page, 0);
  const thumb = cards(page).first().locator('.components-pic .bland-slider__thumb');
  await expect(thumb).toHaveCSS('transition-property', /left/);
  // Watch it move: between two values it passes through positions in between.
  const xs = await thumb.evaluate(async (el) => {
    const out = new Set<number>();
    const t0 = performance.now();
    while (performance.now() - t0 < 6000 && out.size < 4) {
      await new Promise(requestAnimationFrame);
      out.add(Math.round(el.getBoundingClientRect().left));
    }
    return out.size;
  });
  expect(xs).toBeGreaterThan(3);
});

test('Tab past the last control glides to the next card with controls; Shift+Tab comes back', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 3);
  const signIn = card(page, 3).getByRole('button', { name: 'Sign in' });
  await signIn.focus();
  const before = await row(page).evaluate((el) => el.getBoundingClientRect().top);
  await page.keyboard.press('Tab');
  // Not off to the next section: the row moves to the charts card and focus lands on its pills.
  await expect(card(page, 4)).toHaveAttribute('data-centered', 'true', { timeout: 5000 });
  await expect(card(page, 4).getByRole('tab', { selected: true })).toBeFocused();
  expect(await page.locator('section.brand-sec').evaluate((el) => el.contains(document.activeElement))).toBe(false);
  expect(Math.abs((await row(page).evaluate((el) => el.getBoundingClientRect().top)) - before)).toBeLessThan(2000);
  await page.keyboard.press('Shift+Tab');
  await expect(card(page, 3)).toHaveAttribute('data-centered', 'true', { timeout: 5000 });
  await expect(signIn).toBeFocused();
});

test("with a mouse, the line's grip rides to the cursor's height; the line itself stays put", async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  const pic = card(page, 1).locator('.theme-pic');
  const slider = row(page).getByRole('slider', { name: 'Dark part of the card' });
  const grip = card(page, 1).locator('.theme-pic__grip');
  const before = await slider.getAttribute('aria-valuenow');
  const box = (await pic.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await page.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.3, { steps: 3 });
  // The grip comes to the cursor's height (it eases there over duration/sm).
  await expect
    .poll(async () => {
      const g = (await grip.boundingBox())!;
      return (g.y + g.height / 2 - box.y) / box.height;
    })
    .toBeCloseTo(0.3, 1);
  // Hovering moves only the grip: the split is the story's, as before.
  await expect(slider).toHaveAttribute('aria-valuenow', before!);
});

test('the grip grows while the line is dragged and goes back to its size on release', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  const pic = card(page, 1).locator('.theme-pic');
  const grip = card(page, 1).locator('.theme-pic__grip');
  const box = (await pic.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5, { steps: 3 });
  await expect(grip).toHaveCSS('scale', '1.25');
  await page.mouse.up();
  await expect(grip).toHaveCSS('scale', 'none');
});

test.describe('on a phone, the light/dark line', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('jumps to a tap and follows a drag', async ({ page }) => {
    await page.goto(site);
    const pic = page.locator('section.row .theme-pic').first();
    await pic.scrollIntoViewIfNeeded();
    const slider = page.locator('section.row').getByRole('slider', { name: 'Dark part of the card' });
    const box = (await pic.boundingBox())!;
    await page.touchscreen.tap(box.x + box.width * 0.25, box.y + box.height * 0.4);
    await expect(slider).toHaveAttribute('aria-valuenow', '75');
    // The grip goes to where the finger touched.
    const grip = page.locator('section.row .theme-pic__grip').first();
    await expect
      .poll(async () => {
        const g = (await grip.boundingBox())!;
        return (g.y + g.height / 2 - box.y) / box.height;
      })
      .toBeCloseTo(0.4, 1);
  });

  test('follows a sideways touch drag', async ({ page, browserName }) => {
    // A real touch drag, through Chrome's DevTools protocol (Playwright's touchscreen only taps).
    test.skip(browserName !== 'chromium', 'CDP touch events are Chromium only');
    await page.goto(site);
    const pic = page.locator('section.row .theme-pic').first();
    await pic.scrollIntoViewIfNeeded();
    const slider = page.locator('section.row').getByRole('slider', { name: 'Dark part of the card' });
    const box = (await pic.boundingBox())!;
    const cdp = await page.context().newCDPSession(page);
    const y = box.y + box.height / 2;
    const at = (f: number) => [{ x: box.x + box.width * f, y }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(0.25) });
    for (const f of [0.3, 0.4, 0.5, 0.6]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(f) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(slider).toHaveAttribute('aria-valuenow', '40');
  });
});

test('the grip glides to a new pointer height instead of snapping', async ({ page }) => {
  await page.goto(site);
  await goTo(page, 1);
  const pic = card(page, 1).locator('.theme-pic');
  const box = (await pic.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.2);
  await page.waitForTimeout(600);
  // One jump of the pointer, then watch the grip frame by frame: it passes through heights in between, always
  // moving the same way, and arrives.
  const track = card(page, 1)
    .locator('.theme-pic__grip')
    .evaluate(async (el) => {
      const ys: number[] = [];
      const t0 = performance.now();
      while (performance.now() - t0 < 700) {
        await new Promise(requestAnimationFrame);
        const r = el.getBoundingClientRect();
        ys.push(r.top + r.height / 2);
      }
      return ys;
    });
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.7);
  const ys = await track;
  const moving = ys.filter((y, i) => i > 0 && Math.abs(y - ys[i - 1]!) > 0.5);
  expect(moving.length).toBeGreaterThan(5);
  for (let i = 1; i < ys.length; i++) expect(ys[i]!).toBeGreaterThanOrEqual(ys[i - 1]! - 0.5);
  expect(Math.abs(ys.at(-1)! - (box.y + box.height * 0.7))).toBeLessThan(3);
});
