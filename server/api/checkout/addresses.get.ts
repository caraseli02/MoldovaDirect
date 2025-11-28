import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthenticatedUser(event)
    const supabase = await serverSupabaseClient(event)
    
    // Get user's saved addresses from database
    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch addresses:', {
        userId: user.id,
        error: error.message,
        code: error.code,
        details: error.details
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load your saved addresses. Please refresh the page.',
        data: { error: error.message }
      })
    }

    return {
      success: true,
      addresses: addresses || []
    }
  } catch (error) {
    // Re-throw authentication errors
    if (error.statusCode === 401) {
      throw error
    }

    // Re-throw known errors
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors with full context
    console.error('Unexpected error fetching addresses:', {
      error,
      errorType: error?.constructor?.name,
      message: error?.message,
      stack: error?.stack
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while loading addresses',
      data: {
        errorType: error?.constructor?.name,
        message: String(error)
      }
    })
  }
})

async function requireAuthenticatedUser(event: any) {
  const user = await serverSupabaseUser(event)
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  return user
}