import { chromium, FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Prevent vitest setup from being loaded in Playwright context
process.env.PLAYWRIGHT_TEST = 'true'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use
  const browser = await chromium.launch()
  
  const authDir = path.join(__dirname, 'fixtures', '.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }
  
  const locales = ['es', 'en', 'ro', 'ru']
  
  for (const locale of locales) {
    const context = await browser.newContext({
      baseURL,
      locale,
      timezoneId: 'Europe/Madrid',
    })
    
    const page = await context.newPage()
    
    try {
      await page.goto('/')
      
      const storageFile = path.join(authDir, `user-${locale}.json`)
      await context.storageState({ path: storageFile })
      
      console.log(`✓ Created storage state for locale: ${locale}`)
    } catch (error) {
      console.error(`✗ Failed to setup locale ${locale}:`, error)
    } finally {
      await context.close()
    }
  }
  
  await browser.close()
  
  console.log('Global setup completed')
}

export default globalSetup