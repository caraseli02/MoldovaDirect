/**
 * Order Cleanup Utility
 *
 * Cleans up test orders created during E2E tests to keep the database clean.
 * Should be run after test suites complete.
 *
 * Usage:
 * - In test teardown: await cleanupTestOrders()
 * - Manually: npx tsx tests/fixtures/order-cleanup.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Test email patterns to identify test orders
const TEST_EMAIL_PATTERNS = [
  'test@example.com',
  'teste2e@example.com',
  'test-visual@example.com',
  'test-visual-mobile@example.com',
  'test-visual-tablet@example.com',
  'test-en@example.com',
  'test-es@example.com',
  'test-ro@example.com',
  'test-ru@example.com',
  'test-summary@example.com',
  'guest.test@example.com',
  'caraseli02@gmail.com', // Hardcoded test email
]

// Order ID patterns to identify test orders
const TEST_ORDER_ID_PATTERNS = [
  /^test_/i,
  /^e2e_/i,
  /^visual_/i,
]

interface CleanupOptions {
  dryRun?: boolean
  olderThanHours?: number
  verbose?: boolean
}

/**
 * Clean up test orders from the database
 */
export async function cleanupTestOrders(options: CleanupOptions = {}) {
  const {
    dryRun = false,
    olderThanHours = 24, // Only delete orders older than 24 hours by default
    verbose = true,
  } = options

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials')
    console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  if (verbose) {
    console.log('🧹 Starting test order cleanup...')
    console.log(`   Dry run: ${dryRun}`)
    console.log(`   Delete orders older than: ${olderThanHours} hours`)
  }

  try {
    // Calculate cutoff date
    const cutoffDate = new Date()
    cutoffDate.setHours(cutoffDate.getHours() - olderThanHours)
    const cutoffISO = cutoffDate.toISOString()

    // Find test orders by email
    const { data: ordersByEmail, error: emailError } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, created_at, total')
      .in('customer_email', TEST_EMAIL_PATTERNS)
      .lt('created_at', cutoffISO)

    if (emailError) {
      throw emailError
    }

    // Find test orders by order ID pattern
    const { data: allRecentOrders, error: allOrdersError } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, created_at, total')
      .lt('created_at', cutoffISO)
      .limit(1000)

    if (allOrdersError) {
      throw allOrdersError
    }

    // Filter orders matching test patterns
    const ordersByPattern = (allRecentOrders || []).filter(order =>
      TEST_ORDER_ID_PATTERNS.some(pattern => pattern.test(order.order_number || '')),
    )

    // Combine and deduplicate
    const allTestOrders = Array.from(
      new Map(
        [...(ordersByEmail || []), ...ordersByPattern].map(order => [order.id, order]),
      ).values(),
    )

    if (verbose) {
      console.log(`\n📊 Found ${allTestOrders.length} test orders to clean up:`)
      allTestOrders.forEach((order) => {
        console.log(`   - ${order.order_number} (${order.customer_email}) - ${order.total} - ${new Date(order.created_at).toLocaleString()}`)
      })
    }

    if (allTestOrders.length === 0) {
      console.log('✅ No test orders found to clean up')
      return
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN - No orders were deleted')
      console.log(`   To delete these orders, run without --dry-run flag`)
      return
    }

    // Delete order items first (foreign key constraint)
    const orderIds = allTestOrders.map(o => o.id)

    if (verbose) {
      console.log('\n🗑️  Deleting order items...')
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .in('order_id', orderIds)

    if (itemsError) {
      console.warn('⚠️  Error deleting order items:', itemsError.message)
    }

    if (verbose) {
      console.log('🗑️  Deleting orders...')
    }

    // Delete orders
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .in('id', orderIds)

    if (ordersError) {
      throw ordersError
    }

    console.log(`\n✅ Successfully deleted ${allTestOrders.length} test orders`)
  }
  catch (error: any) {
    console.error('❌ Error during cleanup:', error.message)
    throw error
  }
}

/**
 * Clean up a specific order by ID or order number
 */
export async function cleanupOrderById(orderIdOrNumber: string) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials')
    return
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  console.log(`🗑️  Deleting order: ${orderIdOrNumber}`)

  try {
    // Try to find order by ID or order_number
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('id, order_number')
      .or(`id.eq.${orderIdOrNumber},order_number.eq.${orderIdOrNumber}`)

    if (findError) {
      throw findError
    }

    if (!orders || orders.length === 0) {
      console.log('❌ Order not found')
      return
    }

    const order = orders[0]

    // Delete order items first
    await supabase
      .from('order_items')
      .delete()
      .eq('order_id', order.id)

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', order.id)

    if (deleteError) {
      throw deleteError
    }

    console.log(`✅ Successfully deleted order: ${order.order_number}`)
  }
  catch (error: any) {
    console.error('❌ Error deleting order:', error.message)
    throw error
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const isDryRun = args.includes('--dry-run')
  const olderThanHours = args.includes('--hours')
    ? Number.parseInt(args[args.indexOf('--hours') + 1] || '24')
    : 24

  cleanupTestOrders({
    dryRun: isDryRun,
    olderThanHours,
    verbose: true,
  })
    .then(() => {
      console.log('\n✨ Cleanup complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Cleanup failed:', error)
      process.exit(1)
    })
}
