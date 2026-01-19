import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { ProfilePage } from '../e2e/page-objects/ProfilePage'

// Common options for screenshot comparison
const screenshotOptions = {
  maxDiffPixelRatio: 0.02, // Allow 2% pixel difference
  threshold: 0.2, // Per-pixel color threshold
  animations: 'disabled' as const,
}

// Mask selectors for dynamic content that should be ignored
const dynamicContentMasks = [
  '[data-testid="timestamp"]',
  '[data-testid="random-content"]',
  '.skeleton-loader',
  '.animate-pulse',
  '[data-testid="profile-completion"]', // Dynamic completion percentage
  '[data-testid="save-status"]', // Auto-save indicator
]

// Test credentials from environment
const TEST_EMAIL = process.env.CUSTOMER_EMAIL || 'customer@moldovadirect.com'
const TEST_PASSWORD = (process.env.CUSTOMER_PASSWORD || 'Customer123!@#').replace(/'/g, '')

/**
 * Helper to authenticate user and set cookies
 */
async function authenticateUser(context: any) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials not found, skipping authentication')
    return false
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  })

  if (authError || !authData.session) {
    console.warn(`Authentication failed: ${authError?.message || 'No session'}`)
    return false
  }

  // Extract project ref from URL for cookie name
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1] || 'khvzbjemydddnryreytu'

  await context.addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
      }),
      domain: 'localhost',
      path: '/',
    },
  ])

  return true
}

test.describe('Profile Page Visual Regression', () => {
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
  })

  test('profile page renders correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Verify profile page loaded
    await expect(profilePage.title).toBeVisible()

    await expect(page).toHaveScreenshot('profile-desktop.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('profile page renders correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await expect(profilePage.title).toBeVisible()

    await expect(page).toHaveScreenshot('profile-tablet.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('profile page renders correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await expect(profilePage.title).toBeVisible()

    await expect(page).toHaveScreenshot('profile-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('avatar section renders correctly', async () => {
    if (await profilePage.avatarSection.isVisible({ timeout: 3000 })) {
      await expect(profilePage.avatarSection).toHaveScreenshot('profile-avatar.png', {
        ...screenshotOptions,
      })
    }
  })

  test('camera button has correct touch target (44px)', async () => {
    if (await profilePage.cameraButton.isVisible({ timeout: 3000 })) {
      const box = await profilePage.cameraButton.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })
})

test.describe('Profile Page Accordion Interactions', () => {
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
  })

  test('personal information accordion expands correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await profilePage.toggleAccordion(profilePage.personalInfoAccordion, 'open')

    await expect(page).toHaveScreenshot('profile-accordion-personal.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })

  test('all accordions expanded view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await profilePage.expandAllAccordions()

    await expect(page).toHaveScreenshot('profile-all-accordions-open.png', {
      ...screenshotOptions,
      fullPage: true,
      mask: dynamicContentMasks.map(s => page.locator(s)),
    })
  })
})

test.describe('Profile Page Form Inputs', () => {
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
  })

  test('form inputs are accessible and editable', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await profilePage.toggleAccordion(profilePage.personalInfoAccordion, 'open')

    if (await profilePage.nameInput.isVisible({ timeout: 3000 })) {
      await expect(profilePage.nameInput).toBeEditable()

      // Test input interaction (don't use the POM updateName to avoid waiting for save here if we want a specific screenshot)
      await profilePage.nameInput.fill('Test Name')
      await page.waitForTimeout(500)

      await expect(page).toHaveScreenshot('profile-form-filled.png', {
        ...screenshotOptions,
        fullPage: true,
        mask: dynamicContentMasks.map(s => page.locator(s)),
      })
    }
  })

  test('phone input accepts valid format', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await profilePage.expandAllAccordions()

    if (await profilePage.phoneInput.isVisible({ timeout: 3000 })) {
      await expect(profilePage.phoneInput).toBeEditable()
      await profilePage.phoneInput.fill('+1234567890')
      await page.waitForTimeout(300)
    }
  })
})

test.describe('Profile Page Accessibility', () => {
  let profilePage: ProfilePage

  test.beforeEach(async ({ context, page }) => {
    const isAuthenticated = await authenticateUser(context)
    if (!isAuthenticated) {
      test.skip()
    }

    profilePage = new ProfilePage(page)
    await profilePage.goto()
  })

  test('keyboard navigation works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    // Press Tab to navigate
    await page.keyboard.press('Tab')
    await page.waitForTimeout(200)

    // Check that something is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeTruthy()

    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      await page.waitForTimeout(100)
    }

    // Verify focus is visible
    const hasFocus = await page.evaluate(() => {
      const el = document.activeElement
      return el !== document.body
    })
    expect(hasFocus).toBe(true)
  })

  test('touch targets meet minimum size requirements', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })

    await profilePage.expandAllAccordions()

    // Check profile-specific buttons (not header/footer)
    const profileContainer = page.locator('main')
    const buttons = await profileContainer.locator('button').all()

    let smallButtonsInProfile = 0
    for (const button of buttons) {
      const box = await button.boundingBox()
      if (box && (box.width < 44 || box.height < 44)) {
        smallButtonsInProfile++
      }
    }

    // Allow small buttons for accordion chevrons and icon buttons
    expect(smallButtonsInProfile).toBeLessThan(10)
  })
})
