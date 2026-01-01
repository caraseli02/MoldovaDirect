/**
 * OrderItem Entity
 * Represents a line item in an order
 */
import type { Money } from '../value-objects/Money'

export interface ProductSnapshot {
  id: number
  name: string
  price: number
  description?: string
  image_url?: string
  sku?: string
  category?: string
}

export interface OrderItemProps {
  productId: number
  productSnapshot: ProductSnapshot
  quantity: number
  unitPrice: Money
}

export class OrderItem {
  readonly productId: number
  readonly productSnapshot: ProductSnapshot
  readonly quantity: number
  readonly unitPrice: Money

  constructor(props: OrderItemProps) {
    this.validateQuantity(props.quantity)

    this.productId = props.productId
    this.productSnapshot = { ...props.productSnapshot }
    this.quantity = props.quantity
    this.unitPrice = props.unitPrice
  }

  private validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive')
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('Quantity must be an integer')
    }
  }

  subtotal(): Money {
    return this.unitPrice.multiply(this.quantity)
  }

  get productName(): string {
    return this.productSnapshot.name
  }

  get productSku(): string | undefined {
    return this.productSnapshot.sku
  }

  withQuantity(newQuantity: number): OrderItem {
    return new OrderItem({
      productId: this.productId,
      productSnapshot: this.productSnapshot,
      quantity: newQuantity,
      unitPrice: this.unitPrice,
    })
  }

  toJSON(): {
    productId: number
    productSnapshot: ProductSnapshot
    quantity: number
    unitPrice: { amount: number, currency: string }
    subtotal: { amount: number, currency: string }
  } {
    return {
      productId: this.productId,
      productSnapshot: this.productSnapshot,
      quantity: this.quantity,
      unitPrice: this.unitPrice.toJSON(),
      subtotal: this.subtotal().toJSON(),
    }
  }

  toDatabaseFormat(): {
    product_id: number
    product_snapshot: ProductSnapshot
    quantity: number
    price_eur: number
    total_eur: number
  } {
    return {
      product_id: this.productId,
      product_snapshot: this.productSnapshot,
      quantity: this.quantity,
      price_eur: this.unitPrice.amount,
      total_eur: this.subtotal().amount,
    }
  }
}
