# Current Landing Page Analysis Report
**Date:** November 7, 2025
**Branch:** feature-adminPage
**Objective:** Comprehensive analysis of existing landing page for modern redesign

---

## Executive Summary

The current landing page (`/pages/index.vue`) consists of **~2,576 lines** across 18 components with full i18n support (ES, EN, RO, RU). The architecture is well-structured but uses **legacy design patterns** that need modernization to match Olipop/Rare Beauty/Brightland standards.

### Key Findings
- ✅ **Strong Foundation:** Solid Nuxt 3 architecture with TypeScript, Supabase integration
- ✅ **Good i18n Coverage:** Full multilingual support across all components
- ✅ **Modern Stack:** Vue 3, Tailwind CSS 4, @vueuse/motion animations
- ⚠️ **Design Outdated:** 2023 aesthetic vs 2025 modern DTC brand standards
- ⚠️ **Performance:** Large component tree (18 components) needs optimization
- ⚠️ **Assets:** Using Unsplash placeholders - need real product photography

---

## 1. Current Page Structure

### `/pages/index.vue` Component Tree
```vue
<template>
  <div>
    <!-- 1. Promotional announcement bar -->
    <HomeAnnouncementBar :show-cta="true" />

    <!-- 2. Hero section with video/carousel -->
    <HomeHeroSection :highlights="heroHighlights" />
      ├─ HomeHeroCarousel (Amazon-style carousel)
      ├─ HomeVideoHero (video background hero)
      └─ HomeProductQuiz (quiz modal)

    <!-- 3. Quick category navigation -->
    <HomeCategoryGrid :categories="categoryCards" />

    <!-- 4. Featured products - PRIMARY CONVERSION -->
    <HomeFeaturedProductsSection
      :products="featuredProducts"
      :pending="featuredPending"
      :error="featuredErrorState"
    />

    <!-- 5. Premium collections showcase -->
    <HomeCollectionsShowcase />

    <!-- 6. Social proof and testimonials -->
    <HomeSocialProofSection
      :highlights="heroHighlights"
      :logos="partnerLogos"
      :testimonials="testimonials"
    />

    <!-- 7. Process explanation -->
    <HomeHowItWorksSection :steps="howItWorksSteps" />

    <!-- 8. Service offerings -->
    <HomeServicesSection :services="services" />

    <!-- 9. Newsletter signup -->
    <HomeNewsletterSignup />

    <!-- 10. FAQ preview -->
    <HomeFaqPreviewSection :items="faqItems" />
  </div>
</template>
```

### Key Script Logic
```typescript
// Data fetching from Supabase API
const { data: featuredData, pending, error, refresh } = await useFetch(
  '/api/products/featured',
  {
    query: { limit: 12, locale: locale.value },
    server: true,
    lazy: false
  }
)

// Content from composable
const {
  heroHighlights,
  categoryCards,
  howItWorksSteps,
  testimonials,
  partnerLogos,
  services,
  faqItems
} = useHomeContent()

// SEO with structured data
useLandingSeo({
  title: 'Moldova Direct – Taste Moldova in Every Delivery',
  description: '...',
  structuredData: [Organization, WebSite schemas]
})
```

**Total Lines:** 125 lines (lean main page, heavy delegation to components)

---

## 2. Component Inventory

### Core Components (Used in Landing Page)

| Component | Lines | Purpose | Status |
|-----------|-------|---------|--------|
| **HeroSection.vue** | 120 | Video hero + carousel + quiz CTA | 🔴 Replace |
| **HeroCarousel.vue** | ? | Amazon-style product carousel | 🔴 Replace |
| **VideoHero.vue** | ? | Video background hero section | 🔴 Modernize |
| **ProductQuiz.vue** | ? | Interactive product quiz modal | 🟡 Keep/Update |
| **FeaturedProductsSection.vue** | 169 | Product grid with filters | 🔴 Replace |
| **CategoryGrid.vue** | 94 | 4-category grid navigation | 🔴 Replace |
| **CollectionsShowcase.vue** | 134 | Premium collections masonry | 🔴 Replace |
| **SocialProofSection.vue** | 132 | Testimonials + stats | 🔴 Replace |
| **HowItWorksSection.vue** | 42 | 3-step process cards | 🟢 Keep |
| **ServicesSection.vue** | ? | Service offerings | 🟡 Update |
| **NewsletterSignup.vue** | 52 | Email capture form | 🟢 Keep |
| **FaqPreviewSection.vue** | ? | FAQ accordion preview | 🟢 Keep |
| **AnnouncementBar.vue** | 39 | Top promotional banner | 🟡 Update |

