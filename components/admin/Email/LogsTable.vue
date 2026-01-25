<!--
  Email Logs Table Component

  Requirements addressed:
  - 4.5: Search by order number, customer email, and date range
  - 4.6: Display delivery status and bounce reasons
-->

<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>{{ $t('admin.emailLogs.title') }}</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <!-- Search Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <UiLabel>Order Number</UiLabel>
          <UiInput
            v-model="filters.orderNumber"
            type="text"
            placeholder="ORD-2024-001"
            @input="debouncedSearch"
          />
        </div>

        <div>
          <UiLabel>Customer Email</UiLabel>
          <UiInput
            v-model="filters.recipientEmail"
            type="email"
            placeholder="customer@example.com"
            @input="debouncedSearch"
          />
        </div>

        <div>
          <UiLabel>Email Type</UiLabel>
          <UiSelect
            v-model="filters.emailType"
            @update:model-value="searchLogs"
          >
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="">
                All Types
              </UiSelectItem>
              <UiSelectItem value="order_confirmation">
                Order Confirmation
              </UiSelectItem>
              <UiSelectItem value="order_processing">
                Order Processing
              </UiSelectItem>
              <UiSelectItem value="order_shipped">
                Order Shipped
              </UiSelectItem>
              <UiSelectItem value="order_delivered">
                Order Delivered
              </UiSelectItem>
              <UiSelectItem value="order_cancelled">
                Order Cancelled
              </UiSelectItem>
              <UiSelectItem value="order_issue">
                Order Issue
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>

        <div>
          <UiLabel>Status</UiLabel>
          <UiSelect
            v-model="filters.status"
            @update:model-value="searchLogs"
          >
            <UiSelectTrigger>
              <UiSelectValue />
            </UiSelectTrigger>
            <UiSelectContent>
              <UiSelectItem value="">
                All Statuses
              </UiSelectItem>
              <UiSelectItem value="pending">
                Pending
              </UiSelectItem>
              <UiSelectItem value="sent">
                Sent
              </UiSelectItem>
              <UiSelectItem value="delivered">
                Delivered
              </UiSelectItem>
              <UiSelectItem value="failed">
                Failed
              </UiSelectItem>
              <UiSelectItem value="bounced">
                Bounced
              </UiSelectItem>
            </UiSelectContent>
          </UiSelect>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <UiLabel>Date From</UiLabel>
          <UiInput
            v-model="filters.dateFrom"
            type="date"
            @change="searchLogs"
          />
        </div>

        <div>
          <UiLabel>Date To</UiLabel>
          <UiInput
            v-model="filters.dateTo"
            type="date"
            @change="searchLogs"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Loading email logs...
        </p>
      </div>

      <!-- Email Logs Table -->
      <div
        v-else-if="logs.length > 0"
        class="overflow-x-auto"
      >
        <UiTable>
          <UiTableHeader>
            <UiTableRow>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.order') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.recipient') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.type') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.status') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.attempts') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.date') }}
              </UiTableHead>
              <UiTableHead class="px-4">
                {{ $t('admin.emailLogs.headers.actions') }}
              </UiTableHead>
            </UiTableRow>
          </UiTableHeader>
          <UiTableBody>
            <UiTableRow
              v-for="log in logs"
              :key="log.id"
            >
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ log.order?.orderNumber || 'N/A' }}
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-900 dark:text-white">
                  {{ log.recipientEmail }}
                </div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <UiBadge variant="secondary">
                  {{ formatEmailType(log.emailType) }}
                </UiBadge>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <UiBadge :variant="emailStatusVariant(log.status)">
                  {{ formatStatus(log.status) }}
                </UiBadge>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ log.attempts }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <UiButton
                  variant="outline"
                  size="sm"
                  @click="viewDetails(log)"
                >
                  {{ $t('admin.emailLogs.buttons.view') }}
                </UiButton>
              </td>
            </UiTableRow>
          </UiTableBody>
        </UiTable>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of
            {{ pagination.total }} results
          </div>
          <div class="flex gap-2">
            <UiButton
              :disabled="pagination.page === 1"
              variant="outline"
              size="sm"
              @click="previousPage"
            >
              {{ $t('common.previous') }}
            </UiButton>
            <UiButton
              :disabled="pagination.page >= pagination.totalPages"
              variant="outline"
              size="sm"
              @click="nextPage"
            >
              {{ $t('common.next') }}
            </UiButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-8"
      >
        <p class="text-gray-600 dark:text-gray-400">
          No email logs found
        </p>
      </div>
    </UiCardContent>
  </UiCard>

  <!-- Details Modal -->
  <UiDialog v-model:open="showDetailsModal">
    <UiDialogContent class="max-w-2xl">
      <UiDialogHeader>
        <UiDialogTitle>Email Log Details</UiDialogTitle>
        <UiDialogDescription>View delivery status, recipient information, and retry options for this email</UiDialogDescription>
      </UiDialogHeader>
      <div
        v-if="selectedLog"
        class="space-y-4"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel>Order Number</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ selectedLog.order?.orderNumber || 'N/A' }}
            </p>
          </div>
          <div>
            <UiLabel>Status</UiLabel>
            <p class="text-sm mt-1">
              <span :class="getStatusClass(selectedLog.status)">
                {{ formatStatus(selectedLog.status) }}
              </span>
            </p>
          </div>
          <div>
            <UiLabel>Recipient</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ selectedLog.recipientEmail }}
            </p>
          </div>
          <div>
            <UiLabel>Email Type</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ formatEmailType(selectedLog.emailType) }}
            </p>
          </div>
          <div>
            <UiLabel>Attempts</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ selectedLog.attempts }}
            </p>
          </div>
          <div>
            <UiLabel>External ID</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ selectedLog.externalId || 'N/A' }}
            </p>
          </div>
        </div>

        <div>
          <UiLabel>Subject</UiLabel>
          <p class="text-sm text-gray-900 dark:text-white mt-1">
            {{ selectedLog.subject }}
          </p>
        </div>

        <div v-if="selectedLog.bounceReason">
          <UiLabel>Bounce Reason</UiLabel>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">
            {{ selectedLog.bounceReason }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel>Created At</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ formatDate(selectedLog.createdAt) }}
            </p>
          </div>
          <div v-if="selectedLog.deliveredAt">
            <UiLabel>Delivered At</UiLabel>
            <p class="text-sm text-gray-900 dark:text-white mt-1">
              {{ formatDate(selectedLog.deliveredAt) }}
            </p>
          </div>
        </div>

        <div
          v-if="selectedLog.status === 'failed' && selectedLog.attempts < 3"
          class="pt-4"
        >
          <UiButton
            :disabled="retrying"
            class="w-full"
            @click="retryEmail(selectedLog.id)"
          >
            {{ retrying ? 'Retrying...' : 'Retry Email' }}
          </UiButton>
        </div>
      </div>
    </UiDialogContent>
  </UiDialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import type { BadgeVariants } from '~/components/ui/badge'

