<template>
  <div class="product-card group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-900 hover:shadow-lg active:scale-[0.99]">
    <!-- Product Image -->
    <NuxtLink :to="localePath(`/products/${product.slug}`)" class="relative block aspect-square overflow-hidden bg-gray-100 active:opacity-95">
      <NuxtImg
        :src="product.image"
        :alt="typeof product.name === 'string' ? product.name : product.name?.en || 'Product image'"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        loading="lazy"
        :width="400"
        :height="400"
        format="webp"
        quality="80"
        sizes="xs:340px sm:300px md:220px lg:280px xl:320px"
        :style="{ aspectRatio: '1/1' }"
      />

      <!-- Quick Add Badge (Desktop Hover, Mobile Always Visible) -->
      <div class="absolute right-3 top-3 sm:right-4 sm:top-4">
        <button
          type="button"
          @click.prevent="addToCart(product.id)"
          class="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-150 active:scale-95 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:opacity-0 sm:group-hover:opacity-100"
          :aria-label="`Add ${product.name} to cart`"
        >
          <commonIcon name="lucide:shopping-cart" class="h-5 w-5 text-gray-900" />
        </button>
      </div>
    </NuxtLink>

    <!-- Product Info -->
    <div class="flex flex-grow flex-col bg-white p-4 sm:p-5 md:p-6">
      <!-- Benefits Pills -->
      <div v-if="product.benefits && product.benefits.length > 0" class="mb-2.5 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
        <span
          v-for="benefit in product.benefits.slice(0, 2)"
          :key="benefit"
          class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:px-2.5 sm:py-1"
        >
          {{ benefit }}
        </span>
      </div>

      <!-- Product Name -->
      <h3 class="mb-2 flex-grow text-center text-base font-semibold leading-snug text-gray-900 line-clamp-2 sm:text-lg">
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="transition-colors hover:text-rose-600 focus-visible:underline focus-visible:outline-none"
        >
          {{ typeof product.name === 'string' ? product.name : product.name?.en || product.name }}
        </NuxtLink>
      </h3>

      <!-- Rating -->
      <div class="mb-3 flex items-center gap-1.5 sm:gap-2">
        <div class="flex items-center">
          <commonIcon name="lucide:star" class="h-3.5 w-3.5 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />
          <span class="ml-1 text-xs font-medium sm:text-sm">{{ product.rating }}</span>
        </div>
        <span class="text-xs text-gray-500 sm:text-sm">({{ product.reviewCount }})</span>
      </div>

      <!-- Price & CTA -->
      <div class="mt-auto flex items-center justify-between gap-2">
        <span class="text-xl font-bold text-gray-900 sm:text-2xl">
          €{{ product.price.toFixed(2) }}
        </span>
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="inline-flex min-h-[48px] items-center rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 active:scale-95 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:px-5"
        >
          {{ t('landing.products.shopNow') }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: string
  name: string
  slug: string
  price: number
  image: string
  benefits: string[]
  rating: number
  reviewCount: number
}

interface Props {
  product: Product
}

defineProps<Props>()

const { t } = useI18n()
const localePath = useLocalePath()

const addToCart = (productId: string) => {
  // TODO: Integrate with cart store
  console.log('Add to cart:', productId)
  // Example: useCartStore().addItem(productId, 1)
}
</script>

<style scoped>
/* Ensure consistent card heights - mobile-first approach */
.product-card {
  min-height: 380px;
}

@media (min-width: 640px) {
  .product-card {
    min-height: 420px;
  }
}

@media (min-width: 1024px) {
  .product-card {
    min-height: 450px;
  }
}

/* Prevent text overflow */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover lift effect - subtle like Olipop */
@media (min-width: 768px) {
  .product-card:hover {
    transform: translateY(-4px);
  }
}

/* Focus states for accessibility */
.product-card a:focus-visible {
  outline: 2px solid #e11d48;
  outline-offset: 2px;
}

/* Smooth transitions */
.product-card * {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ensure touch targets are large enough on mobile */
.product-card button,
.product-card a {
  min-height: 44px;
  min-width: 44px;
}
</style>
