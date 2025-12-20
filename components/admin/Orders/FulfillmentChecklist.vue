<template>
  <Card class="rounded-2xl">
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle>Fulfillment Checklist</CardTitle>
        <Badge :variant="getProgressVariant(progressPercentage)">
          {{ progressPercentage }}% Complete
        </Badge>
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Track order fulfillment progress through picking, packing, and shipping stages
      </p>
    </CardHeader>
    <CardContent>
      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-8"
      >
        <commonIcon
          name="lucide:loader-2"
          class="h-8 w-8 animate-spin text-primary"
        />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-center py-8"
      >
        <commonIcon
          name="lucide:alert-circle"
          class="h-8 w-8 text-red-400 mx-auto mb-2"
        />
        <p class="text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </p>
      </div>

      <!-- Tasks List -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Picking Stage -->
        <div v-if="pickingTasks.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <commonIcon
              name="lucide:package"
              class="h-4 w-4 mr-2"
            />
            Picking
          </h3>
          <div class="space-y-2">
            <div
              v-for="task in pickingTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                :id="`task-${task.id}`"
                :checked="task.completed"
                :disabled="updating || isTaskDisabled(task)"
                class="mt-0.5"
                @update:checked="(checked: boolean | string) => handleTaskToggle(task, checked)"
              />
              <div class="flex-1 min-w-0">
                <label
                  :for="`task-${task.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  :class="{ 'line-through text-gray-500': task.completed }"
                >
                  {{ task.task_name }}
                </label>
                <p
                  v-if="task.description"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ task.description }}
                </p>
                <div
                  v-if="task.completed && task.completed_at"
                  class="flex items-center space-x-2 mt-1"
                >
                  <Badge
                    variant="secondary"
                    class="text-xs"
                  >
                    <commonIcon
                      name="lucide:check"
                      class="h-3 w-3 mr-1"
                    />
                    Completed {{ formatDate(task.completed_at) }}
                  </Badge>
                </div>
              </div>
              <Badge
                v-if="task.required"
                variant="outline"
                class="text-xs"
              >
                Required
              </Badge>
            </div>
          </div>
        </div>

        <!-- Packing Stage -->
        <div v-if="packingTasks.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <commonIcon
              name="lucide:package"
              class="h-4 w-4 mr-2"
            />
            Packing
          </h3>
          <div class="space-y-2">
            <div
              v-for="task in packingTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                :id="`task-${task.id}`"
                :checked="task.completed"
                :disabled="updating || isTaskDisabled(task)"
                class="mt-0.5"
                @update:checked="(checked: boolean | string) => handleTaskToggle(task, checked)"
              />
              <div class="flex-1 min-w-0">
                <label
                  :for="`task-${task.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  :class="{ 'line-through text-gray-500': task.completed }"
                >
                  {{ task.task_name }}
                </label>
                <p
                  v-if="task.description"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ task.description }}
                </p>
                <div
                  v-if="task.completed && task.completed_at"
                  class="flex items-center space-x-2 mt-1"
                >
                  <Badge
                    variant="secondary"
                    class="text-xs"
                  >
                    <commonIcon
                      name="lucide:check"
                      class="h-3 w-3 mr-1"
                    />
                    Completed {{ formatDate(task.completed_at) }}
                  </Badge>
                </div>
              </div>
              <Badge
                v-if="task.required"
                variant="outline"
                class="text-xs"
              >
                Required
              </Badge>
            </div>
          </div>
        </div>

        <!-- Shipping Stage -->
        <div v-if="shippingTasks.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <commonIcon
              name="lucide:truck"
              class="h-4 w-4 mr-2"
            />
            Shipping
          </h3>
          <div class="space-y-2">
            <div
              v-for="task in shippingTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                :id="`task-${task.id}`"
                :checked="task.completed"
                :disabled="updating || isTaskDisabled(task)"
                class="mt-0.5"
                @update:checked="(checked: boolean | string) => handleTaskToggle(task, checked)"
              />
              <div class="flex-1 min-w-0">
                <label
                  :for="`task-${task.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  :class="{ 'line-through text-gray-500': task.completed }"
                >
                  {{ task.task_name }}
                </label>
                <p
                  v-if="task.description"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ task.description }}
                </p>
                <div
                  v-if="task.completed && task.completed_at"
                  class="flex items-center space-x-2 mt-1"
                >
                  <Badge
                    variant="secondary"
                    class="text-xs"
                  >
                    <commonIcon
                      name="lucide:check"
                      class="h-3 w-3 mr-1"
                    />
                    Completed {{ formatDate(task.completed_at) }}
                  </Badge>
                </div>
              </div>
              <Badge
                v-if="task.required"
                variant="outline"
                class="text-xs"
              >
                Required
              </Badge>
            </div>
          </div>
        </div>

        <!-- Quality Check Stage -->
        <div v-if="qualityCheckTasks.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <commonIcon
              name="lucide:clipboard-check"
              class="h-4 w-4 mr-2"
            />
            Quality Check
          </h3>
          <div class="space-y-2">
            <div
              v-for="task in qualityCheckTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                :id="`task-${task.id}`"
                :checked="task.completed"
                :disabled="updating || isTaskDisabled(task)"
                class="mt-0.5"
                @update:checked="(checked: boolean | string) => handleTaskToggle(task, checked)"
              />
              <div class="flex-1 min-w-0">
                <label
                  :for="`task-${task.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  :class="{ 'line-through text-gray-500': task.completed }"
                >
                  {{ task.task_name }}
                </label>
                <p
                  v-if="task.description"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ task.description }}
                </p>
                <div
                  v-if="task.completed && task.completed_at"
                  class="flex items-center space-x-2 mt-1"
                >
                  <Badge
                    variant="secondary"
                    class="text-xs"
                  >
                    <commonIcon
                      name="lucide:check"
                      class="h-3 w-3 mr-1"
                    />
                    Completed {{ formatDate(task.completed_at) }}
                  </Badge>
                </div>
              </div>
              <Badge
                v-if="task.required"
                variant="outline"
                class="text-xs"
              >
                Required
              </Badge>
            </div>
          </div>
        </div>

        <!-- Custom Tasks -->
        <div v-if="customTasks.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <commonIcon
              name="lucide:list-checks"
              class="h-4 w-4 mr-2"
            />
            Other Tasks
          </h3>
          <div class="space-y-2">
            <div
              v-for="task in customTasks"
              :key="task.id"
              class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Checkbox
                :id="`task-${task.id}`"
                :checked="task.completed"
                :disabled="updating"
                class="mt-0.5"
                @update:checked="(checked: boolean | string) => handleTaskToggle(task, checked)"
              />
              <div class="flex-1 min-w-0">
                <label
                  :for="`task-${task.id}`"
                  class="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                  :class="{ 'line-through text-gray-500': task.completed }"
                >
                  {{ task.task_name }}
                </label>
                <p
                  v-if="task.description"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ task.description }}
                </p>
                <div
                  v-if="task.completed && task.completed_at"
                  class="flex items-center space-x-2 mt-1"
                >
                  <Badge
                    variant="secondary"
                    class="text-xs"
                  >
                    <commonIcon
                      name="lucide:check"
                      class="h-3 w-3 mr-1"
                    />
                    Completed {{ formatDate(task.completed_at) }}
                  </Badge>
                </div>
              </div>
              <Badge
                v-if="task.required"
                variant="outline"
                class="text-xs"
              >
                Required
              </Badge>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="tasks.length === 0"
          class="text-center py-8"
        >
          <commonIcon
            name="lucide:clipboard-list"
            class="h-12 w-12 text-gray-400 mx-auto mb-3"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            No fulfillment tasks have been created for this order yet.
          </p>
          <AdminOrdersInitializeFulfillmentButton
            v-if="currentStatus === 'pending' || currentStatus === 'processing'"
            :order-id="orderId"
            @initialized="handleTasksInitialized"
          />
        </div>

        <!-- Progress Bar -->
        <div
          v-if="tasks.length > 0"
          class="pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span class="font-medium">{{ completedCount }} of {{ totalCount }} tasks</span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all duration-300"
              :class="getProgressBarColor(progressPercentage)"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { OrderFulfillmentTaskRaw } from '~/types/database'

