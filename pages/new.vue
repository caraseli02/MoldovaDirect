<template>
  <div class="landing-page-new">
    <!-- Media Mentions Bar - Above fold -->
    <LandingMediaMentionsBar />

    <!-- Hero Section with Video Background -->
    <LandingHeroSection @open-quiz="openQuiz" />

    <!-- Trust Badges - Immediate social proof -->
    <LandingTrustBadges />

    <!-- Stats Counter - Animated numbers -->
    <LandingStatsCounter />

    <!-- Product Carousel - Featured products -->
    <LandingProductCarousel />

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
interface QuizAnswer {
  categoryId: string | null
  experienceLevel: string | null
  budgetRange: string | null
  occasion: string | null
}

// SEO Meta Tags - Public landing page, no auth required
definePageMeta({
  layout: 'default',
  auth: false // Explicitly mark as public page
})

useSeoMeta({
  title: 'Moldova Direct - Authentic Moldovan Wines & Gourmet Foods',
  description: 'Discover 5,000 years of winemaking tradition with our curated collection of premium Moldovan wines and gourmet delicacies. Free shipping on orders over $75.',
  ogTitle: 'Moldova Direct - Authentic Moldova, Delivered to Your Door',
  ogDescription: 'Premium Moldovan wines and artisanal foods from centuries-old vineyards and master craftsmen.',
  ogImage: '/images/og-image.jpg',
  ogUrl: 'https://moldovadirect.com/new',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Moldova Direct - Authentic Moldovan Products',
  twitterDescription: 'Discover authentic Moldova with premium wines and gourmet foods.',
  twitterImage: '/images/og-image.jpg'
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

// Structured Data for SEO
useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Moldova Direct',
        url: 'https://moldovadirect.com',
        logo: 'https://moldovadirect.com/logo.png',
        description: 'Premium Moldovan wines and gourmet foods',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '2400'
        }
      })
    }
  ]
})
</script>

<style scoped>
.landing-page-new {
  /* Full width sections, no max-width constraint */
  width: 100%;
}
</style>
