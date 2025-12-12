import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
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
export default defineCachedEventHandler(async (event): Promise<GetSectionsResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event) as Partial<GetSectionsQuery>

    // Validate and set locale
    const VALID_LOCALES = ['es', 'en', 'ro', 'ru'] as const
    const requestedLocale = query.locale || 'es'

    if (!VALID_LOCALES.includes(requestedLocale as unknown)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bad Request - Invalid locale. Must be one of: ${VALID_LOCALES.join(', ')}`,
      })
    }

    const locale = requestedLocale as 'es' | 'en' | 'ro' | 'ru'
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
        // Use the database function for correct schedule filtering
        // This function properly handles: (starts_at IS NULL OR starts_at <= now) AND (ends_at IS NULL OR ends_at >= now)
        const { data, error, count } = await supabase.rpc('get_active_landing_sections', {
          p_locale: locale,
        })

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch landing sections',
            data: error,
          })
        }

        return {
          sections: (data as LandingSectionRow[]) || [],
          total: count || data?.length || 0,
          locale,
        }
      }
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch landing sections',
        data: error,
      })
    }

    return {
      sections: (data as LandingSectionRow[]) || [],
      total: count || data?.length || 0,
      locale,
    }
  }
  catch (error: any) {
    console.error('Error fetching landing sections:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch landing sections',
      data: error.data || error,
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.landingSections.maxAge,
  name: PUBLIC_CACHE_CONFIG.landingSections.name,
  getKey: () => PUBLIC_CACHE_CONFIG.landingSections.name,
})
