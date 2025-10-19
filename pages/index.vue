<template>
  <div class="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <HomeHeroSection :highlights="heroHighlights" />
    <HomeCollectionsShowcase />
    <HomeCategoryGrid :categories="categoryCards" />
    <HomeHowItWorksSection :steps="howItWorksSteps" />
    <HomeSocialProofSection
      :highlights="heroHighlights"
      :logos="partnerLogos"
      :testimonials="testimonials"
    />
    <HomeFeaturedProductsSection
      :products="featuredProducts"
      :pending="featuredPending"
      :error="featuredErrorState"
      @retry="refreshFeatured"
    />
    <HomeStorySection :points="storyPoints" :timeline="storyTimeline" />
    <HomeServicesSection :services="services" />
    <HomeNewsletterSignup />
    <HomeFaqPreviewSection :items="faqItems" />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'

const { locale } = useI18n()
const {
  heroHighlights,
  categoryCards,
  howItWorksSteps,
  testimonials,
  partnerLogos,
  storyPoints,
  storyTimeline,
  services,
  faqItems
} = useHomeContent()

const { data: featuredData, pending: featuredPending, error: featuredError, refresh: refreshFeatured } = await useFetch(
  '/api/products/featured',
  {
    query: {
      limit: 4,
      locale: locale.value
    },
    server: true,
    lazy: false
  }
)

const featuredProducts = computed<ProductWithRelations[]>(() => featuredData.value?.products || [])
const featuredErrorState = computed<Error | null>(() => (featuredError.value as Error | null) ?? null)

useHead({
  title: 'Moldova Direct – Taste Moldova in Every Delivery',
  meta: [
    {
      name: 'description',
      content: 'Shop curated Moldovan wines, gourmet foods, and gift hampers with fast delivery across Spain. Discover artisan producers and authentic flavours.'
    }
  ]
})
</script>
