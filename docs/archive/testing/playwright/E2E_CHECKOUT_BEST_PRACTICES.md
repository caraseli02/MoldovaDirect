# E2E Testing Best Practices for Express Checkout Flows

> Comprehensive guide for Playwright E2E testing with focus on checkout flows, pre-commit hooks, and CI/CD integration.

## Table of Contents
- [Overview](#overview)
- [1. Playwright E2E Testing Patterns](#1-playwright-e2e-testing-patterns)
- [2. Pre-commit Hook Integration](#2-pre-commit-hook-integration)
- [3. Test Fixtures & Data Setup](#3-test-fixtures--data-setup)
- [4. Testing Countdown Timers & Auto-Navigation](#4-testing-countdown-timers--auto-navigation)
- [5. Multi-Language Testing](#5-multi-language-testing)
- [6. Mocking vs Real API Calls](#6-mocking-vs-real-api-calls)
- [7. Test Reliability & Flakiness Prevention](#7-test-reliability--flakiness-prevention)
- [8. CI/CD Integration](#8-cicd-integration)
- [9. Complete Example Implementation](#9-complete-example-implementation)
- [10. Project-Specific Recommendations](#10-project-specific-recommendations)

---

## Overview

This guide synthesizes industry best practices from official Playwright documentation, real-world implementations, and lessons learned from checkout flow testing. It focuses on **fast execution**, **zero flaky tests**, and **reliable automation** suitable for pre-commit hooks and CI/CD pipelines.

**Key Priorities:**
- Fast test execution (<2 min for pre-commit)
- Zero flaky tests (reliability over speed)
- Proper test isolation
- Effective cleanup strategies
- Multi-language support (4 locales)

---

## 1. Playwright E2E Testing Patterns

### 1.1 Must-Have Patterns

#### Use Web-First Assertions
Playwright auto-waits for conditions, eliminating timing issues.

```typescript
// ❌ BAD: Manual waits
await page.waitForTimeout(5000)
const text = await page.locator('.price').textContent()
expect(text).toBe('$19.99')

// ✅ GOOD: Web-first assertions
await expect(page.locator('.price')).toHaveText('$19.99')
```

**Why:** Auto-waiting prevents race conditions and makes tests more reliable. Playwright automatically waits up to the timeout for the condition to become true.

#### Prefer Semantic Locators
Use accessible selectors that align with how users interact with the page.

```typescript
// ❌ BAD: Fragile CSS selectors
await page.click('.btn-checkout-submit')

// ✅ GOOD: Role-based locators
await page.getByRole('button', { name: /continuar|continue/i }).click()

// ✅ GOOD: Label-based locators
await page.getByLabel('Email').fill('user@example.com')

// ✅ GOOD: Test IDs for dynamic content
await page.getByTestId('express-checkout-banner').click()
```

**Selector Priority:**
1. `getByRole()` - Best for accessibility
2. `getByLabel()` - Form fields
3. `getByText()` - User-facing content
4. `getByTestId()` - Dynamic/programmatic elements
5. CSS/XPath - Last resort

#### Test Isolation Pattern
Each test runs in its own browser context with clean state.

```typescript
import { test } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Each test gets fresh browser context automatically
    await page.goto('/checkout')
  })

  test('guest checkout works', async ({ page }) => {
    // Completely isolated from other tests
  })

  test('authenticated checkout works', async ({ page }) => {
    // No shared state with previous test
  })
})
```

**Critical:** Never share state between tests. Playwright creates a new browser context for each test by default.

### 1.2 Checkout-Specific Patterns

#### Multi-Step Flow Testing
Break complex flows into logical phases.

```typescript
test.describe('Express Checkout Flow', () => {
  let productPage: Page
  let checkoutPage: Page

  test.beforeEach(async ({ page }) => {
    productPage = page
    await productPage.goto('/')
  })

  test('complete checkout journey', async () => {
    // Phase 1: Add to cart
    await test.step('Add product to cart', async () => {
      await productPage.getByRole('button', { name: /add to cart/i }).first().click()
      await expect(productPage.getByTestId('cart-count')).toHaveText('1')
    })

    // Phase 2: Navigate to checkout
    await test.step('Navigate to checkout', async () => {
      await productPage.goto('/checkout')
      await expect(productPage.getByRole('heading', { name: /shipping/i })).toBeVisible()
    })

    // Phase 3: Express checkout banner
    await test.step('Verify express checkout banner', async () => {
      const banner = productPage.getByTestId('express-checkout-banner')
      await expect(banner).toBeVisible()
      await expect(banner).toContainText(/use saved address/i)
    })

    // Phase 4: Auto-fill validation
    await test.step('Verify data pre-population', async () => {
      await productPage.getByRole('button', { name: /use saved address/i }).click()
      await expect(productPage.getByLabel('Full Name')).toHaveValue(/\w+/)
      await expect(productPage.getByLabel('Address')).not.toBeEmpty()
    })
  })
})
```

**Benefits:**
- Clear test structure
- Better error messages (shows which step failed)
- Easier debugging
- Individual step timing in reports

#### Network Monitoring Pattern
Monitor API calls during checkout flow.

```typescript
test('checkout API calls succeed', async ({ page }) => {
  const apiErrors: string[] = []
  const apiCalls: Map<string, number> = new Map()

  // Monitor responses
  page.on('response', response => {
    const url = response.url()

    // Track checkout-related API calls
    if (url.includes('/api/checkout/')) {
      const endpoint = url.split('/api/checkout/')[1]
      apiCalls.set(endpoint, response.status())

      if (response.status() >= 400) {
        apiErrors.push(`${response.status()} - ${endpoint}`)
      }
    }
  })

  // Perform checkout flow
  await page.goto('/checkout')
  await page.waitForLoadState('networkidle')

  // Verify API health
  expect(apiErrors, `API errors: ${apiErrors.join(', ')}`).toHaveLength(0)
  expect(apiCalls.get('addresses')).toBe(200)
  expect(apiCalls.get('user-data')).toBe(200)
})
```

---

## 2. Pre-commit Hook Integration

### 2.1 Fast Execution Strategy

**Goal:** Complete critical tests in under 2 minutes for pre-commit.

#### Selective Test Execution
Run only changed/affected tests before commit.

```json
// package.json
{
  "scripts": {
    "test:precommit": "playwright test --grep '@critical' --project=chromium --workers=4",
    "test:checkout:fast": "playwright test tests/e2e/checkout-*.spec.ts --project=chromium-es --workers=4",
    "test:full": "playwright test"
  }
}
```

#### Tag Critical Tests
Use test tags to mark essential pre-commit tests.

```typescript
import { test } from '@playwright/test'

// Critical tests run on every commit
test('guest checkout works @critical', async ({ page }) => {
  // ...
})

test('express checkout banner appears @critical', async ({ page }) => {
  // ...
})

// Full test suite only
test('checkout analytics tracking', async ({ page }) => {
  // Runs in CI, not pre-commit
})
```

**Run with:**
```bash
npx playwright test --grep '@critical'
```

### 2.2 Husky + lint-staged Setup

#### Installation
```bash
npm install --save-dev husky lint-staged
npx husky install
```

#### Configuration
```json
// package.json
{
  "scripts": {
    "prepare": "husky install || echo 'Husky not installed'"
  },
  "lint-staged": {
    "tests/e2e/**/*.spec.ts": [
      "eslint --fix",
      "playwright test --grep '@critical' --project=chromium"
    ],
    "components/**/*.vue": [
      "eslint --fix"
    ],
    "*.{ts,js}": [
      "eslint --fix"
    ]
  }
}
```

#### Pre-commit Hook
```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🎭 Running critical E2E tests..."

# Run only critical checkout tests (fast)
npx playwright test \
  --grep '@critical' \
  --project=chromium-es \
  --workers=4 \
  --reporter=line \
  || (echo "❌ E2E tests failed. Fix issues before committing." && exit 1)

echo "✅ E2E tests passed!"

# Run lint-staged for other checks
npx lint-staged
```

### 2.3 Optimization Techniques

#### Parallel Execution
```typescript
// playwright.config.ts
export default defineConfig({
  // Max parallelism for local development
  workers: process.env.CI ? 1 : 4,

  // Fully parallel test execution
  fullyParallel: true,

  // Fast-fail on errors (stop on first failure)
  maxFailures: process.env.CI ? undefined : 1,
})
```

#### Headless Mode
```bash
# Always run headless in pre-commit
PLAYWRIGHT_TEST=true playwright test --grep '@critical'
```

#### API-Based Setup
Skip UI navigation for test data setup.

```typescript
// tests/fixtures/checkout-fixture.ts
import { test as base } from '@playwright/test'

type CheckoutFixtures = {
  authenticatedCheckout: Page
}

export const test = base.extend<CheckoutFixtures>({
  authenticatedCheckout: async ({ page, request }, use) => {
    // Fast API-based authentication (skip login UI)
    const response = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'Test123!@#'
      }
    })

    const cookies = await response.json()
    await page.context().addCookies(cookies)

    await page.goto('/checkout')
    await use(page)
  }
})
```

**Speed Improvement:** API setup is 3-5x faster than UI-based login.

---

## 3. Test Fixtures & Data Setup

### 3.1 Custom Fixtures Pattern

Create reusable, type-safe test contexts.

```typescript
// tests/fixtures/checkout.fixture.ts
import { test as base, expect } from '@playwright/test'

// Define fixture types
type CheckoutFixtures = {
  cart: Cart
  checkoutPage: CheckoutPage
  savedAddress: SavedAddress
}

// Page Object Models
class Cart {
  constructor(private page: Page) {}

  async addProduct(productId: string) {
    await this.page.getByTestId(`add-to-cart-${productId}`).click()
    await expect(this.page.getByTestId('cart-count')).not.toHaveText('0')
  }

  async getItemCount(): Promise<number> {
    const text = await this.page.getByTestId('cart-count').textContent()
    return parseInt(text || '0')
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('networkidle')
  }

  async fillShippingForm(data: ShippingData) {
    await this.page.getByLabel('Full Name').fill(data.fullName)
    await this.page.getByLabel('Address').fill(data.address)
    await this.page.getByLabel('City').fill(data.city)
    await this.page.getByLabel('Postal Code').fill(data.postalCode)
  }

  async useExpressCheckout() {
    await this.page.getByRole('button', { name: /use saved address/i }).click()
  }
}

class SavedAddress {
  constructor(private page: Page, private request: APIRequestContext) {}

  async create(address: AddressData) {
    // Use API to create saved address (fast)
    const response = await this.request.post('/api/checkout/addresses', {
      data: address
    })
    expect(response.ok()).toBeTruthy()
    return response.json()
  }

  async cleanup() {
    // Delete test addresses
    await this.request.delete('/api/checkout/addresses/test-cleanup')
  }
}

// Extend base test with fixtures
export const test = base.extend<CheckoutFixtures>({
  cart: async ({ page }, use) => {
    const cart = new Cart(page)
    await use(cart)
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page)
    await use(checkoutPage)
  },

  savedAddress: async ({ page, request }, use) => {
    const savedAddress = new SavedAddress(page, request)
    await use(savedAddress)
    // Cleanup after test
    await savedAddress.cleanup()
  }
})

export { expect }
```

**Usage:**
```typescript
import { test, expect } from './fixtures/checkout.fixture'

test('express checkout with saved address', async ({ cart, checkoutPage, savedAddress }) => {
  // Setup - create saved address via API (fast)
  await savedAddress.create({
    fullName: 'John Doe',
    address: '123 Main St',
    city: 'Madrid',
    postalCode: '28001'
  })

  // Test flow
  await cart.addProduct('product-123')
  await checkoutPage.goto()
  await checkoutPage.useExpressCheckout()

  // Verify
  await expect(checkoutPage.page.getByLabel('Full Name')).toHaveValue('John Doe')

  // Cleanup happens automatically via fixture teardown
})
```

### 3.2 Data Cleanup Pattern

Ensure tests leave no residual data.

```typescript
// tests/fixtures/cleanup.fixture.ts
import { test as base } from '@playwright/test'

type CleanupFixture = {
  cleanup: CleanupService
}

class CleanupService {
  private cleanupTasks: (() => Promise<void>)[] = []

  constructor(private request: APIRequestContext) {}

  // Register cleanup task
  register(task: () => Promise<void>) {
    this.cleanupTasks.unshift(task) // LIFO order
  }

  // Automatic cleanup
  async execute() {
    for (const task of this.cleanupTasks) {
      try {
        await task()
      } catch (error) {
        console.warn('Cleanup task failed:', error)
        // Continue with other tasks
      }
    }
  }

  // Helper methods
  async deleteAddress(addressId: string) {
    this.register(async () => {
      await this.request.delete(`/api/checkout/addresses/${addressId}`)
    })
  }

  async deleteOrder(orderId: string) {
    this.register(async () => {
      await this.request.delete(`/api/orders/${orderId}`)
    })
  }

  async clearCart(userId: string) {
    this.register(async () => {
      await this.request.post('/api/cart/clear', { data: { userId } })
    })
  }
}

export const test = base.extend<CleanupFixture>({
  cleanup: async ({ request }, use) => {
    const cleanup = new CleanupService(request)
    await use(cleanup)
    // Execute all cleanup tasks after test
    await cleanup.execute()
  }
})
```

**Usage:**
```typescript
test('checkout creates order', async ({ page, cleanup }) => {
  // Create order
  await page.goto('/checkout')
  await page.getByRole('button', { name: /complete order/i }).click()

  const orderId = await page.getByTestId('order-id').textContent()

  // Register cleanup
  cleanup.deleteOrder(orderId!)

  // Test continues...
  // Cleanup happens automatically even if test fails
})
```

### 3.3 Test Data Service Pattern

Centralized test data management with automatic cleanup.

```typescript
// tests/services/test-data.service.ts
export class TestDataService {
  private entities = new Map<string, string[]>()

  constructor(private request: APIRequestContext) {}

  async createAddress(data: Partial<AddressData> = {}) {
    const address = {
      fullName: data.fullName || 'Test User',
      address: data.address || '123 Test Street',
      city: data.city || 'Madrid',
      postalCode: data.postalCode || '28001',
      country: data.country || 'ES',
      ...data
    }

    const response = await this.request.post('/api/checkout/addresses', {
      data: address
    })

    const { id } = await response.json()
    this.track('addresses', id)

    return { id, ...address }
  }

  async createUser(data: Partial<UserData> = {}) {
    const user = {
      email: data.email || `test-${Date.now()}@example.com`,
      password: data.password || 'Test123!@#',
      ...data
    }

    const response = await this.request.post('/api/auth/register', {
      data: user
    })

    const { id } = await response.json()
    this.track('users', id)

    return { id, ...user }
  }

  private track(type: string, id: string) {
    if (!this.entities.has(type)) {
      this.entities.set(type, [])
    }
    this.entities.get(type)!.push(id)
  }

  async cleanup() {
    // Priority deletions (entities with dependencies first)
    const priorityTypes = ['orders', 'addresses']
    for (const type of priorityTypes) {
      await this.cleanupType(type)
    }

    // Standard deletions
    for (const [type] of this.entities) {
      if (!priorityTypes.includes(type)) {
        await this.cleanupType(type)
      }
    }
  }

  private async cleanupType(type: string) {
    const ids = this.entities.get(type) || []
    await Promise.allSettled(
      ids.map(id => this.request.delete(`/api/${type}/${id}`))
    )
    this.entities.delete(type)
  }
}
```

---

## 4. Testing Countdown Timers & Auto-Navigation

### 4.1 Clock API for Time Control

Playwright's Clock API allows manipulation of time without waiting.

```typescript
import { test, expect } from '@playwright/test'

test.describe('Express Checkout Countdown', () => {
  test('auto-redirects after 10 seconds', async ({ page }) => {
    // Install clock control
    await page.clock.install()

    // Navigate to checkout
    await page.goto('/checkout')

    // Express checkout banner appears
    await expect(page.getByTestId('express-checkout-banner')).toBeVisible()

    // Verify countdown starts at 10
    await expect(page.getByTestId('countdown-timer')).toHaveText('10')

    // Fast-forward 5 seconds
    await page.clock.fastForward(5000)
    await expect(page.getByTestId('countdown-timer')).toHaveText('5')

    // Fast-forward remaining 5 seconds
    await page.clock.fastForward(5000)

    // Verify auto-navigation to payment step
    await expect(page).toHaveURL(/\/checkout\/payment/)
    await expect(page.getByRole('heading', { name: /payment/i })).toBeVisible()
  })

  test('countdown can be cancelled', async ({ page }) => {
    await page.clock.install()
    await page.goto('/checkout')

    // Wait for banner
    await expect(page.getByTestId('express-checkout-banner')).toBeVisible()

    // Fast-forward 5 seconds
    await page.clock.fastForward(5000)
    await expect(page.getByTestId('countdown-timer')).toHaveText('5')

    // User clicks "Edit" to cancel auto-navigation
    await page.getByRole('button', { name: /edit address/i }).click()

    // Fast-forward past original countdown time
    await page.clock.fastForward(10000)

    // Verify we're still on checkout page (no auto-navigation)
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByTestId('countdown-timer')).not.toBeVisible()
  })
})
```

### 4.2 Inactivity Timeout Testing

Test features that trigger after periods of inactivity.

```typescript
test('session timeout warning appears after 5 minutes', async ({ page }) => {
  await page.clock.install()
  await page.goto('/checkout')

  // No warning initially
  await expect(page.getByTestId('session-timeout-warning')).not.toBeVisible()

  // Fast-forward 4 minutes (no warning yet)
  await page.clock.fastForward('04:00')
  await expect(page.getByTestId('session-timeout-warning')).not.toBeVisible()

  // Fast-forward 1 more minute (total 5 minutes)
  await page.clock.fastForward('01:00')

  // Warning should appear
  await expect(page.getByTestId('session-timeout-warning')).toBeVisible()
  await expect(page.getByTestId('session-timeout-warning')).toContainText(/1 minute remaining/i)

  // User clicks "Continue Shopping" to reset timer
  await page.getByRole('button', { name: /continue shopping/i }).click()

  // Fast-forward another 5 minutes
  await page.clock.fastForward('05:00')

  // Warning should appear again
  await expect(page.getByTestId('session-timeout-warning')).toBeVisible()
})
```

### 4.3 Testing Scheduled Actions

```typescript
test('abandoned cart email scheduled correctly', async ({ page }) => {
  await page.clock.install({ time: new Date('2024-01-01T10:00:00') })

  // Add product to cart
  await page.goto('/')
  await page.getByRole('button', { name: /add to cart/i }).first().click()

  // Leave checkout without completing
  await page.goto('/checkout')
  await page.goto('/')

  // Fast-forward 24 hours
  await page.clock.fastForward('24:00:00')

  // Verify abandoned cart email was scheduled
  // (This would typically check email logs or queue)
  const emailLogs = await page.request.get('/api/admin/email-logs')
  const logs = await emailLogs.json()

  expect(logs).toContainEqual(
    expect.objectContaining({
      type: 'abandoned_cart',
      scheduledAt: '2024-01-02T10:00:00'
    })
  )
})
```

**Key Methods:**
- `page.clock.install()` - Enable time control
- `page.clock.fastForward(time)` - Skip ahead (e.g., '05:00', 5000)
- `page.clock.pauseAt(time)` - Pause at specific time
- `page.clock.setFixedTime(date)` - Set fixed time for Date.now()

---

## 5. Multi-Language Testing

### 5.1 Locale-Based Test Projects

Configure separate test projects for each locale.

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const locales = ['es', 'en', 'ro', 'ru']

export default defineConfig({
  projects: [
    // Generate project for each locale
    ...locales.map(locale => ({
      name: `chromium-${locale}`,
      use: {
        ...devices['Desktop Chrome'],
        locale,
        timezoneId: 'Europe/Madrid',
        // Locale-specific storage state (if using auth)
        storageState: `tests/fixtures/.auth/user-${locale}.json`,
      },
    })),
  ],
})
```

**Run tests for specific locale:**
```bash
npx playwright test --project=chromium-es  # Spanish only
npx playwright test --project=chromium-en  # English only
```

### 5.2 i18next Fixture Pattern

Access translations directly in tests.

```typescript
// tests/fixtures/i18n.fixture.ts
import { test as base } from '@playwright/test'
import i18next from 'i18next'
import es from '../../i18n/locales/es.json'
import en from '../../i18n/locales/en.json'
import ro from '../../i18n/locales/ro.json'
import ru from '../../i18n/locales/ru.json'

type I18nFixture = {
  t: (key: string, locale?: string) => string
}

// Initialize i18next
i18next.init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    ro: { translation: ro },
    ru: { translation: ru },
  },
  fallbackLng: 'es',
})

export const test = base.extend<I18nFixture>({
  t: async ({ }, use, testInfo) => {
    // Extract locale from project name (e.g., "chromium-es" -> "es")
    const projectLocale = testInfo.project.name.split('-')[1] || 'es'

    const translate = (key: string, locale: string = projectLocale) => {
      return i18next.t(key, { lng: locale })
    }

    await use(translate)
  },
})

export { expect }
```

**Usage:**
```typescript
import { test, expect } from './fixtures/i18n.fixture'

test('checkout shows correct translations', async ({ page, t }) => {
  await page.goto('/checkout')

  // Use translations from fixture
  await expect(page.getByRole('heading')).toHaveText(t('checkout.shipping.title'))
  await expect(page.getByLabel(t('checkout.shipping.fullName'))).toBeVisible()
  await expect(page.getByRole('button', { name: t('checkout.actions.continue') })).toBeEnabled()
})
```

### 5.3 Multi-Locale Test Pattern

Test same functionality across all locales.

```typescript
import { test, expect } from '@playwright/test'

// Test runs for each locale project (es, en, ro, ru)
test('express checkout banner appears in all languages', async ({ page }) => {
  await page.goto('/checkout')

  // Use regex to match any locale variant
  await expect(
    page.getByRole('heading', { name: /express checkout|pago express|быстрая оплата|plată express/i })
  ).toBeVisible()

  // Verify "Use saved address" button exists in current locale
  await expect(
    page.getByRole('button', { name: /use saved|usar guardada|использовать сохран|utilizați salvat/i })
  ).toBeVisible()
})
```

### 5.4 Visual Regression Across Locales

Ensure UI consistency across languages.

```typescript
test('checkout layout consistent across locales', async ({ page }) => {
  await page.goto('/checkout')

  // Wait for content to load
  await page.waitForLoadState('networkidle')

  // Take screenshot (automatically named with locale)
  await expect(page).toHaveScreenshot('checkout-page.png', {
    fullPage: true,
    maxDiffPixels: 100, // Allow minor differences for text length
  })
})
```

**Organize snapshots by locale:**
```
tests/
  checkout.spec.ts
  checkout.spec.ts-snapshots/
    chromium-es/
      checkout-page.png
    chromium-en/
      checkout-page.png
    chromium-ro/
      checkout-page.png
    chromium-ru/
      checkout-page.png
```

---

## 6. Mocking vs Real API Calls

### 6.1 Decision Matrix

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| **Pre-commit tests** | Mock | Speed (no network latency) |
| **Third-party APIs** | Mock | Reliability (no external dependencies) |
| **Payment gateways** | Mock | Cost (avoid real charges) |
| **Email services** | Mock | Control (no actual emails sent) |
| **Integration tests** | Real | Verify actual backend behavior |
| **CI/CD smoke tests** | Real | Catch integration issues |
| **Database queries** | Real | Validate RLS policies |

### 6.2 API Mocking Pattern

Mock external dependencies for fast, reliable tests.

```typescript
// tests/mocks/checkout-api.mock.ts
import { Page } from '@playwright/test'

export async function mockCheckoutAPIs(page: Page) {
  // Mock user addresses endpoint
  await page.route('**/api/checkout/addresses', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        addresses: [
          {
            id: 'mock-addr-1',
            fullName: 'John Doe',
            address: '123 Main Street',
            city: 'Madrid',
            postalCode: '28001',
            country: 'ES',
            isDefault: true,
          }
        ]
      })
    })
  })

  // Mock payment processing
  await page.route('**/api/payments/process', async route => {
    const request = route.request()
    const postData = request.postDataJSON()

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        transactionId: `mock-txn-${Date.now()}`,
        amount: postData.amount,
      })
    })
  })

  // Mock analytics tracking
  await page.route('**/api/analytics/**', async route => {
    await route.fulfill({ status: 200, body: '{}' })
  })
}
```

**Usage:**
```typescript
import { test, expect } from '@playwright/test'
import { mockCheckoutAPIs } from './mocks/checkout-api.mock'

