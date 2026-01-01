/**
 * Order Repository Tests
 * TDD tests for IOrderRepository interface and implementations
 */
import { describe, it, expect, beforeEach } from 'vitest'
import type { IOrderRepository, CreateOrderData } from '~/server/infrastructure/repositories/IOrderRepository'
import { InMemoryOrderRepository } from '~/server/infrastructure/repositories/InMemoryOrderRepository'
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from '~/server/domain/entities/Order'
import { Address } from '~/server/domain/value-objects/Address'

describe('IOrderRepository Interface', () => {
  let repository: IOrderRepository

  const createTestAddress = (): Address => new Address({
    firstName: 'John',
    lastName: 'Doe',
    street: '123 Main St',
    city: 'Madrid',
    postalCode: '28001',
    country: 'ES',
  })

  const createTestOrderData = (): CreateOrderData => ({
    orderNumber: Order.generateOrderNumber(),
    userId: 'user-123',
    items: [
      {
        productId: 1,
        productSnapshot: { id: 1, name: 'Wine A', price: 25 },
        quantity: 2,
        priceEur: 25,
        totalEur: 50,
      },
    ],
    shippingAddress: createTestAddress().toJSON(),
    billingAddress: createTestAddress().toJSON(),
    subtotalEur: 50,
    shippingCostEur: 5.99,
    taxEur: 0,
    totalEur: 55.99,
    paymentMethod: PaymentMethod.Cash,
    paymentStatus: PaymentStatus.Pending,
    status: OrderStatus.Pending,
  })

  beforeEach(() => {
    repository = new InMemoryOrderRepository()
  })

  describe('create', () => {
    it('should create a new order and return it with id', async () => {
      const orderData = createTestOrderData()

      const result = await repository.create(orderData)

      expect(result.id).toBeDefined()
      expect(result.orderNumber).toBe(orderData.orderNumber)
      expect(result.userId).toBe('user-123')
      expect(result.items).toHaveLength(1)
    })

    it('should store the order so it can be retrieved', async () => {
      const orderData = createTestOrderData()

      const created = await repository.create(orderData)
      const found = await repository.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.orderNumber).toBe(orderData.orderNumber)
    })
  })

  describe('findById', () => {
    it('should return null for non-existent order', async () => {
      const result = await repository.findById('non-existent-id')
      expect(result).toBeNull()
    })

    it('should return order with items', async () => {
      const orderData = createTestOrderData()
      const created = await repository.create(orderData)

      const found = await repository.findById(created.id)

      expect(found).not.toBeNull()
      expect(found?.items).toHaveLength(1)
      expect(found?.items[0].productId).toBe(1)
    })
  })

  describe('findByOrderNumber', () => {
    it('should find order by order number', async () => {
      const orderData = createTestOrderData()
      const created = await repository.create(orderData)

      const found = await repository.findByOrderNumber(orderData.orderNumber)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(created.id)
    })

    it('should return null for non-existent order number', async () => {
      const result = await repository.findByOrderNumber('NON-EXISTENT')
      expect(result).toBeNull()
    })
  })

  describe('findByUserId', () => {
    it('should return all orders for a user', async () => {
      const orderData1 = createTestOrderData()
      const orderData2 = { ...createTestOrderData(), orderNumber: Order.generateOrderNumber() }

      await repository.create(orderData1)
      await repository.create(orderData2)

      const orders = await repository.findByUserId('user-123')

      expect(orders).toHaveLength(2)
    })

    it('should return empty array for user with no orders', async () => {
      const orders = await repository.findByUserId('non-existent-user')
      expect(orders).toHaveLength(0)
    })

    it('should support pagination', async () => {
      // Create 5 orders
      for (let i = 0; i < 5; i++) {
        await repository.create({ ...createTestOrderData(), orderNumber: `ORD-${i}` })
      }

      const page1 = await repository.findByUserId('user-123', { limit: 2, offset: 0 })
      const page2 = await repository.findByUserId('user-123', { limit: 2, offset: 2 })

      expect(page1).toHaveLength(2)
      expect(page2).toHaveLength(2)
    })
  })

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const orderData = createTestOrderData()
      const created = await repository.create(orderData)

      await repository.updateStatus(created.id, OrderStatus.Processing)

      const updated = await repository.findById(created.id)
      expect(updated?.status).toBe(OrderStatus.Processing)
    })
  })

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const orderData = createTestOrderData()
      const created = await repository.create(orderData)

      await repository.updatePaymentStatus(created.id, PaymentStatus.Paid, 'txn-123')

      const updated = await repository.findById(created.id)
      expect(updated?.paymentStatus).toBe(PaymentStatus.Paid)
      expect(updated?.paymentIntentId).toBe('txn-123')
    })
  })
})

describe('InMemoryOrderRepository', () => {
  it('should be usable as a mock in tests', () => {
    const repository = new InMemoryOrderRepository()
    expect(repository).toBeDefined()
    expect(typeof repository.create).toBe('function')
    expect(typeof repository.findById).toBe('function')
    expect(typeof repository.findByUserId).toBe('function')
  })

  it('should allow pre-seeding with orders', async () => {
    const repository = new InMemoryOrderRepository()
    const orderData: CreateOrderData = {
      orderNumber: 'ORD-SEED-1',
      userId: 'user-1',
      items: [{
        productId: 1,
        productSnapshot: { id: 1, name: 'Test', price: 10 },
        quantity: 1,
        priceEur: 10,
        totalEur: 10,
      }],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'ES',
      },
      billingAddress: {
        firstName: 'Test',
        lastName: 'User',
        street: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'ES',
      },
      subtotalEur: 10,
      shippingCostEur: 5,
      taxEur: 0,
      totalEur: 15,
      paymentMethod: PaymentMethod.Cash,
      paymentStatus: PaymentStatus.Pending,
      status: OrderStatus.Pending,
    }

    await repository.create(orderData)
    const orders = await repository.findByUserId('user-1')

    expect(orders).toHaveLength(1)
    expect(orders[0].orderNumber).toBe('ORD-SEED-1')
  })
})
