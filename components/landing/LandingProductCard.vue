<template>
  <div class="product-card group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
    <!-- Product Image -->
    <NuxtLink :to="localePath(`/products/${product.slug}`)" class="block relative aspect-square overflow-hidden bg-gray-100">
      <NuxtImg
        :src="product.image"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        :width="400"
        :height="400"
        format="webp"
        quality="80"
      />

      <!-- Quick Add Badge (Desktop Hover) -->
      <div class="absolute top-4 right-4">
        <button
          @click.prevent="addToCart(product.id)"
          class="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
          :aria-label="`Add ${product.name} to cart`"
        >
          <commonIcon name="lucide:shopping-cart" class="w-5 h-5 text-gray-900" />
        </button>
      </div>
    </NuxtLink>

    <!-- Product Info -->
    <div class="p-6 flex flex-col flex-grow">
      <!-- Benefits Pills -->
      <div class="flex flex-wrap gap-2 mb-3">
        <span
          v-for="benefit in product.benefits.slice(0, 2)"
          :key="benefit"
          class="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full"
        >
          {{ benefit }}
        </span>
      </div>

      <!-- Product Name -->
      <h3 class="text-lg font-semibold mb-2 line-clamp-2 flex-grow">
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:underline"
        >
          {{ product.name }}
        </NuxtLink>
      </h3>

      <!-- Rating -->
      <div class="flex items-center gap-2 mb-3">
        <div class="flex items-center">
          <commonIcon name="lucide:star" class="w-4 h-4 text-amber-400 fill-amber-400" />
          <span class="text-sm font-medium ml-1">{{ product.rating }}</span>
        </div>
        <span class="text-sm text-gray-500">({{ product.reviewCount }})</span>
      </div>

      <!-- Price & CTA -->
      <div class="flex items-center justify-between mt-auto">
        <span class="text-2xl font-bold text-gray-900">
          €{{ product.price.toFixed(2) }}
        </span>
        <NuxtLink
          :to="localePath(`/products/${product.slug}`)"
          class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2"
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
/* Ensure consistent card heights in carousel */
.product-card {
  min-height: 450px;
}

/* Prevent text overflow */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Hover lift effect */
.product-card:hover {
  transform: translateY(-8px);
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
</style>
