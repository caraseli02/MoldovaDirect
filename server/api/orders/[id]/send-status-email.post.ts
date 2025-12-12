/**
 * API endpoint to send order status notification emails
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendOrderStatusEmail } from '~/server/utils/orderEmails'
import { transformOrderToEmailData } from '~/server/utils/orderDataTransform'
import type { EmailType } from '~/types/email'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const orderId = getRouterParam(event, 'id')

    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required',
      })
    }

    // Get request body
    const body = await readBody(event)
    const { emailType, issueDescription } = body as {
      emailType: EmailType
      issueDescription?: string
    }

    if (!emailType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email type is required',
      })
    }

    // Validate email type
    const validEmailTypes: EmailType[] = [
      'order_processing',
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'order_issue',
    ]

    if (!validEmailTypes.includes(emailType)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid email type. Must be one of: ${validEmailTypes.join(', ')}`,
      })
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(*)
      `)
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Get customer information
    let customerName = 'Customer'
    let customerEmail = ''
    let locale = 'en'

    if (order.user_id) {
      // Authenticated user
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, preferred_locale')
        .eq('id', order.user_id)
        .single()

      if (profile) {
        customerName = profile.full_name || 'Customer'
        customerEmail = profile.email
        locale = profile.preferred_locale || 'en'
      }
    }
    else if (order.guest_email) {
      // Guest checkout
      customerEmail = order.guest_email
      const shippingAddr = order.shipping_address
      if (shippingAddr) {
        customerName = `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() || 'Customer'
      }
    }

    if (!customerEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Customer email not found',
      })
    }

    // Transform order data for email
    const emailData = transformOrderToEmailData(
      order,
      customerName,
      customerEmail,
      locale,
    )

    // Send status email
    const result = await sendOrderStatusEmail(emailData, emailType, issueDescription, { supabaseClient: supabase })

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Failed to send email',
      })
    }

    return {
      success: true,
      message: `${emailType} email sent successfully`,
      emailLogId: result.emailLogId,
      externalId: result.externalId,
    }
  }
  catch (error: any) {
    console.error('Error sending order status email:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send order status email',
    })
  }
})
