/**
 * Lazy Loading Composable for TanStack Vue Table
 *
 * This composable provides async loading of @tanstack/vue-table to reduce the initial bundle size.
 * The table library (~15KB gzipped) is only loaded when actually needed.
 *
 * Usage:
 * ```ts
 * const { loadTable, isLoading, error } = useAsyncTable()
 *
 * const tableModule = await loadTable()
 * if (tableModule) {
 *   const table = tableModule.useVueTable(options)
 * }
 * ```
 */

import type {
  TableOptions,
  Table,
  ColumnDef,
  Row,
  Cell,
  Header,
  Column,
  RowData,
  Updater,
} from '@tanstack/vue-table'

export interface TanStackTableModule {
  // Core table functions
  useVueTable: <TData extends RowData>(options: TableOptions<TData>) => Table<TData>
  createColumnHelper: <_TData extends RowData>() => unknown

  // Row model functions
  getCoreRowModel: () => unknown
  getFilteredRowModel: () => unknown
  getPaginationRowModel: () => unknown
  getSortedRowModel: () => unknown
  getExpandedRowModel: () => unknown
  getGroupedRowModel: () => unknown
  getFacetedRowModel: () => unknown
  getFacetedUniqueValues: () => unknown
  getFacetedMinMaxValues: () => unknown

  // Rendering helper
  flexRender: (component: any, props: any) => unknown

  // Utility functions
  isFunction: (value: any) => boolean
}

export function useAsyncTable() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const tableModule = ref<TanStackTableModule | null>(null)

  /**
   * Dynamically load the TanStack Table module
   * This will create a separate chunk that's only loaded when needed
   */
  const loadTable = async (): Promise<TanStackTableModule | null> => {
    // Return cached module if already loaded
    if (tableModule.value) {
      return tableModule.value
    }

    isLoading.value = true
    error.value = null

    try {
      const module = await import('@tanstack/vue-table')

      tableModule.value = {
        useVueTable: module.useVueTable,
        createColumnHelper: module.createColumnHelper,
        getCoreRowModel: module.getCoreRowModel,
        getFilteredRowModel: module.getFilteredRowModel,
        getPaginationRowModel: module.getPaginationRowModel,
        getSortedRowModel: module.getSortedRowModel,
        getExpandedRowModel: module.getExpandedRowModel,
        getGroupedRowModel: module.getGroupedRowModel,
        getFacetedRowModel: module.getFacetedRowModel,
        getFacetedUniqueValues: module.getFacetedUniqueValues,
        getFacetedMinMaxValues: module.getFacetedMinMaxValues,
        flexRender: module.flexRender,
        isFunction: module.isFunction,
      }

      return tableModule.value
    }
    catch (err: any) {
      error.value = err instanceof Error ? err : new Error('Failed to load table module')
      console.error('Failed to load TanStack Table:', err)
      return null
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    loadTable,
    isLoading: readonly(isLoading),
    error: readonly(error),
    tableModule: readonly(tableModule),
  }
}

/**
 * Helper function for updating values (used in table utilities)
 * This is a lighter-weight version that doesn't require importing the full table library
 */
export function valueUpdater<T>(updaterOrValue: Updater<T>, ref: Ref<T>): void {
  if (typeof updaterOrValue === 'function') {
    ref.value = (updaterOrValue as (old: T) => T)(ref.value)
  }
  else {
    ref.value = updaterOrValue
  }
}

// Export types for use in other components
export type {
  TableOptions,
  Table,
  ColumnDef,
  Row,
  Cell,
  Header,
  Column,
  RowData,
  Updater,
}
