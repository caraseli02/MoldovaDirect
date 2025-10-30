<!--
  Email Logs Table Component
  
  Requirements addressed:
  - 4.5: Search by order number, customer email, and date range
  - 4.6: Display delivery status and bounce reasons
-->

<template>
  <Card>
    <CardHeader>
      <CardTitle>Email Delivery Logs</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Search Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Order Number
          </label>
          <input
            v-model="filters.orderNumber"
            type="text"
            placeholder="ORD-2024-001"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @input="debouncedSearch"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Customer Email
          </label>
          <input
            v-model="filters.recipientEmail"
            type="email"
            placeholder="customer@example.com"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @input="debouncedSearch"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Type
          </label>
          <select
            v-model="filters.emailType"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @change="searchLogs"
          >
            <option value="">All Types</option>
            <option value="order_confirmation">Order Confirmation</option>
            <option value="order_processing">Order Processing</option>
            <option value="order_shipped">Order Shipped</option>
            <option value="order_delivered">Order Delivered</option>
            <option value="order_cancelled">Order Cancelled</option>
            <option value="order_issue">Order Issue</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @change="searchLogs"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="bounced">Bounced</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date From
          </label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @change="searchLogs"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date To
          </label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            @change="searchLogs"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading email logs...</p>
      </div>

      <!-- Email Logs Table -->
      <div v-else-if="logs.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recipient
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Attempts
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
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
                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {{ formatEmailType(log.emailType) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span :class="getStatusClass(log.status)">
                  {{ formatStatus(log.status) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ log.attempts }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm">
                <Button
                  @click="viewDetails(log)"
                  variant="outline"
                  size="sm"
                >
                  View
                </Button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
            {{ pagination.total }} results
          </div>
          <div class="flex gap-2">
            <Button
              @click="previousPage"
              :disabled="pagination.page === 1"
              variant="outline"
              size="sm"
            >
              {{ $t('common.previous') }}
            </Button>
            <Button
              @click="nextPage"
              :disabled="pagination.page >= pagination.totalPages"
              variant="outline"
              size="sm"
            >
              {{ $t('common.next') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <p class="text-gray-600 dark:text-gray-400">No email logs found</p>
      </div>
    </CardContent>
  </Card>

  <!-- Details Modal -->
  <Dialog v-model:open="showDetailsModal">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Email Log Details</DialogTitle>
      </DialogHeader>
      <div v-if="selectedLog" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Order Number</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedLog.order?.orderNumber || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <p class="text-sm mt-1">
              <span :class="getStatusClass(selectedLog.status)">
                {{ formatStatus(selectedLog.status) }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Recipient</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedLog.recipientEmail }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Email Type</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatEmailType(selectedLog.emailType) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Attempts</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedLog.attempts }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">External ID</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedLog.externalId || 'N/A' }}</p>
          </div>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
          <p class="text-sm text-gray-900 dark:text-white mt-1">{{ selectedLog.subject }}</p>
        </div>

        <div v-if="selectedLog.bounceReason">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Bounce Reason</label>
          <p class="text-sm text-red-600 dark:text-red-400 mt-1">{{ selectedLog.bounceReason }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(selectedLog.createdAt) }}</p>
          </div>
          <div v-if="selectedLog.deliveredAt">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Delivered At</label>
            <p class="text-sm text-gray-900 dark:text-white mt-1">{{ formatDate(selectedLog.deliveredAt) }}</p>
          </div>
        </div>

        <div v-if="selectedLog.status === 'failed' && selectedLog.attempts < 3" class="pt-4">
          <Button
            @click="retryEmail(selectedLog.id)"
            :disabled="retrying"
            class="w-full"
          >
            {{ retrying ? 'Retrying...' : 'Retry Email' }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog'

const logs = ref<any[]>([])
const loading = ref(false)
const filters = ref({
  orderNumber: '',
  recipientEmail: '',
  emailType: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})
const showDetailsModal = ref(false)
const selectedLog = ref<any>(null)
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
    const { data } = await useFetch('/api/admin/email-logs/search', {
      params: {
        ...filters.value,
        page: pagination.value.page,
        limit: pagination.value.limit
      }
    })

    if (data.value) {
      logs.value = data.value.logs
      pagination.value = data.value.pagination
    }
  } catch (error) {
    console.error('Failed to search email logs:', error)
    useToast().error('Failed to load email logs')
  } finally {
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

function viewDetails(log: any) {
  selectedLog.value = log
  showDetailsModal.value = true
}

async function retryEmail(logId: number) {
  retrying.value = true
  try {
    await $fetch(`/api/admin/email-logs/${logId}/retry`, {
      method: 'POST'
    })
    useToast().success('Email retry initiated')
    showDetailsModal.value = false
    await searchLogs()
  } catch (error) {
    console.error('Failed to retry email:', error)
    useToast().error('Failed to retry email')
  } finally {
    retrying.value = false
  }
}

function formatEmailType(type: string): string {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
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
    bounced: 'text-xs px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  searchLogs()
})
</script>
