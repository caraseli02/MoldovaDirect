import { chromium } from 'playwright';
import type { Page } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PageReview {
  url: string;
  name: string;
  screenshot: string;
  snapshot: string;
  uiElements: string[];
  layoutIssues: string[];
  typographyIssues: string[];
  colorIssues: string[];
  spacingIssues: string[];
  navigationIssues: string[];
  accessibilityIssues: string[];
  responsiveIssues: string[];
}

interface VisualReviewReport {
  timestamp: string;
  totalPages: number;
  viewport: { width: number; height: number };
  pages: PageReview[];
  summary: {
    criticalIssues: string[];
    moderateIssues: string[];
    minorIssues: string[];
    recommendations: string[];
  };
}

async function performVisualReview() {
  const outputDir = '/Users/vladislavcaraseli/Documents/MoldovaDirect/visual-review-results';
  const screenshotsDir = join(outputDir, 'screenshots');
  const snapshotsDir = join(outputDir, 'snapshots');
  
  mkdirSync(screenshotsDir, { recursive: true });
  mkdirSync(snapshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  
  const page = await context.newPage();
  
  const report: VisualReviewReport = {
    timestamp: new Date().toISOString(),
    totalPages: 0,
    viewport: { width: 1920, height: 1080 },
    pages: [],
    summary: {
      criticalIssues: [],
      moderateIssues: [],
      minorIssues: [],
      recommendations: []
    }
  };

  try {
    console.log('Starting visual review...');
    
    console.log('Logging in to admin interface...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'admin@moldovadirect.com');
    await page.fill('input[type="password"]', 'Admin123!@#');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    const adminPages = [
      { url: '/admin', name: 'Dashboard' },
      { url: '/admin/users', name: 'Users Management' },
      { url: '/admin/orders', name: 'Orders List' },
      { url: '/admin/orders/analytics', name: 'Orders Analytics' },
      { url: '/admin/products', name: 'Products List' },
      { url: '/admin/products/new', name: 'New Product' },
      { url: '/admin/analytics', name: 'Analytics Dashboard' },
      { url: '/admin/inventory', name: 'Inventory Management' },
      { url: '/admin/email-templates', name: 'Email Templates' },
      { url: '/admin/email-logs', name: 'Email Logs' },
      { url: '/admin/tools/email-testing', name: 'Email Testing Tool' },
      { url: '/admin/testing', name: 'Testing Page' },
      { url: '/admin/seed-orders', name: 'Seed Orders' },
    ];

    for (const pageInfo of adminPages) {
      console.log('Reviewing: ' + pageInfo.name + ' (' + pageInfo.url + ')');
      
      try {
        await page.goto('http://localhost:3000' + pageInfo.url);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const pageReview = await analyzePage(page, pageInfo, screenshotsDir, snapshotsDir);
        report.pages.push(pageReview);
        
        console.log('  Screenshot saved, found ' + pageReview.layoutIssues.length + ' layout issues');
      } catch (error: any) {
        console.error('  Error reviewing ' + pageInfo.name + ':', error.message);
      }
    }

    report.totalPages = report.pages.length;
    generateSummary(report);
    
    const reportPath = join(outputDir, 'visual-review-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('Report saved to: ' + reportPath);
    
    generateHTMLReport(report, outputDir);
    
  } catch (error: any) {
    console.error('Error during visual review:', error.message);
  } finally {
    await browser.close();
  }
  
  return report;
}

async function analyzePage(
  page: Page,
  pageInfo: { url: string; name: string },
  screenshotsDir: string,
  snapshotsDir: string
): Promise<PageReview> {
  const safeName = pageInfo.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const screenshotPath = join(screenshotsDir, safeName + '.png');
  const snapshotPath = join(snapshotsDir, safeName + '.html');
  
  await page.screenshot({ path: screenshotPath, fullPage: true });
  
  const html = await page.content();
  writeFileSync(snapshotPath, html);
  
  const uiElements = await page.evaluate(() => {
    const elements: string[] = [];
    
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
      const tagName = el.tagName.toLowerCase();
      const text = (el.textContent || '').trim();
      const styles = window.getComputedStyle(el);
      elements.push(tagName + ': "' + text.substring(0, 50) + '" (' + styles.fontSize + ', ' + styles.fontWeight + ')');
    });
    
    return elements;
  });
  
  const layoutIssues = await page.evaluate(() => {
    const issues: string[] = [];
    
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
      issues.push('Horizontal scrollbar detected - content exceeds viewport width');
    }
    
    return issues;
  });
  
  const typographyIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const fonts = new Set<string>();
    
    document.querySelectorAll('*').forEach(el => {
      const styles = window.getComputedStyle(el);
      if (el.textContent && el.textContent.trim()) {
        fonts.add(styles.fontFamily);
      }
    });
    
    if (fonts.size > 5) {
      issues.push('Too many font families: ' + fonts.size + ' different fonts used');
    }
    
    return issues;
  });
  
  const colorIssues = await page.evaluate(() => {
    const issues: string[] = [];
    const colors = new Set<string>();
    
    document.querySelectorAll('*').forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.color !== 'rgba(0, 0, 0, 0)') colors.add(styles.color);
    });
    
    if (colors.size > 20) {
      issues.push('Too many text colors: ' + colors.size + ' different colors');
    }
    
    return issues;
  });
  
  const spacingIssues: string[] = [];
  const navigationIssues = await page.evaluate(() => {
    const issues: string[] = [];
    
    const navs = document.querySelectorAll('nav, [role="navigation"]');
    if (navs.length === 0) {
      issues.push('No navigation element found');
    }
    
    const breadcrumbs = document.querySelectorAll('[aria-label*="breadcrumb"], .breadcrumb');
    if (breadcrumbs.length === 0) {
      issues.push('No breadcrumb navigation found');
    }
    
    return issues;
  });
  
  const accessibilityIssues = await page.evaluate(() => {
    const issues: string[] = [];
    
    document.querySelectorAll('img:not([alt])').forEach(() => {
      issues.push('Image without alt text found');
    });
    
    const h1s = document.querySelectorAll('h1');
    if (h1s.length > 1) {
      issues.push('Multiple h1 tags found: ' + h1s.length);
    }
    
    const focusableElements = document.querySelectorAll('a, button, input, select, textarea');
    let noOutline = 0;
    focusableElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      if (styles.outline === 'none' || styles.outlineWidth === '0px') {
        noOutline++;
      }
    });
    if (noOutline > 0) {
      issues.push(noOutline + ' focusable elements without visible focus indicator');
    }
    
    return issues;
  });
  
  const responsiveIssues: string[] = [];
  
  return {
    url: pageInfo.url,
    name: pageInfo.name,
    screenshot: screenshotPath,
    snapshot: snapshotPath,
    uiElements,
    layoutIssues,
    typographyIssues,
    colorIssues,
    spacingIssues,
    navigationIssues,
    accessibilityIssues,
    responsiveIssues
  };
}

