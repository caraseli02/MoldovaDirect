import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
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
  adminAuthenticatedPage: Page
  testUser: TestUser
  adminUser: AdminUser
  testProducts: TestProduct[]
  locale: string
  resetDatabase: () => Promise<void>
  seedDatabase: () => Promise<void>
}

export const test = base.extend<TestFixtures>({
  locale: async (use, testInfo) => {
    const projectName = testInfo.project.name
    const locale = projectName.split('-')[1] || 'es'
    await use(locale)
  },

  testUser: async ({ locale }, use) => {
    const user: TestUser = {
      // Use Resend's test address for reliable E2E email testing
      email: process.env.TEST_USER_EMAIL || 'delivered@resend.dev',
      password: process.env.TEST_USER_PASSWORD || generateSecurePassword(),
      name: `Test User ${locale.toUpperCase()}`,
      locale,
    }
    await use(user)
  },

  adminUser: async (use) => {
    const admin: AdminUser = {
      email: process.env.TEST_ADMIN_EMAIL || 'admin@example.test',
      password: process.env.TEST_ADMIN_PASSWORD || generateSecurePassword(),
      name: 'Admin User',
      role: 'admin',
    }
    await use(admin)
  },

  testProducts: async (use) => {
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
    // Navigate to home page to start the session
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Give the page a moment to fully hydrate and set up auth state
    await page.waitForTimeout(500)

    await use(page)
  },

  adminPage: async ({ browser, adminUser, baseURL }, use) => {
    // Create a fresh context without any storage state to ensure clean login
    const context = await browser.newContext()
    const page = await context.newPage()

    await page.goto(`${baseURL}/auth/login`)

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle')

    await page.fill('[data-testid="email-input"]', adminUser.email)
    await page.fill('[data-testid="password-input"]', adminUser.password)
    await page.click('[data-testid="login-button"]')

    // Wait for redirect after login (admin should go to /admin or /account)
    await page.waitForURL(/\/(admin|account|$)/)

    // Handle MFA if required (skip for now, may need to be added based on actual implementation)
    // TODO: Add MFA handling if admin routes require it

    await use(page)

    // Cleanup
    await context.close()
  },

  adminAuthenticatedPage: async ({ browser, baseURL }, use) => {
    // Create a new context with admin storage state
    const context = await browser.newContext({
      storageState: 'tests/fixtures/.auth/admin.json',
      baseURL,
    })
    const page = await context.newPage()

    // Navigate to admin dashboard to activate the session
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')

    // Verify admin authentication by checking for admin navigation
    // Look for admin-specific navigation links that only admins can see
    const isAdmin = await page.locator('a[href="/admin/products"]')
      .or(page.locator('a[href="/admin/inventory"]'))
      .or(page.locator('a[href="/admin/users"]'))
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false)

    if (!isAdmin) {
      throw new Error('Admin authentication failed - storage state may be invalid or user lacks admin role')
    }

    await use(page)

    // Cleanup
    await context.close()
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
