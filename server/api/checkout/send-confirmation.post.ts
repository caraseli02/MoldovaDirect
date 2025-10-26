// POST /api/checkout/send-confirmation - Send order confirmation email
import { serverSupabaseServiceRole } from '#supabase/server'
import { sendOrderConfirmationEmail } from '~/server/utils/orderEmails'
import { transformOrderToEmailData } from '~/server/utils/orderDataTransform'
import type { DatabaseOrder } from '~/server/utils/emailTemplates/types'

interface SendConfirmationRequest {
  orderId: number
  sessionId: string
  email?: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody(event) as SendConfirmationRequest

    console.log('[Checkout API] send-confirmation request received', {
      orderId: body.orderId,
      sessionId: body.sessionId,
      payloadEmail: body.email
    })

    // Validate required fields
    if (!body.orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required field: orderId'
      })
    }

    // Get order details with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .eq('id', body.orderId)
      .single()

    if (orderError || !order) {
      console.error('Order not found:', orderError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      })
    }

    console.log('[Checkout API] send-confirmation order loaded', {
      orderId: order.id,
      orderNumber: order.order_number,
      guestEmail: order.guest_email,
      userId: order.user_id
    })

    // Determine recipient email
    let recipientEmail = order.guest_email || body.email || null
    let recipientName = order.shipping_address?.firstName || 'Customer'

    // If user is authenticated, get their email from auth
    if (order.user_id) {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(order.user_id)
      
      if (!userError && user) {
        recipientEmail = user.email
        
        // Try to get name from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', order.user_id)
          .single()
        
        if (profile?.name) {
          recipientName = profile.name
        }
      }
    }

    console.log('[Checkout API] send-confirmation recipient resolution', {
      recipientEmail,
      recipientName,
      orderId: order.id
    })

    if (!recipientEmail) {
      console.error('[Checkout API] send-confirmation missing email', {
        orderId: order.id,
        guestEmail: order.guest_email,
        payloadEmail: body.email
      })
      throw createError({
        statusCode: 400,
        statusMessage: 'No email address found for order'
      })
    }

    // Determine locale from user profile or default to 'es'
    let locale = 'es'
    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', order.user_id)
        .single()
      
      if (profile?.preferred_language) {
        locale = profile.preferred_language
      }
    }

    // Transform order data for template
    const emailData = transformOrderToEmailData(
      order as DatabaseOrder,
      recipientName,
      recipientEmail,
      locale
    )

    // Send email via template system
    const result = await sendOrderConfirmationEmail(emailData, { supabaseClient: supabase })

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Failed to send confirmation email'
      })
    }

    console.log('[Checkout API] send-confirmation success', {
      orderId: order.id,
      emailLogId: result.emailLogId,
      externalId: result.externalId
    })

    return {
      success: true,
      message: 'Confirmation email sent successfully',
      emailLogId: result.emailLogId,
      externalId: result.externalId
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Failed to send confirmation email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send confirmation email'
    })
  }
})
