/**
 * Screenshot capture script for UI/UX audit issues
 * Captures screenshots of various pages and UI states
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

// Credentials
const CREDENTIALS = {
  admin: { email: 'admin@moldovadirect.com', password: 'Admin123!@#' },
  manager: { email: 'manager@moldovadirect.com', password: 'Manager123!@#' },
  customer: { email: 'customer@moldovadirect.com', password: 'Customer123!@#' }
};

// Screenshot configurations for each issue
const SCREENSHOTS = [
  // Issue #176 - Admin Accessibility
  {
    issue: 176,
    title: 'admin-accessibility',
    role: 'admin',
    captures: [
      { path: '/admin/orders', name: 'orders-page', description: 'Admin orders page - missing ARIA labels' },
      { path: '/admin/products', name: 'products-page', description: 'Admin products page - no keyboard navigation' },
      { path: '/admin/users', name: 'users-page', description: 'Admin users page - accessibility gaps' }
    ]
  },

  // Issue #177 - Mobile Admin Tables
  {
    issue: 177,
    title: 'mobile-admin-tables',
    role: 'admin',
    mobile: true,
    captures: [
      { path: '/admin/orders', name: 'orders-mobile', description: 'Orders table on mobile - horizontal scroll' },
      { path: '/admin/products', name: 'products-mobile', description: 'Products table on mobile - poor UX' }
    ]
  },

  // Issue #178 - Search Autocomplete
  {
    issue: 178,
    title: 'search-autocomplete',
    role: 'customer',
    captures: [
      { path: '/products', name: 'search-no-autocomplete', description: 'Search without autocomplete suggestions' },
      { path: '/', name: 'header-search', description: 'Header search - basic input only' }
    ]
  },

  // Issue #179 - Email Template Editor
  {
    issue: 179,
    title: 'email-template-editor',
    role: 'admin',
    captures: [
      { path: '/admin/email-templates', name: 'json-textarea', description: 'Email template JSON textarea editor' }
    ]
  },

  // Issue #180 - Admin Breadcrumbs
  {
    issue: 180,
    title: 'admin-breadcrumbs',
    role: 'admin',
    captures: [
      { path: '/admin/orders', name: 'orders-no-breadcrumb', description: 'Orders page - no breadcrumbs', action: async (page) => {
        // Try to click first order if exists
        await page.waitForSelector('table tr', { timeout: 3000 }).catch(() => {});
        const firstRow = await page.$('table tbody tr:first-child td a');
        if (firstRow) {
          await firstRow.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin', 'issue-180-order-detail-no-breadcrumb.png'), fullPage: true });
        }
      }}
    ]
  },

  // Issue #181 - Product Comparison
  {
    issue: 181,
    title: 'product-comparison',
    role: 'customer',
    captures: [
      { path: '/products', name: 'no-compare-checkbox', description: 'Product cards - missing compare checkbox' }
    ]
  },

  // Issue #182 - Quick View Modal
  {
    issue: 182,
    title: 'quick-view-modal',
    role: 'customer',
    captures: [
      { path: '/products', name: 'no-quick-view', description: 'Product cards - no quick view icon' }
    ]
  },

  // Issue #183 - Persistent Wishlist
  {
    issue: 183,
    title: 'wishlist',
    role: 'customer',
    captures: [
      { path: '/products', name: 'wishlist-toggle', description: 'Product page with wishlist toggle', action: async (page) => {
        const firstProduct = await page.$('.product-card a, [href*="/products/"]');
        if (firstProduct) {
          await firstProduct.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'customer', 'issue-183-wishlist-toggle.png'), fullPage: true });
        }
      }},
      { path: '/account/wishlist', name: 'wishlist-404', description: 'Wishlist page not found' }
    ]
  },

  // Issue #184 - Checkout Progress
  {
    issue: 184,
    title: 'checkout-progress',
    role: 'customer',
    captures: [
      { path: '/checkout', name: 'no-progress-indicator', description: 'Checkout - no progress stepper' },
      { path: '/checkout/payment', name: 'payment-no-progress', description: 'Payment page - no progress indicator' }
    ]
  },

  // Issue #185 - Trust Badges
  {
    issue: 185,
    title: 'trust-badges',
    role: 'customer',
    captures: [
      { path: '/checkout/payment', name: 'no-trust-badges', description: 'Payment page - missing security badges' }
    ]
  },

  // Issue #186 - Column Visibility
  {
    issue: 186,
    title: 'column-visibility',
    role: 'admin',
    captures: [
      { path: '/admin/orders', name: 'no-column-toggle', description: 'Orders table - no column visibility control' }
    ]
  },

  // Issue #187 - Pagination
  {
    issue: 187,
    title: 'pagination',
    role: 'admin',
    captures: [
      { path: '/admin/orders', name: 'pagination-no-total', description: 'Pagination without total pages' }
    ]
  },

  // Issue #188 - Mobile Filter
  {
    issue: 188,
    title: 'mobile-filter',
    role: 'customer',
    mobile: true,
    captures: [
      { path: '/products', name: 'mobile-filter-fullscreen', description: 'Mobile filter hides products' }
    ]
  },

  // Issue #189 - Delivery Estimates
  {
    issue: 189,
    title: 'delivery-estimates',
    role: 'customer',
    captures: [
      { path: '/cart', name: 'cart-no-delivery-date', description: 'Cart without delivery estimates' },
      { path: '/checkout', name: 'checkout-no-delivery', description: 'Checkout without delivery dates' }
    ]
  }
];

async function login(page, role) {
  console.log(`Logging in as ${role}...`);

  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });

    await page.type('input[type="email"]', CREDENTIALS[role].email);
    await page.type('input[type="password"]', CREDENTIALS[role].password);

    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    console.log(`✓ Logged in as ${role}`);
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error(`✗ Failed to login as ${role}:`, error.message);
    throw error;
  }
}

async function captureScreenshot(page, config, capture, isMobile = false) {
  const dir = isMobile ? 'mobile' : (config.role === 'admin' ? 'admin' : 'customer');
  const filename = `issue-${config.issue}-${capture.name}.png`;
  const filepath = path.join(SCREENSHOT_DIR, dir, filename);

  try {
    console.log(`  Capturing: ${capture.path} -> ${filename}`);
    await page.goto(`${BASE_URL}${capture.path}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Execute custom action if provided
    if (capture.action) {
      await capture.action(page);
    }

    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`  ✓ Saved: ${filename}`);

    return {
      path: filepath,
      relativePath: `docs/screenshots/${dir}/${filename}`,
      description: capture.description,
      url: capture.path
    };
  } catch (error) {
    console.error(`  ✗ Failed to capture ${filename}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Starting UI/UX audit screenshot capture...\n');

  // Ensure screenshot directories exist
  await fs.mkdir(path.join(SCREENSHOT_DIR, 'admin'), { recursive: true });
  await fs.mkdir(path.join(SCREENSHOT_DIR, 'customer'), { recursive: true });
  await fs.mkdir(path.join(SCREENSHOT_DIR, 'mobile'), { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {};

  try {
    for (const config of SCREENSHOTS) {
      console.log(`\n📸 Issue #${config.issue}: ${config.title}`);
      results[config.issue] = { screenshots: [] };

      // Create page with appropriate viewport
      const page = await browser.newPage();

      if (config.mobile) {
        await page.setViewport({ width: 375, height: 812 }); // iPhone X
      } else {
        await page.setViewport({ width: 1920, height: 1080 });
      }

      // Login
      await login(page, config.role);

      // Capture all screenshots for this issue
      for (const capture of config.captures) {
        const result = await captureScreenshot(page, config, capture, config.mobile);
        if (result) {
          results[config.issue].screenshots.push(result);
        }
      }

      await page.close();
    }

    // Save results manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalIssues: Object.keys(results).length,
      totalScreenshots: Object.values(results).reduce((sum, r) => sum + r.screenshots.length, 0),
      results
    };

    await fs.writeFile(
      path.join(SCREENSHOT_DIR, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`\n✅ Complete! Captured ${manifest.totalScreenshots} screenshots for ${manifest.totalIssues} issues`);
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`📄 Manifest saved to: ${path.join(SCREENSHOT_DIR, 'manifest.json')}`);

  } catch (error) {
    console.error('Error during screenshot capture:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run
main().catch(console.error);
