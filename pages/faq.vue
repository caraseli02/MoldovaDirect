<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">
      {{ $t('faq.title') }}
    </h1>
    <div class="prose max-w-none">
      <p>{{ $t('faq.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { toAbsoluteUrl } = useSiteUrl()

const description
  = 'Find quick answers about Moldova Direct orders, shipping timelines, and authentic Moldovan product sourcing.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'url': toAbsoluteUrl('/faq'),
  description,
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Where do Moldova Direct products ship from?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'All Moldova Direct orders are dispatched from our Madrid fulfilment centre to ensure fast delivery across Spain.',
      },
    },
    {
      '@type': 'Question',
      'name': 'How long does delivery take within Spain?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Standard deliveries arrive within 48-72 hours. Express options are available at checkout for urgent orders.',
      },
    },
  ],
}

useLandingSeo({
  title: 'Frequently Asked Questions - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Illustration of customers finding answers to Moldova Direct questions',
  pageType: 'webpage',
  keywords: ['Moldova Direct FAQ', 'Moldovan product questions', 'Moldova Direct shipping'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'FAQ', path: '/faq' },
  ],
  structuredData,
})
</script>
