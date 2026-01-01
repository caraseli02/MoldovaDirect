<template>
  <div class="checkout-page">
    <div class="p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <!-- Success Header with Animated Checkmark -->
        <div class="mb-8 text-center">
          <div class="mb-4">
            <svg
              class="w-20 h-20 mx-auto fade-in"
              viewBox="0 0 100 100"
              role="img"
              aria-labelledby="success-icon-title"
            >
              <title id="success-icon-title">{{ $t('checkout.steps.confirmation.title') }}</title>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#16a34a"
                stroke-width="3"
                class="circle-animated"
              />
              <path
                d="M30 50 L42 62 L70 34"
                fill="none"
                stroke="#16a34a"
                stroke-width="5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="checkmark-animated"
              />
            </svg>
          </div>
          <h1 class="font-[family-name:var(--md-font-serif)] text-2xl font-normal text-[var(--md-charcoal)] dark:text-[var(--md-cream)] mb-2 slide-up stagger-1">
            {{ $t('checkout.steps.confirmation.title') }}
          </h1>
          <p class="text-base text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] slide-up stagger-2">
            {{ $t('checkout.steps.confirmation.subtitle') }}
          </p>
        </div>

        <!-- Order Number - Prominent with Wine Border -->
        <div
          v-if="orderData"
          class="bg-white dark:bg-[var(--md-charcoal-light)] border-2 border-[var(--md-wine)] rounded-lg p-4 mb-6 slide-up stagger-3"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
              {{ $t('checkout.confirmation.orderNumber') }}
            </span>
            <span class="flex items-center gap-2">
              <span class="w-2 h-2 bg-green-600 rounded-full status-pulse"></span>
              <span class="text-xs font-medium text-green-600">
                {{ $t('checkout.confirmation.status.confirmed').toUpperCase() }}
              </span>
            </span>
          </div>
          <p class="text-2xl font-bold text-[var(--md-charcoal)] dark:text-[var(--md-cream)] mb-3">
            {{ orderData.orderNumber || 'N/A' }}
          </p>
          <div class="flex items-center gap-2 text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] rounded-lg p-3">
            <svg
              class="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {{ $t('checkout.steps.confirmation.emailSent') }}
          </div>
        </div>

        <!-- Mini Progress / Order Status -->
        <div
          v-if="orderData"
          class="bg-white dark:bg-[var(--md-charcoal-light)] border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] rounded-lg p-4 mb-6 slide-up stagger-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
              {{ $t('checkout.confirmation.orderStatus') }}
            </h3>
            <span class="text-xs font-medium text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
              {{ $t('checkout.confirmation.stepIndicator', { current: 2, total: 3 }) }}
            </span>
          </div>

          <!-- Progress Bar with Animation -->
          <!-- Step 1 (Confirmed) complete, Step 2 (Preparing) in progress = 66% -->
          <div class="mb-4 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] rounded-full h-2 overflow-hidden">
            <div
              class="bg-[var(--md-wine)] h-2 rounded-full progress-fill"
              :style="{ '--target-width': '66%' }"
            ></div>
          </div>

          <!-- Mini Steps -->
          <div class="flex justify-between text-xs">
            <!-- Step 1: Confirmed -->
            <div class="text-center flex-1">
              <div class="w-6 h-6 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center text-white font-semibold text-xs">
                ✓
              </div>
              <p class="font-medium text-green-600">
                {{ $t('checkout.confirmation.status.confirmed') }}
              </p>
            </div>

            <!-- Step 2: Preparing (Current) -->
            <div class="text-center flex-1">
              <div class="w-6 h-6 bg-[var(--md-charcoal)] dark:bg-[var(--md-cream)] rounded-full mx-auto mb-1 flex items-center justify-center">
                <div class="w-1.5 h-1.5 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] rounded-full status-pulse"></div>
              </div>
              <p class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                {{ $t('checkout.confirmation.status.preparing') }}
              </p>
            </div>

            <!-- Step 3: Shipped (Pending) -->
            <div class="text-center flex-1">
              <div class="w-6 h-6 bg-[var(--md-gray-200)] dark:bg-[var(--md-gray-600)] rounded-full mx-auto mb-1"></div>
              <p class="text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
                {{ $t('checkout.confirmation.status.shipped') }}
              </p>
            </div>
          </div>

          <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] mt-4 text-center bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] rounded-lg p-2">
            {{ $t('checkout.confirmation.preparingOrder', { days: '2-3' }) }}
          </p>
        </div>

        <!-- Quick Info Cards -->
        <div
          v-if="orderData"
          class="grid grid-cols-2 gap-3 mb-6 slide-up stagger-5"
        >
          <!-- Delivery Card -->
          <button
            class="border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] rounded-lg p-3 text-left card-interactive bg-white dark:bg-[var(--md-charcoal-light)]"
            @click="scrollToOrderDetails()"
          >
            <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] mb-1">
              {{ $t('checkout.confirmation.delivery') }}
            </p>
            <p
              v-if="estimatedDeliveryDate"
              class="text-sm font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]"
            >
              {{ formatShortDate(estimatedDeliveryDate) }}
            </p>
            <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] mt-1">
              {{ shippingInfo?.method?.description || $t('checkout.confirmation.businessDays', { days: '3-5' }) }}
            </p>
          </button>

          <!-- Total Paid Card -->
          <button
            class="border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] rounded-lg p-3 text-left card-interactive bg-white dark:bg-[var(--md-charcoal-light)]"
            @click="toggleOrderSummary"
          >
            <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] mb-1">
              {{ $t('checkout.confirmation.totalPaid') }}
            </p>
            <p class="text-lg font-bold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
              {{ formatPrice(orderData.total || 0) }}
            </p>
            <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] mt-1">
              {{ $t('checkout.confirmation.viewDetails') }} →
            </p>
          </button>
        </div>

        <!-- Expandable Order Summary -->
        <div
          v-if="orderData"
          :class="['expandable mb-6', { expanded: isOrderSummaryExpanded }]"
        >
          <div class="bg-white dark:bg-[var(--md-charcoal-light)] border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] rounded-lg p-4">
            <h4 class="font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)] mb-4">
              {{ $t('common.orderSummary') }}
            </h4>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">{{ $t('common.subtotal') }}</span>
                <span class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ formatPrice(orderData.subtotal || 0) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">{{ $t('common.shipping') }}</span>
                <span class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                  {{ orderData.shippingCost === 0 ? $t('checkout.freeShipping') : formatPrice(orderData.shippingCost || 0) }}
                </span>
              </div>
              <div
                v-if="orderData.tax"
                class="flex justify-between text-sm"
              >
                <span class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">{{ $t('common.tax') }}</span>
                <span class="font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ formatPrice(orderData.tax || 0) }}</span>
              </div>
              <div class="flex justify-between pt-3 border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)]">
                <span class="font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ $t('common.total') }}</span>
                <span class="font-bold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">{{ formatPrice(orderData.total || 0) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Trust Elements -->
        <div
          v-if="orderData"
          class="flex items-center justify-center gap-6 mb-6 slide-up stagger-6"
        >
          <div
            v-for="trust in trustElements"
            :key="trust.key"
            class="text-center"
          >
            <div class="w-8 h-8 bg-[var(--md-cream)] dark:bg-[var(--md-charcoal)] rounded-full mx-auto mb-1 flex items-center justify-center">
              <svg
                class="w-4 h-4 text-[var(--md-charcoal)] dark:text-[var(--md-cream)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="trust.iconPath"
                />
              </svg>
            </div>
            <p class="text-xs text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
              {{ $t(trust.labelKey) }}
            </p>
          </div>
        </div>

        <!-- Order Details (Collapsible) -->
        <div
          v-if="orderData"
          id="order-details"
          class="mb-6"
        >
          <!-- Order Items Section -->
          <div class="bg-white dark:bg-[var(--md-charcoal-light)] rounded-lg border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] overflow-hidden mb-4">
            <button
              class="w-full p-4 flex items-center justify-between card-interactive"
              :aria-expanded="isOrderItemsExpanded"
              aria-controls="order-items-content"
              @click="toggleOrderItems"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-[var(--md-charcoal)] dark:text-[var(--md-cream)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <div class="text-left">
                  <h4 class="font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('checkout.confirmation.orderItems') }}
                  </h4>
                  <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ orderData.items?.length || 0 }} {{ $t('common.items') }}
                  </p>
                </div>
              </div>
              <svg
                :class="['w-5 h-5 text-[var(--md-gray-400)] transition-transform', { 'rotate-180': isOrderItemsExpanded }]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id="order-items-content"
              :class="['expandable px-4 pb-4', { expanded: isOrderItemsExpanded }]"
            >
              <div class="pt-4 border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] space-y-4">
                <div
                  v-for="item in orderData.items || []"
                  :key="item.productId"
                  class="flex items-center space-x-4"
                >
                  <!-- Product Image -->
                  <div class="flex-shrink-0">
                    <img
                      :src="getProductImage(item.productSnapshot)"
                      :alt="getLocalizedText(item.productSnapshot.name) || $t('common.product')"
                      class="w-14 h-14 object-cover rounded-lg border border-[var(--md-gray-200)] dark:border-[var(--md-gray-600)]"
                    />
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)] truncate">
                      {{ getLocalizedText(item.productSnapshot.name) }}
                    </h4>
                    <p class="text-xs text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
                      {{ $t('common.quantity') }}: {{ item.quantity }} × {{ formatPrice(item.price) }}
                    </p>
                  </div>

                  <!-- Item Total -->
                  <div class="text-right">
                    <p class="text-sm font-medium text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                      {{ formatPrice(item.total) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Shipping Information Section -->
          <div
            v-if="shippingInfo"
            class="bg-white dark:bg-[var(--md-charcoal-light)] rounded-lg border border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] overflow-hidden"
          >
            <button
              class="w-full p-4 flex items-center justify-between card-interactive"
              :aria-expanded="isShippingInfoExpanded"
              aria-controls="shipping-info-content"
              @click="toggleShippingInfo"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-5 h-5 text-[var(--md-charcoal)] dark:text-[var(--md-cream)]"
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
                <div class="text-left">
                  <h4 class="font-semibold text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    {{ $t('checkout.confirmation.shippingInfo') }}
                  </h4>
                  <p class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">
                    {{ shippingInfo?.address?.city }}, {{ shippingInfo?.address?.country }}
                  </p>
                </div>
              </div>
              <svg
                :class="['w-5 h-5 text-[var(--md-gray-400)] transition-transform', { 'rotate-180': isShippingInfoExpanded }]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id="shipping-info-content"
              :class="['expandable px-4 pb-4', { expanded: isShippingInfoExpanded }]"
            >
              <div class="pt-4 border-t border-[var(--md-gray-200)] dark:border-[var(--md-gray-700)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Shipping Address -->
                <div>
                  <h5 class="text-xs font-medium text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)] uppercase tracking-wide mb-2">
                    {{ $t('checkout.confirmation.shippingAddress') }}
                  </h5>
                  <div class="text-sm text-[var(--md-charcoal)] dark:text-[var(--md-cream)] space-y-1">
                    <p class="font-medium">
                      {{ shippingInfo.address.firstName }} {{ shippingInfo.address.lastName }}
                    </p>
                    <p v-if="shippingInfo.address.company">
                      {{ shippingInfo.address.company }}
                    </p>
                    <p>{{ shippingInfo.address.street }}</p>
                    <p>{{ shippingInfo.address.city }}, {{ shippingInfo.address.postalCode }}</p>
                    <p v-if="shippingInfo.address.province">
                      {{ shippingInfo.address.province }}
                    </p>
                    <p>{{ shippingInfo.address.country }}</p>
                    <p v-if="shippingInfo.address.phone">
                      {{ shippingInfo.address.phone }}
                    </p>
                  </div>
                </div>

                <!-- Shipping Method -->
                <div>
                  <h5 class="text-xs font-medium text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)] uppercase tracking-wide mb-2">
                    {{ $t('checkout.confirmation.shippingMethod') }}
                  </h5>
                  <div class="text-sm text-[var(--md-charcoal)] dark:text-[var(--md-cream)]">
                    <p class="font-medium">
                      {{ shippingInfo.method.name }}
                    </p>
                    <p class="text-[var(--md-gray-500)] dark:text-[var(--md-gray-400)]">
                      {{ shippingInfo.method.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="!orderData"
          class="flex flex-col justify-center items-center py-12"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--md-wine)] dark:border-[var(--md-gold)] mb-3"></div>
          <span class="text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)]">{{ $t('common.loading') }}</span>
        </div>

        <!-- Guest to Account Conversion Prompt -->
        <div
          v-if="orderData && isGuestCheckout && !isLoggedIn"
          class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 mb-6 slide-up stagger-6"
        >
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-800 rounded-full flex items-center justify-center">
              <svg
                class="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                {{ $t('checkout.confirmation.createAccount.title') }}
              </h3>
              <p class="text-sm text-indigo-700 dark:text-indigo-300 mb-4">
                {{ $t('checkout.confirmation.createAccount.description') }}
              </p>
              <ul class="space-y-2 mb-4">
                <li class="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <svg
                    class="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('checkout.confirmation.createAccount.benefits.trackOrders') }}
                </li>
                <li class="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <svg
                    class="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('checkout.confirmation.createAccount.benefits.fasterCheckout') }}
                </li>
                <li class="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <svg
                    class="w-4 h-4 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ $t('checkout.confirmation.createAccount.benefits.exclusiveOffers') }}
                </li>
              </ul>
              <NuxtLink
                :to="createAccountUrl"
                class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                {{ $t('checkout.confirmation.createAccount.button') }}
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="orderData"
          class="space-y-3 slide-up stagger-7"
        >
          <!-- Primary: View Order Details (always visible) -->
          <button
            class="w-full py-3 bg-[var(--md-wine)] hover:bg-[var(--md-wine-light)] text-white font-semibold rounded-lg btn-primary flex items-center justify-center gap-2 transition-colors"
            @click="viewOrderDetails"
          >
            {{ $t('checkout.steps.confirmation.viewOrderDetails') }}
          </button>

          <!-- Print/Download Invoice Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button
              class="py-3 bg-white dark:bg-[var(--md-charcoal-light)] border border-[var(--md-gray-300)] dark:border-[var(--md-gray-600)] text-[var(--md-charcoal)] dark:text-[var(--md-cream)] font-medium rounded-lg btn-secondary flex items-center justify-center gap-2"
              @click="handlePrintInvoice"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              {{ $t('invoice.print') }}
            </button>
            <button
              class="py-3 bg-white dark:bg-[var(--md-charcoal-light)] border border-[var(--md-gray-300)] dark:border-[var(--md-gray-600)] text-[var(--md-charcoal)] dark:text-[var(--md-cream)] font-medium rounded-lg btn-secondary flex items-center justify-center gap-2"
              @click="handleDownloadInvoice"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {{ $t('invoice.download') }}
            </button>
          </div>

          <!-- Secondary: Continue Shopping -->
          <NuxtLink
            :to="localePath('/products')"
            class="w-full py-3 bg-white dark:bg-[var(--md-charcoal-light)] border-2 border-[var(--md-gray-300)] dark:border-[var(--md-gray-600)] text-[var(--md-charcoal)] dark:text-[var(--md-cream)] font-semibold rounded-lg btn-secondary flex items-center justify-center gap-2"
          >
            {{ $t('checkout.steps.confirmation.continueShopping') }}
          </NuxtLink>
        </div>

        <!-- Support Link -->
        <div
          v-if="orderData"
          class="text-center mt-6 slide-up stagger-8"
        >
          <NuxtLink
            :to="localePath('/contact')"
            class="text-sm text-[var(--md-gray-600)] dark:text-[var(--md-gray-400)] hover:text-[var(--md-charcoal)] dark:hover:text-[var(--md-cream)] transition-colors inline-flex items-center gap-1"
          >
            {{ $t('checkout.confirmation.needHelp') || 'Need help? Contact Support' }}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '~/stores/checkout'
