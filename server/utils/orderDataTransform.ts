// =============================================
// ORDER DATA TRANSFORMATION UTILITIES
// =============================================
// Functions to transform order database records into email template data
// Requirements: 1.2, 1.3, 1.4, 1.5

import type {
  OrderEmailData,
  OrderItemData,
  AddressData,
  DatabaseOrder,
  UserProfile,
  GuestCheckoutData,
} from './emailTemplates/types'

/**
 * Transform database order to OrderEmailData format for email templates
 * Requirements: 1.2, 1.3, 1.4, 1.5
 *
 * @param order - Database order record with items
 * @param customerName - Customer full name
 * @param customerEmail - Customer email address
 * @param locale - Customer preferred locale (es, en, ro, ru)
 * @returns Formatted order data for email templates
 */
export function transformOrderToEmailData(
  order: DatabaseOrder,
  customerName: string,
  customerEmail: string,
  locale: string = 'en',
): OrderEmailData {
  // Transform order items with product details and pricing
  const orderItems = transformOrderItems(order.order_items || [], locale)

  // Transform shipping address
  const shippingAddress = transformAddress(order.shipping_address)

  // Transform billing address if present, otherwise use shipping address
  const billingAddress = order.billing_address
    ? transformAddress(order.billing_address)
    : undefined

  // Generate tracking URL if tracking number exists
  const trackingUrl = order.tracking_number
    ? generateTrackingUrl(order.tracking_number, order.carrier)
    : undefined

  return {
    customerName,
    customerEmail,
    orderNumber: order.order_number,
    orderDate: order.created_at,
    estimatedDelivery: order.estimated_delivery,
    orderItems,
    shippingAddress,
    billingAddress,
    subtotal: order.subtotal_eur,
    shippingCost: order.shipping_cost_eur,
    tax: order.tax_eur,
    total: order.total_eur,
    paymentMethod: order.payment_method,
    trackingNumber: order.tracking_number,
    trackingUrl,
    carrier: order.carrier,
    locale,
    orderStatus: order.status,
    customerNotes: order.customer_notes,
  }
}

/**
 * Transform order items with product details and pricing
 * Requirements: 1.3
 *
 * @param items - Database order items
 * @param locale - Customer preferred locale
 * @returns Formatted order items for email display
 */
export function transformOrderItems(
  items: unknown[],
  locale: string = 'en',
): OrderItemData[] {
  return items.map((item) => {
    const snapshot = item.product_snapshot || {}

    // Extract product name from translations
    const nameTranslations = snapshot.name_translations || snapshot.nameTranslations || {}
    const productName = nameTranslations[locale] || nameTranslations.en || snapshot.name || 'Product'

    // Extract product image
    const images = snapshot.images || []
    const primaryImage = snapshot.primaryImage || images[0]
    const imageUrl = primaryImage?.url || primaryImage

    return {
      productId: item.product_id?.toString() || '',
      name: productName,
      sku: snapshot.sku || '',
      quantity: item.quantity,
      price: item.price_eur,
      total: item.total_eur,
      image: imageUrl,
      attributes: snapshot.attributes || {},
    }
  })
}

/**
 * Transform address data to consistent format
 * Requirements: 1.4
 *
 * @param address - Raw address data from database
 * @returns Formatted address data
 */
export function transformAddress(address: unknown): AddressData {
  if (!address) {
    return {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',
    }
  }

  return {
    firstName: address.firstName || address.first_name || '',
    lastName: address.lastName || address.last_name || '',
    street: address.street || address.address || '',
    city: address.city || '',
    postalCode: address.postalCode || address.postal_code || address.zipCode || address.zip_code || '',
    province: address.province || address.state || address.region || '',
    country: address.country || '',
    phone: address.phone || address.phoneNumber || address.phone_number || '',
  }
}

/**
 * Extract customer information from authenticated user
 * Requirements: 1.2
 *
 * @param user - User profile from database
 * @returns Customer name, email, and locale
 */
