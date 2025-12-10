// =============================================
// ORDER EMAIL UTILITIES
// =============================================
// Utilities for sending order-related emails with logging and retry support
// Requirements: 1.1, 4.1, 4.2

import type { OrderEmailData, DatabaseOrder } from './emailTemplates/types'
import { sendEmail } from './email'
import { orderConfirmation, orderStatus } from './emailTemplates'
import {
  transformOrderToEmailData,
} from './orderDataTransform'
import { createEmailLog, recordEmailAttempt, getEmailLog } from './emailLogging'
import { resolveSupabaseClient, type ResolvedSupabaseClient } from './supabaseAdminClient'
import { shouldSendEmail } from './emailPreferences'
import type { EmailSendResult } from './types/email'

/**
 * Send order confirmation email with logging
 * Requirements: 1.1, 4.1, 4.2
 */
interface EmailSendOptions {
  supabaseClient?: ResolvedSupabaseClient
}

export async function sendOrderConfirmationEmail(
  data: OrderEmailData,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  const { customerName, customerEmail, orderNumber, locale } = data

  // Get order ID from database if needed for logging
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const { data: orderData } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('order_number', orderNumber)
    .single()

  const orderId = orderData?.id
  const userId = orderData?.user_id

  if (!orderId) {
    throw createError({
      statusCode: 404,
      statusMessage: `Order ${orderNumber} not found`,
    })
  }

  // Check if user has opted out of order confirmation emails
  const shouldSend = await shouldSendEmail(
    'order_confirmation',
    userId || undefined,
    userId ? undefined : customerEmail,
    supabase,
  )

  if (!shouldSend) {
    console.log(`⏭️ Skipping order confirmation email for order ${orderNumber} - user opted out`)
    return {
      success: true,
      emailLogId: -1,
      error: 'User opted out of email notifications',
    }
  }

  // Generate email subject based on locale
  const subject = orderConfirmation.getOrderConfirmationSubject(orderNumber, locale)

  // Create email log entry
  const emailLog = await createEmailLog({
    orderId,
    emailType: 'order_confirmation',
    recipientEmail: customerEmail,
    subject,
    metadata: {
      locale,
      orderNumber,
      customerName,
      templateVersion: '2.0',
    },
  }, supabase)

  try {
    // Generate email HTML using new template system
    const html = orderConfirmation.generateOrderConfirmationTemplate(data)

    // Send email
    const result = await sendEmail({
      to: customerEmail,
      subject,
      html,
    })

    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase,
    )

    console.log(`✅ Order confirmation email sent for order ${orderNumber}`)

    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id,
    }
  }
  catch (error: any) {
    console.error(`❌ Failed to send order confirmation email for order ${orderNumber}:`, error)

    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase,
    )

    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message,
    }
  }
}

/**
 * Send order status update email with logging
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export async function sendOrderStatusEmail(
  data: OrderEmailData,
  emailType: EmailType,
  issueDescription?: string,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  const { customerName, customerEmail, orderNumber, locale } = data

  // Get order ID from database
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const { data: orderData } = await supabase
    .from('orders')
    .select('id, user_id')
    .eq('order_number', orderNumber)
    .single()

  const orderId = orderData?.id
  const userId = orderData?.user_id

  if (!orderId) {
    throw createError({
      statusCode: 404,
      statusMessage: `Order ${orderNumber} not found`,
    })
  }

  // Check if user has opted out of this email type
  const shouldSend = await shouldSendEmail(
    emailType,
    userId || undefined,
    userId ? undefined : customerEmail,
    supabase,
  )

  if (!shouldSend) {
    console.log(`⏭️ Skipping ${emailType} email for order ${orderNumber} - user opted out`)
    return {
      success: true,
      emailLogId: -1,
      error: 'User opted out of email notifications',
    }
  }

  // Generate email subject based on type and locale
  const subject = orderStatus.getOrderStatusSubject(emailType, orderNumber, locale)

  // Create email log entry
  const emailLog = await createEmailLog({
    orderId,
    emailType,
    recipientEmail: customerEmail,
    subject,
    metadata: {
      locale,
      orderNumber,
      customerName,
      templateVersion: '2.0',
      issueDescription,
    },
  }, supabase)

  try {
    // Generate email HTML based on type
    let html: string

    switch (emailType) {
      case 'order_processing':
        html = orderStatus.generateOrderProcessingTemplate(data)
        break
      case 'order_shipped':
        html = orderStatus.generateOrderShippedTemplate(data)
        break
      case 'order_delivered':
        html = orderStatus.generateOrderDeliveredTemplate(data)
        break
      case 'order_cancelled':
        html = orderStatus.generateOrderCancelledTemplate(data)
        break
      case 'order_issue':
        html = orderStatus.generateOrderIssueTemplate(data, issueDescription)
        break
      default:
        // Fallback to order confirmation template
        html = orderConfirmation.generateOrderConfirmationTemplate(data)
    }

    // Send email
    const result = await sendEmail({
      to: customerEmail,
      subject,
      html,
    })

    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase,
    )

    console.log(`✅ Order ${emailType} email sent for order ${orderNumber}`)

    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id,
    }
  }
  catch (error: any) {
    console.error(`❌ Failed to send order ${emailType} email for order ${orderNumber}:`, error)

    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase,
    )

    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message,
    }
  }
}

/**
 * Send delivery confirmation email with review request
 * Requirements: 6.3
 */
