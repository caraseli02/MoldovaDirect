# Cleanup & Migration Architecture

**Version:** 1.0.0
**Date:** 2025-11-08
**Status:** Draft - Architecture Design
**Author:** System Architecture Designer

---

## Executive Summary

This document outlines a comprehensive cleanup and migration architecture for the Moldova Direct e-commerce platform. The analysis reveals significant opportunities for code consolidation, improved organization, and performance optimization through strategic refactoring.

### Key Findings
- **Component Duplication:** 11 landing components vs 19 home components (30% overlap in functionality)
- **Documentation Sprawl:** 114 markdown files in root `docs/` folder
- **Build Size:** Current 3.3MB client bundle with optimization opportunities
- **Code Volume:** 1,671 lines (landing) + 2,450 lines (home) = 4,121 lines of potentially duplicated UI code
- **Component Organization:** 604KB admin components, 360KB UI components need better structure

---

## 1. Current Architecture Analysis

### 1.1 Directory Structure (Current State)

```
/
├── components/
│   ├── ab-testing/          # 48KB - A/B test variants
│   │   ├── HeroVariantA.vue
│   │   ├── HeroVariantB.vue
│   │   ├── HeroVariantC.vue
│   │   └── ProductQuiz.vue  # DUPLICATE 1
│   │
│   ├── admin/               # 604KB - Admin dashboard
│   │   ├── Charts/          # Various chart components
│   │   ├── Dashboard/       # Dashboard sections
│   │   ├── Email/           # Email management
│   │   ├── Inventory/       # Stock management
│   │   ├── Orders/          # Order management
│   │   ├── Products/        # Product CRUD
│   │   ├── Users/           # User management
│   │   └── Utils/           # Admin utilities
│   │
│   ├── home/                # 124KB - Original home page (19 components, 2,450 lines)
│   │   ├── AnnouncementBar.vue
│   │   ├── CategoryGrid.vue
│   │   ├── CollectionsShowcase.vue
│   │   ├── FaqPreviewSection.vue
│   │   ├── FeaturedProductsSection.vue
│   │   ├── HeroCarousel.vue
│   │   ├── HeroSection.vue           # DIFFERENT from Landing
│   │   ├── HowItWorksSection.vue
│   │   ├── MediaMentions.vue         # SIMILAR to Landing
│   │   ├── NewsletterSignup.vue      # SIMILAR to Landing
│   │   ├── ProductQuiz.vue           # DUPLICATE 2
│   │   ├── RealTimeStats.vue
│   │   ├── ServicesSection.vue
│   │   ├── SocialProofSection.vue
│   │   ├── StorySection.vue
│   │   ├── TrustBadges.vue           # SIMILAR to Landing
│   │   ├── VideoHero.vue
│   │   └── VideoTestimonials.vue
│   │
│   ├── landing/             # 76KB - New landing page (11 components, 1,671 lines)
│   │   ├── LandingFeaturedCollections.vue
│   │   ├── LandingHeroSection.vue    # DIFFERENT from Home
│   │   ├── LandingMediaMentionsBar.vue
│   │   ├── LandingNewsletterSignup.vue
│   │   ├── LandingProductCard.vue
│   │   ├── LandingProductCarousel.vue
│   │   ├── LandingQuizCTA.vue
│   │   ├── LandingStatsCounter.vue
│   │   ├── LandingTrustBadges.vue
│   │   ├── LandingUGCGallery.vue
│   │   └── QuizModal.vue
│   │
│   ├── ui/                  # 360KB - Shadcn UI components
│   ├── layout/              # 68KB - Header, footer, nav
│   ├── checkout/            # 136KB - Checkout flow
│   ├── order/               # 96KB - Order tracking
│   ├── product/             # 72KB - Product display
│   ├── cart/                # 24KB - Shopping cart
│   ├── auth/                # 16KB - Authentication
│   ├── quiz/                # 24KB - Quiz components
│   ├── mobile/              # 28KB - Mobile-specific
│   ├── profile/             # 24KB - User profile
│   ├── common/              # 20KB - Shared utilities
│   └── animations/          # 8KB - Animation components
│
├── pages/
│   ├── index.vue            # Uses home/ components
│   ├── old-home-backup.vue  # BACKUP - Should be removed
│   ├── landing-demo.vue     # DEMO PAGE - Should be removed
│   ├── new.vue              # Uses landing/ components
│   ├── quiz-demo.vue        # DEMO PAGE - Should be removed
│   ├── test-*.vue           # 4 TEST PAGES - Should be moved to tests/
│   └── [other pages...]
│
├── docs/                    # 114 markdown files - NEEDS ORGANIZATION
│   ├── AUDIT_COMPLETION_SUMMARY.md
│   ├── CRITICAL_FIXES_SUMMARY.md
│   ├── HERO_ITERATION_RESULTS.md
│   ├── MOBILE_UX_COMPLETE.md
│   ├── SECURITY_AUDIT_2025.md
│   ├── [110+ more files...]
│   └── README.md
│
├── composables/
│   ├── landing/             # Landing-specific composables
│   │   ├── useAnimations.ts
│   │   └── useQuiz.ts
│   └── [other composables...]
│
└── [project root files]
    ├── MOBILE_TESTING_COMPLETE.md  # Should be in docs/
    ├── LANDING_HERO_SUMMARY.md     # Should be in docs/
    └── [config files...]
```

