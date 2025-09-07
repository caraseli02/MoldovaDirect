<!--
  User Row Actions Component
  
  Action buttons for user table rows with mobile optimizations
  Provides consistent action interface across desktop and mobile
-->

<template>
  <div class="flex items-center justify-end gap-2">
    <!-- View Button -->
    <button
      @click.stop="handleView"
      @touchstart="isMobile && vibrate('tap')"
      class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors touch-manipulation"
      :class="{
        'p-2 active:scale-90': isMobile,
        'p-1': !isMobile
      }"
      :title="$t('admin.users.actions.view')"
      type="button"
    >
      <Icon name="heroicons:eye" :class="iconSizeClass" />
    </button>

    <!-- Edit Button -->
    <button
      @click.stop="handleEdit"
      @touchstart="isMobile && vibrate('tap')"
      class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors touch-manipulation"
      :class="{
        'p-2 active:scale-90': isMobile,
        'p-1': !isMobile
      }"
      :title="$t('admin.users.actions.edit')"
      type="button"
    >
      <Icon name="heroicons:pencil" :class="iconSizeClass" />
    </button>

    <!-- Actions Dropdown -->
    <AdminUserActionsDropdown
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
  @apply outline-none ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-800 rounded-md;
}
</style>