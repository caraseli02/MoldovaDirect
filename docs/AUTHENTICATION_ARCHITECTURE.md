# Authentication Architecture

## Overview

Moldova Direct uses a sophisticated authentication system built on Supabase Auth with custom enhancements for multi-language support, cross-tab synchronization, and optimal performance.

## Architecture Components

### 1. Authentication Plugin (`plugins/auth-init.client.ts`)

The authentication system is initialized through a client-side plugin that provides a lazy-loading approach:

```typescript
export default defineNuxtPlugin(() => {
  return {
    provide: {
      initAuth: async () => {
        // Lazy load auth store and initialize
        const { useAuthStore } = await import('~/stores/auth')
        const authStore = useAuthStore()
        await authStore.initializeAuth()
        
        // Setup cross-tab sync and session refresh
        // Return cleanup function
      }
    }
  }
})
```

#### Key Features:
- **Lazy Loading**: Auth store is only loaded when needed
- **Error Handling**: Graceful error handling with fallbacks
- **Cleanup Management**: Automatic cleanup of event listeners and intervals
- **Cross-tab Sync**: Real-time synchronization across browser tabs

### 2. Authentication Store (`stores/auth.ts`)

Centralized Pinia store managing authentication state:

```typescript
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoading: false,
    error: null,
    isInitialized: false
  }),
  
  actions: {
    async initializeAuth() {
      // Initialize authentication state
    },
    
    async refreshSession() {
      // Refresh user session
    }
  }
})
```

### 3. Authentication Middleware (`middleware/auth.ts`)

Route protection middleware that:
- Checks user authentication status
- Redirects unauthenticated users to login
- Preserves intended destination for post-login redirect
- Handles email verification requirements

### 4. Composables

#### `useAuth.ts`
Main authentication composable providing:
- Login/logout functionality
- Registration with validation
- Password reset flows
- User profile management

#### `useAuthMessages.ts`
Internationalized error and success messages for authentication flows.

#### `useAuthValidation.ts`
Real-time form validation with multi-language error messages.

## Session Management

### Cross-tab Synchronization

The system listens for storage events to synchronize authentication state across browser tabs:

```typescript
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'supabase.auth.token') {
    authStore.refreshSession()
  }
}

window.addEventListener('storage', handleStorageChange)
```

### Automatic Token Refresh

Sessions are automatically refreshed every 10 minutes when the user is active:

```typescript
const refreshInterval = setInterval(() => {
  if (authStore.isAuthenticated) {
    authStore.refreshSession()
  }
}, 10 * 60 * 1000) // 10 minutes
```

### Session Persistence

- **Supabase Auth**: Handles token storage and refresh automatically
- **Reactive State**: Vue reactivity system ensures UI updates immediately
- **Cross-tab Events**: Storage events synchronize state across tabs

## Multi-language Support

### Translation Structure

Authentication translations are organized by feature:

```json
{
  "auth": {
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailRequired": "Email is required"
    },
    "validation": {
      "email": {
        "required": "Email is required",
        "invalid": "Please enter a valid email address"
      }
    },
    "success": {
      "loginSuccess": "Successfully signed in!"
    }
  }
}
```

### Supported Languages
- Spanish (es) - Default
- English (en)
- Romanian (ro)
- Russian (ru)

## Security Features

### Route Protection

Protected routes use the `auth` middleware:

```typescript
// pages/account/profile.vue
definePageMeta({
  middleware: 'auth'
})
```

### Email Verification

Users must verify their email before accessing protected features:

```typescript
if (!user.value.email_confirmed_at) {
  return navigateTo('/auth/verify-email')
}
```

### Row Level Security (RLS)

Database access is controlled through Supabase RLS policies ensuring users can only access their own data.

## Error Handling

### Comprehensive Error Management

The system provides detailed error handling for:
- Network connectivity issues
- Invalid credentials
- Email verification requirements
- Session expiration
- Rate limiting

### User Feedback

Errors are displayed through:
- Toast notifications for temporary messages
- Inline form validation for input errors
- Page-level error states for critical failures

## Performance Optimizations

### Lazy Loading

- Auth store is only loaded when authentication is needed
- Translation files are loaded on-demand per language
- Components are code-split for optimal loading

### Efficient State Management

- Minimal reactive state updates
- Debounced validation for form inputs
- Cached user profile data

## Development Guidelines

### Adding New Authentication Features

1. **Update the auth store** with new actions/state
2. **Add translations** for all supported languages
3. **Create composables** for reusable logic
4. **Add middleware** for route protection if needed
5. **Write tests** for new functionality

### Testing Authentication

```typescript
// Use the auth initialization in tests
const { $initAuth } = useNuxtApp()
await $initAuth()

// Mock authentication state
const authStore = useAuthStore()
authStore.user = mockUser
```

## Troubleshooting

### Common Issues

1. **Plugin not initializing**: Ensure `$initAuth()` is called after Pinia is available
2. **Cross-tab sync not working**: Check localStorage permissions and storage event listeners
3. **Session not persisting**: Verify Supabase configuration and token storage
4. **Middleware redirects**: Check route protection and user verification status

### Debug Mode

Enable debug logging in development:

```typescript
// In auth store
console.log('Auth state:', this.user)
console.log('Session:', session)
```

## Migration Notes

### From Direct Initialization to Plugin-based

The authentication system was migrated from direct plugin initialization to a lazy-loading approach:

**Before:**
```typescript
export default defineNuxtPlugin(async (nuxtApp) => {
  await nuxtApp.runWithContext(async () => {
    const authStore = useAuthStore()
    await authStore.initializeAuth()
  })
})
```

**After:**
```typescript
export default defineNuxtPlugin(() => {
  return {
    provide: {
      initAuth: async () => {
        // Lazy initialization
      }
    }
  }
})
```

This change provides:
- Better error handling
- Improved performance through lazy loading
- More flexible initialization timing
- Cleaner separation of concerns