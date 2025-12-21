/**
 * Shared TypeScript types for the auth store
 */

export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  phone?: string
  preferredLanguage: string
  lastLogin?: string
  createdAt: string
  updatedAt?: string
  role?: string
  mfaEnabled: boolean
  mfaFactors: Array<{
    id: string
    type: 'totp'
    status: 'verified' | 'unverified'
    friendlyName?: string
  }>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  language: 'es' | 'en' | 'ro' | 'ru'
}
