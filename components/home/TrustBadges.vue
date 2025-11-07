<template>
  <section class="bg-gray-50 py-12 dark:bg-gray-900/50">
    <div class="container">
      <div
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{
          opacity: 1,
          y: 0,
          transition: { duration: 600 },
        }"
        class="mx-auto max-w-6xl"
      >
        <!-- Trust Guarantees -->
        <div class="grid gap-6 md:grid-cols-4">
          <div
            v-for="(badge, index) in badges"
            :key="badge.title"
            v-motion
            :initial="{ opacity: 0, y: 20 }"
            :visible-once="{
              opacity: 1,
              y: 0,
              transition: { duration: 400, delay: 100 + index * 100 },
            }"
            class="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm transition-all hover:shadow-md dark:bg-gray-900"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
            >
              <commonIcon :name="badge.icon" class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ badge.title }}</h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ badge.description }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Methods & Security -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 500, delay: 500 },
          }"
          class="mt-12 rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"
        >
          <!-- Payment Methods -->
          <div class="mb-8">
            <p class="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              {{ t('home.trustBadges.paymentMethods') }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-6">
              <div
                v-for="(method, index) in paymentMethods"
                :key="method.name"
                v-motion
                :initial="{ opacity: 0, scale: 0.8 }"
                :visible-once="{
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 300, delay: 600 + index * 50 },
                }"
                class="flex h-12 items-center justify-center rounded-lg bg-gray-50 px-4 transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750"
                :title="method.name"
              >
                <commonIcon :name="method.icon" class="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Security Badges -->
          <div class="border-t border-gray-200 pt-8 dark:border-gray-800">
            <p class="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              {{ t('home.trustBadges.security') }}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-8">
              <div
                v-for="(security, index) in securityBadges"
                :key="security.name"
                v-motion
                :initial="{ opacity: 0, y: 10 }"
                :visible-once="{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 300, delay: 700 + index * 50 },
                }"
                class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <commonIcon :name="security.icon" class="h-5 w-5 text-green-600 dark:text-green-500" />
                <span class="font-medium">{{ security.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Support CTA (Optional) -->
        <div
          v-if="showSupportCta"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visible-once="{
            opacity: 1,
            y: 0,
            transition: { duration: 500, delay: 800 },
          }"
          class="mt-8 text-center"
        >
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ t('home.trustBadges.supportText') }}
          </p>
          <NuxtLink
            :to="localePath('/contact')"
            class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ t('home.trustBadges.contactUs') }}
            <commonIcon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface Badge {
  title: string
  description: string
  icon: string
}

interface PaymentMethod {
  name: string
  icon: string
}

interface SecurityBadge {
  name: string
  icon: string
}

withDefaults(
  defineProps<{
    badges?: Badge[]
    paymentMethods?: PaymentMethod[]
    securityBadges?: SecurityBadge[]
    showSupportCta?: boolean
  }>(),
  {
    showSupportCta: true,
    badges: () => [
      {
        title: 'Free Shipping',
        description: 'On orders over €50',
        icon: 'lucide:truck'
      },
      {
        title: '30-Day Returns',
        description: 'Money-back guarantee',
        icon: 'lucide:rotate-ccw'
      },
      {
        title: 'Secure Payment',
        description: 'SSL encrypted checkout',
        icon: 'lucide:shield-check'
      },
      {
        title: '24/7 Support',
        description: 'We\'re here to help',
        icon: 'lucide:headphones'
      }
    ],
    paymentMethods: () => [
      { name: 'Visa', icon: 'lucide:credit-card' },
      { name: 'Mastercard', icon: 'lucide:credit-card' },
      { name: 'PayPal', icon: 'lucide:wallet' },
      { name: 'Apple Pay', icon: 'lucide:apple' },
      { name: 'Google Pay', icon: 'lucide:smartphone' },
      { name: 'Bank Transfer', icon: 'lucide:landmark' }
    ],
    securityBadges: () => [
      { name: 'SSL Secure', icon: 'lucide:lock' },
      { name: 'PCI Compliant', icon: 'lucide:shield' },
      { name: 'GDPR Protected', icon: 'lucide:shield-check' }
    ]
  }
)

const { t } = useI18n()
const localePath = useLocalePath()
</script>
