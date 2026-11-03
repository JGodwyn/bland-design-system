// Behaviour of Slider: keys, track presses and drags, a range's thumbs, the value fields, the value tooltip.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory, themes } from './stories';

const slider = (page: Page, name: string) => page.getByRole('slider', { name, exact: true });
const group = (page: Page, name: string) => page.getByRole('group', { name, exact: true });
const thumbOf = (input: Locator) => input.locator('xpath=ancestor::div[contains(@class, "bland-slider__thumb")][1]');

/** Where a value sits on a slider's track, in page px: the rail is the thumbs' travel. */
async function pointAt(page: Page, groupName: string, fraction: number) {
  const rail = (await group(page, groupName).locator('.bland-slider__rail').boundingBox())!;
  const track = (await group(page, groupName).locator('.bland-slider__track').boundingBox())!;
  return { x: rail.x + rail.width * fraction, y: track.y + track.height / 2 };
}

test.beforeEach(async ({ page }) => {
  await openStory(page, 'slider', 'light');
});

test('a single slider is a range input named by the slider, moved by keys', async ({ page }) => {
  const input = slider(page, 'Single sm');
  await expect(input).toHaveAttribute('type', 'range');
  await expect(input).toHaveValue('50');
  await expect(input).toHaveAttribute('min', '0');
  await expect(input).toHaveAttribute('max', '100');
  await input.focus();
  await page.keyboard.press('ArrowRight');
  await expect(input).toHaveValue('51');
  await page.keyboard.press('End');
  await expect(input).toHaveValue('100');
  await page.keyboard.press('Home');
  await expect(input).toHaveValue('0');
});

test('sizes: thumb, dot and row follow slider/thumb-*, selection/dot-* and control/*', async ({ page }) => {
  for (const [size, thumb, dot, row] of [
    ['sm', 16, 4, 24],
    ['md', 20, 8, 32],
    ['lg', 24, 8, 40],
  ] as const) {
    const g = group(page, `Single ${size}`);
    const t = (await g.locator('.bland-slider__thumb').boundingBox())!;
    const d = (await g.locator('.bland-slider__dot').boundingBox())!;
    const r = (await g.locator('.bland-slider__track').boundingBox())!;
    expect([t.width, t.height, d.width, r.height, r.width]).toEqual([thumb, thumb, dot, row, 256]);
    // The bars stop space-2xs short of the thumb.
    const active = (await g.locator('.bland-slider__bar[data-part="active"]').boundingBox())!;
    const inactive = (await g.locator('.bland-slider__bar[data-part="inactive"]').boundingBox())!;
    expect(t.x - (active.x + active.width)).toBeCloseTo(2, 1);
    expect(inactive.x - (t.x + t.width)).toBeCloseTo(2, 1);
  }
});

test('a press on the track moves the thumb there, and a drag follows the pointer', async ({ page }) => {
  const input = slider(page, 'Single md');
  const at = await pointAt(page, 'Single md', 0.8);
  await page.mouse.click(at.x, at.y);
  await expect(input).toHaveValue('80');
  const thumb = (await thumbOf(input).boundingBox())!;
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  const to = await pointAt(page, 'Single md', 0.2);
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await expect(input).toHaveValue('20');
  // The thumb's centre is under the pointer.
  const moved = (await thumbOf(input).boundingBox())!;
  expect(Math.abs(moved.x + moved.width / 2 - to.x)).toBeLessThan(2);
  await page.mouse.up();
});

test('a range has two thumbs, named after the slider, that cannot cross', async ({ page }) => {
  const start = slider(page, 'Minimum Double sm');
  const end = slider(page, 'Maximum Double sm');
  await expect(start).toHaveValue('25');
  await expect(end).toHaveValue('75');
  await start.focus();
  await page.keyboard.press('End');
  await expect(start).toHaveValue('75');
  await end.focus();
  await page.keyboard.press('Home');
  await expect(end).toHaveValue('75');
  // A press on the track moves the nearer thumb.
  const at = await pointAt(page, 'Double sm', 0.1);
  await page.mouse.click(at.x, at.y);
  await expect(start).toHaveValue('10');
  await expect(end).toHaveValue('75');
});

test('the value field follows the slider, and commits on Enter or blur', async ({ page }) => {
  const input = slider(page, 'Field sm');
  const field = page.getByRole('textbox', { name: 'Field sm', exact: true });
  await expect(field).toHaveValue('50');
  await input.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(field).toHaveValue('49');
  await field.fill('80');
  await field.press('Enter');
  await expect(input).toHaveValue('80');
  await field.fill('500');
  await field.press('Tab');
  await expect(field).toHaveValue('100');
  await expect(input).toHaveValue('100');
  await field.fill('');
  await field.press('Enter');
  await expect(field).toHaveValue('100');
  // slider/input-width wide, as tall as the row: Text Input sm, md on lg.
  for (const [size, height] of [
    ['sm', 32],
    ['md', 32],
    ['lg', 40],
  ] as const) {
    const box = (await group(page, `Field ${size}`).locator('.bland-text-input__field').boundingBox())!;
    expect([box.width, box.height]).toEqual([56, height]);
  }
});

test('a range gets a field each side, kept on its side of the other thumb', async ({ page }) => {
  const g = group(page, 'Price');
  const startField = page.getByRole('textbox', { name: 'Price Minimum', exact: true });
  const endField = page.getByRole('textbox', { name: 'Price Maximum', exact: true });
  const track = (await g.locator('.bland-slider__track').boundingBox())!;
  expect((await startField.boundingBox())!.x).toBeLessThan(track.x);
  expect((await endField.boundingBox())!.x).toBeGreaterThan(track.x + track.width);
  await startField.fill('90');
  await startField.press('Enter');
  await expect(startField).toHaveValue('80');
  await expect(slider(page, 'Minimum Price')).toHaveValue('80');
  await endField.fill('85');
  await endField.press('Enter');
  await expect(slider(page, 'Maximum Price')).toHaveValue('85');
});

