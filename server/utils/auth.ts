import { SignJWT, jwtVerify } from 'jose'
import type { H3Event } from 'h3'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'
)
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface JWTPayload {
  userId: number
  email: string
}

// Using Web Crypto API instead of bcrypt for Cloudflare Workers compatibility
async function getPasswordKey(password: string): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  return passwordKey
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  const passwordKey = await getPasswordKey(password)
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  )
  
  const hashArray = new Uint8Array(derivedBits)
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  // Store salt and hash together
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':')
  
  if (!saltHex || !hashHex) {
    return false
  }
  
  const salt = new Uint8Array(
    saltHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
  )
  
  const passwordKey = await getPasswordKey(password)
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256
  )
  
  const hashArray = new Uint8Array(derivedBits)
  const computedHashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return computedHashHex === hashHex
}

export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(JWT_REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET)
    return payload as JWTPayload
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