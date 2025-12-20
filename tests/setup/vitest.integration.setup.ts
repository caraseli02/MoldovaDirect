/**
 * Vitest Setup for Integration Tests
 *
 * This setup is used for integration tests that require:
 * - Live Supabase connection
 * - Database access
 * - Real API endpoints
 *
 * These tests are separate from unit tests and should not run
 * in the pre-push hook.
 */

import { beforeAll, afterAll } from 'vitest'

// Check for required environment variables
beforeAll(() => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_KEY',
  ]

  const missing = requiredEnvVars.filter(varName => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for integration tests: ${missing.join(', ')}\n`
      + 'Please set these variables in your .env file or skip integration tests.',
    )
  }

  console.log('✓ Integration test environment validated')
})

afterAll(() => {
  console.log('✓ Integration tests completed')
})
