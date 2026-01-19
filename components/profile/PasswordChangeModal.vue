<script setup lang="ts">
/**
 * Password Change Modal Component
 *
 * Placeholder modal for password change functionality.
 * Currently displays info only; full form implementation to be added.
 *
 * @example
 * ```vue
 * <PasswordChangeModal v-if="showPasswordModal" @close="showPasswordModal = false" />
 * ```
 */

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
        v-if="true"
        ref="modalRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        data-testid="password-modal"
        @click.self="emit('close')"
        @keydown="handleKeydown"
        @keydown.tab="trapFocus"
      >
        <div
          class="bg-white dark:bg-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <h3
            id="password-modal-title"
            class="text-lg font-semibold text-zinc-900 dark:text-white mb-4"
          >
            {{ $t('profile.sections.changePassword') }}
          </h3>
          <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {{ $t('profile.sections.changePasswordDescription') }}
          </p>
          <div class="flex justify-end">
            <Button
              ref="closeBtnRef"
              variant="outline"
              @click="emit('close')"
            >
              {{ $t('common.close') }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
