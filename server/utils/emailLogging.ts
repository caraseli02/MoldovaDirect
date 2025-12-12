// =============================================
// EMAIL LOGGING UTILITIES
// =============================================
// Utilities for logging email delivery attempts and status
// Requirements: 4.1, 4.2, 4.3

import type {
  EmailLog,
  CreateEmailLogInput,
  UpdateEmailLogInput,
  EmailLogFilters,
  EmailLogListResponse,
  EmailDeliveryStats,
  EmailRetryConfig,
} from '~/types/email'
import { DEFAULT_EMAIL_RETRY_CONFIG, shouldRetryEmail } from '~/types/email'
import { resolveSupabaseClient, type ResolvedSupabaseClient } from './supabaseAdminClient'

/**
 * Create a new email log entry
 */
export async function createEmailLog(
  input: CreateEmailLogInput,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const { data, error } = await supabase
    .from('email_logs')
    .insert({
      order_id: input.orderId,
      email_type: input.emailType,
      recipient_email: input.recipientEmail,
      subject: input.subject,
      status: 'pending',
      attempts: 0,
      metadata: input.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create email log:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create email log',
      data: error,
    })
  }

  return transformEmailLogFromDb(data)
}

/**
 * Update an existing email log entry
 */
export async function updateEmailLog(
  id: number,
  input: UpdateEmailLogInput,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const updateData = {}

  if (input.status) updateData.status = input.status
  if (input.attempts !== undefined) updateData.attempts = input.attempts
  if (input.lastAttemptAt) updateData.last_attempt_at = input.lastAttemptAt
  if (input.deliveredAt) updateData.delivered_at = input.deliveredAt
  if (input.bounceReason) updateData.bounce_reason = input.bounceReason
  if (input.externalId) updateData.external_id = input.externalId
  if (input.metadata) updateData.metadata = input.metadata

  const { data, error } = await supabase
    .from('email_logs')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update email log:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update email log',
      data: error,
    })
  }

  return transformEmailLogFromDb(data)
}

/**
 * Get email log by ID
 */
export async function getEmailLog(
  id: number,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const { data, error } = await supabase
    .from('email_logs')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to get email log:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get email log',
      data: error,
    })
  }

  return transformEmailLogFromDb(data)
}

/**
 * Get email logs with filters and pagination
 */
export async function getEmailLogs(
  filters: EmailLogFilters = {},
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLogListResponse> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const page = filters.page || 1
  const limit = filters.limit || 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('email_logs')
    .select(`
      *,
      order:orders!inner(
        order_number,
        status,
        total_eur,
        created_at
      )
    `, { count: 'exact' })

  // Apply filters
  if (filters.orderId) {
    query = query.eq('order_id', filters.orderId)
  }

  if (filters.orderNumber) {
    query = query.eq('order.order_number', filters.orderNumber)
  }

  if (filters.recipientEmail) {
    query = query.ilike('recipient_email', `%${filters.recipientEmail}%`)
  }

  if (filters.emailType) {
    query = query.eq('email_type', filters.emailType)
  }

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  // Apply pagination and ordering
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to get email logs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get email logs',
      data: error,
    })
  }

  const logs = (data || []).map(transformEmailLogWithOrderFromDb)
  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

/**
 * Get email delivery statistics
 */
export async function getEmailDeliveryStats(
  dateFrom?: string,
  dateTo?: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailDeliveryStats> {
  const supabase = resolveSupabaseClient(supabaseClient)

  let query = supabase
    .from('email_logs')
    .select('status')

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to get email stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get email stats',
      data: error,
    })
  }

  const total = data?.length || 0
  const sent = data?.filter((log: { status: string }) => log.status === 'sent').length || 0
  const delivered = data?.filter((log: { status: string }) => log.status === 'delivered').length || 0
  const failed = data?.filter((log: { status: string }) => log.status === 'failed').length || 0
  const bounced = data?.filter((log: { status: string }) => log.status === 'bounced').length || 0

  const deliveryRate = total > 0 ? (delivered / total) * 100 : 0
  const bounceRate = total > 0 ? (bounced / total) * 100 : 0

  return {
    total,
    sent,
    delivered,
    failed,
    bounced,
    deliveryRate: Math.round(deliveryRate * 100) / 100,
    bounceRate: Math.round(bounceRate * 100) / 100,
  }
}

/**
 * Record email send attempt
 */
export async function recordEmailAttempt(
  emailLogId: number,
  success: boolean,
  externalId?: string,
  bounceReason?: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog> {
  const emailLog = await getEmailLog(emailLogId, supabaseClient)

  if (!emailLog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Email log not found',
    })
  }

  const attempts = emailLog.attempts + 1
  const now = new Date().toISOString()

  const updateData: UpdateEmailLogInput = {
    attempts,
    lastAttemptAt: now,
  }

  if (success) {
    updateData.status = 'sent'
    updateData.deliveredAt = now
    if (externalId) {
      updateData.externalId = externalId
    }
  }
  else {
    // Check if we should retry
    const config: EmailRetryConfig = DEFAULT_EMAIL_RETRY_CONFIG
    if (shouldRetryEmail(attempts, config)) {
      updateData.status = 'pending'
    }
    else {
      updateData.status = 'failed'
    }

    if (bounceReason) {
      updateData.bounceReason = bounceReason
    }
  }

  return updateEmailLog(emailLogId, updateData, supabaseClient)
}

/**
 * Mark email as delivered (webhook callback)
 */
export async function markEmailDelivered(
  externalId: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const { data, error } = await supabase
    .from('email_logs')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
    })
    .eq('external_id', externalId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to mark email as delivered:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark email as delivered',
      data: error,
    })
  }

  return transformEmailLogFromDb(data)
}

/**
 * Mark email as bounced (webhook callback)
 */
export async function markEmailBounced(
  externalId: string,
  bounceReason: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailLog | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const { data, error } = await supabase
    .from('email_logs')
    .update({
      status: 'bounced',
      bounce_reason: bounceReason,
    })
    .eq('external_id', externalId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to mark email as bounced:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark email as bounced',
      data: error,
    })
  }

  return transformEmailLogFromDb(data)
}

/**
 * Get pending emails for retry
 */
export async function getPendingEmailsForRetry(): Promise<EmailLog[]> {
  const supabase = resolveSupabaseClient()

  const config: EmailRetryConfig = DEFAULT_EMAIL_RETRY_CONFIG

  const { data, error } = await supabase
    .from('email_logs')
    .select()
    .eq('status', 'pending')
    .lt('attempts', config.maxAttempts)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) {
    console.error('Failed to get pending emails:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get pending emails',
      data: error,
    })
  }

  return (data || []).map(transformEmailLogFromDb)
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Transform database record to EmailLog type
 */
function transformEmailLogFromDb(data: any): EmailLog {
  return {
    id: data.id,
    orderId: data.order_id,
    emailType: data.email_type,
    recipientEmail: data.recipient_email,
    subject: data.subject,
    status: data.status,
    attempts: data.attempts,
    lastAttemptAt: data.last_attempt_at,
    deliveredAt: data.delivered_at,
    bounceReason: data.bounce_reason,
    externalId: data.external_id,
    metadata: data.metadata || {},
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}

/**
 * Transform database record with order to EmailLogWithOrder type
 */
function transformEmailLogWithOrderFromDb(data: any): unknown {
  return {
    ...transformEmailLogFromDb(data),
    order: {
      orderNumber: data.order.order_number,
      status: data.order.status,
      totalEur: data.order.total_eur,
      createdAt: data.order.created_at,
    },
  }
}
