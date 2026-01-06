<template>
  <div
    v-if="pending"
    class="py-12 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)]"
  >
    <div class="container">
      <div class="animate-pulse space-y-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div class="space-y-4">
            <div class="aspect-square rounded-3xl bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"></div>
            <div class="grid grid-cols-4 gap-3">
              <div
                v-for="n in 4"
                :key="n"
                class="aspect-square rounded-xl bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"
              ></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="h-6 w-32 rounded bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"></div>
            <div class="h-10 w-3/4 rounded bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"></div>
            <div class="h-20 rounded bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"></div>
            <div class="h-12 rounded bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-700)]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    class="py-12 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)]"
  >
    <div class="container text-center">
      <h1 class="font-[family-name:var(--md-font-serif)] mb-4 text-4xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
        {{ $t('products.notFound') }}
      </h1>
      <p class="mb-8 text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
        {{ $t('products.notFoundDescription') }}
      </p>
      <nuxt-link
        to="/products"
        class="inline-flex items-center rounded-full bg-[var(--md-wine)] px-6 py-3 font-medium text-white transition hover:bg-[var(--md-wine-light)]"
      >
        {{ $t('products.backToProducts') }}
      </nuxt-link>
    </div>
  </div>

  <div
    v-else-if="product"
    class="py-8 lg:py-12 pb-32 lg:pb-12 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)]"
  >
    <div class="container space-y-12">
      <nav class="flex flex-wrap items-center text-sm text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
        <nuxt-link
          to="/"
          class="transition hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
        >{{ $t('common.home') }}</nuxt-link>
        <span class="mx-2 text-[var(--md-gold)]">/</span>
        <nuxt-link
          to="/products"
          class="transition hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
        >{{ $t('common.shop') }}</nuxt-link>
        <template v-if="product.category?.breadcrumb?.length">
          <span class="mx-2 text-[var(--md-gold)]">/</span>
          <template
            v-for="(crumb, index) in product.category.breadcrumb"
            :key="`crumb-${crumb.id}`"
          >
            <nuxt-link
              :to="`/products?category=${crumb.slug}`"
              class="transition hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)]"
            >
              {{ crumb.name }}
            </nuxt-link>
            <span
              v-if="index < product.category.breadcrumb.length - 1"
              class="mx-2 text-[var(--md-gold)]"
            >/</span>
          </template>
        </template>
        <span class="mx-2 text-[var(--md-gold)]">/</span>
        <span class="text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ getLocalizedText(product.name as Record<string, string>) }}</span>
      </nav>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="space-y-10">
          <section class="space-y-6">
            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <div
                  class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--md-cream-light)] to-[var(--md-cream-dark)] dark:from-[var(--md-charcoal-light)] dark:to-[var(--md-charcoal)]"
                  :class="selectedImage ? 'aspect-square' : ''"
                >
                  <template v-if="selectedImage">
                    <NuxtImg
                      preset="productDetail"
                      :src="selectedImage.url"
                      :alt="getLocalizedText(selectedImage.altText as Record<string, string> | null | undefined) || getLocalizedText(product.name as Record<string, string>)"
                      sizes="100vw lg:800px"
                      densities="x1 x2"
                      loading="eager"
                      fetchpriority="high"
                      placeholder
                      :placeholder-class="'blur-xl'"
                      class="h-full w-full object-cover cursor-pointer transition-transform hover:scale-105"
                      @click="openZoomModal"
                    />
                  </template>

                  <!-- COMPACT BRANDED FALLBACK -->
                  <div
                    v-else
                    class="flex items-center justify-center py-16"
                  >
                    <div class="text-center space-y-4 px-6 max-w-sm">
                      <!-- Brand Identity with subtle glow -->
                      <div class="relative inline-block">
                        <div class="absolute inset-0 bg-[var(--md-gold)]/20 blur-3xl rounded-full scale-150"></div>
                        <commonIcon
                          name="wine"
                          class="relative h-20 w-20 text-[var(--md-wine)] dark:text-[var(--md-gold)] mx-auto"
                        />
                      </div>

                      <!-- Message -->
                      <div class="space-y-2">
                        <h3 class="font-[family-name:var(--md-font-serif)] text-base font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                          {{ $t('products.imageFallback.title') }}
                        </h3>
                        <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                          {{ $t('products.imageFallback.subtitle') }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Badges (only if image exists) -->
                  <template v-if="selectedImage">
                    <div
                      v-if="product.isFeatured"
                      class="absolute left-4 top-4"
                    >
                      <span class="rounded-full bg-[var(--md-gold)] px-3 py-1 text-sm font-semibold text-[var(--md-charcoal)] shadow-lg">
                        {{ $t('products.featured') }}
                      </span>
                    </div>
                    <div
                      v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                      class="absolute right-4 top-4"
                    >
                      <span class="rounded-full bg-[var(--md-wine)] px-3 py-1 text-sm font-semibold text-white shadow-lg">
                        {{ $t('products.sale') }}
                      </span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Gallery Thumbnails -->
              <div
                v-if="product.images?.length"
                class="overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide lg:mx-0 lg:px-0 lg:overflow-visible lg:pb-0"
              >
                <div class="flex gap-2 lg:flex-col lg:space-y-2 lg:gap-0">
                  <button
                    v-for="(image, index) in product.images"
                    :key="image.id || index"
                    type="button"
                    class="flex-shrink-0 w-20 h-20 lg:w-full lg:aspect-square rounded-xl overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-gold)] focus-visible:ring-offset-2"
                    :class="selectedImageIndex === index ? 'border-[var(--md-gold)] ring-2 ring-[var(--md-gold)] ring-offset-1' : 'border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] hover:border-[var(--md-gray-300)] dark:hover:border-[var(--md-gray-600)]'"
                    :aria-label="`View image ${index + 1}`"
                    @click="selectedImageIndex = index"
                  >
                    <NuxtImg
                      preset="productThumbnailSmall"
                      :src="image.url"
                      :alt="getLocalizedText(image.altText as Record<string, string> | null | undefined)"
                      width="80"
                      height="80"
                      loading="lazy"
                      class="w-full h-full object-cover"
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <UiCard>
            <UiCardHeader>
              <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <UiCardTitle class="text-3xl">
                    {{ getLocalizedText(product.name as Record<string, string>) }}
                  </UiCardTitle>
                  <UiCardDescription
                    v-if="product.shortDescription"
                    class="mt-3 text-lg"
                  >
                    {{ getLocalizedText(product.shortDescription as Record<string, string>) }}
                  </UiCardDescription>
                </div>
                <div class="flex flex-col items-start gap-2 text-right">
                  <div class="flex items-center gap-3">
                    <span class="font-[family-name:var(--md-font-serif)] text-3xl font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">€{{ formatPrice(product.price) }}</span>
                    <span
                      v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                      class="text-lg text-[var(--md-gray-500)] line-through"
                    >
                      €{{ formatPrice(product.comparePrice) }}
                    </span>
                  </div>
                  <span
                    v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                    class="inline-flex items-center gap-2 rounded-full bg-[var(--md-wine-muted)] px-3 py-1 text-sm font-semibold text-[var(--md-wine)] dark:bg-[var(--md-wine)]/20 dark:text-[var(--md-wine-light)]"
                  >
                    {{ Math.round((1 - Number(product.price) / Number(product.comparePrice)) * 100) }}% {{ $t('products.off') }}
                  </span>
                </div>
              </div>
            </UiCardHeader>

            <UiCardContent class="grid gap-6 lg:grid-cols-2">
              <div class="space-y-4">
                <h2 class="font-[family-name:var(--md-font-serif)] text-lg font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                  {{ sectionTitles.story }}
                </h2>
                <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                  {{ storytelling.producer }}
                </p>
                <div v-if="tastingNotes.length">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--md-gold)] dark:text-[var(--md-gold)]">
                    {{ $t('products.story.tastingNotes') }}
                  </h3>
                  <ul class="mt-2 flex flex-wrap gap-2">
                    <li
                      v-for="note in tastingNotes"
                      :key="`note-${note}`"
                      class="rounded-full bg-[var(--md-wine-muted)] px-3 py-1 text-sm font-medium text-[var(--md-wine)] dark:bg-[var(--md-wine)]/20 dark:text-[var(--md-wine-light)]"
                    >
                      {{ note }}
                    </li>
                  </ul>
                </div>
                <div v-if="pairingIdeas.length">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--md-gold)] dark:text-[var(--md-gold)]">
                    {{ $t('products.story.pairings') }}
                  </h3>
                  <ul class="mt-2 list-inside list-disc text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    <li
                      v-for="pairing in pairingIdeas"
                      :key="`pairing-${pairing}`"
                    >
                      {{ pairing }}
                    </li>
                  </ul>
                </div>
              </div>
              <div class="space-y-6">
                <div class="space-y-2">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--md-gold)] dark:text-[var(--md-gold)]">
                    {{ $t('products.story.awards') }}
                  </h3>
                  <ul class="space-y-2 text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]">
                    <li
                      v-for="award in awards"
                      :key="`award-${award}`"
                    >
                      • {{ award }}
                    </li>
                    <li v-if="!awards.length">
                      {{ $t('products.story.noAwards') }}
                    </li>
                  </ul>
                </div>
                <div class="space-y-2">
                  <h3 class="text-sm font-semibold uppercase tracking-wide text-[var(--md-gold)] dark:text-[var(--md-gold)]">
                    {{ $t('products.story.origin') }}
                  </h3>
                  <p class="text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]">
                    {{ originStory }}
                  </p>
                </div>
              </div>
            </UiCardContent>
          </UiCard>

          <UiCard v-if="reviewSummary">
            <UiCardHeader>
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <UiCardTitle>{{ $t('products.socialProof.title') }}</UiCardTitle>
                  <UiCardDescription>{{ $t('products.socialProof.subtitle') }}</UiCardDescription>
                </div>
                <div class="flex items-center gap-2 rounded-full bg-[var(--md-gold-muted)] px-4 py-2 text-[var(--md-gold-dark)] dark:bg-[var(--md-gold)]/20 dark:text-[var(--md-gold)]">
                  <span class="text-lg font-semibold">{{ reviewSummary.rating }}</span>
                  <div class="flex items-center">
                    <svg
                      v-for="star in 5"
                      :key="`star-${star}`"
                      xmlns="http://www.w3.org/2000/svg"
                      :class="star <= Math.round(reviewSummary.rating) ? 'text-[var(--md-gold)]' : 'text-[var(--md-gold)]/30 dark:text-[var(--md-gold)]/20'"
                      class="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            </UiCardHeader>
            <UiCardContent class="grid gap-4 sm:grid-cols-3">
              <div
                v-for="highlight in reviewSummary.highlights"
                :key="highlight"
                class="p-4 text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]"
              >
                {{ highlight }}
              </div>
              <div class="p-4 text-sm font-medium text-[var(--md-wine)] dark:text-[var(--md-gold)]">
                {{ $t('products.socialProof.rating', { rating: reviewSummary.rating, count: reviewSummary.count }) }}
              </div>
            </UiCardContent>
            <UiCardFooter>
              <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="rounded-full"
              >
                {{ $t('products.socialProof.cta') }}
              </UiButton>
            </UiCardFooter>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle>{{ $t('products.details') }}</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <dl class="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div v-if="product.origin">
                  <dt class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('products.origin') }}
                  </dt>
                  <dd class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ product.origin }}
                  </dd>
                </div>
                <div v-if="product.volume">
                  <dt class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('products.volume') }}
                  </dt>
                  <dd class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ product.volume }}ml
                  </dd>
                </div>
                <div v-if="product.alcoholContent">
                  <dt class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('products.alcoholContent') }}
                  </dt>
                  <dd class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ product.alcoholContent }}%
                  </dd>
                </div>
                <div v-if="product.weightKg">
                  <dt class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('products.weight') }}
                  </dt>
                  <dd class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ product.weightKg }}kg
                  </dd>
                </div>
                <div v-if="product.sku">
                  <dt class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    SKU
                  </dt>
                  <dd class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ product.sku }}
                  </dd>
                </div>
              </dl>

              <div
                v-if="product.tags?.length"
                class="mt-6 flex flex-wrap gap-2"
              >
                <span
                  v-for="tag in product.tags"
                  :key="tag"
                  class="rounded-full bg-[var(--md-cream-dark)] px-3 py-1 text-sm font-medium text-[var(--md-charcoal)] dark:bg-[var(--md-charcoal-light)] dark:text-[var(--md-cream)]"
                >
                  {{ tag }}
                </span>
              </div>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle>{{ $t('products.sustainability.title') }}</UiCardTitle>
              <UiCardDescription>{{ $t('products.sustainability.subtitle') }}</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="mt-4 flex flex-wrap gap-2">
                <span
                  v-for="badge in sustainabilityBadges"
                  :key="badge"
                  class="inline-flex items-center gap-2 rounded-full border border-[var(--md-success)]/30 bg-[var(--md-success)]/10 px-3 py-1 text-sm font-medium text-[var(--md-success)] dark:border-[var(--md-success)]/40 dark:bg-[var(--md-success)]/15 dark:text-emerald-300"
                >
                  <span class="inline-block h-2 w-2 rounded-full bg-[var(--md-success)]"></span>
                  {{ $t(`products.sustainability.badges.${badge}`) }}
                </span>
              </div>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle>{{ $t('products.faq.title') }}</UiCardTitle>
              <UiCardDescription>{{ $t('products.faq.subtitle') }}</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
              <div class="mt-4 space-y-4">
                <details
                  v-for="item in faqItems"
                  :key="item.id"
                  class="group pb-4 border-b border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] last:border-0 last:pb-0"
                  :open="item.defaultOpen"
                >
                  <summary class="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--md-charcoal)] transition dark:text-[var(--md-cream)]">
                    {{ item.question }}
                    <span class="text-xl leading-none transition group-open:rotate-45 text-[var(--md-gold)]">+</span>
                  </summary>
                  <p class="mt-3 text-sm text-[var(--md-gray-700)] dark:text-[var(--md-gray-300)]">
                    {{ item.answer }}
                  </p>
                </details>
              </div>
            </UiCardContent>
          </UiCard>
        </div>

        <aside class="space-y-6 lg:sticky lg:top-24">
          <UiCard>
            <UiCardHeader>
              <div
                v-if="product.category"
                class="text-sm font-medium text-[var(--md-wine)] dark:text-[var(--md-gold)]"
              >
                {{ categoryLabel }}
              </div>
              <UiCardTitle class="mt-2 font-[family-name:var(--md-font-serif)]">
                {{ getLocalizedText(product.name as Record<string, string>) }}
              </UiCardTitle>
              <div class="mt-4 flex items-center gap-3">
                <span class="font-[family-name:var(--md-font-serif)] text-3xl font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">€{{ formatPrice(product.price) }}</span>
                <span
                  v-if="product.comparePrice && Number(product.comparePrice) > Number(product.price)"
                  class="text-lg text-[var(--md-gray-500)] line-through"
                >
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
              <p class="mt-2 text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                {{ estimatedDelivery }}
              </p>
              <p
                v-if="stockUrgencyMessage"
                class="mt-1 text-sm font-semibold text-[var(--md-wine)] dark:text-[var(--md-wine-light)]"
              >
                {{ stockUrgencyMessage }}
              </p>
            </UiCardHeader>

            <UiCardContent class="space-y-4">
              <label class="block text-sm font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ $t('common.quantity') }}</label>
              <select
                v-model="selectedQuantity"
                :disabled="(product.stockQuantity || 0) <= 0"
                class="w-full rounded-xl border border-[var(--md-gray-300)] px-4 py-3 text-sm font-medium text-[var(--md-charcoal)] focus:border-[var(--md-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--md-gold-muted)] disabled:cursor-not-allowed disabled:bg-[var(--md-gray-100)] dark:border-[var(--md-gray-700)] dark:bg-[var(--md-charcoal-light)] dark:text-[var(--md-cream)] dark:focus:border-[var(--md-gold)]"
              >
                <option
                  v-for="n in Math.min(10, Math.max(1, product.stockQuantity || 1))"
                  :key="n"
                  :value="n"
                >
                  {{ n }}
                </option>
              </select>

              <Button
                data-testid="add-to-cart-button"
                :disabled="(product.stockQuantity || 0) <= 0 || cartLoading"
                class="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[var(--md-gray-400)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="[
                  isProductInCart ? 'bg-[var(--md-success)] hover:bg-emerald-700 focus-visible:ring-[var(--md-success)]' : 'bg-[var(--md-wine-btn)] hover:bg-[var(--md-wine-btn-hover)] shadow-[var(--md-wine-shadow)] focus-visible:ring-[var(--md-gold)]',
                  cartLoading ? 'cursor-progress' : '',
                ]"
                @click="addToCart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9"
                  />
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

              <UiButton
                type="button"
                variant="outline"
                size="sm"
                class="rounded-xl w-full"
                @click="shareProduct"
              >
                <span
                  class="mr-2"
                  aria-hidden="true"
                >⤴</span>
                <span>{{ $t('products.actions.share') }}</span>
              </UiButton>
              <p
                v-if="shareFeedback"
                class="text-sm text-[var(--md-wine)] dark:text-[var(--md-gold)]"
              >
                {{ shareFeedback }}
              </p>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle class="text-lg font-[family-name:var(--md-font-serif)]">
                {{ $t('products.trust.title') }}
              </UiCardTitle>
            </UiCardHeader>
            <UiCardContent>
              <ul class="space-y-3 text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-300)]">
                <li
                  v-for="promise in trustPromises"
                  :key="promise"
                  class="flex items-start gap-3"
                >
                  <span class="mt-1 inline-block h-2 w-2 rounded-full bg-[var(--md-gold)]"></span>
                  <span>{{ promise }}</span>
                </li>
              </ul>
            </UiCardContent>
          </UiCard>

          <UiCard>
            <UiCardHeader>
              <UiCardTitle class="text-lg font-[family-name:var(--md-font-serif)]">
                {{ $t('products.bundle.title') }}
              </UiCardTitle>
              <UiCardDescription>{{ $t('products.bundle.description') }}</UiCardDescription>
            </UiCardHeader>
            <UiCardContent class="space-y-3">
              <div
                v-for="item in bundleItems"
                :key="`bundle-${item.id}`"
                class="flex items-center justify-between py-2 text-sm border-b border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] last:border-0"
              >
                <span class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ item.title }}</span>
                <span class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">€{{ formatPrice(item.price) }}</span>
              </div>
            </UiCardContent>
            <UiCardFooter>
              <Button class="w-full justify-center rounded-xl border border-[var(--md-gold)]/30 bg-[var(--md-gold-muted)] px-5 py-2.5 text-sm font-semibold text-[var(--md-gold-dark)] hover:bg-[var(--md-gold)]/20 dark:border-[var(--md-gold)]/40 dark:bg-[var(--md-gold)]/15 dark:text-[var(--md-gold)]">
                {{ $t('products.bundle.cta') }}
              </Button>
            </UiCardFooter>
          </UiCard>
        </aside>
      </div>

      <section
        v-if="relatedProducts.length"
        class="space-y-6"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="font-[family-name:var(--md-font-serif)] text-2xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
              {{ sectionTitles.related }}
            </h2>
            <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
              {{ sectionTitles.relatedSubtitle }}
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <ProductCard
            v-for="related in relatedProducts"
            :key="`related-${related.id}`"
            :product="related"
          />
        </div>
      </section>

      <section
        v-if="product.description"
        class="space-y-6 rounded-3xl border border-[var(--md-gray-200)] bg-[var(--md-cream-light)] p-6 shadow-sm dark:border-[var(--md-gray-700)] dark:bg-[var(--md-charcoal-light)]"
      >
        <h2 class="font-[family-name:var(--md-font-serif)] text-2xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
          {{ $t('products.description') }}
        </h2>
        <div class="prose prose-lg max-w-none text-[var(--md-gray-600)] dark:prose-invert dark:text-[var(--md-gray-300)]">
          <p
            v-for="paragraph in getLocalizedText(product.description as Record<string, string>).split('\n')"
            :key="paragraph"
            class="mb-4"
          >
            {{ paragraph }}
          </p>
        </div>
      </section>

      <!-- Mobile Sticky Bottom Bar (Above Bottom Navigation) -->
      <Teleport to="body">
        <div
          class="fixed left-0 right-0 z-50 bg-[var(--md-cream-light)] dark:bg-[var(--md-charcoal)] border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] shadow-2xl lg:hidden"
          style="bottom: 64px"
        >
          <div class="container mx-auto px-4 py-3">
            <div class="flex items-center gap-3">
              <!-- Product Info (Compact) -->
              <div class="flex-1 min-w-0">
                <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] truncate">
                  {{ getLocalizedText(product.name as Record<string, string>) }}
                </p>
                <p class="font-[family-name:var(--md-font-serif)] text-lg font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                  €{{ formatPrice(product.price) }}
                </p>
              </div>

              <!-- Add to Cart Button (Thumb-Friendly) -->
              <Button
                :disabled="(product.stockQuantity || 0) <= 0 || cartLoading"
                class="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white transition min-h-[48px] min-w-[140px]"
                :class="[
                  isProductInCart ? 'bg-[var(--md-success)] hover:bg-emerald-700' : 'bg-[var(--md-wine-btn)] hover:bg-[var(--md-wine-btn-hover)] shadow-[var(--md-wine-shadow)]',
                  cartLoading ? 'cursor-progress' : '',
                ]"
                @click="addToCart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m2.6 8L6 21h13M7 13v4a1 1 0 001 1h9a1 1 0 001-1v-4M7 13L6 9"
                  />
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
            </div>
          </div>
        </div>
      </Teleport>

      <!-- Image Zoom Modal -->
      <!-- TODO: Implement ProductImageZoomModal component -->
      <!--
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
      -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHead } from '#imports'
