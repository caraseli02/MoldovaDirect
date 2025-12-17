/**
 * Test API: Set Admin Role
 *
 * This endpoint is used during E2E test setup to ensure the admin user
 * has the correct role in the profiles table.
 *
 * SECURITY: Only available in test mode
 */

import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Only allow in test/development mode
  const isTestMode = process.env.PLAYWRIGHT_TEST === 'true'
    || process.env.NODE_ENV === 'test'
    || process.env.NODE_ENV === 'development'

  if (!isTestMode) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This endpoint is only available in test mode',
    })
  }

  const body = await readBody(event)
  const { email } = body

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required',
    })
  }

  try {
    const supabase = serverSupabaseServiceRole(event)

    // Get all users with pagination
    let allUsers: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000,
      })

      if (listError) {
        console.error('Error listing users:', listError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to list users',
        })
      }

      allUsers = allUsers.concat(users)
      hasMore = users.length === 1000
      page++
    }

    console.log(`Found ${allUsers.length} total users in database`)
    console.log(`Looking for email: ${email}`)

    const user = allUsers.find(u => u.email === email)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: `User not found: ${email}. Searched ${allUsers.length} users.`,
      })
    }

    console.log(`Found user: ${user.email} with ID: ${user.id}`)

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      // Create profile if it doesn't exist
      console.log(`Creating profile for user: ${user.id}`)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Admin User',
          role: 'admin',
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create profile',
        })
      }
    }
    else {
      // Update existing profile role
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating profile role:', updateError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to update profile role',
        })
      }
    }

    // Verify the update
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      console.error('Error fetching profile:', fetchError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify profile update',
      })
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        profile: {
          name: profile.name,
          role: profile.role,
        },
      },
    }
  }
  catch (error: any) {
    console.error('Set admin role error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error',
    })
  }
})
