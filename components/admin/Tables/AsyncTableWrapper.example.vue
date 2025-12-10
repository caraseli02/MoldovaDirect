<!--
  Example: Using AsyncTableWrapper for Lazy Loading TanStack Table

  This example demonstrates how to use the AsyncTableWrapper component
  for lazy loading TanStack Table in admin pages.

  Features demonstrated:
  - Lazy loading of TanStack Table library
  - Loading states with skeletons
  - Custom column definitions
  - Row selection
  - Sorting
  - Custom cell rendering
-->

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">
        Products Table (with TanStack Table)
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        This table uses lazy-loaded TanStack Table - the library is only loaded when needed.
      </p>
    </div>

    <!-- Filters -->
    <div class="flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search products..."
        class="px-4 py-2 border rounded-lg"
      />
      <select
        v-model="statusFilter"
        class="px-4 py-2 border rounded-lg"
      >
        <option value="">
          All Status
        </option>
        <option value="active">
          Active
        </option>
        <option value="inactive">
          Inactive
        </option>
      </select>
    </div>

    <!-- Async Table with TanStack -->
    <AdminTablesAsyncTableWrapper
      :data="filteredProducts"
      :columns="columns"
      :loading="isLoadingProducts"
      :skeleton-rows="8"
      :enable-sorting="true"
      :enable-row-selection="true"
      empty-message="No products found. Try adjusting your filters."
      @row-click="handleRowClick"
    >
      <!-- Custom rendering using table instance -->
      <template #default="{ table, module }">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <!-- Selection Header -->
          <div
            v-if="table.getSelectedRowModel().rows.length > 0"
            class="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900 dark:text-blue-100">
                {{ table.getSelectedRowModel().rows.length }} selected
              </span>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  v-for="headerGroup in table.getHeaderGroups()"
                  :key="headerGroup.id"
                >
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                    :class="header.column.getCanSort() ? 'cursor-pointer select-none' : ''"
                    @click="header.column.getToggleSortingHandler()?.($event)"
                  >
                    <div class="flex items-center gap-2">
                      <component
                        :is="module?.flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )"
                      />
                      <template v-if="header.column.getIsSorted()">
                        <commonIcon
                          v-if="header.column.getIsSorted() === 'asc'"
                          name="lucide:chevron-up"
                          class="w-4 h-4"
                        />
                        <commonIcon
                          v-else
                          name="lucide:chevron-down"
                          class="w-4 h-4"
                        />
                      </template>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="table.getRowModel().rows?.length">
                  <TableRow
                    v-for="row in table.getRowModel().rows"
                    :key="row.id"
                    :data-state="row.getIsSelected() ? 'selected' : undefined"
                    class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                    >
                      <component
                        :is="module?.flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )"
                      />
                    </TableCell>
                  </TableRow>
                </template>
                <TableRow v-else>
                  <TableCell
                    :colspan="columns.length"
                    class="h-24 text-center"
                  >
                    <div class="text-gray-500 dark:text-gray-400">
                      No products found
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <!-- Pagination (if needed) -->
          <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Showing {{ table.getRowModel().rows.length }} of {{ table.getFilteredRowModel().rows.length }} products
              </div>
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="!table.getCanPreviousPage()"
                  @click="table.previousPage()"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  :disabled="!table.getCanNextPage()"
                  @click="table.nextPage()"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </AdminTablesAsyncTableWrapper>
  </div>
</template>

<script setup lang="ts">
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/vue-table'

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  category: string
  createdAt: string
}

// Sample data
const products = ref<Product[]>([
  {
    id: 1,
    name: 'Moldovan Wine - Cabernet',
    sku: 'WINE-001',
    price: 24.99,
    stock: 45,
    status: 'active',
    category: 'Wine',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Traditional Placinta',
    sku: 'FOOD-001',
    price: 8.99,
    stock: 20,
    status: 'active',
    category: 'Food',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Moldovan Honey',
    sku: 'FOOD-002',
    price: 12.99,
    stock: 0,
    status: 'inactive',
    category: 'Food',
    createdAt: '2024-02-01',
  },
])

const isLoadingProducts = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')

// Define columns with TanStack Table column helpers
const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      'checked': table.getIsAllPageRowsSelected(),
      'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': 'Select all',
    }),
    cell: ({ row }) => h(Checkbox, {
      'checked': row.getIsSelected(),
      'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
      'ariaLabel': 'Select row',
    }),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Product',
    cell: ({ row }) => {
      const product = row.original
      return h('div', { class: 'font-medium' }, [
        h('div', product.name),
        h('div', { class: 'text-sm text-gray-500' }, `SKU: ${product.sku}`),
      ])
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => h('div', `€${row.original.price.toFixed(2)}`),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => {
      const stock = row.original.stock
      return h(Badge, {
        variant: stock > 0 ? 'default' : 'destructive',
      }, () => stock)
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(Badge, {
      variant: row.original.status === 'active' ? 'default' : 'secondary',
    }, () => row.original.status),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, {
        size: 'sm',
        variant: 'outline',
        onClick: () => handleEdit(row.original),
      }, () => 'Edit'),
      h(Button, {
        size: 'sm',
        variant: 'destructive',
        onClick: () => handleDelete(row.original),
      }, () => 'Delete'),
    ]),
    enableSorting: false,
  },
]

// Filtered products based on search and status
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchesSearch = !searchQuery.value
      || product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || product.sku.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus = !statusFilter.value || product.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

function handleRowClick(product: Product) {
  useToast().info(`Clicked on ${product.name}`)
}

function handleEdit(product: Product) {
  useToast().info(`Edit ${product.name}`)
}

function handleDelete(product: Product) {
  useToast().warning(`Delete ${product.name}`)
}
</script>