### Unused/Extra Components (Built but NOT in Landing)
- **StorySection.vue** - Moved to About page
- **MediaMentions.vue** - Press mentions bar
- **TrustBadges.vue** - Trust signals
- **VideoTestimonials.vue** - Video testimonials
- **RealTimeStats.vue** - Live stats counter

**Total Component Code:** ~2,576 lines

---

## 3. Content Architecture

### `/composables/useHomeContent.ts` (362 lines)

**What It Provides:**
```typescript
export const useHomeContent = () => {
  return {
    // Hero
    heroContent: { videoUrl?, fallbackImage, urgencyMessage, trustIndicators },
    heroHighlights: [orders, delivery, rating],

    // Categories
    categoryCards: [wines, gourmet, gifts, subscriptions],

    // Testimonials & Social Proof
    testimonials: [maria, carlos, sofia],
    partnerLogos: string[],
    mediaMentions: [nyt, wsj, forbes, techcrunch, bbc],
    trustBadges: [ssl, authenticity, moneyBack, freeShipping, securePay],
    videoTestimonials: [ana, ion, elena],
    stats: [customers, products, rating, countries],

    // Process & Services
    howItWorksSteps: [choose, prepare, deliver],
    services: [gifting, corporate],

    // Other
    storyPoints: [heritage, craft, pairings],
    storyTimeline: [...],
    faqItems: [shipping, packaging, support]
  }
}
```

### i18n Translation Files

**Location:** `/i18n/locales/*.json`
- `en.json` - English (primary)
- `es.json` - Spanish (Spain market)
- `ro.json` - Romanian
- `ru.json` - Russian

**Translation Keys Used:**
```json
{
  "home": {
    "announcement": { "highlight", "description", "cta" },
    "hero": {
      "title", "subtitle", "primaryCta", "secondaryCta",
      "fallbackAlt", "urgencyMessage",
      "highlights": { "orders", "delivery", "rating" },
      "trustIndicators": { "secure", "shipping", "rating" },
      "quizBanner": { "title", "description", "cta" }
    },
    "categories": {
      "title", "subtitle", "viewAll",
      "items": {
        "wines": { "title", "description", "cta", "imageAlt" },
        "gourmet": { ... },
        "gifts": { ... },
        "subscriptions": { ... }
      }
    },
    "featuredProducts": {
      "title", "subtitle", "noProducts", "viewAll", "error",
      "filters": { "all", "bestsellers", "new", "sale" }
    },
    "collections": { "badge", "title", "subtitle", "cards": {...} },
    "socialProof": {
      "badge", "title", "subtitle",
      "testimonials": { "maria", "carlos", "sofia" },
      "logos": [...]
    },
    "howItWorks": { "title", "subtitle", "steps": {...} },
    "services": { "items": { "gifting", "corporate" } },
    "newsletter": { "title", "subtitle", "placeholder", "cta", "success", "disclaimer" },
    "faqPreview": { "title", "subtitle", "items": {...} }
  }
}
```

**Content Status:**
- ✅ **Well-Structured:** Clean nested JSON structure
- ✅ **Complete Coverage:** All components have translations
- ⚠️ **Copy Quality:** Generic descriptions, needs marketing polish
- 🔴 **Missing:** Video testimonials, media mentions, trust badges content

---

## 4. Styling Analysis

### Tailwind CSS Configuration

**Color Palette (Primary):**
```css
/* Usage patterns found: */
from-primary-600 to-primary-700     /* Gradients */
bg-primary-600                      /* Buttons/CTAs */
text-primary-700                    /* Links */
border-primary-200                  /* Borders */
bg-primary-100                      /* Light backgrounds */
dark:bg-primary-500/20              /* Dark mode variants */
```

