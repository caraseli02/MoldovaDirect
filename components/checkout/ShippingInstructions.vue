<template>
  <div>
    <UiLabel
      for="instructions"
      class="mb-2"
    >
      {{ $t('checkout.shippingInstructions.title') }}
      <span class="text-muted-foreground text-xs">({{ $t('common.optional') }})</span>
    </UiLabel>
    <UiTextarea
      id="instructions"
      :value="modelValue"
      rows="3"
      :placeholder="$t('checkout.shippingInstructions.placeholder')"
      :maxlength="maxLength"
      class="resize-none"
      @input="handleInput"
    />
    <div class="mt-1 flex justify-between items-center">
      <p class="text-xs text-muted-foreground">
        {{ $t('checkout.shippingInstructions.help') }}
      </p>
      <p class="text-xs text-muted-foreground">
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
  maxLength: 500,
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
