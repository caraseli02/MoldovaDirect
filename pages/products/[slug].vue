<template>
  <div v-if="pending" class="py-12">
    <div class="container">
      <div class="animate-pulse space-y-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-4">
            <div class="aspect-square rounded-3xl bg-gray-200"></div>
            <div class="grid grid-cols-4 gap-3">
              <div v-for="n in 4" :key="n" class="aspect-square rounded-xl bg-gray-200"></div>
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

  <div v-else-if="error" class="py-12">
    <div class="container text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">{{ $t('products.notFound') }}</h1>
      <p class="mb-8 text-gray-600 dark:text-gray-400">{{ $t('products.notFoundDescription') }}</p>
      <nuxt-link
        to="/products"
        class="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        {{ $t('products.backToProducts') }}
      </nuxt-link>
    </div>
  </div>

  <div v-else-if="product" class="py-8 lg:py-12">
    <div class="container space-y-12">
      <nav class="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
        <nuxt-link to="/" class="transition hover:text-gray-900 dark:hover:text-gray-200">{{ $t('common.home') }}</nuxt-link>
        <span class="mx-2">/</span>
        <nuxt-link to="/products" class="transition hover:text-gray-900 dark:hover:text-gray-200">{{ $t('common.shop') }}</nuxt-link>
        <template v-if="product.category?.breadcrumb?.length">
          <span class="mx-2">/</span>
          <template v-for="(crumb, index) in product.category.breadcrumb" :key="`crumb-${crumb.id}`">
            <nuxt-link
              :to="`/products?category=${crumb.slug}`"
              class="transition hover:text-gray-900 dark:hover:text-gray-200"
            >
              {{ crumb.name }}
            </nuxt-link>
            <span v-if="index < product.category.breadcrumb.length - 1" class="mx-2">/</span>
          </template>
        </template>
        <span class="mx-2">/</span>
        <span class="text-gray-900 dark:text-white">{{ getLocalizedText(product.name) }}</span>
      </nav>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="space-y-10">
          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <div class="relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-gray-800">
                  <img
                    v-if="selectedImage"
                    :src="selectedImage.url"
                    :alt="getLocalizedText(selectedImage.altText) || getLocalizedText(product.name)"
                    class="h-full w-full object-cover"
                  />
                  <div v-else class="flex h-full min-h-[360px] items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div v-if="product.isFeatured" class="absolute left-4 top-4">
                    <span class="rounded-full bg-yellow-500 px-3 py-1 text-sm font-semibold text-white">
                      {{ $t('products.featured') }}
                    </span>
                  </div>
                  <div v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="absolute right-4 top-4">
                    <span class="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
                      {{ $t('products.sale') }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <UiButton
                  v-for="(image, index) in product.images"
                  :key="image.id || index"
                  type="button"
                  variant="outline"
                  class="flex w-full items-center justify-start gap-3 rounded-2xl px-3 py-2 text-left transition hover:border-blue-500 hover:bg-blue-50 dark:hover:border-blue-400 dark:hover:bg-blue-900/30"
                  :class="selectedImageIndex === index ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/40 dark:text-blue-100' : ''"
                  @click="selectedImageIndex = index"
                >
                  <img :src="image.url" :alt="getLocalizedText(image.altText)" class="h-14 w-14 rounded-xl object-cover" />
                  <span class="text-sm font-medium">{{ getLocalizedText(image.altText) || getLocalizedText(product.name) }}</span>
                </UiButton>
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                  {{ getLocalizedText(product.name) }}
                </h1>
                <p v-if="product.shortDescription" class="mt-3 text-lg text-gray-600 dark:text-gray-400">
                  {{ getLocalizedText(product.shortDescription) }}
                </p>
              </div>
              <div class="flex flex-col items-start gap-2 text-right">
                <div class="flex items-center gap-3">
                  <span class="text-3xl font-bold text-gray-900 dark:text-white">€{{ formatPrice(product.price) }}</span>
                  <span
                    v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                    class="text-lg text-gray-500 line-through"
                  >
                    €{{ formatPrice(product.comparePrice) }}
                  </span>
                </div>
                <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-900/30 dark:text-red-200">
                  {{ Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100) }}% {{ $t('products.off') }}
                </span>
              </div>
            </div>

            <div class="mt-6 grid gap-6 lg:grid-cols-2">
              <div class="space-y-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.story.title') }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ storytelling.producer }}</p>
                <div>
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ $t('products.story.tastingNotes') }}
                  </h3>
                  <ul class="mt-2 flex flex-wrap gap-2">
                    <li
                      v-for="note in tastingNotes"
                      :key="`note-${note}`"
                      class="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-200"
                    >
                      {{ note }}
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ $t('products.story.pairings') }}
                  </h3>
                  <ul class="mt-2 list-inside list-disc text-sm text-gray-600 dark:text-gray-400">
                    <li v-for="pairing in pairingIdeas" :key="`pairing-${pairing}`">{{ pairing }}</li>
                  </ul>
                </div>
              </div>
              <div class="space-y-4">
                <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/60">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ $t('products.story.awards') }}
                  </h3>
                  <ul class="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <li v-for="award in awards" :key="`award-${award}`">{{ award }}</li>
                    <li v-if="!awards.length">{{ $t('products.story.noAwards') }}</li>
                  </ul>
                </div>
                <div class="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/60">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {{ $t('products.story.origin') }}
                  </h3>
                  <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ originStory }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.socialProof.title') }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('products.socialProof.subtitle') }}</p>
              </div>
              <div class="flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
                <span class="text-lg font-semibold">{{ reviewSummary.rating }}</span>
                <div class="flex items-center">
                  <svg v-for="star in 5" :key="`star-${star}`" xmlns="http://www.w3.org/2000/svg" :class="star <= Math.round(reviewSummary.rating) ? 'text-yellow-500' : 'text-yellow-300 dark:text-yellow-700'" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-3">
              <div v-for="highlight in reviewSummary.highlights" :key="highlight" class="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
                {{ highlight }}
              </div>
              <div class="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200">
                {{ $t('products.socialProof.rating', { rating: reviewSummary.rating, count: reviewSummary.count }) }}
              </div>
            </div>
            <UiButton type="button" variant="outline" size="sm" class="mt-6 rounded-full">
              {{ $t('products.socialProof.cta') }}
            </UiButton>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.details') }}</h2>
            <dl class="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div v-if="product.origin">
                <dt class="font-medium text-gray-900 dark:text-white">{{ $t('products.origin') }}</dt>
                <dd class="text-gray-600 dark:text-gray-400">{{ product.origin }}</dd>
              </div>
              <div v-if="product.volume">
                <dt class="font-medium text-gray-900 dark:text-white">{{ $t('products.volume') }}</dt>
                <dd class="text-gray-600 dark:text-gray-400">{{ product.volume }}ml</dd>
              </div>
              <div v-if="product.alcoholContent">
                <dt class="font-medium text-gray-900 dark:text-white">{{ $t('products.alcoholContent') }}</dt>
                <dd class="text-gray-600 dark:text-gray-400">{{ product.alcoholContent }}%</dd>
              </div>
              <div v-if="product.weight">
                <dt class="font-medium text-gray-900 dark:text-white">{{ $t('products.weight') }}</dt>
                <dd class="text-gray-600 dark:text-gray-400">{{ product.weight }}kg</dd>
              </div>
              <div v-if="product.sku">
                <dt class="font-medium text-gray-900 dark:text-white">SKU</dt>
                <dd class="text-gray-600 dark:text-gray-400">{{ product.sku }}</dd>
              </div>
            </dl>

            <div v-if="product.tags?.length" class="mt-6 flex flex-wrap gap-2">
              <span
                v-for="tag in product.tags"
                :key="tag"
                class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                {{ tag }}
              </span>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.sustainability.title') }}</h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('products.sustainability.subtitle') }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="badge in sustainabilityBadges"
                :key="badge"
                class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/60 dark:bg-blue-900/20 dark:text-blue-200"
              >
                <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                {{ $t(`products.sustainability.badges.${badge}`) }}
              </span>
            </div>
          </section>

          <section class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.faq.title') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('products.faq.subtitle') }}</p>
            <div class="mt-4 space-y-3">
              <details
                v-for="item in faqItems"
                :key="item.id"
                class="group rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60"
                :open="item.defaultOpen"
              >
                <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-gray-900 transition dark:text-white">
                  {{ item.question }}
                  <span class="text-xl leading-none transition group-open:rotate-45">+</span>
                </summary>
                <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">{{ item.answer }}</p>
              </details>
            </div>
          </section>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-24">
          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <div v-if="product.category" class="text-sm font-medium text-blue-600 dark:text-blue-300">
              {{ categoryLabel }}
            </div>
            <h2 class="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{{ getLocalizedText(product.name) }}</h2>
            <div class="mt-4 flex items-center gap-3">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">€{{ formatPrice(product.price) }}</span>
              <span v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)" class="text-lg text-gray-500 line-through">
                €{{ formatPrice(product.comparePrice) }}
              </span>
            </div>
            <span
              class="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-medium"
              :class="stockStatusClass"
            >
              <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
              {{ stockStatusText }}
            </span>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ estimatedDelivery }}</p>
            <p v-if="stockUrgencyMessage" class="mt-1 text-sm font-semibold text-red-600 dark:text-red-300">
              {{ stockUrgencyMessage }}
            </p>

            <div class="mt-4 space-y-4">
              <label class="block text-sm font-medium text-gray-900 dark:text-white">{{ $t('common.quantity') }}</label>
              <select
                v-model="selectedQuantity"
                :disabled="(product.stockQuantity || 0) <= 0"
                class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400"
              >
                <option v-for="n in Math.min(10, Math.max(1, product.stockQuantity || 1))" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>

              <Button
                data-testid="add-to-cart-button"
                :disabled="(product.stockQuantity || 0) <= 0 || cartLoading"
                class="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400"
                :class="[
                  isProductInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700',
                  cartLoading ? 'cursor-progress' : ''
                ]"
                @click="addToCart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9" />
                </svg>
                <span>
                  <template v-if="(product.stockQuantity || 0) > 0">
                    {{ isProductInCart ? $t('products.inCart') : $t('products.addToCart') }}
                  </template>
                  <template v-else>
                    {{ $t('products.outOfStock') }}
                  </template>
                </span>
              </Button>

              <div class="flex flex-wrap gap-3">
                <UiButton
                  type="button"
                  variant="outline"
                  size="sm"
                  class="flex-1 rounded-xl"
                  :class="wishlistAdded ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-200' : ''"
                  @click="toggleWishlist"
                >
                  <span class="mr-2" aria-hidden="true">♥</span>
                  <span>{{ wishlistAdded ? $t('products.actions.addedToWishlist') : $t('products.actions.addToWishlist') }}</span>
                </UiButton>
                <UiButton
                  type="button"
                  variant="outline"
                  size="sm"
                  class="rounded-xl"
                  @click="shareProduct"
                >
                  <span class="mr-2" aria-hidden="true">⤴</span>
                  <span>{{ $t('products.actions.share') }}</span>
                </UiButton>
              </div>
              <p v-if="shareFeedback" class="text-sm text-blue-600 dark:text-blue-300">{{ shareFeedback }}</p>
            </div>
          </div>

          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.trust.title') }}</h3>
            <ul class="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li v-for="promise in trustPromises" :key="promise" class="flex items-start gap-3">
                <span class="mt-1 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span>{{ promise }}</span>
              </li>
            </ul>
          </div>

          <div class="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t('products.bundle.title') }}</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ $t('products.bundle.description') }}</p>
            <div class="mt-4 space-y-3">
              <div v-for="item in bundleItems" :key="`bundle-${item.id}`" class="flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-800 dark:bg-gray-800/60">
                <span class="font-medium text-gray-800 dark:text-gray-200">{{ item.title }}</span>
                <span class="text-gray-500 dark:text-gray-400">€{{ formatPrice(item.price) }}</span>
              </div>
            </div>
            <Button class="mt-4 w-full justify-center rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              {{ $t('products.bundle.cta') }}
            </Button>
          </div>
        </aside>
      </div>

      <section v-if="relatedProducts.length" class="space-y-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ $t('products.related.title') }}</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('products.related.subtitle') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard v-for="related in relatedProducts" :key="`related-${related.id}`" :product="related" />
        </div>
      </section>

      <section v-if="product.description" class="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ $t('products.description') }}</h2>
        <div class="prose prose-lg max-w-none text-gray-600 dark:prose-invert dark:text-gray-300">
          <p v-for="paragraph in getLocalizedText(product.description).split('\n')" :key="paragraph" class="mb-4">
            {{ paragraph }}
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '#imports'
import { Button } from '@/components/ui/button'
import ProductCard from '~/components/product/Card.vue'
import type { ProductWithRelations } from '~/types/database'
import { useCart } from '~/composables/useCart'

