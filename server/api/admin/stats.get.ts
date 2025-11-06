/**
 * Database Statistics API
 * GET /api/admin/stats
 *
 * Returns current database statistics for the admin testing dashboard
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import type { DatabaseStats } from '~/types/admin-testing'

export default defineEventHandler(async (event) => {
  // Verify admin access
  await requireAdminRole(event)

  const supabase = serverSupabaseServiceRole(event)

  try {
    // Get counts in parallel for better performance
    const [
      usersCount,
      testUsersCount,
      productsCount,
      lowStockCount,
      ordersCount,
      recentOrdersCount,
      categoriesCount,
      activeCartsCount,
      revenueData
    ] = await Promise.all([
      // Total users
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),

      // Test users (with test/demo/example emails)
      supabase.auth.admin.listUsers().then(({ data }) => {
        if (!data) return 0
        return data.users.filter((u: any) =>
          u.email?.includes('test') ||
          u.email?.includes('demo') ||
          u.email?.includes('example') ||
          u.email?.includes('@testuser.md')
        ).length
      }),

      // Total products
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true }),

      // Low stock products
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', 5),

      // Total orders
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),

      // Recent orders (last 7 days)
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

      // Categories
      supabase
        .from('categories')
        .select('*', { count: 'exact', head: true }),

      // Active carts (updated in last 24 hours)
      supabase
        .from('carts')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),

      // Total revenue from paid orders
      supabase
        .from('orders')
        .select('total_eur')
        .eq('payment_status', 'paid')
    ])

    // Calculate total revenue
    const totalRevenue = revenueData.data?.reduce(
      (sum: number, order: any) => sum + (order.total_eur || 0),
      0
    ) || 0

    const stats: DatabaseStats = {
      users: usersCount.count || 0,
      testUsers: testUsersCount || 0,
      products: productsCount.count || 0,
      lowStockProducts: lowStockCount.count || 0,
      orders: ordersCount.count || 0,
      recentOrders: recentOrdersCount.count || 0,
      categories: categoriesCount.count || 0,
      activeCarts: activeCartsCount.count || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      lastUpdated: new Date().toISOString()
    }

    return {
      success: true,
      stats
    }

  } catch (error: any) {
    console.error('Failed to fetch database stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch database statistics',
      data: { error: error.message }
    })
  }
})
