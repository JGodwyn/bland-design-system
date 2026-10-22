// The docs site: every page opens without errors, the theme switch works, demo controls drive the demo,
// the code view shows a whole file, and the search finds pages.
import { expect, test, type Page } from '@playwright/test';
import { pickOption, storyIds } from './stories';

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

test('the theme switch follows the system until one is picked, then remembers it', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/#/styles/colors');
  const html = page.locator('html');
  const theme = page.getByRole('radiogroup', { name: 'Theme' });
  await expect(html).not.toHaveAttribute('data-theme');
  await expect(theme.getByRole('radio', { name: 'Dark' })).toBeChecked();
  await theme.getByRole('radio', { name: 'Light' }).check({ force: true }); // the radio is visually hidden under its label
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(theme.getByRole('radio', { name: 'Light' })).toBeChecked();
});

test('demo controls change the component and the code snippet', async ({ page }) => {
  await page.goto('/#/components/button');
  const demo = page.locator('.docs-demo-stage .bland-button');
  await expect(demo).toHaveAttribute('data-emotion', 'brand');
  await pickOption(page, 'emotion', 'danger');
  await expect(demo).toHaveAttribute('data-emotion', 'danger');
  await expect(page.locator('.docs-example-code')).toContainText('emotion="danger"');
  await page.getByLabel('label', { exact: true }).fill('Delete file');
  await expect(demo).toContainText('Delete file');
});

test('the code view shows a whole file: the imports and a component', async ({ page }) => {
  await page.goto('/#/components/button');
  const code = page.locator('.docs-example-code code');
  await expect(code).toContainText("import { Button, PlusIcon } from 'bland';");
  await expect(code).toContainText('export function Example() {');
  await expect(code).toContainText('iconStart={<PlusIcon />}');
});

test('search opens with the shortcut, finds pages and other mentions, and goes to a result', async ({ page }) => {
  await page.goto('/#/components/button');
  await page.keyboard.press('ControlOrMeta+k');
  const dialog = page.getByRole('dialog', { name: 'Search Bland' });
  await expect(dialog).toBeVisible();
  const field = dialog.getByRole('combobox', { name: 'Search Bland' });
  // It opens resting on the first result, Colors; the arrows move the highlight, focus stays in the field.
  await expect(field).toBeFocused();
  await expect(dialog.getByRole('option', { selected: true })).toHaveText('Colors');
  await field.press('ArrowDown');
  await expect(dialog.getByRole('option', { selected: true })).toHaveText('Typography');
  await expect(field).toBeFocused();
  await field.fill('numeric');
  await expect(dialog.getByRole('option', { name: 'Numeric Input Field', exact: true })).toBeVisible();
  await field.fill('surface-100');
  await expect(dialog.getByText('Other results')).toBeVisible();
  await field.fill('nothing matches this');
  await expect(dialog.getByText('Nothing found')).toBeVisible();
  await field.fill('numeric');
  await field.press('Enter');
  await expect(page).toHaveURL(/#\/components\/numeric-input-field$/);
  await expect(dialog).toBeHidden();
});

test('the previous and next buttons walk the sidebar order', async ({ page }) => {
  await page.goto('/#/components/alert');
  await page.getByRole('button', { name: 'Next: Avatar' }).click();
  await expect(page.locator('.docs-page-header h1')).toHaveText('Avatar');
  await page.getByRole('button', { name: 'Previous: Alert' }).click();
  await expect(page.locator('.docs-page-header h1')).toHaveText('Alert');
});

test('the toolbar stays at the top, and the contents rail scrolls a section to just under it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/components/button');
  const toolbar = page.locator('.docs-toolbar');
  await page.getByRole('navigation', { name: 'On this page' }).getByRole('button', { name: 'Button props', exact: true }).click();
  await expect(toolbar).toHaveAttribute('data-stuck');
  await expect.poll(async () => Math.round((await page.locator('#props-Button').boundingBox())!.y)).toBe(80);
  expect((await toolbar.boundingBox())!.y).toBe(0);
});

test('every component page shows a props table with rows', async ({ page }) => {
  for (const id of storyIds) {
    await page.goto(`/#/components/${id}`);
    await expect(page.locator('.docs-props tbody tr').first()).toBeVisible();
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
  const code = page.locator('.docs-example-code code');
  await expect(stage.locator('[data-slot="top"]')).toHaveText('3');
  await page.locator('#ctl-topCount').fill('12');
  await expect(stage.locator('[data-slot="top"]')).toHaveText('12');
  await pickOption(page, 'bottomSlot', 'none');
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
