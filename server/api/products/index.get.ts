import { serverSupabaseClient } from '#supabase/server'

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

export default defineEventHandler(async (event) => {
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

    // Build the base query
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
        images,
        attributes,
        is_active,
        created_at,
        categories (
          id,
          slug,
          name_translations
        )
      `)
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

    // Apply search filter - we'll use JavaScript filtering for JSONB fields
    let allProductsForSearch = null
    if (search) {
      // Get all products first to filter in JavaScript (better JSONB support)
      const { data: searchProducts, error: searchError } = await queryBuilder
      
      if (searchError) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch products for search',
          data: searchError
        })
      }
      
      const searchTermLower = search.toLowerCase().trim()
      allProductsForSearch = (searchProducts || []).filter(product => {
        // Search in all name translations
        const nameMatches = Object.values(product.name_translations || {}).some(name => 
          (name as string).toLowerCase().includes(searchTermLower)
        )
        
        // Search in all description translations
        const descriptionMatches = Object.values(product.description_translations || {}).some(desc => 
          (desc as string).toLowerCase().includes(searchTermLower)
        )
        
        // Search in SKU
        const skuMatches = product.sku.toLowerCase().includes(searchTermLower)
        
        return nameMatches || descriptionMatches || skuMatches
      })
      
      // Create a new query builder with filtered IDs
      if (allProductsForSearch.length > 0) {
        const filteredIds = allProductsForSearch.map((p: any) => p.id)
        queryBuilder = supabase
          .from('products')
          .select(`
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
            categories (
              id,
              slug,
              name_translations
            )
          `)
          .eq('is_active', true)
          .in('id', filteredIds)
      } else {
        // No search results, return empty
        queryBuilder = supabase
          .from('products')
          .select(`
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
            categories (
              id,
              slug,
              name_translations
            )
          `)
          .eq('is_active', true)
          .eq('id', -1) // This will return no results
      }
      
      // Apply other filters to the search results
      if (category && allProductsForSearch.length > 0) {
        queryBuilder = queryBuilder.eq('categories.slug', category)
      }
      if (priceMin !== undefined && allProductsForSearch.length > 0) {
        queryBuilder = queryBuilder.gte('price_eur', priceMin)
      }
      if (priceMax !== undefined && allProductsForSearch.length > 0) {
        queryBuilder = queryBuilder.lte('price_eur', priceMax)
      }
      if (inStock === true && allProductsForSearch.length > 0) {
        queryBuilder = queryBuilder.gt('stock_quantity', 0)
      }
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

    // Get total count for pagination with same filters
    let countQueryBuilder = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Apply same filters for count
    if (category) {
      countQueryBuilder = countQueryBuilder.eq('categories.slug', category)
    }
    if (priceMin !== undefined) {
      countQueryBuilder = countQueryBuilder.gte('price_eur', priceMin)
    }
    if (priceMax !== undefined) {
      countQueryBuilder = countQueryBuilder.lte('price_eur', priceMax)
    }
    if (inStock === true) {
      countQueryBuilder = countQueryBuilder.gt('stock_quantity', 0)
    }
    
    // For search results, use the filtered count
    let totalCount = 0
    if (search && allProductsForSearch) {
      totalCount = allProductsForSearch.length
    } else {
      const { count } = await countQueryBuilder
      totalCount = count || 0
    }

    // Apply pagination
    const offset = (page - 1) * limit
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: products, error } = await queryBuilder

    if (error) {
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

    return {
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

  } catch (error) {
    console.error('Products API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
