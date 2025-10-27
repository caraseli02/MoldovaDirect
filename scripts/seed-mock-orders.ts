/**
 * Script to seed mock orders for testing the admin orders UI
 * Run with: node --loader tsx scripts/seed-mock-orders.ts
 * Or: pnpm add -D @supabase/supabase-js && npx tsx scripts/seed-mock-orders.ts
 */

// Simple fetch-based approach without needing @supabase/supabase-js
const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  console.log('\nMake sure your .env file has:')
  console.log('SUPABASE_URL=your_supabase_url')
  console.log('SUPABASE_SERVICE_KEY=your_service_role_key')
  process.exit(1)
}

// Simple Supabase client using fetch
const supabase = {
  from: (table: string) => ({
    insert: async (data: any) => {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(Array.isArray(data) ? data : [data])
      })
      
      if (!response.ok) {
        const error = await response.text()
        return { data: null, error: { message: error } }
      }
      
      const result = await response.json()
      return { data: Array.isArray(result) ? result : [result], error: null }
    },
    select: () => ({
      single: async () => {
        // Not needed for seeding
        return { data: null, error: null }
      }
    })
  })
}

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

async function seedMockOrders(count: number = 20) {
  console.log(`🌱 Seeding ${count} mock orders...`)

  const orders = []

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
      user_id: null, // Guest orders
      guest_email: customer.email,
      status,
      payment_method: 'card',
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

    orders.push({ order, items })
  }

  // Insert orders
  for (const { order, items } of orders) {
    try {
      // Insert order
      const { data: insertedOrders, error: orderError } = await supabase
        .from('orders')
        .insert(order)

      if (orderError || !insertedOrders || insertedOrders.length === 0) {
        console.error(`❌ Failed to insert order ${order.order_number}:`, orderError?.message || 'No data returned')
        continue
      }

      const insertedOrder = insertedOrders[0]

      // Insert order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: insertedOrder.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error(`❌ Failed to insert items for order ${order.order_number}:`, itemsError.message)
        continue
      }

      console.log(`✅ Created order ${order.order_number} with ${items.length} items`)
    } catch (error) {
      console.error(`❌ Error creating order:`, error)
    }
  }

  console.log(`\n🎉 Successfully seeded ${orders.length} mock orders!`)
}

// Run the seeder
seedMockOrders(20)
  .then(() => {
    console.log('\n✨ Seeding complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
