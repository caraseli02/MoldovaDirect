# THE ACTUAL BUG - Why PR #249 Failed in Production

**Date:** November 14, 2025
**Final Fix:** Commit 74d2799

---

## The Bug

PR #249 attempted to fix the ISR crash by wrapping composable access in try-catch:

```typescript
try {
  route = useRoute()
  const i18n = useI18n()
  locale = i18n.locale
  locales = i18n.locales
  localePath = useLocalePath()
  const siteUrlHelpers = useSiteUrl()
  siteUrl = siteUrlHelpers.siteUrl
  toAbsoluteUrl = siteUrlHelpers.toAbsoluteUrl
} catch (error) {
  console.warn('[useLandingSeo] Error accessing composables during ISR, using fallbacks:', error)
  const fallbackSiteUrl = 'https://moldova-direct.vercel.app'
  return {
    canonicalUrl: input.path ? `${fallbackSiteUrl}${input.path}` : fallbackSiteUrl,
    siteUrl: fallbackSiteUrl,
    toAbsoluteUrl: (path?: string) => path ? `${fallbackSiteUrl}${path}` : fallbackSiteUrl
  }
}
```

**The Problem:** The early return meant that if composables failed, the function returned minimal fallback values. But there was a second crash point!

After the try-catch, the code accessed variables that were never initialized if the catch block executed:

```typescript
// Lines 87-90 in the broken version
const localeCodes = (locales.value || []).map(...)  // ❌ locales is undefined!
const currentLocale = locale.value || 'es'  // ❌ locale is undefined!
```

If the try-catch caught an error and returned early, this code wouldn't execute. But the problem was that **the early return was the bug itself** - it prevented `useHead()` from being called, so no SEO metadata was set, and Vercel's SSR renderer saw an incomplete response.

---

## The Real Issue

The composable was actually crashing in TWO places:

1. **First crash:** When `useRoute()`, `useI18n()`, etc. failed during ISR (this was caught by try-catch)
2. **Second crash:** The early return prevented the function from completing properly, causing Vercel's SSR to fail

---

## The Fix

Instead of returning early, we now initialize ALL variables with fallback values:

```typescript
let route: any
let locale: any
let locales: any
let localePath: any
let siteUrl: string
let toAbsoluteUrl: (path?: string) => string
let composablesAvailable = true

try {
  route = useRoute()
  const i18n = useI18n()
  locale = i18n.locale
  locales = i18n.locales
  localePath = useLocalePath()
  const siteUrlHelpers = useSiteUrl()
  siteUrl = siteUrlHelpers.siteUrl
  toAbsoluteUrl = siteUrlHelpers.toAbsoluteUrl
} catch (error) {
  console.warn('[useLandingSeo] Error accessing composables during ISR, using fallbacks:', error)
  composablesAvailable = false
  // Fallback values for ISR context
  const fallbackSiteUrl = 'https://moldova-direct.vercel.app'
  siteUrl = fallbackSiteUrl
  toAbsoluteUrl = (path?: string) => path ? `${fallbackSiteUrl}${path}` : fallbackSiteUrl
  localePath = (path: string) => path
  route = { path: '/' }
  locale = { value: 'es' }
  locales = { value: [] }
}

// Now all variables are guaranteed to be defined
const routePath = route?.path || '/'
const canonicalPath = input.path ? localePath(input.path) : routePath
const canonicalUrl = toAbsoluteUrl(canonicalPath)
```

This ensures:
1. ✅ All variables are defined (no crashes on `.value` access)
2. ✅ The full function executes (including `useHead()` call)
3. ✅ SEO metadata is set even during ISR failures
4. ✅ Vercel's SSR renderer gets a complete response

---

## Why This Matters

Vercel's ISR rendering has two phases:

1. **Initial SSR:** Full Nuxt context available, composables work fine
2. **ISR Regeneration:** Synthetic event with limited context, composables may fail

Our fix ensures the function works in BOTH contexts by providing fallback values instead of crashing or returning early.

---

## Testing

Once Vercel deploys commit `74d2799`:

```bash
curl -I https://moldova-direct.vercel.app/
# Expected: HTTP/2 200 (not 500)
```

---

**Status:** Fix committed and pushed to main, awaiting Vercel deployment