**Common Design Patterns:**
- **Rounded Corners:** `rounded-3xl` (48px) for cards, `rounded-full` for buttons
- **Spacing:** `py-20 md:py-28` (80px/112px vertical section spacing)
- **Shadows:** `shadow-xl`, `shadow-2xl` for depth
- **Transitions:** `transition hover:-translate-y-1` (lift effect on hover)
- **Dark Mode:** Full `dark:` variant support throughout

**Typography:**
- **Headings:** `text-3xl font-bold md:text-4xl` (30px/40px responsive)
- **Body:** `text-lg text-gray-600 dark:text-gray-400`
- **Small Text:** `text-sm` for labels/captions

**Layout:**
- **Container:** `.container` with max-width
- **Grids:** `grid gap-6 md:grid-cols-2 xl:grid-cols-4`
- **Flexbox:** Heavy use of flex for layouts

### Design System Status
- ✅ **Consistent Spacing:** Good vertical rhythm
- ✅ **Dark Mode:** Full support
- ⚠️ **Color System:** Only `primary-*` used, missing secondary/accent colors
- ⚠️ **Component Library:** Using shadcn-nuxt but underutilized
- 🔴 **Modern Patterns:** Missing glassmorphism, gradient meshes, modern microinteractions

---

## 5. Existing Assets

### `/public/` Directory Inventory
```
/public
├── icon.svg                     (297 bytes - logo)
├── placeholder-product.svg      (323 bytes - product fallback)
├── favicon.ico                  (4.3KB)
└── robots.txt                   (24 bytes)

No video files
No product photography
No brand imagery
```

### External Assets (Unsplash Placeholders)

**Current Usage:**
```typescript
// Hero fallback
'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000'

// Category images (temporary)
wines:         'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200'
gourmet:       'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200'
gifts:         'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200'
subscriptions: 'https://images.unsplash.com/photo-1606787365614-d990e8c69f0e?q=80&w=1200'

// Collections showcase
reserve:    'https://images.unsplash.com/photo-1566754436750-9393f43f02b3?q=80&w=1200'
artisan:    'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=1200'
experience: 'https://images.unsplash.com/photo-1554939437-ecc492c67b78?q=80&w=1200'
```

### TODO Comments in Code
```typescript
// composables/useHomeContent.ts:118-120
// TODO: Replace with actual hero video when available
// Video should be WebM format, <5MB, 15-30 seconds loop
videoUrl: undefined, // '/videos/hero-background.webm'

// components/home/CollectionsShowcase.vue:78-79
// TODO: Replace with actual product photography when available
// These are temporary placeholder images from Unsplash

// i18n/locales/*.json - Multiple testimonial entries
// TODO: Add real customer photos/avatars
```

**Asset Requirements:**
- 🔴 **Hero Video:** 1920x1080, WebM, <5MB, 15-30s loop
- 🔴 **Product Photos:** High-res lifestyle shots
- 🔴 **Category Images:** 4 hero images (1200x800)
- 🔴 **Collection Images:** 3 showcase images (various sizes)
- 🔴 **Customer Avatars:** Testimonial profile photos
- 🔴 **Brand Assets:** Logo variations, icons, patterns

---

## 6. Technology Stack

### Dependencies Available

**UI/Component Libraries:**
```json
{
  "shadcn-nuxt": "^2.2.0",              // Modern component library
  "reka-ui": "^2.5.1",                  // Headless UI primitives
  "lucide-vue-next": "^0.542.0",        // Icons (1000+ icons)
  "@vueuse/motion": "^3.0.3",           // Animation utilities
  "@vueuse/core": "^13.9.0",            // Vue utilities
  "vue3-carousel-nuxt": "^1.1.6",       // Carousel component
  "swiper": "^12.0.3"                   // Alternative carousel
}
```

**Styling:**
```json
{
  "tailwindcss": "^4.1.12",
  "@tailwindcss/vite": "^4.1.12",
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "tailwind-merge": "^3.3.1",
  "clsx": "^2.1.1"
}
```

