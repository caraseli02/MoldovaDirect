<template>
  <div
    v-if="show"
    class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="py-4">
        <!-- Operation in Progress -->
        <div
          v-if="inProgress"
          class="flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ operationText }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ progressText }}
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="flex-1 mx-8">
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${progress}%` }"
              ></div>
            </div>
          </div>

          <div class="text-sm font-medium text-gray-900 dark:text-white">
            {{ Math.round(progress) }}%
          </div>
        </div>

        <!-- Operation Complete -->
        <div
          v-else-if="completed"
          class="flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <svg
                v-if="success"
                class="h-6 w-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else
                class="h-6 w-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p
                class="text-sm font-medium"
                :class="success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'"
              >
                {{ resultMessage }}
              </p>
              <p
                v-if="resultDetails"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                {{ resultDetails }}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="$emit('close')"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="flex items-center justify-between"
        >
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <svg
                class="h-6 w-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-200">
                Operation failed
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ errorMessage }}
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Button
              size="sm"
              class="text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
              @click="$emit('retry')"
            >
              Retry
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              @click="$emit('close')"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface Props {
  show: boolean
  inProgress: boolean
  completed: boolean
  error: boolean
  success: boolean
  progress: number
  operationText: string
  progressText: string
  resultMessage: string
  resultDetails?: string
  errorMessage: string
}

interface Emits {
  (e: 'close'): void
  (e: 'retry'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
