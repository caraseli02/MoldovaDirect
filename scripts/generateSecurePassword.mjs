#!/usr/bin/env node

/**
 * Secure Password Generator
 *
 * Generates cryptographically secure random passwords
 * suitable for admin accounts and testing.
 */

import { randomBytes } from 'crypto'

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @param {boolean} includeSymbols - Include special characters (default: true)
 * @returns {string} Generated password
 */
export function generateSecurePassword(length = 16, includeSymbols = true) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  const charset = lowercase + uppercase + numbers + (includeSymbols ? symbols : '')
  const randomValues = randomBytes(length)

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }

  // Ensure password has at least one of each required type
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = includeSymbols ? /[!@#$%^&*]/.test(password) : true

  // If password doesn't meet requirements, regenerate
  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSymbol) {
    return generateSecurePassword(length, includeSymbols)
  }

  return password
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const length = parseInt(process.argv[2]) || 16
  const includeSymbols = process.argv[3] !== 'false'

  console.log(generateSecurePassword(length, includeSymbols))
}
