// The docs site: every page opens without errors, the theme switch works, demo controls drive the demo,
// the code view shows a whole file, and the search finds pages.
import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { pickOption, storyIds } from './stories';

const stylePages = ['colors', 'typography', 'spacing', 'radius', 'stroke', 'elevation', 'motion', 'breakpoints', 'grid', 'sizing', 'icons'];

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
  await expect(code).toContainText("import { Button, PlusIcon } from 'bland-ui';");
  await expect(code).toContainText('export function Example() {');
  await expect(code).toContainText('iconStart={<PlusIcon />}');
});

test('search opens with the shortcut, finds pages and other mentions, and goes to a result', async ({ page }) => {
  await page.goto('/#/components/button');
  await page.keyboard.press('ControlOrMeta+k');
  const dialog = page.getByRole('dialog', { name: 'Search Bland' });
  await expect(dialog).toBeVisible();
  const field = dialog.getByRole('combobox', { name: 'Search Bland' });
  // It opens resting on the first result, Brand theme; the arrows move the highlight, focus stays in the field.
  await expect(field).toBeFocused();
  await expect(dialog.getByRole('option', { selected: true })).toHaveText('Brand theme');
  await field.press('ArrowDown');
  await expect(dialog.getByRole('option', { selected: true })).toHaveText('Colors');
  await expect(field).toBeFocused();
  await field.fill('brand');
  await expect(dialog.getByRole('option', { name: 'Brand theme', exact: true })).toBeVisible();
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
  await expect(page.getByRole('table', { name: 'Color pairs that are hard to read' })).toContainText('Progress fill');
  // The only miss is the entered color's own: the fix may not move it.
  await expect(page.getByRole('table', { name: 'Color pairs that are hard to read' })).toContainText('Step 400 is your color');
  await expect(page.getByRole('button', { name: 'Fix contrast' })).toHaveCount(0);
  await expect(page.getByText('because of your color itself, which stays exactly as you picked it')).toBeVisible();

  // The field switches format (kept for the next visit) and reads what is typed in it.
  await page.getByRole('button', { name: /^Brand color #/ }).click();
  const picker = page.getByRole('dialog', { name: 'Pick a brand color' });
  await picker.getByRole('button', { name: 'Color format: HEX' }).click();
  await page.getByRole('menuitemradio', { name: 'HSL' }).click();
  // One field per number, so values can't run together; units sit beside them.
  const hsl = picker.getByRole('group', { name: 'HSL color' });
  await expect(hsl.getByRole('textbox', { name: 'Hue' })).toHaveValue('15.8');
  await expect(hsl.getByRole('textbox', { name: 'Saturation' })).toHaveValue('100');
  await expect(hsl.getByRole('textbox', { name: 'Lightness' })).toHaveValue('56.1');
  await hsl.getByRole('textbox', { name: 'Lightness' }).fill('50');
  await hsl.getByRole('textbox', { name: 'Hue' }).fill('48');
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
  await expect(result).toBeHidden(); // nothing misses: no banner at all, not a "checks out" one
  await expect(page.getByText('Contrast checks out')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Brand color #FFCC00/ })).toBeVisible(); // the fix never changes the entered color
  // Leaving the page and coming back keeps the color and its fix.
  await page.goto('/#/styles/colors');
  await page.goto('/#/brand');
  await expect(page.getByRole('button', { name: /^Brand color #FFCC00/ })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Brand steps' })).toContainText('200#ffcc00');
  await expect(page.getByText('Contrast warning')).toBeHidden();
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
  await expect(page.getByText('Bland uses --chart-1 … --chart-8 for the chart palette; pick another name.')).toBeVisible();
  await names.first().fill('charts');
  // Its roles show the value for the page's theme.
  await expect(page.getByRole('list', { name: 'Roles of charts' })).toContainText(/--charts-surface\s*#[0-9a-f]{6}/, { useInnerText: true });
  await tab('How to use').click();
  const css = page.locator('#use-in-a-project pre');
  await expect(css).toContainText(/--charts-600: #[0-9a-f]{6};/);
  await expect(css).toContainText('--charts-surface: var(--charts-400);');
  // The chart palette follows: the brand, then the extras in order.
  await expect(css).toContainText('--chart-1: var(--brand-600);');
  await expect(css).toContainText('--chart-2: var(--charts-600);');
  await tab('Extra colors').click();
  await page.getByRole('button', { name: /^Remove/ }).last().click();
  await expect(add).toBeEnabled();

  await tab('Brand colors').click();
  // Reset warns first (extras go too, no undo); Cancel keeps everything.
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  const warning = page.getByRole('dialog', { name: 'Reset to Bland’s colors?' });
  await expect(warning).toContainText('Reset this color to Bland’s default color. Your 2 extra accent colors will also be removed. You can’t undo this.');
  await expect(warning).toContainText('Copy the CSS under How to use first');
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


test('the brand page shows the chart palette in both themes, takes your own picks, checks it in plain words, and puts it in the preview chart and the CSS', async ({ page }) => {
  await page.goto('/#/brand');
  // Bland ships its own palette in tokens.css: the brand first, then generated hexes.
  const root = (name: string) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
  expect(await root('--chart-1')).toBe(await root('--brand-600'));
  expect(await root('--chart-8')).toMatch(/^#[0-9a-f]{6}$/);

  await page.getByRole('tab', { name: 'Chart colors' }).click();
  const list = page.getByRole('list', { name: 'Chart colors' });
  const item = (n: number) => list.getByRole('listitem').nth(n - 1);
  await expect(list.getByRole('listitem')).toHaveCount(8);
  // Each color is a block like an extra color's: its token, where it comes from, its card and its own check.
  await expect(item(1)).toContainText(/--chart-1\s*Brand color\s*You can’t change this\s*#0062FF/, { useInnerText: true });
  await expect(item(1)).not.toContainText('Tap to change'); // the brand changes under Brand colors
  await expect(item(2)).toContainText('Tap to change');
  // Only a problem shows: no "checks out" banner on any color.
  await expect(list.locator('.docs-brand-chart-check:visible')).toHaveCount(0);
  const reset = page.getByRole('button', { name: 'Use Bland’s picks' });
  await expect(reset).toBeDisabled();
  // The swatch shows the color for the page's theme.
  await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'Dark' }).check({ force: true });
  await expect(item(1)).toContainText('#659CFF');
  await page.getByRole('radiogroup', { name: 'Theme' }).getByRole('radio', { name: 'Light' }).check({ force: true });
  await expect(item(1)).toContainText('#0062FF');

  // Your own color keeps its place; its check speaks plainly, and Fix color names the color it moves to.
  await item(3).getByRole('button', { name: /^Series 3 #/ }).click();
  await page.getByRole('textbox', { name: 'HEX color' }).fill('#f4f000');
  await page.keyboard.press('Escape');
  await expect(item(3).getByRole('button', { name: 'Series 3 #F4F000, change it' })).toBeVisible();
  await expect(item(3)).toContainText('This color needs a change');
  await expect(item(3)).toContainText('Too faint on the white page.'); // said of this color, on this color
  await expect(item(3).locator('.docs-brand-chart-check')).not.toContainText('Series 3');
  await expect(item(3)).not.toContainText(/ΔE|protan|deutan|tritan|:1/);
  await expect(item(3)).toContainText(/Too faint on the white page\. (.+\. )?Fixing this color changes it to #[0-9A-F]{6}\./);
  await page.getByRole('tab', { name: 'How to use' }).click();
  await expect(page.locator('#use-in-a-project pre')).toContainText('--chart-3: #f4f000; /* picked */');
  await page.getByRole('tab', { name: 'Chart colors' }).click();
  await item(3).getByRole('button', { name: 'Fix color' }).click();
  await expect(item(3).locator('.docs-brand-chart-check')).toBeHidden();
  await expect(item(3).getByRole('button', { name: /^Series 3 #/ })).not.toHaveAccessibleName('Series 3 #F4F000, change it');
  await item(3).getByRole('button', { name: 'Series 3: back to Bland’s pick' }).click();
  await expect(item(3)).toContainText('Bland’s pick');
  // A clash between two of your colors shows on the one you just changed.
  const pick = async (n: number, hex: string) => {
    await item(n).getByRole('button', { name: new RegExp(`^Series ${n} #`) }).click();
    await page.getByRole('textbox', { name: 'HEX color' }).fill(hex);
    await page.keyboard.press('Escape');
  };
  await pick(4, '#854d38');
  await pick(5, '#7a5040');
  // Visible only: a folded warning keeps its words while it leaves.
  const clash = (n: number, other: number) => item(n).locator('.docs-brand-chart-check:visible', { hasText: `--chart-${other}` });
  await expect(clash(5, 4)).toHaveCount(1);
  await expect(clash(4, 5)).toHaveCount(0);
  await pick(4, '#7d4f3c');
  await expect(clash(4, 5)).toHaveCount(1);
  await expect(clash(5, 4)).toHaveCount(0);
  await expect(reset).toBeEnabled();
  await reset.click();
  await expect(reset).toBeDisabled();

  // Each preview sets the palette for its own theme, and its sample chart draws every series.
  const previews = page.locator('.docs-brand-preview');
  const series = (i: number, n: number) => previews.nth(i).evaluate((el, k) => getComputedStyle(el).getPropertyValue(`--chart-${k}`).trim(), n);
  expect(await series(0, 1)).toBe('#0062ff');
  expect(await series(1, 1)).toBe('#659cff');
  expect(await series(0, 8)).toBe(await root('--chart-8'));
  await expect(previews.first().locator('.docs-brand-chart-track').first().locator('span')).toHaveCount(8);
  await expect(previews.first().getByText('Series 8')).toBeVisible();

  // An extra color goes to series 2, but your pick there stays, over it, until Use Bland's pick; changing the
  // extra's color leaves it alone. Every color but the brand's can be picked, an extra's too.
  await pick(2, '#2b2bd0');
  await page.getByRole('tab', { name: 'Extra colors' }).click();
  await page.getByRole('button', { name: 'Add color' }).click();
  await page.getByRole('tab', { name: 'Chart colors' }).click();
  await expect(item(2).getByRole('button', { name: 'Series 2 #2B2BD0, change it' })).toBeVisible();
  await expect(item(2).getByRole('button', { name: 'Series 2: back to Bland’s pick' })).toBeVisible();
  await page.getByRole('tab', { name: 'Extra colors' }).click();
  await page.getByRole('button', { name: /^Extra color accent #/ }).click();
  await page.getByRole('textbox', { name: 'HEX color' }).fill('#e11d48');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Chart colors' }).click();
  await expect(item(2).getByRole('button', { name: 'Series 2 #2B2BD0, change it' })).toBeVisible();
  await item(2).getByRole('button', { name: 'Series 2: back to Bland’s pick' }).click();
  await expect(item(2)).toContainText('Extra color accent');
  await expect(item(2)).toContainText('Tap to change');
  await page.getByRole('tab', { name: 'How to use' }).click();
  const css = page.locator('#use-in-a-project pre');
  await expect(css).toContainText('--chart-2: var(--accent-600);');
  await expect(css).toContainText('--chart-1: var(--brand-400);');
});

test('the page grid keeps columns on the 8 grid, leaves the rest to the margins, and switches at md and xl', async ({ page }) => {
  await page.goto('/#/styles/grid');
  const grid = page.locator('.docs-grid-live .bland-grid');
  const read = () =>
    grid.evaluate((g) => ({
      columns: getComputedStyle(g).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(g).columnGap,
      spans: [...g.children].map((c) => getComputedStyle(c).gridColumnStart),
    }));
  for (const [width, expected] of [
    [375, { columns: 4, gap: '8px', spans: ['span 4', 'span 4', 'span 4', 'span 2', 'span 2'] }],
    [800, { columns: 6, gap: '16px', spans: ['span 6', 'span 3', 'span 3', 'span 2', 'span 4'] }],
    [1440, { columns: 8, gap: '16px', spans: ['span 8', 'span 2', 'span 2', 'span 2', 'span 2'] }],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(read).toEqual(expected);
  }
  // A page grid at the Figma frame widths: column width and margins as in the Figma grid styles.
  // overflow hidden, so the window's scrollbar does not take width the Figma frames don't have.
  const measure = () =>
    page.evaluate(() => {
      document.documentElement.style.overflow = 'hidden';
      const g = document.createElement('div');
      g.className = 'bland-grid';
      g.innerHTML = '<div style="--span: 2"><div class="bland-grid" data-inset><i></i></div></div><div style="--span: 12"></div>';
      document.body.prepend(g);
      const cols = getComputedStyle(g).gridTemplateColumns.split(' ');
      const first = g.children[0]!.getBoundingClientRect();
      const out = {
        column: cols[0],
        margin: first.left - document.body.getBoundingClientRect().left,
        nested: getComputedStyle(g.querySelector('[data-inset] > i')!).gridColumnStart,
        cut: getComputedStyle(g.children[1]!).gridColumnStart,
      };
      g.remove();
      document.documentElement.style.overflow = '';
      return out;
    });
  for (const [width, column, margin, all] of [
    [360, '72px', 24, 'span 4'],
    [768, '104px', 32, 'span 6'],
    [912, '128px', 32, 'span 6'],
    [1024, '144px', 40, 'span 6'],
    [1280, '128px', 72, 'span 8'],
    [1440, '128px', 152, 'span 8'],
    [1536, '144px', 136, 'span 8'],
    [1920, '160px', 264, 'span 8'],
    [2560, '160px', 584, 'span 8'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    expect(await measure()).toEqual({ column, margin, nested: all, cut: all });
  }
});

test('the Grid page sits on its own grid, and Shift+G or the switch shows its columns', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/styles/grid');
  const overlay = page.locator('.docs-grid-overlay');
  await expect(overlay).toBeHidden();
  await page.keyboard.press('Shift+G');
  await expect(overlay).toBeVisible();
  const columns = await overlay.locator('span').evaluateAll((spans) =>
    spans.filter((s) => getComputedStyle(s).display !== 'none').map((s) => Math.round(s.getBoundingClientRect().left)),
  );
  expect(columns).toHaveLength(8);
  // The page header, a section and a note start on the first column.
  for (const selector of ['.docs-page-header', '.docs-grid-page > .docs-section', '.docs-grid-page .docs-section > .docs-note'])
    expect(Math.round((await page.locator(selector).first().boundingBox())!.x)).toBe(columns[0]);
  await expect(page.getByRole('button', { name: 'Show columns' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Hide columns' }).click();
  await expect(overlay).toBeHidden();
  await page.getByRole('button', { name: 'Show columns' }).click();
  await expect(overlay).toBeVisible();
});

// The Fonts tab's tests load a real font file (Geist Mono's, from its npm package) under made-up family names, so
// the page can tell it apart from the fallback, and never touch the network: Google Fonts is mocked.
const fontFile = readFileSync('node_modules/@fontsource/geist-mono/files/geist-mono-latin-400-normal.woff2');
const rootVar = (page: Page, name: string) => page.locator('html').evaluate((el, n) => el.style.getPropertyValue(n), name);
const computedVar = (page: Page, name: string) => page.locator('html').evaluate((el, n) => getComputedStyle(el).getPropertyValue(n).trim(), name);
const fontOf = (page: Page, selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);
async function openFonts(page: Page) {
  await page.goto('/#/brand');
  await page.getByRole('tab', { name: 'Fonts' }).click();
}

test('the Fonts tab uses a font on this computer on every page, headings follow the body font until set, and Reset goes back to Inter', async ({ page }) => {
  // "Installed Test" stands in for a font installed on the computer: the page can draw it, but loaded nothing for it.
  await page.addInitScript((bytes) => {
    const face = new FontFace('Installed Test', new Uint8Array(bytes).buffer);
    document.fonts.add(face);
    void face.load();
  }, [...fontFile]);
  await openFonts(page);
  const body = page.getByRole('region', { name: 'Body' });
  const heading = page.getByRole('region', { name: 'Heading' });
  await expect(body).toContainText('Inter (Bland’s)');
  await expect(heading).toContainText('Same as body');

  await body.getByRole('textbox', { name: 'Body font' }).fill('Nope Sans 123');
  await body.getByRole('button', { name: 'Use font' }).click();
  await expect(body).toContainText('Not found on this computer; try Google Fonts or upload the file.');
  expect(await rootVar(page, '--font-body')).toBe('');

  await body.getByRole('textbox', { name: 'Body font' }).fill('Installed Test');
  await body.getByRole('button', { name: 'Use font' }).click();
  await expect(body).toContainText('Found on this computer. Every page uses it now.');
  expect(await rootVar(page, '--font-body')).toBe('"Installed Test", system-ui, sans-serif');
  // Headings follow the body font while their own is not set.
  expect(await rootVar(page, '--font-heading')).toBe('');
  expect(await computedVar(page, '--font-heading')).toBe('"Installed Test", system-ui, sans-serif');
  expect(await fontOf(page, '.docs-font-sample[data-role="heading"]')).toContain('Installed Test');
  expect(await fontOf(page, '.docs-page-header h1')).toContain('Installed Test');
  expect(await fontOf(page, '.docs-font-sample[data-role="code"]')).toContain('Geist Mono');

  // Every page follows, component demos included, and a reload keeps it.
  await page.goto('/#/components/button');
  await expect(page.locator('.docs-page-header h1')).toBeVisible();
  expect(await fontOf(page, '.docs-content .bland-button')).toContain('Installed Test');
  await page.reload();
  expect(await rootVar(page, '--font-body')).toBe('"Installed Test", system-ui, sans-serif');

  await openFonts(page);
  await expect(body).toContainText('Now: Installed Test, installed.');
  await page.getByRole('tab', { name: 'How to use' }).click();
  const css = page.locator('#use-in-a-project pre').first();
  await expect(css).toContainText('--font-body: "Installed Test", system-ui, sans-serif;');
  await expect(css).not.toContainText('--font-heading');
  await expect(page.locator('.docs-font-link')).toHaveCount(0);

  await page.getByRole('tab', { name: 'Fonts' }).click();
  await page.getByRole('button', { name: 'Reset fonts' }).click();
  expect(await rootVar(page, '--font-body')).toBe('');
  expect(await fontOf(page, '.docs-page-header h1')).toContain('Inter');
  await expect(body).toContainText('Inter (Bland’s)');
  await expect(page.getByRole('button', { name: 'Reset fonts' })).toBeDisabled();
});

test('the Fonts tab loads a Google font, says plainly when Google has none by that name, and adds its link to the CSS', async ({ page }) => {
  const asked: string[] = [];
  await page.route('https://fonts.googleapis.com/css2**', (route) => {
    const family = new URL(route.request().url()).searchParams.get('family') ?? '';
    asked.push(family);
    const headers = { 'access-control-allow-origin': '*' };
    if (!family.startsWith('Test Serif')) return route.fulfill({ status: 400, headers, body: 'Font family not found' });
    return route.fulfill({ headers, contentType: 'text/css', body: "@font-face { font-family: 'Test Serif'; font-weight: 600; src: url(https://fonts.gstatic.com/s/testserif.woff2) format('woff2'); }" });
  });
  await page.route('https://fonts.gstatic.com/**', (route) => route.fulfill({ headers: { 'access-control-allow-origin': '*' }, contentType: 'font/woff2', body: fontFile }));
  await openFonts(page);
  const heading = page.getByRole('region', { name: 'Heading' });
  await heading.getByRole('radio', { name: 'Google' }).check({ force: true }); // visually hidden under its label
  const field = heading.getByRole('textbox', { name: 'Heading font' });

  await field.fill('Nope Font');
  await heading.getByRole('button', { name: 'Load font' }).click();
  await expect(heading).toContainText('Google Fonts has no font called “Nope Font”. Check the spelling on fonts.google.com.');
  expect(await rootVar(page, '--font-heading')).toBe('');

  await field.fill('Test Serif');
  await heading.getByRole('button', { name: 'Load font' }).click();
  await expect(heading).toContainText('Loaded from Google Fonts. Every page uses it now.');
  expect(asked).toContain('Test Serif:wght@400;500;600');
  expect(await rootVar(page, '--font-heading')).toBe('"Test Serif", system-ui, sans-serif');
  expect(await rootVar(page, '--font-body')).toBe('');
  expect(await fontOf(page, '.docs-page-header h1')).toContain('Test Serif');
  expect(await fontOf(page, '.docs-font-sample[data-role="body"]')).toContain('Inter');
  await expect(heading.getByRole('button', { name: 'Heading: back to the body font' })).toBeVisible();

  await page.getByRole('tab', { name: 'How to use' }).click();
  await expect(page.locator('#use-in-a-project pre').first()).toContainText('--font-heading: "Test Serif", system-ui, sans-serif;');
  await expect(page.locator('.docs-font-link')).toContainText('https://fonts.googleapis.com/css2?family=Test+Serif:wght@600&display=swap');

  // A reload keeps the pick and adds the font's stylesheet again.
  await page.reload();
  expect(await rootVar(page, '--font-heading')).toBe('"Test Serif", system-ui, sans-serif');
  await expect(page.locator('style[data-docs-font="Test Serif"]')).toHaveCount(1);
});

test('the Fonts tab loads an uploaded font file under the name it gives, and asks for it again after a reload', async ({ page }) => {
  await openFonts(page);
  const code = page.getByRole('region', { name: 'Code' });
  await code.getByRole('radio', { name: 'Upload' }).check({ force: true });
  await code.locator('input[type="file"]').setInputFiles({ name: 'TestMono-SemiBold.woff2', mimeType: 'font/woff2', buffer: fontFile });
  await expect(code).toContainText('Loaded as “Test Mono”. Every page uses it now.');
  expect(await rootVar(page, '--font-code')).toBe('"Test Mono", ui-monospace, monospace');
  expect(await page.evaluate(() => [...document.fonts].some((f) => f.family === 'Test Mono' && f.weight === '600' && f.status === 'loaded'))).toBe(true);
  expect(await fontOf(page, '.docs-font-sample[data-role="code"]')).toContain('Test Mono');

  // A file can't be kept for the visit: after a reload the name stays and the page asks for the file again.
  await page.reload();
  await page.getByRole('tab', { name: 'Fonts' }).click();
  await code.getByRole('radio', { name: 'Upload' }).check({ force: true });
  await expect(code).toContainText('Upload this file again: files stay only until the page reloads.');
  expect(await rootVar(page, '--font-code')).toBe('"Test Mono", ui-monospace, monospace');
});


/** How far the page scrolls sideways: 0 when nothing runs past the screen. */
const sidewaysScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('on a phone', () => {
  test.use({ viewport: { width: 320, height: 700 }, hasTouch: true });

  for (const path of ['', 'brand', ...stylePages.map((p) => `styles/${p}`), ...storyIds.map((id) => `components/${id}`)]) {
    test(`/${path} never scrolls sideways`, async ({ page }) => {
      await page.goto(`/#/${path}`);
      await expect(page.locator('.docs-page-header h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await sidewaysScroll(page)).toBe(0);
    });
  }

  test('the Fonts tab fits the screen with every way to add a font', async ({ page }) => {
    await page.goto('/#/brand');
    await page.getByRole('tab', { name: 'Fonts' }).click();
    await expect(page.getByRole('textbox', { name: 'Body font' })).toBeVisible();
    for (const source of ['Installed', 'Google', 'Upload']) {
      await page.getByRole('region', { name: 'Body' }).getByRole('radio', { name: source }).check({ force: true });
      await page.evaluate(() => document.fonts.ready);
      expect(await sidewaysScroll(page)).toBe(0);
    }
  });

  test('the brand contrast breakdown stays inside its card as a stacked list', async ({ page }) => {
    await page.goto('/#/brand');
    await page.getByRole('button', { name: /^Brand color #/ }).click();
    await page.getByRole('textbox', { name: 'HEX color' }).fill('#224B8D');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Show breakdown' }).click();
    const list = page.getByRole('list', { name: 'Color pairs that are hard to read' });
    await expect(list).toBeVisible();
    await expect(page.getByRole('table', { name: 'Color pairs that are hard to read' })).toBeHidden(); // the table is for wider screens
    const card = (await page.locator('.docs-brand-card').first().boundingBox())!;
    for (const box of [await list.boundingBox(), await page.locator('.docs-brand-contrast .bland-banner').boundingBox()])
      expect(box!.x + box!.width).toBeLessThanOrEqual(card.x + card.width);
    expect(await sidewaysScroll(page)).toBe(0);
  });

  test('the theme and search bar slides away while scrolling down and comes back on a scroll up', async ({ page }) => {
    await page.goto('/#/components/button');
    const toolbar = page.locator('.docs-toolbar');
    const top = page.locator('.docs-topbar');
    const hidden = async () => (await toolbar.boundingBox())!.y + (await toolbar.boundingBox())!.height <= (await top.boundingBox())!.y + (await top.boundingBox())!.height + 1;
    await page.mouse.wheel(0, 600);
    await expect.poll(hidden).toBe(true);
    await page.mouse.wheel(0, -100);
    await expect.poll(hidden).toBe(false);
    await expect(page.getByRole('radiogroup', { name: 'Theme' })).toBeInViewport();
    // Near the top it always shows.
    await page.mouse.wheel(0, 600);
    await expect.poll(hidden).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await expect.poll(hidden).toBe(false);
  });

  test('the menu button opens the sidebar from the right and pushes the page left; the strip, Escape or a link closes it', async ({ page }) => {
    await page.goto('/#/components/button');
    const nav = page.getByRole('navigation', { name: 'Docs' });
    const main = page.locator('.docs-main');
    await expect(nav).toBeHidden();
    const before = (await main.boundingBox())!.x;
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(nav).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hide menu' })).toHaveAttribute('aria-expanded', 'true');
    const sidebar = (await page.locator('.docs-sidebar').boundingBox())!;
    await expect.poll(async () => (await page.locator('.docs-sidebar').boundingBox())!.x).toBe(320 - sidebar.width);
    await expect.poll(async () => (await main.boundingBox())!.x).toBe(before - sidebar.width);
    await expect(page.getByRole('button', { name: 'Hide menu' })).toBeInViewport(); // pushed along, it stays in the strip
    expect(await sidewaysScroll(page)).toBe(0);
    // Hide comes in beside the EyeClosed button and closes the menu too.
    await page.locator('.docs-topbar-hide').click();
    await expect(nav).toBeHidden();
    await expect(page.locator('.docs-topbar-hide')).toHaveCSS('opacity', '0');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.mouse.click(10, 400); // the strip of page beside the menu
    await expect(nav).toBeHidden();
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await nav.getByRole('link', { name: 'Colors' }).click();
    await expect(page).toHaveURL(/#\/styles\/colors$/);
    await expect(nav).toBeHidden();
    await expect.poll(async () => (await main.boundingBox())!.x).toBe(before);
  });

  test('the Grid page\'s columns switch floats at the bottom right, wherever the page is scrolled', async ({ page }) => {
    await page.goto('/#/styles/grid');
    await page.mouse.wheel(0, 1500);
    const button = page.getByRole('button', { name: 'Show columns' });
    await expect(button).toBeInViewport();
    const box = (await button.boundingBox())!;
    expect(Math.round(box.x + box.width)).toBe(320 - 16);
    expect(Math.round(box.y + box.height)).toBe(700 - 16);
    await button.click();
    await expect(page.locator('.docs-grid-overlay')).toBeVisible();
  });

  test('a swipe to the left opens the menu and one to the right closes it; a row that can still scroll scrolls first', async ({ page }) => {
    // A one-finger swipe, as touch events from the element under its start.
    const swipe = (selector: string, dx: number) =>
      page.locator(selector).first().evaluate((el, dx) => {
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + Math.min(r.height / 2, 20);
        const touch = (cx: number) => new Touch({ identifier: 1, target: el, clientX: cx, clientY: y });
        el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [touch(x)], changedTouches: [touch(x)] }));
        el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [touch(x + dx)] }));
      }, dx);
    const nav = page.getByRole('navigation', { name: 'Docs' });
    await page.goto('/#/brand');
    await swipe('.docs-page-header', -120);
    await expect(nav).toBeVisible();
    await swipe('.docs-sidebar', 120);
    await expect(nav).toBeHidden();
    // The Brand page's tab row overflows at 320: while it can scroll further, a swipe on it does not open the menu.
    const row = page.locator('.docs-brand-tabs .bland-scroll-area__viewport').first();
    await swipe('.docs-brand-tabs .bland-scroll-area__viewport', -120);
    await expect(nav).toBeHidden();
    await row.evaluate((el) => (el.scrollLeft = el.scrollWidth));
    await swipe('.docs-brand-tabs .bland-scroll-area__viewport', -120);
    await expect(nav).toBeVisible();
  });

  test('after a tap on the theme switch the bar still slides away on scroll', async ({ page }) => {
    await page.goto('/#/components/button');
    await page.locator('.docs-theme label').filter({ hasText: 'Dark' }).tap(); // focus stays on its radio
    await page.mouse.wheel(0, 600);
    await expect.poll(async () => (await page.locator('.docs-toolbar').evaluate((el) => getComputedStyle(el).translate))).not.toBe('none');
  });

  test('the menu, search and color picker fit the screen', async ({ page }) => {
    await page.goto('/#/brand');
    await page.getByRole('button', { name: /^Brand color #/ }).click();
    const picker = (await page.getByRole('dialog', { name: 'Pick a brand color' }).boundingBox())!;
    expect(picker.x).toBeGreaterThanOrEqual(0);
    expect(picker.x + picker.width).toBeLessThanOrEqual(320);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Docs' })).toBeVisible();
    expect(await sidewaysScroll(page)).toBe(0);
    await page.getByRole('button', { name: 'Hide menu' }).click();
    await page.getByRole('button', { name: /Search Bland/ }).click();
    await page.keyboard.type('button');
    expect(await sidewaysScroll(page)).toBe(0);
  });
});
