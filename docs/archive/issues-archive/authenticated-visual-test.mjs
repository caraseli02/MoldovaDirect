import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEST_DIR = process.argv[2] || './test-results/visual-regression-latest';
const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@moldovadirect.com';
const ADMIN_PASSWORD = 'Admin123!@#';

if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

const report = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  authenticated: true,
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

async function loginAsAdmin(page) {
  console.log('\n🔐 Authenticating as admin...');
  
  try {
    await page.goto(BASE_URL + '/auth/signin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    await page.waitForTimeout(1000);

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(ADMIN_EMAIL);
    console.log('   ✓ Email filled');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(ADMIN_PASSWORD);
    console.log('   ✓ Password filled');

    const loginButton = page.locator('button:has-text("Iniciar Sesión"), button:has-text("Sign in"), button:has-text("Login")').first();
    await loginButton.click();
    console.log('   ✓ Login button clicked');

    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      console.log('   ❌ Still on login page - authentication may have failed');
      return false;
    }

    console.log('   ✅ Authentication successful!');
    return true;
  } catch (error) {
    console.log('   ❌ Login error: ' + error.message);
    return false;
  }
}

async function captureConsoleLogs(page) {
  const logs = {
    errors: [],
    warnings: []
  };

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      logs.errors.push(text);
    } else if (type === 'warning') {
      logs.warnings.push(text);
    }
  });

  page.on('pageerror', error => {
    logs.errors.push('Page Error: ' + error.message);
  });

  return logs;
}

async function testAuthenticatedPage(page, pageName, url, testConfig = {}) {
  console.log('\n🧪 Testing: ' + pageName);
  console.log('   URL: ' + url);
  
  const logs = await captureConsoleLogs(page);
  
  const testResult = {
    name: pageName,
    url: url,
    timestamp: new Date().toISOString(),
    status: 'passed',
    issues: [],
    screenshots: [],
    consoleErrors: [],
    consoleWarnings: [],
    dataValidation: {},
    componentStatus: 'loaded',
    visualIssues: []
  };

  try {
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response.ok()) {
      testResult.status = 'failed';
      testResult.issues.push('HTTP ' + response.status() + ': ' + response.statusText());
    }

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
      testResult.status = 'failed';
      testResult.issues.push('Redirected to login page - authentication lost');
    }

    const authErrors = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasAuthSessionMissing: bodyText.includes('Auth session missing!'),
        hasFailedToLoad: bodyText.includes('Failed to load component'),
        hasError500: bodyText.includes('500'),
        hasInternalError: bodyText.includes('Internal Server Error')
      };
    });

    if (authErrors.hasAuthSessionMissing) {
      testResult.status = 'failed';
      testResult.issues.push('Auth session missing error detected on page');
    }
    if (authErrors.hasFailedToLoad) {
      testResult.status = 'failed';
      testResult.issues.push('Failed to load component error detected');
    }
    if (authErrors.hasError500 || authErrors.hasInternalError) {
      testResult.status = 'failed';
      testResult.issues.push('500 Internal Server Error detected');
    }

    const screenshotPath = path.join(TEST_DIR, pageName.replace(/\s+/g, '-').toLowerCase() + '-authenticated.png');
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    testResult.screenshots.push(screenshotPath);
    console.log('   📸 Screenshot: ' + path.basename(screenshotPath));

    if (testConfig.checkData) {
      const dataCheck = await testConfig.checkData(page);
      testResult.dataValidation = dataCheck;
      
      if (dataCheck.hasMockData) {
        testResult.status = 'warning';
        testResult.issues.push('Page shows mock data instead of real data');
      }

      if (testConfig.expectedCount && dataCheck.actualCount !== undefined) {
        if (dataCheck.actualCount === 0) {
          testResult.status = 'warning';
          testResult.issues.push('No data loaded (expected ' + testConfig.expectedCount + ')');
        } else if (dataCheck.actualCount !== testConfig.expectedCount) {
          testResult.issues.push('Data count mismatch: expected ' + testConfig.expectedCount + ', got ' + dataCheck.actualCount);
        }
      }
    }

    const hasLoadingSpinner = await page.locator('[data-loading="true"], .loading, .spinner').count();
    if (hasLoadingSpinner > 0) {
      testResult.visualIssues.push('Loading spinner still visible');
      testResult.status = 'warning';
    }

    if (testConfig.shouldHaveTable) {
      const tableRowCount = await page.locator('table tbody tr').count();
      testResult.dataValidation.tableRowCount = tableRowCount;
      
      if (tableRowCount === 0) {
        testResult.visualIssues.push('Table has no data rows');
        testResult.status = 'warning';
      } else {
        console.log('   ✓ Table has ' + tableRowCount + ' rows');
      }
    }

    testResult.consoleErrors = logs.errors.filter(e => 
      !e.includes('Lit is in dev mode') && 
      !e.includes('ResizeObserver') &&
      !e.includes('[Vue warn]')
    );
    testResult.consoleWarnings = logs.warnings;

    if (testResult.consoleErrors.length > 0) {
      testResult.status = testResult.status === 'failed' ? 'failed' : 'warning';
      console.log('   ⚠️  Console Errors: ' + testResult.consoleErrors.length);
    }

    const statusEmoji = testResult.status === 'passed' ? '✅' : 
                       testResult.status === 'warning' ? '⚠️' : '❌';
    console.log('   ' + statusEmoji + ' Status: ' + testResult.status.toUpperCase());

  } catch (error) {
    testResult.status = 'failed';
    testResult.issues.push('Test error: ' + error.message);
    console.log('   ❌ Error: ' + error.message);
  }

  report.tests.push(testResult);
  report.summary.total++;
  if (testResult.status === 'passed') report.summary.passed++;
  if (testResult.status === 'failed') report.summary.failed++;
  if (testResult.status === 'warning') report.summary.warnings++;

  return testResult;
}

