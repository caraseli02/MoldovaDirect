<script setup lang="ts">
import { Toaster as Sonner } from 'vue-sonner'

interface Props {
  /**
   * Toast positioning
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

  /**
   * Enable rich colors mode
   */
  richColors?: boolean

  /**
   * Expand toasts by default
   */
  expand?: boolean

  /**
   * Duration for toasts (in milliseconds)
   */
  duration?: number

  /**
   * Gap between toasts
   */
  gap?: number

  /**
   * Offset from the edges
   */
  offset?: string

  /**
   * Show close button
   */
  closeButton?: boolean

  /**
   * Visual toast direction
   */
  dir?: 'ltr' | 'rtl' | 'auto'

  /**
   * Theme mode
   */
  theme?: 'light' | 'dark' | 'system'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right',
  richColors: false,
  expand: false,
  duration: 4000,
  closeButton: false,
  dir: 'auto',
  theme: 'system',
})
</script>

<template>
  <Sonner
    :position="position"
    :rich-colors="richColors"
    :expand="expand"
    :duration="duration"
    :gap="gap"
    :offset="offset"
    :close-button="closeButton"
    :dir="dir"
    :theme="theme"
  />
</template>
