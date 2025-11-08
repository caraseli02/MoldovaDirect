<template>
  <div class="bg-white dark:bg-black text-gray-900 dark:text-white">
    <!-- Hero Section 1 - Full screen Apple style -->
    <section class="min-h-screen flex items-center justify-center text-center px-4 pt-[44px] pb-20 bg-white dark:bg-black">
      <div class="max-w-[980px] mx-auto">
        <h1 class="text-[48px] sm:text-[56px] md:text-[64px] lg:text-[80px] font-semibold tracking-tight leading-[1.05] mb-[0.4em] text-gray-900 dark:text-white">
          Moldova Direct
        </h1>
        <p class="text-[21px] sm:text-[24px] md:text-[28px] font-normal leading-[1.2] mb-[0.8em] text-gray-900 dark:text-white">
          Taste Moldova in every delivery.
        </p>
        <p class="text-[17px] sm:text-[19px] md:text-[21px] font-normal leading-[1.4] mb-[1.2em] text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
          Authentic Moldovan wines, gourmet foods, and artisan products delivered fresh across Spain.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <NuxtLink
            :to="localePath('/products')"
            class="inline-flex items-center justify-center min-w-[28px] px-[22px] h-[44px] text-[17px] font-normal rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            Shop Now
          </NuxtLink>
          <NuxtLink
            :to="localePath('/about')"
            class="inline-flex items-center justify-center min-w-[28px] px-[22px] h-[44px] text-[17px] font-normal rounded-full border border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-white transition-all"
          >
            Learn more
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Feature Section 1 - Wine -->
    <section class="py-20 md:py-[120px] bg-gray-50 dark:bg-gray-950">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6">
        <div class="text-center mb-12 md:mb-20">
          <h2 class="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight leading-[1.05] mb-[0.3em] text-gray-900 dark:text-white">
            Premium Wines
          </h2>
          <p class="text-[19px] sm:text-[21px] md:text-[24px] font-normal leading-[1.3] text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
            Curated from Moldova's finest vineyards. Each bottle tells a story.
          </p>
        </div>

        <!-- Product showcase -->
        <div class="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 mb-10">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-[120px]">🍷</div>
          </div>
        </div>

        <div class="text-center">
          <NuxtLink
            :to="localePath('/products')"
            class="inline-flex items-center text-[17px] sm:text-[19px] md:text-[21px] font-normal text-blue-500 dark:text-blue-400 hover:underline"
          >
            Explore wines
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Feature Section 2 - Foods -->
    <section class="py-20 md:py-[120px] bg-white dark:bg-black">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6">
        <div class="text-center mb-12 md:mb-20">
          <h2 class="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight leading-[1.05] mb-[0.3em] text-gray-900 dark:text-white">
            Artisan Foods
          </h2>
          <p class="text-[19px] sm:text-[21px] md:text-[24px] font-normal leading-[1.3] text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
            From traditional cheeses to handcrafted preserves. Authentic flavors.
          </p>
        </div>

        <div class="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 mb-10">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-[120px]">🧀</div>
          </div>
        </div>

        <div class="text-center">
          <NuxtLink
            :to="localePath('/products')"
            class="inline-flex items-center text-[17px] sm:text-[19px] md:text-[21px] font-normal text-blue-500 dark:text-blue-400 hover:underline"
          >
            Discover foods
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Feature Section 3 - Gifts -->
    <section class="py-20 md:py-[120px] bg-gray-50 dark:bg-gray-950">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6">
        <div class="text-center mb-12 md:mb-20">
          <h2 class="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight leading-[1.05] mb-[0.3em] text-gray-900 dark:text-white">
            Perfect Gifts
          </h2>
          <p class="text-[19px] sm:text-[21px] md:text-[24px] font-normal leading-[1.3] text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
            Beautifully curated. Share the taste of Moldova.
          </p>
        </div>

        <div class="relative aspect-[4/3] rounded-[18px] overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 mb-10">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-[120px]">🎁</div>
          </div>
        </div>

        <div class="text-center">
          <NuxtLink
            :to="localePath('/products')"
            class="inline-flex items-center text-[17px] sm:text-[19px] md:text-[21px] font-normal text-blue-500 dark:text-blue-400 hover:underline"
          >
            Browse gifts
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Stats Section - Apple minimal style -->
    <section class="py-20 md:py-[120px] bg-white dark:bg-black">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div>
            <div class="text-[56px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.05] mb-2 text-gray-900 dark:text-white">
              5000+
            </div>
            <div class="text-[17px] md:text-[19px] font-normal text-gray-600 dark:text-gray-400">
              Happy Customers
            </div>
          </div>
          <div>
            <div class="text-[56px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.05] mb-2 text-gray-900 dark:text-white">
              500+
            </div>
            <div class="text-[17px] md:text-[19px] font-normal text-gray-600 dark:text-gray-400">
              Premium Products
            </div>
          </div>
          <div>
            <div class="text-[56px] md:text-[64px] lg:text-[72px] font-semibold leading-[1.05] mb-2 text-gray-900 dark:text-white">
              24h
            </div>
            <div class="text-[17px] md:text-[19px] font-normal text-gray-600 dark:text-gray-400">
              Fast Delivery
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA - Full width Apple style -->
    <section class="py-[120px] md:py-[160px] bg-gray-50 dark:bg-gray-950 text-center">
      <div class="max-w-[980px] mx-auto px-4 sm:px-6">
        <h2 class="text-[40px] sm:text-[48px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight leading-[1.05] mb-[0.3em] text-gray-900 dark:text-white">
          Start your journey
        </h2>
        <p class="text-[19px] sm:text-[21px] md:text-[24px] font-normal leading-[1.3] mb-[1.2em] text-gray-600 dark:text-gray-400 max-w-[700px] mx-auto">
          Experience the authentic taste of Moldova.
        </p>
        <NuxtLink
          :to="localePath('/products')"
          class="inline-flex items-center justify-center min-w-[28px] px-[22px] h-[44px] text-[17px] font-normal rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
        >
          Shop Now
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { siteUrl, toAbsoluteUrl } = useSiteUrl()

useLandingSeo({
  title: 'Moldova Direct – Taste Moldova in Every Delivery',
  description: 'Authentic Moldovan wines, gourmet foods, and artisan products delivered fresh across Spain.',
  image: '/icon.svg',
  imageAlt: 'Moldova Direct - Premium Moldovan Products',
  pageType: 'website',
  keywords: [
    'Moldovan wine delivery',
    'Moldovan gourmet food Spain',
    'authentic Moldovan products',
    'Moldova Direct store'
  ],
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Moldova Direct',
      url: siteUrl,
      logo: toAbsoluteUrl('/icon.svg')
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Moldova Direct',
      url: siteUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/products?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  ]
})
</script>
