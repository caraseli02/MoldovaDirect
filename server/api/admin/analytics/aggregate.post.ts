/**
 * Admin Analytics Aggregation API Endpoint
 *
 * Requirements addressed:
 * - 3.1: Implement daily analytics aggregation system for user metrics
 * - 3.3: Build database views for efficient analytics data retrieval
 *
 * Triggers analytics data aggregation for specified date ranges.
 * This endpoint can be called manually or scheduled to run daily.
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export interface AggregationRequest {
  startDate?: string
  endDate?: string
  forceRefresh?: boolean
}

export interface AggregationResult {
  datesProcessed: string[]
  recordsCreated: number
  recordsUpdated: number
  errors: string[]
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Verify admin access
    const supabase = await serverSupabaseClient(event)

    const body = await readBody(event) as AggregationRequest
    const { startDate, endDate, forceRefresh = false } = body

    let actualStartDate: Date
    let actualEndDate: Date

    if (startDate && endDate) {
      actualStartDate = new Date(startDate)
      actualEndDate = new Date(endDate)
    }
    else {
      // Default to last 7 days
      actualEndDate = new Date()
      actualStartDate = new Date()
      actualStartDate.setDate(actualStartDate.getDate() - 7)
    }

    const result: AggregationResult = {
      datesProcessed: [],
      recordsCreated: 0,
      recordsUpdated: 0,
      errors: [],
    }

    // Process each date in the range
    const currentDate = new Date(actualStartDate)
    while (currentDate <= actualEndDate) {
      const dateStr = currentDate.toISOString().split('T')[0] as string

      try {
        // Check if data already exists for this date
        const { data: existingData, error: checkError } = await supabase
          .from('daily_analytics')
          .select('date')
          .eq('date', dateStr)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // Error other than "not found"
          result.errors.push(`Error checking existing data for ${dateStr}: ${checkError.message}`)
          currentDate.setDate(currentDate.getDate() + 1)
          continue
        }

        const dataExists = !!existingData

        if (dataExists && !forceRefresh) {
          // Skip if data exists and not forcing refresh
          currentDate.setDate(currentDate.getDate() + 1)
          continue
        }

        // Aggregate data for this date
        const dayStart = new Date(dateStr + 'T00:00:00.000Z')
        const dayEnd = new Date(dateStr + 'T23:59:59.999Z')

        // Get user metrics for this date
        const { count: totalUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .lte('created_at', dayEnd.toISOString())

        const { count: newRegistrationsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())

        // Get activity metrics for this date
        const { data: activityData } = await supabase
          .from('user_activity_logs')
          .select('user_id, activity_type')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())

        const activeUsers = activityData ? new Set(activityData.map(a => a.user_id)).size : 0
        const pageViews = activityData ? activityData.filter(a => a.activity_type === 'page_view').length : 0
        const uniqueVisitors = activeUsers // Simplified: active users = unique visitors

        // Get order metrics for this date
        const { data: ordersData } = await supabase
          .from('orders')
          .select('total_eur')
          .gte('created_at', dayStart.toISOString())
          .lte('created_at', dayEnd.toISOString())
          .neq('status', 'cancelled')

        const ordersCount = ordersData ? ordersData.length : 0
        const revenue = ordersData ? ordersData.reduce((sum, order) => sum + parseFloat(order.total_eur.toString()), 0) : 0

        // Insert or update daily analytics
        const analyticsData = {
          date: dateStr,
          total_users: totalUsersCount || 0,
          active_users: activeUsers,
          new_registrations: newRegistrationsCount || 0,
          page_views: pageViews,
          unique_visitors: uniqueVisitors,
          orders_count: ordersCount,
          revenue: Math.round(revenue * 100) / 100,
        }

        if (dataExists) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('daily_analytics')
            .update(analyticsData)
            .eq('date', dateStr)

          if (updateError) {
            result.errors.push(`Error updating data for ${dateStr}: ${updateError.message ?? 'Unknown error'}`)
          }
          else {
            result.recordsUpdated++
            result.datesProcessed.push(dateStr)
          }
        }
        else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('daily_analytics')
            .insert(analyticsData)

          if (insertError) {
            result.errors.push(`Error inserting data for ${dateStr}: ${insertError.message ?? 'Unknown error'}`)
          }
          else {
            result.recordsCreated++
            result.datesProcessed.push(dateStr)
          }
        }

        // Also update product analytics for this date if we have activity data
        if (activityData && activityData.length > 0) {
          const productActivities = activityData.filter(a =>
            ['product_view', 'cart_add'].includes(a.activity_type) && a.product_id,
          )

          // Group by product
          const productMap = new Map()
          productActivities.forEach((activity) => {
            const productId = activity.product_id
            if (!productMap.has(productId)) {
              productMap.set(productId, { views: 0, cartAdditions: 0 })
            }

            const stats = productMap.get(productId)
            if (activity.activity_type === 'product_view') {
              stats.views++
            }
            else if (activity.activity_type === 'cart_add') {
              stats.cartAdditions++
            }
          })

          // Update product analytics
          for (const [productId, stats] of productMap) {
            const { error: productError } = await supabase
              .from('product_analytics')
              .upsert({
                product_id: productId,
                date: dateStr,
                views: stats.views,
                cart_additions: stats.cartAdditions,
                purchases: 0, // Will be updated separately when orders are processed
                revenue: 0,
              })

            if (productError) {
              result.errors.push(`Error updating product analytics for product ${productId} on ${dateStr}: ${productError.message}`)
            }
          }
        }
      }
      catch (dateError: any) {
        const errorMessage = dateError instanceof Error ? dateError.message : 'Unknown error'
        result.errors.push(`Error processing date ${dateStr}: ${errorMessage}`)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return {
      success: true,
      data: result,
    }
  }
  catch (error: unknown) {
    console.error('Analytics aggregation error:', getServerErrorMessage(error))

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to aggregate analytics data',
    })
  }
})
