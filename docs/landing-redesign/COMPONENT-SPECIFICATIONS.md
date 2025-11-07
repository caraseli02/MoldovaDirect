# Landing Page Component Specifications

**Version**: 1.0.0
**Last Updated**: 2025-11-07
**Status**: Draft - Pending Research Input

---

## Overview

This document provides detailed specifications for each new landing page component. These specs will be refined once the research agent completes their analysis of top e-commerce sites.

---

## 1. LandingMediaMentionsBar

**Purpose**: Build credibility through press mentions (Brightland pattern)

### Functionality
- Horizontal scrolling marquee of press logos
- Auto-scrolls continuously
- Pause on hover
- Click through to article (optional)
- Mobile: slower scroll, larger logos

### Visual Design
```
+----------------------------------------------------------------+
| As Seen In: [NYT Logo] [WSJ Logo] [Forbes Logo] [BBC Logo]... |
+----------------------------------------------------------------+
```

### Props
```typescript
interface MediaMentionsBarProps {
  mentions: MediaMention[]
  speed?: number           // Default: 30s for full loop
  pauseOnHover?: boolean   // Default: true
  showLabel?: boolean      // Default: true "As Seen In"
}

interface MediaMention {
  id: string
  name: string
  logo: string            // Path to logo image
  url?: string            // Optional link to article
  alt: string            // Alt text for accessibility
}
```

### Implementation Notes
- Use CSS animation for smooth scroll
- Duplicate logos for infinite loop effect
- Lazy load logo images
- Grayscale logos that gain color on hover
- Mobile: 2-3 logos visible, desktop: 5-6

### Accessibility
- ARIA label: "Press mentions carousel"
- Logos should have descriptive alt text
- Keyboard navigation for links
- Respects `prefers-reduced-motion`

---

## 2. LandingHeroSection

**Purpose**: Capture attention and communicate value (Rhode Skin pattern)

### Functionality
- Full-height hero section
- Video background (looping, muted) with fallback image
- Main headline with subheadline
- Primary CTA
- Trust indicators below CTA
- Scroll indicator
- Mobile: Static image, simplified text

### Visual Design
```
+-------------------------------------------------------------------+
|                    [Video Background / Image]                     |
|                                                                   |
|              Your Gateway to Authentic Moldova                    |
|       Premium wines & gourmet foods delivered to Spain           |
|                                                                   |
|              [Shop Now →]  [Take the Quiz]                       |
|                                                                   |
|     [Shield] Secure  [Truck] Fast Delivery  [Star] 4.9/5        |
|                                                                   |
|                           [Scroll ↓]                              |
+-------------------------------------------------------------------+
```

### Props
```typescript
interface HeroSectionProps {
  videoUrl?: string
  videoPoster: string        // Fallback image
  videoAlt: string
  headline: string
  subheadline: string
  primaryCTA: {
    text: string
    href: string
    variant: 'primary' | 'secondary'
  }
  secondaryCTA?: {
    text: string
    href: string
    variant: 'primary' | 'secondary'
  }
  trustIndicators: Array<{
    icon: string
    text: string
  }>
  urgencyMessage?: string    // Optional: "Free shipping on orders over €50"
}
```

### Implementation Notes
- Video: WebM format, <5MB, 15-30 seconds
- Autoplay, loop, muted, playsinline
- Use `<video>` with fallback to `<img>`
- Text overlay with gradient background for readability
- Responsive typography (clamp)
- Mobile: Hide video, show static image
- Optimize for LCP (preload hero image/video)

### Accessibility
- Video includes descriptive aria-label
- Pause button for video (accessibility requirement)
- High contrast text over video
- Skip to content link

### Performance
- **Critical**: This is likely the LCP element
- Preload hero image/video poster
- Use `fetchpriority="high"` on hero image
- Inline critical CSS
- Target LCP < 2.5s

---

## 3. LandingTrustBadges

**Purpose**: Display security and trust signals immediately

### Functionality
- Horizontal row of trust badges
- Icons with short labels
- Tooltip on hover for more info
- Mobile: 2-3 per row, wrapped

