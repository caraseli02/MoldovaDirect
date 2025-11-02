import { serverSupabaseClient } from '#supabase/server'
import type { ReorderSectionsRequest } from '~/types'

/**
 * POST /api/landing/sections/reorder
 *
 * Reorder landing page sections (change display_order)
 *
 * Requires: Admin role
 *
 * Body: ReorderSectionsRequest
 *
 * Returns: { success: boolean, message: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)

    // Check admin role
    await requireAdmin(event)

    // Parse request body
    const body = await readBody<ReorderSectionsRequest>(event)

    // Validate required fields
    if (!body.section_id || body.new_order === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - section_id and new_order are required'
      })
    }

    // Call the database function to reorder
    const { error } = await supabase.rpc('reorder_landing_sections', {
      p_section_id: body.section_id,
      p_new_order: body.new_order
    })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to reorder landing sections',
        data: error
      })
    }

    return {
      success: true,
      message: 'Landing sections reordered successfully'
    }
  } catch (error: any) {
    console.error('Error reordering landing sections:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to reorder landing sections',
      data: error.data || error
    })
  }
})
