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
export async function useAdminFetch<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  // Get Supabase client (must be called in composable context)
  const supabase = useSupabaseClient()

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session. Please log in again.',
    })
  }

  // Prepare headers with Bearer token
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    Authorization: `Bearer ${session.access_token}`,
  }

  // Make the authenticated request
  return $fetch<T>(url, {
    ...options,
    headers,
  } as any) as Promise<T>
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
export async function useAdminFetchWithRetry<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const supabase = useSupabaseClient()

  try {
    return await useAdminFetch<T>(url, options)
  }
  catch (error: any) {
    // If we get a 401, try to refresh the session and retry once
    const isUnauthorized = error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 401
    if (isUnauthorized) {
      const { data: { session } } = await supabase.auth.refreshSession()

      if (!session) {
        // Redirect to login if refresh fails
        await navigateTo('/auth/login')
        throw createError({
          statusCode: 401,
          statusMessage: 'Session expired. Please log in again.',
        })
      }

      // Retry the request with the new session
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
        Authorization: `Bearer ${session.access_token}`,
      }

      return $fetch<T>(url, {
        ...options,
        headers,
      } as any) as Promise<T>
    }

    // Re-throw other errors
    throw error
  }
}

/**
 * Result type for batch fetch operations with structured error handling
 */
export type BatchResult<T>
  = | { success: true, data: T }
    | { success: false, error: string, url: string }

/**
 * Batch multiple admin API requests in parallel
 *
 * This is useful for fetching multiple datasets at once (e.g., stats + activity).
 * All requests will include proper authentication headers.
 *
 * Returns structured results so callers can handle individual request failures.
 *
 * @param requests - Array of request configurations
 * @returns Promise that resolves to an array of batch results
 *
 * @example
 * ```typescript
 * const results = await useAdminFetchBatch([
 *   { url: '/api/admin/dashboard/stats' },
 *   { url: '/api/admin/dashboard/activity' },
 *   { url: '/api/admin/users', options: { query: { limit: 10 } } }
 * ])
 *
 * // Handle results
 * results.forEach((result, index) => {
 *   if (result.success) {
 *   } else {
 *     console.error('Failed to fetch', result.url, result.error)
 *   }
 * })
 *
 * // Extract successful results only
 * const successfulData = results
 *   .filter((r): r is { success: true; data: unknown } => r.success)
 *   .map(r => r.data)
 * ```
 */
export async function useAdminFetchBatch<T = unknown>(
  requests: Array<{ url: string, options?: FetchOptions }>,
): Promise<BatchResult<T>[]> {
  const supabase = useSupabaseClient()

  // Get session once for all requests
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No active session. Please log in again.',
    })
  }

  // Prepare headers with Bearer token
  const authHeaders: Record<string, string> = {
    Authorization: `Bearer ${session.access_token}`,
  }

  // Execute all requests in parallel with structured error handling
  const promises = requests.map(async ({ url, options = {} }): Promise<BatchResult<T>> => {
    try {
      const data = await $fetch<T>(url, {
        ...options,
        headers: {
          ...(options.headers as Record<string, string> || {}),
          ...authHeaders,
        },
      } as any)
      return { success: true, data } as BatchResult<T>
    }
    catch (error: any) {
      // Don't log error object that may contain sensitive data
      console.error(`[AdminFetch] Error fetching ${url} - ADMIN_BATCH_FETCH_FAILED`)
      return {
        success: false,
        url,
        error: (error as { message?: string, statusMessage?: string })?.message
          || (error as { message?: string, statusMessage?: string })?.statusMessage
          || 'Unknown error occurred',
      }
    }
  })

  return await Promise.all(promises)
}
