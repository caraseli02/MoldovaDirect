/**
 * Order Utils Tests
 *
 * Tests for server/utils/orderUtils.ts - Order calculation and validation utilities
 */

import { describe, it, expect } from 'vitest'
import {
  calculateOrderTotals,
  validateCartItems,
  generateOrderNumber,
  getAvailableShippingMethods,
  validateShippingAddress,
  formatOrderAddress,
  sanitizeOrderData,
  type CartItem,
  type ShippingMethod
} from '~/server/utils/orderUtils'

// Test fixtures
const createMockProduct = (overrides = {}) => ({
  id: 1,
  sku: 'WINE-001',
  name_translations: { es: 'Vino Tinto', en: 'Red Wine' },
  description_translations: { es: 'Descripcion', en: 'Description' },
  price_eur: 25.99,
  images: ['/images/wine.jpg'],
  weight_kg: 1.5,
  stock_quantity: 10,
  is_active: true,
  ...overrides
})

const createMockCartItem = (overrides = {}): CartItem => ({
  id: 1,
  product_id: 1,
  quantity: 1,
  products: createMockProduct(),
  ...overrides
})

describe('calculateOrderTotals', () => {
  it('should calculate subtotal for single item', () => {
    const items = [createMockCartItem()]
    const result = calculateOrderTotals(items)

    expect(result.subtotal).toBe(25.99)
    expect(result.total).toBe(25.99)
    expect(result.items).toHaveLength(1)
  })

  it('should calculate subtotal for multiple items', () => {
    const items = [
      createMockCartItem({ quantity: 2 }),
      createMockCartItem({
        id: 2,
        product_id: 2,
        quantity: 1,
        products: createMockProduct({ id: 2, price_eur: 35.00 })
      })
    ]
    const result = calculateOrderTotals(items)

    expect(result.subtotal).toBe(25.99 * 2 + 35.00)
    expect(result.subtotal).toBeCloseTo(86.98, 2)
  })

  it('should include shipping cost when provided', () => {
    const items = [createMockCartItem()]
    const shippingMethod: ShippingMethod = {
      id: 'standard',
      name: 'Standard Shipping',
      price: 5.99,
      estimatedDays: 5
    }
    const result = calculateOrderTotals(items, shippingMethod)

    expect(result.subtotal).toBe(25.99)
    expect(result.shippingCost).toBe(5.99)
    expect(result.total).toBe(31.98)
  })

  it('should handle zero shipping cost', () => {
    const items = [createMockCartItem()]
    const shippingMethod: ShippingMethod = {
      id: 'free',
      name: 'Free Shipping',
      price: 0,
      estimatedDays: 7
    }
    const result = calculateOrderTotals(items, shippingMethod)

    expect(result.shippingCost).toBe(0)
    expect(result.total).toBe(25.99)
  })

  it('should handle empty cart', () => {
    const result = calculateOrderTotals([])

    expect(result.subtotal).toBe(0)
    expect(result.total).toBe(0)
    expect(result.items).toHaveLength(0)
  })

  it('should return tax as 0 (placeholder implementation)', () => {
    const items = [createMockCartItem()]
    const result = calculateOrderTotals(items)

    expect(result.tax).toBe(0)
  })

  it('should handle large quantities', () => {
    const items = [createMockCartItem({ quantity: 100 })]
    const result = calculateOrderTotals(items)

    expect(result.subtotal).toBe(2599)
  })
})