import { useCheckoutSessionStore } from '~/stores/checkout/session'
import { useCartStore } from '~/stores/cart'
import { useInvoice } from '~/composables/useInvoice'

// Layout
definePageMeta({
  layout: 'checkout',
  middleware: ['checkout'],
})

// Stores
const checkoutStore = useCheckoutStore()
const sessionStore = useCheckoutSessionStore()
const cartStore = useCartStore()

// Composables
const localePath = useLocalePath()
const { t, locale } = useI18n()
const toast = useToast()
const { printInvoice, openInvoiceForPrint } = useInvoice()

/**
 * Get localized text from a translation object or string
 * Handles both string values and translation objects like { en: "...", es: "..." }
 */
const getLocalizedText = (text: any): string => {
  if (!text) return ''
  if (typeof text === 'string') return text
  // Try current locale first
  const localeText = text[locale.value]
  if (localeText) return localeText
  // Fall back to Spanish (primary locale)
  const esText = text.es
  if (esText) return esText
  // Fall back to any available translation
  const values = Object.values(text).filter((v): v is string => typeof v === 'string')
  return values[0] || ''
}

const PLACEHOLDER_IMAGE = '/placeholder-product.svg'

/**
 * Get product image URL from snapshot.
 * Handles both array of strings and array of image objects.
 */
