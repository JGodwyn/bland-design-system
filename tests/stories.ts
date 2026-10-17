import { readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Page } from '@playwright/test';

/** Every component folder with a <name>.stories.tsx, which is also its playground route. */
export const storyIds = readdirSync(resolve(import.meta.dirname, '../src/components'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(d.parentPath, d.name, `${d.name}.stories.tsx`)))
  .map((d) => d.name);

export const themes = ['light', 'dark'] as const;

/** Open one story in one theme and wait until fonts are in, so screenshots are stable. */
export async function openStory(page: Page, id: string, theme: (typeof themes)[number]) {
  await page.goto(`/#/${id}?theme=${theme}`);
  await page.getByTestId(`frame-${theme}`).waitFor();
  await page.evaluate(() => document.fonts.ready);
}
