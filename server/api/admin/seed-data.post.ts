/**
 * Comprehensive Test Data Generator
 * POST /api/admin/seed-data
 *
 * Generates complete test datasets with presets for different scenarios
 *
 * Presets:
 * - "empty": Clean database (no data)
 * - "minimal": Basic setup (5 users, 10 products, 5 orders)
 * - "development": Development testing (20 users, 50 products, 100 orders)
 * - "demo": Demo/presentation (50 users, 100 products, 300 orders, realistic data)
 * - "stress": Stress testing (200 users, 500 products, 2000 orders)
 * - "low-stock": Low stock scenario (products with low inventory)
 * - "holiday-rush": Holiday season simulation (high order volume)
 * - "new-store": New store launch (few orders, many products)
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminTestingAccess, logAdminAction } from '~/server/utils/adminAuth'
import type { SeedOptions } from '~/types/admin-testing'
import {
  generateMockUser,
  generatePassword,
  categoryData,
  productTemplates,
} from '~/server/data/mockData'

export default defineEventHandler(async (event) => {
  // Verify admin access and non-production environment
  const adminId = await requireAdminTestingAccess(event)

  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event).catch(() => ({})) as SeedOptions

  // Get preset configuration
  const preset = body.preset || 'minimal'
  const config = getPresetConfig(preset)

  // Define maximum limits to prevent resource exhaustion
  const MAX_USERS = 1000
  const MAX_PRODUCTS = 5000
  const MAX_ORDERS = 10000

  // Validate and apply overrides with strict bounds checking
  if (body.users !== undefined) {
    if (typeof body.users !== 'number' || body.users < 0 || body.users > MAX_USERS || !Number.isInteger(body.users)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Users must be an integer between 0 and ${MAX_USERS}`,
      })
    }
    config.users = body.users
  }

  if (body.products !== undefined) {
    if (typeof body.products !== 'number' || body.products < 0 || body.products > MAX_PRODUCTS || !Number.isInteger(body.products)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Products must be an integer between 0 and ${MAX_PRODUCTS}`,
      })
    }
    config.products = body.products
  }

  if (body.orders !== undefined) {
    if (typeof body.orders !== 'number' || body.orders < 0 || body.orders > MAX_ORDERS || !Number.isInteger(body.orders)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Orders must be an integer between 0 and ${MAX_ORDERS}`,
      })
    }
    config.orders = body.orders
  }

  if (body.categories !== undefined) {
    if (typeof body.categories !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Categories must be a boolean value',
      })
    }
    config.categories = body.categories
  }

  if (body.clearExisting !== undefined) {
    if (typeof body.clearExisting !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'ClearExisting must be a boolean value',
      })
    }
    config.clearExisting = body.clearExisting
  }

  const results = {
    preset,
    startTime: new Date().toISOString(),
    steps: [] as Array<{ step: string, duration: number, count: number }>,
    errors: [] as Array<{ step: string, error: string }>,
  }

  try {
    // Step 1: Clear existing data if requested
    if (config.clearExisting) {
      const stepStart = Date.now()
      await clearTestData(supabase)
      results.steps.push({
        step: 'Clear existing data',
        duration: Date.now() - stepStart,
        count: 0,
      })
    }

    // Step 2: Create categories if requested
    if (config.categories) {
      const stepStart = Date.now()
      const count = await seedCategories(supabase)
      results.steps.push({
        step: 'Create categories',
        duration: Date.now() - stepStart,
        count,
      })
    }

    // Step 3: Create products
    if (config.products > 0) {
      const stepStart = Date.now()
      const count = await seedProducts(supabase, config.products, config.lowStock)
      results.steps.push({
        step: 'Create products',
        duration: Date.now() - stepStart,
        count,
      })
    }

    // Step 4: Create users
    if (config.users > 0) {
      const stepStart = Date.now()
      const userIds = await seedUsers(supabase, config.users)
      results.steps.push({
        step: 'Create users',
        duration: Date.now() - stepStart,
        count: userIds.length,
      })

      // Step 5: Create orders
      if (config.orders > 0 && userIds.length > 0) {
        const stepStart = Date.now()
        const count = await seedOrders(supabase, config.orders, userIds, config.orderPattern)
        results.steps.push({
          step: 'Create orders',
          duration: Date.now() - stepStart,
          count,
        })
      }
    }

    // Log admin action
    await logAdminAction(event, adminId, 'seed-data', {
      preset,
      config,
      results: results.steps.map(s => ({ step: s.step, count: s.count })),
    })

    return {
      success: true,
      message: `Successfully seeded ${preset} dataset`,
      results,
      endTime: new Date().toISOString(),
      totalDuration: results.steps.reduce((sum, step) => sum + step.duration, 0),
    }
  }
  catch (error: any) {
    console.error('Seed data error:', error)
    await logAdminAction(event, adminId, 'seed-data-failed', { preset, error: error.message })
    return {
      success: false,
      message: 'Failed to seed data',
      error: error.message,
      results,
    }
  }
})

// Preset configurations
function getPresetConfig(preset: string) {
  const configs = {
    'empty': {
      users: 0,
      products: 0,
      orders: 0,
      categories: false,
      clearExisting: true,
      lowStock: false,
      orderPattern: 'normal',
    },
    'minimal': {
      users: 5,
      products: 10,
      orders: 5,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'normal',
    },
    'development': {
      users: 20,
      products: 50,
      orders: 100,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'normal',
    },
    'demo': {
      users: 50,
      products: 100,
      orders: 300,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'realistic',
    },
    'stress': {
      users: 200,
      products: 500,
      orders: 2000,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'random',
    },
    'low-stock': {
      users: 15,
      products: 30,
      orders: 50,
      categories: true,
      clearExisting: false,
      lowStock: true,
      orderPattern: 'normal',
    },
    'holiday-rush': {
      users: 100,
      products: 75,
      orders: 500,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'rush',
    },
    'new-store': {
      users: 10,
      products: 100,
      orders: 5,
      categories: true,
      clearExisting: false,
      lowStock: false,
      orderPattern: 'sparse',
    },
  }

  return configs[preset as keyof typeof configs] || configs.minimal
}

// Clear test data (keeps structure)
async function clearTestData(supabase: SupabaseClient): Promise<void> {
  // Delete in order to respect foreign key constraints
  await supabase.from('order_items').delete().neq('id', 0)
  await supabase.from('orders').delete().neq('id', 0)
  await supabase.from('cart_items').delete().neq('id', 0)
  await supabase.from('carts').delete().neq('id', 0)
  await supabase.from('addresses').delete().neq('id', 0)
  await supabase.from('inventory_logs').delete().neq('id', 0)
  await supabase.from('products').delete().neq('id', 0)
  await supabase.from('categories').delete().neq('id', 0)

  // Delete user profiles (Supabase auth users will remain)
  await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
}

// Seed categories
async function seedCategories(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('categories')
    .upsert(categoryData, { onConflict: 'slug' })
    .select()

  if (error) {
    console.error('Failed to seed categories:', error)
    return 0
  }

  return data?.length || 0
}

// Seed products
async function seedProducts(supabase: SupabaseClient, count: number, lowStock: boolean): Promise<number> {
  // Get category IDs
  const { data: categories } = await supabase.from('categories').select('id, slug')
  const categoryMap = new Map(categories?.map((c: any) => [c.slug, c.id]))

  const products = []

  for (let i = 0; i < count; i++) {
    const template = productTemplates[i % productTemplates.length]
    if (!template) continue // Skip if template is undefined

    const price = Math.random() * (template.priceMax - template.priceMin) + template.priceMin
    const stockQty = lowStock
      ? Math.floor(Math.random() * 5) // 0-4 for low stock
      : Math.floor(Math.random() * 100) + 10

    products.push({
      sku: `PROD-${Date.now()}-${i}`,
      category_id: categoryMap.get(template.category),
      name_translations: {
        en: `${template.name} #${i + 1}`,
        es: `${template.name} #${i + 1}`,
        ro: `${template.name} #${i + 1}`,
        ru: `${template.name} #${i + 1}`,
      },
      description_translations: template.descriptions,
      price_eur: Math.round(price * 100) / 100,
      stock_quantity: stockQty,
      low_stock_threshold: 5,
      reorder_point: 10,
      is_active: true,
    })
  }

  const { data, error } = await supabase
    .from('products')
    .insert(products)
    .select()

  if (error) {
    console.error('Failed to seed products:', error)
    return 0
  }

  return data?.length || 0
}

// Seed users
async function seedUsers(supabase: SupabaseClient, count: number): Promise<string[]> {
  const userIds: string[] = []

  for (let i = 0; i < count; i++) {
    const mockUser = generateMockUser()
    const password = generatePassword()

    try {
      const { data } = await supabase.auth.admin.createUser({
        email: mockUser.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: mockUser.name,
          preferred_language: mockUser.preferredLanguage,
        },
      })

      if (data?.user) {
        userIds.push(data.user.id)

        // Create profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: mockUser.name,
          phone: mockUser.phone,
          role: 'customer',
          preferred_language: mockUser.preferredLanguage,
        })
      }
    }
    catch (error: any) {
      console.error(`Failed to create user ${mockUser.email}:`, error)
    }
  }

  return userIds
}

// Seed orders
async function seedOrders(
  supabase: SupabaseClient,
  count: number,
  userIds: string[],
  pattern: string,
): Promise<number> {
  const { data: products } = await supabase.from('products').select('id, sku, name_translations, price_eur').limit(50)

  type Product = {
    id: string
    sku: string
    name_translations: Record<string, string>
    price_eur: number
  }

  if (!products || products.length === 0) {
    console.warn('No products available for order creation')
    return 0
  }

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
  const paymentStatuses = ['paid', 'pending', 'failed']
  let createdCount = 0

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)]
    if (!userId) continue

    const product = products[Math.floor(Math.random() * products.length)] as Product | undefined
    if (!product) continue

    const quantity = Math.floor(Math.random() * 3) + 1
    const subtotal = product.price_eur * quantity
    const shippingCost = 5.99
    const tax = subtotal * 0.19
    const total = subtotal + shippingCost + tax

    // Adjust date based on pattern
    const daysAgo = pattern === 'rush'
      ? Math.floor(Math.random() * 7) // Last week for rush
      : pattern === 'sparse'
        ? Math.floor(Math.random() * 180) // Last 6 months for sparse
        : Math.floor(Math.random() * 30) // Last month for normal

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - daysAgo)

    const order = {
      order_number: `ORD-${Date.now()}-${i}`,
      user_id: userId,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      payment_method: 'stripe',
      payment_status: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      subtotal_eur: subtotal,
      shipping_cost_eur: shippingCost,
      tax_eur: tax,
      total_eur: total,
      shipping_address: {
        street: 'Test Street 123',
        city: 'Chisinau',
        postalCode: 'MD-2001',
        country: 'Moldova',
      },
      billing_address: {
        street: 'Test Street 123',
        city: 'Chisinau',
        postalCode: 'MD-2001',
        country: 'Moldova',
      },
      created_at: createdAt.toISOString(),
    }

    const { data: insertedOrder } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (insertedOrder && product) {
      await supabase.from('order_items').insert({
        order_id: insertedOrder.id,
        product_id: product.id,
        product_snapshot: {
          name: product.name_translations?.en || 'Unknown',
          sku: product.sku,
          nameTranslations: product.name_translations,
        },
        quantity,
        price_eur: product.price_eur,
        total_eur: product.price_eur * quantity,
      })

      createdCount++
    }
  }

  return createdCount
}
