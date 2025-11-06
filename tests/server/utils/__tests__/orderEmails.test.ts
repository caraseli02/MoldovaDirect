/**
 * Unit tests for order email utilities
 * Tests email template rendering and data transformation
 */

import { describe, it, expect } from 'vitest'
import { transformOrderToEmailData } from '../orderDataTransform'
import type { DatabaseOrder } from '../emailTemplates/types'

describe('Order Email Utilities', () => {
  describe('transformOrderToEmailData', () => {
    it('should transform database order to email data format', () => {
      const mockOrder: DatabaseOrder = {
        id: 1,
        order_number: 'ORD-2024-001',
        user_id: 'user-123',
        status: 'pending',
        subtotal_eur: 50.00,
        shipping_cost_eur: 5.00,
        tax_eur: 11.55,
        total_eur: 66.55,
        payment_method: 'credit_card',
        shipping_address: {
          firstName: 'John',
          lastName: 'Doe',
          street: '123 Main St',
          city: 'Madrid',
          postalCode: '28001',
          country: 'Spain'
        },
        created_at: '2024-01-15T10:00:00Z',
        order_items: [
          {
            id: 1,
            order_id: 1,
            product_id: 100,
            quantity: 2,
            price_eur: 25.00,
            total_eur: 50.00,
            product_snapshot: {
              name_translations: {
                en: 'Test Product',
                es: 'Producto de Prueba'
              },
              sku: 'TEST-001',
              images: [{ url: 'https://example.com/image.jpg' }]
            }
          }
        ]
      }

      const result = transformOrderToEmailData(
        mockOrder,
        'John Doe',
        'john@example.com',
        'en'
      )

      expect(result).toMatchObject({
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        orderNumber: 'ORD-2024-001',
        locale: 'en',
        subtotal: 50.00,
        shippingCost: 5.00,
        tax: 11.55,
        total: 66.55,
        paymentMethod: 'credit_card'
      })

      expect(result.orderItems).toHaveLength(1)
      expect(result.orderItems[0]).toMatchObject({
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 2,
        price: 25.00,
        total: 50.00
      })

      expect(result.shippingAddress).toMatchObject({
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Main St',
        city: 'Madrid',
        postalCode: '28001',
        country: 'Spain'
      })
    })

    it('should use locale-specific product names', () => {
      const mockOrder: DatabaseOrder = {
        id: 1,
        order_number: 'ORD-2024-002',
        status: 'pending',
        subtotal_eur: 30.00,
        shipping_cost_eur: 5.00,
        tax_eur: 7.35,
        total_eur: 42.35,
        payment_method: 'paypal',
        shipping_address: {
          firstName: 'Maria',
          lastName: 'Garcia',
          street: 'Calle Principal 456',
          city: 'Barcelona',
          postalCode: '08001',
          country: 'España'
        },
        created_at: '2024-01-15T11:00:00Z',
        order_items: [
          {
            id: 2,
            order_id: 1,
            product_id: 101,
            quantity: 1,
            price_eur: 30.00,
            total_eur: 30.00,
            product_snapshot: {
              name_translations: {
                en: 'Wine Bottle',
                es: 'Botella de Vino',
                ro: 'Sticlă de Vin'
              },
              sku: 'WINE-001'
            }
          }
        ]
      }

      const resultES = transformOrderToEmailData(
        mockOrder,
        'Maria Garcia',
        'maria@example.com',
        'es'
      )

      expect(resultES.orderItems[0].name).toBe('Botella de Vino')

      const resultRO = transformOrderToEmailData(
        mockOrder,
        'Maria Garcia',
        'maria@example.com',
        'ro'
      )

      expect(resultRO.orderItems[0].name).toBe('Sticlă de Vin')
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalOrder: DatabaseOrder = {
        id: 1,
        order_number: 'ORD-2024-003',
        status: 'pending',
        subtotal_eur: 20.00,
        shipping_cost_eur: 0,
        tax_eur: 4.20,
        total_eur: 24.20,
        payment_method: 'cash',
        shipping_address: {
          street: 'Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country'
        },
        created_at: '2024-01-15T12:00:00Z',
        order_items: []
      }

      const result = transformOrderToEmailData(
        minimalOrder,
        'Test User',
        'test@example.com',
        'en'
      )

      expect(result.orderItems).toHaveLength(0)
      expect(result.estimatedDelivery).toBeUndefined()
      expect(result.trackingNumber).toBeUndefined()
      expect(result.billingAddress).toBeUndefined()
    })
  })
})