**Framework/Core:**
```json
{
  "nuxt": "^3.17.7",
  "vue": "^3.5.18",
  "@nuxt/image": "^1.11.0",            // Image optimization
  "@nuxtjs/i18n": "^10.0.3",           // Internationalization
  "@pinia/nuxt": "^0.11.2",            // State management
  "@vite-pwa/nuxt": "^1.0.4"           // PWA support
}
```

**Backend Integration:**
```json
{
  "@nuxtjs/supabase": "^1.6.0",        // Database/auth
  "stripe": "^18.5.0",                 // Payments
  "@stripe/stripe-js": "^7.9.0",
  "zod": "^4.0.17",                    // Validation
  "uuid": "^11.1.0"
}
```

**Animation/Visualization:**
```json
{
  "lottie-web": "^5.13.0",             // Lottie animations
  "chart.js": "^4.5.0",                // Charts (unused?)
  "chartjs-adapter-date-fns": "^3.0.0"
}
```

**Notifications:**
```json
{
  "vue-sonner": "^2.0.8"               // Toast notifications
}
```

### Stack Highlights
- ✅ **Modern:** Nuxt 3.17, Vue 3.5, Tailwind 4
- ✅ **Performance:** Nuxt Image for optimization
- ✅ **Animation Ready:** @vueuse/motion + lottie-web
- ✅ **Component Library:** shadcn-nuxt available but underutilized
- ✅ **Type-Safe:** TypeScript + Zod validation

---

## 7. Component Replacement Mapping

### 🔴 REPLACE (High Priority)

| Current Component | New Component | Inspiration | Priority |
|-------------------|---------------|-------------|----------|
| **HeroSection.vue** + VideoHero + HeroCarousel | **ModernHero.vue** | Olipop (video bg + animated text) | P0 |
| **FeaturedProductsSection.vue** | **ProductCarousel.vue** | Olipop (horizontal scroll cards) | P0 |
| **CategoryGrid.vue** | **CategoryShowcase.vue** | Brightland (elegant grid + hover) | P1 |
| **CollectionsShowcase.vue** | **FeaturedCollections.vue** | Rare Beauty (modern card design) | P1 |
| **SocialProofSection.vue** | **UGCTestimonials.vue** + **MediaMentionsBar.vue** | Rare Beauty (UGC-first) + Brightland (press bar) | P1 |
| N/A | **TrustBadges.vue** (new) | Modern DTC standard (free shipping, secure, etc.) | P2 |

### 🟡 UPDATE (Modernize)

| Component | Changes Needed | Priority |
|-----------|----------------|----------|
| **ProductQuiz.vue** | Update styling to match new aesthetic | P2 |
| **AnnouncementBar.vue** | Add rotating messages, timer | P3 |
| **ServicesSection.vue** | Simplify design, add icons | P3 |

### 🟢 KEEP (Minimal Changes)

| Component | Why Keep | Changes |
|-----------|----------|---------|
| **HowItWorksSection.vue** | Simple, clean, works well | Update colors/spacing only |
| **NewsletterSignup.vue** | Functional, good UX | Style refresh |
| **FaqPreviewSection.vue** | Accordion works well | Update accordion styling |

### 📦 NEW COMPONENTS NEEDED

Based on modern DTC standards:

1. **ModernHero.vue**
   - Full-screen video background (WebM)
   - Animated headline with gradient text
   - Floating product cards with hover effects
   - Scroll-triggered animations

2. **ProductCarousel.vue**
   - Horizontal scroll (mobile-first)
   - Product cards with quick-add
   - Smooth momentum scrolling
   - Category tabs for filtering

3. **CategoryShowcase.vue**
   - 2x2 or 3-column grid
   - Large hero images
   - Overlay text on hover
   - Category-specific accent colors

4. **FeaturedCollections.vue**
   - Modern card design
   - Gradient overlays
   - Hover scale effects
   - "Shop the Collection" CTAs

5. **UGCTestimonials.vue**
   - Customer photo galleries
   - Instagram-style cards
   - Video testimonials
   - Real product images from customers

6. **MediaMentionsBar.vue**
   - Horizontal scrolling logo bar
   - "As Seen In" section
   - Grayscale logos with hover color
   - Automatic animation

