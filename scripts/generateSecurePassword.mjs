#!/usr/bin/env node

/**
 * Secure Password Generator
 *
 * Generates cryptographically secure random passwords
 * suitable for admin accounts and testing.
 */

import { randomBytes } from 'crypto'

// Minimum and maximum password lengths for validation
const MIN_LENGTH = 8
const MAX_LENGTH = 128

/**
 * Character sets for password generation
 */
const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  // Expanded symbol set, avoiding quotes and backslash to prevent shell/SQL escaping issues
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/'
}

/**
 * Check if password meets complexity requirements
 * @param {string} password - Password to validate
 * @param {boolean} includeSymbols - Whether symbols are required
 * @returns {boolean} True if password meets requirements
 */
function meetsRequirements(password, includeSymbols) {
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const symbolPattern = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/
  const hasSymbol = includeSymbols ? symbolPattern.test(password) : true

  return hasLowercase && hasUppercase && hasNumber && hasSymbol
}

/**
 * Generate password string using rejection sampling to avoid modulo bias
 * @param {number} length - Password length
 * @param {string} charset - Character set to use
 * @returns {string} Generated password string
 */
function generatePasswordString(length, charset) {
  const charsetLength = charset.length
  let password = ''

  // Generate extra bytes for rejection sampling
  let randomValues = randomBytes(length * 2)
  let randomIndex = 0

  while (password.length < length) {
    // Need more random bytes
    if (randomIndex >= randomValues.length) {
      randomValues = randomBytes(length * 2)
      randomIndex = 0
    }

    const randomValue = randomValues[randomIndex++]

    // Reject values that would cause modulo bias
    // Only use values in range [0, 256 - (256 % charsetLength))
    if (randomValue < 256 - (256 % charsetLength)) {
      password += charset[randomValue % charsetLength]
    }
  }

  return password
}

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @param {boolean} includeSymbols - Include special characters (default: true)
 * @returns {string} Generated password
 * @throws {Error} If length is out of valid range or if password generation fails
 */
export function generateSecurePassword(length = 16, includeSymbols = true) {
  // Validate input
  if (typeof length !== 'number' || isNaN(length)) {
    throw new Error('Password length must be a number')
  }

  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new Error(`Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`)
  }

  const charset = CHARSETS.lowercase + CHARSETS.uppercase + CHARSETS.numbers +
                  (includeSymbols ? CHARSETS.symbols : '')

  // Use iterative approach with maximum attempts to avoid stack overflow
  const maxAttempts = 100

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const password = generatePasswordString(length, charset)

    // Validate password meets complexity requirements
    if (meetsRequirements(password, includeSymbols)) {
      return password
    }
  }

  // This should be extremely rare (probability < 0.0001%)
  throw new Error('Failed to generate valid password after maximum attempts')
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    let length = parseInt(process.argv[2]) || 16
    const includeSymbols = process.argv[3] !== 'false'

    // Validate CLI input
    if (isNaN(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
      console.error(`Error: Password length must be between ${MIN_LENGTH} and ${MAX_LENGTH}`)
      console.error(`Usage: node generateSecurePassword.mjs [length] [includeSymbols]`)
      console.error(`  length: Password length (default: 16, min: ${MIN_LENGTH}, max: ${MAX_LENGTH})`)
      console.error(`  includeSymbols: Include symbols (default: true, use 'false' to disable)`)
      process.exit(1)
    }

    console.log(generateSecurePassword(length, includeSymbols))
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exit(1)
  }
}
