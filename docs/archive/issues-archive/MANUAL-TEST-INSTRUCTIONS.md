# Manual Testing Instructions

## Issue Found
Automated tests show:
- ✅ Login works (redirects to `/account`)
- ✅ Admin UI loads (showing user as "admin")
- ✅ Cookie exists: `sb-khvzbjemydddnryreytu-auth-token`
- ❌ API calls fail with "500 Auth session missing!"
- ❌ LocalStorage has NO auth keys

## Manual Test Steps

### Test 1: Verify Login Works Manually

1. Open browser to: `http://localhost:3001/auth/login`
2. Login with:
   - Email: `admin@moldovadirect.com`
   - Password: `Admin123!@#`
3. Should redirect to `/account`
4. Click "Panel" link in sidebar (or navigate to `/admin`)
5. **Check if dashboard loads data OR shows same errors**

### Test 2: Check Browser DevTools

After logging in and visiting `/admin`:

1. **Console Tab:**
   - Do you see errors like "500 Auth session missing!"?
   - Or does data load successfully?

2. **Network Tab:**
   - Look for `/api/admin/dashboard/stats` request
   - Check status: 200 (success) or 500 (fail)?
   - Check request headers - is cookie being sent?

3. **Application Tab → Cookies:**
   - Look for cookies starting with `sb-`
   - Check `sb-khvzbjemydddnryreytu-auth-token`
   - Is it HttpOnly? Secure? SameSite?

4. **Application Tab → Local Storage:**
   - Look for keys starting with `sb-` or `supabase`
   - What keys exist?
   - Check their values

### Test 3: Check Session in Console

In browser console after login, run:

```javascript
// Check localStorage
Object.keys(localStorage).filter(k => k.includes('sb-') || k.includes('supabase'))

// Check if Supabase client has session
const { createClient } = await import('@supabase/supabase-js')
// (this might not work directly, but worth trying)
```

### Test 4: Direct API Call

In browser console after login, try calling API directly:

```javascript
// Should return 200 if session works, 500 if not
fetch('/api/admin/dashboard/stats')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Expected Results

**If manual test WORKS:**
- Dashboard loads data
- API calls return 200
- localStorage has auth keys

→ This means the issue is ONLY in the automated Playwright test

**If manual test FAILS:**
- Dashboard shows errors
- API calls return 500
- Session not working at all

→ This means there's a real bug in the session handling that needs fixing

## Next Steps Based on Results

### If Manual Works, Playwright Fails:
The issue is Playwright context not properly handling Supabase cookies. Need to:
1. Check Playwright cookie storage settings
2. Maybe need to manually set cookies in Playwright
3. Or use a different testing approach

### If Manual Also Fails:
The issue is in the application code. Need to:
1. Check how `serverSupabaseUser()` reads cookies
2. Verify Supabase Nuxt module configuration
3. Check if cookies are HttpOnly (might prevent client reading)
4. Verify cookie domain/path settings

## Debugging Checklist

- [ ] Manual login works and redirects to `/account`
- [ ] Admin UI loads (navigation sidebar visible)
- [ ] Dashboard shows data (not errors)
- [ ] API calls return 200 (not 500)
- [ ] localStorage has auth keys
- [ ] Cookies include `sb-*-auth-token`
- [ ] Console has no auth errors

Please run through these tests and let me know the results!
