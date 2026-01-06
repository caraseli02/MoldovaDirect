# Composable Testing Guide

Composables are Vue's equivalent of React hooks. This guide covers patterns for testing Vue 3 composables in a Nuxt 4 project.

## ⚠️ Critical: Dynamic Import Pattern

**Always use dynamic imports when testing composables that use Nuxt auto-imports:**

```typescript
// ✅ CORRECT: Mock first, dynamic import after
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useRoute: vi.fn(() => ({ params: {} })),
}))

describe('useProductFilters', () => {
  it('should filter products', async () => {
    // Dynamic import AFTER mocks
    const { useProductFilters } = await import('~/composables/useProductFilters')
    const { filteredProducts } = useProductFilters()
    // ...
  })
})

// ❌ WRONG: Static import - mocks won't work
import { useProductFilters } from '~/composables/useProductFilters'
```

## Basic Composable Testing

### Simple Composable (No Dependencies)

```typescript
// composables/useCounter.ts
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue
  
  return { count, increment, decrement, reset }
}
```

```typescript
// composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'

describe('useCounter', () => {
  it('should initialize with default value', async () => {
    const { useCounter } = await import('./useCounter')
    const { count } = useCounter()
    
    expect(count.value).toBe(0)
  })

  it('should initialize with custom value', async () => {
    const { useCounter } = await import('./useCounter')
    const { count } = useCounter(10)
    
    expect(count.value).toBe(10)
  })

  it('should increment count', async () => {
    const { useCounter } = await import('./useCounter')
    const { count, increment } = useCounter()
    
    increment()
    
    expect(count.value).toBe(1)
  })

  it('should decrement count', async () => {
    const { useCounter } = await import('./useCounter')
    const { count, decrement } = useCounter(5)
    
    decrement()
    
    expect(count.value).toBe(4)
  })

  it('should reset to initial value', async () => {
    const { useCounter } = await import('./useCounter')
    const { count, increment, reset } = useCounter(5)
    
    increment()
    increment()
    reset()
    
    expect(count.value).toBe(5)
  })
})
```

### Composable with Router Dependency

```typescript
// composables/useProductFilters.ts
export function useProductFilters() {
  const route = useRoute()
  const router = useRouter()
  
  const category = computed(() => route.query.category as string || '')
  
  const setCategory = (value: string) => {
    router.push({ query: { ...route.query, category: value } })
  }
  
  return { category, setCategory }
}
```

```typescript
// composables/useProductFilters.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPush = vi.fn()
const mockRoute = {
  query: { category: 'wine' },
  params: {},
}

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useRoute: vi.fn(() => mockRoute),
}))

describe('useProductFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.query = { category: 'wine' }
  })

  it('should read category from route query', async () => {
    const { useProductFilters } = await import('./useProductFilters')
    const { category } = useProductFilters()
    
    expect(category.value).toBe('wine')
  })

  it('should return empty string when no category', async () => {
    mockRoute.query = {}
    
    const { useProductFilters } = await import('./useProductFilters')
    const { category } = useProductFilters()
    
    expect(category.value).toBe('')
  })

  it('should update route when setting category', async () => {
    const { useProductFilters } = await import('./useProductFilters')
    const { setCategory } = useProductFilters()
    
    setCategory('food')
    
    expect(mockPush).toHaveBeenCalledWith({
      query: { category: 'food' },
    })
  })
})
```

### Composable with Pinia Store

```typescript
// composables/useCartActions.ts
export function useCartActions() {
  const cartStore = useCartStore()
  
  const addToCart = (product: Product) => {
    cartStore.addItem(product)
  }
  
  const totalItems = computed(() => cartStore.itemCount)
  
  return { addToCart, totalItems }
}
```

```typescript
// composables/useCartActions.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

describe('useCartActions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should add item to cart', async () => {
    const { useCartActions } = await import('./useCartActions')
    const { useCartStore } = await import('~/stores/cart')
    
    const { addToCart } = useCartActions()
    const cartStore = useCartStore()
    
    addToCart({ id: '1', name: 'Wine', price: 15 })
    
    expect(cartStore.items).toHaveLength(1)
  })

  it('should compute total items', async () => {
    const { useCartActions } = await import('./useCartActions')
    const { useCartStore } = await import('~/stores/cart')
    
    const cartStore = useCartStore()
    cartStore.addItem({ id: '1', name: 'Wine', price: 15 })
    cartStore.addItem({ id: '2', name: 'Cheese', price: 10 })
    
    const { totalItems } = useCartActions()
    
    expect(totalItems.value).toBe(2)
  })
})
```

