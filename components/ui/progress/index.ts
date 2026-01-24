import { cva, type VariantProps } from 'class-variance-authority'

export { default as Progress } from './Progress.vue'

export const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type ProgressVariants = VariantProps<typeof progressVariants>
