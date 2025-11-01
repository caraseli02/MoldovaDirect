import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { CreateSectionRequest, GetSectionResponse, LandingSectionRow } from '~/types'

/**
 * POST /api/landing/sections
 *
 * Create a new landing page section
 *
 * Requires: Admin role
 *
 * Body: CreateSectionRequest
 *
 * Returns: GetSectionResponse
 */
export default defineEventHandler(async (event): Promise<GetSectionResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

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

    // Parse request body
    const body = await readBody<CreateSectionRequest>(event)

    // Validate required fields
    if (!body.section_type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - section_type is required'
      })
    }

    if (!body.translations || Object.keys(body.translations).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - translations are required'
      })
    }

    if (!body.config) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - config is required'
      })
    }

    // Get the highest display_order if not provided
    let displayOrder = body.display_order
    if (displayOrder === undefined) {
      const { data: maxOrderData } = await supabase
        .from('landing_sections')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      displayOrder = maxOrderData ? maxOrderData.display_order + 1 : 0
    }

    // Insert the new section
    const { data, error } = await supabase
      .from('landing_sections')
      .insert({
        section_type: body.section_type,
        display_order: displayOrder,
        is_active: body.is_active ?? true,
        starts_at: body.starts_at || null,
        ends_at: body.ends_at || null,
        translations: body.translations,
        config: body.config,
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create landing section',
        data: error
      })
    }

    return {
      section: data as LandingSectionRow
    }
  } catch (error: any) {
    console.error('Error creating landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create landing section',
      data: error.data || error
    })
  }
})
