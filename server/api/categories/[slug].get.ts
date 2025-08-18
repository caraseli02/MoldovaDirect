import { useDB, tables, eq, and, asc } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category slug is required'
      })
    }

    const db = useDB()

    // Get category
    const result = await db
      .select()
      .from(tables.categories)
      .where(and(
        eq(tables.categories.slug, slug),
        eq(tables.categories.isActive, true)
      ))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found'
      })
    }

    const category = result[0]

    // Get parent category if exists
    let parent = null
    if (category.parentId) {
      const parentResult = await db
        .select()
        .from(tables.categories)
        .where(eq(tables.categories.id, category.parentId))
        .limit(1)
      
      if (parentResult.length > 0) {
        parent = parentResult[0]
      }
    }

    // Get child categories
    const children = await db
      .select()
      .from(tables.categories)
      .where(and(
        eq(tables.categories.parentId, category.id),
        eq(tables.categories.isActive, true)
      ))
      .orderBy(asc(tables.categories.sortOrder))

    return {
      ...category,
      parent,
      children
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error fetching category:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch category'
    })
  }
})