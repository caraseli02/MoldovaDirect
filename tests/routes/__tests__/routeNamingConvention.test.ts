/**
 * Route Naming Convention Tests
 *
 * Verifies that all dynamic route parameters use descriptive names
 * instead of generic [id] params for better code readability.
 *
 * REQUIREMENT: Nuxt 4 best practices - use descriptive route param names
 *
 * Why this matters:
 * - [orderId] is clearer than [id] in /orders/[id]
 * - Prevents confusion when multiple params exist
 * - Improves code maintainability and debugging
 */

import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Recursively find all files and directories matching a pattern
 */
function findFilesRecursive(dir: string, pattern: RegExp, results: string[] = []): string[] {
  try {
    const items = readdirSync(dir)
    for (const item of items) {
      const fullPath = join(dir, item)
      try {
        const stat = statSync(fullPath)
        if (pattern.test(item)) {
          results.push(fullPath)
        }
        if (stat.isDirectory()) {
          findFilesRecursive(fullPath, pattern, results)
        }
      }
      catch {
        // Skip inaccessible files
      }
    }
  }
  catch {
    // Skip inaccessible directories
  }
  return results
}

/**
 * Find all directories and files with [id] in the name
 */
function findGenericIdRoutes(): string[] {
  const results: string[] = []
  const pattern = /\[id\]/

  // Search in pages and server/api
  for (const dir of ['pages', 'server/api']) {
    const fullDir = join(process.cwd(), dir)
    if (existsSync(fullDir)) {
      findFilesRecursive(fullDir, pattern, results)
    }
  }

  return results
}

describe('Route Naming Convention', () => {
  describe('No generic [id] params', () => {
    it('should not have any routes with generic [id] directory names', () => {
      const genericRoutes = findGenericIdRoutes()

      // Filter to only directories (not files in [id] directories)
      const genericDirs = genericRoutes.filter((r) => {
        return r.includes('[id]') && !r.includes('[id]/')
      })

      // This test SHOULD FAIL initially (TDD RED phase)
      // All routes should use descriptive names like [orderId], [productId]
      expect(genericDirs).toEqual([])
    })

    it('should not have any page files named [id].vue', () => {
      const pagesWithGenericId = [
        'pages/admin/products/[id].vue',
        'pages/admin/orders/[id].vue',
        'pages/account/orders/[id].vue',
      ]

      const existingGenericPages = pagesWithGenericId.filter(p =>
        existsSync(join(process.cwd(), p)),
      )

      expect(existingGenericPages).toEqual([])
    })

    it('should not have any API routes with [id] directories', () => {
      const apiRoutesWithGenericId = [
        'server/api/admin/products/[id]',
        'server/api/admin/users/[id]',
        'server/api/admin/orders/[id]',
        'server/api/admin/email-logs/[id]',
        'server/api/orders/[id]',
      ]

      const existingGenericRoutes = apiRoutesWithGenericId.filter(r =>
        existsSync(join(process.cwd(), r)),
      )

      expect(existingGenericRoutes).toEqual([])
    })
  })

  describe('Descriptive route params', () => {
    it('product routes should use [productId]', () => {
      const productPageExists = existsSync(join(process.cwd(), 'pages/admin/products/[productId].vue'))
      const productApiExists = existsSync(join(process.cwd(), 'server/api/admin/products/[productId]'))

      expect(productPageExists).toBe(true)
      expect(productApiExists).toBe(true)
    })

    it('order routes should use [orderId]', () => {
      const adminOrderPageExists = existsSync(join(process.cwd(), 'pages/admin/orders/[orderId].vue'))
      const accountOrderPageExists = existsSync(join(process.cwd(), 'pages/account/orders/[orderId].vue'))
      const adminOrderApiExists = existsSync(join(process.cwd(), 'server/api/admin/orders/[orderId]'))
      const publicOrderApiExists = existsSync(join(process.cwd(), 'server/api/orders/[orderId]'))

      expect(adminOrderPageExists).toBe(true)
      expect(accountOrderPageExists).toBe(true)
      expect(adminOrderApiExists).toBe(true)
      expect(publicOrderApiExists).toBe(true)
    })

    it('user routes should use [userId]', () => {
      const userApiExists = existsSync(join(process.cwd(), 'server/api/admin/users/[userId]'))

      expect(userApiExists).toBe(true)
    })

    it('email log routes should use [emailLogId]', () => {
      const emailLogApiExists = existsSync(join(process.cwd(), 'server/api/admin/email-logs/[emailLogId]'))

      expect(emailLogApiExists).toBe(true)
    })
  })
})