function getProductImage(snapshot: Record<string, any> | null | undefined): string {
  const firstImage = snapshot?.images?.[0]
  if (!firstImage) return PLACEHOLDER_IMAGE
  return typeof firstImage === 'string' ? firstImage : (firstImage.url ?? PLACEHOLDER_IMAGE)
}

// Computed properties
// Access data directly from session store to bypass the checkout store proxy
// The proxy can return stale refs after restore(), so we use the source directly
const orderData = computed(() => sessionStore.orderData)
const shippingInfo = computed(() => sessionStore.shippingInfo)

const estimatedDeliveryDate = computed(() => {
  if (!shippingInfo.value?.method?.estimatedDays) return null

  const today = new Date()
  const deliveryDate = new Date(today)
  deliveryDate.setDate(today.getDate() + shippingInfo.value.method.estimatedDays)

  return deliveryDate
})

// Guest checkout detection
const guestInfo = computed(() => sessionStore.guestInfo)
const isGuestCheckout = computed(() => !!guestInfo.value?.email)

// Check if user is logged in via Supabase
const user = useSupabaseUser()
const isLoggedIn = computed(() => !!user.value)

// Create account URL with pre-filled email
const createAccountUrl = computed(() => {
  const email = guestInfo.value?.email || ''
  const encodedEmail = encodeURIComponent(email)
  return localePath(`/auth/register?email=${encodedEmail}&from=order`)
})

