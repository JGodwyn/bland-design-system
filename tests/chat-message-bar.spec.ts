// Behaviour of Chat message bar: the labelled field, send by button and Enter, record, reply, states, focus ring, disabled.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

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

test.beforeEach(async ({ page }) => {
  await openStory(page, 'chat-message-bar', 'light');
});

test('the field is a labelled textarea; empty shows record, typing switches to send', async ({ page }) => {
  const bar = page.getByTestId('composer');
  const field = bar.getByRole('textbox', { name: 'Message' });
  await expect(field).toHaveAttribute('placeholder', 'Type here');
  await expect(bar.getByRole('button', { name: 'Record voice message' })).toBeVisible();
  await field.fill('Hi');
  await expect(bar.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
  await expect(bar).toHaveAttribute('data-state', 'filled');
});

test('Enter sends and clears; Shift+Enter starts a new line; the send button sends too', async ({ page }) => {
  const bar = page.getByTestId('composer');
  const field = bar.getByRole('textbox', { name: 'Message' });
  const sent = page.getByTestId('sent').getByRole('listitem');
  await field.fill('First');
  await field.press('Shift+Enter');
  await field.pressSequentially('line');
  await expect(field).toHaveValue('First\nline');
  await field.press('Enter');
  await expect(sent).toHaveText(['First\nline']);
  await expect(field).toHaveValue('');
  await field.fill('Second');
  await bar.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(sent).toHaveCount(2);
  // An empty field sends nothing.
  await field.press('Enter');
  await expect(sent).toHaveCount(2);
});

test('recording swaps the field for delete, label and timer; send and delete end it', async ({ page }) => {
  const bar = page.getByTestId('composer');
  await bar.getByRole('button', { name: 'Record voice message' }).click();
  await expect(bar).toHaveAttribute('data-state', 'recording-audio');
  await expect(bar.getByRole('textbox')).toHaveCount(0);
  await expect(bar.locator('.bland-chat-message-bar__field')).toContainText('Recording audio…0:03');
  await bar.getByRole('button', { name: 'Delete recording' }).click();
  await expect(bar.getByRole('textbox', { name: 'Message' })).toBeVisible();
  await bar.getByRole('button', { name: 'Record voice message' }).click();
  await bar.getByRole('button', { name: 'Send voice message' }).click();
  await expect(page.getByTestId('sent').getByRole('listitem')).toHaveText(['(voice message)']);
});

test('the reply panel quotes the message and its close button cancels the reply', async ({ page }) => {
  const bar = page.getByTestId('composer');
  const reply = bar.locator('.bland-chat-message-bar__reply');
  await expect(reply).toContainText('Replying to Jane Doe');
  await expect(reply).toHaveCSS('background-color', await tokenColor(page, '--messaging-surface-reply'));
  await bar.getByRole('button', { name: 'Cancel reply' }).click();
  await expect(reply).toHaveCount(0);
});

test('the field shows the 2px ring while its textarea has focus', async ({ page }) => {
  const bar = page.getByTestId('composer');
  await bar.getByRole('textbox', { name: 'Message' }).focus();
  const field = bar.locator('.bland-chat-message-bar__field');
  await expect(field).toHaveCSS('outline-width', '2px');
  await expect(field).toHaveCSS('outline-color', await tokenColor(page, '--border-focused'));
});

test('long text grows the field; without onRecordStart send is disabled while empty; disabled turns everything off', async ({ page }) => {
  const fields = page.locator('.bland-chat-message-bar__field');
  expect((await fields.nth(0).boundingBox())!.height).toBe(40);
  const grown = page.locator('.bland-chat-message-bar__input').filter({ hasText: 'A longer message' });
  expect((await grown.boundingBox())!.height).toBeGreaterThan(60);
  const noRecord = page.locator('.bland-chat-message-bar').filter({ has: page.getByRole('button', { name: 'Attach' }) }).filter({ hasNot: page.getByRole('button', { name: 'Emoji' }) });
  await expect(noRecord.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
  const disabled = page.locator('.bland-chat-message-bar[data-disabled]');
  await expect(disabled.getByRole('textbox')).toBeDisabled();
  await expect(disabled.getByRole('button', { name: 'Emoji' })).toBeDisabled();
});

test('the reply panel is as wide as the field, not the whole bar', async ({ page }) => {
  const bar = page.getByTestId('composer');
  const reply = (await bar.locator('.bland-chat-message-bar__reply').boundingBox())!;
  const field = (await bar.locator('.bland-chat-message-bar__field').boundingBox())!;
  expect(reply.x).toBe(field.x);
  expect(reply.width).toBe(field.width);
  expect(reply.width).toBeLessThan((await bar.boundingBox())!.width);
});

test('on a wrapped message the field icons and the send button stay on the last line', async ({ page }) => {
  const bar = page.locator('.bland-chat-message-bar').filter({ has: page.locator('textarea', { hasText: 'A longer message' }) });
  const center = async (selector: string) =>
    bar.locator(selector).evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return Math.round(r.top + r.height / 2); }));
  const textarea = (await bar.locator('textarea').boundingBox())!;
  const lastLine = Math.round(textarea.y + textarea.height - 8 - 12);
  expect(await center('.bland-chat-message-bar__tool')).toEqual([lastLine, lastLine, lastLine]);
  expect(await center('.bland-button')).toEqual([lastLine]);
});

test('in the docs playground, record starts recording and the reply closes', async ({ page }) => {
  await page.goto('/#/components/chat-message-bar');
  const demo = page.locator('.docs-demo-stage .bland-chat-message-bar');
  await expect(demo).toHaveCSS('width', '384px');
  await demo.getByRole('button', { name: 'Record voice message' }).click();
  await expect(demo).toHaveAttribute('data-state', 'recording-audio');
  await expect(demo.locator('.bland-chat-message-bar__timer')).toHaveText(/^0:0\d$/);
  await demo.getByRole('button', { name: 'Cancel reply' }).click();
  await expect(demo.locator('.bland-chat-message-bar__reply')).toHaveCount(0);
  await demo.getByRole('button', { name: 'Delete recording' }).click();
  await expect(demo).toHaveAttribute('data-state', 'rest');
});
