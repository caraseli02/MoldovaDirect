# Mobile Responsiveness Tests

Comprehensive test suite for landing page mobile responsiveness, accessibility, and performance.

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps

# Run all mobile tests
npm run test -- tests/mobile/

# Run specific test file
npm run test -- tests/mobile/landing-hero.mobile.test.ts

# Run with UI
npm run test:ui -- tests/mobile/

# Run on mobile device profile
npm run test:mobile -- tests/mobile/
```

## Test Files

### 1. `test-helpers.ts`
Utility functions for mobile testing:
- Touch target size validation
- Swipe gesture simulation
- Color contrast checking
- Performance metrics
- Visual regression screenshots

### 2. `landing-hero.mobile.test.ts`
Hero section tests (100+ scenarios):
- Rendering across 7 breakpoints
- Touch interactions
- CTA button behavior
- Image/video display logic
- Accessibility compliance
- Performance metrics

### 3. `landing-carousel.mobile.test.ts`
Product carousel tests (80+ scenarios):
- Layout and overflow prevention
- Swipe navigation
- Touch interactions
- Card visibility
- Image lazy loading
- Performance

### 4. `landing-quiz.mobile.test.ts`
Quiz modal tests (90+ scenarios):
- Modal display and sizing
- Form interactions
- Touch-friendly inputs
- Keyboard navigation
- Accessibility
- Body scroll prevention

### 5. `landing-responsiveness.test.ts`
Comprehensive responsiveness (100+ scenarios):
- All breakpoints: 320px, 375px, 390px, 414px, 640px, 768px, 1024px
- Cross-device consistency
- Typography scaling
- Touch target sizes
- Orientation changes
- Performance metrics

### 6. `landing-accessibility.mobile.test.ts`
WCAG 2.1 AA compliance (50+ tests):
- Automated axe-core checks
- Keyboard navigation
- Screen reader support
- Touch accessibility
- Motion preferences
- Color contrast

### 7. `landing-performance.mobile.test.ts`
Core Web Vitals & performance (45+ tests):
- FCP, LCP, TTI, CLS, FID
- Resource loading
- JavaScript performance
- Network performance
- Rendering performance
- Cross-device benchmarks

## Test Coverage

**Total Test Scenarios**: ~465

### By Component
- Hero Section: 100 tests
- Carousel: 80 tests
- Quiz Modal: 90 tests
- Responsiveness: 100 tests
- Accessibility: 50 tests
- Performance: 45 tests

### By Category
- Visual rendering: 35%
- Touch interactions: 20%
- Accessibility: 15%
- Performance: 15%
- Cross-device: 15%

## Breakpoints Tested

| Breakpoint | Device Examples | Tests |
|------------|----------------|-------|
| 320px | iPhone SE | Full suite |
| 375px | iPhone 12 Mini | Full suite |
| 390px | iPhone 12 | Full suite |
| 414px | iPhone 12 Pro Max | Full suite |
| 640px | Small tablet | Full suite |
| 768px | iPad | Full suite |
| 1024px | Desktop | Full suite |

## Device Profiles

- iPhone SE (320×568px)
- iPhone 12 Mini (375×812px)
- iPhone 12 (390×844px)
- iPhone 12 Pro Max (414×896px)
- Pixel 5 (393×851px)
- Galaxy S21 (360×800px)
- iPad (768×1024px)
- Desktop (1024×768px)

## Key Test Requirements

### Touch Targets
✅ Minimum 44×44px for all interactive elements
✅ Adequate spacing (≥8px) between targets

### Typography
✅ Body text ≥16px (prevent iOS zoom)
✅ H1 ≥28px mobile, ≥32px desktop
✅ H2 ≥22px mobile, ≥24px desktop

### Accessibility
✅ WCAG 2.1 AA color contrast (≥4.5:1)
✅ Keyboard navigation support
✅ Screen reader compatibility
✅ Reduced motion support

### Performance
✅ First Contentful Paint <1.8s
✅ Largest Contentful Paint <2.5s
✅ Time to Interactive <3.8s
✅ Cumulative Layout Shift <0.1
✅ First Input Delay <100ms

### Layout
✅ No horizontal overflow
✅ Proper spacing and padding
✅ Responsive images
✅ Smooth animations (≥50 FPS)

## Running Tests

### All Tests
```bash
npm run test -- tests/mobile/
```

### By Category
```bash
# Hero section
npm run test -- tests/mobile/landing-hero.mobile.test.ts

# Carousel
npm run test -- tests/mobile/landing-carousel.mobile.test.ts

# Quiz modal
npm run test -- tests/mobile/landing-quiz.mobile.test.ts

# Responsiveness
npm run test -- tests/mobile/landing-responsiveness.test.ts

# Accessibility
npm run test -- tests/mobile/landing-accessibility.mobile.test.ts

# Performance
npm run test -- tests/mobile/landing-performance.mobile.test.ts
```

### With Options
```bash
# UI mode
npm run test:ui -- tests/mobile/

# Headed (visible browser)
npm run test:headed -- tests/mobile/

# Specific device
npm run test:mobile -- tests/mobile/

# Debug mode
npm run test:debug -- tests/mobile/

# Generate report
npm run test:report
```

## Test Output

### Screenshots
Visual regression screenshots saved to:
- `test-results/screenshots/landing-hero-{width}x{height}.png`
- `test-results/screenshots/landing-carousel-{width}x{height}.png`
- `test-results/screenshots/landing-quiz-modal-{width}x{height}.png`
- `test-results/screenshots/landing-full-page-{width}x{height}.png`

### Reports
- HTML: `playwright-report/index.html`
- JSON: `test-results/results.json`
- JUnit: `test-results/junit.xml`

### Logs
- Test output: `test-results/mobile-test-output.txt`
- Summary: `.swarm/mobile-test-summary.json`

## CI/CD Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Run mobile tests
  run: |
    npx playwright install --with-deps
    npm run test -- tests/mobile/

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: mobile-test-results
    path: |
      test-results/
      playwright-report/
```

## Common Issues

### Browser Not Installed
```bash
npx playwright install --with-deps
```

### Tests Timeout
Increase timeout in test file:
```typescript
test.setTimeout(60000); // 60 seconds
```

### Visual Differences
Update snapshots:
```bash
npm run test:visual:update -- tests/mobile/
```

### Performance Fails
Check network conditions and disable throttling for local tests.

## Next Steps

1. ✅ Install Playwright: `npx playwright install`
2. ✅ Run tests: `npm run test -- tests/mobile/`
3. ✅ Review failures and fix issues
4. ✅ Update visual snapshots if needed
5. ✅ Integrate with CI/CD

## Documentation

See `/docs/mobile-test-report.md` for comprehensive test documentation.

## Support

For issues or questions:
1. Check test output in `test-results/`
2. Review HTML report: `npm run test:report`
3. Run in debug mode: `npm run test:debug -- tests/mobile/`
