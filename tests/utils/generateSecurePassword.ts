import { randomBytes } from 'crypto'

/**
 * Generates a cryptographically secure random password
 * @param length - Length of password (default: 16)
 * @returns Secure random password string
 */
export function generateSecurePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const randomValues = randomBytes(length)
  let password = ''

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length]
  }

  // Ensure password meets minimum complexity requirements
  // At least one uppercase, one lowercase, one number, one special char
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[!@#$%^&*]/.test(password)

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    // Regenerate if doesn't meet complexity requirements
    return generateSecurePassword(length)
  }

  return password
}
