# Debugging Strategy - FUNCTION_INVOCATION_FAILED Still Occurring

**Date:** November 14, 2025
**Status:** Homepage SSR continues to fail despite multiple fixes

---

## What We Know For Sure

### ✅ Working
1. **API Endpoints** - All return 200 OK with data (200-300ms response)
2. **Backend Fixes** - Cache keys, database optimization all working
3. **Client-Side Rendering** - Homepage loads with `ssr: false`

### ❌ Failing
1. **Homepage SSR** - Returns 500 FUNCTION_INVOCATION_FAILED on Vercel

---

## Fixes Attempted (All Failed to Resolve SSR Issue)

1. ✅ Cache key error boundaries (API endpoints prove this works)
2. ✅ Database query optimization (API fast, optimized)
3. ✅ ISR configuration (`swr: 3600` correct syntax)
4. ✅ External image removal (eliminated timeout risk)
5. ❌ Route.path null check in useLandingSeo (didn't fix)
6. ❌ Changed useFetch to lazy mode (didn't fix)

---

## Next Debugging Steps

### Option 1: Bisect Homepage Components
Systematically disable homepage sections until SSR works:

```vue
<template>
  <div>
    <!-- Step 1: Only hero, nothing else -->
    <HomeVideoHero ... />

    <!-- Step 2: Add one section at a time -->
    <!-- <LazyHomeMediaMentions v-if="..." /> -->
  </div>
</template>
```

### Option 2: Check Vercel Function Logs
You need to:
1. Go to Vercel Dashboard
2. Click on this deployment
3. Go to Functions tab
4. Click on the `/` route function
5. Check logs for actual error stack trace

### Option 3: Simplify All Composables
Check each composable for SSR compatibility:
- `useLandingSeo` - Has route access
- `useHomeContent` - Has i18n/localePath
- `useLandingConfig` - Pure config, should be safe
- `useSiteUrl` - Should be safe

### Option 4: Disable All SEO/Meta
Comment out the entire `useLandingSeo` call to see if that's causing it

---

## Most Likely Root Causes

Based on evidence:

1. **i18n Access During ISR** (80% probability)
   - `useI18n()` and `useLocalePath()` in `useHomeContent`
   - May not have full context during ISR

2. **Component SSR Hydration** (15% probability)
   - One of the lazy components failing during SSR
   - HomeVideoHero, MediaMentions, etc.

3. **Async Operation Timeout** (5% probability)
   - Something taking too long during SSR
   - But we have 10s timeout configured

---

## Recommended Next Action

**YOU need to check Vercel function logs** to see the actual stack trace. Without the logs, I'm debugging blind.

The logs will show:
- Exact line number where it crashes
- Full error message
- Stack trace pointing to the problematic code

---

## If Logs Not Available

Try this minimal test page:

```vue
<!-- pages/test-ssr.vue -->
<template>
  <div>
    <h1>SSR Test</h1>
    <p>If you see this, SSR works</p>
  </div>
</template>

<script setup>
// Absolutely minimal, no composables
</script>
```

If this works with `swr: 3600`, then we know the issue is in homepage composables/components.

---

## Current Hypothesis

The issue is most likely in **`useHomeContent` composable**:
- Calls `useLocalePath()` on line 59
- Calls `useI18n()` on line 60
- These may not have full context during ISR on Vercel

**Test:** Comment out `useHomeContent()` call in pages/index.vue and see if SSR works.

---

**Status:** Blocked - need Vercel logs or systematic component bisection
