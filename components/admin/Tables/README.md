# TanStack Table Lazy Loading Implementation

This directory contains the implementation for lazy loading TanStack Vue Table in admin pages, reducing the main bundle size by ~15KB gzipped.

## Overview

TanStack Vue Table is a powerful table library, but it adds significant weight to the bundle. By implementing lazy loading, we ensure the library is only loaded when actually needed (i.e., when an admin table component is rendered).

## Files

### Core Implementation

1. **`/composables/useAsyncTable.ts`**
   - Composable for dynamically loading TanStack Table
   - Caches the loaded module for reuse
   - Provides loading and error states
   - Exports all necessary TanStack Table functions

2. **`AsyncTableWrapper.vue`**
   - Wrapper component that handles async loading
   - Provides loading skeletons during module load
   - Supports all TanStack Table features (sorting, pagination, selection)
   - Includes error handling and empty states

3. **`AsyncTableWrapper.example.vue`**
   - Complete working example
   - Demonstrates column definitions, sorting, selection
   - Shows custom cell rendering
   - Includes filters and search

4. **`/components/ui/table/utils.ts`** (Updated)
   - Removed direct TanStack imports
   - Provides standalone utility functions
   - Maintains type compatibility

## Usage

### Basic Example

```vue
<template>
  <AdminTablesAsyncTableWrapper
    :data="products"
    :columns="columns"
    :loading="isLoading"
    @row-click="handleRowClick"
  />
</template>

<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'

interface Product {
  id: number
  name: string
  price: number
}

const products = ref<Product[]>([])
const isLoading = ref(false)

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `€${row.original.price.toFixed(2)}`,
  },
]

function handleRowClick(product: Product) {
  console.log('Clicked:', product)
}
</script>
```

### Advanced Example with Custom Rendering

```vue
<template>
  <AdminTablesAsyncTableWrapper
    :data="users"
    :columns="columns"
    :loading="isLoading"
    :enable-sorting="true"
    :enable-pagination="true"
    :enable-row-selection="true"
  >
    <template #default="{ table, module }">
      <!-- Custom table rendering with full control -->
      <div class="custom-table">
        <div v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <div
            v-for="header in headerGroup.headers"
            :key="header.id"
            @click="header.column.getToggleSortingHandler()?.($event)"
          >
            <component
              :is="module?.flexRender(
                header.column.columnDef.header,
                header.getContext()
              )"
            />
          </div>
        </div>
      </div>
    </template>
  </AdminTablesAsyncTableWrapper>
</template>
```

### Using the Composable Directly

If you need more control, use the `useAsyncTable` composable directly:

```vue
<script setup lang="ts">
const { loadTable, isLoading, error } = useAsyncTable()

const table = ref(null)

onMounted(async () => {
  const module = await loadTable()
  if (module) {
    table.value = module.useVueTable({
      data: products.value,
      columns: columns.value,
      getCoreRowModel: module.getCoreRowModel(),
    })
  }
})
</script>
```

## Column Definitions

Define columns using TanStack Table's `ColumnDef` type:

```typescript
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

const columns: ColumnDef<Product>[] = [
  // Simple accessor
  {
    accessorKey: 'name',
    header: 'Product Name',
  },

  // Custom cell rendering
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `€${row.original.price.toFixed(2)}`,
  },

  // Using Vue components in cells
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(Badge, {
      variant: row.original.status === 'active' ? 'default' : 'secondary',
    }, () => row.original.status),
  },

  // Selection column
  {
    id: 'select',
    header: ({ table }) => h(Checkbox, {
      checked: table.getIsAllPageRowsSelected(),
      'onUpdate:checked': (value: boolean) => table.toggleAllPageRowsSelected(!!value),
    }),
    cell: ({ row }) => h(Checkbox, {
      checked: row.getIsSelected(),
      'onUpdate:checked': (value: boolean) => row.toggleSelected(!!value),
    }),
    enableSorting: false,
  },

  // Actions column
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h('div', { class: 'flex gap-2' }, [
      h(Button, { onClick: () => edit(row.original) }, () => 'Edit'),
      h(Button, { onClick: () => delete(row.original) }, () => 'Delete'),
    ]),
    enableSorting: false,
  },
]
```