async function runTests() {
  console.log('🚀 Starting Authenticated Visual Regression Testing');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    const loginSuccess = await loginAsAdmin(page);
    
    if (!loginSuccess) {
      console.error('\n❌ Failed to authenticate - cannot proceed with tests');
      process.exit(1);
    }

    await testAuthenticatedPage(page, 'Admin Dashboard', BASE_URL + '/admin', {
      checkData: async (p) => {
        const statsText = await p.textContent('body');
        const hasUsers = statsText.includes('Users') || statsText.includes('67');
        const hasProducts = statsText.includes('Products') || statsText.includes('112');
        const hasOrders = statsText.includes('Orders') || statsText.includes('360');
        
        return {
          hasUsers,
          hasProducts,
          hasOrders,
          showsRealData: hasUsers && hasProducts && hasOrders
        };
      }
    });

    await testAuthenticatedPage(page, 'Admin Users Page', BASE_URL + '/admin/users', {
      shouldHaveTable: true,
      expectedCount: 67,
      checkData: async (p) => {
        const bodyText = await p.textContent('body');
        const has67Users = bodyText.includes('67');
        const tableRowCount = await p.locator('table tbody tr').count();
        
        return {
          expectedUsers: 67,
          actualCount: tableRowCount,
          has67Users,
          showsRealData: has67Users || tableRowCount > 0
        };
      }
    });

    await testAuthenticatedPage(page, 'Admin Products Page', BASE_URL + '/admin/products', {
      shouldHaveTable: true,
      expectedCount: 112,
      checkData: async (p) => {
        const bodyText = await p.textContent('body');
        const has112Products = bodyText.includes('112');
        const tableRowCount = await p.locator('table tbody tr').count();
        
        return {
          expectedProducts: 112,
          actualCount: tableRowCount,
          has112Products,
          showsRealData: has112Products || tableRowCount > 0
        };
      }
    });

    await testAuthenticatedPage(page, 'Admin Orders Page', BASE_URL + '/admin/orders', {
      shouldHaveTable: true,
      expectedCount: 360,
      checkData: async (p) => {
        const bodyText = await p.textContent('body');
        const has360Orders = bodyText.includes('360');
        const tableRowCount = await p.locator('table tbody tr').count();
        
        return {
          expectedOrders: 360,
          actualCount: tableRowCount,
          has360Orders,
          showsRealData: has360Orders || tableRowCount > 0
        };
      }
    });

    await testAuthenticatedPage(page, 'Admin Testing Page', BASE_URL + '/admin/testing', {
      checkData: async (p) => {
        const bodyText = await p.textContent('body');
        const has67Users = bodyText.includes('67');
        const has112Products = bodyText.includes('112');
        const has360Orders = bodyText.includes('360');
        
        return {
          expectedData: { users: 67, products: 112, orders: 360 },
          has67Users,
          has112Products,
          has360Orders,
          allDataMatches: has67Users && has112Products && has360Orders
        };
      }
    });

  } catch (error) {
    console.error('❌ Test suite error:', error);
  } finally {
    await browser.close();
  }

  const jsonReportPath = path.join(TEST_DIR, 'authenticated-test-report.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

  const mdReport = generateMarkdownReport(report);
  const mdReportPath = path.join(TEST_DIR, 'authenticated-test-report.md');
  fs.writeFileSync(mdReportPath, mdReport);

  console.log('\n✅ Test reports generated:');
  console.log('   - JSON: ' + jsonReportPath);
  console.log('   - Markdown: ' + mdReportPath);

  console.log('\n' + '='.repeat(60));
  console.log('AUTHENTICATED TEST SUMMARY');
  console.log('='.repeat(60));
  console.log('Total Tests: ' + report.summary.total);
  console.log('Passed: ' + report.summary.passed + ' ✅');
  console.log('Warnings: ' + report.summary.warnings + ' ⚠️');
  console.log('Failed: ' + report.summary.failed + ' ❌');
  console.log('='.repeat(60) + '\n');

  process.exit(report.summary.failed > 0 ? 1 : 0);
}

