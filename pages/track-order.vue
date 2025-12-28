<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
          <svg
            class="w-8 h-8 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {{ $t('trackOrder.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ $t('trackOrder.subtitle') }}
        </p>
      </div>

      <!-- Search Form -->
      <div
        v-if="!trackingData"
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <form
          class="space-y-4"
          @submit.prevent="trackOrder"
        >
          <div>
            <label
              for="orderNumber"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('trackOrder.orderNumber') }}
            </label>
            <input
              id="orderNumber"
              v-model="orderNumber"
              type="text"
              :placeholder="$t('trackOrder.orderNumberPlaceholder')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
          </div>
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {{ $t('trackOrder.email') }}
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('trackOrder.emailPlaceholder')"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div class="flex items-center gap-2">
              <svg
                class="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="text-sm text-red-700 dark:text-red-300">{{ error }}</span>
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              v-if="loading"
              class="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ loading ? $t('common.loading') : $t('trackOrder.trackButton') }}
          </button>
        </form>
      </div>

      <!-- Tracking Results -->
      <div
        v-if="trackingData"
        class="space-y-6"
      >
        <!-- Back Button -->
        <button
          type="button"
          class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="resetSearch"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ $t('trackOrder.trackAnother') }}
        </button>

        <!-- Order Summary Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('trackOrder.orderNumber') }}</p>
                <p class="text-lg font-bold text-gray-900 dark:text-white">{{ trackingData.orderNumber }}</p>
              </div>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getStatusClasses(trackingData.status)"
              >
                {{ $t(`trackOrder.status.${trackingData.status}`) }}
              </span>
            </div>

            <!-- Tracking Number -->
            <div
              v-if="trackingData.trackingNumber"
              class="flex items-center gap-2 text-sm"
            >
              <span class="text-gray-500 dark:text-gray-400">{{ $t('trackOrder.trackingNumber') }}:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ trackingData.trackingNumber }}</span>
              <span
                v-if="trackingData.carrier"
                class="text-gray-500 dark:text-gray-400"
              >({{ trackingData.carrier }})</span>
            </div>

            <!-- Estimated Delivery -->
            <div
              v-if="trackingData.estimatedDelivery"
              class="flex items-center gap-2 text-sm mt-2"
            >
              <span class="text-gray-500 dark:text-gray-400">{{ $t('trackOrder.estimatedDelivery') }}:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ formatDate(trackingData.estimatedDelivery) }}</span>
            </div>
          </div>

          <!-- Status Progress -->
          <div class="p-6 bg-gray-50 dark:bg-gray-900/50">
            <div class="flex items-center justify-between relative">
              <!-- Progress Line -->
              <div class="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div
                class="absolute top-4 left-0 h-0.5 bg-primary-500 transition-all duration-500"
                :style="{ width: `${getProgressWidth(trackingData.status)}%` }"
              ></div>

              <!-- Steps -->
              <div
                v-for="(step, index) in statusSteps"
                :key="step.key"
                class="relative flex flex-col items-center"
              >
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
                  :class="getStepClasses(step.key, trackingData.status)"
                >
                  <svg
                    v-if="isStepCompleted(step.key, trackingData.status)"
                    class="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span
                    v-else
                    class="text-xs font-medium"
                  >{{ index + 1 }}</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center max-w-16">
                  {{ $t(`trackOrder.steps.${step.key}`) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div
          v-if="trackingData.items && trackingData.items.length > 0"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('trackOrder.orderItems') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="(item, index) in trackingData.items"
              :key="index"
              class="flex items-center gap-4"
            >
              <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="getLocalizedText(item.name)"
                  class="w-full h-full object-cover"
                >
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400"
                >
                  <svg
                    class="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-900 dark:text-white truncate">
                  {{ getLocalizedText(item.name) }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('common.quantity') }}: {{ item.quantity }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ formatPrice(item.price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Total -->
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <span class="font-medium text-gray-900 dark:text-white">{{ $t('common.total') }}</span>
            <span class="text-lg font-bold text-gray-900 dark:text-white">{{ formatPrice(trackingData.total) }}</span>
          </div>
        </div>

        <!-- Tracking Events -->
        <div
          v-if="trackingData.events && trackingData.events.length > 0"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('trackOrder.trackingHistory') }}
          </h3>
          <div class="space-y-4">
            <div
              v-for="(event, index) in trackingData.events"
              :key="index"
              class="flex gap-4"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="index === 0 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
                ></div>
                <div
                  v-if="index < trackingData.events.length - 1"
                  class="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1"
                ></div>
              </div>
              <div class="flex-1 pb-4">
                <p class="font-medium text-gray-900 dark:text-white">{{ event.status }}</p>
                <p
                  v-if="event.description"
                  class="text-sm text-gray-600 dark:text-gray-400"
                >
                  {{ event.description }}
                </p>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-500">
                  <span>{{ formatDateTime(event.timestamp) }}</span>
                  <span
                    v-if="event.location"
                    class="flex items-center gap-1"
                  >
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {{ event.location }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Shipping Info -->
        <div
          v-if="trackingData.shippingAddress"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ $t('trackOrder.shippingTo') }}
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            {{ trackingData.shippingAddress.city }}, {{ trackingData.shippingAddress.postalCode }}
          </p>
          <p class="text-gray-600 dark:text-gray-400">
            {{ trackingData.shippingAddress.country }}
          </p>
        </div>

        <!-- Help Section -->
        <div class="text-center">
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            {{ $t('trackOrder.needHelp') }}
          </p>
          <NuxtLink
            :to="localePath('/contact')"
            class="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {{ $t('trackOrder.contactSupport') }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

