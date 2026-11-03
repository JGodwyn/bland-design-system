import { readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { test, type Locator, type Page } from '@playwright/test';

/** Every component folder with a <name>.stories.tsx, which is also its playground route. */
export const storyIds = readdirSync(resolve(import.meta.dirname, '../src/components'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(d.parentPath, d.name, `${d.name}.stories.tsx`)))
  .map((d) => d.name);

export const themes = ['light', 'dark'] as const;

/**
 * Stories that mark today (Calendar and the date pickers) run on a fixed clock: 11 November 2024, the today
 * Figma draws. Only these, so components that time things with Date.now keep the real clock.
 */
const fixedToday = new Set(['calendar', 'date-picker', 'date-range-picker', 'time-picker']);

/** Open one story in one theme and wait until fonts are in, so screenshots are stable. */
export async function openStory(page: Page, id: string, theme: (typeof themes)[number]) {
  if (fixedToday.has(id)) await page.clock.setFixedTime(new Date('2024-11-11T12:00:00'));
  await page.goto(`/#/raw/${id}?theme=${theme}`);
  await page.getByTestId(`frame-${theme}`).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/** Picks an option in a docs playground control (a Bland Dropdown: its trigger is #ctl-<prop>). */
export async function pickOption(page: Page, prop: string, option: string) {
  await page.locator(`#ctl-${prop}`).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

/**
 * Clicks, then makes sure the clicked control has focus. Chromium and Firefox focus a button, checkbox or radio
 * on click; Safari on the Mac does not, so in WebKit the control (or `focus`, for a label) is focused after the
 * click. Use it where a test goes on with the keyboard from the clicked control.
 */
export async function clickToFocus(target: Locator, focus: Locator = target) {
  await target.click();
  if (test.info().project.name === 'webkit') await focus.focus();
}

/** The Tab key that reaches every control: Safari's Tab skips links unless Option is held. */
export const tabKey = () => (test.info().project.name === 'webkit' ? 'Alt+Tab' : 'Tab');