import { Button } from '@/components/ui/button'
import ProductCard from '~/components/product/Card.vue'
import type { ProductWithRelations, Translations } from '~/types/database'
import type { Product } from '~/stores/cart/types'
import { useCart } from '~/composables/useCart'
import { useProductUtils } from '~/composables/useProductUtils'
import { useProductStory } from '~/composables/useProductStory'
import { useProductDetailSEO } from '~/composables/useProductDetailSEO'
import { useProductStockStatus } from '~/composables/useProductStockStatus'
import { useToast } from '~/composables/useToast'

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

const { data: product, pending, error } = await useLazyFetch<ProductDetailResponse>(`/api/products/${slug}`)

const { t } = useI18n()

// UI state
const selectedImageIndex = ref(0)
const selectedQuantity = ref(1)
const shareFeedback = ref<string | null>(null)
const showZoomModal = ref(false)

const recentlyViewedProducts = useState<ProductWithRelations[]>('recentlyViewedProducts', () => [])

// Use composables
const { getLocalizedText, formatPrice, getCategoryLabel } = useProductUtils()
const { addItem, loading: cartLoading, isInCart } = useCart()
const toast = useToast()

// Computed values
const productAttributes = computed(() => product.value?.attributes || {})
const stockQuantity = computed(() => product.value?.stockQuantity || 0)
const categoryLabel = computed(() => getCategoryLabel(product.value?.category))

