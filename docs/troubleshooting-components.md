# Components Auto-Import and shadcn-vue — Duplicates and Fix

This document explains the duplicate component warnings and runtime component errors observed during the shadcn-vue migration and how we fixed them. It also lists best practices for imports going forward.

## Symptoms
- Nuxt logs warnings like: "Two component files resolving to the same name Button/Alert/..."
- Vue shows: "Component <Anonymous> is missing template or render function"
- Vue shows: "Failed to resolve component: commonErrorBoundary"

## Root Cause
- shadcn-nuxt injects `components/ui` into Nuxt’s auto component registry without extension filtering. Nuxt then picks up both `index.ts` barrels and `.vue` SFCs and registers two components with the same name.
- Nuxt attempting to auto-register non-Vue files (`index.ts`) as components leads to the "missing template or render" warning.
- A previously removed component (`components/common/ErrorBoundary.vue`) was still referenced in `pages/cart.vue` as `<commonErrorBoundary>`.
- Some layout tags used lower-camel casing (e.g., `<commonToastContainer>`, `<mobilePWAInstallPrompt>`) which doesn’t match Nuxt’s PascalCase auto-import naming.

## Resolution
- Restrict global components auto-import to `.vue` only and ignore barrels:
  - `nuxt.config.ts` → `components.extensions: ["vue"]`
  - `nuxt.config.ts` base directory ignore: `ignore: ["ui/**", "**/index.ts"]`
- Remove the UI directory injected by shadcn-nuxt from Nuxt’s auto-scan while keeping `<Ui*>` registrations intact:
  - Added module `modules/fix-components.ts` that removes any `/components/ui` entries from the `components:dirs` hook.
  - Registered the module last in `nuxt.config.ts` `modules` so it executes after shadcn-nuxt.
- Restored a minimal error boundary component:
  - Re-added `components/common/ErrorBoundary.vue` and switched cart to `<CommonErrorBoundary>`.
- Fixed component casing in layouts:
  - Updated `layouts/default.vue` and `layouts/checkout.vue` to use PascalCase: `<CommonToastContainer>`, `<MobilePWAInstallPrompt>`, `<MobilePWAUpdatePrompt>`, `<MobileOfflineIndicator>`.

## Usage Guidelines
- Prefer explicit imports in `<script setup>` for UI components:
  - `import { Button } from '@/components/ui/button'`
- Using `<Ui*>` components is also supported; shadcn-nuxt registers them individually with `addComponent()`.
- Avoid re-enabling Nuxt auto-scan for `components/ui` — it will reintroduce duplicate-name warnings by picking up `index.ts` barrels.
- Keep component tags PascalCase in templates to align with Nuxt’s auto-import resolver.

## Verification Steps
1. Run `pnpm dev` and open the app.
2. Confirm there are no duplicate component warnings for Alert/Button/etc.
3. Navigate to the cart page and verify no "Failed to resolve component: commonErrorBoundary".
4. Check the console for the absence of "missing template or render function" warnings.

## File Changes (for reference)
- `nuxt.config.ts` — restricted component extensions, ignored UI barrels, registered `~/modules/fix-components`.
- `modules/fix-components.ts` — scrubs injected `/components/ui` from auto-scan via `components:dirs` hook.
- `components/common/ErrorBoundary.vue` — minimal error boundary restored.
- `layouts/default.vue`, `layouts/checkout.vue` — corrected component tag casing.
- `pages/cart.vue` — switched to `<CommonErrorBoundary>` and preserved error telemetry with `data-testid="error-boundary"`.

## FAQ
- Why not let Nuxt auto-scan `components/ui`?
  - The `index.ts` barrels are intended for module imports (and for shadcn’s `<Ui*>` registration), not SFC auto-registration. Auto-scanning `components/ui` causes naming conflicts with `.vue` files.
- Do `<Ui*>` components still work?
  - Yes. They’re registered by shadcn-nuxt via `addComponent()` independent of the auto-scan, so `<UiButton>`, `<UiCard>`, etc., remain available.

