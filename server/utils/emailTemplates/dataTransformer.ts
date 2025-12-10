/**
 * Data transformation utilities for email templates
 * Transforms database order data into email template format
 */

import type {
  OrderEmailData,
  OrderItemData,
  AddressData,
  DatabaseOrder,
  DatabaseOrderItem,
  UserProfile,
  GuestCheckoutData,
} from './types'
import { normalizeLocale } from './formatters'

/**
 * Transform database order and customer info into email payload.
 */
export function buildOrderEmailData(
  order: DatabaseOrder,
  customerInfo: UserProfile | GuestCheckoutData,
): OrderEmailData {
  const customerName = getCustomerName(customerInfo)
  const customerEmail = 'email' in customerInfo ? customerInfo.email : ''
  const locale = getCustomerLocale(customerInfo)
  const orderItems = transformOrderItems(order.order_items || [])
  const shippingAddress = transformAddress(order.shipping_address)
  const billingAddress = order.billing_address ? transformAddress(order.billing_address) : undefined
  const trackingUrl
    = order.tracking_number && order.carrier
      ? buildTrackingUrl(order.tracking_number, order.carrier)
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
 * Transform database order items to email format
 */
function transformOrderItems(items: DatabaseOrderItem[]): OrderItemData[] {
  return items.map((item) => {
    const snapshot = item.product_snapshot || {}

    // Get product name from snapshot (with locale fallback)
    const name = snapshot.name_translations?.en || snapshot.name || 'Product'

    // Get product image
    const image = snapshot.image_url || snapshot.images?.[0]

    return {
      productId: item.product_id.toString(),
      name,
      sku: snapshot.sku,
      quantity: item.quantity,
      price: item.price_eur,
      total: item.total_eur,
      image,
      attributes: snapshot.attributes,
    }
  })
}

/**
 * Transform address object to email format
 */
function transformAddress(addressData: any): AddressData {
  if (!addressData) {
    throw new Error('Address data is required')
  }

  return {
    firstName: addressData.firstName || addressData.first_name || '',
    lastName: addressData.lastName || addressData.last_name || '',
    street: addressData.street || addressData.address || '',
    city: addressData.city || '',
    postalCode: addressData.postalCode || addressData.postal_code || addressData.zip || '',
    province: addressData.province || addressData.state || addressData.region,
    country: addressData.country || 'Spain',
    phone: addressData.phone || addressData.phoneNumber,
  }
}

/**
 * Get customer name from user profile or guest data
 */
function getCustomerName(customerInfo: UserProfile | GuestCheckoutData): string {
  if ('full_name' in customerInfo && customerInfo.full_name) {
    return customerInfo.full_name
  }

  if ('firstName' in customerInfo && 'lastName' in customerInfo) {
    return `${customerInfo.firstName} ${customerInfo.lastName}`.trim()
  }

  return 'Customer'
}

/**
 * Get customer locale from user profile or guest data
 */
function getCustomerLocale(customerInfo: UserProfile | GuestCheckoutData): string {
  if ('preferred_locale' in customerInfo && customerInfo.preferred_locale) {
    return normalizeLocale(customerInfo.preferred_locale)
  }

  if ('locale' in customerInfo && customerInfo.locale) {
    return normalizeLocale(customerInfo.locale)
  }

  return 'es' // Default to Spanish
}

/**
 * Build tracking URL based on carrier
 */
function buildTrackingUrl(trackingNumber: string, carrier: string): string {
  const carrierUrls: Record<string, string> = {
    correos: `https://www.correos.es/es/es/herramientas/localizador/envios?tracking=${trackingNumber}`,
    seur: `https://www.seur.com/livetracking/?segOnlineIdentificador=${trackingNumber}`,
    dhl: `https://www.dhl.com/es-es/home/tracking.html?tracking-id=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    mrw: `https://www.mrw.es/seguimiento_envios/MRW_resultados_consultas.asp?modo=nacional&envio=${trackingNumber}`,
  }

  const normalizedCarrier = carrier.toLowerCase()
  return carrierUrls[normalizedCarrier] || `#tracking-${trackingNumber}`
}

/**
 * Get localized product name from snapshot
 */
export function getLocalizedProductName(
  productSnapshot: any,
  locale: string,
): string {
  if (!productSnapshot) return 'Product'

  const nameTranslations = productSnapshot.name_translations || {}

  // Try to get name in requested locale
  if (nameTranslations[locale]) {
    return nameTranslations[locale]
  }

  // Fallback to English
  if (nameTranslations.en) {
    return nameTranslations.en
  }

  // Fallback to any available translation
  const availableNames = Object.values(nameTranslations)
  if (availableNames.length > 0) {
    return availableNames[0] as string
  }

  // Final fallback to name field
  return productSnapshot.name || 'Product'
}

/**
 * Transform order items with localized names
 */
export function transformOrderItemsWithLocale(
  items: DatabaseOrderItem[],
  locale: string,
): OrderItemData[] {
  return items.map((item) => {
    const snapshot = item.product_snapshot || {}

    // Get localized product name
    const name = getLocalizedProductName(snapshot, locale)

    // Get product image
    const image = snapshot.image_url || snapshot.images?.[0]

    return {
      productId: item.product_id.toString(),
      name,
      sku: snapshot.sku,
      quantity: item.quantity,
      price: item.price_eur,
      total: item.total_eur,
      image,
      attributes: snapshot.attributes,
    }
  })
}

/**
 * Enhanced order transformation with locale-specific product names
 */
export function transformOrderToEmailDataWithLocale(
  order: DatabaseOrder,
  customerInfo: UserProfile | GuestCheckoutData,
  locale?: string,
): OrderEmailData {
  const baseData = buildOrderEmailData(order, customerInfo)

  const finalLocale = locale || getCustomerLocale(customerInfo)
  const orderItems = transformOrderItemsWithLocale(order.order_items || [], finalLocale)

  return {
    ...baseData,
    orderItems,
    locale: finalLocale,
  }
}
