<template>
  <section class="relative overflow-hidden bg-white py-16 md:py-20">
    <div class="container">
      <div class="mb-12 text-center">
        <h2 class="text-3xl font-bold text-gray-900 md:text-4xl">
          {{ t('home.stats.title') }}
        </h2>
        <p class="mt-4 text-lg text-gray-600">
          {{ t('home.stats.subtitle') }}
        </p>
      </div>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(stat, index) in stats"
          :key="stat.id"
          ref="statRefs"
          class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 to-white p-8 text-center shadow-lg transition-all hover:shadow-xl"
          :style="{ transitionDelay: `${index * 100}ms` }"
        >
          <!-- Icon -->
          <div class="mb-4 flex justify-center">
            <div class="rounded-full bg-primary-100 p-4">
              <commonIcon
                :name="stat.icon"
                class="h-8 w-8 text-primary-600"
              />
            </div>
          </div>

          <!-- Animated Counter -->
          <div class="mb-2 text-4xl font-bold text-primary-900 md:text-5xl">
            <span v-if="isInView[index]">
              {{ stat.prefix }}{{ animatedValues[index] }}{{ stat.suffix }}
            </span>
            <span v-else>
              {{ stat.prefix }}0{{ stat.suffix }}
            </span>
          </div>

          <!-- Label -->
          <p class="text-sm font-medium text-gray-600">
            {{ stat.label }}
          </p>

          <!-- Decorative Element -->
          <div class="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-100/50 blur-2xl"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

interface Stat {
  id: string
  value: number
  label: string
  icon: string
  prefix?: string
  suffix?: string
  duration?: number
}

const props = defineProps<{
  stats: Stat[]
}>()

const { t } = useI18n()
const statRefs = ref<HTMLElement[]>([])
const isInView = ref<boolean[]>(new Array(props.stats.length).fill(false))
const animatedValues = ref<number[]>(new Array(props.stats.length).fill(0))

// Easing function for smooth animation
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

// Animate counter
const animateCounter = (index: number, targetValue: number, duration: number = 2000) => {
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutExpo(progress)

    animatedValues.value[index] = Math.floor(easedProgress * targetValue)

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      animatedValues.value[index] = targetValue
    }
  }

  animate()
}

onMounted(() => {
  // Set up intersection observer for each stat
  statRefs.value.forEach((el, index) => {
    if (!el) return

    const { stop } = useIntersectionObserver(
      el,
      ([{ isIntersecting }]) => {
        if (isIntersecting && !isInView.value[index]) {
          isInView.value[index] = true
          const stat = props.stats[index]
          animateCounter(index, stat.value, stat.duration)
          stop() // Stop observing once animated
        }
      },
      {
        threshold: 0.5
      }
    )
  })
})
</script>
