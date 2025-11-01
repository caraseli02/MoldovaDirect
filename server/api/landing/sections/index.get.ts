import { serverSupabaseClient } from '#supabase/server'
import type { GetSectionsQuery, GetSectionsResponse, LandingSectionRow } from '~/types'

/**
 * GET /api/landing/sections
 *
 * Retrieve landing page sections with optional filtering
 *
 * Query Parameters:
 * - locale: Language code (es, en, ro, ru) - default: 'es'
 * - active_only: Boolean - Only return active sections - default: true
 * - section_type: Filter by section type
 * - include_scheduled: Include scheduled sections (not yet active) - default: false
 *
 * Returns: GetSectionsResponse
 */
export default defineEventHandler(async (event): Promise<GetSectionsResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event) as Partial<GetSectionsQuery>

    const locale = (query.locale || 'es') as 'es' | 'en' | 'ro' | 'ru'
    const activeOnly = query.active_only !== 'false' // Default true
    const sectionType = query.section_type
    const includeScheduled = query.include_scheduled === 'true' // Default false

    // Build query
    let queryBuilder = supabase
      .from('landing_sections')
      .select('*')
      .order('display_order', { ascending: true })

    // Filter by section type if specified
    if (sectionType) {
      queryBuilder = queryBuilder.eq('section_type', sectionType)
    }

    // Filter by active status
    if (activeOnly) {
      queryBuilder = queryBuilder.eq('is_active', true)

      // Filter by schedule if not including scheduled sections
      if (!includeScheduled) {
        const now = new Date().toISOString()

        // starts_at is null OR starts_at <= now
        queryBuilder = queryBuilder.or(`starts_at.is.null,starts_at.lte.${now}`)

        // ends_at is null OR ends_at >= now
        queryBuilder = queryBuilder.or(`ends_at.is.null,ends_at.gte.${now}`)
      }
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch landing sections',
        data: error
      })
    }

    return {
      sections: (data as LandingSectionRow[]) || [],
      total: count || data?.length || 0,
      locale
    }
  } catch (error: any) {
    console.error('Error fetching landing sections:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch landing sections',
      data: error.data || error
    })
  }
})