7. **TrustBadges.vue**
   - Icon + text badges
   - Free shipping, secure checkout, etc.
   - Subtle animations
   - Responsive grid

---

## 8. Preservation Checklist

### ✅ MUST PRESERVE

**Critical Functionality:**
- [x] **i18n Support** - All 4 languages (ES, EN, RO, RU)
- [x] **Supabase Integration** - Product fetching from `/api/products/featured`
- [x] **SEO** - Structured data (Organization, WebSite schemas)
- [x] **Responsive Design** - Mobile-first approach
- [x] **Dark Mode** - Full dark mode support
- [x] **Accessibility** - ARIA labels, semantic HTML
- [x] **Analytics Tracking** - gtag events (quiz completion, etc.)

**Content Structure:**
- [x] **useHomeContent() composable** - Central content management
- [x] **Translation keys** - Maintain existing i18n key structure
- [x] **Product data flow** - `featuredProducts` → `ProductCard`

**Technical Patterns:**
- [x] **Composables** - `useSiteUrl()`, `useLandingSeo()`, `useHomeContent()`
- [x] **Type Safety** - TypeScript interfaces (ProductWithRelations, etc.)
- [x] **Error Handling** - Loading states, error recovery, retry logic
- [x] **Route localization** - `localePath('/products')`

### 🔄 MIGRATE/UPDATE

**Component Patterns:**
- Update `ProductCard` to match new design system
- Modernize scroll animations (currently using `@vueuse/motion`)
- Replace `commonIcon` with updated icon system
- Update `UiButton` component styling

**Data Fetching:**
- Keep existing `/api/products/featured` endpoint
- Maintain query parameters (`limit`, `locale`)
- Preserve error states and retry mechanism

**Styling:**
- Update primary color palette (if needed)
- Add secondary/accent colors for categories
- Modernize spacing scale
- Add new animation utilities

---

## 9. Migration Strategy

### Recommended Approach: **Option B - Progressive Component Replacement**

**Why This Approach?**
- ✅ Lower risk - Test each component individually
- ✅ Faster feedback - See changes incrementally
- ✅ Easy rollback - Can revert single components
- ✅ Parallel work - Can work on multiple components simultaneously
- ✅ No downtime - Main page stays functional

### Phase-by-Phase Plan

#### **Phase 1: Foundation** (Week 1)
1. **Setup New Design System**
   - Update Tailwind config with new color palette
   - Add custom animations/transitions
   - Create base component variants

2. **Asset Preparation**
   - Hero video (WebM, <5MB)
   - Category hero images (4x)
   - Product photography collection
   - Customer testimonial assets

3. **Content Audit**
   - Review all i18n translations
   - Update marketing copy
   - Prepare new content for video testimonials, media mentions

**Deliverables:**
- `tailwind.config.js` updated
- `/public/videos/` with hero video
- `/public/images/` with category/collection images
- i18n translations reviewed and updated

---

#### **Phase 2: Hero Replacement** (Week 1-2)
1. **Build ModernHero.vue**
   ```
   /components/home/modern/
   ├── ModernHero.vue
   ├── VideoBackground.vue
   ├── AnimatedHeadline.vue
   └── FloatingProductCards.vue
   ```

2. **Test & Integrate**
   - Replace `<HomeHeroSection>` in `pages/index.vue`
   - Test on mobile/tablet/desktop
   - Test all 4 languages
   - Lighthouse performance check

3. **Rollback Plan**
   - Keep old `HeroSection.vue` in `components/home/legacy/`
   - Easy swap if issues arise

**Deliverables:**
- New hero section live
- Performance metrics captured
- A/B test setup (optional)

---

#### **Phase 3: Product Section Upgrade** (Week 2)
1. **Build ProductCarousel.vue**
   ```
   /components/home/modern/
   ├── ProductCarousel.vue
   ├── ProductCard.vue (updated)
   └── CategoryTabs.vue
   ```

2. **Preserve Existing Logic**
   - Keep featured product fetching
   - Keep filter tabs (all/bestsellers/new/sale)
   - Keep loading/error states

3. **Enhance UX**
   - Horizontal scroll on mobile
   - Quick-add to cart
   - Smooth animations

