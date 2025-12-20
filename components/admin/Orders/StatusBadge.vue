<template>
  <Badge
    :variant="statusVariant"
    :class="cn('transition-colors', props.class)"
  >
    <commonIcon
      v-if="showIcon"
      :name="statusIcon"
      class="h-3 w-3"
    />
    <span>{{ statusLabel }}</span>
  </Badge>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BadgeVariants } from '@/components/ui/badge'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface Props {
  status: OrderStatus
  showIcon?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
})

// Status configuration
const statusConfig: Record<OrderStatus, {
  label: string
  variant: BadgeVariants['variant']
  icon: string
}> = {
  pending: {
    label: 'Pending',
    variant: 'secondary',
    icon: 'lucide:clock',
  },
  processing: {
    label: 'Processing',
    variant: 'default',
    icon: 'lucide:package',
  },
  shipped: {
    label: 'Shipped',
    variant: 'default',
    icon: 'lucide:truck',
  },
  delivered: {
    label: 'Delivered',
    variant: 'default',
    icon: 'lucide:check-circle',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'destructive',
    icon: 'lucide:x-circle',
  },
}

const statusLabel = computed(() => statusConfig[props.status]?.label || props.status)
const statusVariant = computed(() => statusConfig[props.status]?.variant || 'secondary')
const statusIcon = computed(() => statusConfig[props.status]?.icon || 'lucide:circle')
</script>
