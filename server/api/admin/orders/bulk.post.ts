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
import { z } from 'zod'

// Zod schema for bulk order update request validation
const bulkOrderSchema = z.object({
  orderIds: z.array(z.number().int().positive())
    .min(1, 'Order IDs are required')
    .max(100, 'Cannot update more than 100 orders at once'),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    message: 'Invalid status',
  }),
  notes: z.string().optional(),
})

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

    // Parse and validate request body with Zod
    const rawBody = await readBody(event)
    const validation = bulkOrderSchema.safeParse(rawBody)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validation.error.issues[0]?.message || 'Invalid request body',
        data: validation.error.issues,
      })
    }

    const body = validation.data

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
      catch (error: any) {
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
  catch (error: any) {
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
