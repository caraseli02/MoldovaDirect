/**
 * Generate email template preview
 * Requirements: 5.2
 */

import {
  orderConfirmation,
  type OrderEmailData,
} from '~/server/utils/emailTemplates'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { type, locale, translations, subject, preheader } = body

  if (!type || !locale) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Template type and locale are required'
    })
  }

  // Create sample order data for preview
  const sampleData: OrderEmailData = {
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    orderNumber: 'ORD-2024-001',
    orderDate: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    orderItems: [
      {
        productId: '1',
        name: 'Sample Product 1',
        sku: 'SKU-001',
        quantity: 2,
        price: 29.99,
        total: 59.98,
        image: 'https://via.placeholder.com/80'
      },
      {
        productId: '2',
        name: 'Sample Product 2',
        sku: 'SKU-002',
        quantity: 1,
        price: 49.99,
        total: 49.99
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Main Street',
      city: 'Chisinau',
      postalCode: 'MD-2001',
      province: '',
      country: 'Moldova',
      phone: '+373 69 123 456'
    },
    subtotal: 109.97,
    shippingCost: 10.00,
    tax: 12.00,
    total: 131.97,
    paymentMethod: 'credit_card',
    locale,
    orderStatus: 'pending',
    trackingNumber: 'TRACK123456789',
    trackingUrl: 'https://example.com/track/TRACK123456789',
    carrier: 'DHL'
  }

  // Generate HTML preview
  const html = orderConfirmation.generateOrderConfirmationTemplate(sampleData)

  return {
    html,
    subject,
    preheader
  }
})
