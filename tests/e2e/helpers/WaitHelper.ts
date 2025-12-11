/**
 * Helper: Wait Utilities
 *
 * Provides custom wait utilities for timing-sensitive operations
 */

import { type Page, expect } from '@playwright/test'

export class WaitHelper {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Wait for countdown timer to complete
   * Accounts for initialization delay and countdown duration
   */
  async waitForCountdown(durationMs: number, tolerance: number = 500): Promise<void> {
    await this.page.waitForTimeout(durationMs + tolerance)
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector: string, timeout: number = 5000): Promise<void> {
    const element = this.page.locator(selector)
    await expect(element).not.toBeVisible({ timeout })
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout })
  }

  /**
   * Wait for navigation with pattern
   */
  async waitForNavigationPattern(pattern: RegExp, timeout: number = 10000): Promise<void> {
    await expect(this.page).toHaveURL(pattern, { timeout })
  }

  /**
   * Wait for specific number of requests to complete
   */
  async waitForRequests(urlPattern: string | RegExp, count: number, timeout: number = 10000): Promise<void> {
    let requestCount = 0

    return new Promise((resolve, reject) => {
      const listener = (request: unknown) => {
        const url = request.url()
        const matches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url)

        if (matches) {
          requestCount++
          if (requestCount >= count) {
            this.page.off('request', listener)
            resolve()
          }
        }
      }

      this.page.on('request', listener)

      // Timeout handler
      const timeoutId = setTimeout(() => {
        this.page.off('request', listener)
        reject(new Error(`Timeout waiting for ${count} requests matching ${urlPattern}`))
      }, timeout)

      // Cleanup on resolve
      this.page.once('close', () => {
        clearTimeout(timeoutId)
        this.page.off('request', listener)
      })
    })
  }

  /**
   * Wait with exponential backoff
   */
  async waitWithBackoff(
    condition: () => Promise<boolean>,
    maxAttempts: number = 5,
    initialDelay: number = 100,
  ): Promise<boolean> {
    let delay = initialDelay

    for (let i = 0; i < maxAttempts; i++) {
      if (await condition()) {
        return true
      }

      await this.page.waitForTimeout(delay)
      delay *= 2
    }

    return false
  }

  /**
   * Poll for condition
   */
  async pollFor(
    condition: () => Promise<boolean>,
    interval: number = 100,
    timeout: number = 5000,
  ): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true
      }
      await this.page.waitForTimeout(interval)
    }

    return false
  }
}
