import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Determines the appropriate redirect path based on user role
 * @returns The redirect path or null if no special redirect needed
 */
export async function getUserRoleRedirectPath(
  user: User | null,
  supabase: SupabaseClient,
  localePath: (path: string) => string,
): Promise<string | null> {
  if (!user) return null

  const { data: profile, error: roleError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string | null }>()

  if (roleError) {
    console.error('[Auth] Failed to check user role:', roleError.message, {
      code: roleError.code,
      userId: user.id,
    })
    return null
  }

  if (profile?.role === 'admin') {
    return localePath('/admin')
  }

  return null
}

/**
 * Handles post-authentication redirect logic
 * Prioritizes: query param redirect > role-based redirect > default account page
 */
export async function handleAuthRedirect(
  redirect: string | undefined,
  user: User | null,
  supabase: SupabaseClient,
  localePath: (path: string) => string,
  navigateTo: (...args: any[]) => any,
): Promise<void> {
  // Priority 1: Query parameter redirect
  if (redirect && redirect.startsWith('/')) {
    await navigateTo(redirect)
    return
  }

  // Priority 2: Role-based redirect
  const roleRedirect = await getUserRoleRedirectPath(user, supabase, localePath)
  if (roleRedirect) {
    await navigateTo(roleRedirect)
    return
  }

  // Priority 3: Default redirect
  await navigateTo(localePath('/account'))
}