interface Props {
  orderId: number
  currentStatus: string
  fulfillmentTasks?: OrderFulfillmentTaskRaw[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updated: []
}>()

// State
const tasks = ref<OrderFulfillmentTaskRaw[]>(props.fulfillmentTasks || [])
const loading = ref(false)
const updating = ref(false)
const error = ref<string | null>(null)

// Computed - Group tasks by type
const pickingTasks = computed(() => tasks.value.filter(t => t.task_type === 'picking'))
const packingTasks = computed(() => tasks.value.filter(t => t.task_type === 'packing'))
const shippingTasks = computed(() => tasks.value.filter(t => t.task_type === 'shipping'))
const qualityCheckTasks = computed(() => tasks.value.filter(t => t.task_type === 'quality_check'))
const customTasks = computed(() => tasks.value.filter(t => t.task_type === 'custom'))

// Computed - Progress tracking
const totalCount = computed(() => tasks.value.length)
const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// Check if task should be disabled (e.g., order already shipped)
const isTaskDisabled = (_task: OrderFulfillmentTaskRaw) => {
  // Disable if order is already shipped or delivered
  if (props.currentStatus === 'shipped' || props.currentStatus === 'delivered') {
    return true
  }
  return false
}

// Handle task toggle
const handleTaskToggle = async (task: OrderFulfillmentTaskRaw, checked: boolean | string) => {
  updating.value = true
  error.value = null

  const isChecked = typeof checked === 'boolean' ? checked : checked === 'true' || checked === 'on'

  try {
    const response = await $fetch(`/api/admin/orders/${props.orderId}/fulfillment-tasks/${task.id}`, {
      method: 'PATCH',
      body: {
        completed: isChecked,
      },
    }) as any

    if (response.success) {
      // Update local task state
      const taskIndex = tasks.value.findIndex(t => t.id === task.id)
      if (taskIndex !== -1 && response.data) {
        tasks.value[taskIndex] = response.data
      }

      // Emit update event to parent
      emit('updated')
    }
  }
  catch (err: any) {
    console.error('Error updating fulfillment task:', err)
    error.value = 'Failed to update task. Please try again.'

    // Revert checkbox state on error
    setTimeout(() => {
      error.value = null
    }, 3000)
  }
  finally {
    updating.value = false
  }
}

// Utility functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getProgressVariant = (percentage: number) => {
  if (percentage === 100) return 'default'
  if (percentage >= 50) return 'secondary'
  return 'outline'
}

const getProgressBarColor = (percentage: number) => {
  if (percentage === 100) return 'bg-green-600'
  if (percentage >= 75) return 'bg-blue-600'
  if (percentage >= 50) return 'bg-yellow-600'
  return 'bg-gray-600'
}

// Handle tasks initialized
const handleTasksInitialized = async () => {
  // Reload tasks from server
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<{
      success: boolean
      data: {
        fulfillmentTasks: OrderFulfillmentTaskRaw[]
      }
    }>(`/api/admin/orders/${props.orderId}`)

    if (response.success && response.data.fulfillmentTasks) {
      tasks.value = response.data.fulfillmentTasks
    }

    // Emit update to parent
    emit('updated')
  }
  catch (err: any) {
    console.error('Error fetching fulfillment tasks:', err)
    error.value = 'Failed to load tasks'
  }
  finally {
    loading.value = false
  }
}

// Watch for prop changes
watch(() => props.fulfillmentTasks, (newTasks) => {
  if (newTasks) {
    tasks.value = newTasks
  }
}, { deep: true })
</script>
