# Order Email Utilities

## Overview

This module provides utilities for sending order-related emails with comprehensive logging and retry support. It extends the existing email service to handle order confirmation and status update emails.

## Requirements Coverage

### Requirement 1.1
✅ **Order confirmation emails sent within 30 seconds**
- `sendOrderConfirmationEmail()` function sends emails immediately after order creation
- Asynchronous processing ensures non-blocking operation

### Requirement 4.1
✅ **Email delivery logging with timestamp and recipient**
- Every email attempt is logged via `createEmailLog()`
- Logs include timestamp, recipient, order ID, and email type
- Metadata stores additional context (locale, customer name, order number)

### Requirement 4.2
✅ **Retry mechanism with exponential backoff**
- `retryEmailDelivery()` function handles email retries
- `recordEmailAttempt()` tracks attempt count and status
- Retry logic implemented in `emailLogging.ts` with configurable backoff

## Key Functions

### `sendOrderConfirmationEmail(data: OrderEmailData): Promise<EmailSendResult>`

Sends an order confirmation email with full logging support.

**Parameters:**
- `data.order`: Complete order with items
- `data.customerName`: Customer's full name
- `data.customerEmail`: Recipient email address
- `data.locale`: Language code (es, en, ro, ru)

**Returns:**
- `success`: Boolean indicating if email was sent
- `emailLogId`: Database ID of the email log entry
- `externalId`: Email service provider's tracking ID
- `error`: Error message if sending failed

**Example:**
```typescript
const result = await sendOrderConfirmationEmail({
  order: orderWithItems,
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  locale: 'en'
})

if (result.success) {
  console.log('Email sent successfully')
} else {
  console.error('Email failed:', result.error)
}
```

### `sendOrderStatusEmail(data: OrderEmailData, emailType: EmailType): Promise<EmailSendResult>`

Sends order status update emails (processing, shipped, delivered, cancelled, issue).

**Parameters:**
- `data`: Same as `sendOrderConfirmationEmail`
- `emailType`: Type of status email to send

**Supported Email Types:**
- `order_processing`: Order is being processed
- `order_shipped`: Order has been shipped
- `order_delivered`: Order has been delivered
- `order_cancelled`: Order was cancelled
- `order_issue`: There's an issue with the order

### `retryEmailDelivery(emailLogId: number): Promise<EmailSendResult>`

Retries a failed email delivery.

**Parameters:**
- `emailLogId`: ID of the email log entry to retry

**Behavior:**
- Fetches original email log and order data
- Regenerates email HTML with current data
- Sends email and updates log with new attempt
- Respects maximum retry attempts (default: 3)

## Email Logging Flow

```
1. Create email log entry (status: pending, attempts: 0)
2. Generate email HTML from template
3. Send email via Resend service
4. Record attempt:
   - Success: Update status to 'sent', store external ID
   - Failure: Increment attempts, store error message
5. If failed and attempts < max: Status remains 'pending' for retry
6. If failed and attempts >= max: Status changes to 'failed'
```

## Multi-Language Support

Email subjects are automatically localized based on the `locale` parameter:

**Order Confirmation:**
- `es`: "Confirmación de pedido #ORD-123 - Moldova Direct"
- `en`: "Order confirmation #ORD-123 - Moldova Direct"
- `ro`: "Confirmare comandă #ORD-123 - Moldova Direct"
- `ru`: "Подтверждение заказа #ORD-123 - Moldova Direct"

**Order Status Updates:**
Each status type has localized subjects for all supported languages.

## Error Handling

### Email Sending Failures
- All errors are caught and logged
- Failed attempts are recorded in the database
- Error messages are stored for debugging
- Function returns error details instead of throwing

### Missing Data
- Order data is validated before sending
- Missing optional fields are handled gracefully
- Template rendering errors are caught and logged

### Service Unavailability
- Resend service errors are caught
- Emails remain in 'pending' status for retry
- Development mode simulates email sending

## Integration Points

### Database Tables
- `email_logs`: Stores all email delivery attempts and status
- `orders`: Source of order data for email content

### External Services
- **Resend**: Email delivery service
- Configured via `RESEND_API_KEY` environment variable

### Related Modules
- `server/utils/email.ts`: Base email sending functionality
- `server/utils/emailLogging.ts`: Email log database operations
- `types/email.ts`: Email type definitions

## Testing

Unit tests are provided in `tests/unit/order-emails.test.ts`:

- Email log creation
- Email sending with correct data
- Successful attempt recording
- Failure handling
- Multi-language subject generation

Run tests:
```bash
npx vitest run tests/unit/order-emails.test.ts
```

## Future Enhancements

The following features are planned for future tasks:

1. **Task 3.2**: Exponential backoff retry logic
2. **Task 5.1**: Dedicated templates for each order status
3. **Task 5.2**: Tracking information in shipping emails
4. **Task 8.1**: Email queue for asynchronous processing
5. **Task 8.2**: Template caching for performance

## Development Mode

When `RESEND_API_KEY` is not configured:
- Emails are simulated (not actually sent)
- Console logs show email details
- Email logs are still created in database
- External ID is mocked with timestamp

This allows development and testing without email service configuration.
