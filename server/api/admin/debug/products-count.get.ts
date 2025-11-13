import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * Admin debug endpoint to check product counts in database
 * GET /api/admin/debug/products-count
 *
 * Returns:
 * - Total products
 * - Active products
 * - Products with categories
 * - Products without categories
 * - Active categories
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

    // Get total products count
    const { count: totalProducts, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count total products',
        data: totalError
      })
    }

    // Get active products count
    const { count: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (activeError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count active products',
        data: activeError
      })
    }

    // Get products with categories count
    const { count: productsWithCategories, error: withCatError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('category_id', 'is', null)

    if (withCatError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count products with categories',
        data: withCatError
      })
    }

    // Get products without categories count
    const { count: productsWithoutCategories, error: withoutCatError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .is('category_id', null)

    if (withoutCatError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count products without categories',
        data: withoutCatError
      })
    }

    // Get active categories count
    const { count: activeCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (categoriesError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to count active categories',
        data: categoriesError
      })
    }

    // Get sample of first 5 active products with their category info
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select(`
        id,
        sku,
        name_translations,
        category_id,
        is_active,
        stock_quantity,
        categories!left (
          id,
          slug,
          name_translations,
          is_active
        )
      `)
      .eq('is_active', true)
      .limit(5)

    return {
      success: true,
      counts: {
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        productsWithCategories: productsWithCategories || 0,
        productsWithoutCategories: productsWithoutCategories || 0,
        activeCategories: activeCategories || 0
      },
      sampleProducts: sampleProducts || [],
      timestamp: new Date().toISOString()
    }

  } catch (error) {
    console.error('Debug products count error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get products count'
    })
  }
})
