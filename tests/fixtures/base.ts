import { test as base, expect } from '@playwright/test'
import type { Page, BrowserContext } from '@playwright/test'

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

export interface TestFixtures {
  authenticatedPage: Page
  testUser: TestUser
  testProducts: TestProduct[]
  locale: string
  resetDatabase: () => Promise<void>
  seedDatabase: () => Promise<void>
}

export const test = base.extend<TestFixtures>({
  locale: async ({}, use, testInfo) => {
    const projectName = testInfo.project.name
    const locale = projectName.split('-')[1] || 'es'
    await use(locale)
  },

  testUser: async ({ locale }, use) => {
    const user: TestUser = {
      email: `test-${locale}@moldovadirect.com`,
      password: 'Test123!@#',
      name: `Test User ${locale.toUpperCase()}`,
      locale,
    }
    await use(user)
  },

  testProducts: async ({}, use) => {
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

  authenticatedPage: async ({ page, testUser, baseURL }, use) => {
    await page.goto(`${baseURL}/login`)
    
    await page.fill('[data-testid="email-input"]', testUser.email)
    await page.fill('[data-testid="password-input"]', testUser.password)
    await page.click('[data-testid="login-button"]')
    
    await page.waitForURL(`${baseURL}/dashboard`)
    
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