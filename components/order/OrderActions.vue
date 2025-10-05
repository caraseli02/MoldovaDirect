<template>
  <div class="flex flex-col sm:flex-row gap-3" role="group" aria-label="Order actions">
    <!-- Reorder Button -->
    <button
      v-if="availableActions.includes('reorder')"
      @click="handleReorder"
      :disabled="loading"
      :aria-label="$t('orders.accessibility.actionButton', { action: $t('orders.actions.reorder') })"
      :aria-busy="loading"
      class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {{ $t('orders.actions.reorder') }}
    </button>

    <!-- Return Button -->
    <button
      v-if="availableActions.includes('return')"
      @click="handleReturn"
      :disabled="loading"
      :aria-label="$t('orders.accessibility.actionButton', { action: $t('orders.actions.return') })"
      :aria-busy="loading"
      class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
      {{ $t('orders.actions.return') }}
    </button>

    <!-- Contact Support Button -->
    <button
      v-if="availableActions.includes('support')"
      @click="handleSupport"
      :disabled="loading"
      :aria-label="$t('orders.accessibility.actionButton', { action: $t('orders.actions.support') })"
      :aria-busy="loading"
      class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      {{ $t('orders.actions.support') }}
    </button>

    <!-- Track Order Button -->
    <button
      v-if="availableActions.includes('track')"
      @click="handleTrack"
      :disabled="loading"
      :aria-label="$t('orders.accessibility.actionButton', { action: $t('orders.actions.track') })"
      :aria-busy="loading"
      class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {{ $t('orders.actions.track') }}
    </button>

    <!-- Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="showConfirmDialog"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            @click="cancelConfirmation"
          ></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="document">
            <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 sm:mx-0 sm:h-10 sm:w-10" aria-hidden="true">
                  <svg class="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                    {{ confirmDialog.title }}
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400" id="modal-description">
                      {{ confirmDialog.message }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                @click="confirmAction"
                :aria-label="confirmDialog.confirmText"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ confirmDialog.confirmText }}
              </button>
              <button
                type="button"
                @click="cancelConfirmation"
                :aria-label="$t('orders.accessibility.closeDialog')"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types'

type ActionType = 'reorder' | 'return' | 'support' | 'track'

interface Props {
  order: OrderWithItems
  availableActions?: ActionType[]
}

const props = withDefaults(defineProps<Props>(), {
  availableActions: () => ['reorder', 'return', 'support', 'track']
})

const emit = defineEmits<{
  reorder: [order: OrderWithItems]
  return: [order: OrderWithItems]
  support: [order: OrderWithItems]
  track: [order: OrderWithItems]
  error: [error: Error]
}>()

const { t } = useI18n()
const loading = ref(false)
const showConfirmDialog = ref(false)
const confirmDialog = ref({
  title: '',
  message: '',
  confirmText: '',
  action: null as (() => void) | null
})

// Action handlers
const handleReorder = async () => {
  try {
    loading.value = true
    emit('reorder', props.order)
  } catch (error) {
    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}

const handleReturn = () => {
  confirmDialog.value = {
    title: t('orders.actions.confirmReturn'),
    message: t('orders.actions.confirmReturnMessage'),
    confirmText: t('orders.actions.initiateReturn'),
    action: () => {
      try {
        loading.value = true
        emit('return', props.order)
      } catch (error) {
        emit('error', error as Error)
      } finally {
        loading.value = false
      }
    }
  }
  showConfirmDialog.value = true
}

const handleSupport = () => {
  try {
    loading.value = true
    emit('support', props.order)
  } catch (error) {
    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}

const handleTrack = () => {
  try {
    loading.value = true
    emit('track', props.order)
  } catch (error) {
    emit('error', error as Error)
  } finally {
    loading.value = false
  }
}

const confirmAction = () => {
  if (confirmDialog.value.action) {
    confirmDialog.value.action()
  }
  showConfirmDialog.value = false
}

const cancelConfirmation = () => {
  showConfirmDialog.value = false
}
</script>
