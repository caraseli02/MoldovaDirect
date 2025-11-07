<template>
  <section class="bg-gray-50 py-16 md:py-24">
    <div class="container">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-gray-900 md:text-4xl">
          {{ t('home.videoTestimonials.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          {{ t('home.videoTestimonials.subtitle') }}
        </p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          class="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
        >
          <!-- Video Thumbnail -->
          <div class="relative aspect-video overflow-hidden bg-gray-200">
            <NuxtImg
              v-if="!playingVideos.has(testimonial.id)"
              :src="testimonial.thumbnail"
              :alt="`${testimonial.name} testimonial`"
              class="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />

            <!-- Play Button Overlay -->
            <button
              v-if="!playingVideos.has(testimonial.id)"
              class="absolute inset-0 flex items-center justify-center bg-black/30 transition-all group-hover:bg-black/40"
              :aria-label="`Play video testimonial from ${testimonial.name}`"
              @click="playVideo(testimonial.id)"
            >
              <div class="rounded-full bg-white p-4 shadow-lg transition-transform group-hover:scale-110">
                <commonIcon name="lucide:play" class="h-8 w-8 text-primary-600" />
              </div>
            </button>

            <!-- Video Player -->
            <div
              v-else
              class="relative h-full w-full"
            >
              <iframe
                :src="`${testimonial.videoUrl}?autoplay=1`"
                class="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                :title="`${testimonial.name} video testimonial`"
              ></iframe>

              <!-- Close Button -->
              <button
                class="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                :aria-label="`Close video from ${testimonial.name}`"
                @click="stopVideo(testimonial.id)"
              >
                <commonIcon name="lucide:x" class="h-5 w-5" />
              </button>
            </div>

            <!-- Closed Captions Badge -->
            <div
              v-if="testimonial.hasClosedCaptions"
              class="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white"
            >
              CC
            </div>
          </div>

          <!-- Testimonial Info -->
          <div class="p-6">
            <div class="mb-3 flex items-center gap-1">
              <commonIcon
                v-for="star in 5"
                :key="star"
                name="lucide:star"
                class="h-4 w-4"
                :class="star <= testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'"
              />
            </div>
            <p class="mb-4 text-sm text-gray-700">
              "{{ testimonial.quote }}"
            </p>
            <div class="flex items-center gap-3">
              <NuxtImg
                v-if="testimonial.avatar"
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="h-10 w-10 rounded-full object-cover"
                loading="lazy"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-semibold text-gray-900">{{ testimonial.name }}</p>
                  <commonIcon
                    v-if="testimonial.verified"
                    name="lucide:badge-check"
                    class="h-4 w-4 text-blue-600"
                    :title="t('home.testimonials.verifiedPurchase')"
                  />
                </div>
                <p class="text-sm text-gray-500">{{ testimonial.location }}</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface VideoTestimonial {
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

defineProps<{
  testimonials: VideoTestimonial[]
}>()

const { t } = useI18n()
const playingVideos = ref<Set<string>>(new Set())

const playVideo = (id: string) => {
  playingVideos.value.add(id)
}

const stopVideo = (id: string) => {
  playingVideos.value.delete(id)
}

// Clean up on unmount
onUnmounted(() => {
  playingVideos.value.clear()
})
</script>
