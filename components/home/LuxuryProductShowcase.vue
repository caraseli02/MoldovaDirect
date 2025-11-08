<template>
  <section class="luxury-section bg-[#FCFAF2]">
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
            <!-- To'ak Style Product Card -->
            <div class="product-card bg-white overflow-hidden h-full flex flex-col">
              <!-- Product Image with Circular Add Button (To'ak Style) -->
              <figure class="product-figure relative">
                <NuxtLink :to="`/products/${product.slug}`" class="block relative overflow-hidden">
                  <NuxtImg
                    :src="product.image"
                    :alt="product.name"
                    class="product-image w-full h-64 object-cover"
                    loading="lazy"
                    @error="handleImageError($event, 'product')"
                  />

                  <!-- Badge (To'ak Style) -->
                  <div
                    v-if="product.badge"
                    class="absolute top-4 left-4 bg-[#241405] text-[#FCFAF2] text-xs font-medium uppercase tracking-wider px-3 py-1.5"
                  >
                    {{ product.badge }}
                  </div>

                  <!-- Hover Overlay with Description -->
                  <div class="product-hover-overlay">
                    <p class="text-sm text-[#FCFAF2]">{{ product.description }}</p>
                  </div>
                </NuxtLink>

                <!-- Circular Add to Cart Button (To'ak Style) -->
                <div class="link-btn">
                  <button
                    @click="addToCart(product)"
                    class="circle-btn"
                    :aria-label="`Add ${product.name} to cart`"
                  >
                    <span class="icon">
                      <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                        <path d="M9.2627 0.765625V17.7656M17.7627 9.26562H0.762695"
                              stroke="#A76C06" stroke-width="0.7"/>
                      </svg>
                    </span>
                  </button>
                </div>
              </figure>

              <!-- Product Info (To'ak Style) -->
              <div class="p-5 flex-1 flex flex-col text-start">
                <h3 class="product-title font-serif text-lg font-medium text-[#241405] mb-2">
                  {{ product.name }}
                </h3>

                <p class="price-wrap text-[#241405] text-base font-medium mb-3">
                  <span v-if="product.originalPrice" class="line-through text-[#241405]/50 text-sm mr-2">
                    €{{ product.originalPrice }}
                  </span>
                  €{{ product.price }}
                </p>

                <!-- Star Rating (To'ak Style) -->
                <a v-if="product.rating" class="rating-wrap mb-2" :data-val="product.rating.value" :data-of="product.rating.max">
                  <span class="rating">
                    <span v-for="star in 5" :key="star" class="star">
                      <span class="fill" :style="{ width: getStarFillWidth(star, product.rating.value) }"></span>
                    </span>
                  </span>
                  <span class="rating-label text-xs text-[#241405]/70 ml-1">({{ product.rating.count }})</span>
                </a>

                <!-- Category Subtitle (To'ak Style - like "65% cacao") -->
                <div v-if="product.subtitle" class="product-subtitle text-xs text-[#241405]/60 uppercase tracking-wide mb-2">
                  {{ product.subtitle }}
                </div>

                <!-- Stock Status (To'ak Style) -->
                <p v-if="product.stock" class="stock-status text-xs text-[#241405]/70">
                  <span v-if="product.stock.limited && product.stock.remaining <= 5" class="text-[#722F37] font-medium">
                    Last stock! {{ product.stock.remaining }} left
                  </span>
                  <span v-else-if="product.stock.limited">
                    {{ product.stock.remaining }} in stock
                  </span>
                </p>
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

      <!-- Desktop: Product Grid (To'ak Style) -->
      <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
        <div
          v-for="(product, index) in featuredProducts"
          :key="product.id"
          v-motion
          :initial="{ opacity: 0, y: 40 }"
          :visible="{ opacity: 1, y: 0, transition: { delay: index * 100 + 300, duration: 600 } }"
          class="product-card bg-white overflow-hidden"
        >
          <!-- Product Image with Circular Add Button (To'ak Style) -->
          <figure class="product-figure relative">
            <NuxtLink :to="`/products/${product.slug}`" class="block relative overflow-hidden">
              <NuxtImg
                :src="product.image"
                :alt="product.name"
                class="product-image w-full h-80 object-cover"
                loading="lazy"
                @error="handleImageError($event, 'product')"
              />

              <!-- Badge (To'ak Style) -->
              <div
                v-if="product.badge"
                class="absolute top-4 left-4 bg-[#241405] text-[#FCFAF2] text-xs font-medium uppercase tracking-wider px-3 py-1.5"
              >
                {{ product.badge }}
              </div>

              <!-- Hover Overlay with Description -->
              <div class="product-hover-overlay">
                <p class="text-sm text-[#FCFAF2]">{{ product.description }}</p>
              </div>
            </NuxtLink>

            <!-- Circular Add to Cart Button (To'ak Style) -->
            <div class="link-btn">
              <button
                @click="addToCart(product)"
                class="circle-btn"
                :aria-label="`Add ${product.name} to cart`"
              >
                <span class="icon">
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                    <path d="M9.2627 0.765625V17.7656M17.7627 9.26562H0.762695"
                          stroke="#A76C06" stroke-width="0.7"/>
                  </svg>
                </span>
              </button>
            </div>
          </figure>

          <!-- Product Info (To'ak Style) -->
          <div class="p-6 text-start">
            <h3 class="product-title font-serif text-xl font-medium text-[#241405] mb-2">
              {{ product.name }}
            </h3>

            <p class="price-wrap text-[#241405] text-lg font-medium mb-3">
              <span v-if="product.originalPrice" class="line-through text-[#241405]/50 text-sm mr-2">
                €{{ product.originalPrice }}
              </span>
              €{{ product.price }}
            </p>

            <!-- Star Rating (To'ak Style) -->
            <a v-if="product.rating" class="rating-wrap mb-2" :data-val="product.rating.value" :data-of="product.rating.max">
              <span class="rating">
                <span v-for="star in 5" :key="star" class="star">
                  <span class="fill" :style="{ width: getStarFillWidth(star, product.rating.value) }"></span>
                </span>
              </span>
              <span class="rating-label text-xs text-[#241405]/70 ml-1">({{ product.rating.count }})</span>
            </a>

            <!-- Category Subtitle (To'ak Style - like "65% cacao") -->
            <div v-if="product.subtitle" class="product-subtitle text-xs text-[#241405]/60 uppercase tracking-wide mb-2">
              {{ product.subtitle }}
            </div>

            <!-- Stock Status (To'ak Style) -->
            <p v-if="product.stock" class="stock-status text-xs text-[#241405]/70 mt-2">
              <span v-if="product.stock.limited && product.stock.remaining <= 5" class="text-[#722F37] font-medium">
                Last stock! {{ product.stock.remaining }} left
              </span>
              <span v-else-if="product.stock.limited">
                {{ product.stock.remaining }} in stock
              </span>
            </p>
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

// Calculate star fill width based on rating (To'ak style)
const getStarFillWidth = (starIndex: number, rating: number): string => {
  const starValue = starIndex
  if (rating >= starValue) {
    return '100%'
  } else if (rating >= starValue - 1 && rating < starValue) {
    // Partial fill for fractional ratings
    const fraction = rating - (starValue - 1)
    return `${fraction * 100}%`
  } else {
    return '0%'
  }
}

// Add to cart handler
const addToCart = (product: any) => {
  // TODO: Implement cart functionality
  console.log('Add to cart:', product.name)
  // You can implement cart logic here or emit an event
}

const featuredProducts = [
  {
    id: 1,
    name: 'Premium Moldovan Wine Selection',
    slug: 'premium-wine-selection',
    category: 'Wine Collection',
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
    category: 'Gift Hampers',
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
    category: 'Gourmet Foods',
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
    category: 'Gourmet Foods',
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
    category: 'Premium Wines',
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
    category: 'Gift Hampers',
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

/* To'ak Style Product Card */
.product-card {
  transition: all 0.3s ease;
}

.product-figure {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* Circular Add to Cart Button (To'ak Style) */
.link-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 10;
}

.circle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FCFAF2;
  border: 1px solid rgba(167, 108, 6, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.circle-btn:hover {
  background: #A76C06;
  border-color: #A76C06;
  box-shadow: 0 4px 16px rgba(167, 108, 6, 0.3);
  transform: scale(1.08);
}

.circle-btn:hover svg path {
  stroke: #FCFAF2;
}

.circle-btn:active {
  transform: scale(0.96);
}

/* Hover Overlay (To'ak Style) */
.product-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(36, 20, 5, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.product-card:hover .product-hover-overlay {
  opacity: 1;
}

/* Star Rating (To'ak Style) */
.rating-wrap {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
}

.rating {
  display: inline-flex;
  gap: 2px;
}

.star {
  position: relative;
  width: 14px;
  height: 14px;
  display: inline-block;
}

.star::before {
  content: '★';
  position: absolute;
  color: #E5E7EB;
  font-size: 14px;
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
  font-size: 14px;
  line-height: 1;
}

.rating-label {
  display: inline-block;
}

/* Product Title (To'ak Style) */
.product-title {
  line-height: 1.4;
  transition: color 0.2s ease;
}

.product-card:hover .product-title {
  color: #722F37;
}

/* Price Wrap (To'ak Style) */
.price-wrap {
  line-height: 1.4;
}

/* Product Subtitle (To'ak Style - like "65% cacao") */
.product-subtitle {
  font-weight: 500;
  letter-spacing: 0.05em;
}

/* Stock Status (To'ak Style) */
.stock-status {
  font-weight: 500;
}

/* Carousel Navigation */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
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
  transition: all 0.25s ease;
  z-index: 10;
  opacity: 0.9;
}

.carousel-arrow:hover {
  background: rgba(114, 47, 55, 0.98);
  color: white;
  box-shadow: 0 4px 12px rgba(114, 47, 55, 0.25);
  opacity: 1;
  transform: translateY(-50%) scale(1.05);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.98);
}

.carousel-arrow-left {
  left: -24px;
}

.carousel-arrow-right {
  right: -24px;
}

/* Show arrows inside on mobile */
@media (max-width: 768px) {
  .carousel-arrow-left {
    left: 12px;
  }

  .carousel-arrow-right {
    right: 12px;
  }
}

.carousel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: rgba(114, 47, 55, 0.25);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-dot.active {
  background-color: #722F37;
  width: 28px;
  border-radius: 3px;
  transform: scale(1);
}

.carousel-dot:hover:not(.active) {
  background-color: rgba(114, 47, 55, 0.5);
  transform: scale(1.3);
}
</style>
