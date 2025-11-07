# New Landing Page Documentation

## Overview
Complete redesign of Moldova Direct landing page using modern e-commerce patterns.

## URL
- **Development**: http://localhost:3000/new
- **Production**: Will replace / after testing

## Components Used (in order)

1. **LandingMediaMentionsBar** - Press credibility (`/components/landing/LandingMediaMentionsBar.vue`)
2. **LandingHeroSection** - Video hero with CTAs (`/components/landing/LandingHeroSection.vue`)
3. **LandingTrustBadges** - Security indicators (`/components/landing/LandingTrustBadges.vue`)
4. **LandingStatsCounter** - Animated numbers (`/components/landing/LandingStatsCounter.vue`)
5. **LandingProductCarousel** - Featured products (`/components/landing/LandingProductCarousel.vue`)
6. **LandingQuizCTA** - Quiz promotion (`/components/landing/LandingQuizCTA.vue`)
7. **LandingUGCGallery** - Customer photos (`/components/landing/LandingUGCGallery.vue`)
8. **LandingFeaturedCollections** - Category cards (`/components/landing/LandingFeaturedCollections.vue`)
9. **LandingNewsletterSignup** - Email capture (`/components/landing/LandingNewsletterSignup.vue`)
10. **QuizModal** - Product recommendation quiz (`/components/landing/QuizModal.vue`)

## File Structure
```
/pages/new.vue                                    # Main landing page
/components/landing/
  ├── LandingMediaMentionsBar.vue                # Press mentions
  ├── LandingHeroSection.vue                      # Hero with video
  ├── LandingTrustBadges.vue                      # Trust signals
  ├── LandingStatsCounter.vue                     # Animated stats
  ├── LandingProductCarousel.vue                  # Product showcase
  ├── LandingProductCard.vue                      # Product card component
  ├── LandingQuizCTA.vue                          # Quiz call-to-action
  ├── LandingUGCGallery.vue                       # User-generated content
  ├── LandingFeaturedCollections.vue              # Category collections
  ├── LandingNewsletterSignup.vue                 # Email signup
  └── QuizModal.vue                               # Quiz modal wrapper
/components/home/ProductQuiz.vue                  # Actual quiz component
/docs/NEW_LANDING_PAGE.md                         # This file
```

## Performance Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: > 90

## SEO
- Meta tags configured for all major platforms
- Structured data (JSON-LD) included
- OG tags for social sharing
- Twitter cards configured
- Semantic HTML throughout

## Analytics Events

### Quiz Interactions
- `quiz_opened` - When quiz modal opens
- `quiz_completed` - When quiz finishes
- `quiz_cta_clicked` - When quiz CTA is clicked

### Track conversions from:
- Quiz completion
- Newsletter signup
- Product carousel clicks
- Featured collection clicks

## Internationalization (i18n)

Required translations in locale files:

```json
{
  "landing": {
    "quiz": {
      "heading": "Find Your Perfect Taste",
      "subheading": "Answer a few questions to get personalized recommendations",
      "cta": "Start the Quiz",
      "trust": "Takes less than 2 minutes",
      "benefits": {
        "personalized": "Personalized picks",
        "quick": "Under 2 minutes",
        "free": "100% free"
      }
    },
    "newsletter": {
      "heading": "Get Exclusive Offers",
      "subheading": "Join our community for special deals and new arrivals",
      "placeholder": "Enter your email",
      "submit": "Subscribe",
      "submitting": "Subscribing...",
      "success": "Thanks for subscribing!",
      "error": "Something went wrong. Please try again.",
      "privacy": "We respect your privacy. Unsubscribe anytime."
    }
  }
}
```

## Testing Checklist

### Development Testing
```bash
# Start dev server
pnpm run dev

# Visit new page
http://localhost:3000/new
```

### Manual Testing
- [ ] All sections render in correct order
- [ ] Quiz modal opens when CTA clicked
- [ ] Quiz modal closes properly
- [ ] Quiz completion redirects to products
- [ ] Newsletter signup works
- [ ] Product carousel scrolls smoothly
- [ ] All images load properly
- [ ] Mobile responsive (test on 375px, 768px, 1024px)
- [ ] No console errors
- [ ] Animations perform smoothly

### Performance Testing
```bash
# Run Lighthouse
lighthouse http://localhost:3000/new --view

# Check Core Web Vitals
# Target scores:
# - Performance: > 90
# - Accessibility: > 95
# - Best Practices: > 90
# - SEO: > 95
```

### Cross-browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Deployment Strategy

### Phase 1: A/B Testing (Week 1-2)
1. Deploy `/new` to production
2. Set up A/B test: 50% traffic to `/`, 50% to `/new`
3. Monitor key metrics:
   - Conversion rate
   - Bounce rate
   - Time on page
   - Quiz completion rate
   - Newsletter signups

### Phase 2: Analysis (Week 2-3)
1. Analyze A/B test results
2. Gather user feedback
3. Make necessary adjustments
4. Run follow-up tests if needed

### Phase 3: Full Rollout (Week 3-4)
1. If metrics improve:
   - Replace `/` with new design
   - Archive old design
   - Update all marketing materials
2. If metrics decline:
   - Iterate on problem areas
   - Re-test
   - Consider hybrid approach

## Monitoring

### Analytics to Track
- Page views
- Unique visitors
- Bounce rate
- Average session duration
- Conversion rate (add to cart, purchases)
- Quiz completion rate
- Newsletter signup rate
- Click-through rates on CTAs

### Error Monitoring
- JavaScript errors
- Failed API calls
- Image load failures
- Slow network requests

## Dependencies

### Required Components
All landing components are self-contained with minimal dependencies:
- Vue 3 Composition API
- Nuxt 3 auto-imports
- i18n for translations
- commonIcon component for icons

### API Endpoints
- `POST /api/newsletter/subscribe` - Newsletter subscription
- `POST /api/quiz-recommendations` - Quiz product recommendations

## Known Issues & Limitations

1. **Newsletter API**: Needs to be implemented in `/server/api/newsletter/subscribe.ts`
2. **Quiz Recommendations**: Needs backend logic in `/server/api/quiz-recommendations.ts`
3. **Video Background**: May need CDN for optimal performance
4. **Images**: Ensure all referenced images exist in `/public/images/`

## Next Steps

1. **Implement missing API endpoints**:
   - Newsletter subscription
   - Quiz recommendations algorithm

2. **Add real content**:
   - Replace placeholder images
   - Add real product data
   - Update copy with marketing-approved text

3. **Performance optimization**:
   - Implement lazy loading for below-fold components
   - Optimize images with Nuxt Image
   - Add skeleton loaders for async content

4. **Enhanced analytics**:
   - Set up event tracking
   - Configure conversion goals
   - Implement heatmaps

## Support

For questions or issues:
- Create issue in project repository
- Contact development team
- Review component documentation

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
**Status**: Ready for Testing
