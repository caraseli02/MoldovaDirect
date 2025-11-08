<template>
  <section class="py-16 md:py-24 bg-[#FCFAF2]">
    <div class="container mx-auto px-4 md:px-6">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p class="text-xs uppercase tracking-[0.2em] font-medium text-[#722F37] mb-4">
          {{ $t('luxury.showcase.eyebrow') || 'Curated Selection' }}
        </p>

        <h2 class="text-3xl md:text-4xl font-serif font-medium text-[#241405] mb-6">
          {{ $t('luxury.showcase.title') || 'Signature Collections' }}
        </h2>

        <p class="text-base text-[#241405]/70 leading-relaxed">
          {{ $t('luxury.showcase.description') || 'Discover our handpicked selection of premium wines, gourmet delicacies, and luxury gift hampers.' }}
        </p>
      </div>

      <!-- Mobile: Horizontal Carousel -->
      <div class="md:hidden relative">
        <div
          ref="productScrollContainer"
          class="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-6 -mx-4 scrollbar-hide"
          @scroll="onProductScroll"
        >
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="flex-shrink-0 w-[280px] snap-center"
          >
            <!-- To'ak Product Card -->
            <article class="product-card">
              <!-- Product Image -->
              <figure class="product-figure relative mb-4">
                <NuxtLink :to="`/products/${product.slug}`" class="block relative overflow-hidden aspect-[3/4]">
                  <NuxtImg
                    :src="product.image"
                    :alt="product.name"
                    class="product-image w-full h-full object-cover"
                    loading="lazy"
                    @error="handleImageError($event, 'product')"
                  />

                  <!-- Badge -->
                  <div
                    v-if="product.badge"
                    class="absolute top-3 left-3 bg-[#241405] text-[#FCFAF2] text-[10px] font-medium uppercase tracking-wider px-2.5 py-1"
                  >
                    {{ product.badge }}
                  </div>

                  <!-- Hover Overlay -->
                  <div class="product-hover-overlay">
                    <p class="text-sm text-[#FCFAF2] leading-relaxed">{{ product.description }}</p>
                  </div>
                </NuxtLink>

                <!-- Circular Add Button -->
                <div class="link-btn">
                  <button
                    @click="addToCart(product)"
                    class="circle-btn"
                    :aria-label="`Add ${product.name} to cart`"
                  >
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                      <path d="M9.2627 0.765625V17.7656M17.7627 9.26562H0.762695"
                            stroke="#A76C06" stroke-width="0.7"/>
                    </svg>
                  </button>
                </div>
              </figure>

              <!-- Product Info -->
              <div class="product-info">
                <h3 class="product-title text-base font-serif font-normal text-[#241405] mb-2 leading-snug">
                  {{ product.name }}
                </h3>

                <p class="price-wrap text-sm text-[#241405] mb-2">
                  <span v-if="product.originalPrice" class="line-through text-[#241405]/40 mr-2">
                    €{{ product.originalPrice }}
                  </span>
                  <span class="font-medium">€{{ product.price }}</span>
                </p>

                <!-- Star Rating -->
                <div v-if="product.rating" class="rating-wrap mb-2">
                  <span class="rating inline-flex gap-0.5">
                    <span v-for="star in 5" :key="star" class="star">
                      <span class="fill" :style="{ width: getStarFillWidth(star, product.rating.value) }"></span>
                    </span>
                  </span>
                  <span class="rating-label text-[11px] text-[#241405]/60 ml-1">({{ product.rating.count }})</span>
                </div>

                <!-- Subtitle -->
                <div v-if="product.subtitle" class="product-subtitle text-[11px] text-[#241405]/50 uppercase tracking-wide mb-1">
                  {{ product.subtitle }}
                </div>

                <!-- Stock Status -->
                <p v-if="product.stock && product.stock.limited && product.stock.remaining <= 5" class="stock-status text-[11px] text-[#722F37] font-medium">
                  Last stock! {{ product.stock.remaining }} left
                </p>
              </div>
            </article>
          </div>
        </div>

        <!-- Navigation Arrows -->
        <button
          v-if="productCurrentIndex > 0"
          @click="scrollProductCarousel('prev')"
          class="carousel-arrow carousel-arrow-left"
          aria-label="Previous product"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="productCurrentIndex < featuredProducts.length - 1"
          @click="scrollProductCarousel('next')"
          class="carousel-arrow carousel-arrow-right"
          aria-label="Next product"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div class="hidden md:grid grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
        <article
          v-for="product in featuredProducts"
          :key="product.id"
          class="product-card"
        >
          <!-- Product Image -->
          <figure class="product-figure relative mb-4">
            <NuxtLink :to="`/products/${product.slug}`" class="block relative overflow-hidden aspect-[3/4]">
              <NuxtImg
                :src="product.image"
                :alt="product.name"
                class="product-image w-full h-full object-cover"
                loading="lazy"
                @error="handleImageError($event, 'product')"
              />

              <!-- Badge -->
              <div
                v-if="product.badge"
                class="absolute top-3 left-3 bg-[#241405] text-[#FCFAF2] text-[10px] font-medium uppercase tracking-wider px-2.5 py-1"
              >
                {{ product.badge }}
              </div>

              <!-- Hover Overlay -->
              <div class="product-hover-overlay">
                <p class="text-sm text-[#FCFAF2] leading-relaxed">{{ product.description }}</p>
              </div>
            </NuxtLink>

            <!-- Circular Add Button -->
            <div class="link-btn">
              <button
                @click="addToCart(product)"
                class="circle-btn"
                :aria-label="`Add ${product.name} to cart`"
              >
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                  <path d="M9.2627 0.765625V17.7656M17.7627 9.26562H0.762695"
                        stroke="#A76C06" stroke-width="0.7"/>
                </svg>
              </button>
            </div>
          </figure>

          <!-- Product Info -->
          <div class="product-info">
            <h3 class="product-title text-base font-serif font-normal text-[#241405] mb-2 leading-snug">
              {{ product.name }}
            </h3>

            <p class="price-wrap text-sm text-[#241405] mb-2">
              <span v-if="product.originalPrice" class="line-through text-[#241405]/40 mr-2">
                €{{ product.originalPrice }}
              </span>
              <span class="font-medium">€{{ product.price }}</span>
            </p>

            <!-- Star Rating -->
            <div v-if="product.rating" class="rating-wrap mb-2">
              <span class="rating inline-flex gap-0.5">
                <span v-for="star in 5" :key="star" class="star">
                  <span class="fill" :style="{ width: getStarFillWidth(star, product.rating.value) }"></span>
                </span>
              </span>
              <span class="rating-label text-[11px] text-[#241405]/60 ml-1">({{ product.rating.count }})</span>
            </div>

            <!-- Subtitle -->
            <div v-if="product.subtitle" class="product-subtitle text-[11px] text-[#241405]/50 uppercase tracking-wide mb-1">
              {{ product.subtitle }}
            </div>

            <!-- Stock Status -->
            <p v-if="product.stock && product.stock.limited && product.stock.remaining <= 5" class="stock-status text-[11px] text-[#722F37] font-medium">
              Last stock! {{ product.stock.remaining }} left
            </p>
          </div>
        </article>
      </div>

      <!-- CTA Section -->
      <div class="text-center mt-12 md:mt-16">
        <NuxtLink
          to="/products"
          class="inline-block bg-[#241405] text-[#FCFAF2] px-8 py-3.5 text-sm font-medium uppercase tracking-wider hover:bg-[#722F37] transition-colors duration-300"
        >
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