### 1.2 Component Dependency Graph

#### Current Dependencies

```
pages/index.vue (Home Page)
├── HomeAnnouncementBar
├── HomeHeroSection
│   ├── HomeHeroCarousel
│   └── HomeVideoHero
├── HomeCategoryGrid
├── HomeFeaturedProductsSection
├── HomeCollectionsShowcase
├── HomeSocialProofSection
├── HomeHowItWorksSection
├── HomeServicesSection
├── HomeNewsletterSignup
└── HomeFaqPreviewSection

pages/new.vue (Landing Page)
├── LandingHeroSection (video background)
├── LandingProductCarousel
├── LandingStatsCounter
├── LandingTrustBadges
├── LandingMediaMentionsBar
├── LandingNewsletterSignup
├── LandingQuizCTA
├── LandingUGCGallery
└── LandingFeaturedCollections
```

#### Duplication Analysis

| Component Type | Home Version | Landing Version | Similarity | Action Needed |
|---------------|--------------|-----------------|------------|---------------|
| Hero Section | `HomeHeroSection` | `LandingHeroSection` | 30% | Keep separate (different UX) |
| Newsletter | `HomeNewsletterSignup` | `LandingNewsletterSignup` | 90% | **MERGE** |
| Trust Badges | `HomeTrustBadges` | `LandingTrustBadges` | 85% | **MERGE** |
| Media Mentions | `HomeMediaMentions` | `LandingMediaMentionsBar` | 80% | **MERGE** |
| Product Quiz | `home/ProductQuiz` | `ab-testing/ProductQuiz` | 100% | **REMOVE DUPLICATE** |
| Collections | `HomeCollectionsShowcase` | `LandingFeaturedCollections` | 70% | Evaluate merge |
| Stats/Counter | `HomeRealTimeStats` | `LandingStatsCounter` | 75% | **MERGE** |

---

## 2. Proposed Architecture

### 2.1 Target Directory Structure

```
/
├── components/
│   ├── admin/               # [NO CHANGE] - Admin dashboard
│   │
│   ├── ui/                  # [NO CHANGE] - Shadcn UI components
│   │
│   ├── shared/              # [NEW] - Reusable cross-page components
│   │   ├── NewsletterSignup.vue          # Merged from home + landing
│   │   ├── TrustBadges.vue               # Merged from home + landing
│   │   ├── MediaMentions.vue             # Merged from home + landing
│   │   ├── StatsCounter.vue              # Merged from home + landing
│   │   ├── ProductCarousel.vue           # Generalized carousel
│   │   └── CollectionsShowcase.vue       # Unified collections
│   │
│   ├── home/                # [REFACTORED] - Home page specific (13 components)
│   │   ├── hero/            # Hero section components
│   │   │   ├── HeroSection.vue
│   │   │   ├── HeroCarousel.vue
│   │   │   └── VideoHero.vue
│   │   ├── AnnouncementBar.vue
│   │   ├── CategoryGrid.vue
│   │   ├── FeaturedProductsSection.vue
│   │   ├── SocialProofSection.vue
│   │   ├── HowItWorksSection.vue
│   │   ├── ServicesSection.vue
│   │   ├── FaqPreviewSection.vue
│   │   ├── StorySection.vue
│   │   └── VideoTestimonials.vue
│   │
│   ├── landing/             # [REFACTORED] - Landing page specific (5 components)
│   │   ├── LandingHeroSection.vue        # Keep (unique video bg implementation)
│   │   ├── LandingProductCard.vue        # Keep (landing-specific styling)
│   │   ├── LandingQuizCTA.vue            # Keep (landing conversion focus)
│   │   ├── LandingUGCGallery.vue         # Keep (social proof)
│   │   └── QuizModal.vue                 # Keep (quiz flow)
│   │
│   ├── quiz/                # [CONSOLIDATED] - All quiz components
│   │   ├── QuizModal.vue                 # Moved from landing/
│   │   ├── QuizProgress.vue
│   │   ├── QuizResults.vue
│   │   ├── QuizStep.vue
│   │   └── ProductQuiz.vue               # Single source (from home/)
│   │
│   ├── ab-testing/          # [CLEANED] - Only A/B variants
│   │   ├── HeroVariantA.vue
│   │   ├── HeroVariantB.vue
│   │   └── HeroVariantC.vue
│   │   # ProductQuiz.vue REMOVED (duplicate)
│   │
│   └── [other folders unchanged]
│       ├── layout/
│       ├── checkout/
│       ├── order/
│       ├── product/
│       ├── cart/
│       ├── auth/
│       ├── mobile/
│       ├── profile/
│       ├── common/
│       └── animations/
│
├── composables/
│   ├── shared/              # [NEW] - Shared composables
│   │   ├── useNewsletter.ts
│   │   ├── useStatsCounter.ts
│   │   └── useTrustBadges.ts
│   │
│   ├── landing/             # [CLEANED] - Landing-specific only
│   │   └── useAnimations.ts  # Keep (landing animations)
│   │
│   ├── quiz/                # [NEW] - Quiz logic consolidated
│   │   └── useQuiz.ts        # Moved from landing/
│   │
│   └── [other composables unchanged]
│
├── pages/
│   ├── index.vue            # [UPDATED] - Uses home/ + shared/
│   ├── new.vue              # [UPDATED] - Uses landing/ + shared/
│   │
│   # REMOVED FILES:
│   # ├── old-home-backup.vue    → DELETED
│   # ├── landing-demo.vue       → DELETED
│   # ├── quiz-demo.vue          → DELETED
│   # ├── test-admin.vue         → Moved to tests/e2e/
│   # ├── test-api.vue           → Moved to tests/e2e/
│   # ├── test-landing-components.vue → Moved to tests/e2e/
│   # ├── test-users.vue         → Moved to tests/e2e/
│   │
│   └── [other pages unchanged]
│
├── docs/                    # [REORGANIZED] - Structured documentation
│   ├── architecture/        # Architecture docs
│   │   ├── CLEANUP_ARCHITECTURE.md
│   │   ├── component-structure.md
│   │   └── system-design.md
│   │
│   ├── deployment/          # DevOps and deployment
│   │   ├── DEVOPS_CICD_REVIEW_REPORT.md
│   │   └── deployment-guide.md
│   │
│   ├── development/         # Development guides
│   │   ├── README.md
│   │   ├── QUICK_START_GUIDE.md
│   │   └── coding-standards.md
│   │
│   ├── features/            # Feature documentation
│   │   ├── landing-page/
│   │   │   ├── NEW_LANDING_PAGE.md
│   │   │   ├── HERO_ITERATION_RESULTS.md
│   │   │   └── HERO_SECTION_VISUAL_COMPARISON.md
│   │   ├── quiz/
│   │   │   ├── QUIZ_COMPONENTS.md
│   │   │   └── QUIZ_IMPLEMENTATION_REPORT.md
│   │   └── mobile/
│   │       ├── MOBILE_UX_COMPLETE.md
│   │       ├── MOBILE_UX_VALIDATION_REPORT.md
│   │       └── MOBILE_TESTING_COMPLETE.md
│   │
│   ├── security/            # Security documentation
│   │   ├── SECURITY_AUDIT_2025.md
│   │   ├── security-policies.md
│   │   └── STRIPE_WEBHOOK_SETUP.md
│   │
│   ├── testing/             # Testing documentation
│   │   ├── test-strategy.md
│   │   ├── mobile-testing-guide.md
│   │   └── SCREENSHOT_CAPTURE_GUIDE.md
│   │
│   ├── ux/                  # UX/UI documentation
│   │   ├── UI_UX_AUDIT_EXECUTIVE_SUMMARY.md
│   │   ├── SCREENSHOT_BASED_DESIGN_ITERATION_PLAN.md
│   │   └── design-system.md
│   │
│   ├── project-management/  # Project docs
│   │   ├── SOLO_DEV_ACTION_PLAN.md
│   │   ├── AUDIT_COMPLETION_SUMMARY.md
│   │   └── CRITICAL_FIXES_SUMMARY.md
│   │
│   └── CHANGELOG.md         # Project changelog
│
├── tests/
│   ├── e2e/
│   │   ├── pages/           # [NEW] - Test pages moved here
│   │   │   ├── test-admin.vue
│   │   │   ├── test-api.vue
│   │   │   ├── test-landing-components.vue
│   │   │   └── test-users.vue
│   │   └── [existing e2e tests]
│   └── [other test folders]
│
└── [project root]
    # CLEANED - No loose markdown files
    # All docs moved to docs/ folder
```

