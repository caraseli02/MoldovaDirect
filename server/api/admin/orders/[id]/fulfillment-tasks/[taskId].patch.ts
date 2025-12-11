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
import { requireAdminRole } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    const userId = await requireAdminRole(event)

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID and task ID from params
    const orderId = parseInt(event.context.params?.id || '0')
    const taskId = parseInt(event.context.params?.taskId || '0')

    if (!orderId || !taskId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order ID or task ID',
      })
    }

    // Get request body
    const body = await readBody(event)
    const { completed } = body

    if (typeof completed !== 'boolean') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request body. "completed" must be a boolean',
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
        statusMessage: 'Fulfillment task not found',
      })
    }

    // Update the task
    const updateData: unknown = {
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      completed_by: completed ? userId : null,
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
        statusMessage: 'Failed to update fulfillment task',
      })
    }

    // Handle inventory updates for picking tasks
    if (existingTask.task_type === 'picking') {
      if (completed && !existingTask.completed) {
        // Task is being marked as completed (was incomplete before)
        // Use atomic RPC function to prevent race conditions (Issue #89)
        await updateInventoryForPickedItemsAtomic(supabase, orderId, userId)
      }
      else if (!completed && existingTask.completed) {
        // Task is being marked as incomplete (was completed before)
        // Use atomic RPC function to prevent race conditions (Issue #89)
        await rollbackInventoryForPickedItemsAtomic(supabase, orderId, userId)
      }
    }

    // Recalculate fulfillment progress for the order
    await updateOrderFulfillmentProgress(supabase, orderId)

    return {
      success: true,
      data: updatedTask,
    }
  }
  catch (error: unknown) {
    console.error('Error in fulfillment task update endpoint:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})

/**
 * Update inventory levels when picking tasks are completed (ATOMIC VERSION)
 * Requirement 4.2: Update inventory levels when items are picked
 *
 * Uses PostgreSQL RPC function with FOR UPDATE locking to prevent race conditions
 * All operations happen in a single database transaction (atomic)
 *
 * Related: Issue #89 (transaction fix), Issue #82 (test coverage)
 */
async function updateInventoryForPickedItemsAtomic(supabase: SupabaseClient, orderId: number, userId: string) {
  try {
    // Call atomic RPC function
    // This prevents race conditions by using FOR UPDATE row locking
    const { data, error } = await supabase
      .rpc('update_inventory_for_order_atomic', {
        p_order_id: orderId,
        p_user_id: userId,
      })

    if (error) {
      console.error('Error calling atomic inventory update:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to update inventory: ${error.message}`,
      })
    }

    // Data contains result of atomic operation (skipped or updated)
    return data
  }
  catch (error) {
    console.error('Error updating inventory atomically:', error)
    throw error
  }
}

/**
 * LEGACY FUNCTION - DO NOT USE
 * Kept for reference only. Use updateInventoryForPickedItemsAtomic instead.
 *
 * This function has race conditions:
 * - Read-modify-write pattern without locking
 * - Can lose updates with concurrent requests
 * - See Issue #82 tests for demonstration
 */
async function _updateInventoryForPickedItems_DEPRECATED(supabase: SupabaseClient, orderId: number, userId: string) {
  try {
    // Check if inventory has already been updated for this order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('inventory_updated, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order for inventory update:', orderError)
      return
    }

    // Skip if inventory was already updated
    if (order.inventory_updated) {
      return
    }

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
          created_by: userId,
        })

      if (logError) {
        console.error(`Error logging inventory change for product ${item.product_id}:`, logError)
      }
    }

    // Mark inventory as updated
    const { error: flagError } = await supabase
      .from('orders')
      .update({ inventory_updated: true })
      .eq('id', orderId)

    if (flagError) {
      console.error('Error setting inventory_updated flag:', flagError)
    }
  }
  catch (error) {
    console.error('Error updating inventory for picked items:', error)
  }
}

/**
 * Rollback inventory changes when a picking task is unchecked (ATOMIC VERSION)
 * Adds stock back to products and logs the reversal
 *
 * Uses PostgreSQL RPC function with FOR UPDATE locking to prevent race conditions
 * Only allows rollback if order hasn't been shipped yet
 *
 * Related: Issue #89 (transaction fix), Issue #82 (test coverage)
 */
async function rollbackInventoryForPickedItemsAtomic(supabase: SupabaseClient, orderId: number, userId: string) {
  try {
    // Call atomic RPC function
    const { data, error } = await supabase
      .rpc('rollback_inventory_for_order_atomic', {
        p_order_id: orderId,
        p_user_id: userId,
      })

    if (error) {
      console.error('Error calling atomic inventory rollback:', error)

      // Check if error is about shipped orders
      if (error.message && error.message.includes('Cannot rollback inventory for')) {
        throw createError({
          statusCode: 400,
          statusMessage: error.message,
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: `Failed to rollback inventory: ${error.message}`,
      })
    }

    // Data contains result of atomic rollback operation (skipped or rolled back)
    return data
  }
  catch (error) {
    console.error('Error rolling back inventory atomically:', error)
    throw error
  }
}

/**
 * LEGACY FUNCTION - DO NOT USE
 * Kept for reference only. Use rollbackInventoryForPickedItemsAtomic instead.
 *
 * This function has race conditions - see Issue #82 tests
 */
async function _rollbackInventoryForPickedItems_DEPRECATED(supabase: SupabaseClient, orderId: number, userId: string) {
  try {
    // Check if inventory was updated for this order and if order can be rolled back
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('inventory_updated, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('Error fetching order for inventory rollback:', orderError)
      return
    }

    // Only allow rollback if inventory was updated
    if (!order.inventory_updated) {
      return
    }

    // Prevent rollback if order has been shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      console.error(`Cannot rollback inventory for order ${orderId}: order already ${order.status}`)
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot uncheck picking tasks for ${order.status} orders`,
      })
    }

    // Get all order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId)

    if (itemsError || !orderItems) {
      console.error('Error fetching order items for inventory rollback:', itemsError)
      return
    }

    // Rollback inventory for each product
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

      // Add stock back
      const newStockQuantity = product.stock_quantity + item.quantity

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStockQuantity })
        .eq('id', item.product_id)

      if (updateError) {
        console.error(`Error rolling back product ${item.product_id} stock:`, updateError)
        continue
      }

      // Log inventory reversal
      const { error: logError } = await supabase
        .from('inventory_logs')
        .insert({
          product_id: item.product_id,
          quantity_change: item.quantity,
          quantity_after: newStockQuantity,
          reason: 'sale_reversal',
          reference_id: orderId,
          created_by: userId,
        })

      if (logError) {
        console.error(`Error logging inventory reversal for product ${item.product_id}:`, logError)
      }
    }

    // Reset inventory_updated flag
    const { error: flagError } = await supabase
      .from('orders')
      .update({ inventory_updated: false })
      .eq('id', orderId)

    if (flagError) {
      console.error('Error resetting inventory_updated flag:', flagError)
    }
  }
  catch (error) {
    console.error('Error rolling back inventory for picked items:', error)
    throw error
  }
}

/**
 * Recalculate and update order fulfillment progress
 * Requirement 4.1: Track fulfillment progress
 */
async function updateOrderFulfillmentProgress(supabase: SupabaseClient, orderId: number) {
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
    const completedCount = tasks.filter((t: unknown) => t.completed).length
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
  }
  catch (error) {
    console.error('Error calculating fulfillment progress:', error)
  }
}
