<template>
  <div class="text-gray-900 dark:text-gray-100">
    <!-- Promotional announcement bar -->
    <HomeAnnouncementBar v-if="isSectionEnabled('announcementBar')" :show-cta="true" />

    <!--
      Hero Section - 3 Display Modes Available:

      1. GRADIENT MODE (current fallback):
         - Remove background-image prop
         - Set :show-video="false"
         - Uses wine-burgundy gradient with decorative elements

      2. IMAGE MODE (currently active - DEMO):
         - Set background-image to image URL
         - Set :show-video="false"
         - Demo: Unsplash vineyard image (replace with your own)
         - Production: Use /public/images/hero/your-image.webp

      3. VIDEO MODE:
         - Set :show-video="true"
         - Provide video-webm and video-mp4 sources
         - Add poster-image for loading state
         - Note: Ensure videos exist in /public/videos/
    -->
    <HomeVideoHero
      v-if="isSectionEnabled('videoHero')"
      :show-video="false"
      video-webm="/videos/hero.webm"
      video-mp4="/videos/hero.mp4"
      poster-image="/images/hero-poster.jpg"
      background-image="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=85&fit=crop&auto=format"
      background-image-alt="Moldova vineyard landscape with rolling hills at golden hour"
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
    <LazyHomeMediaMentions v-if="isSectionEnabled('mediaMentions')" />

    <!-- Quick category navigation for immediate browsing -->
    <LazyHomeCategoryGrid v-if="isSectionEnabled('categoryGrid')" :categories="categoryCards" />

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

    <!-- Product recommendation quiz (Jones Road/Beardbrand pattern) - DISABLED: No backend -->
    <LazyHomeProductQuiz v-if="isSectionEnabled('productQuiz')" />

    <!-- Wine Story CTA - Link to full heritage page - FIXED: Reduced padding for mobile -->
    <section v-if="isSectionEnabled('wineStoryCta')" class="relative overflow-hidden bg-gradient-to-br from-primary/8 via-gold-50/40 to-terracotta/8 py-16 md:py-24">
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
            class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-500/20 to-gold-600/20 px-4 py-2 text-xs font-bold text-gold-700 shadow-lg backdrop-blur-sm ring-1 ring-gold-500/30 md:mb-6 md:px-6 md:py-3 md:text-sm"
          >
            <commonIcon name="lucide:wine" class="h-4 w-4 md:h-5 md:w-5" />
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
            class="bg-gradient-to-br from-primary via-slate-900 to-primary/80 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl md:text-5xl lg:text-6xl"
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
            class="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-700 md:mt-6 md:text-lg lg:text-xl"
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
              class="group mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-primary to-primary/90 px-6 py-3 font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 md:mt-10 md:px-10 md:py-5"
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
            class="mt-8 flex items-center justify-center gap-3 text-gold-600/40 md:mt-12 md:gap-4"
          >
            <commonIcon name="lucide:wine" class="h-4 w-4 md:h-5 md:w-5" />
            <div class="h-px w-12 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent md:w-16" />
            <commonIcon name="lucide:grape" class="h-4 w-4 md:h-5 md:w-5" />
            <div class="h-px w-12 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent md:w-16" />
            <commonIcon name="lucide:wine" class="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </div>
    </section>

    <!-- Social proof and trust signals -->
    <LazyHomeSocialProofSection
      v-if="isSectionEnabled('socialProof')"
      :highlights="heroHighlights"
      :logos="partnerLogos"
      :testimonials="testimonials"
    />

    <!-- User-generated content gallery (Rare Beauty pattern) - DISABLED: 100% fabricated content -->
    <LazyHomeUgcGallery v-if="isSectionEnabled('ugcGallery')" />

    <!-- Process explanation -->
    <LazyHomeHowItWorksSection v-if="isSectionEnabled('howItWorks')" :steps="howItWorksSteps" />

    <!-- Service offerings -->
    <LazyHomeServicesSection v-if="isSectionEnabled('services')" :services="services" />

    <!-- Trust badges and payment security -->
    <LazyHomeTrustBadges v-if="isSectionEnabled('trustBadges')" />

    <!-- Certification badges (Allbirds pattern) -->
    <LazyHomeCertificationBar v-if="isSectionEnabled('certificationBar')" />

    <!-- Newsletter signup -->
    <LazyHomeNewsletterSignup v-if="isSectionEnabled('newsletter')" />

    <!-- FAQ preview -->
    <LazyHomeFaqPreviewSection v-if="isSectionEnabled('faqPreview')" :items="faqItems" />

    <!-- Story section moved to About page -->
    <!-- <HomeStorySection :points="storyPoints" :timeline="storyTimeline" /> -->

    <!-- Real-time purchase notifications (Gymshark/Fomo pattern) - DISABLED: Fake purchase data -->
    <LazyUiRealtimeNotification v-if="isSectionEnabled('realtimeNotification')" />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'
import { CONTACT_INFO } from '~/constants/seo'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { isSectionEnabled } = useLandingConfig()
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

// Preload hero image for optimal LCP performance
// Demo placeholder: Using Unsplash vineyard image
// Replace with your own image in /public/images/hero/ for production
useHead({
  link: [
    {
      rel: 'preload',
      as: 'image',
      href: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1920&q=85&fit=crop&auto=format',
      fetchpriority: 'high',
      type: 'image/webp'
    }
  ]
})
</script>