// Form state
const orderNumber = ref('')
const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const trackingData = ref<any>(null)

// Status steps for progress display
const statusSteps = [
  { key: 'confirmed' },
  { key: 'processing' },
  { key: 'shipped' },
  { key: 'delivered' },
]

// SEO
useHead({
  title: () => t('trackOrder.pageTitle'),
  meta: [
    { name: 'description', content: () => t('trackOrder.pageDescription') },
  ],
})

// Methods
const trackOrder = async () => {
  if (!orderNumber.value || !email.value) return

  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/orders/track', {
      method: 'POST',
      body: {
        orderNumber: orderNumber.value,
        email: email.value,
      },
    })

    if (response.success) {
      trackingData.value = response.data
    }
  }
  catch (err: any) {
    if (err.statusCode === 404) {
      error.value = t('trackOrder.errors.notFound')
    }
    else {
      error.value = t('trackOrder.errors.generic')
    }
  }
  finally {
    loading.value = false
  }
}

const resetSearch = () => {
  trackingData.value = null
  orderNumber.value = ''
  email.value = ''
  error.value = null
}

const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text[locale.value] || text.es || text.en || Object.values(text)[0] || ''
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: trackingData.value?.currency || 'EUR',
  }).format(price)
}

const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString))
}

const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const getStatusClasses = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
  return statusMap[status] || statusMap.pending
}

const getProgressWidth = (status: string): number => {
  const statusProgress: Record<string, number> = {
    pending: 0,
    confirmed: 25,
    processing: 50,
    shipped: 75,
    delivered: 100,
  }
  return statusProgress[status] || 0
}

const getStepClasses = (stepKey: string, currentStatus: string): string => {
  const stepOrder = ['confirmed', 'processing', 'shipped', 'delivered']
  const currentIndex = stepOrder.indexOf(currentStatus)
  const stepIndex = stepOrder.indexOf(stepKey)

  if (stepIndex <= currentIndex) {
    return 'bg-primary-500 text-white'
  }
  return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
}

const isStepCompleted = (stepKey: string, currentStatus: string): boolean => {
  const stepOrder = ['confirmed', 'processing', 'shipped', 'delivered']
  const currentIndex = stepOrder.indexOf(currentStatus)
  const stepIndex = stepOrder.indexOf(stepKey)
  return stepIndex < currentIndex
}
</script>
