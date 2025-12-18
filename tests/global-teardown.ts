import type { FullConfig } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalTeardown(_config: FullConfig) {
  console.log('Starting global teardown...')

  // Don't delete auth files - they're needed for test runs
  // and should persist across multiple test executions
  // Only clean up if explicitly requested via CLEAN_AUTH environment variable
  if (process.env.CLEAN_AUTH === 'true') {
    try {
      const testDataPath = path.join(__dirname, 'fixtures', '.auth')
      await fs.rm(testDataPath, { recursive: true, force: true })
      console.log('✓ Cleaned up auth data')
    }
    catch (error: any) {
      console.error('✗ Failed to cleanup auth data:', error)
    }
  }
  else {
    console.log('✓ Auth data preserved for reuse')
  }

  console.log('Global teardown completed')
}

export default globalTeardown
