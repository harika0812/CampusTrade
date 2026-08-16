const { defineConfig, devices } = require('@playwright/test');

const e2eBaseUrl = process.env.E2E_BASE_URL || 'http://localhost:3001';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: e2eBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: e2eBaseUrl,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
