// Accessibility checks (axe) on every story in light and dark: labels, roles, contrast.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openStory, storyIds, themes } from './stories';

/**
 * Known contrast exceptions, per theme, kept out of the scan. Each one is a token value, not component code.
 * - Danger primary Indicator and Badge labels stay white in dark (3.7:1), on purpose (CLAUDE.md, "Dark mode").
 * - Success primary Indicator and Badge labels stay white in light (4.47:1, just under 4.5:1), on purpose:
 *   Godwin kept the look on 2026-10-18 (CLAUDE.md, "Dark mode"; INTERFACE.md §1).
 */
const knownContrast: Record<(typeof themes)[number], string[]> = {
  light: ['.bland-indicator[data-emotion="success"][data-type="primary"]', '.bland-badge[data-emotion="success"][data-type="primary"]'],
  dark: ['.bland-indicator[data-emotion="danger"][data-type="primary"]', '.bland-badge[data-emotion="danger"][data-type="primary"]'],
};

/**
 * Text in a disabled field (its helper text and add-on labels) is exempt from contrast (WCAG 1.4.3, inactive
 * components) and uses Text/text-minimal on purpose. axe only knows that for the input itself, so it skips these.
 */
const disabledFieldText = [
  '.bland-text-input:has(.bland-text-input__input:disabled)',
  '.bland-text-area:has(.bland-text-area__input:disabled)',
  '.bland-numeric-input-field:has(.bland-numeric-input-field__box:disabled)',
  // Date and time fields have no input to disable: their root says data-disabled (the range picker's helper too).
  '.bland-date-field[data-disabled]',
  '.bland-date-range-picker[data-disabled]',
  // A disabled Accordion's open content is drawn in Text/text-minimal by Figma's State=disabled; its header is aria-disabled.
  '.bland-accordion[data-disabled] .bland-accordion__content',
  // A disabled Progress-wizard step is drawn in Text/text-minimal by Figma's State=disabled, like disabled fields.
  '.bland-progress-wizard__step[data-disabled]',
  // A disabled List row is drawn in Text/text-minimal by Figma's State=disabled; plain and link rows have no native disabled.
  '.bland-list-item[data-disabled]',
  // A disabled Table cell (or a cell of a disabled row) is drawn in Text/text-minimal by Figma's State=disabled.
  '.bland-table__cell[data-disabled]',
  // A disabled Dropdown's field text and a disabled Menu or Dropdown row use Text/text-minimal, as disabled fields.
  '.bland-dropdown[data-disabled]',
  '.bland-menu__item[data-disabled]',
];

for (const id of storyIds) {
  for (const theme of themes) {
    test(`${id} has no axe violations (${theme})`, async ({ page }) => {
      await openStory(page, id, theme);
      const axe = new AxeBuilder({ page }).include(`[data-testid="frame-${theme}"]`);
      for (const selector of [...knownContrast[theme], ...disabledFieldText]) axe.exclude(selector);
      const results = await axe.analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
    });
  }
}
