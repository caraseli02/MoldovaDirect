import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users, sessions } from '~/server/database/schema/users'
import { verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from '~/server/utils/auth'
import { useDB } from '~/server/utils/database'
import { v4 as uuidv4 } from 'uuid'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const validation = loginSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: validation.error.flatten()
    })
  }
  
  const { email, password } = validation.data
  const db = useDB()
  
  const user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
  
  const isValidPassword = await verifyPassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
  
  const accessToken = generateAccessToken({ userId: user.id, email: user.email })
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email })
  
  await db.delete(sessions).where(eq(sessions.userId, user.id))
  
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  
  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    refreshToken,
    expiresAt
  })
  
  setAuthCookies(event, accessToken, refreshToken)
  
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      preferredLanguage: user.preferredLanguage
    },
    accessToken
  }
})