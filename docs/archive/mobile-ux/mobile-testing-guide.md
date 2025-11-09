# Mobile Testing Guide - Landing Page Critical Fixes

## Quick Start

After implementing critical fixes, use this guide to verify everything works correctly across all devices and breakpoints.

---

## 1. Local Development Testing

### Start Dev Server
```bash
npm run dev
# Server should start at http://localhost:3000
```

### Browser DevTools Testing
```bash
# Chrome/Edge DevTools
1. Open http://localhost:3000
2. Press F12 (DevTools)
3. Click device toolbar icon (Ctrl+Shift+M)
4. Test these device presets:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - iPhone 14 Pro Max (430x932)
   - Pixel 5 (393x851)
   - Samsung Galaxy S20 Ultra (412x915)
   - iPad Mini (768x1024)
   - iPad Air (820x1180)
```

---

## 2. Visual Testing Checklist

### Hero Section (LandingHeroSection.vue)
- [ ] **Height**: Hero fills viewport without overflow on all devices
- [ ] **Min height**: Hero is at least `calc(100vh - 80px)` tall
- [ ] **Typography**:
  - Mobile (320px): Headline readable at 3xl (1.875rem)
  - Tablet (768px): Headline scales to 5xl (3rem)
  - Desktop (1024px+): Headline scales to 6xl (3.75rem)
- [ ] **CTAs**: Both buttons are 48px tall and easily tappable
- [ ] **Spacing**: Content doesn't feel cramped on small screens
- [ ] **Image**: Hero image loads without causing layout shift
- [ ] **Scroll indicator**: Visible at bottom, animates correctly

### Product Carousel (LandingProductCarousel.vue)
- [ ] **Swipe**: Natural swipe gesture works on mobile
- [ ] **Peek**: Next card is visible (85% width shows ~15% of next)
- [ ] **Dots**: Pagination dots are 44×44px touch targets
- [ ] **Dot visual**: Inner dot is visible (10px / 2.5 Tailwind)
- [ ] **Active state**: Active dot expands horizontally (w-8)
- [ ] **Navigation**: Desktop arrows appear on lg+ breakpoint
- [ ] **Spacing**: Cards have proper gap (12px mobile, 24px desktop)
- [ ] **View All CTA**: Button is 48px tall and centered

### Product Cards (LandingProductCard.vue)
- [ ] **Aspect ratio**: Images maintain 1:1 ratio without shift
- [ ] **Add to cart**: Button is 44×44px (h-11 w-11)
- [ ] **Add visibility**: Always visible on mobile, hover on desktop
- [ ] **Shop Now**: Button is 44px tall minimum
- [ ] **Price**: Large and readable (text-xl on mobile)
- [ ] **Benefits**: Pills wrap properly, don't overflow
- [ ] **Card height**: Consistent across all cards
- [ ] **Hover**: Lift effect only on desktop (no lift on mobile)

---

## 3. Touch Target Testing

### Minimum Size Verification (44×44px)
```javascript
// Run in browser console
const elements = document.querySelectorAll('button, a');
const small = Array.from(elements).filter(el => {
  const rect = el.getBoundingClientRect();
  return rect.width < 44 || rect.height < 44;
});
console.log('Elements below 44px:', small);
// Should return empty array []
```

### Manual Touch Target Test
- [ ] Hero "Shop Now" button
- [ ] Hero "Take Quiz" button
- [ ] Carousel pagination dots (all of them)
- [ ] Product "Add to Cart" buttons
- [ ] Product "Shop Now" buttons
- [ ] "View All Products" button
- [ ] Scroll indicator button

---

## 4. Typography Testing

### Minimum Font Size (16px base)
```javascript
// Run in browser console
const text = document.querySelectorAll('p, span, a, button, input');
const small = Array.from(text).filter(el => {
  const size = parseFloat(window.getComputedStyle(el).fontSize);
  return size < 16 && !el.classList.contains('text-xs'); // xs is allowed
});
console.log('Text below 16px:', small);
```

### Visual Font Size Check
- [ ] **Mobile (320-375px)**:
  - Body text: 16px minimum (text-base)
  - Hero headline: 30px minimum (text-3xl)
  - Section headings: 24px minimum (text-2xl)
- [ ] **Tablet (768px)**:
  - Hero headline: 48px (text-5xl)
  - Section headings: 36px (text-4xl)
