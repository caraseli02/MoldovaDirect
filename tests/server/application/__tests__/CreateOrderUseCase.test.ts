/**
 * CreateOrderUseCase Tests
 * TDD tests for order creation use case
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateOrderUseCase } from '~/server/application/use-cases/CreateOrderUseCase'
import type { CreateOrderRequest } from '~/server/application/use-cases/CreateOrderUseCase'
import { InMemoryOrderRepository } from '~/server/infrastructure/repositories/InMemoryOrderRepository'
import { OrderStatus, PaymentStatus } from '~/server/domain/entities/Order'

// Mock product repository for price verification
interface MockProduct {
  id: number
  price_eur: number
  name_translations: Record<string, string>
  is_active: boolean
  stock_quantity: number
}

class MockProductRepository {
  private products: Map<number, MockProduct> = new Map()

  addProduct(product: MockProduct): void {
    this.products.set(product.id, product)
  }

  async findByIds(ids: number[]): Promise<MockProduct[]> {
    return ids
      .map(id => this.products.get(id))
      .filter((p): p is MockProduct => p !== undefined)
  }

  async updateStock(productId: number, quantityChange: number): Promise<void> {
    const product = this.products.get(productId)
    if (product) {
      product.stock_quantity += quantityChange
    }
  }
}

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase
  let orderRepository: InMemoryOrderRepository
  let productRepository: MockProductRepository

  const createValidRequest = (): CreateOrderRequest => ({
    sessionId: 'session-123',
    items: [
      {
        productId: 1,
        productSnapshot: { id: 1, name: 'Wine A', price: 25 },
        quantity: 2,
        price: 25,
        total: 50,
      },
      {
        productId: 2,
        productSnapshot: { id: 2, name: 'Wine B', price: 30 },
        quantity: 1,
        price: 30,
        total: 30,
      },
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
      method: 'standard',
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    },
    paymentMethod: 'cash',
    paymentResult: {
      success: true,
      transactionId: 'txn-123',
      paymentMethod: 'cash',
    },
    subtotal: 80,
    shippingCost: 5.99,
    tax: 0,
    total: 85.99,
    currency: 'EUR',
    userId: 'user-123',
  })

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository()
    productRepository = new MockProductRepository()

    // Add test products
    productRepository.addProduct({
      id: 1,
      price_eur: 25,
      name_translations: { en: 'Wine A', es: 'Vino A' },
      is_active: true,
      stock_quantity: 100,
    })
    productRepository.addProduct({
      id: 2,
      price_eur: 30,
      name_translations: { en: 'Wine B', es: 'Vino B' },
      is_active: true,
      stock_quantity: 50,
    })

    useCase = new CreateOrderUseCase(orderRepository, productRepository)
  })

  describe('successful order creation', () => {
    it('should create order with valid data', async () => {
      const request = createValidRequest()

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      expect(response.order).toBeDefined()
      expect(response.order?.orderNumber).toMatch(/^ORD-/)
    })

    it('should use server-verified prices', async () => {
      const request = createValidRequest()
      // Attempt to tamper with prices
      request.items[0].price = 1 // Try to pay $1 instead of $25

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      // Total should be calculated from server prices with 21% VAT, not client prices
      // 2*25 + 1*30 = 80 subtotal + 16.80 tax (80 * 0.21) + 5.99 shipping = 102.79
      expect(response.order?.total).toBe(102.79)
    })

    it('should set correct status for cash payment', async () => {
      const request = createValidRequest()
      request.paymentMethod = 'cash'

      const response = await useCase.execute(request)

      expect(response.order?.status).toBe(OrderStatus.Pending)
      expect(response.order?.paymentStatus).toBe(PaymentStatus.Pending)
    })

    it('should set processing status for paid orders', async () => {
      const request = createValidRequest()
      request.paymentMethod = 'credit_card'
      request.paymentResult.success = true
      request.paymentResult.pending = false

      const response = await useCase.execute(request)

      expect(response.order?.status).toBe(OrderStatus.Processing)
      expect(response.order?.paymentStatus).toBe(PaymentStatus.Paid)
    })

    it('should support guest checkout', async () => {
      const request = createValidRequest()
      delete (request as any).userId
      request.guestEmail = 'guest@example.com'

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      expect(response.order?.userId).toBeUndefined()
    })

    it('should calculate shipping based on method', async () => {
      const request = createValidRequest()
      request.shippingAddress.method = 'express'

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      // Express shipping is 12.99, tax is 21%
      // 80 subtotal + 16.80 tax (80 * 0.21) + 12.99 shipping = 109.79
      expect(response.order?.total).toBe(109.79)
    })

    it('should apply free shipping for orders over 50', async () => {
      const request = createValidRequest()
      request.shippingAddress.method = 'free'
      // Subtotal is 80 which is > 50

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      // No shipping cost, tax is 21%
      // 80 subtotal + 16.80 tax = 96.80
      expect(response.order?.total).toBe(96.8)
    })
  })

  describe('validation errors', () => {
    it('should reject empty items', async () => {
      const request = createValidRequest()
      request.items = []

      const response = await useCase.execute(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('items')
    })

    it('should reject missing session', async () => {
      const request = createValidRequest()
      request.sessionId = ''

      const response = await useCase.execute(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('session')
    })

    it('should reject failed payment', async () => {
      const request = createValidRequest()
      request.paymentResult.success = false

      const response = await useCase.execute(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('payment')
    })

    it('should reject inactive products', async () => {
      productRepository.addProduct({
        id: 99,
        price_eur: 50,
        name_translations: { en: 'Inactive' },
        is_active: false,
        stock_quantity: 10,
      })

      const request = createValidRequest()
      request.items = [{
        productId: 99,
        productSnapshot: { id: 99, name: 'Inactive', price: 50 },
        quantity: 1,
        price: 50,
        total: 50,
      }]

      const response = await useCase.execute(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('available')
    })

    it('should reject non-existent products', async () => {
      const request = createValidRequest()
      request.items = [{
        productId: 9999,
        productSnapshot: { id: 9999, name: 'Fake', price: 1 },
        quantity: 1,
        price: 1,
        total: 1,
      }]

      const response = await useCase.execute(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('not found')
    })
  })

  describe('price verification', () => {
    it('should detect price tampering and use server prices', async () => {
      const request = createValidRequest()
      // Client sends wrong prices
      request.items[0].price = 1 // Server price is 25
      request.subtotal = 31 // Wrong subtotal
      request.total = 36.99 // Wrong total

      const response = await useCase.execute(request)

      expect(response.success).toBe(true)
      // Should use server-calculated total with 21% VAT:
      // 2*25 + 1*30 = 80 subtotal + 16.80 tax (80 * 0.21) + 5.99 shipping = 102.79
      expect(response.order?.total).toBe(102.79)
    })
  })
})
