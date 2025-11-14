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
      // If table doesn't exist or other DB error, return empty array instead of failing
      console.warn('Failed to fetch addresses:', error.message)
      return {
        success: true,
        addresses: []
      }
    }

    return {
      success: true,
      addresses: addresses || []
    }
  } catch (error) {
    // For authentication errors, still throw them
    if (error.statusCode === 401) {
      throw error
    }
    
    // For other errors, return empty addresses instead of failing
    console.warn('Error in addresses API:', error)
    return {
      success: true,
      addresses: []
    }
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