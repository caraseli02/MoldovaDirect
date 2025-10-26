import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const query = getQuery(event) as {
      category?: string
      inStock?: string
      featured?: string
    }

    const buildBase = () => {
      let qb = supabase
        .from('products')
        .select(`
          id,
          price_eur,
          stock_quantity,
          categories (
            slug
          )
        `)
        .eq('is_active', true)

      if (query.category) {
        qb = qb.eq('categories.slug', query.category)
      }
      if (query.inStock === 'true') {
        qb = qb.gt('stock_quantity', 0)
      }
      // No explicit featured flag in schema; ignore for now

      return qb
    }

    const minQuery = buildBase().order('price_eur', { ascending: true }).limit(1)
    const maxQuery = buildBase().order('price_eur', { ascending: false }).limit(1)

    const [{ data: minData, error: minError }, { data: maxData, error: maxError }] = await Promise.all([
      minQuery,
      maxQuery
    ])

    if (minError || maxError) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to compute price range', data: minError || maxError })
    }

    const min = minData && minData.length > 0 ? (minData[0] as any).price_eur : 0
    const max = maxData && maxData.length > 0 ? (maxData[0] as any).price_eur : 0

    return {
      success: true,
      min,
      max
    }
  } catch (error) {
    console.error('Price range API error:', error)
    return {
      success: true,
      min: 0,
      max: 200
    }
  }
})

