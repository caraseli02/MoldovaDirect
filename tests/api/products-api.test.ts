/**
 * Products API Integration Tests
 *
 * These tests make actual HTTP requests to verify API endpoints work correctly.
 * They test the full stack from HTTP request to response.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'

const API_BASE = process.env.TEST_API_URL || 'http://localhost:3000'

describe('Products API', () => {
  // Skip if no server running (for CI that doesn't have server)
  const serverAvailable = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/products`)
      return response.ok || response.status === 401
    } catch {
      return false
    }
  }

  describe('GET /api/products', () => {
    it('should return products list with correct structure', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) {
        console.log('⚠️ Server not available, skipping API test')
        return
      }

      const response = await fetch(`${API_BASE}/api/products`)

      expect(response.ok).toBe(true)

      const data = await response.json()

      // Verify response structure
      expect(data).toHaveProperty('products')
      expect(data).toHaveProperty('pagination')
      expect(Array.isArray(data.products)).toBe(true)

      // Verify pagination structure
      expect(data.pagination).toHaveProperty('page')
      expect(data.pagination).toHaveProperty('limit')
      expect(data.pagination).toHaveProperty('total')
    })

    it('should return products with correct price format', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) return

      const response = await fetch(`${API_BASE}/api/products`)
      const data = await response.json()

      if (data.products.length > 0) {
        const product = data.products[0]

        // Price should be a number
        expect(typeof product.price).toBe('number')
        expect(product.price).toBeGreaterThan(0)
      }
    })

    it('should support pagination parameters', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) return

      const response = await fetch(`${API_BASE}/api/products?page=1&limit=5`)
      const data = await response.json()

      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(5)
      expect(data.products.length).toBeLessThanOrEqual(5)
    })

    it('should support sorting by price', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) return

      const responseAsc = await fetch(`${API_BASE}/api/products?sort=price_asc`)
      const dataAsc = await responseAsc.json()

      if (dataAsc.products.length >= 2) {
        // Prices should be in ascending order
        for (let i = 1; i < dataAsc.products.length; i++) {
          expect(dataAsc.products[i].price).toBeGreaterThanOrEqual(dataAsc.products[i - 1].price)
        }
      }
    })
  })

  describe('GET /api/products/:slug', () => {
    it('should return 404 for non-existent product', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) return

      const response = await fetch(`${API_BASE}/api/products/non-existent-product-xyz-123`)

      expect(response.status).toBe(404)
    })
  })

  describe('Product Stock Status Validation', () => {
    it('should correctly calculate stock status based on quantity', async () => {
      const isAvailable = await serverAvailable()
      if (!isAvailable) return

      const response = await fetch(`${API_BASE}/api/products?limit=50`)
      const data = await response.json()

      // Check each product's stock status is correct
      for (const product of data.products) {
        const quantity = product.stockQuantity

        if (quantity > 5) {
          // In stock: quantity > 5
          expect(product.stockStatus).toBe('in_stock')
        } else if (quantity > 0) {
          // Low stock: 0 < quantity <= 5
          expect(product.stockStatus).toBe('low_stock')
        } else {
          // Out of stock: quantity = 0
          expect(product.stockStatus).toBe('out_of_stock')
        }
      }
    })
  })
})
