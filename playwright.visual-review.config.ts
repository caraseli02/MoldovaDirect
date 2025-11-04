import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/visual-review',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'visual-review-results/playwright-report' }],
    ['list']
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'visual-review',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en',
        timezoneId: 'Europe/Madrid',
      },
    },
  ],

  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },

  outputDir: 'visual-review-results/test-results/',
})
