# Authentication Middleware

This directory contains middleware for handling authentication and route protection in the Moldova Direct application.

## Middleware Files

### `auth.ts`
Protects routes that require authenticated users.

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

**Features:**
- Redirects unauthenticated users to login page
- Preserves intended destination for post-login redirect
- Handles unverified email accounts
- Displays appropriate messages explaining login requirements

**Requirements Addressed:**
- 5.1: Session persistence across browser tabs
- 5.2: JWT access token with 15 minutes expiry
- 5.3: Reactive authentication status
- 5.4: Automatic token refresh during user activity
- 10.1: Redirect unauthenticated users to login
- 10.2: Preserve intended destination for post-login redirect
- 10.3: Display message explaining login requirement

### `guest.ts`
Redirects authenticated users away from auth pages (login, register, etc.).

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: 'guest'
})
</script>
```

**Features:**
- Redirects authenticated users to account page or intended destination
- Handles redirect query parameters for seamless navigation
- Manages partially authenticated users (unverified email)
- Prevents access loops for unverified users

### `verified.ts`
For features requiring verified email accounts (like checkout).

**Usage:**
```vue
<script setup>
definePageMeta({
  middleware: 'verified'
})
</script>
```

**Features:**
- Requires both authentication and email verification
- Provides specific messaging for unverified accounts
- Preserves redirect flow through verification process

## Implementation Details

### Redirect Flow
1. User tries to access protected page
2. Middleware checks authentication status
3. If not authenticated: redirect to login with `?redirect=/original/path`
4. If authenticated but not verified: redirect to verification page
5. After successful auth/verification: redirect to original intended page

### Query Parameters
- `redirect`: Preserves the originally intended destination
- `message`: Provides context for why redirect occurred
  - `login-required`: User needs to log in
  - `email-verification-required`: User needs to verify email

### Security Considerations
- External redirect URLs are blocked (must start with `/`)
- Redirect loops are prevented through proper middleware ordering
- Email verification status is checked for sensitive operations

## Pages Using Middleware

### Protected with `auth` middleware:
- `/account/*` - User account pages
- `/cart` - Shopping cart
- `/admin/*` - Admin dashboard

### Protected with `guest` middleware:
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request

### Protected with `verified` middleware:
- `/checkout/*` - Checkout process (when implemented)
- Other sensitive operations requiring verified accounts

## Testing

Unit tests are available in `tests/unit/middleware-auth.test.ts` covering:
- Authentication status checking
- Redirect parameter preservation
- Email verification requirements
- Edge cases and error handling

Integration tests in `tests/e2e/middleware-integration.spec.ts` cover:
- End-to-end redirect flows
- Cross-tab authentication sync
- Real browser navigation scenarios

## Error Handling

The middleware gracefully handles:
- Network connectivity issues
- Malformed user data
- Missing authentication tokens
- Corrupted session state

All errors are logged and users are redirected to appropriate fallback pages.