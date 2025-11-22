/**
 * Admin Dashboard Recent Activity API Endpoint
 *
 * Requirements addressed:
 * - 3.1: Display recent system activities for dashboard overview
 * - 6.4: Real-time data refresh functionality
 *
 * Returns recent activities including:
 * - New user registrations
 * - Recent orders
 * - Product updates
 * - Low stock alerts
 *
 * Performance:
 * - Cached for 30 seconds to balance freshness and performance
 * - Cache invalidated on user/order/product mutations
 */

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { ADMIN_CACHE_CONFIG, getAdminCacheKey } from '~/server/utils/adminCache'

export interface ActivityItem {
  id: string
  type: 'user_registration' | 'new_order' | 'low_stock' | 'product_update'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event) => {
  try {
    // Require admin authentication
    await requireAdminRole(event)

    const supabase = await serverSupabaseClient(event)

    const activities: ActivityItem[] = []
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, name, created_at')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    if (!usersError && recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user_${user.id}`,
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.name || 'New user'} joined the platform`,
          timestamp: user.created_at,
          metadata: { userId: user.id, userName: user.name }
        })
      })
    }

    // Get recent orders
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id, order_number, total_eur, created_at, status')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(5)

    if (!ordersError && recentOrders) {
      recentOrders.forEach(order => {
        activities.push({
          id: `order_${order.id}`,
          type: 'new_order',
          title: 'New Order',
          description: `Order ${order.order_number} for €${order.total_eur}`,
          timestamp: order.created_at,
          metadata: { 
            orderId: order.id, 
            orderNumber: order.order_number,
            total: order.total_eur,
            status: order.status
          }
        })
      })
    }

    // Get low stock products
    const { data: lowStockProducts, error: stockError } = await supabase
      .from('products')
      .select('id, name_translations, stock_quantity, low_stock_threshold, updated_at')
      .lte('stock_quantity', 5) // Products with 5 or fewer items
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true })
      .limit(5)

    if (!stockError && lowStockProducts) {
      lowStockProducts.forEach(product => {
        const productName = product.name_translations?.es || product.name_translations?.en || 'Unknown Product'
        activities.push({
          id: `stock_${product.id}`,
          type: 'low_stock',
          title: 'Low Stock Alert',
          description: `${productName} has only ${product.stock_quantity} items left`,
          timestamp: product.updated_at,
          metadata: { 
            productId: product.id, 
            productName,
            stockQuantity: product.stock_quantity,
            threshold: product.low_stock_threshold
          }
        })
      })
    }

    // Get recently updated products
    const { data: updatedProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name_translations, updated_at')
      .gte('updated_at', twentyFourHoursAgo.toISOString())
      .order('updated_at', { ascending: false })
      .limit(3)

    if (!productsError && updatedProducts) {
      updatedProducts.forEach(product => {
        const productName = product.name_translations?.es || product.name_translations?.en || 'Unknown Product'
        activities.push({
          id: `product_${product.id}`,
          type: 'product_update',
          title: 'Product Updated',
          description: `${productName} was recently modified`,
          timestamp: product.updated_at,
          metadata: { 
            productId: product.id, 
            productName
          }
        })
      })
    }

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limit to 10 most recent activities
    const recentActivities = activities.slice(0, 10)

    return {
      success: true,
      data: recentActivities
    }

  } catch (error) {
    console.error('Dashboard activity error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})