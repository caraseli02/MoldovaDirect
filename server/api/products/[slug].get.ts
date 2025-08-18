import { useDB, tables, eq, and } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required'
      })
    }

    const db = useDB()

    // Get product with category by SKU (since we don't have slug in the schema)
    const result = await db
      .select()
      .from(tables.products)
      .leftJoin(tables.categories, eq(tables.products.categoryId, tables.categories.id))
      .where(and(
        eq(tables.products.sku, slug), // Using SKU as slug
        eq(tables.products.isActive, true)
      ))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = result[0]

    // Return product with images from JSON field
    return {
      ...product.products,
      category: product.categories,
      images: product.products?.images || []
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching product:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product'
    })
  }
})