- [ ] **Desktop (1024px+)**:
  - Hero headline: 60px (text-6xl)
  - Section headings: 48px (text-5xl)

---

## 5. Layout Shift Testing (CLS)

### Automated CLS Detection
```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 \
  --only-categories=performance \
  --preset=desktop \
  --view

# Check CLS score (should be < 0.1)
```

### Manual CLS Check
1. Open page in slow 3G mode:
   - DevTools → Network → Slow 3G
2. Watch for content jumping during load
3. Areas to watch:
   - [ ] Hero image loads without shift
   - [ ] Product card images load without shift
   - [ ] Carousel maintains height during load
   - [ ] Text doesn't reflow after fonts load

---

## 6. Performance Testing

### Core Web Vitals Check
```bash
# Method 1: Lighthouse CI
npm run build
npm run start
lighthouse http://localhost:3000 --view

# Method 2: WebPageTest
# Go to: https://www.webpagetest.org
# Enter: http://your-deployed-url.com
# Device: Moto G4 (mobile)
# Connection: 3G Fast
```

### Expected Scores (After Fixes)
- **LCP**: < 2.5s (Good) ✅
- **FID**: < 100ms (Good) ✅
- **CLS**: < 0.1 (Good) ✅
- **Performance**: 85+ (Good) ✅

### Current Status
- ⚠️ LCP: ~2.8s (using Unsplash image)
- 🎯 LCP Target: ~1.8s (with self-hosted image)

---

## 7. Real Device Testing

### iOS Devices (Safari)
**Priority**: CRITICAL

```
Test on:
1. iPhone SE (2020) - iOS 15+
   - Screen: 375×667
   - Test: Hero height, touch targets

2. iPhone 13/14 - iOS 16+
   - Screen: 390×844
   - Test: All features

3. iPhone 14 Pro Max - iOS 17+
   - Screen: 430×932
   - Test: Large screen optimization

4. iPad Mini - iPadOS 16+
   - Screen: 768×1024 (portrait)
   - Test: Tablet layout, carousel
```

**iOS-Specific Checks**:
- [ ] No zoom on input focus (16px minimum)
- [ ] Smooth scrolling (no jank)
- [ ] Swipe gestures work naturally
- [ ] No layout issues with safe areas
- [ ] Video doesn't auto-play (disabled on mobile)

### Android Devices (Chrome)
**Priority**: HIGH

```
Test on:
1. Samsung Galaxy S21 - Android 12+
   - Screen: 360×800
   - Test: Small screen optimization

2. Google Pixel 5 - Android 13+
   - Screen: 393×851
   - Test: All features

3. Samsung Galaxy Tab S7 - Android 11+
   - Screen: 753×1037 (portrait)
   - Test: Tablet layout
```

**Android-Specific Checks**:
- [ ] Chrome address bar behavior
- [ ] Samsung Internet compatibility
- [ ] Touch feedback visible
- [ ] Back button navigation

---

## 8. Cross-Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS 15+
- [ ] Chrome Android
- [ ] Samsung Internet
- [ ] Firefox Mobile

---

## 9. Accessibility Testing

### Screen Reader Testing
```bash
# macOS VoiceOver
Cmd + F5 to toggle

# Windows Narrator
Win + Ctrl + Enter

# NVDA (Windows)
Download from nvaccess.org
```

**Screen Reader Checklist**:
- [ ] Hero headline announced correctly
- [ ] CTA buttons have descriptive labels
- [ ] Carousel navigation announced
- [ ] Product cards readable in sequence
- [ ] Images have alt text
- [ ] Form inputs labeled properly

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus visible on all elements
- [ ] No keyboard traps
- [ ] Skip to main content link
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

### Color Contrast
```bash
# Install axe DevTools
# Chrome Web Store: "axe DevTools"

# Or use online checker
# https://webaim.org/resources/contrastchecker/
```

**Contrast Requirements** (WCAG AA):
- [ ] Body text: 4.5:1 minimum
- [ ] Large text (18px+): 3:1 minimum
- [ ] UI components: 3:1 minimum

---

## 10. Automated Test Suite

### Run Mobile Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install --with-deps

# Run all mobile tests
npm run test -- tests/mobile/

# Run specific test file
npm run test -- tests/mobile/landing-hero.mobile.test.ts

