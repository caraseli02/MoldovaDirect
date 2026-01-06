/**
 * SSR Compatibility Tests
 *
 * Tests for ensuring auth pages are SSR-compatible by avoiding browser-only APIs
 * like `window.location` during server-side rendering.
 *
 * REQUIREMENT: Nuxt 4 SSR compatibility - use useRequestURL() instead of window.location
 *
 * Why this matters:
 * - `window.location` is undefined during SSR, causing hydration errors
 * - useRequestURL() works on both server and client
 * - Improves SEO and initial page load performance
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const AUTH_PAGES = [
  'pages/auth/verification-pending.vue',
  'pages/auth/login.vue',
  'pages/auth/register.vue',
  'pages/auth/verify-email.vue',
]

/**
 * Helper to read file content and check for SSR-incompatible patterns
 */
function readAuthPage(relativePath: string): string {
  const fullPath = join(process.cwd(), relativePath)
  return readFileSync(fullPath, 'utf-8')
}

/**
 * Check for window.location usage patterns
 */
function findWindowLocationUsages(content: string): string[] {
  const patterns = [
    /window\.location\.origin/g,
    /window\.location\.href/g,
    /window\.location\.hash/g,
    /window\.location\.pathname/g,
    /window\.location\.search/g,
  ]

  const usages: string[] = []

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      usages.push(...matches)
    }
  }

  return usages
}

/**
 * Check if useRequestURL is properly imported/used
 */
function hasUseRequestURL(content: string): boolean {
  return content.includes('useRequestURL')
}

describe('Auth Pages SSR Compatibility', () => {
  describe('No window.location usage', () => {
    it.each(AUTH_PAGES)('%s should not use window.location.origin', (pagePath) => {
      const content = readAuthPage(pagePath)
      const usages = findWindowLocationUsages(content)

      // This test SHOULD FAIL initially (TDD RED phase)
      // Files currently use window.location.origin which breaks SSR
      expect(usages).toEqual([])
    })

    it('verification-pending.vue should not have window.location.origin in emailRedirectTo', () => {
      const content = readAuthPage('pages/auth/verification-pending.vue')

      // Check for the specific problematic pattern
      const hasWindowOrigin = content.includes('window.location.origin')

      expect(hasWindowOrigin).toBe(false)
    })

    it('login.vue should not have window.location.origin in OAuth or magic link', () => {
      const content = readAuthPage('pages/auth/login.vue')

      const hasWindowOrigin = content.includes('window.location.origin')

      expect(hasWindowOrigin).toBe(false)
    })

    it('register.vue should not have window.location.origin in signUp options', () => {
      const content = readAuthPage('pages/auth/register.vue')

      const hasWindowOrigin = content.includes('window.location.origin')

      expect(hasWindowOrigin).toBe(false)
    })

    it('verify-email.vue should not have window.location usage', () => {
      const content = readAuthPage('pages/auth/verify-email.vue')

      const usages = findWindowLocationUsages(content)

      expect(usages).toEqual([])
    })
  })

  describe('useRequestURL usage', () => {
    it.each(AUTH_PAGES)('%s should use useRequestURL for SSR-safe URL access', (pagePath) => {
      const content = readAuthPage(pagePath)

      // After fix, all pages should use useRequestURL
      expect(hasUseRequestURL(content)).toBe(true)
    })
  })

  describe('SSR-safe redirect URL construction', () => {
    it('should construct redirect URLs using useRequestURL().origin or requestURL.origin', () => {
      // This test verifies the pattern we want to see:
      // const requestURL = useRequestURL()
      // const redirectTo = `${requestURL.origin}${localePath('/auth/confirm')}`
      // OR inline: `${useRequestURL().origin}...`

      // Pattern matches either direct call or variable usage
      const expectedPattern = /(?:useRequestURL\(\)|requestURL)\.origin/

      for (const pagePath of AUTH_PAGES) {
        const content = readAuthPage(pagePath)

        // Pages that construct redirect URLs should use this pattern
        if (content.includes('emailRedirectTo') || content.includes('redirectTo')) {
          expect(content).toMatch(expectedPattern)
        }
      }
    })
  })

  describe('No direct window access in SSR context', () => {
    it('should wrap window access in client-only checks or use SSR-safe alternatives', () => {
      for (const pagePath of AUTH_PAGES) {
        const content = readAuthPage(pagePath)

        // Check for unprotected window.location.hash (used in verify-email.vue)
        // This should either be:
        // 1. Wrapped in `if (import.meta.client)` or `onMounted`
        // 2. Or use route.hash instead

        // verify-email.vue uses window.location.hash in onMounted, which is OK
        // But if used outside onMounted, it would fail
        if (pagePath === 'pages/auth/verify-email.vue') {
          // This is acceptable because it's inside onMounted callback OR uses route.hash
          const usesRouteHash = content.includes('route.hash')
          const hasHashInMounted = content.includes('onMounted')
            && content.includes('window.location.hash')
          expect(usesRouteHash || hasHashInMounted || !content.includes('window.location.hash')).toBe(true)
        }
      }
    })
  })
})

describe('Redirect URL Safety', () => {
  it('should use useRequestURL for constructing OAuth callback URLs', () => {
    const loginContent = readAuthPage('pages/auth/login.vue')

    // OAuth should use SSR-safe URL construction
    if (loginContent.includes('signInWithOAuth')) {
      expect(loginContent).toContain('useRequestURL')
    }
  })

  it('should use useRequestURL for magic link redirect URLs', () => {
    const loginContent = readAuthPage('pages/auth/login.vue')

    // Magic link should use SSR-safe URL construction
    if (loginContent.includes('signInWithOtp')) {
      expect(loginContent).toContain('useRequestURL')
    }
  })

  it('should use useRequestURL for email verification redirect URLs', () => {
    const verifyContent = readAuthPage('pages/auth/verify-email.vue')
    const pendingContent = readAuthPage('pages/auth/verification-pending.vue')

    // Both pages that resend verification should use SSR-safe URLs
    expect(verifyContent).toContain('useRequestURL')
    expect(pendingContent).toContain('useRequestURL')
  })
})
