/**
 * Composable for making authenticated API requests
 *
 * Handles getting the Supabase session and adding the Authorization header
 * automatically to all requests. Works properly in Vue components where
 * composables are available.
 */

export async function useAuthenticatedFetch<T>(url: string, options: Record<string, any> = {}) {
  const supabase = useSupabaseClient()

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('No active session')
  }

  // Add Authorization header with the access token
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session.access_token}`,
  }

  // Make the request with the auth header
  return await $fetch<T>(url, {
    ...options,
    headers,
  })
}
