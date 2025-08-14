export default defineEventHandler(async (event) => {
  try {
    // Parse multipart form data
    const form = await readMultipartFormData(event)
    
    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }
    
    const file = form[0]
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.'
      })
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.data.length > maxSize) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File too large. Maximum size is 5MB.'
      })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = file.filename?.split('.').pop() || 'jpg'
    const filename = `products/${timestamp}-${randomString}.${extension}`
    
    // Upload to NuxtHub Blob (R2 in production, local in development)
    const blob = hubBlob()
    const uploaded = await blob.put(filename, file.data, {
      contentType: file.type,
      customMetadata: {
        uploadedBy: 'api',
        originalName: file.filename || 'unknown'
      }
    })
    
    // Return the URL for accessing the file
    return {
      success: true,
      url: uploaded.pathname,
      size: file.data.length,
      type: file.type
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload image'
    })
  }
})