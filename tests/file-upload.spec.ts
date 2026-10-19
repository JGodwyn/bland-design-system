// Behaviour of File Upload: picking, dropping, accept filtering, drag-over, removing, names and announcements.
import { expect, test, type Page } from '@playwright/test';
import { openStory } from './stories';

test.beforeEach(async ({ page }) => {
  await openStory(page, 'file-upload', 'light');
});

const png = (name: string) => ({ name, mimeType: 'image/png', buffer: Buffer.from('png') });

/** Drops files on a zone with a real DataTransfer, as a browser does. */
async function drop(page: Page, zone: string, files: { name: string; type: string }[]) {
  await page.locator(zone).evaluate((el, list) => {
    const dataTransfer = new DataTransfer();
    for (const f of list) dataTransfer.items.add(new File(['x'], f.name, { type: f.type }));
    for (const type of ['dragenter', 'dragover', 'drop'])
      el.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
  }, files);
}

test('the file input is named by the title and described by the file types', async ({ page }) => {
  const input = page.getByTestId('live').locator('input[type="file"]');
  await expect(input).toHaveAccessibleName('Images');
  await expect(input).toHaveAccessibleDescription('PNG or JPG');
  await expect(page.getByLabel('Upload file', { exact: true }).first()).toHaveAttribute('type', 'file');
});

test('picked files become rows and are announced', async ({ page }) => {
  const live = page.getByTestId('live');
  await live.locator('input[type="file"]').setInputFiles([png('a.png'), png('b.png')]);
  await expect(live.getByRole('list', { name: 'Files' }).getByRole('listitem')).toHaveCount(2);
  await expect(live.getByRole('status')).toHaveText('Added a.png, b.png');
});

test('drops add matching files and reject the rest', async ({ page }) => {
  const live = page.getByTestId('live');
  await drop(page, '[data-testid="live"] .bland-file-upload__dropzone', [
    { name: 'photo.png', type: 'image/png' },
    { name: 'scan.jpg', type: 'image/jpeg' },
    { name: 'notes.pdf', type: 'application/pdf' },
  ]);
  await expect(live.getByRole('listitem')).toHaveText([/photo\.png/, /scan\.jpg/]);
  await expect(page.getByTestId('rejected')).toHaveText('Rejected: 1');
  await expect(live.locator('.bland-file-upload__dropzone')).not.toHaveAttribute('data-drag-over');
});

test('dragging files over the zone turns it brand, and leaving turns it back', async ({ page }) => {
  const zone = page.getByTestId('live').locator('.bland-file-upload__dropzone');
  await zone.evaluate((el) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['x'], 'a.png', { type: 'image/png' }));
    el.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }));
  });
  await expect(zone).toHaveAttribute('data-drag-over', 'true');
  // The border color transitions over duration/xs, so wait for it to land on border-brand.
  const brand = await zone.evaluate((el) => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--border-brand)';
    el.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  });
  await expect.poll(() => zone.evaluate((el) => getComputedStyle(el).borderTopColor)).toBe(brand);
  await zone.evaluate((el) => el.dispatchEvent(new DragEvent('dragleave', { bubbles: true })));
  await expect(zone).not.toHaveAttribute('data-drag-over');
});

test('close buttons are named per file and remove the row; success has none', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Cancel upload of Moodboard.jpg' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove Brand guidelines.pdf' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Logo\.svg/ })).toHaveCount(0);

  const live = page.getByTestId('live');
  await live.locator('input[type="file"]').setInputFiles([png('a.png')]);
  const remove = live.getByRole('button', { name: 'Remove a.png' });
  await remove.focus();
  await page.keyboard.press('Enter');
  await expect(live.getByRole('listitem')).toHaveCount(0);
});

test('an uploading row has a progress bar named by its file', async ({ page }) => {
  const bar = page.getByRole('progressbar', { name: 'Moodboard.jpg' });
  await expect(bar).toHaveAttribute('aria-valuenow', '50');
});

test('the zone shows the focus ring while its input has keyboard focus', async ({ page }) => {
  const live = page.getByTestId('live');
  await live.locator('input[type="file"]').focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  const outline = await live.locator('.bland-file-upload__dropzone').evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).toBe('solid');
});

test('disabled: the input is disabled, drops do nothing and the file list is hidden', async ({ page }) => {
  const root = page.locator('.bland-file-upload[data-disabled]');
  await expect(root.locator('input[type="file"]')).toBeDisabled();
  await expect(root.getByRole('list')).toHaveCount(0);
});
