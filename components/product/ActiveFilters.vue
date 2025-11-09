<template>
  <div v-if="chips.length || quickToggles.length" class="space-y-4">
    <!-- Results count and active filter summary -->
    <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
      <span>
        {{ resultsText }}
      </span>
      <template v-if="chips.length">
        <span class="text-gray-400">•</span>
        <span class="font-medium text-gray-700 dark:text-gray-200">
          {{ activeFiltersTitle }}
        </span>
      </template>
    </div>

    <!-- Active filter chips -->
    <div v-if="chips.length" class="flex flex-wrap gap-2" role="list" :aria-label="activeFiltersLabel">
      <UiButton
        v-for="chip in chips"
        :key="chip.id"
        type="button"
        variant="ghost"
        size="sm"
        role="listitem"
        class="rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
        :aria-label="removeFilterAriaLabel(chip.label)"
        @click="$emit('remove-chip', chip)"
      >
        <span>{{ chip.label }}</span>
        <span class="ml-1" aria-hidden="true">×</span>
      </UiButton>
      <UiButton
        type="button"
        variant="outline"
        size="sm"
        class="rounded-full"
        :aria-label="clearAllLabel"
        @click="$emit('clear-all')"
      >
        {{ clearAllText }}
      </UiButton>
    </div>

    <!-- Quick filter toggles -->
    <div v-if="quickToggles.length" class="flex flex-wrap items-center gap-3" role="group" :aria-label="quickFiltersLabel">
      <UiButton
        v-for="toggle in quickToggles"
        :key="toggle.id"
        type="button"
        variant="outline"
        size="sm"
        role="switch"
        :aria-checked="toggle.active"
        :aria-label="toggleAriaLabel(toggle.label)"
        class="rounded-full"
        :class="toggle.active ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500/60 dark:bg-blue-900/40 dark:text-blue-200' : ''"
        @click="$emit('toggle-filter', toggle)"
      >
        <span class="mr-2 inline-block h-2.5 w-2.5 rounded-full" :class="toggle.active ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'" aria-hidden="true"></span>
        {{ toggle.label }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterChip {
  id: string
  label: string
  type: string
  attributeKey?: string
  attributeValue?: string
}

interface QuickToggle {
  id: string
  label: string
  active: boolean
  apply: () => void
}

interface Props {
  chips: FilterChip[]
  quickToggles?: QuickToggle[]
  resultsText: string
  activeFiltersTitle: string
  activeFiltersLabel: string
  clearAllText: string
  clearAllLabel: string
  quickFiltersLabel: string
}

withDefaults(defineProps<Props>(), {
  quickToggles: () => [],
})

defineEmits<{
  'remove-chip': [chip: FilterChip]
  'clear-all': []
  'toggle-filter': [toggle: QuickToggle]
}>()

const removeFilterAriaLabel = (filterLabel: string) => {
  return `Remove ${filterLabel} filter`
}

const toggleAriaLabel = (filterLabel: string) => {
  return `Toggle ${filterLabel} filter`
}
</script>
