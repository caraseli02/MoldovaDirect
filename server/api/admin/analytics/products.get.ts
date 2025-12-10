/**
 * Admin Product Analytics API Endpoint
 *
 * Requirements addressed:
 * - 3.4: Show most viewed products, best-selling items, and products with high cart abandonment
 * - 3.5: Display funnel analysis from product view to purchase completion
 *
 * Returns product analytics data including:
 * - Most viewed products
 * - Best-selling products
 * - Conversion funnel analysis
 * - Product performance metrics
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export interface ProductAnalyticsData {
  mostViewedProducts: Array<{
    productId: number
    productName: string
    price: number
    totalViews: number
    viewsGrowth: number
  }>
  bestSellingProducts: Array<{
    productId: number
    productName: string
    price: number
    totalSales: number
    totalRevenue: number
    salesGrowth: number
  }>
  conversionFunnel: {
    totalViews: number
    totalCartAdditions: number
    totalPurchases: number
    viewToCartRate: number
    cartToPurchaseRate: number
    overallConversionRate: number
  }
  productPerformance: Array<{
    productId: number
    productName: string
    price: number
    views: number
    cartAdditions: number
    purchases: number
    revenue: number
    viewToCartRate: number
    cartToPurchaseRate: number
    conversionRate: number
  }>
  abandonmentAnalysis: Array<{
    productId: number
    productName: string
    cartAdditions: number
    purchases: number
    abandonmentRate: number
  }>
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Verify admin access
    const supabase = await serverSupabaseClient(event)

    // Parse query parameters
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const limit = parseInt(query.limit as string) || 10
    const startDate = query.startDate as string
    const endDate = query.endDate as string

    let dateFilter = ''
    let actualStartDate: Date
    let actualEndDate: Date

    if (startDate && endDate) {
      actualStartDate = new Date(startDate)
      actualEndDate = new Date(endDate)
      dateFilter = `AND pa.date BETWEEN '${startDate}' AND '${endDate}'`
    }
    else {
      actualEndDate = new Date()
      actualStartDate = new Date()
      actualStartDate.setDate(actualStartDate.getDate() - days)
      dateFilter = `AND pa.date >= '${actualStartDate.toISOString().split('T')[0]}'`
    }

    // Get product performance summary from view
    const { data: productPerformance, error: performanceError } = await supabase
      .from('product_performance_summary')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(limit * 2) // Get more data for filtering

    if (performanceError) {
      console.error('Product performance error:', performanceError)
    }

    // If view doesn't exist, fall back to manual calculation
    let processedPerformance = productPerformance || []

    if (!productPerformance || productPerformance.length === 0) {
      // Manual calculation from product_analytics table
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('product_analytics')
        .select(`
          product_id,
          SUM(views) as total_views,
          SUM(cart_additions) as total_cart_additions,
          SUM(purchases) as total_purchases,
          SUM(revenue) as total_revenue,
          products!inner(name_translations, price_eur, is_active)
        `)
        .gte('date', actualStartDate.toISOString().split('T')[0])
        .lte('date', actualEndDate.toISOString().split('T')[0])
        .eq('products.is_active', true)
        .group('product_id, products.name_translations, products.price_eur, products.is_active')
        .order('total_revenue', { ascending: false })
        .limit(limit * 2)

      if (!analyticsError && analyticsData) {
        processedPerformance = analyticsData.map(item => ({
          id: item.product_id,
          name_translations: item.products.name_translations,
          price_eur: item.products.price_eur,
          total_views: item.total_views || 0,
          total_cart_additions: item.total_cart_additions || 0,
          total_purchases: item.total_purchases || 0,
          total_revenue: item.total_revenue || 0,
          view_to_cart_rate: item.total_views > 0
            ? Math.round((item.total_cart_additions / item.total_views) * 100 * 100) / 100
            : 0,
          cart_to_purchase_rate: item.total_cart_additions > 0
            ? Math.round((item.total_purchases / item.total_cart_additions) * 100 * 100) / 100
            : 0,
        }))
      }
    }

    // Process most viewed products
    const mostViewedProducts = processedPerformance
      .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
      .slice(0, limit)
      .map(product => ({
        productId: product.id,
        productName: product.name_translations?.es || product.name_translations?.en || 'Unknown Product',
        price: parseFloat(product.price_eur?.toString() || '0'),
        totalViews: product.total_views || 0,
        viewsGrowth: 0, // TODO: Calculate growth rate
      }))

    // Process best selling products
    const bestSellingProducts = processedPerformance
      .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
      .slice(0, limit)
      .map(product => ({
        productId: product.id,
        productName: product.name_translations?.es || product.name_translations?.en || 'Unknown Product',
        price: parseFloat(product.price_eur?.toString() || '0'),
        totalSales: product.total_purchases || 0,
        totalRevenue: product.total_revenue || 0,
        salesGrowth: 0, // TODO: Calculate growth rate
      }))

    // Calculate conversion funnel
    const totalViews = processedPerformance.reduce((sum, p) => sum + (p.total_views || 0), 0)
    const totalCartAdditions = processedPerformance.reduce((sum, p) => sum + (p.total_cart_additions || 0), 0)
    const totalPurchases = processedPerformance.reduce((sum, p) => sum + (p.total_purchases || 0), 0)

    const viewToCartRate = totalViews > 0 ? (totalCartAdditions / totalViews) * 100 : 0
    const cartToPurchaseRate = totalCartAdditions > 0 ? (totalPurchases / totalCartAdditions) * 100 : 0
    const overallConversionRate = totalViews > 0 ? (totalPurchases / totalViews) * 100 : 0

    const conversionFunnel = {
      totalViews,
      totalCartAdditions,
      totalPurchases,
      viewToCartRate: Math.round(viewToCartRate * 100) / 100,
      cartToPurchaseRate: Math.round(cartToPurchaseRate * 100) / 100,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
    }

    // Process detailed product performance
    const detailedProductPerformance = processedPerformance
      .slice(0, limit)
      .map(product => ({
        productId: product.id,
        productName: product.name_translations?.es || product.name_translations?.en || 'Unknown Product',
        price: parseFloat(product.price_eur?.toString() || '0'),
        views: product.total_views || 0,
        cartAdditions: product.total_cart_additions || 0,
        purchases: product.total_purchases || 0,
        revenue: product.total_revenue || 0,
        viewToCartRate: product.view_to_cart_rate || 0,
        cartToPurchaseRate: product.cart_to_purchase_rate || 0,
        conversionRate: product.total_views > 0
          ? Math.round(((product.total_purchases || 0) / product.total_views) * 100 * 100) / 100
          : 0,
      }))

    // Calculate abandonment analysis
    const abandonmentAnalysis = processedPerformance
      .filter(p => (p.total_cart_additions || 0) > 0)
      .map((product) => {
        const cartAdditions = product.total_cart_additions || 0
        const purchases = product.total_purchases || 0
        const abandonmentRate = cartAdditions > 0
          ? ((cartAdditions - purchases) / cartAdditions) * 100
          : 0

        return {
          productId: product.id,
          productName: product.name_translations?.es || product.name_translations?.en || 'Unknown Product',
          cartAdditions,
          purchases,
          abandonmentRate: Math.round(abandonmentRate * 100) / 100,
        }
      })
      .sort((a, b) => b.abandonmentRate - a.abandonmentRate)
      .slice(0, limit)

    const analyticsData: ProductAnalyticsData = {
      mostViewedProducts,
      bestSellingProducts,
      conversionFunnel,
      productPerformance: detailedProductPerformance,
      abandonmentAnalysis,
    }

    return {
      success: true,
      data: analyticsData,
    }
  }
  catch (error) {
    console.error('Product analytics error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product analytics',
    })
  }
})
