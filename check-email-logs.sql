-- Check Email Logs for Order Confirmation Emails
-- Run this after creating test orders to verify email sending

-- 1. Check recent email logs
SELECT 
  el.id,
  el.order_id,
  o.order_number,
  el.email_type,
  el.recipient_email,
  el.status,
  el.sent_at,
  el.delivered_at,
  el.failed_at,
  el.metadata
FROM email_logs el
JOIN orders o ON o.id = el.order_id
WHERE el.email_type = 'order_confirmation'
ORDER BY el.created_at DESC
LIMIT 10;

-- 2. Check delivery attempts
SELECT 
  eda.id,
  eda.email_log_id,
  el.recipient_email,
  o.order_number,
  eda.attempt_number,
  eda.success,
  eda.external_id,
  eda.error_message,
  eda.attempted_at
FROM email_delivery_attempts eda
JOIN email_logs el ON el.id = eda.email_log_id
JOIN orders o ON o.id = el.order_id
WHERE el.email_type = 'order_confirmation'
ORDER BY eda.attempted_at DESC
LIMIT 10;

-- 3. Check failed emails that need retry
SELECT 
  el.id,
  o.order_number,
  el.recipient_email,
  el.status,
  el.retry_count,
  el.next_retry_at,
  el.failed_at
FROM email_logs el
JOIN orders o ON o.id = el.order_id
WHERE el.email_type = 'order_confirmation'
  AND el.status IN ('failed', 'pending')
ORDER BY el.created_at DESC;

-- 4. Email success rate
SELECT 
  COUNT(*) as total_emails,
  SUM(CASE WHEN status = 'delivered' OR status = 'sent' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'delivered' OR status = 'sent' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) as success_rate_percent
FROM email_logs
WHERE email_type = 'order_confirmation'
  AND created_at > NOW() - INTERVAL '24 hours';
