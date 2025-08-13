import { seedDatabase } from '~/server/database/seed'

export default defineEventHandler(async (event) => {
  try {
    // TODO: Add admin authentication check here in Phase 3
    
    const result = await seedDatabase()
    
    return {
      success: true,
      message: 'Database seeded successfully',
      data: result
    }
  } catch (error) {
    console.error('Seeding error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database',
      data: error
    })
  }
})