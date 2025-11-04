/**
 * API endpoint to update order status and send notification email
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { serverSupabaseClient } from '#supabase/server'
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
        statusMessage: 'Order ID is required'
      })
    }

    // Get request body
    const body = await readBody(event)
    const { 
      status, 
      trackingNumber, 
      carrier, 
      estimatedDelivery,
      sendEmail = true,
      issueDescription 
    } = body as {
      status: string
      trackingNumber?: string
      carrier?: string
      estimatedDelivery?: string
      sendEmail?: boolean
      issueDescription?: string
    }

    if (!status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status is required'
      })
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    // Prepare update data
    const updateData: any = { status }
    
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber
    }
    
    if (carrier) {
      updateData.carrier = carrier
    }
    
    if (estimatedDelivery) {
      updateData.estimated_delivery = estimatedDelivery
    }
    
    // Add timestamp fields based on status
    if (status === 'shipped' && !updateData.shipped_at) {
      updateData.shipped_at = new Date().toISOString()
    } else if (status === 'delivered' && !updateData.delivered_at) {
      updateData.delivered_at = new Date().toISOString()
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select(`
        *,
        order_items:order_items(*)
      `)
      .single()

    if (updateError || !updatedOrder) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update order status'
      })
    }

    // Send email notification if requested
    let emailResult = null
    if (sendEmail) {
      // Determine email type based on status
      let emailType: EmailType | null = null
      
      switch (status) {
        case 'processing':
          emailType = 'order_processing'
          break
        case 'shipped':
          emailType = 'order_shipped'
          break
        case 'delivered':
          emailType = 'order_delivered'
          break
        case 'cancelled':
          emailType = 'order_cancelled'
          break
      }

      if (emailType) {
        // Get customer information
        let customerName = 'Customer'
        let customerEmail = ''
        let locale = 'en'

        if (updatedOrder.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, preferred_locale')
            .eq('id', updatedOrder.user_id)
            .single()

          if (profile) {
            customerName = profile.full_name || 'Customer'
            customerEmail = profile.email
            locale = profile.preferred_locale || 'en'
          }
        } else if (updatedOrder.guest_email) {
          customerEmail = updatedOrder.guest_email
          const shippingAddr = updatedOrder.shipping_address
          if (shippingAddr) {
            customerName = `${shippingAddr.firstName || ''} ${shippingAddr.lastName || ''}`.trim() || 'Customer'
          }
        }

        if (customerEmail) {
          // Transform order data for email
          const emailData = transformOrderToEmailData(
            updatedOrder,
            customerName,
            customerEmail,
            locale
          )

          // Send status email
          try {
            emailResult = await sendOrderStatusEmail(emailData, emailType, issueDescription, { supabaseClient: supabase })
          } catch (emailError: any) {
            console.error('Failed to send status email:', emailError)
            // Don't fail the entire request if email fails
            emailResult = {
              success: false,
              error: emailError.message
            }
          }
        }
      }
    }

    return {
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.tracking_number,
        carrier: updatedOrder.carrier,
        estimatedDelivery: updatedOrder.estimated_delivery
      },
      email: emailResult ? {
        sent: emailResult.success,
        emailLogId: emailResult.emailLogId,
        error: emailResult.error
      } : null
    }
  } catch (error: any) {
    console.error('Error updating order status:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update order status'
    })
  }
})
