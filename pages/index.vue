<template>
  <div class="landing-page">
    <!-- Media Mentions Bar - Above fold -->
    <LandingMediaMentionsBar />

    <!-- Hero Section with Video Background -->
    <LandingHeroSection @open-quiz="openQuiz" />

    <!-- Trust Badges - Immediate social proof -->
    <LandingTrustBadges />

    <!-- Stats Counter - Animated numbers -->
    <LandingStatsCounter />

    <!-- Product Carousel - Featured products -->
    <LandingProductCarousel :products="featuredProducts" />

    <!-- Quiz CTA - Mid-page conversion driver -->
    <LandingQuizCTA @start-quiz="openQuiz" />

    <!-- UGC Gallery - Customer photos -->
    <LandingUGCGallery />

    <!-- Featured Collections - Category showcase -->
    <LandingFeaturedCollections />

    <!-- Newsletter Signup - Email capture -->
    <LandingNewsletterSignup />

    <!-- Quiz Modal - Appears when triggered -->
    <QuizModal
      :is-open="isQuizOpen"
      @close="closeQuiz"
      @complete="handleQuizComplete"
    />
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types'
import { CONTACT_INFO } from '~/constants/seo'

interface QuizAnswer {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
}

// SEO Meta Tags - Public landing page, no auth required
definePageMeta({
  layout: 'default',
  auth: false
})

const { locale } = useI18n()
const { siteUrl, toAbsoluteUrl } = useSiteUrl()

// Fetch featured products from API
const { data: featuredData } = await useFetch(
  '/api/products/featured',
  {
    query: {
      limit: 8,
      locale: locale.value
    },
    server: true,
    lazy: false
  }
)

const featuredProducts = computed<ProductWithRelations[]>(() => featuredData.value?.products || [])

// Structured data for SEO
const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Moldova Direct',
    url: siteUrl,
    logo: toAbsoluteUrl('/icon.svg'),
    description: 'Premium Moldovan wines and gourmet foods delivered across Spain',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: CONTACT_INFO.PHONE,
        contactType: 'customer service',
        areaServed: 'ES',
        availableLanguage: ['Spanish', 'English']
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2400',
      bestRating: '5',
      worstRating: '1'
    },
    sameAs: [
      'https://www.facebook.com/moldovadirect',
      'https://www.instagram.com/moldovadirect',
      'https://twitter.com/moldovadirect'
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

// Use proper SEO composable
useLandingSeo({
  title: 'Moldova Direct – Authentic Moldovan Wines & Gourmet Foods',
  description: 'Discover 5,000 years of winemaking tradition with our curated collection of premium Moldovan wines and gourmet delicacies. Free shipping on orders over €75.',
  image: '/icon.svg',
  imageAlt: 'Moldova Direct - Premium Moldovan wines and artisanal foods',
  pageType: 'website',
  keywords: [
    'Moldovan wine delivery Spain',
    'Moldovan gourmet food',
    'authentic Moldovan products',
    'premium wines Spain',
    'artisanal foods',
    'Purcari wine',
    'Cricova sparkling wine',
    'Moldova Direct'
  ],
  structuredData
})

// Quiz modal state
const isQuizOpen = ref(false)

const openQuiz = () => {
  isQuizOpen.value = true

  // Track analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'quiz_opened', {
      event_category: 'engagement',
      event_label: 'product_quiz'
    })
  }
}

const closeQuiz = () => {
  isQuizOpen.value = false
}

const handleQuizComplete = (answers: QuizAnswer) => {
  // Track completion
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'quiz_completed', {
      event_category: 'conversion',
      event_label: 'product_quiz',
      value: 1
    })
  }

  // Close the modal
  closeQuiz()

  // Redirect to products with quiz results
  const params = new URLSearchParams()
  if (answers.categoryId) params.append('category', answers.categoryId)
  if (answers.experienceLevel) params.append('experience', answers.experienceLevel)
  if (answers.budgetRange) params.append('budget', answers.budgetRange)
  if (answers.occasion) params.append('occasion', answers.occasion)

  navigateTo(`/products?${params.toString()}`)
}
</script>

<style scoped>
.landing-page {
  /* Full width sections, no max-width constraint */
  width: 100%;
}
</style>
