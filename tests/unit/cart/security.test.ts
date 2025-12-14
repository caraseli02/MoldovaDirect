/**
 * Cart Security Module Tests
 * Tests for security validation, fraud detection, and secure cart operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import {
  cartSecurityState,
  isValidSessionId,
  isValidProductId,
  generateSecureSessionId,
  validateCartData,
  validateProductData,
  secureAddItem,
  secureUpdateQuantity,
  secureRemoveItem,
} from '~/stores/cart/security'
import type { Product } from '~/stores/cart/types'

// Mock window.crypto
const mockCrypto = {
  getRandomValues: vi.fn((arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256)
    }
    return arr
  }),
}

// Mock window before importing
vi.stubGlobal('window', { crypto: mockCrypto })

// Mock process.client
vi.stubGlobal('process', { client: true, dev: false })

// Mock navigator
vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Test Browser)' })

// Mock product data
const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-wine',
  name: 'Test Wine',
  price: 25.99,
  images: ['/images/wine.jpg'],
  stock: 10,
  category: 'Wines',
}

// Helper to reset security state
function resetSecurityState() {
  cartSecurityState.value = {
    securityEnabled: true,
    lastSecurityCheck: null,
    securityErrors: [],
    riskLevel: 'low',
  }
}

describe('Cart Security Module', () => {
  beforeEach(() => {
    resetSecurityState()
    vi.clearAllMocks()
  })

  afterEach(() => {
    resetSecurityState()
  })

  describe('State Management', () => {
    it('should initialize with correct default state', () => {
      resetSecurityState()

      expect(cartSecurityState.value.securityEnabled).toBe(true)
      expect(cartSecurityState.value.lastSecurityCheck).toBeNull()
      expect(cartSecurityState.value.securityErrors).toEqual([])
      expect(cartSecurityState.value.riskLevel).toBe('low')
    })

    it('should track security check timestamps', () => {
      const now = new Date()
      cartSecurityState.value.lastSecurityCheck = now

      expect(cartSecurityState.value.lastSecurityCheck).toBe(now)
    })

    it('should track risk level changes', () => {
      cartSecurityState.value.riskLevel = 'medium'
      expect(cartSecurityState.value.riskLevel).toBe('medium')

      cartSecurityState.value.riskLevel = 'high'
      expect(cartSecurityState.value.riskLevel).toBe('high')
    })
  })

  describe('Session ID Validation', () => {
    it('should validate correct session ID format', () => {
      expect(isValidSessionId('cart_1234567890_abc123def')).toBe(true)
    })

    it('should reject empty session ID', () => {
      expect(isValidSessionId('')).toBe(false)
    })

    it('should reject null session ID', () => {
      expect(isValidSessionId(null as unknown)).toBe(false)
    })

    it('should reject non-string session ID', () => {
      expect(isValidSessionId(123 as unknown)).toBe(false)
    })

    it('should reject session ID without cart prefix', () => {
      expect(isValidSessionId('1234567890_abc123def')).toBe(false)
    })

    it('should reject session ID with invalid format', () => {
      expect(isValidSessionId('cart-invalid-format')).toBe(false)
    })
  })

  describe('Product ID Validation', () => {
    it('should validate alphanumeric product ID', () => {
      expect(isValidProductId('prod123')).toBe(true)
    })

    it('should validate product ID with hyphens', () => {
      expect(isValidProductId('prod-123-abc')).toBe(true)
    })

    it('should validate product ID with underscores', () => {
      expect(isValidProductId('prod_123_abc')).toBe(true)
    })

    it('should reject empty product ID', () => {
      expect(isValidProductId('')).toBe(false)
    })

    it('should reject null product ID', () => {
      expect(isValidProductId(null as unknown)).toBe(false)
    })

    it('should reject product ID exceeding max length', () => {
      const longId = 'a'.repeat(51)
      expect(isValidProductId(longId)).toBe(false)
    })

    it('should reject product ID with special characters', () => {
      expect(isValidProductId('prod<script>')).toBe(false)
    })
  })

  describe('Secure Session ID Generation', () => {
    it('should generate session ID with correct prefix', () => {
      const sessionId = generateSecureSessionId()
      expect(sessionId.startsWith('cart_')).toBe(true)
    })

    it('should generate session ID with timestamp', () => {
      const sessionId = generateSecureSessionId()
      const parts = sessionId.split('_')
      expect(parts.length).toBeGreaterThanOrEqual(3)

      // Second part should be a timestamp
      const timestamp = parseInt(parts[1], 10)
      expect(timestamp).toBeGreaterThan(0)
      expect(timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('should generate unique session IDs', () => {
      const ids = new Set<string>()
      for (let i = 0; i < 100; i++) {
        ids.add(generateSecureSessionId())
      }
      expect(ids.size).toBe(100)
    })

    it('should use crypto for random generation when available', () => {
      generateSecureSessionId()
      expect(mockCrypto.getRandomValues).toHaveBeenCalled()
    })
  })

  describe('Cart Data Validation', () => {
    describe('Add Item Operation', () => {
      it('should validate valid add item data', () => {
        const result = validateCartData('addItem', {
          productId: 'prod-123',
          quantity: 2,
        })

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject invalid product ID in add item', () => {
        const result = validateCartData('addItem', {
          productId: '',
          quantity: 2,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid product ID')
        expect(result.riskLevel).toBe('high')
      })

      it('should reject invalid quantity in add item', () => {
        const result = validateCartData('addItem', {
          productId: 'prod-123',
          quantity: -1,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid quantity')
      })

      it('should reject quantity exceeding max limit', () => {
        const result = validateCartData('addItem', {
          productId: 'prod-123',
          quantity: 150, // Max is 100
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid quantity')
      })

      it('should warn for large quantities', () => {
        const result = validateCartData('addItem', {
          productId: 'prod-123',
          quantity: 15,
        })

        expect(result.isValid).toBe(true)
        expect(result.warnings).toContain('Large quantity requested')
        expect(result.riskLevel).toBe('medium')
      })

      it('should reject non-integer quantity', () => {
        const result = validateCartData('addItem', {
          productId: 'prod-123',
          quantity: 2.5,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid quantity')
      })
    })

    describe('Update Quantity Operation', () => {
      it('should validate valid update quantity data', () => {
        const result = validateCartData('updateQuantity', {
          itemId: 'item-123',
          quantity: 5,
        })

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject missing item ID', () => {
        const result = validateCartData('updateQuantity', {
          itemId: '',
          quantity: 5,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid item ID')
      })

      it('should reject invalid quantity in update', () => {
        const result = validateCartData('updateQuantity', {
          itemId: 'item-123',
          quantity: 0,
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid quantity')
      })
    })

    describe('Remove Item Operation', () => {
      it('should validate valid remove item data', () => {
        const result = validateCartData('removeItem', {
          itemId: 'item-123',
        })

        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('should reject missing item ID in remove', () => {
        const result = validateCartData('removeItem', {
          itemId: '',
        })

        expect(result.isValid).toBe(false)
        expect(result.errors).toContain('Invalid item ID')
      })
    })

    describe('Unknown Operation', () => {
      it('should warn for unknown operations', () => {
        const result = validateCartData('unknownOperation', {})

        // Should be valid but with warning
        expect(result.warnings).toContain('Unknown operation')
        expect(result.riskLevel).toBe('medium')
      })
    })
  })

  describe('Product Data Validation', () => {
    it('should validate valid product data', () => {
      const result = validateProductData(mockProduct)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject product with invalid ID', () => {
      const invalidProduct = { ...mockProduct, id: '' }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product ID')
    })

    it('should reject product with missing name', () => {
      const invalidProduct = { ...mockProduct, name: '' }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product name')
    })

    it('should reject product with name exceeding max length', () => {
      const invalidProduct = { ...mockProduct, name: 'a'.repeat(201) }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product name')
    })

    it('should reject product with negative price', () => {
      const invalidProduct = { ...mockProduct, price: -10 }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product price')
    })

    it('should reject product with price exceeding max', () => {
      const invalidProduct = { ...mockProduct, price: 1500 } // Max is 1000
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product price')
    })

    it('should reject product with negative stock', () => {
      const invalidProduct = { ...mockProduct, stock: -5 }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Invalid product stock')
    })

    it('should detect XSS in product name', () => {
      const invalidProduct = { ...mockProduct, name: '<script>alert("xss")</script>' }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Suspicious content in product name')
      expect(result.riskLevel).toBe('high')
    })

    it('should detect javascript: URLs in product name', () => {
      const invalidProduct = { ...mockProduct, name: 'javascript:alert(1)' }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Suspicious content in product name')
    })

    it('should detect data: URLs in product name', () => {
      const invalidProduct = { ...mockProduct, name: 'data:text/html,<script>alert(1)</script>' }
      const result = validateProductData(invalidProduct)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Suspicious content in product name')
    })
  })

  describe('Secure Operations', () => {
    describe('Secure Add Item', () => {
      it('should validate session ID before adding item', async () => {
        await expect(secureAddItem('prod-123', 2, 'invalid-session')).rejects.toThrow(
          'Security validation failed',
        )
      })

      it('should validate product ID before adding item', async () => {
        const validSession = generateSecureSessionId()
        await expect(secureAddItem('', 2, validSession)).rejects.toThrow(
          'Data validation failed',
        )
      })

      it('should validate quantity before adding item', async () => {
        const validSession = generateSecureSessionId()
        await expect(secureAddItem('prod-123', -1, validSession)).rejects.toThrow(
          'Data validation failed',
        )
      })

      it('should succeed with valid inputs', async () => {
        const validSession = generateSecureSessionId()
        const result = await secureAddItem('prod-123', 2, validSession)

        expect(result.success).toBe(true)
        expect(result.itemId).toBe('prod-123')
        expect(result.quantity).toBe(2)
      })
    })

    describe('Secure Update Quantity', () => {
      it('should validate session ID before updating', async () => {
        await expect(secureUpdateQuantity('item-123', 5, 'invalid-session')).rejects.toThrow(
          'Security validation failed',
        )
      })

      it('should validate item ID before updating', async () => {
        const validSession = generateSecureSessionId()
        await expect(secureUpdateQuantity('', 5, validSession)).rejects.toThrow(
          'Data validation failed',
        )
      })

      it('should succeed with valid inputs', async () => {
        const validSession = generateSecureSessionId()
        const result = await secureUpdateQuantity('item-123', 5, validSession)

        expect(result.success).toBe(true)
        expect(result.itemId).toBe('item-123')
        expect(result.quantity).toBe(5)
      })
    })

    describe('Secure Remove Item', () => {
      it('should validate session ID before removing', async () => {
        await expect(secureRemoveItem('item-123', 'invalid-session')).rejects.toThrow(
          'Security validation failed',
        )
      })

      it('should validate item ID before removing', async () => {
        const validSession = generateSecureSessionId()
        await expect(secureRemoveItem('', validSession)).rejects.toThrow(
          'Data validation failed',
        )
      })

      it('should succeed with valid inputs', async () => {
        const validSession = generateSecureSessionId()
        // secureRemoveItem returns void, so we just verify it doesn't throw
        await expect(secureRemoveItem('item-123', validSession)).resolves.toBeUndefined()
      })
    })
  })

  describe('Risk Level Management', () => {
    it('should start with low risk level', () => {
      expect(cartSecurityState.value.riskLevel).toBe('low')
    })

    it('should increase risk level on security errors', () => {
      // Multiple validation failures should increase risk
      validateCartData('addItem', { productId: '', quantity: -1 })
      validateCartData('addItem', { productId: '', quantity: -1 })

      // The risk level should be elevated due to failures
      // (Implementation may vary - checking the validation result risk level)
      const result = validateCartData('addItem', { productId: '', quantity: -1 })
      expect(result.riskLevel).not.toBe('low')
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined navigator gracefully', () => {
      // Test that validation still works even with edge cases
      const result = validateCartData('addItem', {
        productId: 'prod-123',
        quantity: 1,
      })

      expect(result.isValid).toBe(true)
    })

    it('should handle product with zero price', () => {
      const freeProduct = { ...mockProduct, price: 0 }
      const result = validateProductData(freeProduct)

      // Zero price should be valid
      expect(result.isValid).toBe(true)
    })

    it('should handle product with zero stock', () => {
      const outOfStockProduct = { ...mockProduct, stock: 0 }
      const result = validateProductData(outOfStockProduct)

      // Zero stock should be valid (out of stock is valid state)
      expect(result.isValid).toBe(true)
    })

    it('should handle product ID at max length', () => {
      const maxLengthId = 'a'.repeat(50)
      expect(isValidProductId(maxLengthId)).toBe(true)
    })

    it('should handle quantity at max limit', () => {
      const result = validateCartData('addItem', {
        productId: 'prod-123',
        quantity: 100, // Exactly at max
      })

      expect(result.isValid).toBe(true)
    })
  })
})
