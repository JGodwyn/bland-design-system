// Behaviour of Toggle: a native switch, label and hit area, sizes, knob position, state colors, focus.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the same way the browser resolves the track's background. */
async function tokenColor(page: Page, token: string) {
  return page.evaluate((t) => {
    const probe = document.createElement('div');
    probe.style.backgroundColor = `var(${t})`;
    document.querySelector('[data-testid^="frame-"]')!.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, token);
}

const bg = (el: Locator) => el.evaluate((e) => getComputedStyle(e).backgroundColor);
const knob = (track: Locator) => track.locator('xpath=following-sibling::span[1]');
const label = (track: Locator) => track.locator('xpath=ancestor::label[1]');

test.beforeEach(async ({ page }) => {
  await openStory(page, 'toggle', 'light');
});

test('it is a switch: clicking the label or pressing Space turns it on and off', async ({ page }) => {
  const toggle = page.getByRole('switch', { name: 'Uncontrolled' });
  await expect(toggle).toHaveAttribute('type', 'checkbox');
  await expect(toggle).not.toBeChecked();
  await page.getByText('Uncontrolled', { exact: true }).click();
  await expect(toggle).toBeChecked();
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Space');
  await expect(toggle).not.toBeChecked();
});

test('controlled: onCheckedChange reports the new state', async ({ page }) => {
  const toggle = page.getByTestId('controlled');
  await expect(page.getByText('Wi-Fi is off')).toBeVisible();
  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect(page.getByText('Wi-Fi is on')).toBeVisible();
});

test('tracks and knobs follow toggle/* and control/*, and the knob slides to the end when on', async ({ page }) => {
  for (const [id, track, knobSize] of [
    ['uncontrolled', [40, 24], 16],
    ['uncontrolled-md', [56, 32], 24],
  ] as const) {
    const toggle = page.getByTestId(id);
    const t = (await toggle.boundingBox())!;
    expect([t.width, t.height]).toEqual(track);
    const k = () => knob(toggle).boundingBox();
    const off = (await k())!;
    expect([off.width, off.height]).toEqual([knobSize, knobSize]);
    expect([off.x - t.x, off.y - t.y]).toEqual([4, 4]);

    await toggle.click();
    await expect.poll(async () => (await k())!.x - t.x).toBe(t.width - knobSize - 4);
  }
});

test('the label is the hit area: clicking beside the track toggles it', async ({ page }) => {
  const toggle = page.getByTestId('uncontrolled');
  const l = (await label(toggle).boundingBox())!;
  await page.mouse.click(l.x + l.width - 2, l.y + l.height / 2);
  await expect(toggle).toBeChecked();
});

test('rest, hover and checked use the Toggle surface tokens', async ({ page }) => {
  const toggle = page.getByTestId('uncontrolled');
  expect(await bg(toggle)).toBe(await tokenColor(page, '--toggle-surface-unchecked'));
  await page.getByText('Uncontrolled', { exact: true }).hover();
  await expect.poll(() => bg(toggle)).toBe(await tokenColor(page, '--toggle-surface-unchecked-hover'));
  await page.getByText('Uncontrolled', { exact: true }).click();
  await expect.poll(() => bg(toggle)).toBe(await tokenColor(page, '--toggle-surface-checked-hover'));
  await page.mouse.move(0, 0);
  await expect.poll(() => bg(toggle)).toBe(await tokenColor(page, '--toggle-surface-checked'));
  expect(await bg(knob(toggle))).toBe(await tokenColor(page, '--toggle-knob-rest'));
});

test('a disabled toggle does not change and uses the disabled tokens', async ({ page }) => {
  const toggle = page.getByTestId('disabled');
  await expect(toggle).toBeDisabled();
  await label(toggle).click({ force: true });
  await expect(toggle).not.toBeChecked();
  expect(await bg(toggle)).toBe(await tokenColor(page, '--toggle-surface-unchecked-disabled'));
  expect(await bg(knob(toggle))).toBe(await tokenColor(page, '--toggle-knob-disabled'));
  expect(await label(toggle).evaluate((e) => getComputedStyle(e).color)).toBe(await tokenColor(page, '--text-minimal'));

  const disabledOn = page.locator('.bland-toggle__track:disabled:checked').first();
  expect(await bg(disabledOn)).toBe(await tokenColor(page, '--toggle-surface-checked-disabled'));
});

test('the focus ring shows on keyboard focus only, on the track', async ({ page }) => {
  const toggle = page.getByTestId('uncontrolled');
  const outline = () => toggle.evaluate((e) => getComputedStyle(e).outlineStyle);
  await toggle.click();
  expect(await outline()).toBe('none');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  expect(await outline()).toBe('solid');
});

test('under reduced motion the knob jumps, and the track color still transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const toggle = page.getByTestId('uncontrolled');
  expect(await knob(toggle).evaluate((e) => getComputedStyle(e).transitionProperty)).toBe('none');
  expect(await toggle.evaluate((e) => getComputedStyle(e).transitionProperty)).toBe('background-color');
});
