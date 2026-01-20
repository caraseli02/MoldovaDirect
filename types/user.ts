/**
 * Shared User-Related Type Definitions
 */

export interface UserMetadata {
  /** Avatar URL from Supabase Storage */
  avatar_url?: string | null
  /** User's display name */
  name?: string
  /** User's full name (legacy field) */
  full_name?: string
  /** Phone number */
  phone?: string
  /** Preferred language code */
  preferred_language?: 'es' | 'en' | 'ro' | 'ru'
  /** Preferred currency code */
  preferred_currency?: 'EUR' | 'USD' | 'MDL'
}

export interface SupabaseUser {
  /** User ID */
  id: string
  /** User email */
  email?: string | null
  /** User metadata from auth */
  user_metadata?: UserMetadata
}

export interface ProfileForm {
  /** User's display name */
  name: string
  /** User's email (read-only in form) */
  email: string
  /** Phone number */
  phone: string
  /** Preferred language code */
  preferredLanguage: 'es' | 'en' | 'ro' | 'ru'
  /** Preferred currency code */
  preferredCurrency: 'EUR' | 'USD' | 'MDL'
}

export interface ProfileFormErrors {
  /** Name field error message (empty string = no error) */
  name: string
  /** Phone field error message (empty string = no error) */
  phone: string
}