### Visual Design
```
+------------------------------------------------------------------------+
| [Shield Icon]     [Lock Icon]      [Truck Icon]     [Return Icon]    |
| SSL Secure     Payment Protected   Free Shipping    Money Back        |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface TrustBadgesProps {
  badges: TrustBadge[]
  layout: 'horizontal' | 'grid'  // Default: horizontal
  showTooltips?: boolean         // Default: true
}

interface TrustBadge {
  id: string
  icon: string
  label: string
  tooltip?: string
  verified?: boolean  // Show verified checkmark
}
```

### Implementation Notes
- Use Lucide icons
- Subtle animation on scroll into view
- Green checkmark for verified badges
- Grayscale when not hovered
- Mobile: 2 columns, stack vertically

### Accessibility
- ARIA labels for icons
- Tooltips accessible via keyboard
- Sufficient color contrast

---

## 4. LandingStatsCounter

**Purpose**: Show impressive numbers with animations

### Functionality
- Animated counting from 0 to target number
- Triggers on scroll into view
- Icons for visual interest
- Mobile: Stacked layout

### Visual Design
```
+------------------------------------------------------------------------+
|     10,000+          500+           4.9/5          15+                |
|    Happy Customers   Products       Rating         Countries          |
|    [People Icon]     [Box Icon]     [Star Icon]    [Globe Icon]       |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface StatsCounterProps {
  stats: AnimatedStat[]
  duration?: number        // Default: 2000ms
  triggerOnView?: boolean  // Default: true
}

interface AnimatedStat {
  id: string
  value: number
  label: string
  icon: string
  prefix?: string   // e.g., "$", "€"
  suffix?: string   // e.g., "+", "%", "K", "M"
  duration?: number // Override global duration
  color?: string    // Accent color
}
```

### Implementation Notes
- Use Intersection Observer to trigger
- Smooth easing for count animation
- `toLocaleString()` for number formatting
- Stagger animation across stats
- Only animate once per page load
- Mobile: 2x2 grid

### Accessibility
- Announce final number to screen readers
- Don't rely solely on animation
- Provide static fallback if motion disabled

---

## 5. LandingProductCarousel

**Purpose**: Showcase products with benefits (Olipop pattern)

### Functionality
- Horizontal scrolling carousel
- Benefits-driven cards (not just products)
- Smooth scroll snap
- Navigation arrows
- Dot indicators
- Mobile: Single card view, swipe

### Visual Design
```
+------------------------------------------------------------------------+
|  [< Arrow]                                                [Arrow >]   |
|                                                                        |
|  +------------------+  +------------------+  +------------------+     |
|  | [Product Image]  |  | [Product Image]  |  | [Product Image]  |     |
|  | Wine Name        |  | Food Product     |  | Gift Set         |     |
|  | €24.99          |  | €15.99          |  | €49.99          |     |
|  |                  |  |                  |  |                  |     |
|  | ✓ Benefit 1     |  | ✓ Benefit 1     |  | ✓ Benefit 1     |     |
|  | ✓ Benefit 2     |  | ✓ Benefit 2     |  | ✓ Benefit 2     |     |
|  | ✓ Benefit 3     |  | ✓ Benefit 3     |  | ✓ Benefit 3     |     |
|  |                  |  |                  |  |                  |     |
|  | [Add to Cart]    |  | [Add to Cart]    |  | [Add to Cart]    |     |
|  +------------------+  +------------------+  +------------------+     |
|                                                                        |
|              ● ● ○ ○ ○                                                |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface ProductCarouselProps {
  products: ProductCard[]
  showBenefits?: boolean    // Default: true
  autoplay?: boolean        // Default: false
  autoplaySpeed?: number    // Default: 5000ms
  perView?: {
    mobile: number          // Default: 1
    tablet: number          // Default: 2
    desktop: number         // Default: 3
  }
}

interface ProductCard {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number    // For showing discount
  rating: number
  reviewCount: number
  benefits: string[]        // Max 3-4
  inStock: boolean
  href: string
}
```

