// Carrier tracking integration utilities
// This module provides integration with external carrier tracking APIs

import type { SupabaseClient } from '@supabase/supabase-js'

interface CarrierTrackingEvent {
  timestamp: string
  status: string
  location?: string
  description: string
}

interface CarrierTrackingResponse {
  trackingNumber: string
  carrier: string
  status: string
  estimatedDelivery?: string
  events: CarrierTrackingEvent[]
  lastUpdate: string
}

/**
 * Fetch tracking information from carrier API
 * This is a placeholder implementation that should be extended with actual carrier APIs
 */
export async function fetchCarrierTracking(
  trackingNumber: string,
  carrier: string,
): Promise<CarrierTrackingResponse | null> {
  try {
    // Normalize carrier name
    const normalizedCarrier = carrier.toLowerCase().trim()

    // Route to appropriate carrier handler
    switch (normalizedCarrier) {
      case 'dhl':
        return await fetchDHLTracking(trackingNumber)
      case 'fedex':
        return await fetchFedExTracking(trackingNumber)
      case 'ups':
        return await fetchUPSTracking(trackingNumber)
      case 'usps':
        return await fetchUSPSTracking(trackingNumber)
      case 'posta_moldovei':
      case 'moldova_post':
        return await fetchMoldovaPostTracking(trackingNumber)
      default:
        console.warn(`Unsupported carrier: ${carrier}`)
        return null
    }
  }
  catch (error: unknown) {
    console.error(`Error fetching tracking for ${carrier}:`, getServerErrorMessage(error))
    return null
  }
}

/**
 * DHL tracking integration
 * TODO: Implement actual DHL API integration
 */
async function fetchDHLTracking(_trackingNumber: string): Promise<CarrierTrackingResponse | null> {
  // Placeholder implementation
  // In production, this would call the DHL API

  // Example: const response = await fetch(`https://api.dhl.com/track/${trackingNumber}`, { ... })

  return null
}

/**
 * FedEx tracking integration
 * TODO: Implement actual FedEx API integration
 */
async function fetchFedExTracking(_trackingNumber: string): Promise<CarrierTrackingResponse | null> {
  return null
}

/**
 * UPS tracking integration
 * TODO: Implement actual UPS API integration
 */
async function fetchUPSTracking(_trackingNumber: string): Promise<CarrierTrackingResponse | null> {
  return null
}

/**
 * USPS tracking integration
 * TODO: Implement actual USPS API integration
 */
async function fetchUSPSTracking(_trackingNumber: string): Promise<CarrierTrackingResponse | null> {
  return null
}

/**
 * Moldova Post tracking integration
 * TODO: Implement actual Moldova Post API integration
 */
async function fetchMoldovaPostTracking(_trackingNumber: string): Promise<CarrierTrackingResponse | null> {
  return null
}

/**
 * Sync carrier tracking data to database
 * Fetches latest tracking info from carrier and updates order tracking events
 */
export async function syncCarrierTracking(
  orderId: number,
  trackingNumber: string,
  carrier: string,
  supabase: SupabaseClient,
): Promise<boolean> {
  try {
    // Fetch tracking from carrier
    const carrierData = await fetchCarrierTracking(trackingNumber, carrier)

    if (!carrierData) {
      return false
    }

    // Get existing tracking events
    const { data: existingEvents } = await supabase
      .from('order_tracking_events')
      .select('timestamp, status')
      .eq('order_id', orderId)

    const existingTimestamps = new Set(
      (existingEvents || []).map((e: any) => e.timestamp),
    )

    // Insert new events that don't exist yet
    const newEvents = carrierData.events
      .filter(event => !existingTimestamps.has(event.timestamp))
      .map(event => ({
        order_id: orderId,
        status: event.status,
        location: event.location,
        description: event.description,
        timestamp: event.timestamp,
      }))

    if (newEvents.length > 0) {
      await supabase
        .from('order_tracking_events')
        .insert(newEvents)
    }

    // Update order with latest carrier data
    const updateData: Record<string, any> = {}

    if (carrierData.estimatedDelivery) {
      updateData.estimated_delivery = carrierData.estimatedDelivery
    }

    if (carrierData.status === 'delivered') {
      updateData.status = 'delivered'
      updateData.delivered_at = carrierData.lastUpdate
    }
    else if (carrierData.status === 'in_transit' || carrierData.status === 'out_for_delivery') {
      updateData.status = 'shipped'
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
    }

    return true
  }
  catch (error: unknown) {
    console.error('Error syncing carrier tracking:', getServerErrorMessage(error))
    return false
  }
}

/**
 * Validate tracking number format for a given carrier
 */
export function validateTrackingNumber(trackingNumber: string, carrier: string): boolean {
  const normalizedCarrier = carrier.toLowerCase().trim()

  // Basic validation patterns for common carriers
  const patterns: Record<string, RegExp> = {
    dhl: /^[0-9]{10,11}$/,
    fedex: /^[0-9]{12,14}$/,
    ups: /^1Z[A-Z0-9]{16}$/,
    usps: /^[0-9]{20,22}$/,
    posta_moldovei: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
    moldova_post: /^[A-Z]{2}[0-9]{9}[A-Z]{2}$/,
  }

  const pattern = patterns[normalizedCarrier]
  if (!pattern) {
    // If no pattern defined, accept any non-empty string
    return trackingNumber.length > 0
  }

  return pattern.test(trackingNumber)
}