test('express checkout with mocked APIs @fast', async ({ page }) => {
  // Enable mocking
  await mockCheckoutAPIs(page)

  // Test flow (no real API calls)
  await page.goto('/checkout')
  await expect(page.getByTestId('express-checkout-banner')).toBeVisible()
  await expect(page.getByText('John Doe')).toBeVisible()

  // Fast test execution (no network delays)
})
```

### 6.3 Hybrid Approach Pattern

Use real APIs but mock slow/unreliable endpoints.

```typescript
test('checkout with hybrid mocking', async ({ page }) => {
  // Mock only payment gateway (slow, costs money)
  await page.route('**/api/payments/stripe/**', async route => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ clientSecret: 'mock_secret_123' })
    })
  })

  // Mock email service (external dependency)
  await page.route('**/api/email/send', async route => {
    await route.fulfill({ status: 200, body: '{"sent": true}' })
  })

  // Use REAL APIs for everything else
  // - User authentication: Real (test Supabase integration)
  // - Address CRUD: Real (test RLS policies)
  // - Order creation: Real (test database constraints)

  await page.goto('/checkout')
  // ... test flow with real + mocked APIs
})
```

### 6.4 HAR Replay Pattern

Record real API traffic and replay for consistent testing.

```bash
# Record HAR file from real session
npx playwright test --headed --update-har=tests/fixtures/checkout-flow.har
```

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Replay from HAR file
    serviceWorkers: 'allow',
  }
})
```

