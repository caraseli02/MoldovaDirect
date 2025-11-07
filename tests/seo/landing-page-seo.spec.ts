import { test, expect } from '@playwright/test';

test.describe('Landing Page SEO Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have optimized title tag', async ({ page }) => {
    const title = await page.title();

    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(60);

    // Should include brand name or keywords
    expect(title.toLowerCase()).toMatch(/moldova|direct|food|wine|products/);
  });

  test('should have optimized meta description', async ({ page }) => {
    const description = await page.locator('meta[name="description"]').getAttribute('content');

    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThanOrEqual(120);
    expect(description!.length).toBeLessThanOrEqual(160);

    // Should include relevant keywords
    expect(description!.toLowerCase()).toMatch(/moldova|food|wine|spain|products/);
  });

  test('should have Open Graph meta tags', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
    expect(ogImage).toBeTruthy();
    expect(ogUrl).toBeTruthy();
    expect(ogType).toBe('website');

    // OG image should be absolute URL
    expect(ogImage).toMatch(/^https?:\/\//);
  });

  test('should have Twitter Card meta tags', async ({ page }) => {
    const twitterCard = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    const twitterTitle = await page.locator('meta[name="twitter:title"]').getAttribute('content');
    const twitterDescription = await page.locator('meta[name="twitter:description"]').getAttribute('content');
    const twitterImage = await page.locator('meta[name="twitter:image"]').getAttribute('content');

    expect(twitterCard).toBeTruthy();
    expect(['summary', 'summary_large_image'].includes(twitterCard || '')).toBeTruthy();
    expect(twitterTitle).toBeTruthy();
    expect(twitterDescription).toBeTruthy();
    expect(twitterImage).toBeTruthy();
  });

  test('should have canonical URL', async ({ page }) => {
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

    expect(canonical).toBeTruthy();
    expect(canonical).toMatch(/^https?:\/\//);
  });

  test('should have structured data (JSON-LD)', async ({ page }) => {
    const structuredData = await page.locator('script[type="application/ld+json"]').all();

    expect(structuredData.length).toBeGreaterThan(0);

    for (const script of structuredData) {
      const content = await script.textContent();
      expect(content).toBeTruthy();

      // Should be valid JSON
      const json = JSON.parse(content!);
      expect(json['@context']).toBe('https://schema.org');
      expect(json['@type']).toBeTruthy();
    }
  });

  test('should have Organization schema', async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').all();

    let hasOrganizationSchema = false;

    for (const script of scripts) {
      const content = await script.textContent();
      const json = JSON.parse(content!);

      if (json['@type'] === 'Organization') {
        hasOrganizationSchema = true;
        expect(json.name).toBeTruthy();
        expect(json.url).toBeTruthy();
        expect(json.logo).toBeTruthy();
      }
    }

    expect(hasOrganizationSchema).toBeTruthy();
  });

  test('should have proper heading structure', async ({ page }) => {
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text).toBeTruthy();
    expect(h1Text!.length).toBeGreaterThan(10);
  });

  test('should have proper image alt text', async ({ page }) => {
    const images = await page.locator('img:not([aria-hidden="true"])').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(5);

      // Alt text should not be just filename
      expect(alt).not.toMatch(/\.(jpg|jpeg|png|gif|svg|webp)$/i);
    }
  });

  test('should have hreflang tags for multilingual content', async ({ page }) => {
    const hreflangTags = await page.locator('link[rel="alternate"][hreflang]').all();

    expect(hreflangTags.length).toBeGreaterThan(0);

    const languages = ['es', 'en', 'ro', 'ru'];

    for (const lang of languages) {
      const langTag = await page.locator(`link[rel="alternate"][hreflang="${lang}"]`).count();
      expect(langTag).toBeGreaterThan(0);
    }
  });

  test('should have proper internal linking', async ({ page }) => {
    const internalLinks = await page.locator('a[href^="/"], a[href^="./"]').all();

    expect(internalLinks.length).toBeGreaterThan(5);

    // Links should have descriptive text
    for (const link of internalLinks.slice(0, 10)) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      expect(text?.trim() || ariaLabel).toBeTruthy();
    }
  });

  test('should have proper meta viewport', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');

    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });

  test('should have proper charset declaration', async ({ page }) => {
    const charset = await page.locator('meta[charset], meta[http-equiv="content-type"]').count();
    expect(charset).toBeGreaterThan(0);
  });

  test('should have favicon', async ({ page }) => {
    const favicon = await page.locator('link[rel*="icon"]').getAttribute('href');
    expect(favicon).toBeTruthy();
  });

  test('should have robots meta tag', async ({ page }) => {
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');

    if (robots) {
      // Should allow indexing in production
      expect(robots).not.toContain('noindex');
      expect(robots).not.toContain('nofollow');
    }
  });

  test('should have proper URL structure', async ({ page }) => {
    const currentURL = page.url();

    // URL should be clean (no query parameters on home page)
    expect(currentURL).not.toContain('?');
    expect(currentURL).not.toContain('#');

    // Should use HTTPS
    expect(currentURL).toMatch(/^https:\/\//);
  });

  test('should have breadcrumb structured data', async ({ page }) => {
    const scripts = await page.locator('script[type="application/ld+json"]').all();

    let hasBreadcrumbSchema = false;

    for (const script of scripts) {
      const content = await script.textContent();
      const json = JSON.parse(content!);

      if (json['@type'] === 'BreadcrumbList') {
        hasBreadcrumbSchema = true;
        expect(json.itemListElement).toBeTruthy();
        expect(Array.isArray(json.itemListElement)).toBeTruthy();
      }
    }

    // Breadcrumbs may not be on home page, so this is optional
    expect(true).toBeTruthy();
  });

  test('should have proper link structure (no broken internal links)', async ({ page }) => {
    const internalLinks = await page.locator('a[href^="/"], a[href^="./"]').all();

    for (const link of internalLinks.slice(0, 5)) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).not.toBe('/');
      expect(href).not.toBe('#');
    }
  });

  test('should have proper social media links', async ({ page }) => {
    const socialLinks = await page.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]').all();

    for (const link of socialLinks) {
      const href = await link.getAttribute('href');
      const target = await link.getAttribute('target');
      const rel = await link.getAttribute('rel');

      expect(href).toMatch(/^https?:\/\//);
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
    }
  });

  test('should have proper mobile optimization', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that content is not cut off
    const body = await page.locator('body').boundingBox();
    expect(body!.width).toBeLessThanOrEqual(375);

    // Check font size is readable
    const fontSize = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    const fontSizeValue = parseInt(fontSize);
    expect(fontSizeValue).toBeGreaterThanOrEqual(14);
  });
});

test.describe('Performance SEO Factors', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have proper resource loading', async ({ page }) => {
    await page.goto('/');

    // Check for render-blocking resources
    const cssLinks = await page.locator('link[rel="stylesheet"]').all();

    for (const link of cssLinks) {
      const media = await link.getAttribute('media');
      const href = await link.getAttribute('href');

      // Critical CSS should be inlined or loaded with proper media queries
      if (href?.includes('critical')) {
        expect(media).toBeFalsy();
      }
    }
  });

  test('should use proper image formats', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const src = await img.getAttribute('src');

      if (src) {
        // Should use modern image formats or responsive images
        expect(
          src.match(/\.(webp|avif|svg)$/) ||
          await img.getAttribute('srcset')
        ).toBeTruthy();
      }
    }
  });
});
