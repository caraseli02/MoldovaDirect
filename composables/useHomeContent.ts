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
  const localePath = useLocalePath()
  const { t, tm, locale } = useI18n()

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
    wines: 'heroicons:sparkles',
    gourmet: 'heroicons:beaker',
    gifts: 'heroicons:gift-top',
    subscriptions: 'heroicons:cube-transparent'
  }
  const categoryAccents = [
    'bg-gradient-to-br from-rose-500/20 via-orange-400/20 to-amber-300/20',
    'bg-gradient-to-br from-emerald-500/20 via-lime-400/20 to-teal-300/20',
    'bg-gradient-to-br from-sky-500/20 via-indigo-400/20 to-blue-300/20',
    'bg-gradient-to-br from-purple-500/20 via-fuchsia-400/20 to-pink-300/20'
  ]

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
      accentBackground: categoryAccents[index % categoryAccents.length]
    }))
  })

  const howItWorksKeys = ['choose', 'prepare', 'deliver'] as const
  const howItWorksIcons: Record<(typeof howItWorksKeys)[number], string> = {
    choose: 'heroicons:magnifying-glass',
    prepare: 'heroicons:sparkles',
    deliver: 'heroicons:truck'
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
      name: t(`home.socialProof.testimonials.${key}.name`),
      quote: t(`home.socialProof.testimonials.${key}.quote`),
      location: t(`home.socialProof.testimonials.${key}.location`)
    }))
  )

  const partnerLogos = computed<string[]>(() => tm('home.socialProof.logos') as string[])

  const storyPointKeys = ['heritage', 'craft', 'pairings'] as const
  const storyPointIcons: Record<(typeof storyPointKeys)[number], string> = {
    heritage: 'heroicons:globe-alt',
    craft: 'heroicons:heart',
    pairings: 'heroicons:sparkles'
  }

  const storyPoints = computed<StoryPoint[]>(() =>
    storyPointKeys.map((key) => ({
      title: t(`home.story.points.${key}.title`),
      description: t(`home.story.points.${key}.description`),
      icon: storyPointIcons[key]
    }))
  )

  const storyTimeline = computed<StoryTimelineItem[]>(
    () => tm('home.story.timeline.items') as StoryTimelineItem[]
  )

  const serviceKeys = ['gifting', 'corporate'] as const
  const serviceIcons: Record<(typeof serviceKeys)[number], string> = {
    gifting: 'heroicons:gift-top',
    corporate: 'heroicons:users'
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
    heroHighlights,
    categoryCards,
    howItWorksSteps,
    testimonials,
    partnerLogos,
    storyPoints,
    storyTimeline,
    services,
    faqItems
  }
}