### Composable with API Calls

```typescript
// composables/useProducts.ts
export function useProducts() {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const fetchProducts = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ products: Product[] }>('/api/products')
      products.value = response.products
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }
  
  return { products, loading, error, fetchProducts }
}
```

```typescript
// composables/useProducts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
  })

  it('should start with empty products', async () => {
    const { useProducts } = await import('./useProducts')
    const { products, loading } = useProducts()
    
    expect(products.value).toEqual([])
    expect(loading.value).toBe(false)
  })

  it('should fetch products successfully', async () => {
    const mockProducts = [
      { id: '1', name: 'Wine' },
      { id: '2', name: 'Cheese' },
    ]
    mockFetch.mockResolvedValue({ products: mockProducts })
    
    const { useProducts } = await import('./useProducts')
    const { products, loading, fetchProducts } = useProducts()
    
    const fetchPromise = fetchProducts()
    expect(loading.value).toBe(true)
    
    await fetchPromise
    
    expect(loading.value).toBe(false)
    expect(products.value).toEqual(mockProducts)
  })

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const { useProducts } = await import('./useProducts')
    const { error, fetchProducts } = useProducts()
    
    await fetchProducts()
    
    expect(error.value?.message).toBe('Network error')
  })
})
```

### Composable with Watch

```typescript
// composables/useSearch.ts
export function useSearch() {
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const debouncedQuery = ref('')
  
  // Debounce search query
  let timeout: NodeJS.Timeout
  watch(query, (newValue) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedQuery.value = newValue
    }, 300)
  })
  
  // Search when debounced query changes
  watch(debouncedQuery, async (newValue) => {
    if (newValue.length >= 2) {
      const response = await $fetch(`/api/search?q=${newValue}`)
      results.value = response.results
    } else {
      results.value = []
    }
  })
  
  return { query, results, debouncedQuery }
}
```

```typescript
// composables/useSearch.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

const mockFetch = vi.fn()

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce query changes', async () => {
    const { useSearch } = await import('./useSearch')
    const { query, debouncedQuery } = useSearch()
    
    query.value = 'test'
    await nextTick()
    
    // Not updated immediately
    expect(debouncedQuery.value).toBe('')
    
    // Advance timer
    vi.advanceTimersByTime(300)
    await nextTick()
    
    expect(debouncedQuery.value).toBe('test')
  })

  it('should search when debounced query is 2+ chars', async () => {
    mockFetch.mockResolvedValue({ results: [{ id: '1' }] })
    
    const { useSearch } = await import('./useSearch')
    const { query, results } = useSearch()
    
    query.value = 'te'
    vi.advanceTimersByTime(300)
    await nextTick()
    
    // Need to wait for the async search
    await vi.waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=te')
    })
  })

  it('should not search when query is less than 2 chars', async () => {
    const { useSearch } = await import('./useSearch')
    const { query } = useSearch()
    
    query.value = 't'
    vi.advanceTimersByTime(300)
    await nextTick()
    
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
```

## Testing Composables with provide/inject

```typescript
// composables/useTheme.ts
const ThemeSymbol = Symbol('theme')

export function provideTheme(initialTheme: 'light' | 'dark' = 'light') {
  const theme = ref(initialTheme)
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }
  
  provide(ThemeSymbol, { theme, toggleTheme })
  
  return { theme, toggleTheme }
}

export function useTheme() {
  const context = inject(ThemeSymbol)
  if (!context) {
    throw new Error('useTheme must be used within provideTheme')
  }
  return context
}
```

