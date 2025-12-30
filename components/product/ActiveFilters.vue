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
      class="active-filters-container"
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
          class="filter-chip"
          :aria-label="t('products.filterSummary.removeFilter', { filter: chip.label })"
          @click="handleRemoveChip(chip)"
        >
          <span>{{ chip.label }}</span>
          <commonIcon
            name="lucide:x"
            class="chip-icon"
            aria-hidden="true"
          />
        </button>

        <!-- Clear All Button -->
        <button
          v-if="showClearAll"
          key="clear-all"
          type="button"
          class="clear-all-button"
          :aria-label="t('products.filterSummary.clearAllFilters')"
          @click="handleClearAll"
        >
          <commonIcon
            name="lucide:rotate-ccw"
            class="clear-icon"
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

<style scoped>
.active-filters-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

/* Filter Chip */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(201, 162, 39, 0.1);
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(201, 162, 39, 0.3);
  border-radius: var(--md-radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  background: rgba(201, 162, 39, 0.2);
  border-color: var(--md-gold);
  box-shadow: var(--md-shadow-sm);
}

.filter-chip:focus-visible {
  outline: 2px solid var(--md-gold);
  outline-offset: 2px;
}

.chip-icon {
  width: 14px;
  height: 14px;
  color: var(--md-gold);
  transition: transform 0.2s ease;
}

.filter-chip:hover .chip-icon {
  transform: scale(1.2);
}

/* Clear All Button */
.clear-all-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fff;
  color: var(--md-charcoal);
  font-family: var(--md-font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid rgba(10, 10, 10, 0.2);
  border-radius: var(--md-radius-full);
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-button:hover {
  background: rgba(10, 10, 10, 0.05);
  border-color: rgba(10, 10, 10, 0.3);
  box-shadow: var(--md-shadow-sm);
}

.clear-all-button:focus-visible {
  outline: 2px solid var(--md-charcoal);
  outline-offset: 2px;
}

.clear-icon {
  width: 14px;
  height: 14px;
}

/* Dark Mode */
.dark .filter-chip {
  background: rgba(201, 162, 39, 0.2);
  color: var(--md-cream);
  border-color: rgba(201, 162, 39, 0.4);
}

.dark .filter-chip:hover {
  background: rgba(201, 162, 39, 0.3);
  border-color: var(--md-gold);
}

.dark .clear-all-button {
  background: rgba(248, 245, 238, 0.1);
  color: var(--md-cream);
  border-color: rgba(248, 245, 238, 0.3);
}

.dark .clear-all-button:hover {
  background: rgba(248, 245, 238, 0.15);
  border-color: rgba(248, 245, 238, 0.4);
}
</style>
