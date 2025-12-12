import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'
import { addressFromEntity } from '~/types/address'

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
          statusMessage: `Missing required field: ${field}`,
        })
      }
    }

    const supabase = await serverSupabaseClient(event)

    // If this is set as default, unset other default addresses of the same type
    if (body.isDefault) {
      const { error: unsetError } = await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', body.type)

      if (unsetError) {
        console.error('Failed to unset previous default address:', {
          userId: user.id,
          type: body.type,
          error: unsetError,
        })
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update default address settings',
          data: { error: unsetError.message },
        })
      }
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
        is_default: body.isDefault || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to save address:', {
        userId: user.id,
        error: error.message,
        code: error.code,
        details: error.details,
      })
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save address. Please try again or contact support.',
        data: { error: error.message },
      })
    }

    return {
      success: true,
      address: addressFromEntity(address),
    }
  }
  catch (error: any) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('Unexpected error saving address:', {
      error,
      errorType: error?.constructor?.name,
      message: errorMessage,
      stack: errorStack,
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save address due to an unexpected error. Please try again.',
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
