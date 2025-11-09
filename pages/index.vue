<template>
  <div class="luxury-body smooth-scroll">
    <!-- 1. Cinematic Video Hero -->
    <section class="c-section c-section__video-hero">
      <HomeLuxuryVideoHero />
    </section>

    <!-- 2. First Product Carousel (Signature Collections) -->
    <section class="c-section c-section__products-carousel" style="background-color: #FCFAF2;">
      <HomeLuxuryProductShowcase
        :featured="true"
        title="Signature Collections"
        eyebrow="Curated Selection"
      />
    </section>

    <!-- 3. Origin Story / Nuestra Herencia Section -->
    <section class="c-section c-section__origin-story" style="background-color: #FFFFFF;">
      <HomeLuxuryOriginStory />
    </section>

    <!-- 4. Press Mentions Bar (Infinite Scroll) -->
    <section class="c-section c-section__media-mentions" style="background-color: #FCFAF2;">
      <HomeLuxuryMediaMentions />
    </section>

    <!-- 5. Collection Grid -->
    <section class="c-section c-section__collections" style="background-color: #FFFFFF;">
      <HomeLuxuryCollectionGrid />
    </section>

    <!-- 6. Second Product Carousel (Artisan Selections) -->
    <section class="c-section c-section__products-carousel" style="background-color: #FCFAF2;">
      <HomeLuxuryProductShowcase
        :featured="false"
        title="Artisan Selections"
        eyebrow="Handcrafted Excellence"
      />
    </section>

    <!-- 7. Artisan Spotlight (Split with Media) -->
    <section class="c-section c-section__split-with-media" style="background-color: #FFFFFF;">
      <HomeLuxuryArtisanSpotlight />
    </section>

    <!-- 8. Customer Testimonials -->
    <section class="c-section c-section__testimonials" style="background-color: #FCFAF2;">
      <HomeLuxuryTestimonials />
    </section>

    <!-- 9. Featured Stories (Blog) -->
    <section class="c-section c-section__blog-posts" style="background-color: #FFFFFF;">
      <HomeFeaturedStories />
    </section>

    <!-- 10. Newsletter Signup -->
    <section class="c-section c-section__newsletter" style="background-color: #FCFAF2;">
      <HomeNewsletterSignup />
    </section>
  </div>
</template>

<script setup lang="ts">
import { CONTACT_INFO } from '~/constants/seo'

const { siteUrl, toAbsoluteUrl } = useSiteUrl()

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moldova Direct',
    url: siteUrl,
    logo: toAbsoluteUrl('/icon.svg'),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: CONTACT_INFO.PHONE,
        contactType: 'customer service',
        areaServed: 'ES'
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Moldova Direct',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
]

useLandingSeo({
  title: 'Moldova Direct – Artisan Moldovan Wines & Gourmet Delicacies',
  description:
    'Experience the authentic taste of Moldova. Curated selection of premium wines, artisan cheeses, and luxury gift hampers. Delivered across Spain from family estates.',
  image: '/icon.svg',
  imageAlt: 'Premium Moldovan wines and gourmet products',
  pageType: 'website',
  keywords: [
    'Moldovan wine Spain',
    'luxury wine delivery',
    'artisan gourmet food',
    'premium gift hampers',
    'Moldova Direct'
  ],
  structuredData
})
</script>

<style scoped>
/* Page-specific luxury styles */

/* To'ak Section System */
.c-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

/* Video Hero - Full Screen Behind Transparent Header */
.c-section__video-hero {
  margin-top: -5rem; /* Negative margin to extend behind header (80px = 5rem) */
  padding-top: 5rem; /* Add padding to compensate for content positioning */
}

@media (min-width: 768px) {
  .c-section__video-hero {
    margin-top: -6rem; /* -96px on desktop */
    padding-top: 6rem;
  }
}

/* Smooth transitions between sections */
.c-section + .c-section {
  transition: background-color 0.3s ease;
}
</style>
