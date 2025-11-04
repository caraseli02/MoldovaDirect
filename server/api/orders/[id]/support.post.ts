// POST /api/orders/[id]/support - Create support ticket for an order
import { serverSupabaseServiceRole } from '#supabase/server'
import { sendSupportTicketCustomerEmail, sendSupportTicketStaffEmail } from '~/server/utils/supportEmails'
import type { SupportTicketData } from '~/server/utils/emailTemplates/supportTicketTemplates'

interface SupportTicketRequest {
  subject: string
  category: 'order_status' | 'shipping' | 'product_issue' | 'payment' | 'return' | 'other'
  message: string
  priority?: 'low' | 'medium' | 'high'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get user from session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid authentication'
      })
    }

    // Get order ID from route params
    const orderId = getRouterParam(event, 'id')
    if (!orderId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order ID is required'
      })
    }

    // Parse request body
    const body = await readBody(event) as SupportTicketRequest

    // Validate required fields
    if (!body.subject || body.subject.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Subject is required'
      })
    }

    if (!body.message || body.message.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message is required'
      })
    }

    if (!body.category) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category is required'
      })
    }

    const validCategories = ['order_status', 'shipping', 'product_issue', 'payment', 'return', 'other']
    if (!validCategories.includes(body.category)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid category'
      })
    }

    // Fetch order - verify ownership
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_eur,
        created_at,
        shipping_address,
        tracking_number,
        carrier,
        order_items (
          id,
          product_snapshot,
          quantity,
          price_eur
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch order'
      })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email, phone')
      .eq('id', user.id)
      .single()

    // Build order context for support ticket
    const orderContext = {
      orderId: order.id,
      orderNumber: order.order_number,
      orderStatus: order.status,
      orderTotal: order.total_eur,
      orderDate: order.created_at,
      trackingNumber: order.tracking_number,
      carrier: order.carrier,
      itemCount: order.order_items?.length || 0,
      shippingAddress: order.shipping_address
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        order_id: parseInt(orderId),
        subject: body.subject.trim(),
        category: body.category,
        priority: body.priority || 'medium',
        message: body.message.trim(),
        status: 'open',
        order_context: orderContext,
        customer_name: profile?.name || 'Unknown',
        customer_email: profile?.email || user.email,
        customer_phone: profile?.phone || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (ticketError) {
      // If table doesn't exist, create it
      if (ticketError.code === '42P01') {
        throw createError({
          statusCode: 503,
          statusMessage: 'Support system is not yet configured. Please contact us directly.'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create support ticket'
      })
    }

    // Get user's preferred locale
    let locale = 'en'
    if (profile?.preferred_locale) {
      locale = profile.preferred_locale
    }

    // Prepare support ticket email data
    const ticketEmailData: SupportTicketData = {
      ticketNumber: `TICKET-${ticket.id}`,
      customerName: profile?.name || 'Customer',
      customerEmail: profile?.email || user.email || '',
      subject: ticket.subject,
      category: ticket.category,
      priority: ticket.priority,
      message: ticket.message,
      orderNumber: order.order_number,
      orderStatus: order.status,
      orderTotal: order.total_eur,
      locale
    }

    // Send confirmation email to customer
    const customerEmailResult = await sendSupportTicketCustomerEmail(
      ticketEmailData,
      ticket.id,
      order.id,
      { supabaseClient: supabase }
    )

    if (!customerEmailResult.success) {
      console.error('Failed to send customer confirmation email:', customerEmailResult.error)
    }

    // Send notification email to support team
    // Get support email from environment or use default
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@moldovadirect.com'

    const staffEmailResult = await sendSupportTicketStaffEmail(
      ticketEmailData,
      ticket.id,
      supportEmail,
      order.id,
      { supabaseClient: supabase }
    )

    if (!staffEmailResult.success) {
      console.error('Failed to send staff notification email:', staffEmailResult.error)
    }

    return {
      success: true,
      data: {
        ticketId: ticket.id,
        ticketNumber: `TICKET-${ticket.id}`,
        orderId: order.id,
        orderNumber: order.order_number,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.created_at,
        message: 'Support ticket created successfully. Our team will respond within 24 hours.',
        expectedResponseTime: '24 hours',
        contactMethods: [
          'You will receive updates via email',
          'You can view ticket status in your account',
          'For urgent matters, please call our support line'
        ]
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Support ticket creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