const route = useRoute()
const slug = route.params.slug as string

const { data: product, pending, error } = await useLazyFetch<ProductWithRelations & { relatedProducts?: ProductWithRelations[]; attributes?: Record<string, any> }>(`/api/products/${slug}`)

const { t, locale } = useI18n()

const selectedImageIndex = ref(0)
const selectedQuantity = ref(1)
const wishlistAdded = ref(false)
const shareFeedback = ref<string | null>(null)

const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])

const productAttributes = computed(() => product.value?.attributes || {})

const { addItem, loading: cartLoading, isInCart } = useCart()

const isProductInCart = computed(() => {
  if (!product.value) return false
  return isInCart(product.value.id)
})

const selectedImage = computed(() => {
  return product.value?.images?.[selectedImageIndex.value]
})

const stockStatusClass = computed(() => {
  if (!product.value) return ''
  const stock = product.value.stockQuantity
  if (stock > 10) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
  if (stock > 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
})

const stockStatusText = computed(() => {
  if (!product.value) return ''
  const stock = product.value.stockQuantity
  if (stock > 10) return t('products.stockStatus.inStock')
  if (stock > 0) return t('products.stockStatus.onlyLeft', { count: stock })
  return t('products.stockStatus.outOfStock')
})

const categoryLabel = computed(() => {
  if (!product.value?.category) return ''
  const category: any = product.value.category
  if (category.nameTranslations) {
    return getLocalizedText(category.nameTranslations)
  }
  if (category.name) {
    return typeof category.name === 'string' ? category.name : getLocalizedText(category.name)
  }
  return ''
})

const storytelling = computed(() => {
  const producerStory = productAttributes.value?.producer_story || productAttributes.value?.producerStory
  const categoryName = categoryLabel.value
  return {
    producer: producerStory || t('products.story.producerFallback', { category: categoryName || t('products.commonProduct') })
  }
})

const tastingNotes = computed(() => {
  const notes = productAttributes.value?.tasting_notes || productAttributes.value?.tastingNotes
  if (Array.isArray(notes)) return notes
  if (typeof notes === 'string') {
    return notes.split(',').map(note => note.trim()).filter(Boolean)
  }
  return t('products.story.defaultNotes').split('|').map(entry => entry.trim())
})

const pairingIdeas = computed(() => {
  const pairings = productAttributes.value?.pairings
  if (Array.isArray(pairings)) return pairings
  if (typeof pairings === 'string') {
    return pairings.split(',').map(pairing => pairing.trim()).filter(Boolean)
  }
  return t('products.story.defaultPairings').split('|').map(entry => entry.trim())
})

const awards = computed(() => {
  const awardList = productAttributes.value?.awards
  if (Array.isArray(awardList)) return awardList
  if (typeof awardList === 'string') {
    return awardList.split(',').map(award => award.trim()).filter(Boolean)
  }
  return []
})

const originStory = computed(() => {
  if (productAttributes.value?.terroir) {
    return productAttributes.value.terroir
  }
  if (product.value?.origin) {
    return t('products.story.originFallback', { origin: product.value.origin })
  }
  const categoryTranslations = product.value?.category?.nameTranslations || {}
  const categoryName = getLocalizedText(categoryTranslations)
  return t('products.story.originCategoryFallback', { category: categoryName || t('products.commonProduct') })
})

const reviewSummary = computed(() => {
  const rating = Number(productAttributes.value?.rating || 4.8)
  const count = Number(productAttributes.value?.review_count || productAttributes.value?.reviewCount || 126)
  const highlightsRaw = productAttributes.value?.review_highlights || productAttributes.value?.reviewHighlights
  let highlights: string[] = []
  if (Array.isArray(highlightsRaw)) {
    highlights = highlightsRaw
  } else if (typeof highlightsRaw === 'string') {
    highlights = highlightsRaw.split('|').map((item: string) => item.trim())
  } else {
    highlights = t('products.socialProof.highlights').split('|').map(entry => entry.trim())
  }
  return { rating: Number(rating.toFixed(1)), count, highlights }
})

const sustainabilityBadges = computed(() => {
  const badges: string[] = []
  const attrs = productAttributes.value || {}
  const truthy = (value: any) => value === true || value === 'true' || value === 1
  if (truthy(attrs.organic) || truthy(attrs.organicCertified)) badges.push('organic')
  if (truthy(attrs.handcrafted) || truthy(attrs.smallBatch)) badges.push('handcrafted')
  if (truthy(attrs.familyOwned)) badges.push('familyOwned')
  if (truthy(attrs.limitedRelease) || truthy(attrs.limitedEdition)) badges.push('limited')
  if (truthy(attrs.protectedOrigin) || truthy(attrs.geographicIndication)) badges.push('heritage')
  if (!badges.length) {
    badges.push('handcrafted', 'familyOwned')
  }
  return Array.from(new Set(badges)).slice(0, 5)
})

const faqItems = computed(() => [
  {
    id: 'delivery',
    question: t('products.faq.items.delivery.question'),
    answer: t('products.faq.items.delivery.answer'),
    defaultOpen: true
  },
  {
    id: 'storage',
    question: t('products.faq.items.storage.question'),
    answer: t('products.faq.items.storage.answer')
  },
  {
    id: 'allergens',
    question: t('products.faq.items.allergens.question'),
    answer: t('products.faq.items.allergens.answer')
  },
  {
    id: 'returns',
    question: t('products.faq.items.returns.question'),
    answer: t('products.faq.items.returns.answer')
  }
])

const trustPromises = computed(() => [
  t('products.trust.shipping'),
  t('products.trust.returns'),
  t('products.trust.authentic'),
  t('products.trust.payments'),
  t('products.trust.support')
])

const relatedProducts = computed(() => product.value?.relatedProducts || [])

const bundleItems = computed(() => {
  if (!relatedProducts.value.length) return []
  return relatedProducts.value.slice(0, 3).map(item => ({
    id: item.id,
    title: getLocalizedText(item.name),
    price: item.price || Number(item.formattedPrice?.replace('€', '') || 0)
  }))
})

const estimatedDelivery = computed(() => {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + 1)
  const formatted = new Intl.DateTimeFormat(locale.value, { weekday: 'short', month: 'short', day: 'numeric' }).format(baseDate)
  return t('products.stock.eta', { date: formatted })
})

