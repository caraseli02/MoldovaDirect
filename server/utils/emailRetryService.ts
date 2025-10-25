// =============================================
// EMAIL RETRY SERVICE
// =============================================
// Automated retry service for failed email deliveries
// Requirements: 4.2, 4.3

import type { EmailLog, EmailRetryConfig } from '~/types/email'
import { DEFAULT_EMAIL_RETRY_CONFIG, calculateRetryDelay, shouldRetryEmail } from '~/types/email'
import { getPendingEmailsForRetry } from './emailLogging'
import { retryEmailDelivery } from './orderEmails'

/**
 * Retry result for a single email
 */
export interface EmailRetryResult {
  emailLogId: number
  success: boolean
  attempts: number
  error?: string
  nextRetryAt?: string
}

/**
 * Batch retry result
 */
export interface BatchRetryResult {
  processed: number
  succeeded: number
  failed: number
  results: EmailRetryResult[]
}

/**
 * Admin alert configuration
 */
export interface AdminAlertConfig {
  enabled: boolean
  alertEmail: string
  alertThreshold: number // Number of consecutive failures before alerting
}

/**
 * Default admin alert configuration
 */
const DEFAULT_ADMIN_ALERT_CONFIG: AdminAlertConfig = {
  enabled: true,
  alertEmail: process.env.ADMIN_ALERT_EMAIL || 'admin@moldovadirect.com',
  alertThreshold: 5
}

/**
 * Process pending emails for retry with exponential backoff
 * Requirements: 4.2
 */
export async function processEmailRetries(
  config: EmailRetryConfig = DEFAULT_EMAIL_RETRY_CONFIG
): Promise<BatchRetryResult> {
  console.log('🔄 Starting email retry processing...')
  
  const results: EmailRetryResult[] = []
  let succeeded = 0
  let failed = 0
  
  try {
    // Get pending emails that need retry
    const pendingEmails = await getPendingEmailsForRetry()
    
    if (pendingEmails.length === 0) {
      console.log('✅ No pending emails to retry')
      return {
        processed: 0,
        succeeded: 0,
        failed: 0,
        results: []
      }
    }
    
    console.log(`📧 Found ${pendingEmails.length} pending emails to retry`)
    
    // Process each pending email
    for (const emailLog of pendingEmails) {
      const result = await processEmailRetry(emailLog, config)
      results.push(result)
      
      if (result.success) {
        succeeded++
      } else {
        failed++
      }
    }
    
    console.log(`✅ Email retry processing complete: ${succeeded} succeeded, ${failed} failed`)
    
    // Check if we need to send admin alerts
    if (failed > 0) {
      await checkAndSendAdminAlerts(results)
    }
    
    return {
      processed: pendingEmails.length,
      succeeded,
      failed,
      results
    }
  } catch (error: any) {
    console.error('❌ Error processing email retries:', error)
    throw error
  }
}

/**
 * Process retry for a single email with exponential backoff
 * Requirements: 4.2
 */
async function processEmailRetry(
  emailLog: EmailLog,
  config: EmailRetryConfig
): Promise<EmailRetryResult> {
  const { id, attempts, lastAttemptAt } = emailLog
  
  // Check if we should retry
  if (!shouldRetryEmail(attempts, config)) {
    console.log(`⏭️  Email ${id} has reached max attempts (${attempts}/${config.maxAttempts})`)
    return {
      emailLogId: id,
      success: false,
      attempts,
      error: 'Maximum retry attempts reached'
    }
  }
  
  // Calculate delay since last attempt
  const delay = calculateRetryDelay(attempts + 1, config)
  const now = Date.now()
  const lastAttemptTime = lastAttemptAt ? new Date(lastAttemptAt).getTime() : 0
  const timeSinceLastAttempt = now - lastAttemptTime
  
  // Check if enough time has passed for retry
  if (timeSinceLastAttempt < delay) {
    const nextRetryAt = new Date(lastAttemptTime + delay).toISOString()
    console.log(`⏰ Email ${id} not ready for retry yet. Next retry at: ${nextRetryAt}`)
    return {
      emailLogId: id,
      success: false,
      attempts,
      error: 'Not ready for retry',
      nextRetryAt
    }
  }
  
  // Attempt retry
  console.log(`🔄 Retrying email ${id} (attempt ${attempts + 1}/${config.maxAttempts})`)
  
  try {
    const result = await retryEmailDelivery(id)
    
    if (result.success) {
      console.log(`✅ Email ${id} retry successful`)
      return {
        emailLogId: id,
        success: true,
        attempts: attempts + 1
      }
    } else {
      console.log(`❌ Email ${id} retry failed: ${result.error}`)
      
      // Calculate next retry time
      const nextDelay = calculateRetryDelay(attempts + 2, config)
      const nextRetryAt = new Date(now + nextDelay).toISOString()
      
      return {
        emailLogId: id,
        success: false,
        attempts: attempts + 1,
        error: result.error,
        nextRetryAt: shouldRetryEmail(attempts + 1, config) ? nextRetryAt : undefined
      }
    }
  } catch (error: any) {
    console.error(`❌ Error retrying email ${id}:`, error)
    
    return {
      emailLogId: id,
      success: false,
      attempts: attempts + 1,
      error: error.message
    }
  }
}

