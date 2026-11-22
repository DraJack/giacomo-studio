import { defineConfig } from '@playwright/test';

export default defineConfig({
  testMatch: /.*\.spec\.mjs$/,
  timeout: 30_000,
  reporter: 'list',
  webServer: { command: 'node serve.mjs', port: 4173, reuseExistingServer: true },
  use: { baseURL: 'http://localhost:4173', browserName: 'chromium' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
