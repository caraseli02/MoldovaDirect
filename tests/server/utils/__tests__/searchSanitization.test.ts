/**
 * Tests for Search Sanitization Utility
 *
 * Covers:
 * - Special character escaping (%, _, \, ', ,)
 * - Input length validation
 * - Search pattern preparation
 * - Edge cases and security scenarios
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeSearchTerm,
  validateSearchLength,
  validateMinSearchLength,
  prepareSearchPattern,
  MAX_SEARCH_LENGTH,
} from '~/server/utils/searchSanitization'

describe('searchSanitization', () => {
  describe('sanitizeSearchTerm', () => {
    it('should escape percent signs (ILIKE wildcard)', () => {
      expect(sanitizeSearchTerm('50% off')).toBe('50\\% off')
      expect(sanitizeSearchTerm('100%')).toBe('100\\%')
    })

    it('should escape underscores (ILIKE wildcard)', () => {
      expect(sanitizeSearchTerm('product_name')).toBe('product\\_name')
      expect(sanitizeSearchTerm('test_123_abc')).toBe('test\\_123\\_abc')
    })

    it('should escape backslashes', () => {
      expect(sanitizeSearchTerm('path\\to\\file')).toBe('path\\\\to\\\\file')
      expect(sanitizeSearchTerm('C:\\Users')).toBe('C:\\\\Users')
    })

    it('should escape single quotes (SQL delimiter)', () => {
      expect(sanitizeSearchTerm('wine\'s best')).toBe('wine\'\'s best')
      expect(sanitizeSearchTerm('O\'Reilly')).toBe('O\'\'Reilly')
    })

    it('should escape commas (Supabase .or() separator)', () => {
      expect(sanitizeSearchTerm('red, wine')).toBe('red\\, wine')
      expect(sanitizeSearchTerm('10,000')).toBe('10\\,000')
    })

    it('should handle multiple special characters together', () => {
      const input = '50% off, wine\'s best_seller\\new'
      const expected = '50\\% off\\, wine\'\'s best\\_seller\\\\new'
      expect(sanitizeSearchTerm(input)).toBe(expected)
    })

    it('should handle empty strings', () => {
      expect(sanitizeSearchTerm('')).toBe('')
    })

    it('should handle strings with no special characters', () => {
      expect(sanitizeSearchTerm('simple search')).toBe('simple search')
      expect(sanitizeSearchTerm('product123')).toBe('product123')
    })

    it('should preserve order of escaping (backslash first)', () => {
      // This tests that backslash is escaped before other characters
      // that might add backslashes, preventing double-escaping issues
      const input = '\\%'
      const output = sanitizeSearchTerm(input)
      // Should be: \\ (escaped backslash) + \% (escaped percent)
      expect(output).toBe('\\\\\\%')
    })
  })

  describe('validateSearchLength', () => {
    it('should not throw for valid length strings', () => {
      expect(() => validateSearchLength('short')).not.toThrow()
      expect(() => validateSearchLength('a'.repeat(MAX_SEARCH_LENGTH))).not.toThrow()
    })

    it('should throw for strings exceeding max length', () => {
      const tooLong = 'a'.repeat(MAX_SEARCH_LENGTH + 1)
      expect(() => validateSearchLength(tooLong)).toThrow()
    })

    it('should use custom max length when provided', () => {
      expect(() => validateSearchLength('12345', 5)).not.toThrow()
      expect(() => validateSearchLength('123456', 5)).toThrow()
    })

    it('should throw with correct error message', () => {
      const tooLong = 'a'.repeat(MAX_SEARCH_LENGTH + 1)
      try {
        validateSearchLength(tooLong)
        expect.fail('Should have thrown error')
      }
      catch (error: any) {
        expect(error.statusCode).toBe(400)
        expect(error.statusMessage).toContain('Search term too long')
        expect(error.statusMessage).toContain(String(MAX_SEARCH_LENGTH))
      }
    })
  })

  describe('validateMinSearchLength', () => {
    it('should return true for strings meeting minimum length', () => {
      expect(validateMinSearchLength('ab')).toBe(true)
      expect(validateMinSearchLength('abc')).toBe(true)
      expect(validateMinSearchLength('  abc  ')).toBe(true) // trimmed
    })

    it('should return false for strings below minimum length', () => {
      expect(validateMinSearchLength('')).toBe(false)
      expect(validateMinSearchLength('a')).toBe(false)
      expect(validateMinSearchLength('  ')).toBe(false) // only spaces
    })

    it('should use custom minimum length when provided', () => {
      expect(validateMinSearchLength('abc', 3)).toBe(true)
      expect(validateMinSearchLength('ab', 3)).toBe(false)
    })

    it('should trim whitespace before checking length', () => {
      expect(validateMinSearchLength('  a  ', 2)).toBe(false)
      expect(validateMinSearchLength('  ab  ', 2)).toBe(true)
    })
  })

  describe('prepareSearchPattern', () => {
    it('should sanitize and wrap with wildcards by default', () => {
      expect(prepareSearchPattern('test')).toBe('%test%')
      expect(prepareSearchPattern('50%')).toBe('%50\\%%')
    })

    it('should sanitize without wildcards when requested', () => {
      expect(prepareSearchPattern('test', { wrapWithWildcards: false })).toBe('test')
      expect(prepareSearchPattern('50%', { wrapWithWildcards: false })).toBe('50\\%')
    })

    it('should validate length by default', () => {
      const tooLong = 'a'.repeat(MAX_SEARCH_LENGTH + 1)
      expect(() => prepareSearchPattern(tooLong)).toThrow()
    })

    it('should skip validation when requested', () => {
      const tooLong = 'a'.repeat(MAX_SEARCH_LENGTH + 1)
      expect(() => prepareSearchPattern(tooLong, { validateLength: false })).not.toThrow()
    })

    it('should use custom max length when provided', () => {
      expect(() => prepareSearchPattern('12345', { maxLength: 5 })).not.toThrow()
      expect(() => prepareSearchPattern('123456', { maxLength: 5 })).toThrow()
    })

    it('should handle complex real-world examples', () => {
      // Search for "10,000 products"
      expect(prepareSearchPattern('10,000')).toBe('%10\\,000%')

      // Search for "50% discount"
      expect(prepareSearchPattern('50% discount')).toBe('%50\\% discount%')

      // Search for "O'Reilly's book"
      expect(prepareSearchPattern('O\'Reilly\'s')).toBe('%O\'\'Reilly\'\'s%')

      // Search for "red, white, blue"
      expect(prepareSearchPattern('red, white')).toBe('%red\\, white%')
    })
  })

  describe('SQL injection prevention', () => {
    it('should prevent SQL injection via percent wildcard abuse', () => {
      // Attacker tries to match everything with %%
      const malicious = '%%'
      const safe = sanitizeSearchTerm(malicious)
      expect(safe).toBe('\\%\\%')
      expect(safe).not.toContain('%%')
    })

    it('should prevent SQL injection via quote escaping', () => {
      // Attacker tries to break out of string with quotes
      const malicious = '\'; DROP TABLE products; --'
      const safe = sanitizeSearchTerm(malicious)
      expect(safe).toContain('\'\'') // Quotes should be escaped
      expect(safe).toBe('\'\'; DROP TABLE products; --') // Full expected result
      // The single quote at the start is escaped to '', making it safe in SQL strings
    })

    it('should prevent wildcard-based denial of service', () => {
      // Many wildcards could cause slow regex matching
      const malicious = '_%_%_%_%_%'
      const safe = sanitizeSearchTerm(malicious)
      expect(safe).toBe('\\_\\%\\_\\%\\_\\%\\_\\%\\_\\%')
      expect(safe).not.toMatch(/[^\\]%/) // No unescaped %
      expect(safe).not.toMatch(/[^\\]_/) // No unescaped _
    })

    it('should handle backslash-based escape attempts', () => {
      // Attacker tries to use backslash to escape our escaping
      const malicious = '\\\' OR 1=1 --'
      const safe = sanitizeSearchTerm(malicious)
      expect(safe).toBe('\\\\\'\' OR 1=1 --')
      // The backslash is escaped, and the quote is escaped
    })
  })

  describe('Supabase .or() filter integration', () => {
    it('should produce patterns safe for .or() filter strings', () => {
      const userInput = '10,000 products'
      const pattern = prepareSearchPattern(userInput)

      // Simulate how it would be used in .or() filter
      const orFilter = `name.ilike.${pattern},description.ilike.${pattern}`

      // Commas in the pattern should be escaped so they don't break the filter
      expect(pattern).toContain('\\,')
      expect(orFilter).toContain('10\\,000')
    })

    it('should handle comma-separated search terms', () => {
      const userInput = 'red, white, blue'
      const pattern = prepareSearchPattern(userInput)

      expect(pattern).toBe('%red\\, white\\, blue%')
      // All commas escaped so they're literal search characters
    })
  })

  describe('Edge cases', () => {
    it('should handle unicode characters', () => {
      expect(sanitizeSearchTerm('café')).toBe('café')
      expect(sanitizeSearchTerm('日本語')).toBe('日本語')
      expect(sanitizeSearchTerm('emoji 🍷')).toBe('emoji 🍷')
    })

    it('should handle mixed content', () => {
      const input = 'Product "ABC-123" (50% off) - $10.99'
      const output = sanitizeSearchTerm(input)
      expect(output).toContain('50\\%')
      expect(output).toContain('(50\\% off)')
    })

    it('should handle very short strings', () => {
      expect(prepareSearchPattern('a', { validateLength: false })).toBe('%a%')
      expect(prepareSearchPattern('%', { validateLength: false })).toBe('%\\%%')
    })

    it('should handle strings at exactly max length', () => {
      const exactLength = 'a'.repeat(MAX_SEARCH_LENGTH)
      expect(() => prepareSearchPattern(exactLength)).not.toThrow()
    })
  })
})