### 2.2 Component Hierarchy (Post-Cleanup)

#### Shared Components (6 components)
```
shared/
├── NewsletterSignup.vue           # Universal newsletter signup
├── TrustBadges.vue                # Universal trust indicators
├── MediaMentions.vue              # Universal media logo bar
├── StatsCounter.vue               # Animated statistics counter
├── ProductCarousel.vue            # Reusable product carousel
└── CollectionsShowcase.vue        # Featured collections display
```

#### Home Components (13 components - streamlined)
```
home/
├── hero/
│   ├── HeroSection.vue            # Main hero container
│   ├── HeroCarousel.vue           # Amazon-style carousel
│   └── VideoHero.vue              # Video background hero
├── AnnouncementBar.vue
├── CategoryGrid.vue
├── FeaturedProductsSection.vue
├── SocialProofSection.vue
├── HowItWorksSection.vue
├── ServicesSection.vue
├── FaqPreviewSection.vue
├── StorySection.vue
└── VideoTestimonials.vue
```

#### Landing Components (5 components - focused)
```
landing/
├── LandingHeroSection.vue         # High-conversion video hero
├── LandingProductCard.vue         # Optimized product card
├── LandingQuizCTA.vue             # Conversion-optimized CTA
├── LandingUGCGallery.vue          # Social proof gallery
└── QuizModal.vue                  # Quiz modal (may move to quiz/)
```

#### Quiz Components (5 components - consolidated)
```
quiz/
├── QuizModal.vue                  # Main quiz modal
├── QuizProgress.vue               # Progress indicator
├── QuizResults.vue                # Results display
├── QuizStep.vue                   # Individual quiz step
└── ProductQuiz.vue                # Product quiz logic (single source)
```

---

## 3. File Move & Rename Operations

### 3.1 Component Migrations

#### Phase 1: Create Shared Components (Merge Duplicates)

