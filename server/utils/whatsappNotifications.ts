/**
 * WhatsApp Notification Utilities
 * =================================
 * Order notifications via WhatsApp Business API
 * Mirrors structure of orderEmails.ts for consistency
 * Created: 2025-11-28
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  NotificationType,
  WhatsAppMessageParams,
  WhatsAppSendResult,
} from '~/types/notifications'
import { sendWhatsAppMessage, isWhatsAppAvailable, formatPhoneNumber } from './whatsapp'

// =====================================================
// Template ID Mapping
// =====================================================

/**
 * Map notification types to WhatsApp template IDs
 * These template IDs must be created and approved in WhatsApp Business Manager
 *
 * TODO: Replace with actual template IDs after approval
 */
const WHATSAPP_TEMPLATE_IDS: Record<NotificationType, string> = {
  // Order notifications
  order_confirmation: 'order_confirmation_v1', // Twilio Content SID or template name
  order_processing: 'order_processing_v1',
  order_shipped: 'order_shipped_v1',
  order_delivered: 'order_delivered_v1',
  order_cancelled: 'order_cancelled_v1',
  order_issue: 'order_issue_v1',

  // Support notifications
  support_ticket_customer: 'support_ticket_customer_v1',
  support_ticket_staff: 'support_ticket_staff_v1',

  // Auth notifications (for WhatsApp login)
  auth_verification: 'auth_verification_v1',
  auth_password_reset: 'auth_password_reset_v1',
  auth_otp: 'auth_otp_v1',

  // Marketing
  marketing_promo: 'marketing_promo_v1',
}

/**
 * Get WhatsApp template ID for notification type
 */
function getTemplateId(
  notificationType: NotificationType,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es'
): string {
  const baseTemplate = WHATSAPP_TEMPLATE_IDS[notificationType]

  // If you have locale-specific templates, append locale
  // e.g., 'order_confirmation_es', 'order_confirmation_en'
  // For now, using single multilingual templates
  return baseTemplate
}

// =====================================================
// Notification Preferences Check
// =====================================================

/**
 * Check if user has WhatsApp notifications enabled
 */
async function shouldSendWhatsApp(
  notificationType: NotificationType,
  userId?: string,
  phoneNumber?: string,
  supabase?: SupabaseClient
): Promise<boolean> {
  // WhatsApp must be configured
  if (!isWhatsAppAvailable()) {
    return false
  }

  // Phone number required
  if (!phoneNumber) {
    return false
  }

  // If no user ID, allow (guest checkout)
  if (!userId || !supabase) {
    return true // Default to enabled for guests
  }

  try {
    // Check user preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('whatsapp_enabled, whatsapp_order_confirmation, whatsapp_order_updates, whatsapp_shipping, whatsapp_delivery')
      .eq('user_id', userId)
      .single()

    if (!prefs || !prefs.whatsapp_enabled) {
      return false
    }

    // Check specific notification type preference
    const preferenceMap: Record<string, keyof typeof prefs> = {
      order_confirmation: 'whatsapp_order_confirmation',
      order_processing: 'whatsapp_order_updates',
      order_shipped: 'whatsapp_shipping',
      order_delivered: 'whatsapp_delivery',
      order_cancelled: 'whatsapp_order_updates',
      order_issue: 'whatsapp_order_updates',
    }

    const preferenceKey = preferenceMap[notificationType]
    if (preferenceKey) {
      return prefs[preferenceKey] !== false
    }

    return true
  } catch (error) {
    console.error('[WhatsApp] Error checking preferences:', error)
    return false // Fail safe - don't send if can't verify
  }
}

// =====================================================
// Notification Logging
// =====================================================

/**
 * Create WhatsApp notification log entry
 */
