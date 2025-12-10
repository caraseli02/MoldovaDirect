/**
 * Analytics Activity Tracking API Endpoint
 *
 * Requirements addressed:
 * - 3.1: Implement analytics data collection system
 * - 3.3: Track user activity patterns and engagement
 *
 * Tracks user activities for analytics purposes.
 * This endpoint is called from the frontend to log user interactions.
 */

import { serverSupabaseClient } from '#supabase/server'

export interface ActivityTrackingRequest {
  activityType: 'login' | 'logout' | 'page_view' | 'product_view' | 'cart_add' | 'order_create'
  pageUrl?: string
  productId?: number
  orderId?: number
  sessionId?: string
  metadata?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const { data: { user } } = await supabase.auth.getUser()

    // Allow anonymous tracking for some activities
    const body = await readBody(event) as ActivityTrackingRequest
    const { activityType, pageUrl, productId, orderId, sessionId, metadata } = body

    // Validate activity type
    const validActivityTypes = ['login', 'logout', 'page_view', 'product_view', 'cart_add', 'order_create']
    if (!validActivityTypes.includes(activityType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid activity type',
      })
    }

    // Get client IP and user agent
    const clientIP = getClientIP(event)
    const userAgent = getHeader(event, 'user-agent')

    // Prepare activity log entry
    const activityLog = {
      user_id: user?.id || null,
      activity_type: activityType,
      page_url: pageUrl,
      product_id: productId,
      order_id: orderId,
      session_id: sessionId || null,
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: metadata || null,
    }

    // Insert activity log
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert(activityLog)

    if (logError) {
      console.error('Activity tracking error:', logError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to track activity',
      })
    }

    // Update product analytics if this is a product-related activity
    if (productId && ['product_view', 'cart_add'].includes(activityType)) {
      const today = new Date().toISOString().split('T')[0]

      // Use the update_product_analytics function if available
      const { error: productError } = await supabase
        .rpc('update_product_analytics', {
          p_product_id: productId,
          p_activity_type: activityType === 'product_view' ? 'view' : 'cart_add',
          p_date: today,
        })

      if (productError) {
        // Fallback to manual upsert if function doesn't exist
        const incrementField = activityType === 'product_view' ? 'views' : 'cart_additions'

        const { data: existingData } = await supabase
          .from('product_analytics')
          .select('*')
          .eq('product_id', productId)
          .eq('date', today)
          .single()

        if (existingData) {
          // Update existing record
          const updateData = {
            [incrementField]: (existingData[incrementField] || 0) + 1,
            updated_at: new Date().toISOString(),
          }

          await supabase
            .from('product_analytics')
            .update(updateData)
            .eq('product_id', productId)
            .eq('date', today)
        }
        else {
          // Insert new record
          const insertData = {
            product_id: productId,
            date: today,
            views: activityType === 'product_view' ? 1 : 0,
            cart_additions: activityType === 'cart_add' ? 1 : 0,
            purchases: 0,
            revenue: 0,
          }

          await supabase
            .from('product_analytics')
            .insert(insertData)
        }
      }
    }

    return {
      success: true,
      message: 'Activity tracked successfully',
    }
  }
  catch (error) {
    console.error('Activity tracking error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to track activity',
    })
  }
})

// Helper function to get client IP
function getClientIP(event: any): string | null {
  const forwarded = getHeader(event, 'x-forwarded-for')
  const realIP = getHeader(event, 'x-real-ip')
  const remoteAddr = event.node.req.socket?.remoteAddress

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return remoteAddr || null
}
