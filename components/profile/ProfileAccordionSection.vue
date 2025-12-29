<template>
  <div :class="{ 'border-b border-zinc-200 dark:border-zinc-700': !isLast }">
    <!-- Accordion Header -->
    <button
      ref="buttonRef"
      :id="headerId"
      type="button"
      :aria-expanded="expanded"
      :aria-controls="contentId"
      class="w-full flex items-center justify-between p-4 md:px-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      @click="$emit('toggle')"
      @keydown.home.prevent="$emit('navigate-first')"
      @keydown.end.prevent="$emit('navigate-last')"
      @keydown.arrow-down.prevent="$emit('navigate-next')"
      @keydown.arrow-up.prevent="$emit('navigate-prev')"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :class="iconBg"
        >
          <commonIcon
            :name="icon"
            class="w-5 h-5"
            :class="iconColor"
          />
        </div>
        <div>
          <p class="text-sm font-semibold text-zinc-900 dark:text-white">
            {{ title }}
          </p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ subtitle }}
          </p>
        </div>
      </div>
      <commonIcon
        name="lucide:chevron-down"
        class="w-5 h-5 text-zinc-400 transition-transform duration-300"
        :class="{ 'rotate-180': expanded }"
      />
    </button>

    <!-- Accordion Content -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[1000px]"
      leave-from-class="opacity-100 max-h-[1000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-show="expanded"
        :id="contentId"
        role="region"
        :aria-labelledby="headerId"
        class="overflow-hidden"
      >
        <div class="px-4 pb-4 md:px-6 md:pb-6">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  icon: string
  iconBg?: string
  iconColor?: string
  expanded?: boolean
  isLast?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'bg-zinc-100 dark:bg-zinc-700',
  iconColor: 'text-zinc-600 dark:text-zinc-400',
  expanded: false,
  isLast: false,
})

defineEmits<{
  toggle: []
  'navigate-first': []
  'navigate-last': []
  'navigate-next': []
  'navigate-prev': []
}>()

// Button ref for external focus control
const buttonRef = ref<HTMLButtonElement>()

// Expose the button ref for parent to focus
defineExpose({
  focus: () => buttonRef.value?.focus(),
})

// Generate unique IDs for ARIA accessibility
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
const contentId = computed(() => `accordion-content-${slugify(props.title)}`)
const headerId = computed(() => `accordion-header-${slugify(props.title)}`)
</script>