// Create computed product ref for composables (cast to expected type)
const computedProduct = computed(() => (product.value ?? null) as (ProductWithRelations & { attributes?: Record<string, any> }) | null)

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
} = useProductStory(computedProduct)

// SEO composable
const config = useRuntimeConfig()
const seoOptions = computed(() => ({
  productUrl: `${config.public.siteUrl}${route.path}`,
  rating: reviewSummary.value
    ? { rating: reviewSummary.value.rating, count: reviewSummary.value.count }
    : undefined,
  brand: productAttributes.value?.brand || productAttributes.value?.producer || categoryLabel.value,
}))

const { structuredData, metaTags, pageTitle } = useProductDetailSEO(computedProduct, seoOptions)

// Cart functionality
const isProductInCart = computed(() => {
  if (!product.value) return false
  return isInCart(String(product.value.id))
})

const selectedImage = computed(() => {
  return product.value?.images?.[selectedImageIndex.value]
})

// FAQ and trust promises
// Conditional FAQs based on product category (P1-4 fix)
const faqItems = computed(() => {
  const categorySlug = product.value?.category?.slug?.toLowerCase() || ''
  const categoryName = categoryLabel.value?.toLowerCase() || ''

  // Base FAQs shown for all products
  const baseFaqs = [
    {
      id: 'delivery',
      question: t('products.faq.items.delivery.question'),
      answer: t('products.faq.items.delivery.answer'),
      defaultOpen: true,
    },
    {
      id: 'returns',
      question: t('products.faq.items.returns.question'),
      answer: t('products.faq.items.returns.answer'),
    },
  ]

  // Category-specific FAQs
  const isWineOrBeverage = categorySlug.includes('wine') || categorySlug.includes('vino') || categorySlug.includes('vin') || categorySlug.includes('beverage')
  const isFoodOrCulinary = categorySlug.includes('food') || categorySlug.includes('comida') || categorySlug.includes('cuisine') || categoryName.includes('food')
  const isTextile = categorySlug.includes('textile') || categorySlug.includes('fabric') || categorySlug.includes('tejido') || categoryName.includes('textile')
  const isCraft = categorySlug.includes('craft') || categorySlug.includes('artisan') || categorySlug.includes('artesania') || categoryName.includes('craft')

  // Add category-appropriate FAQs
  if (isWineOrBeverage) {
    baseFaqs.push({
      id: 'storage',
      question: t('products.faq.items.storage.question'),
      answer: t('products.faq.items.storage.answer'),
    })
    baseFaqs.push({
      id: 'allergens',
      question: t('products.faq.items.allergens.question'),
      answer: t('products.faq.items.allergens.answer'),
    })
  }
  else if (isFoodOrCulinary) {
    baseFaqs.push({
      id: 'allergens',
      question: t('products.faq.items.allergens.question'),
      answer: t('products.faq.items.allergens.answer'),
    })
    baseFaqs.push({
      id: 'storage',
      question: t('products.faq.items.storage.question'),
      answer: t('products.faq.items.storage.answer'),
    })
  }
  else if (isTextile) {
    baseFaqs.push({
      id: 'care',
      question: t('products.faq.items.care.question'),
      answer: t('products.faq.items.care.answer'),
    })
    baseFaqs.push({
      id: 'materials',
      question: t('products.faq.items.materials.question'),
      answer: t('products.faq.items.materials.answer'),
    })
  }
  else if (isCraft) {
    baseFaqs.push({
      id: 'materials',
      question: t('products.faq.items.materials.question'),
      answer: t('products.faq.items.materials.answer'),
    })
    baseFaqs.push({
      id: 'origin',
      question: t('products.faq.items.origin.question'),
      answer: t('products.faq.items.origin.answer'),
    })
  }

  return baseFaqs
})

