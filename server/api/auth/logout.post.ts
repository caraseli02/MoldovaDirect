import { eq } from 'drizzle-orm'
import { sessions } from '~/server/database/schema/users'
import { clearAuthCookies, extractToken, verifyAccessToken } from '~/server/utils/auth'
import { useDB } from '~/server/utils/database'

export default defineEventHandler(async (event) => {
  const token = extractToken(event)
  
  if (token) {
    const payload = verifyAccessToken(token)
    if (payload) {
      const db = useDB()
      await db.delete(sessions).where(eq(sessions.userId, payload.userId))
    }
  }
  
  clearAuthCookies(event)
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})