import { defineConfig, devices } from '@playwright/test';

const E2E_CLIENT_PORT = 4173;
const E2E_API_PORT = 4100;
const baseURL = process.env.E2E_BASE_URL || `http://127.0.0.1:${E2E_CLIENT_PORT}`;
const apiURL = process.env.E2E_API_URL || `http://127.0.0.1:${E2E_API_PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Dùng Chrome cài sẵn ở máy dev; CI cài Chromium của Playwright.
        channel: process.env.CI ? undefined : 'chrome',
      },
    },
  ],
  webServer: [
    {
      command: 'node server/src/index.js',
      url: `${apiURL}/api/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        NODE_ENV: 'development',
        PORT: String(E2E_API_PORT),
        MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pt-brain-e2e',
        CLIENT_ORIGIN: baseURL,
        APP_PUBLIC_URL: baseURL,
        SERVE_CLIENT: 'false',
        TRUST_PROXY: '0',
      },
    },
    {
      command: `npm --prefix client run dev -- --host 127.0.0.1 --port ${E2E_CLIENT_PORT} --strictPort`,
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      env: {
        VITE_API_PROXY_TARGET: apiURL,
      },
    },
  ],
});
