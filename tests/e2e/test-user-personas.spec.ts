/**
 * E2E Tests for Test User Personas
 *
 * Tests the test user simulation feature end-to-end
 */

import { test, expect } from '../fixtures/testUserPersonas.fixture'

test.describe('Test User Personas', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure test users are enabled
    await page.addInitScript(() => {
      window.localStorage.setItem('test-users-enabled', 'true')
    })
  })

  test('should load test users page', async ({ testUserPage }) => {
    await testUserPage.goto()
    await expect(testUserPage.page).toHaveTitle(/Test Users Simulator/)
  })

  test('should activate persona', async ({ testUserPage }) => {
    await testUserPage.activatePersona('first-order-explorer')
    await testUserPage.verifyPersonaActive('First Order Explorer')
  })

  test('should activate persona via URL parameter', async ({ testUserPage }) => {
    await testUserPage.activatePersonaViaUrl('vip-customer', true)
    await testUserPage.verifyPersonaActive('VIP Customer')
  })

  test('should end simulation', async ({ testUserPage }) => {
    await testUserPage.activatePersona('loyal-subscriber')
    await testUserPage.verifyPersonaActive('Loyal Subscriber')

    await testUserPage.endSimulation()
    await testUserPage.verifyNoPersonaActive()
  })

  test('should complete test script steps', async ({ testUserPage }) => {
    await testUserPage.activatePersona('first-order-explorer')

    // Complete first two steps
    await testUserPage.completeStep(0)
    await testUserPage.completeStep(1)

    // Verify completion percentage updated
    const percentage = await testUserPage.getCompletionPercentage()
    expect(percentage).toBeGreaterThan(0)
  })

  test('should add notes to test script steps', async ({ testUserPage }) => {
    await testUserPage.activatePersona('recovery-seeker')

    await testUserPage.addNoteToStep(0, 'Found issue: lockout message not translated')

    // Verify note appears
    await expect(testUserPage.page.locator('textarea')).toHaveValue(
      'Found issue: lockout message not translated'
    )
  })

  test('should search personas', async ({ testUserPage }) => {
    await testUserPage.goto()

    await testUserPage.searchPersonas('cart')

    const visiblePersonas = await testUserPage.getVisiblePersonas()
    expect(visiblePersonas.length).toBe(1)
    expect(visiblePersonas[0]).toContain('Cart Abandoner')
  })

  test('should filter personas by focus area', async ({ testUserPage }) => {
    await testUserPage.goto()

    await testUserPage.filterByFocusArea('Mobile UX')

    const visiblePersonas = await testUserPage.getVisiblePersonas()
    expect(visiblePersonas.some((p) => p.includes('Mobile'))).toBe(true)
  })

  test('should use keyboard shortcuts', async ({ testUserPage }) => {
    await testUserPage.activatePersona('bulk-buyer')
    await testUserPage.verifyPersonaActive('Bulk Buyer')

    // Use Ctrl+Shift+E to end simulation
    await testUserPage.useKeyboardShortcut('E', ['Control', 'Shift'])

    // Verify simulation ended
    await testUserPage.verifyNoPersonaActive()
  })

  test('should activate persona using number keys', async ({ testUserPage }) => {
    await testUserPage.goto()

    // Press '1' to activate first persona
    await testUserPage.page.keyboard.press('1')

    // Verify first persona is activated
    await expect(testUserPage.page.locator('.active-persona-panel')).toBeVisible()
  })

  test('should use console dev tools', async ({ testUserPage }) => {
    await testUserPage.goto()

    // Use console command to activate persona
    const result = await testUserPage.useConsoleCommand('window.$testUsers.activate("vip-customer")')
    expect(result).toBe(true)

    await testUserPage.verifyPersonaActive('VIP Customer')
  })

  test('should clear progress', async ({ testUserPage }) => {
    await testUserPage.activatePersona('first-order-explorer')

    // Complete some steps
    await testUserPage.completeStep(0)
    await testUserPage.completeStep(1)

    // Clear progress
    await testUserPage.clearProgress()

    // Verify completion percentage is 0
    const percentage = await testUserPage.getCompletionPercentage()
    expect(percentage).toBe(0)
  })

  test('should persist progress across page reloads', async ({ testUserPage }) => {
    await testUserPage.activatePersona('international-shopper')

    // Complete a step
    await testUserPage.completeStep(0)

    // Reload page
    await testUserPage.page.reload()

    // Verify step is still completed
    const checkbox = testUserPage.page.locator('input[type="checkbox"]#step-0')
    await expect(checkbox).toBeChecked()
  })

  test('should clear lockout timer', async ({ testUserPage }) => {
    await testUserPage.activatePersona('recovery-seeker')

    // Lockout should be visible for recovery-seeker persona
    await expect(testUserPage.page.locator(':text("Lockout timer")')).toBeVisible()

    // Clear lockout
    await testUserPage.clearLockout()

    // Verify lockout cleared (button should no longer be visible)
    await expect(testUserPage.page.locator('button:has-text("Clear lockout timer")')).not.toBeVisible()
  })

  test('should navigate via quick links', async ({ testUserPage }) => {
    await testUserPage.activatePersona('loyal-subscriber')

    // Click on a quick link
    await testUserPage.clickQuickLink('Recent orders')

    // Verify navigation occurred
    await expect(testUserPage.page).toHaveURL(/\/account\/orders/)
  })
})

test.describe('Test User Personas - Error Handling', () => {
  test('should handle invalid persona key in URL', async ({ testUserPage, page }) => {
    await page.goto('/test-users?activate=invalid-key&autoStart=true')
    await page.waitForLoadState('networkidle')

    // Should show error toast
    await expect(page.locator(':text("Invalid persona")')).toBeVisible({ timeout: 5000 })
  })

  test('should show "no results" when search has no matches', async ({ testUserPage }) => {
    await testUserPage.goto()

    await testUserPage.searchPersonas('xyz nonexistent persona')

    // Verify "no results" message
    await expect(testUserPage.page.locator(':text("No personas match")')).toBeVisible()
  })
})
