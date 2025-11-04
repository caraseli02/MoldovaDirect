import { serverSupabaseClient } from '#supabase/server'
import { prepareSearchPattern, validateMinSearchLength, MAX_SEARCH_LENGTH } from '~/server/utils/searchSanitization'

// Helper function to get localized content with fallback
function getLocalizedContent(content: Record<string, string>, locale: string): string {
  if (content[locale]) return content[locale]
  if (content.es) return content.es
  if (content.en) return content.en
  return Object.values(content)[0] || ''
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event)
    
    const searchTerm = query.q as string
    const locale = (query.locale as string) || 'es'
    const limit = parseInt((query.limit as string) || '20')
    const category = query.category as string

    // Validate search term exists and meets minimum length
    if (!searchTerm || !validateMinSearchLength(searchTerm)) {
      return {
        products: [],
        meta: {
          query: searchTerm,
          total: 0,
          limit,
          locale,
          message: 'Search term must be at least 2 characters'
        }
      }
    }

    // Validate maximum search term length (throws 400 error if too long)
    if (searchTerm.length > MAX_SEARCH_LENGTH) {
      throw createError({
        statusCode: 400,
        statusMessage: `Search term too long. Maximum ${MAX_SEARCH_LENGTH} characters allowed.`
      })
    }

    // Build query with PostgreSQL JSONB operators for better performance
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
        categories!inner (
          id,
          slug,
          name_translations
        )
      `)
      .eq('is_active', true)

    // Apply category filter if specified
    if (category) {
      queryBuilder = queryBuilder.eq('categories.slug', category)
    }

    // Apply search filter using PostgreSQL JSONB operators
    // This searches across all language translations (es, en, ro, ru)
    // Sanitize search term to prevent SQL injection and escape special characters
    const searchPattern = prepareSearchPattern(searchTerm, { validateLength: false })
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

    const { data: matchingProducts, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products for search',
        data: error
      })
    }

    // Sort by relevance (exact matches first, then partial matches)
    const searchTermLower = searchTerm.toLowerCase().trim()
    ;(matchingProducts || []).sort((a, b) => {
      const aName = getLocalizedContent(a.name_translations, locale).toLowerCase()
      const bName = getLocalizedContent(b.name_translations, locale).toLowerCase()

      // Exact matches first
      if (aName === searchTermLower && bName !== searchTermLower) return -1
      if (bName === searchTermLower && aName !== searchTermLower) return 1

      // Name starts with search term
      if (aName.startsWith(searchTermLower) && !bName.startsWith(searchTermLower)) return -1
      if (bName.startsWith(searchTermLower) && !aName.startsWith(searchTermLower)) return 1

      // Shorter names first (more specific)
      if (aName.length !== bName.length) {
        return aName.length - bName.length
      }

      // Finally by stock quantity (in stock first)
      return b.stock_quantity - a.stock_quantity
    })

    // Limit results
    const limitedResults = matchingProducts.slice(0, limit)

    // Transform products to match expected format
    const transformedProducts = limitedResults.map(product => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku,
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
      category: {
        id: product.categories.id,
        slug: product.categories.slug,
        name: product.categories.name_translations
      },
      attributes: product.attributes || {},
      is_active: product.is_active,
      created_at: product.created_at,
      // Add search relevance info
      relevanceScore: calculateRelevance(product, searchTermLower, locale)
    }))

    return {
      products: transformedProducts,
      meta: {
        query: searchTerm,
        total: matchingProducts.length,
        returned: transformedProducts.length,
        limit,
        locale,
        category: category || null
      },
      suggestions: generateSearchSuggestions(searchTerm, matchingProducts || [], locale)
    }

  } catch (error) {
    console.error('Search API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})

// Calculate relevance score for search results
function calculateRelevance(product: any, searchTerm: string, locale: string): number {
  let score = 0
  const name = getLocalizedContent(product.name_translations, locale).toLowerCase()
  
  // Exact name match
  if (name === searchTerm) score += 100
  
  // Name starts with search term
  if (name.startsWith(searchTerm)) score += 80
  
  // Name contains search term
  if (name.includes(searchTerm)) score += 60
  
  // Description contains search term
  const description = getLocalizedContent(product.description_translations || {}, locale).toLowerCase()
  if (description.includes(searchTerm)) score += 40
  
  // SKU contains search term
  if (product.sku.toLowerCase().includes(searchTerm)) score += 30
  
  // In stock bonus
  if (product.stock_quantity > 0) score += 20
  
  // High stock bonus
  if (product.stock_quantity > 10) score += 10
  
  return score
}

// Generate search suggestions based on available products
function generateSearchSuggestions(searchTerm: string, products: any[], locale: string, limit: number = 5): string[] {
  const suggestions = new Set<string>()
  const searchLower = searchTerm.toLowerCase()
  
  products.forEach(product => {
    const name = getLocalizedContent(product.name_translations, locale)
    const words = name.toLowerCase().split(/\s+/)
    
    words.forEach(word => {
      if (word.length > 2 && word.includes(searchLower) && word !== searchLower) {
        suggestions.add(word)
      }
    })
    
    // Add full product names that partially match
    if (name.toLowerCase().includes(searchLower) && name.toLowerCase() !== searchLower) {
      suggestions.add(name)
    }
  })
  
  return Array.from(suggestions).slice(0, limit)
}
