# Authentication Flow Review

## Overview
- The application relies on Supabase authentication exposed through a Pinia `auth` store and a set of Nuxt middlewares for route protection.
- Auth views in `pages/auth` provide localized, accessible forms that surface error states delivered by the store and middleware query parameters.
- Middleware (`middleware/auth.ts`, `middleware/guest.ts`, `middleware/verified.ts`) orchestrates redirects and messaging based on session state and email verification requirements.

## Key Strengths
- **Consistent messaging**: `useAuthMessages` centralizes translation-ready copy for common auth outcomes.
- **Route protection**: Middleware cleanly separates authenticated, guest, and verified flows while preserving redirect intents.
- **Robust UI states**: Auth pages include accessible affordances, inline validation, and cross-linking for related tasks (registration, reset, verification).

## Issues Identified & Fixes Applied
1. **Fragile session initialization**
   - *Finding*: The store previously depended solely on `useSupabaseUser()` reactivity, leaving gaps when the composable had not yet populated or when the session refreshed silently.
   - *Improvement*: Added an explicit Supabase `getSession()` hydration and a guarded `onAuthStateChange` listener to keep the store synchronized with token refreshes and sign-outs. We also retain a single watcher instance per app load to avoid duplicate subscriptions.

2. **Volatile lockout handling**
   - *Finding*: Rate-limit lockouts were reset whenever the store reloaded, undermining the lockout policy and enabling brute-force retries after refresh.
   - *Improvement*: Persist lockout expirations in `localStorage`, automatically clear them when a session succeeds, and expose a helper for tests/debugging to wipe the stored value safely.

3. **SSR-unsafe password reset redirect**
   - *Finding*: Calling `window.location.origin` inside `forgotPassword` broke server-side execution and test environments.
   - *Improvement*: Guard the redirect creation for client-only usage and fall back gracefully when executed during server-side rendering.

## Additional Opportunities
- **Progressive lockout UI**: Surface the remaining lockout time directly on login views using the new persisted state to warn users about cooldowns.
- **Session diagnostics**: Emit analytics or logging when `onAuthStateChange` reports unexpected events (`USER_DELETED`, `TOKEN_REFRESHED` failures) to aid incident response.
- **Recovery flows**: Offer alternative verification mechanisms (SMS backup, support escalation) once Supabase configuration allows multi-factor pathways.
- **Middleware telemetry**: Capture metrics on redirect causes (`login-required`, `email-verification-required`) to understand friction points in the funnel.

These recommendations can guide subsequent enhancements after validating the current fixes.
