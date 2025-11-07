<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 py-20 text-white md:py-28">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]"></div>
    <div class="container relative">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-xl">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20">
            <commonIcon name="lucide:star" class="h-5 w-5" />
            <span>{{ t('home.socialProof.badge') }}</span>
          </div>
          <h2 class="mt-6 text-3xl font-bold md:text-4xl">{{ t('home.socialProof.title') }}</h2>
          <p class="mt-4 text-lg text-primary-100">{{ t('home.socialProof.subtitle') }}</p>
          <div class="mt-8 grid gap-6 sm:grid-cols-2">
            <div v-for="stat in highlights" :key="stat.label" class="rounded-xl bg-white/10 p-6">
              <p class="text-3xl font-semibold">{{ stat.value }}</p>
              <p class="mt-2 text-sm text-primary-100">{{ stat.label }}</p>
            </div>
          </div>
          <div class="mt-10 grid gap-4 sm:grid-cols-2">
            <div v-for="logo in logos" :key="logo" class="flex items-center gap-3 rounded-xl bg-white/5 px-5 py-4 text-sm font-semibold">
              <commonIcon name="lucide:sparkles" class="h-5 w-5 text-primary-100" />
              <span>{{ logo }}</span>
            </div>
          </div>
        </div>
        <div class="grid gap-6 lg:max-w-xl">
          <article
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            class="rounded-3xl bg-white/95 p-8 text-left text-gray-900 shadow-xl shadow-primary-950/20"
          >
            <!-- Rating Stars -->
            <div class="mb-4 flex items-center gap-1">
              <commonIcon
                v-for="star in 5"
                :key="star"
                name="lucide:star"
                class="h-5 w-5"
                :class="star <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
              />
            </div>

            <!-- Testimonial Quote -->
            <p class="text-lg font-medium leading-relaxed">"{{ testimonial.quote }}"</p>

            <!-- Product Image (if available) -->
            <NuxtImg
              v-if="testimonial.productImage"
              :src="testimonial.productImage"
              :alt="`${testimonial.name}'s purchase`"
              class="mt-6 h-32 w-full rounded-lg object-cover"
              loading="lazy"
            />

            <!-- Author Info -->
            <div class="mt-6 flex items-center gap-4">
              <NuxtImg
                v-if="testimonial.avatar"
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                loading="lazy"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-primary-600">{{ testimonial.name }}</span>
                  <commonIcon
                    v-if="testimonial.verified"
                    name="lucide:badge-check"
                    class="h-4 w-4 text-blue-600"
                    :title="t('home.testimonials.verifiedPurchase')"
                  />
                </div>
                <div class="mt-1 flex items-center gap-2 text-xs text-gray-500">
                  <span>{{ testimonial.location }}</span>
                  <span>•</span>
                  <time :datetime="testimonial.date">{{ formatDate(testimonial.date) }}</time>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface EnhancedTestimonial {
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

defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
  logos: string[]
  testimonials: EnhancedTestimonial[]
}>()

const { t } = useI18n()

// Format date relative to current date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 7) {
    return t('home.testimonials.daysAgo', { days: diffDays })
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return t('home.testimonials.weeksAgo', { weeks })
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return t('home.testimonials.monthsAgo', { months })
  } else {
    return date.toLocaleDateString()
  }
}
</script>
