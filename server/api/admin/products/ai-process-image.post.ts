/**
 * AI Image Processing API Endpoint
 *
 * This endpoint calls the Supabase Edge Function to process product images
 * using free AI services (Hugging Face).
 *
 * @requires Admin authentication
 */

import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  const supabase = await getSupabaseServerClient(event)

  // Check admin authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Verify user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Forbidden: Admin access required',
    })
  }

  // Parse request body
  const body = await readBody(event)
  const { productId, imageUrl, operation, options = {} } = body

  // Validate inputs
  if (!imageUrl) {
    throw createError({
      statusCode: 400,
      message: 'imageUrl is required',
    })
  }

  if (!operation || !['background_removal', 'generation', 'enhancement', 'upscale'].includes(operation)) {
    throw createError({
      statusCode: 400,
      message: 'Valid operation is required (background_removal, generation, enhancement, upscale)',
    })
  }

  try {
    // Get Supabase URL and anon key
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabase.url
    const supabaseKey = config.public.supabase.key

    // Call Edge Function
    const response = await $fetch(`${supabaseUrl}/functions/v1/ai-image-processor`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        imageUrl,
        operation,
        options,
      }),
    })

    return {
      success: true,
      data: response,
    }

  } catch (error: any) {
    console.error('AI image processing error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to process image',
    })
  }
})

/**
 * Usage example:
 *
 * POST /api/admin/products/ai-process-image
 * {
 *   "productId": 1,
 *   "imageUrl": "https://example.com/product.jpg",
 *   "operation": "background_removal",
 *   "options": {
 *     "saveToProduct": true
 *   }
 * }
 */
