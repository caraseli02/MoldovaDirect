<template>
  <div>
    <label for="instructions" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {{ $t('checkout.shippingInstructions.title') }}
      <span class="text-gray-500 text-xs">({{ $t('common.optional') }})</span>
    </label>
    <textarea 
      id="instructions" 
      :value="modelValue" 
      rows="3"
      :placeholder="$t('checkout.shippingInstructions.placeholder')"
      :maxlength="maxLength"
      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none" 
      @input="handleInput"
    />
    <div class="mt-1 flex justify-between items-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ $t('checkout.shippingInstructions.help') }}
      </p>
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {{ characterCount }} / {{ maxLength }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 500
})

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const emit = defineEmits<Emits>()

const characterCount = computed(() => props.modelValue.length)

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>
