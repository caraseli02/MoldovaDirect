/**
 * Authentication middleware for protecting routes that require authenticated users
 *
 * Requirements addressed:
 * - 5.1: Session persistence across browser tabs
 * - 5.2: JWT access token with 15 minutes expiry
 * - 5.3: Reactive authentication status
 * - 5.4: Automatic token refresh during user activity
 * - 10.1: Redirect unauthenticated users to login
 * - 10.2: Preserve intended destination for post-login redirect
 * - 10.3: Display message explaining login requirement
 */

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();
  const localePath = useLocalePath();

  // Check if user is authenticated
  if (!user.value) {
    // Preserve the intended destination for post-login redirect (Requirement 10.2)
    const redirectQuery =
      to.fullPath !== localePath("/") ? { redirect: to.fullPath } : {};

    // Add message explaining login requirement (Requirement 10.3)
    const query = {
      ...redirectQuery,
      message: "login-required",
    };

    // Redirect to login page (Requirement 10.1)
    return navigateTo({
      path: localePath("/auth/login"),
      query,
    });
  }

  // Check if user's email is verified (Requirements from design document)
  if (!user.value.email_confirmed_at) {
    // Handle unverified email accounts
    const query = {
      message: "email-verification-required",
      email: user.value.email,
    };

    return navigateTo({
      path: localePath("/auth/verify-email"),
      query,
    });
  }
});
