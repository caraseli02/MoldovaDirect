<script setup lang="ts">
/**
 * Two-Factor Authentication Modal Component
 *
 * Placeholder modal for 2FA enable/disable functionality.
 * Currently displays info only; full implementation to be added.
 *
 * @example
 * ```vue
 * <TwoFAModal :show="show2FAModal" @close="show2FAModal = false" />
 * ```
 */

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const modalRef = ref<HTMLElement>()
const closeBtnRef = ref<HTMLElement>()

// Focus close button on mount
onMounted(() => {
  closeBtnRef.value?.focus()
})

// Close on escape key
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Trap focus within modal
function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return

  const focusableElements = modalRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusableElements || focusableElements.length === 0) return

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  }
  else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="2fa-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        data-testid="2fa-modal"
        @click.self="emit('close')"
        @keydown="handleKeydown"
        @keydown.tab="trapFocus"
      >
        <div
          class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <h3
            id="2fa-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
          >
            {{ $t('profile.sections.enable2FA') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {{ $t('profile.sections.enable2FADescription') }}
          </p>
          <div class="flex justify-end">
            <UiButton
              ref="closeBtnRef"
              variant="outline"
              @click="emit('close')"
            >
              {{ $t('common.close') }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