**Deliverables:**
- Modern product carousel
- Same functionality, better UX
- Conversion tracking setup

---

#### **Phase 4: Category & Collections** (Week 3)
1. **Build CategoryShowcase.vue**
   - 2x2 grid with hero images
   - Hover effects
   - Category-specific colors

2. **Build FeaturedCollections.vue**
   - Modern card design
   - Gradient overlays
   - "Shop Collection" CTAs

3. **Replace in Landing Page**
   ```vue
   <HomeCategoryGrid> → <HomeCategoryShowcase>
   <HomeCollectionsShowcase> → <HomeFeaturedCollections>
   ```

**Deliverables:**
- 2 new sections live
- A/B test results from hero section

---

#### **Phase 5: Social Proof Modernization** (Week 3-4)
1. **Build New Components**
   ```
   /components/home/modern/
   ├── UGCTestimonials.vue
   ├── MediaMentionsBar.vue
   └── TrustBadges.vue
   ```

2. **Content Population**
   - Add real customer photos
   - Add press mentions
   - Add trust badges (free shipping, secure, etc.)

3. **Replace SocialProofSection**
   ```vue
   <HomeSocialProofSection> →
     <HomeUGCTestimonials />
     <HomeMediaMentionsBar />
     <HomeTrustBadges />
   ```

**Deliverables:**
- 3 new social proof sections
- Increased conversion rate (measure!)

---

#### **Phase 6: Polish & Optimization** (Week 4)
1. **Update Supporting Components**
   - AnnouncementBar (rotating messages)
   - ProductQuiz (updated styling)
   - ServicesSection (simplified)

2. **Performance Optimization**
   - Lazy load images
   - Defer non-critical JS
   - Optimize animations
   - Reduce bundle size

3. **Final Testing**
   - Cross-browser testing
   - Accessibility audit
   - i18n validation
   - Performance audit

**Deliverables:**
- Landing page fully modernized
- Lighthouse score: 95+ (performance, accessibility, SEO)
- Conversion rate improvement report

---

### Alternative Approaches (Not Recommended)

**Option A: New Page at `/pages/index-new.vue`**
- ❌ Requires duplicate routing setup
- ❌ Harder to A/B test
- ❌ Risk of code divergence
- ✅ Safe testing environment

**Option C: Feature Branch, Replace Everything**
- ❌ High risk - all-or-nothing deployment
- ❌ Long development time before feedback
- ❌ Harder to debug issues
- ❌ Big-bang launch stress

---

## 10. Risk Assessment

### High Risk Areas

1. **i18n Breakage** (Likelihood: Medium, Impact: High)
   - **Risk:** Translation keys change, content missing
   - **Mitigation:** Test all 4 languages on every component update
   - **Rollback:** Keep old components until 100% verified

2. **Supabase Integration** (Likelihood: Low, Impact: Critical)
   - **Risk:** Product fetching breaks, checkout fails
   - **Mitigation:** Don't touch API endpoints, only UI layer
   - **Rollback:** Easy - just swap components

3. **Performance Regression** (Likelihood: Medium, Impact: Medium)
   - **Risk:** Hero video causes slow load, large bundle size
   - **Mitigation:**
     - Optimize video (<5MB WebM)
     - Lazy load below-fold content
     - Monitor Lighthouse scores
   - **Rollback:** Remove video, use static image

4. **SEO Impact** (Likelihood: Low, Impact: High)
   - **Risk:** Structured data breaks, meta tags lost
   - **Mitigation:** Don't touch `useLandingSeo()`, test with Google Rich Results
   - **Rollback:** Restore old page if rankings drop

### Medium Risk Areas

1. **Dark Mode Compatibility** (Likelihood: Medium, Impact: Low)
   - **Risk:** New components don't have dark mode variants
   - **Mitigation:** Test every component in light/dark mode
   - **Rollback:** Add dark mode classes

2. **Mobile Responsiveness** (Likelihood: Low, Impact: Medium)
   - **Risk:** New designs break on mobile
   - **Mitigation:** Mobile-first development, test on real devices
   - **Rollback:** Adjust breakpoints

