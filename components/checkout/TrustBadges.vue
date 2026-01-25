<template>
  <div class="trust-badges">
    <!-- Compact inline version for header -->
    <div
      v-if="variant === 'compact'"
      class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400"
    >
      <div class="flex items-center gap-1.5">
        <svg
          class="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span>{{ $t('checkout.trust.secureCheckout') }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <svg
          class="w-4 h-4 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span>{{ $t('checkout.trust.sslEncrypted') }}</span>
      </div>
    </div>

    <!-- Full version for sidebar/footer -->
    <div
      v-else
      class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-2 mb-3">
        <svg
          class="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        <span class="font-medium text-gray-900 dark:text-white">
          {{ $t('checkout.trust.secureCheckout') }}
        </span>
      </div>

      <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <li
          v-for="item in trustItems"
          :key="item"
          class="flex items-center gap-2"
        >
          <svg
            class="w-4 h-4 text-green-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          {{ $t(item) }}
        </li>
      </ul>

      <!-- Customer Service -->
      <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t('checkout.trust.needHelp') }}
          <a
            :href="`mailto:${supportEmail}`"
            class="text-slate-600 hover:underline"
          >
            {{ supportEmail }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'compact' | 'full'
}

withDefaults(defineProps<Props>(), {
  variant: 'full',
})

// Trust items for v-for loop
const trustItems = [
  'checkout.trust.sslEncrypted',
  'checkout.trust.dataProtected',
  'checkout.trust.moneyBackGuarantee',
] as const

// Use runtime config for support email with fallback
const config = useRuntimeConfig()
const supportEmail = computed(() => config.public?.supportEmail || 'support@moldovadirect.com')
</script>
