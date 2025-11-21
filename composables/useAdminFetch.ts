/**
 * Admin API Fetch Composable
 *
 * Use this composable in Vue components to make authenticated requests to admin API endpoints.
 * This automatically adds the Bearer token from the current Supabase session.
 *
 * IMPORTANT: This composable MUST be called from within a component setup context
 * (not from Pinia stores, where composables are not available).
 */

import type { FetchOptions } from 'ofetch'

/**
 * Make an authenticated request to an admin API endpoint
 *
 * @param url - API endpoint URL (e.g., '/api/admin/users')
 * @param options - Optional fetch options
 * @returns Promise with the response data
 *
 * @example
 * ```vue
 * <script setup>
 * const { data, error } = await useAdminFetch('/api/admin/users', {
 *   query: { page: 1, limit: 20 }
 * })
 * </script>
 * ```
 */
export async function useAdminFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  // Get Supabase client from composable context
  const supabase = useSupabaseClient()

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.error('[useAdminFetch] No active session')
    throw createError({
      statusCode: 401,
      statusMessage: 'Session expired. Please log in again.'
    })
  }

  // Prepare headers with Bearer token
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${session.access_token}`
  }

  console.log('[useAdminFetch] Making request to:', url, 'with Bearer token')

  // Make the authenticated request using $fetch
  // Note: We use $fetch here which works in component context
  return await $fetch<T>(url, {
    ...options,
    headers
  })
}
