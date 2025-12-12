/**
 * Admin Analytics Overview API Endpoint
 *
 * Requirements addressed:
 * - 3.1: Display key metrics including total users, active users, page views, and conversion rates
 * - 3.2: Update analytics data based on selected date range
 * - 3.6: Display appropriate loading states or error messages when analytics data is unavailable
 *
 * Returns comprehensive analytics overview including:
 * - Daily analytics aggregation
 * - Key performance indicators
 * - Trend analysis
 * - Conversion metrics
 *
 * Performance:
 * - Cached for 5 minutes (complex aggregations)
 * - Separate cache per date range selection
 * - Cache invalidated on order/user mutations
 */

import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdminRole } from '~/server/utils/adminAuth'

export interface AnalyticsOverview {
  dailyAnalytics: Array<{
    date: string
    totalUsers: number
    activeUsers: number
    newRegistrations: number
    pageViews: number
    uniqueVisitors: number
    ordersCount: number
    revenue: number
  }>
  kpis: {
    totalUsers: number
    activeUsers: number
    totalRevenue: number
    conversionRate: number
    avgOrderValue: number
    userGrowthRate: number
    revenueGrowthRate: number
  }
  trends: {
    userGrowth: 'up' | 'down' | 'stable'
    revenueGrowth: 'up' | 'down' | 'stable'
    activityGrowth: 'up' | 'down' | 'stable'
  }
  dateRange: {
    startDate: string
    endDate: string
    totalDays: number
  }
}

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Verify admin access
    const supabase = await serverSupabaseClient(event)

    // Parse query parameters
    const query = getQuery(event)
    const days = parseInt(query.days as string) || 30
    const startDate = query.startDate as string
    const endDate = query.endDate as string

    let actualStartDate: Date
    let actualEndDate: Date

    if (startDate && endDate) {
      actualStartDate = new Date(startDate)
      actualEndDate = new Date(endDate)
    }
    else {
      actualEndDate = new Date()
      actualStartDate = new Date()
      actualStartDate.setDate(actualStartDate.getDate() - days)
    }

    // Get daily analytics data
    const { data: dailyAnalytics, error: analyticsError } = await supabase
      .from('daily_analytics')
      .select('*')
      .gte('date', actualStartDate.toISOString().split('T')[0])
      .lte('date', actualEndDate.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (analyticsError) {
      console.error('Daily analytics error:', analyticsError)
    }

    // If no daily analytics data exists, create it from raw data
    let processedDailyAnalytics = dailyAnalytics || []

    if (!dailyAnalytics || dailyAnalytics.length === 0) {
      // Generate analytics from existing data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', actualStartDate.toISOString())
        .lte('created_at', actualEndDate.toISOString())

      const { data: orders } = await supabase
        .from('orders')
        .select('created_at, total_eur, status')
        .gte('created_at', actualStartDate.toISOString())
        .lte('created_at', actualEndDate.toISOString())
        .neq('status', 'cancelled')

      // Group data by date
      const dateMap = new Map()

      // Initialize all dates in range
      const currentDate = new Date(actualStartDate)
      while (currentDate <= actualEndDate) {
        const dateStr = currentDate.toISOString().split('T')[0]
        dateMap.set(dateStr, {
          date: dateStr,
          totalUsers: 0,
          activeUsers: 0,
          newRegistrations: 0,
          pageViews: 0,
          uniqueVisitors: 0,
          ordersCount: 0,
          revenue: 0,
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Process profiles
      if (profiles) {
        profiles.forEach((profile) => {
          const dateStr = profile.created_at.split('T')[0]
          if (dateMap.has(dateStr)) {
            dateMap.get(dateStr).newRegistrations++
          }
        })
      }

      // Process orders
      if (orders) {
        orders.forEach((order) => {
          const dateStr = order.created_at.split('T')[0]
          if (dateMap.has(dateStr)) {
            const dayData = dateMap.get(dateStr)
            dayData.ordersCount++
            dayData.revenue += parseFloat(order.total_eur.toString())
          }
        })
      }

      processedDailyAnalytics = Array.from(dateMap.values())
    }

    // Calculate KPIs
    const totalUsers = processedDailyAnalytics.reduce((sum, day) =>
      Math.max(sum, day.totalUsers || 0), 0)

    const totalActiveUsers = processedDailyAnalytics.reduce((sum, day) =>
      sum + (day.activeUsers || 0), 0)

    const totalRevenue = processedDailyAnalytics.reduce((sum, day) =>
      sum + (day.revenue || 0), 0)

    const totalOrders = processedDailyAnalytics.reduce((sum, day) =>
      sum + (day.ordersCount || 0), 0)

    // Calculate conversion rate (orders / total users)
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth rates (compare first half vs second half of period)
    const midPoint = Math.floor(processedDailyAnalytics.length / 2)
    const firstHalf = processedDailyAnalytics.slice(0, midPoint)
    const secondHalf = processedDailyAnalytics.slice(midPoint)

    const firstHalfUsers = firstHalf.reduce((sum, day) => sum + (day.newRegistrations || 0), 0)
    const secondHalfUsers = secondHalf.reduce((sum, day) => sum + (day.newRegistrations || 0), 0)
    const userGrowthRate = firstHalfUsers > 0
      ? ((secondHalfUsers - firstHalfUsers) / firstHalfUsers) * 100
      : 0

    const firstHalfRevenue = firstHalf.reduce((sum, day) => sum + (day.revenue || 0), 0)
    const secondHalfRevenue = secondHalf.reduce((sum, day) => sum + (day.revenue || 0), 0)
    const revenueGrowthRate = firstHalfRevenue > 0
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
      : 0

    // Determine trends
    const getTrend = (rate: number) => {
      if (rate > 5) return 'up'
      if (rate < -5) return 'down'
      return 'stable'
    }

    const firstHalfActivity = firstHalf.reduce((sum, day) => sum + (day.activeUsers || 0), 0)
    const secondHalfActivity = secondHalf.reduce((sum, day) => sum + (day.activeUsers || 0), 0)
    const activityGrowthRate = firstHalfActivity > 0
      ? ((secondHalfActivity - firstHalfActivity) / firstHalfActivity) * 100
      : 0

    const overview: AnalyticsOverview = {
      dailyAnalytics: processedDailyAnalytics,
      kpis: {
        totalUsers,
        activeUsers: Math.round(totalActiveUsers / Math.max(processedDailyAnalytics.length, 1)),
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        revenueGrowthRate: Math.round(revenueGrowthRate * 100) / 100,
      },
      trends: {
        userGrowth: getTrend(userGrowthRate),
        revenueGrowth: getTrend(revenueGrowthRate),
        activityGrowth: getTrend(activityGrowthRate),
      },
      dateRange: {
        startDate: actualStartDate.toISOString().split('T')[0],
        endDate: actualEndDate.toISOString().split('T')[0],
        totalDays: Math.ceil((actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)),
      },
    }

    return {
      success: true,
      data: overview,
    }
  }
  catch (error: any) {
    console.error('Analytics overview error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analytics overview',
    })
  }
})
