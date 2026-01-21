<template>
  <div class="py-12 md:py-20">
    <div class="container">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold mb-8">
          {{ $t('common.contact') }}
        </h1>

        <div class="grid md:grid-cols-2 gap-12">
          <!-- Contact Form -->
          <div>
            <h2 class="text-2xl font-semibold mb-6">
              Send us a message
            </h2>
            <form
              class="space-y-4"
              @submit.prevent="handleSubmit"
            >
              <div>
                <UiLabel for="name">
                  Name
                </UiLabel>
                <UiInput
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                />
              </div>

              <div>
                <UiLabel for="email">
                  Email
                </UiLabel>
                <UiInput
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                />
              </div>

              <div>
                <UiLabel for="subject">
                  Subject
                </UiLabel>
                <UiInput
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  required
                />
              </div>

              <div>
                <UiLabel for="message">
                  Message
                </UiLabel>
                <UiTextarea
                  id="message"
                  v-model="form.message"
                  rows="6"
                  required
                />
              </div>

              <UiButton
                type="submit"
                class="w-full"
              >
                Send Message
              </UiButton>
            </form>
          </div>

          <!-- Contact Information -->
          <div>
            <h2 class="text-2xl font-semibold mb-6">
              Get in Touch
            </h2>

            <div class="space-y-6">
              <div>
                <h3 class="font-semibold text-gray-900 mb-2">
                  Email
                </h3>
                <p class="text-gray-600">
                  info@moldovadirect.com
                </p>
                <p class="text-gray-600">
                  support@moldovadirect.com
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">
                  Phone
                </h3>
                <p class="text-gray-600">
                  +34 910 000 000
                </p>
                <p class="text-sm text-gray-500">
                  Monday - Friday: 9:00 - 18:00
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">
                  Office
                </h3>
                <p class="text-gray-600">
                  Moldova Direct S.L.<br />
                  Madrid, Spain
                </p>
              </div>

              <div>
                <h3 class="font-semibold text-gray-900 mb-2">
                  Follow Us
                </h3>
                <div class="flex space-x-4">
                  <a
                    href="#"
                    class="text-gray-600 hover:text-primary-600"
                  >
                    <svg
                      class="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    class="text-gray-600 hover:text-primary-600"
                  >
                    <svg
                      class="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CONTACT_INFO } from '~/constants/seo'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

const { toAbsoluteUrl, siteUrl } = useSiteUrl()

const form = ref<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const handleSubmit = () => {
  // TODO: Implement form submission
  // Reset form
  form.value = {
    name: '',
    email: '',
    subject: '',
    message: '',
  }
  alert('Thank you for your message! We will get back to you soon.')
}

const description
  = 'Contact Moldova Direct for questions about Moldovan products, orders, or partnerships. We are here to help!'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  'name': 'Contact Moldova Direct',
  'url': toAbsoluteUrl('/contact'),
  description,
  'mainEntity': {
    '@type': 'Organization',
    'name': 'Moldova Direct',
    'url': siteUrl,
    'logo': toAbsoluteUrl('/icon.svg'),
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'contactType': 'customer service',
        'email': CONTACT_INFO.EMAIL.SUPPORT,
        'telephone': CONTACT_INFO.PHONE,
        'areaServed': 'ES',
        'availableLanguage': ['es', 'en', 'ro', 'ru'],
      },
    ],
  },
}

useLandingSeo({
  title: 'Contact Us - Moldova Direct',
  description,
  image: '/icon.svg',
  imageAlt: 'Customer support team ready to assist Moldova Direct shoppers',
  pageType: 'webpage',
  keywords: ['contact Moldova Direct', 'Moldovan products support', 'Moldova Direct customer service'],
  breadcrumbs: [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ],
  structuredData,
})
</script>
