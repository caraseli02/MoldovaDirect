import { db } from '~/server/database/connection'
import { categories } from '~/server/database/schema'
import { eq, and, asc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Category slug is required'
      })
    }

    // Get category
    const result = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.slug, slug),
        eq(categories.isActive, true)
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
        .from(categories)
        .where(eq(categories.id, category.parentId))
        .limit(1)
      
      if (parentResult.length > 0) {
        parent = parentResult[0]
      }
    }

    // Get child categories
    const children = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.parentId, category.id),
        eq(categories.isActive, true)
      ))
      .orderBy(asc(categories.sortOrder))

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