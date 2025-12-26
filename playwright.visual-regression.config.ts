import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

export default defineConfig({
  testDir: './tests/visual-regression',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1, // Run sequentially for consistent screenshots
  reporter: [
    ['html', { outputFolder: 'test-results/visual-regression-html' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'visual-regression-chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es',
        timezoneId: 'Europe/Madrid',
      },
    },
  ],

  outputDir: 'test-results/visual-regression',
})
