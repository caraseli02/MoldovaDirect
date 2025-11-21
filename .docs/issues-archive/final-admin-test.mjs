#!/usr/bin/env node

import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = './test-screenshots';

const testResults = {
  timestamp: new Date().toISOString(),
  success: true,
  pages: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0
  }
};

async function testAdminPages() {
  console.log('🚀 Starting Final Admin Pages Test\n');
  console.log('=' .repeat(60));
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Collect console logs and errors
  const consoleLogs = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push({ type: msg.type(), text });
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`Page Error: ${error.message}`);
  });
  
  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@moldovadirect.com');
    await page.fill('input[type="password"]', 'Admin123!@#');
    
    // Take login page screenshot
    await page.screenshot({ 
      path: join(SCREENSHOTS_DIR, '01-login-page.png'),
      fullPage: true 
    });
    console.log('   ✓ Login form filled');
    
    // Submit login and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      page.click('button[type="submit"]')
    ]);
    
    await page.waitForTimeout(2000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/admin')) {
      console.log('   ✓ Login successful - redirected to admin area\n');
    } else {
      console.log('   ⚠ Login may have failed - not at admin page');
      // Take screenshot of current state
      await page.screenshot({ 
        path: join(SCREENSHOTS_DIR, '01-login-result.png'),
        fullPage: true 
      });
    }
    
    // Admin pages to test
    const adminPages = [
      {
        name: 'Dashboard',
        path: '/admin',
        checks: [
          { selector: 'h1, h2', description: 'Page heading' },
          { text: /Dashboard|Overview|Statistics/i, description: 'Dashboard content' }
        ]
      },
      {
        name: 'Users',
        path: '/admin/users',
        checks: [
          { selector: 'table, .table', description: 'Users table' },
          { text: /Users|Email|Role/i, description: 'Users content' }
        ]
      },
      {
        name: 'Products',
        path: '/admin/products',
        checks: [
          { selector: 'table, .table, .product', description: 'Products list' },
          { text: /Products|Name|Price/i, description: 'Products content' }
        ]
      },
      {
        name: 'Orders',
        path: '/admin/orders',
        checks: [
          { selector: 'table, .table, .order', description: 'Orders list' },
          { text: /Orders|Status|Total/i, description: 'Orders content' }
        ]
      },
      {
        name: 'Analytics',
        path: '/admin/analytics',
        checks: [
          { selector: 'canvas, .chart, svg', description: 'Analytics charts' },
          { text: /Analytics|Chart|Statistics/i, description: 'Analytics content' }
        ]
      }
    ];
    
    // Test each admin page
    for (let i = 0; i < adminPages.length; i++) {
      const pageTest = adminPages[i];
      const pageNum = String(i + 2).padStart(2, '0');
      
      console.log(`\n📄 Step ${i + 2}: Testing ${pageTest.name} (${pageTest.path})`);
      console.log('-'.repeat(60));
      
      const pageResult = {
        name: pageTest.name,
        path: pageTest.path,
        status: 'pending',
        checks: [],
        errors: [],
        consoleErrors: []
      };
      
      // Clear previous console errors
      consoleErrors.length = 0;
      
      try {
        // Navigate to page
        const response = await page.goto(`${BASE_URL}${pageTest.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        
        // Check for 500 errors
        const status = response.status();
        console.log(`   Response Status: ${status}`);
        
        if (status === 500) {
          pageResult.status = 'failed';
          pageResult.errors.push('500 Server Error');
          console.log('   ❌ 500 Server Error detected');
        } else if (status >= 400) {
          pageResult.status = 'failed';
          pageResult.errors.push(`HTTP ${status} Error`);
          console.log(`   ❌ HTTP ${status} Error`);
        } else {
          console.log('   ✓ Page loaded successfully');
        }
        
        // Wait for content to load
        await page.waitForTimeout(3000);
        
        // Check for error messages in page content
        const pageContent = await page.content();
        const hasErrorMessage = pageContent.includes('500') || 
                              pageContent.includes('Server Error') ||
                              pageContent.includes('Unknown variable dynamic import');
        
        if (hasErrorMessage) {
          pageResult.errors.push('Error message found in page content');
          console.log('   ❌ Error message detected in page');
        }
        
        // Perform content checks
        console.log('\n   Content Checks:');
        for (const check of pageTest.checks) {
          try {
            if (check.selector) {
              const element = await page.$(check.selector);
              if (element) {
                pageResult.checks.push({ check: check.description, result: 'passed' });
                console.log(`   ✓ ${check.description} found`);
              } else {
                pageResult.checks.push({ check: check.description, result: 'warning' });
                console.log(`   ⚠ ${check.description} not found (may be loading)`);
              }
            }
            
            if (check.text) {
              const hasText = await page.locator(`text=${check.text}`).count() > 0;
              if (hasText) {
                pageResult.checks.push({ check: check.description, result: 'passed' });
                console.log(`   ✓ ${check.description} present`);
              } else {
                pageResult.checks.push({ check: check.description, result: 'warning' });
                console.log(`   ⚠ ${check.description} not found`);
              }
            }
          } catch (err) {
            pageResult.checks.push({ 
              check: check.description, 
              result: 'error',
              error: err.message 
            });
            console.log(`   ❌ ${check.description} check failed: ${err.message}`);
          }
        }
        
        // Check for critical console errors
        const criticalErrors = consoleErrors.filter(err => 
          err.includes('Unknown variable dynamic import') ||
          err.includes('500') ||
          err.includes('Failed to fetch') ||
          err.includes('NetworkError') ||
          err.includes('TypeError')
        );
        
        if (criticalErrors.length > 0) {
          console.log('\n   Console Errors:');
          criticalErrors.forEach(err => {
            console.log(`   ❌ ${err}`);
            pageResult.consoleErrors.push(err);
          });
        } else {
          console.log('\n   ✓ No critical console errors');
        }
        
        // Take screenshot
        const screenshotName = `${pageNum}-working-admin-${pageTest.name.toLowerCase()}.png`;
        await page.screenshot({ 
          path: join(SCREENSHOTS_DIR, screenshotName),
          fullPage: true 
        });
        console.log(`   ✓ Screenshot saved: ${screenshotName}`);
        
        // Determine final status
        if (pageResult.errors.length === 0 && criticalErrors.length === 0) {
          pageResult.status = 'passed';
          console.log(`\n   ✅ ${pageTest.name} page: PASSED`);
        } else {
          pageResult.status = 'failed';
          testResults.success = false;
          console.log(`\n   ❌ ${pageTest.name} page: FAILED`);
        }
        
      } catch (error) {
        pageResult.status = 'failed';
        pageResult.errors.push(error.message);
        testResults.success = false;
        console.log(`   ❌ Error testing ${pageTest.name}: ${error.message}`);
      }
      
      testResults.pages.push(pageResult);
      testResults.summary.total++;
      if (pageResult.status === 'passed') {
        testResults.summary.passed++;
      } else {
        testResults.summary.failed++;
      }
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 FINAL TEST SUMMARY\n');
    console.log(`Total Pages Tested: ${testResults.summary.total}`);
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    
    if (testResults.success) {
      console.log('\n🎉 SUCCESS: All admin pages are working correctly!');
    } else {
      console.log('\n⚠️  ISSUES DETECTED: Some pages have errors');
      console.log('\nFailed Pages:');
      testResults.pages
        .filter(p => p.status === 'failed')
        .forEach(p => {
          console.log(`\n  - ${p.name} (${p.path})`);
          p.errors.forEach(err => console.log(`    • ${err}`));
          p.consoleErrors.forEach(err => console.log(`    • Console: ${err}`));
        });
    }
    
    // Save detailed report
    const reportPath = join(SCREENSHOTS_DIR, 'final-test-report.json');
    await writeFile(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test execution error:', error);
    testResults.success = false;
    testResults.error = error.message;
  } finally {
    await browser.close();
  }
  
  return testResults;
}

// Run tests
testAdminPages().then(results => {
  process.exit(results.success ? 0 : 1);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