function generateMarkdownReport(report) {
  let md = '# Authenticated Visual Regression Test Report\n\n';
  md += '**Generated:** ' + new Date(report.timestamp).toLocaleString() + '\n';
  md += '**Base URL:** ' + report.baseUrl + '\n';
  md += '**Authenticated:** Yes (Admin User)\n\n';
  
  md += '## Summary\n\n';
  md += '| Metric | Count |\n';
  md += '|--------|-------|\n';
  md += '| Total Tests | ' + report.summary.total + ' |\n';
  md += '| Passed | ' + report.summary.passed + ' ✅ |\n';
  md += '| Warnings | ' + report.summary.warnings + ' ⚠️ |\n';
  md += '| Failed | ' + report.summary.failed + ' ❌ |\n\n';

  md += '## Test Results\n\n';

  for (const test of report.tests) {
    const statusIcon = test.status === 'passed' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
    md += '### ' + statusIcon + ' ' + test.name + '\n\n';
    md += '- **URL:** ' + test.url + '\n';
    md += '- **Status:** ' + test.status.toUpperCase() + '\n';
    md += '- **Component Status:** ' + test.componentStatus + '\n\n';

    if (test.issues.length > 0) {
      md += '#### Issues Found\n\n';
      test.issues.forEach(issue => md += '- ' + issue + '\n');
      md += '\n';
    }

    if (test.visualIssues.length > 0) {
      md += '#### Visual Issues\n\n';
      test.visualIssues.forEach(issue => md += '- ' + issue + '\n');
      md += '\n';
    }

    if (Object.keys(test.dataValidation).length > 0) {
      md += '#### Data Validation\n\n';
      md += '```json\n' + JSON.stringify(test.dataValidation, null, 2) + '\n```\n\n';
    }

    if (test.consoleErrors.length > 0) {
      md += '#### Console Errors (' + test.consoleErrors.length + ')\n\n';
      md += '```\n';
      test.consoleErrors.slice(0, 10).forEach(error => md += error + '\n');
      if (test.consoleErrors.length > 10) {
        md += '... and ' + (test.consoleErrors.length - 10) + ' more\n';
      }
      md += '```\n\n';
    }

    if (test.screenshots.length > 0) {
      md += '#### Screenshots\n\n';
      test.screenshots.forEach(screenshot => {
        const filename = path.basename(screenshot);
        md += '![' + test.name + '](./' + filename + ')\n\n';
      });
    }

    md += '---\n\n';
  }

  return md;
}

runTests().catch(console.error);
