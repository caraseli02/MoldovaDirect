# Authentication Translations and Error Handling System

This document describes the comprehensive authentication translation and error handling system implemented for Moldova Direct.

## Overview

The authentication system provides multi-language support for all authentication flows with comprehensive error handling, validation messages, and user feedback. The system addresses the following requirements:

- **6.1, 6.2, 6.3**: Multi-language authentication support (ES, EN, RO, RU)
- **9.1, 9.2**: Proper error message display system with user feedback
- **1.3, 1.4**: Real-time validation with specific error messages
- **7.1**: Password strength requirements enforcement

## Components

### 1. Translation Files

All authentication translations are organized in the `i18n/locales/` directory:

```
i18n/locales/
├── en.json     # English translations
├── es.json     # Spanish translations (primary)
├── ro.json     # Romanian translations
└── ru.json     # Russian translations
```

#### Translation Structure

```json
{
  "auth": {
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailRequired": "Email is required",
      // ... more error messages
    },
    "validation": {
      "email": {
        "required": "Email is required",
        "invalid": "Please enter a valid email address"
      },
      "password": {
        "required": "Password is required",
        "minLength": "Password must be at least 8 characters"
      }
      // ... more validation messages
    },
    "success": {
      "loginSuccess": "Successfully signed in! Redirecting...",
      "registrationSuccess": "Account created successfully!"
      // ... more success messages
    },
    "messages": {
      "loginRequired": "Please sign in to access this page",
      "emailVerificationRequired": "Please verify your email address"
      // ... more informational messages
    },
    "buttons": {
      "signIn": "Sign In",
      "signUp": "Sign Up"
      // ... more button labels
    },
    "labels": {
      "email": "Email Address",
      "password": "Password"
      // ... more form labels
    },
    "placeholders": {
      "email": "Enter your email address",
      "password": "Enter your password"
      // ... more placeholders
    }
  }
}
```

### 2. Reusable Components

#### Auth Alerts (shadcn `Alert`)

Legacy `AuthErrorMessage.vue` and `AuthSuccessMessage.vue` were retired in February 2026. Authentication flows now compose shadcn `Alert` primitives directly so translations remain centralized while the UI stays consistent.

```vue
<Transition name="slide-fade">
  <Alert
    v-if="error"
    variant="destructive"
    class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
  >
    <AlertCircle class="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
    <AlertDescription class="text-sm text-red-800 dark:text-red-300">
      {{ error }}
    </AlertDescription>
    <Button
      variant="ghost"
      size="icon"
      class="absolute right-2 top-2 text-red-500 hover:text-red-600 dark:text-red-300 dark:hover:text-red-200"
      @click="error = null"
    >
      <X class="h-4 w-4" aria-hidden="true" />
      <span class="sr-only">{{ $t('common.dismiss') }}</span>
    </Button>
  </Alert>
</Transition>

<Transition name="slide-fade">
  <Alert
    v-if="success"
    class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
  >
    <CheckCircle2 class="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
    <AlertDescription class="text-sm text-green-800 dark:text-green-300">
      {{ success }}
    </AlertDescription>
  </Alert>
</Transition>
```

**Key props/components:**
- `Alert` / `AlertDescription`: shadcn primitives for consistent styling
- `AlertCircle`, `CheckCircle2`, `X`: lucide icons for error/success/dismiss affordances
- `Button`: shadcn button used for dismiss or retry actions
- `showAction`: Whether to show an action button
- `actionKey`: Translation key for action button text

#### PasswordStrengthMeter.vue

Real-time password strength indicator with requirement checklist.

```vue
<PasswordStrengthMeter
  :password="form.password"
  :show-requirements="true"
/>
```

**Props:**
- `password`: Password string to analyze
- `showRequirements`: Whether to show the requirements checklist

### 3. Composables

#### useAuthValidation()

Provides comprehensive form validation with multi-language error messages.

```typescript
const { 
  validateEmail, 
  validatePassword, 
  validateRegistration,
  calculatePasswordStrength 
} = useAuthValidation()

// Validate individual fields
const emailValidation = validateEmail(email)
if (!emailValidation.isValid) {
  console.log(emailValidation.errors) // Translated error messages
}

// Validate entire forms
const registrationValidation = validateRegistration({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  acceptTerms: true,
  language: 'en'
})
```

**Available Methods:**
- `validateEmail(email)`: Validate email format
- `validatePassword(password)`: Validate password strength
- `validateRegistration(data)`: Validate registration form
- `validateLogin(data)`: Validate login form
- `validateForgotPassword(data)`: Validate forgot password form
- `validateResetPassword(data)`: Validate reset password form
- `calculatePasswordStrength(password)`: Calculate password strength (0-4)

#### useAuthMessages()

Centralized authentication message handling with translation support.

```typescript
const { 
  createErrorMessage, 
  createSuccessMessage, 
  translateAuthError,
  getMessageFromQuery 
} = useAuthMessages()

// Create translated error messages
const errorMsg = createErrorMessage('Invalid credentials', 'login', true)

// Translate Supabase errors
const translatedError = translateAuthError('User not found', 'login')

// Get messages from URL query parameters
const queryMessage = getMessageFromQuery() // Handles ?message=login-required
```

**Available Methods:**
- `createErrorMessage(error, context, showRetry)`: Create error message object
- `createSuccessMessage(messageKey, context, duration)`: Create success message
- `translateAuthError(error, context)`: Translate authentication errors
- `getMessageFromQuery()`: Parse URL query parameters for messages

### 4. Error Mapping

The system automatically maps common Supabase authentication errors to user-friendly translated messages:

