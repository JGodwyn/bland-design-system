// Accessibility checks (axe) on every story in light and dark: labels, roles, contrast.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openStory, storyIds, themes } from './stories';

for (const id of storyIds) {
  for (const theme of themes) {
    test(`${id} has no axe violations (${theme})`, async ({ page }) => {
      await openStory(page, id, theme);
      const results = await new AxeBuilder({ page }).include(`[data-testid="frame-${theme}"]`).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }
}
