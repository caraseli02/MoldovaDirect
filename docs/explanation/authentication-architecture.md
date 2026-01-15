# Authentication Architecture

## Overview

[Add high-level overview here]


Moldova Direct relies on Supabase Auth and a Pinia-powered store to deliver a multi-language, session-aware experience across the storefront and admin surfaces. This document captures the current (February 2026) implementation so contributors know where to extend or harden behaviour.

---

## Entry Points & State Management

### `stores/auth/`
- The auth store has been refactored into a modular structure (January 2026) for better maintainability and separation of concerns.
- The main entry point `stores/auth.ts` re-exports the modular implementation from `stores/auth/index.ts`.
- The `useAuthStore` Pinia store is the single source of truth for authentication state.  
- `initializeAuth()` wires a `watch()` on `useSupabaseUser()` so any token change (login, logout, cross-tab refresh) immediately updates the store.  
- The store exposes getters such as `isAuthenticated`, `isEmailVerified`, and `userLanguage` that are consumed across pages and middleware.  
- Error and loading states are funnelled through the store so UI surfaces can react consistently (e.g., disable submit buttons, show toast messages).

### Nuxt Middleware
- `middleware/auth.ts` protects customer-only areas (account, order history, checkout review) and redirects guests to `/auth/login` while preserving the intended route. Also enforces email verification before granting access to protected routes.
- `middleware/admin.ts` stacks on top of `auth` to assert admin roles before rendering dashboard pages. Checks user role from the `profiles` table and enforces MFA (Multi-Factor Authentication) for admin users. Test accounts (emails containing `@moldovadirect.com` or `@example.com`) bypass MFA in development and E2E test environments for testing convenience.

### Composables
- `composables/useAuth.ts` orchestrates mutations by delegating to the store and Supabase client (`signInWithPassword`, `signUp`, `signOut`).  
- Supporting composables (`useAuthMessages.ts`, `useAuthValidation.ts`) keep validation and localized messaging in sync with `i18n/locales/*.json`.

---

## Session Behaviour

- **Cross-tab sync** is handled by the Supabase JS client: when a session refresh occurs in any tab, `useSupabaseUser()` emits a new value which the store watcher consumes. No manual `storage` event listeners are required.  
- **Token refresh** is owned by Supabase; we do not run a manual interval. If you introduce long-lived admin sessions, add explicit refresh logic and document the cadence.  
- **Persistence** relies on Supabase’s built-in storage (localStorage). The store resets gracefully on SSR by returning minimal fallbacks when Pinia is not yet available.

---

## User Flows

### Login & Registration
1. Forms live in `pages/auth/*.vue` and call the `useAuth` composable.
2. Inputs are validated via `useAuthValidation.ts`, with translated errors produced by `useAuthMessages.ts`.
3. On success the store syncs and middleware redirects the user to their intended destination (`redirectTo` query) or `/account`.

### Email Verification
- The Supabase Auth flow sets `email_confirmed_at`.  
- Middleware checks `authStore.isEmailVerified`; unverified users are routed to `/auth/verify-email`.  
- Resend is the preferred provider for transactional emails—see “Next Steps” for pending automation.

### Logout
- Calls `supabase.auth.signOut()` and clears store state.  
- Any guests navigating to admin routes after logout are redirected to `/auth/login`.

---

## Security Considerations

- **Row Level Security (RLS)**: All user data tables (`profiles`, `addresses`, `orders`, `order_items`, etc.) enforce policies defined in `supabase/sql/supabase-*.sql`. When you add tables, copy the existing pattern (`auth.uid()` guard plus optional role checks).
- **Rate limiting**: Supabase handles rate limiting; augment with application-level throttling if you expose high-risk endpoints (e.g., password recovery).  
- **Admin roles**: The implementation checks user roles from the `profiles` table. Admin users must have `role = 'admin'` in their profile record.
- **Multi-Factor Authentication (MFA)**: Admin users are required to have MFA enabled (AAL2 level) for enhanced security. Test accounts are exempt in development and E2E test environments to facilitate testing workflows.

---

## Operational Notes & Next Steps

- Document any refresh cadence changes inside this file when you expand session handling (e.g., background refresh for long admin sessions).  
- Keep translations for auth flows in sync when adding new messaging keys.  
- Integrate transactional emails for login/verification workflows alongside the broader checkout email initiative.

## Recent Updates

### January 2026 - Modular Store Refactoring
- Auth store refactored into modular structure under `stores/auth/` directory
- Improved code organization and maintainability
- Backward compatibility maintained through re-exports

### January 2026 - Security Enhancements
- MFA enforcement implemented for admin users
- Test account bypass logic added for development and E2E testing
- Email verification enforcement added to auth middleware
