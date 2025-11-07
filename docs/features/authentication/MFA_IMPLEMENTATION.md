# Multi-Factor Authentication (MFA) Implementation Guide

## Overview

This document describes the implementation of TOTP-based Multi-Factor Authentication (MFA) for the MoldovaDirect application, with a specific focus on admin user security.

## What Was Implemented

### 1. Backend/Store Layer

**File: `stores/auth.ts`**
- Extended `AuthUser` interface with MFA fields:
  - `mfaEnabled`: boolean flag
  - `mfaFactors`: array of enrolled MFA factors
- Added MFA state management:
  - `mfaEnrollment`: stores QR code and secret during setup
  - `mfaChallenge`: tracks active verification challenge
  - `mfaLoading` and `mfaError`: loading and error states
- New MFA methods:
  - `enrollMFA()`: Start MFA enrollment with QR code generation
  - `verifyMFAEnrollment()`: Complete enrollment with code verification
  - `cancelMFAEnrollment()`: Cancel enrollment process
  - `challengeMFA()`: Create verification challenge for login
  - `verifyMFA()`: Verify MFA code during login
  - `unenrollMFA()`: Remove MFA from account
  - `checkAAL()`: Check Authenticator Assurance Level
- Updated `syncUserState()` to fetch and sync MFA factors
- Modified `login()` to redirect to MFA verification if enabled

**File: `types/auth.ts`**
- Added MFA-related TypeScript interfaces:
  - `MFAFactor`: Represents an enrolled MFA factor
  - `MFAEnrollResponse`: Response from enrollment API
  - `MFAChallengeResponse`: Challenge creation response
  - `MFAVerifyRequest`: Verification request structure
  - `MFAUnenrollRequest`: Unenrollment request
  - `AuthenticatorAssuranceLevel`: AAL status (aal1/aal2)

### 2. Validation Layer

**File: `composables/useAuthValidation.ts`**
- Added MFA validation schemas:
  - `mfaCodeSchema`: Validates 6-digit TOTP codes
  - `mfaFriendlyNameSchema`: Validates device names (2-50 chars)
- New validation functions:
  - `validateMFACode()`: Validates TOTP code format
  - `validateMFAFriendlyName()`: Validates device name

### 3. UI Components

**File: `pages/auth/mfa-verify.vue`**
- Login MFA verification page
- Features:
  - 6-digit code input with auto-formatting
  - Real-time validation
  - Loading states
  - Error handling
  - Cancel/logout option
  - Help section with instructions
  - Auto-focus on mount
  - Numeric keyboard on mobile

**File: `pages/account/security/mfa.vue`**
- MFA settings and management page
- Features:
  - Status display (enabled/disabled)
  - QR code display for enrollment
  - Manual secret key entry option
  - Copy-to-clipboard functionality
  - Code verification form
  - Active factors list
  - Factor removal with confirmation
  - Security recommendations
  - Responsive design

### 4. Middleware

**File: `middleware/admin.ts`**
- Enhanced admin middleware with MFA enforcement
- Checks:
  1. User authentication
  2. Admin role verification
  3. MFA enrollment status
  4. Authenticator Assurance Level (AAL2 required)
- Redirects:
  - To `/account/security/mfa` if MFA not configured
  - To `/auth/mfa-verify` if MFA needs verification
- Currently disabled for testing (ready for production)

### 5. Internationalization

**Files: `i18n/locales/en.json`, `i18n/locales/es.json`**
- Added comprehensive MFA translations:
  - Validation messages
  - Verification page text
  - Settings page content
  - Instructions and help text
  - Status messages
  - Button labels
- Supported languages:
  - English (en)
  - Spanish (es)

## How It Works

### MFA Enrollment Flow

1. User navigates to `/account/security/mfa`
2. Clicks "Enable MFA" button
3. System calls `authStore.enrollMFA()`
4. Supabase generates TOTP secret and QR code
5. User scans QR code with authenticator app (or enters secret manually)
6. User enters 6-digit verification code
7. System calls `authStore.verifyMFAEnrollment(code)`
8. If valid, MFA is enabled and factors are updated

### MFA Login Flow

1. User enters email/password on login page
2. System authenticates credentials
3. If MFA is enabled for user:
   - Create MFA challenge: `authStore.challengeMFA(factorId)`
   - Redirect to `/auth/mfa-verify` page
4. User enters 6-digit code from authenticator app
5. System verifies code: `authStore.verifyMFA(code)`
6. If valid, user is logged in and redirected
7. Session now has AAL2 (MFA verified)

### Admin MFA Enforcement

When admin middleware is enabled:

1. Check if user is authenticated
2. Check if user has admin role
3. Check current AAL level:
   - If AAL1 (no MFA): Redirect to MFA setup
   - If AAL2 required but not verified: Redirect to verification
   - If AAL2 verified: Allow access

## Authenticator Assurance Levels (AAL)

- **AAL1**: Password-only authentication
- **AAL2**: Password + MFA authentication

Admin users must maintain AAL2 for access to admin routes.

## Security Features

