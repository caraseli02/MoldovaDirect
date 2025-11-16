# Deployment Checklist

## Pre-Deployment Verification

Before pushing to Vercel, always run these checks:

### 1. Build Verification Script

```bash
npm run build
./scripts/verify-build.sh
```

**What it checks**:
- ✅ Client JavaScript bundles exist (100+ files expected)
- ✅ Cart code is present in bundles
- ✅ Pinia state management is bundled
- ✅ No MIME type issues (HTML in .js files)
- ✅ Bundle size analysis

**Expected output**:
```
✅ JavaScript bundles: 133 files
✅ Cart code found in 2 bundles
✅ Pinia found in bundles
✅ No MIME type issues detected
✅ Build verification passed!
```

### 2. Manual Verification

```bash
# Verify client bundles exist
ls -l .vercel/output/static/_nuxt/*.js | wc -l
# Should show 100+ files

# Verify cart code is bundled
grep -l "useCart" .vercel/output/static/_nuxt/*.js
# Should show at least 1 file
```

### 3. Configuration Checklist

#### ❌ DO NOT add these to nuxt.config.ts:

```typescript
// ❌ WRONG - Breaks Vercel deployment
vite: {
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',  // ❌ NO
        entryFileNames: 'entries/[name]-[hash].js',  // ❌ NO
      }
    }
  }
}
```

#### ✅ DO use these patterns:

```typescript
// ✅ CORRECT - Works with Vercel
vite: {
  build: {
    rollupOptions: {
      output: {
        // Only use manualChunks, let Nitro handle file naming
        manualChunks(id) {
          if (id.includes('pinia')) return 'vendor-pinia'
          // ...
        }
      }
    }
  }
}
```

### 4. Route Rules Verification

Ensure route rules match actual output paths:

```typescript
// ✅ CORRECT
routeRules: {
  '/_nuxt/**': {
    headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
  }
}

// ❌ WRONG - If these paths don't exist in build output
routeRules: {
  '/chunks/**': { /* ... */ },  // ❌ Only if chunks/ actually exists
  '/entries/**': { /* ... */ },  // ❌ Only if entries/ actually exists
}
```

## Post-Deployment Verification

After deploying to Vercel, verify functionality:

### 1. Browser Console Check

1. Open Vercel preview URL
2. Open DevTools → Console
3. Look for errors:

**❌ Bad (Deployment broken)**:
```
Failed to load module script: Expected a JavaScript module script
but the server responded with a MIME type of "text/html"
```

**✅ Good (Deployment working)**:
```
No module loading errors
Pinia initialized
Cart functionality working
```

### 2. Add to Cart Test

1. Navigate to any product page
2. Click "Add to Cart"
3. Verify:
   - ✅ Cart badge increases
   - ✅ Button changes to "In Cart"
   - ✅ Console shows: "🛒 Add to Cart clicked"
   - ✅ No JavaScript errors

### 3. Automated Tests

Run E2E tests against Vercel preview:

```bash
PREVIEW_URL="https://your-preview.vercel.app" npm run test:e2e
```

## CI/CD Integration

### GitHub Actions

The repository includes automated build verification:

**File**: `.github/workflows/verify-build-output.yml`

**Runs on**:
- Every pull request
- Every push to main

**Checks**:
- Client bundle generation (100+ files)
- Cart code bundling
- Pinia bundling
- MIME type validation
- Generates build report

**If checks fail**:
- PR gets a warning comment
- Build artifact uploaded with details
- Deployment blocked until fixed

### Enabling the Workflow

The workflow runs automatically once merged to main. No setup required.

## Common Issues and Solutions

### Issue 1: No Client JavaScript Files

**Symptoms**:
```bash
$ ./scripts/verify-build.sh
❌ CRITICAL: Only 0 JavaScript files found!
```

**Solution**:
1. Check `nuxt.config.ts` for custom Vite `rollupOptions.output`
2. Remove `chunkFileNames` and `entryFileNames` if present
3. Let Nitro handle file naming automatically
4. Rebuild and verify

### Issue 2: Cart Code Not Bundled

**Symptoms**:
```bash
❌ ERROR: Cart code not found in bundles
```

**Solution**:
1. Verify `composables/useCart.ts` exists
2. Check if cart is actually being imported somewhere
3. Check for tree-shaking issues
4. Ensure Pinia is properly configured

### Issue 3: MIME Type Errors on Vercel

**Symptoms**:
Browser console shows "Expected JavaScript but got text/html"

**Solution**:
1. Verify build output: `ls .vercel/output/static/_nuxt/*.js`
2. Check if files are actual JavaScript (not HTML)
3. Review Vercel build logs
4. Ensure Nitro preset is set to "vercel"

## Emergency Rollback Procedure

If deployment breaks production:

### 1. Immediate Rollback (Vercel Dashboard)
1. Go to Vercel project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### 2. Identify Issue
```bash
# Clone the broken deployment's commit
git checkout <broken-commit-sha>

# Run verification
npm run build
./scripts/verify-build.sh
```

### 3. Fix and Redeploy
```bash
# Revert problematic changes
git revert <broken-commit-sha>

# Verify fix
npm run build
./scripts/verify-build.sh

# Deploy
git push
```

## Monitoring

Set up monitoring for client-side errors:

### Sentry/Error Tracking
```typescript
// plugins/sentry.client.ts
if (import.meta.client) {
  // Initialize error tracking
  // Report module loading failures
}
```

### Custom Monitoring
```typescript
// Track bundle loading
window.addEventListener('error', (event) => {
  if (event.message.includes('Failed to load module')) {
    // Alert team about bundle loading issues
    console.error('Bundle loading failure:', event)
  }
})
```

## Prevention Best Practices

1. **Always run verification before pushing**:
   ```bash
   npm run build && ./scripts/verify-build.sh
   ```

2. **Never customize chunk file names** for Vercel deployments

3. **Use CI/CD checks** to catch issues before production

4. **Monitor Vercel build logs** for warnings

5. **Test on preview deployments** before merging to main

6. **Keep Nuxt and Nitro up to date** for bug fixes

7. **Document any custom build configuration** with reasoning

## Package.json Scripts

Add these convenience scripts:

```json
{
  "scripts": {
    "verify": "./scripts/verify-build.sh",
    "build:verify": "npm run build && npm run verify",
    "deploy:check": "npm run build:verify && echo '✅ Ready to deploy'"
  }
}
```

## Further Reading

- [Nitro Vercel Preset Docs](https://nitro.unjs.io/deploy/providers/vercel)
- [Nuxt Production Checklist](https://nuxt.com/docs/getting-started/deployment#production-checklist)
- [Vercel Build Configuration](https://vercel.com/docs/build-step)
- `docs/VERCEL_CLIENT_BUNDLES_FIX.md` - Detailed root cause analysis
