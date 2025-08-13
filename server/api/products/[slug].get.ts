import { db } from '~/server/database/connection'
import { products, categories, productImages } from '~/server/database/schema'
import { eq, and, desc, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product slug is required'
      })
    }

    // Get product with category
    const result = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        price: products.price,
        comparePrice: products.comparePrice,
        sku: products.sku,
        barcode: products.barcode,
        weight: products.weight,
        stockQuantity: products.stockQuantity,
        minStockLevel: products.minStockLevel,
        categoryId: products.categoryId,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        metaTitle: products.metaTitle,
        metaDescription: products.metaDescription,
        tags: products.tags,
        origin: products.origin,
        alcoholContent: products.alcoholContent,
        volume: products.volume,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
          description: categories.description
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(
        eq(products.slug, slug),
        eq(products.isActive, true)
      ))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    const product = result[0]

    // Get product images
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder))

    // Return product with relations
    return {
      ...product,
      images
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