<template>
  <div class="luxury-body smooth-scroll">
    <!-- Cinematic Video Hero -->
    <HomeLuxuryVideoHero />

    <!-- Press Mentions Bar (Brightland Pattern) -->
    <HomeLuxuryMediaMentions />

    <!-- Origin Story Section -->
    <HomeLuxuryOriginStory />

    <!-- Luxury Product Showcase -->
    <HomeLuxuryProductShowcase />

    <!-- Artisan Spotlight -->
    <HomeLuxuryArtisanSpotlight />

    <!-- Customer Testimonials -->
    <HomeLuxuryTestimonials />

    <!-- Newsletter Signup (Keeping from original) -->
    <HomeNewsletterSignup />
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
</style>
