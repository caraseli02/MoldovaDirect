# Login Investigation: Why It Works Here But Not on Main

## User Report
- **Issue**: Login works on branch `claude/fix-all-issues-016pgKSe69QoSDrRLtFaCy7T` but NOT on `main`
- **User Type**: Normal user (not admin)
- **Branch**: This branch has 20 commits ahead of main

---

## Investigation Findings

### ✅ Login Code is IDENTICAL

After comparing both branches, the login functionality code is **exactly the same**:

**File**: `pages/auth/login.vue:345-387`
```typescript
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true

  try {
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email: form.value.email,
      password: form.value.password
    })

    if (authErr) {
      // Handle errors
      throw authErr
    }

    if (data?.user) {
      success.value = t('auth.loginSuccess')
      await handleRedirectAfterLogin()  // Redirects to /account
    }
  } catch (err: any) {
    localError.value = err?.message || t('auth.loginError')
  } finally {
    loading.value = false
  }
}
```

**Changes on This Branch**:
- Only **visual/styling** changes (dark mode, removed test data attributes)
- No logic changes to login flow
- No auth API changes that would affect login

---

## Possible Reasons Login Fails on Main

### 1. **Environment Variables Missing** 🔑

**Check on Main**:
```bash
# Required variables
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

**This branch has**: `.env.example` file added (commit `aaa8f7f`)
- Maybe main is missing proper env vars?

### 2. **Database/Supabase State Difference**

**Possible Issues**:
- User account doesn't exist on main's Supabase instance
- Different Supabase project between branches
- User email not verified
- Account locked/disabled

### 3. **Browser Cache/Cookies** 🍪

**If testing on same browser**:
- Old session tokens cached
- Different auth state stored
- Try clearing browser data for main

### 4. **Deployment Environment**

**Questions**:
- Is main deployed to production Vercel?
- Is this branch on a different preview deployment?
- Different Supabase project for each environment?

### 5. **Redirect Loop Issue**

**Possible Scenario**:
1. Login succeeds
2. Redirect to `/account`
3. Middleware checks auth
4. Something fails → redirects back to login
5. Infinite loop

**Check on Main**: Any middleware that runs after login?

---

## Debug Steps to Try on Main

### Step 1: Check Browser Console
```javascript
// On login page, open DevTools console
// Look for errors when clicking "Login"
```

### Step 2: Check Network Tab
```
Filter: XHR/Fetch
Look for:
- POST to Supabase auth endpoint
- Status code (200 = success, 400/401 = failure)
- Response body for error details
```

### Step 3: Check Supabase Logs
```
Go to: Supabase Dashboard > Logs > Auth
Filter by: Email address
Check: Failed login attempts and reasons
```

### Step 4: Verify Environment Variables
```bash
# In your deployment (Vercel)
Check: Environment Variables tab
Ensure: SUPABASE_URL and SUPABASE_KEY are set
```

### Step 5: Test with Different User
```bash
# Create a new test user on main
1. Go to Supabase Dashboard
2. Create new user manually
3. Mark email as verified
4. Try logging in with new user
```

---

## Key Differences Between Branches

### Files Changed That MIGHT Affect Auth:

1. **middleware/admin.ts** - MFA check disabled (only affects admin routes)
2. **server/api/auth/delete-account.delete.ts** - Simplified deletion (doesn't affect login)
3. **.env.example** - Added (template only, doesn't affect runtime)

### Files Changed That DON'T Affect Auth:

- All UI/styling changes
- Accessibility improvements
- Add to Cart fix
- Mobile navigation
- Dark mode fixes

---

## Most Likely Cause

Based on the investigation, **the most likely causes are**:

### Option 1: Different Supabase Projects 🎯
- Main uses Production Supabase
- This branch uses Development/Preview Supabase
- User exists in dev but not prod

### Option 2: Environment Variables Missing
- Main deployment missing `SUPABASE_URL` or `SUPABASE_KEY`
- Check Vercel environment variables

### Option 3: Browser State Conflict
- Cached session tokens from old code
- Clear cookies and try again

---

## Quick Test

**To confirm this theory**, try this on MAIN:

1. Open browser DevTools
2. Go to login page
3. Open Console tab
4. Paste this code:
```javascript
// Check if Supabase is configured
const supabase = useSupabaseClient()
console.log('Supabase URL:', supabase.supabaseUrl)
console.log('Has anon key:', !!supabase.supabaseKey)
```

5. Try to login
6. Watch console for errors

**Expected Result**:
- If Supabase URL is undefined → Environment variable issue
- If you see "Invalid login credentials" → User doesn't exist in that Supabase
- If you see network error → Supabase connection issue
- If you see MFA error → (shouldn't happen for normal users)

---

## Recommendation

**Ask the user**:
1. What **specific error message** do you see on main?
2. Are you testing on **deployed site** or **localhost**?
3. Is it the **same Supabase project** for both branches?
4. Can you **create a new user** on main and test with that?

**Most likely solution**:
- Main is pointing to a different Supabase project
- Or the user account doesn't exist in main's database
- Or environment variables are not set correctly

---

## Next Steps

1. Get the specific error message from main
2. Check browser console logs
3. Verify Supabase project configuration
4. Check environment variables in deployment
5. Try creating a fresh user on main
