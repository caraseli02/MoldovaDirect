# Email Administration Interface - User Guide

## Overview
This guide explains how to use the email administration interface to manage email templates and monitor email delivery.

## Accessing the Admin Interface

### Email Templates Management
Navigate to: `/admin/email-templates`

### Email Delivery Logs
Navigate to: `/admin/email-logs`

## Managing Email Templates

### Editing a Template

1. **Select Template Type**
   - Choose from: Order Confirmation, Order Processing, Order Shipped, Order Delivered, Order Cancelled, or Order Issue
   - Each type corresponds to a different email notification

2. **Select Language**
   - Choose from: English, Español, Română, or Русский
   - Each language has its own template version

3. **Edit Template Content**
   - **Subject Line**: The email subject (supports placeholders like `{orderNumber}`)
   - **Preheader Text**: Preview text shown in email clients
   - **Template Content**: JSON object containing all translatable strings

4. **Validate Template**
   - Click "Validate" to check for errors
   - Fix any validation errors before saving
   - Warnings are informational and don't prevent saving

5. **Preview Template**
   - Click "Refresh Preview" to see how the email will look
   - Preview uses sample order data
   - Check both desktop and mobile appearance

6. **Save Changes**
   - Click "Save Changes" when ready
   - A new version is automatically created
   - Previous version is archived in history

### Template Placeholders

Common placeholders you can use in templates:
- `{name}` - Customer name
- `{orderNumber}` - Order number
- `{orderDate}` - Order date
- `{total}` - Order total

### Version History

1. **View History**
   - Version history appears below the language selector
   - Shows all previous versions with timestamps

2. **View Version Details**
   - Click "View" on any version to see full content
   - Review subject, preheader, and translations

3. **Rollback to Previous Version**
   - Click "Rollback" on the version you want to restore
   - Confirm the rollback action
   - A new version is created with the old content
   - Original history is preserved

### Template Synchronization

Use synchronization to keep template structure consistent across languages.

1. **Select Source Language**
   - Choose the language with the correct structure
   - Usually English is the source

2. **Select Target Languages**
   - Check the languages you want to update
   - Can select multiple languages

3. **Preview Changes**
   - Click "Preview Changes" to see what will change
   - Shows new keys, removed keys, and structural changes

4. **Synchronize**
   - Click "Synchronize Templates" to apply changes
   - Existing translations are preserved
   - New keys get placeholder translations
   - Obsolete keys are removed

## Monitoring Email Delivery

### Viewing Statistics

The dashboard shows:
- **Total Emails**: All emails sent
- **Delivered**: Successfully delivered emails with delivery rate
- **Failed**: Emails that failed to send
- **Bounced**: Emails that bounced with bounce rate

Statistics refresh automatically every 30 seconds.

### Searching Email Logs

1. **Search by Order Number**
   - Enter full or partial order number
   - Example: `ORD-2024-001`

2. **Search by Customer Email**
   - Enter full or partial email address
   - Example: `customer@example.com`

3. **Filter by Email Type**
   - Select specific email type from dropdown
   - Or leave as "All Types" to see everything

4. **Filter by Status**
   - Pending: Awaiting delivery
   - Sent: Successfully sent
   - Delivered: Confirmed delivery
   - Failed: Delivery failed
   - Bounced: Email bounced back

5. **Filter by Date Range**
   - Set "Date From" for start date
   - Set "Date To" for end date
   - Leave blank to see all dates

### Viewing Email Details

1. Click "View" on any email log entry
2. Modal shows complete information:
   - Order number and status
   - Recipient email address
   - Email type and subject
   - Delivery attempts
   - External service ID
   - Bounce reason (if bounced)
   - Timestamps

### Retrying Failed Emails

1. Open email details for a failed email
2. Click "Retry Email" button
3. System will attempt to resend the email
4. New attempt is logged
5. Status updates automatically

**Note**: Retry is only available for emails with fewer than 3 attempts.

## Best Practices

### Template Management

1. **Always Preview Before Saving**
   - Check how the email looks
   - Verify all placeholders work correctly
   - Test on different screen sizes

2. **Use Validation**
   - Run validation before saving
   - Fix all errors
   - Address warnings when possible

3. **Keep Backups**
   - Version history serves as automatic backup
   - Consider exporting important templates
   - Document major changes

4. **Test Translations**
   - Verify translations are accurate
   - Check for cultural appropriateness
   - Ensure consistent terminology

### Template Synchronization

1. **Preview First**
   - Always preview synchronization changes
   - Review what will be added/removed
   - Understand the impact

2. **Synchronize Regularly**
   - Keep templates in sync across languages
   - Prevents structural drift
   - Makes maintenance easier

3. **Review After Sync**
   - Check each synchronized language
   - Update placeholder translations
   - Verify nothing was lost

### Email Monitoring

1. **Regular Monitoring**
   - Check statistics daily
   - Watch for unusual bounce rates
   - Monitor failed emails

2. **Investigate Failures**
   - Review bounce reasons
   - Identify patterns
   - Take corrective action

3. **Retry Strategically**
   - Don't retry immediately
   - Wait for temporary issues to resolve
   - Investigate persistent failures

## Troubleshooting

### Template Won't Save

**Problem**: Save button is disabled or save fails

**Solutions**:
- Run validation and fix all errors
- Check JSON syntax is correct
- Ensure all required fields are filled
- Verify you have admin permissions

### Preview Not Showing

**Problem**: Preview is blank or shows error

**Solutions**:
- Check template JSON is valid
- Verify all required translation keys exist
- Click "Refresh Preview" again
- Check browser console for errors

### Synchronization Failed

**Problem**: Template sync doesn't work

**Solutions**:
- Ensure source template exists
- Verify target languages are selected
- Check you have admin permissions
- Try synchronizing one language at a time

### Email Logs Not Loading

**Problem**: Email logs table is empty or won't load

**Solutions**:
- Check date range filters aren't too restrictive
- Clear all filters and try again
- Verify emails have been sent
- Check browser console for errors

### Retry Not Working

**Problem**: Email retry fails or button is disabled

**Solutions**:
- Check email hasn't exceeded 3 attempts
- Verify the email is in "failed" status
- Review bounce reason for permanent failures
- Check email service configuration

## Support

For additional help:
1. Check the implementation summary document
2. Review the requirements and design documents
3. Contact the development team
4. Check server logs for detailed error messages

## Security Notes

- Only administrators can access these interfaces
- All changes are logged with timestamps
- Version history provides audit trail
- Sensitive data is not stored in templates
- Email logs contain customer information - handle with care