```typescript
test('checkout with HAR replay', async ({ page, context }) => {
  // Replay recorded API responses
  await context.routeFromHAR('tests/fixtures/checkout-flow.har', {
    url: '**/api/**',
    update: false, // Don't update, just replay
  })

  await page.goto('/checkout')
  // All API calls return recorded responses
})
```

**Benefits:**
- Real API response structure
- Consistent data across runs
- Fast execution (no network)

---

## 7. Test Reliability & Flakiness Prevention

### 7.1 Root Causes of Flaky Tests

| Cause | Example | Solution |
|-------|---------|----------|
| **Timing issues** | `waitForTimeout(5000)` | Use web-first assertions |
| **Unstable selectors** | `.btn-123` | Use semantic locators |
| **Shared state** | Reusing same test user | Full test isolation |
| **Network dependencies** | Real third-party APIs | Mock or use HAR |
| **Race conditions** | Checking element before it loads | Auto-waiting locators |
| **Environment variance** | Different CI vs local | Containerize (Docker) |

### 7.2 Web-First Assertion Pattern

Always prefer auto-waiting assertions.

```typescript
// ❌ FLAKY: Manual timing
await page.waitForTimeout(3000)
const button = await page.locator('button').isEnabled()
expect(button).toBe(true)

// ✅ RELIABLE: Auto-waiting
await expect(page.locator('button')).toBeEnabled()

// ❌ FLAKY: Multiple steps with race condition
await page.click('button')
await page.waitForTimeout(1000)
const modal = page.locator('.modal')
expect(await modal.isVisible()).toBe(true)

// ✅ RELIABLE: Single assertion with auto-wait
await page.click('button')
await expect(page.locator('.modal')).toBeVisible()
```

