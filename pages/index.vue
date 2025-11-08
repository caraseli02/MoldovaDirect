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
    <section class="relative overflow-hidden bg-gradient-to-br from-primary/8 via-gold-50/40 to-terracotta/8 py-20 md:py-28">
      <!-- Decorative Background -->
      <div class="absolute inset-0 overflow-hidden opacity-25">
        <div class="absolute -right-40 top-0 h-96 w-96 rounded-full bg-gradient-to-bl from-gold-500/40 to-transparent blur-3xl" />
        <div class="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-gradient-to-tr from-primary/40 to-transparent blur-3xl" />
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgba(198, 141, 37, 0.06) 1px, transparent 0); background-size: 32px 32px;" />
      </div>

      <div class="container relative z-10">
        <div
          class="mx-auto max-w-4xl text-center"
        >
          <div
            v-motion
            :initial="{ opacity: 0, scale: 0.9 }"
            :visible="{
              opacity: 1,
              scale: 1,
              transition: { duration: 600 },
            }"
            class="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-6 py-3 text-sm font-bold text-gold-700 shadow-lg backdrop-blur-sm ring-1 ring-gold-500/30"
          >
            <commonIcon name="lucide:wine" class="h-5 w-5" />
            Discover Our Heritage
          </div>
          <h2
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{
              opacity: 1,
              y: 0,
              transition: { duration: 800, delay: 100 },
            }"
            class="bg-gradient-to-br from-primary via-slate-900 to-primary/80 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl md:text-6xl"
          >
            The Story Behind Every Bottle
          </h2>
          <p
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{
              opacity: 1,
              y: 0,
              transition: { duration: 800, delay: 200 },
            }"
            class="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-700 sm:text-xl"
          >
            Explore Moldova's 7,000-year winemaking tradition, meet our passionate producers, and discover the regions that make our wines unique
          </p>
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible="{
              opacity: 1,
              y: 0,
              transition: { duration: 800, delay: 300 },
            }"
          >
            <NuxtLink
              :to="localePath('/wine-story')"
              class="group mt-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 px-10 py-5 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
            >
              Explore Wine Heritage
              <commonIcon name="lucide:arrow-right" class="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </NuxtLink>
          </div>

          <!-- Decorative Wine Icons -->
          <div
            v-motion
            :initial="{ opacity: 0 }"
            :visible="{
              opacity: 1,
              transition: { duration: 1000, delay: 500 },
            }"
            class="mt-12 flex items-center justify-center gap-4 text-gold-600/40"
          >
            <commonIcon name="lucide:wine" class="h-5 w-5" />
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <commonIcon name="lucide:grape" class="h-5 w-5" />
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <commonIcon name="lucide:wine" class="h-5 w-5" />
          </div>
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

