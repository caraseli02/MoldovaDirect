import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { users, sessions } from '~/server/database/schema/users'
import { hashPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from '~/server/utils/auth'
import { useDB } from '~/server/utils/database'
import { v4 as uuidv4 } from 'uuid'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  preferredLanguage: z.enum(['es', 'en', 'ro', 'ru']).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const validation = registerSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: validation.error.flatten()
    })
  }
  
  const { email, password, name, phone, preferredLanguage } = validation.data
  const db = useDB()
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).get()
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User already exists'
    })
  }
  
  const passwordHash = await hashPassword(password)
  
  const newUser = await db.insert(users).values({
    email,
    passwordHash,
    name,
    phone,
    preferredLanguage: preferredLanguage || 'es'
  }).returning().get()
  
  const accessToken = await generateAccessToken({ userId: newUser.id, email: newUser.email })
  const refreshToken = await generateRefreshToken({ userId: newUser.id, email: newUser.email })
  
  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  
  await db.insert(sessions).values({
    id: sessionId,
    userId: newUser.id,
    refreshToken,
    expiresAt
  })
  
  setAuthCookies(event, accessToken, refreshToken)
  
  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      preferredLanguage: newUser.preferredLanguage
    },
    accessToken
  }
})