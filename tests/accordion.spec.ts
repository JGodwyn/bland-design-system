// Behaviour of Accordion: native details/summary, keyboard, controlled state, name groups, disabled, sizes, states, motion.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './stories';

/** The computed color of a token, resolved the way the browser resolves a background. */
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

const header = (item: Locator) => item.locator('summary');
const style = (el: Locator, prop: string) => el.evaluate((e, p) => getComputedStyle(e).getPropertyValue(p), prop);

test.beforeEach(async ({ page }) => {
  await openStory(page, 'accordion', 'light');
});

/** Chromium's accessibility node for a header: role and expanded state, as screen readers get them. */
async function axHeader(page: Page, name: string) {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const node = nodes.find((n) => n.name?.value === name && n.role?.value !== 'StaticText' && n.role?.value !== 'InlineTextBox')!;
  const prop = (p: string) => node.properties?.find((x) => x.name === p)?.value.value;
  return { role: node.role?.value, expanded: prop('expanded'), disabled: prop('disabled') ?? false };
}

test('the header is a native disclosure button with an expanded state; a click opens and closes it', async ({ page }) => {
  const item = page.getByTestId('group-1');
  // Chromium's summary role (DisclosureTriangle) reaches platform screen readers as a button.
  // In a name group Chromium says DisclosureTriangleGrouped.
  expect(await axHeader(page, 'Second question')).toEqual({ role: expect.stringMatching(/^DisclosureTriangle/), expanded: false, disabled: false });
  await expect(item.getByText(/description section/)).toBeHidden();
  await header(item).click();
  await expect(item).toHaveAttribute('open', '');
  expect((await axHeader(page, 'Second question')).expanded).toBe(true);
  await expect(item.getByText(/description section/)).toBeVisible();
  await header(item).click();
  await expect(item).not.toHaveAttribute('open');
});

test('Enter and Space toggle it from the keyboard', async ({ page }) => {
  const item = page.getByTestId('closed-md');
  await header(item).focus();
  await page.keyboard.press('Enter');
  await expect(item).toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(item).not.toHaveAttribute('open');
});

test('defaultOpen renders the native open attribute', async ({ page }) => {
  await expect(page.getByTestId('open-sm')).toHaveAttribute('open', '');
  await expect(page.getByTestId('open-sm').getByText(/description section/)).toBeVisible();
});

test('controlled: onOpenChange reports the new state', async ({ page }) => {
  const state = page.getByTestId('controlled-state');
  await expect(state).toHaveText('closed');
  await header(page.getByTestId('controlled')).click();
  await expect(state).toHaveText('open');
  await expect(page.getByTestId('controlled')).toHaveAttribute('open', '');
  await header(page.getByTestId('controlled')).click();
  await expect(state).toHaveText('closed');
});

test('a name group keeps one item open, and each item follows the browser', async ({ page }) => {
  const [first, second] = [page.getByTestId('group-0'), page.getByTestId('group-1')];
  await expect(first).toHaveAttribute('open', '');
  await header(second).click();
  await expect(second).toHaveAttribute('open', '');
  await expect(first).not.toHaveAttribute('open');
  // The first item's state followed the browser: one click opens it again.
  await header(first).click();
  await expect(first).toHaveAttribute('open', '');
  await expect(second).not.toHaveAttribute('open');
});

test('disabled: no toggling, out of the Tab order, minimal colors', async ({ page }) => {
  const item = page.getByTestId('disabled');
  const summary = header(item);
  await expect(summary).toHaveAttribute('aria-disabled', 'true');
  expect((await axHeader(page, 'Disabled')).disabled).toBe(true);
  await expect(summary).toHaveAttribute('tabindex', '-1');
  await summary.click();
  await expect(item).not.toHaveAttribute('open');
  expect(await style(summary, 'color')).toBe(await tokenColor(page, '--text-minimal'));
  expect(await style(item.locator('.bland-accordion__caret'), 'color')).toBe(await tokenColor(page, '--icon-minimal'));
});

test('headers are 32 (sm) and 40 (md); flush drops the fill and the side padding', async ({ page }) => {
  for (const [id, height] of [['closed-sm', 32], ['closed-md', 40], ['closed-sm-flush', 32], ['closed-md-flush', 40]] as const) {
    expect((await header(page.getByTestId(id)).boundingBox())!.height).toBe(height);
  }
  const plain = header(page.getByTestId('closed-sm'));
  const flush = header(page.getByTestId('closed-sm-flush'));
  expect(await style(plain, 'background-color')).toBe(await tokenColor(page, '--surface-200'));
  expect(await style(plain, 'padding-left')).toBe('12px');
  expect(await style(flush, 'background-color')).toBe('rgba(0, 0, 0, 0)');
  expect(await style(flush, 'padding-left')).toBe('0px');
  expect(await style(page.getByTestId('open-sm').locator('.bland-accordion__content'), 'padding')).toBe('12px');
  expect(await style(page.getByTestId('open-sm-flush').locator('.bland-accordion__content'), 'padding')).toBe('4px 0px');
});

test('the title is bold while open', async ({ page }) => {
  expect(await style(header(page.getByTestId('closed-sm')), 'font-weight')).toBe('400');
  expect(await style(header(page.getByTestId('open-sm')), 'font-weight')).toBe('500');
});

test('hover: the default header fills surface-300, the flush title underlines', async ({ page }) => {
  const plain = header(page.getByTestId('closed-sm'));
  await plain.hover();
  const hover = await tokenColor(page, '--surface-300');
  await expect.poll(() => style(plain, 'background-color')).toBe(hover);

  const flush = header(page.getByTestId('closed-sm-flush'));
  await flush.hover();
  expect(await style(flush, 'text-decoration-line')).toBe('underline');
});

test('the caret turns over duration/md with easing/out, and not under reduced motion', async ({ page }) => {
  const caret = page.getByTestId('closed-sm').locator('.bland-accordion__caret');
  expect(await style(caret, 'transition-duration')).toBe('0.2s');
  await header(page.getByTestId('closed-sm')).click();
  await expect.poll(() => style(caret, 'transform')).toMatch(/^matrix\(-1, .*-1, 0, 0\)$/);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(await style(caret, 'transition-duration')).toBe('0s');
});

test('the header takes keyboard focus with the focus ring', async ({ page }) => {
  await page.keyboard.press('Tab');
  const first = header(page.getByTestId('closed-sm'));
  await expect(first).toBeFocused();
  expect(await style(first, 'outline-style')).toBe('solid');
});
