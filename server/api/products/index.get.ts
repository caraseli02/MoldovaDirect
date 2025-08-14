import { useDB, tables, desc, eq, and, or, gte, lte, sql } from '~/server/utils/database'

export default defineCachedEventHandler(async (event) => {
  try {
    const db = useDB()
    const query = getQuery(event)
    
    // Parse query parameters
    const {
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock = false,
      page = 1,
      limit = 12
    } = query

    // Build where conditions
    const conditions = []
    conditions.push(eq(tables.products.isActive, true))

    if (categoryId) {
      conditions.push(eq(tables.products.categoryId, Number(categoryId)))
    }

    if (search) {
      // For SQLite/D1, we use LIKE for text search
      conditions.push(
        or(
          sql`json_extract(${tables.products.nameTranslations}, '$.es') LIKE ${`%${search}%`}`,
          sql`json_extract(${tables.products.nameTranslations}, '$.en') LIKE ${`%${search}%`}`,
          sql`${tables.products.sku} LIKE ${`%${search}%`}`
        )
      )
    }

    if (minPrice !== undefined) {
      conditions.push(gte(tables.products.priceEur, Number(minPrice)))
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(tables.products.priceEur, Number(maxPrice)))
    }

    if (inStock) {
      conditions.push(gte(tables.products.stockQuantity, 1))
    }

    // Calculate offset
    const offset = (Number(page) - 1) * Number(limit)

    // Execute query with joins
    const result = await db
      .select({
        id: tables.products.id,
        sku: tables.products.sku,
        nameTranslations: tables.products.nameTranslations,
        descriptionTranslations: tables.products.descriptionTranslations,
        priceEur: tables.products.priceEur,
        compareAtPriceEur: tables.products.compareAtPriceEur,
        stockQuantity: tables.products.stockQuantity,
        categoryId: tables.products.categoryId,
        images: tables.products.images,
        attributes: tables.products.attributes,
        isActive: tables.products.isActive,
        createdAt: tables.products.createdAt,
        updatedAt: tables.products.updatedAt,
        category: {
          id: tables.categories.id,
          nameTranslations: tables.categories.nameTranslations,
          slug: tables.categories.slug
        }
      })
      .from(tables.products)
      .leftJoin(tables.categories, eq(tables.products.categoryId, tables.categories.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tables.products.createdAt))
      .limit(Number(limit))
      .offset(offset)

    // Get total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tables.products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)

    const total = totalResult[0]?.count || 0
    const totalPages = Math.ceil(total / Number(limit))

    return {
      products: result,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
}, {
  maxAge: 60 * 5, // Cache for 5 minutes
  name: 'products-list',
  swr: true // Stale-while-revalidate
})