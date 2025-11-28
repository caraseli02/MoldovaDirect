/**
 * Multi-Channel Notification System
 * ===================================
 * Unified interface for sending notifications across Email + WhatsApp + SMS
 * Handles user preferences, fallbacks, and logging
 * Created: 2025-11-28
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  NotificationType,
  MultiChannelSendResult,
  NotificationChannelResult,
  SendNotificationParams,
} from '~/types/notifications'
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from './orderEmails'
import {
  sendOrderConfirmationWhatsApp,
  sendOrderShippedWhatsApp,
  sendOrderDeliveredWhatsApp,
} from './whatsappNotifications'
import { isWhatsAppAvailable } from './whatsapp'

// =====================================================
// User Preferences
// =====================================================

/**
 * Get user's notification preferences
 */
async function getUserPreferences(
  userId?: string,
  email?: string,
  supabase?: SupabaseClient
) {
  if (!supabase) {
    return null
  }

  try {
    let query = supabase.from('notification_preferences').select('*')

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (email) {
      query = query.eq('guest_email', email)
    } else {
      return null
    }

    const { data } = await query.single()
    return data
  } catch (error) {
    console.error('[Notifications] Error fetching preferences:', error)
    return null
  }
}

/**
 * Get phone number for user
 */
async function getUserPhoneNumber(
  userId?: string,
  supabase?: SupabaseClient
): Promise<string | null> {
  if (!userId || !supabase) {
    return null
  }

  try {
    // First check notification preferences (has verified phone)
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('phone_number, phone_verified')
      .eq('user_id', userId)
      .single()

    if (prefs?.phone_verified && prefs?.phone_number) {
      return prefs.phone_number
    }

    // Fallback to user profile (unverified phone)
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', userId)
      .single()

    return profile?.phone || null
  } catch (error) {
    return null
  }
}

// =====================================================
// Channel Availability Check
// =====================================================

/**
 * Check which channels are available for a user
 */
async function getAvailableChannels(
  userId?: string,
  email?: string,
  supabase?: SupabaseClient
): Promise<{
  email: boolean
  whatsapp: boolean
  sms: boolean
  phoneNumber?: string
}> {
  const prefs = await getUserPreferences(userId, email, supabase)
  const phoneNumber = await getUserPhoneNumber(userId, supabase)

  return {
    email: prefs?.email_enabled !== false, // Default true
    whatsapp: Boolean(
      prefs?.whatsapp_enabled &&
      phoneNumber &&
      isWhatsAppAvailable()
    ),
    sms: false, // Not implemented yet
    phoneNumber: phoneNumber || undefined,
  }
}

// =====================================================
// Multi-Channel Order Confirmation
// =====================================================

/**
 * Send order confirmation across all enabled channels
 *
 * @param order - Order data
 * @param customer - Customer info (email, phone, userId)
 * @param locale - Language for notifications
 * @param supabase - Supabase client
 * @returns Results for each channel
 */
export async function sendOrderConfirmationMultiChannel(
  order: any,
  customer: {
    email: string
    phone?: string
    userId?: string
    name?: string
  },
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase: SupabaseClient
): Promise<MultiChannelSendResult> {
  const results: NotificationChannelResult[] = []

  // Get available channels
  const channels = await getAvailableChannels(
    customer.userId,
    customer.email,
    supabase
  )

  // 1. Send Email (primary channel, always try)
  if (channels.email) {
    try {
      const emailResult = await sendOrderConfirmationEmail(
        order,
        {
          id: customer.userId || 'guest',
          email: customer.email,
          name: customer.name || customer.email.split('@')[0],
        },
        supabase
      )

      results.push({
        channel: 'email',
        success: emailResult.success,
        externalId: emailResult.messageId,
        error: emailResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'email',
        success: false,
        error: error.message,
      })
    }
  }

  // 2. Send WhatsApp (if enabled and phone available)
  if (channels.whatsapp && channels.phoneNumber) {
    try {
      const whatsappResult = await sendOrderConfirmationWhatsApp(
        order,
        channels.phoneNumber,
        locale,
        supabase
      )

      results.push({
        channel: 'whatsapp',
        success: whatsappResult.success,
        externalId: whatsappResult.messageId,
        error: whatsappResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'whatsapp',
        success: false,
        error: error.message,
      })
    }
  }

  // Calculate success/failure counts
  const successCount = results.filter((r) => r.success).length
  const failureCount = results.filter((r) => !r.success).length

  return {
    orderId: order.id,
    userId: customer.userId,
    results,
    successCount,
    failureCount,
    timestamp: new Date(),
  }
}

// =====================================================
// Multi-Channel Order Shipped
// =====================================================

/**
 * Send order shipped notification across all channels
 */
