<template>
  <section class="ugc-gallery landing-section bg-white py-16 md:py-24">
    <div class="container mx-auto px-4">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
        >
          {{ t('landing.ugc.heading') }}
        </h2>
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          :delay="200"
          class="text-lg text-gray-600 max-w-2xl mx-auto mb-6"
        >
          {{ t('landing.ugc.subheading') }}
        </p>
        <p class="text-sm text-gray-500">
          {{ t('landing.ugc.hashtag') }}
          <span class="font-semibold text-rose-600">#MoldovaDirect</span>
        </p>
      </div>

      <!-- Masonry Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div
          v-for="(photo, index) in photos"
          :key="photo.id"
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :visible="{ opacity: 1, scale: 1 }"
          :delay="index * 50"
          class="ugc-photo-card group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
          :class="{ 'md:row-span-2': photo.tall }"
          @click="openLightbox(photo)"
        >
          <!-- Photo -->
          <NuxtImg
            :src="photo.image"
            :alt="photo.caption"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            format="webp"
            quality="85"
            :width="400"
            :height="400"
          />

          <!-- Overlay on Hover -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <commonIcon name="lucide:user" class="w-5 h-5 text-gray-700" />
              </div>
              <span class="text-white font-semibold text-sm">{{ photo.customerName }}</span>
            </div>
            <p class="text-white text-sm line-clamp-2">{{ photo.caption }}</p>

            <!-- Instagram icon if from Instagram -->
            <div v-if="photo.platform === 'instagram'" class="absolute top-3 right-3">
              <commonIcon name="lucide:instagram" class="w-5 h-5 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      <!-- Share Your Photo CTA -->
      <div class="text-center mt-12">
        <button
          type="button"
          @click="openShareModal"
          class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          :aria-label="t('landing.ugc.shareCta')"
        >
          <commonIcon name="lucide:camera" class="w-5 h-5" />
          {{ t('landing.ugc.shareCta') }}
        </button>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxPhoto"
        class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
        @click="closeLightbox"
      >
        <button
          type="button"
          @click.stop="closeLightbox"
          class="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close lightbox"
        >
          <commonIcon name="lucide:x" class="w-6 h-6 text-white" />
        </button>

        <div class="max-w-4xl w-full" @click.stop>
          <NuxtImg
            :src="lightboxPhoto.image"
            :alt="lightboxPhoto.caption"
            class="w-full h-auto rounded-lg"
            format="webp"
            quality="90"
          />
          <div class="mt-4 text-white">
            <p class="font-semibold text-lg">{{ lightboxPhoto.customerName }}</p>
            <p class="text-gray-300 mt-2">{{ lightboxPhoto.caption }}</p>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface UGCPhoto {
  id: string
  image: string
  customerName: string
  caption: string
  platform?: 'instagram' | 'facebook' | 'twitter'
  tall?: boolean
}

// Example UGC photos - replace with actual customer content
const photos: UGCPhoto[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    customerName: 'Maria S.',
    caption: 'Perfect gift for my wine-loving parents! #MoldovaDirect',
    platform: 'instagram'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=400',
    customerName: 'John D.',
    caption: 'Best Moldovan wine I\'ve ever tasted 🍷',
    platform: 'instagram',
    tall: true
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400',
    customerName: 'Sofia R.',
    caption: 'Celebrating our anniversary with this amazing wine!',
    platform: 'instagram'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400',
    customerName: 'Alex M.',
    caption: 'The honey collection is incredible 🍯',
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1558477338-5f82e49f7a94?w=400',
    customerName: 'Elena V.',
    caption: 'Obsessed with these authentic flavors!',
    platform: 'instagram'
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?w=400',
    customerName: 'David L.',
    caption: 'Cheers from California! 🥂',
    platform: 'instagram',
    tall: true
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1564414962615-b5b4f88b7d1d?w=400',
    customerName: 'Carmen L.',
    caption: 'Love discovering new Moldovan wines every month!',
    platform: 'instagram'
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    customerName: 'Miguel R.',
    caption: 'These preserves remind me of my grandmother\'s recipes ❤️'
  }
]

// Lightbox state
const lightboxPhoto = ref<UGCPhoto | null>(null)

const openLightbox = (photo: UGCPhoto) => {
  lightboxPhoto.value = photo
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightboxPhoto.value = null
  document.body.style.overflow = ''
}

const openShareModal = () => {
  // Open share modal or redirect to Instagram
  // TODO: Replace with actual Instagram profile URL
  window.open('https://instagram.com', '_blank')
}

// Cleanup on unmount
onUnmounted(() => {
  if (lightboxPhoto.value) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.ugc-photo-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ugc-photo-card:hover {
  transform: translateY(-4px);
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .ugc-photo-card,
  .ugc-photo-card img {
    transition: none;
  }
}
</style>
