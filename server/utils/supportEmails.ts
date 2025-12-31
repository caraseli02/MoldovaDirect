/**
 * Support Ticket Email Utilities
 * Utilities for sending support ticket-related emails
 */

import { sendEmail } from './email'
import {
  generateCustomerConfirmationTemplate,
  generateStaffNotificationTemplate,
  getSupportTicketSubject,
  type SupportTicketData,
} from './emailTemplates/supportTicketTemplates'
import { createEmailLog, recordEmailAttempt } from './emailLogging'
import { resolveSupabaseClient, type ResolvedSupabaseClient } from './supabaseAdminClient'
import { shouldSendEmail } from './emailPreferences'
import type { EmailSendResult } from './types/email'

interface EmailSendOptions {
  supabaseClient?: ResolvedSupabaseClient
}

/**
 * Send support ticket customer confirmation email
 */
export async function sendSupportTicketCustomerEmail(
  data: SupportTicketData,
  ticketId: number,
  orderId?: number,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  const supabase = resolveSupabaseClient(options.supabaseClient)

  // Determine userId if order is linked
  let userId: string | undefined
  if (orderId && orderId > 0) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single()
    userId = orderData?.user_id || undefined
  }

  // Check if user has opted out of support ticket emails
  const shouldSend = await shouldSendEmail(
    'support_ticket_customer',
    userId,
    userId ? undefined : data.customerEmail,
    supabase,
  )

  if (!shouldSend) {
    return {
      success: true,
      emailLogId: -1,
      error: 'User opted out of email notifications',
    }
  }

  const subject = getSupportTicketSubject('customer', data.ticketNumber, data.priority, data.locale)

  // Create email log entry (use orderId if available, otherwise use -1 as placeholder)
  const emailLog = await createEmailLog({
    orderId: orderId || -1,
    emailType: 'support_ticket_customer',
    recipientEmail: data.customerEmail,
    subject,
    metadata: {
      locale: data.locale,
      ticketId,
      ticketNumber: data.ticketNumber,
      customerName: data.customerName,
      templateVersion: '1.0',
    },
  }, supabase)

  try {
    // Generate email HTML
    const html = generateCustomerConfirmationTemplate(data)

    // Send email
    const result = await sendEmail({
      to: data.customerEmail,
      subject,
      html,
    })

    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase,
    )

    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id,
    }
  }
  catch (error: unknown) {
    console.error(`❌ Failed to send support ticket customer email for ticket ${data.ticketNumber}:`, getServerErrorMessage(error))

    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      getServerErrorMessage(error),
      supabase,
    )

    return {
      success: false,
      emailLogId: emailLog.id,
      error: getServerErrorMessage(error),
    }
  }
}

/**
 * Send support ticket staff notification email
 */
export async function sendSupportTicketStaffEmail(
  data: SupportTicketData,
  ticketId: number,
  staffEmail: string,
  orderId?: number,
  options: EmailSendOptions = {},
): Promise<EmailSendResult> {
  const supabase = resolveSupabaseClient(options.supabaseClient)

  const subject = getSupportTicketSubject('staff', data.ticketNumber, data.priority, data.locale)

  // Create email log entry (use orderId if available, otherwise use -1 as placeholder)
  const emailLog = await createEmailLog({
    orderId: orderId || -1,
    emailType: 'support_ticket_staff',
    recipientEmail: staffEmail,
    subject,
    metadata: {
      locale: data.locale,
      ticketId,
      ticketNumber: data.ticketNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      templateVersion: '1.0',
    },
  }, supabase)

  try {
    // Generate email HTML
    const html = generateStaffNotificationTemplate(data)

    // Send email
    const result = await sendEmail({
      to: staffEmail,
      subject,
      html,
    })

    // Record successful attempt
    await recordEmailAttempt(
      emailLog.id,
      true,
      result.id,
      undefined,
      supabase,
    )

    return {
      success: true,
      emailLogId: emailLog.id,
      externalId: result.id,
    }
  }
  catch (error: unknown) {
    console.error(`❌ Failed to send support ticket staff email for ticket ${data.ticketNumber}:`, getServerErrorMessage(error))

    // Record failed attempt
    await recordEmailAttempt(
      emailLog.id,
      false,
      undefined,
      getServerErrorMessage(error),
      supabase,
    )

    return {
      success: false,
      emailLogId: emailLog.id,
      error: getServerErrorMessage(error),
    }
  }
}
