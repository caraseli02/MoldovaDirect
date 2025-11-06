<!--
  User Row Actions Component
  
  Action buttons for user table rows with mobile optimizations
  Provides consistent action interface across desktop and mobile
-->

<template>
  <div class="flex items-center justify-end gap-2">
    <!-- View Button -->
    <UiButton
      @click.stop="handleView"
      @touchstart="isMobile && vibrate('tap')"
      variant="ghost"
      size="icon"
      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 touch-manipulation"
      :class="{
        'h-9 w-9 active:scale-90': isMobile,
        'h-8 w-8': !isMobile
      }"
      :aria-label="$t('admin.users.actions.view')"
    >
      <commonIcon name="lucide:eye" :class="iconSizeClass" />
    </UiButton>

    <!-- Edit Button -->
    <UiButton
      @click.stop="handleEdit"
      @touchstart="isMobile && vibrate('tap')"
      variant="ghost"
      size="icon"
      class="touch-manipulation"
      :class="{
        'h-9 w-9 active:scale-90': isMobile,
        'h-8 w-8': !isMobile
      }"
      :aria-label="$t('admin.users.actions.edit')"
    >
      <commonIcon name="lucide:pencil" :class="iconSizeClass" />
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
  (e: 'lucide:square-pen', userId: string): void
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
  emit('lucide:square-pen', props.user.id)
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
  @apply outline-none ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800 rounded-md;
}
</style>
