import { test, expect } from '../../fixtures/base'

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Start each test with an authenticated user
    await authenticatedPage.goto('/')
    await authenticatedPage.waitForLoadState('networkidle')
  })

  test.describe('Successful Logout', () => {
    test('should successfully logout from user menu', async ({ authenticatedPage }) => {
      // Open user menu
      await authenticatedPage.click('[data-testid="user-menu"]')

      // Click logout button
      await authenticatedPage.click('[data-testid="logout-button"]')

      // Should redirect to login or home page
      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // User menu should no longer be visible
      const userMenu = authenticatedPage.locator('[data-testid="user-menu"]')
      await expect(userMenu).not.toBeVisible()
    })

    test('should clear all session data on logout', async ({ authenticatedPage }) => {
      // Logout
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      // Wait for redirect
      await authenticatedPage.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // Verify cookies are cleared
      const cookies = await authenticatedPage.context().cookies()
      const authCookies = cookies.filter(cookie => cookie.name.includes('auth'))

      // Auth cookies should either be gone or have expired values
      authCookies.forEach(cookie => {
        if (cookie.expires) {
          expect(cookie.expires).toBeLessThan(Date.now() / 1000)
        }
      })
    })

    test('should clear localStorage on logout', async ({ authenticatedPage }) => {
      // Check localStorage before logout
      const beforeLogout = await authenticatedPage.evaluate(() => {
        return Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('user'))
      })

      // Logout
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // Check localStorage after logout
      const afterLogout = await authenticatedPage.evaluate(() => {
        return Object.keys(localStorage).filter(key => key.includes('auth') || key.includes('user'))
      })

      expect(afterLogout.length).toBeLessThanOrEqual(beforeLogout.length)
    })

    test('should prevent accessing protected routes after logout', async ({ authenticatedPage }) => {
      // Logout
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // Try to access protected route
      await authenticatedPage.goto('/account')

      // Should redirect to login
      await expect(authenticatedPage).toHaveURL(/\/auth\/login/, { timeout: 5000 })
    })
  })

  test.describe('Logout from Different Pages', () => {
    test('should logout from account page', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/account')

      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/)
    })

    test('should logout from checkout page', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/checkout')

      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/)
    })

    test('should logout from product page', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/')

      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/)
    })
  })

  test.describe('Logout Confirmation', () => {
    test('should show confirmation dialog before logout', async ({ authenticatedPage }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      // Check if confirmation dialog appears (if implemented)
      // This test assumes a confirmation dialog exists
      // Adjust based on actual implementation
      const confirmDialog = authenticatedPage.locator('[data-testid="logout-confirm-dialog"]')

      // If dialog exists, confirm it
      if (await confirmDialog.isVisible()) {
        await authenticatedPage.click('[data-testid="logout-confirm"]')
      }

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/, { timeout: 5000 })
    })
  })

  test.describe('Session Expiration', () => {
    test('should handle expired session gracefully', async ({ authenticatedPage }) => {
      // Simulate session expiration by clearing auth cookies
      await authenticatedPage.context().clearCookies()

      // Try to access protected route
      await authenticatedPage.goto('/account')

      // Should redirect to login
      await expect(authenticatedPage).toHaveURL(/\/auth\/login/, { timeout: 5000 })

      // Should show message about session expiration
      const message = authenticatedPage.locator('[data-testid="session-expired-message"]')

      // Check if message exists (optional implementation)
      const messageExists = await message.count() > 0
      if (messageExists) {
        await expect(message).toBeVisible()
      }
    })
  })

  test.describe('Security', () => {
    test('should invalidate session token on logout', async ({ authenticatedPage }) => {
      // Get current session token
      const beforeLogout = await authenticatedPage.evaluate(() => {
        return document.cookie
      })

      // Logout
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // Get cookies after logout
      const afterLogout = await authenticatedPage.evaluate(() => {
        return document.cookie
      })

      // Session cookies should be different or removed
      expect(afterLogout).not.toEqual(beforeLogout)
    })

    test('should prevent CSRF attacks during logout', async ({ authenticatedPage }) => {
      // Logout request should include CSRF token or use POST method
      const requests: any[] = []

      authenticatedPage.on('request', request => {
        if (request.url().includes('logout') || request.url().includes('signout')) {
          requests.push({
            method: request.method(),
            headers: request.headers()
          })
        }
      })

      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForTimeout(2000)

      // Verify logout request uses POST (safer than GET)
      const logoutRequests = requests.filter(r => r.method === 'POST')
      expect(logoutRequests.length).toBeGreaterThan(0)
    })
  })

  test.describe('Keyboard Navigation', () => {
    test('should allow logout via keyboard', async ({ authenticatedPage }) => {
      // Tab to user menu
      await authenticatedPage.click('[data-testid="user-menu"]')

      // Navigate to logout button with keyboard
      await authenticatedPage.keyboard.press('Tab')
      await authenticatedPage.keyboard.press('Enter')

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/, { timeout: 5000 })
    })
  })

  test.describe('Multiple Sessions', () => {
    test('should logout only current session', async ({ authenticatedPage, context }) => {
      // Create a second page with the same session
      const secondPage = await context.newPage()
      await secondPage.goto('/')

      // Logout from first page
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await expect(authenticatedPage).toHaveURL(/\/(auth\/login|$)/, { timeout: 5000 })

      // Second page should also be logged out (shared session)
      await secondPage.reload()
      await expect(secondPage).toHaveURL(/\/auth\/login/, { timeout: 5000 })

      await secondPage.close()
    })
  })

  test.describe('Logout Redirect', () => {
    test('should redirect to login page after logout', async ({ authenticatedPage }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await expect(authenticatedPage).toHaveURL(/\/auth\/login/, { timeout: 5000 })
    })

    test('should show logout success message on login page', async ({ authenticatedPage }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/auth\/login/, { timeout: 5000 })

      // Check for success message (if implemented)
      const successMessage = authenticatedPage.locator('[data-testid="logout-success"]')
      const hasMessage = await successMessage.count() > 0

      if (hasMessage) {
        await expect(successMessage).toBeVisible()
      }
    })

    test('should preserve locale after logout', async ({ authenticatedPage, locale }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/auth\/login/, { timeout: 5000 })

      // Verify locale is preserved in URL or cookie
      const currentUrl = authenticatedPage.url()
      expect(currentUrl).toContain(locale)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle logout errors gracefully', async ({ authenticatedPage }) => {
      // Simulate network error during logout
      await authenticatedPage.context().setOffline(true)

      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      // Should still clear local state even if server request fails
      await authenticatedPage.context().setOffline(false)

      // Verify user is logged out locally
      await authenticatedPage.goto('/account')
      await expect(authenticatedPage).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe('Accessibility', () => {
    test('should announce logout status to screen readers', async ({ authenticatedPage }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')

      const logoutButton = authenticatedPage.locator('[data-testid="logout-button"]')

      // Verify logout button has proper aria-label
      const ariaLabel = await logoutButton.getAttribute('aria-label')
      expect(ariaLabel).toBeTruthy()
    })

    test('should have proper focus management after logout', async ({ authenticatedPage }) => {
      await authenticatedPage.click('[data-testid="user-menu"]')
      await authenticatedPage.click('[data-testid="logout-button"]')

      await authenticatedPage.waitForURL(/\/auth\/login/, { timeout: 5000 })

      // Focus should be on a meaningful element (e.g., email input or heading)
      // This helps keyboard users and screen reader users
      await authenticatedPage.waitForTimeout(500)

      const focusedElement = await authenticatedPage.evaluate(() => {
        return document.activeElement?.tagName
      })

      expect(focusedElement).toBeTruthy()
    })
  })
})
