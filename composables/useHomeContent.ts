import { computed } from 'vue'

type Highlight = {
  value: string
  label: string
}

type CategoryCard = {
  key: string
  title: string
  description: string
  cta: string
  href: string
  icon: string
  accentBackground: string
  image: string
  imageAlt: string
}

type HowItWorksStep = {
  key: string
  title: string
  description: string
  icon: string
}

type Testimonial = {
  id: string
  name: string
  avatar?: string
  location: string
  rating: number
  verified: boolean
  date: string
  quote: string
  productImage?: string
}

type MediaMention = {
  name: string
  logo: string
  url?: string
  quote?: string
}

type TrustBadge = {
  id: string
  label: string
  icon: string
  verified?: boolean
}

type VideoTestimonial = {
  id: string
  name: string
  avatar?: string
  location: string
  rating: number
  verified: boolean
  quote: string
  videoUrl: string
  thumbnail: string
  hasClosedCaptions?: boolean
}

type Stat = {
  id: string
  value: number
  label: string
  icon: string
  prefix?: string
  suffix?: string
  duration?: number
}

type StoryPoint = {
  title: string
  description: string
  icon: string
}

type StoryTimelineItem = {
  year: string
  title: string
  description: string
}

type ServiceCard = {
  title: string
  description: string
  cta: string
  href: string
  icon: string
}

type FaqItem = {
  question: string
  answer: string
}

type HeroContent = {
  videoUrl?: string
  fallbackImage: string
  fallbackAlt: string
  urgencyMessage: string
  trustIndicators: Array<{
    icon: string
    text: string
  }>
}

