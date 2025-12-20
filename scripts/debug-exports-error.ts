/**
 * Debug script to identify which file is causing "exports is not defined" error
 *
 * This script will:
 * 1. Launch a browser
 * 2. Navigate to the login page
 * 3. Capture detailed error information including stack trace
 * 4. Identify the specific file causing the issue
 */

import { chromium } from '@playwright/test'

async function debugExportsError() {
  console.log('🔍 Starting debug session...\n')

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Capture all console messages with full details
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    const location = msg.location()

    console.log(`[Console ${type}]: ${text}`)
    if (location.url) {
      console.log(`  Location: ${location.url}:${location.lineNumber}:${location.columnNumber}`)
    }
  })

  // Capture page errors with stack traces
  page.on('pageerror', (error) => {
    console.log('\n❌ PAGE ERROR DETECTED:')
    console.log(`Message: ${error.message}`)
    console.log(`Stack:\n${error.stack}`)
  })

  // Intercept network requests to see what's being loaded
  const loadedScripts: string[] = []
  page.on('response', (response) => {
    const url = response.url()
    if (url.includes('.js') || url.includes('.mjs')) {
      loadedScripts.push(url)
    }
  })

  console.log('📄 Navigating to login page...\n')
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' })

  // Wait a bit for any deferred scripts
  await page.waitForTimeout(2000)

  console.log('\n📦 Loaded JavaScript files:')
  loadedScripts.forEach((script, idx) => {
    const shortPath = script.replace('http://localhost:3000/', '')
    console.log(`  ${idx + 1}. ${shortPath}`)
  })

  // Try to trigger the error and capture it
  console.log('\n🔬 Attempting to trigger error...')

  const errorDetails = await page.evaluate(() => {
    return new Promise((resolve) => {
      const originalError = console.error
      const errors: any[] = []

      console.error = function(...args) {
        errors.push({
          message: args.map(a => String(a)).join(' '),
          stack: new Error().stack
        })
        originalError.apply(console, args)
      }

      // Try to reference exports to trigger the error
      setTimeout(() => {
        try {
          // This should trigger the error if exports is undefined
          if (typeof (window as any).exports === 'undefined') {
            console.error('exports is undefined in window context')
          }
        } catch (e: any) {
          errors.push({
            message: e.message,
            stack: e.stack
          })
        }

        resolve(errors)
      }, 1000)
    })
  })

  console.log('\n📊 Error details from page:')
  console.log(JSON.stringify(errorDetails, null, 2))

  console.log('\n⏸️  Browser will remain open for manual inspection.')
  console.log('Press Ctrl+C to close.')

  // Keep browser open for manual inspection
  await new Promise(() => {})
}

debugExportsError().catch(console.error)