```typescript
const errorMappings = {
  'Invalid login credentials': 'auth.errors.invalidCredentials',
  'Email not confirmed': 'auth.errors.emailNotVerified',
  'User already registered': 'auth.errors.emailExists',
  'Token has expired': 'auth.errors.tokenExpired',
  'Too many requests': 'auth.errors.rateLimitExceeded'
  // ... more mappings
}
```

### 5. Validation Schemas

Using Zod for type-safe validation with translated error messages:

```typescript
const registerSchema = z.object({
  name: z.string()
    .min(1, 'auth.validation.name.required')
    .min(2, 'auth.validation.name.minLength'),
  email: z.string()
    .min(1, 'auth.validation.email.required')
    .email('auth.validation.email.invalid'),
  password: z.string()
    .min(8, 'auth.validation.password.minLength')
    .regex(/[A-Z]/, 'auth.validation.password.uppercase')
    .regex(/[a-z]/, 'auth.validation.password.lowercase')
    .regex(/[0-9]/, 'auth.validation.password.number')
})
```

## Usage Examples

### Basic Login Form with Error Handling

```vue
<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <Transition name="slide-fade">
      <Alert
        v-if="errorMessage"
        variant="destructive"
        class="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      >
        <AlertCircle class="h-5 w-5 text-red-500 dark:text-red-400" aria-hidden="true" />
        <AlertDescription class="text-sm text-red-800 dark:text-red-300">
          {{ errorMessage }}
        </AlertDescription>
      </Alert>
    </Transition>

    <div class="space-y-2">
      <Label for="email">{{ $t('auth.labels.email') }}</Label>
      <Input
        id="email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        :placeholder="$t('auth.placeholders.email')"
      />
    </div>

    <div class="space-y-2">
      <Label for="password">{{ $t('auth.labels.password') }}</Label>
      <Input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        :placeholder="$t('auth.placeholders.password')"
      />
    </div>
    
    <Button type="submit" class="w-full">
      {{ $t('auth.buttons.signIn') }}
    </Button>
  </form>
</template>

<script setup lang="ts">
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-vue-next'

const { validateLogin } = useAuthValidation()
const { createErrorMessage } = useAuthMessages()

const form = reactive({ email: '', password: '' })
const errorMessage = ref<string | null>(null)

const handleLogin = async () => {
  const validation = validateLogin(form)
  if (!validation.isValid) {
    errorMessage.value = validation.errors[0]?.message || ''
    return
  }

  try {
    await login(form)
    errorMessage.value = null
  } catch (error) {
    const errorMsg = createErrorMessage(error, 'login')
    errorMessage.value = errorMsg.message
  }
}
</script>
```

### Registration Form with Password Strength

```vue
<template>
  <form @submit.prevent="handleRegister">
    <div class="space-y-2">
      <Label for="reg-password">{{ $t('auth.labels.password') }}</Label>
      <Input
        id="reg-password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        :placeholder="$t('auth.placeholders.password')"
      />
    </div>

    <PasswordStrengthMeter
      :password="form.password"
      :show-requirements="true"
    />
    
    <Transition name="slide-fade">
      <Alert
        v-if="successMessage"
        class="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      >
        <CheckCircle2 class="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
        <AlertDescription class="text-sm text-green-800 dark:text-green-300">
          {{ successMessage }}
        </AlertDescription>
      </Alert>
    </Transition>
  </form>
</template>
```

## Testing

The system includes comprehensive tests to ensure all translation keys are properly defined:

```bash
# Run translation tests
npm run test:translations

# Run all unit tests
npm run test:unit
```

### Test Coverage

The tests verify:
- All translation keys exist across all languages
- No missing or empty translations
- Consistent parameter placeholders
- Proper capitalization
- Language-specific validation

## Best Practices

### 1. Always Use Translation Keys

```typescript
// ✅ Good
const message = t('auth.errors.invalidCredentials')

// ❌ Bad
const message = 'Invalid email or password'
```

### 2. Provide Context for Error Messages

```typescript
// ✅ Good
const errorMsg = createErrorMessage(error, 'login', true)

// ❌ Bad
const errorMsg = error.message
```

### 3. Use Validation Composables

```typescript
// ✅ Good
const validation = validateEmail(email)
if (!validation.isValid) {
  showError(validation.errors[0].message)
}

// ❌ Bad
if (!email.includes('@')) {
  showError('Invalid email')
}
```

### 4. Handle Rate Limiting Gracefully

```typescript
// ✅ Good
if (error.includes('rate limit')) {
  const minutes = extractMinutes(error) || '15'
  showError(t('auth.errors.rateLimitExceeded', { minutes }))
}
```

### 5. Provide User Feedback

```typescript
// ✅ Good - Show loading states and success messages
loading.value = true
try {
  await performAction()
  showSuccess(t('auth.success.actionCompleted'))
} catch (error) {
  showError(translateAuthError(error))
} finally {
  loading.value = false
}
```

## Maintenance

### Adding New Translations

1. Add the key to all language files in `i18n/locales/`
2. Update the test file to include the new key in required arrays
3. Run tests to ensure consistency

### Adding New Error Types

1. Add error mapping in `useAuthMessages.ts`
2. Add translation keys to all language files
3. Update tests to include new error types

### Adding New Languages

1. Create new locale file (e.g., `fr.json`)
2. Copy structure from existing locale
3. Translate all values
4. Add language to test suite
5. Update language selector in UI

This comprehensive system ensures consistent, user-friendly authentication experiences across all supported languages while maintaining type safety and comprehensive error handling.
