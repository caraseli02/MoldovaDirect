<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-700 py-16 text-white md:py-24">
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
            <div v-for="stat in highlights" :key="stat.label" class="rounded-2xl bg-white/10 p-6">
              <p class="text-3xl font-semibold">{{ stat.value }}</p>
              <p class="mt-2 text-sm text-primary-100">{{ stat.label }}</p>
            </div>
          </div>
          <div class="mt-10 grid gap-4 sm:grid-cols-2">
            <div v-for="logo in logos" :key="logo" class="flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-4 text-sm font-semibold">
              <commonIcon name="lucide:sparkles" class="h-5 w-5 text-primary-100" />
              <span>{{ logo }}</span>
            </div>
          </div>
        </div>
        <div class="grid gap-6 lg:max-w-xl">
          <article
            v-for="testimonial in testimonials"
            :key="testimonial.name"
            class="rounded-3xl bg-white/95 p-8 text-left text-gray-900 shadow-xl shadow-primary-950/20"
          >
            <p class="text-lg font-medium leading-relaxed">“{{ testimonial.quote }}”</p>
            <div class="mt-6 flex items-center justify-between text-sm font-semibold text-primary-600">
              <span>{{ testimonial.name }}</span>
              <span class="text-gray-500">{{ testimonial.location }}</span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
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
</script>
