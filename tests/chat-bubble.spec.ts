// Behaviour of Chat bubble: log semantics, receiver and sender sides, the audio play button, delivery status, typing, wrapping, focus.
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

const box = async (el: Locator) => (await el.boundingBox())!;

test.beforeEach(async ({ page }) => {
  await openStory(page, 'chat-bubble', 'light');
});

test('bubbles are list items in a log', async ({ page }) => {
  const log = page.getByRole('log', { name: 'Statuses' });
  await expect(log.getByRole('listitem')).toHaveCount(3);
});

test('receiver bubbles sit on the left in the neutral fill, sender bubbles on the right in brand', async ({ page }) => {
  const log = page.getByRole('log', { name: 'Statuses' });
  const sender = log.locator('.bland-chat-bubble__bubble').first();
  await expect(sender).toHaveCSS('background-color', await tokenColor(page, '--messaging-surface-sender'));
  const logBox = await box(log);
  expect(Math.round((await box(sender)).x + (await box(sender)).width + 8)).toBe(Math.round(logBox.x + logBox.width));

  const receiver = page.getByRole('log', { name: 'Wrapping' }).locator('.bland-chat-bubble__bubble').first();
  await expect(receiver).toHaveCSS('background-color', await tokenColor(page, '--messaging-surface-receiver'));
  expect(Math.round((await box(receiver)).x)).toBe(Math.round((await box(page.getByRole('log', { name: 'Wrapping' }))).x + 8));
});

test('the tail joins the bubble at its bottom corner, in the bubble fill', async ({ page }) => {
  const bubble = page.getByRole('log', { name: 'Wrapping' }).getByRole('listitem').first();
  const tail = bubble.locator('.bland-chat-bubble__tail');
  const body = bubble.locator('.bland-chat-bubble__bubble');
  expect((await box(tail)).width).toBe(8);
  expect((await box(tail)).height).toBe(16);
  expect(Math.round((await box(tail)).y + 16)).toBe(Math.round((await box(body)).y + (await box(body)).height));
  await expect(tail.locator('svg')).toHaveCSS('fill', await tokenColor(page, '--messaging-surface-receiver'));
});

test('the audio button plays and pauses: its name, icon and played bars follow', async ({ page }) => {
  const voice = page.getByTestId('voice');
  const play = voice.getByRole('button', { name: 'Play voice message' });
  await expect(voice.locator('.bland-chat-bubble__bar[data-played]')).toHaveCount(0);
  await play.click();
  const pause = voice.getByRole('button', { name: 'Pause voice message' });
  await expect(pause).toBeVisible();
  await expect(voice).toHaveAttribute('data-playing', 'true');
  await expect(voice.locator('.bland-chat-bubble__bar[data-played]')).toHaveCount(13);
  await expect(voice.locator('.bland-chat-bubble__duration')).toHaveText('0:14');
  await pause.focus();
  await page.keyboard.press('Enter');
  await expect(voice.getByRole('button', { name: 'Play voice message' })).toBeFocused();
  await expect(voice.locator('.bland-chat-bubble__bar[data-played]')).toHaveCount(0);
});

test('delivery status is read as a word next to the time', async ({ page }) => {
  const items = page.getByRole('log', { name: 'Statuses' }).getByRole('listitem');
  await expect(items.nth(0).locator('.bland-chat-bubble__meta')).toHaveText('09:41Sent');
  await expect(items.nth(1).locator('.bland-chat-bubble__meta')).toHaveText('09:42Delivered');
  await expect(items.nth(2).locator('.bland-message-sent-indicator')).toHaveCSS('color', await tokenColor(page, '--icon-brand'));
});

test('typing bubbles, receiver and sender, read their label and hide the dots', async ({ page }) => {
  const receiver = page.locator('.bland-chat-bubble[data-type="typing"][data-who="receiver"]');
  const sender = page.locator('.bland-chat-bubble[data-type="typing"][data-who="sender"]');
  await expect(receiver).toHaveText('Jane is typing');
  await expect(sender).toHaveText('You are typing');
  await expect(receiver.locator('.bland-chat-bubble__dots')).toHaveAttribute('aria-hidden', 'true');
  expect((await box(receiver.locator('.bland-chat-bubble__bubble'))).height).toBe(32);
  await expect(sender.locator('.bland-chat-bubble__bubble')).toHaveCSS('background-color', await tokenColor(page, '--messaging-surface-sender'));
});

