// The landing page (site/, npm run site): the hero, its scroll story and its forced light theme
// (INTERFACE.md, "Landing page").
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const site = 'http://localhost:5182/';

for (const theme of ['light', 'dark'] as const) {
  test(`hero has no axe violations (${theme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto(site);
    // Check once the entrance has played: mid-fade, the nav and words are see-through.
    await expect(page.locator('.hero')).toHaveAttribute('data-entered', 'true');
    await expect(page.locator('.hero__nav')).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero__char').last()).toHaveCSS('opacity', '1');
    await expect(page.locator('.hero__desc-word').last()).toHaveCSS('opacity', '1');
    // PENDING Godwin: the description rests in text-minimal (1.6:1 on surface-100, Figma's inactive words) and only
    // turns text-bold as the scroll highlight reaches it, so it is left out of the contrast check until he decides.
    const results = await new AxeBuilder({ page }).include('.hero').exclude('.hero__description').analyze();
    expect(results.violations).toEqual([]);
  });
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 320, height: 700 }, hasTouch: true });

  test('hero fits without sideways scroll and shows the button', async ({ page }) => {
    await page.goto(site);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await expect(page.getByRole('heading', { level: 1, name: 'Bland by design. Built for purpose.' })).toBeVisible();
    await expect(page.locator('.hero').getByRole('link', { name: 'Read the docs' })).toBeVisible();
    // Docs stays beside the logo (Godwin 2026-11-10); the other text links make way; the icon links stay.
    await expect(page.locator('.hero').getByRole('link', { name: 'Docs', exact: true })).toBeVisible();
    await expect(page.locator('.hero').getByRole('link', { name: 'Components', exact: true })).toBeHidden();
    await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
    // The Figma icon makes way on a phone too (Godwin 2026-11-10).
    await expect(page.locator('.hero').getByRole('link', { name: 'Figma kit' })).toBeHidden();
    // The headline is Figma's three lines, filling the screen; the button comes once its entrance is done.
    const lines = await page.locator('.hero__word').evaluateAll((ws) => new Set(ws.map((w) => Math.round(w.getBoundingClientRect().top))).size);
    expect(lines).toBe(3);
    await expect(page.locator('.hero')).toHaveAttribute('data-ready', 'true');
    await expect(page.locator('.hero__action')).toHaveCSS('opacity', '1');
  });

  test('the page scrolls through the hero natively, the stage pinned and as tall as the screen', async ({ page }) => {
    // Godwin 2026-11-09: a phone keeps the scroll story; the stage is sized to the large viewport (100lvh), so the
    // address bar sliding away no longer shifts it (can't be emulated here; checked on his phone).
    await page.goto(site);
    await expect(page.locator('.hero__desc-word').last()).toHaveCSS('opacity', '1');
    const stage = page.locator('.hero__stage');
    expect((await stage.boundingBox())!.height).toBe(700);
    await page.mouse.move(160, 350);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    expect((await stage.boundingBox())!.y).toBe(0);
  });
});

test.describe('on a desktop', () => {
  test.use({ viewport: { width: 1440, height: 1024 } });

  test('hero matches the Figma frame (1440 x 1024)', async ({ page }) => {
    await page.goto(site);
    const box = async (selector: string) => {
      const b = (await page.locator(selector).boundingBox())!;
      return { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) };
    };
    // Measure once the entrance has played (the nav slides down into place).
    await expect(page.locator('.hero')).toHaveAttribute('data-entered', 'true');
    await expect.poll(async () => Math.round((await page.locator('.hero__nav').boundingBox())!.y)).toBe(40);
    // Figma 7097:36095: nav 560 x 40 at y 40. Headline: Figma's 848 x 336 (three lines of 112) made a quarter bigger
    // (Godwin 2026-11-07): 1060 x 420, three lines of 140, 140 below the nav.
    expect(await box('.hero__nav')).toEqual({ x: 440, y: 40, width: 560, height: 40 });
    expect(await box('.hero__title')).toEqual({ x: 190, y: 220, width: 1060, height: 420 });
    // The description sits Figma's 72 above the bottom of the screen (its 240 tall block ends at 952 of 1024).
    const description = await box('.hero__description');
    expect(description.width).toBe(560);
    expect(description.y + description.height).toBe(1024 - 72);
  });

  test('the headline comes in character by character, each rising later than the one before', async ({ page }) => {
    await page.goto(site);
    // Each character waits longer than the one before it (by its place in the headline), and before the entrance
    // every one sits lowered and see-through. Read from the styles, not timed: frame timing varies under load.
    // Read once the entrance has begun: before it, the characters' transitions are off.
    await expect(page.locator('.hero')).toHaveAttribute('data-entered', 'true');
    const chars = await page.evaluate(async () => {
      const hero = document.querySelector<HTMLElement>('.hero')!;
      const list = [...document.querySelectorAll<HTMLElement>('.hero__word-outline .hero__char')];
      const delays = list.map((c) => parseFloat(getComputedStyle(c).transitionDelay));
      hero.removeAttribute('data-entered');
      const before = list.map((c) => ({ y: new DOMMatrix(getComputedStyle(c).transform).m42, o: Number(getComputedStyle(c).opacity) }));
      hero.setAttribute('data-entered', 'true');
      return { delays, before };
    });
    expect(chars.delays.every((d, i, all) => i === 0 || d > all[i - 1]!)).toBe(true);
    expect(chars.before.every((c) => c.y > 0 && c.o === 0)).toBe(true);
    // The screen reader name is the whole headline, read once.
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Bland by design. Built for purpose.');
  });

  test('the description starts with the first bit of scroll', async ({ page }) => {
    // The headline starts at scroll.titleStart (Godwin's tuning, 0.19); the description at 0.
    await page.goto(site);
    await page.mouse.wheel(0, 100);
    await expect
      .poll(() => page.locator('.hero__desc-word').first().evaluate((e) => Number(getComputedStyle(e).getPropertyValue('--ink'))))
      .toBeGreaterThan(0);
  });

  test('the newest marked phrase shows its icon beside it, one icon at a time', async ({ page }) => {
    await page.goto(site);
    const go = (f: number) =>
      page.evaluate((f) => {
        const h = document.querySelector<HTMLElement>('.hero')!;
        scrollTo(0, (h.offsetHeight - innerHeight) * f);
      }, f);
    const phrases = page.locator('[data-phrase]');
    await go(0.18);
    await expect(phrases.first()).toHaveAttribute('data-current');
    const icon = phrases.first().locator('.hero__phrase-icon');
    await expect(icon).toHaveCSS('opacity', '1');
    const p = (await phrases.first().boundingBox())!;
    const i = (await icon.boundingBox())!;
    expect(i.x + i.width).toBeLessThan(p.x);
    // Further on, the second phrase is current: its icon shows, the first one's has gone, its mark stays.
    await go(0.52);
    await expect(phrases.nth(1)).toHaveAttribute('data-current');
    await expect(phrases.nth(1).locator('.hero__phrase-icon')).toHaveCSS('opacity', '1');
    await expect(icon).toHaveCSS('opacity', '0');
    await expect(phrases.first()).toHaveAttribute('data-lit');
  });

  test('the description stays at the bottom of a taller screen', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1300 });
    await page.goto(site);
    const b = (await page.locator('.hero__description').boundingBox())!;
    expect(Math.round(b.y + b.height)).toBe(1300 - 72);
  });

  test('the hero is light even when the system is dark', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(site);
    await expect(page.locator('.hero__stage')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.hero__stage')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('scrolling turns the headline to outlines while the description pass lights each phrase', async ({ page }) => {
    // Every step waits for the glide (SMOOTHING_MS) to settle: about a second each, 51 steps.
    test.setTimeout(120_000);
    await page.goto(site);
    // Step through the track and record, at each step once the glide has settled, the lit phrase and how far
    // the ink wash has reached into its first word.
    const states = await page.evaluate(async () => {
      const h = document.querySelector<HTMLElement>('.hero')!;
      const out: { f: number; bold: number; ink: number; lit: number; marked: number; firstOn: boolean; theme: string }[] = [];
      const settle = async () => {
        let before = '';
        for (let i = 0; i < 120; i++) {
          await new Promise((r) => requestAnimationFrame(r));
          const now = [...document.querySelectorAll<HTMLElement>('.hero__word, .hero__desc-word')]
            .map((e) => e.style.cssText)
            .join();
          if (now === before) return;
          before = now;
        }
      };
      for (let f = 0; f <= 1.0001; f += 0.02) {
        scrollTo(0, (h.offsetHeight - innerHeight) * f);
        await settle();
        const phrases = [...document.querySelectorAll('[data-phrase]')];
        // The last marked phrase (marks are kept, so this is the newest), and how many are marked.
        const marked = phrases.filter((e) => e.hasAttribute('data-lit')).length;
        const lit = marked - 1;
        const first = lit >= 0 ? phrases[lit]!.querySelector<HTMLElement>('[data-word]')! : null;
        out.push({
          f,
          bold: Number(getComputedStyle(document.querySelectorAll('.hero__word')[5]!).getPropertyValue('--bold')),
          ink:
            [...document.querySelectorAll<HTMLElement>('.hero__desc-word')].reduce(
              (sum, w) => sum + Number(getComputedStyle(w).getPropertyValue('--ink')),
              0,
            ) / document.querySelectorAll('.hero__desc-word').length,
          lit,
          marked,
          firstOn: first ? Number(getComputedStyle(first).getPropertyValue('--ink')) >= 0.5 : false,
          theme: document.querySelector<HTMLElement>('.hero__stage')!.dataset.theme!,
        });
      }
      return out;
    });
    // The phrases are marked in order, each once the gray-to-black pass reaches its first word, and keep their
    // stroke as the pass goes on (Godwin 2026-11-07): the count only grows, to all five.
    const order = states.map((s) => s.marked).filter((m, i, all) => m !== all[i - 1]);
    expect(order).toEqual([0, 1, 2, 3, 4, 5]);
    // Only marked phrases, and always the first ones: the marks are exactly the first `marked` phrases.
    const prefix = await page.evaluate(() =>
      [...document.querySelectorAll('[data-phrase]')].map((e) => e.hasAttribute('data-lit')),
    );
    expect(prefix).toEqual([true, true, true, true, true]);
    expect(states.every((s) => s.lit < 0 || s.firstOn)).toBe(true);
    // "React design system" lights while most of the description is still gray: during the pass, not after.
    const firstLit = states.find((s) => s.lit === 0)!;
    expect(firstLit.ink).toBeLessThan(0.25);
    // The two run together (Godwin 2026-11-07: no still moment between them): by the time the headline is all
    // outline, the description's pass is already under way, and it still has most of its way to go.
    const headlineDone = states.find((s) => s.bold === 0)!;
    expect(headlineDone.ink).toBeGreaterThan(0);
    expect(headlineDone.ink).toBeLessThan(0.5);
    expect(states.find((s) => s.lit === 4)!.bold).toBe(0);
    // Dark mode comes only with "dark.".
    expect(states.filter((s) => s.theme === 'dark').every((s) => s.lit === 4)).toBe(true);
    expect(states.at(-1)!.theme).toBe('dark');
  });

  test('the button follows the pointer over the headline, magnetically', async ({ page }) => {
    await page.goto(site);
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    const button = page.locator('.hero').getByRole('link', { name: 'Read the docs' });
    await page.mouse.move(title.x + title.width / 2, title.y + title.height / 2);
    await expect(page.locator('.hero__action')).toHaveCSS('opacity', '1');
    const centre = (await button.boundingBox())!;
    // Top left of the headline: the button drifts up and left, part of the way.
    await page.mouse.move(title.x + 40, title.y + 20, { steps: 5 });
    await expect
      .poll(async () => {
        const b = (await button.boundingBox())!;
        return b.x < centre.x - 40 && b.y < centre.y - 20;
      })
      .toBe(true);
    // It stays near the middle: well inside the headline's words, never at their edge (MAGNET_REACH).
    const b = (await button.boundingBox())!;
    expect(centre.x - b.x).toBeLessThan(140);
    expect(b.x).toBeGreaterThan(title.x + 200);
  });

  test('the button comes out while the pointer is over the headline', async ({ page }) => {
    await page.goto(site);
    const action = page.locator('.hero__action');
    await page.mouse.move(5, 1000);
    await expect(action).toHaveCSS('opacity', '0');
    const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    await page.mouse.move(title.x + title.width / 2, title.y + 8);
    await expect(action).toHaveCSS('opacity', '1');
  });

  test('keyboard focus brings the button out too', async ({ page }) => {
    await page.goto(site);
    await page.mouse.move(5, 1000);
    const button = page.locator('.hero').getByRole('link', { name: 'Read the docs' });
    await button.focus();
    await expect(page.locator('.hero__action')).toHaveCSS('opacity', '1');
  });
});

test.describe('with reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 1024 }, reducedMotion: 'reduce' });

  test('nothing moves: words and icons only fade, the headline changes in one step', async ({ page }) => {
    await page.goto(site);
    await expect(page.locator('.hero__char').first()).toHaveCSS('transform', 'none');
    await expect(page.locator('.hero__desc-word').first()).toHaveCSS('transform', 'none');
    await page.evaluate(() => {
      const h = document.querySelector<HTMLElement>('.hero')!;
      scrollTo(0, (h.offsetHeight - innerHeight) * 0.05);
    });
    // A step, not a scrub: every word keeps the same state.
    const bolds = await page.locator('.hero__word').evaluateAll((els) =>
      els.map((e) => getComputedStyle(e).getPropertyValue('--bold').trim()),
    );
    expect(new Set(bolds).size).toBe(1);
    await page.evaluate(() => {
      const h = document.querySelector<HTMLElement>('.hero')!;
      scrollTo(0, (h.offsetHeight - innerHeight) * 0.18);
    });
    await expect(page.locator('[data-phrase]').first()).toHaveAttribute('data-lit');
    await expect(page.locator('[data-phrase]').first().locator('.hero__phrase-icon')).toHaveCSS('transform', 'none');
    // No magnet either: the button stays centred.
    await expect(page.locator('.hero__action')).toHaveCSS('translate', '0px');
  });
});