const trustPromises = computed(() => [
  t('products.trust.shipping'),
  t('products.trust.returns'),
  t('products.trust.authentic'),
  t('products.trust.payments'),
  t('products.trust.support'),
])

const relatedProducts = computed(() => product.value?.relatedProducts || [])

const bundleItems = computed(() => {
  if (!relatedProducts.value.length) return []
  return relatedProducts.value.slice(0, 3).map(item => ({
    id: item.id,
    title: getLocalizedText(item.name as Record<string, string>),
    price: item.price || Number(item.formattedPrice?.replace('€', '') || 0),
  }))
})

// User interactions
const shareProduct = async () => {
  try {
    const shareData = {
      title: getLocalizedText(product.value?.name as Record<string, string> | null | undefined),
      text: getLocalizedText(product.value?.shortDescription as Record<string, string> | null | undefined) || t('products.actions.shareText'),
      url: window.location.href,
    }
    if (navigator.share) {
      await navigator.share(shareData)
      shareFeedback.value = t('products.actions.sharedSuccess')
    }
    else if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
      shareFeedback.value = t('products.actions.linkCopied')
    }
    else {
      shareFeedback.value = t('products.actions.copyFallback')
    }
    setTimeout(() => {
      shareFeedback.value = null
    }, 4000)
  }
  catch (err: unknown) {
    console.error('Share failed', getErrorMessage(err))
    shareFeedback.value = t('products.actions.shareError')
  }
}

