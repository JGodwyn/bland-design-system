// Behaviour of Tab bar: a nav of links, aria-current, the indicator's note, current colors.
import { expect, test } from '@playwright/test';
import { tokenColor } from './feedback-helpers';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'tab-bar', 'light');
});

test('a nav of links; the current one has aria-current="page" and brand colors', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Inbox current' });
  await expect(nav.getByRole('link')).toHaveCount(5);
  const inbox = nav.getByRole('link', { name: 'Inbox, new activity' });
  await expect(inbox).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  expect(await inbox.evaluate((e) => getComputedStyle(e).color)).toBe(await tokenColor(page, '--text-brand'));
  await expect(inbox.locator('.bland-indicator')).toHaveAttribute('data-ring');
});

test('icon only items keep their label as the accessible name; items share the width', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Icons only' });
  await expect(nav.getByRole('link', { name: 'Search' })).toHaveAttribute('aria-current', 'page');
  const widths = await nav.getByRole('link').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
  expect(new Set(widths).size).toBe(1);
  expect(await nav.evaluate((e) => e.getBoundingClientRect().height)).toBe(48);
});

test('pressing an item makes it current', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Bar 3' });
  await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('link', { name: 'New' }).click();
  await expect(nav.getByRole('link', { name: 'New' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});
