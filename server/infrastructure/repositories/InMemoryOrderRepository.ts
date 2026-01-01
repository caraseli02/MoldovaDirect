/**
 * In-Memory Order Repository
 * Used for testing - stores orders in memory
 */
import type { IOrderRepository, CreateOrderData, OrderWithItems, PaginationOptions } from './IOrderRepository'
import type { OrderStatus, PaymentStatus } from '~/server/domain/entities/Order'

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, OrderWithItems> = new Map()
  private idCounter: number = 1

  private generateId(): string {
    return `order-${this.idCounter++}`
  }

  async create(data: CreateOrderData): Promise<OrderWithItems> {
    const id = this.generateId()
    const now = new Date()

    const order: OrderWithItems = {
      id,
      orderNumber: data.orderNumber,
      userId: data.userId,
      guestEmail: data.guestEmail,
      items: [...data.items],
      shippingAddress: { ...data.shippingAddress },
      billingAddress: { ...data.billingAddress },
      subtotalEur: data.subtotalEur,
      shippingCostEur: data.shippingCostEur,
      taxEur: data.taxEur,
      totalEur: data.totalEur,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      paymentIntentId: data.paymentIntentId,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    }

    this.orders.set(id, order)
    return order
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    return this.orders.get(id) || null
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    for (const order of this.orders.values()) {
      if (order.orderNumber === orderNumber) {
        return order
      }
    }
    return null
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<OrderWithItems[]> {
    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return userOrders.slice(offset, offset + limit)
  }

  async findByGuestEmail(email: string, options?: PaginationOptions): Promise<OrderWithItems[]> {
    const limit = options?.limit || 50
    const offset = options?.offset || 0

    const guestOrders = Array.from(this.orders.values())
      .filter(order => order.guestEmail === email)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return guestOrders.slice(offset, offset + limit)
  }

  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = this.orders.get(id)
    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }
    order.status = status
    order.updatedAt = new Date()
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string): Promise<void> {
    const order = this.orders.get(id)
    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }
    order.paymentStatus = status
    if (transactionId) {
      order.paymentIntentId = transactionId
    }
    order.updatedAt = new Date()
  }

  async countByUserId(userId: string): Promise<number> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .length
  }

  // Test helper methods
  clear(): void {
    this.orders.clear()
    this.idCounter = 1
  }

  getAll(): OrderWithItems[] {
    return Array.from(this.orders.values())
  }
}