```bash
# Create shared components directory
mkdir -p components/shared

# Merge Newsletter components
# Base on landing version (better UX), incorporate home features
cp components/landing/LandingNewsletterSignup.vue components/shared/NewsletterSignup.vue
# Manual: Merge features from components/home/NewsletterSignup.vue

# Merge Trust Badges
cp components/landing/LandingTrustBadges.vue components/shared/TrustBadges.vue
# Manual: Merge features from components/home/TrustBadges.vue

# Merge Media Mentions
cp components/landing/LandingMediaMentionsBar.vue components/shared/MediaMentions.vue
# Manual: Merge features from components/home/MediaMentions.vue

# Merge Stats Counter
cp components/landing/LandingStatsCounter.vue components/shared/StatsCounter.vue
# Manual: Merge features from components/home/RealTimeStats.vue

# Create unified ProductCarousel
cp components/landing/LandingProductCarousel.vue components/shared/ProductCarousel.vue
# Manual: Add props for different styling needs

# Merge Collections
cp components/home/CollectionsShowcase.vue components/shared/CollectionsShowcase.vue
# Manual: Merge features from components/landing/LandingFeaturedCollections.vue
```

#### Phase 2: Consolidate Quiz Components

```bash
# Create quiz directory
mkdir -p components/quiz

# Move quiz components from landing
mv components/landing/QuizModal.vue components/quiz/QuizModal.vue

# Keep home ProductQuiz (remove ab-testing duplicate)
# Manual: Review components/home/ProductQuiz.vue vs components/ab-testing/ProductQuiz.vue
# Action: Delete components/ab-testing/ProductQuiz.vue (duplicate)

# Move quiz composable
mkdir -p composables/quiz
mv composables/landing/useQuiz.ts composables/quiz/useQuiz.ts
```

#### Phase 3: Organize Home Components

```bash
# Create hero subdirectory
mkdir -p components/home/hero

# Move hero components
mv components/home/HeroSection.vue components/home/hero/HeroSection.vue
mv components/home/HeroCarousel.vue components/home/hero/HeroCarousel.vue
mv components/home/VideoHero.vue components/home/hero/VideoHero.vue
```

#### Phase 4: Clean Landing Components

```bash
# Landing components remain, but reference shared components
# Update imports in landing components to use shared/ where applicable

# Delete merged components from landing/
rm components/landing/LandingNewsletterSignup.vue
rm components/landing/LandingTrustBadges.vue
rm components/landing/LandingMediaMentionsBar.vue
rm components/landing/LandingStatsCounter.vue
rm components/landing/LandingProductCarousel.vue
rm components/landing/LandingFeaturedCollections.vue
```

### 3.2 Page Cleanup

```bash
# Remove backup and demo pages
rm pages/old-home-backup.vue
rm pages/landing-demo.vue
rm pages/quiz-demo.vue

# Move test pages to tests/e2e/pages
mkdir -p tests/e2e/pages
mv pages/test-admin.vue tests/e2e/pages/test-admin.vue
mv pages/test-api.vue tests/e2e/pages/test-api.vue
mv pages/test-landing-components.vue tests/e2e/pages/test-landing-components.vue
mv pages/test-users.vue tests/e2e/pages/test-users.vue
```

### 3.3 Documentation Reorganization

```bash
# Create documentation structure
mkdir -p docs/{architecture,deployment,development,features,security,testing,ux,project-management}
mkdir -p docs/features/{landing-page,quiz,mobile}

# Move landing page docs
mv docs/NEW_LANDING_PAGE.md docs/features/landing-page/
mv docs/HERO_ITERATION_RESULTS.md docs/features/landing-page/
mv docs/HERO_SECTION_VISUAL_COMPARISON.md docs/features/landing-page/
mv docs/SCREENSHOT_BASED_DESIGN_ITERATION_PLAN.md docs/features/landing-page/

# Move quiz docs
mv docs/QUIZ_COMPONENTS.md docs/features/quiz/
mv docs/QUIZ_IMPLEMENTATION_REPORT.md docs/features/quiz/

# Move mobile docs
mv docs/MOBILE_UX_COMPLETE.md docs/features/mobile/
mv docs/MOBILE_UX_VALIDATION_REPORT.md docs/features/mobile/
mv docs/MOBILE_UX_100_PERCENT_COMPLETE.md docs/features/mobile/
mv MOBILE_TESTING_COMPLETE.md docs/features/mobile/

# Move security docs
mv docs/SECURITY_AUDIT_2025.md docs/security/
mv docs/STRIPE_WEBHOOK_SETUP.md docs/security/

# Move deployment docs
mv docs/DEVOPS_CICD_REVIEW_REPORT.md docs/deployment/

# Move UX docs
mv docs/UI_UX_AUDIT_EXECUTIVE_SUMMARY.md docs/ux/
mv docs/SCREENSHOT_CAPTURE_GUIDE.md docs/testing/

# Move project management docs
mv docs/SOLO_DEV_ACTION_PLAN.md docs/project-management/
mv docs/AUDIT_COMPLETION_SUMMARY.md docs/project-management/
mv docs/CRITICAL_FIXES_SUMMARY.md docs/project-management/

# Move root docs
mv LANDING_HERO_SUMMARY.md docs/features/landing-page/
mv docs/README.md docs/development/README.md

# Move architecture docs
mv docs/CLEANUP_ARCHITECTURE.md docs/architecture/
```

### 3.4 Composables Reorganization

```bash
# Create shared composables
mkdir -p composables/shared

# Move landing composables (keep animations)
# useQuiz already moved to composables/quiz/

# Create shared composables for merged components
# (These will be created during component merge phase)
```