describe('validateCartItems', () => {
  it('should validate a valid cart', () => {
    const items = [createMockCartItem()]
    const result = validateCartItems(items)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect inactive products', () => {
    const items = [
      createMockCartItem({
        products: createMockProduct({ is_active: false })
      })
    ]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toBe('product_inactive')
    expect(result.errors[0].message).toBe('Product is no longer available')
  })

  it('should detect insufficient stock', () => {
    const items = [
      createMockCartItem({
        quantity: 15,
        products: createMockProduct({ stock_quantity: 10 })
      })
    ]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].error).toBe('insufficient_stock')
    expect(result.errors[0].availableQuantity).toBe(10)
    expect(result.errors[0].requestedQuantity).toBe(15)
  })

  it('should detect zero quantity', () => {
    const items = [createMockCartItem({ quantity: 0 })]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors[0].error).toBe('invalid_quantity')
  })

  it('should detect negative quantity', () => {
    const items = [createMockCartItem({ quantity: -1 })]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors[0].error).toBe('invalid_quantity')
  })

  it('should collect multiple errors from single item', () => {
    const items = [
      createMockCartItem({
        quantity: 0,
        products: createMockProduct({ is_active: false })
      })
    ]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('should collect errors from multiple items', () => {
    const items = [
      createMockCartItem({
        products: createMockProduct({ id: 1, is_active: false })
      }),
      createMockCartItem({
        id: 2,
        product_id: 2,
        quantity: 20,
        products: createMockProduct({ id: 2, stock_quantity: 5 })
      })
    ]
    const result = validateCartItems(items)

    expect(result.valid).toBe(false)
    expect(result.errors).toHaveLength(2)
  })

  it('should handle empty cart as valid', () => {
    const result = validateCartItems([])

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

describe('generateOrderNumber', () => {
  it('should generate order number with MD prefix', () => {
    const orderNumber = generateOrderNumber()

    expect(orderNumber).toMatch(/^MD-/)
  })

  it('should include date in format YYYYMMDD', () => {
    const orderNumber = generateOrderNumber()
    const datePattern = /^MD-\d{8}-/

    expect(orderNumber).toMatch(datePattern)
  })

  it('should generate unique order numbers', () => {
    const orderNumbers = new Set()
    for (let i = 0; i < 100; i++) {
      orderNumbers.add(generateOrderNumber())
    }

    // Most should be unique (allowing for some collisions due to same millisecond)
    expect(orderNumbers.size).toBeGreaterThan(90)
  })

  it('should match expected format', () => {
    const orderNumber = generateOrderNumber()
    // Format: MD-YYYYMMDD-XXXX
    expect(orderNumber).toMatch(/^MD-\d{8}-\d{4}$/)
  })
})

describe('getAvailableShippingMethods', () => {
  it('should return standard and express shipping by default', () => {
    const items = [createMockCartItem()]
    const methods = getAvailableShippingMethods(items)

    expect(methods.length).toBeGreaterThanOrEqual(2)
    expect(methods.some(m => m.id === 'standard')).toBe(true)
    expect(methods.some(m => m.id === 'express')).toBe(true)
  })

  it('should include free shipping for orders over 50 EUR', () => {
    const items = [
      createMockCartItem({
        quantity: 2,
        products: createMockProduct({ price_eur: 30 })
      })
    ]
    const methods = getAvailableShippingMethods(items)

    expect(methods.some(m => m.id === 'free')).toBe(true)
    const freeMethod = methods.find(m => m.id === 'free')
    expect(freeMethod?.price).toBe(0)
  })

  it('should not include free shipping for orders under 50 EUR', () => {
    const items = [
      createMockCartItem({
        products: createMockProduct({ price_eur: 20 })
      })
    ]
    const methods = getAvailableShippingMethods(items)

    expect(methods.some(m => m.id === 'free')).toBe(false)
  })

  it('should increase shipping cost for heavy orders (over 5kg)', () => {
    const lightItems = [
      createMockCartItem({
        products: createMockProduct({ weight_kg: 1 })
      })
    ]
    const heavyItems = [
      createMockCartItem({
        quantity: 10,
        products: createMockProduct({ weight_kg: 1.5 })
      })
    ]

    const lightMethods = getAvailableShippingMethods(lightItems)
    const heavyMethods = getAvailableShippingMethods(heavyItems)

    const lightStandard = lightMethods.find(m => m.id === 'standard')
    const heavyStandard = heavyMethods.find(m => m.id === 'standard')

    expect(heavyStandard!.price).toBeGreaterThan(lightStandard!.price)
  })

  it('should return methods with estimated delivery days', () => {
    const items = [createMockCartItem()]
    const methods = getAvailableShippingMethods(items)

    methods.forEach(method => {
      expect(method.estimatedDays).toBeGreaterThan(0)
    })
  })
})

describe('validateShippingAddress', () => {
  const validAddress = {
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES'
  }

  it('should validate a complete address', () => {
    const result = validateShippingAddress(validAddress)

    expect(result.valid).toBe(true)
    expect(Object.keys(result.errors)).toHaveLength(0)
  })

  it('should require firstName', () => {
    const result = validateShippingAddress({ ...validAddress, firstName: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.firstName).toBe('First name is required')
  })

  it('should require lastName', () => {
    const result = validateShippingAddress({ ...validAddress, lastName: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.lastName).toBe('Last name is required')
  })

  it('should require street', () => {
    const result = validateShippingAddress({ ...validAddress, street: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.street).toBe('Street address is required')
  })

  it('should require city', () => {
    const result = validateShippingAddress({ ...validAddress, city: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.city).toBe('City is required')
  })

  it('should require postalCode', () => {
    const result = validateShippingAddress({ ...validAddress, postalCode: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.postalCode).toBe('Postal code is required')
  })

  it('should require country', () => {
    const result = validateShippingAddress({ ...validAddress, country: '' })

    expect(result.valid).toBe(false)
    expect(result.errors.country).toBe('Country is required')
  })

  it('should validate Spanish postal code format', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'ES',
      postalCode: '123' // Invalid - should be 5 digits
    })

    expect(result.valid).toBe(false)
    expect(result.errors.postalCode).toContain('Invalid postal code')
  })

  it('should accept valid Spanish postal code', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'ES',
      postalCode: '28001'
    })

    expect(result.valid).toBe(true)
  })

  it('should validate US postal code format', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'US',
      postalCode: '12345'
    })

    expect(result.valid).toBe(true)
  })

  it('should accept US zip+4 format', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'US',
      postalCode: '12345-6789'
    })

    expect(result.valid).toBe(true)
  })

  it('should validate Romanian postal code (6 digits)', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'RO',
      postalCode: '123456'
    })

    expect(result.valid).toBe(true)
  })

  it('should allow unknown country postal codes', () => {
    const result = validateShippingAddress({
      ...validAddress,
      country: 'XX',
      postalCode: 'ANY-FORMAT'
    })

    expect(result.valid).toBe(true)
  })

  it('should trim whitespace from fields', () => {
    const result = validateShippingAddress({
      ...validAddress,
      firstName: '  John  '
    })

    // Should still be valid (trimmed internally)
    expect(result.valid).toBe(true)
  })

  it('should handle null/undefined fields', () => {
    const result = validateShippingAddress({
      firstName: null,
      lastName: undefined
    } as any)

    expect(result.valid).toBe(false)
    expect(result.errors.firstName).toBeDefined()
    expect(result.errors.lastName).toBeDefined()
  })
})

