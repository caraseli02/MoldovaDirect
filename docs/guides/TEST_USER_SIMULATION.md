# Test User Simulation Dashboard

The **Test Users & Persona Simulator** provides a safe way to validate the customer account journey without touching real
Supabase data. Visit [`/test-users`](../pages/test-users.vue) in development or preview deployments to activate guided
personas that exercise the most common user flows.

## Enable the simulator

The simulator is available automatically in development. To enable it elsewhere set an environment variable before running
Nuxt:

```bash
export ENABLE_TEST_USERS=true
npm run dev
```

The flag backs the `public.enableTestUsers` runtime config entry defined in [`nuxt.config.ts`](../nuxt.config.ts). When the
flag is `false`, attempts to activate personas throw a descriptive error and the UI renders a “Simulation disabled” banner.

## Persona catalogue

Personas are defined centrally in [`lib/testing/testUserPersonas.ts`](../lib/testing/testUserPersonas.ts). Each persona
captures:

- A localized test script that walks QA engineers through critical checkpoints
- Recommended quick links that jump straight to high-value screens
- Focus areas (profile completion, order history, recovery workflows, etc.)
- Optional lockout timers for recovery testing and auth messaging validation

Current personas include:

| Key | Scenario | Highlights |
| --- | -------- | ---------- |
| `first-order-explorer` | New shopper finishing their first purchase | Exercises dashboard empty states, profile editing, and checkout validation |
| `loyal-subscriber` | Repeat customer with existing orders | Validates order history, reorder shortcuts, and saved address prefill |
| `recovery-seeker` | Customer blocked by auth or verification issues | Simulates lockouts, password resets, and verification pending messaging |

Extend the file with additional personas as new regression scenarios surface.

## Simulator controls

The `/test-users` page presents two layers:

1. **Active Persona Panel** – Shows the current persona, goals, session metadata, and quick links. From here you can:
   - Jump directly to the account dashboard or recommended checkpoints
   - Clear the simulated lockout timer (`authStore.clearLockout()`) to resume testing
   - End the simulation (returns the auth store to a logged-out state)
2. **Persona Catalogue** – Cards describing each persona, their focus areas, and the test script. Click **Activate persona**
   to impersonate the user and follow the checklist.

## Auth store integration

The Pinia auth store exposes two new helpers:

- `simulateLogin(personaKey)` – Loads persona metadata into the store, optionally seeding a lockout timer.
- `simulateLogout()` – Clears persona state while leaving Supabase sessions untouched.

The getters `isTestSession` and `activeTestPersona` make it easy to detect simulator state in components or middleware.
`updateProfile()` short-circuits to a local mutation when a persona is active so QA can validate form UX without triggering
real API calls.

## Resetting simulation state

Use the **End simulation** button or call `useAuthStore().simulateLogout()` in the console to return the app to its default
state. This clears persona metadata, lockout timers, and any simulated profile updates.

## When to use it

- Regression sessions that need realistic data but no Supabase connectivity
- Manual QA of new account features before seeding production fixtures
- Bug reproduction when real accounts are unavailable or sensitive

The simulator does **not** replace end-to-end Playwright coverage; rather, it provides a human-friendly shortcut for quickly
recreating complex personas locally.
