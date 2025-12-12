<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Payment System Demo
        </h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Payment Step Demo -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Payment Method Selection
            </h2>
            <PaymentStep />
          </div>

          <!-- Current State Display -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Payment State
            </h2>
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ JSON.stringify((checkoutStore as any).paymentMethod, null, 2) }}</pre>
            </div>

            <div class="mt-4 space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Can Proceed:</span>
                <span :class="(checkoutStore as any).canProceedToReview ? 'text-green-600' : 'text-red-600'">
                  {{ (checkoutStore as any).canProceedToReview ? 'Yes' : 'No' }}
                </span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Current Step:</span>
                <span class="text-blue-600">{{ (checkoutStore as any).currentStep }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600 dark:text-gray-400">Processing:</span>
                <span :class="(checkoutStore as any).processing ? 'text-yellow-600' : 'text-gray-600'">
                  {{ (checkoutStore as any).processing ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Information Panel -->
        <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Current Payment Configuration
          </h3>
          <div class="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div class="flex items-center space-x-2">
              <commonIcon
                name="lucide:check-circle-2"
                class="h-5 w-5 text-green-600"
              />
              <span><strong>Cash on Delivery:</strong> Enabled and ready for use</span>
            </div>
            <div class="flex items-center space-x-2">
              <commonIcon
                name="lucide:clock"
                class="h-5 w-5 text-yellow-600"
              />
              <span><strong>Credit Card Payments:</strong> Configured but disabled for now</span>
            </div>
            <div class="flex items-center space-x-2">
              <commonIcon
                name="lucide:clock"
                class="h-5 w-5 text-yellow-600"
              />
              <span><strong>PayPal Payments:</strong> Configured but disabled for now</span>
            </div>
            <div class="flex items-center space-x-2">
              <commonIcon
                name="lucide:clock"
                class="h-5 w-5 text-yellow-600"
              />
              <span><strong>Bank Transfer:</strong> Configured but disabled for now</span>
            </div>
          </div>

          <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded border">
            <h4 class="font-medium text-gray-900 dark:text-white mb-2">
              To Enable Online Payments:
            </h4>
            <ol class="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <li>Set up Stripe account and add API keys to environment variables</li>
              <li>Set up PayPal developer account and add credentials</li>
              <li>Update PaymentStep.vue to enable online payment options</li>
              <li>Test payment flows in sandbox environment</li>
              <li>Deploy to production with live payment credentials</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCheckoutStore } from '~/stores/checkout'
import PaymentStep from '~/components/checkout/PaymentStep.vue'

// Initialize checkout store
const checkoutStore = useCheckoutStore()

// Set page metadata
useHead({
  title: 'Payment System Demo - Moldova Direct',
  meta: [
    { name: 'description', content: 'Demo of the payment system with cash on delivery' },
  ],
})

// Mock cart item interface
interface MockCartItem {
  product: {
    id: number
    name: string
    price: number
  }
  quantity: number
}

// Initialize checkout with mock data
onMounted(async () => {
  try {
    const mockItems: MockCartItem[] = [
      {
        product: {
          id: 1,
          name: 'Demo Product',
          price: 25.99,
        },
        quantity: 2,
      },
    ]

    // Type assertion needed because initializeCheckout expects a different cart item type
    await (checkoutStore as any).initializeCheckout(mockItems)
  }
  catch (error: any) {
    console.error('Failed to initialize checkout demo:', error)
  }
})
</script>
