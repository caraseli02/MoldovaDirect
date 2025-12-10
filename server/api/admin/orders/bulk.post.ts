/**
 * Bulk Order Operations API Endpoint
 *
 * Requirements addressed:
 * - 8.1: Bulk status update functionality
 * - 8.2: Batch processing with progress tracking
 * - 8.3: Progress indicators and error handling
 * - 8.4: Confirmation before executing changes
 *
 * Handles bulk operations on multiple orders:
 * - Status updates
 * - Error tracking for failed operations
 * - Summary reporting
 */

import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'

interface BulkUpdateRequest {
  orderIds: number[]
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes?: string
}

interface BulkUpdateResult {
  updated: number
  failed: number
  errors: Array<{ orderId: number, error: string }>
}

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export default defineEventHandler(async (event) => {
  try {
    // Verify admin authentication
    const userId = await requireAdminRole(event)

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Parse request body
    const body = await readBody<BulkUpdateRequest>(event)

    // Validate request
    if (!body.orderIds || !Array.isArray(body.orderIds) || body.orderIds.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order IDs are required',
      })
    }

    if (!body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status is required',
      })
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid status',
      })
    }

    // Limit bulk operations to reasonable size
    if (body.orderIds.length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot update more than 100 orders at once',
      })
    }

    // Fetch all orders to validate transitions
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .in('id', body.orderIds)

    if (fetchError) {
      console.error('Error fetching orders for bulk update:', fetchError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders',
      })
    }

    // Track results
    const result: BulkUpdateResult = {
      updated: 0,
      failed: 0,
      errors: [],
    }

    // Process each order
    for (const order of orders) {
      try {
        // Validate status transition
        const allowedTransitions = VALID_TRANSITIONS[order.status] || []
        if (!allowedTransitions.includes(body.status)) {
          result.failed++
          result.errors.push({
            orderId: order.id,
            error: `Cannot transition from ${order.status} to ${body.status}`,
          })
          continue
        }

        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: body.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        if (updateError) {
          result.failed++
          result.errors.push({
            orderId: order.id,
            error: updateError.message,
          })
          continue
        }

        // Record status change in history
        const { error: historyError } = await supabase
          .from('order_status_history')
          .insert({
            order_id: order.id,
            from_status: order.status,
            to_status: body.status,
            changed_by: userId,
            changed_at: new Date().toISOString(),
            notes: body.notes || `Bulk status update to ${body.status}`,
            automated: false,
          })

        if (historyError) {
          console.error('Error recording status history:', historyError)
          // Don't fail the operation if history recording fails
        }

        result.updated++
      }
      catch (error) {
        result.failed++
        result.errors.push({
          orderId: order.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Generate summary message
    let message = `Successfully updated ${result.updated} order${result.updated !== 1 ? 's' : ''}`
    if (result.failed > 0) {
      message += `, ${result.failed} failed`
    }

    return {
      success: true,
      data: result,
      message,
    }
  }
  catch (error) {
    console.error('Bulk order update error:', error)

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update orders',
    })
  }
})
