<template>
  <div class="quiz-progress" role="progressbar" :aria-valuenow="current" :aria-valuemin="0" :aria-valuemax="total">
    <div class="flex justify-between mb-2 text-sm">
      <span class="font-medium text-gray-700">
        {{ t('auth.progress.step') }} {{ current }} {{ t('auth.progress.of') }} {{ total }}
      </span>
      <span class="text-gray-500">{{ progressPercent }}%</span>
    </div>
    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  current: number
  total: number
}

const props = defineProps<Props>()
const { t } = useI18n()

const progressPercent = computed(() => {
  return Math.round((props.current / props.total) * 100)
})
</script>

<style scoped>
.quiz-progress {
  width: 100%;
}
</style>
