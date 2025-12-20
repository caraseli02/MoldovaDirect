/**
 * Impersonation Utilities
 *
 * Provides JWT token generation and verification for admin user impersonation.
 * Implements time-limited, secure tokens for impersonation sessions.
 */

import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * Payload structure for impersonation JWT tokens
 */
export interface ImpersonationTokenPayload {
  type: 'impersonation'
  admin_id: string
  user_id: string
  log_id: number
  iat?: number
  exp?: number
}

/**
 * Options for generating an impersonation token
 */
export interface GenerateImpersonationTokenOptions {
  adminId: string
  userId: string
  logId: number
  expiresIn: number // in seconds
}

/**
 * Generates a time-limited JWT token for impersonation sessions
 *
 * @param options - Token generation options
 * @returns Signed JWT token
 * @throws Error if IMPERSONATION_JWT_SECRET is not configured
 */
export async function generateImpersonationToken(
  options: GenerateImpersonationTokenOptions,
): Promise<string> {
  const secret = process.env.IMPERSONATION_JWT_SECRET

  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'IMPERSONATION_JWT_SECRET environment variable is not configured',
    })
  }

  const payload: Omit<ImpersonationTokenPayload, 'iat' | 'exp'> = {
    type: 'impersonation',
    admin_id: options.adminId,
    user_id: options.userId,
    log_id: options.logId,
  }

  return jwt.sign(payload, secret, {
    expiresIn: options.expiresIn,
    issuer: 'moldovadirect-admin',
    audience: 'moldovadirect-impersonation',
  })
}

/**
 * Verifies and decodes an impersonation JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export async function verifyImpersonationToken(
  token: string,
): Promise<ImpersonationTokenPayload> {
  const secret = process.env.IMPERSONATION_JWT_SECRET

  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'IMPERSONATION_JWT_SECRET environment variable is not configured',
    })
  }

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'moldovadirect-admin',
      audience: 'moldovadirect-impersonation',
    }) as ImpersonationTokenPayload

    // Verify token type
    if (decoded.type !== 'impersonation') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token type',
      })
    }

    return decoded
  }
  catch (error: any) {
    // Handle JWT-specific errors
    if (error.name === 'TokenExpiredError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Impersonation token has expired',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid impersonation token',
      })
    }

    // Re-throw if already a createError
    if (error.statusCode) {
      throw error
    }

    // Generic error
    throw createError({
      statusCode: 401,
      statusMessage: 'Failed to verify impersonation token',
    })
  }
}

/**
 * Validates an impersonation session against the database
 *
 * @param event - H3 event object
 * @param token - JWT token to validate
 * @returns Impersonation log data if valid
 * @throws Error if session is invalid or expired
 */
export async function validateImpersonationSession(
  event: H3Event,
  token: string,
) {
  const decoded = await verifyImpersonationToken(token)

  const supabase = serverSupabaseServiceRole(event)

  // Verify the session exists in the database and is still active
  const { data: session, error } = await supabase
    .from('impersonation_logs')
    .select('*')
    .eq('id', decoded.log_id)
    .eq('admin_id', decoded.admin_id)
    .eq('target_user_id', decoded.user_id)
    .single()

  if (error || !session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Impersonation session not found',
    })
  }

  // Check if session was explicitly ended
  if (session.ended_at) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Impersonation session has been ended',
    })
  }

  // Check if session has expired
  if (new Date(session.expires_at) < new Date()) {
    // Auto-end expired sessions
    await supabase
      .from('impersonation_logs')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', session.id)

    throw createError({
      statusCode: 401,
      statusMessage: 'Impersonation session has expired',
    })
  }

  return session
}
