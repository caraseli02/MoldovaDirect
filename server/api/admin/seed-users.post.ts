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
import type { SeedUserOptions, CreatedUser, SeedUsersResponse } from '~/types/admin-testing'
import {
  generateMockUser,
  generatePassword,
  generateAddress,
  randomItem,
  productTemplates,
} from '~/server/data/mockData'

// Mock data for orders
const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const
const paymentStatuses = ['pending', 'paid', 'failed'] as const
const streets = ['Strada Ștefan cel Mare', 'Strada Mihai Eminescu', 'Strada Alexandru cel Bun', 'Strada Vasile Alecsandri', 'Bulevardul Decebal']
const cities = ['Chișinău', 'Bălți', 'Tiraspol', 'Cahul', 'Orhei']

export default defineEventHandler(async (event) => {
  // Verify admin access and non-production environment
  const adminId = await requireAdminTestingAccess(event)

  const supabase = serverSupabaseServiceRole(event)

  // Get options from body
  const body = await readBody(event).catch(() => ({})) as SeedUserOptions

  // Define maximum limit to prevent resource exhaustion
  const MAX_USERS = 1000

  // Validate count with strict bounds checking
  const count = body.count || 10
  if (typeof count !== 'number' || count < 1 || count > MAX_USERS || !Number.isInteger(count)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Count must be an integer between 1 and ${MAX_USERS}`,
    })
  }

  const withAddresses = body.withAddresses !== false
  const withOrders = body.withOrders === true
  const roles = body.roles || ['customer']

  // Validate roles array
  const validRoles = ['customer', 'admin', 'manager']
  if (!Array.isArray(roles) || roles.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Roles must be a non-empty array',
    })
  }

  for (const role of roles) {
    if (!validRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`,
      })
    }
  }

  const createdUsers: CreatedUser[] = []
  const errors: Array<{ email: string, error: string }> = []

  for (let i = 0; i < count; i++) {
    const mockUser = generateMockUser()
    const role = randomItem(roles)
    const password = generatePassword()

    try {
      // Create user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: mockUser.email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: mockUser.name,
          phone: mockUser.phone,
          preferred_language: mockUser.preferredLanguage,
        },
      })

      if (authError || !authData.user) {
        console.error(`Failed to create auth user ${mockUser.email}:`, authError)
        errors.push({ email: mockUser.email, error: authError?.message || 'Unknown error' })
        continue
      }

      const userId = authData.user.id

      // Create or update profile with role
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: mockUser.name,
          phone: mockUser.phone,
          role,
          preferred_language: mockUser.preferredLanguage,
        })

      if (profileError) {
        console.error(`Failed to create profile for ${mockUser.email}:`, profileError)
        errors.push({ email: mockUser.email, error: profileError.message })
        continue
      }

      // Create addresses if requested
      if (withAddresses) {
        const addresses = [
          { ...generateAddress('shipping'), user_id: userId },
          { ...generateAddress('billing'), user_id: userId },
        ]

        const { error: addressError } = await supabase
          .from('addresses')
          .insert(addresses)

        if (addressError) {
          console.warn(`Failed to create addresses for ${mockUser.email}:`, addressError)
        }
      }

      createdUsers.push({
        id: userId,
        email: mockUser.email,
        name: mockUser.name,
        role,
        phone: mockUser.phone,
      })
    }
    catch (error: any) {
      console.error('Error creating user:', error)
      errors.push({ email: mockUser.email, error: error.message })
    }
  }

  // If orders are requested, create some sample orders for the users
  if (withOrders && createdUsers.length > 0) {
    const mockProducts = productTemplates.map(t => ({
      name: t.name,
      price: (t.priceMin + t.priceMax) / 2,
      sku: `${t.category.toUpperCase()}-001`,
    })).slice(0, 5)

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
            country: 'Moldova',
          },
          billing_address: {
            street: `${randomItem(streets)} ${Math.floor(Math.random() * 150) + 1}`,
            city: randomItem(cities),
            postalCode: `MD-${Math.floor(Math.random() * 9000) + 1000}`,
            country: 'Moldova',
          },
          created_at: createdAt.toISOString(),
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
            nameTranslations: { en: product.name, es: product.name },
          },
          quantity,
          price_eur: product.price,
          total_eur: product.price * quantity,
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
    roles,
  })

  const response: SeedUsersResponse = {
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
      roles,
    },
  }

  return response
})
