<template>
  <div
    v-if="pending"
    class="py-12"
  >
    <div class="container">
      <div class="animate-pulse space-y-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-4">
            <div class="aspect-square rounded-3xl bg-gray-200"></div>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="n in 4"
                :key="n"
                class="aspect-square rounded-xl bg-gray-200"
              ></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-6 w-32 rounded bg-gray-200"></div>
            <div class="h-10 w-3/4 rounded bg-gray-200"></div>
            <div class="h-20 rounded bg-gray-200"></div>
            <div class="h-12 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    class="py-12"
  >
    <div class="container text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
        {{ $t('products.notFound') }}
      </h1>
      <p class="mb-8 text-gray-600 dark:text-gray-400">
        {{ $t('products.notFoundDescription') }}
      </p>
      <nuxt-link
        to="/products"
        class="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        {{ $t('products.backToProducts') }}
      </nuxt-link>
    </div>
  </div>

  <div
    v-else-if="product"
    class="py-8 lg:py-12 pb-32 lg:pb-12"
  >
    <div class="container space-y-12">
      <nav class="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400">
        <nuxt-link
          :to="localePath('/')"
          class="transition hover:text-gray-900 dark:hover:text-gray-200"
        >{{ $t('common.home') }}</nuxt-link>
        <span class="mx-2">/</span>
        <nuxt-link
          :to="localePath('/products')"
          class="transition hover:text-gray-900 dark:hover:text-gray-200"
        >{{ $t('common.shop') }}</nuxt-link>
        <template v-if="product.category?.breadcrumb?.length">
          <span class="mx-2">/</span>
          <template
            v-for="(crumb, index) in product.category.breadcrumb"
            :key="`crumb-${crumb.id}`"
          >
            <nuxt-link
              :to="localePath(`/products?category=${crumb.slug}`)"
              class="transition hover:text-gray-900 dark:hover:text-gray-200"
            >
              {{ crumb.name }}
            </nuxt-link>
            <span
              v-if="index < product.category.breadcrumb.length - 1"
              class="mx-2"
            >/</span>
          </template>
        </template>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ getLocalizedText(product.name as Record<string, string>) }}</span>
      </nav>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="space-y-10">
          <section class="space-y-6">
            <ProductDetailGallery
              v-model="selectedImageIndex"
              :images="product.images || []"
              :selected-image="selectedImage"
              :price="product.price"
              :compare-price="product.comparePrice"
              :is-featured="product.isFeatured"
              :product-name="getLocalizedText(product.name as Record<string, string>)"
              @open-zoom="openZoomModal"
            />
          </section>

          <ProductDetailInfo
            :product-name="getLocalizedText(product.name as Record<string, string>)"
            :short-description="getLocalizedText(product.shortDescription as Record<string, string>)"
            :price="product.price"
            :compare-price="product.comparePrice"
            :story-title="sectionTitles.story"
            :producer="storytelling.producer"
            :tasting-notes="tastingNotes"
            :pairing-ideas="pairingIdeas"
            :awards="awards"
            :origin-story="originStory"
          />

          <ProductDetailReviews :review-summary="reviewSummary" />

          <ProductDetailSpecifications
            :origin="product.origin"
            :volume="product.volume"
            :alcohol-content="product.alcoholContent"
            :weight-kg="product.weightKg"
            :sku="product.sku"
            :tags="product.tags"
          />

          <ProductDetailSustainability :sustainability-badges="sustainabilityBadges" />

          <ProductDetailFAQ :faq-items="faqItems" />
        </div>

        <aside class="space-y-6 lg:sticky lg:top-24">
          <ProductDetailAddToCartCard
            v-model:selected-quantity="selectedQuantity"
            :category-label="categoryLabel"
            :product-name="getLocalizedText(product.name as Record<string, string>)"
            :price="product.price"
            :compare-price="product.comparePrice"
            :stock-status-class="stockStatusClass"
            :stock-status-text="stockStatusText"
            :estimated-delivery="estimatedDelivery"
            :stock-urgency-message="stockUrgencyMessage"
            :stock-quantity="stockQuantity"
            :cart-loading="cartLoading"
            :is-product-in-cart="isProductInCart"
            :share-feedback="shareFeedback"
            @add-to-cart="addToCart"
            @share="shareProduct"
          />

          <ProductDetailTrustBadges :trust-promises="trustPromises" />

          <ProductDetailBundle :bundle-items="bundleItems" />
        </aside>
      </div>

      <ProductDetailRelated
        :related-products="relatedProducts"
        :title="sectionTitles.related"
        :subtitle="sectionTitles.relatedSubtitle"
      />

      <section
        v-if="getLocalizedText(product.description as Record<string, string>)"
        class="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ $t('products.description') }}
        </h2>
        <div class="prose prose-lg max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
          <div class="prose prose-lg max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
            <p class="whitespace-pre-line">
              {{ getLocalizedText(product.description as Record<string, string>) }}
            </p>
          </div>
        </div>
      </section>

      <ProductDetailMobileStickyBar
        v-model:selected-quantity="selectedQuantity"
        :product-name="getLocalizedText(product.name as Record<string, string>)"
        :price="product.price"
        :stock-quantity="stockQuantity"
        :cart-loading="cartLoading"
        :is-product-in-cart="isProductInCart"
        @add-to-cart="addToCart"
      />

      <!-- Image Zoom Modal -->
      <ProductImageZoomModal
        v-if="product?.images?.length"
        :is-open="showZoomModal"
        :image-url="selectedImage?.url || ''"
        :image-name="getLocalizedText(selectedImage?.altText as Record<string, string> | null | undefined) || getLocalizedText(product?.name as Record<string, string> | null | undefined)"
        :current-index="selectedImageIndex"
        :total-images="product.images.length"
        @update:is-open="showZoomModal = $event"
        @previous="handlePreviousImage"
        @next="handleNextImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import type { ProductWithRelations, Translations } from '~/types/database'