### 7.3 Stable Selector Strategy

```typescript
// Priority ranking for selectors

// 1️⃣ BEST: Role-based (accessibility)
await page.getByRole('button', { name: 'Submit' })

// 2️⃣ GOOD: Label-based (forms)
await page.getByLabel('Email address')

// 3️⃣ GOOD: Placeholder text
await page.getByPlaceholder('Enter your email')

// 4️⃣ ACCEPTABLE: Test IDs (for dynamic content)
await page.getByTestId('express-checkout-banner')

// 5️⃣ LAST RESORT: CSS/XPath
await page.locator('[data-checkout-step="shipping"]')

// ❌ AVOID: Fragile selectors
await page.locator('.css-8675309-Button-primary') // Auto-generated classes
await page.locator('div > div > button:nth-child(3)') // Position-dependent
```

**Add test IDs to components:**
```vue
<!-- components/checkout/ExpressCheckoutBanner.vue -->
<template>
  <div data-testid="express-checkout-banner" class="banner">
    <button
      data-testid="use-saved-address-btn"
      @click="handleUseAddress"
    >
      {{ t('checkout.useSavedAddress') }}
    </button>
  </div>
</template>
```

### 7.4 Network Waiting Pattern

Ensure all network requests complete before assertions.

```typescript
test('checkout loads completely', async ({ page }) => {
  await page.goto('/checkout')

  // ✅ Wait for all network activity to settle
  await page.waitForLoadState('networkidle')

  // ✅ Wait for specific API calls
  await page.waitForResponse(response =>
    response.url().includes('/api/checkout/addresses') && response.status() === 200
  )

  // Now safe to make assertions
  await expect(page.getByTestId('express-checkout-banner')).toBeVisible()
})
```