---

## 4. Import Path Updates

### 4.1 Component Import Changes

#### pages/index.vue (Home Page)
```diff
// Before
- import HomeNewsletterSignup from '~/components/home/NewsletterSignup.vue'
- import HomeTrustBadges from '~/components/home/TrustBadges.vue'
- import HomeMediaMentions from '~/components/home/MediaMentions.vue'

// After
+ import NewsletterSignup from '~/components/shared/NewsletterSignup.vue'
+ import TrustBadges from '~/components/shared/TrustBadges.vue'
+ import MediaMentions from '~/components/shared/MediaMentions.vue'

// Hero imports updated
- import HomeHeroSection from '~/components/home/HeroSection.vue'
+ import HomeHeroSection from '~/components/home/hero/HeroSection.vue'
```

#### pages/new.vue (Landing Page)
```diff
// Before
- import LandingNewsletterSignup from '~/components/landing/LandingNewsletterSignup.vue'
- import LandingTrustBadges from '~/components/landing/LandingTrustBadges.vue'
- import LandingMediaMentionsBar from '~/components/landing/LandingMediaMentionsBar.vue'
- import LandingProductCarousel from '~/components/landing/LandingProductCarousel.vue'

// After
+ import NewsletterSignup from '~/components/shared/NewsletterSignup.vue'
+ import TrustBadges from '~/components/shared/TrustBadges.vue'
+ import MediaMentions from '~/components/shared/MediaMentions.vue'
+ import ProductCarousel from '~/components/shared/ProductCarousel.vue'
```

#### components/landing/QuizModal.vue
```diff
// Before
- import { useQuiz } from '~/composables/landing/useQuiz'

// After
+ import { useQuiz } from '~/composables/quiz/useQuiz'
```

#### components/ab-testing/ variants
```diff
// Before
- import ProductQuiz from '~/components/ab-testing/ProductQuiz.vue'

// After
+ import ProductQuiz from '~/components/quiz/ProductQuiz.vue'
```

### 4.2 Auto-Import Configuration

Nuxt auto-imports from `components/` directory, so most component imports are automatic. However, we need to ensure:

```typescript
// nuxt.config.ts - Already configured
components: {
  extensions: ['vue'],
  dirs: [
    {
      path: '~/components',
      pathPrefix: true,
      extensions: ['vue'],
      ignore: ['ui/**', '**/index.ts'],
    },
  ],
}
```

This means:
- `components/shared/NewsletterSignup.vue` → `<SharedNewsletterSignup />`
- `components/home/hero/HeroSection.vue` → `<HomeHeroHeroSection />`
- `components/quiz/ProductQuiz.vue` → `<QuizProductQuiz />`

### 4.3 Composable Import Updates

```diff
// Any file using quiz composable
- import { useQuiz } from '~/composables/landing/useQuiz'
+ import { useQuiz } from '~/composables/quiz/useQuiz'
```

---

## 5. Expected Performance Improvements

### 5.1 Bundle Size Analysis

#### Current State
```
Client Bundle: 3.3 MB
- Admin components: 604 KB
- UI components: 360 KB
- Checkout: 136 KB
- Home components: 124 KB
- Order components: 96 KB
- Landing components: 76 KB
- Product components: 72 KB
- Duplicated code: ~40 KB (estimated)
```

#### After Cleanup
```
Client Bundle: ~3.1 MB (-6% estimated)
- Removed duplicates: -40 KB
- Removed backup pages: -15 KB
- Better tree-shaking: -100 KB (estimated)
- Code splitting improvements: Better lazy loading

Total savings: ~155 KB (-4.7%)
```

### 5.2 Code Reduction

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| Landing components | 1,671 lines | ~800 lines | -52% |
| Home components | 2,450 lines | ~1,900 lines | -22% |
| Shared components | 0 lines | ~600 lines | N/A |
| **Total UI code** | **4,121 lines** | **3,300 lines** | **-20%** |
| Quiz components | Scattered | Consolidated | Better maintainability |
| Documentation files | 114 files | 114 files (organized) | Same count, better structure |

### 5.3 Developer Experience Improvements

- **Reduced cognitive load:** Clear separation between shared, home, landing
- **Faster development:** Find components easier with organized structure
- **Better maintainability:** Single source of truth for shared components
- **Improved testing:** Centralized quiz components easier to test
- **Documentation discovery:** Organized docs/ structure with clear categories

### 5.4 Build Performance

#### Before
- Cold build time: ~45s
- Hot reload: ~2s
- Component lookup: Scattered across folders

#### After (Estimated)
- Cold build time: ~40s (-11%)
- Hot reload: ~1.5s (-25%)
- Component lookup: Faster with better organization
- Tree-shaking: More effective with clear dependencies

---

## 6. Risk Assessment & Mitigation

### 6.1 High Risk Items

#### 1. Component Merge Breaking Changes
**Risk:** Merging components may break existing functionality
**Impact:** Critical - Could break production pages
**Probability:** Medium

**Mitigation:**
1. Create feature branch for cleanup
2. Implement comprehensive test coverage before merge
3. Use visual regression testing (Playwright snapshots)
4. Test both home and landing pages thoroughly
5. Staged rollout: Test → Staging → Production
6. Keep backup of original components during transition

