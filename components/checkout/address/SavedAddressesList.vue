<template>
  <div
    v-if="savedAddresses && savedAddresses.length > 0"
    class="mb-6"
  >
    <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
      {{ $t('checkout.addressForm.savedAddresses') }}
    </h4>
    <fieldset>
      <!-- legend is required for fieldset accessibility -->
      <legend class="sr-only">
        {{ $t('checkout.addressForm.savedAddresses') }}
      </legend>
      <UiRadioGroup
        :model-value="selectedId?.toString() ?? ''"
        :name="`saved-address-${type}`"
        @update:model-value="val => handleSelectAddress(val ? Number(val) : null)"
      >
        <div class="space-y-3">
          <!-- Saved Address Items -->
          <div
            v-for="address in savedAddresses"
            :key="address.id"
            class="relative"
          >
            <div
              class="p-3 border rounded-lg cursor-pointer transition-colors"
              :class="selectedId === address.id
                ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
              @click="handleSelectAddress(address.id ?? null)"
            >
              <div class="flex items-start gap-3">
                <UiRadioGroupItem
                  :value="(address.id ?? '').toString()"
                  class="shrink-0 mt-0.5"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ address.firstName }} {{ address.lastName }}
                    </p>
                    <span
                      v-if="address.isDefault"
                      class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      {{ $t('checkout.addressForm.default') }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {{ address.street }}
                  </p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ address.city }}, {{ address.postalCode }} {{ address.country }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Use New Address Option -->
          <div
            class="p-3 border rounded-lg cursor-pointer transition-colors mt-3"
            :class="!selectedId
              ? 'border-slate-500 bg-slate-50 dark:bg-slate-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'"
            data-testid="use-new-address"
            @click="handleSelectNewAddress"
          >
            <div class="flex items-center gap-3">
              <UiRadioGroupItem
                value=""
                class="shrink-0"
              />
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ $t('checkout.addressForm.useNewAddress') }}
              </span>
            </div>
          </div>
        </div>
      </UiRadioGroup>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import type { Address } from '~/types/address'

interface Props {
  savedAddresses: Address[]
  selectedId: number | null
  type: 'shipping' | 'billing'
}

interface Emits {
  (e: 'update:selectedId', value: number | null): void
  (e: 'select-address', address: Address): void
  (e: 'use-new-address'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSelectAddress = (value: number | null) => {
  emit('update:selectedId', value)

  if (value !== null) {
    const address = props.savedAddresses.find(a => a.id === value)
    if (address) {
      emit('select-address', address)
    }
  }
}

const handleSelectNewAddress = () => {
  emit('update:selectedId', null)
  emit('use-new-address')
}
</script>
