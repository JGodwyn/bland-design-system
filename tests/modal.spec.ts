// Behaviour of Modal: opening from a press or the keyboard, focus in and back, Escape, the backdrop, a form,
// scroll lock, long content, narrow screens, motion, and screenshots of open dialogs.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const dialog = (page: Page, id: string) => page.getByTestId(id);

test.beforeEach(async ({ page }) => {
  await openStory(page, 'modal', 'light');
});

test('a press opens it with motion, focuses the dialog, names and describes it; Cancel closes and returns focus', async ({ page }) => {
  const trigger = page.getByTestId('basic-trigger');
  const modal = dialog(page, 'basic-modal');
  // React Aria sets no aria-haspopup for a dialog trigger (screen readers announce "dialog" poorly), only aria-expanded.
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(modal).toBeHidden();
  await trigger.click();
  await expect(page.getByRole('dialog', { name: 'Discard changes?' })).toBeVisible();
  await expect(modal).not.toHaveAttribute('data-instant');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(modal).toBeFocused();
  await expect(modal).toHaveAccessibleDescription(/Your changes to this file will be lost/);
  // The page behind is inert: Tab moves to the first control inside.
  await page.keyboard.press('Tab');
  await expect(modal.getByRole('button', { name: 'Close' })).toBeFocused();
  await modal.getByRole('button', { name: 'Cancel' }).click();
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('the keyboard opens it at once; Escape closes it and focus returns', async ({ page }) => {
  const trigger = page.getByTestId('basic-trigger');
  const modal = dialog(page, 'basic-modal');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(modal).toBeVisible();
  await expect(modal).toHaveAttribute('data-instant', 'true');
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
  // Mounting closed Modals never moved focus, and a second open works the same.
  await page.keyboard.press('Enter');
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'Close' }).click();
  await expect(modal).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('a press on the backdrop closes it, unless dismissable is false', async ({ page }) => {
  await page.getByTestId('basic-trigger').click();
  await expect(dialog(page, 'basic-modal')).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(dialog(page, 'basic-modal')).toBeHidden();

  await page.getByTestId('alert-trigger').click();
  const alert = page.getByRole('alertdialog', { name: 'Delete project?' });
  await expect(alert).toBeVisible();
  await page.mouse.click(5, 5);
  await expect(alert).toBeVisible();
  // A press inside never closes it either.
  await alert.getByText('This deletes every file').click();
  await expect(alert).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(alert).toBeHidden();
  await expect(page.getByTestId('alert-trigger')).toBeFocused();
});

test('right alignment puts the primary last, in the DOM too', async ({ page }) => {
  await page.getByTestId('alert-trigger').click();
  const names = await dialog(page, 'alert-modal').locator('.bland-modal__actions button').allTextContents();
  expect(names).toEqual(['Cancel', 'Delete']);
});

test('autoFocus inside wins; a form submits from the action bar and closes it', async ({ page }) => {
  await page.getByTestId('form-trigger').click();
  const modal = dialog(page, 'form-modal');
  const input = modal.getByLabel('File name');
  await expect(input).toBeFocused();
  await input.fill('Roadmap');
  await page.keyboard.press('Enter');
  await expect(modal).toBeHidden();
  await expect(page.getByTestId('saved-name')).toHaveText('Roadmap');
  await expect(page.getByTestId('form-trigger')).toBeFocused();
  // Opening again starts with a fresh form.
  await page.getByTestId('form-trigger').click();
  await modal.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByTestId('saved-name')).toHaveText('Roadmap');
});

test('the page does not scroll while it is open', async ({ page }) => {
  await page.getByTestId('basic-trigger').click();
  await expect(dialog(page, 'basic-modal')).toBeVisible();
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test('long content: it keeps Layout/margin-mobile from the screen edge and the body scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 500 });
  // From the keyboard, so it opens without the scale and the box can be measured at once.
  await page.getByTestId('long-trigger').focus();
  await page.keyboard.press('Enter');
  const modal = dialog(page, 'long-modal');
  await expect(modal).toBeVisible();
  const margin = await page.evaluate(() => {
    const zoom = document.querySelector<HTMLElement>('[data-testid="long-modal"]')!.currentCSSZoom;
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin-mobile')) * zoom;
  });
  const box = (await modal.boundingBox())!;
  expect(Math.round(box.y)).toBe(Math.round(margin));
  expect(Math.round(500 - box.y - box.height)).toBe(Math.round(margin));
  await expect(modal.locator('.bland-modal__scroll')).toHaveAttribute('data-overflow');
  await expect(modal.getByRole('button', { name: 'Confirm' })).toBeInViewport();
  await expect(modal.getByRole('heading', { name: 'Terms' })).toBeInViewport();
});

test('on a narrow screen the actions stack full width, primary on top', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 700 });
  await page.getByTestId('basic-trigger').focus();
  await page.keyboard.press('Enter');
  const modal = dialog(page, 'basic-modal');
  const confirm = (await modal.getByRole('button', { name: 'Confirm' }).boundingBox())!;
  const cancel = (await modal.getByRole('button', { name: 'Cancel' }).boundingBox())!;
  expect(confirm.y).toBeLessThan(cancel.y);
  expect(Math.round(confirm.width)).toBe(Math.round(cancel.width));
  // It never comes closer than the margin to the sides either.
  const box = (await modal.boundingBox())!;
  expect(box.x).toBeGreaterThan(0);
  expect(box.x + box.width).toBeLessThan(480);
});

test('reduced motion keeps the fade and drops the scale', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('basic-trigger').click();
  const modal = dialog(page, 'basic-modal');
  await expect(modal).toBeVisible();
  const props = await modal.evaluate((e) => getComputedStyle(e).transitionProperty);
  expect(props).not.toContain('transform');
});

test('the backdrop dims the page with its Modal/backdrop step: subtle by default, bold on the alert', async ({ page }) => {
  const backdropOf = (id: string) => dialog(page, id).evaluate((d) => getComputedStyle(d, '::backdrop').backgroundColor);
  const token = (name: string) =>
    page.evaluate((n) => {
      const probe = document.createElement('div');
      probe.style.background = `var(${n})`;
      document.body.append(probe);
      const c = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return c;
    }, name);
  await page.getByTestId('basic-trigger').focus();
  await page.keyboard.press('Enter');
  expect(await backdropOf('basic-modal')).toBe(await token('--modal-backdrop-subtle'));
  await page.keyboard.press('Escape');
  await page.getByTestId('alert-trigger').focus();
  await page.keyboard.press('Enter');
  expect(await backdropOf('alert-modal')).toBe(await token('--modal-backdrop-bold'));
  expect(await token('--modal-backdrop-bold')).not.toBe(await token('--modal-backdrop-subtle'));
});

for (const theme of ['light', 'dark'] as const) {
  test(`an open modal looks the same (${theme})`, async ({ page }) => {
    await openStory(page, 'modal', theme);
    const trigger = page.getByTestId('alert-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog(page, 'alert-modal')).toBeVisible();
    await expect(page).toHaveScreenshot(`modal-open-${theme}.png`);
  });
}