export async function sendOrderShippedMultiChannel(
  order: any,
  customer: {
    email: string
    phone?: string
    userId?: string
    name?: string
  },
  trackingNumber?: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase?: SupabaseClient
): Promise<MultiChannelSendResult> {
  const results: NotificationChannelResult[] = []

  if (!supabase) {
    return {
      orderId: order.id,
      results: [],
      successCount: 0,
      failureCount: 0,
      timestamp: new Date(),
    }
  }

  const channels = await getAvailableChannels(
    customer.userId,
    customer.email,
    supabase
  )

  // Send Email
  if (channels.email) {
    try {
      const emailResult = await sendOrderStatusEmail(
        order,
        'shipped',
        { trackingNumber },
        supabase
      )

      results.push({
        channel: 'email',
        success: emailResult.success,
        externalId: emailResult.messageId,
        error: emailResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'email',
        success: false,
        error: error.message,
      })
    }
  }

  // Send WhatsApp
  if (channels.whatsapp && channels.phoneNumber) {
    try {
      const whatsappResult = await sendOrderShippedWhatsApp(
        order,
        channels.phoneNumber,
        trackingNumber,
        locale,
        supabase
      )

      results.push({
        channel: 'whatsapp',
        success: whatsappResult.success,
        externalId: whatsappResult.messageId,
        error: whatsappResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'whatsapp',
        success: false,
        error: error.message,
      })
    }
  }

  return {
    orderId: order.id,
    userId: customer.userId,
    results,
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
    timestamp: new Date(),
  }
}

// =====================================================
// Multi-Channel Order Delivered
// =====================================================

/**
 * Send order delivered notification across all channels
 */
export async function sendOrderDeliveredMultiChannel(
  order: any,
  customer: {
    email: string
    phone?: string
    userId?: string
    name?: string
  },
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase?: SupabaseClient
): Promise<MultiChannelSendResult> {
  const results: NotificationChannelResult[] = []

  if (!supabase) {
    return {
      orderId: order.id,
      results: [],
      successCount: 0,
      failureCount: 0,
      timestamp: new Date(),
    }
  }

  const channels = await getAvailableChannels(
    customer.userId,
    customer.email,
    supabase
  )

  // Send Email
  if (channels.email) {
    try {
      const emailResult = await sendOrderStatusEmail(
        order,
        'delivered',
        {},
        supabase
      )

      results.push({
        channel: 'email',
        success: emailResult.success,
        externalId: emailResult.messageId,
        error: emailResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'email',
        success: false,
        error: error.message,
      })
    }
  }

  // Send WhatsApp
  if (channels.whatsapp && channels.phoneNumber) {
    try {
      const whatsappResult = await sendOrderDeliveredWhatsApp(
        order,
        channels.phoneNumber,
        locale,
        supabase
      )

      results.push({
        channel: 'whatsapp',
        success: whatsappResult.success,
        externalId: whatsappResult.messageId,
        error: whatsappResult.error,
      })
    } catch (error: any) {
      results.push({
        channel: 'whatsapp',
        success: false,
        error: error.message,
      })
    }
  }

  return {
    orderId: order.id,
    userId: customer.userId,
    results,
    successCount: results.filter((r) => r.success).length,
    failureCount: results.filter((r) => !r.success).length,
    timestamp: new Date(),
  }
}

// =====================================================
// Async Helpers (Non-blocking)
// =====================================================

/**
 * Send order confirmation async (fire-and-forget)
 * Use in API routes to avoid blocking response
 */
export function sendOrderConfirmationMultiChannelAsync(
  order: any,
  customer: {
    email: string
    phone?: string
    userId?: string
    name?: string
  },
  locale: 'es' | 'en' | 'ro' | 'ru',
  supabase: SupabaseClient
): void {
  sendOrderConfirmationMultiChannel(order, customer, locale, supabase)
    .then((result) => {
      console.log('[Notifications] Multi-channel send complete:', {
        orderId: order.id,
        successCount: result.successCount,
        failureCount: result.failureCount,
      })
    })
    .catch((error) => {
      console.error('[Notifications] Multi-channel send error:', error)
    })
}

// =====================================================
// Preference Management Helpers
// =====================================================

/**
 * Create default notification preferences for new user
 */
export async function createDefaultNotificationPreferences(
  userId: string,
  email: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase: SupabaseClient
) {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        email_enabled: true,
        whatsapp_enabled: false, // Opt-in required
        preferred_language: locale,
      })
      .select()
      .single()

    if (error) {
      console.error('[Notifications] Failed to create preferences:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[Notifications] Preference creation error:', error)
    return null
  }
}

/**
 * Update WhatsApp phone number and enable notifications
 */
export async function enableWhatsAppNotifications(
  userId: string,
  phoneNumber: string,
  supabase: SupabaseClient
) {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update({
        phone_number: phoneNumber,
        whatsapp_enabled: true,
        phone_verified: false, // Requires verification
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('[Notifications] Failed to enable WhatsApp:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[Notifications] WhatsApp enable error:', error)
    return null
  }
}
