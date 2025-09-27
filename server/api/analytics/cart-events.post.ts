/**
 * Cart Analytics Events API Endpoint
 * 
 * Requirements addressed:
 * - Store cart analytics events from client-side tracking
 * - Process cart abandonment data
 * - Handle cart conversion metrics
 * 
 * Receives and processes comprehensive cart analytics data.
 */

import { createClient } from '@supabase/supabase-js'

interface CartAnalyticsEvent {
  eventType: 'cart_add' | 'cart_remove' | 'cart_update' | 'cart_view' | 'cart_abandon' | 'cart_checkout_start' | 'cart_checkout_complete'
  sessionId: string
  timestamp: string
  cartValue: number
  itemCount: number
  productDetails?: {
    id: string
    name: string
    price: number
    category?: string
    quantity: number
  }
  metadata?: Record<string, any>
}

interface CartConversionMetrics {
  sessionId: string
  cartCreatedAt: string
  cartValue: number
  itemCount: number
  timeToConversion?: number
  conversionStage: 'cart_created' | 'checkout_started' | 'checkout_completed'
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

interface CartAbandonmentData {
  sessionId: string
  cartValue: number
  itemCount: number
  timeSpentInCart: number
  lastActivity: string
  abandonmentStage: 'cart_view' | 'quantity_change' | 'checkout_start' | 'checkout_process'
  products: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { events = [], conversions = [], abandonments = [] } = body

    if (!events.length && !conversions.length && !abandonments.length) {
      return { success: true, message: 'No data to process' }
    }

    const supabase = createClient(
      useRuntimeConfig().public.supabaseUrl,
      useRuntimeConfig().supabaseServiceKey
    )

    const results = {
      eventsProcessed: 0,
      conversionsProcessed: 0,
      abandonmentsProcessed: 0,
      errors: [] as string[]
    }

    // Process cart events
    if (events.length > 0) {
      try {
        const cartEvents = events.map((event: CartAnalyticsEvent) => ({
          session_id: event.sessionId,
          event_type: event.eventType,
          timestamp: event.timestamp,
          cart_value: event.cartValue,
          item_count: event.itemCount,
          product_id: event.productDetails?.id || null,
          product_name: event.productDetails?.name || null,
          product_price: event.productDetails?.price || null,
          product_category: event.productDetails?.category || null,
          product_quantity: event.productDetails?.quantity || null,
          metadata: event.metadata || {}
        }))

        const { error: eventsError } = await supabase
          .from('cart_analytics_events')
          .insert(cartEvents)

        if (eventsError) {
          results.errors.push(`Events error: ${eventsError.message}`)
        } else {
          results.eventsProcessed = cartEvents.length
        }
      } catch (error) {
        results.errors.push(`Events processing error: ${error.message}`)
      }
    }

    // Process conversion metrics
    if (conversions.length > 0) {
      try {
        const conversionMetrics = conversions.map((conversion: CartConversionMetrics) => ({
          session_id: conversion.sessionId,
          cart_created_at: conversion.cartCreatedAt,
          cart_value: conversion.cartValue,
          item_count: conversion.itemCount,
          time_to_conversion: conversion.timeToConversion || null,
          conversion_stage: conversion.conversionStage,
          products: conversion.products
        }))

        const { error: conversionsError } = await supabase
          .from('cart_conversion_metrics')
          .insert(conversionMetrics)

        if (conversionsError) {
          results.errors.push(`Conversions error: ${conversionsError.message}`)
        } else {
          results.conversionsProcessed = conversionMetrics.length
        }
      } catch (error) {
        results.errors.push(`Conversions processing error: ${error.message}`)
      }
    }

    // Process abandonment data
    if (abandonments.length > 0) {
      try {
        const abandonmentData = abandonments.map((abandonment: CartAbandonmentData) => ({
          session_id: abandonment.sessionId,
          cart_value: abandonment.cartValue,
          item_count: abandonment.itemCount,
          time_spent_in_cart: abandonment.timeSpentInCart,
          last_activity: abandonment.lastActivity,
          abandonment_stage: abandonment.abandonmentStage,
          products: abandonment.products
        }))

        const { error: abandonmentsError } = await supabase
          .from('cart_abandonment_data')
          .insert(abandonmentData)

        if (abandonmentsError) {
          results.errors.push(`Abandonments error: ${abandonmentsError.message}`)
        } else {
          results.abandonmentsProcessed = abandonmentData.length
        }
      } catch (error) {
        results.errors.push(`Abandonments processing error: ${error.message}`)
      }
    }

    // Update daily analytics with cart metrics
    await updateDailyCartAnalytics(supabase, events, conversions, abandonments)

    return {
      success: results.errors.length === 0,
      results,
      message: results.errors.length > 0 
        ? `Processed with ${results.errors.length} errors`
        : 'All cart analytics data processed successfully'
    }

  } catch (error) {
    console.error('Cart analytics processing error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process cart analytics data'
    })
  }
})

// Update daily analytics with cart-specific metrics
async function updateDailyCartAnalytics(
  supabase: any,
  events: CartAnalyticsEvent[],
  conversions: CartConversionMetrics[],
  abandonments: CartAbandonmentData[]
) {
  try {
    // Group events by date
    const eventsByDate = new Map<string, {
      cartAdds: number
      cartViews: number
      checkoutStarts: number
      checkoutCompletes: number
      cartValue: number
      abandonments: number
    }>()

    // Process events
    events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      
      if (!eventsByDate.has(date)) {
        eventsByDate.set(date, {
          cartAdds: 0,
          cartViews: 0,
          checkoutStarts: 0,
          checkoutCompletes: 0,
          cartValue: 0,
          abandonments: 0
        })
      }

      const dayData = eventsByDate.get(date)!
      
      switch (event.eventType) {
        case 'cart_add':
          dayData.cartAdds++
          break
        case 'cart_view':
          dayData.cartViews++
          break
        case 'cart_checkout_start':
          dayData.checkoutStarts++
          break
        case 'cart_checkout_complete':
          dayData.checkoutCompletes++
          dayData.cartValue += event.cartValue
          break
        case 'cart_abandon':
          dayData.abandonments++
          break
      }
    })

    // Process abandonments
    abandonments.forEach(abandonment => {
      const date = new Date(abandonment.lastActivity).toISOString().split('T')[0]
      
      if (!eventsByDate.has(date)) {
        eventsByDate.set(date, {
          cartAdds: 0,
          cartViews: 0,
          checkoutStarts: 0,
          checkoutCompletes: 0,
          cartValue: 0,
          abandonments: 0
        })
      }

      eventsByDate.get(date)!.abandonments++
    })

    // Update or insert daily analytics
    for (const [date, data] of eventsByDate) {
      const { error } = await supabase
        .from('daily_cart_analytics')
        .upsert({
          date,
          cart_additions: data.cartAdds,
          cart_views: data.cartViews,
          checkout_starts: data.checkoutStarts,
          checkout_completions: data.checkoutCompletes,
          cart_abandonment_count: data.abandonments,
          total_cart_value: data.cartValue,
          conversion_rate: data.checkoutStarts > 0 ? (data.checkoutCompletes / data.checkoutStarts) * 100 : 0,
          abandonment_rate: (data.cartAdds + data.cartViews) > 0 ? (data.abandonments / (data.cartAdds + data.cartViews)) * 100 : 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'date'
        })

      if (error) {
        console.error(`Failed to update daily cart analytics for ${date}:`, error)
      }
    }

  } catch (error) {
    console.error('Failed to update daily cart analytics:', error)
  }
}