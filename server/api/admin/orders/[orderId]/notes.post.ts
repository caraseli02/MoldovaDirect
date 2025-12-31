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
import { requireAdminRole } from '~/server/utils/adminAuth'
import { z } from 'zod'

// Zod schema for create note request validation
const createNoteSchema = z.object({
  noteType: z.enum(['internal', 'customer'], {
    message: 'Invalid note type. Must be "internal" or "customer"',
  }),
  content: z.string().min(1, 'Note content is required').trim(),
})

export default defineEventHandler(async (event) => {
  try {
    await requireAdminRole(event)
    // Get authenticated user from client session
    const supabaseClient = await serverSupabaseClient(event)
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Use service role for database operations
    const supabase = serverSupabaseServiceRole(event)

    // Get order ID from route params
    const orderId = parseInt(getRouterParam(event, 'orderId') || '0')

    if (!orderId || isNaN(orderId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order ID',
      })
    }

    // Parse and validate request body with Zod
    const rawBody = await readBody(event)
    const validation = createNoteSchema.safeParse(rawBody)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validation.error.issues[0]?.message || 'Invalid request body',
        data: validation.error.issues,
      })
    }

    const body = validation.data

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
