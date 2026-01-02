import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--md-wine-btn)] text-white shadow-[var(--md-wine-shadow)] hover:bg-[var(--md-wine-btn-hover)] focus-visible:ring-[var(--md-gold)]/30 dark:bg-[var(--md-wine)] dark:hover:bg-[var(--md-wine-light)]',
        destructive:
          'bg-[var(--md-wine-darker)] text-white shadow-[var(--md-wine-shadow)] hover:bg-[var(--md-wine-dark)] focus-visible:ring-[var(--md-wine)]/20 dark:bg-[var(--md-wine-dark)]',
        outline:
          'border-2 border-[var(--md-gray-300)] bg-white shadow-xs hover:bg-[var(--md-cream)] hover:border-[var(--md-gold)] dark:border-[var(--md-gray-600)] dark:bg-[var(--md-charcoal)] dark:text-[var(--md-cream)] dark:hover:bg-[var(--md-charcoal-light)]',
        secondary:
          'bg-[var(--md-gold)] text-[var(--md-charcoal)] shadow-md hover:bg-[var(--md-gold-light)] focus-visible:ring-[var(--md-gold)]/30',
        ghost:
          'hover:bg-[var(--md-cream-dark)] hover:text-[var(--md-wine)] dark:hover:bg-[var(--md-charcoal-light)] dark:hover:text-[var(--md-gold)]',
        link: 'text-[var(--md-wine)] underline-offset-4 hover:underline hover:text-[var(--md-wine-light)] dark:text-[var(--md-gold)]',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
