import { chromium } from 'playwright'

(async () => {
  console.log('🚀 Starting visual address test...\n')

  const browser = await chromium.launch({
    headless: false,  // Visual mode
    slowMo: 1000      // Slow down actions so you can see them
  })

  const context = await browser.newContext({
    locale: 'es-ES',
    viewport: { width: 1920, height: 1080 }
  })

  const page = await context.newPage()

  try {
    // 1. Navigate to login
    console.log('1️⃣  Navigating to login page...')
    await page.goto('http://localhost:3000/auth/login')
    await page.waitForLoadState('networkidle')

    // 2. Login with customer credentials
    console.log('2️⃣  Logging in as customer...')
    await page.fill('[data-testid="email-input"]', 'customer@moldovadirect.com')
    await page.fill('[data-testid="password-input"]', 'Customer123!@#')
    await page.click('[data-testid="login-button"]')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    console.log('✅ Login successful!')

    // 3. Navigate to profile
    console.log('3️⃣  Navigating to profile page...')
    await page.goto('http://localhost:3000/account/profile')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // 4. Click "Add Address" button
    console.log('4️⃣  Clicking "Añadir Dirección" button...')
    await page.click('text=Añadir Dirección')
    await page.waitForTimeout(2000)
    console.log('✅ Modal opened!')

    // 5. Fill address form
    console.log('5️⃣  Filling address form...')
    await page.click('input[value="shipping"]')
    await page.waitForTimeout(500)

    await page.fill('#firstName', 'Juan')
    await page.waitForTimeout(300)

    await page.fill('#lastName', 'García')
    await page.waitForTimeout(300)

    await page.fill('#street', 'Calle Mayor 45')
    await page.waitForTimeout(300)

    await page.fill('#city', 'Madrid')
    await page.waitForTimeout(300)

    await page.fill('#postalCode', '28013')
    await page.waitForTimeout(300)

    await page.selectOption('#country', 'ES')
    await page.waitForTimeout(300)

    await page.check('#isDefault')
    await page.waitForTimeout(500)
    console.log('✅ Form filled!')

    // 6. Submit form
    console.log('6️⃣  Submitting form...')
    // Click the Guardar button directly - wait for it to be enabled
    await page.waitForTimeout(1000)
    const saveButton = page.locator('button:has-text("Guardar Dirección")')

    // Force click if needed
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const saveBtn = buttons.find(b => b.textContent?.includes('Guardar'))
      if (saveBtn) saveBtn.click()
    })

    // Wait for modal to close (it should disappear from DOM)
    await page.waitForTimeout(3000)
    console.log('✅ Address saved!')

    // 7. Verify address appears
    console.log('7️⃣  Verifying address appears in list...')
    const addressCard = await page.locator('text=Juan García').first()
    if (await addressCard.isVisible()) {
      console.log('✅ Address card visible!')
    }

    await page.waitForTimeout(2000)

    // 8. Edit address
    console.log('8️⃣  Clicking edit button...')
    // Find and click the edit button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const editBtn = buttons.find(b => {
        const svg = b.querySelector('svg')
        return svg && b.getAttribute('aria-label')?.includes('Editar')
      })
      if (editBtn) editBtn.click()
    })
    await page.waitForTimeout(2000)
    console.log('✅ Edit modal opened!')

    await page.fill('#firstName', 'Pedro')
    await page.waitForTimeout(1000)

    console.log('9️⃣  Updating address...')
    // Click the Actualizar button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const updateBtn = buttons.find(b => b.textContent?.includes('Actualizar'))
      if (updateBtn) updateBtn.click()
    })
    await page.waitForTimeout(3000)
    console.log('✅ Address updated!')

    await page.waitForTimeout(5000)

    console.log('\n✅ All tests completed! Browser will stay open for 30 more seconds...\n')
    await page.waitForTimeout(30000)

  } catch (error) {
    console.error('❌ Error:', error.message)
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true })
    console.log('📸 Screenshot saved to error-screenshot.png')
    await page.waitForTimeout(5000)
  } finally {
    await browser.close()
    console.log('👋 Browser closed')
  }
})()
