// Badge: optical padding. With an icon on one side only, the bare side widens from space-sm to space-md.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

const padding = (page: Page, id: string) =>
  page.getByTestId(id).evaluate((e) => {
    const s = getComputedStyle(e);
    return [s.paddingLeft, s.paddingRight];
  });

test.beforeEach(async ({ page }) => {
  await openStory(page, 'badge', 'light');
});

for (const size of ['sm', 'md', 'lg']) {
  test(`${size}: the side without an icon gets 12, the icon side keeps 8`, async ({ page }) => {
    expect(await padding(page, `plain-${size}`)).toEqual(['8px', '8px']);
    expect(await padding(page, `start-${size}`)).toEqual(['8px', '12px']);
    expect(await padding(page, `end-${size}`)).toEqual(['12px', '8px']);
    expect(await padding(page, `both-${size}`)).toEqual(['8px', '8px']);
  });
}

test('xl keeps 16 on both sides whatever the icons', async ({ page }) => {
  for (const id of ['plain-xl', 'start-xl', 'end-xl', 'both-xl']) {
    expect(await padding(page, id)).toEqual(['16px', '16px']);
  }
});
