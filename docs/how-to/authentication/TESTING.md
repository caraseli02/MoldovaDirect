# 🧪 Testing Guide - Moldova Direct

## Prerequisites

- [Add prerequisites here]

## Steps


Comprehensive testing setup using Playwright for end-to-end testing with multi-language support and visual regression testing.

## Overview

The testing framework provides:
- **End-to-End Testing**: Complete user journey validation
- **Multi-Language Testing**: All 4 locales (ES, EN, RO, RU)
- **Visual Regression**: Screenshot comparison testing
- **Responsive Testing**: Mobile and desktop viewports
- **CI/CD Integration**: Automated testing on GitHub Actions

## Test Structure

```
tests/
├── e2e/                    # End-to-end test specs
│   ├── auth.spec.ts       # Authentication flows
│   ├── basic.spec.ts      # Basic navigation and routing
│   ├── checkout.spec.ts   # Shopping cart and checkout
│   ├── i18n.spec.ts       # Internationalization features
│   ├── products.spec.ts   # Product catalog functionality
│   └── ui-current.spec.ts # Current UI visual validation
├── fixtures/              # Test utilities and helpers
│   ├── base.ts           # Base test class with common setup
│   ├── helpers.ts        # Utility functions
│   └── pages.ts          # Page object models
├── visual/               # Visual regression tests
│   ├── ui-validation.spec.ts      # UI component validation
│   └── visual-regression.spec.ts  # Full page comparisons
├── global-setup.ts       # Global test environment setup
└── global-teardown.ts    # Cleanup after test runs
```

## Running Tests

### Local Development

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm run test

# Run tests with UI (interactive mode)
npm run test:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Debug specific test
npx playwright test auth.spec.ts --debug
```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual

# Update visual baselines (when UI changes are intentional)
npm run test:update-snapshots

# Generate test report
npx playwright show-report
```

## Test Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

## Test Categories

### 1. Authentication Tests (`auth.spec.ts`)

Tests user authentication flows:

```typescript
test.describe('Authentication', () => {
  test('user can register with valid credentials', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="confirmPassword"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/account');
  });

  test('user can login with valid credentials', async ({ page }) => {
    // Test implementation
  });

  test('user can logout', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Internationalization Tests (`i18n.spec.ts`)

Tests multi-language functionality:

```typescript
const locales = ['es', 'en', 'ro', 'ru'];

for (const locale of locales) {
  test(`homepage loads in ${locale}`, async ({ page }) => {
    await page.goto(`/${locale === 'es' ? '' : locale}`);
    
    // Verify language-specific content
    const expectedTitle = translations[locale].home.title;
    await expect(page.locator('h1')).toContainText(expectedTitle);
  });
}
```

### 3. Visual Regression Tests (`ui-current.spec.ts`)

Captures and compares screenshots:

```typescript
test('homepage visual snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-current-full.png', {
    fullPage: true
  });
});

test('mobile homepage snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage-mobile-current.png');
});
```

### 4. Product Catalog Tests (`products.spec.ts`)

Tests product browsing and search:

```typescript
test('product search functionality', async ({ page }) => {
  await page.goto('/products');
  await page.fill('[data-testid="search-input"]', 'wine');
  await page.keyboard.press('Enter');
  
  // Verify search results
  await expect(page.locator('[data-testid="product-card"]')).toHaveCount(3);
});
```

## Test Data and Fixtures

### Base Test Class (`fixtures/base.ts`)

```typescript
import { test as base } from '@playwright/test';

export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Login user before test
    await page.goto('/auth/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/account');
    
    await use(page);
  },
});
```

### Test Helpers (`fixtures/helpers.ts`)

```typescript
export async function seedDatabase() {
  // Database seeding for tests
}

export async function clearDatabase() {
  // Database cleanup
}

export function generateTestUser() {
  return {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User'
  };
}
```

## CI/CD Integration

### GitHub Actions (`.github/workflows/e2e-tests.yml`)

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Visual Testing Guidelines

### When to Update Screenshots

1. **Intentional UI changes**: Run `npm run test:update-snapshots`
2. **New components**: Add visual tests for new UI elements
3. **Responsive breakpoints**: Test different viewport sizes

### Screenshot Naming Convention

```
{page-name}-{variant}-{browser}.png

Examples:
- homepage-current-full-chromium-es-darwin.png
- login-page-current-chromium-es-darwin.png
- products-page-mobile-webkit-en-linux.png
```

## Debugging Tests

### Local Debugging

```bash
# Run with browser visible
npx playwright test --headed

# Debug specific test with step-by-step execution
npx playwright test auth.spec.ts --debug

# Run tests with trace viewer
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Test Reports

```bash
# Generate HTML report
npx playwright show-report

# View test results in browser
open playwright-report/index.html
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use fresh data for each test
- Clean up after tests

### 2. Reliable Selectors
```typescript
// ✅ Good - data-testid attributes
await page.click('[data-testid="submit-button"]');

// ✅ Good - semantic selectors
await page.click('button[type="submit"]');

// ❌ Avoid - fragile CSS selectors
await page.click('.btn.btn-primary.mt-4');
```

### 3. Wait Strategies
```typescript
// ✅ Wait for navigation
await page.waitForURL('/dashboard');

// ✅ Wait for element
await page.waitForSelector('[data-testid="success-message"]');

// ✅ Wait for API calls
await page.waitForResponse('**/api/auth/login');
```

### 4. Error Handling
```typescript
test('handles login error gracefully', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'invalid@example.com');
  await page.fill('[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('[data-testid="error-message"]'))
    .toBeVisible();
});
```

## Maintenance

### Regular Tasks

1. **Update snapshots** when UI changes are intentional
2. **Review test reports** after each CI/CD run
3. **Clean up test data** regularly
4. **Update test dependencies** monthly

### Performance Monitoring

- Monitor test execution time
- Parallel test execution for faster feedback
- Use appropriate timeouts for different operations

---

## Getting Started Checklist

- [ ] Install Playwright: `npm install`
- [ ] Install browsers: `npx playwright install`
- [ ] Run initial tests: `npm run test`
- [ ] Review test report: `npx playwright show-report`
- [ ] Set up CI/CD pipeline
- [ ] Configure visual regression baselines

For more information, see [Playwright documentation](https://playwright.dev/) and [Testing Best Practices](https://playwright.dev/docs/best-practices).