/**
 * API endpoint to seed mock orders for a specific user
 * POST /api/admin/seed-orders-for-user
 *
 * Body options:
 * - userId: UUID of the user to create orders for (required)
 * - count: number of orders to create (default: 5, max: 100)
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

// Request/Response type definitions
interface SeedOrdersRequest {
  userId: string
  count?: number
}

interface CreatedOrder {
  id: number
  orderNumber: string
  status: string
  itemCount: number
  total: string
}

interface FailedOrder {
  orderNumber: string
  error: string
  stage: 'order_insert' | 'items_insert' | 'unknown'
  orderId?: number
}

interface SeedOrdersResponse {
  success: boolean
  partialSuccess?: boolean
  message: string
  userId: string
  userEmail: string
  orders: CreatedOrder[]
  errors?: FailedOrder[]
}

const mockProducts = [
  { name: 'Traditional Moldovan Wine', price: 25.99, sku: 'WINE-001' },
  { name: 'Handcrafted Pottery', price: 45.50, sku: 'POT-001' },
  { name: 'Organic Honey', price: 15.99, sku: 'HONEY-001' },
  { name: 'Wool Blanket', price: 89.99, sku: 'BLANKET-001' },
  { name: 'Embroidered Shirt', price: 65.00, sku: 'SHIRT-001' },
]

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const paymentStatuses = ['pending', 'paid', 'failed'] as const
const streets = ['Strada Ștefan cel Mare', 'Strada Mihai Eminescu', 'Strada Alexandru cel Bun']
const cities = ['Chișinău', 'Bălți', 'Orhei']

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

export default defineEventHandler(async (event): Promise<SeedOrdersResponse> => {
  await requireAdminRole(event)
  const supabase = serverSupabaseServiceRole(event)

  // Parse request body with explicit error handling
  let body: SeedOrdersRequest
  try {
    body = await readBody(event)
  }
  catch (parseError: any) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid request body: ${parseError.message || 'Could not parse JSON'}`,
    })
  }

  const { userId, count = 5 } = body

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required',
    })
  }

  // Validate count is within reasonable bounds
  const orderCount = Math.min(Math.max(1, count), 100)
  if (count !== orderCount) {
    console.warn(`Adjusted count from ${count} to ${orderCount} (must be 1-100)`)
  }

  // Verify user exists
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
  if (userError || !userData?.user) {
    throw createError({
      statusCode: 404,
      statusMessage: `User not found: ${userId}`,
    })
  }

  const createdOrders: CreatedOrder[] = []
  const failedOrders: FailedOrder[] = []

  for (let i = 0; i < orderCount; i++) {
    const status = randomItem(statuses)
    const paymentStatus = status === 'cancelled' ? 'failed' : randomItem(paymentStatuses)
    const createdAt = randomDate(30)

    // Generate 1-4 items per order
    const itemCount = Math.floor(Math.random() * 4) + 1
    const items = []
    let subtotal = 0

    for (let j = 0; j < itemCount; j++) {
      const product = randomItem(mockProducts)
      const quantity = Math.floor(Math.random() * 3) + 1
      const itemTotal = product.price * quantity
      subtotal += itemTotal

      items.push({
        product_snapshot: {
          name: product.name,
          sku: product.sku,
          name_translations: {
            en: product.name,
            es: product.name,
            ro: product.name,
            ru: product.name,
          },
          images: ['/images/products/placeholder.jpg'],
        },
        quantity,
        price_eur: product.price,
        total_eur: itemTotal,
      })
    }

    const shippingCost = 5.99
    const tax = subtotal * 0.19
    const total = subtotal + shippingCost + tax

    const order = {
      order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      status,
      payment_method: 'stripe',
      payment_status: paymentStatus,
      subtotal_eur: subtotal,
      shipping_cost_eur: shippingCost,
      tax_eur: tax,
      total_eur: total,
      shipping_address: {
        street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
        city: randomItem(cities),
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova',
      },
      billing_address: {
        street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
        city: randomItem(cities),
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova',
      },
      tracking_number: status === 'shipped' || status === 'delivered' ? `TRACK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      carrier: status === 'shipped' || status === 'delivered' ? randomItem(['DHL', 'FedEx', 'UPS']) : null,
      created_at: createdAt.toISOString(),
      shipped_at: status === 'shipped' || status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 2).toISOString() : null,
      delivered_at: status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 5).toISOString() : null,
    }

    try {
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

      if (orderError || !insertedOrder) {
        failedOrders.push({
          orderNumber: order.order_number,
          error: orderError?.message || 'Unknown error during order insertion',
          stage: 'order_insert',
        })
        continue
      }

      // Insert order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: insertedOrder.id,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        failedOrders.push({
          orderNumber: order.order_number,
          orderId: insertedOrder.id,
          error: itemsError.message,
          stage: 'items_insert',
        })
        // Note: Order exists but without items - may need cleanup
        continue
      }

      createdOrders.push({
        id: insertedOrder.id,
        orderNumber: order.order_number,
        status: order.status,
        itemCount: items.length,
        total: total.toFixed(2),
      })
    }
    catch (error: any) {
      failedOrders.push({
        orderNumber: order.order_number,
        error: error.message || 'Unexpected error',
        stage: 'unknown',
      })
    }
  }

  const hasFailures = failedOrders.length > 0
  const hasSuccesses = createdOrders.length > 0

  return {
    success: !hasFailures,
    partialSuccess: hasFailures && hasSuccesses,
    message: hasFailures
      ? `Created ${createdOrders.length} orders, ${failedOrders.length} failed`
      : `Created ${createdOrders.length} mock orders for user ${userData.user.email}`,
    userId,
    userEmail: userData.user.email || '',
    orders: createdOrders,
    errors: hasFailures ? failedOrders : undefined,
  }
})
