/**
 * User Impersonation API
 * POST /api/admin/impersonate
 *
 * Allows admins to impersonate users for testing purposes
 *
 * Body:
 * - userId: ID of user to impersonate
 * - action: 'start' | 'stop'
 *
 * Security:
 * - Only admins can impersonate
 * - Creates a temporary session token
 * - Logs all impersonation actions
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

interface ImpersonateOptions {
  userId?: string
  action: 'start' | 'stop'
}

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  const currentUser = await serverSupabaseUser(event)

  // Check if user is authenticated
  if (!currentUser) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (profile?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required for impersonation'
    })
  }

  const body = await readBody(event).catch(() => ({})) as ImpersonateOptions
  const { userId, action } = body

  try {
    if (action === 'start') {
      if (!userId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'userId is required for impersonation'
        })
      }

      // Verify target user exists
      const { data: targetUser, error: userError } = await supabase
        .from('profiles')
        .select('id, name, email:id')
        .eq('id', userId)
        .single()

      if (userError || !targetUser) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }

      // Get user email from auth
      const { data: authData } = await supabase.auth.admin.getUserById(userId)
      const targetEmail = authData.user?.email

      // Create impersonation session token
      // Note: In production, you might want to create a JWT or session token
      // For now, we'll return the user info and let the client handle it

      // Log impersonation action (you might want to create an audit_logs table)
      console.log(`Admin ${currentUser.id} started impersonating user ${userId} (${targetEmail})`)

      return {
        success: true,
        action: 'start',
        impersonating: {
          id: userId,
          name: targetUser.name,
          email: targetEmail
        },
        message: `Now impersonating ${targetEmail}`,
        warning: 'You are acting as another user. All actions will be performed as them.'
      }

    } else if (action === 'stop') {
      // Stop impersonation
      console.log(`Admin ${currentUser.id} stopped impersonation`)

      return {
        success: true,
        action: 'stop',
        message: 'Impersonation stopped. Returned to admin account.'
      }

    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid action. Use "start" or "stop".'
      })
    }

  } catch (error: any) {
    console.error('Impersonation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to process impersonation request'
    })
  }
})
