<template>
  <section class="relative overflow-hidden bg-slate-900 py-20 text-white md:py-28">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]"></div>
    <div class="container relative">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-xl">
          <!-- Badge with animation -->
          <div
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 500 },
            }"
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20 backdrop-blur-sm"
          >
            <commonIcon
              name="lucide:star"
              class="h-5 w-5"
            />
            <span>{{ t('home.socialProof.badge') }}</span>
          </div>

          <!-- Title with animation -->
          <h2
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 100 },
            }"
            class="mt-6 text-3xl font-bold md:text-4xl"
          >
            {{ t('home.socialProof.title') }}
          </h2>

          <!-- Subtitle with animation -->
          <p
            v-motion
            :initial="{ opacity: 0, x: -20 }"
            :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 200 },
            }"
            class="mt-4 text-lg text-slate-100"
          >
            {{ t('home.socialProof.subtitle') }}
          </p>

          <!-- Animated stats with counter -->
          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div
              v-for="(stat, index) in animatedStats"
              :key="stat.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible-once="{
                opacity: 1,
                scale: 1,
                transition: { duration: 400, delay: 300 + index * 100 },
              }"
              class="rounded-xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/10"
            >
              <p
                class="text-3xl font-bold"
                aria-live="polite"
                aria-atomic="true"
              >
                {{ stat.displayValue }}
              </p>
              <p class="mt-2 text-sm text-slate-100 break-words">
                {{ stat.label }}
              </p>
            </div>
          </div>

          <!-- Partner logos with animation -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 500, delay: 600 },
            }"
            class="mt-10 grid gap-4 sm:grid-cols-2"
          >
            <div
              v-for="logo in logos"
              :key="logo"
              class="flex items-center gap-3 rounded-xl bg-white/5 px-5 py-4 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/10"
            >
              <commonIcon
                name="lucide:sparkles"
                class="h-5 w-5 text-slate-100"
              />
              <span>{{ logo }}</span>
            </div>
          </div>
        </div>

        <!-- Testimonials - Carousel on mobile, Grid on desktop -->
        <!-- Mobile: Horizontal carousel -->
        <div class="lg:hidden">
          <Swiper
            :modules="[SwiperPagination]"
            :slides-per-view="1"
            :space-between="20"
            :pagination="{ clickable: true, dynamicBullets: true }"
            class="testimonials-carousel"
          >
            <SwiperSlide
              v-for="testimonial in testimonials"
              :key="testimonial.name"
            >
              <article class="rounded-3xl bg-white/95 p-8 text-left text-gray-900 shadow-xl shadow-slate-950/20">
                <!-- Star rating at top -->
                <div class="mb-4 flex items-center justify-between">
                  <CustomStarRating
                    :rating="5"
                    size="sm"
                  />

                  <!-- Verified badge -->
                  <span
                    class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
                  >
                    <commonIcon
                      name="lucide:check-circle"
                      class="h-3 w-3"
                    />
                    {{ t('home.socialProof.verified') }}
                  </span>
                </div>

                <!-- Quote -->
                <p class="text-lg font-medium leading-relaxed">
                  "{{ testimonial.quote }}"
                </p>

                <!-- Customer info -->
                <div class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
                  <div>
                    <p class="font-semibold text-slate-600">
                      {{ testimonial.name }}
                    </p>
                    <p class="text-gray-500">
                      {{ testimonial.location }}
                    </p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          </Swiper>
        </div>

        <!-- Desktop: Grid with animations -->
        <div class="hidden gap-6 lg:grid lg:max-w-xl">
          <article
            v-for="(testimonial, index) in testimonials"
            :key="testimonial.name"
            v-motion
            :initial="{ opacity: 0, x: 40 }"
            :visible-once="{
              opacity: 1,
              x: 0,
              transition: { duration: 500, delay: 400 + index * 150 },
            }"
            class="rounded-3xl bg-white/95 p-8 text-left text-gray-900 shadow-xl shadow-slate-950/20"
          >
            <!-- Star rating at top -->
            <div class="mb-4 flex items-center justify-between">
              <CustomStarRating
                :rating="5"
                size="sm"
              />

              <!-- Verified badge -->
              <span
                class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700"
              >
                <commonIcon
                  name="lucide:check-circle"
                  class="h-3 w-3"
                />
                {{ t('home.socialProof.verified') }}
              </span>
            </div>

            <!-- Quote -->
            <p class="text-lg font-medium leading-relaxed">
              "{{ testimonial.quote }}"
            </p>

            <!-- Customer info -->
            <div class="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
              <div>
                <p class="font-semibold text-slate-600">
                  {{ testimonial.name }}
                </p>
                <p class="text-gray-500">
                  {{ testimonial.location }}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  highlights: Array<{
    value: string
    label: string
  }>
  logos: string[]
  testimonials: Array<{
    name: string
    quote: string
    location: string
  }>
}>()

const { t } = useI18n()

// Add Review schema markup for SEO
const reviewSchema = computed(() => {
  return props.testimonials.map(testimonial => ({
    '@context': 'https://schema.org',
    '@type': 'Review',
    'itemReviewed': {
      '@type': 'Organization',
      'name': 'Moldova Direct',
    },
    'reviewRating': {
      '@type': 'Rating',
      'ratingValue': '5',
      'bestRating': '5',
    },
    'author': {
      '@type': 'Person',
      'name': testimonial.name,
    },
    'reviewBody': testimonial.quote,
  }))
})

// Inject schema markup into page head
useHead(() => ({
  script: reviewSchema.value.map(schema => ({
    type: 'application/ld+json',
    children: JSON.stringify(schema),
  })),
}))

// Parse numeric values from highlights and create animated counters
// Create counters during setup (not in computed) to avoid lifecycle hook issues
const counters = props.highlights.map((stat) => {
  const numericMatch = stat.value.match(/(\d+(?:\.\d+)?)(k|K)?/)

  if (numericMatch && numericMatch[1]) {
    let number = parseFloat(numericMatch[1])

    // Convert k to thousands
    if (numericMatch[2]?.toLowerCase() === 'k') {
      number = number * 1000
    }

    return useCountUp(number, {
      duration: 2000,
      useEasing: true,
    })
  }

  return null
})

const animatedStats = computed(() => {
  return props.highlights.map((stat, index) => {
    const counter = counters[index]

    if (counter) {
      return {
        label: stat.label,
        displayValue: computed(() => {
          // Format based on original value
          if (stat.value.includes('k') || stat.value.includes('K')) {
            return `${(counter.current.value / 1000).toFixed(1)}k+`
          }
          else if (stat.value.includes('/')) {
            // For ratings like "4.9/5"
            return `${counter.current.value.toFixed(1)}/5`
          }
          else if (stat.value.includes('h')) {
            // For time like "48h"
            return `${counter.current.value}h`
          }
          else {
            return counter.formatted.value
          }
        }),
      }
    }

    // Fallback for non-numeric values
    return {
      label: stat.label,
      displayValue: computed(() => stat.value),
    }
  })
})
</script>

<style scoped>
/* Swiper pagination dots styling for testimonials */
:deep(.testimonials-carousel .swiper-pagination) {
  bottom: -2.5rem;
}

:deep(.testimonials-carousel .swiper-pagination-bullet) {
  background-color: rgb(255 255 255 / 0.5);
  /* white with 50% opacity */
}

:deep(.testimonials-carousel .swiper-pagination-bullet-active) {
  background-color: rgb(255 255 255);
  /* white */
  opacity: 1;
}
</style>