import { useProductUtils } from '~/composables/useProductUtils'
import { useProductStory } from '~/composables/useProductStory'
import { useProductDetailSEO } from '~/composables/useProductDetailSEO'
import { useProductStockStatus } from '~/composables/useProductStockStatus'
import { useProductDetail } from '~/composables/useProductDetail'
import { useCart } from '~/composables/useCart'
import { useToast } from '~/composables/useToast'

const { t } = useI18n()

// Extended types for API response
interface BreadcrumbItem {
  id: number
  slug: string
  name: string
}

interface CategoryWithBreadcrumb {
  id: number
  slug: string
  name: string
  description?: string
  nameTranslations: Translations
  breadcrumb?: BreadcrumbItem[]
}

interface ProductDetailResponse extends Omit<ProductWithRelations, 'category'> {
  category: CategoryWithBreadcrumb
  relatedProducts?: ProductWithRelations[]
  attributes?: Record<string, any>
}

const route = useRoute()
const slug = route.params.slug as string
const localePath = useLocalePath()

const { data: productData, pending, error } = await useLazyFetch<ProductDetailResponse>(`/api/products/${slug}`)

// API returns ProductDetailResponse directly - convert to ProductWithRelations
const product = computed(() => (productData.value || null) as unknown as ProductWithRelations | null)

// Use composable
const {
  selectedImageIndex,
  selectedQuantity,
  shareFeedback,
  showZoomModal,
  selectedImage,
  stockQuantity,
  isProductInCart,
  categoryLabel,
  relatedProducts,
  bundleItems,
  trustPromises,
  faqItems,
  shareProduct,
  openZoomModal,
  handlePreviousImage,
  handleNextImage,
  addToCart,
} = useProductDetail(product)

// Use existing composables for specific logic
const { getLocalizedText } = useProductUtils()
const { loading: cartLoading } = useCart()

// Computed properties for composables
const productAttributes = computed(() => product.value?.attributes || {})

// Stock status composable
const {
  stockStatusClass,
  stockStatusText,
  estimatedDelivery,
  stockUrgencyMessage,
} = useProductStockStatus(stockQuantity)

// Product story composable
const {
  storytelling,
  tastingNotes,
  pairingIdeas,
  awards,
  originStory,
  reviewSummary,
  sustainabilityBadges,
  sectionTitles,
} = useProductStory(product)

// SEO composable
const config = useRuntimeConfig()
const seoOptions = computed(() => ({
  productUrl: `${config.public.siteUrl}${route.path}`,
  rating: reviewSummary.value
    ? { rating: reviewSummary.value.rating, count: reviewSummary.value.count }
    : undefined,
  brand: (productAttributes.value?.brand as string | undefined)
    || (productAttributes.value?.producer as string | undefined)
    || categoryLabel.value,
}))

const { structuredData, metaTags, pageTitle } = useProductDetailSEO(product, seoOptions)

// Update page metadata
watch(product, (newProduct) => {
  if (newProduct && structuredData.value) {
    useHead({
      title: pageTitle.value,
      meta: metaTags.value,
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(structuredData.value),
        },
      ],
    })
  }
}, { immediate: true })

// Handle 404 errors
if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
  })
}
</script>
