import { serverSupabaseClient } from '#supabase/server'
import { z } from 'zod'
import type { GetSectionResponse, LandingSectionRow } from '~/types'

// Valid section types as per SQL schema
const VALID_SECTION_TYPES = [
  'announcement_bar',
  'hero_carousel',
  'hero_slide',
  'category_grid',
  'featured_products',
  'collections_showcase',
  'social_proof',
  'how_it_works',
  'services',
  'newsletter',
  'faq_preview',
  'promotional_banner',
  'flash_sale',
] as const

// Zod schema for create section request validation
const createSectionSchema = z.object({
  section_type: z.enum(VALID_SECTION_TYPES, {
    message: `Invalid section_type. Must be one of: ${VALID_SECTION_TYPES.join(', ')}`,
  }),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional().default(true),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  translations: z.record(z.string(), z.unknown()).refine(
    val => Object.keys(val).length > 0,
    { message: 'translations are required' },
  ),
  config: z.record(z.string(), z.unknown()).refine(
    val => val !== undefined && val !== null,
    { message: 'config is required' },
  ),
})

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

    // Check admin role
    const { user } = await requireAdmin(event)

    // Parse and validate request body with Zod
    const rawBody = await readBody(event)
    const validation = createSectionSchema.safeParse(rawBody)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bad Request - ${validation.error.issues[0]?.message || 'Invalid request body'}`,
        data: validation.error.issues,
      })
    }

    const body = validation.data

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
        updated_by: user.id,
      })
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create landing section',
        data: error,
      })
    }

    return {
      section: data as LandingSectionRow,
    }
  }
  catch (error: unknown) {
    console.error('Error creating landing section:', getServerErrorMessage(error))

    if (isH3Error(error)) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create landing section',
    })
  }
})
