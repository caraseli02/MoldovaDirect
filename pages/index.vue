<template>
  <div class="text-gray-900 dark:text-gray-100">
    <!-- Promotional announcement bar -->
    <HomeAnnouncementBar :show-cta="true" />

    <!-- Hero section with video background (Rhode Skin/To'ak pattern) -->
    <HomeVideoHero
      :show-video="false"
      video-webm="/videos/hero.webm"
      video-mp4="/videos/hero.mp4"
      poster-image="/images/hero-poster.jpg"
      :badge="t('home.hero.trustBadge')"
      badge-icon="lucide:shield-check"
      :title="t('home.hero.title')"
      :subtitle="t('home.hero.subtitle')"
      :primary-cta="{
        text: t('home.hero.primaryCta'),
        link: localePath('/products'),
        icon: 'lucide:arrow-right'
      }"
      :secondary-cta="{
        text: t('home.hero.secondaryCta'),
        link: localePath('/about')
      }"
      :highlights="heroHighlights"
    />

    <!-- Media mentions "brag bar" (Brightland pattern) -->
    <HomeMediaMentions />

    <!-- Quick category navigation for immediate browsing -->
    <HomeCategoryGrid :categories="categoryCards" />

    <!-- Featured products - primary conversion driver -->
    <HomeFeaturedProductsSection
      :products="featuredProducts"
      :pending="featuredPending"
      :error="featuredErrorState"
      @retry="refreshFeatured"
    />

    <!-- Producer Stories - Brightland-inspired storytelling -->
    <HomeProducerStoriesSection />

    <!-- Premium collections showcase -->
    <HomeCollectionsShowcase />

    <!-- Product recommendation quiz (Jones Road/Beardbrand pattern) -->
    <HomeProductQuiz />

    <!-- Wine & Food Pairings - Educational content -->
    <HomePairingGuidesSection />

    <!-- Wine Story CTA - Link to full heritage page -->
    <section class="bg-gradient-to-br from-primary/5 via-terracotta/5 to-gold-50 py-16 md:py-20">
      <div class="container">
        <div
          class="mx-auto max-w-3xl text-center"
        >
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-700">
            <commonIcon name="lucide:wine" class="h-4 w-4" />
            Discover Our Heritage
          </div>
          <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            The Story Behind Every Bottle
          </h2>
          <p class="mt-4 text-lg text-slate-600">
            Explore Moldova's 7,000-year winemaking tradition, meet our passionate producers, and discover the regions that make our wines unique
          </p>
          <NuxtLink
            :to="localePath('/wine-story')"
            class="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Explore Wine Heritage
            <commonIcon name="lucide:arrow-right" class="h-5 w-5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Social proof and trust signals -->
    <HomeSocialProofSection
      :highlights="heroHighlights"
      :logos="partnerLogos"
      :testimonials="testimonials"
    />

    <!-- User-generated content gallery (Rare Beauty pattern) -->
    <HomeUgcGallery />

    <!-- Process explanation -->
    <HomeHowItWorksSection :steps="howItWorksSteps" />

    <!-- Service offerings -->
    <HomeServicesSection :services="services" />

    <!-- Trust badges and payment security -->
    <HomeTrustBadges />

    <!-- Certification badges (Allbirds pattern) -->
    <HomeCertificationBar />

    <!-- Newsletter signup -->
    <HomeNewsletterSignup />

    <!-- FAQ preview -->
    <HomeFaqPreviewSection :items="faqItems" />

    <!-- Story section moved to About page -->
    <!-- <HomeStorySection :points="storyPoints" :timeline="storyTimeline" /> -->

    <!-- Real-time purchase notifications (Gymshark/Fomo pattern) -->
    <UiRealtimeNotification />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'
import { CONTACT_INFO } from '~/constants/seo'
import UiRealtimeNotification from '~/components/ui/RealtimeNotification.vue'

const { t, locale } = useI18n()
const localePath = useLocalePath()
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
      limit: 12,
      locale: locale.value
    },
    server: true,
    lazy: false
  }
)

const featuredProducts = computed<ProductWithRelations[]>(() => featuredData.value?.products || [])
const featuredErrorState = computed<Error | null>(() => (featuredError.value as Error | null) ?? null)

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
  title: 'Moldova Direct – Taste Moldova in Every Delivery',
  description:
    'Shop curated Moldovan wines, gourmet foods, and gift hampers with fast delivery across Spain. Discover artisan producers and authentic flavours.',
  image: '/icon.svg',
  imageAlt: 'Selection of Moldovan delicacies delivered across Spain',
  pageType: 'website',
  keywords: [
    'Moldovan wine delivery',
    'Moldovan gourmet food Spain',
    'authentic Moldovan products',
    'Moldova Direct store'
  ],
  structuredData
})
</script>

