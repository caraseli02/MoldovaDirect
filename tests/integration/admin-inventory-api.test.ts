/**
 * Admin Inventory API Integration Tests
 * 
 * Requirements tested:
 * - 2.3: Inline inventory editing with input validation
 * - 2.4: Inventory update API with positive number validation
 * - 2.5: Automatic out-of-stock status updates when inventory reaches zero
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { $fetch } from 'ofetch'

describe('Admin Inventory API', () => {
  let testProductId: number

  beforeEach(async () => {
    // Create a test product for inventory testing
    const product = await $fetch('/api/admin/products', {
      method: 'POST',
      body: {
        sku: `test-inventory-${Date.now()}`,
        name_translations: { en: 'Test Inventory Product' },
        description_translations: { en: 'Test product for inventory management' },
        price_eur: 29.99,
        stock_quantity: 10,
        low_stock_threshold: 5,
        reorder_point: 10,
        is_active: true
      }
    })
    testProductId = product.id
  })

  afterEach(async () => {
    // Clean up test product
    if (testProductId) {
      try {
        await $fetch(`/api/admin/products/${testProductId}`, {
          method: 'DELETE'
        })
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  it('should update inventory with valid quantity', async () => {
    const response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: {
        quantity: 25,
        reason: 'test_update',
        notes: 'Test inventory update'
      }
    })

    expect(response.success).toBe(true)
    expect(response.product.stockQuantity).toBe(25)
    expect(response.movement.type).toBe('in')
    expect(response.movement.quantity).toBe(15) // 25 - 10
    expect(response.movement.from).toBe(10)
    expect(response.movement.to).toBe(25)
  })

  it('should reject negative quantities', async () => {
    try {
      await $fetch(`/api/admin/products/${testProductId}/inventory`, {
        method: 'PUT',
        body: {
          quantity: -5
        }
      })
      expect.fail('Should have thrown an error for negative quantity')
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.statusMessage).toContain('Stock quantity cannot be negative')
    }
  })

  it('should automatically deactivate product when stock reaches zero', async () => {
    const response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: {
        quantity: 0,
        reason: 'sold_out'
      }
    })

    expect(response.success).toBe(true)
    expect(response.product.stockQuantity).toBe(0)
    expect(response.product.isActive).toBe(false)
    expect(response.statusChanged).toBe(true)
    expect(response.message).toContain('automatically deactivated')
  })

  it('should log inventory movements', async () => {
    // Update inventory
    await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: {
        quantity: 15,
        reason: 'stock_receipt',
        notes: 'Received new stock'
      }
    })

    // Check that movement was logged (this would require a movements API endpoint)
    // For now, we verify through the response data
    const response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: {
        quantity: 12,
        reason: 'manual_adjustment'
      }
    })

    expect(response.movement.type).toBe('out')
    expect(response.movement.quantity).toBe(3) // 15 - 12
    expect(response.movement.reason).toBe('manual_adjustment')
  })

  it('should handle non-existent product', async () => {
    try {
      await $fetch('/api/admin/products/999999/inventory', {
        method: 'PUT',
        body: {
          quantity: 10
        }
      })
      expect.fail('Should have thrown an error for non-existent product')
    } catch (error: any) {
      expect(error.statusCode).toBe(404)
      expect(error.statusMessage).toBe('Product not found')
    }
  })

  it('should validate input data types', async () => {
    try {
      await $fetch(`/api/admin/products/${testProductId}/inventory`, {
        method: 'PUT',
        body: {
          quantity: 'invalid'
        }
      })
      expect.fail('Should have thrown an error for invalid quantity type')
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('should calculate correct stock status', async () => {
    // Test high stock
    let response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: { quantity: 20 }
    })
    expect(response.product.stockStatus).toBe('high')

    // Test low stock
    response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: { quantity: 3 }
    })
    expect(response.product.stockStatus).toBe('low')

    // Test out of stock
    response = await $fetch(`/api/admin/products/${testProductId}/inventory`, {
      method: 'PUT',
      body: { quantity: 0 }
    })
    expect(response.product.stockStatus).toBe('out')
  })
})