### 7.5 Retry Strategy

Configure intelligent retries for CI environments.

```typescript
// playwright.config.ts
export default defineConfig({
  // Retry failed tests in CI only
  retries: process.env.CI ? 2 : 0,

  // Retry-specific timeout adjustments
  timeout: 30000, // Test timeout
  expect: {
    timeout: 5000, // Assertion timeout
  },

  // Capture debug info on retry
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

**Retry best practices:**
- Use retries to **detect** flaky tests, not hide them
- Fix root cause when tests need retries
- Monitor retry rate (should be <5%)
- Disable retries locally to surface issues

### 7.6 Environment Consistency

Containerize test environment for reproducibility.

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.55.1-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  playwright:
    build:
      context: .
      dockerfile: Dockerfile.playwright
    environment:
      - BASE_URL=http://localhost:3000
      - CI=true
    volumes:
      - ./tests:/app/tests
      - ./test-results:/app/test-results
```

**Run tests in container:**
```bash
docker-compose run playwright
```

---

## 8. CI/CD Integration

### 8.1 GitHub Actions Configuration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    strategy:
      matrix:
        # Shard tests across 4 parallel jobs
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests (shard ${{ matrix.shard }}/4)
        run: |
          npx playwright test \
            --shard=${{ matrix.shard }}/4 \
            --project=chromium-es \
            --reporter=github
        env:
          BASE_URL: ${{ secrets.STAGING_URL }}
          PLAYWRIGHT_TEST: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-results-${{ matrix.shard }}
          path: test-results/
          retention-days: 7

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
          retention-days: 7