// Calculate star fill width (To'ak style)
const getStarFillWidth = (starIndex: number, rating: number): string => {
  const starValue = starIndex
  if (rating >= starValue) {
    return '100%'
  } else if (rating >= starValue - 1 && rating < starValue) {
    const fraction = rating - (starValue - 1)
    return `${fraction * 100}%`
  } else {
    return '0%'
  }
}

// Add to cart handler
const addToCart = (product: any) => {
  console.log('Add to cart:', product.name)
}

const featuredProducts = [
  {
    id: 1,
    name: 'Premium Moldovan Wine Selection',
    slug: 'premium-wine-selection',
    subtitle: 'Codru Reserve',
    description: 'A curated selection of three award-winning Moldovan wines from the Codru region.',
    price: '89.90',
    originalPrice: null,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
    rating: {
      value: 4.8,
      max: 5,
      count: 47
    },
    stock: null,
  },
  {
    id: 2,
    name: 'Luxury Gourmet Gift Hamper',
    slug: 'luxury-gourmet-hamper',
    subtitle: 'seasonal selection',
    description: 'Artisan cheeses, honey, preserves, and wine - the perfect gift for any occasion.',
    price: '124.90',
    originalPrice: '149.90',
    badge: 'Limited Edition',
    image: 'https://images.unsplash.com/photo-1549888834-3ec93abae044?q=80&w=800',
    rating: {
      value: 4.9,
      max: 5,
      count: 32
    },
    stock: {
      limited: true,
      remaining: 3,
      total: 50,
    },
  },
  {
    id: 3,
    name: 'Organic Wildflower Honey',
    slug: 'organic-wildflower-honey',
    subtitle: 'Moldovan Highlands',
    description: 'Raw, unfiltered honey from the wildflowers of Moldova. Pure and natural.',
    price: '18.90',
    originalPrice: null,
    badge: 'Organic',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784422?q=80&w=800',
    rating: {
      value: 5.0,
      max: 5,
      count: 89
    },
    stock: null,
  },
  {
    id: 4,
    name: 'Artisan Cheese Collection',
    slug: 'artisan-cheese-collection',
    subtitle: 'traditional recipe',
    description: 'Three traditional Moldovan cheeses, aged to perfection by master cheesemakers.',
    price: '42.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=800',
    rating: {
      value: 4.6,
      max: 5,
      count: 28
    },
    stock: null,
  },
  {
    id: 5,
    name: 'Vintage Reserve 2015',
    slug: 'vintage-reserve-2015',
    subtitle: 'Cricova 2015',
    description: 'An exceptional vintage from the historic Cricova cellars. Limited availability.',
    price: '156.00',
    originalPrice: null,
    badge: 'Rare',
    image: 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?q=80&w=800',
    rating: {
      value: 4.7,
      max: 5,
      count: 15
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
    subtitle: 'executive selection',
    description: 'Impress clients and partners with this elegant selection of Moldovan specialties.',
    price: '199.90',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800',
    rating: {
      value: 4.9,
      max: 5,
      count: 21
    },
    stock: null,
  },
]
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Product Card (To'ak Style - Pixel Perfect) */
.product-card {
  transition: transform 0.3s ease;
}

.product-figure {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.04);
}

/* Circular Add Button (To'ak Style) */
.link-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 10;
}

