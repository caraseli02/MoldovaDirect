<template>
  <div class="py-12 md:py-20">
    <div class="container">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          {{ $t('common.about') }}
        </h1>

        <div class="prose prose-lg max-w-none">
          <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
            {{ $t('aboutPage.title') }}
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            {{ $t('aboutPage.mission.title') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            {{ $t('aboutPage.mission.description') }}
          </p>

          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            {{ $t('aboutPage.whyChooseUs.title') }}
          </h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li>{{ $t('aboutPage.whyChooseUs.item1') }}</li>
            <li>{{ $t('aboutPage.whyChooseUs.item2') }}</li>
            <li>{{ $t('aboutPage.whyChooseUs.item3') }}</li>
            <li>{{ $t('aboutPage.whyChooseUs.item4') }}</li>
            <li>{{ $t('aboutPage.whyChooseUs.item5') }}</li>
          </ul>

          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">
            {{ $t('aboutPage.story.title') }}
          </h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            {{ $t('aboutPage.story.p1') }}
          </p>

          <p class="text-gray-700 dark:text-gray-300 mb-6">
            {{ $t('aboutPage.story.p2') }}
          </p>

          <div class="bg-slate-50 dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg mt-8">
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              {{ $t('aboutPage.getInTouch.title') }}
            </h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              {{ $t('aboutPage.getInTouch.description') }}
            </p>
            <NuxtLink
              :to="localePath('/contact')"
              class="inline-block bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              {{ $t('common.contact') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  'name': t('seo.about.title'),
  'url': toAbsoluteUrl('/about'),
  'description': t('seo.about.description'),
  'primaryImageOfPage': {
    '@type': 'ImageObject',
    'url': toAbsoluteUrl('/icon.svg'),
  },
  'mainEntity': {
    '@type': 'Organization',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'logo': toAbsoluteUrl('/icon.svg'),
  },
}

useLandingSeo({
  title: t('seo.about.title'),
  description: t('seo.about.description'),
  image: '/icon.svg',
  imageAlt: 'Moldova Direct team presenting Moldovan delicacies',
  pageType: 'webpage',
  keywords: ['Moldova Direct mission', 'about Moldova Direct', 'Moldovan products company'],
  breadcrumbs: [
    { name: t('common.home'), path: '/' },
    { name: t('common.about'), path: '/about' },
  ],
  structuredData,
})
</script>
