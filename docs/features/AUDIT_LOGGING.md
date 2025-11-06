# Audit Logging System

This document describes the comprehensive audit logging system implemented for admin actions and user impersonation.

**Related Issue:** [#87 - User Impersonation Without Proper Audit Trail](https://github.com/caraseli02/MoldovaDirect/issues/87)

## Overview

The audit logging system provides:

- **Database persistence** of all admin actions
- **Time-limited JWT tokens** for impersonation sessions
- **Comprehensive session tracking** with reasons and metadata
- **IP address and user agent tracking** for compliance
- **Query APIs** for viewing audit logs and impersonation history

## Components

### 1. Database Tables

#### `audit_logs`

General audit log for all admin actions.

```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `impersonation_logs`

Specific audit log for user impersonation sessions.

```sql
CREATE TABLE impersonation_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  reason TEXT NOT NULL,
  actions_taken JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2. Server Utilities

#### `server/utils/adminAuth.ts`

Updated `logAdminAction()` function that stores audit logs in the database:

```typescript
export async function logAdminAction(
  event: H3Event,
  adminId: string,
  action: string,
  metadata?: Record<string, any>
)
```

**Features:**
- Database persistence in `audit_logs` table
- IP address and user agent tracking
- Structured metadata with old/new values
- Graceful error handling (doesn't fail the operation)

#### `server/utils/impersonation.ts`

JWT token generation and verification for impersonation sessions:

```typescript
// Generate time-limited JWT token
export async function generateImpersonationToken(
  options: GenerateImpersonationTokenOptions
): Promise<string>

// Verify and decode token
export async function verifyImpersonationToken(
  token: string
): Promise<ImpersonationTokenPayload>

// Validate session against database
export async function validateImpersonationSession(
  event: any,
  token: string
)
```

**Features:**
- Time-limited JWT tokens (configurable expiration)
- Token type verification
- Database session validation
- Auto-expiration of expired sessions

### 3. Server Middleware

#### `server/middleware/impersonation.ts`

Validates impersonation tokens and switches user context for authenticated requests.

**How It Works:**
- Intercepts all incoming requests
- Checks for `X-Impersonation-Token` header
- Validates token and database session
- Sets `event.context.impersonation` with session details
- Logs impersonation context for audit trail

**Usage:**
The middleware runs automatically for all requests. No additional configuration needed.

**Context Object:**
```typescript
event.context.impersonation = {
  isImpersonating: boolean
  adminId: string
  targetUserId: string
  sessionId: number
  reason: string
  error?: string // Present if token validation failed
}
```

**Security:**
- Tokens must be valid JWT signed with `IMPERSONATION_JWT_SECRET`
- Sessions must be active (not ended or expired)
- IP address and user agent validation (optional)
- Invalid tokens fail gracefully (request continues as original user)

### 4. API Endpoints

#### `POST /api/admin/impersonate`

Start or end an impersonation session.

**Request Body (start):**
```json
{
  "action": "start",
  "userId": "uuid-of-user-to-impersonate",
  "reason": "Customer support request #12345 - helping with checkout issue",
  "duration": 30
}
```

**Response (start):**
```json
{
  "success": true,
  "action": "start",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "logId": 123,
  "expiresAt": "2025-11-04T19:22:11.000Z",
  "duration": 30,
  "impersonating": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "message": "Now impersonating john@example.com",
  "warning": "All actions will be performed as this user and logged for audit purposes."
}
```

**Request Body (end):**
```json
{
  "action": "end",
  "logId": 123
}
```

**Response (end):**
```json
{
  "success": true,
  "action": "end",
  "session": {
    "logId": 123,
    "startedAt": "2025-11-04T18:52:11.000Z",
    "endedAt": "2025-11-04T18:57:45.000Z",
    "duration": 5
  },
  "message": "Impersonation session ended successfully."
}
```

**Validations:**
- Reason required (minimum 10 characters)
- Duration limited to 1-120 minutes
- Admin role verification
- User existence check

**Rate Limiting:**
- Maximum 10 impersonation sessions per admin per hour
- Prevents abuse and excessive impersonation attempts
- Returns HTTP 429 (Too Many Requests) when limit exceeded

#### `GET /api/admin/audit-logs`

Retrieve general audit logs.

**Query Parameters:**
- `limit` - Number of records (default: 50, max: 500)
- `offset` - Pagination offset (default: 0)
- `userId` - Filter by user ID
- `action` - Filter by action type
- `resourceType` - Filter by resource type
- `startDate` - Filter from date (ISO string)
- `endDate` - Filter to date (ISO string)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 456,
      "user_id": "admin-uuid",
      "action": "impersonate-start",
      "resource_type": "user_impersonation",
      "resource_id": "user-uuid",
      "new_values": {
        "target_user_id": "user-uuid",
        "target_email": "john@example.com",
        "reason": "Customer support request #12345",
        "duration_minutes": 30,
        "log_id": 123
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-11-04T18:52:11.000Z",
      "user": {
        "name": "Admin User",
        "role": "admin"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 234,
    "hasMore": true
  }
}
```

#### `GET /api/admin/impersonation-logs`

Retrieve impersonation session logs.

**Query Parameters:**
- `limit` - Number of records (default: 50, max: 500)
- `offset` - Pagination offset (default: 0)
- `adminId` - Filter by admin ID
- `targetUserId` - Filter by target user ID
- `status` - Filter by status: `active`, `ended`, `expired`, `all` (default: `all`)
- `startDate` - Filter from date (ISO string)
- `endDate` - Filter to date (ISO string)

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 123,
      "admin_id": "admin-uuid",
      "target_user_id": "user-uuid",
      "started_at": "2025-11-04T18:52:11.000Z",
      "expires_at": "2025-11-04T19:22:11.000Z",
      "ended_at": "2025-11-04T18:57:45.000Z",
      "reason": "Customer support request #12345 - helping with checkout issue",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "status": "ended",
      "duration_minutes": 5,
      "admin": {
        "name": "Admin User",
        "email": "admin@moldovadirect.com",
        "role": "admin"
      },
      "target_user": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer"
      }
    }
  ],
  "summary": {
    "total": 145,
    "active": 2,
    "ended": 138,
    "expired": 5
  },
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 145,
    "hasMore": true
  }
}
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# Security - Admin Impersonation JWT Secret
# Used to sign time-limited JWT tokens for admin user impersonation sessions
# Generate a strong random secret (minimum 32 characters)
IMPERSONATION_JWT_SECRET=your_impersonation_jwt_secret_min_32_chars
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```

**Vercel deployment:**
Add the environment variable in Vercel dashboard under Settings > Environment Variables.

## Security Features

### 1. Time-Limited Sessions

- Default duration: 30 minutes
- Maximum duration: 120 minutes
- Tokens automatically expire
- Expired sessions cannot be extended

### 2. Required Justification

- Reason field required (minimum 10 characters)
- Stored in database for audit trail
- Cannot start session without reason

### 3. IP Address and User Agent Tracking

- Captures IP address of admin initiating session
- Records user agent string
- Useful for identifying suspicious activity

### 4. Database Persistence

- All sessions logged to database
- Cannot be deleted or modified by client
- Permanent audit trail for compliance

### 5. JWT Token Security

- Signed with secret key
- Token type verification
- Issuer and audience validation
- Automatic expiration handling

### 6. Session Status Tracking

- **Active:** Session is currently valid
- **Ended:** Admin explicitly ended the session
- **Expired:** Session expired without being ended

## Compliance

This audit logging system helps meet compliance requirements for:

### SOX (Sarbanes-Oxley)
- Tracks privileged access to financial data
- Provides audit trail for investigations
- Requires justification for access

### GDPR
- Users have right to know who accessed their data
- Audit trail of data access
- Justification for processing personal data

### PCI-DSS
- All access to cardholder data must be logged
- Individual user accountability
- Audit trail for security investigations

## Usage Examples

### Starting an Impersonation Session

```javascript
const response = await $fetch('/api/admin/impersonate', {
  method: 'POST',
  body: {
    action: 'start',
    userId: 'user-uuid',
    reason: 'Customer support ticket #12345 - User reports checkout issue with payment method',
    duration: 30 // minutes
  }
})

// Store the token for subsequent requests
const { token, logId, expiresAt } = response
```

### Using the Impersonation Token

Once you have an impersonation token, include it in the `X-Impersonation-Token` header for all requests you want to make as the impersonated user:

```javascript
// Make requests as the impersonated user
const response = await $fetch('/api/user/profile', {
  headers: {
    'X-Impersonation-Token': token
  }
})
```

**How It Works:**

1. The impersonation middleware (`server/middleware/impersonation.ts`) automatically intercepts all requests
2. It checks for the `X-Impersonation-Token` header
3. If present, it validates the token and session against the database
4. If valid, the user context is switched to the impersonated user
5. All subsequent operations are performed as that user
6. The impersonation context is available in `event.context.impersonation`

**Token Storage:**

For security, store the token in a secure, httpOnly cookie or session storage:

```javascript
// Secure cookie (recommended)
document.cookie = `impersonation_token=${token}; Secure; SameSite=Strict`

// Or use session storage (less secure but easier)
sessionStorage.setItem('impersonation_token', token)
```

**Security Features:**

- Token must be valid JWT signed with `IMPERSONATION_JWT_SECRET`
- Session must exist in database and be active (not ended or expired)
- Middleware logs all impersonation context for audit trail
- Invalid tokens are ignored (request continues as original user)

### Ending an Impersonation Session

```javascript
await $fetch('/api/admin/impersonate', {
  method: 'POST',
  body: {
    action: 'end',
    logId: 123
  }
})
```

### Viewing Audit Logs

```javascript
// Get all audit logs
const logs = await $fetch('/api/admin/audit-logs')

// Get logs for a specific user
const userLogs = await $fetch('/api/admin/audit-logs?userId=user-uuid')

// Get logs for a specific action
const impersonationLogs = await $fetch('/api/admin/audit-logs?action=impersonate-start')
```

### Viewing Impersonation History

```javascript
// Get all impersonation sessions
const sessions = await $fetch('/api/admin/impersonation-logs')

// Get active impersonation sessions
const active = await $fetch('/api/admin/impersonation-logs?status=active')

// Get impersonations by a specific admin
const adminSessions = await $fetch('/api/admin/impersonation-logs?adminId=admin-uuid')
```

## Database Migration

To apply the database migration:

1. Connect to your Supabase project
2. Navigate to SQL Editor
3. Run the migration file: `supabase/sql/migrations/20251104182211_create_impersonation_logs.sql`

Or use the Supabase CLI:

```bash
supabase db push
```

## Testing

### Manual Testing

1. **Start impersonation without reason:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/impersonate \
     -H "Content-Type: application/json" \
     -d '{"action":"start","userId":"user-uuid"}'
   # Expected: 400 error - reason required
   ```

2. **Start valid impersonation:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/impersonate \
     -H "Content-Type: application/json" \
     -d '{"action":"start","userId":"user-uuid","reason":"Testing impersonation feature for ticket #123"}'
   # Expected: 200 with token
   ```

3. **View audit logs:**
   ```bash
   curl http://localhost:3000/api/admin/audit-logs
   # Expected: List of audit logs
   ```

4. **View impersonation logs:**
   ```bash
   curl http://localhost:3000/api/admin/impersonation-logs
   # Expected: List of impersonation sessions
   ```

## Troubleshooting

### "IMPERSONATION_JWT_SECRET not configured"

**Cause:** Environment variable not set

**Solution:** Add `IMPERSONATION_JWT_SECRET` to your `.env` file:
```bash
IMPERSONATION_JWT_SECRET=$(openssl rand -base64 32)
```

### "Failed to create audit log for impersonation session"

**Cause:** Database migration not applied or RLS policy issue

**Solution:**
1. Verify migration was applied
2. Check Supabase logs for errors
3. Verify RLS policies allow service role to insert

### Token expired immediately

**Cause:** System clock mismatch or duration too short

**Solution:**
1. Check system time is correct
2. Increase duration in request
3. Verify JWT secret is consistent

## Future Enhancements

- [ ] Email notifications to impersonated users
- [ ] In-app notification system
- [ ] Real-time dashboard for active impersonation sessions
- [ ] Automatic cleanup of old logs (data retention policy)
- [ ] Action tracking during impersonation (record specific actions taken)
- [ ] Export audit logs to CSV/JSON
- [ ] Advanced filtering and search

## Related Files

- Migration: `supabase/sql/migrations/20251104182211_create_impersonation_logs.sql`
- Utilities: `server/utils/impersonation.ts`, `server/utils/adminAuth.ts`
- Endpoints: `server/api/admin/impersonate.post.ts`, `server/api/admin/audit-logs.get.ts`, `server/api/admin/impersonation-logs.get.ts`
- Documentation: `docs/AUDIT_LOGGING.md` (this file)
- Issue: [#87](https://github.com/caraseli02/MoldovaDirect/issues/87)

## References

- [SOX Compliance Requirements](https://www.sec.gov/spotlight/sarbanes-oxley.htm)
- [GDPR Article 30 - Records of processing activities](https://gdpr-info.eu/art-30-gdpr/)
- [PCI-DSS Requirement 10 - Track and monitor all access to network resources](https://www.pcisecuritystandards.org/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