test('snap: keys step from checkpoint to checkpoint', async ({ page }) => {
  const input = slider(page, 'Snap single');
  await expect(input).toHaveValue('50');
  await input.focus();
  await page.keyboard.press('ArrowRight');
  await expect(input).toHaveValue('75');
  await page.keyboard.press('PageUp');
  await expect(input).toHaveValue('100');
  await page.keyboard.press('ArrowRight');
  await expect(input).toHaveValue('100');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(input).toHaveValue('50');
  await page.keyboard.press('Home');
  await expect(input).toHaveValue('0');
  // An array of checkpoints, unevenly spaced.
  const array = slider(page, 'Snap array');
  await array.focus();
  await page.keyboard.press('ArrowRight');
  await expect(array).toHaveValue('50');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(array).toHaveValue('10');
});

test('snap: a drag and a track press land on the nearest checkpoint', async ({ page }) => {
  const input = slider(page, 'Snap single');
  await group(page, 'Snap single').scrollIntoViewIfNeeded();
  const near = await pointAt(page, 'Snap single', 0.68);
  await page.mouse.click(near.x, near.y);
  await expect(input).toHaveValue('75');
  const thumb = (await thumbOf(input).boundingBox())!;
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await page.mouse.down();
  const to = await pointAt(page, 'Snap single', 0.3);
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await expect(input).toHaveValue('25');
  // The thumb sits on its checkpoint, not under the pointer.
  const moved = (await thumbOf(input).boundingBox())!;
  const at = await pointAt(page, 'Snap single', 0.25);
  expect(Math.abs(moved.x + moved.width / 2 - at.x)).toBeLessThan(1);
  await page.mouse.up();
});

test('snap: a range stays on checkpoints and its thumbs never cross', async ({ page }) => {
  const start = slider(page, 'Minimum Snap range');
  const end = slider(page, 'Maximum Snap range');
  await expect(start).toHaveValue('0');
  await expect(end).toHaveValue('100');
  await start.focus();
  await page.keyboard.press('ArrowRight');
  await expect(start).toHaveValue('33');
  await end.focus();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(end).toHaveValue('33');
  await page.keyboard.press('ArrowLeft');
  await expect(end).toHaveValue('33');
});

test('snap: a typed value goes to the nearest checkpoint', async ({ page }) => {
  const input = slider(page, 'Snap field');
  const field = page.getByRole('textbox', { name: 'Snap field', exact: true });
  await field.fill('30');
  await field.press('Enter');
  await expect(input).toHaveValue('50');
  await expect(field).toHaveValue('50');
  await field.fill('80');
  await field.press('Enter');
  await expect(input).toHaveValue('100');
  await expect(field).toHaveValue('100');
});

test('disabled: no focus, no keys, no field', async ({ page }) => {
  await expect(slider(page, 'Disabled single')).toBeDisabled();
  await expect(slider(page, 'Minimum Disabled double')).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'Disabled double Minimum' })).toBeDisabled();
});

test('the tooltip shows the value on keyboard focus, follows it, and Escape hides it', async ({ page }) => {
  const input = slider(page, 'Single md');
  await input.focus();
  await page.keyboard.press('ArrowRight');
  const tooltip = page.getByRole('tooltip', { name: '51', exact: true });
  await expect(tooltip).toBeVisible();
  // Opened from the keyboard: no motion.
  await expect(tooltip).toHaveAttribute('data-instant', 'true');
  await page.keyboard.press('PageUp');
  await page.keyboard.press('PageUp');
  const moved = page.getByRole('tooltip', { name: '71', exact: true });
  await expect(moved).toBeVisible();
  // Centred over the thumb, tooltip/offset above it.
  const thumb = thumbOf(input);
  await expect
    .poll(async () => {
      const t = (await thumb.boundingBox())!;
      const tip = (await moved.locator('.bland-tooltip__pointer').boundingBox())!;
      return [Math.round(tip.x + tip.width / 2 - (t.x + t.width / 2)), Math.round(t.y - (tip.y + tip.height))];
    })
    .toEqual([0, 4]);
  await page.keyboard.press('Escape');
  await expect(moved).toBeHidden();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tooltip', { name: '72', exact: true })).toBeVisible();
});

test('the tooltip shows on hover at once and while dragging', async ({ page }) => {
  const input = slider(page, 'Single lg');
  const thumb = (await thumbOf(input).boundingBox())!;
  await page.mouse.move(1, 1);
  await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
  await expect(page.getByRole('tooltip', { name: '50', exact: true })).toBeVisible();
  await page.mouse.down();
  const to = await pointAt(page, 'Single lg', 0.3);
  await page.mouse.move(to.x, to.y + 40, { steps: 6 });
  await expect(page.getByRole('tooltip', { name: '30', exact: true })).toBeVisible();
  await page.mouse.up();
  await expect(page.getByRole('tooltip')).toBeHidden();
});

for (const theme of themes) {
  test(`tooltip screenshot, ${theme}`, async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'screenshot baselines are Chromium (playwright.config.ts)');
    await openStory(page, 'slider', theme);
    await slider(page, 'Minimum Double md').focus();
    await page.keyboard.press('ArrowRight');
    const g = group(page, 'Double md');
    await expect(page.getByRole('tooltip')).toBeVisible();
    const box = (await g.boundingBox())!;
    await expect(page).toHaveScreenshot(`slider-tooltip-${theme}.png`, {
      clip: { x: box.x - 16, y: box.y - 64, width: box.width + 32, height: box.height + 80 },
    });
  });
}
