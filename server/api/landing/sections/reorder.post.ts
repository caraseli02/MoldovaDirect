import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'

// Zod schema for reorder sections request validation
const reorderSectionsSchema = z.object({
  section_id: z.number().int().positive('section_id is required'),
  new_order: z.number().int().min(0, 'new_order must be a non-negative integer'),
})

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

    // Parse and validate request body with Zod
    const rawBody = await readBody(event)
    const validation = reorderSectionsSchema.safeParse(rawBody)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bad Request - ${validation.error.issues[0]?.message || 'section_id and new_order are required'}`,
        data: validation.error.issues,
      })
    }

    const body = validation.data

    // Call the database function to reorder
    const { error } = await supabase.rpc('reorder_landing_sections', {
      p_section_id: body.section_id,
      p_new_order: body.new_order,
    })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to reorder landing sections',
        data: error,
      })
    }

    return {
      success: true,
      message: 'Landing sections reordered successfully',
    }
  }
  catch (error: any) {
    console.error('Error reordering landing sections:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to reorder landing sections',
      data: error.data || error,
    })
  }
})
