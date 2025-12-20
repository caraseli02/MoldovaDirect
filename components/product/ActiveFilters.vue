<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="chips.length > 0"
      class="flex flex-wrap items-center gap-2"
      role="list"
      :aria-label="t('products.filterSummary.activeFilters')"
    >
      <TransitionGroup
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
        move-class="transition-all duration-200"
      >
        <button
          v-for="chip in chips"
          :key="chip.id"
          type="button"
          role="listitem"
          class="group inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-all hover:bg-blue-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-900/40 dark:text-blue-200 dark:hover:bg-blue-900/60"
          :aria-label="t('products.filterSummary.removeFilter', { filter: chip.label })"
          @click="handleRemoveChip(chip)"
        >
          <span>{{ chip.label }}</span>
          <commonIcon
            name="lucide:x"
            class="h-3.5 w-3.5 transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
        </button>

        <!-- Clear All Button -->
        <button
          v-if="showClearAll"
          key="clear-all"
          type="button"
          class="inline-flex items-center gap-1.5 rounded-full border-2 border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700"
          :aria-label="t('products.filterSummary.clearAllFilters')"
          @click="handleClearAll"
        >
          <commonIcon
            name="lucide:rotate-ccw"
            class="h-3.5 w-3.5"
            aria-hidden="true"
          />
          <span>{{ clearAllLabel || t('products.filterSummary.clear') }}</span>
        </button>
      </TransitionGroup>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import commonIcon from '~/components/common/Icon.vue'

export interface FilterChip {
  id: string
  label: string
  type: string
  attributeKey?: string
  attributeValue?: string
}

interface Props {
  chips: FilterChip[]
  showClearAll?: boolean
  clearAllLabel?: string
}

const _props = withDefaults(defineProps<Props>(), {
  showClearAll: true,
})

const emit = defineEmits<{
  'remove-chip': [chip: FilterChip]
  'clear-all': []
}>()

const { t } = useI18n()

const handleRemoveChip = (chip: FilterChip) => {
  emit('remove-chip', chip)
}

const handleClearAll = () => {
  emit('clear-all')
}
</script>
