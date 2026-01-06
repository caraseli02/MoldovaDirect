# Pinia Store Testing Guide

This guide covers patterns for testing Pinia stores in a Nuxt 4 project.

## Setup Pattern

**Always use a fresh Pinia instance for each test:**

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '~/stores/products'

describe('ProductsStore', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    // Create fresh Pinia instance
    setActivePinia(createPinia())
    // Initialize store
    store = useProductsStore()
  })

  afterEach(() => {
    // Reset store state
    store.$reset()
  })

  // ... tests
})
```

## Testing State

### Initial State

```typescript
// stores/products.ts
export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const selectedCategory = ref<string | null>(null)
  const isLoading = ref(false)
  
  return { products, selectedCategory, isLoading }
})
```

```typescript
// stores/products.test.ts
describe('ProductsStore - State', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  it('should have empty products initially', () => {
    expect(store.products).toEqual([])
  })

  it('should have null selectedCategory initially', () => {
    expect(store.selectedCategory).toBeNull()
  })

  it('should not be loading initially', () => {
    expect(store.isLoading).toBe(false)
  })
})
```

### Direct State Mutation

```typescript
describe('ProductsStore - State Mutation', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  it('should update products directly', () => {
    const mockProducts = [
      { id: '1', name: 'Wine', price: 15 },
      { id: '2', name: 'Cheese', price: 10 },
    ]
    
    store.products = mockProducts
    
    expect(store.products).toEqual(mockProducts)
    expect(store.products).toHaveLength(2)
  })

  it('should update selectedCategory', () => {
    store.selectedCategory = 'wine'
    
    expect(store.selectedCategory).toBe('wine')
  })
})
```

## Testing Getters

```typescript
// stores/products.ts
export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const selectedCategory = ref<string | null>(null)
  
  // Getters
  const filteredProducts = computed(() => {
    if (!selectedCategory.value) return products.value
    return products.value.filter(p => p.category === selectedCategory.value)
  })
  
  const totalValue = computed(() => {
    return products.value.reduce((sum, p) => sum + p.price, 0)
  })
  
  const productCount = computed(() => products.value.length)
  
  return { 
    products, 
    selectedCategory, 
    filteredProducts, 
    totalValue, 
    productCount 
  }
})
```

```typescript
describe('ProductsStore - Getters', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
    
    // Setup test data
    store.products = [
      { id: '1', name: 'Red Wine', category: 'wine', price: 20 },
      { id: '2', name: 'White Wine', category: 'wine', price: 15 },
      { id: '3', name: 'Cheese', category: 'food', price: 10 },
    ]
  })

  it('should return all products when no category selected', () => {
    store.selectedCategory = null
    
    expect(store.filteredProducts).toHaveLength(3)
  })

  it('should filter products by category', () => {
    store.selectedCategory = 'wine'
    
    expect(store.filteredProducts).toHaveLength(2)
    expect(store.filteredProducts.every(p => p.category === 'wine')).toBe(true)
  })

  it('should calculate total value', () => {
    expect(store.totalValue).toBe(45) // 20 + 15 + 10
  })

  it('should count products', () => {
    expect(store.productCount).toBe(3)
  })

  it('should return empty array when category has no products', () => {
    store.selectedCategory = 'nonexistent'
    
    expect(store.filteredProducts).toEqual([])
  })
})
```

## Testing Actions

```typescript
// stores/products.ts
export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // Actions
  const fetchProducts = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await $fetch<{ products: Product[] }>('/api/products')
      products.value = response.products
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }
  
  const addProduct = (product: Product) => {
    products.value.push(product)
  }
  
  const removeProduct = (id: string) => {
    const index = products.value.findIndex(p => p.id === id)
    if (index !== -1) {
      products.value.splice(index, 1)
    }
  }
  
  const updateProduct = (id: string, updates: Partial<Product>) => {
    const product = products.value.find(p => p.id === id)
    if (product) {
      Object.assign(product, updates)
    }
  }
  
  return { 
    products, 
    isLoading, 
    error, 
    fetchProducts, 
    addProduct, 
    removeProduct, 
    updateProduct 
  }
})
```

```typescript
describe('ProductsStore - Actions', () => {
  let store: ReturnType<typeof useProductsStore>
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  describe('fetchProducts', () => {
    it('should fetch and store products', async () => {
      const mockProducts = [
        { id: '1', name: 'Wine', price: 15 },
      ]
      mockFetch.mockResolvedValue({ products: mockProducts })
      
      await store.fetchProducts()
      
      expect(store.products).toEqual(mockProducts)
      expect(store.isLoading).toBe(false)
    })

    it('should set loading state during fetch', async () => {
      mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
      
      const fetchPromise = store.fetchProducts()
      
      expect(store.isLoading).toBe(true)
    })

    it('should handle fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      await store.fetchProducts()
      
      expect(store.error?.message).toBe('Network error')
      expect(store.isLoading).toBe(false)
    })
  })

  describe('addProduct', () => {
    it('should add product to list', () => {
      const newProduct = { id: '1', name: 'Wine', price: 15 }
      
      store.addProduct(newProduct)
      
      expect(store.products).toContainEqual(newProduct)
      expect(store.products).toHaveLength(1)
    })

    it('should add multiple products', () => {
      store.addProduct({ id: '1', name: 'Wine', price: 15 })
      store.addProduct({ id: '2', name: 'Cheese', price: 10 })
      
      expect(store.products).toHaveLength(2)
    })
  })

  describe('removeProduct', () => {
    beforeEach(() => {
      store.products = [
        { id: '1', name: 'Wine', price: 15 },
        { id: '2', name: 'Cheese', price: 10 },
      ]
    })

    it('should remove product by id', () => {
      store.removeProduct('1')
      
      expect(store.products).toHaveLength(1)
      expect(store.products.find(p => p.id === '1')).toBeUndefined()
    })

    it('should do nothing if product not found', () => {
      store.removeProduct('nonexistent')
      
      expect(store.products).toHaveLength(2)
    })
  })

  describe('updateProduct', () => {
    beforeEach(() => {
      store.products = [
        { id: '1', name: 'Wine', price: 15 },
      ]
    })

    it('should update product properties', () => {
      store.updateProduct('1', { price: 20 })
      
      expect(store.products[0].price).toBe(20)
      expect(store.products[0].name).toBe('Wine') // Unchanged
    })

    it('should do nothing if product not found', () => {
      store.updateProduct('nonexistent', { price: 100 })
      
      expect(store.products[0].price).toBe(15)
    })
  })
})
```

## Testing Store with External Dependencies

```typescript
// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const router = useRouter()
  
  const addItem = (product: Product, quantity = 1) => {
    const existing = items.value.find(item => item.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })
    }
  }
  
  const checkout = async () => {
    await $fetch('/api/checkout', {
      method: 'POST',
      body: { items: items.value },
    })
    items.value = []
    router.push('/order-confirmation')
  }
  
  return { items, addItem, checkout }
})
```

```typescript
// stores/cart.test.ts
const mockPush = vi.fn()
const mockFetch = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

