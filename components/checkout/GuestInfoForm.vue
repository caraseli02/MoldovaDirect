<template>
  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      {{ $t('checkout.guestInfo.title') }}
    </h3>
    <div class="space-y-4">
      <div>
        <UiLabel
          for="guestEmail"
          class="mb-2 inline-flex items-center gap-1"
        >
          {{ $t('checkout.guestInfo.email') }}
          <span class="text-red-500">*</span>
        </UiLabel>
        <UiInput
          id="guestEmail"
          :value="modelValue.email"
          type="email"
          :placeholder="$t('checkout.guestInfo.emailPlaceholder')"
          :aria-invalid="!!errors.email"
          :aria-describedby="errors.email ? 'guestEmail-error' : undefined"
          class="transition-colors"
          :class="{ 'aria-invalid:border-destructive': !!errors.email }"
          @blur="$emit('validate', 'email')"
          @input="handleEmailInput"
        />
        <p
          v-if="errors.email"
          id="guestEmail-error"
          class="mt-1 text-sm text-destructive"
          role="alert"
        >
          {{ errors.email }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UiCheckbox
          id="emailUpdates"
          :checked="modelValue.emailUpdates"
          @update:checked="(val:boolean) => emit('update:modelValue', { ...modelValue, emailUpdates: val })"
        />
        <UiLabel
          for="emailUpdates"
          class="text-sm"
        >
          {{ $t('checkout.guestInfo.emailUpdates') }}
        </UiLabel>
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
    email: target.value,
  })
  emit('clear-error', 'email')
}

const _handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    emailUpdates: target.checked,
  })
}

// Styling now handled by shadcn-vue Input variants and aria-invalid
</script>
