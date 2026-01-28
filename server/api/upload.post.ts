/**
 * POST /api/upload
 *
 * Upload product images to Supabase Storage.
 * - Requires admin authentication
 * - Validates file type (images only)
 * - Validates file size (max 5MB)
 * - Uploads to 'product-images' bucket
 * - Returns public URL
 *
 * Related: docs/image-upload-plan.md
 */

import { createSupabaseClient } from '~/server/utils/supabaseAdminClient'
import { requireAdmin } from '~/server/utils/adminAuth'

// Allowed image MIME types
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  // Require admin authentication
  await requireAdmin(event)

  // Parse multipart form data
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No file provided',
    })
  }

  // Find the file field
  const fileField = formData.find(field => field.name === 'file')

  if (!fileField || !fileField.data) {
    throw createError({
      statusCode: 400,
      message: 'No file provided',
    })
  }

  const { data: fileData, type: contentType } = fileField

  // Validate file type
  if (!contentType || !ALLOWED_TYPES.includes(contentType)) {
    throw createError({
      statusCode: 400,
      message: `Invalid file type. Only images are allowed (${ALLOWED_TYPES.join(', ')})`,
    })
  }

  // Validate file size
  if (fileData.length > MAX_FILE_SIZE) {
    throw createError({
      statusCode: 400,
      message: `File size exceeds 5MB limit (${(fileData.length / 1024 / 1024).toFixed(2)}MB)`,
    })
  }

  // Generate unique file path
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 10)
  const extension = getExtension(contentType)
  const filePath = `products/${timestamp}-${randomId}.${extension}`

  // Upload to Supabase Storage
  const supabase = createSupabaseClient()

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, fileData, {
      contentType,
      upsert: false,
    })

  if (error) {
    console.error('[Upload] Supabase storage error:', error)
    throw createError({
      statusCode: 500,
      message: `Upload failed: ${error.message}`,
    })
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath,
  }
})

/**
 * Get file extension from MIME type
 */
function getExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  }
  return extensions[mimeType] || 'jpg'
}
