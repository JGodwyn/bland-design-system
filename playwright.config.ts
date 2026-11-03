// Component tests against the playground (docs/components.md, "Testing").
// Screenshots run in Chromium only: it is the only browser that draws corner-shape smoothing, and the baselines are
// Chromium's. Behaviour and axe specs also run in WebKit (Safari, every iPhone browser) and Firefox; the docs
// smoke tests stay Chromium only too. `npm test` runs chromium and webkit, `npm run test:firefox` Firefox (its
// Playwright build does not start on macOS 27: "Could not find profile folder", LEARNINGS.md).
import { defineConfig, devices } from '@playwright/test';

const viewport = { width: 1024, height: 768 };
// Screenshots compare against Chromium baselines; the docs smoke tests check the docs site, not the components.
const nonChromium = ['visual.spec.ts', 'docs.spec.ts'];

export default defineConfig({
  testDir: 'tests',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  reporter: [['list']],
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
  use: { baseURL: 'http://localhost:5180' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], viewport }, testIgnore: nonChromium },
    { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport }, testIgnore: nonChromium },
  ],
  webServer: {
    command: 'npm run docs',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
  },
});
