# Authentication Architecture

Moldova Direct relies on Supabase Auth and a Pinia-powered store to deliver a multi-language, session-aware experience across the storefront and admin surfaces. This document captures the current (February 2026) implementation so contributors know where to extend or harden behaviour.

---

## Entry Points & State Management

### `stores/auth.ts`
- The `useAuthStore` Pinia store is the single source of truth for authentication state.  
- `initializeAuth()` wires a `watch()` on `useSupabaseUser()` so any token change (login, logout, cross-tab refresh) immediately updates the store.  
- The store exposes getters such as `isAuthenticated`, `isEmailVerified`, and `userLanguage` that are consumed across pages and middleware.  
- Error and loading states are funnelled through the store so UI surfaces can react consistently (e.g., disable submit buttons, show toast messages).

### Nuxt Middleware
- `middleware/auth.ts` protects customer-only areas (account, order history, checkout review) and redirects guests to `/auth/login` while preserving the intended route.  
- `middleware/admin.ts` stacks on top of `auth` to assert admin roles before rendering dashboard pages. Currently the check relies on Supabase metadata; augment it when role granularity increases.

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
- **Admin roles**: The current implementation trusts Supabase user metadata. Align it with managed role tables when you formalise RBAC.

---

## Operational Notes & Next Steps

- Document any refresh cadence changes inside this file when you expand session handling (e.g., background refresh for long admin sessions).  
- Keep translations for auth flows in sync when adding new messaging keys.  
- Integrate transactional emails for login/verification workflows alongside the broader checkout email initiative.
