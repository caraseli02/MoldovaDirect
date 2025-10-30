import type { BadgeVariants } from '@/components/ui/badge'

export type BadgeVariant = BadgeVariants['variant']

export const emailStatusVariant = (status: string): BadgeVariant => {
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

export const movementVariant = (type: 'in' | 'out' | 'adjustment'): BadgeVariant => {
  switch (type) {
    case 'in':
      return 'default'
    case 'out':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export const priorityVariant = (priority: 'critical' | 'high' | 'medium' | string): BadgeVariant => {
  switch (priority) {
    case 'critical':
      return 'destructive'
    case 'high':
      return 'secondary'
    default:
      return 'default'
  }
}

export const productStatusVariant = (active: boolean): BadgeVariant => (active ? 'default' : 'secondary')

