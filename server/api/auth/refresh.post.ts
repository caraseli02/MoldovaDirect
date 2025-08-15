import { eq } from 'drizzle-orm'
import { users, sessions } from '~/server/database/schema/users'
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, setAuthCookies } from '~/server/utils/auth'
import { useDB } from '~/server/utils/database'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh-token')
  
  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No refresh token provided'
    })
  }
  
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token'
    })
  }
  
  const db = useDB()
  
  const session = await db.select().from(sessions).where(eq(sessions.refreshToken, refreshToken)).get()
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Session not found'
    })
  }
  
  const user = await db.select().from(users).where(eq(users.id, payload.userId)).get()
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found'
    })
  }
  
  const newAccessToken = generateAccessToken({ userId: user.id, email: user.email })
  const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email })
  
  await db.delete(sessions).where(eq(sessions.id, session.id))
  
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    refreshToken: newRefreshToken,
    expiresAt
  })
  
  setAuthCookies(event, newAccessToken, newRefreshToken)
  
  return {
    accessToken: newAccessToken
  }
})