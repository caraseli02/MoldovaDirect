<template>
  <div class="py-12 md:py-20">
    <div class="container">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8 text-gray-900 dark:text-white">{{ $t('common.about') }}</h1>
        
        <div class="prose prose-lg max-w-none">
          <p class="text-xl text-gray-700 dark:text-gray-300 mb-6">
            Welcome to Moldova Direct, your gateway to authentic Moldovan products in Spain.
          </p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Our Mission</h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            We are dedicated to bringing the rich flavors and traditions of Moldova directly to your doorstep. 
            Our mission is to connect the Moldovan diaspora and food enthusiasts in Spain with the authentic 
            tastes of Moldova, from its world-renowned wines to traditional preserves and delicacies.
          </p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Why Choose Us</h2>
          <ul class="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-6">
            <li>Direct partnerships with Moldovan producers</li>
            <li>Guaranteed authenticity and quality</li>
            <li>Fast and reliable delivery across Spain</li>
            <li>Competitive prices with no hidden fees</li>
            <li>Customer support in multiple languages</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-white">Our Story</h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Founded by Moldovan expats living in Spain, Moldova Direct was born from a simple desire: 
            to share the exceptional products of our homeland with our new home. We understand the nostalgia 
            for authentic flavors and the difficulty in finding genuine Moldovan products abroad.
          </p>
          
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            That's why we've established direct relationships with trusted producers in Moldova, 
            ensuring that every product we offer meets the highest standards of quality and authenticity. 
            From family-owned wineries to artisanal food producers, we work only with partners who share 
            our commitment to excellence.
          </p>
          
          <div class="bg-primary-50 dark:bg-gray-800 dark:border dark:border-gray-700 p-6 rounded-lg mt-8">
            <h3 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Get in Touch</h3>
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              Have questions or suggestions? We'd love to hear from you!
            </p>
            <NuxtLink 
              :to="localePath('/contact')" 
              class="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Contact Us
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const description =
  'Learn about Moldova Direct, your trusted source for authentic Moldovan products in Spain. Direct from producers to your home.'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Moldova Direct',
  url: toAbsoluteUrl('/about'),
  description,
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: toAbsoluteUrl('/icon.svg')
  },
  mainEntity: {
    '@type': 'Organization',
    name: 'Moldova Direct',
    url: siteUrl,
    logo: toAbsoluteUrl('/icon.svg')
  }
}

useLandingSeo({
  title: 'About Us - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Moldova Direct team presenting Moldovan delicacies',
  pageType: 'webpage',
  keywords: ['Moldova Direct mission', 'about Moldova Direct', 'Moldovan products company'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' }
  ],
  structuredData
})
</script>
