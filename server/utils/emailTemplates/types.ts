/**
 * Type definitions for email template system
 * Defines interfaces for order email data transformation
 */

/**
 * Complete order email data structure
 */
export interface OrderEmailData {
  customerName: string
  customerEmail: string
  orderNumber: string
  orderDate: string
  estimatedDelivery?: string
  orderItems: OrderItemData[]
  shippingAddress: AddressData
  billingAddress?: AddressData
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  paymentMethod: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  locale: string
  orderStatus?: string
  customerNotes?: string
}

/**
 * Order item data for email display
 */
export interface OrderItemData {
  productId: string
  name: string
  sku?: string
  quantity: number
  price: number
  total: number
  image?: string
  attributes?: Record<string, string>
}

/**
 * Address data structure
 */
export interface AddressData {
  firstName: string
  lastName: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
}

/**
 * Database order structure (from Supabase)
 */
export interface DatabaseOrder {
  id: number
  order_number: string
  user_id?: string
  guest_email?: string
  status: string
  subtotal_eur: number
  shipping_cost_eur: number
  tax_eur: number
  total_eur: number
  payment_method: string
  shipping_address: any
  billing_address?: any
  customer_notes?: string
  tracking_number?: string
  carrier?: string
  created_at: string
  estimated_delivery?: string
  order_items?: DatabaseOrderItem[]
}

/**
 * Database order item structure
 */
export interface DatabaseOrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price_eur: number
  total_eur: number
  product_snapshot?: any
}

/**
 * User profile data
 */
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  preferred_locale?: string
}

/**
 * Guest checkout data
 */
export interface GuestCheckoutData {
  email: string
  firstName: string
  lastName: string
  locale?: string
}

/**
 * Template variable validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Email template context
 */
export interface EmailTemplateContext {
  data: OrderEmailData
  locale: string
  templateType: 'order_confirmation' | 'order_shipped' | 'order_delivered' | 'order_cancelled'
}
