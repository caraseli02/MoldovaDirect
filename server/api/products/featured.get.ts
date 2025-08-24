import { serverSupabaseClient } from '#supabase/server'

// Helper function to get localized content with fallback
function getLocalizedContent(content: Record<string, string>, locale: string): string {
  // 1. Try requested locale
  if (content[locale]) return content[locale]
  
  // 2. Try default locale (Spanish)
  if (content.es) return content.es
  
  // 3. Try English as fallback
  if (content.en) return content.en
  
  // 4. Return first available translation
  return Object.values(content)[0] || ''
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event)
    
    const locale = (query.locale as string) || 'es'
    const limit = parseInt((query.limit as string) || '12')
    const category = query.category as string
    const includeOutOfStock = query.includeOutOfStock === 'true'

    // Build the base query for featured products
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

    // Filter by stock availability unless explicitly including out of stock
    if (!includeOutOfStock) {
      queryBuilder = queryBuilder.gt('stock_quantity', 0)
    }

    // Apply category filter if specified
    if (category) {
      queryBuilder = queryBuilder.eq('categories.slug', category)
    }

    // Get all products to filter for featured ones
    const { data: allProducts, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: error
      })
    }

    // Filter for featured products based on multiple criteria
    const featuredProducts = (allProducts || []).filter(product => {
      const attributes = product.attributes || {}
      
      // Check if explicitly marked as featured
      if (attributes.featured === true) {
        return true
      }
      
      // Check if product has high stock (popular/well-stocked items)
      if (product.stock_quantity > 20) {
        return true
      }
      
      // Check if product has a compare_at_price (on sale)
      if (product.compare_at_price_eur && product.compare_at_price_eur > product.price_eur) {
        return true
      }
      
      // Check if product has premium attributes (high-quality indicators)
      const premiumIndicators = ['premium', 'limited', 'exclusive', 'award', 'organic']
      const productTags = attributes.tags || []
      if (premiumIndicators.some(indicator => 
        productTags.some((tag: string) => tag.toLowerCase().includes(indicator))
      )) {
        return true
      }
      
      return false
    })

    // Sort featured products by priority
    featuredProducts.sort((a, b) => {
      const aAttrs = a.attributes || {}
      const bAttrs = b.attributes || {}
      
      // Explicitly featured products get highest priority
      if (aAttrs.featured && !bAttrs.featured) return -1
      if (!aAttrs.featured && bAttrs.featured) return 1
      
      // Products on sale get next priority
      const aOnSale = a.compare_at_price_eur && a.compare_at_price_eur > a.price_eur
      const bOnSale = b.compare_at_price_eur && b.compare_at_price_eur > b.price_eur
      if (aOnSale && !bOnSale) return -1
      if (!aOnSale && bOnSale) return 1
      
      // Then by stock quantity (higher stock = more popular)
      if (b.stock_quantity !== a.stock_quantity) {
        return b.stock_quantity - a.stock_quantity
      }
      
      // Finally by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Take the requested number of featured products
    const limitedFeatured = featuredProducts.slice(0, limit)

    // Transform the data to match expected format
    const transformedProducts = limitedFeatured.map(product => {
      const attributes = product.attributes || {}
      const isOnSale = product.compare_at_price_eur && product.compare_at_price_eur > product.price_eur
      const discountPercentage = isOnSale 
        ? Math.round(((product.compare_at_price_eur - product.price_eur) / product.compare_at_price_eur) * 100)
        : 0

      return {
        id: product.id,
        sku: product.sku,
        slug: product.sku,
        name: getLocalizedContent(product.name_translations, locale),
        nameTranslations: product.name_translations,
        shortDescription: getLocalizedContent(product.description_translations || {}, locale),
        price: product.price_eur,
        formattedPrice: `€${product.price_eur.toFixed(2)}`,
        compareAtPrice: product.compare_at_price_eur,
        formattedCompareAtPrice: product.compare_at_price_eur 
          ? `€${product.compare_at_price_eur.toFixed(2)}` 
          : null,
        discountPercentage,
        stockQuantity: product.stock_quantity,
        stockStatus: product.stock_quantity > (product.low_stock_threshold || 5) ? 'in_stock' : 
                     product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
        images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => ({
          url: img.url || img,
          altText: img.alt || img.alt_text || getLocalizedContent(product.name_translations, locale),
          isPrimary: img.is_primary || index === 0
        })) : [],
        primaryImage: product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.jpg',
        category: {
          id: product.categories.id,
          slug: product.categories.slug,
          name: getLocalizedContent(product.categories.name_translations, locale)
        },
        attributes: attributes,
        featuredReason: attributes.featured ? 'explicitly_featured' :
                       isOnSale ? 'on_sale' :
                       product.stock_quantity > 20 ? 'popular' : 'premium',
        tags: attributes.tags || [],
        isFeatured: true,
        isOnSale,
        createdAt: product.created_at
      }
    })

    // Get category information if filtering by category
    let categoryInfo = null
    if (category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, slug, name_translations, description_translations')
        .eq('slug', category)
        .eq('is_active', true)
        .single()

      if (categoryData) {
        categoryInfo = {
          id: categoryData.id,
          slug: categoryData.slug,
          name: getLocalizedContent(categoryData.name_translations, locale),
          description: getLocalizedContent(categoryData.description_translations || {}, locale)
        }
      }
    }

    // Get total count of featured products for pagination info
    const totalFeatured = featuredProducts.length

    return {
      products: transformedProducts,
      meta: {
        total: totalFeatured,
        returned: transformedProducts.length,
        limit,
        locale,
        category: categoryInfo,
        filters: {
          category,
          includeOutOfStock
        }
      },
      featuredCriteria: {
        explicitlyFeatured: transformedProducts.filter(p => p.featuredReason === 'explicitly_featured').length,
        onSale: transformedProducts.filter(p => p.featuredReason === 'on_sale').length,
        popular: transformedProducts.filter(p => p.featuredReason === 'popular').length,
        premium: transformedProducts.filter(p => p.featuredReason === 'premium').length
      }
    }

  } catch (error) {
    console.error('Featured products API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})