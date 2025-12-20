/**
 * Admin Analytics Tracking API Endpoint
 *
 * Requirements addressed:
 * - 3.1: Track user activities and events for analytics
 * - 3.3: Record user interactions for analysis
 *
 * Receives and stores activity tracking events from the admin panel.
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

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
    await requireAdminRole(event)
    const supabase = await serverSupabaseClient(event)

    const body = await readBody(event) as ActivityTrackingRequest
    const { activityType, pageUrl, productId, orderId, sessionId, metadata } = body

    // Get the current user
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData?.user?.id

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: 'User not authenticated',
      })
    }

    // Validate activity type
    const validActivityTypes = ['login', 'logout', 'page_view', 'product_view', 'cart_add', 'order_create']
    if (!validActivityTypes.includes(activityType)) {
      throw createError({
        statusCode: 400,
        message: `Invalid activity type: ${activityType}`,
      })
    }

    // Store the activity in the user_activities table
    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        page_url: pageUrl,
        product_id: productId,
        order_id: orderId,
        session_id: sessionId || null,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to track activity:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to track activity',
      })
    }

    return {
      success: true,
      activityId: data?.id,
    }
  }
  catch (error: any) {
    console.error('Analytics tracking error:', error)

    // Don't throw errors for tracking failures to avoid disrupting user experience
    // Return success even if tracking fails
    return {
      success: true,
      error: error.message,
    }
  }
})
