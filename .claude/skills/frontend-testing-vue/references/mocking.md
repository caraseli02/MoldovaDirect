# Mocking Guide for Vue/Nuxt Tests

## ⚠️ Critical: Dynamic Import Pattern

Nuxt auto-imports composables, which means **mocks must be set up BEFORE importing the code under test**. Use dynamic imports:

```typescript
// ✅ CORRECT: Mock first, then dynamic import
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useRoute: vi.fn(() => ({ params: {}, query: {} })),
}))

describe('useProductFilters', () => {
  it('should filter by category', async () => {
    // Dynamic import AFTER mocks are set up
    const { useProductFilters } = await import('~/composables/useProductFilters')
    // ... test code
  })
})

// ❌ WRONG: Static import - mocks won't work
import { useProductFilters } from '~/composables/useProductFilters'
```

## What NOT to Mock

### DO NOT Mock UI Components

**Never mock components from Reka UI or shadcn-vue:**

```typescript
// ❌ WRONG: Don't mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: { template: '<button><slot /></button>' },
}))

// ✅ CORRECT: Import and use real components
import { Button } from '@/components/ui/button'
// They will render normally in tests
```

### What TO Mock

Only mock these categories:

1. **Nuxt composables** (`useRoute`, `useFetch`, `useAsyncData`) - via globals
2. **API calls** (`$fetch`) - via `vi.stubGlobal`
3. **Supabase client** - via module mock
4. **External services** - Payment providers, analytics, etc.

## Mock Placement

| Location | Purpose |
|----------|---------|
| `tests/setup/vitest.setup.ts` | Global mocks for all tests |
| `tests/setup/nuxt-imports-mock.ts` | Nuxt auto-import replacements |
| Test file | Test-specific mocks |

## Essential Mocks

### 1. i18n (Global Mock)

Already configured in `vitest.setup.ts`:

```typescript
global.useI18n = vi.fn(() => ({
  t: vi.fn((key: string, params?: Record<string, unknown>) => {
    if (params) {
      let result = key
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value))
      })
      return result
    }
    return key
  }),
  locale: { value: 'en' },
}))
```

**Usage in tests** - no additional setup needed:

```typescript
it('should display translated text', () => {
  const wrapper = mount(MyComponent)
  // useI18n().t('key') returns 'key' by default
  expect(wrapper.text()).toContain('product.title')
})
```

### 2. Vue Router

```typescript
const mockPush = vi.fn()
const mockReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    back: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    params: { id: '123' },
    query: { filter: 'active' },
    path: '/products',
    name: 'products',
  })),
}))

describe('NavigationComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should navigate on click', async () => {
    const { useNavigation } = await import('~/composables/useNavigation')
    const { navigateToProduct } = useNavigation()
    
    navigateToProduct('123')
    
    expect(mockPush).toHaveBeenCalledWith('/products/123')
  })
})
```

### 3. $fetch / useFetch

```typescript
// Global stub for $fetch
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('API calls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch products', async () => {
    mockFetch.mockResolvedValue({ products: [{ id: 1, name: 'Test' }] })
    
    const { useProducts } = await import('~/composables/useProducts')
    const { products, fetchProducts } = useProducts()
    
    await fetchProducts()
    
    expect(products.value).toHaveLength(1)
  })

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const { useProducts } = await import('~/composables/useProducts')
    const { error, fetchProducts } = useProducts()
    
    await fetchProducts()
    
    expect(error.value).toBeTruthy()
  })
})
```

### 4. Supabase Client

```typescript
const mockSupabaseFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: null, error: null }),
}))

vi.mock('#supabase/server', () => ({
  serverSupabaseServiceRole: vi.fn(() => ({
    from: mockSupabaseFrom,
    rpc: vi.fn(),
    auth: {
      admin: {
        getUserById: vi.fn(),
      },
    },
  })),
}))

// For client-side
global.useSupabaseClient = vi.fn(() => ({
  from: mockSupabaseFrom,
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
}))
```

### 5. Pinia Stores

**Use real stores with test Pinia instance:**

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '~/stores/products'

