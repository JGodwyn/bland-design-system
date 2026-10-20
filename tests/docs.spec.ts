// The docs site: every page opens without errors, the theme switch works, demo controls drive the demo.
import { expect, test, type Page } from '@playwright/test';
import { storyIds } from './stories';

const stylePages = ['colors', 'typography', 'spacing', 'radius', 'stroke', 'elevation', 'motion', 'breakpoints', 'sizing', 'icons'];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  return errors;
}

for (const path of ['', ...stylePages.map((p) => `styles/${p}`), ...storyIds.map((id) => `components/${id}`)]) {
  test(`docs page /${path} opens without errors`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(`/#/${path}`);
    await expect(page.locator('.docs-page-header h1')).toBeVisible();
    await expect(page.locator('.docs-page-header h1')).not.toBeEmpty();
    expect(errors).toEqual([]);
  });
}

test('the theme switch sets and clears data-theme', async ({ page }) => {
  await page.goto('/#/styles/colors');
  const html = page.locator('html');
  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'Dark' }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('group', { name: 'Theme' }).getByRole('button', { name: 'System' }).click();
  await expect(html).not.toHaveAttribute('data-theme');
});

test('demo controls change the component and the code snippet', async ({ page }) => {
  await page.goto('/#/components/button');
  const demo = page.locator('.docs-demo-stage .bland-button');
  await expect(demo).toHaveAttribute('data-emotion', 'brand');
  await page.getByLabel('emotion').selectOption('danger');
  await expect(demo).toHaveAttribute('data-emotion', 'danger');
  await expect(page.locator('.docs-code').last()).toContainText('emotion="danger"');
  await page.getByLabel('children').fill('Delete file');
  await expect(demo).toContainText('Delete file');
});

test('every component page shows a props table with rows', async ({ page }) => {
  for (const id of storyIds) {
    await page.goto(`/#/components/${id}`);
    await expect(page.locator('.docs-table tbody tr').first()).toBeVisible();
  }
});

test('the playground previews focus and zooms with its buttons and the +, - and 0 keys', async ({ page }) => {
  await page.goto('/#/components/button');
  const demo = page.locator('.docs-demo-stage .bland-button');
  const outline = () => demo.evaluate((e) => getComputedStyle(e).outlineStyle);
  expect(await outline()).toBe('none');
  await page.getByLabel('focused').check();
  expect(await outline()).toBe('solid');

  const level = page.locator('.docs-zoom-level');
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(level).toHaveText('125%');
  await page.getByTestId('demo-stage').hover({ position: { x: 10, y: 10 } });
  await page.keyboard.press('+');
  await expect(level).toHaveText('150%');
  await page.keyboard.press('-');
  await page.keyboard.press('-');
  await expect(level).toHaveText('100%');
  await page.keyboard.press('-');
  await expect(level).toHaveText('75%');
  await page.keyboard.press('0');
  await expect(level).toHaveText('100%');

  // Keys only zoom while the pointer is over the playground.
  await page.mouse.move(1, 1);
  await page.keyboard.press('+');
  await expect(level).toHaveText('100%');
});

test('a trackpad pinch over the playground zooms it, and nowhere else', async ({ page }) => {
  await page.goto('/#/components/button');
  const level = page.locator('.docs-zoom-level');
  const box = (await page.getByTestId('demo-stage').boundingBox())!;
  // Chrome and Firefox report a pinch as a wheel event with ctrlKey; deltaY < 0 spreads the fingers.
  const pinch = (x: number, y: number, deltaY: number) =>
    page.evaluate(({ x, y, deltaY }) => {
      const event = new WheelEvent('wheel', { deltaY, ctrlKey: true, clientX: x, clientY: y, bubbles: true, cancelable: true });
      document.elementFromPoint(x, y)!.dispatchEvent(event);
      return event.defaultPrevented;
    }, { x, y, deltaY });

  expect(await pinch(box.x + 20, box.y + 20, -50)).toBe(true); // the page itself does not zoom
  await expect(level).not.toHaveText('100%');
  await pinch(box.x + 20, box.y + 20, 1000);
  await expect(level).toHaveText('50%');

  expect(await pinch(1, 1, -50)).toBe(false);
  await expect(level).toHaveText('50%');
});

test('focused is offered only for components that take keyboard focus', async ({ page }) => {
  const focused = page.locator('#ctl-focused');
  for (const id of ['button', 'pills']) {
    await page.goto(`/#/components/${id}`);
    await expect(focused, `${id} takes focus`).toBeVisible();
  }
  for (const id of ['icon', 'badge', 'indicator', 'avatar']) {
    await page.goto(`/#/components/${id}`);
    await expect(page.locator('.docs-demo-stage')).toBeVisible();
    await expect(focused, `${id} never takes focus`).toHaveCount(0);
  }
  // A Chip only takes focus through its remove button.
  await page.goto('/#/components/chip');
  await expect(focused).toHaveCount(0);
  await page.getByLabel('onRemove').check();
  await expect(focused).toBeVisible();
  await focused.check();
  await page.getByLabel('onRemove').uncheck();
  await expect(focused).toHaveCount(0);
});

test('zooming never changes the size of the playground', async ({ page }) => {
  await page.goto('/#/components/avatar');
  const view = page.locator('.docs-demo-view');
  const before = (await view.boundingBox())!;
  const zoomIn = page.getByRole('button', { name: 'Zoom in' });
  while (await zoomIn.isEnabled()) await zoomIn.click();
  await expect(page.locator('.docs-zoom-level')).toHaveText('400%');
  const after = (await view.boundingBox())!;
  expect([after.width, after.height]).toEqual([before.width, before.height]);
});

test('the Avatar demo builds its slot content from the controls', async ({ page }) => {
  await page.goto('/#/components/avatar');
  const stage = page.getByTestId('demo-stage');
  const code = page.locator('.docs-code code').last();
  await expect(stage.locator('[data-slot="top"]')).toHaveText('3');
  await page.locator('#ctl-topCount').fill('12');
  await expect(stage.locator('[data-slot="top"]')).toHaveText('12');
  await page.locator('#ctl-bottomSlot').selectOption('none');
  await expect(stage.locator('[data-slot="bottom"]')).toHaveCount(0);
  await expect(code).toContainText('topSlot={<Indicator ring size="lg" emotion="danger">12</Indicator>}');
  await expect(code).not.toContainText('bottomSlot');
});

test('the demo zoom keys leave date and time segments alone (0 types a zero)', async ({ page }) => {
  await page.goto('/#/components/date-picker');
  const stage = page.locator('.docs-demo-stage');
  const year = stage.getByRole('spinbutton', { name: /year/i });
  await stage.hover();
  await year.focus();
  await page.keyboard.type('2026');
  await expect(year).toHaveText('2026');
});
