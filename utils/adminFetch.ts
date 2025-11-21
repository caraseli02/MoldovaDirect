/**
 * Admin API Fetch Utilities
 *
 * Provides standardized methods for making authenticated requests to admin API endpoints.
 * Handles Bearer token authentication properly in client-side contexts.
 *
 * IMPORTANT: This utility should be used in component setup or composables,
 * NOT in Pinia store actions (composables not available there).
 */

import type { FetchOptions } from 'ofetch'

/**
 * Make an authenticated request to an admin API endpoint
 *
 * This function properly handles Bearer token authentication for client-side requests.
 * It gets the session from Supabase and adds the access token to the Authorization header.
 *
 * @param url - API endpoint URL (e.g., '/api/admin/dashboard/stats')
 * @param options - Optional fetch options
 * @returns Promise with the response data
 *
 * @example
 * ```typescript
 * // In a component setup
 * const stats = await useAdminFetch('/api/admin/dashboard/stats')
 *
 * // With options
 * const users = await useAdminFetch('/api/admin/users', {
 *   method: 'GET',
 *   query: { page: 1, limit: 10 }
 * })
 * ```
 */
export async function useAdminFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Get Supabase client (must be called in composable context)
  const supabase = useSupabaseClient()

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session. Please log in again.'
    })
  }

  // Prepare headers with Bearer token
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${session.access_token}`
  }

  // Make the authenticated request
  return await $fetch<T>(url, {
    ...options,
    headers
  })
}

/**
 * Make an authenticated request that automatically retries once if the token is expired
 *
 * This is useful for long-running pages where the user's session might expire.
 * It will attempt to refresh the session and retry the request once.
 *
 * @param url - API endpoint URL
 * @param options - Optional fetch options
 * @returns Promise with the response data
 *
 * @example
 * ```typescript
 * // In a component that might stay open for a long time
 * const data = await useAdminFetchWithRetry('/api/admin/analytics/users')
 * ```
 */
export async function useAdminFetchWithRetry<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const supabase = useSupabaseClient()

  try {
    return await useAdminFetch<T>(url, options)
  } catch (error: any) {
    // If we get a 401, try to refresh the session and retry once
    if (error?.statusCode === 401) {
      console.log('[AdminFetch] Session expired, attempting to refresh...')

      const { data: { session } } = await supabase.auth.refreshSession()

      if (!session) {
        // Redirect to login if refresh fails
        await navigateTo('/auth/login')
        throw createError({
          statusCode: 401,
          statusMessage: 'Session expired. Please log in again.'
        })
      }

      // Retry the request with the new session
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`
      }

      return await $fetch<T>(url, {
        ...options,
        headers
      })
    }

    // Re-throw other errors
    throw error
  }
}

/**
 * Batch multiple admin API requests in parallel
 *
 * This is useful for fetching multiple datasets at once (e.g., stats + activity).
 * All requests will include proper authentication headers.
 *
 * @param requests - Array of request configurations
 * @returns Promise that resolves to an array of responses
 *
 * @example
 * ```typescript
 * const [stats, activity, users] = await useAdminFetchBatch([
 *   { url: '/api/admin/dashboard/stats' },
 *   { url: '/api/admin/dashboard/activity' },
 *   { url: '/api/admin/users', options: { query: { limit: 10 } } }
 * ])
 * ```
 */
export async function useAdminFetchBatch<T extends any[] = any[]>(
  requests: Array<{ url: string; options?: FetchOptions }>
): Promise<T> {
  const supabase = useSupabaseClient()

  // Get session once for all requests
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session. Please log in again.'
    })
  }

  // Prepare headers with Bearer token
  const authHeaders = {
    'Authorization': `Bearer ${session.access_token}`
  }

  // Execute all requests in parallel
  const promises = requests.map(({ url, options = {} }) =>
    $fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders
      }
    }).catch(error => {
      console.error(`[AdminFetch] Error fetching ${url}:`, error)
      return null // Return null on error instead of throwing
    })
  )

  return await Promise.all(promises) as T
}
