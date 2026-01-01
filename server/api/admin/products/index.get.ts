/**
 * Admin Products API Endpoint
 *
 * Requirements addressed:
 * - 1.1: Paginated product listing with admin-specific data
 * - 1.7: Search functionality by name, category, and SKU
 * - 6.2: Performance optimization with proper pagination
 *
 * Features:
 * - Enhanced product data for admin interface
 * - Advanced filtering and sorting
 * - Pagination with performance optimization
 * - Search across multiple fields
 *
 * Performance:
 * - Cached for 60 seconds per unique query combination
 * - Cache invalidated on product mutations
 */

import { serverSupabaseClient } from '#supabase/server'
import { requireAdminRole } from '~/server/utils/adminAuth'
import { prepareSearchPattern, MAX_SEARCH_LENGTH } from '~/server/utils/searchSanitization'

// NOTE: Caching disabled for admin endpoints to ensure proper header-based authentication
export default defineEventHandler(async (event) => {
  // Authentication MUST happen first, never caught
  await requireAdminRole(event)

  const query = getQuery(event)

  // Parse query parameters with defaults and proper type conversion
  const search = query.search as string | undefined
  const categoryId = query.categoryId ? parseInt(query.categoryId as string) : undefined
  const active = query.active !== undefined ? query.active === 'true' || query.active === true : undefined
  const inStock = query.inStock === 'true' || query.inStock === true
  const outOfStock = query.outOfStock === 'true' || query.outOfStock === true
  const lowStock = query.lowStock === 'true' || query.lowStock === true
  const sortBy = (query.sortBy as 'name' | 'price' | 'stock' | 'created_at') || 'created_at'
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc'
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)

  // Validate search term length if provided
  if (search && search.length > MAX_SEARCH_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Search term too long. Maximum ${MAX_SEARCH_LENGTH} characters allowed.`,
    })
  }

  try {
    const supabase = await serverSupabaseClient(event)

    // Build the base query with admin-specific fields
    let queryBuilder = supabase
      .from('products')
      .select(`
        id,
        sku,
        name_translations,
        description_translations,
        price_eur,
        compare_at_price_eur,
        stock_quantity,
        low_stock_threshold,
        reorder_point,
        images,
        attributes,
        is_active,
        created_at,
        updated_at,
        categories (
          id,
          slug,
          name_translations
        )
      `)

    // Apply active/inactive filter
    if (active !== undefined) {
      queryBuilder = queryBuilder.eq('is_active', active)
    }

    // Apply category filter
    if (categoryId) {
      queryBuilder = queryBuilder.eq('categories.id', categoryId)
    }

    // Apply stock filters
    if (inStock === true) {
      queryBuilder = queryBuilder.gt('stock_quantity', 0)
    }
    else if (outOfStock === true) {
      queryBuilder = queryBuilder.eq('stock_quantity', 0)
    }
    else if (lowStock === true) {
      // Low stock is defined as stock <= low_stock_threshold (default 5)
      queryBuilder = queryBuilder.or('stock_quantity.lte.5,and(stock_quantity.gt.0,stock_quantity.lte.low_stock_threshold)')
    }

    // Apply search filter using PostgreSQL JSONB operators for better performance
    if (search) {
      // Sanitize search term to prevent SQL injection and escape special characters
      const searchPattern = prepareSearchPattern(search, { validateLength: false })
      queryBuilder = queryBuilder.or(
        `name_translations->>es.ilike.${searchPattern},`
        + `name_translations->>en.ilike.${searchPattern},`
        + `name_translations->>ro.ilike.${searchPattern},`
        + `name_translations->>ru.ilike.${searchPattern},`
        + `description_translations->>es.ilike.${searchPattern},`
        + `description_translations->>en.ilike.${searchPattern},`
        + `description_translations->>ro.ilike.${searchPattern},`
        + `description_translations->>ru.ilike.${searchPattern},`
        + `sku.ilike.${searchPattern}`,
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        // For JSONB fields, we'll sort in JavaScript after fetching
        break
      case 'price':
        queryBuilder = queryBuilder.order('price_eur', { ascending: sortOrder === 'asc' })
        break
      case 'stock':
        queryBuilder = queryBuilder.order('stock_quantity', { ascending: sortOrder === 'asc' })
        break
      case 'created_at':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: sortOrder === 'asc' })
        break
    }

    // Get total count for pagination with same filters
    let countQueryBuilder = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (active !== undefined) {
      countQueryBuilder = countQueryBuilder.eq('is_active', active)
    }
    if (categoryId) {
      countQueryBuilder = countQueryBuilder.eq('categories.id', categoryId)
    }
    if (inStock === true) {
      countQueryBuilder = countQueryBuilder.gt('stock_quantity', 0)
    }
    else if (outOfStock === true) {
      countQueryBuilder = countQueryBuilder.eq('stock_quantity', 0)
    }
    else if (lowStock === true) {
      countQueryBuilder = countQueryBuilder.or('stock_quantity.lte.5,and(stock_quantity.gt.0,stock_quantity.lte.low_stock_threshold)')
    }
    if (search) {
      // Sanitize search term to prevent SQL injection and escape special characters
      const searchPattern = prepareSearchPattern(search, { validateLength: false })
      countQueryBuilder = countQueryBuilder.or(
        `name_translations->>es.ilike.${searchPattern},`
        + `name_translations->>en.ilike.${searchPattern},`
        + `name_translations->>ro.ilike.${searchPattern},`
        + `name_translations->>ru.ilike.${searchPattern},`
        + `description_translations->>es.ilike.${searchPattern},`
        + `description_translations->>en.ilike.${searchPattern},`
        + `description_translations->>ro.ilike.${searchPattern},`
        + `description_translations->>ru.ilike.${searchPattern},`
        + `sku.ilike.${searchPattern}`,
      )
    }

    const { count, error: countError } = await countQueryBuilder

    if (countError) {
      console.error('[Admin Products] Count query failed:', {
        error: countError.message,
        code: countError.code,
        timestamp: new Date().toISOString(),
        errorId: 'ADMIN_PRODUCTS_COUNT_FAILED',
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count products',
        data: { canRetry: true },
      })
    }

    const totalCount = count || 0

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: products, error } = await queryBuilder

    if (error) {
      console.error('[Admin Products] Query failed:', {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
        errorId: 'ADMIN_PRODUCTS_FETCH_FAILED',
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: { canRetry: true },
      })
    }

    // Transform and sort products
    const transformedProducts = (products || []).map((product: any) => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku?.toLowerCase() || `product-${product.id}`,
      name: product.name_translations,
      description: product.description_translations,
      price: product.price_eur,
      comparePrice: product.compare_at_price_eur,
      stockQuantity: product.stock_quantity,
      lowStockThreshold: product.low_stock_threshold || 5,
      reorderPoint: product.reorder_point || 10,
      stockStatus: product.stock_quantity > (product.low_stock_threshold || 5)
        ? 'high'
        : product.stock_quantity > 0 ? 'low' : 'out',
      images: Array.isArray(product.images)
        ? product.images.map((img: any, index: number) => ({
            url: img.url || img,
            altText: img.alt || img.alt_text || product.name_translations,
            isPrimary: img.is_primary || index === 0,
          }))
        : [],
      category: product.categories
        ? {
            id: product.categories.id,
            slug: product.categories.slug,
            name: product.categories.name_translations,
          }
        : null,
      attributes: product.attributes || {},
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }))

    // Sort by name if requested (since we can't sort JSONB in SQL easily)
    if (sortBy === 'name') {
      transformedProducts.sort((a, b) => {
        const aName = Object.values(a.name || {})[0] as string || ''
        const bName = Object.values(b.name || {})[0] as string || ''
        const comparison = aName.localeCompare(bName)
        return sortOrder === 'asc' ? comparison : -comparison
      })
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    return {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        search,
        categoryId,
        active,
        inStock,
        outOfStock,
        lowStock,
        sortBy,
        sortOrder,
      },
    }
  }
  catch (error: unknown) {
    // Re-throw HTTP errors (including auth errors)
    if (isH3Error(error)) {
      throw error
    }

    // Log unexpected errors
    console.error('[Admin Products] Unexpected error:', {
      error: getServerErrorMessage(error),
      stack: isServerError(error) ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      errorId: 'ADMIN_PRODUCTS_UNEXPECTED_ERROR',
    })

    // Throw generic 500 error for unexpected failures
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while fetching products',
      data: { canRetry: true },
    })
  }
})