// Methods
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: orderData.value?.currency || 'EUR',
  }).format(price)
}

const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Trust elements configuration
const trustElements = [
  {
    key: 'secure',
    labelKey: 'checkout.trust.secure',
    iconPath: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    key: 'easyReturns',
    labelKey: 'checkout.trust.easyReturns',
    iconPath: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
  },
  {
    key: 'support247',
    labelKey: 'checkout.trust.support247',
    iconPath: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
]

// Expandable section states
const isOrderSummaryExpanded = ref(false)
const isOrderItemsExpanded = ref(false)
const isShippingInfoExpanded = ref(false)

// Toggle methods - consolidated into single function with specific exports
function toggleSection(section: 'orderSummary' | 'orderItems' | 'shippingInfo'): void {
  if (section === 'orderSummary') {
    isOrderSummaryExpanded.value = !isOrderSummaryExpanded.value
  }
  else if (section === 'orderItems') {
    isOrderItemsExpanded.value = !isOrderItemsExpanded.value
  }
  else if (section === 'shippingInfo') {
    isShippingInfoExpanded.value = !isShippingInfoExpanded.value
  }
}

const toggleOrderSummary = () => toggleSection('orderSummary')
const toggleOrderItems = () => toggleSection('orderItems')
const toggleShippingInfo = () => toggleSection('shippingInfo')

function scrollToOrderDetails(expandShipping = false): void {
  const element = document.getElementById('order-details')
  if (!element) return

  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  isOrderItemsExpanded.value = true
  if (expandShipping) {
    isShippingInfoExpanded.value = true
  }
}

const viewOrderDetails = () => scrollToOrderDetails(true)

// Invoice handlers
const getInvoiceData = () => {
  if (!orderData.value) return null

  return {
    orderData: orderData.value,
    shippingInfo: shippingInfo.value,
    orderNumber: orderData.value.orderNumber || 'N/A',
    orderDate: new Date(),
    customerEmail: orderData.value.customerEmail || guestInfo.value?.email,
  }
}

const handlePrintInvoice = () => {
  const data = getInvoiceData()
  if (!data) {
    toast.error(t('invoice.error'), t('invoice.errorNoData'))
    return
  }
  const result = printInvoice(data)
  if (!result.success) {
    if (result.error === 'popup_blocked') {
      toast.error(t('invoice.error'), t('invoice.errorPopupBlocked'))
    }
    else {
      toast.error(t('invoice.error'), t('invoice.errorNoData'))
    }
  }
}

const handleDownloadInvoice = () => {
  const data = getInvoiceData()
  if (!data) {
    toast.error(t('invoice.error'), t('invoice.errorNoData'))
    return
  }
  const result = openInvoiceForPrint(data)
  if (!result.success) {
    if (result.error === 'popup_blocked') {
      toast.error(t('invoice.error'), t('invoice.errorPopupBlocked'))
    }
    else {
      toast.error(t('invoice.error'), t('invoice.errorNoData'))
    }
  }
}

// Initialize on mount
onMounted(async () => {
  // Restore checkout data from cookies ONLY if we don't already have it
  // This handles fresh navigation (data in memory) after successful checkout.
  // NOTE: Page refresh after cart clearing will redirect to /cart via middleware
  // because cart validation runs before this code executes.
  if (!orderData.value) {
    try {
      await (checkoutStore.restore as any)()
      // Wait for Vue's reactivity system to propagate the state changes
      await nextTick()

      // Verify restore succeeded
      if (!sessionStore.orderData) {
        console.error('[ERROR] Session restore completed but orderData is still empty')
        toast.error(
          t('checkout.confirmation.sessionRestoreFailed'),
          t('checkout.confirmation.checkEmailForOrder'),
        )
      }
    }
    catch (error: unknown) {
      console.error('[CRITICAL] Exception during session restore:', getErrorMessage(error))
      toast.error(
        t('checkout.confirmation.errorLoadingOrder'),
        t('checkout.confirmation.contactSupport'),
      )
    }
  }

  // Ensure we're on the confirmation step
  checkoutStore.currentStep = 'confirmation'

  // Access orderData directly from session store to bypass the checkout store proxy
  // The proxy can return stale refs, so we need to access the source directly
  const currentOrderData = sessionStore.orderData

  // If still no order data after restore attempt, show error and redirect
  if (!currentOrderData || !currentOrderData.orderId || !currentOrderData.orderNumber) {
    console.error('[ERROR] Missing order data on confirmation page', {
      hasOrderData: !!currentOrderData,
      hasOrderId: !!currentOrderData?.orderId,
      hasOrderNumber: !!currentOrderData?.orderNumber,
    })

    // Show error message BEFORE redirecting
    toast.error(
      t('checkout.confirmation.orderDataMissing'),
      t('checkout.confirmation.checkYourEmail'),
    )

    // Delay redirect so user sees the message
    setTimeout(() => {
      navigateTo(localePath('/cart'))
    }, 2000)

    return
  }

  // Clear cart after successfully landing on confirmation page
  // This prevents race condition where cart is cleared before navigation completes
  try {
    await cartStore.clearCart()
  }
  catch (error: unknown) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : 'Unknown error'
    console.error('[ERROR] Failed to clear cart on confirmation page:', {
      error: errorMessage,
      orderId: currentOrderData.orderId,
      orderNumber: currentOrderData.orderNumber,
    })

    // Show user-friendly warning (non-blocking since order succeeded)
    toast.warning(
      t('checkout.confirmation.cartClearFailed'),
      t('checkout.confirmation.cartClearFailedDetails'),
    )
  }
})

