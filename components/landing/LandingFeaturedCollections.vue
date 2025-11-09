<template>
  <section class="featured-collections py-20 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{ t('landing.collections.heading') }}</h2>
        <p class="text-lg text-gray-600">{{ t('landing.collections.subheading') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink
          v-for="(collection, index) in collections"
          :key="collection.id"
          :to="collection.url"
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="index * 100"
          class="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
        >
          <!-- Image with error handling -->
          <NuxtImg
            :src="collection.image"
            :alt="collection.title"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            @error="handleImageError($event, collection.id)"
          />

          <!-- Placeholder shown when image fails to load -->
          <div
            v-if="imageErrors[collection.id]"
            class="absolute inset-0 bg-gradient-to-br from-wine-100 to-wine-200 flex items-center justify-center"
          >
            <div class="text-center text-wine-600">
              <commonIcon name="lucide:image-off" class="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p class="text-sm font-medium">{{ collection.title }}</p>
            </div>
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 class="text-2xl font-bold mb-2">{{ collection.title }}</h3>
            <p class="text-gray-200 mb-4">{{ collection.description }}</p>
            <div class="inline-flex items-center gap-2 text-sm font-semibold">
              {{ t('landing.collections.explore') }}
              <commonIcon name="lucide:arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

// Track image loading errors
const imageErrors = ref<Record<string, boolean>>({})

const collections = [
  {
    id: 'premium-wines',
    title: 'Premium Wines',
    description: '50+ award-winning selections',
    image: '/images/hero/premium-wines.jpg',
    url: '/collections/wines'
  },
  {
    id: 'gourmet-foods',
    title: 'Gourmet Foods',
    description: 'Authentic Moldovan delicacies',
    image: '/images/hero/gourmet-foods.jpg',
    url: '/collections/food'
  },
  {
    id: 'gift-sets',
    title: 'Gift Collections',
    description: 'Curated for special occasions',
    image: '/images/hero/gift-sets.jpg',
    url: '/collections/gifts'
  }
]

// Handle image loading errors
const handleImageError = (event: Event, collectionId: string) => {
  console.warn(`Failed to load image for collection: ${collectionId}`)
  imageErrors.value[collectionId] = true
}
</script>
