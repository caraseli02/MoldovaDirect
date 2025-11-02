#!/bin/bash

# Restore Middleware After Testing
# This script restores the original middleware code

echo "🔧 Restoring Middleware"
echo "======================="
echo ""

# Backup current files (just in case)
cp middleware/auth.ts middleware/auth.ts.testing-backup
cp middleware/admin.ts middleware/admin.ts.testing-backup

echo "📦 Created backups:"
echo "   - middleware/auth.ts.testing-backup"
echo "   - middleware/admin.ts.testing-backup"
echo ""

# Restore auth.ts
cat > middleware/auth.ts << 'EOF'
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
EOF

echo "✅ Restored middleware/auth.ts"

# Restore admin.ts
cat > middleware/admin.ts << 'EOF'
/**
 * Admin Authorization Middleware
 * 
 * Requirements addressed:
 * - 5.1: Verify admin privileges for dashboard access
 * - 5.2: Redirect unauthorized users
 * 
 * Note: This is a placeholder implementation.
 * Full admin role verification will be implemented in auth tasks.
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // TODO: Implement proper admin role verification
  // For now, allow access to any authenticated user
  // This will be enhanced in the admin authentication tasks
  
  const user = useSupabaseUser()
  
  if (!user.value) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
  
  // TODO: Add admin role check here
  // Example: if (!user.value.app_metadata?.role === 'admin') { ... }
  
  console.log('Admin middleware: Access granted (placeholder implementation)')
})
EOF

echo "✅ Restored middleware/admin.ts"
echo ""
echo "🎉 Middleware restored successfully!"
echo ""
echo "⚠️  Remember to restart your dev server for changes to take effect"
echo ""
