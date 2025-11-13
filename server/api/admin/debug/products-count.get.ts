import { serverSupabaseServiceRole } from '#supabase/server'
import { requireAdminRole, logAdminAction } from '~/server/utils/adminAuth'

interface ProductCountsResponse {
  success: true
  counts: {
    totalProducts: number
    activeProducts: number
    productsWithCategories: number
    productsWithoutCategories: number
    activeCategories: number
  }
  sampleProducts: Array<{
    id: number
    name: string
    has_category: boolean
    is_active: boolean
  }>
}

/**
 * Admin debug endpoint to check product counts in database
 *
 * @endpoint GET /api/admin/debug/products-count
 * @auth Requires active admin session
 *
 * Returns diagnostic information about products and categories in the database.
 * Useful for troubleshooting empty product listings or category issues.
 *
 * @returns {ProductCountsResponse} Database statistics and sample products
 * @throws {401} Unauthorized - No valid session
 * @throws {403} Forbidden - User is not admin
 * @throws {500} Internal Server Error - Database query failed
 */
export default defineEventHandler(async (event): Promise<ProductCountsResponse> => {
  try {
    // Verify admin authentication
    const adminId = await requireAdminRole(event)

    // Log debug endpoint access for security audit
    await logAdminAction(event, adminId, 'debug_products_count_accessed', {
      resource_type: 'debug_endpoint',
      endpoint: '/api/admin/debug/products-count',
      ip_address: getRequestIP(event)
    })

    const supabase = serverSupabaseServiceRole(event)

    // Execute queries in parallel for better performance (2 queries instead of 6)
    const [countsResult, samplesResult, categoriesResult] = await Promise.all([
      // Query 1: Get all product counts in single query
      supabase
        .from('products')
        .select('is_active, category_id', { count: 'exact' }),

      // Query 2: Get sample products
      supabase
        .from('products')
        .select('id, name_translations, category_id, is_active')
        .eq('is_active', true)
        .limit(3),

      // Query 3: Get categories count
      supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
    ])

    // Calculate counts from data (fast for small datasets)
    const products = countsResult.data || []
    const totalProducts = countsResult.count || 0
    const activeProducts = products.filter(p => p.is_active).length
    const productsWithCategories = products.filter(p => p.is_active && p.category_id !== null).length
    const productsWithoutCategories = products.filter(p => p.is_active && p.category_id === null).length

    // Sanitize sample products (remove sensitive fields)
    const sanitizedSamples = (samplesResult.data || []).map(product => ({
      id: product.id,
      name: product.name_translations?.es || product.name_translations?.en || 'Unknown',
      has_category: !!product.category_id,
      is_active: product.is_active
    }))

    return {
      success: true,
      counts: {
        totalProducts,
        activeProducts,
        productsWithCategories,
        productsWithoutCategories,
        activeCategories: categoriesResult.count || 0
      },
      sampleProducts: sanitizedSamples
    }

  } catch (error) {
    console.error('[Debug Endpoint Error]', {
      endpoint: 'products-count',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    // Preserve HTTP errors from auth
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve product counts'
    })
  }
})
