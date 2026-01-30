/**
 * DELETE /api/upload
 *
 * Delete product images from Supabase Storage.
 * - Requires admin authentication
 * - Validates path parameter
 * - Removes file from 'product-images' bucket
 *
 * Related: docs/image-upload-plan.md
 */

import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  // Require admin authentication
  await requireAdmin(event)

  // Parse request body
  const body = await readBody(event)

  if (!body?.path) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: path',
    })
  }

  const { path } = body

  // Validate path format (prevent directory traversal)
  if (path.includes('..') || !path.startsWith('products/')) {
    throw createError({
      statusCode: 400,
      message: 'Invalid path format',
    })
  }

  // Delete from Supabase Storage
  const supabase = createSupabaseClient()

  const { error } = await supabase.storage
    .from('product-images')
    .remove([path])

  if (error) {
    console.error('[Upload] Delete error:', error)
    throw createError({
      statusCode: 500,
      message: `Delete failed: ${error.message}`,
    })
  }

  return {
    success: true,
    path,
  }
})
