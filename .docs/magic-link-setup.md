# Magic Link Authentication Setup Guide

## Overview

This document provides step-by-step instructions for configuring and using Magic Link (passwordless) authentication in Moldova Direct.

**What is Magic Link Authentication?**
- Passwordless authentication method
- Users receive a secure link via email
- Single-click login without entering passwords
- Enhanced security and user experience

---

## ✅ Implementation Status

### Completed Features

1. **Login Page Integration** (`pages/auth/login.vue`)
   - Magic link button with email validation
   - Rate limiting (60-second cooldown)
   - Visual countdown timer
   - Multi-language support (es, en, ro, ru)

2. **Confirm Page Handler** (`pages/auth/confirm.vue`)
   - Proper token verification using `verifyOtp()`
   - Error handling for expired/invalid/used links
   - Network error retry capability
   - User-friendly error messages

3. **Security Features**
   - 60-second rate limit (Supabase default)
   - Cooldown timer persists across page refreshes
   - Email validation before sending
   - Account lockout integration

---

## 🔧 Supabase Configuration

### Required Settings in Supabase Dashboard

#### 1. Enable Email Authentication

Navigate to: **Authentication > Providers > Email**

**Basic Settings:**
```
✅ Enable email provider
✅ Enable email confirmations
✅ Enable magic links (Email OTP)
```

**⚠️ IMPORTANT - OTP Expiry Configuration:**

Scroll down to **Email OTP Settings** and configure:

```
OTP Expiry: 3600 seconds (1 hour) ⚠️ RECOMMENDED
```

**Security Note:**
- Supabase warns if OTP expiry > 1 hour
- Default may be set to 86400 seconds (24 hours) - this is TOO LONG
- **Recommended:** 3600 seconds (1 hour)
- Shorter expiry = better security
- Longer expiry = more time for potential attacks

**Why 1 hour is recommended:**
- Reduces window for token interception
- Follows industry best practices
- Balances security with user convenience
- Prevents tokens from being valid indefinitely

#### 2. Configure Redirect URLs

Navigate to: **Authentication > URL Configuration**

Add the following URLs to **Redirect URLs**:

```
# Development
http://localhost:3000/auth/confirm

# Production
https://yourdomain.com/auth/confirm
https://yourdomain.com/es/auth/confirm
https://yourdomain.com/en/auth/confirm
https://yourdomain.com/ro/auth/confirm
https://yourdomain.com/ru/auth/confirm
```

**Site URL:**
```
# Development
http://localhost:3000

# Production
https://yourdomain.com
```

#### 3. Customize Email Template

Navigate to: **Authentication > Email Templates > Magic Link**

**Default Template Variables:**
```
{{ .ConfirmationURL }} - The magic link URL
{{ .SiteURL }} - Your site URL
{{ .Token }} - The OTP token
{{ .TokenHash }} - The token hash
{{ .Email }} - User's email address
```

**Recommended Template Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in to Moldova Direct</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2563eb;">Moldova Direct</h1>
    </div>

    <h2>Sign in to your account</h2>

    <p>Hello,</p>

    <p>You requested a magic link to sign in to your Moldova Direct account. Click the button below to sign in:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Sign In to Moldova Direct
      </a>
    </div>

    <p>Or copy and paste this link into your browser:</p>
    <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
      {{ .ConfirmationURL }}
    </p>

    <p><strong>This link will expire in 1 hour.</strong></p>

    <p>If you didn't request this email, you can safely ignore it.</p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="font-size: 12px; color: #6b7280;">
      Moldova Direct<br>
      © 2024 All rights reserved
    </p>
  </div>
</body>
</html>
```

#### 4. Email Provider Configuration

**Important:** If using a third-party email provider (SendGrid, Mailgun, etc.):

1. **Disable Email Tracking**
   - Email tracking features can overwrite magic link URLs
   - This causes links to fail validation
   - Disable click tracking in your email provider settings

2. **Configure Custom SMTP** (Optional)
   Navigate to: **Project Settings > Authentication > SMTP Settings**

3. **Test Email Delivery**
   - Send a test magic link to verify delivery
   - Check spam folder if not received
   - Verify link functionality

---

## 🎯 Usage Flow

### User Journey

1. **User enters email on login page**
   - Email is validated before submission
   - Button is disabled if email is invalid

2. **User clicks "Send Magic Link"**
   - System sends OTP email via Supabase
   - 60-second cooldown timer starts
   - Success message is displayed

3. **User checks email**
   - Receives email with magic link
   - Link is valid for 1 hour (recommended setting)
   - Single-use only

4. **User clicks magic link**
   - Redirected to `/auth/confirm`
   - Token is automatically verified
   - User is authenticated and redirected

### Error Handling

**Link Expired:**
```
Error: "Magic Link Expired"
Message: "This magic link has expired. Please request a new one from the login page."
Action: User must request a new link
```

**Link Already Used:**
```
Error: "Magic Link Already Used"
Message: "This magic link has already been used. If you need to sign in again, please request a new link."
Action: User must request a new link
```

**Invalid Link:**
```
Error: "Invalid Magic Link"
Message: "This magic link is invalid or malformed. Please request a new one from the login page."
Action: User must request a new link
```

**Network Error:**
```
Error: "Network Error"
Message: "Unable to connect. Please check your internet connection and try again."
Action: Retry button available
```

---

## 🔒 Security Features

### Rate Limiting

- **Client-side:** 60-second cooldown timer
- **Server-side:** Supabase enforces 60-second rate limit per email
- **Persistence:** Cooldown survives page refreshes via localStorage
- **Visual Feedback:** Button shows countdown ("Resend in 45s")

### Token Security

- **Expiration:** 1 hour (recommended - configurable in Supabase)
  - ⚠️ Default may be 24 hours - **change this to 3600 seconds**
  - Longer expiry increases security risk
  - Supabase warns if set > 1 hour
- **Single-use:** Tokens invalidated after use
- **Verification:** Tokens verified server-side via Supabase
- **PKCE Flow:** Enhanced security for server-side rendering

### Email Provider Protection

- **Prefetch Protection:** Handles email provider link prefetching
- **Tracking Bypass:** Recommends disabling email tracking
- **Malformed URL Detection:** Validates token format

---

## 🧪 Testing Checklist

### Functionality Tests

- [ ] Send magic link with valid email
- [ ] Verify email delivery (check inbox/spam)
- [ ] Click magic link and verify authentication
- [ ] Test link expiration (wait 24+ hours)
- [ ] Test link reuse (click same link twice)
- [ ] Test rate limiting (send multiple requests)
- [ ] Test page refresh during cooldown
- [ ] Test network error handling
- [ ] Test all 4 locales (es, en, ro, ru)

### Security Tests

- [ ] Verify token is single-use
- [ ] Verify cooldown timer persists
- [ ] Verify expired links are rejected
- [ ] Verify malformed links are rejected
- [ ] Verify rate limit error messages
- [ ] Test with email tracking enabled/disabled

### UX Tests

- [ ] Success message displays after send
- [ ] Countdown timer updates every second
- [ ] Button is disabled during cooldown
- [ ] Error messages are clear and actionable
- [ ] Loading states work correctly
- [ ] Mobile responsive design works

---

## 📝 Developer Notes

### Code Structure

**Login Page** (`pages/auth/login.vue:391-505`)
```typescript
// Rate limiting state
const magicLinkCooldown = ref(0)
const magicLinkCooldownInterval = ref<NodeJS.Timeout | null>(null)

