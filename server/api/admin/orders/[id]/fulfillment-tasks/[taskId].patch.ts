/**
 * PATCH /api/admin/orders/:id/fulfillment-tasks/:taskId
 * 
 * Update a fulfillment task (mark as completed/incomplete)
 * 
 * Requirements addressed:
 * - 4.1: Fulfillment checklist with task completion tracking
 * - 4.2: Update inventory levels when items are picked
 * - 4.4: Track completion timestamps and responsible admin
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminAuth } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    const user = await requireAdminAuth(event)
    
    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID and task ID from params
    const orderId = parseInt(event.context.params?.id || '0')
    const taskId = parseInt(event.context.params?.taskId || '0')

    if (!orderId || !taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order ID or task ID'
      })
    }

    // Get request body
    const body = await readBody(event)
    const { completed } = body

    if (typeof completed !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body. "completed" must be a boolean'
      })
    }

    // Fetch the task to verify it exists and belongs to this order
    const { data: existingTask, error: fetchError } = await supabase
      .from('order_fulfillment_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('order_id', orderId)
      .single()

    if (fetchError || !existingTask) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Fulfillment task not found'
      })
    }

    // Update the task
    const updateData: any = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? user.id : null
    }

    const { data: updatedTask, error: updateError } = await supabase
      .from('order_fulfillment_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating fulfillment task:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update fulfillment task'
      })
    }

    // If this is a picking task being marked as completed, update inventory
    if (completed && existingTask.task_type === 'picking') {
      await updateInventoryForPickedItems(supabase, orderId, user.id)
    }

    // Recalculate fulfillment progress for the order
    await updateOrderFulfillmentProgress(supabase, orderId)

    return {
      success: true,
      data: updatedTask
    }
  } catch (error: any) {
    console.error('Error in fulfillment task update endpoint:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

/**
 * Update inventory levels when picking tasks are completed
 * Requirement 4.2: Update inventory levels when items are picked
 */
async function updateInventoryForPickedItems(supabase: any, orderId: number, userId: string) {
  try {
    // Get all order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)

    if (itemsError || !orderItems) {
      console.error('Error fetching order items for inventory update:', itemsError)
      return
    }

    // Update inventory for each product
    for (const item of orderItems) {
      // Get current product stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) {
        console.error(`Error fetching product ${item.product_id}:`, productError)
        continue
      }

      // Calculate new stock quantity
      const newStockQuantity = Math.max(0, product.stock_quantity - item.quantity)

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', item.product_id)

      if (updateError) {
        console.error(`Error updating product ${item.product_id} stock:`, updateError)
        continue
      }

      // Log inventory change
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: item.product_id,
          quantity_change: -item.quantity,
          quantity_after: newStockQuantity,
          reason: 'sale',
          reference_id: orderId,
          created_by: userId
        })

      if (logError) {
        console.error(`Error logging inventory change for product ${item.product_id}:`, logError)
      }
    }
  } catch (error) {
    console.error('Error updating inventory for picked items:', error)
  }
}

/**
 * Recalculate and update order fulfillment progress
 * Requirement 4.1: Track fulfillment progress
 */
async function updateOrderFulfillmentProgress(supabase: any, orderId: number) {
  try {
    // Get all tasks for this order
    const { data: tasks, error: tasksError } = await supabase
      .from('order_fulfillment_tasks')
      .select('completed')
      .eq('order_id', orderId)

    if (tasksError || !tasks || tasks.length === 0) {
      return
    }

    // Calculate progress percentage
    const completedCount = tasks.filter((t: any) => t.completed).length
    const totalCount = tasks.length
    const progressPercentage = Math.round((completedCount / totalCount) * 100)

    // Update order fulfillment progress
    const { error: updateError } = await supabase
      .from('orders')
      .update({ fulfillment_progress: progressPercentage })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order fulfillment progress:', updateError)
    }
  } catch (error) {
    console.error('Error calculating fulfillment progress:', error)
  }
}
