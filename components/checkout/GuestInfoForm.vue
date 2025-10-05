<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('checkout.guestInfo.title') }}
    </h3>
    <div class="space-y-4">
      <div>
        <label for="guestEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t('checkout.guestInfo.email') }}
          <span class="text-red-500">*</span>
        </label>
        <input 
          id="guestEmail" 
          :value="modelValue.email" 
          type="email"
          :placeholder="$t('checkout.guestInfo.emailPlaceholder')"
          class="w-full px-3 py-2 border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
          :class="getFieldClasses('email')" 
          @blur="$emit('validate', 'email')"
          @input="handleEmailInput" 
        />
        <p v-if="errors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ errors.email }}
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <input 
          id="emailUpdates" 
          :checked="modelValue.emailUpdates" 
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" 
          @change="handleCheckboxChange"
        />
        <label for="emailUpdates" class="text-sm text-gray-700 dark:text-gray-300">
          {{ $t('checkout.guestInfo.emailUpdates') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface GuestInfo {
  email: string
  emailUpdates: boolean
}

interface Props {
  modelValue: GuestInfo
  errors: Record<string, string>
}

const props = defineProps<Props>()

interface Emits {
  (e: 'update:modelValue', value: GuestInfo): void
  (e: 'validate', field: string): void
  (e: 'clear-error', field: string): void
}

const emit = defineEmits<Emits>()

const handleEmailInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    email: target.value
  })
  emit('clear-error', 'email')
}

const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    emailUpdates: target.checked
  })
}

const getFieldClasses = (fieldName: string) => {
  const hasError = !!props.errors[fieldName]
  return {
    'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500': hasError,
    'border-gray-300 dark:border-gray-600': !hasError,
    'bg-white dark:bg-gray-700 text-gray-900 dark:text-white': true
  }
}
</script>
