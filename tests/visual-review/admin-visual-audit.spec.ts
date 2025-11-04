import { test, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

interface PageAudit {
  pageName: string
  route: string
  screenshot: string
  issues: string[]
  timestamp: string
}

const RESULTS_DIR = path.join(process.cwd(), 'visual-review-results')
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'screenshots')

if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true })
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true })

const audits: PageAudit[] = []

async function capturePageAudit(page: Page, pageName: string, route: string): Promise<void> {
  console.log('\n=== Auditing:', pageName, '===')
  
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000)
  
  const timestamp = new Date().toISOString()
  const sanitizedName = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const screenshotName = sanitizedName + '-' + String(Date.now()) + '.png'
  const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotName)
  
  await page.screenshot({ path: screenshotPath, fullPage: true })
  
  const issues: string[] = []
  
  try {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
    if (headings === 0) {
      issues.push('Missing heading hierarchy - no semantic headings found')
    }
    
    const h1Count = await page.locator('h1').count()
    if (h1Count === 0) {
      issues.push('Missing h1 tag - should have one main heading per page')
    } else if (h1Count > 1) {
      issues.push('Multiple h1 tags found - should only have one')
    }
  } catch (e) {
    console.log('Could not check headings')
  }
  
  try {
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    if (imagesWithoutAlt > 0) {
      issues.push('Found ' + imagesWithoutAlt + ' images without alt text')
    }
  } catch (e) {
    console.log('Could not check images')
  }
  
  const audit: PageAudit = {
    pageName,
    route,
    screenshot: screenshotName,
    issues,
    timestamp,
  }
  
  audits.push(audit)
  
  console.log('Issues found:', issues.length)
  issues.forEach(issue => console.log('  -', issue))
}

