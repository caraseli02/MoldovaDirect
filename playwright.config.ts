import { defineConfig, devices } from '@playwright/test'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/e2e/**/*.spec.ts', '**/pre-commit/**/*.spec.ts', '**/critical/**/*.spec.ts'],
  testIgnore: [
    '**/node_modules/**',
    '**/*.test.ts',
    '**/unit/**',
    '**/templates/**',
    '**/utils/**',
    '**/setup/**',
    '**/manual/**',
    '**/fixtures/**',
    '**/helpers/**',
    '**/page-objects/**'
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ].filter(Boolean),
  
  use: {
    // Support both BASE_URL and PLAYWRIGHT_TEST_BASE_URL for CI/CD flexibility
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    // Pre-commit: Fast smoke tests (< 30 seconds)
    {
      name: 'pre-commit',
      testDir: './tests/pre-commit',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es', // Spanish only for pre-commit
        timezoneId: 'Europe/Madrid',
      },
      retries: 0, // No retries for fast feedback
      timeout: 30000, // 30s per test (allows for Vite cold start)
    },

    // Critical: Fast deployment confidence tests (< 5 minutes)
    {
      name: 'critical',
      testDir: './tests/e2e/critical',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es',
        timezoneId: 'Europe/Madrid',
      },
      retries: 1, // Allow 1 retry for critical tests
      timeout: 30000, // 30s per test
    },

    // Full E2E: Default browser + locale for development
    {
      name: 'chromium-es',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es',
        timezoneId: 'Europe/Madrid',
        permissions: ['geolocation'],
        storageState: 'tests/fixtures/.auth/user-es.json',
      },
    },

    // Full E2E: English locale testing
    {
      name: 'chromium-en',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en',
        timezoneId: 'Europe/Madrid',
        permissions: ['geolocation'],
        storageState: 'tests/fixtures/.auth/user-en.json',
      },
    },

    // Full E2E: Cross-browser testing
    {
      name: 'firefox-es',
      use: {
        ...devices['Desktop Firefox'],
        locale: 'es',
        timezoneId: 'Europe/Madrid',
        storageState: 'tests/fixtures/.auth/user-es.json',
      },
    },

    // Full E2E: Mobile responsive testing
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        locale: 'es',
        storageState: 'tests/fixtures/.auth/user-es.json',
      },
    },

    // Setup: Authentication and global setup
    {
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
    },
  ],

  // Only start web server if not testing against external URL (like Vercel preview)
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000,
  },

  outputDir: 'test-results/',
  
  globalSetup: fileURLToPath(new URL('./tests/global-setup.ts', import.meta.url)),
  globalTeardown: fileURLToPath(new URL('./tests/global-teardown.ts', import.meta.url)),
})