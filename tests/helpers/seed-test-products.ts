/**
 * Seed Test Products for E2E Tests
 *
 * This script ensures that test products exist in the database before running E2E tests.
 * It uses the existing admin seed-data API endpoint to create a minimal set of products.
 */

import type { Page } from '@playwright/test'

export interface SeedProductsOptions {
  baseURL: string
  adminAuthToken?: string
  preset?: 'minimal' | 'development'
}

/**
 * Seed test products using the admin API
 */
export async function seedTestProducts(page: Page, options: SeedProductsOptions): Promise<boolean> {
  const { baseURL, preset = 'minimal' } = options

  try {
    console.log(`📦 Seeding test products (preset: ${preset})...`)

    // Call the seed-data API endpoint
    const response = await page.request.post(`${baseURL}/api/admin/seed-data`, {
      data: {
        preset,
        clearExisting: false, // Don't clear existing data
        categories: true, // Ensure categories exist
        products: 20, // Create 20 products for testing
        users: 0, // Don't create users (handled by global setup)
        orders: 0, // Don't create orders
      },
    })

    if (!response.ok()) {
      const errorText = await response.text()
      console.error(`❌ Failed to seed products: ${response.status()}`)
      console.error(`   Error: ${errorText}`)
      return false
    }

    const result = await response.json()

    if (result.success) {
      const productsCreated = result.results?.steps?.find((s: any) => s.step === 'Create products')?.count || 0
      console.log(`✅ Successfully seeded ${productsCreated} test products`)
      return true
    }
    else {
      console.error(`❌ Seed operation failed: ${result.message}`)
      return false
    }
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ Error seeding test products: ${errorMessage}`)
    return false
  }
}

/**
 * Check if products exist in the database
 */
export async function checkProductsExist(page: Page, baseURL: string): Promise<boolean> {
  try {
    const response = await page.request.get(`${baseURL}/api/products?limit=1`)

    if (!response.ok()) {
      return false
    }

    const data = await response.json()
    return data.products && data.products.length > 0
  }
  catch {
    return false
  }
}

/**
 * Ensure test products exist, seeding if necessary
 */
export async function ensureTestProducts(page: Page, baseURL: string): Promise<void> {
  console.log('🔍 Checking if test products exist...')

  const productsExist = await checkProductsExist(page, baseURL)

  if (productsExist) {
    console.log('✅ Test products already exist')
    return
  }

  console.log('⚠️  No products found, seeding test data...')

  const seeded = await seedTestProducts(page, { baseURL })

  if (!seeded) {
    throw new Error('Failed to seed test products. E2E tests require products in the database.')
  }
}
