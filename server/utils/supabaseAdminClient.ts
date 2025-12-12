import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

type GenericSupabaseClient = SupabaseClient<any, 'public', any>

let cachedServiceClient: GenericSupabaseClient | null = null

/**
 * Resolve a Supabase client for server-side operations.
 * Priority:
 * 1. Provided client argument.
 * 2. Global useSupabaseClient (when available in Nuxt context).
 * 3. Service role client instantiated from runtime config.
 */
export function resolveSupabaseClient(
  providedClient?: GenericSupabaseClient,
): GenericSupabaseClient {
  if (providedClient) {
    return providedClient
  }

  const globalGetter = (globalThis as any)?.useSupabaseClient
  if (typeof globalGetter === 'function') {
    try {
      const client = globalGetter()
      if (client) {
        return client
      }
    }
    catch {
      // Fallback to service client below
    }
  }

  // Fallback: use runtime config for background jobs
  const config = useRuntimeConfig()
  const url = config.supabaseUrl
  const serviceKey = config.supabaseServiceKey

  if (!url || !serviceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase credentials are not configured for server email utilities',
    })
  }

  if (!cachedServiceClient) {
    cachedServiceClient = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return cachedServiceClient
}

export type ResolvedSupabaseClient = GenericSupabaseClient
