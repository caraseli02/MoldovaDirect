/**
 * Tests for checkout shipping store
 * @module tests/stores/checkout/shipping
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCheckoutShippingStore } from '~/stores/checkout/shipping'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import type { ShippingInformation, ShippingMethod, Address, OrderData } from '~/types/checkout'
import type { CartItem } from '~/stores/cart/types'
import { cookieStorage } from '~/tests/setup/vitest.setup'

// Mock the checkout API
vi.mock('~/lib/checkout/api', () => ({
  fetchShippingMethods: vi.fn(),
}))

// Mock the order calculation utilities
vi.mock('~/lib/checkout/order-calculation', () => ({
  buildOrderData: vi.fn((items, options) => ({
    subtotal: items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0),
    shippingCost: options.shippingCost ?? 0,
    tax: 0,
    total: items.reduce((sum: number, item: CartItem) => sum + item.product.price * item.quantity, 0) + (options.shippingCost ?? 0),
    currency: options.currency ?? 'EUR',
    items: items.map((item: CartItem) => ({
      productId: item.product.id,
      productSnapshot: item.product,
      quantity: item.quantity,
      price: item.product.price,
      total: item.product.price * item.quantity,
    })),
  })),
  applyShippingMethod: vi.fn((orderData, method) => ({
    ...orderData,
    shippingCost: method.price,
    total: orderData.subtotal + method.price + orderData.tax,
  })),
}))

// Mock checkout validation
vi.mock('~/utils/checkout-validation', () => ({
  validateShippingInformation: vi.fn(() => ({ isValid: true, errors: [] })),
}))

// Mock cart store
vi.mock('~/stores/cart', () => ({
  useCartStore: vi.fn(() => ({
    items: [],
    sessionId: null,
  })),
}))

// Mock data factories
function createMockAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1,
    userId: 'user-123',
    type: 'shipping',
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
    isDefault: true,
    ...overrides,
  }
}

function createMockShippingMethod(overrides: Partial<ShippingMethod> = {}): ShippingMethod {
  return {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery in 3-5 days',
    price: 5.99,
    estimatedDays: 4,
    ...overrides,
  }
}

function createMockShippingInfo(overrides: Partial<ShippingInformation> = {}): ShippingInformation {
  return {
    address: createMockAddress(),
    method: createMockShippingMethod(),
    ...overrides,
  }
}

function createMockCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'cart-item-1',
    product: {
      id: 1,
      name: 'Test Wine',
      slug: 'test-wine',
      price: 25.99,
      image: '/images/wine.jpg',
      category: 'red-wine',
    },
    quantity: 2,
    ...overrides,
  } as CartItem
}

function createMockOrderData(overrides: Partial<OrderData> = {}): OrderData {
  return {
    subtotal: 51.98,
    shippingCost: 5.99,
    tax: 10.91,
    total: 68.88,
    currency: 'EUR',
    items: [
      {
        productId: 1,
        productSnapshot: { name: 'Test Wine', price: 25.99 },
        quantity: 2,
        price: 25.99,
        total: 51.98,
      },
    ],
    ...overrides,
  }
}

describe('Checkout Shipping Store', () => {
  let sessionStore: ReturnType<typeof useCheckoutSessionStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    vi.clearAllMocks()

    sessionStore = useCheckoutSessionStore()
  })

  afterEach(() => {
    cookieStorage.clear()
  })

  describe('Initial State', () => {
    it('should expose session store refs', () => {
      const store = useCheckoutShippingStore()

      expect(store.shippingInfo).toBeNull()
      expect(store.availableShippingMethods).toEqual([])
      expect(store.orderData).toBeNull()
      expect(store.loading).toBe(false)
    })
  })

  describe('calculateOrderData', () => {
    it('should calculate order data from cart items', async () => {
      const store = useCheckoutShippingStore()
      const cartItems = [createMockCartItem()]

      await store.calculateOrderData(cartItems)

      expect(sessionStore.orderData).not.toBeNull()
      expect(sessionStore.orderData?.subtotal).toBeGreaterThan(0)
    })

    it('should handle items with value property (reactive ref)', async () => {
      const store = useCheckoutShippingStore()
      const cartItems = { value: [createMockCartItem()] }

      await store.calculateOrderData(cartItems as any)

      expect(sessionStore.orderData).not.toBeNull()
    })

    it('should preserve existing shipping cost', async () => {
      const store = useCheckoutShippingStore()

      // Set existing order data with shipping cost
      sessionStore.setOrderData(createMockOrderData({ shippingCost: 10.99 }))

      const cartItems = [createMockCartItem()]
      await store.calculateOrderData(cartItems)

      // The buildOrderData mock will use the provided shipping cost
      expect(sessionStore.orderData).not.toBeNull()
    })

    it('should apply shipping method to order data when available', async () => {
      const store = useCheckoutShippingStore()
      const shippingInfo = createMockShippingInfo()

      sessionStore.setShippingInfo(shippingInfo)

      const cartItems = [createMockCartItem()]
      await store.calculateOrderData(cartItems)

      // Should have called applyShippingMethod
      const { applyShippingMethod } = await import('~/lib/checkout/order-calculation')
      expect(applyShippingMethod).toHaveBeenCalled()
    })

    it('should update customer email in order data', async () => {
      const store = useCheckoutShippingStore()

      sessionStore.setContactEmail('customer@example.com')

      const cartItems = [createMockCartItem()]
      await store.calculateOrderData(cartItems)

      expect(sessionStore.orderData?.customerEmail).toBe('customer@example.com')
    })

    it('should handle empty cart items', async () => {
      const store = useCheckoutShippingStore()

      await store.calculateOrderData([])

      expect(sessionStore.orderData).not.toBeNull()
      expect(sessionStore.orderData?.subtotal).toBe(0)
    })
  })

  describe('updateShippingCosts', () => {
    it('should update order with new shipping costs', async () => {
      const store = useCheckoutShippingStore()

      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo({ method: createMockShippingMethod({ price: 12.99 }) }))

      await store.updateShippingCosts()

      const { applyShippingMethod } = await import('~/lib/checkout/order-calculation')
      expect(applyShippingMethod).toHaveBeenCalled()
    })

    it('should do nothing if no shipping method selected', async () => {
      const store = useCheckoutShippingStore()

      sessionStore.setOrderData(createMockOrderData())
      // No shipping info set

      await store.updateShippingCosts()

      const { applyShippingMethod } = await import('~/lib/checkout/order-calculation')
      expect(applyShippingMethod).not.toHaveBeenCalled()
    })

    it('should do nothing if no order data exists', async () => {
      const store = useCheckoutShippingStore()

      sessionStore.setShippingInfo(createMockShippingInfo())
      // No order data

      await store.updateShippingCosts()

      const { applyShippingMethod } = await import('~/lib/checkout/order-calculation')
      expect(applyShippingMethod).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      const store = useCheckoutShippingStore()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      sessionStore.setOrderData(createMockOrderData())
      sessionStore.setShippingInfo(createMockShippingInfo())

      const { applyShippingMethod } = await import('~/lib/checkout/order-calculation')
      vi.mocked(applyShippingMethod).mockImplementationOnce(() => {
        throw new Error('Calculation failed')
      })

      await store.updateShippingCosts()

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to update shipping costs'), expect.any(String))

      consoleSpy.mockRestore()
    })
  })

  describe('loadShippingMethods', () => {
    it('should load shipping methods from API', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')

      const mockMethods = [
        createMockShippingMethod({ id: 'standard', price: 5.99 }),
        createMockShippingMethod({ id: 'express', name: 'Express', price: 12.99 }),
      ]
      vi.mocked(fetchShippingMethods).mockResolvedValueOnce(mockMethods)

      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setOrderData(createMockOrderData())

      await store.loadShippingMethods()

      expect(fetchShippingMethods).toHaveBeenCalledWith({
        country: 'ES',
        postalCode: '28001',
        orderTotal: expect.any(Number),
      })
      expect(sessionStore.availableShippingMethods).toEqual(mockMethods)
    })

    it('should clear methods if no shipping address', async () => {
      const store = useCheckoutShippingStore()

      // No shipping info
      sessionStore.setOrderData(createMockOrderData())

      await store.loadShippingMethods()

      expect(sessionStore.availableShippingMethods).toEqual([])
    })

    it('should clear methods if no order data', async () => {
      const store = useCheckoutShippingStore()

      sessionStore.setShippingInfo(createMockShippingInfo())
      // No order data

      await store.loadShippingMethods()

      expect(sessionStore.availableShippingMethods).toEqual([])
    })

    it('should fallback to default shipping on API error', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(fetchShippingMethods).mockRejectedValueOnce(new Error('API Error'))

      sessionStore.setShippingInfo(createMockShippingInfo())
      sessionStore.setOrderData(createMockOrderData())

      await store.loadShippingMethods()

      expect(sessionStore.availableShippingMethods).toHaveLength(1)
      expect(sessionStore.availableShippingMethods[0].id).toBe('standard')
      expect(sessionStore.availableShippingMethods[0].price).toBe(5.99)

      consoleSpy.mockRestore()
    })
  })

  describe('updateShippingInfo', () => {
    it('should update shipping info and recalculate', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')

      vi.mocked(fetchShippingMethods).mockResolvedValueOnce([createMockShippingMethod()])

      const shippingInfo = createMockShippingInfo()
      const cartItems = [createMockCartItem()]

      await store.updateShippingInfo(shippingInfo, cartItems)

      expect(sessionStore.shippingInfo).toEqual(shippingInfo)
      expect(sessionStore.loading).toBe(false)
    })

    it('should set loading state during update', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')

      let loadingDuringFetch = false
      vi.mocked(fetchShippingMethods).mockImplementationOnce(async () => {
        loadingDuringFetch = sessionStore.loading
        return [createMockShippingMethod()]
      })

      const shippingInfo = createMockShippingInfo()
      await store.updateShippingInfo(shippingInfo)

      expect(loadingDuringFetch).toBe(true)
      expect(sessionStore.loading).toBe(false)
    })

    it('should clear field errors before validation', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')

      vi.mocked(fetchShippingMethods).mockResolvedValueOnce([createMockShippingMethod()])

      // Set existing errors
      sessionStore.setValidationErrors('shipping', ['Previous error'])

      const shippingInfo = createMockShippingInfo()
      await store.updateShippingInfo(shippingInfo)

      // Errors should be cleared (validation passes)
      expect(sessionStore.validationErrors.shipping).toBeUndefined()
    })

    it('should handle validation errors', async () => {
      const store = useCheckoutShippingStore()
      const { validateShippingInformation } = await import('~/utils/checkout-validation')

      vi.mocked(validateShippingInformation).mockReturnValueOnce({
        isValid: false,
        errors: [{ field: 'address', message: 'Address is required' }],
      } as any)

      const shippingInfo = createMockShippingInfo()

      await expect(store.updateShippingInfo(shippingInfo)).rejects.toThrow()

      expect(sessionStore.validationErrors.shipping).toBeDefined()
    })

    it('should persist session after update', async () => {
      const store = useCheckoutShippingStore()
      const { fetchShippingMethods } = await import('~/lib/checkout/api')

      vi.mocked(fetchShippingMethods).mockResolvedValueOnce([createMockShippingMethod()])

      const persistSpy = vi.spyOn(sessionStore, 'persist')

      const shippingInfo = createMockShippingInfo()
      await store.updateShippingInfo(shippingInfo)

      expect(persistSpy).toHaveBeenCalled()
    })

    it('should handle error and set loading to false', async () => {
      const store = useCheckoutShippingStore()
      const { validateShippingInformation } = await import('~/utils/checkout-validation')

      vi.mocked(validateShippingInformation).mockReturnValueOnce({
        isValid: false,
        errors: [{ message: 'Invalid' }],
      } as any)

      const shippingInfo = createMockShippingInfo()

      try {
        await store.updateShippingInfo(shippingInfo)
      }
      catch {
        // Expected
      }

      expect(sessionStore.loading).toBe(false)
    })
  })

  describe('Cart Item Resolution', () => {
    it('should prioritize provided cart items over store items', async () => {
      const store = useCheckoutShippingStore()

      const providedItems = [createMockCartItem({ quantity: 5 })]
      await store.calculateOrderData(providedItems)

      expect(sessionStore.orderData).not.toBeNull()
    })

    it('should handle undefined cart items', async () => {
      const store = useCheckoutShippingStore()

      // Should not throw
      await store.calculateOrderData(undefined as any)

      expect(sessionStore.orderData).not.toBeNull()
    })

    it('should unwrap reactive cart items', async () => {
      const store = useCheckoutShippingStore()

      const reactiveItems = { value: [createMockCartItem()] }
      await store.calculateOrderData(reactiveItems as any)

      expect(sessionStore.orderData).not.toBeNull()
    })
  })
})

describe('Shipping Store Edge Cases', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    cookieStorage.clear()
    vi.clearAllMocks()
  })

  it('should handle concurrent updates gracefully', async () => {
    const store = useCheckoutShippingStore()
    const sessionStore = useCheckoutSessionStore()
    const { fetchShippingMethods } = await import('~/lib/checkout/api')

    vi.mocked(fetchShippingMethods).mockResolvedValue([createMockShippingMethod()])

    const shippingInfo = createMockShippingInfo()

    // Start multiple concurrent updates
    const updates = [
      store.updateShippingInfo(shippingInfo),
      store.updateShippingInfo(shippingInfo),
      store.updateShippingInfo(shippingInfo),
    ]

    await Promise.all(updates)

    expect(sessionStore.loading).toBe(false)
  })

  it('should handle malformed address data', async () => {
    const store = useCheckoutShippingStore()
    const { validateShippingInformation } = await import('~/utils/checkout-validation')

    vi.mocked(validateShippingInformation).mockReturnValueOnce({
      isValid: false,
      errors: [{ message: 'Invalid address format' }],
    } as any)

    const malformedInfo = {
      address: { ...createMockAddress(), postalCode: '' },
      method: createMockShippingMethod(),
    }

    await expect(store.updateShippingInfo(malformedInfo)).rejects.toThrow()
  })

  it('should handle network timeout on shipping methods fetch', async () => {
    const store = useCheckoutShippingStore()
    const sessionStore = useCheckoutSessionStore()
    const { fetchShippingMethods } = await import('~/lib/checkout/api')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    vi.mocked(fetchShippingMethods).mockRejectedValueOnce(new Error('Network timeout'))

    sessionStore.setShippingInfo(createMockShippingInfo())
    sessionStore.setOrderData(createMockOrderData())

    await store.loadShippingMethods()

    // Should fallback to default method
    expect(sessionStore.availableShippingMethods).toHaveLength(1)

    consoleSpy.mockRestore()
  })
})