export function extractCustomerInfoFromUser(user: UserProfile): {
  name: string
  email: string
  locale: string
} {
  const fullName = user.full_name || user.email.split('@')[0] || ''
  const locale = user.preferred_locale || 'en'

  return {
    name: fullName,
    email: user.email || '',
    locale,
  }
}

/**
 * Extract customer information from guest checkout data
 * Requirements: 1.2
 *
 * @param guestData - Guest checkout information
 * @returns Customer name, email, and locale
 */
export function extractCustomerInfoFromGuest(guestData: GuestCheckoutData): {
  name: string
  email: string
  locale: string
} {
  const fullName = `${guestData.firstName} ${guestData.lastName}`.trim()
  const locale = guestData.locale || 'en'

  return {
    name: fullName || guestData.email.split('@')[0] || '',
    email: guestData.email || '',
    locale,
  }
}

/**
 * Extract customer information from order record
 * Handles both authenticated users and guest checkout
 * Requirements: 1.2, 1.6
 *
 * @param order - Database order record
 * @param userProfile - Optional user profile if authenticated
 * @returns Customer name, email, and locale
 */
export async function extractCustomerInfoFromOrder(
  order: DatabaseOrder,
  userProfile?: UserProfile,
): Promise<{
  name: string
  email: string
  locale: string
}> {
  // If user profile is provided (authenticated user)
  if (userProfile) {
    return extractCustomerInfoFromUser(userProfile)
  }

  // Guest checkout - extract from shipping address and guest email
  const shippingAddr = order.shipping_address || {}
  const firstName = shippingAddr.firstName || shippingAddr.first_name || ''
  const lastName = shippingAddr.lastName || shippingAddr.last_name || ''
  const fullName = `${firstName} ${lastName}`.trim()
  const email = order.guest_email || ''

  // Try to detect locale from order data or default to 'en'
  const locale = shippingAddr.locale || 'en'

  return {
    name: fullName || email.split('@')[0] || '',
    email: email || '',
    locale,
  }
}

/**
 * Format payment method for display
 * Requirements: 1.5
 *
 * @param paymentMethod - Raw payment method value
 * @returns Formatted payment method string
 */
export function formatPaymentMethod(paymentMethod: string): string {
  const methodMap: Record<string, string> = {
    credit_card: 'Credit Card',
    paypal: 'PayPal',
    bank_transfer: 'Bank Transfer',
    debit_card: 'Debit Card',
  }

  return methodMap[paymentMethod] || paymentMethod
}

/**
 * Generate tracking URL based on carrier
 * Requirements: 3.2
 *
 * @param trackingNumber - Shipment tracking number
 * @param carrier - Shipping carrier name
 * @returns Tracking URL or undefined
 */
export function generateTrackingUrl(trackingNumber: string, carrier?: string): string | undefined {
  if (!carrier) return undefined

  const trackingUrls: Record<string, string> = {
    correos: `https://www.correos.es/es/es/herramientas/localizador/envios?tracking=${trackingNumber}`,
    seur: `https://www.seur.com/livetracking/?segOnlineIdentificador=${trackingNumber}`,
    dhl: `https://www.dhl.com/es-es/home/tracking.html?tracking-id=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
  }

  return trackingUrls[carrier.toLowerCase()]
}

/**
 * Validate order data for email sending
 * Requirements: 1.1, 1.2
 *
 * @param order - Database order record
 * @returns Validation result with errors
 */
export function validateOrderForEmail(order: DatabaseOrder): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required order fields
  if (!order.order_number) {
    errors.push('Order number is missing')
  }

  if (!order.shipping_address) {
    errors.push('Shipping address is missing')
  }

  if (!order.order_items || order.order_items.length === 0) {
    errors.push('Order has no items')
  }

  // Check customer email
  if (!order.user_id && !order.guest_email) {
    errors.push('Customer email is missing')
  }

  // Check totals
  if (order.total_eur === undefined || order.total_eur === null) {
    errors.push('Order total is missing')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
