/**
 * Database Cleanup Utilities
 * POST /api/admin/cleanup
 *
 * Options:
 * - action: 'clear-all' | 'clear-test-users' | 'clear-orders' | 'clear-products' | 'reset-database'
 * - confirm: true (required for safety)
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdminTestingAccess, logAdminAction } from '~/server/utils/adminAuth'

interface CleanupOptions {
  action: 'clear-all' | 'clear-test-users' | 'clear-orders' | 'clear-products' | 'reset-database' | 'clear-old-carts'
  confirm?: boolean
  daysOld?: number // For clearing old data
}

export default defineEventHandler(async (event) => {
  // Verify admin access and non-production environment
  const adminId = await requireAdminTestingAccess(event)

  const supabase = serverSupabaseServiceRole(event)
  const body = await readBody(event).catch(() => ({})) as CleanupOptions

  // Safety check
  if (!body.confirm) {
    return {
      success: false,
      message: 'Confirmation required. Set confirm: true to proceed.',
      warning: 'This operation will delete data permanently!',
    }
  }

  const action = body.action
  const results = {
    action,
    timestamp: new Date().toISOString(),
    deletedCounts: {} as Record<string, number>,
    errors: [] as string[],
  }

  try {
    switch (action) {
      case 'clear-all':
        await clearAllTestData(supabase, results)
        break

      case 'clear-test-users':
        await clearTestUsers(supabase, results)
        break

      case 'clear-orders':
        await clearOrders(supabase, results)
        break

      case 'clear-products':
        await clearProducts(supabase, results)
        break

      case 'clear-old-carts':
        await clearOldCarts(supabase, results, body.daysOld || 7)
        break

      case 'reset-database':
        await resetDatabase(supabase, results)
        break

      default:
        return {
          success: false,
          message: 'Invalid action specified',
          validActions: ['clear-all', 'clear-test-users', 'clear-orders', 'clear-products', 'reset-database', 'clear-old-carts'],
        }
    }

    // Log admin action
    await logAdminAction(event, adminId, 'cleanup', {
      action,
      deletedCounts: results.deletedCounts,
    })

    return {
      success: true,
      message: `Successfully completed ${action}`,
      results,
    }
  }
  catch (error: any) {
    console.error('Cleanup error:', error)
    await logAdminAction(event, adminId, 'cleanup-failed', { action, error: error.message })
    return {
      success: false,
      message: 'Cleanup failed',
      error: error.message,
      results,
    }
  }
})

// Clear all test data (orders, products, test users)
async function clearAllTestData(supabase: SupabaseClient, results: any) {
  await clearOrders(supabase, results)
  await clearProducts(supabase, results)
  await clearTestUsers(supabase, results)
  await clearOldCarts(supabase, results, 0) // Clear all carts
}

// Clear test users (emails containing 'test', 'demo', 'example')
async function clearTestUsers(supabase: SupabaseClient, results: any) {
  try {
    // Get test users from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      results.errors.push(`Failed to list users: ${authError.message}`)
      return
    }

    const testUserIds = authUsers.users
      .filter((u: any) =>
        u.email.includes('test')
        || u.email.includes('demo')
        || u.email.includes('example')
        || u.email.includes('@testuser.md'),
      )
      .map((u: any) => u.id)

    // Delete related data first
    if (testUserIds.length > 0) {
      // Delete addresses
      await supabase
        .from('addresses')
        .delete()
        .in('user_id', testUserIds)

      // Delete orders (cascade will handle order_items)
      await supabase
        .from('orders')
        .delete()
        .in('user_id', testUserIds)

      // Delete carts
      await supabase
        .from('carts')
        .delete()
        .in('user_id', testUserIds)

      // Delete profiles
      await supabase
        .from('profiles')
        .delete()
        .in('id', testUserIds)

      // Delete from auth (this is the final step)
      let deletedCount = 0
      for (const userId of testUserIds) {
        const { error } = await supabase.auth.admin.deleteUser(userId)
        if (!error) deletedCount++
      }

      results.deletedCounts.testUsers = deletedCount
    }
    else {
      results.deletedCounts.testUsers = 0
    }
  }
  catch (error: any) {
    results.errors.push(`Error clearing test users: ${error.message}`)
  }
}

// Clear all orders and order items
async function clearOrders(supabase: SupabaseClient, results: any) {
  try {
    // Count before deletion
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Delete order items first (though cascade should handle it)
    await supabase.from('order_items').delete().neq('id', 0)

    // Delete orders
    const { error } = await supabase.from('orders').delete().neq('id', 0)

    if (error) {
      results.errors.push(`Failed to delete orders: ${error.message}`)
    }
    else {
      results.deletedCounts.orders = orderCount || 0
    }
  }
  catch (error: any) {
    results.errors.push(`Error clearing orders: ${error.message}`)
  }
}

// Clear all products, inventory logs, and cart items
async function clearProducts(supabase: SupabaseClient, results: any) {
  try {
    // Count before deletion
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    // Delete related data
    await supabase.from('cart_items').delete().neq('id', 0)
    await supabase.from('inventory_logs').delete().neq('id', 0)

    // Delete products
    const { error } = await supabase.from('products').delete().neq('id', 0)

    if (error) {
      results.errors.push(`Failed to delete products: ${error.message}`)
    }
    else {
      results.deletedCounts.products = productCount || 0
    }
  }
  catch (error: any) {
    results.errors.push(`Error clearing products: ${error.message}`)
  }
}

// Clear old/expired carts
async function clearOldCarts(supabase: SupabaseClient, results: any, daysOld: number) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // Count before deletion
    const { count } = await supabase
      .from('carts')
      .select('*', { count: 'exact', head: true })
      .lt('updated_at', cutoffDate.toISOString())

    // Delete cart items first
    const { data: oldCarts } = await supabase
      .from('carts')
      .select('id')
      .lt('updated_at', cutoffDate.toISOString())

    if (oldCarts && oldCarts.length > 0) {
      const cartIds = oldCarts.map(c => c.id)

      await supabase
        .from('cart_items')
        .delete()
        .in('cart_id', cartIds)

      // Delete carts
      await supabase
        .from('carts')
        .delete()
        .in('id', cartIds)
    }

    results.deletedCounts.carts = count || 0
  }
  catch (error: any) {
    results.errors.push(`Error clearing old carts: ${error.message}`)
  }
}

// Full database reset (clear everything, keep structure)
async function resetDatabase(supabase: SupabaseClient, results: any) {
  try {
    const tables = [
      'order_items',
      'orders',
      'cart_items',
      'carts',
      'addresses',
      'inventory_logs',
      'products',
      'categories',
    ]

    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      await supabase.from(table).delete().neq('id', 0)

      results.deletedCounts[table] = count || 0
    }

    // Clear all users
    await clearTestUsers(supabase, results)

    results.message = 'Database reset to empty state'
  }
  catch (error: any) {
    results.errors.push(`Error resetting database: ${error.message}`)
  }
}
