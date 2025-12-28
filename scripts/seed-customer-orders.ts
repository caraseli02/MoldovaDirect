/**
 * Script to seed orders for the customer user
 * Run with: npx tsx scripts/seed-customer-orders.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://khvzbjemydddnryreytu.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtodnpiamVteWRkZG5yeXJleXR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4NjQ1NCwiZXhwIjoyMDcxMzYyNDU0fQ.li8R9uS_JdRP4AgUjw31v5z-jRFhySa-GHC1Qu0AEXI'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const mockProducts = [
  { name: 'Traditional Moldovan Wine', price: 25.99, sku: 'WINE-001' },
  { name: 'Handcrafted Pottery', price: 45.50, sku: 'POT-001' },
  { name: 'Organic Honey', price: 15.99, sku: 'HONEY-001' },
  { name: 'Wool Blanket', price: 89.99, sku: 'BLANKET-001' },
  { name: 'Embroidered Shirt', price: 65.00, sku: 'SHIRT-001' },
]

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const

function randomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}

function randomDate(daysAgo: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date
}

async function main() {
  const targetEmail = 'customer@moldovadirect.com'
  const targetPassword = 'Customer123!@#'

  console.log(`🔍 Looking for ${targetEmail} user...`)

  // Find the customer user - search through all pages
  let customerUser = null
  let page = 1
  const perPage = 100

  while (!customerUser) {
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    })

    if (userError) {
      console.error('❌ Error fetching users:', userError)
      process.exit(1)
    }

    customerUser = userData?.users?.find(u => u.email === targetEmail)

    if (customerUser) break
    if (!userData?.users || userData.users.length < perPage) break

    page++
  }

  if (!customerUser) {
    console.log(`⚠️ User ${targetEmail} not found. Creating it now...`)

    // Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: targetEmail,
      password: targetPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Customer User',
        phone: '+34600000001',
        preferred_language: 'es',
      },
    })

    if (createError) {
      // If user already exists, try to find by email using a workaround
      if (createError.message?.includes('already been registered')) {
        console.log('User exists but was not found in list. Attempting direct lookup...')

        // Sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: targetPassword,
        })

        if (signInError) {
          console.error('❌ Error signing in to find user:', signInError)
          process.exit(1)
        }

        customerUser = signInData.user
        console.log(`✅ Found user via sign-in: ${customerUser?.email} (${customerUser?.id})`)
      } else {
        console.error('❌ Error creating user:', createError)
        process.exit(1)
      }
    } else {
      customerUser = newUser.user
      console.log(`✅ Created user: ${customerUser.email} (${customerUser.id})`)
      console.log(`   Password: ${targetPassword}`)

      // Create profile
      await supabase.from('profiles').upsert({
        id: customerUser.id,
        name: 'Customer User',
        phone: '+34600000001',
        role: 'customer',
        preferred_language: 'es',
      })
    }
  } else {
    console.log(`✅ Found user: ${customerUser.email} (${customerUser.id})`)
  }

  // Check existing orders
  const { count: existingCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', customerUser.id)

  console.log(`📦 Existing orders for this user: ${existingCount || 0}`)

  // Create 5 orders
  const orderCount = 5
  console.log(`\n🚀 Creating ${orderCount} orders for ${customerUser.email}...`)

  for (let i = 0; i < orderCount; i++) {
    const status = randomItem(statuses)
    const createdAt = randomDate(30)

    // Generate 1-3 items per order
    const itemCount = Math.floor(Math.random() * 3) + 1
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
    const tax = Math.round(subtotal * 0.19 * 100) / 100
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const order = {
      order_number: orderNumber,
      user_id: customerUser.id,
      status,
      payment_method: 'stripe',
      payment_status: status === 'cancelled' ? 'failed' : 'paid',
      subtotal_eur: Math.round(subtotal * 100) / 100,
      shipping_cost_eur: shippingCost,
      tax_eur: tax,
      total_eur: total,
      shipping_address: {
        street: `Strada Ștefan cel Mare ${Math.floor(Math.random() * 150) + 1}`,
        city: 'Chișinău',
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova',
      },
      billing_address: {
        street: `Strada Mihai Eminescu ${Math.floor(Math.random() * 150) + 1}`,
        city: 'Chișinău',
        postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
        country: 'Moldova',
      },
      tracking_number: status === 'shipped' || status === 'delivered' ? `TRACK-${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      carrier: status === 'shipped' || status === 'delivered' ? randomItem(['DHL', 'FedEx', 'UPS']) : null,
      created_at: createdAt.toISOString(),
      shipped_at: status === 'shipped' || status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 2).toISOString() : null,
      delivered_at: status === 'delivered' ? new Date(createdAt.getTime() + 86400000 * 5).toISOString() : null,
    }

    // Insert order
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (orderError) {
      console.error(`❌ Failed to create order ${orderNumber}:`, orderError.message)
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
      console.error(`❌ Failed to create items for ${orderNumber}:`, itemsError.message)
      continue
    }

    console.log(`  ✅ Created order: ${orderNumber} (${status}) - €${total} - ${items.length} items`)
  }

  // Verify final count
  const { count: finalCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', customerUser.id)

  console.log(`\n✅ Done! Total orders for ${customerUser.email}: ${finalCount}`)
}

main().catch(console.error)
