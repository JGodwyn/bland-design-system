// Component tests against the playground (docs/components.md, "Testing").
// Chromium only: it is also the only browser that draws corner-shape smoothing.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  use: { baseURL: 'http://localhost:5180', ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
  projects: [{ name: 'chromium' }],
  webServer: {
    command: 'npm run docs',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
  },
});
