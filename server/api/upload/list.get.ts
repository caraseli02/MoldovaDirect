export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const { prefix = 'products/', limit = 20 } = getQuery(event)
    
    // Access NuxtHub Blob storage
    const blob = hubBlob()
    
    // List files with the given prefix
    const { blobs } = await blob.list({
      prefix: prefix as string,
      limit: Number(limit)
    })
    
    // Format the response
    const files = blobs.map(file => ({
      pathname: file.pathname,
      size: file.size,
      uploadedAt: file.uploadedAt,
      contentType: file.httpMetadata?.contentType,
      customMetadata: file.customMetadata
    }))
    
    return {
      success: true,
      files,
      count: files.length
    }
  } catch (error) {
    console.error('List files error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to list files'
    })
  }
})