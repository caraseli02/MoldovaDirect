/**
 * POST /api/admin/orders/:id/notes
 *
 * Create a new note for an order
 *
 * Requirements addressed:
 * - 7.1: Direct messaging functionality within order interface
 * - 7.2: Log all communications in order history
 */

import { serverSupabaseServiceRole, serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requireAdminRole } from '~/server/utils/adminAuth'

interface CreateNoteRequest {
  noteType: 'internal' | 'customer'
  content: string
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Get authenticated user from client session
    const supabaseClient = await serverSupabaseClient(event)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID from route params
    const orderId = parseInt(event.context.params?.id || '0')

    if (!orderId || isNaN(orderId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order ID',
      })
    }

    // Parse request body
    const body = await readBody<CreateNoteRequest>(event)

    // Validate request
    if (!body.content || body.content.trim().length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Note content is required',
      })
    }

    if (!body.noteType || !['internal', 'customer'].includes(body.noteType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid note type. Must be "internal" or "customer"',
      })
    }

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }

    // Create the note
    const { data: note, error: insertError } = await supabase
      .from('order_notes')
      .insert({
        order_id: orderId,
        note_type: body.noteType,
        content: body.content.trim(),
        created_by: user?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating order note:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create note',
      })
    }

    return {
      success: true,
      data: note,
      message: `${body.noteType === 'internal' ? 'Internal' : 'Customer'} note added successfully`,
    }
  }
  catch (error: any) {
    console.error('Error in order notes creation endpoint:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
})