### Implemented
✅ TOTP-based MFA (industry standard)
✅ QR code enrollment
✅ Manual secret entry fallback
✅ 6-digit code validation
✅ Multiple factors support (up to 10)
✅ Factor removal with confirmation
✅ Session-based AAL tracking
✅ MFA challenge/verify flow
✅ Phishing-resistant codes (time-based)

### Recommended for Production
- Enable admin middleware MFA enforcement
- Set up role-based access control
- Implement admin activity logging
- Add session timeout for admins (shorter duration)
- Monitor failed MFA attempts
- Send email notifications on MFA changes

## Configuration

### Supabase Setup

MFA is enabled by default on all Supabase projects. No additional configuration needed.

### Environment Variables

No additional environment variables required. MFA uses existing Supabase configuration.

### Admin Role Configuration

To mark users as admins, update user metadata:

```javascript
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' }
})
```

Or via SQL:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

## Testing

### Manual Testing Steps

1. **Enable MFA**:
   - Login as regular user
   - Navigate to `/account/security/mfa`
   - Click "Enable MFA"
   - Scan QR code with Google Authenticator/Authy
   - Enter verification code
   - Confirm MFA is enabled

2. **Test Login with MFA**:
   - Logout
   - Login with email/password
   - Should redirect to `/auth/mfa-verify`
   - Enter code from authenticator app
   - Should complete login successfully

3. **Test Admin Enforcement** (when enabled):
   - Set user as admin
   - Enable admin middleware
   - Try accessing admin route without MFA
   - Should redirect to MFA setup
   - Complete MFA setup
   - Try accessing admin route again
   - Should succeed

4. **Test MFA Removal**:
   - Navigate to `/account/security/mfa`
   - Click "Remove" on factor
   - Confirm removal
   - MFA should be disabled
   - Next login should not require MFA

### Automated Testing

Add E2E tests for:
- MFA enrollment flow
- MFA verification during login
- MFA removal
- Admin middleware enforcement
- Error handling (invalid codes, expired challenges)

## Deployment Checklist

Before deploying MFA to production:

- [ ] Test MFA enrollment flow
- [ ] Test login with MFA enabled
- [ ] Test MFA removal
- [ ] Verify i18n translations for all languages
- [ ] Enable admin middleware MFA enforcement
- [ ] Configure admin roles in database
- [ ] Test admin access with/without MFA
- [ ] Set up monitoring for MFA events
- [ ] Document admin setup process
- [ ] Train admin users on MFA setup
- [ ] Prepare support documentation
- [ ] Set up email notifications for MFA changes

## Recommended Authenticator Apps

- Google Authenticator (iOS/Android)
- Microsoft Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- 1Password (iOS/Android/Desktop)
- Bitwarden (iOS/Android/Desktop)

## Troubleshooting

### QR Code Not Scanning
- Try manual entry with the secret key
- Ensure good lighting and steady camera
- Check if authenticator app has camera permissions

### Invalid Code Errors
- Codes expire every 30 seconds - enter quickly
- Ensure device time is synchronized
- Check time zone settings on device

### Lost Authenticator Device
Currently, users must contact support to remove MFA. Consider implementing:
- Recovery codes (Supabase doesn't support yet)
- Backup factors (enroll multiple devices)
- Email-based MFA recovery flow

## Future Enhancements

### Planned (when Supabase supports)
- WebAuthn/Passkeys for passwordless auth
- SMS-based MFA as alternative
- Recovery codes for account recovery
- Trusted device management

### Potential Improvements
- Remember device for 30 days
- IP-based trusted locations
- Risk-based authentication
- Admin-forced MFA enrollment
- MFA enrollment grace period
- Backup factor recommendations

## API Reference

### Auth Store MFA Methods

```typescript
// Enroll MFA
await authStore.enrollMFA(friendlyName?: string)
// Returns: MFAEnrollResponse with qrCode, secret, uri

// Verify enrollment
await authStore.verifyMFAEnrollment(code: string)
// Completes MFA setup

// Cancel enrollment
authStore.cancelMFAEnrollment()

// Create challenge for login
await authStore.challengeMFA(factorId: string)
// Returns: MFAChallengeResponse with challengeId

// Verify MFA code
await authStore.verifyMFA(code: string)
// Verifies code and upgrades session to AAL2

// Remove MFA
await authStore.unenrollMFA(factorId: string)

// Check AAL level
await authStore.checkAAL()
// Returns: { currentLevel: 'aal1' | 'aal2', nextLevel: 'aal2' | null }
```

## Support

For issues or questions:
1. Check Supabase MFA documentation: https://supabase.com/docs/guides/auth/auth-mfa
2. Review this implementation guide
3. Check application logs for errors
4. Contact development team

## References

- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)
- [TOTP RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)
- [NIST Digital Identity Guidelines](https://pages.nist.gov/800-63-3/)
- [CISA MFA Recommendations](https://www.cisa.gov/mfa)

---

**Implementation Date**: 2025-10-30
**Author**: Claude AI Assistant
**Version**: 1.0.0