### Implementation Notes
- Use Swiper.js (already installed)
- Lazy load images
- Benefits should be short (3-5 words each)
- Show discount percentage if originalPrice present
- Add to cart button with loading state
- Mobile: Full width cards, no gaps

### Accessibility
- Keyboard navigation (arrows)
- ARIA live region for current slide
- Focus management
- Product cards are semantic links

---

## 6. LandingQuizCTA

**Purpose**: Promote quiz for personalization (Jones Road pattern)

### Functionality
- Prominent CTA to start quiz
- Shows quiz benefit
- Opens quiz modal
- Can be placed in multiple locations
- Mobile: Full-width CTA

### Visual Design
```
+------------------------------------------------------------------------+
|                                                                        |
|              Not sure what to order?                                   |
|                                                                        |
|         Take our 2-minute quiz to get personalized                    |
|               recommendations based on your taste                      |
|                                                                        |
|                   [Take the Quiz →]                                   |
|                                                                        |
|           Over 5,000 customers found their perfect match              |
|                                                                        |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface QuizCTAProps {
  title: string
  description: string
  ctaText: string
  socialProof?: string      // "5,000 customers..."
  variant: 'default' | 'minimal' | 'card'
}
```

### Implementation Notes
- Opens `QuizModal.vue` component
- Track quiz start event
- Can be inline or floating
- Use modal overlay on mobile
- Show quiz completion rate as social proof

### Accessibility
- Clear focus indicator
- ARIA label for modal trigger
- Escape key to close modal

---

## 7. LandingUGCGallery

**Purpose**: User-generated content for social proof (Rare Beauty pattern)

### Functionality
- Grid of customer photos
- Instagram-style layout
- Lightbox on click
- Filter by product (optional)
- Mobile: 2 columns

### Visual Design
```
+------------------------------------------------------------------------+
|                       Customer Photos                                  |
|                                                                        |
|  +------+  +------+  +------+  +------+  +------+  +------+          |
|  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |          |
|  | @usr |  | @usr |  | @usr |  | @usr |  | @usr |  | @usr |          |
|  +------+  +------+  +------+  +------+  +------+  +------+          |
|  +------+  +------+  +------+  +------+  +------+  +------+          |
|  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |  |[IMG] |          |
|  | @usr |  | @usr |  | @usr |  | @usr |  | @usr |  | @usr |          |
|  +------+  +------+  +------+  +------+  +------+  +------+          |
|                                                                        |
|                  [See More on Instagram →]                            |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface UGCGalleryProps {
  posts: UGCPost[]
  columns?: {
    mobile: number    // Default: 2
    tablet: number    // Default: 3
    desktop: number   // Default: 6
  }
  showLightbox?: boolean  // Default: true
  instagramHandle?: string
}

interface UGCPost {
  id: string
  image: string
  author: string        // Instagram username
  caption?: string
  product?: {
    id: string
    name: string
  }
  verified: boolean
  instagramUrl?: string
}
```

### Implementation Notes
- Use Masonry layout or CSS Grid
- Lazy load images
- Lightbox with swipe gestures
- Link to Instagram post
- Show "Verified Purchase" badge
- Mobile: 2 columns, smaller images

### Accessibility
- Alt text for images
- Keyboard navigation in lightbox
- Focus trap in lightbox
- Screen reader announcements

---

## 8. LandingVideoTestimonials