// Inline badge variant function
const emailStatusVariant = (status: string): BadgeVariants['variant'] => {
  switch (status) {
    case 'delivered':
      return 'default'
    case 'failed':
    case 'bounced':
      return 'destructive'
    default:
      return 'secondary'
  }
}

const logs = ref<Record<string, any>[]>([])
const loading = ref(false)
const filters = ref({
  orderNumber: '',
  recipientEmail: '',
  emailType: '',
  status: '',
  dateFrom: '',
  dateTo: '',
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})
const showDetailsModal = ref(false)
const selectedLog = ref<Record<string, any> | null>(null)
const retrying = ref(false)

let searchTimeout: NodeJS.Timeout

const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    searchLogs()
  }, 500)
}

async function searchLogs() {
  loading.value = true
  try {
    const queryParams = new URLSearchParams({
      ...filters.value,
      page: String(pagination.value.page),
      limit: String(pagination.value.limit),
    })

    const data = await $fetch<{ logs: typeof logs.value, pagination: typeof pagination.value }>(
      `/api/admin/email-logs/search?${queryParams.toString()}`,
    )

    if (data) {
      logs.value = data.logs
      pagination.value = data.pagination
    }
  }
  catch (error: unknown) {
    console.error('Failed to search email logs:', error)
    useToast().error('Failed to load email logs')
  }
  finally {
    loading.value = false
  }
}

function previousPage() {
  if (pagination.value.page > 1) {
    pagination.value.page--
    searchLogs()
  }
}

function nextPage() {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    searchLogs()
  }
}

function viewDetails(log: Record<string, any>) {
  selectedLog.value = log
  showDetailsModal.value = true
}

async function retryEmail(logId: number) {
  retrying.value = true
  try {
    await $fetch(`/api/admin/email-logs/${logId}/retry`, {
      method: 'POST',
    }) as any
    useToast().success('Email retry initiated')
    showDetailsModal.value = false
    await searchLogs()
  }
  catch (error: unknown) {
    console.error('Failed to retry email:', error)
    useToast().error('Failed to retry email')
  }
  finally {
    retrying.value = false
  }
}

function formatEmailType(type: string): string {
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1),
  ).join(' ')
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getStatusClass(status: string): string {
  const classes = {
    pending: 'text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    sent: 'text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
    delivered: 'text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    failed: 'text-xs px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
    bounced: 'text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  }
  return classes[status as keyof typeof classes] || classes.pending
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  searchLogs()
})

// Variant mapping centralized in lib/uiVariants
</script>
