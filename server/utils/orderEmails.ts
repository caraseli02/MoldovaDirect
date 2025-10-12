// =============================================
// ORDER EMAIL UTILITIES
// =============================================
// Utilities for sending order-related emails with logging and retry support
// Requirements: 1.1, 4.1, 4.2

import type { EmailType } from '~/types/email'
import type { OrderEmailData, OrderItemData, AddressData, DatabaseOrder } from './emailTemplates/types'
import { sendEmail } from './email'
import { 
  generateOrderConfirmationTemplate,
  getOrderConfirmationSubject
} from './emailTemplates/orderConfirmation'
import {
  generateOrderProcessingTemplate,
  generateOrderShippedTemplate,
  generateOrderDeliveredTemplate,
  generateOrderCancelledTemplate,
  generateOrderIssueTemplate,
  getOrderStatusSubject
} from './emailTemplates/orderStatusTemplates'
import { createEmailLog, recordEmailAttempt, getEmailLog } from './emailLogging'
import { resolveSupabaseClient, type ResolvedSupabaseClient } from './supabaseAdminClient'

/**
 * Email sending result
 */
export interface EmailSendResult {
  success: boolean
  emailLogId: number
  externalId?: string
  error?: string
}

/**
 * Send order confirmation email with logging
 * Requirements: 1.1, 4.1, 4.2
 */
interface EmailSendOptions {
  supabaseClient?: ResolvedSupabaseClient
}

export async function sendOrderConfirmationEmail(
  data: OrderEmailData,
  options: EmailSendOptions = {}
): Promise<EmailSendResult> {
  const { customerName, customerEmail, orderNumber, locale } = data
  
  // Generate email subject based on locale
  const subject = getOrderConfirmationSubject(orderNumber, locale)
  
  // Get order ID from database if needed for logging
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const { data: orderData } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single()
  
  const orderId = orderData?.id
  
  if (!orderId) {
    throw createError({
      statusCode: 404,
      statusMessage: `Order ${orderNumber} not found`
    })
  }
  
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
      templateVersion: '2.0'
    }
  }, supabase)
  
  try {
    // Generate email HTML using new template system
    const html = generateOrderConfirmationTemplate(data)
    
    // Send email
    const result = await sendEmail({
      to: customerEmail,
      subject,
      html
    })
    
    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase
    )
    
    console.log(`✅ Order confirmation email sent for order ${orderNumber}`)
    
    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id
    }
  } catch (error: any) {
    console.error(`❌ Failed to send order confirmation email for order ${orderNumber}:`, error)
    
    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase
    )
    
    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message
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
  options: EmailSendOptions = {}
): Promise<EmailSendResult> {
  const { customerName, customerEmail, orderNumber, locale } = data
  
  // Generate email subject based on type and locale
  const subject = getOrderStatusSubject(emailType, orderNumber, locale)
  
  // Get order ID from database
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const { data: orderData } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single()
  
  const orderId = orderData?.id
  
  if (!orderId) {
    throw createError({
      statusCode: 404,
      statusMessage: `Order ${orderNumber} not found`
    })
  }
  
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
      issueDescription
    }
  }, supabase)
  
  try {
    // Generate email HTML based on type
    let html: string
    
    switch (emailType) {
      case 'order_processing':
        html = generateOrderProcessingTemplate(data)
        break
      case 'order_shipped':
        html = generateOrderShippedTemplate(data)
        break
      case 'order_delivered':
        html = generateOrderDeliveredTemplate(data)
        break
      case 'order_cancelled':
        html = generateOrderCancelledTemplate(data)
        break
      case 'order_issue':
        html = generateOrderIssueTemplate(data, issueDescription)
        break
      default:
        // Fallback to order confirmation template
        html = generateOrderConfirmationTemplate(data)
    }
    
    // Send email
    const result = await sendEmail({
      to: customerEmail,
      subject,
      html
    })
    
    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase
    )
    
    console.log(`✅ Order ${emailType} email sent for order ${orderNumber}`)
    
    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id
    }
  } catch (error: any) {
    console.error(`❌ Failed to send order ${emailType} email for order ${orderNumber}:`, error)
    
    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase
    )
    
    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message
    }
  }
}

/**
 * Send delivery confirmation email with review request
 * Requirements: 6.3
 */
