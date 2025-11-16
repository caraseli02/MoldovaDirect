# Authentication Store - Modular Architecture

This directory contains the refactored authentication store, split into focused, maintainable modules following clean code principles.

## 📁 Structure

```
stores/auth/
├── index.ts          # Main auth store (1,162 lines)
├── lockout.ts        # Account lockout management (81 lines)
├── mfa.ts            # Multi-factor authentication (224 lines)
├── test-users.ts     # Test user simulation (196 lines)
├── types.ts          # Shared TypeScript types (37 lines)
└── README.md         # This file
```

**Previous:** Single file with 1,418 lines
**Current:** 5 focused modules with clear responsibilities

## 🎯 Module Responsibilities

### `index.ts` - Main Authentication Store
**Core authentication flows:**
- User login, registration, logout
- Email verification and password reset
- Profile management
- Session initialization and synchronization
- Orchestrates all other modules

### `lockout.ts` - Account Lockout Management
**Handles account security lockouts:**
- Persisting lockout state to localStorage
- Checking if account is locked
- Calculating remaining lockout time
- Triggering and clearing lockouts
- Auto-cleanup of expired lockouts

### `mfa.ts` - Multi-Factor Authentication
**Complete MFA lifecycle:**
- MFA enrollment (QR code generation)
- MFA verification during enrollment
- MFA challenges during login
- MFA code verification
- Factor management (list, unenroll)
- Authenticator Assurance Level (AAL) checking

### `test-users.ts` - Test User Simulation
**Testing and QA support:**
- Test persona loading and simulation
- Test script progress tracking
- Step completion toggling
- Notes management
- Progress persistence
- Simulation mode management

### `types.ts` - Shared Type Definitions
**TypeScript interfaces:**
- `AuthUser` - User profile structure
- `LoginCredentials` - Login form data
- `RegisterData` - Registration form data

## 🔄 Migration & Compatibility

The refactored store maintains **100% backward compatibility** through:
- Symlink: `stores/auth.ts` → `stores/auth/index.ts`
- All exports preserved with identical signatures
- No breaking changes to existing imports

## ✨ Benefits

### Single Responsibility Principle
Each module has one clear purpose, making it easier to:
- Understand what code does
- Find bugs and issues
- Make targeted changes
- Write focused tests

### Improved Maintainability
- Smaller files are easier to read and modify
- Related functionality is grouped together
- Clear module boundaries reduce coupling
- Better organization for team collaboration

### Enhanced Testability
- Modules can be tested in isolation
- Mock dependencies more easily
- Focused unit tests per module
- Better test coverage

### Code Reusability
- Utility functions can be used independently
- Modules can be imported separately
- Shared logic extracted to avoid duplication
- Easier to create similar modules

## 📚 Usage Examples

### Using the auth store (unchanged)
```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
await authStore.login({ email, password })
```

### Importing specific types
```typescript
import type { AuthUser, LoginCredentials } from '~/stores/auth'
```

### Using utility functions directly
```typescript
import { isAccountLocked, getLockoutMinutesRemaining } from '~/stores/auth/lockout'

const locked = isAccountLocked(lockoutTime)
const minutes = getLockoutMinutesRemaining(lockoutTime)
```

## 🧪 Testing

Each module exports pure functions that can be tested independently:

```typescript
// Testing lockout utilities
import { triggerLockout, isAccountLocked } from '~/stores/auth/lockout'

const deadline = triggerLockout(15) // 15 minutes
expect(isAccountLocked(deadline)).toBe(true)
```

## 🔍 Code Quality Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Largest file | 1,418 lines | 1,162 lines | -18% |
| Module count | 1 | 5 | Better separation |
| Average module size | 1,418 lines | 340 lines | -76% |
| Complexity | High | Low | More maintainable |

## 🚀 Future Enhancements

Potential future improvements:
- [ ] Add unit tests for each module
- [ ] Extract auth flow logic into separate composables
- [ ] Add integration tests for cross-module interactions
- [ ] Consider splitting index.ts further if it grows
- [ ] Add performance monitoring for auth operations

## 📖 Related Documentation

- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Pinia Store Documentation](https://pinia.vuejs.org/)
- [Supabase Auth API](https://supabase.com/docs/guides/auth)
