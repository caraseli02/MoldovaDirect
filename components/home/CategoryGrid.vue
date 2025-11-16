<template>
  <section class="py-20 md:py-28">
    <div class="container">
      <!-- Header with fade-in animation -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h2 class="text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight">{{ t('home.categories.title') }}</h2>
          <p class="mt-4 max-w-2xl text-sm md:text-base text-gray-600 dark:text-gray-400">{{ t('home.categories.subtitle') }}</p>
        </div>
        <NuxtLink
          :to="localePath('/products')"
          class="cta-button inline-flex items-center gap-2 rounded-full border border-primary-200 px-5 py-2 text-sm font-semibold text-primary-700 dark:border-primary-700/40 dark:text-primary-200"
        >
          {{ t('home.categories.viewAll') }}
          <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>

      <!-- Category cards - Carousel on mobile, Grid on desktop -->
      <!-- Mobile: Horizontal scroll with native CSS -->
      <div class="mt-12 md:hidden">
        <div class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 -mx-4 px-4 scrollbar-hide">
          <article
            v-for="(category, index) in categories"
            :key="category.key"
            class="flex-shrink-0 w-[85%] snap-center"
            :class="{
              'sm:w-[60%]': categories.length > 1,
              'md:w-[45%]': categories.length > 2
            }"
          >
            <NuxtLink
              :to="category.href"
              class="hover-lift group relative block overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/95 dark:border-gray-800 dark:bg-gray-900"
            >
              <NuxtImg
                :src="category.image"
                :alt="category.imageAlt"
                densities="1x 2x"
                class="absolute inset-0 h-full w-full object-cover brightness-[1.05] transition duration-700 ease-out group-hover:scale-105"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/20"></div>
              <div
                :class="[
                  'absolute inset-0 opacity-45 mix-blend-soft-light transition group-hover:opacity-65',
                  category.accentBackground
                ]"
              ></div>
              <div class="relative flex h-full min-h-[22rem] flex-col justify-between p-8 text-white">
                <div class="space-y-4">
                  <span class="inline-flex items-center justify-center rounded-xl bg-white/90 p-3 text-slate-900 shadow-lg shadow-slate-900/15 transition group-hover:bg-white group-hover:scale-110">
                    <commonIcon :name="category.icon" class="h-6 w-6" />
                  </span>
                  <div class="space-y-3">
                    <h3 class="text-2xl font-semibold leading-tight">{{ category.title }}</h3>
                    <p class="text-sm text-white/85">{{ category.description }}</p>
                  </div>
                </div>
                <span class="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:translate-x-1">
                  {{ category.cta }}
                  <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
                </span>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>

      <!-- Desktop: Grid layout with stagger animation -->
      <div class="mt-12 hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(category, index) in categories"
          :key="category.key"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 500, delay: index * 100 },
          }"
        >
          <NuxtLink
            :to="category.href"
            class="hover-lift group relative block overflow-hidden rounded-3xl border border-gray-200 bg-gray-900/95 dark:border-gray-800 dark:bg-gray-900"
          >
            <NuxtImg
              :src="category.image"
              :alt="category.imageAlt"
              densities="1x 2x"
              class="absolute inset-0 h-full w-full object-cover brightness-[1.05] transition duration-700 ease-out group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-900/20"></div>
            <div
              :class="[
                'absolute inset-0 opacity-45 mix-blend-soft-light transition group-hover:opacity-65',
                category.accentBackground
              ]"
            ></div>
            <div class="relative flex h-full min-h-[22rem] flex-col justify-between p-8 text-white">
              <div class="space-y-4">
                <span class="inline-flex items-center justify-center rounded-xl bg-white/90 p-3 text-slate-900 shadow-lg shadow-slate-900/15 transition group-hover:bg-white group-hover:scale-110">
                  <commonIcon :name="category.icon" class="h-6 w-6" />
                </span>
                <div class="space-y-3">
                  <h3 class="text-2xl font-semibold leading-tight">{{ category.title }}</h3>
                  <p class="text-sm text-white/85">{{ category.description }}</p>
                </div>
              </div>
              <span class="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:translate-x-1">
                {{ category.cta }}
                <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
              </span>
            </div>
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  categories: Array<{
    key: string
    title: string
    description: string
    cta: string
    href: string
    icon: string
    accentBackground: string
    image: string
    imageAlt: string
  }>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
</script>

<style scoped>
/* Hide scrollbar for native scroll carousel */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
</style>
