/**
 * Email Notification Preferences Utilities
 * Functions for managing and checking user email preferences
 */

import type { EmailType } from '~/types/email'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveSupabaseClient, type ResolvedSupabaseClient } from './supabaseAdminClient'

export interface EmailPreferences {
  id: number
  userId?: string
  guestEmail?: string
  orderConfirmation: boolean
  orderStatusUpdates: boolean
  orderShipped: boolean
  orderDelivered: boolean
  supportTickets: boolean
  marketing: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateEmailPreferencesInput {
  userId?: string
  guestEmail?: string
  orderConfirmation?: boolean
  orderStatusUpdates?: boolean
  orderShipped?: boolean
  orderDelivered?: boolean
  supportTickets?: boolean
  marketing?: boolean
}

/**
 * Get email preferences for a user or guest
 */
export async function getEmailPreferences(
  userId?: string,
  guestEmail?: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailPreferences | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  if (!userId && !guestEmail) {
    return null
  }

  let query = supabase.from('email_preferences').select('*')

  if (userId) {
    query = query.eq('user_id', userId)
  }
  else if (guestEmail) {
    query = query.eq('guest_email', guestEmail)
  }

  const { data, error } = await query.single()

  if (error) {
    // If no preferences found, return null (will use defaults)
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching email preferences:', error)
    return null
  }

  return data as EmailPreferences
}

/**
 * Create default email preferences for a user or guest
 */
export async function createEmailPreferences(
  input: CreateEmailPreferencesInput,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailPreferences | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  const { data, error } = await supabase
    .from('email_preferences')
    .insert({
      user_id: input.userId || null,
      guest_email: input.guestEmail || null,
      order_confirmation: input.orderConfirmation ?? true,
      order_status_updates: input.orderStatusUpdates ?? true,
      order_shipped: input.orderShipped ?? true,
      order_delivered: input.orderDelivered ?? true,
      support_tickets: input.supportTickets ?? true,
      marketing: input.marketing ?? false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating email preferences:', error)
    return null
  }

  return data as EmailPreferences
}

/**
 * Update email preferences
 */
export async function updateEmailPreferences(
  userId: string | undefined,
  guestEmail: string | undefined,
  preferences: Partial<CreateEmailPreferencesInput>,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailPreferences | null> {
  const supabase = resolveSupabaseClient(supabaseClient)

  if (!userId && !guestEmail) {
    return null
  }

  let query = supabase.from('email_preferences').update({
    order_confirmation: preferences.orderConfirmation,
    order_status_updates: preferences.orderStatusUpdates,
    order_shipped: preferences.orderShipped,
    order_delivered: preferences.orderDelivered,
    support_tickets: preferences.supportTickets,
    marketing: preferences.marketing,
  })

  if (userId) {
    query = query.eq('user_id', userId)
  }
  else if (guestEmail) {
    query = query.eq('guest_email', guestEmail)
  }

  const { data, error } = await query.select().single()

  if (error) {
    console.error('Error updating email preferences:', error)
    return null
  }

  return data as EmailPreferences
}

/**
 * Check if a specific email type should be sent based on user preferences
 * Returns true if email should be sent, false if user opted out
 */
export async function shouldSendEmail(
  emailType: EmailType,
  userId?: string,
  guestEmail?: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<boolean> {
  // Get user preferences
  const preferences = await getEmailPreferences(userId, guestEmail, supabaseClient)

  // If no preferences found, default to sending emails (opt-in by default)
  if (!preferences) {
    return true
  }

  // Map email type to preference field
  switch (emailType) {
    case 'order_confirmation':
      return preferences.orderConfirmation

    case 'order_processing':
    case 'order_cancelled':
    case 'order_issue':
      return preferences.orderStatusUpdates

    case 'order_shipped':
      return preferences.orderShipped

    case 'order_delivered':
      return preferences.orderDelivered

    case 'support_ticket_customer':
    case 'support_ticket_staff':
      return preferences.supportTickets

    default:
      // Default to true for unknown types
      return true
  }
}

/**
 * Get or create email preferences for a user/guest
 * Ensures preferences exist and returns them
 */
export async function getOrCreateEmailPreferences(
  userId?: string,
  guestEmail?: string,
  supabaseClient?: ResolvedSupabaseClient,
): Promise<EmailPreferences | null> {
  // Try to get existing preferences
  let preferences = await getEmailPreferences(userId, guestEmail, supabaseClient)

  // If no preferences exist, create defaults
  if (!preferences) {
    preferences = await createEmailPreferences(
      { userId, guestEmail },
      supabaseClient,
    )
  }

  return preferences
}
