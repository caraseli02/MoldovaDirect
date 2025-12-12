/**
 * Multi-Factor Authentication (MFA) Module
 *
 * Handles all MFA-related operations:
 * - MFA enrollment and setup
 * - MFA verification during login
 * - MFA factor management
 * - Authenticator Assurance Level (AAL) checking
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { useToast } from '~/composables/useToast'

export interface MFAEnrollment {
  id: string
  qrCode: string
  secret: string
  uri: string
}

export interface MFAChallenge {
  factorId: string
  challengeId: string
}

export interface MFAFactor {
  id: string
  type: 'totp'
  status: 'verified' | 'unverified'
  friendlyName?: string
}

/**
 * Start MFA enrollment - generates QR code and secret
 */
export async function enrollMFA(
  supabase: SupabaseClient,
  friendlyName?: string,
): Promise<MFAEnrollment> {
  const toastStore = useToast()

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: friendlyName || 'Authenticator App',
  })

  if (error) {
    toastStore.error('MFA Enrollment Error', error.message)
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No data returned from MFA enrollment')
  }

  toastStore.success(
    'MFA Enrollment Started',
    'Scan the QR code with your authenticator app',
  )

  return {
    id: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  }
}

/**
 * Verify and complete MFA enrollment with a code from authenticator app
 */
export async function verifyMFAEnrollment(
  supabase: SupabaseClient,
  factorId: string,
  code: string,
): Promise<void> {
  const toastStore = useToast()

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  })

  if (error) {
    toastStore.error(
      'Invalid Code',
      'The code you entered is invalid or has expired. Please try again.',
    )
    throw new Error(error.message)
  }

  toastStore.success(
    'MFA Enabled',
    'Two-factor authentication has been enabled successfully',
  )
}

/**
 * Create MFA challenge for verification during login
 */
export async function challengeMFA(
  supabase: SupabaseClient,
  factorId: string,
): Promise<MFAChallenge> {
  const { data, error } = await supabase.auth.mfa.challenge({
    factorId,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No data returned from MFA challenge')
  }

  return {
    factorId,
    challengeId: data.id,
  }
}

/**
 * Verify MFA code during login
 */
export async function verifyMFA(
  supabase: SupabaseClient,
  challenge: MFAChallenge,
  code: string,
): Promise<void> {
  const toastStore = useToast()

  const { error } = await supabase.auth.mfa.verify({
    factorId: challenge.factorId,
    challengeId: challenge.challengeId,
    code,
  })

  if (error) {
    toastStore.error(
      'Invalid Code',
      'The code you entered is invalid or has expired',
    )
    throw new Error(error.message)
  }

  toastStore.success('Verified', 'MFA verification successful')
}

/**
 * Unenroll/remove MFA factor
 */
export async function unenrollMFA(
  supabase: SupabaseClient,
  factorId: string,
): Promise<void> {
  const toastStore = useToast()

  const { error } = await supabase.auth.mfa.unenroll({
    factorId,
  })

  if (error) {
    toastStore.error('Error', error.message)
    throw new Error(error.message)
  }

  toastStore.success(
    'MFA Disabled',
    'Two-factor authentication has been disabled',
  )
}

/**
 * Fetch user's MFA factors
 */
export async function fetchMFAFactors(
  supabase: SupabaseClient,
): Promise<MFAFactor[]> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error || !data) {
      console.warn('Failed to fetch MFA factors:', error)
      return []
    }

    return data.totp?.map((factor: any) => ({
      id: factor.id,
      type: 'totp' as const,
      status: factor.status as 'verified' | 'unverified',
      friendlyName: factor.friendly_name,
    })) || []
  }
  catch (error: any) {
    console.warn('Failed to fetch MFA factors:', error)
    return []
  }
}

/**
 * Check Authenticator Assurance Level (AAL)
 * AAL1 = password only, AAL2 = password + MFA
 */
export async function checkAAL(supabase: SupabaseClient) {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

    if (error) {
      console.warn('Failed to check AAL:', error)
      return null
    }

    return data
  }
  catch (error: any) {
    console.warn('AAL check error:', error)
    return null
  }
}
