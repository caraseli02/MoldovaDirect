import type { FullConfig } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalTeardown(_config: FullConfig) {
  console.log('Starting global teardown...')

  if (process.env.KEEP_TEST_DATA !== 'true') {
    try {
      const testDataPath = path.join(__dirname, 'fixtures', '.auth')
      await fs.rm(testDataPath, { recursive: true, force: true })
      console.log('✓ Cleaned up test data')
    }
    catch (error: any) {
      console.error('✗ Failed to cleanup test data:', error)
    }
  }

  console.log('Global teardown completed')
}

export default globalTeardown
