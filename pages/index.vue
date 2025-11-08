<template>
  <div class="luxury-body smooth-scroll">
    <!-- 1. Cinematic Video Hero -->
    <section class="c-section c-section__video-hero">
      <HomeLuxuryVideoHero />
    </section>

    <!-- 2. Press Mentions Bar (Infinite Scroll) -->
    <section class="c-section c-section__media-mentions" style="background-color: #FFFFFF;">
      <HomeLuxuryMediaMentions />
    </section>

    <!-- 3. Origin Story Section -->
    <section class="c-section c-section__origin-story" style="background-color: #FCFAF2;">
      <HomeLuxuryOriginStory />
    </section>

    <!-- 4. First Product Carousel (Signature Collections) -->
    <section class="c-section c-section__products-carousel" style="background-color: #FCFAF2;">
      <HomeLuxuryProductShowcase
        :featured="true"
        title="Signature Collections"
        eyebrow="Curated Selection"
      />
    </section>

    <!-- 5. Packaging Experience (Video with Text) -->
    <section class="c-section c-section__featured-text" style="background-color: #FFFFFF;">
      <HomeLuxuryPackagingExperience />
    </section>

    <!-- 6. Collection Grid -->
    <section class="c-section c-section__collections" style="background-color: #FCFAF2;">
      <HomeLuxuryCollectionGrid />
    </section>

    <!-- 7. Second Product Carousel (Artisan Selections) -->
    <section class="c-section c-section__products-carousel" style="background-color: #FCFAF2;">
      <HomeLuxuryProductShowcase
        :featured="false"
        title="Artisan Selections"
        eyebrow="Handcrafted Excellence"
      />
    </section>

    <!-- 8. Artisan Spotlight (Split with Media) -->
    <section class="c-section c-section__split-with-media" style="background-color: #FFFFFF;">
      <HomeLuxuryArtisanSpotlight />
    </section>

    <!-- 9. Banner Columns (Brand Promises) -->
    <section class="c-section c-section__banner-columns" style="background-color: #FCFAF2;">
      <HomeBrandPromises />
    </section>

    <!-- 10. Customer Testimonials -->
    <section class="c-section c-section__testimonials" style="background-color: #FFFFFF;">
      <HomeLuxuryTestimonials />
    </section>

    <!-- 11. Featured Stories (Blog) -->
    <section class="c-section c-section__blog-posts" style="background-color: #FCFAF2;">
      <HomeFeaturedStories />
    </section>

    <!-- 12. Newsletter Signup -->
    <section class="c-section c-section__newsletter" style="background-color: #FFFFFF;">
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

/* Smooth transitions between sections */
.c-section + .c-section {
  transition: background-color 0.3s ease;
}
</style>
