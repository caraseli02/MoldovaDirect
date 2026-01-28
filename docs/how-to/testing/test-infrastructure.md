# Test Infrastructure Guide

**Purpose:** Reference for project-specific testing patterns, helpers, and infrastructure.

> This is a **project-specific guide**. It documents the testing conventions unique to Moldova Direct.

---

## Table of Contents

1. [Test Structure](#test-structure)
2. [Test Setup](#test-setup)
3. [Mock Factories](#mock-factories)
4. [Test Helpers](#test-helpers)
5. [Common Patterns](#common-patterns)

---

## Test Structure

### Directory Layout

```
tests/
├── setup/
│   └── vitest.setup.ts          # Global test setup and mocks
├── fixtures/
│   └── helpers.ts               # E2E test helpers (Playwright)
├── components/
│   └── [feature]/
│       └── __tests__/           # Component unit tests
│           └── [ComponentName].test.ts
├── composables/
│   └── __tests__/               # Composable tests
├── stores/
│   └── [store]/
│       └── __tests__/           # Store tests
├── server/
│   ├── api/
│   │   └── [endpoint]/
│   │       └── __tests__/       # API route tests
│   ├── utils/
│   │   └── __tests__/           # Utility tests
│   └── domain/
│       └── __tests__/           # Domain model tests
├── e2e/
│   └── [feature].spec.ts        # E2E tests (Playwright)
└── types/
    └── __tests__/               # Type tests
```

### File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Component test | `__tests__/[ComponentName].test.ts` | `__tests__/Card.test.ts` |
| Composable test | `__tests__/use[Feature].test.ts` | `__tests__/useCart.test.ts` |
| API test | `__tests__/[action].test.ts` | `__tests__/create.test.ts` |
| E2E test | `[feature].spec.ts` | `checkout.spec.ts` |

---

## Test Setup

### Global Setup File

**File:** `tests/setup/vitest.setup.ts`

This file provides:
- All Nuxt composables mocked (`useI18n`, `useRoute`, `useRouter`, etc.)
- Vue reactivity functions globally available
- shadcn-vue UI component stubs
- Error utility functions (`getErrorMessage`, `getErrorCode`)

### Available Global Mocks

```typescript
// Nuxt auto-imports (all mocked)
global.useI18n()
global.useRoute()
global.useRouter()
global.useCookie()
global.useSupabaseClient()
global.useAsyncData()
global.useFetch()

// Vue reactivity
global.ref
global.reactive
global.computed

// Utilities
global.getErrorMessage(error)
global.getErrorCode(error)

// Custom composables
global.useCart()
global.useAuthValidation()
global.useToast()
```

### shadcn-vue Component Stubs

All UI components are stubbed in tests:

```typescript
config.global.stubs = {
  UiInput: { template: '<input...>', props: ['modelValue', 'type', ...] },
  UiButton: { template: '<button...>', props: ['variant', 'size', ...] },
  UiSelect: { template: '<select...>', props: ['modelValue', ...] },
  // ... all UI components
}
```

---

## Mock Factories

### Mock Data Pattern

For features with complex data (like profile page), create factory functions:

```typescript
// tests/components/profile/__tests__/helpers.ts

export function createMockUser(overrides = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    avatar_url: null,
    ...overrides,
  }
}

export function createMockAddress(overrides = {}): Address {
  return {
    id: 1,
    user_id: 'user-123',
    label: 'Home',
    recipient_name: 'Test User',
    street_address: '123 Test St',
    city: 'Test City',
    postal_code: '12345',
    country: 'MD',
    is_default: true,
    ...overrides,
  }
}
```

### Using Mock Factories

```typescript
import { describe, it, expect } from 'vitest'
import { createMockUser, createMockAddress } from '../helpers'

describe('UserProfile', () => {
  it('displays user information', () => {
    const user = createMockUser({ name: 'Jane Doe' })
    // Test with mock data
    expect(user.name).toBe('Jane Doe')
  })

  it('handles multiple addresses', () => {
    const addresses = [
      createMockAddress({ label: 'Home', is_default: true }),
      createMockAddress({ label: 'Work', is_default: false }),
    ]
    // Test with mock addresses
  })
})
```

---

## Test Helpers

### E2E Test Helpers

**File:** `tests/fixtures/helpers.ts`

```typescript
export class TestHelpers {
  readonly cart: CartTestHelpers

  constructor(private page: Page) {
    this.cart = new CartTestHelpers(page)
  }

  // Navigation
  async waitForPageLoad()
  async goToCart()

  // Authentication
  async login(email: string, password: string)
  async logout()

  // Actions
  async addToCart(productId: string)
  async searchProducts(query: string)
  async selectCategory(category: string)
  async proceedToCheckout()
  async fillCheckoutForm(data: CheckoutFormData)
  async submitOrder()

  // Assertions
  async checkToast(message: string)
  async checkPageTitle(title: string)
  async checkHeading(text: string)

  // Utilities
  async takeScreenshot(name: string)
  async changeLocale(newLocale: string)
}
```

### Using E2E Helpers

```typescript
import { test, expect } from '@playwright/test'
import { TestHelpers } from '../../fixtures/helpers'

test('checkout flow', async ({ page }) => {
  const helpers = new TestHelpers(page)

  await helpers.goto('/products')
  await helpers.addToCart('product-123')
  await helpers.proceedToCheckout()
  await helpers.fillCheckoutForm({
    fullName: 'John Doe',
    email: 'john@example.com',
    // ...
  })
  await helpers.submitOrder()

  await helpers.checkToast('Order placed successfully')
})
```

---

## Common Patterns

### Pattern 1: Component Props Test

```typescript
// tests/components/product/__tests__/Card.test.ts

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const componentPath = resolve(__dirname, '../../../../components/product/Card.vue')

describe('ProductCard Props Reactivity (vue-1)', () => {
  it('should use props.product instead of destructuring', () => {
    const source = readFileSync(componentPath, 'utf-8')
    const usesPropsAccess = /props\.product\./.test(source)
    expect(usesPropsAccess).toBe(true)
  })

  it('should NOT destructure product from props at top level', () => {
    const source = readFileSync(componentPath, 'utf-8')
    const hasDestructuring = /const\s*\{\s*product\s*[,}]/.test(source)
    expect(hasDestructuring).toBe(false)
  })
})
```

### Pattern 2: Composable Test

```typescript
// tests/composables/__tests__/useProductFilters.test.ts

import { describe, expect, it, beforeEach } from 'vitest'
import { useProductFilters } from '~/composables/useProductFilters'

describe('useProductFilters', () => {
  beforeEach(() => {
    // Reset state before each test
    vi.clearAllMocks()
  })

  it('initializes with empty filters', () => {
    const { filters } = useProductFilters()
    expect(filters.value).toEqual({
      category: undefined,
      priceMin: undefined,
      priceMax: undefined,
      attributes: {},
      inStock: undefined,
      featured: undefined,
    })
  })

  it('generates filter chips for active filters', () => {
    const { filters, activeFilterChips } = useProductFilters()

    filters.value.category = 1
    filters.value.inStock = true

    expect(activeFilterChips.value).toHaveLength(2)
    expect(activeFilterChips.value[0].type).toBe('category')
    expect(activeFilterChips.value[1].type).toBe('inStock')
  })

  it('removes filter chip and returns new filter state', () => {
    const { filters, removeFilterChip } = useProductFilters()

    filters.value.category = 1
    filters.value.inStock = true

    const chip = activeFilterChips.value[0]
    const newFilters = removeFilterChip(chip)

    expect(newFilters.category).toBeUndefined()
    expect(newFilters.inStock).toBe(true) // Other filter preserved
  })
})
```

### Pattern 3: API Route Test

```typescript
// tests/server/api/checkout/__tests__/create-order.test.ts

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { createMockBody } from '../helpers'

describe('POST /api/orders/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates order with valid data', async () => {
    const body = createMockBody({
      items: [{ productId: 'prod-1', quantity: 2 }],
    })

    const response = await $fetch('/api/orders/create', {
      method: 'POST',
      body,
    })

    expect(response).toHaveProperty('orderId')
    expect(response.status).toBe('pending')
  })

  it('rejects order with empty cart', async () => {
    const body = createMockBody({ items: [] })

    const response = await $fetch('/api/orders/create', {
      method: 'POST',
      body,
    })

    expect(response).toHaveProperty('error', 'Cart is empty')
  })

  it('handles validation errors', async () => {
    const body = createMockBody({
      items: [{ productId: 'invalid', quantity: -1 }],
    })

    const response = await $fetch('/api/orders/create', {
      method: 'POST',
      body,
    })

    expect(response).toHaveProperty('error')
  })
})
```

### Pattern 4: Store Test

```typescript
// tests/stores/checkout/__tests__/session.test.ts

import { describe, expect, it, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutStore } from '~/stores/checkout'

describe('Checkout Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with step 1', () => {
    const store = useCheckoutStore()
    expect(store.step).toBe(1)
  })

  it('advances to next step when current step is valid', () => {
    const store = useCheckoutStore()
    store.setShippingAddress(mockAddress)
    store.nextStep()
    expect(store.step).toBe(2)
  })

  it('does not advance when current step is invalid', () => {
    const store = useCheckoutStore()
    store.nextStep()
    expect(store.step).toBe(1) // Still on step 1
  })
})
```

### Pattern 5: Type Test

```typescript
// tests/typescript/__tests__/catchErrorAny.test.ts

import { describe, expect, it } from 'vitest'
import { catchError } from '~/utils/errorHandling'

describe('catchError', () => {
  it('should not catch with `any` type', () => {
    const source = readFileSync(file, 'utf-8')
    const hasCatchAny = /catch\s*\(\s*any\s*\)/.test(source)
    expect(hasCatchAny).toBe(false)
  })

  it('should use `unknown` for caught errors', () => {
    const source = readFileSync(file, 'utf-8')
    const hasUnknownCatch = /catch\s*\(\s*unknown\s*\)/.test(source)
    expect(hasUnknownCatch).toBe(true)
  })
})
```

---

## Test Utilities

### flushPromises

From `@vue/test-utils`, ensures all pending promises resolve:

```typescript
import { flushPromises } from 'vitest'

it('updates state after async operation', async () => {
  const wrapper = mount(Component)
  await wrapper.find('button').trigger('click')
  await flushPromises() // Wait for promises
  expect(wrapper.text()).toContain('Success')
})
```

### Mock Verification

```typescript
it('calls API with correct parameters', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: [] })
  global.$fetch = mockFetch

  // Call function
  await fetchData('test-param')

  expect(mockFetch).toHaveBeenCalledWith(
    '/api/data',
    expect.objectContaining({
      method: 'POST',
      body: expect.objectContaining({
        param: 'test-param',
      }),
    })
  )
})
```

---

## Tips and Best Practices

### DO

```
✅ Put test files next to source files in __tests__/ directories
✅ Use mock factories for complex data
✅ Use helper classes for E2E tests
✅ Test business logic without rendering (composables)
✅ Use data-testid selectors for E2E tests
✅ Mock external dependencies (Supabase, API calls)
```

### DON'T

```
❌ Test implementation details (use public APIs)
❌ Copy-paste test code (use helpers/factories)
❌ Use CSS selectors in E2E tests (fragile)
❌ Test multiple things in one test
❌ Leave test data hardcoded (use factories)
❌ Skip tests without documenting why
```

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [testing-strategy.md](testing-strategy.md) | Overall testing approach |
| [visual-regression-setup.md](visual-regression-setup.md) | Visual testing setup |
| [refactoring/patterns.md](../../reference/refactoring/patterns.md) | Testable code patterns |
| [bug-patterns.md](../../reference/bug-patterns.md) | Bug patterns affecting tests |

---

**Last Updated:** 2026-01-25
**Status:** Active - update when new patterns emerge