## Props

### AsyncTableWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | **required** | Array of table data |
| `columns` | `ColumnDef<TData>[]` | **required** | Column definitions |
| `loading` | `boolean` | `false` | External loading state |
| `skeletonRows` | `number` | `5` | Number of skeleton rows to show |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `tableOptions` | `Partial<TableOptions<TData>>` | `{}` | Additional TanStack options |
| `enablePagination` | `boolean` | `false` | Enable pagination |
| `enableSorting` | `boolean` | `true` | Enable sorting |
| `enableFiltering` | `boolean` | `false` | Enable filtering |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `row-click` | `TData` | Emitted when a row is clicked |
| `selection-change` | `TData[]` | Emitted when selection changes |

## Features

### Loading States

The component automatically shows a loading skeleton while:
1. The TanStack Table module is being loaded
2. External data is loading (via `loading` prop)

### Error Handling

If the module fails to load, an error state is displayed with the error message.

### Empty States

When there's no data, a customizable empty state is shown. You can customize it using the `empty` slot:

```vue
<AdminTablesAsyncTableWrapper :data="products" :columns="columns">
  <template #empty>
    <div class="text-center py-8">
      <p>No products found</p>
      <Button @click="createProduct">Create Product</Button>
    </div>
  </template>
</AdminTablesAsyncTableWrapper>
```

## Migration Guide

### From Basic HTML Tables

**Before:**
```vue
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="product in products" :key="product.id">
      <td>{{ product.name }}</td>
      <td>{{ product.price }}</td>
    </tr>
  </tbody>
</table>
```

**After:**
```vue
<AdminTablesAsyncTableWrapper
  :data="products"
  :columns="columns"
/>

<script setup>
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'price', header: 'Price' },
]
</script>
```

### From Direct TanStack Imports

**Before:**
```vue
<script setup>
import { useVueTable, getCoreRowModel } from '@tanstack/vue-table'

const table = useVueTable({
  data: products.value,
  columns: columns.value,
  getCoreRowModel: getCoreRowModel(),
})
</script>
```

**After:**
```vue
<script setup>
const { loadTable } = useAsyncTable()

const table = ref(null)

onMounted(async () => {
  const module = await loadTable()
  if (module) {
    table.value = module.useVueTable({
      data: products.value,
      columns: columns.value,
      getCoreRowModel: module.getCoreRowModel(),
    })
  }
})
</script>
```

## Performance Impact

### Bundle Size Reduction
- **Before:** TanStack Table bundled in main chunk (~15KB gzipped)
- **After:** Loaded only when admin tables are rendered
- **Impact:** Main bundle reduced by ~15KB gzipped

### Loading Time
- **Module Load:** ~50-100ms (first time only, then cached)
- **Rendering:** No noticeable difference
- **User Experience:** Loading skeleton prevents layout shift

## Best Practices

1. **Use for admin pages only** - Don't use for public-facing tables where the bundle size is less critical

2. **Combine with route-based code splitting** - Admin pages should already be in a separate chunk

3. **Cache awareness** - The module is loaded once and cached for the entire session

4. **Loading states** - Always provide the `loading` prop when fetching data

5. **Type safety** - Use TypeScript generics for type-safe column definitions:
   ```typescript
   const columns: ColumnDef<Product>[] = [...]
   ```

6. **Reusable columns** - Extract common column definitions:
   ```typescript
   // composables/useProductColumns.ts
   export function useProductColumns() {
     return [
       { accessorKey: 'name', header: 'Product' },
       // ... more columns
     ]
   }
   ```

## Troubleshooting

### Module not loading

Check the browser console for errors. The component will display an error state if the module fails to load.

### Types not working

Ensure you're importing types from `@tanstack/vue-table`:
```typescript
import type { ColumnDef } from '@tanstack/vue-table'
```

### Table not updating

If the table doesn't update when data changes, check that:
1. The `data` prop is a reactive ref/computed
2. You're not mutating the data array directly
3. The table has a proper `:key` attribute if in a v-for

## See Also

- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Build Optimization Plan](/docs/architecture/build-optimization-plan.md)
- [Component Guidelines](/docs/guides/component-guidelines.md)
