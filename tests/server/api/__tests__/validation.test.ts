/**
 * API Route Validation Tests
 *
 * Verifies that all API routes with request bodies have proper Zod validation.
 *
 * REQUIREMENT: Nuxt 4 best practices - use Zod schemas for request validation
 *
 * Why this matters:
 * - Type-safe request validation
 * - Consistent error messages
 * - Prevents invalid data from reaching business logic
 * - Better developer experience with TypeScript inference
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * Routes that should have Zod validation but currently use readBody<T> without it.
 * These are high-priority routes that handle user input.
 */
const ROUTES_REQUIRING_ZOD_VALIDATION = [
  {
    path: 'server/api/orders/track.post.ts',
    description: 'Order tracking - public input validation',
    expectedSchema: 'trackOrderSchema',
  },
  {
    path: 'server/api/admin/orders/[orderId]/notes.post.ts',
    description: 'Order notes - admin input validation',
    expectedSchema: 'createNoteSchema',
  },
  {
    path: 'server/api/landing/sections/index.post.ts',
    description: 'Create landing section - admin input validation',
    expectedSchema: 'createSectionSchema',
  },
  {
    path: 'server/api/landing/sections/[sectionId].put.ts',
    description: 'Update landing section - admin input validation',
    expectedSchema: 'updateSectionSchema',
  },
  {
    path: 'server/api/landing/sections/reorder.post.ts',
    description: 'Reorder landing sections - admin input validation',
    expectedSchema: 'reorderSectionsSchema',
  },
  {
    path: 'server/api/admin/orders/bulk.post.ts',
    description: 'Bulk order operations - admin input validation',
    expectedSchema: 'bulkOrderSchema',
  },
]

/**
 * Check if a file contains proper Zod validation pattern
 */
function hasZodValidation(filePath: string): {
  hasZodImport: boolean
  hasSchema: boolean
  usesSafeParse: boolean
  usesReadValidatedBody: boolean
} {
  const fullPath = join(process.cwd(), filePath)
  if (!existsSync(fullPath)) {
    return {
      hasZodImport: false,
      hasSchema: false,
      usesSafeParse: false,
      usesReadValidatedBody: false,
    }
  }

  const content = readFileSync(fullPath, 'utf-8')

  return {
    hasZodImport: /from ['"]zod['"]/.test(content) || /import.*z.*from ['"]zod['"]/.test(content),
    hasSchema: /z\.object\s*\(/.test(content),
    usesSafeParse: /\.safeParse\s*\(/.test(content),
    usesReadValidatedBody: /readValidatedBody/.test(content),
  }
}

describe('API Route Validation', () => {
  describe('Required Zod validation', () => {
    for (const route of ROUTES_REQUIRING_ZOD_VALIDATION) {
      describe(route.path, () => {
        const validation = hasZodValidation(route.path)

        it(`should have Zod import - ${route.description}`, () => {
          expect(validation.hasZodImport).toBe(true)
        })

        it(`should define a Zod schema - ${route.description}`, () => {
          expect(validation.hasSchema).toBe(true)
        })

        it(`should use safeParse or readValidatedBody - ${route.description}`, () => {
          expect(validation.usesSafeParse || validation.usesReadValidatedBody).toBe(true)
        })
      })
    }
  })

  describe('Existing validated routes should maintain Zod usage', () => {
    const ROUTES_WITH_ZOD = [
      'server/api/newsletter/subscribe.post.ts',
      'server/api/admin/products/index.post.ts',
      'server/api/admin/products/[productId].put.ts',
      'server/api/cart/lock.post.ts',
      'server/api/cart/unlock.post.ts',
    ]

    for (const route of ROUTES_WITH_ZOD) {
      it(`${route} should continue using Zod validation`, () => {
        const validation = hasZodValidation(route)
        expect(validation.hasZodImport).toBe(true)
        expect(validation.hasSchema).toBe(true)
      })
    }
  })
})
