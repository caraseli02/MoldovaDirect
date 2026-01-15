# Moldova Direct - Troubleshooting Guide

## Prerequisites

- [Add prerequisites here]

## Steps


## Development Server Issues

### Port Already in Use
**Error**: `Port 3000 is already in use`

**Solution**:
```bash
lsof -ti:3000 | xargs kill -9
pnpm dev
```

### Server Won't Start After Changes
**Error**: `Unknown variable dynamic import` or component errors

**Solution**: Clear cache and restart
```bash
pkill -9 node && rm -rf .nuxt node_modules/.vite .output && pnpm dev
```

### Hot Reload Not Working
**Solution**:
1. Check if you're editing the right file
2. Clear `.nuxt` folder
3. Restart dev server
```bash
rm -rf .nuxt && pnpm dev
```

## Build Errors

### TypeScript Errors
**Error**: Type checking fails

**Solution**:
```bash
# Check types
pnpm type-check

# Fix and rebuild
pnpm build
```

### Module Not Found
**Error**: `Cannot find module '~/components/...'`

**Solution**:
1. Check file path and casing
2. Clear cache
3. Restart dev server
```bash
rm -rf .nuxt node_modules/.vite && pnpm dev
```

## Admin Panel Issues

### 500 Error on Admin Pages
**Cause**: Dynamic imports are not supported in admin components.

**Wrong**:
```typescript
// ❌ CAUSES 500 ERRORS
const Component = defineAsyncComponent(() => import(`~/${path}.vue`))
```

**Correct**:
```typescript
// ✅ WORKS
import AdminDashboard from '~/components/admin/Dashboard/Overview.vue'
```

### Admin Routes Not Working
**Check**:
1. Both middlewares are applied:
```typescript
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})
```
2. User has admin role in Supabase

### Can't Access Admin After Login
**Solution**: Verify admin role in Supabase:
```sql
SELECT role FROM profiles WHERE user_id = 'your-user-id';
```

## Authentication Issues

### Login Not Working
**Check**:
1. Supabase credentials in `.env`
2. Email verification status
3. Correct password

**Debug**:
```typescript
// In browser console
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password'
})
console.log({ data, error })
```

### Session Not Persisting
**Causes**:
1. Cookies blocked
2. Cross-origin issues
3. Token expired

**Solution**: Check browser DevTools → Application → Cookies

### "Not Authenticated" After Login
**Solution**: Force session refresh
```typescript
await supabase.auth.refreshSession()
```

## Database Issues

### Supabase Connection Failed
**Check**:
1. `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
2. Project not paused (check Supabase dashboard)
3. RLS policies allow access

### RLS Policy Errors
**Error**: `new row violates row-level security policy`

**Solution**: Check RLS policies in Supabase SQL editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'your_table';
```

### Data Not Showing
**Causes**:
1. RLS blocking access
2. Wrong user context
3. Data doesn't exist

**Debug**: Use Supabase dashboard Table Editor to verify data exists.

## Cart Issues

### Cart Not Persisting
**Check**:
1. localStorage is available
2. No errors in console
3. Cart store initialized

**Debug**:
```javascript
// In browser console
localStorage.getItem('cart')
```

### Cart Items Disappearing
**Causes**:
1. Browser cleared storage
2. Different session ID
3. Product deleted from database

### Add to Cart Not Working
**Check**:
1. Product has stock
2. No console errors
3. Pinia store initialized

## Checkout Issues

### Payment Intent Failed
**Check**:
1. Stripe keys in `.env`
2. Card details valid
3. Stripe API available

**Debug Stripe**:
```bash
curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_your_key: \
  -d amount=1000 \
  -d currency=eur
```

### Order Not Created
**Check**:
1. Payment succeeded
2. Webhook received
3. Database connection

### Email Not Sent
**Check**:
1. Resend API key valid
2. `FROM_EMAIL` configured
3. Recipient email valid

## Internationalization Issues

### Translations Not Loading
**Check**:
1. JSON files exist in `i18n/locales/`
2. Key exists in translation file
3. Correct locale code

**Debug**:
```vue
<template>
  <!-- Check if key exists -->
  {{ $te('key.path') ? $t('key.path') : 'Missing translation' }}
</template>
```

### Wrong Language Displayed
**Check**:
1. URL prefix matches locale
2. Cookie not overriding
3. Browser language detection

**Solution**: Clear language cookie and refresh.

### Missing Translation Keys
**Find missing keys**:
```bash
# Compare key counts between locales
wc -l i18n/locales/*.json
```

## Testing Issues

### Tests Failing Locally
**Solution**:
```bash
# Install browsers
pnpm test:setup

# Clear cache
rm -rf node_modules/.cache

# Run tests
pnpm test
```

### Visual Tests Failing
**Causes**:
1. UI changed intentionally
2. Dynamic content not masked
3. Different viewport

**Solution**: Update snapshots if changes are intentional:
```bash
pnpm test:visual:update
```

### E2E Tests Timeout
**Solution**:
1. Increase timeout in test
2. Check dev server is running
3. Wait for network idle

```typescript
test.setTimeout(60000)
await page.waitForLoadState('networkidle')
```

## Component Issues

### Component Not Rendering
**Check**:
1. Import statement correct
2. Component registered
3. Template syntax valid

### Styling Not Applied
**Check**:
1. Tailwind classes correct
2. Dark mode classes included
3. CSS not purged

### Props Not Working
**Check TypeScript**:
```typescript
interface Props {
  product: Product // Ensure type is correct
}
const props = defineProps<Props>()
```

## Performance Issues

### Slow Page Load
**Solutions**:
1. Check network tab for slow requests
2. Lazy load heavy components
3. Optimize images
4. Enable caching

### Memory Leaks
**Check**:
1. Event listeners cleaned up
2. Intervals cleared
3. Subscriptions unsubscribed

```typescript
onUnmounted(() => {
  cleanup()
})
```

## Common Error Messages

### "Hydration mismatch"
**Cause**: Server and client render different HTML

**Solution**: Use `<ClientOnly>` wrapper or check SSR guards:
```typescript
if (import.meta.server) return
```

### "Cannot access before initialization"
**Cause**: Circular dependency or wrong import order

**Solution**: Check import statements and move shared code to separate files.

### "Maximum call stack exceeded"
**Cause**: Infinite loop or recursion

**Solution**: Check computed properties, watchers, and recursive components.

## Getting More Help

### Enable Debug Logging
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  debug: true
})
```

### Check Console
Always check browser DevTools console for errors.

### Check Network Tab
Look for failed API requests and their error responses.

### Supabase Logs
Check Supabase dashboard → Logs for database/auth errors.

### Vercel Logs
For production issues, check Vercel → Deployments → Logs.
