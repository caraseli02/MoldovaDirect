/**
 * Order Entity
 * Aggregate root for order domain
 */
import { Money } from '../value-objects/Money'
import type { Address } from '../value-objects/Address'
import type { OrderItem } from './OrderItem'

export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum PaymentMethod {
  Cash = 'cod',
  Stripe = 'stripe',
  PayPal = 'paypal',
}

export interface OrderProps {
  id?: string
  orderNumber: string
  userId?: string | null
  guestEmail?: string | null
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  shippingCost: Money
  tax?: Money
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentIntentId?: string
  createdAt?: Date
  updatedAt?: Date
}

export class Order {
  readonly id?: string
  readonly orderNumber: string
  readonly userId?: string | null
  readonly guestEmail?: string | null
  readonly items: readonly OrderItem[]
  readonly shippingAddress: Address
  readonly billingAddress: Address
  readonly shippingCost: Money
  readonly tax: Money
  private _status: OrderStatus
  private _paymentStatus: PaymentStatus
  private _paymentMethod?: PaymentMethod
  private _paymentIntentId?: string
  readonly createdAt: Date
  private _updatedAt: Date

  constructor(props: OrderProps) {
    this.validateItems(props.items)

    this.id = props.id
    this.orderNumber = props.orderNumber
    this.userId = props.userId
    this.guestEmail = props.guestEmail
    this.items = Object.freeze([...props.items])
    this.shippingAddress = props.shippingAddress
    this.billingAddress = props.billingAddress
    this.shippingCost = props.shippingCost
    this.tax = props.tax || Money.zero('EUR')
    this._status = props.status || OrderStatus.Pending
    this._paymentStatus = props.paymentStatus || PaymentStatus.Pending
    this._paymentMethod = props.paymentMethod
    this._paymentIntentId = props.paymentIntentId
    this.createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
  }

  private validateItems(items: OrderItem[]): void {
    if (!items || items.length === 0) {
      throw new Error('Order must have at least one item')
    }
  }

  // Getters
  get status(): OrderStatus {
    return this._status
  }

  get paymentStatus(): PaymentStatus {
    return this._paymentStatus
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this._paymentMethod
  }

  get paymentIntentId(): string | undefined {
    return this._paymentIntentId
  }

  get updatedAt(): Date {
    return this._updatedAt
  }

  // Calculated properties
  get subtotal(): Money {
    return this.items.reduce(
      (sum, item) => sum.add(item.subtotal()),
      Money.zero('EUR'),
    )
  }

  get total(): Money {
    return this.subtotal.add(this.shippingCost).add(this.tax)
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  get customerEmail(): string | null {
    return this.guestEmail || null
  }

  // Business logic methods
  canBeCancelled(): boolean {
    return [OrderStatus.Pending, OrderStatus.Processing].includes(this._status)
      && this._status !== OrderStatus.Shipped
      && this._status !== OrderStatus.Delivered
  }

  canBeShipped(): boolean {
    return this._paymentStatus === PaymentStatus.Paid
      && this._status === OrderStatus.Processing
  }

  confirmPayment(transactionId: string): void {
    if (this._paymentStatus === PaymentStatus.Paid) {
      throw new Error('Payment already confirmed')
    }
    this._paymentIntentId = transactionId
    this._paymentStatus = PaymentStatus.Paid
    this._status = OrderStatus.Processing
    this._updatedAt = new Date()
  }

  markAsShipped(): void {
    if (this._paymentStatus !== PaymentStatus.Paid) {
      throw new Error('Cannot ship unpaid order')
    }
    if (this._status === OrderStatus.Shipped) {
      throw new Error('Order already shipped')
    }
    this._status = OrderStatus.Shipped
    this._updatedAt = new Date()
  }

  markAsDelivered(): void {
    if (this._status !== OrderStatus.Shipped) {
      throw new Error('Can only mark shipped orders as delivered')
    }
    this._status = OrderStatus.Delivered
    this._updatedAt = new Date()
  }

  cancel(): void {
    if (!this.canBeCancelled()) {
      throw new Error('Order cannot be cancelled in current state')
    }
    this._status = OrderStatus.Cancelled
    this._updatedAt = new Date()
  }

  refund(): void {
    if (this._paymentStatus !== PaymentStatus.Paid) {
      throw new Error('Can only refund paid orders')
    }
    this._paymentStatus = PaymentStatus.Refunded
    this._status = OrderStatus.Cancelled
    this._updatedAt = new Date()
  }

  // Static factory methods
  static generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }

  static mapPaymentMethod(frontendMethod: string): PaymentMethod {
    switch (frontendMethod) {
      case 'credit_card':
        return PaymentMethod.Stripe
      case 'paypal':
        return PaymentMethod.PayPal
      case 'cash':
      case 'bank_transfer':
      default:
        return PaymentMethod.Cash
    }
  }

  static determinePaymentStatus(
    paymentMethod: string,
    paymentSuccess: boolean,
    pending?: boolean,
  ): PaymentStatus {
    if (paymentMethod === 'cash') {
      return PaymentStatus.Pending
    }
    if (pending) {
      return PaymentStatus.Pending
    }
    if (paymentSuccess) {
      return PaymentStatus.Paid
    }
    return PaymentStatus.Pending
  }

  static determineOrderStatus(paymentStatus: PaymentStatus): OrderStatus {
    if (paymentStatus === PaymentStatus.Paid) {
      return OrderStatus.Processing
    }
    return OrderStatus.Pending
  }

  // Serialization
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      userId: this.userId,
      guestEmail: this.guestEmail,
      items: this.items.map(item => item.toJSON()),
      shippingAddress: this.shippingAddress.toJSON(),
      billingAddress: this.billingAddress.toJSON(),
      subtotal: this.subtotal.toJSON(),
      shippingCost: this.shippingCost.toJSON(),
      tax: this.tax.toJSON(),
      total: this.total.toJSON(),
      status: this._status,
      paymentStatus: this._paymentStatus,
      paymentMethod: this._paymentMethod,
      paymentIntentId: this._paymentIntentId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    }
  }

  toDatabaseFormat(): Record<string, unknown> {
    return {
      order_number: this.orderNumber,
      user_id: this.userId || null,
      guest_email: this.guestEmail || null,
      status: this._status,
      payment_method: this._paymentMethod,
      payment_status: this._paymentStatus,
      payment_intent_id: this._paymentIntentId,
      subtotal_eur: this.subtotal.amount,
      shipping_cost_eur: this.shippingCost.amount,
      tax_eur: this.tax.amount,
      total_eur: this.total.amount,
      shipping_address: this.shippingAddress.toJSON(),
      billing_address: this.billingAddress.toJSON(),
    }
  }
}

// Re-export for convenience
export { OrderItem } from './OrderItem'
export { Money } from '../value-objects/Money'
export { Address } from '../value-objects/Address'