const stockUrgencyMessage = computed(() => {
  if (!product.value) return ''
  const stock = product.value.stockQuantity || 0
  if (stock === 0) return ''
  if (stock <= 3) {
    return t('products.stock.urgencyLow', { count: stock })
  }
  if (stock <= 8) {
    return t('products.stock.urgencyMedium', { count: stock })
  }
  return ''
})

const toggleWishlist = () => {
  wishlistAdded.value = !wishlistAdded.value
}

const shareProduct = async () => {
  try {
    const shareData = {
      title: getLocalizedText(product.value?.name),
      text: getLocalizedText(product.value?.shortDescription) || t('products.actions.shareText'),
      url: window.location.href
    }
    if (navigator.share) {
      await navigator.share(shareData)
      shareFeedback.value = t('products.actions.sharedSuccess')
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      shareFeedback.value = t('products.actions.linkCopied')
    } else {
      shareFeedback.value = t('products.actions.copyFallback')
    }
    setTimeout(() => {
      shareFeedback.value = null
    }, 4000)
  } catch (err) {
    console.error('Share failed', err)
    shareFeedback.value = t('products.actions.shareError')
  }
}

const addToCart = async () => {
  if (!product.value) return

  try {
    // Construct the product object in the format expected by the cart store
    const cartProduct = {
      id: product.value.id,
      slug: product.value.slug,
      name: getLocalizedText(product.value.name),
      price: Number(product.value.price),
      images: product.value.images?.map(img => img.url) || [],
      stock: product.value.stockQuantity
    }

    await addItem(cartProduct, selectedQuantity.value)
  } catch (err) {
    console.error('Add to cart failed', err)
  }
}