```typescript
// composables/useTheme.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

describe('useTheme', () => {
  it('should provide and consume theme', async () => {
    const { provideTheme, useTheme } = await import('./useTheme')
    
    let consumedTheme: any
    
    const Consumer = defineComponent({
      setup() {
        consumedTheme = useTheme()
        return () => h('div', consumedTheme.theme.value)
      },
    })
    
    const Provider = defineComponent({
      setup() {
        provideTheme('dark')
        return () => h(Consumer)
      },
    })
    
    mount(Provider)
    
    expect(consumedTheme.theme.value).toBe('dark')
  })

  it('should toggle theme', async () => {
    const { provideTheme, useTheme } = await import('./useTheme')
    
    let consumedTheme: any
    
    const Consumer = defineComponent({
      setup() {
        consumedTheme = useTheme()
        return () => h('div')
      },
    })
    
    const Provider = defineComponent({
      setup() {
        provideTheme('light')
        return () => h(Consumer)
      },
    })
    
    mount(Provider)
    
    consumedTheme.toggleTheme()
    
    expect(consumedTheme.theme.value).toBe('dark')
  })

  it('should throw when used outside provider', async () => {
    const { useTheme } = await import('./useTheme')
    
    const Consumer = defineComponent({
      setup() {
        useTheme() // This should throw
        return () => h('div')
      },
    })
    
    expect(() => mount(Consumer)).toThrow('useTheme must be used within provideTheme')
  })
})
```

## Testing with effectScope (Official Vue Pattern)

For composables with side effects (watchers, event listeners, timers), use `effectScope` to properly test cleanup:

```typescript
import { effectScope } from 'vue'
import { describe, it, expect, vi, afterEach } from 'vitest'

describe('useEventListener', () => {
  let scope: ReturnType<typeof effectScope>

  afterEach(() => {
    // Stop scope to trigger cleanup
    scope?.stop()
  })

  it('should add event listener on creation', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

    scope = effectScope()

    await scope.run(async () => {
      const { useEventListener } = await import('./useEventListener')
      useEventListener('resize', vi.fn())
    })

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('should remove event listener on scope stop', async () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    scope = effectScope()

    await scope.run(async () => {
      const { useEventListener } = await import('./useEventListener')
      useEventListener('resize', vi.fn())
    })

    // Trigger cleanup
    scope.stop()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
```

### When to Use effectScope

| Scenario | Use effectScope? |
|----------|------------------|
| Composable with `watch`/`watchEffect` | ✅ Yes |
| Composable with event listeners | ✅ Yes |
| Composable with `setInterval`/`setTimeout` | ✅ Yes |
| Composable with `onScopeDispose` cleanup | ✅ Yes |
| Pure computed/ref composable | ❌ Not needed |

### Testing onScopeDispose

```typescript
import { effectScope, onScopeDispose } from 'vue'

// Composable with cleanup
export function useTimer() {
  const count = ref(0)
  const intervalId = setInterval(() => count.value++, 1000)

  // Cleanup when scope is disposed
  onScopeDispose(() => {
    clearInterval(intervalId)
  })

  return { count }
}

// Test
it('should cleanup timer on scope dispose', async () => {
  const clearIntervalSpy = vi.spyOn(global, 'clearInterval')

  const scope = effectScope()

  await scope.run(async () => {
    const { useTimer } = await import('./useTimer')
    useTimer()
  })

  scope.stop()

  expect(clearIntervalSpy).toHaveBeenCalled()
})
```

## Best Practices

### ✅ DO

1. **Use dynamic imports** after mocking dependencies
2. **Test return values** (refs, computed, functions)
3. **Test state transitions** (initial → after action)
4. **Test error handling**
5. **Reset mocks in beforeEach**
6. **Use factory functions** for consistent test data
7. **Use effectScope** for composables with side effects

### ❌ DON'T

1. **Don't use static imports** for composables with auto-imports
2. **Don't test internal implementation** - test the public API
3. **Don't forget cleanup** (timers, subscriptions)
4. **Don't share state between tests** - reset in beforeEach

### Test Coverage Checklist

For each composable, test:

- [ ] Initial state (default values)
- [ ] State mutations (ref updates)
- [ ] Computed properties (derived values)
- [ ] Methods (function behavior)
- [ ] Side effects (watch, API calls)
- [ ] Error handling
- [ ] Edge cases (null, empty, boundary values)
- [ ] Cleanup behavior (if using effectScope)