export async function sendDeliveryConfirmationEmail(
  data: OrderEmailData,
  options: EmailSendOptions = {}
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
  options: EmailSendOptions = {}
): Promise<EmailSendResult> {
  const supabase = resolveSupabaseClient(options.supabaseClient)
  const emailLog = await getEmailLog(emailLogId, supabase)
  
  if (!emailLog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Email log not found'
    })
  }
  
  if (emailLog.status === 'delivered' || emailLog.status === 'sent') {
    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: emailLog.externalId
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
      statusMessage: 'Order not found for email retry'
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
      locale
    )
    
    // Regenerate email HTML using original email type
    const issueDescription = emailLog.metadata.issueDescription
    
    let html: string
    
    switch (emailLog.emailType) {
      case 'order_confirmation':
        html = generateOrderConfirmationTemplate(emailData)
        break
      case 'order_processing':
        html = generateOrderProcessingTemplate(emailData)
        break
      case 'order_shipped':
        html = generateOrderShippedTemplate(emailData)
        break
      case 'order_delivered':
        html = generateOrderDeliveredTemplate(emailData)
        break
      case 'order_cancelled':
        html = generateOrderCancelledTemplate(emailData)
        break
      case 'order_issue':
        html = generateOrderIssueTemplate(emailData, issueDescription)
        break
      default:
        html = generateOrderConfirmationTemplate(emailData)
    }
    
    // Resend email
    const result = await sendEmail({
      to: emailLog.recipientEmail,
      subject: emailLog.subject,
      html
    })
    
    // Record successful retry
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase
    )
    
    console.log(`✅ Email retry successful for log ${emailLogId}`)
    
    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id
    }
  } catch (error: any) {
    console.error(`❌ Email retry failed for log ${emailLogId}:`, error)
    
    // Record failed retry
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      error.message,
      supabase
    )
    
    return {
      success: false,
      emailLogId: emailLog.id,
      error: error.message
    }
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Transform database order to OrderEmailData format
 * Requirements: 1.2, 1.3, 1.4, 1.5
 */
export function transformOrderToEmailData(
  order: DatabaseOrder,
  customerName: string,
  customerEmail: string,
  locale: string = 'en'
): OrderEmailData {
  // Transform order items
  const orderItems: OrderItemData[] = (order.order_items || []).map((item) => {
    const snapshot = item.product_snapshot || {}
    const nameTranslations = snapshot.name_translations || snapshot.nameTranslations || {}
    const productName = nameTranslations[locale] || nameTranslations.en || snapshot.name || 'Product'
    
    return {
      productId: item.product_id?.toString() || '',
      name: productName,
      sku: snapshot.sku || '',
      quantity: item.quantity,
      price: item.price_eur,
      total: item.total_eur,
      image: snapshot.images?.[0]?.url || snapshot.primaryImage?.url
    }
  })
  
  // Transform shipping address
  const shippingAddr = order.shipping_address || {}
  const shippingAddress: AddressData = {
    firstName: shippingAddr.firstName || shippingAddr.first_name || '',
    lastName: shippingAddr.lastName || shippingAddr.last_name || '',
    street: shippingAddr.street || shippingAddr.address || '',
    city: shippingAddr.city || '',
    postalCode: shippingAddr.postalCode || shippingAddr.postal_code || shippingAddr.zipCode || '',
    province: shippingAddr.province || shippingAddr.state || '',
    country: shippingAddr.country || '',
    phone: shippingAddr.phone || ''
  }
  
  // Transform billing address if present
  let billingAddress: AddressData | undefined
  if (order.billing_address) {
    const billingAddr = order.billing_address
    billingAddress = {
      firstName: billingAddr.firstName || billingAddr.first_name || '',
      lastName: billingAddr.lastName || billingAddr.last_name || '',
      street: billingAddr.street || billingAddr.address || '',
      city: billingAddr.city || '',
      postalCode: billingAddr.postalCode || billingAddr.postal_code || billingAddr.zipCode || '',
      province: billingAddr.province || billingAddr.state || '',
      country: billingAddr.country || '',
      phone: billingAddr.phone || ''
    }
  }
  
  return {
    customerName,
    customerEmail,
    orderNumber: order.order_number,
    orderDate: order.created_at,
    estimatedDelivery: order.estimated_delivery,
    orderItems,
    shippingAddress,
    billingAddress,
    subtotal: order.subtotal_eur,
    shippingCost: order.shipping_cost_eur,
    tax: order.tax_eur,
    total: order.total_eur,
    paymentMethod: order.payment_method,
    trackingNumber: order.tracking_number,
    trackingUrl: order.tracking_number ? generateTrackingUrl(order.tracking_number, order.carrier) : undefined,
    carrier: order.carrier,
    locale,
    orderStatus: order.status,
    customerNotes: order.customer_notes
  }
}

/**
 * Generate tracking URL based on carrier
 * Requirements: 3.2, 6.2
 */
export function generateTrackingUrl(trackingNumber: string, carrier?: string): string | undefined {
  if (!carrier || !trackingNumber) return undefined
  
  const normalizedCarrier = carrier.toLowerCase().trim()
  
  const trackingUrls: Record<string, string> = {
    'correos': `https://www.correos.es/es/es/herramientas/localizador/envios?tracking=${trackingNumber}`,
    'seur': `https://www.seur.com/livetracking/?segOnlineIdentificador=${trackingNumber}`,
    'dhl': `https://www.dhl.com/es-es/home/tracking.html?tracking-id=${trackingNumber}`,
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'fedex': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'posta_moldovei': `https://www.posta.md/ro/tracking?code=${trackingNumber}`,
    'moldova_post': `https://www.posta.md/ro/tracking?code=${trackingNumber}`
  }
  
  return trackingUrls[normalizedCarrier]
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
      'posta.md'
    ]
    
    const hostname = parsedUrl.hostname.toLowerCase()
    const isKnownDomain = knownDomains.some(domain => hostname.includes(domain))
    
    return isKnownDomain
  } catch (error) {
    return false
  }
}
