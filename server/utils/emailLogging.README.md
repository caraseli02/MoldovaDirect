# Email Logging Infrastructure

This module provides utilities for logging and tracking email delivery attempts for order confirmation emails and other transactional emails.

## Requirements

This implementation satisfies requirements 4.1, 4.2, and 4.3:
- 4.1: Log email delivery attempts with timestamp and recipient
- 4.2: Retry sending up to 3 times with exponential backoff
- 4.3: Log failures and alert administrators

## Database Schema

The `email_logs` table tracks all email delivery attempts:

```sql
-- Run the migration
psql -f supabase/sql/supabase-email-logs-schema.sql
```

### Table Structure

- `id`: Primary key
- `order_id`: Reference to the order
- `email_type`: Type of email (order_confirmation, order_shipped, etc.)
- `recipient_email`: Email address
- `subject`: Email subject line
- `status`: Current status (pending, sent, delivered, failed, bounced)
- `attempts`: Number of delivery attempts
- `last_attempt_at`: Timestamp of last attempt
- `delivered_at`: Timestamp when delivered
- `bounce_reason`: Reason if bounced
- `external_id`: External email service provider ID (e.g., Resend message ID)
- `metadata`: Additional metadata (locale, template version, etc.)

## TypeScript Types

All types are exported from `types/email.ts` and re-exported from `types/index.ts`:

```typescript
import type {
  EmailLog,
  EmailType,
  EmailStatus,
  CreateEmailLogInput,
  UpdateEmailLogInput,
  EmailLogFilters,
  EmailDeliveryStats
} from '~/types'
```

## Usage Examples

### Creating an Email Log

```typescript
import { createEmailLog } from '~/server/utils/emailLogging'

const emailLog = await createEmailLog({
  orderId: 123,
  emailType: 'order_confirmation',
  recipientEmail: 'customer@example.com',
  subject: 'Order Confirmation #ORD-123',
  metadata: {
    locale: 'en',
    orderNumber: 'ORD-123',
    customerName: 'John Doe'
  }
})
```

### Recording Email Attempts

```typescript
import { recordEmailAttempt } from '~/server/utils/emailLogging'

// After attempting to send email
const updatedLog = await recordEmailAttempt(
  emailLog.id,
  true, // success
  'resend-message-id-123' // external ID from email provider
)

// On failure
const failedLog = await recordEmailAttempt(
  emailLog.id,
  false, // failed
  undefined,
  'SMTP connection timeout' // bounce reason
)
```

### Querying Email Logs

```typescript
import { getEmailLogs } from '~/server/utils/emailLogging'

// Get all logs for an order
const logs = await getEmailLogs({
  orderId: 123
})

// Search by email
const logs = await getEmailLogs({
  recipientEmail: 'customer@example.com',
  dateFrom: '2025-01-01',
  dateTo: '2025-01-31'
})

// Filter by status
const failedLogs = await getEmailLogs({
  status: 'failed',
  page: 1,
  limit: 50
})
```

### Getting Delivery Statistics

```typescript
import { getEmailDeliveryStats } from '~/server/utils/emailLogging'

const stats = await getEmailDeliveryStats(
  '2025-01-01', // from date
  '2025-01-31'  // to date
)

console.log(`Delivery rate: ${stats.deliveryRate}%`)
console.log(`Bounce rate: ${stats.bounceRate}%`)
```

### Handling Webhooks

```typescript
import { markEmailDelivered, markEmailBounced } from '~/server/utils/emailLogging'

// When email is delivered (webhook from email provider)
await markEmailDelivered('resend-message-id-123')

// When email bounces
await markEmailBounced(
  'resend-message-id-123',
  'Mailbox does not exist'
)
```

### Retry Logic

```typescript
import { 
  getPendingEmailsForRetry,
  shouldRetryEmail,
  calculateRetryDelay,
  DEFAULT_EMAIL_RETRY_CONFIG
} from '~/server/utils/emailLogging'

// Get emails that need retry
const pendingEmails = await getPendingEmailsForRetry()

for (const emailLog of pendingEmails) {
  // Check if should retry
  if (shouldRetryEmail(emailLog.attempts)) {
    // Calculate delay
    const delay = calculateRetryDelay(emailLog.attempts)
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, delay))
    
    // Attempt to send email again
    // ... email sending logic ...
  }
}
```

## Retry Configuration

The default retry configuration uses exponential backoff:

```typescript
{
  maxAttempts: 3,           // Maximum 3 attempts
  backoffMultiplier: 2,     // Double the delay each time
  initialDelayMs: 1000      // Start with 1 second delay
}
```

This results in delays of:
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 seconds delay

## Security

- Row Level Security (RLS) is enabled on the `email_logs` table
- Only admins can view email logs
- System (service role) can insert and update logs
- Email addresses are stored securely and comply with privacy regulations

## Indexes

The following indexes are created for efficient querying:
- `email_logs_order_id_idx`: For order-based queries
- `email_logs_recipient_email_idx`: For email-based searches
- `email_logs_status_idx`: For status filtering
- `email_logs_email_type_idx`: For type filtering
- `email_logs_created_at_idx`: For date-based queries
- `email_logs_search_idx`: Composite index for admin searches

## Next Steps

This infrastructure is ready to be used by:
1. Order email template system (Task 2)
2. Email service extensions (Task 3)
3. Order creation integration (Task 4)
4. Email administration interface (Task 6)