#### 2. Import Path Updates
**Risk:** Missing import path updates could cause runtime errors
**Impact:** Critical - Application won't compile/run
**Probability:** Low (TypeScript will catch most)

**Mitigation:**
1. Use global search/replace for import paths
2. Run TypeScript compiler to catch missing imports
3. Use `pnpm build` to verify all paths resolve
4. Test all pages after import updates
5. Use IDE refactoring tools where possible

#### 3. Documentation Link Breakage
**Risk:** Moving docs breaks internal links
**Impact:** Low - Documentation becomes harder to navigate
**Probability:** High

**Mitigation:**
1. Use markdown link checker before and after
2. Update all relative links in moved files
3. Create redirect index or navigation in docs/README.md
4. Run `pnpm docs:audit` to verify links

### 6.2 Medium Risk Items

#### 4. Component Props/API Changes
**Risk:** Merged components may have different prop interfaces
**Impact:** Medium - Requires updates in parent components
**Probability:** Medium

**Mitigation:**
1. Document prop interface changes
2. Use TypeScript to enforce prop types
3. Create adapter props for backward compatibility
4. Test all component usage locations

#### 5. Styling Conflicts
**Risk:** Merged components may have conflicting styles
**Impact:** Medium - Visual inconsistencies
**Probability:** Medium

**Mitigation:**
1. Visual regression testing
2. Test on multiple screen sizes
3. Review Tailwind classes for conflicts
4. Use component variants/slots for customization

#### 6. State Management Issues
**Risk:** Shared components may have different state requirements
**Impact:** Medium - Logic bugs
**Probability:** Low

**Mitigation:**
1. Use props for all external state
2. Emit events for parent communication
3. Avoid internal state in shared components
4. Document state requirements clearly

### 6.3 Low Risk Items

#### 7. File System Operations
**Risk:** File moves could fail or corrupt files
**Impact:** Low - Easy to revert with git
**Probability:** Very Low

**Mitigation:**
1. Use git for all operations
2. Create backup branch before starting
3. Commit after each phase
4. Verify file contents after moves

#### 8. Build Configuration Changes
**Risk:** Nuxt.config updates may not work as expected
**Impact:** Low - Can revert config
**Probability:** Very Low

**Mitigation:**
1. Test build after each config change
2. Keep old config commented out
3. Document all config changes

---

## 7. Implementation Plan

### 7.1 Phase 1: Preparation (1 day)
**Goal:** Set up infrastructure for safe migration

1. **Create feature branch**
   ```bash
   git checkout -b feature/cleanup-architecture
   ```

2. **Run full test suite**
   ```bash
   pnpm test
   pnpm test:unit
   pnpm test:e2e
   ```

3. **Generate visual baselines**
   ```bash
   pnpm test:visual:update
   ```

4. **Document current state**
   - Take screenshots of all pages
   - Document component usage
   - List all import paths

5. **Create rollback plan**
   - Tag current commit
   - Document revert procedure

### 7.2 Phase 2: Shared Components (2 days)
**Goal:** Create and test shared components

1. **Create shared/ directory structure**
   ```bash
   mkdir -p components/shared
   mkdir -p composables/shared
   ```

2. **Merge NewsletterSignup**
   - Copy landing version as base
   - Add features from home version
   - Create unified prop interface
   - Test in both contexts

3. **Merge TrustBadges**
   - Same process as newsletter

4. **Merge MediaMentions**
   - Same process

5. **Merge StatsCounter**
   - Combine RealTimeStats and LandingStatsCounter

6. **Create ProductCarousel**
   - Generalize landing carousel
   - Add variant props

7. **Test shared components**
   - Unit tests for each component
   - Visual regression tests
   - Props interface tests

### 7.3 Phase 3: Quiz Consolidation (1 day)
**Goal:** Single source for quiz components

1. **Create quiz/ directory**
   ```bash
   mkdir -p components/quiz
   mkdir -p composables/quiz
   ```

