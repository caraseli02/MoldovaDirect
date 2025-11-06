/**
 * Unit tests for email retry service
 * Tests exponential backoff and retry logic
 */

import { describe, it, expect } from 'vitest'
import { calculateRetryDelay, shouldRetryEmail, DEFAULT_EMAIL_RETRY_CONFIG } from '~/types/email'
import type { EmailRetryConfig } from '~/types/email'

describe('Email Retry Service', () => {
  describe('calculateRetryDelay', () => {
    it('should calculate exponential backoff delays correctly', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      }
      
      // First retry: 1000ms * 2^0 = 1000ms (1 second)
      expect(calculateRetryDelay(1, config)).toBe(1000)
      
      // Second retry: 1000ms * 2^1 = 2000ms (2 seconds)
      expect(calculateRetryDelay(2, config)).toBe(2000)
      
      // Third retry: 1000ms * 2^2 = 4000ms (4 seconds)
      expect(calculateRetryDelay(3, config)).toBe(4000)
    })
    
    it('should use default config when not provided', () => {
      expect(calculateRetryDelay(1)).toBe(1000)
      expect(calculateRetryDelay(2)).toBe(2000)
      expect(calculateRetryDelay(3)).toBe(4000)
    })
    
    it('should handle different backoff multipliers', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 3,
        initialDelayMs: 1000
      }
      
      expect(calculateRetryDelay(1, config)).toBe(1000)  // 1000 * 3^0
      expect(calculateRetryDelay(2, config)).toBe(3000)  // 1000 * 3^1
      expect(calculateRetryDelay(3, config)).toBe(9000)  // 1000 * 3^2
    })
    
    it('should handle different initial delays', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 5000
      }
      
      expect(calculateRetryDelay(1, config)).toBe(5000)   // 5000 * 2^0
      expect(calculateRetryDelay(2, config)).toBe(10000)  // 5000 * 2^1
      expect(calculateRetryDelay(3, config)).toBe(20000)  // 5000 * 2^2
    })
  })
  
  describe('shouldRetryEmail', () => {
    it('should return true when attempts are below max', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      }
      
      expect(shouldRetryEmail(0, config)).toBe(true)
      expect(shouldRetryEmail(1, config)).toBe(true)
      expect(shouldRetryEmail(2, config)).toBe(true)
    })
    
    it('should return false when attempts reach max', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      }
      
      expect(shouldRetryEmail(3, config)).toBe(false)
      expect(shouldRetryEmail(4, config)).toBe(false)
    })
    
    it('should use default config when not provided', () => {
      expect(shouldRetryEmail(0)).toBe(true)
      expect(shouldRetryEmail(1)).toBe(true)
      expect(shouldRetryEmail(2)).toBe(true)
      expect(shouldRetryEmail(3)).toBe(false)
    })
    
    it('should handle different max attempts', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 5,
        backoffMultiplier: 2,
        initialDelayMs: 1000
      }
      
      expect(shouldRetryEmail(4, config)).toBe(true)
      expect(shouldRetryEmail(5, config)).toBe(false)
    })
  })
  
  describe('Retry timing scenarios', () => {
    it('should demonstrate exponential backoff timing', () => {
      const config = DEFAULT_EMAIL_RETRY_CONFIG
      
      // Simulate retry attempts
      const retrySchedule = []
      let totalTime = 0
      
      for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        const delay = calculateRetryDelay(attempt, config)
        totalTime += delay
        
        retrySchedule.push({
          attempt,
          delay,
          totalTime
        })
      }
      
      // Verify the schedule
      expect(retrySchedule).toEqual([
        { attempt: 1, delay: 1000, totalTime: 1000 },   // 1 second
        { attempt: 2, delay: 2000, totalTime: 3000 },   // 3 seconds total
        { attempt: 3, delay: 4000, totalTime: 7000 }    // 7 seconds total
      ])
      
      // Total time for all retries should be 7 seconds
      expect(totalTime).toBe(7000)
    })
    
    it('should calculate realistic retry windows', () => {
      const config: EmailRetryConfig = {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 60000 // 1 minute
      }
      
      const delays = [
        calculateRetryDelay(1, config), // 1 minute
        calculateRetryDelay(2, config), // 2 minutes
        calculateRetryDelay(3, config)  // 4 minutes
      ]
      
      expect(delays).toEqual([
        60000,   // 1 minute
        120000,  // 2 minutes
        240000   // 4 minutes
      ])
      
      // Total retry window: 7 minutes
      const totalMinutes = delays.reduce((sum, d) => sum + d, 0) / 60000
      expect(totalMinutes).toBe(7)
    })
  })
})
