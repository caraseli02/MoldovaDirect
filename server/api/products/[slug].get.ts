import { serverSupabaseClient } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
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

export default defineCachedEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const slugParam = getRouterParam(event, 'slug')
    const query = getQuery(event)
    const locale = (query.locale as string) || 'es'

    const normalizedSlug = slugParam?.trim()

    if (!normalizedSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required',
      })
    }

    const slugCandidates = Array.from(
      new Set(
        [normalizedSlug, normalizedSlug.toUpperCase(), normalizedSlug.toLowerCase()]
          .filter(Boolean),
      ),
    )

    let product = null

    for (const candidate of slugCandidates) {
      const { data, error } = await supabase
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
          updated_at,
          categories!inner (
            id,
            slug,
            name_translations,
            description_translations,
            parent_id
          )
        `)
        .eq('sku', candidate)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to fetch product',
          data: error,
        })
      }

      if (data) {
        product = data
        break
      }
    }

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found',
      })
    }

    // Get related products from the same category
    const { data: relatedProducts } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        name_translations,
        price_eur,
        stock_quantity,
        images,
        categories!inner (
          id,
          slug,
          name_translations
        )
      `)
      .eq('category_id', product.categories.id)
      .eq('is_active', true)
      .neq('id', product.id)
      .limit(4)

    // Build category breadcrumb
    const buildBreadcrumb = async (categoryId: number): Promise<Array<{ id: number, slug: string, name: string }>> => {
      const breadcrumb = []
      let currentCategoryId = categoryId

      while (currentCategoryId) {
        const { data: category } = await supabase
          .from('categories')
          .select('id, slug, name_translations, parent_id')
          .eq('id', currentCategoryId)
          .single()

        if (category) {
          breadcrumb.unshift({
            id: category.id,
            slug: category.slug,
            name: getLocalizedContent(category.name_translations, locale),
          })
          currentCategoryId = category.parent_id
        }
        else {
          break
        }
      }

      return breadcrumb
    }

    const breadcrumb = await buildBreadcrumb(product.categories.id)

    // Transform product data to match products list API format
    const descriptionTranslations = product.description_translations || {}
    const shortDescriptionTranslations
      = (product as unknown).short_description_translations || descriptionTranslations

    const transformedProduct = {
      id: product.id,
      sku: product.sku,
      slug: product.sku, // Using SKU as slug for now
      name: product.name_translations,
      description: descriptionTranslations,
      shortDescription: shortDescriptionTranslations,
      nameTranslations: product.name_translations,
      descriptionTranslations,
      price: product.price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      compareAtPrice: product.compare_at_price_eur,
      formattedCompareAtPrice: product.compare_at_price_eur
        ? `€${product.compare_at_price_eur.toFixed(2)}`
        : null,
      stockQuantity: product.stock_quantity,
      stockStatus: product.stock_quantity > 5
        ? 'in_stock'
        : product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
      images: product.images || [],
      primaryImage: product.images?.[0]?.url || '/placeholder-product.svg',
      attributes: product.attributes || {},
      category: {
        id: product.categories.id,
        slug: product.categories.slug,
        name: getLocalizedContent(product.categories.name_translations, locale),
        description: getLocalizedContent(product.categories.description_translations || {}, locale),
        nameTranslations: product.categories.name_translations,
        breadcrumb,
      },
      relatedProducts: relatedProducts?.map((related: any) => ({
        id: related.id,
        sku: related.sku,
        slug: related.sku,
        name: related.name_translations,
        price: related.price_eur,
        formattedPrice: `€${related.price_eur.toFixed(2)}`,
        stockQuantity: related.stock_quantity,
        stockStatus: related.stock_quantity > 5
          ? 'in_stock'
          : related.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
        primaryImage: related.images?.[0]?.url || '/placeholder-product.svg',
        category: {
          id: related.categories.id,
          slug: related.categories.slug,
          name: related.categories.name_translations,
        },
      })) || [],
      isActive: product.is_active,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      locale,
      availableLocales: Object.keys(product.name_translations),
    }

    return transformedProduct
  }
  catch (error: any) {
    console.error('Product detail API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.productDetail.maxAge,
  name: PUBLIC_CACHE_CONFIG.productDetail.name,
  getKey: (event) => {
    const slug = getRouterParam(event, 'slug')
    const query = getQuery(event)
    const locale = query.locale || 'es'
    return `${PUBLIC_CACHE_CONFIG.productDetail.name}-${slug}-${locale}`
  },
})