test('the typing dots loop over duration/typing, each starting a sixth of the cycle after the last', async ({ page }) => {
  const dots = page.locator('.bland-chat-bubble[data-type="typing"][data-who="receiver"] .bland-chat-bubble__dot');
  const anim = await dots.evaluateAll((els) =>
    els.map((e) => {
      const cs = getComputedStyle(e);
      return [cs.animationName, cs.animationDuration, cs.animationIterationCount, cs.animationDelay];
    }),
  );
  expect(anim).toEqual([
    ['bland-chat-bubble-typing', '1.2s', 'infinite', '0s'],
    ['bland-chat-bubble-typing', '1.2s', 'infinite', '0.2s'],
    ['bland-chat-bubble-typing', '1.2s', 'infinite', '0.4s'],
  ]);
  // At 30% of its cycle the first dot is at its strongest color, lifted by space-xs.
  const peak = await dots.first().evaluate((e) => {
    const a = e.getAnimations()[0]!;
    a.pause();
    a.currentTime = 360;
    const cs = getComputedStyle(e);
    return [cs.backgroundColor, cs.translate];
  });
  expect(peak).toEqual([await tokenColor(page, '--messaging-receiver-content'), '0px -4px']);
});

test('under reduced motion the dots still brighten in turn but do not move', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const dot = page.locator('.bland-chat-bubble[data-type="typing"][data-who="sender"] .bland-chat-bubble__dot').first();
  await expect(dot).toHaveCSS('animation-name', 'bland-chat-bubble-typing-still');
  const peak = await dot.evaluate((e) => {
    const a = e.getAnimations()[0]!;
    a.pause();
    a.currentTime = 360;
    const cs = getComputedStyle(e);
    return [cs.backgroundColor, cs.translate];
  });
  expect(peak).toEqual([await tokenColor(page, '--messaging-sender-content'), 'none']);
});

test('the file details separator takes the softer separator color on each side', async ({ page }) => {
  const log = page.getByRole('log', { name: 'receiver types' });
  await expect(log.locator('.bland-chat-bubble__separator')).toHaveCSS('background-color', await tokenColor(page, '--messaging-receiver-separator'));
  const sent = page.getByRole('log', { name: 'sender types' });
  await expect(sent.locator('.bland-chat-bubble__separator')).toHaveCSS('background-color', await tokenColor(page, '--messaging-sender-separator'));
});

test('text hugs short messages and wraps at chat-bubble/max-width; media bubbles take the full width', async ({ page }) => {
  const bubbles = page.getByRole('log', { name: 'Wrapping' }).locator('.bland-chat-bubble__bubble');
  expect((await box(bubbles.nth(0))).width).toBeLessThan(80);
  expect((await box(bubbles.nth(1))).width).toBe(280);
  expect((await box(bubbles.nth(1))).height).toBeGreaterThan(100);
  const image = page.getByRole('log', { name: 'receiver types' }).locator('.bland-chat-bubble[data-type="image"] .bland-chat-bubble__bubble');
  expect((await box(image)).width).toBe(280);
  const name = page.getByRole('log', { name: 'Wrapping' }).locator('.bland-chat-bubble__filename');
  expect(await name.evaluate((e) => e.scrollWidth > e.clientWidth && getComputedStyle(e).textOverflow === 'ellipsis')).toBe(true);
});

test('a document with href is a link; focus rings inside a sender bubble are white', async ({ page }) => {
  const link = page.getByRole('log', { name: 'Interactive' }).getByRole('link', { name: 'Quarterly report.pdf' });
  await expect(link).toHaveAttribute('href', '#/components/chat-bubble');
  await link.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  await expect(link).toHaveCSS('outline-color', await tokenColor(page, '--messaging-sender-content'));
});

test('a video with onPlay has a play button on its poster', async ({ page }) => {
  const video = page.getByRole('log', { name: 'receiver types' }).locator('.bland-chat-bubble[data-type="video"]');
  await expect(video.getByRole('button', { name: 'Play video' })).toBeVisible();
  await expect(video.locator('img')).toHaveAttribute('alt', '');
});
