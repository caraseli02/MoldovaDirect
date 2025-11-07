# LandingMediaMentionsBar Testing Notes

## Unit Tests Status

The Vitest unit tests require additional setup for Nuxt 3 components:
- `@nuxtjs/i18n` module integration
- Nuxt Image component mocking
- Vue 3 Composition API support

## Recommended Testing Approach

For now, use **manual testing** and **E2E tests** with Playwright:

### Manual Testing Script

1. Start dev server: `npm run dev`
2. Navigate to landing page
3. Verify:
   - Component renders
   - Logos scroll smoothly
   - Animation pauses on hover
   - Links open in new tabs
   - Responsive on mobile

### E2E Testing (Playwright)

Create a test file in `tests/e2e/landing/`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Media Mentions Bar', () => {
  test('displays and scrolls press logos', async ({ page }) => {
    await page.goto('/')
    
    // Check component is visible
    const bar = page.locator('.media-mentions-bar')
    await expect(bar).toBeVisible()
    
    // Check heading
    await expect(bar.locator('text=As Featured In')).toBeVisible()
    
    // Check logos are present
    const logos = page.locator('.mentions-carousel img')
    await expect(logos).toHaveCount(10) // 5 × 2 sets
    
    // Check animation
    const carousel = page.locator('.animate-scroll')
    await expect(carousel).toHaveCSS('animation-play-state', 'running')
  })
  
  test('pauses on hover', async ({ page }) => {
    await page.goto('/')
    
    const carousel = page.locator('.animate-scroll')
    await carousel.hover()
    
    // Animation should pause
    await expect(carousel).toHaveCSS('animation-play-state', 'paused')
  })
})
```

## Future: Unit Test Setup

To enable unit tests, configure:

1. Add to `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
```

2. Mock Nuxt auto-imports
3. Setup i18n for tests
4. Mock NuxtImg component

## Current Status

✅ Component created and functional
✅ Manual testing confirmed
✅ Documentation complete
⏳ Unit tests require Nuxt test utils setup
⏳ E2E tests can be added when needed
