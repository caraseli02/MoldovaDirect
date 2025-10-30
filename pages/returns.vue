<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">{{ $t('returns.title') }}</h1>
    <div class="prose max-w-none">
      <p>{{ $t('returns.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const description =
  'Understand Moldova Direct return windows, refund eligibility, and how to request support for Moldovan food and wine orders.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Returns & Refunds',
  url: toAbsoluteUrl('/returns'),
  description,
  isPartOf: {
    '@type': 'WebSite',
    name: 'Moldova Direct',
    url: siteUrl
  }
}

useLandingSeo({
  title: 'Returns & Refunds - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Customer rep assisting with Moldova Direct return request',
  pageType: 'webpage',
  keywords: ['Moldova Direct returns', 'Moldova Direct refund policy', 'Moldovan products returns'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Returns', path: '/returns' }
  ],
  structuredData
})
</script>
