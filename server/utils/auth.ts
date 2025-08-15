import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import type { H3Event } from 'h3'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface JWTPayload {
  userId: number
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

export function extractToken(event: H3Event): string | null {
  const authorization = getCookie(event, 'auth-token') || getHeader(event, 'authorization')
  
  if (!authorization) {
    return null
  }
  
  if (authorization.startsWith('Bearer ')) {
    return authorization.substring(7)
  }
  
  return authorization
}

export function setAuthCookies(event: H3Event, accessToken: string, refreshToken: string) {
  setCookie(event, 'auth-token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 15 // 15 minutes
  })
  
  setCookie(event, 'refresh-token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export function clearAuthCookies(event: H3Event) {
  deleteCookie(event, 'auth-token')
  deleteCookie(event, 'refresh-token')
}