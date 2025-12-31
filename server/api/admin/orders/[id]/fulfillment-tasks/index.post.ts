/**
 * POST /api/admin/orders/:id/fulfillment-tasks
 *
 * Create default fulfillment tasks for an order
 *
 * Requirements addressed:
 * - 4.1: Fulfillment checklist with picking, packing, and shipping stages
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    await requireAdminRole(event)

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID from route params
    const orderId = parseInt(getRouterParam(event, 'id') || '0')

    if (!orderId || isNaN(orderId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order ID',
      })
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Check if tasks already exist
    const { data: existingTasks, error: checkError } = await supabase
      .from('order_fulfillment_tasks')
      .select('id')
      .eq('order_id', orderId)

    if (checkError) {
      console.error('Error checking existing tasks:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing tasks',
      })
    }

    if (existingTasks && existingTasks.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Fulfillment tasks already exist for this order',
      })
    }

    // Create default fulfillment tasks
    const defaultTasks = [
      // Picking stage
      {
        order_id: orderId,
        task_type: 'picking',
        task_name: 'Pick all items from inventory',
        description:
          'Locate and collect all ordered items from warehouse shelves',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'picking',
        task_name: 'Verify item quantities',
        description: 'Confirm that picked quantities match order requirements',
        required: true,
        completed: false,
      },
      // Packing stage
      {
        order_id: orderId,
        task_type: 'packing',
        task_name: 'Select appropriate packaging',
        description: 'Choose box/envelope size based on items and fragility',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'packing',
        task_name: 'Pack items securely',
        description:
          'Wrap fragile items and arrange products safely in package',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'packing',
        task_name: 'Include packing slip',
        description:
          'Print and include order packing slip with customer details',
        required: true,
        completed: false,
      },
      // Quality check stage
      {
        order_id: orderId,
        task_type: 'quality_check',
        task_name: 'Verify order accuracy',
        description: 'Double-check that all items match the order',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'quality_check',
        task_name: 'Check package weight',
        description: 'Weigh package to ensure it matches expected weight',
        required: false,
        completed: false,
      },
      // Shipping stage
      {
        order_id: orderId,
        task_type: 'shipping',
        task_name: 'Generate shipping label',
        description: 'Create and print shipping label with carrier',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'shipping',
        task_name: 'Attach shipping label',
        description: 'Securely attach label to package exterior',
        required: true,
        completed: false,
      },
      {
        order_id: orderId,
        task_type: 'shipping',
        task_name: 'Hand off to carrier',
        description: 'Deliver package to shipping carrier or schedule pickup',
        required: true,
        completed: false,
      },
    ]

    // Insert tasks
    const { data: createdTasks, error: insertError } = await supabase
      .from('order_fulfillment_tasks')
      .insert(defaultTasks)
      .select()

    if (insertError) {
      console.error('Error creating fulfillment tasks:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create fulfillment tasks',
      })
    }

    return {
      success: true,
      data: createdTasks,
    }
  }
  catch (error: any) {
    console.error('Error in fulfillment tasks creation endpoint:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
