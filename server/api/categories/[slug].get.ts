import { serverSupabaseClient } from '#supabase/server'
import { PUBLIC_CACHE_CONFIG } from '~/server/utils/publicCache'

// Helper function to get localized content with fallback
function getLocalizedContent(content: Record<string, string>, locale: string): string {
  if (content[locale]) return content[locale]
  if (content.es) return content.es
  if (content.en) return content.en
  return Object.values(content)[0] || ''
}

export default defineCachedEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const slug = getRouterParam(event, 'slug')
    const query = getQuery(event)

    const locale = (query.locale as string) || 'es'
    const sort = (query.sort as string) || 'newest'
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 24

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category slug is required',
      })
    }

    // First, get the category by slug
    const { data: category, error: categoryError } = await supabase
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
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (categoryError || !category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      })
    }

    // Get all subcategory IDs (including the category itself)
    const getAllSubcategoryIds = async (categoryId: number): Promise<number[]> => {
      const ids = [categoryId]

      const { data: subcategories } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId)
        .eq('is_active', true)

      if (subcategories && subcategories.length > 0) {
        for (const subcat of subcategories) {
          const subIds = await getAllSubcategoryIds(subcat.id)
          ids.push(...subIds)
        }
      }

      return ids
    }

    const categoryIds = await getAllSubcategoryIds(category.id)

    // Build products query
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        sku,
        name_translations,
        description_translations,
        price_eur,
        stock_quantity,
        images,
        is_active,
        created_at,
        categories!inner (
          id,
          slug,
          name_translations
        )
      `)
      .eq('is_active', true)
      .in('category_id', categoryIds)

    // Apply sorting
    switch (sort) {
      case 'price_asc':
        productsQuery = productsQuery.order('price_eur', { ascending: true })
        break
      case 'price_desc':
        productsQuery = productsQuery.order('price_eur', { ascending: false })
        break
      case 'name':
        productsQuery = productsQuery.order('name_translations', { ascending: true })
        break
      case 'newest':
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false })
        break
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .in('category_id', categoryIds)

    // Apply pagination
    const offset = (page - 1) * limit
    productsQuery = productsQuery.range(offset, offset + limit - 1)

    const { data: products, error: productsError } = await productsQuery

    if (productsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: productsError,
      })
    }

    // Get subcategories for navigation
    const { data: subcategories } = await supabase
      .from('categories')
      .select(`
        id,
        slug,
        name_translations,
        description_translations,
        image_url,
        sort_order
      `)
      .eq('parent_id', category.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    // Build breadcrumb
    const buildBreadcrumb = async (categoryId: number): Promise<any[]> => {
      const breadcrumb = []
      let currentCategoryId = categoryId

      while (currentCategoryId) {
        const { data: cat } = await supabase
          .from('categories')
          .select('id, slug, name_translations, parent_id')
          .eq('id', currentCategoryId)
          .single()

        if (cat) {
          breadcrumb.unshift({
            id: cat.id,
            slug: cat.slug,
            name: getLocalizedContent(cat.name_translations, locale),
          })
          currentCategoryId = cat.parent_id
        }
        else {
          break
        }
      }

      return breadcrumb
    }

    const breadcrumb = await buildBreadcrumb(category.id)

    // Transform the data
    const transformedProducts = products?.map((product: any) => ({
      id: product.id,
      sku: product.sku,
      slug: product.sku,
      name: getLocalizedContent(product.name_translations, locale),
      description: getLocalizedContent(product.description_translations, locale),
      price: product.price_eur,
      formattedPrice: `€${product.price_eur.toFixed(2)}`,
      stock: product.stock_quantity,
      stockStatus: product.stock_quantity > 5
        ? 'in_stock'
        : product.stock_quantity > 0 ? 'low_stock' : 'out_of_stock',
      images: product.images || [],
      primaryImage: product.images?.[0]?.url || '/placeholder-product.svg',
      category: {
        id: product.categories.id,
        slug: product.categories.slug,
        name: getLocalizedContent(product.categories.name_translations, locale),
      },
      createdAt: product.created_at,
    })) || []

    const transformedSubcategories = subcategories?.map((subcat: any) => ({
      id: subcat.id,
      slug: subcat.slug,
      name: getLocalizedContent(subcat.name_translations, locale),
      description: getLocalizedContent(subcat.description_translations || {}, locale),
      image: subcat.image_url,
      sortOrder: subcat.sort_order,
    })) || []

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)

    return {
      category: {
        id: category.id,
        slug: category.slug,
        parentId: category.parent_id,
        name: getLocalizedContent(category.name_translations, locale),
        description: getLocalizedContent(category.description_translations || {}, locale),
        image: category.image_url,
        breadcrumb,
        subcategories: transformedSubcategories,
      },
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        sort,
      },
      locale,
    }
  }
  catch (error) {
    console.error('Category products API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
    })
  }
}, {
  maxAge: PUBLIC_CACHE_CONFIG.categoryDetail.maxAge,
  name: PUBLIC_CACHE_CONFIG.categoryDetail.name,
  getKey: (event) => {
    const slug = getRouterParam(event, 'slug')
    return `${PUBLIC_CACHE_CONFIG.categoryDetail.name}-${slug}`
  },
})