test.describe('Admin Visual Review', () => {
  test.beforeAll(async () => {
    console.log('\nStarting admin UI/UX visual review...\n')
  })
  
  test('should login to admin', async ({ page }) => {
    console.log('Logging into admin...')
    await page.goto('/admin')
    await page.waitForLoadState('networkidle')
    
    try {
      const emailInput = page.locator('input[type="email"]').first()
      const isVisible = await emailInput.isVisible({ timeout: 3000 })
      
      if (isVisible) {
        await emailInput.fill('admin@moldovadirect.com')
        await page.locator('input[type="password"]').first().fill('Admin123!@#')
        await page.locator('button[type="submit"]').first().click()
        await page.waitForTimeout(2000)
      }
    } catch (e) {
      console.log('Already logged in or login not required')
    }
    
    console.log('Login complete!')
  })
  
  test('01 - Dashboard', async ({ page }) => {
    await page.goto('/admin')
    await capturePageAudit(page, 'Dashboard', '/admin')
  })
  
  test('02 - Users Management', async ({ page }) => {
    await page.goto('/admin/users')
    await capturePageAudit(page, 'Users Management', '/admin/users')
  })
  
  test('03 - Orders List', async ({ page }) => {
    await page.goto('/admin/orders')
    await capturePageAudit(page, 'Orders List', '/admin/orders')
  })
  
  test('04 - Order Analytics', async ({ page }) => {
    await page.goto('/admin/orders/analytics')
    await capturePageAudit(page, 'Order Analytics', '/admin/orders/analytics')
  })
  
  test('05 - Products List', async ({ page }) => {
    await page.goto('/admin/products')
    await capturePageAudit(page, 'Products List', '/admin/products')
  })
  
  test('06 - New Product', async ({ page }) => {
    await page.goto('/admin/products/new')
    await capturePageAudit(page, 'New Product', '/admin/products/new')
  })
  
  test('07 - Analytics', async ({ page }) => {
    await page.goto('/admin/analytics')
    await capturePageAudit(page, 'Analytics', '/admin/analytics')
  })
  
  test('08 - Inventory', async ({ page }) => {
    await page.goto('/admin/inventory')
    await capturePageAudit(page, 'Inventory', '/admin/inventory')
  })
  
  test('09 - Email Templates', async ({ page }) => {
    await page.goto('/admin/email-templates')
    await capturePageAudit(page, 'Email Templates', '/admin/email-templates')
  })
  
  test('10 - Email Logs', async ({ page }) => {
    await page.goto('/admin/email-logs')
    await capturePageAudit(page, 'Email Logs', '/admin/email-logs')
  })
  
  test('11 - Email Testing Tool', async ({ page }) => {
    await page.goto('/admin/tools/email-testing')
    await capturePageAudit(page, 'Email Testing Tool', '/admin/tools/email-testing')
  })
  
  test.afterAll(async () => {
    console.log('\nGenerating review report...\n')
    
    const totalIssues = audits.reduce((sum, a) => sum + a.issues.length, 0)
    const cleanPages = audits.filter(a => a.issues.length === 0).length
    const avgIssues = (totalIssues / audits.length).toFixed(1)
    
    const reportParts = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>MoldovaDirect Admin UI/UX Review</title>',
      '  <style>',
      '    * { margin: 0; padding: 0; box-sizing: border-box; }',
      '    body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #333; line-height: 1.6; }',
      '    .container { max-width: 1400px; margin: 0 auto; padding: 2rem; }',
      '    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem 2rem; text-align: center; margin-bottom: 3rem; border-radius: 8px; }',
      '    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }',
      '    .subtitle { opacity: 0.9; font-size: 1.1rem; }',
      '    .summary { background: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }',
      '    .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-top: 1.5rem; }',
      '    .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center; }',
      '    .stat-number { font-size: 2.5rem; font-weight: bold; }',
      '    .stat-label { opacity: 0.9; font-size: 0.9rem; margin-top: 0.5rem; }',
      '    .page-section { background: white; padding: 2rem; margin-bottom: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }',
      '    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #f0f0f0; }',
      '    .page-title { font-size: 1.5rem; color: #667eea; }',
      '    .page-route { background: #f0f0f0; padding: 0.5rem 1rem; border-radius: 4px; font-family: monospace; font-size: 0.9rem; }',
      '    .screenshot-container { margin: 1.5rem 0; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }',
      '    .screenshot { width: 100%; height: auto; display: block; }',
      '    .issues-section { margin-top: 1.5rem; }',
      '    .issues-header { font-weight: 600; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }',
      '    .issue-badge { background: #f44336; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }',
      '    .success-badge { background: #4caf50; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: bold; }',
      '    .issues-list { list-style: none; }',
      '    .issue-item { background: #fff3e0; border-left: 4px solid #ff9800; padding: 1rem; margin-bottom: 0.75rem; border-radius: 4px; }',
      '    .no-issues { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 1rem; border-radius: 4px; color: #2e7d32; }',
      '    .timestamp { color: #999; font-size: 0.85rem; margin-top: 1rem; }',
      '    footer { text-align: center; padding: 2rem; color: #999; border-top: 1px solid #e0e0e0; margin-top: 3rem; }',
      '  </style>',
      '</head>',
      '<body>',
      '  <div class="container">',
      '    <header>',
      '      <h1>MoldovaDirect Admin UI/UX Review</h1>',
      '      <p class="subtitle">Comprehensive Visual and Accessibility Audit</p>',
      '      <p class="subtitle">Generated on ' + new Date().toLocaleString() + '</p>',
      '    </header>',
      '    <div class="summary">',
      '      <h2>Executive Summary</h2>',
      '      <div class="summary-stats">',
      '        <div class="stat-card"><div class="stat-number">' + audits.length + '</div><div class="stat-label">Pages Reviewed</div></div>',
      '        <div class="stat-card"><div class="stat-number">' + totalIssues + '</div><div class="stat-label">Total Issues Found</div></div>',
      '        <div class="stat-card"><div class="stat-number">' + cleanPages + '</div><div class="stat-label">Pages Without Issues</div></div>',
      '        <div class="stat-card"><div class="stat-number">' + avgIssues + '</div><div class="stat-label">Avg Issues Per Page</div></div>',
      '      </div>',
      '    </div>'
    ]
    
    audits.forEach(audit => {
      reportParts.push('    <div class="page-section">')
      reportParts.push('      <div class="page-header">')
      reportParts.push('        <h3 class="page-title">' + audit.pageName + '</h3>')
      reportParts.push('        <code class="page-route">' + audit.route + '</code>')
      reportParts.push('      </div>')
      reportParts.push('      <div class="screenshot-container">')
      reportParts.push('        <img src="screenshots/' + audit.screenshot + '" alt="' + audit.pageName + ' Screenshot" class="screenshot" />')
      reportParts.push('      </div>')
      reportParts.push('      <div class="issues-section">')
      reportParts.push('        <div class="issues-header">')
      reportParts.push('          <span>Issues Found</span>')
      if (audit.issues.length > 0) {
        reportParts.push('          <span class="issue-badge">' + audit.issues.length + '</span>')
      } else {
        reportParts.push('          <span class="success-badge">0</span>')
      }
      reportParts.push('        </div>')
      
      if (audit.issues.length > 0) {
        reportParts.push('        <ul class="issues-list">')
        audit.issues.forEach(issue => {
          reportParts.push('          <li class="issue-item">' + issue + '</li>')
        })
        reportParts.push('        </ul>')
      } else {
        reportParts.push('        <div class="no-issues">No critical UI/UX issues detected</div>')
      }
      
      reportParts.push('      </div>')
      reportParts.push('      <div class="timestamp">Captured at: ' + new Date(audit.timestamp).toLocaleString() + '</div>')
      reportParts.push('    </div>')
    })
    
    reportParts.push('    <footer>')
    reportParts.push('      <p>Generated by Playwright Visual Review Tool</p>')
    reportParts.push('      <p>MoldovaDirect Admin Panel Audit</p>')
    reportParts.push('    </footer>')
    reportParts.push('  </div>')
    reportParts.push('</body>')
    reportParts.push('</html>')
    
    const htmlReport = reportParts.join('\n')
    
    fs.writeFileSync(path.join(RESULTS_DIR, 'review-report.html'), htmlReport)
    fs.writeFileSync(path.join(RESULTS_DIR, 'review-data.json'), JSON.stringify(audits, null, 2))
    
    console.log('\n--- Review Complete! ---')
    console.log('Screenshots:', SCREENSHOTS_DIR)
    console.log('HTML Report:', path.join(RESULTS_DIR, 'review-report.html'))
    console.log('JSON Data:', path.join(RESULTS_DIR, 'review-data.json'))
    console.log('\nSummary:')
    console.log('  - Pages reviewed:', audits.length)
    console.log('  - Total issues:', totalIssues)
    console.log('  - Clean pages:', cleanPages)
  })
})