async function createWhatsAppLog(
  params: {
    phoneNumber: string
    userId?: string
    notificationType: NotificationType
    orderId?: string
    templateId: string
    metadata?: Record<string, any>
  },
  supabase: SupabaseClient
) {
  try {
    const { data, error } = await supabase
      .from('notification_logs')
      .insert({
        channel: 'whatsapp',
        recipient_phone: params.phoneNumber,
        user_id: params.userId,
        notification_type: params.notificationType,
        order_id: params.orderId,
        template_id: params.templateId,
        status: 'pending',
        metadata: params.metadata || {},
        provider: 'twilio', // Or get from config
      })
      .select()
      .single()

    if (error) {
      console.error('[WhatsApp] Failed to create log:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('[WhatsApp] Log creation error:', error)
    return null
  }
}

/**
 * Update WhatsApp notification log with send result
 */
async function updateWhatsAppLog(
  logId: string,
  result: WhatsAppSendResult,
  supabase: SupabaseClient
) {
  try {
    const updateData: any = {
      status: result.success ? 'sent' : 'failed',
      attempt_count: 1,
      external_id: result.messageId,
    }

    if (result.success) {
      updateData.sent_at = new Date().toISOString()
    } else {
      updateData.failed_at = new Date().toISOString()
      updateData.last_error = result.error
      // Set retry time (exponential backoff)
      updateData.next_retry_at = new Date(Date.now() + 60000).toISOString() // 1 minute
    }

    await supabase
      .from('notification_logs')
      .update(updateData)
      .eq('id', logId)
  } catch (error) {
    console.error('[WhatsApp] Failed to update log:', error)
  }
}

// =====================================================
// Order Confirmation
// =====================================================

/**
 * Send order confirmation via WhatsApp
 *
 * @param order - Order data with items and customer info
 * @param phoneNumber - Customer phone number (E.164 format)
 * @param locale - Language for template
 * @param supabase - Supabase client for logging
 */
export async function sendOrderConfirmationWhatsApp(
  order: any,
  phoneNumber: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase: SupabaseClient
): Promise<WhatsAppSendResult> {
  // Validate phone number
  const formattedPhone = formatPhoneNumber(phoneNumber)
  if (!formattedPhone) {
    return {
      success: false,
      error: 'Invalid phone number format',
      timestamp: new Date(),
    }
  }

  // Check if should send
  const shouldSend = await shouldSendWhatsApp(
    'order_confirmation',
    order.user_id,
    formattedPhone,
    supabase
  )

  if (!shouldSend) {
    return {
      success: false,
      error: 'WhatsApp notifications disabled for user',
      timestamp: new Date(),
    }
  }

  // Get template ID
  const templateId = getTemplateId('order_confirmation', locale)

  // Prepare template parameters
  // Order: [Order Number, Customer Name, Total, Tracking URL]
  const parameters = [
    order.order_number || order.id.slice(0, 8).toUpperCase(),
    order.shipping_name || 'Customer',
    `${order.total_amount} ${order.currency || 'EUR'}`,
    `https://moldova-direct.vercel.app/orders/${order.id}`,
  ]

  // Create log entry
  const log = await createWhatsAppLog(
    {
      phoneNumber: formattedPhone,
      userId: order.user_id,
      notificationType: 'order_confirmation',
      orderId: order.id,
      templateId,
      metadata: {
        locale,
        order_number: order.order_number,
        total: order.total_amount,
      },
    },
    supabase
  )

  // Send WhatsApp message
  const result = await sendWhatsAppMessage({
    to: formattedPhone,
    templateId,
    parameters,
    language: locale,
  })

  // Update log with result
  if (log) {
    await updateWhatsAppLog(log.id, result, supabase)
  }

  return result
}

// =====================================================
// Order Status Updates
// =====================================================

/**
 * Send order shipped notification via WhatsApp
 */
export async function sendOrderShippedWhatsApp(
  order: any,
  phoneNumber: string,
  trackingNumber?: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase?: SupabaseClient
): Promise<WhatsAppSendResult> {
  const formattedPhone = formatPhoneNumber(phoneNumber)
  if (!formattedPhone) {
    return {
      success: false,
      error: 'Invalid phone number',
      timestamp: new Date(),
    }
  }

  if (supabase) {
    const shouldSend = await shouldSendWhatsApp(
      'order_shipped',
      order.user_id,
      formattedPhone,
      supabase
    )

    if (!shouldSend) {
      return {
        success: false,
        error: 'WhatsApp notifications disabled',
        timestamp: new Date(),
      }
    }
  }

  const templateId = getTemplateId('order_shipped', locale)
  const parameters = [
    order.order_number || order.id.slice(0, 8).toUpperCase(),
    trackingNumber || 'N/A',
    `https://moldova-direct.vercel.app/orders/${order.id}`,
  ]

  if (supabase) {
    const log = await createWhatsAppLog(
      {
        phoneNumber: formattedPhone,
        userId: order.user_id,
        notificationType: 'order_shipped',
        orderId: order.id,
        templateId,
        metadata: { locale, tracking_number: trackingNumber },
      },
      supabase
    )

    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      templateId,
      parameters,
      language: locale,
    })

    if (log) {
      await updateWhatsAppLog(log.id, result, supabase)
    }

    return result
  }

  return await sendWhatsAppMessage({
    to: formattedPhone,
    templateId,
    parameters,
    language: locale,
  })
}

