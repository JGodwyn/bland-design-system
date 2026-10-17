// Screenshot of every story in light and dark. A failure means a component's look changed:
// if the change is intended, update the baselines with `npm run test:update`.
import { expect, test } from '@playwright/test';
import { openStory, storyIds, themes } from './stories';

for (const id of storyIds) {
  for (const theme of themes) {
    test(`${id} looks the same (${theme})`, async ({ page }) => {
      await openStory(page, id, theme);
      await expect(page).toHaveScreenshot(`${id}-${theme}.png`, { fullPage: true });
    });
  }
}
