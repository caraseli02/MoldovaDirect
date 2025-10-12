import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '~/server/utils/orderEmails'
import { transformOrderToEmailData } from '~/server/utils/orderDataTransform'
import type { EmailType } from '~/types/email'
import type { DatabaseOrder } from '~/server/utils/emailTemplates/types'

interface SendTestEmailRequest {
  email: string
  type: EmailType
  locale?: string
  issueDescription?: string
}

const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  order_confirmation: 'Order Confirmation',
  order_processing: 'Order Processing',
  order_shipped: 'Order Shipped',
  order_delivered: 'Order Delivered',
  order_cancelled: 'Order Cancelled',
  order_issue: 'Order Issue'
}

const STATUS_BY_EMAIL_TYPE: Partial<Record<EmailType, string>> = {
  order_confirmation: 'processing',
  order_processing: 'processing',
  order_shipped: 'shipped',
  order_delivered: 'delivered',
  order_cancelled: 'cancelled',
  order_issue: 'processing'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as SendTestEmailRequest

  if (!body?.email || !body.type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email address and type are required'
    })
  }

  const trimmedEmail = body.email.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address'
    })
  }

  const locale = body.locale || 'en'
  const issueDescription = body.type === 'order_issue' ? body.issueDescription || 'Test issue details for QA.' : undefined

  const runtimeConfig = useRuntimeConfig()
  const supabase = createClient(
    runtimeConfig.public.supabaseUrl,
    runtimeConfig.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  let createdOrderId: number | null = null

  try {
    // Create a synthetic order for template rendering and logging
    const orderNumber = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const shippingAddress = {
      firstName: 'Test',
      lastName: 'User',
      street: 'Strada Bulevardului 123',
      city: 'Chișinău',
      postalCode: 'MD-2001',
      province: 'Chișinău Municipality',
      country: 'Moldova',
      phone: '+373 60 123 456'
    }

    const billingAddress = {
      firstName: 'Test',
      lastName: 'User',
      street: 'Calle de Alcalá 45',
      city: 'Madrid',
      postalCode: '28014',
      province: 'Madrid',
      country: 'Spain',
      phone: '+34 600 123 456'
    }

    const subtotal = 64.5
    const shippingCost = 7.5
    const tax = 13.55
    const total = subtotal + shippingCost + tax

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        status: 'processing',
        payment_method: 'cod',
        payment_status: 'paid',
        payment_intent_id: `test_${Date.now()}`,
        subtotal_eur: subtotal,
        shipping_cost_eur: shippingCost,
        tax_eur: tax,
        total_eur: total,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        guest_email: trimmedEmail,
        customer_notes: 'Generated via email testing playground.'
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create test order:', orderError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create test order'
      })
    }

    createdOrderId = order.id

    const mockItems = [
      {
        order_id: order.id,
        product_id: null,
        product_snapshot: {
          sku: 'MD-WINE-TEST',
          name: 'Purcari Cabernet Sauvignon (Test)',
          name_translations: {
            en: 'Purcari Cabernet Sauvignon (Test)',
            es: 'Purcari Cabernet Sauvignon (Prueba)',
            ro: 'Purcari Cabernet Sauvignon (Test)',
            ru: 'Пуркари Каберне Совиньон (Тест)'
          },
          images: [
            {
              url: 'https://images.moldovadirect.test/products/wine-cabernet.png'
            }
          ],
          attributes: {
            volume: '750 ml',
            vintage: '2021'
          }
        },
        quantity: 2,
        price_eur: 21.5,
        total_eur: 43.0
      },
      {
        order_id: order.id,
        product_id: null,
        product_snapshot: {
          sku: 'MD-HONEY-TEST',
          name: 'Moldovan Forest Honey (Test)',
          name_translations: {
            en: 'Moldovan Forest Honey (Test)',
            es: 'Miel de Bosque Moldava (Prueba)',
            ro: 'Miere de Pădure din Moldova (Test)',
            ru: 'Молдавский лесной мед (Тест)'
          },
          images: [
            {
              url: 'https://images.moldovadirect.test/products/honey-forest.png'
            }
          ],
          attributes: {
            weight: '500 g',
            source: 'Codru Forest'
          }
        },
        quantity: 1,
        price_eur: 21.5,
        total_eur: 21.5
      }
    ]

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(mockItems)

    if (itemsError) {
      console.error('Failed to create test order items:', itemsError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create test order items'
      })
    }

    const { data: orderWithItems, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_snapshot,
          quantity,
          price_eur,
          total_eur
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError || !orderWithItems) {
      console.error('Failed to fetch test order with items:', fetchError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load test order data'
      })
    }

    // Generate email payload using existing transformers
    const derivedStatus = STATUS_BY_EMAIL_TYPE[body.type] || 'processing'
    const now = Date.now()

    const shouldIncludeTracking = ['order_shipped', 'order_delivered'].includes(body.type)
    const enrichedOrder = {
      ...orderWithItems,
      status: derivedStatus,
      estimated_delivery: orderWithItems.estimated_delivery || new Date(now + 4 * 24 * 60 * 60 * 1000).toISOString(),
      tracking_number: shouldIncludeTracking ? (orderWithItems.tracking_number || 'MDX-TEST-TRACK-001') : null,
      carrier: shouldIncludeTracking ? (orderWithItems.carrier || 'Moldova Direct Courier') : null
    } as DatabaseOrder

    const emailData = transformOrderToEmailData(
      enrichedOrder,
      `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      trimmedEmail,
      locale
    )

    let result

    if (body.type === 'order_confirmation') {
      result = await sendOrderConfirmationEmail(emailData, { supabaseClient: supabase })
    } else {
      result = await sendOrderStatusEmail(emailData, body.type, issueDescription, { supabaseClient: supabase })
    }

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Failed to send test email'
      })
    }

    return {
      success: true,
      subject: EMAIL_TYPE_LABELS[body.type],
      orderNumber,
      emailLogId: result.emailLogId,
      externalId: result.externalId
    }
  } finally {
    if (createdOrderId) {
      const { error: cleanupError } = await supabase
        .from('orders')
        .delete()
        .eq('id', createdOrderId)

      if (cleanupError) {
        console.error('Failed to purge test order:', cleanupError)
      }
    }
  }
})
