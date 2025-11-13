import { serverSupabaseServiceRole } from '#supabase/server'
import { invalidatePublicCache } from '~/server/utils/publicCache'

/**
 * Admin endpoint to invalidate public cache
 * POST /api/admin/cache/invalidate
 * Body: { scope: 'products' | 'categories' | 'search' | 'landing' | 'all' }
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole(event)

    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: Admin access required'
      })
    }

    // Get scope from request body
    const body = await readBody(event)
    const scope = body?.scope || 'all'

    // Validate scope
    const validScopes = ['products', 'categories', 'search', 'landing', 'all']
    if (!validScopes.includes(scope)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid scope. Must be one of: ${validScopes.join(', ')}`
      })
    }

    // Invalidate cache
    await invalidatePublicCache(scope as any)

    return {
      success: true,
      message: `Successfully invalidated ${scope} cache`,
      scope,
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Cache invalidation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to invalidate cache'
    })
  }
})
