/**
 * Account Lockout Management Module
 *
 * Handles account lockout state, persistence, and expiration checks.
 * Separates lockout concerns from main authentication logic.
 */

const LOCKOUT_STORAGE_KEY = 'md-auth-lockout-until'

/**
 * Read persisted lockout time from localStorage
 * Automatically cleans up expired lockouts
 */
export const readPersistedLockout = (): Date | null => {
  if (!import.meta.client) {
    return null
  }

  const storedValue = window.localStorage.getItem(LOCKOUT_STORAGE_KEY)
  if (!storedValue) {
    return null
  }

  const parsed = new Date(storedValue)
  if (Number.isNaN(parsed.getTime()) || parsed <= new Date()) {
    window.localStorage.removeItem(LOCKOUT_STORAGE_KEY)
    return null
  }

  return parsed
}

/**
 * Persist lockout time to localStorage
 * Pass null to clear the lockout
 */
export const persistLockout = (lockoutTime: Date | null) => {
  if (!import.meta.client) {
    return
  }

  if (lockoutTime) {
    window.localStorage.setItem(LOCKOUT_STORAGE_KEY, lockoutTime.toISOString())
  }
  else {
    window.localStorage.removeItem(LOCKOUT_STORAGE_KEY)
  }
}

/**
 * Check if account is currently locked
 */
export const isAccountLocked = (lockoutTime: Date | null): boolean => {
  return lockoutTime ? lockoutTime > new Date() : false
}

/**
 * Get remaining lockout time in minutes
 */
export const getLockoutMinutesRemaining = (lockoutTime: Date | null): number => {
  if (!lockoutTime) return 0
  const diff = lockoutTime.getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60))
}

/**
 * Trigger an account lockout for the specified duration (minutes)
 * Returns the lockout deadline
 */
export const triggerLockout = (durationMinutes = 15): Date => {
  const lockoutDurationMs = Math.max(durationMinutes, 1) * 60 * 1000
  const lockoutDeadline = new Date(Date.now() + lockoutDurationMs)
  persistLockout(lockoutDeadline)
  return lockoutDeadline
}

/**
 * Clear lockout state (for testing or manual override)
 */
export const clearLockout = () => {
  persistLockout(null)
}
