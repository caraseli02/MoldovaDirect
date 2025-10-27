/**
 * API endpoint to seed mock orders
 * POST /api/admin/seed-orders
 * 
 * This is easier than running a script - just call this endpoint!
 */

import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)

  // Mock data
  const mockCustomers = [
    { name: 'John Doe', email: 'john.doe@example.com' },
    { name: 'Jane Smith', email: 'jane.smith@example.com' },
    { name: 'Bob Johnson', email: 'bob.johnson@example.com' },
    { name: 'Alice Williams', email: 'alice.williams@example.com' },
    { name: 'Charlie Brown', email: 'charlie.brown@example.com' }
  ]

  const mockProducts = [
    { name: 'Traditional Moldovan Wine', price: 25.99, sku: 'WINE-001' },
    { name: 'Handcrafted Pottery', price: 45.50, sku: 'POT-001' },
    { name: 'Organic Honey', price: 15.99, sku: 'HONEY-001' },
    { name: 'Wool Blanket', price: 89.99, sku: 'BLANKET-001' },
    { name: 'Embroidered Shirt', price: 65.00, sku: 'SHIRT-001' }
  ]

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses = ['pending', 'paid', 'failed']

  function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  function randomDate(daysAgo: number): Date {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
    return date
  }

  function generateOrderNumber(): string {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  const count = 20
  const createdOrders = []

  for (let i = 0; i < count; i++) {
    const customer = randomItem(mockCustomers)
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
          nameTranslations: {
            en: product.name,
            es: product.name
          }
        },
        quantity,
        price_eur: product.price,
        total_eur: itemTotal
      })
    }

    const shippingCost = 5.99
    const tax = subtotal * 0.19 // 19% VAT
    const total = subtotal + shippingCost + tax

    const order = {
      order_number: generateOrderNumber(),
      user_id: null,
      guest_email: customer.email,
      status,
      payment_method: 'stripe',
      payment_status: paymentStatus,
      subtotal_eur: subtotal,
      shipping_cost_eur: shippingCost,
      tax_eur: tax,
      total_eur: total,
      shipping_address: {
        street: `${Math.floor(Math.random() * 999) + 1} Main St`,
        city: 'Chisinau',
        province: 'Chisinau',
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova'
      },
      billing_address: {
        street: `${Math.floor(Math.random() * 999) + 1} Main St`,
        city: 'Chisinau',
        province: 'Chisinau',
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova'
      },
      customer_notes: Math.random() > 0.7 ? 'Please deliver between 9 AM - 5 PM' : null,
      admin_notes: null,
      tracking_number: status === 'shipped' || status === 'delivered' ? `TRACK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      carrier: status === 'shipped' || status === 'delivered' ? randomItem(['DHL', 'FedEx', 'UPS']) : null,
      priority_level: Math.floor(Math.random() * 3) + 1,
      estimated_ship_date: status === 'pending' || status === 'processing' ? new Date(Date.now() + 86400000 * 2).toISOString() : null,
      fulfillment_progress: status === 'processing' ? Math.floor(Math.random() * 100) : null,
      created_at: createdAt.toISOString(),
      shipped_at: status === 'shipped' || status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 2).toISOString() : null,
      delivered_at: status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 5).toISOString() : null
    }

    try {
      // Insert order
      const { data: insertedOrder, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

      if (orderError || !insertedOrder) {
        console.error(`Failed to insert order ${order.order_number}:`, orderError)
        continue
      }

      // Insert order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: insertedOrder.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error(`Failed to insert items for order ${order.order_number}:`, itemsError)
        continue
      }

      createdOrders.push({
        orderNumber: order.order_number,
        itemCount: items.length,
        total: total.toFixed(2)
      })
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  return {
    success: true,
    message: `Created ${createdOrders.length} mock orders`,
    orders: createdOrders
  }
})
