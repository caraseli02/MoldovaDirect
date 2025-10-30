<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('shipping.title') }}</h1>
    <div class="prose max-w-none">
      <p>{{ $t('shipping.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const description =
  'Review Moldova Direct shipping methods, delivery timelines, and coverage across Spain for Moldovan food and wine orders.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Shipping Information',
  url: toAbsoluteUrl('/shipping'),
  description,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Moldova Direct',
    url: siteUrl
  }
}

useLandingSeo({
  title: 'Shipping Information - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Courier delivering Moldova Direct orders across Spain',
  pageType: 'webpage',
  keywords: ['Moldova Direct shipping', 'Moldovan food delivery Spain', 'shipping Moldova Direct'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Shipping', path: '/shipping' }
  ],
  structuredData
})
</script>
