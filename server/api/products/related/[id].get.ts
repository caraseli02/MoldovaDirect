import { serverSupabaseClient } from '#supabase/server'
import { PUBLIC_CACHE_CONFIG } from '~/server/utils/publicCache'

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

// Helper function to calculate similarity score between products
function calculateSimilarityScore(product1: any, product2: any): number {
  let score = 0
  
  // Same category gets highest score
  if (product1.category_id === product2.category_id) {
    score += 50
  }
  
  // Similar price range (within 20% difference)
  const priceDiff = Math.abs(product1.price_eur - product2.price_eur) / product1.price_eur
  if (priceDiff <= 0.2) {
    score += 30
  } else if (priceDiff <= 0.5) {
    score += 15
  }
  
  // Similar attributes
  const attrs1 = product1.attributes || {}
  const attrs2 = product2.attributes || {}
  
  // Check for matching attributes
  const commonAttributes = ['origin', 'volume', 'alcohol_content', 'grape_variety', 'vintage']
  commonAttributes.forEach(attr => {
    if (attrs1[attr] && attrs2[attr] && attrs1[attr] === attrs2[attr]) {
      score += 10
    }
  })
  
  // Check for matching tags
  const tags1 = attrs1.tags || []
  const tags2 = attrs2.tags || []
  const commonTags = tags1.filter((tag: string) => tags2.includes(tag))
  score += commonTags.length * 5
  
  return score
}

export default defineCachedEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const productId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const locale = (query.locale as string) || 'es'
    const limit = parseInt((query.limit as string) || '8')

    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      })
    }

    // Get the source product
    const { data: sourceProduct, error: sourceError } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        category_id,
        name_translations,
        price_eur,
        attributes,
        is_active
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (sourceError || !sourceProduct) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    // Get all potential related products (excluding the source product)
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        category_id,
        name_translations,
        description_translations,
        price_eur,
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
      .neq('id', productId)
      .gt('stock_quantity', 0) // Only recommend in-stock products

    if (productsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products for recommendations'
      })
    }

    // Calculate similarity scores and sort by relevance
    const productsWithScores = (allProducts || []).map(product => ({
      ...product,
      similarityScore: calculateSimilarityScore(sourceProduct, product)
    }))

    // Sort by similarity score (descending) and then by creation date (newest first)
    productsWithScores.sort((a, b) => {
      if (b.similarityScore !== a.similarityScore) {
        return b.similarityScore - a.similarityScore
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Take the top recommendations
    const topRecommendations = productsWithScores.slice(0, limit)

    // Transform the recommendations to match expected format
    const recommendations = topRecommendations.map(product => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku,
      name: getLocalizedContent(product.name_translations, locale),
      nameTranslations: product.name_translations,
      shortDescription: getLocalizedContent(product.description_translations || {}, locale),
      price: product.price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_quantity > 5 ? 'in_stock' : 
                   product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
      images: Array.isArray(product.images) ? product.images.map((img: any, index: number) => ({
        url: img.url || img,
        altText: img.alt || img.alt_text || getLocalizedContent(product.name_translations, locale),
        isPrimary: img.is_primary || index === 0
      })) : [],
      primaryImage: product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg',
      category: {
        id: product.categories.id,
        slug: product.categories.slug,
        name: getLocalizedContent(product.categories.name_translations, locale)
      },
      attributes: product.attributes || {},
      similarityScore: product.similarityScore,
      recommendationType: product.category_id === sourceProduct.category_id ? 'same_category' : 'similar_attributes'
    }))

    // Get frequently bought together products (based on order history)
    const { data: frequentlyBoughtTogether } = await supabase
      .from('order_items')
      .select(`
        product_id,
        orders!inner (
          id,
          order_items!inner (
            product_id,
            products!inner (
              id,
              sku,
              name_translations,
              price_eur,
              stock_quantity,
              images,
              is_active,
              categories!inner (
                id,
                slug,
                name_translations
              )
            )
          )
        )
      `)
      .eq('product_id', productId)
      .eq('products.is_active', true)
      .neq('orders.order_items.product_id', productId)
      .limit(4)

    // Process frequently bought together data
    const frequentlyBought = frequentlyBoughtTogether?.reduce((acc: any[], item: any) => {
      item.orders.order_items.forEach((orderItem: any) => {
        if (orderItem.product_id !== parseInt(productId) && orderItem.products.is_active) {
          const existing = acc.find(p => p.id === orderItem.products.id)
          if (existing) {
            existing.frequency += 1
          } else {
            acc.push({
              ...orderItem.products,
              frequency: 1
            })
          }
        }
      })
      return acc
    }, []) || []

    // Sort by frequency and transform
    const topFrequentlyBought = frequentlyBought
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 4)
      .map(product => ({
        id: product.id,
        sku: product.sku,
        slug: product.sku,
        name: getLocalizedContent(product.name_translations, locale),
        price: product.price_eur,
        formattedPrice: `€${product.price_eur.toFixed(2)}`,
        stockQuantity: product.stock_quantity,
        stockStatus: product.stock_quantity > 5 ? 'in_stock' : 
                     product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
        primaryImage: product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.svg',
        category: {
          id: product.categories.id,
          slug: product.categories.slug,
          name: getLocalizedContent(product.categories.name_translations, locale)
        },
        frequency: product.frequency
      }))

    return {
      sourceProduct: {
        id: sourceProduct.id,
        sku: sourceProduct.sku,
        name: getLocalizedContent(sourceProduct.name_translations, locale)
      },
      recommendations: {
        similar: recommendations,
        frequentlyBoughtTogether: topFrequentlyBought
      },
      meta: {
        locale,
        totalSimilar: recommendations.length,
        totalFrequentlyBought: topFrequentlyBought.length,
        limit
      }
    }

  } catch (error) {
    console.error('Product recommendations API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.relatedProducts.maxAge,
  name: PUBLIC_CACHE_CONFIG.relatedProducts.name,
  getKey: (event) => {
    try {
      const id = getRouterParam(event, 'id')
      return id ? `${PUBLIC_CACHE_CONFIG.relatedProducts.name}-${id}` : PUBLIC_CACHE_CONFIG.relatedProducts.name
    } catch (error) {
      console.error('[Related Products] Cache key generation failed:', error)
      return PUBLIC_CACHE_CONFIG.relatedProducts.name
    }
  }
})