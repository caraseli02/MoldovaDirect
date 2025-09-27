export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthenticatedUser(event)
    const supabase = serverSupabaseClient(event)
    
    // Get user's saved addresses from database
    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch addresses'
      })
    }

    return {
      success: true,
      addresses: addresses || []
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
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