describe('CartStore', () => {
  let store: ReturnType<typeof useCartStore>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
    setActivePinia(createPinia())
  })

  // Need dynamic import because store uses useRouter
  async function getStore() {
    const { useCartStore } = await import('~/stores/cart')
    return useCartStore()
  }

  it('should add item to cart', async () => {
    store = await getStore()
    
    store.addItem({ id: '1', name: 'Wine', price: 15 })
    
    expect(store.items).toHaveLength(1)
  })

  it('should increase quantity for existing item', async () => {
    store = await getStore()
    const product = { id: '1', name: 'Wine', price: 15 }
    
    store.addItem(product)
    store.addItem(product)
    
    expect(store.items).toHaveLength(1)
    expect(store.items[0].quantity).toBe(2)
  })

  it('should checkout and redirect', async () => {
    mockFetch.mockResolvedValue({ success: true })
    store = await getStore()
    store.addItem({ id: '1', name: 'Wine', price: 15 })
    
    await store.checkout()
    
    expect(mockFetch).toHaveBeenCalledWith('/api/checkout', {
      method: 'POST',
      body: { items: expect.any(Array) },
    })
    expect(store.items).toEqual([])
    expect(mockPush).toHaveBeenCalledWith('/order-confirmation')
  })
})
```

## Testing Store Subscriptions

```typescript
describe('ProductsStore - Subscriptions', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  it('should notify on state change', () => {
    const callback = vi.fn()
    
    store.$subscribe(callback)
    store.products = [{ id: '1', name: 'Wine', price: 15 }]
    
    expect(callback).toHaveBeenCalled()
  })

  it('should track action calls', () => {
    const callback = vi.fn()
    
    store.$onAction(callback)
    store.addProduct({ id: '1', name: 'Wine', price: 15 })
    
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'addProduct',
        store,
      })
    )
  })
})
```

## Testing $reset

```typescript
describe('ProductsStore - Reset', () => {
  let store: ReturnType<typeof useProductsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useProductsStore()
  })

  it('should reset to initial state', () => {
    // Modify state
    store.products = [{ id: '1', name: 'Wine', price: 15 }]
    store.selectedCategory = 'wine'
    
    // Reset
    store.$reset()
    
    // Verify initial state
    expect(store.products).toEqual([])
    expect(store.selectedCategory).toBeNull()
  })
})
```

## Testing with @pinia/testing

For more advanced testing scenarios, you can use `@pinia/testing`:

```typescript
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

describe('Component with Store', () => {
  it('should use mocked store', () => {
    const wrapper = mount(ProductList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              products: {
                products: [
                  { id: '1', name: 'Wine', price: 15 },
                ],
              },
            },
            stubActions: false, // Execute real actions
          }),
        ],
      },
    })
    
    expect(wrapper.text()).toContain('Wine')
  })

  it('should spy on actions', async () => {
    const wrapper = mount(ProductList, {
      global: {
        plugins: [createTestingPinia()],
      },
    })
    
    const store = useProductsStore()
    
    await wrapper.find('button.add').trigger('click')
    
    expect(store.addProduct).toHaveBeenCalled()
  })
})
```

## Best Practices

### ✅ DO

1. **Use fresh Pinia instance** per test (`setActivePinia(createPinia())`)
2. **Reset store after each test** (`store.$reset()`)
3. **Test getters with different state combinations**
4. **Test actions' side effects** (API calls, router navigation)
5. **Use dynamic imports** when store has external dependencies

### ❌ DON'T

1. **Don't share store state** between tests
2. **Don't test internal implementation** - test public API
3. **Don't forget to mock external dependencies** ($fetch, router)
4. **Don't test Pinia itself** - focus on your business logic

### Test Coverage Checklist

For each store, test:

- [ ] Initial state values
- [ ] All getters with various inputs
- [ ] All actions (success and error paths)
- [ ] State mutations
- [ ] $reset functionality
- [ ] Interactions with external dependencies
