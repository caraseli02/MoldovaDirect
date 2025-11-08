<template>
  <section class="luxury-section bg-luxury-cream">
    <div class="luxury-container">
      <!-- Section Header -->
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-16">
        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0 }"
          class="luxury-eyebrow"
        >
          {{ $t('luxury.showcase.eyebrow') || 'Curated Selection' }}
        </p>

        <h2
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="luxury-title"
        >
          {{ $t('luxury.showcase.title') || 'Signature Collections' }}
        </h2>

        <div class="luxury-divider mx-auto" />

        <p
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: 200 } }"
          class="luxury-description mx-auto px-4 sm:px-0"
        >
          {{ $t('luxury.showcase.description') || 'Discover our handpicked selection of premium wines, gourmet delicacies, and luxury gift hampers.' }}
        </p>
      </div>

      <!-- Mobile: Horizontal Carousel with Navigation -->
      <div class="md:hidden mb-8 relative">
        <div
          ref="productScrollContainer"
          class="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 -mx-4 scrollbar-hide"
          @scroll="onProductScroll"
        >
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="flex-shrink-0 w-[85vw] max-w-[340px] snap-center"
          >
            <div class="bg-white rounded-sm overflow-hidden shadow-lg h-full flex flex-col">
              <!-- Product Image -->
              <div class="luxury-image-wrapper relative overflow-hidden">
                <NuxtImg
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-64 object-cover"
                  loading="lazy"
                  @error="handleImageError($event, 'product')"
                />

                <!-- Badge -->
                <div
                  v-if="product.badge"
                  class="absolute top-4 right-4 bg-luxury-black text-luxury-cream text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                >
                  {{ product.badge }}
                </div>

                <div class="luxury-image-overlay" />
              </div>

              <!-- Product Info -->
              <div class="p-5 flex-1 flex flex-col">
                <div class="text-xs uppercase tracking-wider text-luxury-black mb-2 font-semibold">
                  {{ product.category }}
                </div>

                <h3 class="font-serif text-lg font-semibold text-luxury-wine-red mb-2">
                  {{ product.name }}
                </h3>

                <p class="text-luxury-brown/70 text-sm mb-4 line-clamp-2 flex-1">
                  {{ product.description }}
                </p>

                <!-- Price -->
                <div class="flex items-baseline gap-2 mb-4">
                  <span class="text-2xl font-serif font-bold text-luxury-wine-red">
                    €{{ product.price }}
                  </span>
                  <span v-if="product.originalPrice" class="text-luxury-brown/50 line-through text-sm">
                    €{{ product.originalPrice }}
                  </span>
                </div>

                <!-- CTA -->
                <NuxtLink
                  :to="`/products/${product.slug}`"
                  class="w-full inline-block text-center py-3 border-2 border-luxury-wine-red text-luxury-wine-red font-semibold uppercase tracking-wider text-sm hover:bg-luxury-wine-red hover:text-white transition-all duration-300"
                >
                  {{ $t('luxury.showcase.view_details') || 'View Details' }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="productCurrentIndex > 0"
          @click="scrollProductCarousel('prev')"
          class="carousel-arrow carousel-arrow-left"
          aria-label="Previous product"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="productCurrentIndex < featuredProducts.length - 1"
          @click="scrollProductCarousel('next')"
          class="carousel-arrow carousel-arrow-right"
          aria-label="Next product"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Dot Indicators -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(product, index) in featuredProducts"
            :key="`dot-${product.id}`"
            @click="scrollProductToIndex(index)"
            class="carousel-dot"
            :class="{ active: productCurrentIndex === index }"
            :aria-label="`Go to product ${index + 1}`"
          />
        </div>
      </div>

      <!-- Desktop: Product Grid -->
      <div class="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
        <div
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: index * 100 + 300, duration: 600 } }"
          class="bg-white rounded-sm overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
        >
          <!-- Product Image -->
          <div class="luxury-image-wrapper relative overflow-hidden">
            <NuxtImg
              :src="product.image"
              :alt="product.name"
              class="w-full h-80 object-cover transform transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              @error="handleImageError($event, 'product')"
            />

            <!-- Badge -->
            <div
              v-if="product.badge"
              class="absolute top-4 right-4 bg-luxury-black text-luxury-dark-chocolate text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
            >
              {{ product.badge }}
            </div>

            <div class="luxury-image-overlay" />

            <!-- Quick View on Hover -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <NuxtLink
                :to="`/products/${product.slug}`"
                class="luxury-btn text-sm px-6 py-2"
              >
                {{ $t('luxury.showcase.quick_view') || 'View Details' }}
              </NuxtLink>
            </div>
          </div>

          <!-- Product Info -->
          <div class="p-6">
            <div class="text-xs uppercase tracking-wider text-luxury-black mb-2 font-semibold">
              {{ product.category }}
            </div>

            <h3 class="font-serif text-xl font-semibold text-luxury-wine-red mb-2">
              {{ product.name }}
            </h3>

            <p class="text-luxury-brown/70 text-sm mb-4 line-clamp-2">
              {{ product.description }}
            </p>

            <!-- Provenance Details -->
            <div v-if="product.provenance" class="flex items-center gap-4 mb-4 text-xs text-luxury-brown/60">
              <div v-if="product.provenance.region" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="uppercase tracking-wider">{{ product.provenance.region }}</span>
              </div>
              <div v-if="product.provenance.vintage" class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="uppercase tracking-wider">{{ product.provenance.vintage }}</span>
              </div>
            </div>

            <!-- Scarcity Signal -->
            <div v-if="product.stock" class="mb-4">
              <div v-if="product.stock.limited" class="flex items-center gap-2 text-xs">
                <div class="flex-1 bg-luxury-cream rounded-full h-1.5 overflow-hidden">
                  <div
                    class="h-full bg-luxury-wine-red transition-all duration-500"
                    :style="{ width: `${(product.stock.remaining / product.stock.total) * 100}%` }"
                  />
                </div>
                <span class="text-luxury-wine-red font-semibold whitespace-nowrap">
                  {{ product.stock.remaining }} {{ $t('luxury.showcase.left') || 'left' }}
                </span>
              </div>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-2 mb-4">
              <span class="text-2xl font-serif font-bold text-luxury-wine-red">
                €{{ product.price }}
              </span>
              <span v-if="product.originalPrice" class="text-luxury-brown/50 line-through text-sm">
                €{{ product.originalPrice }}
              </span>
            </div>

            <!-- CTA -->
            <NuxtLink
              :to="`/products/${product.slug}`"
              class="w-full inline-block text-center py-3 border-2 border-luxury-wine-red text-luxury-wine-red font-semibold uppercase tracking-wider text-sm hover:bg-luxury-wine-red hover:text-white transition-all duration-300"
            >
              {{ $t('luxury.showcase.add_to_cart') || 'Add to Cart' }}
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="text-center">
        <NuxtLink to="/products" class="luxury-btn luxury-btn-dark">
          {{ $t('luxury.showcase.cta') || 'Explore Full Collection' }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { handleImageError } = useImageFallback()

// Product carousel state
const productScrollContainer = ref<HTMLElement | null>(null)
const productCurrentIndex = ref(0)

const onProductScroll = () => {
  if (!productScrollContainer.value) return

  const container = productScrollContainer.value
  const scrollLeft = container.scrollLeft
  const itemWidth = container.scrollWidth / featuredProducts.length

  productCurrentIndex.value = Math.round(scrollLeft / itemWidth)
}

const scrollProductCarousel = (direction: 'prev' | 'next') => {
  if (!productScrollContainer.value) return

  const container = productScrollContainer.value
  const itemWidth = container.scrollWidth / featuredProducts.length
  const newIndex = direction === 'next'
    ? Math.min(productCurrentIndex.value + 1, featuredProducts.length - 1)
    : Math.max(productCurrentIndex.value - 1, 0)

  container.scrollTo({
    left: itemWidth * newIndex,
    behavior: 'smooth'
  })
}

const scrollProductToIndex = (index: number) => {
  if (!productScrollContainer.value) return

  const container = productScrollContainer.value
  const itemWidth = container.scrollWidth / featuredProducts.length

  container.scrollTo({
    left: itemWidth * index,
    behavior: 'smooth'
  })
}

const featuredProducts = [
  {
    id: 1,
    name: 'Premium Moldovan Wine Selection',
    slug: 'premium-wine-selection',
    category: 'Wine Collection',
    description: 'A curated selection of three award-winning Moldovan wines from the Codru region.',
    price: '89.90',
    originalPrice: null,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
    provenance: {
      region: 'Codru Region',
      vintage: null,
    },
    stock: null,
  },
  {
    id: 2,
    name: 'Luxury Gourmet Gift Hamper',
    slug: 'luxury-gourmet-hamper',
    category: 'Gift Hampers',
    description: 'Artisan cheeses, honey, preserves, and wine - the perfect gift for any occasion.',
    price: '124.90',
    originalPrice: '149.90',
    badge: 'Limited Edition',
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=800',
    provenance: null,
    stock: {
      limited: true,
      remaining: 8,
      total: 50,
    },
  },
  {
    id: 3,
    name: 'Organic Wildflower Honey',
    slug: 'organic-wildflower-honey',
    category: 'Gourmet Foods',
    description: 'Raw, unfiltered honey from the wildflowers of Moldova. Pure and natural.',
    price: '18.90',
    originalPrice: null,
    badge: 'Organic',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?q=80&w=800',
    provenance: {
      region: 'Moldovan Highlands',
      vintage: null,
    },
    stock: null,
  },
  {
    id: 4,
    name: 'Artisan Cheese Collection',
    slug: 'artisan-cheese-collection',
    category: 'Gourmet Foods',
    description: 'Three traditional Moldovan cheeses, aged to perfection by master cheesemakers.',
    price: '42.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=800',
    provenance: {
      region: 'Orheiul Vechi',
      vintage: null,
    },
    stock: null,
  },
  {
    id: 5,
    name: 'Vintage Reserve 2015',
    slug: 'vintage-reserve-2015',
    category: 'Premium Wines',
    description: 'An exceptional vintage from the historic Cricova cellars. Limited availability.',
    price: '156.00',
    originalPrice: null,
    badge: 'Rare',
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=800',
    provenance: {
      region: 'Cricova',
      vintage: '2015',
    },
    stock: {
      limited: true,
      remaining: 3,
      total: 12,
    },
  },
  {
    id: 6,
    name: 'Corporate Gift Collection',
    slug: 'corporate-gift-collection',
    category: 'Gift Hampers',
    description: 'Impress clients and partners with this elegant selection of Moldovan specialties.',
    price: '199.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
    provenance: null,
    stock: null,
  },
]
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  top: 40%;
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
