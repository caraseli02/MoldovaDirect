/**
 * Account Deletion API Endpoint
 * 
 * Requirements addressed:
 * - 6.6: User profile management functionality
 * - 6.7: Account deletion functionality
 * - 10.1: Integration with shopping features
 * - 10.2: Proper cleanup of user data
 * 
 * This endpoint handles secure account deletion with proper data cleanup
 * and audit logging for compliance purposes.
 */

export default defineEventHandler(async (event) => {
  try {
    // Ensure this is a DELETE request
    assertMethod(event, 'DELETE')

    // Get the authenticated user
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Get request body for password confirmation and reason
    const body = await readBody(event)
    const { password, reason } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password confirmation required'
      })
    }

    // Verify password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })

    if (passwordError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid password'
      })
    }

    // Log the account deletion request for audit purposes
    await supabase.from('auth_events').insert({
      user_id: user.id,
      event_type: 'account_deletion_requested',
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent'),
      metadata: JSON.stringify({
        reason: reason || 'not_specified',
        timestamp: new Date().toISOString()
      })
    })

    // Start transaction-like cleanup process
    const cleanupErrors: string[] = []

    try {
      // 1. Delete user addresses
      const { error: addressError } = await supabase
        .from('addresses')
        .delete()
        .eq('user_id', user.id)

      if (addressError) {
        cleanupErrors.push(`Failed to delete addresses: ${addressError.message}`)
      }

      // 2. Delete user carts and cart items (cascade should handle cart_items)
      const { error: cartError } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id)

      if (cartError) {
        cleanupErrors.push(`Failed to delete carts: ${cartError.message}`)
      }

      // 3. Anonymize orders (don't delete for business records)
      // Instead of deleting orders, we'll anonymize them
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          user_id: null,
          customer_notes: '[Account Deleted]',
          shipping_address: JSON.stringify({
            street: '[Deleted]',
            city: '[Deleted]',
            postalCode: '[Deleted]',
            country: '[Deleted]'
          }),
          billing_address: JSON.stringify({
            street: '[Deleted]',
            city: '[Deleted]',
            postalCode: '[Deleted]',
            country: '[Deleted]'
          })
        })
        .eq('user_id', user.id)

      if (orderError) {
        cleanupErrors.push(`Failed to anonymize orders: ${orderError.message}`)
      }

      // 4. Delete profile picture from storage
      if (user.user_metadata?.avatar_url) {
        const fileName = `${user.id}/avatar.jpg`
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([fileName])

        if (storageError) {
          cleanupErrors.push(`Failed to delete profile picture: ${storageError.message}`)
        }
      }

      // 5. Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        cleanupErrors.push(`Failed to delete profile: ${profileError.message}`)
      }

      // 6. Finally, delete the auth user
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)

      if (deleteUserError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to delete user account: ${deleteUserError.message}`
        })
      }

      // Log successful deletion
      await supabase.from('auth_events').insert({
        user_id: null, // User no longer exists
        event_type: 'account_deleted',
        ip_address: getClientIP(event),
        user_agent: getHeader(event, 'user-agent'),
        metadata: JSON.stringify({
          deleted_user_id: user.id,
          reason: reason || 'not_specified',
          cleanup_errors: cleanupErrors,
          timestamp: new Date().toISOString()
        })
      })

      // Return success response
      return {
        success: true,
        message: 'Account deleted successfully',
        cleanup_warnings: cleanupErrors.length > 0 ? cleanupErrors : undefined
      }

    } catch (cleanupError) {
      // If cleanup fails, log the error but don't fail the entire operation
      console.error('Account deletion cleanup error:', cleanupError)
      
      // Still try to delete the user account
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (deleteUserError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to delete user account: ${deleteUserError.message}`
        })
      }

      return {
        success: true,
        message: 'Account deleted successfully with some cleanup warnings',
        cleanup_errors: cleanupErrors
      }
    }

  } catch (error) {
    console.error('Account deletion error:', error)

    // Return appropriate error response
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account'
    })
  }
})