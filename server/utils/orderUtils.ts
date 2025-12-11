// Order utility functions for checkout processing

export interface CartItem {
  id: number
  product_id: number
  quantity: number
  products: {
    id: number
    sku: string
    name_translations: Record<string, string>
    description_translations: Record<string, string>
    price_eur: number
    images: any[]
    weight_kg: number
    stock_quantity: number
    is_active: boolean
  }
}

export interface OrderCalculation {
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  items: CartItem[]
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedDays: number
}

/**
 * Calculate order totals including shipping and tax
 */
export function calculateOrderTotals(
  cartItems: CartItem[],
  shippingMethod?: ShippingMethod,
  shippingAddress?: unknown,
): OrderCalculation {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.products.price_eur * item.quantity)
  }, 0)

  // Calculate shipping cost
  const shippingCost = shippingMethod?.price || 0

  // Calculate tax (implement based on business rules)
  // For now, we'll use 0% tax, but this could be calculated based on:
  // - Shipping address country/region
  // - Product categories
  // - Business registration requirements
  const tax = calculateTax(subtotal, shippingAddress)

  const total = subtotal + shippingCost + tax

  return {
    subtotal,
    shippingCost,
    tax,
    total,
    items: cartItems,
  }
}

/**
 * Calculate tax based on shipping address and business rules
 */
function calculateTax(_subtotal: number, _shippingAddress?: unknown): number {
  // Implement tax calculation logic here
  // This is a placeholder - actual implementation would depend on:
  // - Business location and registration
  // - Customer location
  // - Product categories
  // - Tax regulations

  // For EU businesses, VAT might apply based on customer location
  // For now, return 0
  return 0
}

/**
 * Validate cart items for checkout
 */
export function validateCartItems(cartItems: CartItem[]): {
  valid: boolean
  errors: Array<{
    productId: number
    error: string
    message: string
    availableQuantity?: number
    requestedQuantity?: number
  }>
} {
  const errors: Array<{
    productId: number
    error: string
    message: string
    availableQuantity?: number
    requestedQuantity?: number
  }> = []

  for (const item of cartItems) {
    const product = item.products

    // Check if product is still active
    if (!product.is_active) {
      errors.push({
        productId: product.id,
        error: 'product_inactive',
        message: 'Product is no longer available',
      })
    }

    // Check stock availability
    if (item.quantity > product.stock_quantity) {
      errors.push({
        productId: product.id,
        error: 'insufficient_stock',
        message: 'Not enough stock available',
        availableQuantity: product.stock_quantity,
        requestedQuantity: item.quantity,
      })
    }

    // Check for minimum quantity (if applicable)
    if (item.quantity <= 0) {
      errors.push({
        productId: product.id,
        error: 'invalid_quantity',
        message: 'Quantity must be greater than 0',
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate a unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = Date.now().toString().slice(-4)
  return `MD-${dateStr}-${timeStr}`
}

/**
 * Get available shipping methods based on cart and address
 */
export function getAvailableShippingMethods(
  cartItems: CartItem[],
  _shippingAddress?: unknown,
): ShippingMethod[] {
  // Calculate total weight
  const totalWeight = cartItems.reduce((sum, item) => {
    return sum + (item.products.weight_kg * item.quantity)
  }, 0)

  // Define shipping methods based on weight and destination
  const methods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 5.99,
      estimatedDays: 5,
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 12.99,
      estimatedDays: 2,
    },
  ]

  // Adjust pricing based on weight
  if (totalWeight > 5) {
    methods.forEach((method) => {
      method.price += Math.ceil((totalWeight - 5) / 2) * 2.50
    })
  }

  // Free shipping for orders over certain amount
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.products.price_eur * item.quantity)
  }, 0)

  if (subtotal >= 50) {
    methods.unshift({
      id: 'free',
      name: 'Free Standard Shipping',
      price: 0,
      estimatedDays: 7,
    })
  }

  return methods
}

/**
 * Validate shipping address
 */
export function validateShippingAddress(address: unknown): {
  valid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}

  if (!address.firstName?.trim()) {
    errors.firstName = 'First name is required'
  }

  if (!address.lastName?.trim()) {
    errors.lastName = 'Last name is required'
  }

  if (!address.street?.trim()) {
    errors.street = 'Street address is required'
  }

  if (!address.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!address.postalCode?.trim()) {
    errors.postalCode = 'Postal code is required'
  }

  if (!address.country?.trim()) {
    errors.country = 'Country is required'
  }

  // Validate postal code format based on country
  if (address.country && address.postalCode) {
    const postalCodeValid = validatePostalCode(address.postalCode, address.country)
    if (!postalCodeValid) {
      errors.postalCode = 'Invalid postal code format for selected country'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

/**
 * Validate postal code format by country
 */
function validatePostalCode(postalCode: string, country: string): boolean {
  const patterns: Record<string, RegExp> = {
    ES: /^\d{5}$/,
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
    GB: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/,
    IT: /^\d{5}$/,
    RO: /^\d{6}$/,
  }

  const pattern = patterns[country.toUpperCase()]
  return pattern ? pattern.test(postalCode.trim()) : true // Allow unknown countries
}

/**
 * Format address for display in order context
 */
export function formatOrderAddress(address: unknown): string {
  const parts = [
    address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : '',
    address.company || '',
    address.street || '',
    [address.city, address.province].filter(Boolean).join(', '),
    address.postalCode || '',
    address.country || '',
  ].filter(Boolean)

  return parts.join('\n')
}

/**
 * Sanitize order data for storage
 */
export function sanitizeOrderData(data: any): unknown {
  // Remove sensitive information and sanitize input
  const sanitized = { ...data }

  // Remove any potential XSS or injection attempts
  if (sanitized.customerNotes) {
    sanitized.customerNotes = sanitized.customerNotes.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }

  if (sanitized.adminNotes) {
    sanitized.adminNotes = sanitized.adminNotes.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }

  return sanitized
}
