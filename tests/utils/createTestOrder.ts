/**
 * Test utility for creating mock order objects
 */

import type { TestProduct } from './createTestProduct'
import { createTestProduct } from './createTestProduct'

export interface TestOrderItem {
  id: number | string
  product_id: number | string
  product: TestProduct
  quantity: number
  price: number
  subtotal: number
}

export interface TestShippingAddress {
  first_name: string
  last_name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone: string
}

export interface TestOrder {
  id: number | string
  user_id?: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: TestOrderItem[]
  shipping_address: TestShippingAddress
  billing_address?: TestShippingAddress
  subtotal: number
  tax: number
  shipping_cost: number
  total: number
  currency: string
  payment_method?: string
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export function createTestShippingAddress(overrides: Partial<TestShippingAddress> = {}): TestShippingAddress {
  const defaultAddress: TestShippingAddress = {
    first_name: 'John',
    last_name: 'Doe',
    address_line1: '123 Main St',
    address_line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US',
    phone: '+1 (555) 123-4567',
  }

  return {
    ...defaultAddress,
    ...overrides,
  }
}

export function createTestOrderItem(overrides: Partial<TestOrderItem> = {}): TestOrderItem {
  const product = overrides.product || createTestProduct()
  const quantity = overrides.quantity || 1
  const price = overrides.price || product.price
  const subtotal = price * quantity

  const defaultItem: TestOrderItem = {
    id: Math.floor(Math.random() * 10000),
    product_id: product.id,
    product,
    quantity,
    price,
    subtotal,
  }

  return {
    ...defaultItem,
    ...overrides,
  }
}

export function createTestOrder(overrides: Partial<TestOrder> = {}): TestOrder {
  const items = overrides.items || [
    createTestOrderItem(),
    createTestOrderItem({ quantity: 2 }),
  ]

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
  const tax = subtotal * 0.08 // 8% tax
  const shipping_cost = 9.99
  const total = subtotal + tax + shipping_cost

  const defaultOrder: TestOrder = {
    id: Math.floor(Math.random() * 100000),
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'pending',
    items,
    shipping_address: createTestShippingAddress(),
    billing_address: createTestShippingAddress(),
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping_cost,
    total: Math.round(total * 100) / 100,
    currency: 'USD',
    payment_method: 'card',
    payment_status: 'pending',
    tracking_number: undefined,
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return {
    ...defaultOrder,
    ...overrides,
  }
}

export function createProcessingOrder(overrides: Partial<TestOrder> = {}): TestOrder {
  return createTestOrder({
    ...overrides,
    status: 'processing',
    payment_status: 'paid',
  })
}

export function createShippedOrder(overrides: Partial<TestOrder> = {}): TestOrder {
  return createTestOrder({
    ...overrides,
    status: 'shipped',
    payment_status: 'paid',
    tracking_number: 'TRACK123456789',
  })
}

export function createDeliveredOrder(overrides: Partial<TestOrder> = {}): TestOrder {
  return createTestOrder({
    ...overrides,
    status: 'delivered',
    payment_status: 'paid',
    tracking_number: 'TRACK123456789',
  })
}

export function createTestOrders(count: number, overrides: Partial<TestOrder> = {}): TestOrder[] {
  return Array.from({ length: count }, (_, index) =>
    createTestOrder({
      ...overrides,
      id: overrides.id ? `${overrides.id}-${index}` : index + 1,
    })
  )
}
