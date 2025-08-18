import { test, expect } from '@playwright/test'

test.describe('UI Validation - Current Application', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page to fully load
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Additional wait for any animations
  })

  test('should capture homepage layout @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture navigation and header @visual', async ({ page }) => {
    const header = page.locator('header, nav, [role="navigation"]').first()
    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('navigation-current.png')
    } else {
      // Fallback to top section if no specific header
      await expect(page.locator('body')).toHaveScreenshot('top-section-current.png', {
        clip: { x: 0, y: 0, width: 1280, height: 200 }
      })
    }
  })

  test('should capture main content area @visual', async ({ page }) => {
    const main = page.locator('main, [role="main"], .main-content').first()
    if (await main.isVisible()) {
      await expect(main).toHaveScreenshot('main-content-current.png')
    } else {
      // Fallback to body content
      await expect(page.locator('body')).toHaveScreenshot('body-content-current.png', {
        clip: { x: 0, y: 0, width: 1280, height: 800 }
      })
    }
  })

  test('should capture footer @visual', async ({ page }) => {
    // Scroll to bottom to ensure footer is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    
    const footer = page.locator('footer, [role="contentinfo"]').first()
    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('footer-current.png')
    }
  })

  test('should capture mobile view @visual', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-mobile-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture tablet view @visual', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-tablet-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('UI Validation - Key Pages', () => {
  test('should capture about page @visual', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('about-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture products page @visual', async ({ page }) => {
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('products-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture contact page @visual', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('contact-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture login page @visual', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('login-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture register page @visual', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('register-page-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('UI Validation - Internationalization', () => {
  test('should capture Spanish (default) homepage @visual', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-es-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture English homepage @visual', async ({ page }) => {
    await page.goto('/en')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-en-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture Romanian homepage @visual', async ({ page }) => {
    await page.goto('/ro')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-ro-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })

  test('should capture Russian homepage @visual', async ({ page }) => {
    await page.goto('/ru')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage-ru-current.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})

test.describe('UI Validation - Interactive Elements', () => {
  test('should capture hover states @visual', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Look for buttons, links, or interactive elements
    const buttons = page.locator('button, a, [role="button"]')
    const buttonCount = await buttons.count()
    
    if (buttonCount > 0) {
      // Hover over the first interactive element
      await buttons.first().hover()
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot('homepage-with-hover-current.png', {
        animations: 'disabled',
      })
    }
  })

  test('should capture form elements @visual', async ({ page }) => {
    // Try login page for forms
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    const forms = page.locator('form, input, textarea, select')
    const formCount = await forms.count()
    
    if (formCount > 0) {
      await expect(page).toHaveScreenshot('form-elements-current.png', {
        fullPage: true,
        animations: 'disabled',
      })
    }
  })
})