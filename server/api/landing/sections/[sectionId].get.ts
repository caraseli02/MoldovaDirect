import { serverSupabaseClient } from '#supabase/server'
import type { GetSectionResponse, LandingSectionRow } from '~/types'
import { PUBLIC_CACHE_CONFIG } from '~/server/utils/publicCache'

/**
 * GET /api/landing/sections/[id]
 *
 * Get a single landing page section by ID
 *
 * Returns: GetSectionResponse
 */
export default defineCachedEventHandler(async (event): Promise<GetSectionResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const id = getRouterParam(event, 'sectionId')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - Section ID is required',
      })
    }

    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .eq('id', id)
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
        statusMessage: 'Failed to fetch landing section',
        data: error,
      })
    }

    return {
      section: data as LandingSectionRow,
    }
  }
  catch (error: any) {
    console.error('Error fetching landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch landing section',
      data: error.data || error,
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.landingSections.maxAge,
  name: `${PUBLIC_CACHE_CONFIG.landingSections.name}-detail`,
  getKey: (event) => {
    const id = getRouterParam(event, 'sectionId')
    return `${PUBLIC_CACHE_CONFIG.landingSections.name}-${id}`
  },
})
