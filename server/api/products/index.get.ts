import { db } from '~/server/database/connection'
import { products, categories, productImages } from '~/server/database/schema'
import { eq, and, or, like, gte, lte, desc, asc, sql } from 'drizzle-orm'
import type { ProductFilters, ProductListResponse } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event) as ProductFilters
    
    // Parse query parameters
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock = false,
      featured,
      tags = [],
      sortBy = 'created',
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = query

    // Build where conditions
    const conditions = [
      eq(products.isActive, true)
    ]

    if (categoryId) {
      conditions.push(eq(products.categoryId, Number(categoryId)))
    }

    if (search) {
      // Search in name and description (all languages)
      conditions.push(
        or(
          sql`${products.name}::text ILIKE ${`%${search}%`}`,
          sql`${products.description}::text ILIKE ${`%${search}%`}`,
          like(products.sku, `%${search}%`)
        )
      )
    }

    if (minPrice !== undefined) {
      conditions.push(gte(products.price, String(minPrice)))
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, String(maxPrice)))
    }

    if (inStock) {
      conditions.push(gte(products.stockQuantity, 1))
    }

    if (featured !== undefined) {
      conditions.push(eq(products.isFeatured, Boolean(featured)))
    }

    if (Array.isArray(tags) && tags.length > 0) {
      conditions.push(
        sql`${products.tags} && ${tags}`
      )
    }

    // Build order by clause
    let orderBy
    switch (sortBy) {
      case 'name':
        orderBy = sortOrder === 'asc' ? asc(sql`${products.name}->>'es'`) : desc(sql`${products.name}->>'es'`)
        break
      case 'price':
        orderBy = sortOrder === 'asc' ? asc(products.price) : desc(products.price)
        break
      case 'featured':
        orderBy = desc(products.isFeatured)
        break
      default:
        orderBy = sortOrder === 'asc' ? asc(products.createdAt) : desc(products.createdAt)
    }

    // Calculate offset
    const offset = (Number(page) - 1) * Number(limit)

    // Execute query with joins
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
        stockQuantity: products.stockQuantity,
        categoryId: products.categoryId,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
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
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(Number(limit))
      .offset(offset)

    // Get images for each product
    const productIds = result.map(p => p.id)
    const images = productIds.length > 0 ? await db
      .select()
      .from(productImages)
      .where(sql`${productImages.productId} = ANY(${productIds})`)
      .orderBy(desc(productImages.isPrimary), asc(productImages.sortOrder)) : []

    // Group images by product ID
    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.productId]) acc[img.productId] = []
      acc[img.productId].push(img)
      return acc
    }, {} as Record<number, typeof images>)

    // Combine products with their images and categories
    const productsWithRelations = result.map(product => ({
      ...product,
      images: imagesByProduct[product.id] || []
    }))

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / Number(limit))

    const response: ProductListResponse = {
      products: productsWithRelations,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }

    return response
  } catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
})