export const useHomeContent = () => {
  const localePath = useLocalePath()
  const { t, tm, locale } = useI18n()

  // Hero content with video and urgency elements
  const heroContent = computed<HeroContent>(() => ({
    // TODO: Replace with actual hero video when available
    // Video should be WebM format, <5MB, 15-30 seconds loop
    videoUrl: undefined, // '/videos/hero-background.webm'
    fallbackImage: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000',
    fallbackAlt: t('home.hero.fallbackAlt') || 'Moldovan wine and products',
    urgencyMessage: t('home.hero.urgencyMessage') || 'Limited Time: Free Shipping on Orders Over €50',
    trustIndicators: [
      {
        icon: 'lucide:shield-check',
        text: t('home.hero.trustIndicators.secure') || 'Secure Checkout'
      },
      {
        icon: 'lucide:truck',
        text: t('home.hero.trustIndicators.shipping') || 'Fast Delivery'
      },
      {
        icon: 'lucide:star',
        text: t('home.hero.trustIndicators.rating') || '4.9/5 Rating'
      }
    ]
  }))

  const heroHighlights = computed<Highlight[]>(() => [
    {
      value: t('home.hero.highlights.orders.value'),
      label: t('home.hero.highlights.orders.label')
    },
    {
      value: t('home.hero.highlights.delivery.value'),
      label: t('home.hero.highlights.delivery.label')
    },
    {
      value: t('home.hero.highlights.rating.value'),
      label: t('home.hero.highlights.rating.label')
    }
  ])

  const categoryKeys = ['wines', 'gourmet', 'gifts', 'subscriptions'] as const
  const categoryIcons: Record<(typeof categoryKeys)[number], string> = {
    wines: 'lucide:sparkles',
    gourmet: 'lucide:flask-conical',
    gifts: 'lucide:gift',
    subscriptions: 'lucide:boxes'
  }
  const categoryAccents = [
    'bg-gradient-to-br from-rose-500/20 via-orange-400/20 to-amber-300/20',
    'bg-gradient-to-br from-emerald-500/20 via-lime-400/20 to-teal-300/20',
    'bg-gradient-to-br from-sky-500/20 via-indigo-400/20 to-blue-300/20',
    'bg-gradient-to-br from-purple-500/20 via-fuchsia-400/20 to-pink-300/20'
  ]
  // TODO: Replace with actual product photography when available
  // These are temporary placeholder images from Unsplash
  const categoryImages: Record<(typeof categoryKeys)[number], string> = {
    wines: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200',
    gourmet: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200',
    gifts: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200',
    subscriptions: 'https://images.unsplash.com/photo-1606787365614-d990e8c69f0e?q=80&w=1200'
  }

  const categoryCards = computed<CategoryCard[]>(() => {
    const baseProducts = localePath('/products')
    const queryMap: Record<(typeof categoryKeys)[number], string> = {
      wines: 'wine',
      gourmet: 'gourmet',
      gifts: 'gift',
      subscriptions: 'subscription'
    }

    return categoryKeys.map((key, index) => ({
      key,
      title: t(`home.categories.items.${key}.title`),
      description: t(`home.categories.items.${key}.description`),
      cta: t(`home.categories.items.${key}.cta`),
      href: `${baseProducts}?category=${queryMap[key]}`,
      icon: categoryIcons[key],
      accentBackground: categoryAccents[index % categoryAccents.length],
      image: categoryImages[key],
      imageAlt: t(`home.categories.items.${key}.imageAlt`)
    }))
  })

  const howItWorksKeys = ['choose', 'prepare', 'deliver'] as const
  const howItWorksIcons: Record<(typeof howItWorksKeys)[number], string> = {
    choose: 'lucide:search',
    prepare: 'lucide:sparkles',
    deliver: 'lucide:truck'
  }

  const howItWorksSteps = computed<HowItWorksStep[]>(() =>
    howItWorksKeys.map((key) => ({
      key,
      title: t(`home.howItWorks.steps.${key}.title`),
      description: t(`home.howItWorks.steps.${key}.description`),
      icon: howItWorksIcons[key]
    }))
  )

  const testimonialKeys = ['maria', 'carlos', 'sofia'] as const
  const testimonials = computed<Testimonial[]>(() =>
    testimonialKeys.map((key) => ({
      id: key,
      name: t(`home.socialProof.testimonials.${key}.name`),
      avatar: t(`home.socialProof.testimonials.${key}.avatar`),
      quote: t(`home.socialProof.testimonials.${key}.quote`),
      location: t(`home.socialProof.testimonials.${key}.location`),
      rating: Number(t(`home.socialProof.testimonials.${key}.rating`)) || 5,
      verified: t(`home.socialProof.testimonials.${key}.verified`) === 'true',
      date: t(`home.socialProof.testimonials.${key}.date`),
      productImage: t(`home.socialProof.testimonials.${key}.productImage`)
    }))
  )

  const mediaMentionKeys = ['nyt', 'wsj', 'forbes', 'techcrunch', 'bbc'] as const
  const mediaMentions = computed<MediaMention[]>(() =>
    mediaMentionKeys.map((key) => ({
      name: t(`home.mediaMentions.items.${key}.name`),
      logo: t(`home.mediaMentions.items.${key}.logo`),
      url: t(`home.mediaMentions.items.${key}.url`),
      quote: t(`home.mediaMentions.items.${key}.quote`)
    }))
  )

  const trustBadgeKeys = ['ssl', 'authenticity', 'moneyBack', 'freeShipping', 'securePay'] as const
  const trustBadges = computed<TrustBadge[]>(() =>
    trustBadgeKeys.map((key) => ({
      id: key,
      label: t(`home.trustBadges.items.${key}.label`),
      icon: t(`home.trustBadges.items.${key}.icon`),
      verified: t(`home.trustBadges.items.${key}.verified`) === 'true'
    }))
  )

  const videoTestimonialKeys = ['ana', 'ion', 'elena'] as const
  const videoTestimonials = computed<VideoTestimonial[]>(() =>
    videoTestimonialKeys.map((key) => ({
      id: key,
      name: t(`home.videoTestimonials.items.${key}.name`),
      avatar: t(`home.videoTestimonials.items.${key}.avatar`),
      location: t(`home.videoTestimonials.items.${key}.location`),
      rating: Number(t(`home.videoTestimonials.items.${key}.rating`)) || 5,
      verified: t(`home.videoTestimonials.items.${key}.verified`) === 'true',
      quote: t(`home.videoTestimonials.items.${key}.quote`),
      videoUrl: t(`home.videoTestimonials.items.${key}.videoUrl`),
      thumbnail: t(`home.videoTestimonials.items.${key}.thumbnail`),
      hasClosedCaptions: t(`home.videoTestimonials.items.${key}.hasClosedCaptions`) === 'true'
    }))
  )

  const statKeys = ['customers', 'products', 'rating', 'countries'] as const
  const stats = computed<Stat[]>(() =>
    statKeys.map((key) => ({
      id: key,
      value: Number(t(`home.stats.items.${key}.value`)) || 0,
      label: t(`home.stats.items.${key}.label`),
      icon: t(`home.stats.items.${key}.icon`),
      prefix: t(`home.stats.items.${key}.prefix`),
      suffix: t(`home.stats.items.${key}.suffix`),
      duration: Number(t(`home.stats.items.${key}.duration`)) || 2000
    }))
  )

  const partnerLogos = computed<string[]>(() => {
    const logos = tm('home.socialProof.logos')

    if (!Array.isArray(logos)) {
      return []
    }

    return logos.map((_, index) => t(`home.socialProof.logos.${index}`))
  })

  const storyPointKeys = ['heritage', 'craft', 'pairings'] as const
  const storyPointIcons: Record<(typeof storyPointKeys)[number], string> = {
    heritage: 'lucide:globe-2',
    craft: 'lucide:heart',
    pairings: 'lucide:sparkles'
  }

  const storyPoints = computed<StoryPoint[]>(() =>
    storyPointKeys.map((key) => ({
      title: t(`home.story.points.${key}.title`),
      description: t(`home.story.points.${key}.description`),
      icon: storyPointIcons[key]
    }))
  )

  const storyTimeline = computed<StoryTimelineItem[]>(() => {
    const timelineItems = tm('home.story.timeline.items')

    if (!Array.isArray(timelineItems)) {
      return []
    }

    return timelineItems.map((_, index) => ({
      year: t(`home.story.timeline.items.${index}.year`),
      title: t(`home.story.timeline.items.${index}.title`),
      description: t(`home.story.timeline.items.${index}.description`)
    }))
  })

  const serviceKeys = ['gifting', 'corporate'] as const
  const serviceIcons: Record<(typeof serviceKeys)[number], string> = {
    gifting: 'lucide:gift',
    corporate: 'lucide:users'
  }

  const services = computed<ServiceCard[]>(() => {
    const contactBase = localePath('/contact')

    return serviceKeys.map((key) => ({
      title: t(`home.services.items.${key}.title`),
      description: t(`home.services.items.${key}.description`),
      cta: t(`home.services.items.${key}.cta`),
      href: key === 'corporate' ? `${contactBase}?topic=corporate` : contactBase,
      icon: serviceIcons[key]
    }))
  })

  const faqKeys = ['shipping', 'packaging', 'support'] as const
  const faqItems = computed<FaqItem[]>(() =>
    faqKeys.map((key) => ({
      question: t(`home.faqPreview.items.${key}.question`),
      answer: t(`home.faqPreview.items.${key}.answer`)
    }))
  )

  return {
    locale,
    heroContent,
    heroHighlights,
    categoryCards,
    howItWorksSteps,
    testimonials,
    partnerLogos,
    storyPoints,
    storyTimeline,
    services,
    faqItems,
    mediaMentions,
    trustBadges,
    videoTestimonials,
    stats
  }
}