# Run with UI
npm run test -- tests/mobile/ --ui

# Generate report
npm run test:report
```

### Expected Test Results
- **Total Tests**: ~465 scenarios
- **Expected Pass Rate**: 95%+ (440+ tests)
- **Critical Tests**: 100% pass required
- **High Priority**: 98%+ pass required

---

## 11. Performance Regression Testing

### Before Deployment
```bash
# 1. Build for production
npm run build

# 2. Start production server
npm run start

# 3. Run Lighthouse multiple times
for i in {1..3}; do
  lighthouse http://localhost:3000 \
    --output=json \
    --output-path=./lighthouse-run-$i.json
done

# 4. Compare scores
# Ensure no regression from baseline
```

### Monitoring Checklist
- [ ] Performance score: 85+ (no regression)
- [ ] LCP: < 2.5s on 3G
- [ ] CLS: < 0.1 consistently
- [ ] Bundle size: < 200KB total
- [ ] Time to Interactive: < 3.8s

---

## 12. Common Issues & Solutions

### Issue 1: Hero Overflow on iPhone SE
**Symptom**: Content cut off, excessive scrolling
**Check**: `min-h-[calc(100vh-80px)]` applied
**Fix**: Verify line 3 of LandingHeroSection.vue

### Issue 2: Pagination Dots Too Small
**Symptom**: Hard to tap dots
**Check**: Dots have `min-h-[44px] min-w-[44px]`
**Fix**: Verify lines 70-88 of LandingProductCarousel.vue

### Issue 3: Images Causing Layout Shift
**Symptom**: Content jumps during image load
**Check**: `aspectRatio: '1/1'` style applied
**Fix**: Verify line 15 of LandingProductCard.vue

### Issue 4: Text Too Small on Mobile
**Symptom**: User pinch-zooming to read
**Check**: Base font size 16px minimum
**Fix**: Verify responsive classes (text-base → text-lg → text-xl)

---

## 13. Sign-Off Checklist

Before considering testing complete:

### Critical Criteria (Must Pass)
- [ ] No horizontal overflow on any device (320px - 1920px)
- [ ] All touch targets ≥44×44px
- [ ] Typography ≥16px on mobile (body text)
- [ ] CLS score < 0.1
- [ ] No console errors
- [ ] All automated tests pass

### High Priority (Should Pass)
- [ ] LCP < 2.5s on 3G
- [ ] FID < 100ms
- [ ] Performance score 85+
- [ ] Tested on iOS Safari
- [ ] Tested on Chrome Android
- [ ] Screen reader functional

### Nice to Have (Best Effort)
- [ ] Tested on Samsung Internet
- [ ] Tested on Firefox Mobile
- [ ] Lighthouse score 90+
- [ ] Bundle size < 180KB

---

## 14. Reporting Issues

### Issue Template
```markdown
## Issue: [Brief description]

**Device**: iPhone 13 Pro / Safari 16.3
**Viewport**: 390×844
**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. Open landing page
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]

**Screenshot**: [Attach if possible]
**Console Errors**: [Paste any errors]

**Component**: LandingHeroSection.vue:123
```

### Where to Report
- GitHub Issues
- Internal bug tracker
- Slack channel: #mobile-bugs

---

## 15. Next Steps After Testing

### If All Tests Pass ✅
1. Document test results in `/docs/test-results.md`
2. Create staging deployment for QA team
3. Run A/B test with 10% traffic
4. Monitor analytics and user feedback
5. Scale to 50% → 100% rollout

### If Tests Fail ⚠️
1. Document failing tests
2. Prioritize by severity (Critical → High → Medium)
3. Fix critical issues first
4. Re-run affected tests
5. Repeat until all critical tests pass

---

## Quick Commands Reference

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Production build
npm run start                        # Production server

# Testing
npm run test -- tests/mobile/        # Run mobile tests
npm run test:report                  # View test report
npm run lint                         # Check code quality
npm run typecheck                    # TypeScript validation

# Performance
lighthouse http://localhost:3000 --view
npx nuxt analyze                     # Bundle analysis

# Debugging
npm run dev -- --host 0.0.0.0       # Test on physical devices (same network)
```

---

**Last Updated**: 2025-11-07
**Version**: 1.0
**Status**: Ready for Testing