describe('formatOrderAddress', () => {
  it('should format complete address', () => {
    const address = {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      province: 'Madrid',
      postalCode: '28001',
      country: 'Spain'
    }

    const formatted = formatOrderAddress(address)

    expect(formatted).toContain('John Doe')
    expect(formatted).toContain('123 Main St')
    expect(formatted).toContain('Madrid')
    expect(formatted).toContain('28001')
    expect(formatted).toContain('Spain')
  })

  it('should include company when provided', () => {
    const address = {
      firstName: 'John',
      lastName: 'Doe',
      company: 'Acme Corp',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'Spain'
    }

    const formatted = formatOrderAddress(address)

    expect(formatted).toContain('Acme Corp')
  })

  it('should handle missing optional fields', () => {
    const address = {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'Spain'
    }

    const formatted = formatOrderAddress(address)

    expect(formatted).toBeDefined()
    expect(formatted).not.toContain('undefined')
    expect(formatted).not.toContain('null')
  })

  it('should handle empty address gracefully', () => {
    const formatted = formatOrderAddress({})

    expect(formatted).toBe('')
  })

  it('should combine city and province', () => {
    const address = {
      city: 'Barcelona',
      province: 'Catalonia'
    }

    const formatted = formatOrderAddress(address)

    expect(formatted).toContain('Barcelona, Catalonia')
  })
})

describe('sanitizeOrderData', () => {
  it('should remove script tags from customerNotes', () => {
    const data = {
      customerNotes: 'Hello <script>alert("xss")</script> World'
    }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.customerNotes).not.toContain('<script>')
    expect(sanitized.customerNotes).toBe('Hello  World')
  })

  it('should remove script tags from adminNotes', () => {
    const data = {
      adminNotes: '<script>document.cookie</script>Important note'
    }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.adminNotes).not.toContain('<script>')
    expect(sanitized.adminNotes).toBe('Important note')
  })

  it('should handle nested script tags', () => {
    const data = {
      customerNotes: '<script><script>nested</script></script>Safe'
    }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.customerNotes).not.toContain('<script>')
  })

  it('should preserve other data', () => {
    const data = {
      orderId: 123,
      customerEmail: 'test@example.com',
      items: [{ id: 1 }]
    }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.orderId).toBe(123)
    expect(sanitized.customerEmail).toBe('test@example.com')
    expect(sanitized.items).toEqual([{ id: 1 }])
  })

  it('should handle missing notes fields', () => {
    const data = { orderId: 123 }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.orderId).toBe(123)
    expect(sanitized.customerNotes).toBeUndefined()
  })

  it('should handle script tags with attributes', () => {
    const data = {
      customerNotes: '<script type="text/javascript" src="evil.js"></script>Clean'
    }

    const sanitized = sanitizeOrderData(data)

    expect(sanitized.customerNotes).not.toContain('<script')
    expect(sanitized.customerNotes).toBe('Clean')
  })
})