/**
 * Send order delivered notification via WhatsApp
 */
export async function sendOrderDeliveredWhatsApp(
  order: any,
  phoneNumber: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase?: SupabaseClient
): Promise<WhatsAppSendResult> {
  const formattedPhone = formatPhoneNumber(phoneNumber)
  if (!formattedPhone) {
    return {
      success: false,
      error: 'Invalid phone number',
      timestamp: new Date(),
    }
  }

  const templateId = getTemplateId('order_delivered', locale)
  const parameters = [
    order.order_number || order.id.slice(0, 8).toUpperCase(),
    `https://moldova-direct.vercel.app/orders/${order.id}/review`,
  ]

  if (supabase) {
    const log = await createWhatsAppLog(
      {
        phoneNumber: formattedPhone,
        userId: order.user_id,
        notificationType: 'order_delivered',
        orderId: order.id,
        templateId,
        metadata: { locale },
      },
      supabase
    )

    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      templateId,
      parameters,
      language: locale,
    })

    if (log) {
      await updateWhatsAppLog(log.id, result, supabase)
    }

    return result
  }

  return await sendWhatsAppMessage({
    to: formattedPhone,
    templateId,
    parameters,
    language: locale,
  })
}

// =====================================================
// Authentication OTP (for WhatsApp Login)
// =====================================================

/**
 * Send OTP code via WhatsApp for authentication
 *
 * @param phoneNumber - User's phone number
 * @param otpCode - 6-digit verification code
 * @param locale - Language for message
 */
export async function sendAuthOTPWhatsApp(
  phoneNumber: string,
  otpCode: string,
  locale: 'es' | 'en' | 'ro' | 'ru' = 'es',
  supabase?: SupabaseClient
): Promise<WhatsAppSendResult> {
  const formattedPhone = formatPhoneNumber(phoneNumber)
  if (!formattedPhone) {
    return {
      success: false,
      error: 'Invalid phone number',
      timestamp: new Date(),
    }
  }

  const templateId = getTemplateId('auth_otp', locale)
  const parameters = [
    otpCode, // The 6-digit code
    '5', // Expiry time in minutes
  ]

  if (supabase) {
    const log = await createWhatsAppLog(
      {
        phoneNumber: formattedPhone,
        notificationType: 'auth_otp',
        templateId,
        metadata: { locale, code_length: otpCode.length },
      },
      supabase
    )

    const result = await sendWhatsAppMessage({
      to: formattedPhone,
      templateId,
      parameters,
      language: locale,
    })

    if (log) {
      await updateWhatsAppLog(log.id, result, supabase)
    }

    return result
  }

  return await sendWhatsAppMessage({
    to: formattedPhone,
    templateId,
    parameters,
    language: locale,
  })
}

// =====================================================
// Async Wrappers (Non-blocking)
// =====================================================

/**
 * Send order confirmation WhatsApp async (non-blocking)
 * Use this in order creation to avoid blocking the response
 */
export function sendOrderConfirmationWhatsAppAsync(
  order: any,
  phoneNumber: string,
  locale: 'es' | 'en' | 'ro' | 'ru',
  supabase: SupabaseClient
): void {
  // Fire and forget - don't await
  sendOrderConfirmationWhatsApp(order, phoneNumber, locale, supabase).catch((error) => {
    console.error('[WhatsApp] Async send error:', error)
  })
}