// Image zoom modal handlers
const openZoomModal = () => {
  showZoomModal.value = true
}

const addToCart = async () => {
  if (!product.value) return

  // CRITICAL SSR Guard: Cart operations require browser APIs
  //
  // Context: This guard prevents SSR hydration mismatches on Vercel deployment
  // Root causes:
  // - Cart store uses localStorage which is undefined during SSR
  // - Haptic feedback APIs (vibrate) only exist in browser context
  // - User session state unavailable during server render
  //
  // Behavior: Server-rendered buttons appear but don't execute cart logic
  // until hydration completes. This is intentional and prevents 500 errors.
  if (import.meta.server || typeof window === 'undefined') {
    return
  }

  // Development-only debug logging (tree-shaken in production)
  //
  // Added to diagnose SSR-related cart failures (commit ffbe86a)
  // Logs only appear in dev mode; completely removed from production bundles
  //
  // Key diagnostics:
  // - isClient: Should be true for cart operations
  // - hasWindow: Verifies browser context availability
  // - addItemType: Confirms cart composable loaded correctly
  if (import.meta.dev) {
    const _debugInfo = {
      productId: product.value.id,
      quantity: selectedQuantity.value,
      isClient: import.meta.client,
      hasWindow: typeof window !== 'undefined',
      addItemType: typeof addItem,
    }
    // Debug info available in debugInfo variable
  }

  try {
    if (typeof addItem !== 'function') {
      const error = `addItem is not a function (type: ${typeof addItem})`
      console.error('❌', getErrorMessage(error))
      throw new Error(error)
    }

    // Construct the product object in the format expected by the cart store
    const cartProduct: Product = {
      id: product.value.id.toString(),
      slug: product.value.slug,
      name: getLocalizedText(product.value.name as Record<string, string>),
      price: Number(product.value.price),
      images: product.value.images?.map(img => img.url) || [],
      stock: product.value.stockQuantity,
    }

    await addItem(cartProduct, selectedQuantity.value)

    // Show success toast
    const productName = getLocalizedText(product.value.name as Record<string, string>)
    toast.success(
      t('cart.success.added'),
      t('cart.success.productAdded', { product: productName }),
    )

    // Add to cart succeeded
  }
  catch (err: unknown) {
    const errorMsg = err instanceof Error ? getErrorMessage(err) : String(err)
    console.error('Add to cart failed:', errorMsg, err)

    // Show error toast
    toast.error(
      t('cart.error.addFailed'),
      t('cart.error.addFailedDetails'),
    )
  }
}

// Watch for product changes
watch(product, (newProduct) => {
  if (newProduct) {
    selectedImageIndex.value = 0
    if ((newProduct.stockQuantity || 0) < selectedQuantity.value) {
      selectedQuantity.value = Math.max(1, newProduct.stockQuantity || 1)
    }
    // Cast to ProductWithRelations for recently viewed
    const productForHistory = newProduct as unknown as ProductWithRelations
    recentlyViewedProducts.value = [
      productForHistory,
      ...recentlyViewedProducts.value.filter(item => item.id !== newProduct.id),
    ].slice(0, 8)
  }
}, { immediate: true })

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
