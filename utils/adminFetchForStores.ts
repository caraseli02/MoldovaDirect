/**
 * Admin API Fetch for Pinia Stores
 *
 * This utility is specifically designed for use in Pinia store actions
 * where composables like useSupabaseClient() are not available.
 *
 * For component/composable usage, use utils/adminFetch.ts instead.
 */

import type { FetchOptions } from 'ofetch'

/**
 * Get authentication headers for admin API requests
 *
 * This function accesses the Supabase session from localStorage directly
 * since we can't use composables in Pinia stores.
 *
 * @returns Promise<Headers object with Bearer token>
 */
async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  // Check if we're in browser context
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    // On server-side, we can't access cookies from JavaScript
    // Return empty headers - the server will use cookie auth instead
    return {}
  }

  // Find the Supabase auth token in cookies
  // The cookie pattern is: sb-{project-ref}-auth-token
  const cookies = document.cookie.split(';')
  let authData: string | null = null

  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    // Ensure key and value are defined before checking
    if (key && value && key.startsWith('sb-') && key.endsWith('-auth-token')) {
      authData = decodeURIComponent(value)
      break
    }
  }

  if (!authData) {
    console.warn('[AdminFetch] No Supabase auth token found in cookies')
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session. Please log in again.',
    })
  }

  try {
    // Remove "base64-" prefix if present
    const base64Data = authData.startsWith('base64-') ? authData.substring(7) : authData

    // Parse the base64-encoded auth data
    const decoded = JSON.parse(atob(base64Data))
    const accessToken = decoded.access_token

    if (!accessToken) {
      console.warn('[AdminFetch] No access token in auth data')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session. Please log in again.',
      })
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    }
  }
  catch (error) {
    // Don't log the error object as it may contain sensitive data
    console.error('[AdminFetch] Error parsing auth data - AUTH_DECODE_FAILED')
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid session format. Please log in again.',
    })
  }
}

/**
 * Make an authenticated request to an admin API endpoint from a Pinia store
 *
 * This function gets the Bearer token from localStorage and adds it to the request.
 * Use this in Pinia store actions where composables are not available.
 *
 * @param url - API endpoint URL (e.g., '/api/admin/users')
 * @param options - Optional fetch options
 * @returns Promise with the response data
 *
 * @example
 * ```typescript
 * // In a Pinia store action
 * async fetchUsers() {
 *   const response = await adminFetchForStores('/api/admin/users', {
 *     query: { page: 1, limit: 20 }
 *   })
 *   return response
 * }
 * ```
 */
export async function adminFetchForStores<T = any>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  console.log('[AdminFetchForStores] Making request to:', url)

  // Get auth headers
  const authHeaders = await getAdminAuthHeaders()
  console.log('[AdminFetchForStores] Auth headers obtained:', Object.keys(authHeaders))

  // Merge with any existing headers
  const headers = {
    ...options.headers,
    ...authHeaders,
  }

  console.log('[AdminFetchForStores] Final headers:', Object.keys(headers))

  // Make the authenticated request
  // Explicitly type the return to avoid excessive stack depth errors
  const response = await $fetch(url, {
    ...options,
    headers,
  } as any)
  return response as T
}
