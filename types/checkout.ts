// Checkout domain types
// Centralized definitions shared across store, composables, and utilities

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: number
}

export interface Address {
  id?: string
  user_id?: string
  full_name: string
  address: string
  city: string
  postal_code: string
  country: string
  phone?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
}

// Legacy address format for backward compatibility
export interface LegacyAddress {
  id?: number
  type: 'shipping' | 'billing'
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  postalCode: string
  province?: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface PaymentMethod {
  type: 'cash' | 'credit_card' | 'paypal' | 'bank_transfer'
  creditCard?: {
    number: string
    expiryMonth: string
    expiryYear: string
    cvv: string
    holderName: string
  }
  paypal?: {
    email: string
  }
  bankTransfer?: {
    reference: string
  }
  cash?: {
    confirmed: boolean
  }
  saveForFuture?: boolean
}

export interface SavedPaymentMethod {
  id: string
  type: 'cash' | 'credit_card' | 'paypal'
  lastFour?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface GuestInfo {
  email: string
  emailUpdates: boolean
}

export interface ShippingInformation {
  address: Address
  method: ShippingMethod
  instructions?: string
}

export interface OrderItem {
  productId: number | string
  productSnapshot: Record<string, any>
  quantity: number
  price: number
  total: number
}

export interface OrderData {
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  currency: string
  items: OrderItem[]
  orderId?: number
  orderNumber?: string
  customerEmail?: string | null
}

export interface CheckoutSession {
  id: string
  cartItems: any[]
  shippingInfo?: ShippingInformation
  paymentMethod?: PaymentMethod
  orderData?: OrderData
  currentStep: CheckoutStep
  expiresAt: Date
}

export interface CheckoutError {
  type: 'validation' | 'payment' | 'inventory' | 'network' | 'system'
  code: string
  message: string
  field?: string
  retryable: boolean
  userAction?: string
}

export interface CheckoutValidationState {
  validationErrors: Record<string, string[]>
  isValid: boolean
}

export interface CheckoutPreferences {
  user_id: string
  preferred_shipping_method?: string
  updated_at?: string
}

export interface CheckoutState {
  currentStep: CheckoutStep
  sessionId: string | null
  guestInfo: GuestInfo | null
  shippingInfo: ShippingInformation | null
  paymentMethod: PaymentMethod | null
  orderData: OrderData | null
  loading: boolean
  processing: boolean
  errors: Record<string, string>
  lastError: CheckoutError | null
  paymentIntent: string | null
  paymentClientSecret: string | null
  sessionExpiresAt: Date | null
  lastSyncAt: Date | null
  contactEmail: string | null
  validationErrors: Record<string, string[]>
  isValid: boolean
  savedAddresses: Address[]
  savedPaymentMethods: SavedPaymentMethod[]
  availableShippingMethods: ShippingMethod[]
  availableCountries: string[]
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
  dataPrefetched?: boolean
  preferences?: CheckoutPreferences | null
}
