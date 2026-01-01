/**
 * design-4: Tests for auth pages design compliance
 *
 * Verifies that auth pages follow design-guide principles:
 * - No gradient backgrounds (solid colors preferred)
 * - Clean, minimal design
 */

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const authPagesDir = resolve(__dirname, '../../../../pages/auth')

const authPages = [
  'login.vue',
  'register.vue',
  'forgot-password.vue',
  'reset-password.vue',
  'confirm.vue',
  'verification-pending.vue',
]

describe('Auth Pages Design (design-4)', () => {
  describe.each(authPages)('%s', (pageName) => {
    const pagePath = resolve(authPagesDir, pageName)

    it('should exist', () => {
      expect(existsSync(pagePath)).toBe(true)
    })

    it('should NOT have gradient-to-* classes', () => {
      const source = readFileSync(pagePath, 'utf-8')
      const hasGradientTo = /\bbg-gradient-to-(br|bl|tr|tl|t|b|l|r)\b/.test(source)
      expect(hasGradientTo).toBe(false)
    })

    it('should NOT have from-*/via-*/to-* gradient color classes', () => {
      const source = readFileSync(pagePath, 'utf-8')
      const hasFromClass = /\bfrom-[a-zA-Z]/.test(source)
      const hasViaClass = /\bvia-[a-zA-Z]/.test(source)
      const hasToClass = /\bto-[a-zA-Z]/.test(source)

      expect(hasFromClass).toBe(false)
      expect(hasViaClass).toBe(false)
      expect(hasToClass).toBe(false)
    })

    it('should use solid background color', () => {
      const source = readFileSync(pagePath, 'utf-8')
      // Should use solid bg colors like bg-white, bg-gray-*, bg-primary-*
      const hasSolidBg = /\bbg-(white|gray|primary|slate)/.test(source)
      expect(hasSolidBg).toBe(true)
    })
  })
})
