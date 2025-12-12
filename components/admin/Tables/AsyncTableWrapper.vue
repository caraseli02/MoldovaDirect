<!--
  Async Table Wrapper Component

  This component provides lazy loading for TanStack Vue Table with loading states.
  The table library (~15KB gzipped) is only loaded when this component is rendered.

  Usage example in parent component
-->

<template>
  <div class="relative">
    <!-- Table Loading Skeleton -->
    <div
      v-if="isLoadingModule || loading"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
      </div>
      <div class="p-6 space-y-4">
        <div
          v-for="n in skeletonRows"
          :key="n"
          class="flex space-x-4 animate-pulse"
        >
          <div class="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="moduleError"
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-red-200 dark:border-red-700 p-6"
    >
      <div class="flex items-center gap-3 text-red-600 dark:text-red-400">
        <commonIcon
          name="lucide:alert-triangle"
          class="w-6 h-6"
        />
        <div>
          <h3 class="font-semibold">
            Failed to load table
          </h3>
          <p class="text-sm">
            {{ moduleError.message }}
          </p>
        </div>
      </div>
    </div>

    <!-- Table Content -->
    <div v-else-if="tableInstance">
      <slot
        :table="tableInstance"
        :module="tableModule"
      >
        <!-- Default table rendering -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div class="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow
                  v-for="headerGroup in tableInstance.getHeaderGroups()"
                  :key="headerGroup.id"
                >
                  <TableHead
                    v-for="header in headerGroup.headers"
                    :key="header.id"
                    :class="(header.column.columnDef.meta as Record<string, any>)?.headerClass"
                  >
                    <component
                      :is="tableModule?.flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )"
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="tableInstance.getRowModel().rows?.length">
                  <TableRow
                    v-for="row in tableInstance.getRowModel().rows"
                    :key="row.id"
                    :data-state="row.getIsSelected() ? 'selected' : undefined"
                    @click="$emit('row-click', row.original)"
                  >
                    <TableCell
                      v-for="cell in row.getVisibleCells()"
                      :key="cell.id"
                      :class="(cell.column.columnDef.meta as Record<string, any>)?.cellClass"
                    >
                      <component
                        :is="tableModule?.flexRender(
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
                    <slot name="empty">
                      <div class="text-gray-500 dark:text-gray-400">
                        {{ emptyMessage }}
                      </div>
                    </slot>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TData extends Record<string, any>">
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import type { ColumnDef, TableOptions, Table as TanStackTable } from '@tanstack/vue-table'

interface Props {
  /**
   * Table data array
   */
  data: TData[]

  /**
   * Column definitions for TanStack Table
   */
  columns: ColumnDef<TData, unknown>[]

  /**
   * External loading state (e.g., data fetching)
   */
  loading?: boolean

  /**
   * Number of skeleton rows to show during loading
   */
  skeletonRows?: number

  /**
   * Message to display when table is empty
   */
  emptyMessage?: string

  /**
   * Additional table options for TanStack Table
   */
  tableOptions?: Partial<TableOptions<TData>>

  /**
   * Enable pagination
   */
  enablePagination?: boolean

  /**
   * Enable sorting
   */
  enableSorting?: boolean

  /**
   * Enable filtering
   */
  enableFiltering?: boolean

  /**
   * Enable row selection
   */
  enableRowSelection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  skeletonRows: 5,
  emptyMessage: 'No data available',
  enablePagination: false,
  enableSorting: true,
  enableFiltering: false,
  enableRowSelection: false,
})

const _emit = defineEmits<{
  'row-click': [data: TData]
  'selection-change': [rows: TData[]]
}>()

// Use the async table composable
const { loadTable, isLoading: isLoadingModule, error: moduleError } = useAsyncTable()

const tableModule = ref<Awaited<ReturnType<typeof loadTable>>>(null)
const tableInstance = ref<TanStackTable<TData> | null>(null)

// Load table module and create instance
onMounted(async () => {
  const module = await loadTable()
  if (module) {
    tableModule.value = module

    // Build table options
    const options: TableOptions<TData> = {
      data: props.data,
      columns: props.columns,
      getCoreRowModel: module.getCoreRowModel() as any,
      ...(props.enablePagination && {
        getPaginationRowModel: module.getPaginationRowModel() as any,
      }),
      ...(props.enableSorting && {
        getSortedRowModel: module.getSortedRowModel() as any,
      }),
      ...(props.enableFiltering && {
        getFilteredRowModel: module.getFilteredRowModel() as any,
      }),
      ...props.tableOptions,
    }

    tableInstance.value = module.useVueTable(options)
  }
})

// Watch for data changes and update table
watch(() => props.data, (newData) => {
  if (tableInstance.value && tableModule.value) {
    const options: TableOptions<TData> = {
      data: newData,
      columns: props.columns,
      getCoreRowModel: tableModule.value.getCoreRowModel() as any,
      ...(props.enablePagination && {
        getPaginationRowModel: tableModule.value.getPaginationRowModel() as any,
      }),
      ...(props.enableSorting && {
        getSortedRowModel: tableModule.value.getSortedRowModel() as any,
      }),
      ...(props.enableFiltering && {
        getFilteredRowModel: tableModule.value.getFilteredRowModel() as any,
      }),
      ...props.tableOptions,
    }

    tableInstance.value = tableModule.value.useVueTable(options)
  }
})
</script>
