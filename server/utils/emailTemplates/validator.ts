/**
 * Template variable validation utilities
 * Validates required fields and data integrity for email templates
 */

import type { OrderEmailData, ValidationResult } from './types'

/**
 * Validate order email data
 * Ensures all required fields are present and valid
 */
export function validateOrderEmailData(data: OrderEmailData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Required fields validation
  if (!data.customerName || data.customerName.trim() === '') {
    errors.push('Customer name is required')
  }
  
  if (!data.customerEmail || !isValidEmail(data.customerEmail)) {
    errors.push('Valid customer email is required')
  }
  
  if (!data.orderNumber || data.orderNumber.trim() === '') {
    errors.push('Order number is required')
  }
  
  if (!data.orderDate) {
    errors.push('Order date is required')
  } else if (!isValidDate(data.orderDate)) {
    errors.push('Order date must be a valid date')
  }
  
  // Order items validation
  if (!data.orderItems || data.orderItems.length === 0) {
    errors.push('At least one order item is required')
  } else {
    data.orderItems.forEach((item, index) => {
      if (!item.name || item.name.trim() === '') {
        errors.push(`Order item ${index + 1}: Product name is required`)
      }
      
      if (item.quantity <= 0) {
        errors.push(`Order item ${index + 1}: Quantity must be greater than 0`)
      }
      
      if (item.price < 0) {
        errors.push(`Order item ${index + 1}: Price cannot be negative`)
      }
      
      if (item.total < 0) {
        errors.push(`Order item ${index + 1}: Total cannot be negative`)
      }
      
      // Validate total calculation
      const expectedTotal = item.price * item.quantity
      if (Math.abs(item.total - expectedTotal) > 0.01) {
        warnings.push(`Order item ${index + 1}: Total (${item.total}) doesn't match price × quantity (${expectedTotal})`)
      }
    })
  }
  
  // Shipping address validation
  if (!data.shippingAddress) {
    errors.push('Shipping address is required')
  } else {
    const addressErrors = validateAddress(data.shippingAddress, 'Shipping')
    errors.push(...addressErrors)
  }
  
  // Billing address validation (optional but validate if present)
  if (data.billingAddress) {
    const addressErrors = validateAddress(data.billingAddress, 'Billing')
    errors.push(...addressErrors)
  }
  
  // Financial data validation
  if (data.subtotal < 0) {
    errors.push('Subtotal cannot be negative')
  }
  
  if (data.shippingCost < 0) {
    errors.push('Shipping cost cannot be negative')
  }
  
  if (data.tax < 0) {
    errors.push('Tax cannot be negative')
  }
  
  if (data.total < 0) {
    errors.push('Total cannot be negative')
  }
  
  // Validate total calculation
  const expectedTotal = data.subtotal + data.shippingCost + data.tax
  if (Math.abs(data.total - expectedTotal) > 0.01) {
    warnings.push(`Order total (${data.total}) doesn't match subtotal + shipping + tax (${expectedTotal})`)
  }
  
  // Payment method validation
  if (!data.paymentMethod || data.paymentMethod.trim() === '') {
    errors.push('Payment method is required')
  }
  
  // Locale validation
  if (!data.locale || !isValidLocale(data.locale)) {
    warnings.push(`Invalid or missing locale: ${data.locale}. Defaulting to Spanish.`)
  }
  
  // Tracking validation (optional but validate if present)
  if (data.trackingNumber && !data.carrier) {
    warnings.push('Tracking number provided but carrier is missing')
  }
  
  // Estimated delivery validation
  if (data.estimatedDelivery && !isValidDate(data.estimatedDelivery)) {
    warnings.push('Estimated delivery date is not a valid date')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate address data
 */
function validateAddress(address: any, type: string): string[] {
  const errors: string[] = []
  
  if (!address.firstName || address.firstName.trim() === '') {
    errors.push(`${type} address: First name is required`)
  }
  
  if (!address.lastName || address.lastName.trim() === '') {
    errors.push(`${type} address: Last name is required`)
  }
  
  if (!address.street || address.street.trim() === '') {
    errors.push(`${type} address: Street is required`)
  }
  
  if (!address.city || address.city.trim() === '') {
    errors.push(`${type} address: City is required`)
  }
  
  if (!address.postalCode || address.postalCode.trim() === '') {
    errors.push(`${type} address: Postal code is required`)
  }
  
  if (!address.country || address.country.trim() === '') {
    errors.push(`${type} address: Country is required`)
  }
  
  return errors
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate date string
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

/**
 * Validate locale
 */
function isValidLocale(locale: string): boolean {
  const validLocales = ['es', 'en', 'ro', 'ru']
  return validLocales.includes(locale.toLowerCase())
}

/**
 * Validate and sanitize order data
 * Returns sanitized data or throws error if validation fails
 */
export function validateAndSanitizeOrderData(data: OrderEmailData): OrderEmailData {
  const validation = validateOrderEmailData(data)
  
  if (!validation.isValid) {
    throw new Error(`Order email data validation failed: ${validation.errors.join(', ')}`)
  }
  
  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('Order email data validation warnings:', validation.warnings)
  }
  
  // Sanitize data
  return {
    ...data,
    customerName: sanitizeString(data.customerName),
    customerEmail: sanitizeString(data.customerEmail),
    orderNumber: sanitizeString(data.orderNumber),
    orderItems: data.orderItems.map(item => ({
      ...item,
      name: sanitizeString(item.name),
      sku: item.sku ? sanitizeString(item.sku) : undefined,
    })),
    shippingAddress: sanitizeAddress(data.shippingAddress),
    billingAddress: data.billingAddress ? sanitizeAddress(data.billingAddress) : undefined,
    paymentMethod: sanitizeString(data.paymentMethod),
    locale: data.locale.toLowerCase(),
  }
}

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

/**
 * Sanitize address object
 */
function sanitizeAddress(address: any): any {
  return {
    firstName: sanitizeString(address.firstName),
    lastName: sanitizeString(address.lastName),
    street: sanitizeString(address.street),
    city: sanitizeString(address.city),
    postalCode: sanitizeString(address.postalCode),
    province: address.province ? sanitizeString(address.province) : undefined,
    country: sanitizeString(address.country),
    phone: address.phone ? sanitizeString(address.phone) : undefined,
  }
}

/**
 * Check if order data has all required fields for email
 */
export function hasRequiredFields(data: Partial<OrderEmailData>): boolean {
  return !!(
    data.customerName &&
    data.customerEmail &&
    data.orderNumber &&
    data.orderDate &&
    data.orderItems &&
    data.orderItems.length > 0 &&
    data.shippingAddress &&
    data.paymentMethod
  )
}

/**
 * Get missing required fields
 */
export function getMissingFields(data: Partial<OrderEmailData>): string[] {
  const missing: string[] = []
  
  if (!data.customerName) missing.push('customerName')
  if (!data.customerEmail) missing.push('customerEmail')
  if (!data.orderNumber) missing.push('orderNumber')
  if (!data.orderDate) missing.push('orderDate')
  if (!data.orderItems || data.orderItems.length === 0) missing.push('orderItems')
  if (!data.shippingAddress) missing.push('shippingAddress')
  if (!data.paymentMethod) missing.push('paymentMethod')
  
  return missing
}
