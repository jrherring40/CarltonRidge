import { defineConfig, devices } from '@playwright/test';

// Target comes from SITE_URL. Without it, the site is built-and-previewed locally.
const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '');
const baseURL = SITE_URL || 'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 120_000,
  retries: 0,
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: SITE_URL
    ? undefined
    : {
        command: 'npm run build && npm run preview -- --port 4321',
        url: 'http://localhost:4321/',
        timeout: 180_000,
        reuseExistingServer: true,
      },
});
