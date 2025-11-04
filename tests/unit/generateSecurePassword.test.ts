import { describe, it, expect } from 'vitest'
import { generateSecurePassword } from '../../scripts/generateSecurePassword.mjs'

describe('generateSecurePassword', () => {
  describe('Password Length', () => {
    it('should generate password of correct length (default 16)', () => {
      const password = generateSecurePassword()
      expect(password.length).toBe(16)
    })

    it('should generate password of specified length', () => {
      const lengths = [8, 12, 16, 20, 24, 32, 64]
      lengths.forEach(length => {
        const password = generateSecurePassword(length)
        expect(password.length).toBe(length)
      })
    })

    it('should generate password at minimum length (8)', () => {
      const password = generateSecurePassword(8)
      expect(password.length).toBe(8)
    })

    it('should generate password at maximum length (128)', () => {
      const password = generateSecurePassword(128)
      expect(password.length).toBe(128)
    })
  })

  describe('Character Complexity Requirements', () => {
    it('should include at least one lowercase letter', () => {
      const password = generateSecurePassword(16, true)
      expect(/[a-z]/.test(password)).toBe(true)
    })

    it('should include at least one uppercase letter', () => {
      const password = generateSecurePassword(16, true)
      expect(/[A-Z]/.test(password)).toBe(true)
    })

    it('should include at least one number', () => {
      const password = generateSecurePassword(16, true)
      expect(/[0-9]/.test(password)).toBe(true)
    })

    it('should include at least one symbol when includeSymbols is true', () => {
      const password = generateSecurePassword(16, true)
      const symbolPattern = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/
      expect(symbolPattern.test(password)).toBe(true)
    })

    it('should not include symbols when includeSymbols is false', () => {
      const password = generateSecurePassword(16, false)
      const symbolPattern = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/
      expect(symbolPattern.test(password)).toBe(false)
    })

    it('should include all required character types in every password', () => {
      // Test 50 passwords to ensure consistency
      for (let i = 0; i < 50; i++) {
        const password = generateSecurePassword(16, true)
        expect(/[a-z]/.test(password)).toBe(true)
        expect(/[A-Z]/.test(password)).toBe(true)
        expect(/[0-9]/.test(password)).toBe(true)
        expect(/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/.test(password)).toBe(true)
      }
    })
  })

  describe('Randomness and Uniqueness', () => {
    it('should generate different passwords on each call', () => {
      const passwords = new Set()
      for (let i = 0; i < 100; i++) {
        passwords.add(generateSecurePassword(16))
      }
      // All 100 passwords should be unique
      expect(passwords.size).toBe(100)
    })

    it('should have good entropy distribution', () => {
      // Generate 1000 passwords and check character distribution
      const charCounts = new Map()
      const numPasswords = 1000
      const passwordLength = 20

      for (let i = 0; i < numPasswords; i++) {
        const password = generateSecurePassword(passwordLength, true)
        for (const char of password) {
          charCounts.set(char, (charCounts.get(char) || 0) + 1)
        }
      }

      // We should have a variety of different characters used
      // With 1000 passwords of length 20, we have 20,000 character samples
      // We should see at least 50 different characters from our charset
      expect(charCounts.size).toBeGreaterThan(50)

      // No single character should dominate (basic distribution check)
      const totalChars = numPasswords * passwordLength
      const maxExpectedFrequency = totalChars * 0.05 // No char should be >5% of total
      for (const count of charCounts.values()) {
        expect(count).toBeLessThan(maxExpectedFrequency)
      }
    })
  })

  describe('Input Validation', () => {
    it('should throw error for length below minimum (8)', () => {
      expect(() => generateSecurePassword(7)).toThrow('Password length must be between 8 and 128')
    })

    it('should throw error for length above maximum (128)', () => {
      expect(() => generateSecurePassword(129)).toThrow('Password length must be between 8 and 128')
    })

    it('should throw error for invalid length (NaN)', () => {
      expect(() => generateSecurePassword(NaN)).toThrow('Password length must be a number')
    })

    it('should throw error for invalid length (negative)', () => {
      expect(() => generateSecurePassword(-5)).toThrow('Password length must be between 8 and 128')
    })

    it('should throw error for invalid length (0)', () => {
      expect(() => generateSecurePassword(0)).toThrow('Password length must be between 8 and 128')
    })

    it('should accept valid boolean for includeSymbols', () => {
      expect(() => generateSecurePassword(16, true)).not.toThrow()
      expect(() => generateSecurePassword(16, false)).not.toThrow()
    })
  })

  describe('Security Properties', () => {
    it('should not contain quotes or backslashes (shell/SQL safety)', () => {
      // Generate 100 passwords and ensure none contain dangerous characters
      for (let i = 0; i < 100; i++) {
        const password = generateSecurePassword(20, true)
        expect(password).not.toContain('"')
        expect(password).not.toContain("'")
        expect(password).not.toContain('\\')
      }
    })

    it('should generate passwords with sufficient entropy', () => {
      // 20 character password with charset of ~86 characters
      // log2(86^20) ≈ 130 bits of entropy
      const password = generateSecurePassword(20, true)

      // Verify it has characters from multiple character classes
      let characterClasses = 0
      if (/[a-z]/.test(password)) characterClasses++
      if (/[A-Z]/.test(password)) characterClasses++
      if (/[0-9]/.test(password)) characterClasses++
      if (/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/.test(password)) characterClasses++

      expect(characterClasses).toBe(4)
    })

    it('should use expanded symbol set', () => {
      // Generate many passwords and verify we see symbols beyond just !@#$%^&*
      const allSymbols = new Set()
      const symbolPattern = /[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/

      for (let i = 0; i < 500; i++) {
        const password = generateSecurePassword(20, true)
        for (const char of password) {
          if (symbolPattern.test(char)) {
            allSymbols.add(char)
          }
        }
      }

      // We should see more than the original 8 symbols (!@#$%^&*)
      // The expanded set has 29 symbols
      expect(allSymbols.size).toBeGreaterThan(8)
    })
  })

  describe('Edge Cases', () => {
    it('should handle minimum viable password (8 chars with all types)', () => {
      // This is challenging because we need 4 character types in 8 chars
      const password = generateSecurePassword(8, true)
      expect(password.length).toBe(8)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[0-9]/.test(password)).toBe(true)
      expect(/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/.test(password)).toBe(true)
    })

    it('should handle very long passwords', () => {
      const password = generateSecurePassword(128, true)
      expect(password.length).toBe(128)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[0-9]/.test(password)).toBe(true)
    })

    it('should work without symbols for minimum length', () => {
      const password = generateSecurePassword(8, false)
      expect(password.length).toBe(8)
      expect(/[a-z]/.test(password)).toBe(true)
      expect(/[A-Z]/.test(password)).toBe(true)
      expect(/[0-9]/.test(password)).toBe(true)
      expect(/[!@#$%^&*()\-_=+[\]{}|;:,.<>?/]/.test(password)).toBe(false)
    })
  })

  describe('Performance', () => {
    it('should generate passwords quickly', () => {
      const startTime = performance.now()

      // Generate 1000 passwords
      for (let i = 0; i < 1000; i++) {
        generateSecurePassword(20, true)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Should complete in less than 1 second (very generous)
      expect(duration).toBeLessThan(1000)
    })

    it('should not get stuck in infinite loop for valid inputs', () => {
      // This test ensures the iterative approach with max attempts works
      // Even for the minimum length where meeting requirements is harder
      const password = generateSecurePassword(8, true)
      expect(password.length).toBe(8)
    })
  })
})
