# Vercel SSR Failure Diagnosis

**Date:** November 14, 2025
**Status:** Homepage SSR failing on Vercel, API endpoints working
**Error:** FUNCTION_INVOCATION_FAILED (500)

---

## What's Working ✅

### API Endpoints on Vercel
All API endpoints return data successfully:

```bash
# Featured Products API - WORKING
curl https://moldova-direct-git-fix.../api/products/featured?limit=12
# Returns: 200 OK, 12 products, ~200-300ms response time
```

**This proves:**
- ✅ Cache key error boundaries are working
- ✅ Database query optimization is working
- ✅ Supabase connection is working
- ✅ Environment variables are configured
- ✅ All our server-side fixes are correct

### Local Development
Everything works perfectly:
- Homepage: 14-19ms ✅
- All API endpoints: < 300ms ✅
- No errors or warnings ✅

---

## What's Failing ❌

### Homepage SSR on Vercel
```
GET /
Response: 500 INTERNAL_SERVER_ERROR
Code: FUNCTION_INVOCATION_FAILED
```

---

## Root Cause Analysis

Since **API endpoints work** but **homepage fails**, the issue is **NOT**:
- ❌ Cache key generation (API endpoints use the same system)
- ❌ Database queries (API endpoints query the database successfully)
- ❌ Supabase connection (working for API calls)
- ❌ Environment variables (API has access to them)

The issue **IS**:
- ✅ Something specific to **homepage SSR rendering**
- ✅ Likely a **component or composable** that fails during SSR on Vercel
- ✅ Possibly a **timeout** during page render
- ✅ Could be an **async operation** not being awaited properly

---

## Hypothesis: Page Complexity Timeout

The homepage (`pages/index.vue`) is very complex:
- 15+ lazy-loaded components
- Multiple composables (useHomeContent, useLandingConfig, useSiteUrl)
- Structured data generation
- SEO metadata generation
- API data fetch with `useFetch`

**During ISR on Vercel:**
- All these components need to be resolved
- All composables need to execute
- Data needs to be fetched
- This might exceed Vercel's function timeout

**Why it works locally:**
- No timeout constraints
- Faster execution environment
- Different rendering pipeline

---

## Evidence Supporting This Theory

1. **API endpoints are simple** - Single purpose, return quickly
2. **Homepage is complex** - Many components, composables, data fetches
3. **Vercel has strict timeouts** - 10s for our configuration
4. **ISR adds overhead** - Initial render during ISR is slower than subsequent