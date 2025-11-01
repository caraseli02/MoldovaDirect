import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

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
    const user = await serverSupabaseUser(event)
    const id = getRouterParam(event, 'id')

    // Check authentication
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Authentication required'
      })
    }

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('raw_user_meta_data')
      .eq('id', user.id)
      .single()

    if (!userData || userData.raw_user_meta_data?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Admin role required'
      })
    }

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - Section ID is required'
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
        data: error
      })
    }

    return {
      success: true,
      message: 'Landing section deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to delete landing section',
      data: error.data || error
    })
  }
})
