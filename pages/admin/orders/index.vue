<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage and track customer orders</p>
      </div>
      
      <!-- Quick Stats -->
      <div v-if="adminOrdersStore.aggregates" class="flex items-center space-x-4">
        <div class="text-right">
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white">
            {{ adminOrdersStore.formattedAggregates?.formattedRevenue }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</div>
          <div class="text-xl font-bold text-gray-900 dark:text-white">
            {{ adminOrdersStore.formattedAggregates?.formattedAverageOrderValue }}
          </div>
        </div>
      </div>
    </div>

    <!-- Status Tabs -->
    <Tabs :default-value="activeTab" @update:model-value="handleTabChange" class="mb-6">
      <TabsList class="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
        <TabsTrigger
          v-for="statusFilter in statusFilters"
          :key="statusFilter.value"
          :value="statusFilter.value"
          class="gap-2"
        >
          <commonIcon :name="statusFilter.icon" class="h-4 w-4" :class="statusFilter.iconColor" />
          <span class="hidden sm:inline">{{ statusFilter.label }}</span>
          <span class="sm:hidden">{{ statusFilter.shortLabel }}</span>
          <Badge variant="secondary" class="ml-1 px-1.5 py-0 text-xs">
            {{ getStatusCount(statusFilter.value) }}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <!-- Filters -->
    <AdminOrdersFilters
      :search="adminOrdersStore.filters.search"
      :status="adminOrdersStore.filters.status"
      :payment-status="adminOrdersStore.filters.paymentStatus"
      :date-range="adminOrdersStore.filters.dateRange"
      :total="adminOrdersStore.pagination.total"
      :loading="adminOrdersStore.loading"
      @update-search="adminOrdersStore.updateSearch"
      @update-status="adminOrdersStore.updateStatusFilter"
      @update-payment-status="adminOrdersStore.updatePaymentStatusFilter"
      @update-date-range="adminOrdersStore.updateDateRange"
      @clear-filters="adminOrdersStore.clearFilters"
    />

    <!-- Orders Table -->
    <Card class="overflow-hidden">
      <!-- Loading State -->
      <div v-if="adminOrdersStore.loading" class="p-6">
        <div class="space-y-4">
          <div v-for="n in 5" :key="n" class="flex space-x-4">
            <div class="flex-1 space-y-2">
              <Skeleton class="h-4 w-1/4" />
              <Skeleton class="h-3 w-1/6" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!adminOrdersStore.orders?.length" class="flex flex-col items-center justify-center py-16 px-4">
        <div class="rounded-full bg-muted p-6 mb-4">
          <commonIcon name="lucide:package-search" class="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 class="text-xl font-semibold text-foreground mb-2">No orders found</h3>
        <p class="text-muted-foreground text-center max-w-md mb-6">
          {{ adminOrdersStore.hasActiveFilters ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Orders will appear here once customers place them.' }}
        </p>
        <Button
          v-if="adminOrdersStore.hasActiveFilters"
          @click="adminOrdersStore.clearFilters"
          variant="outline"
        >
          <commonIcon name="lucide:x" class="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
      </div>

      <!-- Orders Table -->
      <div v-else class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="updateSort('created_at')"
              >
                <div class="flex items-center space-x-1">
                  <span>Order #</span>
                  <commonIcon 
                    v-if="adminOrdersStore.filters.sortBy === 'created_at'" 
                    name="lucide:arrow-down" 
                    class="h-4 w-4" 
                    :class="adminOrdersStore.filters.sortOrder === 'asc' ? 'transform rotate-180' : ''" 
                  />
                </div>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead 
                class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="updateSort('created_at')"
              >
                <div class="flex items-center space-x-1">
                  <span>Date</span>
                  <commonIcon 
                    v-if="adminOrdersStore.filters.sortBy === 'created_at'" 
                    name="lucide:arrow-down" 
                    class="h-4 w-4" 
                    :class="adminOrdersStore.filters.sortOrder === 'asc' ? 'transform rotate-180' : ''" 
                  />
                </div>
              </TableHead>
              <TableHead>Items</TableHead>
              <TableHead 
                class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="updateSort('total_eur')"
              >
                <div class="flex items-center space-x-1">
                  <span>Total</span>
                  <commonIcon 
                    v-if="adminOrdersStore.filters.sortBy === 'total_eur'" 
                    name="lucide:arrow-down" 
                    class="h-4 w-4" 
                    :class="adminOrdersStore.filters.sortOrder === 'asc' ? 'transform rotate-180' : ''" 
                  />
                </div>
              </TableHead>
              <TableHead 
                class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="updateSort('status')"
              >
                <div class="flex items-center space-x-1">
                  <span>Status</span>
                  <commonIcon 
                    v-if="adminOrdersStore.filters.sortBy === 'status'" 
                    name="lucide:arrow-down" 
                    class="h-4 w-4" 
                    :class="adminOrdersStore.filters.sortOrder === 'asc' ? 'transform rotate-180' : ''" 
                  />
                </div>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AdminOrdersListItem
              v-for="order in adminOrdersStore.orders"
              :key="order.id"
              :order="order"
            />
          </TableBody>
        </Table>
      </div>
    </Card>

    <!-- Pagination -->
    <AdminUtilsPagination
      v-if="adminOrdersStore.orders?.length"
      :page="adminOrdersStore.pagination.page"
      :limit="adminOrdersStore.pagination.limit"
      :total="adminOrdersStore.pagination.total"
      :total-pages="adminOrdersStore.pagination.totalPages"
      :has-next="adminOrdersStore.pagination.hasNext"
      :has-prev="adminOrdersStore.pagination.hasPrev"
      @go-to-page="adminOrdersStore.goToPage"
      @next-page="adminOrdersStore.nextPage"
      @prev-page="adminOrdersStore.prevPage"
      @update-limit="handleUpdateLimit"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Tabs,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Initialize store
const adminOrdersStore = useAdminOrdersStore()

// Status filters for tabs
const statusFilters = [
  { 
    value: '', 
    label: 'All Orders',
    shortLabel: 'All',
    icon: 'lucide:package',
    iconColor: 'text-muted-foreground'
  },
  { 
    value: 'pending', 
    label: 'Pending',
    shortLabel: 'Pending',
    icon: 'lucide:clock',
    iconColor: 'text-yellow-600 dark:text-yellow-500'
  },
  { 
    value: 'processing', 
    label: 'Processing',
    shortLabel: 'Process',
    icon: 'lucide:loader',
    iconColor: 'text-blue-600 dark:text-blue-500'
  },
  { 
    value: 'shipped', 
    label: 'Shipped',
    shortLabel: 'Shipped',
    icon: 'lucide:truck',
    iconColor: 'text-purple-600 dark:text-purple-500'
  },
  { 
    value: 'delivered', 
    label: 'Delivered',
    shortLabel: 'Done',
    icon: 'lucide:check-circle',
    iconColor: 'text-green-600 dark:text-green-500'
  }
]

// Active tab state
const activeTab = ref('')

// Initialize the store on mount
onMounted(async () => {
  await adminOrdersStore.initialize()
})

// Event handlers
const handleTabChange = async (value: string) => {
  activeTab.value = value
  if (value === '') {
    await adminOrdersStore.updateStatusFilter(undefined)
  } else {
    await adminOrdersStore.updateStatusFilter([value as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'])
  }
}

const getStatusCount = (status: string) => {
  if (status === '') {
    return adminOrdersStore.pagination.total
  }
  return adminOrdersStore.aggregates?.statusCounts?.[status] || 0
}

const updateSort = async (sortBy: 'created_at' | 'total_eur' | 'status' | 'priority_level') => {
  const newOrder = adminOrdersStore.filters.sortBy === sortBy && adminOrdersStore.filters.sortOrder === 'asc' ? 'desc' : 'asc'
  await adminOrdersStore.updateSort(sortBy, newOrder)
}

const handleUpdateLimit = async (limit: number) => {
  adminOrdersStore.pagination.limit = limit
  adminOrdersStore.pagination.page = 1
  await adminOrdersStore.fetchOrders()
}

// SEO
useHead({
  title: 'Orders - Admin - Moldova Direct',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow'
    }
  ]
})
</script>
