import { test as base, expect } from '@playwright/test'
import type { Page, BrowserContext } from '@playwright/test'
import { generateSecurePassword } from '../utils/generateSecurePassword'

export interface TestUser {
  email: string
  password: string
  name: string
  locale: string
}

export interface TestProduct {
  id: string
  name: string
  price: number
  category: string
}

export interface AdminUser {
  email: string
  password: string
  name: string
  role: 'admin'
}

export interface TestFixtures {
  authenticatedPage: Page
  adminPage: Page
  testUser: TestUser
  adminUser: AdminUser
  testProducts: TestProduct[]
  locale: string
  resetDatabase: () => Promise<void>
  seedDatabase: () => Promise<void>
}

export const test = base.extend<TestFixtures>({
  locale: async (_fixtures, use, testInfo) => {
    const projectName = testInfo.project.name
    const locale = projectName.split('-')[1] || 'es'
    await use(locale)
  },

  testUser: async ({ locale }, use) => {
    const user: TestUser = {
      email: process.env.TEST_USER_EMAIL || `test-${locale}@example.test`,
      password: process.env.TEST_USER_PASSWORD || generateSecurePassword(),
      name: `Test User ${locale.toUpperCase()}`,
      locale,
    }
    await use(user)
  },

  adminUser: async (_fixtures, use) => {
    const admin: AdminUser = {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.test',
      password: process.env.TEST_ADMIN_PASSWORD || generateSecurePassword(),
      name: 'Admin User',
      role: 'admin',
    }
    await use(admin)
  },

  testProducts: async (_fixtures, use) => {
    const products: TestProduct[] = [
      {
        id: 'prod-1',
        name: 'Moldovan Wine - Purcari',
        price: 24.99,
        category: 'wine',
      },
      {
        id: 'prod-2',
        name: 'Traditional Plăcintă',
        price: 8.50,
        category: 'food',
      },
      {
        id: 'prod-3',
        name: 'Honey from Moldova',
        price: 12.00,
        category: 'food',
      },
    ]
    await use(products)
  },

  authenticatedPage: async ({ page }, use) => {
    // Storage state is automatically applied from playwright.config.ts
    // The page should already be authenticated via the storage state
    // Just navigate to the homepage to activate the session
    await page.goto('/')

    // Verify that we're actually authenticated
    // Check for an auth indicator in the UI (e.g., user menu, account link)
    const isAuthenticated = await page.locator('[data-testid="user-menu"]').isVisible({ timeout: 5000 })
      .catch(() => false)

    if (!isAuthenticated) {
      throw new Error('Authentication failed - storage state may be invalid or expired')
    }

    await use(page)
  },

  adminPage: async ({ page, adminUser, baseURL }, use) => {
    await page.goto(`${baseURL}/login`)

    await page.fill('[data-testid="email-input"]', adminUser.email)
    await page.fill('[data-testid="password-input"]', adminUser.password)
    await page.click('[data-testid="login-button"]')

    // Wait for redirect after login (admin should go to /admin or /account)
    await page.waitForURL(/\/(admin|account|$)/)

    // Handle MFA if required (skip for now, may need to be added based on actual implementation)
    // TODO: Add MFA handling if admin routes require it

    await use(page)
  },

  resetDatabase: async ({ page, baseURL }, use) => {
    const reset = async () => {
      const response = await page.request.post(`${baseURL}/api/test/reset-db`, {
        headers: {
          'X-Test-Mode': 'true',
        },
      })
      expect(response.ok()).toBeTruthy()
    }
    await use(reset)
  },

  seedDatabase: async ({ page, baseURL, testProducts, testUser }, use) => {
    const seed = async () => {
      const response = await page.request.post(`${baseURL}/api/test/seed-db`, {
        headers: {
          'X-Test-Mode': 'true',
        },
        data: {
          users: [testUser],
          products: testProducts,
        },
      })
      expect(response.ok()).toBeTruthy()
    }
    await use(seed)
  },
})

export { expect }
