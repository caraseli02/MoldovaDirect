// POST /api/checkout/send-confirmation - Send order confirmation email
import { createClient } from '@supabase/supabase-js'
import { sendEmail, generateOrderConfirmationEmailHtml } from '~/server/utils/email'

interface SendConfirmationRequest {
  orderId: number
  sessionId: string
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey
    )

    // Parse request body
    const body = await readBody(event) as SendConfirmationRequest

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

    // Determine recipient email
    let recipientEmail = order.guest_email
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

    if (!recipientEmail) {
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

    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmailHtml(
      recipientName,
      order,
      locale
    )

    // Get subject line based on locale
    const subjects = {
      es: `Confirmación de pedido #${order.order_number} - Moldova Direct`,
      en: `Order confirmation #${order.order_number} - Moldova Direct`,
      ro: `Confirmare comandă #${order.order_number} - Moldova Direct`,
      ru: `Подтверждение заказа #${order.order_number} - Moldova Direct`
    }

    const subject = subjects[locale as keyof typeof subjects] || subjects.es

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html: emailHtml
    })

    return {
      success: true,
      message: 'Confirmation email sent successfully',
      emailId: result.id
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
