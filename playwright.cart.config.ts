import { defineConfig, devices } from '@playwright/test'

/**
 * Simplified Playwright Configuration for Cart E2E Tests
 *
 * This config is optimized for CI/CD cart functionality testing.
 * Uses fewer browser configurations for faster execution.
 */

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/cart-functionality.spec.ts',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Maximum time for expect() calls
  expect: {
    timeout: 5000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry failed tests in CI
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 2 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['html'], ['list']],

  // Shared settings for all projects
  use: {
    // Base URL - supports Vercel preview deployments
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on failure
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Emulate timezone
    timezoneId: 'Europe/Madrid',

    // Emulate locale (Spanish by default for MoldovaDirect)
    locale: 'es-ES',
  },

  // Configure projects - simplified for cart tests
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Only test mobile on main branch or manual trigger
    ...(process.env.CI && !process.env.FULL_SUITE ? [] : [
      {
        name: 'mobile-chrome',
        use: { ...devices['Pixel 5'] },
      },
    ]),
  ],

  // Only start local dev server if not testing against Vercel preview
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      },

  // Output directory for test results
  outputDir: 'test-results/',
})
