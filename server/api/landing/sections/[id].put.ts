import { serverSupabaseClient } from '#supabase/server'
import type { UpdateSectionRequest, GetSectionResponse, LandingSectionRow } from '~/types'

/**
 * PUT /api/landing/sections/[id]
 *
 * Update a landing page section
 *
 * Requires: Admin role
 *
 * Body: UpdateSectionRequest (partial)
 *
 * Returns: GetSectionResponse
 */
export default defineEventHandler(async (event): Promise<GetSectionResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'id')

    // Check admin role
    const { user } = await requireAdmin(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - Section ID is required',
      })
    }

    // Parse request body
    const body = await readBody<Partial<UpdateSectionRequest>>(event)

    // Build update object
    const updateData: unknown = {
      updated_by: user.id,
    }

    if (body.section_type !== undefined) updateData.section_type = body.section_type
    if (body.display_order !== undefined) updateData.display_order = body.display_order
    if (body.is_active !== undefined) updateData.is_active = body.is_active
    if (body.starts_at !== undefined) updateData.starts_at = body.starts_at || null
    if (body.ends_at !== undefined) updateData.ends_at = body.ends_at || null
    if (body.translations !== undefined) updateData.translations = body.translations
    if (body.config !== undefined) updateData.config = body.config

    // Update the section
    const { data, error } = await supabase
      .from('landing_sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Section not found',
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update landing section',
        data: error,
      })
    }

    return {
      section: data as LandingSectionRow,
    }
  }
  catch (error: unknown) {
    console.error('Error updating landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update landing section',
      data: error.data || error,
    })
  }
})
