import { serverSupabaseClient } from '#supabase/server'
import { prepareSearchPattern, MAX_SEARCH_LENGTH } from '~/server/utils/searchSanitization'
import { PUBLIC_CACHE_CONFIG, getPublicCacheKey } from '~/server/utils/publicCache'

// Supported locales for multilingual search
const SUPPORTED_LOCALES = ['es', 'en', 'ro', 'ru'] as const
type SupportedLocale = typeof SUPPORTED_LOCALES[number]

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

// Database product image types
interface ProductImage {
  url?: string
  alt?: string
  alt_text?: string
  is_primary?: boolean
}

// Product attributes from database
interface ProductAttributes {
  origin?: string
  volume?: string
  alcohol_content?: string
  tags?: string[]
  featured?: boolean
}

// Database product shape from Supabase
interface DatabaseProduct {
  id: number
  sku: string
  name_translations: Record<SupportedLocale, string>
  description_translations: Record<SupportedLocale, string>
  price_eur: number
  compare_at_price_eur?: number
  stock_quantity: number
  images: (ProductImage | string)[]
  attributes?: ProductAttributes
  category_id: number | null
  categories?: {
    id: number
    slug: string
    name_translations: Record<SupportedLocale, string>
  } | null
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

      // Build multilingual search query dynamically
      const translationFields = SUPPORTED_LOCALES.flatMap(locale => [
        `name_translations->>${locale}.ilike.${searchPattern}`,
        `description_translations->>${locale}.ilike.${searchPattern}`
      ])

      queryBuilder = queryBuilder.or(
        [...translationFields, `sku.ilike.${searchPattern}`].join(',')
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
      console.error('[Products API] Supabase error:', {
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString()
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products'
      })
    }

    // Helper function to determine stock status
    const getStockStatus = (quantity: number): 'in_stock' | 'low_stock' | 'out_of_stock' => {
      if (quantity > 5) return 'in_stock'
      if (quantity > 0) return 'low_stock'
      return 'out_of_stock'
    }

    // Transform the data to match expected format (type-safe now)
    const transformedProducts = products?.map((product: DatabaseProduct) => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku, // Use SKU as slug to match product detail lookup
      name: product.name_translations,
      shortDescription: product.description_translations,
      price: product.price_eur,
      comparePrice: product.compare_at_price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      stockQuantity: product.stock_quantity,
      stockStatus: getStockStatus(product.stock_quantity),
      images: product.images.map((img, index) => {
        const imageUrl = typeof img === 'string' ? img : img.url
        return {
          url: imageUrl || '/placeholder-product.svg',
          altText: typeof img === 'object' ? (img.alt || img.alt_text) : undefined,
          isPrimary: typeof img === 'object' ? (img.is_primary || index === 0) : index === 0
        }
      }),
      primaryImage: (() => {
        const firstImage = product.images[0]
        if (typeof firstImage === 'string') return firstImage
        return firstImage?.url || '/placeholder-product.svg'
      })(),
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
    console.error('[Products API] Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    // Preserve HTTP errors (like 400 from validation)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.productsList.maxAge,
  name: PUBLIC_CACHE_CONFIG.productsList.name,
  getKey: (event) => {
    try {
      return getPublicCacheKey(PUBLIC_CACHE_CONFIG.productsList.name, event)
    } catch (error) {
      console.error('[Products List] Cache key generation failed:', error)
      return PUBLIC_CACHE_CONFIG.productsList.name
    }
  }
})