```

### 8.2 Parallel Sharding Strategy

Distribute tests across multiple machines for faster CI.

```typescript
// playwright.config.ts
export default defineConfig({
  // Enable sharding support
  workers: process.env.CI ? 1 : 4,
  fullyParallel: true,

  // CI-specific optimizations
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
```

**Run with sharding:**
```bash
# Split tests into 4 shards
npx playwright test --shard=1/4  # Job 1
npx playwright test --shard=2/4  # Job 2
npx playwright test --shard=3/4  # Job 3
npx playwright test --shard=4/4  # Job 4
```

**Performance improvement:**
- Without sharding: 20 minutes
- With 4 shards: 5-7 minutes (3-4x faster)

### 8.3 Test Against Vercel Preview Deployments

```yaml
# .github/workflows/preview-tests.yml
name: Test Vercel Preview

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  wait-for-deployment:
    runs-on: ubuntu-latest
    outputs:
      preview-url: ${{ steps.get-url.outputs.url }}

    steps:
      - name: Wait for Vercel deployment
        uses: UnlyEd/github-action-await-vercel@v1
        id: await-vercel
        with:
          timeout: 300
          vercel-token: ${{ secrets.VERCEL_TOKEN }}

      - name: Get preview URL
        id: get-url
        run: echo "url=${{ steps.await-vercel.outputs.deployment-url }}" >> $GITHUB_OUTPUT

  test-preview:
    needs: wait-for-deployment
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run E2E tests against preview
        run: npx playwright test --project=chromium-es
        env:
          PLAYWRIGHT_TEST_BASE_URL: ${{ needs.wait-for-deployment.outputs.preview-url }}
```

### 8.4 CI Optimization Strategies

#### 1. Cache Playwright Browsers
```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}
```

#### 2. Fail-Fast Strategy
```yaml
strategy:
  fail-fast: true  # Stop all jobs if one fails
  matrix:
    shard: [1, 2, 3, 4]
```

#### 3. Conditional Test Execution
```yaml
# Only run checkout tests if checkout files changed
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v42
  with:
    files: |
      components/checkout/**
      pages/checkout/**
      tests/e2e/checkout-*.spec.ts

- name: Run checkout tests
  if: steps.changed-files.outputs.any_changed == 'true'
  run: npx playwright test tests/e2e/checkout-*.spec.ts
```

#### 4. Worker Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  // Optimize for CI environment
  workers: process.env.CI ? 1 : undefined,

  // Increase timeouts in CI (slower machines)
  timeout: process.env.CI ? 60000 : 30000,
})
```

---

## 9. Complete Example Implementation

### 9.1 Express Checkout Flow Test Suite

```typescript
// tests/e2e/checkout-express.spec.ts
import { test, expect } from '../fixtures/checkout.fixture'

test.describe('Express Checkout Flow', () => {
  test.describe.configure({ mode: 'serial' }) // Run tests in order

  let userId: string
  let addressId: string

  test.beforeAll(async ({ request }) => {
    // Setup: Create test user with saved address via API
    const userResponse = await request.post('/api/auth/register', {
      data: {
        email: `test-${Date.now()}@example.com`,
        password: 'Test123!@#'
      }
    })
    const userData = await userResponse.json()
    userId = userData.id

    // Create saved address
    const addressResponse = await request.post('/api/checkout/addresses', {
      data: {
        userId,
        fullName: 'Test User',
        address: '123 Test Street',
        city: 'Madrid',
        postalCode: '28001',
        country: 'ES',
        isDefault: true,
      }
    })
    const addressData = await addressResponse.json()
    addressId = addressData.id
  })

  test.afterAll(async ({ request }) => {
    // Cleanup: Delete test data
    await request.delete(`/api/checkout/addresses/${addressId}`)
    await request.delete(`/api/users/${userId}`)
  })

  test('displays express checkout banner for returning user @critical', async ({ page, cart }) => {
    // Add product to cart
    await page.goto('/')
    await cart.addProduct('product-1')

    // Navigate to checkout
    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // Verify express checkout banner appears
    const banner = page.getByTestId('express-checkout-banner')
    await expect(banner).toBeVisible()
    await expect(banner).toContainText(/pago express|express checkout/i)

    // Verify saved address is shown
    await expect(banner).toContainText('Test User')
    await expect(banner).toContainText('123 Test Street')
  })

  test('countdown timer works correctly @critical', async ({ page, cart }) => {
    // Setup clock control
    await page.clock.install()

    await page.goto('/')
    await cart.addProduct('product-1')
    await page.goto('/checkout')

    // Verify countdown starts at 10 seconds
    await expect(page.getByTestId('countdown-timer')).toHaveText('10')

    // Fast-forward 5 seconds
    await page.clock.fastForward(5000)
    await expect(page.getByTestId('countdown-timer')).toHaveText('5')

    // Fast-forward to completion
    await page.clock.fastForward(5000)

    // Verify auto-navigation occurred
    await expect(page).toHaveURL(/\/checkout\/payment/)
  })

  test('user can cancel auto-navigation @critical', async ({ page, cart }) => {
    await page.clock.install()

    await page.goto('/')
    await cart.addProduct('product-1')
    await page.goto('/checkout')

    // Wait for banner
    await expect(page.getByTestId('express-checkout-banner')).toBeVisible()

    // Click "Edit" to cancel
    await page.getByRole('button', { name: /edit address|editar dirección/i }).click()

    // Fast-forward past countdown time
    await page.clock.fastForward(15000)

    // Verify we're still on shipping step
    await expect(page).toHaveURL(/\/checkout$/)
    await expect(page.getByRole('heading', { name: /shipping|envío/i })).toBeVisible()
  })

  test('address data pre-populates form fields', async ({ page, cart, checkoutPage }) => {
    await page.goto('/')
    await cart.addProduct('product-1')
    await checkoutPage.goto()

    // Click "Use this address"
    await page.getByRole('button', { name: /use this address|usar esta dirección/i }).click()

    // Verify form fields are populated
    await expect(page.getByLabel(/full name|nombre completo/i)).toHaveValue('Test User')
    await expect(page.getByLabel(/address|dirección/i)).toHaveValue('123 Test Street')
    await expect(page.getByLabel(/city|ciudad/i)).toHaveValue('Madrid')
    await expect(page.getByLabel(/postal code|código postal/i)).toHaveValue('28001')
  })

  test('handles multiple saved addresses', async ({ page, cart, request }) => {
    // Create second address
    await request.post('/api/checkout/addresses', {
      data: {
        userId,
        fullName: 'Work Address',
        address: '456 Office Blvd',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'ES',
        isDefault: false,
      }
    })

    await page.goto('/')
    await cart.addProduct('product-1')
    await page.goto('/checkout')

    // Banner should show default address
    await expect(page.getByTestId('express-checkout-banner')).toContainText('Test User')

    // Click "Change address" to see all addresses
    await page.getByRole('button', { name: /change address|cambiar dirección/i }).click()

    // Verify address selector appears with both addresses
    const addressList = page.getByTestId('address-selector')
    await expect(addressList).toBeVisible()
    await expect(addressList).toContainText('Test User')
    await expect(addressList).toContainText('Work Address')
  })
})
```

### 9.2 Multi-Locale Checkout Test

```typescript
// tests/e2e/checkout-i18n.spec.ts
import { test, expect } from '../fixtures/i18n.fixture'

test.describe('Checkout Internationalization', () => {
  test('displays correct translations @critical', async ({ page, t }) => {
    await page.goto('/checkout')

    // Verify page title
    await expect(page.getByRole('heading', { level: 1 }))
      .toHaveText(t('checkout.title'))

    // Verify shipping section
    await expect(page.getByRole('heading', { name: t('checkout.shipping.title') }))
      .toBeVisible()

    // Verify form labels
    await expect(page.getByLabel(t('checkout.shipping.fullName')))
      .toBeVisible()
    await expect(page.getByLabel(t('checkout.shipping.address')))
      .toBeVisible()

    // Verify buttons
    await expect(page.getByRole('button', { name: t('checkout.actions.continue') }))
      .toBeEnabled()
  })

  test('express checkout banner shows correct locale', async ({ page, t }) => {
    // Assuming user has saved address
    await page.goto('/checkout')

    const banner = page.getByTestId('express-checkout-banner')

    // Verify banner title in current locale
    await expect(banner.getByRole('heading'))
      .toHaveText(t('checkout.express.title'))

    // Verify action button
    await expect(banner.getByRole('button'))
      .toHaveText(t('checkout.express.useAddress'))
  })
})
```

### 9.3 Fixture-Based Test Organization

```typescript
// tests/fixtures/checkout.fixture.ts
import { test as base, expect, Page, APIRequestContext } from '@playwright/test'

// Page Object Models
class CartHelper {
  constructor(private page: Page) {}

  async addProduct(productId: string) {
    await this.page.getByTestId(`product-${productId}`).getByRole('button', { name: /add to cart/i }).click()
    await expect(this.page.getByTestId('cart-count')).not.toHaveText('0')
  }

  async getCount(): Promise<number> {
    const text = await this.page.getByTestId('cart-count').textContent()
    return parseInt(text || '0')
  }

  async clear() {
    await this.page.getByTestId('cart-icon').click()
    await this.page.getByRole('button', { name: /clear cart/i }).click()
  }
}

class CheckoutPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/checkout')
    await this.page.waitForLoadState('networkidle')
  }

  async fillShippingForm(data: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country?: string
  }) {
    await this.page.getByLabel(/full name|nombre/i).fill(data.fullName)
    await this.page.getByLabel(/address|dirección/i).fill(data.address)
    await this.page.getByLabel(/city|ciudad/i).fill(data.city)
    await this.page.getByLabel(/postal code|código/i).fill(data.postalCode)

    if (data.country) {
      await this.page.getByLabel(/country|país/i).selectOption(data.country)
    }
  }

  async useExpressCheckout() {
    await this.page.getByRole('button', { name: /use this address|usar esta/i }).click()
  }

  async expectBannerVisible() {
    await expect(this.page.getByTestId('express-checkout-banner')).toBeVisible()
  }
}

class AddressManager {
  private createdAddresses: string[] = []

  constructor(private request: APIRequestContext) {}

  async create(data: {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    isDefault?: boolean
  }) {
    const response = await this.request.post('/api/checkout/addresses', {
      data
    })

    expect(response.ok()).toBeTruthy()
    const { id } = await response.json()
    this.createdAddresses.push(id)

    return { id, ...data }
  }

  async cleanup() {
    await Promise.allSettled(
      this.createdAddresses.map(id =>
        this.request.delete(`/api/checkout/addresses/${id}`)
      )
    )
  }
}

// Fixture types
type CheckoutFixtures = {
  cart: CartHelper
  checkoutPage: CheckoutPage
  addressManager: AddressManager
}

// Extend base test
export const test = base.extend<CheckoutFixtures>({
  cart: async ({ page }, use) => {
    await use(new CartHelper(page))
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page))
  },

  addressManager: async ({ request }, use) => {
    const manager = new AddressManager(request)
    await use(manager)
    await manager.cleanup() // Auto-cleanup after test
  },
})

export { expect }
```

---

## 10. Project-Specific Recommendations

### 10.1 Moldova Direct Checkout Tests

Based on your project structure, here are specific recommendations:

#### Update Test Structure
```
tests/
  e2e/
    checkout/
      express-checkout.spec.ts         # Express checkout flow (@critical)
      guest-checkout.spec.ts           # Guest checkout (@critical)
      address-management.spec.ts       # Address CRUD
      countdown-timer.spec.ts          # Auto-navigation tests
      payment-integration.spec.ts      # Payment processing
      multi-locale.spec.ts             # i18n verification
  fixtures/
    checkout.fixture.ts                # Page objects & helpers
    i18n.fixture.ts                    # Translation helper
    cleanup.fixture.ts                 # Cleanup service
    auth.setup.ts                      # Auth state setup
  mocks/
    checkout-api.mock.ts               # API response mocks
```

#### Update Playwright Config
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const locales = ['es', 'en', 'ro', 'ru']

export default defineConfig({
  testDir: './tests',
  testMatch: '**/e2e/**/*.spec.ts',

  // Fast execution for pre-commit
  fullyParallel: true,
  maxFailures: process.env.CI ? undefined : 1, // Fail-fast locally

  // Retry strategy
  retries: process.env.CI ? 2 : 0,

  // Worker configuration
  workers: process.env.CI ? 1 : 4,

  // Reporters
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Projects for each locale
  projects: [
    // Critical tests (chromium-es only, fast)
    {
      name: 'critical',
      testMatch: /.*@critical.*/,
      use: {
        ...devices['Desktop Chrome'],
        locale: 'es',
      },
    },

    // Full tests (all locales)
    ...locales.map(locale => ({
      name: `chromium-${locale}`,
      testIgnore: /.*@critical.*/,
      use: {
        ...devices['Desktop Chrome'],
        locale,
        timezoneId: 'Europe/Madrid',
      },
    })),
  ],

  // Dev server
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

#### Update package.json Scripts
```json
{
  "scripts": {
    "test:e2e": "PLAYWRIGHT_TEST=true playwright test",
    "test:e2e:critical": "PLAYWRIGHT_TEST=true playwright test --grep '@critical' --project=critical",
    "test:e2e:checkout": "PLAYWRIGHT_TEST=true playwright test tests/e2e/checkout/",
    "test:e2e:headed": "PLAYWRIGHT_TEST=true playwright test --headed",
    "test:e2e:debug": "PLAYWRIGHT_TEST=true playwright test --debug",
    "test:e2e:ui": "PLAYWRIGHT_TEST=true playwright test --ui",
    "test:e2e:report": "playwright show-report",
    "precommit": "npm run test:e2e:critical"
  }
}
```

#### Create Husky Pre-commit Hook
```bash
#!/bin/sh
# .husky/pre-commit

echo "🎭 Running critical E2E tests..."

npm run test:e2e:critical || {
  echo "❌ Critical E2E tests failed!"
  echo "   Run 'npm run test:e2e:debug' to investigate"
  exit 1
}

echo "✅ E2E tests passed!"
```

### 10.2 GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, feat/*, fix/*]
  pull_request:
    branches: [main]

jobs:
  # Fast critical tests (runs first)
  critical:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run critical tests
        run: npm run test:e2e:critical
        env:
          BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: critical-test-results
          path: test-results/

  # Full test suite (runs in parallel)
  full:
    needs: critical
    runs-on: ubuntu-latest
    timeout-minutes: 20

    strategy:
      matrix:
        locale: [es, en, ro, ru]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run tests for ${{ matrix.locale }}
        run: npx playwright test --project=chromium-${{ matrix.locale }}
        env:
          BASE_URL: http://localhost:3000

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.locale }}
          path: test-results/
