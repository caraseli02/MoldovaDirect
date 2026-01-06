/**
 * Order Repository Interface
 * Defines the contract for order data access
 */
import type { OrderStatus, PaymentStatus, PaymentMethod } from '~/server/domain/entities/Order'
import type { AddressProps } from '~/server/domain/value-objects/Address'
import type { ProductSnapshot } from '~/server/domain/entities/OrderItem'

export interface OrderItemData {
  productId: number
  productSnapshot: ProductSnapshot
  quantity: number
  priceEur: number
  totalEur: number
}

export interface CreateOrderData {
  orderNumber: string
  userId?: string | null
  guestEmail?: string | null
  items: OrderItemData[]
  shippingAddress: AddressProps
  billingAddress: AddressProps
  subtotalEur: number
  shippingCostEur: number
  taxEur: number
  totalEur: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentIntentId?: string
  status: OrderStatus
}

export interface OrderWithItems {
  id: string
  orderNumber: string
  userId?: string | null
  guestEmail?: string | null
  items: OrderItemData[]
  shippingAddress: AddressProps
  billingAddress: AddressProps
  subtotalEur: number
  shippingCostEur: number
  taxEur: number
  totalEur: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentIntentId?: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

export interface IOrderRepository {
  /**
   * Create a new order with items
   */
  create(data: CreateOrderData): Promise<OrderWithItems>

  /**
   * Find order by ID
   */
  findById(id: string): Promise<OrderWithItems | null>

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null>

  /**
   * Find all orders for a user
   */
  findByUserId(userId: string, options?: PaginationOptions): Promise<OrderWithItems[]>

  /**
   * Find orders by guest email
   */
  findByGuestEmail(email: string, options?: PaginationOptions): Promise<OrderWithItems[]>

  /**
   * Update order status
   */
  updateStatus(id: string, status: OrderStatus): Promise<void>

  /**
   * Update payment status
   */
  updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string): Promise<void>

  /**
   * Count orders for a user
   */
  countByUserId(userId: string): Promise<number>
}