// Clean up checkout session after user has viewed confirmation
onBeforeUnmount(() => {
  // Clear checkout session when leaving confirmation page
  // This allows user to start a fresh checkout next time
  setTimeout(() => {
    (checkoutStore.resetCheckout as any)()
  }, 1000)
})

// Page meta
useHead({
  title: computed(() => t('checkout.steps.confirmation.pageTitle')),
  meta: [
    { name: 'description', content: computed(() => t('checkout.steps.confirmation.pageDescription')) },
  ],
})
</script>

<style scoped>
.checkout-page {
  min-height: 60vh;
}

/* Clean, minimal animations */
@keyframes slide-up {
  0% {
    transform: translateY(16px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes checkmark-draw {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes circle-draw {
  0% {
    stroke-dashoffset: 200;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes progress-fill {
  0% {
    width: 0%;
  }
  100% {
    width: var(--target-width);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.slide-up {
  animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

.fade-in {
  animation: fade-in 0.4s ease-out forwards;
  opacity: 0;
}

.checkmark-animated {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: checkmark-draw 0.6s ease-out 0.3s forwards;
}

.circle-animated {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: circle-draw 0.5s ease-out forwards;
}

.progress-fill {
  animation: progress-fill 1.5s ease-out forwards;
}

.status-pulse {
  animation: pulse-dot 2s ease-in-out infinite;
}

/* Staggered animation delays */
.stagger-1 { animation-delay: 0.2s; }
.stagger-2 { animation-delay: 0.3s; }
.stagger-3 { animation-delay: 0.4s; }
.stagger-4 { animation-delay: 0.5s; }
.stagger-5 { animation-delay: 0.6s; }
.stagger-6 { animation-delay: 0.7s; }
.stagger-7 { animation-delay: 0.8s; }
.stagger-8 { animation-delay: 0.9s; }

/* Interactive states - following design-guide */
.btn-primary {
  transition: all 0.15s ease;
}

.btn-primary:hover {
  background-color: #16a34a;
}

.btn-primary:active {
  background-color: #15803d;
}

.btn-secondary {
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background-color: #fafafa;
  border-color: #a1a1aa;
}

.btn-secondary:active {
  background-color: #f4f4f5;
}

:deep(.dark) .btn-secondary:hover {
  background-color: #3f3f46;
  border-color: #71717a;
}

:deep(.dark) .btn-secondary:active {
  background-color: #52525b;
}

.card-interactive {
  transition: all 0.15s ease;
}

.card-interactive:hover {
  background-color: #fafafa;
}

.card-interactive:active {
  background-color: #f4f4f5;
}

:deep(.dark) .card-interactive:hover {
  background-color: #3f3f46;
}

:deep(.dark) .card-interactive:active {
  background-color: #52525b;
}

/* Expandable sections */
.expandable {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.expandable.expanded {
  max-height: 600px;
}

/* Rotate chevron when expanded */
.rotate-180 {
  transform: rotate(180deg);
}
</style>
