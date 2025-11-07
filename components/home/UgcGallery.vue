<template>
  <section class="bg-gray-50 py-20 dark:bg-gray-900/50 md:py-28">
    <div class="container">
      <!-- Header -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-3xl text-center"
      >
        <span class="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
          <commonIcon name="lucide:camera" class="h-4 w-4" />
          {{ t('home.ugcGallery.badge') }}
        </span>
        <h2 class="mt-4 text-4xl font-bold text-gray-900 dark:text-gray-50 md:text-5xl lg:text-6xl tracking-tight">
          {{ t('home.ugcGallery.title') }}
        </h2>
        <p class="mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {{ t('home.ugcGallery.subtitle') }}
        </p>
      </div>

      <!-- Instagram-style grid -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 40 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600, delay: 200 },
        }"
        class="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      >
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.9 }"
          :visible-once="{
            opacity: 1,
            scale: 1,
            transition: { duration: 400, delay: 300 + index * 50 },
          }"
          :class="[
            'group relative overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800',
            photo.featured ? 'md:col-span-2 md:row-span-2' : ''
          ]"
          class="aspect-square"
        >
          <!-- Image -->
          <NuxtImg
            :src="photo.image"
            :alt="photo.caption"
            width="400"
            height="400"
            densities="1x 2x"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />

          <!-- Overlay on hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div class="absolute bottom-0 left-0 right-0 p-4 text-white">
              <!-- Verified badge -->
              <div v-if="photo.verified" class="mb-2 inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-xs font-semibold">
                <commonIcon name="lucide:check-circle" class="h-3 w-3" />
                {{ t('home.ugcGallery.verified') }}
              </div>

              <!-- Caption -->
              <p class="text-sm font-medium">{{ photo.caption }}</p>

              <!-- Customer name -->
              <p class="mt-1 text-xs text-white/80">@{{ photo.customer }}</p>

              <!-- Rating -->
              <div v-if="photo.rating" class="mt-2">
                <UiStarRating :rating="photo.rating" size="sm" />
              </div>
            </div>
          </div>

          <!-- Instagram icon overlay -->
          <div class="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-gray-900/90">
            <commonIcon name="lucide:instagram" class="h-4 w-4 text-pink-600" />
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 20 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 500, delay: 800 },
        }"
        class="mt-12 text-center"
      >
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('home.ugcGallery.ctaText') }}
        </p>
        <a
          href="https://instagram.com/moldovadirect"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          <commonIcon name="lucide:instagram" class="h-5 w-5" />
          {{ t('home.ugcGallery.ctaButton') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CustomerPhoto {
  id: string
  image: string
  caption: string
  customer: string
  verified: boolean
  rating?: number
  featured?: boolean
}

withDefaults(
  defineProps<{
    photos?: CustomerPhoto[]
  }>(),
  {
    // Mock customer photos (using Unsplash)
    photos: () => [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
        caption: 'Perfect pairing for our anniversary dinner!',
        customer: 'maria_bcn',
        verified: true,
        rating: 5,
        featured: true
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1566754436750-9393f43f02b3?w=400',
        caption: 'The gift hamper was beautiful',
        customer: 'carlos_madrid',
        verified: true,
        rating: 5
      },
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400',
        caption: 'Delicious wines from Moldova',
        customer: 'sofia_valencia',
        verified: true,
        rating: 4.5
      },
      {
        id: '4',
        image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400',
        caption: 'Amazing artisan cheeses',
        customer: 'juan_sevilla',
        verified: true,
        rating: 5
      },
      {
        id: '5',
        image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400',
        caption: 'Monthly subscription box arrived!',
        customer: 'ana_bilbao',
        verified: true,
        rating: 5
      },
      {
        id: '6',
        image: 'https://images.unsplash.com/photo-1599974579688-8dbdd243c6b0?w=400',
        caption: 'Perfect for our wine tasting party',
        customer: 'pedro_malaga',
        verified: true,
        rating: 4.5
      },
      {
        id: '7',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400',
        caption: 'Love the traditional recipes',
        customer: 'lucia_granada',
        verified: true,
        rating: 5
      },
      {
        id: '8',
        image: 'https://images.unsplash.com/photo-1452251889946-8ff5ea7f27a3?w=400',
        caption: 'Best online wine shop!',
        customer: 'miguel_zaragoza',
        verified: true,
        rating: 5
      }
    ]
  }
)

const { t } = useI18n()
</script>
