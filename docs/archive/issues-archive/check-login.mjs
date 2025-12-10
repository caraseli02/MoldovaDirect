import { chromium } from 'playwright'

async function checkLogin() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

  try {
    console.log('Loading login page...')
    await page.goto('http://localhost:3000/auth/login', { waitUntil: 'load', timeout: 60000 })
    await page.waitForTimeout(3000)

    console.log('Taking screenshot before filling...')
    await page.screenshot({ path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/login-before.png', fullPage: true })

    console.log('Filling email...')
    await page.fill('input[type="email"]', 'admin@moldovadirect.com')

    console.log('Filling password...')
    await page.fill('input[type="password"]', 'Admin123!@#')

    await page.waitForTimeout(2000)

    console.log('Taking screenshot after filling...')
    await page.screenshot({ path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/login-after.png', fullPage: true })

    const buttonState = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[type="submit"]')
      return Array.from(buttons).map(btn => ({
        disabled: btn.disabled,
        text: btn.textContent,
        hasAttr: btn.hasAttribute('disabled'),
      }))
    })

    console.log('Button states:', JSON.stringify(buttonState, null, 2))
  }
  catch (error) {
    console.error('Error:', error.message)
  }
  finally {
    await browser.close()
  }
}

checkLogin()
