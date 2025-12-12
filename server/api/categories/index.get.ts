import { serverSupabaseClient } from '#supabase/server'
import { PUBLIC_CACHE_CONFIG, getPublicCacheKey } from '~/server/utils/publicCache'

// Helper function to get localized content with fallback
function getLocalizedContent(content: Record<string, string>, locale: string): string {
  if (content[locale]) return content[locale]
  if (content.es) return content.es
  if (content.en) return content.en
  return Object.values(content)[0] || ''
}

// Helper function to build hierarchical category tree
function buildCategoryTree(categories: any[], parentId: number | null = null): any[] {
  return categories
    .filter(cat => cat.parentId === parentId) // Use parentId instead of parent_id
    .map(category => ({
      ...category,
      children: buildCategoryTree(categories, category.id),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder) // Use sortOrder instead of sort_order
}

export default defineCachedEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event)
    const locale = (query.locale as string) || 'es'
    const parent = query.parent as string | undefined

    // Build the query
    let queryBuilder = supabase
      .from('categories')
      .select(`
        id,
        slug,
        parent_id,
        name_translations,
        description_translations,
        image_url,
        sort_order,
        is_active
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // If parent is specified, filter by parent
    if (parent) {
      if (parent === 'root') {
        queryBuilder = queryBuilder.is('parent_id', null)
      }
      else {
        // Find parent category by slug first
        const { data: parentCategory } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', parent)
          .eq('is_active', true)
          .single()

        if (!parentCategory) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Parent category not found',
          })
        }

        queryBuilder = queryBuilder.eq('parent_id', parentCategory.id)
      }
    }

    const { data: categories, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch categories',
        data: error,
      })
    }

    // Get product counts for each category
    const categoryIds = categories?.map(cat => cat.id) || []
    const { data: productCounts } = await supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true)
      .in('category_id', categoryIds)

    // Count products per category
    const productCountMap = (productCounts || []).reduce((acc: Record<number, number>, item: ProductCountItem) => {
      acc[item.category_id] = (acc[item.category_id] || 0) + 1
      return acc
    }, {})

    // Transform categories with localization and product counts
    const transformedCategories = categories?.map((category: {
      id: number
      slug: string
      parent_id: number | null
      name_translations: Record<string, string>
      description_translations?: Record<string, string>
      image_url: string | null
      sort_order: number
      is_active: boolean
    }): TransformedCategory => ({
      id: category.id,
      slug: category.slug,
      parentId: category.parent_id,
      name: getLocalizedContent(category.name_translations, locale),
      description: getLocalizedContent(category.description_translations || {}, locale),
      nameTranslations: category.name_translations,
      descriptionTranslations: category.description_translations,
      image: category.image_url,
      sortOrder: category.sort_order,
      productCount: productCountMap[category.id] || 0,
      isActive: category.is_active,
    })) || []

    // If no parent filter is specified, return hierarchical tree
    if (!parent) {
      const categoryTree = buildCategoryTree(transformedCategories)
      return {
        categories: categoryTree,
        total: transformedCategories.length,
        locale,
      }
    }

    // Return flat list if parent filter is applied
    return {
      categories: transformedCategories,
      total: transformedCategories.length,
      locale,
      parent,
    }
  }
  catch (error: any) {
    console.error('Categories API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.categoriesList.maxAge,
  name: PUBLIC_CACHE_CONFIG.categoriesList.name,
  getKey: event => getPublicCacheKey(PUBLIC_CACHE_CONFIG.categoriesList.name, event),
})