// Send magic link
async function handleMagicLink() {
  const { error } = await supabase.auth.signInWithOtp({
    email: form.value.email,
    options: {
      emailRedirectTo: `${window.location.origin}${localePath('/auth/confirm')}`
    }
  })
  startMagicLinkCooldown()
}
```

**Confirm Page** (`pages/auth/confirm.vue:97-161`)
```typescript
// Verify magic link token
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: tokenHash,
  type: type as 'magiclink' | 'email'
})
```

### Best Practices

1. **Always validate email before sending**
   ```typescript
   if (!form.value.email) {
     localError.value = t('auth.emailRequired')
     return
   }
   ```

2. **Handle all error cases**
   - Expired links
   - Used links
   - Invalid links
   - Network errors

3. **Provide clear feedback**
   - Loading states
   - Success messages
   - Error messages with actions
   - Countdown timers

4. **Clean up intervals**
   ```typescript
   onBeforeUnmount(() => {
     if (magicLinkCooldownInterval.value) {
       clearInterval(magicLinkCooldownInterval.value)
     }
   })
   ```

---

## 🐛 Troubleshooting

### Magic Link Not Received

**Possible Causes:**
1. Email is in spam folder
2. Email provider has delivery delays
3. Supabase email quota exceeded
4. Incorrect email address

**Solutions:**
- Check spam/junk folder
- Verify email address
- Check Supabase logs
- Configure custom SMTP

### Magic Link Not Working

**Possible Causes:**
1. Link expired (1+ hours old with recommended settings)
2. Link already used
3. Email tracking modified the URL
4. Incorrect redirect URL configuration

**Solutions:**
- Request a new link
- Disable email tracking
- Verify redirect URLs in Supabase dashboard
- Check browser console for errors
- Verify OTP expiry is set correctly (3600 seconds)

### Supabase OTP Expiry Warning

**Warning Message:**
```
⚠️ We have detected that you have enabled the email provider with the
OTP expiry set to more than an hour. It is recommended to set this
value to less than an hour.
```

**Cause:**
- OTP expiry is configured to more than 3600 seconds (1 hour)
- Default Supabase setting may be 86400 seconds (24 hours)

**Solution:**
1. Go to Supabase Dashboard
2. Navigate to: **Authentication > Providers > Email**
3. Scroll down to **Email OTP Settings**
4. Change **OTP Expiry** to: `3600` (1 hour)
5. Click **Save**

**Why This Matters:**
- Longer expiry times increase security risk
- Tokens valid for 24 hours can be intercepted and used later
- 1 hour balances security with user convenience
- Industry best practice for magic links

### Rate Limit Issues

**Possible Causes:**
1. Cooldown timer not clearing
2. localStorage corruption
3. Multiple tabs/windows

**Solutions:**
- Clear localStorage: `localStorage.removeItem('magicLinkCooldown')`
- Close duplicate tabs
- Wait 60 seconds for cooldown to expire

---

## 📚 Related Documentation

- [Supabase Magic Link Docs](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Supabase Email OTP Docs](https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [Authentication Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)

---

## 🔄 Changelog

**2025-11-24:** Security configuration update
- ⚠️ Updated recommended OTP expiry from 24 hours to 1 hour (3600 seconds)
- Added prominent warning about Supabase OTP expiry configuration
- Updated all documentation references to reflect 1-hour expiry
- Added dedicated troubleshooting section for OTP expiry warning
- Clarified security implications of longer expiry times

**2025-11-23:** Initial implementation
- Created magic link button in login page
- Implemented confirm page with proper token verification
- Added rate limiting with 60-second cooldown
- Added translations for all 4 locales
- Created comprehensive error handling
- Added documentation

---

**Last Updated:** 2025-11-24
**Status:** ✅ Production Ready (requires OTP expiry configuration)
**Maintainer:** Development Team