describe('ProductsStore', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  afterEach(() => {
    store.$reset()
  })

  it('should add product', () => {
    store.addProduct({ id: '1', name: 'Test' })
    
    expect(store.products).toHaveLength(1)
  })

  it('should compute filtered products', () => {
    store.products = [
      { id: '1', category: 'wine' },
      { id: '2', category: 'food' },
    ]
    store.selectedCategory = 'wine'
    
    expect(store.filteredProducts).toHaveLength(1)
  })
})
```

### 6. Cookies (Shared Storage Pattern)

```typescript
// In vitest.setup.ts
export const cookieStorage = new Map<string, unknown>()

global.useCookie = vi.fn((name: string) => ({
  get value() {
    return cookieStorage.get(name)
  },
  set value(val: unknown) {
    if (val === null || val === undefined) {
      cookieStorage.delete(name)
    } else {
      cookieStorage.set(name, val)
    }
  },
}))

// In tests - reset between tests
beforeEach(() => {
  cookieStorage.clear()
})
```

### 7. Navigation & Route Middleware

```typescript
describe('Auth Middleware', () => {
  const mockNavigateTo = vi.fn()
  const mockUser = ref<User | null>(null)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useSupabaseUser', () => mockUser)
    vi.stubGlobal('navigateTo', mockNavigateTo)
  })

  it('should redirect to login when not authenticated', async () => {
    mockUser.value = null
    
    const { default: authMiddleware } = await import('~/middleware/auth')
    
    await authMiddleware(
      { path: '/dashboard' },
      { path: '/' }
    )
    
    expect(mockNavigateTo).toHaveBeenCalledWith('/login')
  })

  it('should allow access when authenticated', async () => {
    mockUser.value = { id: '123', email: 'test@example.com' }
    
    const { default: authMiddleware } = await import('~/middleware/auth')
    
    await authMiddleware(
      { path: '/dashboard' },
      { path: '/' }
    )
    
    expect(mockNavigateTo).not.toHaveBeenCalled()
  })
})
```

## Mock Best Practices

### ✅ DO

1. **Use dynamic imports** after setting up mocks
2. **Reset mocks in `beforeEach`** (not `afterEach`)
3. **Use real Pinia stores** with test instance
4. **Import real UI components** (Reka UI, shadcn-vue)
5. **Mock at the boundary** (API calls, external services)
6. **Clear shared state** (cookies, stores) between tests

### ❌ DON'T

1. **Don't mock UI components** - use real ones
2. **Don't use static imports** with mocked composables
3. **Don't forget to reset** mocks and shared state
4. **Don't mock Pinia stores** - use real with test instance
5. **Don't over-mock** - only mock external boundaries

### Mock Decision Tree

```
Need to test code that uses...?
│
├─ Nuxt composable (useRoute, useFetch)?
│  └─ YES → Mock via globals, use dynamic import
│
├─ Pinia store?
│  └─ YES → Use real store with setActivePinia(createPinia())
│
├─ UI component (Reka UI, shadcn)?
│  └─ YES → Import real component
│
├─ API call ($fetch)?
│  └─ YES → Mock via vi.stubGlobal('$fetch', mockFetch)
│
├─ Supabase?
│  └─ YES → Mock the client module
│
└─ External service?
   └─ YES → Mock at module level
```

## Factory Function Pattern

```typescript
// tests/factories/product.ts
import type { Product } from '~/types'

export const createMockProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'product-1',
  name: 'Test Product',
  price: 9.99,
  category: 'wine',
  inStock: true,
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockProducts = (count: number): Product[] =>
  Array.from({ length: count }, (_, i) =>
    createMockProduct({ id: `product-${i + 1}`, name: `Product ${i + 1}` })
  )

// Usage in tests
it('should display product list', () => {
  const products = createMockProducts(3)
  const wrapper = mount(ProductList, {
    props: { products },
  })
  
  expect(wrapper.findAll('.product-item')).toHaveLength(3)
})
```

## Testing with Refs and Reactivity

```typescript
import { ref, nextTick } from 'vue'

describe('Reactive component', () => {
  it('should update when ref changes', async () => {
    const count = ref(0)
    const wrapper = mount(Counter, {
      props: { modelValue: count.value },
    })
    
    expect(wrapper.text()).toContain('0')
    
    // Update and wait for reactivity
    await wrapper.setProps({ modelValue: 5 })
    
    expect(wrapper.text()).toContain('5')
  })
})
```