/**
 * Check retry results and send admin alerts if needed
 * Requirements: 4.3
 */
async function checkAndSendAdminAlerts(
  results: EmailRetryResult[],
  alertConfig: AdminAlertConfig = DEFAULT_ADMIN_ALERT_CONFIG
): Promise<void> {
  if (!alertConfig.enabled) {
    return
  }
  
  // Count consecutive failures
  const failedEmails = results.filter(r => !r.success && r.error !== 'Not ready for retry')
  
  if (failedEmails.length >= alertConfig.alertThreshold) {
    console.log(`🚨 Sending admin alert: ${failedEmails.length} emails failed`)
    await sendAdminAlert(failedEmails, alertConfig)
  }
}

/**
 * Send admin alert email for failed deliveries
 * Requirements: 4.3
 */
async function sendAdminAlert(
  failedEmails: EmailRetryResult[],
  alertConfig: AdminAlertConfig
): Promise<void> {
  try {
    const { sendEmail } = await import('./email')
    
    const subject = `⚠️ Email Delivery Failures - ${failedEmails.length} emails failed`
    
    const html = generateAdminAlertHtml(failedEmails)
    
    await sendEmail({
      to: alertConfig.alertEmail,
      subject,
      html
    })
    
    console.log(`✅ Admin alert sent to ${alertConfig.alertEmail}`)
  } catch (error: any) {
    console.error('❌ Failed to send admin alert:', error)
    // Don't throw - we don't want alert failures to break the retry process
  }
}

/**
 * Generate HTML for admin alert email
 */
function generateAdminAlertHtml(failedEmails: EmailRetryResult[]): string {
  const emailRows = failedEmails.map(email => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email.emailLogId}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email.attempts}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email.error || 'Unknown error'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${email.nextRetryAt || 'No more retries'}</td>
    </tr>
  `).join('')
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Delivery Failures Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 20px auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white; }
        th { background-color: #f4f4f4; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Email Delivery Failures</h1>
          <p>Multiple email deliveries have failed</p>
        </div>
        <div class="content">
          <p><strong>Alert Summary:</strong></p>
          <p>${failedEmails.length} email(s) failed to deliver after retry attempts.</p>
          
          <h2>Failed Emails:</h2>
          <table>
            <thead>
              <tr>
                <th>Email Log ID</th>
                <th>Attempts</th>
                <th>Error</th>
                <th>Next Retry</th>
              </tr>
            </thead>
            <tbody>
              ${emailRows}
            </tbody>
          </table>
          
          <p><strong>Action Required:</strong></p>
          <ul>
            <li>Review the email logs in the admin dashboard</li>
            <li>Check email service configuration and status</li>
            <li>Verify recipient email addresses are valid</li>
            <li>Consider manual intervention for critical orders</li>
          </ul>
        </div>
        <div class="footer">
          <p>This is an automated alert from Moldova Direct Email System</p>
          <p>Generated at: ${new Date().toISOString()}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Get retry statistics for monitoring
 */
export async function getRetryStatistics(
  dateFrom?: string,
  dateTo?: string,
  supabaseClient?: any
): Promise<{
  totalRetries: number
  successfulRetries: number
  failedRetries: number
  averageAttempts: number
}> {
  const { resolveSupabaseClient } = await import('./supabaseAdminClient')
  const supabase = resolveSupabaseClient(supabaseClient)
  
  let query = supabase
    .from('email_logs')
    .select('attempts, status')
    .gt('attempts', 0)
  
  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }
  
  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Failed to get retry statistics:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get retry statistics',
      data: error
    })
  }
  
  const totalRetries = data?.length || 0
  const successfulRetries = data?.filter(log => 
    log.status === 'sent' || log.status === 'delivered'
  ).length || 0
  const failedRetries = data?.filter(log => 
    log.status === 'failed' || log.status === 'bounced'
  ).length || 0
  
  const totalAttempts = data?.reduce((sum, log) => sum + log.attempts, 0) || 0
  const averageAttempts = totalRetries > 0 ? totalAttempts / totalRetries : 0
  
  return {
    totalRetries,
    successfulRetries,
    failedRetries,
    averageAttempts: Math.round(averageAttempts * 100) / 100
  }
}

/**
 * Schedule automatic retry processing
 * This should be called from a cron job or scheduled task
 */
export async function scheduleEmailRetries(
  intervalMinutes: number = 5
): Promise<void> {
  console.log(`📅 Scheduling email retries every ${intervalMinutes} minutes`)
  
  // Initial run
  await processEmailRetries()
  
  // Schedule recurring runs
  setInterval(async () => {
    try {
      await processEmailRetries()
    } catch (error) {
      console.error('❌ Scheduled email retry failed:', error)
    }
  }, intervalMinutes * 60 * 1000)
}
