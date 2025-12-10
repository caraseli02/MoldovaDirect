/**
 * User Checkout Data API Endpoint
 *
 * Fetches all user-specific checkout data in parallel for optimal performance:
 * - Saved addresses
 * - Checkout preferences (shipping method, etc.)
 *
 * This endpoint is called once during checkout initialization to prefetch
 * all necessary data, reducing subsequent API calls and improving UX.
 *
 * Authentication: Required (authenticated users only)
 * Method: GET
 * Response: { addresses: Address[], preferences: CheckoutPreferences | null }
 */

import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Verify user authentication
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - User must be authenticated',
    })
  }

  const supabase = await serverSupabaseClient(event)

  try {
    // Fetch addresses and preferences in parallel for performance
    const [addressesResult, preferencesResult] = await Promise.all([
      // Fetch user addresses ordered by default first, then by creation date
      supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false }),

      // Fetch user checkout preferences
      supabase
        .from('user_checkout_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(), // Use maybeSingle() to avoid error if no preferences exist
    ])

    // Handle addresses query errors
    if (addressesResult.error) {
      console.error('Failed to fetch addresses:', addressesResult.error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user addresses',
        data: addressesResult.error,
      })
    }

    // Handle preferences query errors (non-critical - preferences might not exist)
    if (preferencesResult.error) {
      console.error('Failed to fetch preferences:', preferencesResult.error)
      // Don't throw error - preferences are optional
    }

    // Return the data
    return {
      addresses: addressesResult.data || [],
      preferences: preferencesResult.data || null,
    }
  }
  catch (error) {
    console.error('Failed to fetch user checkout data:', error)

    // Re-throw if already a createError
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user checkout data',
      data: error,
    })
  }
})
