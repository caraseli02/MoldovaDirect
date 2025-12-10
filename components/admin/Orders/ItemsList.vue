<template>
  <Card class="rounded-2xl">
    <CardHeader>
      <CardTitle>Order Items</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead class="text-right">
                Price
              </TableHead>
              <TableHead class="text-center">
                Quantity
              </TableHead>
              <TableHead class="text-right">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in items"
              :key="item.id"
            >
              <!-- Product Info -->
              <TableCell>
                <div class="flex items-center space-x-3">
                  <!-- Product Image -->
                  <div class="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                    <img
                      v-if="getProductImage(item)"
                      :src="getProductImage(item)"
                      :alt="getProductName(item)"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center"
                    >
                      <commonIcon
                        name="lucide:package"
                        class="h-6 w-6 text-gray-400"
                      />
                    </div>
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {{ getProductName(item) }}
                    </p>
                    <p
                      v-if="getProductSku(item)"
                      class="text-xs text-gray-500 dark:text-gray-400"
                    >
                      SKU: {{ getProductSku(item) }}
                    </p>
                  </div>
                </div>
              </TableCell>

              <!-- Price -->
              <TableCell class="text-right">
                <span class="text-sm text-gray-900 dark:text-white">
                  €{{ formatPrice(item.price_eur) }}
                </span>
              </TableCell>

              <!-- Quantity -->
              <TableCell class="text-center">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ item.quantity }}
                </span>
              </TableCell>

              <!-- Total -->
              <TableCell class="text-right">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  €{{ formatPrice(item.total_eur) }}
                </span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Empty State -->
      <div
        v-if="!items || items.length === 0"
        class="text-center py-8"
      >
        <commonIcon
          name="lucide:package"
          class="h-12 w-12 text-gray-400 mx-auto mb-3"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          No items in this order
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { OrderItemRaw } from '~/types/database'

interface Props {
  items: OrderItemRaw[]
}

const props = defineProps<Props>()

// Utility functions
const formatPrice = (price: number) => {
  return Number(price).toFixed(2)
}

const getProductName = (item: any) => {
  if (item.product_snapshot) {
    const snapshot = item.product_snapshot as any
    if (snapshot.nameTranslations) {
      return snapshot.nameTranslations.en || snapshot.nameTranslations.es || 'Unknown Product'
    }
    if (snapshot.name) {
      if (typeof snapshot.name === 'string') {
        return snapshot.name
      }
      return snapshot.name.en || snapshot.name.es || 'Unknown Product'
    }
  }
  return 'Unknown Product'
}

const getProductSku = (item: any) => {
  if (item.product_snapshot) {
    const snapshot = item.product_snapshot as any
    return snapshot.sku || null
  }
  return null
}

const getProductImage = (item: any) => {
  if (item.product_snapshot) {
    const snapshot = item.product_snapshot as any

    // Check for images array
    if (snapshot.images && Array.isArray(snapshot.images) && snapshot.images.length > 0) {
      const primaryImage = snapshot.images.find((img: any) => img.isPrimary)
      if (primaryImage) {
        return primaryImage.url
      }
      return snapshot.images[0].url
    }

    // Check for single image URL
    if (snapshot.imageUrl) {
      return snapshot.imageUrl
    }

    // Check for primaryImage
    if (snapshot.primaryImage && snapshot.primaryImage.url) {
      return snapshot.primaryImage.url
    }
  }

  return null
}
</script>
