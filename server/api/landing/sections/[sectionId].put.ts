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

// Zod schema for update section request validation (all fields optional)
const updateSectionSchema = z.object({
  section_type: z.enum(VALID_SECTION_TYPES).optional(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  translations: z.record(z.string(), z.unknown()).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
})

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
    const id = getRouterParam(event, 'sectionId')

    // Check admin role
    const { user } = await requireAdmin(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - Section ID is required',
      })
    }

    // Parse and validate request body with Zod
    const rawBody = await readBody(event)
    const validation = updateSectionSchema.safeParse(rawBody)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bad Request - ${validation.error.issues[0]?.message || 'Invalid request body'}`,
        data: validation.error.issues,
      })
    }

    const body = validation.data

    // Build update object
    const updateData: Record<string, any> = {
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
  catch (error: any) {
    console.error('Error updating landing section:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update landing section',
      data: error.data || error,
    })
  }
})