3. **Animation Performance** (Likelihood: Medium, Impact: Low)
   - **Risk:** Too many animations cause jank
   - **Mitigation:** Use `will-change`, limit simultaneous animations
   - **Rollback:** Reduce/remove animations

### Low Risk Areas

- Content updates (translations, copy)
- Color palette changes
- Spacing/typography adjustments
- Icon replacements

---

## 11. Success Metrics

### Performance Targets

**Lighthouse Scores (Mobile):**
- Performance: 90+ (currently unknown)
- Accessibility: 100
- Best Practices: 100
- SEO: 100

**Core Web Vitals:**
- LCP (Largest Contentful Paint): <2.5s
- FID (First Input Delay): <100ms
- CLS (Cumulative Layout Shift): <0.1

**Bundle Size:**
- Initial JS: <200KB (gzip)
- Total page size: <1.5MB

### Business Metrics

**Conversion Rate:**
- Baseline: Capture current rate
- Target: +15% improvement
- Key pages: Products page visits, Add to cart

**Engagement:**
- Time on page: +20%
- Scroll depth: 75%+ users
- Quiz completion: 10%+ visitors

**Bounce Rate:**
- Baseline: Capture current
- Target: -10%

### Technical Metrics

**Code Quality:**
- Component reusability: 80%+
- TypeScript coverage: 100%
- Test coverage: 70%+
- No critical accessibility issues

---

## 12. Timeline Estimate

### Conservative Timeline (4 Weeks)

```
Week 1: Foundation + Hero
├─ Days 1-2: Design system setup, asset preparation
├─ Days 3-5: ModernHero.vue development
└─ Days 6-7: Testing, integration, deployment

Week 2: Product Carousel + Category Grid
├─ Days 1-3: ProductCarousel.vue development
├─ Days 4-5: CategoryShowcase.vue development
└─ Days 6-7: Testing, A/B test setup

Week 3: Collections + Social Proof
├─ Days 1-2: FeaturedCollections.vue
├─ Days 3-5: UGCTestimonials + MediaMentions + TrustBadges
└─ Days 6-7: Integration testing

Week 4: Polish + Launch
├─ Days 1-3: Update supporting components
├─ Days 4-5: Performance optimization
└─ Days 6-7: Final testing, launch prep, deployment
```

### Aggressive Timeline (2 Weeks)

- Requires full-time focus
- Higher risk of bugs
- Less time for A/B testing
- Not recommended unless urgent

### Recommended: **4-Week Progressive Rollout**

---

## 13. Technical Constraints

### MUST NOT BREAK

1. **Authentication Flow**
   - User sessions must persist
   - Admin access must work
   - OAuth providers must function

2. **Checkout Process**
   - Cart operations must work
   - Stripe integration must function
   - Order creation must succeed

3. **Product Data**
   - API endpoints remain unchanged
   - Database queries unchanged
   - Cache strategies preserved

4. **i18n Routing**
   - `/en/`, `/es/`, `/ro/`, `/ru/` routes
   - Language switcher functionality
   - Cookie-based locale persistence

### Technical Debt to Address

1. **Unused Components**
   - Remove `StorySection.vue` or move to appropriate page
   - Clean up unused `MediaMentions`, `TrustBadges`, `VideoTestimonials`

2. **Asset Management**
   - Move Unsplash URLs to constants
   - Create asset CDN strategy
   - Implement proper image optimization

3. **Code Organization**
   - Create `/components/home/modern/` directory
   - Archive old components to `/components/home/legacy/`
   - Update imports in `pages/index.vue`

---

## 14. Next Steps

### Immediate Actions (This Week)

1. **Review & Approve This Analysis**
   - [ ] Stakeholder review
   - [ ] Technical team review
   - [ ] Design team review

2. **Asset Preparation**
   - [ ] Hero video production/sourcing
   - [ ] Product photography session
   - [ ] Category hero images
   - [ ] Customer testimonial collection

3. **Design Mockups**
   - [ ] ModernHero.vue mockup
   - [ ] ProductCarousel.vue mockup
   - [ ] CategoryShowcase.vue mockup
   - [ ] UGCTestimonials.vue mockup