**Purpose**: Video social proof for trust (To'ak pattern)

### Functionality
- Grid of video testimonials
- Thumbnail with play button
- Video player modal
- Auto-advance to next video (optional)
- Mobile: Single column

### Visual Design
```
+------------------------------------------------------------------------+
|                     What Customers Are Saying                          |
|                                                                        |
|  +--------------------+  +--------------------+  +--------------------+|
|  | [Video Thumbnail]  |  | [Video Thumbnail]  |  | [Video Thumbnail]  ||
|  |     [Play ▶]      |  |     [Play ▶]      |  |     [Play ▶]      ||
|  |                    |  |                    |  |                    ||
|  | "Quote preview..." |  | "Quote preview..." |  | "Quote preview..." ||
|  | - Name, Location   |  | - Name, Location   |  | - Name, Location   ||
|  | ⭐⭐⭐⭐⭐          |  | ⭐⭐⭐⭐⭐          |  | ⭐⭐⭐⭐⭐          ||
|  +--------------------+  +--------------------+  +--------------------+|
+------------------------------------------------------------------------+
```

### Props
```typescript
interface VideoTestimonialsProps {
  testimonials: VideoTestimonial[]
  autoplay?: boolean        // Default: false
  showTranscript?: boolean  // Default: true
}

interface VideoTestimonial {
  id: string
  name: string
  location: string
  avatar?: string
  thumbnail: string
  videoUrl: string
  quote: string             // Short text preview
  rating: number
  verified: boolean
  transcript?: string       // For accessibility
  duration?: number         // Video length in seconds
}
```

### Implementation Notes
- Use HTML5 video player
- Lazy load videos
- Show video duration on thumbnail
- Auto-generate captions if possible
- Provide transcript for accessibility
- Track video play events
- Mobile: Stack videos vertically

### Accessibility
- Video controls accessible via keyboard
- Captions/subtitles available
- Transcript provided
- Pause/play with spacebar
- Focus indicator on controls

---

## 9. LandingFeaturedCollections

**Purpose**: Showcase product collections

### Functionality
- Grid of collection cards
- Image background with overlay
- Hover effects
- Click to collection page
- Mobile: Single column

### Visual Design
```
+------------------------------------------------------------------------+
|                        Shop by Collection                              |
|                                                                        |
|  +-------------------------+  +-------------------------+              |
|  | [Background Image]      |  | [Background Image]      |              |
|  |                         |  |                         |              |
|  |    Premium Wines        |  |    Gourmet Foods       |              |
|  |    50+ Products         |  |    30+ Products        |              |
|  |                         |  |                         |              |
|  |    [Shop Now →]         |  |    [Shop Now →]        |              |
|  +-------------------------+  +-------------------------+              |
|                                                                        |
|  +-------------------------+  +-------------------------+              |
|  | [Background Image]      |  | [Background Image]      |              |
|  |                         |  |                         |              |
|  |    Gift Hampers         |  |    Subscriptions       |              |
|  |    25+ Products         |  |    5+ Plans            |              |
|  |                         |  |                         |              |
|  |    [Shop Now →]         |  |    [Shop Now →]        |              |
|  +-------------------------+  +-------------------------+              |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface FeaturedCollectionsProps {
  collections: CollectionCard[]
  layout: 'grid' | 'carousel'  // Default: grid
}

interface CollectionCard {
  id: string
  name: string
  description: string
  image: string
  productCount: number
  href: string
  featured?: boolean       // Highlight as featured
}
```

### Implementation Notes
- Use NuxtImg for image optimization
- Overlay gradient for text readability
- Hover: Slight zoom on image
- Mobile: Stack cards vertically
- Lazy load images

### Accessibility
- Semantic links
- Alt text for images
- Keyboard focusable
- ARIA labels

---

## 10. LandingNewsletterSignup

**Purpose**: Capture email addresses

### Functionality
- Email input with submit button
- Incentive messaging
- Privacy notice
- Success/error states
- Mobile: Full-width

### Visual Design
```
+------------------------------------------------------------------------+
|                                                                        |
|                 Get 10% Off Your First Order                          |
|                                                                        |
|        Join our newsletter for exclusive deals and recipes            |
|                                                                        |
|       +------------------------------------------+  +--------+         |
|       | Enter your email                         |  | Submit |         |
|       +------------------------------------------+  +--------+         |
|                                                                        |
|               We respect your privacy. Unsubscribe anytime.           |
|                                                                        |
|                    5,000+ subscribers                                 |
|                                                                        |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface NewsletterSignupProps {
  title: string
  description: string
  incentive?: string        // "10% off first order"
  privacyText: string
  submitText: string
  successMessage?: string
  variant: 'inline' | 'popup' | 'footer'
}
```

### Implementation Notes
- Email validation (regex + DNS check)
- GDPR compliance (double opt-in)
- Connect to email service (Resend)
- Show subscriber count as social proof
- Loading state on submit
- Error handling (already subscribed, invalid email)
- Track signup event

### Accessibility
- Label for email input
- Error messages announced to screen readers
- Focus management
- Keyboard accessible

---

## 11. LandingFooter

**Purpose**: Final trust signals and navigation

### Functionality
- Multi-column layout
- Trust badges
- Payment icons
- Social links
- Legal links
- Mobile: Accordion sections

### Visual Design
```
+------------------------------------------------------------------------+
|                                                                        |
|  Shop         Company       Support       Connect                     |
|  - Wines      - About       - FAQ         - Instagram                 |
|  - Foods      - Story       - Contact     - Facebook                  |
|  - Gifts      - Press       - Shipping    - Email                     |
|                                                                        |
|  +-------------------------------------------------------------------+ |
|  | [SSL] [Visa] [MC] [PayPal] [Stripe]                              | |
|  +-------------------------------------------------------------------+ |
|                                                                        |
|  © 2025 Moldova Direct. All rights reserved.                          |
|  Privacy | Terms | Cookies                                             |
|                                                                        |
+------------------------------------------------------------------------+
```

### Props
```typescript
interface FooterProps {
  columns: FooterColumn[]
  trustBadges: TrustBadge[]
  paymentMethods: string[]  // Icon names
  socialLinks: SocialLink[]
  copyrightYear: number
  legalLinks: LegalLink[]
}

interface FooterColumn {
  title: string
  links: Array<{
    text: string
    href: string
  }>
}
```

### Implementation Notes
- Mobile: Collapse columns into accordion
- Lazy load social icons
- Payment icons in grayscale
- Responsive layout
- Sitemap structured data

### Accessibility
- Semantic `<footer>` element
- Navigation landmarks
- Keyboard navigation
- High contrast

---

## Component Dependencies

```
LandingMediaMentionsBar
  ↓ Uses: NuxtImg, Lucide icons

LandingHeroSection
  ↓ Uses: NuxtImg, Video element, ScrollReveal animation

LandingTrustBadges
  ↓ Uses: Lucide icons, Tooltip component

LandingStatsCounter
  ↓ Uses: CountUp animation, Intersection Observer

LandingProductCarousel
  ↓ Uses: Swiper, NuxtImg, ProductCard (new), AddToCartButton

LandingQuizCTA
  ↓ Uses: QuizModal component

LandingUGCGallery
  ↓ Uses: NuxtImg, Lightbox component, Masonry layout

LandingVideoTestimonials
  ↓ Uses: Video player, Modal, StarRating component

LandingFeaturedCollections
  ↓ Uses: NuxtImg, Card component

LandingNewsletterSignup
  ↓ Uses: Form validation, API integration

LandingFooter
  ↓ Uses: Accordion (mobile), Social icons
```

---

## Shared Components Needed

### New Shared Components
1. **Lightbox.vue** - Image/video lightbox
2. **VideoPlayer.vue** - Custom video player
3. **StarRating.vue** - Star rating display
4. **Tooltip.vue** - Tooltip component
5. **Modal.vue** - Modal wrapper
6. **Accordion.vue** - Accordion for mobile
7. **CountUp.vue** - Number counting animation

### Existing Components to Use
- `ui/Button.vue`
- `ui/Input.vue`
- `ui/Card.vue`
- `common/Icon.vue` (if exists, or use Lucide directly)

---

## Next Steps

1. **Wait for Research**: Get pattern recommendations from best-practices analysis
2. **Refine Specs**: Update based on research findings
3. **Create Wireframes**: Low-fidelity wireframes for each component
4. **Design Mockups**: High-fidelity designs in Figma (optional)
5. **Build Components**: Start implementation

---

**End of Component Specifications**
