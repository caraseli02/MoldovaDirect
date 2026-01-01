/**
 * Order Entity Tests
 * TDD tests for Order domain entity and value objects
 */
import { describe, it, expect } from 'vitest'
import { Order, OrderStatus, PaymentStatus } from '~/server/domain/entities/Order'
import { OrderItem } from '~/server/domain/entities/OrderItem'
import { Money } from '~/server/domain/value-objects/Money'
import { Address } from '~/server/domain/value-objects/Address'

describe('Money Value Object', () => {
  it('should create money with amount and currency', () => {
    const money = Money.euros(100)
    expect(money.amount).toBe(100)
    expect(money.currency).toBe('EUR')
  })

  it('should add two money values', () => {
    const a = Money.euros(50)
    const b = Money.euros(30)
    const result = a.add(b)
    expect(result.amount).toBe(80)
  })

  it('should multiply money by factor', () => {
    const money = Money.euros(10)
    const result = money.multiply(3)
    expect(result.amount).toBe(30)
  })

  it('should throw when adding different currencies', () => {
    const eur = Money.euros(50)
    const usd = new Money(50, 'USD')
    expect(() => eur.add(usd)).toThrow('Cannot add different currencies')
  })

  it('should compare money values', () => {
    const a = Money.euros(50)
    const b = Money.euros(50)
    const c = Money.euros(30)
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })

  it('should format money for display', () => {
    const money = Money.euros(99.99)
    expect(money.format()).toMatch(/99[.,]99/)
  })

  it('should create zero money', () => {
    const zero = Money.zero('EUR')
    expect(zero.amount).toBe(0)
    expect(zero.isZero()).toBe(true)
  })
})

describe('Address Value Object', () => {
  it('should create valid address', () => {
    const address = new Address({
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    expect(address.fullName).toBe('John Doe')
    expect(address.isValid()).toBe(true)
  })

  it('should validate required fields', () => {
    const address = new Address({
      firstName: '',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    expect(address.isValid()).toBe(false)
  })

  it('should format address for display', () => {
    const address = new Address({
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })
    const formatted = address.format()
    expect(formatted).toContain('123 Main St')
    expect(formatted).toContain('Madrid')
  })
})

describe('OrderItem Entity', () => {
  it('should create order item with product data', () => {
    const item = new OrderItem({
      productId: 1,
      productSnapshot: { id: 1, name: 'Wine', price: 25 },
      quantity: 2,
      unitPrice: Money.euros(25),
    })
    expect(item.productId).toBe(1)
    expect(item.quantity).toBe(2)
  })

  it('should calculate item subtotal', () => {
    const item = new OrderItem({
      productId: 1,
      productSnapshot: { id: 1, name: 'Wine', price: 25 },
      quantity: 3,
      unitPrice: Money.euros(25),
    })
    expect(item.subtotal().amount).toBe(75)
  })

  it('should validate quantity is positive', () => {
    expect(() => new OrderItem({
      productId: 1,
      productSnapshot: { id: 1, name: 'Wine', price: 25 },
      quantity: 0,
      unitPrice: Money.euros(25),
    })).toThrow('Quantity must be positive')
  })

  it('should validate quantity is integer', () => {
    expect(() => new OrderItem({
      productId: 1,
      productSnapshot: { id: 1, name: 'Wine', price: 25 },
      quantity: 1.5,
      unitPrice: Money.euros(25),
    })).toThrow('Quantity must be an integer')
  })
})

describe('Order Entity', () => {
  const createValidOrder = () => {
    const shippingAddress = new Address({
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })

    const items = [
      new OrderItem({
        productId: 1,
        productSnapshot: { id: 1, name: 'Wine A', price: 25 },
        quantity: 2,
        unitPrice: Money.euros(25),
      }),
      new OrderItem({
        productId: 2,
        productSnapshot: { id: 2, name: 'Wine B', price: 30 },
        quantity: 1,
        unitPrice: Money.euros(30),
      }),
    ]

    return new Order({
      orderNumber: 'ORD-123',
      items,
      shippingAddress,
      billingAddress: shippingAddress,
      shippingCost: Money.euros(5.99),
    })
  }

  it('should create order with items', () => {
    const order = createValidOrder()
    expect(order.orderNumber).toBe('ORD-123')
    expect(order.items.length).toBe(2)
  })

  it('should calculate subtotal from items', () => {
    const order = createValidOrder()
    // 2 * 25 + 1 * 30 = 80
    expect(order.subtotal.amount).toBe(80)
  })

  it('should calculate total with shipping', () => {
    const order = createValidOrder()
    // 80 + 5.99 = 85.99
    expect(order.total.amount).toBe(85.99)
  })

  it('should have pending status by default', () => {
    const order = createValidOrder()
    expect(order.status).toBe(OrderStatus.Pending)
  })

  it('should have pending payment status by default', () => {
    const order = createValidOrder()
    expect(order.paymentStatus).toBe(PaymentStatus.Pending)
  })

  it('should allow cancellation when pending', () => {
    const order = createValidOrder()
    expect(order.canBeCancelled()).toBe(true)
  })

  it('should not allow cancellation when shipped', () => {
    const order = createValidOrder()
    order.confirmPayment('txn-123') // Must confirm payment before shipping
    order.markAsShipped()
    expect(order.canBeCancelled()).toBe(false)
  })

  it('should transition to processing when payment confirmed', () => {
    const order = createValidOrder()
    order.confirmPayment('txn-123')
    expect(order.paymentStatus).toBe(PaymentStatus.Paid)
    expect(order.status).toBe(OrderStatus.Processing)
  })

  it('should throw when trying to ship unpaid order', () => {
    const order = createValidOrder()
    expect(() => order.markAsShipped()).toThrow('Cannot ship unpaid order')
  })

  it('should allow shipping after payment', () => {
    const order = createValidOrder()
    order.confirmPayment('txn-123')
    order.markAsShipped()
    expect(order.status).toBe(OrderStatus.Shipped)
  })

  it('should generate order number in correct format', () => {
    const orderNumber = Order.generateOrderNumber()
    expect(orderNumber).toMatch(/^ORD-\d+-[A-Z0-9]+$/)
  })

  it('should require at least one item', () => {
    const shippingAddress = new Address({
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main St',
      city: 'Madrid',
      postalCode: '28001',
      country: 'ES',
    })

    expect(() => new Order({
      orderNumber: 'ORD-123',
      items: [],
      shippingAddress,
      billingAddress: shippingAddress,
      shippingCost: Money.euros(5.99),
    })).toThrow('Order must have at least one item')
  })
})
