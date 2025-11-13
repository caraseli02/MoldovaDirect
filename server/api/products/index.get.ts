import { serverSupabaseClient } from '#supabase/server'
import { prepareSearchPattern, MAX_SEARCH_LENGTH } from '~/server/utils/searchSanitization'
import { PUBLIC_CACHE_CONFIG, getPublicCacheKey } from '~/server/utils/publicCache'

interface ProductFilters {
  category?: string
  search?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  featured?: boolean
  sort?: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  limit?: number
}

interface ProductResponse {
  id: number
  sku: string
  name_translations: Record<string, string>
  description_translations: Record<string, string>
  price_eur: number
  stock_quantity: number
  images: any[]
  category: {
    id: number
    slug: string
    name_translations: Record<string, string>
  }
  is_active: boolean
  created_at: string
}

export default defineCachedEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event) as ProductFilters

    // Parse query parameters with defaults
    const {
      category,
      search,
      priceMin,
      priceMax,
      inStock,
      featured,
      sort = 'newest',
      page = 1,
      limit = 24
    } = query

    // Validate search term length if provided
    if (search && search.length > MAX_SEARCH_LENGTH) {
      throw createError({
        statusCode: 400,
        statusMessage: `Search term too long. Maximum ${MAX_SEARCH_LENGTH} characters allowed.`
      })
    }

    // Build the base query with count in single query for better performance
    // Use explicit LEFT JOIN (!left) to ensure products without categories are included
    // When filtering by category, use INNER JOIN (!inner) to only get products in that category
    const selectFields = category
      ? `
        id,
        sku,
        name_translations,
        description_translations,
        price_eur,
        compare_at_price_eur,
        stock_quantity,
        images,
        attributes,
        is_active,
        created_at,
        category_id,
        categories!inner (
          id,
          slug,
          name_translations
        )
      `
      : `
        id,
        sku,
        name_translations,
        description_translations,
        price_eur,
        compare_at_price_eur,
        stock_quantity,
        images,
        attributes,
        is_active,
        created_at,
        category_id,
        categories!left (
          id,
          slug,
          name_translations
        )
      `

    let queryBuilder = supabase
      .from('products')
      .select(selectFields, { count: 'exact' })
      .eq('is_active', true)

    // Apply category filter
    if (category) {
      queryBuilder = queryBuilder.eq('categories.slug', category)
    }

    // Apply price filters
    if (priceMin !== undefined) {
      queryBuilder = queryBuilder.gte('price_eur', priceMin)
    }
    if (priceMax !== undefined) {
      queryBuilder = queryBuilder.lte('price_eur', priceMax)
    }

    // Apply stock filter
    if (inStock === true) {
      queryBuilder = queryBuilder.gt('stock_quantity', 0)
    }

    // Apply search filter using PostgreSQL JSONB operators for better performance
    if (search) {
      // Sanitize search term to prevent SQL injection and escape special characters
      const searchPattern = prepareSearchPattern(search, { validateLength: false })
      queryBuilder = queryBuilder.or(
        `name_translations->>es.ilike.${searchPattern},` +
        `name_translations->>en.ilike.${searchPattern},` +
        `name_translations->>ro.ilike.${searchPattern},` +
        `name_translations->>ru.ilike.${searchPattern},` +
        `description_translations->>es.ilike.${searchPattern},` +
        `description_translations->>en.ilike.${searchPattern},` +
        `description_translations->>ro.ilike.${searchPattern},` +
        `description_translations->>ru.ilike.${searchPattern},` +
        `sku.ilike.${searchPattern}`
      )
    }

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        queryBuilder = queryBuilder.order('price_eur', { ascending: true })
        break
      case 'price_desc':
        queryBuilder = queryBuilder.order('price_eur', { ascending: false })
        break
      case 'name':
        queryBuilder = queryBuilder.order('name_translations', { ascending: true })
        break
      case 'featured':
        // For now, we'll sort by created_at desc. In production, you'd have a featured field
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
      case 'newest':
      default:
        queryBuilder = queryBuilder.order('created_at', { ascending: false })
        break
    }

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    // Single query gets both data and count
    const { data: products, error, count } = await queryBuilder
    const totalCount = count || 0

    // Debug logging
    console.log('[Products API] Query params:', { category, search, priceMin, priceMax, inStock, sort, page, limit })
    console.log('[Products API] Results:', {
      productsCount: products?.length || 0,
      totalCount,
      hasError: !!error,
      errorMessage: error?.message
    })

    if (error) {
      console.error('[Products API] Supabase error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: error
      })
    }

    // Transform the data to match expected format
    const transformedProducts = products?.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku, // Use SKU as slug to match product detail lookup
      name: product.name_translations,
      shortDescription: product.description_translations,
      price: product.price_eur,
      comparePrice: product.compare_at_price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_quantity > 5 ? 'in_stock' : 
                   product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
      images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => ({
        url: img.url || img,
        altText: img.alt || img.alt_text || product.name_translations,
        isPrimary: img.is_primary || index === 0
      })) : [],
      primaryImage: product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg',
      category: product.categories ? {
        id: product.categories.id,
        slug: product.categories.slug,
        name: product.categories.name_translations
      } : null,
      // Extract attributes for display
      origin: product.attributes?.origin,
      volume: product.attributes?.volume ? parseInt(product.attributes.volume) : null,
      alcoholContent: product.attributes?.alcohol_content ? parseFloat(product.attributes.alcohol_content) : null,
      tags: product.attributes?.tags || [],
      isFeatured: product.attributes?.featured || false,
      is_active: product.is_active,
      created_at: product.created_at
    })) || []

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)

    const response = {
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        category,
        search,
        priceMin,
        priceMax,
        inStock,
        featured,
        sort
      }
    }

    console.log('[Products API] Returning:', {
      productsCount: transformedProducts.length,
      pagination: response.pagination,
      firstProduct: transformedProducts[0]?.name
    })

    return response

  } catch (error) {
    console.error('Products API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.productsList.maxAge,
  name: PUBLIC_CACHE_CONFIG.productsList.name,
  getKey: (event) => getPublicCacheKey(PUBLIC_CACHE_CONFIG.productsList.name, event)
})
