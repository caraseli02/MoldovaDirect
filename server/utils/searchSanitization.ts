/**
 * Search Input Sanitization Utility
 *
 * Provides functions to sanitize user search input to prevent SQL injection
 * and ensure proper query construction for PostgreSQL ILIKE and Supabase .or() filters.
 *
 * Security features:
 * - Escapes ILIKE special characters (%, _, \)
 * - Escapes single quotes for SQL safety
 * - Escapes commas for Supabase .or() filter syntax
 * - Validates input length to prevent abuse
 */

import { createError } from 'h3'

/**
 * Maximum allowed search term length to prevent abuse
 */
export const MAX_SEARCH_LENGTH = 100

/**
 * Sanitizes a search term for use in PostgreSQL ILIKE queries via Supabase
 *
 * This function escapes special characters that have meaning in:
 * 1. PostgreSQL ILIKE patterns (%, _, \)
 * 2. SQL strings (')
 * 3. Supabase .or() filter syntax (,)
 *
 * @param searchTerm - The raw user input search term
 * @returns Sanitized search term safe for ILIKE queries
 *
 * @example
 * ```typescript
 * const userInput = "50% off, wine's best"
 * const safe = sanitizeSearchTerm(userInput)
 * // Returns: "50\\% off\\, wine''s best"
 * ```
 */
export function sanitizeSearchTerm(searchTerm: string): string {
  return searchTerm
    // Backslash must be escaped first (before other escapes that add backslashes)
    .replace(/\\/g, '\\\\')
    // Percent sign - wildcard in ILIKE (matches any sequence of characters)
    .replace(/%/g, '\\%')
    // Underscore - wildcard in ILIKE (matches any single character)
    .replace(/_/g, '\\_')
    // Single quote - SQL string delimiter
    .replace(/'/g, "''")
    // Comma - Supabase .or() filter uses commas to separate conditions
    .replace(/,/g, '\\,')
}

/**
 * Validates search term length and throws an error if invalid
 *
 * @param searchTerm - The search term to validate
 * @param maxLength - Maximum allowed length (defaults to MAX_SEARCH_LENGTH)
 * @throws {Error} If search term exceeds maximum length
 *
 * @example
 * ```typescript
 * try {
 *   validateSearchLength(userInput)
 *   // proceed with search
 * } catch (error) {
 *   // handle validation error
 * }
 * ```
 */
export function validateSearchLength(searchTerm: string, maxLength: number = MAX_SEARCH_LENGTH): void {
  if (searchTerm.length > maxLength) {
    throw createError({
      statusCode: 400,
      statusMessage: `Search term too long. Maximum ${maxLength} characters allowed.`
    })
  }
}

/**
 * Validates minimum search length
 *
 * @param searchTerm - The search term to validate
 * @param minLength - Minimum required length (defaults to 2)
 * @returns true if valid, false otherwise
 *
 * @example
 * ```typescript
 * if (!validateMinSearchLength(userInput)) {
 *   return { message: 'Search term must be at least 2 characters' }
 * }
 * ```
 */
export function validateMinSearchLength(searchTerm: string, minLength: number = 2): boolean {
  return searchTerm.trim().length >= minLength
}

/**
 * Prepares a search term for use in ILIKE queries
 * Combines validation and sanitization with pattern wrapping
 *
 * @param searchTerm - The raw user input
 * @param options - Validation and pattern options
 * @returns Sanitized search pattern ready for ILIKE
 *
 * @example
 * ```typescript
 * const pattern = prepareSearchPattern(userInput)
 * queryBuilder.or(`name.ilike.${pattern}`)
 * ```
 */
export function prepareSearchPattern(
  searchTerm: string,
  options: {
    validateLength?: boolean
    maxLength?: number
    wrapWithWildcards?: boolean
  } = {}
): string {
  const {
    validateLength = true,
    maxLength = MAX_SEARCH_LENGTH,
    wrapWithWildcards = true
  } = options

  // Validate length if requested
  if (validateLength) {
    validateSearchLength(searchTerm, maxLength)
  }

  // Sanitize the search term
  const sanitized = sanitizeSearchTerm(searchTerm)

  // Wrap with wildcards for partial matching
  return wrapWithWildcards ? `%${sanitized}%` : sanitized
}