```

### 10.3 Test Data Management

Create centralized test data service for Moldova Direct.

```typescript
// tests/services/test-data.service.ts
import { APIRequestContext } from '@playwright/test'

export class MoldovaDirectTestData {
  private entities = new Map<string, string[]>()

  constructor(private request: APIRequestContext) {}

  // User management
  async createTestUser(locale: 'es' | 'en' | 'ro' | 'ru' = 'es') {
    const email = `test-${Date.now()}@moldovadirect.test`
    const response = await this.request.post('/api/auth/register', {
      data: {
        email,
        password: 'Test123!@#',
        locale,
      }
    })

    const { id } = await response.json()
    this.track('users', id)

    return { id, email }
  }

  // Address management
  async createAddress(userId: string, data?: Partial<AddressData>) {
    const address = {
      userId,
      fullName: data?.fullName || 'Test User',
      address: data?.address || 'Calle Principal 123',
      city: data?.city || 'Madrid',
      postalCode: data?.postalCode || '28001',
      country: data?.country || 'ES',
      isDefault: data?.isDefault ?? true,
      phone: data?.phone || '+34600000000',
    }

    const response = await this.request.post('/api/checkout/addresses', {
      data: address
    })

    const { id } = await response.json()
    this.track('addresses', id)

    return { id, ...address }
  }