2. **Move QuizModal from landing/**
   ```bash
   mv components/landing/QuizModal.vue components/quiz/
   ```

3. **Remove duplicate ProductQuiz**
   - Compare home vs ab-testing versions
   - Keep best version
   - Delete duplicate

4. **Move useQuiz composable**
   ```bash
   mv composables/landing/useQuiz.ts composables/quiz/
   ```

5. **Update all quiz imports**
   - Search for quiz component imports
   - Update to new paths
   - Test quiz functionality

### 7.4 Phase 4: Home Components (1 day)
**Goal:** Organize home components

1. **Create hero/ subdirectory**
   ```bash
   mkdir -p components/home/hero
   ```

2. **Move hero components**
   ```bash
   mv components/home/HeroSection.vue components/home/hero/
   mv components/home/HeroCarousel.vue components/home/hero/
   mv components/home/VideoHero.vue components/home/hero/
   ```

3. **Update home page imports**
   - Update pages/index.vue
   - Update any other references

4. **Remove old home components**
   - Delete merged components
   - Update imports to use shared/

5. **Test home page**
   - Visual regression
   - Functionality tests
   - Mobile tests

### 7.5 Phase 5: Landing Cleanup (1 day)
**Goal:** Clean landing components

1. **Delete merged landing components**
   ```bash
   rm components/landing/LandingNewsletterSignup.vue
   rm components/landing/LandingTrustBadges.vue
   # ... etc
   ```

2. **Update landing page imports**
   - Update pages/new.vue
   - Import shared components

3. **Test landing page**
   - Visual regression
   - Conversion funnel tests
   - A/B test variants

### 7.6 Phase 6: Page Cleanup (0.5 days)
**Goal:** Remove unnecessary pages

1. **Delete backup/demo pages**
   ```bash
   rm pages/old-home-backup.vue
   rm pages/landing-demo.vue
   rm pages/quiz-demo.vue
   ```

2. **Move test pages**
   ```bash
   mkdir -p tests/e2e/pages
   mv pages/test-*.vue tests/e2e/pages/
   ```

3. **Update navigation** (if needed)
   - Remove links to deleted pages
   - Update sitemap

### 7.7 Phase 7: Documentation (1 day)
**Goal:** Organize documentation

1. **Create docs/ structure**
   ```bash
   mkdir -p docs/{architecture,deployment,development,features,security,testing,ux,project-management}
   mkdir -p docs/features/{landing-page,quiz,mobile}
   ```

2. **Move documentation files** (see section 3.3)

3. **Update internal links**
   - Find all markdown links
   - Update paths
   - Run link checker

4. **Create navigation**
   - Update docs/README.md
   - Add category indexes
   - Document new structure

5. **Move root markdown files**
   ```bash
   mv MOBILE_TESTING_COMPLETE.md docs/features/mobile/
   mv LANDING_HERO_SUMMARY.md docs/features/landing-page/
   ```

### 7.8 Phase 8: Testing & Validation (1 day)
**Goal:** Ensure everything works

1. **Run full test suite**
   ```bash
   pnpm test
   pnpm test:unit
   pnpm test:e2e
   pnpm test:visual
   ```

2. **Manual testing**
   - Test home page (/)
   - Test landing page (/new)
   - Test quiz flow
   - Test all shared components
   - Mobile testing

3. **Build verification**
   ```bash
   pnpm build
   ```
   - Check bundle size
   - Verify no errors
   - Check tree-shaking

4. **Documentation validation**
   ```bash
   pnpm docs:audit
   ```

5. **Performance testing**
   - Lighthouse scores
   - Bundle analysis
   - Load time comparison

### 7.9 Phase 9: Deployment (0.5 days)
**Goal:** Safe production deployment

1. **Create PR**
   - Document all changes
   - Include before/after metrics
   - Request review

2. **Staging deployment**
   - Deploy to staging
   - Run smoke tests
   - Visual comparison

3. **Production deployment**
   - Deploy during low-traffic period
   - Monitor error logs
   - Watch performance metrics

4. **Post-deployment**
   - Verify all pages load
   - Check analytics
   - Monitor for errors

**Total Estimated Time: 9 days**

---

## 8. Success Metrics

### 8.1 Code Quality Metrics

| Metric | Before | Target | Success Criteria |
|--------|--------|--------|------------------|
| Total UI code lines | 4,121 | 3,300 | <3,500 lines |
| Duplicate components | 7 | 0 | 0 duplicates |
| Test coverage | TBD | >80% | All shared components tested |
| TypeScript errors | 0 | 0 | No new errors |
| Build warnings | TBD | 0 | No warnings |

### 8.2 Performance Metrics

| Metric | Before | Target | Success Criteria |
|--------|--------|--------|------------------|
| Bundle size | 3.3 MB | <3.2 MB | <3.25 MB |
| Cold build time | 45s | <40s | <42s |
| Hot reload | 2s | <1.5s | <1.8s |
| Lighthouse Performance | TBD | >90 | >85 |
| First Contentful Paint | TBD | <1.5s | <1.8s |

### 8.3 Developer Experience Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Component discovery time | TBD | -30% | Time to find component |
| Documentation search | TBD | -50% | Time to find docs |
| New feature dev time | TBD | -20% | Time to add feature |
| PR review time | TBD | -15% | Easier to review |

### 8.4 Organizational Metrics

| Metric | Before | After |
|--------|--------|-------|
| Documentation files | 114 (flat) | 114 (organized in 7 categories) |
| Shared components | 0 | 6 |
| Component reusability | Low | High |
| Code duplication | High | Minimal |

---

## 9. Post-Cleanup Maintenance

### 9.1 Component Development Guidelines

1. **Before creating a new component:**
   - Check `components/shared/` for existing alternatives
   - Consider if component should be shared
   - Choose correct directory (home, landing, shared)

2. **Component placement rules:**
   - `shared/`: Used by 2+ pages or potential for reuse
   - `home/`: Only used on main home page
   - `landing/`: Only used on landing page
   - `quiz/`: All quiz-related components
   - Feature-specific: Cart, checkout, order, etc.

3. **Naming conventions:**
   - Shared: `ComponentName.vue` (no prefix)
   - Home: `HomeComponentName.vue` or in `home/` subfolder
   - Landing: `LandingComponentName.vue`
   - Quiz: `QuizComponentName.vue` or in `quiz/` subfolder

### 9.2 Documentation Guidelines

1. **Creating new documentation:**
   - Identify correct category (architecture, features, testing, etc.)
   - Use category subdirectories
   - Update category README if needed

2. **Documentation categories:**
   - `architecture/`: System design, component structure
   - `deployment/`: DevOps, CI/CD, deployment guides
   - `development/`: Developer guides, coding standards
   - `features/`: Feature-specific documentation
   - `security/`: Security policies, audits
   - `testing/`: Test strategies, guides
   - `ux/`: UX/UI documentation, design system
   - `project-management/`: Planning, audits, summaries

3. **Linking documentation:**
   - Use relative paths from docs root
   - Update navigation in docs/README.md
   - Run link checker before committing

### 9.3 Testing Requirements

1. **Shared components:**
   - Unit tests required
   - Visual regression tests required
   - Props interface tests
   - Accessibility tests

2. **Page-specific components:**
   - E2E tests covering usage
   - Visual regression for critical components

3. **Before each PR:**
   ```bash
   pnpm test              # All tests
   pnpm test:visual       # Visual regression
   pnpm build             # Verify build
   pnpm docs:audit        # Check docs
   ```

### 9.4 Import Path Conventions

```typescript
// Shared components (auto-imported)
<SharedNewsletterSignup />

// Page-specific (auto-imported)
<HomeHeroHeroSection />
<LandingHeroSection />

// Explicit imports for composables
import { useQuiz } from '~/composables/quiz/useQuiz'
import { useNewsletter } from '~/composables/shared/useNewsletter'
```

---

## 10. Rollback Plan

### 10.1 Pre-Cleanup Backup

```bash
# Tag current state before cleanup
git tag pre-cleanup-backup-2025-11-08

# Create backup branch
git checkout -b backup/pre-cleanup
git checkout feature/cleanup-architecture
```

### 10.2 Rollback Procedure

If critical issues are discovered in production:

1. **Immediate Rollback** (< 5 minutes)
   ```bash
   # Revert to pre-cleanup state
   git checkout main
   git revert <cleanup-merge-commit>
   git push origin main

   # Deploy previous version
   pnpm deploy
   ```

2. **Partial Rollback** (specific component issues)
   ```bash
   # Restore specific file from backup
   git checkout pre-cleanup-backup-2025-11-08 -- components/path/to/file.vue
   git commit -m "Rollback: Restore specific component"
   git push origin main
   ```

3. **Investigation** (while old version is live)
   - Identify root cause
   - Fix in cleanup branch
   - Re-test thoroughly
   - Deploy fix when ready

### 10.3 Recovery Testing

After rollback:
- Verify all pages load
- Check error logs
- Test critical user flows
- Monitor analytics

---

## 11. Appendices

### 11.1 Complete File Inventory

See detailed file lists in sections above.

### 11.2 Dependency Analysis

#### Component Dependencies (Before)
```
home/NewsletterSignup.vue → None
landing/LandingNewsletterSignup.vue → None
home/TrustBadges.vue → None
landing/LandingTrustBadges.vue → None
```

#### Component Dependencies (After)
```
shared/NewsletterSignup.vue → Used by:
  - pages/index.vue
  - pages/new.vue

shared/TrustBadges.vue → Used by:
  - pages/index.vue
  - pages/new.vue
  - components/landing/LandingHeroSection.vue
```

### 11.3 Testing Checklist

#### Component Testing
- [ ] All shared components have unit tests
- [ ] All shared components have visual regression tests
- [ ] All shared components tested in both contexts (home + landing)
- [ ] Quiz flow tested end-to-end
- [ ] Props interfaces validated with TypeScript

#### Page Testing
- [ ] Home page (/) loads correctly
- [ ] Landing page (/new) loads correctly
- [ ] All hero variants work
- [ ] Quiz modal opens and functions
- [ ] Newsletter signup works
- [ ] Trust badges display
- [ ] Stats counter animates
- [ ] Product carousel scrolls

#### Build Testing
- [ ] `pnpm build` succeeds
- [ ] No TypeScript errors
- [ ] No build warnings
- [ ] Bundle size acceptable
- [ ] Tree-shaking working

#### Documentation Testing
- [ ] All internal links work
- [ ] Documentation organized correctly
- [ ] README files updated
- [ ] Link checker passes

### 11.4 Performance Baseline

To be measured before cleanup:
- [ ] Bundle size analysis (webpack-bundle-analyzer)
- [ ] Lighthouse scores (mobile + desktop)
- [ ] First Contentful Paint
- [ ] Time to Interactive
- [ ] Cold build time
- [ ] Hot reload time

### 11.5 Communication Plan

#### Stakeholders
- **Development Team:** Full visibility into changes
- **QA Team:** Test plan and regression testing
- **Product Owner:** Before/after metrics
- **DevOps:** Deployment coordination

#### Key Messages
1. **Why:** Reduce technical debt, improve maintainability
2. **What:** Component consolidation, better organization
3. **Impact:** Better performance, easier development
4. **Timeline:** 9 days of development work
5. **Risks:** Mitigated through testing and staged rollout

---

## 12. Conclusion

This cleanup and migration architecture provides a comprehensive plan to:

1. **Reduce code duplication** by 20% through shared components
2. **Improve organization** with clear component and documentation structure
3. **Enhance performance** with smaller bundles and better tree-shaking
4. **Increase maintainability** with single source of truth for shared logic
5. **Better developer experience** with organized structure and clear guidelines

The phased implementation plan minimizes risk while delivering measurable improvements across code quality, performance, and developer productivity.

**Next Steps:**
1. Review and approve this architecture document
2. Create feature branch for implementation
3. Execute Phase 1 (Preparation)
4. Begin Phase 2 (Shared Components)

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-08
**Status:** Ready for Review
