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

import { getRequestIP } from 'h3'
import { serverSupabaseClient } from '#supabase/server'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createLogger } from '~/server/utils/secureLogger'

const logger = createLogger('delete-account')

export default defineEventHandler(async (event) => {
  try {
    // Ensure this is a DELETE request
    assertMethod(event, 'DELETE')

    // Get the authenticated user (regular client for authentication)
    const supabase = await serverSupabaseClient(event)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    // Get request body for password confirmation and reason
    const body = await readBody(event)
    const { password, reason } = body

    if (!password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password confirmation required',
      })
    }

    // Verify password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password,
    })

    if (passwordError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid password',
      })
    }

    // Log the account deletion request for audit purposes
    await supabase.from('auth_events').insert({
      user_id: user.id,
      event_type: 'account_deletion_requested',
      ip_address: getRequestIP(event),
      user_agent: getHeader(event, 'user-agent'),
      metadata: JSON.stringify({
        reason: reason || 'not_specified',
        timestamp: new Date().toISOString(),
      }),
    })

    // Use atomic deletion function for GDPR compliance
    // This ensures all-or-nothing deletion (no partial deletions)
    const serviceRoleSupabase = await serverSupabaseServiceRole(event)

    try {
      // Call the atomic deletion function
      // All operations happen in a single database transaction
      const { data: deletionResult, error: deletionError } = await serviceRoleSupabase
        .rpc('delete_user_account_atomic', {
          target_user_id: user.id,
          deletion_reason: reason || 'not_specified',
        })

      if (deletionError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to delete account data: ${deletionError.message}`,
        })
      }

      // Delete profile picture from storage (non-critical, outside transaction)
      if (user.user_metadata?.avatar_url) {
        const fileName = `${user.id}/avatar.jpg`
        await serviceRoleSupabase.storage
          .from('avatars')
          .remove([fileName])
          .catch((err: any) => {
            // Log but don't fail - storage deletion is non-critical
            logger.warn('Failed to delete profile picture', { error: err.message })
          })
      }

      // Finally, delete the auth user (after data cleanup)
      const { error: deleteUserError } = await serviceRoleSupabase.auth.admin.deleteUser(user.id)

      if (deleteUserError) {
        throw createError({
          statusCode: 500,
          statusMessage: `Failed to delete user account: ${deleteUserError.message}`,
        })
      }

      // Return success response with deletion summary
      return {
        success: true,
        message: 'Account deleted successfully',
        details: {
          addresses_deleted: deletionResult?.addresses_deleted || 0,
          carts_deleted: deletionResult?.carts_deleted || 0,
          orders_anonymized: deletionResult?.orders_anonymized || 0,
          profile_deleted: deletionResult?.profile_deleted || false,
        },
      }
    }
    catch (deletionError: any) {
      // Log the error for debugging
      logger.error('Account deletion failed', {
        error: deletionError instanceof Error ? deletionError.message : String(deletionError),
        userId: user.id,
      })

      // Re-throw with appropriate error message
      if (deletionError && typeof deletionError === 'object' && 'statusCode' in deletionError) {
        throw deletionError
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete account. Please try again or contact support.',
      })
    }
  }
  catch (error: any) {
    logger.error('Account deletion error', {
      error: error instanceof Error ? error.message : String(error),
    })

    // Return appropriate error response
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account',
    })
  }
})
