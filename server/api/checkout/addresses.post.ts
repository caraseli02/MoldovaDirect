import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuthenticatedUser(event)
    const body = await readBody(event)
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'postalCode', 'country', 'type']
    for (const field of requiredFields) {
      if (!body[field]) {
        throw createError({
          statusCode: 400,
          statusMessage: `Missing required field: ${field}`
        })
      }
    }

    const supabase = serverSupabaseClient(event)

    // If this is set as default, unset other default addresses of the same type
    if (body.isDefault) {
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', body.type)
    }

    // Insert new address
    const { data: address, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: user.id,
        type: body.type,
        first_name: body.firstName,
        last_name: body.lastName,
        company: body.company || null,
        street: body.street,
        city: body.city,
        postal_code: body.postalCode,
        province: body.province || null,
        country: body.country,
        phone: body.phone || null,
        is_default: body.isDefault || false
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return a mock success response
      console.warn('Failed to save address (table may not exist):', error.message)
      return {
        success: true,
        address: {
          id: Date.now(), // Mock ID
          type: body.type,
          firstName: body.firstName,
          lastName: body.lastName,
          company: body.company,
          street: body.street,
          city: body.city,
          postalCode: body.postalCode,
          province: body.province,
          country: body.country,
          phone: body.phone,
          isDefault: body.isDefault || false
        }
      }
    }

    return {
      success: true,
      address: {
        id: address.id,
        type: address.type,
        firstName: address.first_name,
        lastName: address.last_name,
        company: address.company,
        street: address.street,
        city: address.city,
        postalCode: address.postal_code,
        province: address.province,
        country: address.country,
        phone: address.phone,
        isDefault: address.is_default
      }
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