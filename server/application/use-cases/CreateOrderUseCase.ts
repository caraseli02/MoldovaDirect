/**
 * CreateOrderUseCase
 * Handles order creation business logic, decoupled from HTTP layer
 */
import type { IOrderRepository, CreateOrderData } from '~/server/infrastructure/repositories/IOrderRepository'
import type { OrderStatus, PaymentStatus } from '~/server/domain/entities/Order'
import { Order } from '~/server/domain/entities/Order'
import type { ProductSnapshot } from '~/server/domain/entities/OrderItem'

// Request/Response types
export interface OrderItemRequest {
  productId: number
  productSnapshot: ProductSnapshot
  quantity: number
  price: number
  total: number
}

export interface AddressRequest {
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
  method?: string
}

export interface PaymentResultRequest {
  success: boolean
  transactionId: string
  paymentMethod: string
  status?: string
  pending?: boolean
}

export interface CreateOrderRequest {
  sessionId: string
  items: OrderItemRequest[]
  shippingAddress: AddressRequest
  billingAddress: AddressRequest
  paymentMethod: 'cash' | 'credit_card' | 'paypal' | 'bank_transfer'
  paymentResult: PaymentResultRequest
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  userId?: string
  guestEmail?: string
  customerName?: string
  locale?: string
  marketingConsent?: boolean
}

export interface CreateOrderResponse {
  success: boolean
  order?: {
    id: string
    orderNumber: string
    total: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    createdAt: Date
    userId?: string
  }
  error?: string
  priceDiscrepancyDetected?: boolean
}

// Product repository interface for price verification
export interface IProductRepository {
  findByIds(ids: number[]): Promise<Array<{
    id: number
    price_eur: number
    name_translations: Record<string, string>
    is_active: boolean
    stock_quantity: number
  }>>
  updateStock?(productId: number, quantityChange: number): Promise<void>
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    // Validation
    const validationError = this.validate(request)
    if (validationError) {
      return { success: false, error: validationError }
    }

    // Price verification
    const priceVerification = await this.verifyPrices(request.items)
    if (!priceVerification.success) {
      return { success: false, error: priceVerification.error }
    }

    // Calculate server-side totals
    const serverSubtotal = priceVerification.verifiedItems.reduce(
      (sum, item) => sum + item.total,
      0,
    )

    const serverShippingCost = this.calculateShippingCost(
      request.shippingAddress.method,
      serverSubtotal,
    )

    const TAX_RATE = 0 // No tax in current configuration
    const serverTax = serverSubtotal * TAX_RATE
    const serverTotal = Math.round((serverSubtotal + serverShippingCost + serverTax) * 100) / 100

    // Determine payment and order status
    const paymentStatus = Order.determinePaymentStatus(
      request.paymentMethod,
      request.paymentResult.success,
      request.paymentResult.pending,
    )

    const orderStatus = Order.determineOrderStatus(paymentStatus)
    const paymentMethod = Order.mapPaymentMethod(request.paymentMethod)

    // Create order data
    const orderData: CreateOrderData = {
      orderNumber: Order.generateOrderNumber(),
      userId: request.userId || null,
      guestEmail: request.guestEmail || null,
      items: priceVerification.verifiedItems.map(item => ({
        productId: item.productId,
        productSnapshot: item.productSnapshot,
        quantity: item.quantity,
        priceEur: item.price,
        totalEur: item.total,
      })),
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress,
      subtotalEur: serverSubtotal,
      shippingCostEur: serverShippingCost,
      taxEur: serverTax,
      totalEur: serverTotal,
      paymentMethod,
      paymentStatus,
      paymentIntentId: request.paymentResult.transactionId,
      status: orderStatus,
    }

    // Create order via repository
    const order = await this.orderRepository.create(orderData)

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.totalEur,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        userId: order.userId || undefined,
      },
      priceDiscrepancyDetected: priceVerification.discrepancyDetected,
    }
  }

  private validate(request: CreateOrderRequest): string | null {
    if (!request.sessionId) {
      return 'Missing session ID'
    }

    if (!request.items || request.items.length === 0) {
      return 'Order must have at least one item (items)'
    }

    if (!request.shippingAddress) {
      return 'Missing shipping address'
    }

    if (!request.paymentResult?.success) {
      return 'Payment was not successful (payment)'
    }

    return null
  }

  private async verifyPrices(items: OrderItemRequest[]): Promise<{
    success: boolean
    error?: string
    verifiedItems: Array<{
      productId: number
      productSnapshot: ProductSnapshot
      quantity: number
      price: number
      total: number
    }>
    discrepancyDetected: boolean
  }> {
    const productIds = items.map(item => item.productId)
    const dbProducts = await this.productRepository.findByIds(productIds)

    const productMap = new Map(dbProducts.map(p => [p.id, p]))
    const verifiedItems: Array<{
      productId: number
      productSnapshot: ProductSnapshot
      quantity: number
      price: number
      total: number
    }> = []

    let discrepancyDetected = false

    for (const item of items) {
      const dbProduct = productMap.get(item.productId)

      if (!dbProduct) {
        return {
          success: false,
          error: `Product with ID ${item.productId} not found`,
          verifiedItems: [],
          discrepancyDetected: false,
        }
      }

      if (!dbProduct.is_active) {
        return {
          success: false,
          error: 'One or more products are no longer available',
          verifiedItems: [],
          discrepancyDetected: false,
        }
      }

      // Use server price
      const serverPrice = dbProduct.price_eur
      const serverTotal = Math.round(serverPrice * item.quantity * 100) / 100

      if (Math.abs(item.price - serverPrice) > 0.01) {
        discrepancyDetected = true
      }

      verifiedItems.push({
        productId: item.productId,
        productSnapshot: {
          ...item.productSnapshot,
          price: serverPrice,
        },
        quantity: item.quantity,
        price: serverPrice,
        total: serverTotal,
      })
    }

    return {
      success: true,
      verifiedItems,
      discrepancyDetected,
    }
  }

  private calculateShippingCost(method: string | undefined, subtotal: number): number {
    if (method === 'express') {
      return 12.99
    }
    if (method === 'free' && subtotal >= 50) {
      return 0
    }
    return 5.99 // Standard shipping
  }
}
