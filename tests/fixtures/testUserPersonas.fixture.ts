/**
 * Playwright Fixtures for Test User Personas
 *
 * Provides reusable fixtures for E2E testing with test personas
 */

import { test as base, expect, type Page } from '@playwright/test'
import type { TestUserPersonaKey } from '~/lib/testing/testUserPersonas'

interface TestUserFixtures {
  testUserPage: TestUserPage
}

class TestUserPage {
  constructor(public readonly page: Page) {}

  /**
   * Navigate to test users page
   */
  async goto() {
    await this.page.goto('/test-users')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Activate a persona by key
   */
  async activatePersona(key: TestUserPersonaKey) {
    await this.goto()

    // Find and click the activate button for the persona
    const personaCard = this.page.locator(`article:has-text("${key}")`)
    const activateButton = personaCard.locator('button:has-text("Activate persona")')

    await activateButton.click()
    await this.page.waitForLoadState('networkidle')

    // Verify persona is activated
    await expect(this.page.locator('.active-persona-panel')).toBeVisible({ timeout: 5000 })
  }

  /**
   * Activate persona via URL parameter
   */
  async activatePersonaViaUrl(key: TestUserPersonaKey, autoStart = true) {
    await this.page.goto(`/test-users?activate=${key}&autoStart=${autoStart}`)
    await this.page.waitForLoadState('networkidle')

    // Verify persona is activated if autoStart is true
    if (autoStart) {
      await expect(this.page.locator('.active-persona-panel')).toBeVisible({ timeout: 5000 })
    }
  }

  /**
   * End current simulation
   */
  async endSimulation() {
    const endButton = this.page.locator('button:has-text("End simulation")')
    await endButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Mark a test script step as complete
   */
  async completeStep(stepIndex: number) {
    const checkbox = this.page.locator(`input[type="checkbox"]#step-${stepIndex}`)
    await checkbox.check()
  }

  /**
   * Add a note to a test script step
   */
  async addNoteToStep(stepIndex: number, note: string) {
    const stepCard = this.page.locator(`.test-script-step-${stepIndex}`)
    const addNoteButton = stepCard.locator('button:has-text("Add note")')

    // Click add note if it exists
    if (await addNoteButton.isVisible()) {
      await addNoteButton.click()
    }

    const textarea = stepCard.locator('textarea')
    await textarea.fill(note)
  }

  /**
   * Get completion percentage
   */
  async getCompletionPercentage(): Promise<number> {
    const progressText = await this.page.locator('.completion-percentage').textContent()
    const match = progressText?.match(/(\d+)%/)
    return match ? parseInt(match[1], 10) : 0
  }

  /**
   * Search personas
   */
  async searchPersonas(query: string) {
    const searchInput = this.page.locator('input[placeholder="Search personas..."]')
    await searchInput.fill(query)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Filter by focus area
   */
  async filterByFocusArea(area: string) {
    const filterSelect = this.page.locator('select').first()
    await filterSelect.selectOption(area)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get list of visible personas
   */
  async getVisiblePersonas(): Promise<string[]> {
    const personaCards = this.page.locator('article')
    const count = await personaCards.count()
    const titles: string[] = []

    for (let i = 0; i < count; i++) {
      const titleElement = personaCards.nth(i).locator('h3')
      const title = await titleElement.textContent()
      if (title) titles.push(title)
    }

    return titles
  }

  /**
   * Verify persona is active
   */
  async verifyPersonaActive(expectedTitle: string) {
    await expect(this.page.locator('.active-persona-panel')).toContainText(expectedTitle)
  }

  /**
   * Verify no persona is active
   */
  async verifyNoPersonaActive() {
    await expect(this.page.locator('.active-persona-panel')).not.toBeVisible()
  }

  /**
   * Clear progress for current persona
   */
  async clearProgress() {
    const clearButton = this.page.locator('button:has-text("Clear progress")')
    await clearButton.click()
  }

  /**
   * Navigate via quick link
   */
  async clickQuickLink(label: string) {
    const quickLink = this.page.locator(`.quick-links a:has-text("${label}")`)
    await quickLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Clear lockout timer
   */
  async clearLockout() {
    const clearLockoutButton = this.page.locator('button:has-text("Clear lockout timer")')
    if (await clearLockoutButton.isVisible()) {
      await clearLockoutButton.click()
    }
  }

  /**
   * Use keyboard shortcut
   */
  async useKeyboardShortcut(key: string, modifiers: ('Control' | 'Shift' | 'Meta')[] = []) {
    await this.page.keyboard.press([...modifiers, key].join('+'))
    await this.page.waitForLoadState('networkidle')
  }
}

// Extend Playwright test with custom fixtures
export const test = base.extend<TestUserFixtures>({
  testUserPage: async ({ page }, use) => {
    const testUserPage = new TestUserPage(page)
    await use(testUserPage)
  },
})

export { expect } from '@playwright/test'
