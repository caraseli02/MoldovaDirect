/**
 * Custom storage handler for Supabase authentication
 * Implements "Remember Me" functionality by switching between
 * localStorage (persistent) and sessionStorage (temporary)
 */

const REMEMBER_ME_KEY = 'auth-remember-me'

/**
 * Get the appropriate storage based on remember me preference
 */
function getStorage(): Storage {
  if (typeof window === 'undefined') {
    // Server-side: return a no-op storage
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0
    }
  }

  // Check if we should use persistent storage
  const rememberMe = sessionStorage.getItem(REMEMBER_ME_KEY)

  // If rememberMe is explicitly set to 'false', use sessionStorage
  // Otherwise, default to localStorage for backward compatibility
  return rememberMe === 'false' ? sessionStorage : localStorage
}

/**
 * Set the remember me preference
 * This determines which storage will be used for the session
 */
export function setRememberMePreference(remember: boolean): void {
  if (typeof window === 'undefined') return

  // Store preference in sessionStorage (survives page reloads but not browser restarts)
  if (remember) {
    sessionStorage.removeItem(REMEMBER_ME_KEY)
  } else {
    sessionStorage.setItem(REMEMBER_ME_KEY, 'false')
  }
}

/**
 * Get the remember me preference
 */
export function getRememberMePreference(): boolean {
  if (typeof window === 'undefined') return true

  return sessionStorage.getItem(REMEMBER_ME_KEY) !== 'false'
}

/**
 * Move existing session from localStorage to sessionStorage
 * Used when user unchecks "remember me" during login
 */
export function moveSessionToSessionStorage(): void {
  if (typeof window === 'undefined') return

  try {
    const authStorageKey = 'sb-' // Supabase storage key prefix

    // Find all Supabase auth keys in localStorage
    const keysToMove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(authStorageKey)) {
        keysToMove.push(key)
      }
    }

    // Move each auth key from localStorage to sessionStorage
    keysToMove.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        sessionStorage.setItem(key, value)
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to move session to sessionStorage:', error)
  }
}

/**
 * Move existing session from sessionStorage to localStorage
 * Used when user checks "remember me" during login
 */
export function moveSessionToLocalStorage(): void {
  if (typeof window === 'undefined') return

  try {
    const authStorageKey = 'sb-' // Supabase storage key prefix

    // Find all Supabase auth keys in sessionStorage
    const keysToMove: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(authStorageKey)) {
        keysToMove.push(key)
      }
    }

    // Move each auth key from sessionStorage to localStorage
    keysToMove.forEach(key => {
      const value = sessionStorage.getItem(key)
      if (value) {
        localStorage.setItem(key, value)
        sessionStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to move session to localStorage:', error)
  }
}

/**
 * Clear session from both storages
 */
export function clearAuthSession(): void {
  if (typeof window === 'undefined') return

  try {
    const authStorageKey = 'sb-'

    // Clear from localStorage
    const localKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(authStorageKey)) {
        localKeys.push(key)
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key))

    // Clear from sessionStorage
    const sessionKeys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(authStorageKey)) {
        sessionKeys.push(key)
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key))

    // Clear remember me preference
    sessionStorage.removeItem(REMEMBER_ME_KEY)
  } catch (error) {
    console.warn('Failed to clear auth session:', error)
  }
}
