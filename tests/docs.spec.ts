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

for (const path of ['', 'brand', ...stylePages.map((p) => `styles/${p}`), ...storyIds.map((id) => `components/${id}`)]) {
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

test('the brand page makes a scale from a picked color with tinted or gray neutrals, fixes its contrast, applies it to every page and resets', async ({ page }) => {
  await page.goto('/#/brand');
  const html = page.locator('html');
  const brand = (step: string) => html.evaluate((el, s) => el.style.getPropertyValue(`--brand-${s}`), step);
  const apply = page.getByRole('button', { name: 'Apply to site' });
  await expect(apply).toBeDisabled(); // Bland's own blue: nothing to reset or apply
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
  await expect(page.locator('.docs-brand-contrast')).toBeHidden(); // nothing to report on Bland's own palette
  // Changing only the neutral tint leaves the brand Bland's: still nothing to report.
  await page.getByRole('radio', { name: 'Pure gray' }).check({ force: true });
  await expect(page.locator('.docs-brand-contrast')).toBeHidden();
  await page.getByRole('radio', { name: 'Tinted' }).check({ force: true });

  // The swatch opens the picker; a typed hex lands on the step its lightness belongs on (orange: 400).
  await page.getByRole('button', { name: /^Brand color #0062FF/ }).click();
  await page.getByRole('textbox', { name: 'HEX color' }).fill('#ff5a1f');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /^Brand color #FF5A1F/ })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Brand steps' })).toContainText('400#ff5a1f');
  await expect(page.getByText('Contrast warning')).toBeVisible();
  await page.getByRole('button', { name: 'Show breakdown' }).click();
  await expect(page.getByRole('table', { name: 'Pairings below their minimum' })).toContainText('Progress fill');
  // The only miss is the entered color's own: the fix may not move it.
  await expect(page.getByRole('table', { name: 'Pairings below their minimum' })).toContainText('Step 400 is your color');
  await expect(page.getByRole('button', { name: 'Fix contrast' })).toBeDisabled();

  // The field switches format (kept for the next visit) and reads what is typed in it.
  await page.getByRole('button', { name: /^Brand color #/ }).click();
  const picker = page.getByRole('dialog', { name: 'Pick a brand color' });
  await picker.getByRole('button', { name: 'Color format: HEX' }).click();
  await page.getByRole('menuitemradio', { name: 'HSL' }).click();
  await expect(picker.getByRole('textbox', { name: 'HSL color' })).toHaveValue('15.8 100% 56.1%');
  await picker.getByRole('textbox', { name: 'HSL color' }).fill('48 100% 50%');
  await expect(page.getByRole('button', { name: /^Brand color #FFCC00/ })).toBeVisible();
  await picker.getByRole('button', { name: 'Color format: HSL' }).click();
  await page.getByRole('menuitemradio', { name: 'HEX' }).click();
  // Dragging in the picker hides the contrast result until the pointer is released.
  const result = page.locator('.docs-brand-contrast');
  const area = (await picker.getByRole('slider', { name: 'Saturation and brightness' }).boundingBox())!;
  await page.mouse.move(area.x + area.width * 0.9, area.y + area.height * 0.1);
  await page.mouse.down();
  await page.mouse.move(area.x + area.width * 0.95, area.y + area.height * 0.05, { steps: 4 });
  await expect(result).toBeHidden(); // out of the layout, not just invisible
  await page.mouse.up();
  await expect(result).toBeVisible();
  await picker.getByRole('textbox', { name: 'HEX color' }).fill('#ffcc00');
  await page.keyboard.press('Escape');
  await expect(picker).toBeHidden();
  await page.getByRole('button', { name: 'Fix contrast' }).click();
  await expect(page.getByText('Contrast checks out')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Brand color #FFCC00/ })).toBeVisible(); // the fix never changes the entered color
  await apply.click();
  await expect(page.getByRole('button', { name: 'Applied to site' })).toBeDisabled();
  expect(await brand('200')).toBe('#ffcc00');
  const applied = await brand('600');
  expect(applied).toMatch(/^#[0-9a-f]{6}$/);

  // The neutrals lean toward the brand by default; Pure gray takes the hue out.
  const neutral600 = () => html.evaluate((el) => el.style.getPropertyValue('--neutral-600'));
  const tinted = await neutral600();
  expect(tinted).toMatch(/^#[0-9a-f]{6}$/);
  expect(tinted).not.toBe('#576275');
  await page.getByRole('radio', { name: 'Pure gray' }).check({ force: true }); // the radio covers its label, as in the theme switch
  await page.getByRole('button', { name: 'Apply to site' }).click();
  const gray = await neutral600();
  expect(gray.slice(1, 3)).toBe(gray.slice(3, 5));
  expect(gray.slice(3, 5)).toBe(gray.slice(5, 7));

  // It carries to other pages and survives a reload.
  await page.goto('/#/components/button');
  await page.reload();
  expect(await brand('600')).toBe(applied);
  expect(await neutral600()).toBe(gray);
  const fill = await page.locator('.docs-content .bland-button[data-emotion="brand"][data-type="primary"]').first().evaluate((el) => getComputedStyle(el).getPropertyValue('--_bg').trim());
  expect(fill).toBe(applied);

  await page.goto('/#/brand');
  await expect(page.getByRole('button', { name: /^Brand color #FFCC00/ })).toBeVisible();
  // Extra colors (their own tab): up to three, named, with their steps and light/dark roles in the CSS; Reset clears them.
  await page.goto('/#/brand');
  const tab = (name: string) => page.getByRole('tab', { name });
  await tab('Extra colors').click();
  await expect(page.getByText('No colors added')).toBeVisible();
  await expect(page.locator('#preview')).toHaveCount(0); // no extras, no preview on this tab
  const add = page.getByRole('button', { name: 'Add color' });
  for (let i = 0; i < 3; i++) await add.click();
  await expect(add).toBeDisabled();
  const names = page.getByRole('textbox', { name: 'Name' });
  await names.first().fill('surface');
  await expect(page.getByText('Bland already uses --surface-…; pick another name.')).toBeVisible();
  await names.first().fill('chart');
  // Its roles show the value for the page's theme.
  await expect(page.getByRole('list', { name: 'Roles of chart' })).toContainText(/--chart-surface\s*#[0-9a-f]{6}/, { useInnerText: true });
  await tab('How to use').click();
  const css = page.locator('#use-in-a-project pre');
  await expect(css).toContainText(/--chart-600: #[0-9a-f]{6};/);
  await expect(css).toContainText('--chart-surface: var(--chart-400);');
  await tab('Extra colors').click();
  await page.getByRole('button', { name: /^Remove/ }).last().click();
  await expect(add).toBeEnabled();

  await tab('Brand colors').click();
  // Reset warns first, naming what goes; Cancel keeps everything.
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  const warning = page.getByRole('dialog', { name: 'Reset to Bland’s colors?' });
  await expect(warning).toContainText('Your brand color #FFCC00 goes back to Bland’s blue #0062FF and every page of this site goes back to Bland’s colors. Your 2 extra accent colors will be removed too.');
  await warning.getByRole('button', { name: 'Cancel' }).click();
  await expect(warning).toBeHidden();
  expect(await brand('600')).not.toBe('');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await warning.getByRole('button', { name: 'Reset colors' }).click();
  await expect(warning).toBeHidden();
  await expect(page.locator('.docs-brand-contrast')).toBeHidden();
  expect(await brand('600')).toBe('');
  expect(await neutral600()).toBe('');
  await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeDisabled();
  await tab('Extra colors').click();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveCount(0);
  // An extra on Bland's own brand shows its own result, never one for the brand.
  await add.click();
  await expect(page.locator('.docs-brand-contrast')).toBeVisible();
  await tab('Brand colors').click();
  await expect(page.locator('.docs-brand-contrast')).toBeHidden();
});

