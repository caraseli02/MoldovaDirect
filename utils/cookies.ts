/**
 * Cookie Utility Functions
 *
 * Centralized cookie management utilities to ensure consistent
 * cookie handling across the application.
 */

import { useCookie } from '#imports'
import { COOKIE_NAMES, type CookieConfig } from '~/config/cookies'

/**
 * Creates a managed cookie instance with consistent configuration
 *
 * @param name Cookie name from COOKIE_NAMES
 * @param config Cookie configuration
 * @returns Cookie ref with type safety
 */
export function createCookie<T = unknown>(
  name: string,
  config: CookieConfig,
) {
  return useCookie<T>(name, config as unknown)
}

/**
 * Serialize data for cookie storage
 * Handles Date objects and other non-JSON types
 */
export function serializeCookieData(data: unknown): unknown {
  if (!data) return null

  try {
    // Convert to JSON-serializable format
    const serialized = JSON.parse(JSON.stringify(data, (key, value) => {
      // Handle Date objects
      if (value instanceof Date) {
        return value.toISOString()
      }
      // Handle undefined values
      if (value === undefined) {
        return null
      }
      return value
    }))

    return serialized
  }
  catch (error) {
    console.error('Failed to serialize cookie data:', error)
    return null
  }
}

/**
 * Deserialize data from cookie storage
 * Restores Date objects from ISO strings
 */
export function deserializeCookieData<T = unknown>(
  data: unknown,
  dateFields: string[] = [],
): T | null {
  if (!data) return null

  try {
    // Parse dates if field names are provided
    if (dateFields.length > 0 && typeof data === 'object' && data !== null) {
      const restored = { ...data } as Record<string, unknown>

      for (const field of dateFields) {
        if (restored[field]) {
          restored[field] = new Date(restored[field])
        }
      }

      return restored as T
    }

    return data as T
  }
  catch (error: unknown) {
    console.error('Failed to deserialize cookie data:', error)
    return null
  }
}

/**
 * Clear a cookie by name
 */
export function clearCookie(name: string): void {
  const cookie = useCookie(name)
  cookie.value = null
}

/**
 * Check if a cookie exists and has a value
 */
export function hasCookie(name: string): boolean {
  const cookie = useCookie(name)
  return cookie.value != null
}

/**
 * Get cookie value with type safety
 */
export function getCookieValue<T = unknown>(
  name: string,
  defaultValue?: T,
): T | undefined {
  const cookie = useCookie<T>(name)
  return cookie.value ?? defaultValue
}

/**
 * Set cookie value with optional serialization
 */
export function setCookieValue<T = unknown>(
  name: string,
  value: T,
  config?: CookieConfig,
): void {
  const cookie = config ? useCookie<T>(name, config as unknown) : useCookie<T>(name)
  cookie.value = value as unknown
}

/**
 * Cookie manager class for complex cookie operations
 */
export class CookieManager<T = unknown> {
  private cookieRef: unknown
  private dateFields: string[]

  constructor(
    name: string,
    config: CookieConfig,
    dateFields: string[] = [],
  ) {
    this.cookieRef = useCookie<T>(name, config as unknown)
    this.dateFields = dateFields
  }

  /**
   * Get the current cookie value
   */
  get value(): T | null {
    const raw = this.cookieRef.value
    if (!raw) return null

    // Deserialize if date fields are specified
    if (this.dateFields.length > 0) {
      return deserializeCookieData<T>(raw, this.dateFields)
    }

    return raw as T
  }

  /**
   * Set the cookie value
   */
  set value(data: T | null) {
    if (data === null) {
      this.cookieRef.value = null
      return
    }

    // Serialize if needed
    this.cookieRef.value = serializeCookieData(data)
  }

  /**
   * Clear the cookie
   */
  clear(): void {
    this.cookieRef.value = null
  }

  /**
   * Check if cookie exists
   */
  exists(): boolean {
    return this.cookieRef.value != null
  }

  /**
   * Update specific fields in the cookie
   */
  update(updates: Partial<T>): void {
    const current = this.value
    if (!current) {
      this.value = updates as T
      return
    }

    this.value = { ...current, ...updates }
  }

  /**
   * Get a specific field from the cookie
   */
  getField<K extends keyof T>(field: K): T[K] | undefined {
    const data = this.value
    return data ? data[field] : undefined
  }

  /**
   * Set a specific field in the cookie
   */
  setField<K extends keyof T>(field: K, value: T[K]): void {
    const current = this.value || {} as T
    this.value = { ...current, [field]: value }
  }
}

/**
 * Export commonly used cookie managers
 */
export const cartCookieManager = () =>
  new CookieManager(
    COOKIE_NAMES.CART,
    {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      watch: 'shallow',
      default: () => null,
    },
    ['lastSyncAt', 'addedAt', 'lastModified'], // Date fields to restore
  )

export const checkoutCookieManager = () =>
  new CookieManager(
    COOKIE_NAMES.CHECKOUT_SESSION,
    {
      maxAge: 60 * 60 * 2, // 2 hours
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    ['sessionExpiresAt', 'lastSyncAt'], // Date fields to restore
  )