4. **Setup**
   - [ ] Create feature branch: `feature/landing-page-redesign`
   - [ ] Setup `/components/home/modern/` directory
   - [ ] Update Tailwind config
   - [ ] Install any additional dependencies

### Phase 1 Kickoff (Next Week)

1. **Development**
   - [ ] Begin ModernHero.vue development
   - [ ] Implement video background component
   - [ ] Create animated headline component

2. **Content**
   - [ ] Update hero copy in all languages
   - [ ] Review and polish all i18n strings
   - [ ] Prepare urgency messaging

3. **Testing**
   - [ ] Setup A/B testing framework
   - [ ] Configure analytics tracking
   - [ ] Setup Lighthouse CI

---

## 15. Contact & Resources

### Key Files
- **Landing Page:** `/pages/index.vue`
- **Content Composable:** `/composables/useHomeContent.ts`
- **Translations:** `/i18n/locales/*.json`
- **Components:** `/components/home/*.vue`

### Documentation
- **Main README:** `/README.md`
- **Quick Start:** `/docs/getting-started/QUICK_START_GUIDE.md`
- **Architecture:** `/docs/architecture/ARCHITECTURE_REVIEW.md`
- **UI/UX Audit:** `/docs/UI_UX_AUDIT_EXECUTIVE_SUMMARY.md`

### References
- Issue: #XXX (Landing Page Redesign)
- Design System: shadcn-nuxt docs
- Inspiration: Olipop.com, RareBeauty.com, Brightland.co

---

## Appendix A: Component Line Count Breakdown

```
pages/index.vue:                       125 lines
components/home/HeroSection.vue:       120 lines
components/home/FeaturedProductsSection.vue: 169 lines
components/home/CategoryGrid.vue:       94 lines
components/home/CollectionsShowcase.vue: 134 lines
components/home/SocialProofSection.vue: 132 lines
components/home/HowItWorksSection.vue:  42 lines
components/home/NewsletterSignup.vue:   52 lines
components/home/AnnouncementBar.vue:    39 lines
components/home/[other components]     ~1669 lines
composables/useHomeContent.ts:          362 lines

TOTAL: ~2,576 lines
```

## Appendix B: Complete Component Tree with Props

```vue
<template>
  <HomeAnnouncementBar show-cta />

  <HomeHeroSection :highlights="[
    { value: '5000+', label: 'Happy Customers' },
    { value: '24-48h', label: 'Fast Delivery' },
    { value: '4.9/5', label: 'Customer Rating' }
  ]">
    <HomeHeroCarousel />
    <HomeVideoHero
      video-url="/videos/hero.webm"
      fallback-image="https://..."
      title="..."
      subtitle="..."
      urgency-message="..."
      :primary-cta="{ text: 'Shop Now', href: '/products' }"
      :trust-indicators="[...]"
    />
    <HomeProductQuiz is-open @close @complete />
  </HomeHeroSection>

  <HomeCategoryGrid :categories="[
    { key: 'wines', title: '...', description: '...', cta: '...', href: '/products?category=wine', icon: 'lucide:sparkles', accentBackground: '...', image: '...', imageAlt: '...' },
    // ... 3 more categories
  ]" />

  <HomeFeaturedProductsSection
    :products="ProductWithRelations[]"
    :pending="boolean"
    :error="Error | null"
    @retry
  />

  <HomeCollectionsShowcase />

  <HomeSocialProofSection
    :highlights="[...]"
    :logos="string[]"
    :testimonials="[
      { id, name, avatar?, location, rating, verified, date, quote, productImage? },
      // ...
    ]"
  />

  <HomeHowItWorksSection :steps="[
    { key: 'choose', title: '...', description: '...', icon: 'lucide:search' },
    // ... 2 more steps
  ]" />

  <HomeServicesSection :services="[
    { title, description, cta, href, icon },
    // ...
  ]" />

  <HomeNewsletterSignup />

  <HomeFaqPreviewSection :items="[
    { question, answer },
    // ...
  ]" />
</template>
```

---

**End of Analysis Report**

**Document Version:** 1.0
**Last Updated:** 2025-11-07
**Status:** Ready for Review

