<!--
  User Row Actions Component

  Action buttons for user table rows with mobile optimizations
  Provides consistent action interface across desktop and mobile
-->

<template>
  <div class="flex items-center justify-end gap-2">
    <!-- View Button -->
    <UiButton
      variant="ghost"
      size="icon"
      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 touch-manipulation"
      :class="{
        'h-9 w-9 active:scale-90': isMobile,
        'h-8 w-8': !isMobile,
      }"
      :aria-label="$t('admin.users.actions.view')"
      @click.stop="handleView"
      @touchstart="isMobile && vibrate('tap')"
    >
      <commonIcon
        name="lucide:eye"
        :class="iconSizeClass"
      />
    </UiButton>

    <!-- Edit Button -->
    <UiButton
      variant="ghost"
      size="icon"
      class="touch-manipulation"
      :class="{
        'h-9 w-9 active:scale-90': isMobile,
        'h-8 w-8': !isMobile,
      }"
      :aria-label="$t('admin.users.actions.edit')"
      @click.stop="handleEdit"
      @touchstart="isMobile && vibrate('tap')"
    >
      <commonIcon
        name="lucide:pencil"
        :class="iconSizeClass"
      />
    </UiButton>

    <!-- Actions Dropdown -->
    <AdminUsersActionsDropdown
      :user="user"
      :mobile="isMobile"
      @action="handleAction"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: any // Replace with proper User type
}

interface Emits {
  (e: 'view', userId: string): void
  (e: 'edit', userId: string): void
  (e: 'action', action: string, userId: string, data?: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { isMobile } = useDevice()
const { vibrate } = useHapticFeedback()

// Computed
const iconSizeClass = computed(() => {
  return isMobile.value ? 'w-5 h-5' : 'w-4 h-4'
})

// Methods
const handleView = () => {
  emit('view', props.user.id)
}

const handleEdit = () => {
  emit('edit', props.user.id)
}

const handleAction = (action: string, userId: string, data?: any) => {
  emit('action', action, userId, data)
}
</script>

<style scoped>
.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.active\:scale-90:active {
  transform: scale(0.9);
}

/* Enhanced focus states for accessibility */
button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  border-radius: 0.375rem;
  box-shadow: 0 0 0 1px white, 0 0 0 3px rgb(59 130 246);
}

@media (prefers-color-scheme: dark) {
  button:focus {
    box-shadow: 0 0 0 1px rgb(31 41 55), 0 0 0 3px rgb(59 130 246);
  }
}
</style>