function generateSummary(report: VisualReviewReport) {
  const allIssues = report.pages.flatMap(page => [
    ...page.layoutIssues,
    ...page.typographyIssues,
    ...page.colorIssues,
    ...page.spacingIssues,
    ...page.navigationIssues,
    ...page.accessibilityIssues,
    ...page.responsiveIssues
  ]);
  
  const critical = allIssues.filter(issue => 
    issue.includes('alt text') || issue.includes('focus indicator')
  );
  
  const moderate = allIssues.filter(issue =>
    issue.includes('navigation') || issue.includes('breadcrumb')
  );
  
  const minor = allIssues.filter(issue => 
    !critical.includes(issue) && !moderate.includes(issue)
  );
  
  report.summary.criticalIssues = [...new Set(critical)];
  report.summary.moderateIssues = [...new Set(moderate)];
  report.summary.minorIssues = [...new Set(minor)];
  
  report.summary.recommendations = [
    'Establish a consistent design system with standardized spacing, typography, and color tokens',
    'Implement proper heading hierarchy (single h1, progressive h2-h6)',
    'Add accessible labels to all form inputs and buttons',
    'Ensure sufficient color contrast (WCAG AA: 4.5:1 for normal text)',
    'Add breadcrumb navigation to all admin pages',
    'Implement consistent focus indicators for keyboard navigation',
    'Use a limited color palette (5-7 primary colors)',
    'Standardize button styles and states',
    'Ensure all images have descriptive alt text',
    'Test responsive behavior at common breakpoints'
  ];
}

function generateHTMLReport(report: VisualReviewReport, outputDir: string) {
  let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Admin UI/UX Review</title><style>';
  html += 'body{font-family:system-ui;line-height:1.6;margin:2rem;background:#f5f5f5}';
  html += '.container{max-width:1400px;margin:0 auto;background:#fff;padding:2rem;border-radius:8px}';
  html += 'h1{font-size:2rem;color:#333}h2{margin-top:2rem;color:#555;border-bottom:2px solid #eee;padding-bottom:0.5rem}';
  html += '.screenshot{max-width:100%;border:1px solid #ddd;margin:1rem 0}';
  html += '.page-review{margin:2rem 0;padding:1rem;background:#fafafa;border-radius:4px}';
  html += '.issue{padding:0.5rem;margin:0.25rem 0;background:#fff;border-left:3px solid #dc3545}';
  html += '</style></head><body><div class="container">';
  html += '<h1>MoldovaDirect Admin UI/UX Review</h1>';
  html += '<p>Generated: ' + new Date(report.timestamp).toLocaleString() + '</p>';
  html += '<p>Pages reviewed: ' + report.totalPages + '</p>';
  html += '<h2>Summary</h2>';
  html += '<p>Critical: ' + report.summary.criticalIssues.length + '</p>';
  html += '<p>Moderate: ' + report.summary.moderateIssues.length + '</p>';
  html += '<p>Minor: ' + report.summary.minorIssues.length + '</p>';
  html += '<h2>Pages</h2>';
  
  for (const page of report.pages) {
    html += '<div class="page-review">';
    html += '<h3>' + page.name + '</h3>';
    html += '<p><code>' + page.url + '</code></p>';
    html += '<img src="' + page.screenshot + '" class="screenshot" />';
    html += '<p>Issues: ' + (page.layoutIssues.length + page.accessibilityIssues.length + page.navigationIssues.length) + '</p>';
    html += '</div>';
  }
  
  html += '</div></body></html>';
  
  const htmlPath = join(outputDir, 'visual-review-report.html');
  writeFileSync(htmlPath, html);
  console.log('HTML report saved to: ' + htmlPath);
}

performVisualReview().then(report => {
  console.log('=== Visual Review Complete ===');
  console.log('Total pages: ' + report.totalPages);
  console.log('Critical issues: ' + report.summary.criticalIssues.length);
  console.log('Moderate issues: ' + report.summary.moderateIssues.length);
}).catch(console.error);
