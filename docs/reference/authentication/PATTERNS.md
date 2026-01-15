# Code Patterns


This document contains code patterns extracted from the codebase.

## Vue 3 Component Patterns

### Vue 3 Component with Composition API

Standard component pattern using script setup and TypeScript

```typescript
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<{
  update: [value: number]
}>()

const localCount = ref(props.count)

const doubleCount = computed(() => localCount.value * 2)

const increment = () => {
  localCount.value++
  emit('update', localCount.value)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <p>Count: {{ localCount }} (Double: {{ doubleCount }})</p>
    <button @click="increment" data-testid="increment-btn">
      Increment
    </button>
  </div>
</template>
```

**Rationale:** Provides type safety, better IDE support, and cleaner code organization

## API Route Patterns

### Secure API Route Pattern

API route with CSRF validation, authentication, and server-side verification

```typescript
export default defineEventHandler(async (event) => {
  // 1. Validate CSRF token
  await validateCsrfToken(event)
  
  // 2. Authenticate user
  const user = await requireAuth(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }
  
  // 3. Parse and validate input
  const body = await readBody(event)
  const validated = await validateInput(body)
  
  // 4. Verify price server-side (NEVER trust client)
  const product = await getProduct(validated.productId)
  if (product.price !== validated.price) {
    throw createError({
      statusCode: 400,
      message: 'Price mismatch'
    })
  }
  
  // 5. Process request with atomic operations
  const result = await supabase.rpc('process_order', {
    user_id: user.id,
    product_id: product.id,
    quantity: validated.quantity
  })
  
  return result
})
```

**Rationale:** Ensures security at every layer and prevents common vulnerabilities

## Composable Patterns

### Composable Pattern

Reusable business logic with TypeScript and proper error handling

```typescript
export function useProductFilters() {
  const filters = ref<ProductFilters>({
    category: null,
    priceRange: [0, 1000],
    inStock: true
  })

  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const applyFilters = async (products: Product[]) => {
    isLoading.value = true
    error.value = null

    try {
      const filtered = products.filter(product => {
        if (filters.value.category && product.category !== filters.value.category) {
          return false
        }
        if (product.price < filters.value.priceRange[0] || 
            product.price > filters.value.priceRange[1]) {
          return false
        }
        if (filters.value.inStock && !product.inStock) {
          return false
        }
        return true
      })

      return filtered
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }
  }

  const resetFilters = () => {
    filters.value = {
      category: null,
      priceRange: [0, 1000],
      inStock: true
    }
  }

  return {
    filters,
    isLoading,
    error,
    applyFilters,
    resetFilters
  }
}
```

**Rationale:** Encapsulates business logic for reuse across components

## Testing Patterns

### Property-Based Testing Pattern

Test universal properties with fast-check (minimum 100 iterations)

```typescript
import fc from 'fast-check'
import { describe, it, expect } from 'vitest'

describe('Product Filters', () => {
  // Feature: product-filters, Property 1: Filter preserves product structure
  it('should preserve product structure when filtering', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.string(),
          name: fc.string(),
          price: fc.float({ min: 0, max: 1000 }),
          category: fc.constantFrom('wine', 'spirits', 'beer'),
          inStock: fc.boolean()
        })),
        async (products) => {
          const { applyFilters } = useProductFilters()
          const filtered = await applyFilters(products)
          
          // All filtered products should have same structure
          filtered.forEach(product => {
            expect(product).toHaveProperty('id')
            expect(product).toHaveProperty('name')
            expect(product).toHaveProperty('price')
            expect(product).toHaveProperty('category')
            expect(product).toHaveProperty('inStock')
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

**Rationale:** Property tests validate behavior across all possible inputs

### E2E Testing Pattern

Playwright test for critical user flows

```typescript
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('should complete purchase with valid payment', async ({ page }) => {
    // 1. Navigate to product
    await page.goto('/products/wine-123')
    
    // 2. Add to cart
    await page.getByTestId('add-to-cart-btn').click()
    await expect(page.getByTestId('cart-count')).toHaveText('1')
    
    // 3. Go to checkout
    await page.getByTestId('checkout-btn').click()
    
    // 4. Fill shipping info
    await page.getByTestId('shipping-name').fill('John Doe')
    await page.getByTestId('shipping-address').fill('123 Main St')
    
    // 5. Enter payment (test mode)
    await page.getByTestId('card-number').fill('4242424242424242')
    await page.getByTestId('card-expiry').fill('12/25')
    await page.getByTestId('card-cvc').fill('123')
    
    // 6. Submit order
    await page.getByTestId('submit-order-btn').click()
    
    // 7. Verify success
    await expect(page.getByTestId('order-success')).toBeVisible()
  })
})
```

**Rationale:** E2E tests validate complete user flows and catch integration issues
