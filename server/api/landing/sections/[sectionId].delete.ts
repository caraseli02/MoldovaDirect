import { serverSupabaseClient } from '#supabase/server'

/**
 * DELETE /api/landing/sections/[id]
 *
 * Delete a landing page section
 *
 * Requires: Admin role
 *
 * Returns: { success: boolean, message: string }
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'sectionId')

    // Check admin role
    await requireAdmin(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - Section ID is required',
      })
    }

    // Delete the section
    const { error } = await supabase
      .from('landing_sections')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete landing section',
        data: error,
      })
    }

    return {
      success: true,
      message: 'Landing section deleted successfully',
    }
  }
  catch (error: any) {
    console.error('Error deleting landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete landing section',
      data: error.data || error,
    })
  }
})
