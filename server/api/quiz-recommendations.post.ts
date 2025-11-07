import { serverSupabaseClient } from '#supabase/server'
import type { ProductWithRelations } from '~/types'

interface QuizAnswers {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
  locale?: string
}

interface RecommendationResponse {
  recommendations: Array<{
    id: string
    name: string
    slug: string
    description: string
    price: number
    main_image: string | null
  }>
}

/**
 * POST /api/quiz-recommendations
 *
 * Get personalized product recommendations based on quiz answers
 *
 * Body: QuizAnswers
 * Returns: RecommendationResponse
 */
export default defineEventHandler(async (event): Promise<RecommendationResponse> => {
  try {
    const supabase = await serverSupabaseClient(event)
    const body = await readBody<QuizAnswers>(event)

    // Validate required fields
    if (!body.categoryId || !body.experienceLevel || !body.budgetRange || !body.occasion) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request - All quiz answers are required',
      })
    }

    // Map category to product categories
    const categoryMap: Record<string, string[]> = {
      wine: ['Wine', 'Vino', 'Вино', 'Vin'],
      food: ['Food', 'Alimentar', 'Еда', 'Mâncare'],
      crafts: ['Crafts', 'Artesanía', 'Ремесла', 'Meșteșuguri'],
      honey: ['Honey', 'Miere', 'Мед', 'Miere'],
      preserves: ['Preserves', 'Conserve', 'Консервы', 'Conserve'],
      gifts: ['Gifts', 'Regalos', 'Подарки', 'Cadouri'],
    }

    // Map budget to price ranges
    const budgetMap: Record<string, { min: number; max: number }> = {
      under_50: { min: 0, max: 50 },
      '50_100': { min: 50, max: 100 },
      '100_200': { min: 100, max: 200 },
      over_200: { min: 200, max: 999999 },
    }

    // Build query based on answers
    const categories = categoryMap[body.categoryId] || []
    const priceRange = budgetMap[body.budgetRange]

    let query = supabase
      .from('products')
      .select(
        `
        id,
        slug,
        name,
        description,
        price,
        main_image,
        is_active,
        stock,
        categories!inner (
          name
        )
      `
      )
      .eq('is_active', true)
      .gt('stock', 0)

    // Filter by category
    if (categories.length > 0) {
      query = query.in('categories.name', categories)
    }

    // Filter by price range
    if (priceRange) {
      query = query.gte('price', priceRange.min).lte('price', priceRange.max)
    }

    // Apply experience level sorting
    switch (body.experienceLevel) {
      case 'beginner':
        // Prefer lower-priced, popular products
        query = query.order('price', { ascending: true }).limit(10)
        break
      case 'enthusiast':
        // Mix of mid-range products
        query = query.order('price', { ascending: false }).limit(10)
        break
      case 'connoisseur':
        // Prefer premium products
        query = query.order('price', { ascending: false }).limit(10)
        break
    }

    // Apply occasion-based filtering
    switch (body.occasion) {
      case 'gift':
        // Prefer gift-friendly products (sets, premium packaging)
        // This could be enhanced with a gift_friendly flag in the database
        break
      case 'event':
        // Prefer bulk or party-suitable products
        break
      case 'business':
        // Prefer premium, corporate-suitable products
        query = query.gte('price', 50)
        break
      case 'personal':
      default:
        // No special filtering
        break
    }

    const { data: products, error } = await query

    if (error) {
      console.error('Database error fetching recommendations:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch recommendations',
        data: error,
      })
    }

    if (!products || products.length === 0) {
      // Fallback: fetch popular products if no matches
      const { data: fallbackProducts } = await supabase
        .from('products')
        .select('id, slug, name, description, price, main_image')
        .eq('is_active', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(6)

      return {
        recommendations: fallbackProducts || [],
      }
    }

    // Shuffle and limit to 6 recommendations
    const shuffled = products.sort(() => Math.random() - 0.5).slice(0, 6)

    // Map to response format
    const recommendations = shuffled.map((product: any) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      main_image: product.main_image,
    }))

    // Track recommendation event (optional: store in analytics table)
    try {
      await supabase.from('quiz_recommendations').insert({
        category_id: body.categoryId,
        experience_level: body.experienceLevel,
        budget_range: body.budgetRange,
        occasion: body.occasion,
        recommended_products: recommendations.map((p) => p.id),
        locale: body.locale || 'es',
        created_at: new Date().toISOString(),
      })
    } catch (analyticsError) {
      // Don't fail the request if analytics tracking fails
      console.warn('Failed to track quiz recommendation:', analyticsError)
    }

    return {
      recommendations,
    }
  } catch (error: any) {
    console.error('Error generating quiz recommendations:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate recommendations',
      data: error.data || error,
    })
  }
})