export async function sendDeliveryConfirmationEmail(
  data: OrderEmailData,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  // Use the order_delivered email type
  return sendOrderStatusEmail(data, 'order_delivered', undefined, options)
}

/**
 * Retry failed email delivery
 * Requirements: 4.2
 */
export async function retryEmailDelivery(
  emailLogId: number,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const emailLog = await getEmailLog(emailLogId, supabase)

  if (!emailLog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Email log not found',
    })
  }

  if (emailLog.status === 'delivered' || emailLog.status === 'sent') {
    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: emailLog.externalId,
    }
  }

  // Get order data with items
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items:order_items(*)
    `)
    .eq('id', emailLog.orderId)
    .single()

  if (error || !order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Order not found for email retry',
    })
  }

  try {
    // Get customer info from metadata
    const customerName = emailLog.metadata.customerName || 'Customer'
    const customerEmail = emailLog.recipientEmail
    const locale = emailLog.metadata.locale || 'en'

    // Transform order to email data format
    const emailData = transformOrderToEmailData(
      order as DatabaseOrder,
      customerName,
      customerEmail,
      locale,
    )

    // Regenerate email HTML using original email type
    const issueDescription = emailLog.metadata.issueDescription

    let html: string

    switch (emailLog.emailType) {
      case 'order_confirmation':
        html = orderConfirmation.generateOrderConfirmationTemplate(emailData)
        break
      case 'order_processing':
        html = orderStatus.generateOrderProcessingTemplate(emailData)
        break
      case 'order_shipped':
        html = orderStatus.generateOrderShippedTemplate(emailData)
        break
      case 'order_delivered':
        html = orderStatus.generateOrderDeliveredTemplate(emailData)
        break
      case 'order_cancelled':
        html = orderStatus.generateOrderCancelledTemplate(emailData)
        break
      case 'order_issue':
        html = orderStatus.generateOrderIssueTemplate(emailData, issueDescription)
        break
      default:
        html = orderConfirmation.generateOrderConfirmationTemplate(emailData)
    }

    // Resend email
    const result = await sendEmail({
      to: emailLog.recipientEmail,
      subject: emailLog.subject,
      html,
    })

    // Record successful retry
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase,
    )

    console.log(`✅ Email retry successful for log ${emailLogId}`)

    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id,
    }
  }
  catch (error: any) {
    console.error(`❌ Email retry failed for log ${emailLogId}:`, error)

    // Record failed retry
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase,
    )

    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message,
    }
  }
}

/**
 * Validate tracking URL
 * Requirements: 3.2
 */
export function validateTrackingUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)

    // Check if URL uses HTTPS
    if (parsedUrl.protocol !== 'https:') {
      return false
    }

    // Check if URL is from a known carrier domain
    const knownDomains = [
      'correos.es',
      'seur.com',
      'dhl.com',
      'ups.com',
      'fedex.com',
      'usps.com',
      'posta.md',
    ]

    const hostname = parsedUrl.hostname.toLowerCase()
    const isKnownDomain = knownDomains.some(domain => hostname.includes(domain))

    return isKnownDomain
  }
  catch {
    return false
  }
}