  // Cart management
  async addProductToCart(productId: string, quantity: number = 1) {
    const response = await this.request.post('/api/cart/add', {
      data: { productId, quantity }
    })

    return response.json()
  }

  async clearCart() {
    await this.request.post('/api/cart/clear')
  }

  // Cleanup
  private track(type: string, id: string) {
    if (!this.entities.has(type)) {
      this.entities.set(type, [])
    }
    this.entities.get(type)!.push(id)
  }

  async cleanup() {
    // Delete in dependency order
    const order = ['orders', 'addresses', 'carts', 'users']

    for (const type of order) {
      const ids = this.entities.get(type) || []
      await Promise.allSettled(
        ids.map(id => this.request.delete(`/api/${type}/${id}`))
      )
    }

    this.entities.clear()
  }
}
```

---

## Sources

### Playwright E2E Testing Best Practices
- [Mastering E2E Checkout Testing Using Playwright - Checkly](https://www.checklyhq.com/docs/learn/playwright/checkout-testing-guide/)
- [Guide to Playwright end-to-end testing in 2025 - DeviQA](https://www.deviqa.com/blog/guide-to-playwright-end-to-end-testing-in-2025/)
- [9 Playwright Best Practices and Pitfalls to Avoid | Better Stack](https://betterstack.com/community/guides/testing/playwright-best-practices/)
- [How to avoid Flaky Tests: Playwright Best Practices | Medium](https://medium.com/@samuel.sperling/say-goodbye-to-flaky-tests-playwright-best-practices-every-test-automation-engineer-must-know-9dfeb9bb5017)

### Pre-commit Hooks & Fast Execution
- [Chapter 17 – Playwright Advanced Tips and Optimization - TestingMint](https://testingmint.com/chapter-17-playwright-advanced-tips-and-optimization/)
- [playwright-starter-project-typescript with pre-commit hooks | GitHub](https://github.com/Automation-Andy/playwright-starter-project-typescript)
- [The Definitive Guide to API Test Automation With Playwright: Part 8 - Adding ESlint, Prettier, and Husky](https://playwrightsolutions.com/the-definitive-guide-to-api-test-automation-with-playwright-part-8-adding-eslint-prettier-and-husky/)

### Test Fixtures & Data Setup
- [Fixtures | Playwright](https://playwright.dev/docs/test-fixtures)
- [Effective Utilization of Playwright Fixtures: A Comprehensive Guide | Medium](https://medium.com/@vrknetha/effective-utilization-of-playwright-fixtures-a-comprehensive-guide-841150525c7e)
- [Build Robust & Scalable Test Suites With Playwright Fixtures](https://caw.tech/build-robust-scalable-test-suites-with-playwright-fixtures/)

### Countdown Timers & Auto-Navigation
- [Clock | Playwright](https://playwright.dev/docs/clock)
- [Timeouts | Playwright](https://playwright.dev/docs/test-timeouts)

### Multi-Language Testing
- [Localization Testing at Scale: Playwright Strategies for Multi-Language Web Apps](http://www.thegreenreport.blog/articles/localization-testing-at-scale-playwright-strategies-for-multi-language-web-apps/localization-testing-at-scale-playwright-strategies-for-multi-language-web-apps.html)
- [playwright-i18next-fixture: i18next fixture for playwright | GitHub](https://github.com/cubanducko/playwright-i18next-fixture)
- [Using translations with Playwright and i18n for E2E tests | Medium](https://medium.com/@jeremie.fleurant/using-translations-with-playwright-and-i18n-for-e2e-tests-ba90a667f309)
- [Testing localization with Playwright](https://timdeschryver.dev/blog/testing-localization-with-playwright)

### API Mocking Best Practices
- [Mock APIs | Playwright](https://playwright.dev/docs/mock)
- [How to Mock APIs with Playwright: A Comprehensive Guide | BrowserStack](https://www.browserstack.com/guide/how-to-mock-api-with-playwright)
- [API Mocking for your Playwright tests - DEV Community](https://dev.to/playwright/api-mocking-for-your-playwright-tests-47ah)

### Flakiness Prevention
- [Avoiding Flaky Tests in Playwright | Better Stack](https://betterstack.com/community/guides/testing/avoid-flaky-playwright-tests/)
- [How to Detect and Avoid Playwright Flaky Tests? | BrowserStack](https://www.browserstack.com/guide/playwright-flaky-tests)
- [How to Avoid Flaky Tests in Playwright - Semaphore](https://semaphore.io/blog/flaky-tests-playwright)
- [Playwright Automation Checklist to Reduce Flaky Tests](https://testdino.com/blog/playwright-automation-checklist/)

### CI/CD Integration
- [Implement Playwright in GitHub Actions for CI/CD](https://www.browsercat.com/post/playwright-github-actions-cicd-guide)
- [Continuous Integration | Playwright](https://playwright.dev/docs/ci)
- [Parallel Playwright Tests on GitHub Actions | GitHub](https://github.com/currents-dev/playwright-gh-actions-demo)
- [Seamless CI/CD Integration: Playwright and GitHub Actions](https://dzone.com/articles/seamless-ci-cd-integration-playwright-and-github-actions)

### Test Isolation & Cleanup
- [Isolation | Playwright](https://playwright.dev/docs/browser-contexts)
- [Clean up test data with a Playwright fixture | Matt Crouch's Blog](https://www.mattcrouch.net/blog/2024/05/clean-up-test-data-with-playwright-fixture)
- [Test Data Management in MCP-Playwright Architecture | Medium](https://medium.com/@peyman.iravani/test-data-management-in-mcp-playwright-architecture-69c31e791cf8)

### Example Repositories
- [ovcharski/playwright-e2e: E-commerce testing framework | GitHub](https://github.com/ovcharski/playwright-e2e)
- [akhiltodecode/Playwright_Resource: Beginner-friendly e-commerce testing | GitHub](https://github.com/akhiltodecode/Playwright_Resource)
- [MarcusFelling/demo.playwright: Demo testing scenarios | GitHub](https://github.com/MarcusFelling/demo.playwright)

---

**Last Updated:** 2025-01-27
**Moldova Direct E-commerce Platform**
**Tech Stack:** Nuxt 4.1.3, Vue 3.5, Supabase, Playwright 1.55.1
