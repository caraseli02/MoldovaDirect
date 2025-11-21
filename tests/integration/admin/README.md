# Admin Authentication Flow Integration Tests

## Overview

The `auth-flows.test.ts` file contains comprehensive integration tests for admin authentication flows, covering real-world scenarios that occur in production environments.

## Test Coverage

### 1. Session Expiration During Operation
- **What it tests**: How the system handles expired sessions gracefully
- **Scenarios**:
  - Expired token returns 401, not 500 (no crashes)
  - Proper error messages on session expiration
  - Redirect behavior for expired sessions
- **Why important**: Prevents app crashes when users have stale sessions

### 2. Token Refresh During Long Sessions
- **What it tests**: Token refresh mechanisms for long-running admin sessions
- **Scenarios**:
  - Fresh tokens validate successfully
  - Refresh token exchange works correctly
  - Invalid refresh tokens are rejected
- **Why important**: Admins often keep tabs open for hours; tokens must refresh gracefully

### 3. MFA Enforcement
- **What it tests**: Multi-Factor Authentication requirements for admin users
- **Scenarios**:
  - Dev mode bypass for @moldovadirect.com emails
  - MFA level checks via Supabase API
  - Middleware MFA enforcement logic
- **Why important**: Security requirement - admins must have MFA enabled
- **Reference**: `middleware/admin.ts` lines 65-78

### 4. Role Escalation Prevention
- **What it tests**: Security against role manipulation attacks
- **Scenarios**:
  - Role always verified from database, never trusted from client
  - LocalStorage role manipulation attempts blocked
  - Profile table queried on every request
  - Users without profile records blocked
- **Why important**: Critical security - prevents privilege escalation attacks
- **Reference**: `server/utils/adminAuth.ts` lines 142-168

### 5. Concurrent Admin Sessions
- **What it tests**: Multiple browser tabs/windows with same admin
- **Scenarios**:
  - Concurrent requests from same admin succeed
  - Session validity maintained across operations
  - Logout affects all tabs
- **Why important**: Real-world usage - admins use multiple tabs

### 6. Auth Method Precedence
- **What it tests**: Priority of Bearer tokens vs cookies
- **Scenarios**:
  - Bearer token takes precedence when both present
  - Falls back to cookie when Bearer absent
  - Authorization header prioritized over cookies
  - Invalid Bearer rejected even if cookie valid
- **Why important**: Consistent auth behavior across different client implementations
- **Reference**: `server/utils/adminAuth.ts` lines 95-134

### 7. Error Handling and Edge Cases
- **What it tests**: Graceful handling of malformed requests
- **Scenarios**:
  - Malformed Authorization headers
  - Missing Bearer prefix
  - Empty headers
  - Unauthenticated requests
  - Helpful error messages
- **Why important**: Robustness - system shouldn't crash on bad input

### 8. Performance and Reliability
- **What it tests**: System behavior under load
- **Scenarios**:
  - Rapid sequential requests without throttling
  - Auth consistency under concurrent load
  - Performance benchmarks (10+ requests < 30s)
- **Why important**: Production reliability under real-world usage

### 9. Database Integration
- **What it tests**: Database connectivity and error handling
- **Scenarios**:
  - Role query execution verification
  - Graceful handling of DB connection issues
- **Why important**: Resilience when database has issues

## Running the Tests

### Prerequisites
```bash
# Ensure environment variables are set
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
```

### Run Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run only auth-flows tests
npm run test:integration -- auth-flows

# Watch mode
npm run test:integration:watch
```

### Run with Coverage
```bash
npm run test:coverage
```

## Test Structure

Each test suite follows this pattern:

1. **Setup** (`beforeAll`): Create Supabase client
2. **Cleanup** (`beforeEach`): Reset test user list
3. **Test Cases**: Execute specific scenarios
4. **Teardown** (`afterAll`): Clean up all test users

## Helper Functions

- `createAuthTestUser()`: Creates test user with specified role
- `cleanupAuthTestUser()`: Removes test user from database
- `createExpiredToken()`: Generates expired JWT for testing

## Key Files Tested

- `/server/utils/adminAuth.ts` - Core admin authorization logic
- `/middleware/admin.ts` - Route middleware with MFA enforcement
- `/composables/useAdminFetch.ts` - Client-side auth composable

## Expected Test Outcomes

All tests should pass with the following behaviors:
- ✅ 401 for unauthenticated requests
- ✅ 403 for non-admin users
- ✅ 200 for valid admin requests (or appropriate success code)
- ✅ Proper error messages for all failure cases
- ✅ No crashes (500 errors) on invalid input

## Troubleshooting

### Tests fail with "Missing SUPABASE_URL"
Ensure `.env` file has required variables set.

### Tests timeout
Increase timeout in `vitest.config.integration.ts`:
```ts
testTimeout: 60000 // 60 seconds
```

### Database cleanup fails
Check Supabase RLS policies allow admin deletion.

### Import errors
Verify `vitest.config.integration.ts` has Supabase packages inlined:
```ts
server: {
  deps: {
    inline: ['@supabase/supabase-js', ...]
  }
}
```

## Future Enhancements

- [ ] Add tests for rate limiting
- [ ] Test session timeout configurations
- [ ] Add tests for IP-based restrictions
- [ ] Test audit log creation on auth events
- [ ] Add performance benchmarks for scale testing

## Related Documentation

- [Admin Fixes Documentation](../../../.docs/admin-fixes/)
- [Authentication Guide](../../AUTH_TESTING_GUIDE.md)
- [Project README](../../../README.md)
