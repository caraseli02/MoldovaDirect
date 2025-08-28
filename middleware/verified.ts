/**
 * Email verification middleware for features requiring verified accounts
 * 
 * Requirements addressed:
 * - Separate email verification requirement from basic authentication
 * - Provide specific messaging for unverified account access attempts
 * - Offer direct path to resend verification email
 */

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  const localePath = useLocalePath()
  
  // First check if user is authenticated at all
  if (!user.value) {
    // Preserve the intended destination for post-login redirect
    const redirectQuery = to.fullPath !== localePath('/') ? { redirect: to.fullPath } : {}
    
    const query = {
      ...redirectQuery,
      message: 'login-required'
    }
    
    return navigateTo({
      path: localePath('/auth/login'),
      query
    })
  }
  
  // Check if user's email is verified
  if (!user.value.email_confirmed_at) {
    const query = {
      message: 'email-verification-required',
      email: user.value.email,
      redirect: to.fullPath
    }
    
    return navigateTo({
      path: localePath('/auth/verify-email'),
      query
    })
  }
})