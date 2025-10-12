# Email Retry Service

## Overview

The Email Retry Service provides automated retry functionality for failed email deliveries with exponential backoff strategy. It ensures reliable email delivery while preventing email service overload.

## Features

### 1. Exponential Backoff Strategy

The service implements exponential backoff to gradually increase the delay between retry attempts:

- **Attempt 1**: 1 second delay
- **Attempt 2**: 2 seconds delay (2^1 × 1s)
- **Attempt 3**: 4 seconds delay (2^2 × 1s)

**Total retry window**: 7 seconds

### 2. Maximum Retry Attempts

- Default: **3 attempts** maximum
- Configurable via `EmailRetryConfig`
- After max attempts, email is marked as `failed`

### 3. Admin Alert System

Automatically sends alerts to administrators when:
- Multiple emails fail consecutively
- Default threshold: **5 failed emails**
- Configurable via `AdminAlertConfig`

Alert includes:
- Email log IDs
- Number of attempts
- Error messages
- Next retry times

### 4. Retry Statistics

Track retry performance with metrics:
- Total retries processed
- Successful vs failed retries
- Average attempts per email
- Time-based filtering

## Configuration

### Retry Configuration

```typescript
interface EmailRetryConfig {
  maxAttempts: number        // Maximum retry attempts (default: 3)
  backoffMultiplier: number  // Exponential multiplier (default: 2)
  initialDelayMs: number     // Initial delay in ms (default: 1000)
}
```

### Admin Alert Configuration

```typescript
interface AdminAlertConfig {
  enabled: boolean           // Enable/disable alerts (default: true)
  alertEmail: string        // Admin email address
  alertThreshold: number    // Failures before alert (default: 5)
}
```

Set via environment variable:
```bash
ADMIN_ALERT_EMAIL=admin@moldovadirect.com
```

## Usage

### Automatic Processing

Schedule automatic retry processing:

```typescript
import { scheduleEmailRetries } from '~/server/utils/emailRetryService'

// Run every 5 minutes
await scheduleEmailRetries(5)
```

### Manual Processing

Trigger manual retry processing via API:

```bash
POST /api/admin/email-retries/process
```

Response:
```json
{
  "success": true,
  "data": {
    "processed": 10,
    "succeeded": 8,
    "failed": 2,
    "results": [...]
  },
  "message": "Processed 10 emails: 8 succeeded, 2 failed"
}
```

### Retry Specific Email

Retry a single email by log ID:

```bash
POST /api/admin/email-retries/{emailLogId}
```

### Get Retry Statistics

View retry performance metrics:

```bash
GET /api/admin/email-retries/stats?dateFrom=2024-01-01&dateTo=2024-01-31
```

Response:
```json
{
  "success": true,
  "data": {
    "totalRetries": 150,
    "successfulRetries": 142,
    "failedRetries": 8,
    "averageAttempts": 1.45
  }
}
```

## Retry Process Flow

```
1. Get pending emails from database
   ↓
2. For each email:
   - Check if max attempts reached → Skip if yes
   - Calculate required delay based on attempts
   - Check if enough time passed → Skip if no
   - Attempt email delivery
   - Update email log with result
   ↓
3. Check if admin alert needed
   - Count failed emails
   - Send alert if threshold exceeded
   ↓
4. Return batch results
```

## Email Status Lifecycle

```
pending → sent → delivered ✓
   ↓
pending → failed (retry 1) → pending
   ↓
pending → failed (retry 2) → pending
   ↓
pending → failed (retry 3) → failed ✗
```

## Database Schema

Email logs track retry attempts:

```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  external_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Error Handling

### Transient Errors (Retryable)
- Network timeouts
- Email service rate limits
- Temporary service unavailability

### Permanent Errors (Not Retryable)
- Invalid email addresses
- Blocked recipients
- Authentication failures

The service automatically determines retry eligibility based on error type.

## Monitoring

### Logs

The service provides detailed logging:
- `🔄` Retry processing started
- `📧` Pending emails found
- `✅` Successful retry
- `❌` Failed retry
- `🚨` Admin alert sent

### Metrics

Monitor these key metrics:
- Retry success rate
- Average attempts per email
- Time to successful delivery
- Alert frequency

## Best Practices

1. **Schedule Regular Processing**: Run every 5-10 minutes
2. **Monitor Alert Threshold**: Adjust based on email volume
3. **Review Failed Emails**: Investigate persistent failures
4. **Update Email Service Config**: Ensure proper authentication
5. **Archive Old Logs**: Maintain database performance

## Troubleshooting

### High Failure Rate

1. Check email service status
2. Verify API credentials
3. Review bounce reasons in logs
4. Check recipient email validity

### No Retries Processing

1. Verify scheduled task is running
2. Check database connectivity
3. Review application logs
4. Ensure pending emails exist

### Admin Alerts Not Sending

1. Verify `ADMIN_ALERT_EMAIL` is set
2. Check alert threshold configuration
3. Review email service logs
4. Ensure alert email is valid

## Requirements Satisfied

✅ **Requirement 4.2**: Email delivery retry up to 3 times with exponential backoff
✅ **Requirement 4.3**: Failure logging and admin alert system
✅ **Requirement 4.3**: Alert administrators of persistent delivery issues

## Related Files

- `server/utils/emailRetryService.ts` - Main retry service
- `server/utils/orderEmails.ts` - Email sending utilities
- `server/utils/emailLogging.ts` - Email logging utilities
- `types/email.ts` - Type definitions and retry config
- `server/api/admin/email-retries/` - Admin API endpoints
