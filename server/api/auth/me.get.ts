import { eq } from 'drizzle-orm'
import { users } from '~/server/database/schema/users'
import { extractToken, verifyAccessToken } from '~/server/utils/auth'
import { useDB } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const token = extractToken(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided'
    })
  }
  
  const payload = verifyAccessToken(token)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }
  
  const db = useDB()
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).get()
  
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      preferredLanguage: user.preferredLanguage,
      emailVerified: user.emailVerified
    }
  }
})