<template>
  <section class="luxury-section bg-white">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-16 px-4">
        <p class="luxury-eyebrow text-sm md:text-base">
          {{ $t('luxury.testimonials.eyebrow') || 'Customer Stories' }}
        </p>

        <h2 class="luxury-title text-2xl md:text-3xl lg:text-4xl">
          {{ $t('luxury.testimonials.title') || 'What Our Customers Say' }}
        </h2>

        <div class="luxury-divider mx-auto" />
      </div>

      <!-- Mobile: Horizontal Carousel with Navigation -->
      <div class="md:hidden mb-8 relative">
        <div
          ref="testimonialScrollContainer"
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 -mx-4 scrollbar-hide"
          @scroll="onTestimonialScroll"
        >
          <div
            v-for="testimonial in testimonials"
            :key="testimonial.id"
            class="flex-shrink-0 w-[85vw] max-w-[340px] snap-center"
          >
            <div class="bg-luxury-warm-white p-6 rounded-sm shadow-md h-full flex flex-col">
              <!-- Stars -->
              <div class="flex gap-1 mb-4">
                <svg
                  v-for="star in 5"
                  :key="star"
                  class="w-5 h-5 text-luxury-black fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              </div>

              <!-- Quote -->
              <p class="text-luxury-brown/80 leading-relaxed mb-6 italic text-base flex-1">
                "{{ testimonial.quote }}"
              </p>

              <!-- Customer Info -->
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <NuxtImg
                    :src="testimonial.avatar"
                    :alt="testimonial.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="handleImageError($event, 'avatar')"
                  />
                </div>

                <div>
                  <div class="font-semibold text-luxury-wine-red text-base">
                    {{ testimonial.name }}
                  </div>
                  <div class="text-sm text-luxury-brown/60">
                    {{ testimonial.location }}
                  </div>
                </div>
              </div>

              <!-- Product Badge -->
              <div
                v-if="testimonial.product"
                class="mt-4 pt-4 border-t border-luxury-black/20"
              >
                <div class="text-xs uppercase tracking-wider text-luxury-black">
                  Purchased: {{ testimonial.product }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="testimonialCurrentIndex > 0"
          @click="scrollTestimonialCarousel('prev')"
          class="carousel-arrow carousel-arrow-left"
          aria-label="Previous testimonial"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="testimonialCurrentIndex < testimonials.length - 1"
          @click="scrollTestimonialCarousel('next')"
          class="carousel-arrow carousel-arrow-right"
          aria-label="Next testimonial"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dot Indicators -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(testimonial, index) in testimonials"
            :key="`dot-${testimonial.id}`"
            @click="scrollTestimonialToIndex(index)"
            class="carousel-dot"
            :class="{ active: testimonialCurrentIndex === index }"
            :aria-label="`Go to testimonial ${index + 1}`"
          />
        </div>
      </div>

      <!-- Desktop: Testimonials Grid -->
      <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-4 lg:px-0">
        <div
          v-for="(testimonial, index) in testimonials"
          :key="testimonial.id"
          class="bg-luxury-warm-white p-5 sm:p-6 md:p-8 rounded-sm shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <!-- Stars -->
          <div class="flex gap-1 mb-3 md:mb-4">
            <svg
              v-for="star in 5"
              :key="star"
              class="w-4 h-4 md:w-5 md:h-5 text-luxury-black fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>

          <!-- Quote -->
          <p class="text-luxury-brown/80 leading-relaxed mb-4 md:mb-6 italic text-sm md:text-base">
            "{{ testimonial.quote }}"
          </p>

          <!-- Customer Info -->
          <div class="flex items-center gap-3 md:gap-4">
            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
              <NuxtImg
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError($event, 'avatar')"
              />
            </div>

            <div>
              <div class="font-semibold text-luxury-wine-red text-sm md:text-base">
                {{ testimonial.name }}
              </div>
              <div class="text-xs md:text-sm text-luxury-brown/60">
                {{ testimonial.location }}
              </div>
            </div>
          </div>

          <!-- Product Badge -->
          <div
            v-if="testimonial.product"
            class="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-luxury-black/20"
          >
            <div class="text-xs uppercase tracking-wider text-luxury-black">
              Purchased: {{ testimonial.product }}
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Gallery -->
      <div class="mt-8 md:mt-12 lg:mt-16 px-4 lg:px-0">
        <h3 class="text-center font-serif text-xl md:text-2xl text-luxury-wine-red mb-6 md:mb-8">
          {{ $t('luxury.testimonials.gallery_title') || 'Shared by Our Community' }}
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          <div
            v-for="photo in customerPhotos"
            :key="photo.id"
            class="luxury-image-wrapper aspect-square overflow-hidden rounded-sm"
          >
            <NuxtImg
              :src="photo.image"
              :alt="photo.alt"
              class="w-full h-full object-cover"
              loading="lazy"
              @error="handleImageError($event, 'landscape')"
            />
            <div class="luxury-image-overlay" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()

// Testimonial carousel state
const testimonialScrollContainer = ref<HTMLElement | null>(null)
const testimonialCurrentIndex = ref(0)

const onTestimonialScroll = () => {
  if (!testimonialScrollContainer.value) return

  const container = testimonialScrollContainer.value
  const scrollLeft = container.scrollLeft
  const itemWidth = container.scrollWidth / testimonials.length

  testimonialCurrentIndex.value = Math.round(scrollLeft / itemWidth)
}

const scrollTestimonialCarousel = (direction: 'prev' | 'next') => {
  if (!testimonialScrollContainer.value) return

  const container = testimonialScrollContainer.value
  const itemWidth = container.scrollWidth / testimonials.length
  const newIndex = direction === 'next'
    ? Math.min(testimonialCurrentIndex.value + 1, testimonials.length - 1)
    : Math.max(testimonialCurrentIndex.value - 1, 0)

  container.scrollTo({
    left: itemWidth * newIndex,
    behavior: 'smooth'
  })
}

const scrollTestimonialToIndex = (index: number) => {
  if (!testimonialScrollContainer.value) return

  const container = testimonialScrollContainer.value
  const itemWidth = container.scrollWidth / testimonials.length

  container.scrollTo({
    left: itemWidth * index,
    behavior: 'smooth'
  })
}

const testimonials = [
  {
    id: 1,
    quote: 'The quality is exceptional! These wines remind me of my travels through Eastern Europe. Authentic and delicious.',
    name: 'María García',
    location: 'Madrid, Spain',
    avatar: 'https://i.pravatar.cc/150?img=1',
    product: 'Premium Wine Selection',
  },
  {
    id: 2,
    quote: 'I ordered the gourmet hamper as a corporate gift. My clients were absolutely delighted. Will order again!',
    name: 'Carlos Rodríguez',
    location: 'Barcelona, Spain',
    avatar: 'https://i.pravatar.cc/150?img=12',
    product: 'Luxury Gift Hamper',
  },
  {
    id: 3,
    quote: 'The honey is pure perfection. You can taste the wildflowers. Nothing like the commercial brands.',
    name: 'Ana Martínez',
    location: 'Valencia, Spain',
    avatar: 'https://i.pravatar.cc/150?img=5',
    product: 'Organic Wildflower Honey',
  },
]

const customerPhotos = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1528823872057-9c018a7a7553?q=80&w=400',
    alt: 'Customer enjoying wine',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400',
    alt: 'Wine bottles display',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=400',
    alt: 'Gift hamper unboxing',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1574200683650-67eb88e79e7c?q=80&w=400',
    alt: 'Cheese and wine pairing',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=400',
    alt: 'Dinner party with products',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?q=80&w=400',
    alt: 'Honey on breakfast table',
  },
]
</script>

<style scoped>
.aspect-square {
  aspect-ratio: 1 / 1;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Carousel Navigation */
.carousel-arrow {
  position: absolute;
  top: 35%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #722F37;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: #722F37;
  color: white;
  box-shadow: 0 6px 16px rgba(114, 47, 55, 0.3);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-arrow-left {
  left: 8px;
}

.carousel-arrow-right {
  right: 8px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(114, 47, 55, 0.2);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  background-color: #722F37;
  width: 24px;
  border-radius: 4px;
}

.carousel-dot:hover:not(.active) {
  background-color: rgba(114, 47, 55, 0.4);
}
</style>