.circle-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #FCFAF2;
  border: 1px solid rgba(167, 108, 6, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.circle-btn:hover {
  background: #A76C06;
  border-color: #A76C06;
  box-shadow: 0 4px 12px rgba(167, 108, 6, 0.25);
  transform: scale(1.05);
}

.circle-btn:hover svg path {
  stroke: #FCFAF2;
}

.circle-btn:active {
  transform: scale(0.98);
}

/* Hover Overlay (To'ak Style) */
.product-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(36, 20, 5, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.product-card:hover .product-hover-overlay {
  opacity: 1;
}

/* Star Rating (To'ak Style) */
.rating-wrap {
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.rating {
  display: inline-flex;
}

.star {
  position: relative;
  width: 13px;
  height: 13px;
  display: inline-block;
}

.star::before {
  content: '★';
  position: absolute;
  color: #E5E7EB;
  font-size: 13px;
  line-height: 1;
}

.star .fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
  white-space: nowrap;
  display: block;
}

.star .fill::before {
  content: '★';
  color: #A76C06;
  font-size: 13px;
  line-height: 1;
}

.rating-label {
  display: inline-block;
  line-height: 1;
}

/* Product Title (To'ak Style) */
.product-title {
  transition: color 0.2s ease;
  font-family: 'Playfair Display', Georgia, serif;
}

.product-card:hover .product-title {
  color: #722F37;
}

/* Carousel Navigation */
.carousel-arrow {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(114, 47, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #722F37;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.carousel-arrow:hover {
  background: rgba(114, 47, 55, 0.95);
  color: white;
  box-shadow: 0 4px 12px rgba(114, 47, 55, 0.2);
  transform: translateY(-50%) scale(1.05);
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(114, 47, 55, 0.25);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-dot.active {
  background-color: #722F37;
  width: 24px;
  border-radius: 3px;
}

.carousel-dot:hover:not(.active) {
  background-color: rgba(114, 47, 55, 0.5);
  transform: scale(1.2);
}
</style>
