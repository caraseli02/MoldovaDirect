/**
 * API endpoint to seed mock users with realistic profiles
 * POST /api/admin/seed-users
 *
 * Body options:
 * - count: number of users to create (default: 10)
 * - withAddresses: create addresses for users (default: true)
 * - withOrders: create order history for users (default: false)
 * - roles: array of roles to assign ['customer', 'admin', 'manager']
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminTestingAccess, logAdminAction } from '~/server/utils/adminAuth'

interface SeedUserOptions {
  count?: number
  withAddresses?: boolean
  withOrders?: boolean
  roles?: string[]
}

export default defineEventHandler(async (event) => {
  // Verify admin access and non-production environment
  const adminId = await requireAdminTestingAccess(event)

  const supabase = serverSupabaseServiceRole(event)

  // Get options from body
  const body = await readBody(event).catch(() => ({})) as SeedUserOptions
  const count = body.count || 10
  const withAddresses = body.withAddresses !== false
  const withOrders = body.withOrders === true
  const roles = body.roles || ['customer']

  // Mock data generators
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa',
    'Robert', 'Maria', 'William', 'Anna', 'Richard', 'Patricia', 'Thomas',
    'Elena', 'Alexandru', 'Natalia', 'Igor', 'Olga', 'Dmitri', 'Svetlana'
  ]

  const lastNames = [
    'Smith', 'Johnson', 'Brown', 'Wilson', 'Taylor', 'Anderson', 'Martinez',
    'Garcia', 'Rodriguez', 'Popescu', 'Ionescu', 'Moraru', 'Popa', 'Rusu',
    'Volkov', 'Ivanov', 'Petrov', 'Sidorov', 'Kozlov', 'Novak', 'Moldovan'
  ]

  const cities = [
    'Chisinau', 'Balti', 'Tiraspol', 'Bender', 'Cahul', 'Soroca', 'Ungheni',
    'Orhei', 'Comrat', 'Edinet', 'Causeni', 'Drochia', 'Hincesti', 'Straseni'
  ]

  const streets = [
    'Stefan cel Mare', 'Mihai Eminescu', 'Alexandru cel Bun', 'Decebal',
    'Columna', 'Puskin', 'Independentei', 'Bucuresti', '31 August', 'Izmail'
  ]

  const languages = ['es', 'en', 'ro', 'ru']

  const phonePrefix = ['+373', '+40', '+34']

  function randomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  function generateEmail(firstName: string, lastName: string): string {
    const domains = ['example.com', 'test.com', 'demo.com', 'mail.md']
    const timestamp = Date.now().toString().slice(-4)
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}@${randomItem(domains)}`
  }

  function generatePhone(): string {
    const prefix = randomItem(phonePrefix)
    const number = Math.floor(Math.random() * 90000000) + 10000000
    return `${prefix}${number}`
  }

  function generateAddress(type: 'billing' | 'shipping') {
    return {
      type,
      street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
      city: randomItem(cities),
      postal_code: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
      province: randomItem(cities),
      country: 'MD',
      is_default: type === 'shipping'
    }
  }

  const createdUsers = []
  const errors = []

  for (let i = 0; i < count; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    const email = generateEmail(firstName, lastName)
    const name = `${firstName} ${lastName}`
    const phone = generatePhone()
    const preferredLanguage = randomItem(languages)
    const role = randomItem(roles)

    // Generate a random password
    const password = `TestPass${Math.floor(Math.random() * 10000)}!`

    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          phone,
          preferred_language: preferredLanguage
        }
      })

      if (authError || !authData.user) {
        console.error(`Failed to create auth user ${email}:`, authError)
        errors.push({ email, error: authError?.message })
        continue
      }

      const userId = authData.user.id

      // Create or update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name,
          phone,
          role,
          preferred_language: preferredLanguage
        })

      if (profileError) {
        console.error(`Failed to create profile for ${email}:`, profileError)
        errors.push({ email, error: profileError.message })
        continue
      }

      // Create addresses if requested
      if (withAddresses) {
        const addresses = [
          { ...generateAddress('shipping'), user_id: userId },
          { ...generateAddress('billing'), user_id: userId }
        ]

        const { error: addressError } = await supabase
          .from('addresses')
          .insert(addresses)

        if (addressError) {
          console.warn(`Failed to create addresses for ${email}:`, addressError)
        }
      }

      createdUsers.push({
        id: userId,
        email,
        name,
        role,
        phone
        // Password removed for security - not exposed in API response
      })

    } catch (error: any) {
      console.error('Error creating user:', error)
      errors.push({ email, error: error.message })
    }
  }

  // If orders are requested, create some sample orders for the users
  if (withOrders && createdUsers.length > 0) {
    const mockProducts = [
      { name: 'Traditional Moldovan Wine', price: 25.99, sku: 'WINE-001' },
      { name: 'Handcrafted Pottery', price: 45.50, sku: 'POT-001' },
      { name: 'Organic Honey', price: 15.99, sku: 'HONEY-001' },
      { name: 'Wool Blanket', price: 89.99, sku: 'BLANKET-001' },
      { name: 'Embroidered Shirt', price: 65.00, sku: 'SHIRT-001' }
    ]

    const statuses = ['pending', 'processing', 'shipped', 'delivered']
    const paymentStatuses = ['paid', 'pending']

    // Create 1-3 orders for each user
    for (const user of createdUsers) {
      const orderCount = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < orderCount; j++) {
        const product = randomItem(mockProducts)
        const quantity = Math.floor(Math.random() * 3) + 1
        const subtotal = product.price * quantity
        const shippingCost = 5.99
        const tax = subtotal * 0.19
        const total = subtotal + shippingCost + tax

        const createdAt = new Date()
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90))

        const order = {
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          user_id: user.id,
          status: randomItem(statuses),
          payment_method: 'stripe',
          payment_status: randomItem(paymentStatuses),
          subtotal_eur: subtotal,
          shipping_cost_eur: shippingCost,
          tax_eur: tax,
          total_eur: total,
          shipping_address: {
            street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
            city: randomItem(cities),
            postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
            country: 'Moldova'
          },
          billing_address: {
            street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
            city: randomItem(cities),
            postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
            country: 'Moldova'
          },
          created_at: createdAt.toISOString()
        }

        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert(order)
          .select()
          .single()

        if (orderError || !insertedOrder) {
          console.warn(`Failed to create order for ${user.email}:`, orderError)
          continue
        }

        // Create order items
        await supabase.from('order_items').insert({
          order_id: insertedOrder.id,
          product_snapshot: {
            name: product.name,
            sku: product.sku,
            nameTranslations: { en: product.name, es: product.name }
          },
          quantity,
          price_eur: product.price,
          total_eur: product.price * quantity
        })
      }
    }
  }

  // Log admin action
  await logAdminAction(event, adminId, 'seed-users', {
    count,
    created: createdUsers.length,
    failed: errors.length,
    withAddresses,
    withOrders,
    roles
  })

  return {
    success: true,
    message: `Created ${createdUsers.length} test users${withOrders ? ' with orders' : ''}`,
    users: createdUsers,
    errors: errors.length > 0 ? errors : undefined,
    summary: {
      total: count,
      created: createdUsers.length,
      failed: errors.length,
      withAddresses,
      withOrders,
      roles
    }
  }
})
