import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const ADMIN_PAGES = [
  { path: '/admin', name: 'Dashboard' },
  { path: '/admin/users', name: 'Users' },
  { path: '/admin/products', name: 'Products' },
  { path: '/admin/orders', name: 'Orders' },
  { path: '/admin/analytics', name: 'Analytics' }
];

async function capturePageState(page, pageName) {
  const state = {
    pageName,
    url: page.url(),
    title: await page.title(),
    translationKeys: [],
    visibleErrors: [],
    loadedSuccessfully: false,
    screenshotPath: null
  };

  const errorMessages = await page.locator('text=/error|500|404|unauthorized/i').count();
  state.loadedSuccessfully = errorMessages === 0;

  const pageText = await page.textContent('body');
  const translationPattern = /[a-z]+.[a-z]+.[a-z.]+/gi;
  const matches = pageText.match(translationPattern);
  if (matches) {
    state.translationKeys = [...new Set(matches.filter(m => 
      m.includes('admin.') || m.includes('navigation.') || m.includes('dashboard.')
    ))];
  }

  const errorSelectors = ['text=/error/i', '.error', '[role="alert"]'];
  for (const selector of errorSelectors) {
    try {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          state.visibleErrors.push(text.trim());
        }
      }
    } catch (e) {}
  }

  const screenshotName = `current-admin-${pageName.toLowerCase().replace(/\s+/g, '-')}.png`;
  state.screenshotPath = `/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/${screenshotName}`;
  await page.screenshot({ path: state.screenshotPath, fullPage: true });

  return state;
}

async function runDiagnostics() {
  console.log('Starting admin pages visual diagnostics...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  const report = {
    timestamp: new Date().toISOString(),
    overallStatus: 'unknown',
    pages: [],
    consoleErrors: [],
    networkErrors: []
  };

  page.on('console', msg => {
    if (msg.type() === 'error') {
      report.consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      report.networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    console.log('Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ 
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/00-login-page.png',
      fullPage: true 
    });
    console.log('✓ Login page loaded');

    console.log('\nStep 2: Logging in as admin...');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`✓ Logged in, current URL: ${page.url()}`);
    await page.screenshot({ 
      path: '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/01-after-login.png',
      fullPage: true 
    });

    console.log('\nStep 3: Testing admin pages...\n');
    
    for (const adminPage of ADMIN_PAGES) {
      console.log(`Testing ${adminPage.name} (${adminPage.path})...`);
      
      try {
        await page.goto(`${BASE_URL}${adminPage.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const pageState = await capturePageState(page, adminPage.name);
        report.pages.push(pageState);
        
        console.log(`  ✓ Screenshot saved`);
        console.log(`  Status: ${pageState.loadedSuccessfully ? '✓ LOADED' : '✗ ERROR'}`);
        
        if (pageState.translationKeys.length > 0) {
          console.log(`  ⚠ Translation keys found: ${pageState.translationKeys.length}`);
        }
        
        if (pageState.visibleErrors.length > 0) {
          console.log(`  ✗ Visible errors: ${pageState.visibleErrors.length}`);
        }
        console.log('');
        
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}\n`);
        report.pages.push({
          pageName: adminPage.name,
          url: adminPage.path,
          error: error.message,
          loadedSuccessfully: false
        });
      }
    }

    const failedPages = report.pages.filter(p => !p.loadedSuccessfully);
    report.overallStatus = failedPages.length === 0 ? 'all_pages_loaded' : 
                          failedPages.length === ADMIN_PAGES.length ? 'all_pages_failed' : 
                          'partial_failures';

  } catch (error) {
    console.error('Critical error:', error);
    report.overallStatus = 'critical_error';
    report.criticalError = error.message;
  } finally {
    await browser.close();
  }

  const reportPath = '/Users/vladislavcaraseli/Documents/MoldovaDirect.worktrees/products-improvments/test-screenshots/diagnostic-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n=== SUMMARY ===\n');
  console.log(`Overall Status: ${report.overallStatus}`);
  console.log(`Pages tested: ${report.pages.length}`);
  console.log(`Pages loaded successfully: ${report.pages.filter(p => p.loadedSuccessfully).length}`);
  console.log(`Total translation keys: ${report.pages.reduce((sum, p) => sum + (p.translationKeys?.length || 0), 0)}`);
  console.log(`Total network errors: ${report.networkErrors.length}`);
  
  console.log('\n=== PAGE DETAILS ===\n');
  for (const p of report.pages) {
    console.log(`${p.pageName}: ${p.loadedSuccessfully ? '✓ OK' : '✗ FAILED'}`);
    if (p.translationKeys?.length > 0) {
      console.log(`  ⚠ Translation keys (${p.translationKeys.length}): ${p.translationKeys.slice(0, 3).join(', ')}`);
    }
    if (p.visibleErrors?.length > 0) {
      console.log(`  ✗ Errors: ${p.visibleErrors[0].substring(0, 80)}`);
    }
  }
  
  if (report.networkErrors.length > 0) {
    console.log('\n=== NETWORK ERRORS ===\n');
    const unique = [...new Map(report.networkErrors.map(e => [e.url, e])).values()].slice(0, 10);
    unique.forEach(e => console.log(`  ${e.status}: ${e.url}`));
  }

  return report;
}

runDiagnostics().catch(console.error);