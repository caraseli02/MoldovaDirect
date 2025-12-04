/**
 * Unified Address Type Definitions
 *
 * This file consolidates all address-related types to prevent duplication
 * and ensure consistency across the codebase.
 *
 * Usage:
 * - Components: Use Address for UI (camelCase)
 * - Server/DB: Use AddressEntity for database operations (snake_case)
 * - Conversion: Use toEntity() and fromEntity() helpers
 */

/**
 * Database representation (snake_case)
 * Matches user_addresses table schema exactly
 */
export interface AddressEntity {
  id: number // SERIAL primary key
  user_id: string // UUID foreign key
  type: 'shipping' | 'billing'
  first_name: string
  last_name: string
  company: string | null
  street: string
  city: string
  postal_code: string
  province: string | null
  country: string
  phone: string | null
  is_default: boolean
  created_at: string // ISO timestamp
  updated_at: string // ISO timestamp
}

/**
 * Client/UI representation (camelCase)
 * Used by Vue components and composables
 */
export interface Address {
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
  isDefault: boolean
}

/**
 * Form data for creating/editing addresses
 * Used by AddressFormModal component
 */
export interface AddressFormData {
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
  isDefault: boolean
}

/**
 * API request body for creating addresses
 */
export interface CreateAddressRequest {
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

/**
 * API response for address operations
 */
export interface AddressResponse {
  success: boolean
  address?: Address
  addresses?: Address[]
  error?: string
}

/**
 * Validation error structure
 */
export interface AddressValidationError {
  field: string
  message: string
}

/**
 * Helper: Convert database entity to client Address
 */
export function addressFromEntity(entity: AddressEntity): Address {
  return {
    id: entity.id,
    type: entity.type,
    firstName: entity.first_name,
    lastName: entity.last_name,
    company: entity.company || undefined,
    street: entity.street,
    city: entity.city,
    postalCode: entity.postal_code,
    province: entity.province || undefined,
    country: entity.country,
    phone: entity.phone || undefined,
    isDefault: entity.is_default
  }
}

/**
 * Helper: Convert client Address to database entity
 */
export function addressToEntity(
  address: Address,
  userId: string
): Omit<AddressEntity, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: userId,
    type: address.type,
    first_name: address.firstName,
    last_name: address.lastName,
    company: address.company || null,
    street: address.street,
    city: address.city,
    postal_code: address.postalCode,
    province: address.province || null,
    country: address.country,
    phone: address.phone || null,
    is_default: address.isDefault
  }
}

/**
 * Helper: Convert form data to Address
 */
export function addressFromFormData(formData: AddressFormData): Omit<Address, 'id'> {
  return {
    type: formData.type,
    firstName: formData.firstName,
    lastName: formData.lastName,
    company: formData.company,
    street: formData.street,
    city: formData.city,
    postalCode: formData.postalCode,
    province: formData.province,
    country: formData.country,
    phone: formData.phone,
    isDefault: formData.isDefault
  }
}

/**
 * Helper: Convert Address to form data
 */
export function addressToFormData(address: Address): AddressFormData {
  return {
    type: address.type,
    firstName: address.firstName,
    lastName: address.lastName,
    company: address.company,
    street: address.street,
    city: address.city,
    postalCode: address.postalCode,
    province: address.province,
    country: address.country,
    phone: address.phone,
    isDefault: address.isDefault
  }
}

/**
 * Helper: Validate address data
 */
export function validateAddress(address: Partial<Address>): AddressValidationError[] {
  const errors: AddressValidationError[] = []

  if (!address.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' })
  }

  if (!address.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' })
  }

  if (!address.street?.trim()) {
    errors.push({ field: 'street', message: 'Street address is required' })
  }

  if (!address.city?.trim()) {
    errors.push({ field: 'city', message: 'City is required' })
  }

  if (!address.postalCode?.trim()) {
    errors.push({ field: 'postalCode', message: 'Postal code is required' })
  }

  if (!address.country?.trim()) {
    errors.push({ field: 'country', message: 'Country is required' })
  }

  if (!address.type) {
    errors.push({ field: 'type', message: 'Address type is required' })
  }

  // Country-specific postal code validation
  if (address.country && address.postalCode) {
    const postalCodeRegex = getPostalCodeRegex(address.country)
    if (!postalCodeRegex.test(address.postalCode)) {
      errors.push({
        field: 'postalCode',
        message: `Invalid postal code format for ${address.country}`
      })
    }
  }

  // Phone validation if provided
  if (address.phone && !/^[\+]?[0-9\s\-\(\)]{9,}$/.test(address.phone)) {
    errors.push({ field: 'phone', message: 'Invalid phone number format' })
  }

  return errors
}

/**
 * Helper: Get postal code regex for country
 */
function getPostalCodeRegex(country: string): RegExp {
  const patterns: Record<string, RegExp> = {
    ES: /^\d{5}$/, // Spain: 5 digits
    FR: /^\d{5}$/, // France: 5 digits
    IT: /^\d{5}$/, // Italy: 5 digits
    PT: /^\d{4}-\d{3}$/, // Portugal: 4 digits-3 digits
    DE: /^\d{5}$/, // Germany: 5 digits
    MD: /^MD-\d{4}$/, // Moldova: MD-4 digits
    RO: /^\d{6}$/ // Romania: 6 digits
  }
  return patterns[country] || /.+/ // Fallback: accept any non-empty
}

/**
 * Helper: Format address for display
 */
export function formatAddress(address: Address, style: 'single-line' | 'multi-line' = 'multi-line'): string {
  const parts = [
    `${address.firstName} ${address.lastName}`,
    address.company,
    address.street,
    `${address.city}, ${address.postalCode}`,
    address.province,
    address.country,
    address.phone
  ].filter(Boolean)

  return style === 'single-line' ? parts.join(', ') : parts.join('\n')
}

/**
 * Type guard: Check if object is a valid Address
 */
export function isAddress(obj: any): obj is Address {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.firstName === 'string' &&
    typeof obj.lastName === 'string' &&
    typeof obj.street === 'string' &&
    typeof obj.city === 'string' &&
    typeof obj.postalCode === 'string' &&
    typeof obj.country === 'string' &&
    (obj.type === 'shipping' || obj.type === 'billing') &&
    typeof obj.isDefault === 'boolean'
  )
}
