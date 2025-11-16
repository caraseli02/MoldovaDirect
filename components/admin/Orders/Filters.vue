<template>
  <div class="space-y-4 mb-6">
    <!-- Search Bar -->
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <commonIcon name="lucide:search" class="h-5 w-5 text-muted-foreground" />
      </div>
      <Input
        :model-value="search"
        @update:model-value="updateSearch"
        type="text"
        placeholder="Search orders by number, customer name, or email..."
        class="pl-12 pr-12 h-12 text-base bg-background border-2 focus-visible:ring-2"
      />
      <div v-if="search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <Button
          @click="clearSearch"
          variant="ghost"
          size="icon"
          class="h-8 w-8 hover:bg-muted"
        >
          <commonIcon name="lucide:x" class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Filters Card -->
    <Card>
      <CardContent class="p-4">
        <div class="flex items-center gap-2 mb-4">
          <commonIcon name="lucide:filter" class="h-4 w-4 text-muted-foreground" />
          <span class="text-sm font-medium text-foreground">Filters</span>
          <Button
            v-if="hasActiveFilters"
            @click="clearAllFilters"
            variant="ghost"
            size="sm"
            class="ml-auto h-7 text-xs"
          >
            <commonIcon name="lucide:x" class="h-3 w-3 mr-1" />
            Clear all
          </Button>
        </div>

        <!-- Filter Controls -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <!-- Status Filter -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Order Status</label>
            <Select :model-value="statusValue" @update:model-value="updateStatusFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Payment Status Filter -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Payment Status</label>
            <Select :model-value="paymentStatusValue" @update:model-value="updatePaymentStatusFilter">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="All Payment Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Date Start -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">Start Date</label>
            <Input
              type="date"
              :value="dateRange?.start"
              @input="updateDateRangeStart($event.target.value)"
            />
          </div>

          <!-- Date End -->
          <div class="space-y-2">
            <label class="text-xs font-medium text-muted-foreground">End Date</label>
            <Input
              type="date"
              :value="dateRange?.end"
              @input="updateDateRangeEnd($event.target.value)"
            />
          </div>
        </div>

        <!-- Quick Date Filters -->
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="preset in datePresets"
            :key="preset.label"
            @click="applyDatePreset(preset.days)"
            variant="outline"
            size="sm"
            class="h-7 text-xs"
          >
            {{ preset.label }}
          </Button>
          <Button
            v-if="dateRange"
            @click="clearDateRange"
            variant="ghost"
            size="sm"
            class="h-7 text-xs"
          >
            <commonIcon name="lucide:x" class="h-3 w-3 mr-1" />
            Clear dates
          </Button>
        </div>

        <!-- Active Filter Badges -->
        <div v-if="hasActiveFilters" class="flex items-center gap-2 pt-3 border-t">
          <Badge v-if="status && status.length > 0" variant="secondary" class="gap-1">
            Status: {{ getStatusLabel(status[0]) }}
            <Button @click="clearStatusFilter" variant="ghost" size="icon" class="ml-1 h-4 w-4 rounded-full hover:bg-muted">
              <commonIcon name="lucide:x" class="h-3 w-3" />
            </Button>
          </Badge>

          <Badge v-if="paymentStatus && paymentStatus.length > 0" variant="secondary" class="gap-1">
            Payment: {{ getPaymentStatusLabel(paymentStatus[0]) }}
            <Button @click="clearPaymentStatusFilter" variant="ghost" size="icon" class="ml-1 h-4 w-4 rounded-full hover:bg-muted">
              <commonIcon name="lucide:x" class="h-3 w-3" />
            </Button>
          </Badge>

          <Badge v-if="dateRange" variant="secondary" class="gap-1">
            {{ formatDateRange(dateRange) }}
            <Button @click="clearDateRange" variant="ghost" size="icon" class="ml-1 h-4 w-4 rounded-full hover:bg-muted">
              <commonIcon name="lucide:x" class="h-3 w-3" />
            </Button>
          </Badge>
        </div>

        <!-- Results Count -->
        <div class="text-sm text-muted-foreground pt-3 border-t">
          <span class="font-medium text-foreground">{{ total }}</span> {{ total === 1 ? 'order' : 'orders' }} found
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface Props {
  search: string
  status?: Array<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>
  paymentStatus?: Array<'pending' | 'paid' | 'failed' | 'refunded'>
  dateRange?: {
    start: string
    end: string
  }
  total: number
  loading: boolean
}

interface Emits {
  (e: 'update-search', value: string): void
  (e: 'update-status', value: Array<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> | undefined): void
  (e: 'update-payment-status', value: Array<'pending' | 'paid' | 'failed' | 'refunded'> | undefined): void
  (e: 'update-date-range', start?: string, end?: string): void
  (e: 'clear-filters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(
    props.search || 
    (props.status && props.status.length > 0) || 
    (props.paymentStatus && props.paymentStatus.length > 0) || 
    props.dateRange
  )
})

const statusValue = computed(() => props.status?.[0] || '')
const paymentStatusValue = computed(() => props.paymentStatus?.[0] || '')

// Date presets
const datePresets = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'This month', days: -1 }
]

const applyDatePreset = (days: number) => {
  const end = new Date()
  const start = new Date()
  
  if (days === 0) {
    // Today
    start.setHours(0, 0, 0, 0)
  } else if (days === -1) {
    // This month
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  } else {
    // Last X days
    start.setDate(start.getDate() - days)
  }
  
  emit('update-date-range', start.toISOString().split('T')[0], end.toISOString().split('T')[0])
}

// Utility functions
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  }
  return labels[status] || status
}

const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded'
  }
  return labels[status] || status
}

const formatDateRange = (range: { start: string; end: string }) => {
  const start = new Date(range.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const end = new Date(range.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${start} - ${end}`
}

// Event handlers with debouncing for search
let searchTimeout: NodeJS.Timeout | null = null

const updateSearch = (value: string | number) => {
  const searchValue = String(value)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    emit('update-search', searchValue)
  }, 300)
}

const clearSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  emit('update-search', '')
}

const updateStatusFilter = (value: string | undefined) => {
  const status = value ? [value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'] : undefined
  emit('update-status', status)
}

const clearStatusFilter = () => {
  emit('update-status', undefined)
}

const updatePaymentStatusFilter = (value: string | undefined) => {
  const paymentStatus = value ? [value as 'pending' | 'paid' | 'failed' | 'refunded'] : undefined
  emit('update-payment-status', paymentStatus)
}

const clearPaymentStatusFilter = () => {
  emit('update-payment-status', undefined)
}

const updateDateRangeStart = (value: string) => {
  emit('update-date-range', value, props.dateRange?.end)
}

const updateDateRangeEnd = (value: string) => {
  emit('update-date-range', props.dateRange?.start, value)
}

const clearDateRange = () => {
  emit('update-date-range', undefined, undefined)
}

const clearAllFilters = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  emit('clear-filters')
}

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>
