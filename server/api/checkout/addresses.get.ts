import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { H3Event } from 'h3'

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
        details: error.details,
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load your saved addresses. Please refresh the page.',
        data: { error: error.message },
      })
    }

    return {
      success: true,
      addresses: addresses || [],
    }
  }
  catch (error: any) {
    // Re-throw authentication errors
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 401) {
      throw error
    }

    // Re-throw known errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    // Log unexpected errors with full context
    console.error('Unexpected error fetching addresses:', {
      error,
      errorType: error?.constructor?.name,
      message: errorMessage,
      stack: errorStack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred while loading addresses',
      data: {
        errorType: error?.constructor?.name,
        message: errorMessage,
      },
    })
  }
})

async function requireAuthenticatedUser(event: H3Event) {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return user
}
