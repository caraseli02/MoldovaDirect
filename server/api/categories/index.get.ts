import { db } from '~/server/database/connection'
import { categories } from '~/server/database/schema'
import { eq, isNull, asc } from 'drizzle-orm'
import type { CategoryWithChildren } from '~/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Get all active categories
    const allCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.sortOrder), asc(categories.id))

    // Build hierarchical structure
    const categoryMap = new Map<number, CategoryWithChildren>()
    const rootCategories: CategoryWithChildren[] = []

    // First pass: Create map of all categories
    allCategories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: []
      })
    })

    // Second pass: Build hierarchy
    allCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!
      
      if (category.parentId) {
        // Add to parent's children
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children!.push(categoryWithChildren)
        }
      } else {
        // Root category
        rootCategories.push(categoryWithChildren)
      }
    })

    return {
      categories: rootCategories
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories'
    })
  }
})