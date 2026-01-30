<template>
  <div class="shipping-section">
    <!-- Shipping Address Section -->
    <section class="checkout-section">
      <div class="section-header">
        <div class="flex items-center">
          <span class="section-number">{{ stepNumber }}</span>
          <h3 class="section-title">
            {{ $t('checkout.hybrid.shippingAddress') }}
          </h3>
        </div>
        <span
          v-if="isAddressComplete"
          class="section-complete"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
      <div class="section-content">
        <AddressForm
          ref="addressFormRef"
          :model-value="shippingAddress"
          type="shipping"
          :saved-addresses="[...savedAddresses]"
          :show-save-option="!!user"
          :show-header="false"
          :available-countries="availableCountries"
          @update:model-value="emit('update:shippingAddress', $event)"
          @save-address="emit('save-address', $event)"
          @address-complete="emit('address-complete')"
        />
      </div>
    </section>

    <!-- Shipping Method Section -->
    <section
      v-if="isAddressValid"
      class="checkout-section fade-in"
    >
      <div class="section-header">
        <div class="flex items-center">
          <span class="section-number">{{ stepNumber + 1 }}</span>
          <h3 class="section-title">
            {{ $t('checkout.hybrid.shippingMethod') }}
          </h3>
        </div>
        <span
          v-if="selectedMethod"
          class="section-complete"
        >
          <svg
            class="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </div>
      <div class="section-content">
        <ShippingMethodSelector
          :model-value="selectedMethod"
          :available-methods="[...availableMethods]"
          :loading="loadingMethods"
          :error="methodsError"
          :validation-error="shippingMethodValidationError"
          :auto-selected="shippingMethodAutoSelected"
          :currency="orderCurrency"
          @update:model-value="emit('update:selectedMethod', $event)"
          @retry="emit('retry-methods')"
        />
      </div>
    </section>

    <!-- Delivery Instructions (Optional) -->
    <section
      v-if="isAddressValid && selectedMethod"
      class="checkout-section fade-in"
    >
      <div class="section-content">
        <ShippingInstructions
          :model-value="shippingInstructions"
          @update:model-value="emit('update:shippingInstructions', $event)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Address, ShippingMethod } from '~/types/checkout'
import type { ValidatableForm } from '~/composables/useCheckoutOrder'
import type { User } from '@supabase/supabase-js'
import AddressForm from '~/components/checkout/AddressForm.vue'
import ShippingMethodSelector from '~/components/checkout/ShippingMethodSelector.vue'
import ShippingInstructions from '~/components/checkout/ShippingInstructions.vue'

interface Country {
  code: string
  name: string
  flag: string
}

interface Props {
  stepNumber: number
  user: User | null
  shippingAddress: Address
  savedAddresses: readonly Address[]
  availableCountries: Country[]
  isAddressComplete: boolean
  isAddressValid: boolean
  availableMethods: readonly ShippingMethod[]
  selectedMethod: ShippingMethod | null
  loadingMethods: boolean
  methodsError: string | null
  shippingMethodValidationError: string | null
  shippingMethodAutoSelected: boolean
  orderCurrency: string
  shippingInstructions: string
}

interface Emits {
  (e: 'update:shippingAddress', value: Address): void
  (e: 'save-address', value: Address): void
  (e: 'address-complete'): void
  (e: 'update:selectedMethod', value: ShippingMethod | null): void
  (e: 'retry-methods'): void
  (e: 'update:shippingInstructions', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Template refs
const addressFormRef = ref<ValidatableForm | null>(null)

// Expose validation method
defineExpose({
  addressFormRef,
})
</script>

<style scoped>
.shipping-section {
  width: 100%;
}

.checkout-section {
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid rgb(229 231 235);
}

:root.dark .checkout-section,
.dark .checkout-section {
  background-color: rgb(31 41 55);
  border-color: rgb(55 65 81);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgb(243 244 246);
}

:root.dark .section-header,
.dark .section-header {
  border-bottom-color: rgb(55 65 81);
}

.section-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: rgb(225 29 72);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: rgb(17 24 39);
}

:root.dark .section-title,
.dark .section-title {
  color: white;
}

.section-complete {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background-color: rgb(34 197 94);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-content {
  padding: 1.5rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
