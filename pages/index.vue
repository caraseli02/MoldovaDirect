<template>
  <div class="text-gray-900 dark:text-gray-100">
    <!-- Hero Section - Random Video Background -->
    <HomeVideoHero
      v-if="isSectionEnabled('videoHero')"
      :show-video="heroVideoConfig.showVideo.value"
      :video-webm="heroVideoConfig.currentVideo.value.webm"
      :video-mp4="heroVideoConfig.currentVideo.value.mp4"
      :poster-image="heroVideoConfig.currentVideo.value.poster"
      :background-image-alt="heroVideoConfig.currentVideo.value.alt"
      :badge="t('home.hero.trustBadge')"
      badge-icon="lucide:shield-check"
      :title="t('home.hero.title')"
      :subtitle="t('home.hero.subtitle')"
      :primary-cta="{
        text: t('home.hero.primaryCta'),
        link: localePath('/products'),
        icon: 'lucide:arrow-right',
      }"
      :secondary-cta="{
        text: t('home.hero.secondaryCta'),
        link: localePath('/about'),
      }"
      :highlights="heroHighlights"
    />

    <!-- Quick category navigation for immediate browsing -->
    <LazyHomeCategoryGrid
      v-if="isSectionEnabled('categoryGrid')"
      :categories="categoryCards"
    />

    <!-- Featured products - primary conversion driver -->
    <LazyHomeFeaturedProductsSection
      v-if="isSectionEnabled('featuredProducts')"
      :products="featuredProducts"
      :pending="featuredPending"
      :error="featuredErrorState"
      @retry="refreshFeatured"
    />

    <!-- Premium collections showcase -->
    <LazyHomeCollectionsShowcase v-if="isSectionEnabled('collectionsShowcase')" />

    <!-- Social proof and trust signals -->
    <LazyHomeSocialProofSection
      v-if="isSectionEnabled('socialProof')"
      :highlights="heroHighlights"
      :logos="partnerLogos"
      :testimonials="testimonials"
    />

    <!-- Process explanation -->
    <LazyHomeHowItWorksSection
      v-if="isSectionEnabled('howItWorks')"
      :steps="howItWorksSteps"
    />

    <!-- Service offerings -->
    <LazyHomeServicesSection
      v-if="isSectionEnabled('services')"
      :services="services"
    />

    <!-- Trust badges and payment security -->
    <LazyHomeTrustBadges v-if="isSectionEnabled('trustBadges')" />

    <!-- Newsletter signup -->
    <LazyHomeNewsletterSignup v-if="isSectionEnabled('newsletter')" />

    <!-- FAQ preview -->
    <LazyHomeFaqPreviewSection
      v-if="isSectionEnabled('faqPreview')"
      :items="faqItems"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'
import { CONTACT_INFO } from '~/constants/seo'

// ISR is disabled, so all composables should work normally
const { t, locale: i18nLocale } = useI18n()
const localePath = useLocalePath()
const { isSectionEnabled } = useLandingConfig()

// Safe locale access with fallback
const locale = computed(() => i18nLocale?.value || 'es')

// Hero video configuration with random selection
const heroVideoConfig = useHeroVideos()

const {
  heroHighlights,
  categoryCards,
  howItWorksSteps,
  testimonials,
  partnerLogos,
  storyPoints: _storyPoints,
  storyTimeline: _storyTimeline,
  services,
  faqItems,
} = useHomeContent()

const { data: featuredData, pending: featuredPending, error: featuredError, refresh: refreshFeatured } = useFetch(
  '/api/products/featured',
  {
    query: {
      limit: 12,
      locale: locale.value,
    },
    server: true,
    lazy: true,
  },
)

const featuredProducts = computed<ProductWithRelations[]>(() => (featuredData.value?.products || []) as unknown as ProductWithRelations[])
const featuredErrorState = computed<Error | null>(() => (featuredError.value as Error | null) ?? null)

const { siteUrl, toAbsoluteUrl } = useSiteUrl()

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'logo': toAbsoluteUrl('/icon.svg'),
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': CONTACT_INFO.PHONE,
        'contactType': 'customer service',
        'areaServed': 'ES',
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/products?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
]

useLandingSeo({
  title: t('seo.home.title'),
  description: t('seo.home.description'),
  image: '/icon.svg',
  imageAlt: t('home.hero.imageAlt'),
  pageType: 'website',
  keywords: [
    'Moldovan wine delivery',
    'Moldovan gourmet food Spain',
    'authentic Moldovan products',
    'Moldova Direct store',
  ],
  structuredData,
})

// No external image preloading to prevent SSR issues on Vercel
</script>
