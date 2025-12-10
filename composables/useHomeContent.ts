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
  name: string
  quote: string
  location: string
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

export const useHomeContent = () => {
  // ISR is disabled, so all composables work normally
  const localePath = useLocalePath()
  const { t, tm, locale } = useI18n()

  const heroHighlights = computed<Highlight[]>(() => [
    {
      value: t('home.hero.highlights.orders.value'),
      label: t('home.hero.highlights.orders.label'),
    },
    {
      value: t('home.hero.highlights.delivery.value'),
      label: t('home.hero.highlights.delivery.label'),
    },
    {
      value: t('home.hero.highlights.rating.value'),
      label: t('home.hero.highlights.rating.label'),
    },
  ])

  const categoryKeys = ['wines', 'gourmet', 'gifts', 'subscriptions'] as const
  const categoryIcons: Record<(typeof categoryKeys)[number], string> = {
    wines: 'lucide:sparkles',
    gourmet: 'lucide:flask-conical',
    gifts: 'lucide:gift',
    subscriptions: 'lucide:boxes',
  }
  const categoryAccents = [
    'bg-gradient-to-br from-rose-500/20 via-orange-400/20 to-amber-300/20',
    'bg-gradient-to-br from-emerald-500/20 via-lime-400/20 to-teal-300/20',
    'bg-gradient-to-br from-sky-500/20 via-indigo-400/20 to-blue-300/20',
    'bg-gradient-to-br from-purple-500/20 via-fuchsia-400/20 to-pink-300/20',
  ]
  // TODO: Replace with actual product photography when available
  // These are temporary placeholder images from Unsplash
  const categoryImages: Record<(typeof categoryKeys)[number], string> = {
    wines: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200',
    gourmet: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200',
    gifts: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1200',
    subscriptions: 'https://images.unsplash.com/photo-1606787365614-d990e8c69f0e?q=80&w=1200',
  }

  const categoryCards = computed<CategoryCard[]>(() => {
    const baseProducts = localePath('/products')
    const queryMap: Record<(typeof categoryKeys)[number], string> = {
      wines: 'wine',
      gourmet: 'gourmet',
      gifts: 'gift',
      subscriptions: 'subscription',
    }

    return categoryKeys.map((key, index): CategoryCard => ({
      key,
      title: t(`home.categories.items.${key}.title`),
      description: t(`home.categories.items.${key}.description`),
      cta: t(`home.categories.items.${key}.cta`),
      href: `${baseProducts}?category=${queryMap[key]}`,
      icon: categoryIcons[key],
      accentBackground: categoryAccents[index % categoryAccents.length] || categoryAccents[0] || '',
      image: categoryImages[key],
      imageAlt: t(`home.categories.items.${key}.imageAlt`),
    }))
  })

  const howItWorksKeys = ['choose', 'prepare', 'deliver'] as const
  const howItWorksIcons: Record<(typeof howItWorksKeys)[number], string> = {
    choose: 'lucide:search',
    prepare: 'lucide:sparkles',
    deliver: 'lucide:truck',
  }

  const howItWorksSteps = computed<HowItWorksStep[]>(() =>
    howItWorksKeys.map(key => ({
      key,
      title: t(`home.howItWorks.steps.${key}.title`),
      description: t(`home.howItWorks.steps.${key}.description`),
      icon: howItWorksIcons[key],
    })),
  )

  const testimonialKeys = ['maria', 'carlos', 'sofia'] as const
  const testimonials = computed<Testimonial[]>(() =>
    testimonialKeys.map(key => ({
      name: t(`home.socialProof.testimonials.${key}.name`),
      quote: t(`home.socialProof.testimonials.${key}.quote`),
      location: t(`home.socialProof.testimonials.${key}.location`),
    })),
  )

  const partnerLogos = computed<string[]>(() => {
    try {
      const logos = tm('home.socialProof.logos') as unknown[]

      if (!logos || !Array.isArray(logos) || logos.length === 0) {
        return []
      }

      return logos.map((_: unknown, index: number) => t(`home.socialProof.logos.${index}`))
    }
    catch {
      return []
    }
  })

  const storyPointKeys = ['heritage', 'craft', 'pairings'] as const
  const storyPointIcons: Record<(typeof storyPointKeys)[number], string> = {
    heritage: 'lucide:globe-2',
    craft: 'lucide:heart',
    pairings: 'lucide:sparkles',
  }

  const storyPoints = computed<StoryPoint[]>(() =>
    storyPointKeys.map(key => ({
      title: t(`home.story.points.${key}.title`),
      description: t(`home.story.points.${key}.description`),
      icon: storyPointIcons[key],
    })),
  )

  const storyTimeline = computed<StoryTimelineItem[]>(() => {
    try {
      const timelineItems = tm('home.story.timeline.items') as unknown[]

      if (!timelineItems || !Array.isArray(timelineItems) || timelineItems.length === 0) {
        return []
      }

      return timelineItems.map((_: unknown, index: number): StoryTimelineItem => ({
        year: t(`home.story.timeline.items.${index}.year`),
        title: t(`home.story.timeline.items.${index}.title`),
        description: t(`home.story.timeline.items.${index}.description`),
      }))
    }
    catch {
      return []
    }
  })

  const serviceKeys = ['gifting', 'corporate'] as const
  const serviceIcons: Record<(typeof serviceKeys)[number], string> = {
    gifting: 'lucide:gift',
    corporate: 'lucide:users',
  }

  const services = computed<ServiceCard[]>(() => {
    const contactBase = localePath('/contact')

    return serviceKeys.map(key => ({
      title: t(`home.services.items.${key}.title`),
      description: t(`home.services.items.${key}.description`),
      cta: t(`home.services.items.${key}.cta`),
      href: key === 'corporate' ? `${contactBase}?topic=corporate` : contactBase,
      icon: serviceIcons[key],
    }))
  })

  const faqKeys = ['shipping', 'packaging', 'support'] as const
  const faqItems = computed<FaqItem[]>(() =>
    faqKeys.map(key => ({
      question: t(`home.faqPreview.items.${key}.question`),
      answer: t(`home.faqPreview.items.${key}.answer`),
    })),
  )

  return {
    locale,
    heroHighlights,
    categoryCards,
    howItWorksSteps,
    testimonials,
    partnerLogos,
    storyPoints,
    storyTimeline,
    services,
    faqItems,
  }
}