const getLocalizedText = (text: Record<string, string> | null | undefined) => {
  if (!text) return ''
  return text[locale.value] || text.es || Object.values(text)[0] || ''
}

const formatPrice = (price: string | number) => {
  return Number(price).toFixed(2)
}

watch(product, newProduct => {
  if (newProduct) {
    selectedImageIndex.value = 0
    if ((newProduct.stockQuantity || 0) < selectedQuantity.value) {
      selectedQuantity.value = Math.max(1, newProduct.stockQuantity || 1)
    }
    recentlyViewedProducts.value = [
      newProduct,
      ...recentlyViewedProducts.value.filter(item => item.id !== newProduct.id)
    ].slice(0, 8)
  }
}, { immediate: true })

watch(product, newProduct => {
  if (newProduct) {
    // Determine availability status
    const stockQuantity = newProduct.stockQuantity || 0
    const availabilityStatus = stockQuantity > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock'

    // Build image array for structured data
    const productImages = newProduct.images?.map(img => img.url).filter(Boolean) || []

    // Get brand from attributes or use category as fallback
    const brand = productAttributes.value?.brand ||
                  productAttributes.value?.producer ||
                  categoryLabel.value ||
                  'Moldova Direct'

    // Build canonical URL for structured data (works in SSR)
    const config = useRuntimeConfig()
    const productUrl = `${config.public.siteUrl}${route.path}`

    // Build Product structured data
    const productStructuredData: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: getLocalizedText(newProduct.name),
      description: getLocalizedText(newProduct.description) || getLocalizedText(newProduct.shortDescription),
      image: productImages,
      sku: newProduct.sku,
      brand: {
        '@type': 'Brand',
        name: brand
      },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'EUR',
        price: Number(newProduct.price).toFixed(2),
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availability: availabilityStatus,
        itemCondition: 'https://schema.org/NewCondition'
      }
    }

    // Add compare price if available
    if (newProduct.comparePrice && Number(newProduct.comparePrice) > Number(newProduct.price)) {
      productStructuredData.offers.priceType = 'https://schema.org/SalePrice'
    }

    // Add aggregate rating if available
    const rating = reviewSummary.value
    if (rating && rating.count > 0) {
      productStructuredData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: rating.rating.toString(),
        reviewCount: rating.count.toString(),
        bestRating: '5',
        worstRating: '1'
      }
    }

    // Add additional product details if available
    if (newProduct.origin) {
      productStructuredData.countryOfOrigin = {
        '@type': 'Country',
        name: newProduct.origin
      }
    }

    if (newProduct.weight) {
      productStructuredData.weight = {
        '@type': 'QuantitativeValue',
        value: newProduct.weight,
        unitCode: 'KGM'
      }
    }

    // Add category breadcrumb
    if (newProduct.category) {
      productStructuredData.category = categoryLabel.value
    }

    useHead({
      title: `${getLocalizedText(newProduct.name)} - Moldova Direct`,
      meta: [
        {
          name: 'description',
          content: getLocalizedText(newProduct.metaDescription) || getLocalizedText(newProduct.shortDescription) || getLocalizedText(newProduct.description) || `${getLocalizedText(newProduct.name)} - Authentic Moldovan product`
        },
        {
          property: 'og:title',
          content: getLocalizedText(newProduct.name)
        },
        {
          property: 'og:description',
          content: getLocalizedText(newProduct.shortDescription) || getLocalizedText(newProduct.description)
        },
        {
          property: 'og:image',
          content: newProduct.images?.[0]?.url
        },
        {
          property: 'og:type',
          content: 'product'
        },
        {
          property: 'product:price:amount',
          content: newProduct.price
        },
        {
          property: 'product:price:currency',
          content: 'EUR'
        }
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(productStructuredData)
        }
      ]
    })
  }
}, { immediate: true })

if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found'
  })
}
</script>
