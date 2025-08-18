import { seedDatabase } from '~/server/database/seed'

export default defineEventHandler(async (event) => {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Seeding is only allowed in development'
      })
    }

    const result = await seedDatabase()
    
    return {
      success: true,
      message: 'Database seeded successfully',
      ...result
    }
  } catch (error) {
    console.error('Seeding error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed database'
    })
  }
})