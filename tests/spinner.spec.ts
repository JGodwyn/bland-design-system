// Behaviour of Spinner: sizes, colors, the ring's turn and the spokes' fading trail, reduced motion, the label
// beside or under it, the status announcement, and the decorative spinner inside a loading Button.
import { expect, test } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'spinner', 'light');
});

const frame = (page: import('@playwright/test').Page) => page.getByTestId('frame-light');

// A turning ring's bounding box is the rotated square's, so layout checks stand the ring still first.
const still = (page: import('@playwright/test').Page) => page.emulateMedia({ reducedMotion: 'reduce' });

test('sizes: icon sizes up to lg, then spinner/xl and spinner/2xl', async ({ page }) => {
  await still(page);
  const f = frame(page);
  for (const [size, px] of [['xs', 12], ['sm', 16], ['md', 20], ['lg', 24], ['xl', 32], ['2xl', 48]] as const) {
    for (const type of ['ring', 'spokes']) {
      const mark = f.getByTestId(`${type}-${size}-default`).locator('.bland-spinner__mark');
      const box = (await mark.boundingBox())!;
      expect([box.width, box.height]).toEqual([px, px]);
    }
  }
});

test('colors: default follows the text, subtle and brand use the Icon tokens', async ({ page }) => {
  const f = frame(page);
  const color = (id: string) => f.getByTestId(id).locator('.bland-spinner__mark').evaluate((e) => getComputedStyle(e).color);
  const token = (name: string) =>
    f.evaluate((e, n) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${n})`;
      e.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, name);
  expect(await color('ring-md-subtle')).toBe(await token('--icon-subtle'));
  expect(await color('ring-md-brand')).toBe(await token('--icon-brand'));
  const text = await f.getByTestId('ring-md-default').evaluate((e) => getComputedStyle(e).color);
  expect(await color('ring-md-default')).toBe(text);
});

test('the ring turns once per duration/spin; the spokes fade in turn, an eighth of a lap apart', async ({ page }) => {
  const f = frame(page);
  const ring = f.getByTestId('ring-md-default').locator('.bland-spinner__mark');
  await expect(ring).toHaveCSS('animation-name', 'bland-spinner-turn');
  await expect(ring).toHaveCSS('animation-duration', '0.8s');
  await expect(ring).toHaveCSS('animation-timing-function', 'linear');
  await expect(ring).toHaveCSS('animation-iteration-count', 'infinite');

  const spokes = f.getByTestId('spokes-md-default').locator('.bland-spinner__spoke');
  await expect(spokes).toHaveCount(8);
  await expect(spokes.first()).toHaveCSS('animation-name', 'bland-spinner-fade');
  const delays = await spokes.evaluateAll((all) => all.map((e) => parseFloat(getComputedStyle(e).animationDelay)));
  // Spoke 1 (top) is a lap behind, spoke 8 an eighth: the bright spoke goes round clockwise.
  expect(delays.map((d) => Math.round(d * 1000))).toEqual([-800, -700, -600, -500, -400, -300, -200, -100]);
});

test('under reduced motion the ring stands still and the spokes keep fading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const f = frame(page);
  await expect(f.getByTestId('ring-md-default').locator('.bland-spinner__mark')).toHaveCSS('animation-name', 'none');
  await expect(f.getByTestId('spokes-md-default').locator('.bland-spinner__spoke').first()).toHaveCSS(
    'animation-name',
    'bland-spinner-fade',
  );
});

test('a polite status says Loading, hidden unless showLabel', async ({ page }) => {
  const spinner = frame(page).getByTestId('ring-md-default');
  await expect(spinner).toHaveAttribute('role', 'status');
  await expect(spinner).toHaveText('Loading');
  const label = spinner.locator('.bland-spinner__label');
  expect(await label.evaluate((e) => getComputedStyle(e).clipPath)).toBe('inset(50%)');
  // The hidden label stays inside the spinner.
  const s = (await spinner.boundingBox())!;
  const l = (await label.boundingBox())!;
  expect(l.width).toBeLessThanOrEqual(s.width);
});

test('a label beside is centred on the mark; a wrapping one keeps the mark on its first line', async ({ page }) => {
  await still(page);
  const f = frame(page);
  for (const size of ['xs', 'md', 'xl', '2xl']) {
    const spinner = f.getByTestId(`label-end-${size}`);
    const mark = (await spinner.locator('.bland-spinner__mark').boundingBox())!;
    const label = (await spinner.locator('.bland-spinner__label').boundingBox())!;
    expect(Math.abs(mark.y + mark.height / 2 - (label.y + label.height / 2))).toBeLessThanOrEqual(0.5);
    expect(label.x - (mark.x + mark.width)).toBe(8); // space-sm
  }
  const wrap = f.getByTestId('label-wrap');
  const mark = (await wrap.locator('.bland-spinner__mark').boundingBox())!;
  const label = (await wrap.locator('.bland-spinner__label').boundingBox())!;
  expect(label.height).toBeGreaterThan(20); // wraps
  expect(mark.y - label.y).toBe(0); // md mark (20) on the body-md line (20)
});

test('a label before sits space-sm left of the mark, centred on it', async ({ page }) => {
  await still(page);
  for (const size of ['xs', 'md', '2xl']) {
    const spinner = frame(page).getByTestId(`label-start-${size}`);
    const mark = (await spinner.locator('.bland-spinner__mark').boundingBox())!;
    const label = (await spinner.locator('.bland-spinner__label').boundingBox())!;
    expect(mark.x - (label.x + label.width)).toBe(8);
    expect(Math.abs(mark.y + mark.height / 2 - (label.y + label.height / 2))).toBeLessThanOrEqual(0.5);
  }
});

test('a label under is centred below the mark, space-sm apart', async ({ page }) => {
  await still(page);
  const spinner = frame(page).getByTestId('label-bottom-xl');
  const mark = (await spinner.locator('.bland-spinner__mark').boundingBox())!;
  const label = (await spinner.locator('.bland-spinner__label').boundingBox())!;
  expect(label.y - (mark.y + mark.height)).toBe(8);
  expect(Math.abs(mark.x + mark.width / 2 - (label.x + label.width / 2))).toBeLessThanOrEqual(0.5);
});

test('inside a loading Button the spinner is decorative and sized by the icon slot', async ({ page }) => {
  await still(page);
  const button = frame(page).getByRole('button', { name: 'Saving' });
  await expect(button).toHaveAttribute('aria-busy', 'true');
  const spinner = button.locator('.bland-spinner');
  await expect(spinner).toHaveAttribute('aria-hidden', 'true');
  await expect(spinner).not.toHaveAttribute('role', 'status');
  const box = (await spinner.locator('.bland-spinner__mark').boundingBox())!;
  expect(box.width).toBe(20); // md button: icon/md
});
