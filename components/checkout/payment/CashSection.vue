<template>
  <div class="space-y-4">
    <div class="text-center py-8">
      <commonIcon
        name="lucide:banknote"
        class="h-16 w-16 text-green-600 mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {{ $t('checkout.payment.cash.title') }}
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ $t('checkout.payment.cash.description') }}
      </p>
    </div>

    <!-- Cash Payment Instructions -->
    <div
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6"
      role="region"
      aria-labelledby="cash-instructions-title"
    >
      <h4
        id="cash-instructions-title"
        class="text-md font-semibold text-green-900 dark:text-green-100 mb-4"
      >
        {{ $t('checkout.payment.cashInstructions') }}
      </h4>

      <ul
        class="space-y-3 text-sm text-green-800 dark:text-green-200"
        role="list"
      >
        <li class="flex items-start space-x-2">
          <commonIcon
            name="lucide:check-circle-2"
            class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ $t('checkout.payment.cashInstruction1') }}</span>
        </li>
        <li class="flex items-start space-x-2">
          <commonIcon
            name="lucide:check-circle-2"
            class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ $t('checkout.payment.cashInstruction2') }}</span>
        </li>
        <li class="flex items-start space-x-2">
          <commonIcon
            name="lucide:check-circle-2"
            class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ $t('checkout.payment.cashInstruction3') }}</span>
        </li>
        <li class="flex items-start space-x-2">
          <commonIcon
            name="lucide:check-circle-2"
            class="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0"
            aria-hidden="true"
          />
          <span>{{ $t('checkout.payment.cashInstruction4') }}</span>
        </li>
      </ul>
    </div>

    <!-- Contact Information Notice -->
    <div
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      role="status"
    >
      <div class="flex">
        <commonIcon
          name="lucide:info"
          class="h-5 w-5 text-blue-400 mr-2 mt-0.5"
          aria-hidden="true"
        />
        <div>
          <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
            {{ $t('checkout.payment.contactNoticeTitle') }}
          </h3>
          <p class="text-sm text-blue-700 dark:text-blue-300 mt-1">
            {{ $t('checkout.payment.contactNotice') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Cash payment section is display-only, no additional logic needed
</script>
